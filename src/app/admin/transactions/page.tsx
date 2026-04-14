"use client";

import { useEffect, useState } from "react";
import { apiFetch, isApiConfigured } from "@/lib/api-client";
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
  kind: string;
  status: string;
  amount: string;
  from: string;
  to: string;
  createdAt: string;
};

export default function AdminTransactionsPage() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!isApiConfigured()) return;
    (async () => {
      const res = await apiFetch("/admin/transactions");
      const json = (await res.json().catch(() => ({}))) as { items?: Row[] };
      setRows(json.items ?? []);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">All transactions</h1>
        <p className="text-sm text-muted-foreground">
          GET <code className="rounded bg-muted px-1">/admin/transactions</code>
        </p>
      </div>
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {t.createdAt?.slice(0, 19)?.replace("T", " ")}
                </TableCell>
                <TableCell className="max-w-[140px] truncate text-xs">{t.from}</TableCell>
                <TableCell className="max-w-[140px] truncate text-xs">{t.to}</TableCell>
                <TableCell>{t.kind}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      t.status === "SUCCESS"
                        ? "default"
                        : t.status === "PENDING"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {t.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{t.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
