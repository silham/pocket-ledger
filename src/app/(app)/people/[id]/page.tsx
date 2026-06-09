import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { PersonLedger } from "@/components/people/PersonLedger";

export default async function PersonLedgerPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const person = await prisma.person.findUnique({ where: { id } });
  if (!person || person.userId !== session.user.id) notFound();

  const raw = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      personId: id,
      type: { in: ["LEND", "BORROW", "SETTLEMENT_RECEIVED", "SETTLEMENT_PAID"] },
    },
    include: { account: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  const transactions = raw.map((t) => ({
    ...t,
    amount: Number(t.amount),
    account: { ...t.account, balance: Number(t.account.balance) },
  }));

  const lent = transactions.filter((t) => t.type === "LEND").reduce((s, t) => s + t.amount, 0);
  const borrowed = transactions.filter((t) => t.type === "BORROW").reduce((s, t) => s + t.amount, 0);
  const received = transactions.filter((t) => t.type === "SETTLEMENT_RECEIVED").reduce((s, t) => s + t.amount, 0);
  const paid = transactions.filter((t) => t.type === "SETTLEMENT_PAID").reduce((s, t) => s + t.amount, 0);
  const net = (lent - received) - (borrowed - paid);

  return <PersonLedger person={person} transactions={transactions} net={net} />;
}
