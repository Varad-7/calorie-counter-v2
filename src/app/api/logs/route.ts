import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

// GET /api/logs?profileId=xxx&startDate=2026-02-01&endDate=2026-02-28
export async function GET(req: NextRequest) {
    const user = getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const date = searchParams.get("date");

    if (!profileId) {
        return NextResponse.json({ error: "profileId is required" }, { status: 400 });
    }

    // Verify profile ownership
    const profile = await prisma.profile.findFirst({
        where: { id: profileId, userId: user.userId },
    });
    if (!profile) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const where: Record<string, unknown> = { profileId };
    if (date) {
        where.date = date;
    } else if (startDate && endDate) {
        where.date = { gte: startDate, lte: endDate };
    }

    const logs = await prisma.dayLog.findMany({
        where,
        include: {
            foods: true,
            activities: true,
        },
        orderBy: { date: "desc" },
    });

    return NextResponse.json(logs);
}

// POST /api/logs — create or update a day log
export async function POST(req: NextRequest) {
    const user = getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { profileId, date, breakfast, lunch, snacks, dinner, gym, foods, activities } = data;

    // Verify profile ownership
    const profile = await prisma.profile.findFirst({
        where: { id: profileId, userId: user.userId },
    });
    if (!profile) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Upsert the day log
    const dayLog = await prisma.dayLog.upsert({
        where: { profileId_date: { profileId, date } },
        create: {
            profileId,
            date,
            breakfast: breakfast || 0,
            lunch: lunch || 0,
            snacks: snacks || 0,
            dinner: dinner || 0,
            gym: gym || 0,
        },
        update: {
            breakfast: breakfast || 0,
            lunch: lunch || 0,
            snacks: snacks || 0,
            dinner: dinner || 0,
            gym: gym || 0,
        },
    });

    // Replace foods if provided
    if (foods) {
        await prisma.loggedFood.deleteMany({ where: { dayLogId: dayLog.id } });
        if (foods.length > 0) {
            await prisma.loggedFood.createMany({
                data: foods.map((f: { slot: string; foodId: string; name: string; calories: number; quantity: number }) => ({
                    dayLogId: dayLog.id,
                    slot: f.slot,
                    foodId: f.foodId,
                    name: f.name,
                    calories: f.calories,
                    quantity: f.quantity || 1,
                })),
            });
        }
    }

    // Replace activities if provided
    if (activities) {
        await prisma.loggedActivity.deleteMany({ where: { dayLogId: dayLog.id } });
        if (activities.length > 0) {
            await prisma.loggedActivity.createMany({
                data: activities.map((a: { activityId: string; name: string; caloriesBurned: number; duration?: number; pace?: number; gradient?: number; sets?: number; reps?: number; weight?: number }) => ({
                    dayLogId: dayLog.id,
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
            });
        }
    }

    // Return updated log with relations
    const updated = await prisma.dayLog.findUnique({
        where: { id: dayLog.id },
        include: { foods: true, activities: true },
    });

    return NextResponse.json(updated);
}
