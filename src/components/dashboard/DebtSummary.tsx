import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface Props {
  othersOweMe: number;
  iOweOthers: number;
}

export function DebtSummary({ othersOweMe, iOweOthers }: Props) {
  if (othersOweMe === 0 && iOweOthers === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">Debt Overview</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">Others owe me</p>
            <p className="font-semibold text-emerald-600">{formatCurrency(othersOweMe)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-4 h-4 text-red-600" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">I owe others</p>
            <p className="font-semibold text-red-600">{formatCurrency(iOweOthers)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
