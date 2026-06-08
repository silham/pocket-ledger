import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helper";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, userId } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  const tx = await prisma.transaction.findUnique({ where: { id }, include: { account: true } });
  if (!tx || tx.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.$transaction(async (p) => {
    // Reverse the balance change
    const reversal = getReversal(tx.type as import("@prisma/client").TransactionType, Number(tx.amount));
    await p.walletAccount.update({
      where: { id: tx.accountId },
      data: { balance: { increment: reversal } },
    });

    if (tx.type === "TRANSFER" && tx.toAccountId) {
      await p.walletAccount.update({
        where: { id: tx.toAccountId },
        data: { balance: { decrement: Number(tx.amount) } },
      });
    }

    await p.transaction.delete({ where: { id } });
  });

  return NextResponse.json({ message: "Deleted" });
}

function getReversal(type: import("@prisma/client").TransactionType, amount: number): number {
  switch (type) {
    case "INCOME":
    case "BORROW":
    case "SETTLEMENT_RECEIVED":
      return -amount;
    case "EXPENSE":
    case "LEND":
    case "SETTLEMENT_PAID":
    case "TRANSFER":
      return amount;
    default:
      return 0;
  }
}
