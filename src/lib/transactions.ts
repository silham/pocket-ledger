import type { TransactionType } from "@prisma/client";

export function transactionSign(type: TransactionType): string {
  switch (type) {
    case "INCOME":
    case "BORROW":
    case "SETTLEMENT_RECEIVED":
      return "+";
    case "EXPENSE":
    case "LEND":
    case "SETTLEMENT_PAID":
      return "-";
    default:
      return "";
  }
}

export function transactionColor(type: TransactionType): string {
  switch (type) {
    case "INCOME":
    case "BORROW":
    case "SETTLEMENT_RECEIVED":
      return "text-emerald-600";
    case "EXPENSE":
    case "LEND":
    case "SETTLEMENT_PAID":
      return "text-red-600";
    default:
      return "text-foreground";
  }
}

export function transactionLabel(type: TransactionType): string {
  switch (type) {
    case "EXPENSE": return "Expense";
    case "INCOME": return "Income";
    case "TRANSFER": return "Transfer";
    case "LEND": return "Lent";
    case "BORROW": return "Borrowed";
    case "SETTLEMENT_RECEIVED": return "Settlement Received";
    case "SETTLEMENT_PAID": return "Settlement Paid";
    case "ADJUSTMENT": return "Adjustment";
  }
}
