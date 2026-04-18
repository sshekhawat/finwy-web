"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CommunityItem = {
  userId: string;
  name: string;
  contactNo: string | null;
  email: string;
  registrationDate: string;
  status: "ACTIVE" | "INACTIVE";
};

type CommunityResponse = {
  success?: boolean;
  data?: {
    items?: CommunityItem[];
    page?: number;
    limit?: number;
    total?: number;
  };
  error?: { message?: string };
};

const PAGE_SIZE = 20;

function toDateLabel(value: string): string {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function MyCommunityPage() {
  const [items, setItems] = useState<CommunityItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/profile/my-community?page=${page}&limit=${PAGE_SIZE}`);
        const json = (await res.json().catch(() => ({}))) as CommunityResponse;
        if (!res.ok) {
          throw new Error(json.error?.message ?? "Failed to load community");
        }
        if (!cancelled) {
          setItems(json.data?.items ?? []);
          setTotal(json.data?.total ?? 0);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Failed to load community");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = total === 0 ? 0 : Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Community</h1>
        <p className="text-sm text-muted-foreground">Referral list of users registered under your ID.</p>
      </div>

      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle>Referral Members</CardTitle>
          <CardDescription>
            {loading
              ? "Loading community data..."
              : total > 0
                ? `Showing ${from}-${to} of ${total} members`
                : "No referral members found yet."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">#</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact No</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((member, index) => (
                <TableRow key={`${member.userId}-${index}`}>
                  <TableCell className="font-medium">{(page - 1) * PAGE_SIZE + index + 1}</TableCell>
                  <TableCell className="font-medium text-primary">{member.userId}</TableCell>
                  <TableCell>{member.name || "-"}</TableCell>
                  <TableCell>{member.contactNo || "-"}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{toDateLabel(member.registrationDate)}</TableCell>
                  <TableCell>
                    <Badge variant={member.status === "ACTIVE" ? "default" : "secondary"}>
                      {member.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}

              {!loading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    No records available for this page.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between gap-3 border-t pt-3">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={loading || page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={loading || page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
