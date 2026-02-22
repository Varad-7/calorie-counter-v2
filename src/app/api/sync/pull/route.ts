import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

// GET /api/sync — pull all data from server for the authenticated user
export async function GET(req: NextRequest) {
    const user = getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Fetch all profiles
        const profiles = await prisma.profile.findMany({
            where: { userId: user.userId },
            orderBy: { createdAt: "asc" },
        });

        // Fetch all day logs with foods and activities
        const profileIds = profiles.map((p) => p.id);
        const dayLogs = await prisma.dayLog.findMany({
            where: { profileId: { in: profileIds } },
            include: { foods: true, activities: true },
        });

        // Fetch all recipes with ingredients
        const recipes = await prisma.recipe.findMany({
            where: { userId: user.userId },
            include: { ingredients: true },
        });

        // Fetch water logs
        const waterLogs = await prisma.waterLog.findMany({
            where: { profileId: { in: profileIds } },
        });

        // Fetch weight entries
        const weightEntries = await prisma.weightEntry.findMany({
            where: { profileId: { in: profileIds } },
        });

        // Transform into the Zustand store format
        // Profiles: map to store format
        const storeProfiles = profiles.map((p) => ({
            id: p.id,
            name: p.name,
            gender: p.gender,
            weight: p.weight,
            height: p.height,
            age: p.age,
            activityLevel: p.activityLevel,
            deficitAmount: p.deficitAmount,
        }));

        // Logs: transform to Record<date, Record<profileId, DayLog>>
        const storeLogs: Record<string, Record<string, unknown>> = {};
        for (const log of dayLogs) {
            if (!storeLogs[log.date]) storeLogs[log.date] = {};
            storeLogs[log.date][log.profileId] = {
                breakfast: log.breakfast,
                lunch: log.lunch,
                snacks: log.snacks,
                dinner: log.dinner,
                gym: log.gym,
                items: {
                    breakfast: log.foods
                        .filter((f) => f.slot === "breakfast")
                        .map((f) => ({ id: f.id, foodId: f.foodId, name: f.name, calories: f.calories, quantity: f.quantity })),
                    lunch: log.foods
                        .filter((f) => f.slot === "lunch")
                        .map((f) => ({ id: f.id, foodId: f.foodId, name: f.name, calories: f.calories, quantity: f.quantity })),
                    snacks: log.foods
                        .filter((f) => f.slot === "snacks")
                        .map((f) => ({ id: f.id, foodId: f.foodId, name: f.name, calories: f.calories, quantity: f.quantity })),
                    dinner: log.foods
                        .filter((f) => f.slot === "dinner")
                        .map((f) => ({ id: f.id, foodId: f.foodId, name: f.name, calories: f.calories, quantity: f.quantity })),
                    gym: log.activities.map((a) => ({
                        id: a.id,
                        activityId: a.activityId,
                        name: a.name,
                        caloriesBurned: a.caloriesBurned,
                        duration: a.duration,
                        pace: a.pace,
                        gradient: a.gradient,
                        sets: a.sets,
                        reps: a.reps,
                        weight: a.weight,
                    })),
                },
            };
        }

        // Recipes: map to store format
        const storeRecipes = recipes.map((r) => ({
            id: r.id,
            name: r.name,
            description: r.description || undefined,
            totalCalories: r.totalCalories,
            ingredients: r.ingredients.map((ing) => ({
                id: ing.id,
                foodId: ing.foodId,
                name: ing.name,
                calories: ing.calories,
                quantity: ing.quantity,
            })),
        }));

        // Water: Record<date, Record<profileId, glasses>>
        const storeWater: Record<string, Record<string, number>> = {};
        for (const w of waterLogs) {
            if (!storeWater[w.date]) storeWater[w.date] = {};
            storeWater[w.date][w.profileId] = w.glasses;
        }

        // Weight: Record<profileId, Record<date, weight>>
        const storeWeightHistory: Record<string, Record<string, number>> = {};
        for (const w of weightEntries) {
            if (!storeWeightHistory[w.profileId]) storeWeightHistory[w.profileId] = {};
            storeWeightHistory[w.profileId][w.date] = w.weight;
        }

        return NextResponse.json({
            profiles: storeProfiles,
            logs: storeLogs,
            recipes: storeRecipes,
            water: storeWater,
            weightHistory: storeWeightHistory,
        });
    } catch (error) {
        console.error("Pull sync error:", error);
        return NextResponse.json(
            { error: "Failed to pull data", details: String(error) },
            { status: 500 }
        );
    }
}
