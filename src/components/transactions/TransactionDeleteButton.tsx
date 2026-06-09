"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { revalidateAfterTransaction } from "@/app/actions/revalidate";

interface Props {
  id: string;
  onDelete: (id: string) => void;
}

export function TransactionDeleteButton({ id, onDelete }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this transaction? Account balance will be reversed.")) return;
    setLoading(true);
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      toast.success("Transaction deleted");
      onDelete(id);
      await revalidateAfterTransaction();
    } else {
      toast.error("Failed to delete");
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
    </button>
  );
}
