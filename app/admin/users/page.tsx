"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  me,
  AdminUser,
  listAdminUsers,
  createAdminUser,
  updateAdminUser,
  resetAdminUserPassword,
} from "@/lib/auth-api";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MoreHorizontal, Plus, KeyRound, Pencil, RefreshCw } from "lucide-react";

// toast(sonner) 설치했으면 사용
import { toast } from "sonner";

type Role = "ADMIN" | "USER";

export default function AdminUsersPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");

  // dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);

  const [selected, setSelected] = useState<AdminUser | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await me();
        setRole(data.role);

        if (data.role !== "ADMIN") {
          router.replace("/dashboard");
          return;
        }

        await refresh();
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function refresh() {
    const list = await listAdminUsers();
    setUsers(list);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      return (
        u.username.toLowerCase().includes(q) ||
        (u.role ?? "").toLowerCase().includes(q) ||
        (u.apiKey ?? "").toLowerCase().includes(q)
      );
    });
  }, [users, query]);

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center bg-neutral-100">
        <div className="text-sm text-neutral-600">Loading...</div>
      </main>
    );
  }

  if (role !== "ADMIN") {
    // useEffect에서 redirect 처리하지만, 잠깐의 깜빡임 방지
    return null;
  }

  return (
    <main className="min-h-screen bg-neutral-100">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="rounded-xl bg-white shadow overflow-hidden">
          <div className="h-2 w-full bg-[#FEE500]" />

          <div className="p-6 space-y-4">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h1 className="text-xl font-bold">User Management</h1>
                <p className="text-sm text-neutral-600">
                  Create users, reset passwords, set roles, and register Kakao REST API Key.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border-yellow-200 hover:bg-yellow-50"
                  onClick={async () => {
                    try {
                      await refresh();
                      toast.success("Refreshed");
                    } catch (e: any) {
                      toast.error(e?.message ?? "Failed to refresh");
                    }
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>

                <Button
                  className="bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FDDC00]"
                  onClick={() => setCreateOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create User
                </Button>
              </div>
            </header>

            <Separator />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="w-full sm:max-w-sm">
                <Label className="sr-only">Search</Label>
                <Input
                  placeholder="Search by username, role, api_key..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div className="text-xs text-neutral-500">
                Total: <span className="font-medium text-neutral-900">{filtered.length}</span>
              </div>
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Username</TableHead>
                    <TableHead className="w-[120px]">Role</TableHead>
                    <TableHead className="w-[120px]">Enabled</TableHead>
                    <TableHead>API Key (Kakao REST API Key)</TableHead>
                    <TableHead className="w-[80px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-sm text-neutral-500">
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.username}</TableCell>

                        <TableCell>
                          <RoleBadge role={u.role} />
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={u.enabled}
                              onCheckedChange={async (checked) => {
                                try {
                                  const updated = await updateAdminUser(u.id, { enabled: checked });
                                  setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
                                  toast.success(`User ${checked ? "enabled" : "disabled"}`);
                                } catch (e: any) {
                                  toast.error(e?.message ?? "Failed to update");
                                }
                              }}
                            />
                            <span className="text-xs text-neutral-500">{u.enabled ? "ON" : "OFF"}</span>
                          </div>
                        </TableCell>

                        <TableCell className="text-sm text-neutral-700">
                          {u.apiKey ? (
                            <span className="font-mono break-all">{u.apiKey}</span>
                          ) : (
                            <span className="text-neutral-400">Not set</span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuLabel className="text-xs text-neutral-500">
                                Actions
                              </DropdownMenuLabel>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => {
                                  setSelected(u);
                                  setEditOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                                Edit user
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => {
                                  setSelected(u);
                                  setPwdOpen(true);
                                }}
                              >
                                <KeyRound className="h-4 w-4" />
                                Reset password
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                className="border-yellow-200 hover:bg-yellow-50"
                onClick={() => router.push("/dashboard")}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Create */}
      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(u) => setUsers((prev) => [u, ...prev])}
      />

      {/* Edit */}
      <EditUserDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        user={selected}
        onUpdated={(u) => setUsers((prev) => prev.map((x) => (x.id === u.id ? u : x)))}
      />

      {/* Password */}
      <ResetPasswordDialog
        open={pwdOpen}
        onOpenChange={setPwdOpen}
        user={selected}
      />
    </main>
  );
}

function RoleBadge({ role }: { role: string }) {
  if (role === "ADMIN") {
    return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">ADMIN</Badge>;
  }
  return <Badge className="bg-neutral-100 text-neutral-700 hover:bg-neutral-100">USER</Badge>;
}

/** ---------------- dialogs ---------------- */

function CreateUserDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (u: AdminUser) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("USER");
  const [enabled, setEnabled] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  const [saving, setSaving] = useState(false);

  function reset() {
    setUsername("");
    setPassword("");
    setRole("USER");
    setEnabled(true);
    setApiKey("");
    setClientSecret("");
  }

  async function onSubmit() {
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setSaving(true);
      const created = await createAdminUser({
        username: username.trim(),
        password,
        role,
        enabled,
        apiKey: apiKey.trim() ? apiKey.trim() : undefined,
        clientSecret: clientSecret.trim() ? clientSecret.trim() : undefined,
      });

      toast.success("User created");
      onCreated(created);
      onOpenChange(false);
      reset();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to create user");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Create user</DialogTitle>
          <DialogDescription>
            Create a new portal user. You can register Kakao REST API Key (api_key) now or later.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Username</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. friend" />
          </div>

          <div className="grid gap-2">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="min 6 chars" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Role</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={role === "USER" ? "default" : "outline"}
                  className={role === "USER" ? "bg-neutral-900 text-white hover:bg-neutral-800" : ""}
                  onClick={() => setRole("USER")}
                >
                  USER
                </Button>
                <Button
                  type="button"
                  variant={role === "ADMIN" ? "default" : "outline"}
                  className={role === "ADMIN" ? "bg-red-600 text-white hover:bg-red-500" : ""}
                  onClick={() => setRole("ADMIN")}
                >
                  ADMIN
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Enabled</Label>
              <div className="flex items-center gap-2">
                <Switch checked={enabled} onCheckedChange={setEnabled} />
                <span className="text-sm text-neutral-600">{enabled ? "ON" : "OFF"}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>API Key (Kakao REST API Key)</Label>
            <Input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="optional: user’s Kakao REST API Key"
            />
            <p className="text-xs text-neutral-500">
              This value will be used as OAuth <span className="font-mono">client_id</span> for this user.
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Client Secret (optional)</Label>
            <Input
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="optional: Kakao client secret"
            />
            <p className="text-xs text-neutral-500">
              Only required if <b>Client Secret</b> is enabled in Kakao Dev Console.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={saving}
            className="bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FDDC00]"
          >
            {saving ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditUserDialog({
  open,
  onOpenChange,
  user,
  onUpdated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: AdminUser | null;
  onUpdated: (u: AdminUser) => void;
}) {
  const [role, setRole] = useState<Role>("USER");
  const [enabled, setEnabled] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    setRole((user.role as Role) ?? "USER");
    setEnabled(!!user.enabled);
    setApiKey(user.apiKey ?? "");
    setClientSecret(user.apiKey ?? "");
  }, [open, user]);

  async function onSubmit() {
    if (!user) return;

    try {
      setSaving(true);
      const updated = await updateAdminUser(user.id, {
        role,
        enabled,
        apiKey: apiKey.trim(), // ""이면 비우기
        clientSecret: clientSecret.trim(), // "" → clear
      });
      toast.success("User updated");
      onUpdated(updated);
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update user");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription>
            Update role, enabled flag, and Kakao REST API Key for the selected user.
          </DialogDescription>
        </DialogHeader>

        {!user ? (
          <div className="py-6 text-sm text-neutral-500">No user selected.</div>
        ) : (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Username</Label>
              <Input value={user.username} disabled />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Role</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={role === "USER" ? "default" : "outline"}
                    className={role === "USER" ? "bg-neutral-900 text-white hover:bg-neutral-800" : ""}
                    onClick={() => setRole("USER")}
                  >
                    USER
                  </Button>
                  <Button
                    type="button"
                    variant={role === "ADMIN" ? "default" : "outline"}
                    className={role === "ADMIN" ? "bg-red-600 text-white hover:bg-red-500" : ""}
                    onClick={() => setRole("ADMIN")}
                  >
                    ADMIN
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Enabled</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={enabled} onCheckedChange={setEnabled} />
                  <span className="text-sm text-neutral-600">{enabled ? "ON" : "OFF"}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>API Key (Kakao REST API Key)</Label>
              <Input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="empty to clear"
              />
              <p className="text-xs text-neutral-500">
                Leave empty to remove. (Sends <span className="font-mono">""</span> to clear.)
              </p>
            </div>

            <div className="grid gap-2">
              <Label>Client Secret (optional)</Label>
              <Input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="leave empty to keep / clear"
              />
              <p className="text-xs text-neutral-500">
                Leave empty to clear. Changing this will require re-connecting Kakao.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={saving || !user}
            className="bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FDDC00]"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: AdminUser | null;
}) {
  const [pwd, setPwd] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) setPwd("");
  }, [open]);

  async function onSubmit() {
    if (!user) return;
    if (pwd.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setSaving(true);
      await resetAdminUserPassword(user.id, pwd);
      toast.success("Password updated");
      onOpenChange(false);
      setPwd("");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to reset password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            Set a new password for <span className="font-medium">{user?.username ?? "user"}</span>.
          </DialogDescription>
        </DialogHeader>

        {!user ? (
          <div className="py-6 text-sm text-neutral-500">No user selected.</div>
        ) : (
          <div className="grid gap-2 py-2">
            <Label>New password</Label>
            <Input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="min 6 chars"
            />
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={saving || !user}
            className="bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FDDC00]"
          >
            {saving ? "Updating..." : "Update password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}