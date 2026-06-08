import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helper";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, userId } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  const data = await req.json();
  const account = await prisma.walletAccount.findUnique({ where: { id } });
  if (!account || account.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.walletAccount.update({
    where: { id },
    data: {
      name: data.name ?? account.name,
      type: data.type ?? account.type,
      color: data.color ?? account.color,
      icon: data.icon ?? account.icon,
      isArchived: data.isArchived ?? account.isArchived,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, userId } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  const account = await prisma.walletAccount.findUnique({ where: { id } });
  if (!account || account.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.walletAccount.update({ where: { id }, data: { isArchived: true } });
  return NextResponse.json({ message: "Archived" });
}
