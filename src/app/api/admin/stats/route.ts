import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "varadpatil5424@gmail.com";

export async function GET(req: NextRequest) {
    const user = getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.email !== ADMIN_EMAIL) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        // Totals
        const totalUsers = await prisma.user.count();
        const totalProfiles = await prisma.profile.count();
        const totalDayLogs = await prisma.dayLog.count();
        const totalFoodEntries = await prisma.loggedFood.count();
        const totalGymEntries = await prisma.loggedActivity.count();
        const totalRecipes = await prisma.recipe.count();
        const totalWaterLogs = await prisma.waterLog.count();

        // New users in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const newUsersLast7Days = await prisma.user.count({
            where: { createdAt: { gte: sevenDaysAgo } },
        });

        // Per-user breakdown
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                profiles: {
                    include: {
                        dayLogs: {
                            include: {
                                foods: true,
                                activities: true,
                            },
                        },
                        waterLogs: true,
                        weightEntries: true,
                    },
                },
                recipes: true,
            },
        });

        const userStats = users.map((u) => {
            const profileCount = u.profiles.length;
            const dayLogCount = u.profiles.reduce((s, p) => s + p.dayLogs.length, 0);
            const foodCount = u.profiles.reduce(
                (s, p) => s + p.dayLogs.reduce((ss, d) => ss + d.foods.length, 0),
                0
            );
            const gymCount = u.profiles.reduce(
                (s, p) => s + p.dayLogs.reduce((ss, d) => ss + d.activities.length, 0),
                0
            );
            const totalCaloriesLogged = u.profiles.reduce(
                (s, p) =>
                    s +
                    p.dayLogs.reduce(
                        (ss, d) => ss + d.breakfast + d.lunch + d.snacks + d.dinner,
                        0
                    ),
                0
            );
            const lastActive =
                u.profiles
                    .flatMap((p) => p.dayLogs.map((d) => d.date))
                    .sort()
                    .pop() ?? null;

            return {
                id: u.id,
                email: u.email,
                createdAt: u.createdAt,
                profileCount,
                dayLogCount,
                foodCount,
                gymCount,
                recipeCount: u.recipes.length,
                totalCaloriesLogged,
                lastActive,
            };
        });

        // Signups per day (last 14 days)
        const signupsByDay: Record<string, number> = {};
        for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            signupsByDay[key] = 0;
        }
        for (const u of users) {
            const key = u.createdAt.toISOString().slice(0, 10);
            if (key in signupsByDay) signupsByDay[key]++;
        }

        return NextResponse.json({
            totals: {
                totalUsers,
                totalProfiles,
                totalDayLogs,
                totalFoodEntries,
                totalGymEntries,
                totalRecipes,
                totalWaterLogs,
                newUsersLast7Days,
            },
            userStats,
            signupsByDay,
        });
    } catch (error) {
        console.error("Admin stats error:", error);
        return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
    }
}
