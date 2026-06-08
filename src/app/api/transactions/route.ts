import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helper";
import type { TransactionType } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { error, userId } = await requireAuth();
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type") as TransactionType | null;
  const accountId = searchParams.get("accountId");
  const personId = searchParams.get("personId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const offset = parseInt(searchParams.get("offset") ?? "0");

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: userId!,
      ...(type ? { type } : {}),
      ...(accountId ? { OR: [{ accountId }, { toAccountId: accountId }] } : {}),
      ...(personId ? { personId } : {}),
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    include: { account: true, toAccount: true, category: true, person: true },
    orderBy: { date: "desc" },
    take: limit,
    skip: offset,
  });

  return NextResponse.json(transactions);
}

export async function POST(req: NextRequest) {
  const { error, userId } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { type, amount, date, accountId, toAccountId, categoryId, personId, note } = body;

  if (!type || !amount || !accountId) {
    return NextResponse.json({ error: "Type, amount, and account are required" }, { status: 400 });
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  // Verify account belongs to user
  const account = await prisma.walletAccount.findUnique({ where: { id: accountId } });
  if (!account || account.userId !== userId) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  // For transfers verify destination account
  if (type === "TRANSFER") {
    if (!toAccountId) return NextResponse.json({ error: "Destination account required" }, { status: 400 });
    const toAccount = await prisma.walletAccount.findUnique({ where: { id: toAccountId } });
    if (!toAccount || toAccount.userId !== userId) {
      return NextResponse.json({ error: "Destination account not found" }, { status: 404 });
    }
  }

  // Run transaction + balance updates atomically
  const result = await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        userId: userId!,
        type,
        amount: numAmount,
        date: date ? new Date(date) : new Date(),
        accountId,
        toAccountId: toAccountId ?? null,
        categoryId: categoryId ?? null,
        personId: personId ?? null,
        note: note ?? null,
      },
      include: { account: true, toAccount: true, category: true, person: true },
    });

    // Update account balances
    const balanceDelta = getBalanceDelta(type, numAmount);
    await tx.walletAccount.update({
      where: { id: accountId },
      data: { balance: { increment: balanceDelta } },
    });

    if (type === "TRANSFER" && toAccountId) {
      await tx.walletAccount.update({
        where: { id: toAccountId },
        data: { balance: { increment: numAmount } },
      });
    }

    return transaction;
  });

  return NextResponse.json(result, { status: 201 });
}

function getBalanceDelta(type: TransactionType, amount: number): number {
  switch (type) {
    case "INCOME":
    case "BORROW":
    case "SETTLEMENT_RECEIVED":
      return amount;
    case "EXPENSE":
    case "LEND":
    case "SETTLEMENT_PAID":
    case "TRANSFER":
      return -amount;
    case "ADJUSTMENT":
      return 0; // Adjustment handled separately
    default:
      return 0;
  }
}
