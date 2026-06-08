import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Wallet, Tag, PieChart, BarChart3, Settings, LogOut, ChevronRight } from "lucide-react";
import { SignOutButton } from "@/components/common/SignOutButton";

const menuItems = [
  { href: "/more/accounts", icon: Wallet, label: "Accounts", description: "Manage your money accounts" },
  { href: "/more/categories", icon: Tag, label: "Categories", description: "Spending & income categories" },
  { href: "/more/budgets", icon: PieChart, label: "Budgets", description: "Set monthly spending limits" },
  { href: "/more/reports", icon: BarChart3, label: "Reports", description: "Spending insights & summaries" },
  { href: "/more/settings", icon: Settings, label: "Settings", description: "App preferences" },
];

export default async function MorePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="flex flex-col min-h-full">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <h1 className="text-lg font-semibold">More</h1>
      </div>

      <div className="p-4 space-y-2">
        {/* User card */}
        <div className="bg-indigo-50 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <span className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
            {session.user.name?.[0]?.toUpperCase() ?? "U"}
          </span>
          <div>
            <p className="font-semibold">{session.user.name}</p>
            <p className="text-sm text-muted-foreground">{session.user.email}</p>
          </div>
        </div>

        {menuItems.map(({ href, icon: Icon, label, description }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 bg-card rounded-xl p-4 border border-border"
          >
            <span className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-indigo-600" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </Link>
        ))}

        <div className="mt-4">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
