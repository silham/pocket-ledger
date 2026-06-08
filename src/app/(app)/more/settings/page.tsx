import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="flex flex-col min-h-full">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <a href="/more" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </a>
        <h1 className="text-lg font-semibold">Settings</h1>
      </div>
      <div className="p-4 space-y-4">
        <Card>
          <CardContent className="p-4 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-medium">{session.user.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{session.user.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Default Currency</p>
              <p className="text-sm font-medium">LKR (Sri Lankan Rupee)</p>
            </div>
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground text-center">Pocket Ledger v1.0</p>
      </div>
    </div>
  );
}
