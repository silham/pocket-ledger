import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helper";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, userId } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  const data = await req.json();
  const person = await prisma.person.findUnique({ where: { id } });
  if (!person || person.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.person.update({
    where: { id },
    data: {
      name: data.name ?? person.name,
      phone: data.phone ?? person.phone,
      email: data.email ?? person.email,
      notes: data.notes ?? person.notes,
      isArchived: data.isArchived ?? person.isArchived,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, userId } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  const person = await prisma.person.findUnique({ where: { id } });
  if (!person || person.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const hasTxns = await prisma.transaction.count({ where: { personId: id } });
  if (hasTxns > 0) {
    await prisma.person.update({ where: { id }, data: { isArchived: true } });
    return NextResponse.json({ message: "Archived" });
  }
  await prisma.person.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted" });
}
