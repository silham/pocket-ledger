import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
    },
  });

  // Seed default categories for the new user
  await seedDefaultCategories(user.id);

  return NextResponse.json({ message: "Account created" }, { status: 201 });
}

async function seedDefaultCategories(userId: string) {
  const expenseCategories = [
    { name: "Food", icon: "🍔", color: "#F59E0B" },
    { name: "Transport", icon: "🚌", color: "#3B82F6" },
    { name: "Education", icon: "📚", color: "#8B5CF6" },
    { name: "Subscriptions", icon: "📱", color: "#EC4899" },
    { name: "Shopping", icon: "🛍️", color: "#F97316" },
    { name: "Health", icon: "💊", color: "#EF4444" },
    { name: "Entertainment", icon: "🎬", color: "#14B8A6" },
    { name: "Family", icon: "👨‍👩‍👧", color: "#84CC16" },
    { name: "Bills", icon: "📄", color: "#6B7280" },
    { name: "Mobile/Data", icon: "📡", color: "#06B6D4" },
    { name: "Travel", icon: "✈️", color: "#F59E0B" },
    { name: "University", icon: "🎓", color: "#7C3AED" },
    { name: "Business", icon: "💼", color: "#1D4ED8" },
    { name: "Other", icon: "📦", color: "#9CA3AF" },
  ];

  const incomeCategories = [
    { name: "Salary", icon: "💰", color: "#10B981" },
    { name: "Freelance", icon: "💻", color: "#3B82F6" },
    { name: "Business", icon: "🏪", color: "#F59E0B" },
    { name: "Gift", icon: "🎁", color: "#EC4899" },
    { name: "Refund", icon: "↩️", color: "#6B7280" },
    { name: "Other", icon: "📥", color: "#9CA3AF" },
  ];

  await prisma.category.createMany({
    data: [
      ...expenseCategories.map((c) => ({ ...c, userId, type: "EXPENSE" as const, isDefault: true })),
      ...incomeCategories.map((c) => ({ ...c, userId, type: "INCOME" as const, isDefault: true })),
    ],
  });
}
