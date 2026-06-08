"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { AddPersonDialog } from "./AddPersonDialog";

interface PersonWithBalance {
  id: string;
  name: string;
  phone: string | null;
  net: number;
}

export function PeopleList({ people }: { people: PersonWithBalance[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [items, setItems] = useState(people);

  function handleAdd(person: PersonWithBalance) {
    setItems((prev) => [...prev, person].sort((a, b) => a.name.localeCompare(b.name)));
  }

  const withDebt = items.filter((p) => p.net !== 0);
  const settled = items.filter((p) => p.net === 0);

  return (
    <div className="flex flex-col flex-1 p-4 gap-4">
      <Button onClick={() => setShowAdd(true)} className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2">
        <UserPlus className="w-4 h-4" /> Add Person
      </Button>

      {items.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-12">No people yet. Add someone to track debts.</p>
      )}

      {withDebt.length > 0 && (
        <section>
          <p className="text-xs font-medium text-muted-foreground mb-2">ACTIVE BALANCES</p>
          <div className="space-y-2">
            {withDebt.map((p) => <PersonRow key={p.id} person={p} />)}
          </div>
        </section>
      )}

      {settled.length > 0 && (
        <section>
          <p className="text-xs font-medium text-muted-foreground mb-2">SETTLED</p>
          <div className="space-y-2">
            {settled.map((p) => <PersonRow key={p.id} person={p} />)}
          </div>
        </section>
      )}

      <AddPersonDialog open={showAdd} onClose={() => setShowAdd(false)} onAdd={handleAdd} />
    </div>
  );
}

function PersonRow({ person }: { person: PersonWithBalance }) {
  return (
    <Link
      href={`/people/${person.id}`}
      className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border"
    >
      <span className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm shrink-0">
        {person.name[0].toUpperCase()}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{person.name}</p>
        {person.net !== 0 && (
          <p className={`text-xs ${person.net > 0 ? "text-emerald-600" : "text-red-600"}`}>
            {person.net > 0 ? "Owes you" : "You owe"} {formatCurrency(Math.abs(person.net))}
          </p>
        )}
        {person.net === 0 && <p className="text-xs text-muted-foreground">Settled</p>}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </Link>
  );
}
