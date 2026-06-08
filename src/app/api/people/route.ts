import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helper";

export async function GET() {
  const { error, userId } = await requireAuth();
  if (error) return error;

  const people = await prisma.person.findMany({
    where: { userId: userId!, isArchived: false },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(people);
}

export async function POST(req: NextRequest) {
  const { error, userId } = await requireAuth();
  if (error) return error;

  const { name, phone, email, notes } = await req.json();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const person = await prisma.person.create({
    data: { userId: userId!, name, phone, email, notes },
  });
  return NextResponse.json(person, { status: 201 });
}
