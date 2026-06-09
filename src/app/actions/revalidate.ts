"use server";

import { revalidatePath } from "next/cache";

export async function revalidateAfterTransaction() {
  revalidatePath("/");
  revalidatePath("/transactions");
}
