import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helper";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, userId } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  const data = await req.json();
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat || cat.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.category.update({
    where: { id },
    data: {
      name: data.name ?? cat.name,
      icon: data.icon ?? cat.icon,
      color: data.color ?? cat.color,
      isArchived: data.isArchived ?? cat.isArchived,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, userId } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat || cat.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.category.update({ where: { id }, data: { isArchived: true } });
  return NextResponse.json({ message: "Archived" });
}
