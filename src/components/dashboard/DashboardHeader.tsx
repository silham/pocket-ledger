import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  name: string;
}

export function DashboardHeader({ name }: Props) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex items-center justify-between pt-2">
      <div>
        <p className="text-sm text-muted-foreground">{greeting}</p>
        <h1 className="text-xl font-semibold">{name.split(" ")[0]}</h1>
      </div>
      <Button variant="ghost" size="icon" className="rounded-full">
        <Bell className="w-5 h-5" />
      </Button>
    </div>
  );
}
