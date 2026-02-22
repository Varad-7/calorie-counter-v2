import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

// GET /api/recipes — list all recipes for the authenticated user
export async function GET(req: NextRequest) {
    const user = getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recipes = await prisma.recipe.findMany({
        where: { userId: user.userId },
        include: { ingredients: true },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(recipes);
}

// POST /api/recipes — create a new recipe
export async function POST(req: NextRequest) {
    const user = getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const recipe = await prisma.recipe.create({
        data: {
            userId: user.userId,
            name: data.name,
            description: data.description,
            totalCalories: data.totalCalories,
            ingredients: {
                create: data.ingredients.map((ing: { foodId: string; name: string; calories: number; quantity: number }) => ({
                    foodId: ing.foodId,
                    name: ing.name,
                    calories: ing.calories,
                    quantity: ing.quantity || 1,
                })),
            },
        },
        include: { ingredients: true },
    });

    return NextResponse.json(recipe, { status: 201 });
}

// DELETE /api/recipes?id=xxx — delete a recipe
export async function DELETE(req: NextRequest) {
    const user = getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "Recipe ID is required" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.recipe.findFirst({
        where: { id, userId: user.userId },
    });
    if (!existing) {
        return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    await prisma.recipe.delete({ where: { id } });

    return NextResponse.json({ success: true });
}
