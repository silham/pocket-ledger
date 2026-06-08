import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PeopleList } from "@/components/people/PeopleList";

export default async function PeoplePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const people = await prisma.person.findMany({
    where: { userId: session.user.id, isArchived: false },
    orderBy: { name: "asc" },
  });

  // Calculate net balance per person from transactions
  const txSummary = await prisma.transaction.groupBy({
    by: ["personId", "type"],
    where: {
      userId: session.user.id,
      personId: { not: null },
      type: { in: ["LEND", "BORROW", "SETTLEMENT_RECEIVED", "SETTLEMENT_PAID"] },
    },
    _sum: { amount: true },
  });

  const balances = people.map((person) => {
    const lent = Number(txSummary.find((t) => t.personId === person.id && t.type === "LEND")?._sum.amount ?? 0);
    const borrowed = Number(txSummary.find((t) => t.personId === person.id && t.type === "BORROW")?._sum.amount ?? 0);
    const received = Number(txSummary.find((t) => t.personId === person.id && t.type === "SETTLEMENT_RECEIVED")?._sum.amount ?? 0);
    const paid = Number(txSummary.find((t) => t.personId === person.id && t.type === "SETTLEMENT_PAID")?._sum.amount ?? 0);
    // Positive = they owe me, Negative = I owe them
    const net = (lent - received) - (borrowed - paid);
    return { ...person, net };
  });

  return (
    <div className="flex flex-col min-h-full">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">People</h1>
      </div>
      <PeopleList people={balances} />
    </div>
  );
}
