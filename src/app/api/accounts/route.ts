import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helper";

export async function GET() {
  const { error, userId } = await requireAuth();
  if (error) return error;

  const accounts = await prisma.walletAccount.findMany({
    where: { userId: userId!, isArchived: false },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(accounts);
}

export async function POST(req: NextRequest) {
  const { error, userId } = await requireAuth();
  if (error) return error;

  const { name, type, balance, currency, color, icon } = await req.json();
  if (!name || !type) {
    return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
  }

  const account = await prisma.walletAccount.create({
    data: { userId: userId!, name, type, balance: balance ?? 0, currency: currency ?? "LKR", color, icon },
  });
  return NextResponse.json(account, { status: 201 });
}
