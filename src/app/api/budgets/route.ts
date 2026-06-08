import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helper";

export async function GET(req: NextRequest) {
  const { error, userId } = await requireAuth();
  if (error) return error;

  const month = parseInt(req.nextUrl.searchParams.get("month") ?? String(new Date().getMonth() + 1));
  const year = parseInt(req.nextUrl.searchParams.get("year") ?? String(new Date().getFullYear()));

  const budgets = await prisma.budget.findMany({
    where: { userId: userId!, month, year },
    include: { category: true },
  });
  return NextResponse.json(budgets);
}

export async function POST(req: NextRequest) {
  const { error, userId } = await requireAuth();
  if (error) return error;

  const { name, amount, month, year, categoryId, isOverall } = await req.json();
  if (!amount || !month || !year) {
    return NextResponse.json({ error: "Amount, month, and year are required" }, { status: 400 });
  }

  const budget = await prisma.budget.upsert({
    where: { userId_month_year_categoryId: { userId: userId!, month, year, categoryId: categoryId ?? null } },
    update: { amount, name: name ?? "Budget" },
    create: { userId: userId!, name: name ?? "Budget", amount, month, year, categoryId: categoryId ?? null, isOverall: isOverall ?? !categoryId },
  });
  return NextResponse.json(budget, { status: 201 });
}
