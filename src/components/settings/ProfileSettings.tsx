"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const nameSchema = z.object({ name: z.string().min(1, "Required") });
const emailSchema = z.object({ email: z.string().email("Invalid email") });
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Required"),
  newPassword: z.string().min(8, "At least 8 characters"),
  confirmPassword: z.string().min(1, "Required"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type NameForm = z.infer<typeof nameSchema>;
type EmailForm = z.infer<typeof emailSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

interface Props {
  initialName: string;
  initialEmail: string;
}

async function apiPut(action: string, data: Record<string, string>) {
  const res = await fetch("/api/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...data }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed");
  return json;
}

export function ProfileSettings({ initialName, initialEmail }: Props) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [editName, setEditName] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [editPassword, setEditPassword] = useState(false);
  const [loadingName, setLoadingName] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const nameForm = useForm<NameForm>({ resolver: zodResolver(nameSchema), defaultValues: { name } });
  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema), defaultValues: { email } });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  async function saveName(data: NameForm) {
    setLoadingName(true);
    try {
      const res = await apiPut("name", { name: data.name });
      setName(res.name);
      setEditName(false);
      toast.success("Name updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoadingName(false);
    }
  }

  async function saveEmail(data: EmailForm) {
    setLoadingEmail(true);
    try {
      const res = await apiPut("email", { email: data.email });
      setEmail(res.email);
      setEditEmail(false);
      toast.success("Email updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoadingEmail(false);
    }
  }

  async function savePassword(data: PasswordForm) {
    setLoadingPassword(true);
    try {
      await apiPut("password", { currentPassword: data.currentPassword, newPassword: data.newPassword });
      setEditPassword(false);
      passwordForm.reset();
      toast.success("Password updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoadingPassword(false);
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Name */}
      <Card>
        <CardHeader className="px-4 pt-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Name</CardTitle>
          {!editName && (
            <button onClick={() => { nameForm.setValue("name", name); setEditName(true); }}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted">
              <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {editName ? (
            <form onSubmit={nameForm.handleSubmit(saveName)} className="space-y-3">
              <div className="space-y-1.5">
                <Input placeholder="Your name" {...nameForm.register("name")} />
                {nameForm.formState.errors.name && (
                  <p className="text-xs text-destructive">{nameForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" className="flex-1"
                  onClick={() => setEditName(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={loadingName} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                  {loadingName && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}Save
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-sm">{name}</p>
          )}
        </CardContent>
      </Card>

      {/* Email */}
      <Card>
        <CardHeader className="px-4 pt-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Email</CardTitle>
          {!editEmail && (
            <button onClick={() => { emailForm.setValue("email", email); setEditEmail(true); }}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted">
              <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {editEmail ? (
            <form onSubmit={emailForm.handleSubmit(saveEmail)} className="space-y-3">
              <div className="space-y-1.5">
                <Input type="email" placeholder="your@email.com" {...emailForm.register("email")} />
                {emailForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{emailForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" className="flex-1"
                  onClick={() => setEditEmail(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={loadingEmail} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                  {loadingEmail && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}Save
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-sm">{email}</p>
          )}
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader className="px-4 pt-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Password</CardTitle>
          {!editPassword && (
            <button onClick={() => setEditPassword(true)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted">
              <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {editPassword ? (
            <form onSubmit={passwordForm.handleSubmit(savePassword)} className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Current password</Label>
                <Input type="password" placeholder="••••••••" {...passwordForm.register("currentPassword")} />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">New password</Label>
                <Input type="password" placeholder="••••••••" {...passwordForm.register("newPassword")} />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Confirm new password</Label>
                <Input type="password" placeholder="••••••••" {...passwordForm.register("confirmPassword")} />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" className="flex-1"
                  onClick={() => { setEditPassword(false); passwordForm.reset(); }}>Cancel</Button>
                <Button type="submit" size="sm" disabled={loadingPassword} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                  {loadingPassword && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}Update
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">••••••••</p>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">Pocket Ledger v1.0</p>
    </div>
  );
}
