import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

// PUT /api/profiles/[id] — update a profile
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    // Verify ownership
    const existing = await prisma.profile.findFirst({
        where: { id, userId: user.userId },
    });
    if (!existing) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const profile = await prisma.profile.update({
        where: { id },
        data: {
            name: data.name,
            gender: data.gender,
            weight: data.weight,
            height: data.height,
            age: data.age,
            activityLevel: data.activityLevel,
            deficitAmount: data.deficitAmount,
        },
    });

    return NextResponse.json(profile);
}

// DELETE /api/profiles/[id] — delete a profile
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.profile.findFirst({
        where: { id, userId: user.userId },
    });
    if (!existing) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await prisma.profile.delete({ where: { id } });

    return NextResponse.json({ success: true });
}
