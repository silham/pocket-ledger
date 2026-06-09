import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helper";

export async function PUT(req: Request) {
  const { error, userId } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { action } = body;

  if (action === "name") {
    const { name } = body;
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    const user = await prisma.user.update({ where: { id: userId }, data: { name: name.trim() } });
    return NextResponse.json({ name: user.name });
  }

  if (action === "email") {
    const { email } = body;
    if (!email?.trim()) return NextResponse.json({ error: "Email is required" }, { status: 400 });
    const normalised = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalised } });
    if (existing && existing.id !== userId)
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    const user = await prisma.user.update({ where: { id: userId }, data: { email: normalised } });
    return NextResponse.json({ email: user.email });
  }

  if (action === "password") {
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword)
      return NextResponse.json({ error: "Both passwords required" }, { status: 400 });
    if (newPassword.length < 8)
      return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.password)
      return NextResponse.json({ error: "No password set on this account" }, { status: 400 });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
