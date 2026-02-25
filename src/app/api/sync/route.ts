import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

// POST /api/sync — bulk sync all data from localStorage to server
export async function POST(req: NextRequest) {
    const user = getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.json();
        const { profiles, logs, recipes, waterLogs, weightEntries } = data;

        // Sync profiles — track which profileIds are successfully persisted
        const syncedProfileIds = new Set<string>();
        if (profiles && Array.isArray(profiles)) {
            for (const p of profiles) {
                try {
                    await prisma.profile.upsert({
                        where: { id: p.id },
                        create: {
                            id: p.id,
                            userId: user.userId,
                            name: p.name,
                            gender: p.gender,
                            weight: p.weight,
                            height: p.height,
                            age: p.age,
                            activityLevel: p.activityLevel,
                            deficitAmount: p.deficitAmount,
                        },
                        update: {
                            name: p.name,
                            gender: p.gender,
                            weight: p.weight,
                            height: p.height,
                            age: p.age,
                            activityLevel: p.activityLevel,
                            deficitAmount: p.deficitAmount,
                        },
                    });
                    syncedProfileIds.add(p.id);
                } catch (profileErr) {
                    console.warn(`Skipping profile ${p.id}:`, profileErr);
                }
            }
        }

        // Also include any profiles already in the DB for this user
        // (so logs from previous syncs don't get skipped)
        const existingProfiles = await prisma.profile.findMany({
            where: { userId: user.userId },
            select: { id: true },
        });
        for (const ep of existingProfiles) syncedProfileIds.add(ep.id);

        // Sync recipes
        if (recipes && Array.isArray(recipes)) {
            for (const r of recipes) {
                // Delete existing and recreate
                await prisma.recipe.deleteMany({
                    where: { id: r.id, userId: user.userId },
                });
                await prisma.recipe.create({
                    data: {
                        id: r.id,
                        userId: user.userId,
                        name: r.name,
                        description: r.description || null,
                        totalCalories: r.totalCalories,
                        ingredients: {
                            create: (r.ingredients || []).map(
                                (ing: { foodId: string; name: string; calories: number; quantity: number }) => ({
                                    foodId: ing.foodId || ing.name,
                                    name: ing.name,
                                    calories: ing.calories,
                                    quantity: ing.quantity || 1,
                                })
                            ),
                        },
                    },
                });
            }
        }

        // Sync day logs: client sends logs[date][profileId]
        if (logs && typeof logs === "object") {
            for (const [date, profileLogs] of Object.entries(logs)) {
                if (typeof profileLogs !== "object" || !profileLogs) continue;
                for (const [profileId, log] of Object.entries(profileLogs as Record<string, Record<string, unknown>>)) {
                    // Skip logs for profiles that don't exist in the DB
                    if (!syncedProfileIds.has(profileId)) continue;
                    if (!log) continue;
                    try {
                        const dayLog = await prisma.dayLog.upsert({
                            where: { profileId_date: { profileId, date } },
                            create: {
                                profileId,
                                date,
                                breakfast: (log.breakfast as number) || 0,
                                lunch: (log.lunch as number) || 0,
                                snacks: (log.snacks as number) || 0,
                                dinner: (log.dinner as number) || 0,
                                gym: (log.gym as number) || 0,
                            },
                            update: {
                                breakfast: (log.breakfast as number) || 0,
                                lunch: (log.lunch as number) || 0,
                                snacks: (log.snacks as number) || 0,
                                dinner: (log.dinner as number) || 0,
                                gym: (log.gym as number) || 0,
                            },
                        });

                        // Sync foods
                        const foods = log.foods as Array<{ slot?: string; foodId: string; name: string; calories: number; quantity: number }> | undefined;
                        if (foods && Array.isArray(foods)) {
                            await prisma.loggedFood.deleteMany({ where: { dayLogId: dayLog.id } });
                            if (foods.length > 0) {
                                await prisma.loggedFood.createMany({
                                    data: foods.map((f) => ({
                                        dayLogId: dayLog.id,
                                        slot: f.slot || "snacks",
                                        foodId: f.foodId || f.name,
                                        name: f.name,
                                        calories: f.calories,
                                        quantity: f.quantity || 1,
                                    })),
                                });
                            }
                        }

                        // Sync activities
                        const activities = log.activities as Array<{ activityId: string; name: string; caloriesBurned: number; duration?: number; pace?: number; gradient?: number; sets?: number; reps?: number; weight?: number }> | undefined;
                        if (activities && Array.isArray(activities)) {
                            await prisma.loggedActivity.deleteMany({ where: { dayLogId: dayLog.id } });
                            if (activities.length > 0) {
                                await prisma.loggedActivity.createMany({
                                    data: activities.map((a) => ({
                                        dayLogId: dayLog.id,
                                        activityId: a.activityId || a.name,
                                        name: a.name,
                                        caloriesBurned: a.caloriesBurned,
                                        duration: a.duration,
                                        pace: a.pace,
                                        gradient: a.gradient,
                                        sets: a.sets,
                                        reps: a.reps,
                                        weight: a.weight,
                                    })),
                                });
                            }
                        }
                    } catch (dayLogErr) {
                        console.warn(`Skipping day log ${profileId}/${date}:`, dayLogErr);
                    }
                }
            }
        }

        // Sync water logs
        if (waterLogs && typeof waterLogs === "object") {
            for (const [key, glasses] of Object.entries(waterLogs)) {
                // Water key format: "profileId_YYYY-MM-DD"
                // profileId itself never contains underscore, date always does, so split on first "_"
                const underscoreIdx = key.indexOf("_");
                if (underscoreIdx < 0) continue;
                const profileId = key.substring(0, underscoreIdx);
                const date = key.substring(underscoreIdx + 1);
                if (!profileId || !date || !syncedProfileIds.has(profileId)) continue;
                await prisma.waterLog.upsert({
                    where: { profileId_date: { profileId, date } },
                    create: { profileId, date, glasses: glasses as number },
                    update: { glasses: glasses as number },
                });
            }
        }

        // Sync weight entries
        if (weightEntries && Array.isArray(weightEntries)) {
            for (const entry of weightEntries) {
                if (!syncedProfileIds.has(entry.profileId)) continue;
                await prisma.weightEntry.upsert({
                    where: { profileId_date: { profileId: entry.profileId, date: entry.date } },
                    create: {
                        profileId: entry.profileId,
                        date: entry.date,
                        weight: entry.weight,
                    },
                    update: { weight: entry.weight },
                });
            }
        }

        return NextResponse.json({ success: true, message: "Data synced successfully" });
    } catch (error) {
        console.error("Sync error:", error);
        return NextResponse.json(
            { error: "Sync failed", details: String(error) },
            { status: 500 }
        );
    }
}
