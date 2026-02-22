import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

// GET /api/profiles — list all profiles for the authenticated user
export async function GET(req: NextRequest) {
    const user = getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profiles = await prisma.profile.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(profiles);
}

// POST /api/profiles — create a new profile
export async function POST(req: NextRequest) {
    const user = getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const profile = await prisma.profile.create({
        data: {
            userId: user.userId,
            name: data.name,
            gender: data.gender,
            weight: data.weight,
            height: data.height,
            age: data.age,
            activityLevel: data.activityLevel,
            deficitAmount: data.deficitAmount,
        },
    });

    return NextResponse.json(profile, { status: 201 });
}
