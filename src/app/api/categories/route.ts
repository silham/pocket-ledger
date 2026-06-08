import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helper";

export async function GET(req: NextRequest) {
  const { error, userId } = await requireAuth();
  if (error) return error;

  const type = req.nextUrl.searchParams.get("type");
  const categories = await prisma.category.findMany({
    where: {
      userId: userId!,
      isArchived: false,
      ...(type ? { type: type as "EXPENSE" | "INCOME" } : {}),
    },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const { error, userId } = await requireAuth();
  if (error) return error;

  const { name, type, icon, color } = await req.json();
  if (!name || !type) {
    return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
  }

  const category = await prisma.category.create({
    data: { userId: userId!, name, type, icon, color },
  });
  return NextResponse.json(category, { status: 201 });
}
