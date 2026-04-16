"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiFetch, isApiConfigured } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Row = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  blocked: boolean;
  balance: string;
};

export default function AdminUsersPage() {
  const [rows, setRows] = useState<Row[]>([]);

  async function load() {
    if (!isApiConfigured()) return;
    const res = await apiFetch("/admin/users");
    const json = (await res.json().catch(() => ({}))) as { items?: Row[] };
    setRows(json.items ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleBlock(id: string, blocked: boolean) {
    try {
      const res = await apiFetch(`/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ blocked: !blocked }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(blocked ? "User unblocked" : "User blocked");
      load();
    } catch {
      toast.error("Could not update user");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          GET <code className="rounded bg-muted px-1">/admin/users</code>, PATCH{" "}
          <code className="rounded bg-muted px-1">/admin/users/:id</code>
        </p>
      </div>
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell className="tabular-nums">{u.balance}</TableCell>
                <TableCell>
                  {u.blocked ? (
                    <Badge variant="destructive">Blocked</Badge>
                  ) : (
                    <Badge variant="secondary">Active</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleBlock(u.id, u.blocked)}
                  >
                    {u.blocked ? "Unblock" : "Block"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
