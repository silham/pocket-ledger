import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AccountsManager } from "@/components/accounts/AccountsManager";

export default async function AccountsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const raw = await prisma.walletAccount.findMany({
    where: { userId: session.user.id, isArchived: false },
    orderBy: { createdAt: "asc" },
  });
  const accounts = raw.map((a) => ({ ...a, balance: Number(a.balance) }));

  return (
    <div className="flex flex-col min-h-full">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <a href="/more" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </a>
        <h1 className="text-lg font-semibold">Accounts</h1>
      </div>
      <AccountsManager accounts={accounts} />
    </div>
  );
}
