"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowUpDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SortDir = "asc" | "desc";
type MemberSortBy = "userId" | "name" | "contactNo" | "email" | "registrationDate" | "status";
type TeamLevelRow = { level: number; totalMembers: number };
type TeamMemberRow = {
  userId: string;
  name: string;
  contactNo: string | null;
  email: string;
  registrationDate: string;
  status: "ACTIVE" | "INACTIVE";
};

type TeamLevelTreeResponse = {
  data?: { rootUserId?: string | null; items?: TeamLevelRow[] };
  error?: { message?: string };
};
type TeamLevelMembersResponse = {
  data?: { rootUserId?: string | null; items?: TeamMemberRow[]; total?: number };
  error?: { message?: string };
};

function buildTeamCommunityPath(myRootKey: string, opts: { root?: string | null; members?: number | null }): string {
  const q = new URLSearchParams();
  const r = opts.root?.trim();
  if (r && r !== myRootKey) q.set("root", r);
  if (opts.members != null && opts.members >= 1) q.set("members", String(opts.members));
  const s = q.toString();
  return `/dashboard/community/team-community${s ? `?${s}` : ""}`;
}

function formatDateTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function SortableTh({
  label,
  active,
  dir,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  className?: string;
}) {
  return (
    <th className={cn("border-b border-slate-200 bg-slate-100 px-3 py-2.5 text-left text-xs font-semibold text-slate-700", className)}>
      <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 rounded-md hover:text-slate-900">
        {label}
        <ArrowUpDown className={cn("size-3.5 shrink-0 text-slate-400", active && "text-emerald-700")} aria-hidden />
        {active ? <span className="sr-only">{dir === "asc" ? "sorted ascending" : "sorted descending"}</span> : null}
      </button>
    </th>
  );
}

function PlainTh({ label, className }: { label: string; className?: string }) {
  return <th className={cn("border-b border-slate-200 bg-slate-100 px-3 py-2.5 text-left text-xs font-semibold text-slate-700", className)}>{label}</th>;
}

function StatusBadge({ status }: { status: TeamMemberRow["status"] }) {
  const active = status === "ACTIVE";
  return (
    <span className={cn("inline-block min-w-[4.5rem] rounded-full px-2.5 py-1 text-center text-[11px] font-semibold text-white", active ? "bg-emerald-600" : "bg-red-600")}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export function TeamCommunityClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const myRootKey = useMemo(() => user?.publicUserId?.trim() || user?.id?.trim() || "", [user?.publicUserId, user?.id]);
  const rootParam = searchParams.get("root")?.trim() || "";
  const dataRootKey = rootParam || myRootKey;
  const membersRaw = searchParams.get("members");
  const membersLevel = membersRaw != null ? Number.parseInt(membersRaw, 10) : NaN;
  const showMembers = Number.isFinite(membersLevel) && membersLevel >= 1;

  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [resolvedRootUserId, setResolvedRootUserId] = useState<string | null>(null);
  const [levelsRaw, setLevelsRaw] = useState<TeamLevelRow[]>([]);
  const [membersRows, setMembersRows] = useState<TeamMemberRow[]>([]);
  const [membersTotal, setMembersTotal] = useState(0);

  const [levelSort, setLevelSort] = useState<{ key: "level" | "total"; dir: SortDir }>({ key: "level", dir: "asc" });
  const [memberSort, setMemberSort] = useState<{ key: MemberSortBy; dir: SortDir }>({ key: "registrationDate", dir: "desc" });

  useEffect(() => setPage(1), [showMembers, rootParam, membersLevel]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!dataRootKey) return;
      setLoading(true);
      try {
        if (!showMembers) {
          const qs = new URLSearchParams();
          if (rootParam) qs.set("rootUserId", rootParam);
          const res = await apiFetch(`/profile/team-level-tree?${qs.toString()}`);
          const json = (await res.json().catch(() => ({}))) as TeamLevelTreeResponse;
          if (!res.ok) throw new Error(json.error?.message ?? "Failed to load level tree");
          if (!cancelled) {
            setLevelsRaw(json.data?.items ?? []);
            setResolvedRootUserId(json.data?.rootUserId ?? null);
          }
          return;
        }

        const qs = new URLSearchParams();
        qs.set("level", String(membersLevel));
        qs.set("page", String(page));
        qs.set("limit", String(pageSize));
        qs.set("sortBy", memberSort.key);
        qs.set("sortDir", memberSort.dir);
        if (search.trim()) qs.set("search", search.trim());
        if (rootParam) qs.set("rootUserId", rootParam);
        const res = await apiFetch(`/profile/team-level-members?${qs.toString()}`);
        const json = (await res.json().catch(() => ({}))) as TeamLevelMembersResponse;
        if (!res.ok) throw new Error(json.error?.message ?? "Failed to load level members");
        if (!cancelled) {
          setMembersRows(json.data?.items ?? []);
          setMembersTotal(json.data?.total ?? 0);
          setResolvedRootUserId(json.data?.rootUserId ?? null);
        }
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : "Failed to load Team Community");
          if (showMembers) {
            setMembersRows([]);
            setMembersTotal(0);
          } else {
            setLevelsRaw([]);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dataRootKey, showMembers, membersLevel, rootParam, page, pageSize, search, memberSort.key, memberSort.dir]);

  const toggleLevelSort = (key: "level" | "total") =>
    setLevelSort((prev) => (prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  const toggleMemberSort = (key: MemberSortBy) => {
    setPage(1);
    setMemberSort((prev) => (prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  };

  const sortedLevels = useMemo(() => {
    const rows = [...levelsRaw];
    const mul = levelSort.dir === "asc" ? 1 : -1;
    rows.sort((a, b) => (levelSort.key === "level" ? (a.level - b.level) * mul : (a.totalMembers - b.totalMembers) * mul));
    return rows;
  }, [levelsRaw, levelSort]);

  const filteredLevels = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sortedLevels;
    return sortedLevels.filter((row) => `level ${row.level}`.includes(q) || String(row.totalMembers).includes(q) || String(row.level).includes(q));
  }, [sortedLevels, search]);

  const totalItems = showMembers ? membersTotal : filteredLevels.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const sliceStart = (safePage - 1) * pageSize;
  const levelPageSlice = !showMembers ? filteredLevels.slice(sliceStart, sliceStart + pageSize) : [];
  const memberPageSlice = showMembers ? membersRows : [];

  const goTree = useCallback(
    (root?: string | null) => {
      setPage(1);
      setSearch("");
      router.push(buildTeamCommunityPath(myRootKey, { root: root ?? null, members: null }));
    },
    [router, myRootKey],
  );
  const goMembers = useCallback(
    (level: number) => {
      setPage(1);
      setSearch("");
      const urlRoot = rootParam || null;
      router.push(buildTeamCommunityPath(myRootKey, { root: urlRoot || (dataRootKey !== myRootKey ? dataRootKey : null), members: level }));
    },
    [router, myRootKey, rootParam, dataRootKey],
  );
  const drillUser = useCallback(
    (userId: string) => {
      setPage(1);
      setSearch("");
      router.push(buildTeamCommunityPath(myRootKey, { root: userId, members: null }));
    },
    [router, myRootKey],
  );

  const viewingOtherRoot = Boolean(rootParam) && rootParam !== myRootKey;
  const headingRoot = resolvedRootUserId || dataRootKey;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Team Community</h1>
          <p className="text-sm text-slate-600">Explore your level tree, open member lists, and drill into any user&apos;s network.</p>
        </div>
        {viewingOtherRoot ? (
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs text-slate-600">
              Viewing subtree: <span className="font-mono font-semibold text-slate-900">{rootParam}</span>
            </p>
            <Button type="button" variant="outline" size="sm" onClick={() => goTree(null)}>
              My team
            </Button>
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3 text-center sm:text-left">
          <h2 className="text-base font-semibold tracking-wide text-slate-900">{showMembers ? "Your Level Structure" : "Your Level Tree"}</h2>
          {showMembers ? (
            <p className="mt-0.5 text-xs text-slate-500">
              Level {membersLevel} members under <span className="font-mono font-medium text-slate-700">{headingRoot}</span>
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/90 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
            {showMembers ? (
              <Button type="button" variant="outline" size="sm" className="border-slate-300 bg-white" onClick={() => goTree(rootParam || null)}>
                <ArrowLeft className="size-3.5" />
                Back to levels
              </Button>
            ) : null}
            <label className="inline-flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600">Show</span>
              <select
                className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-800 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]/40"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[10, 25, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="text-xs text-slate-600">entries</span>
            </label>
          </div>
          <label className="flex w-full max-w-xs flex-col gap-1 sm:items-end">
            <span className="text-xs font-medium text-slate-600 sm:sr-only">Search</span>
            <span className="flex w-full items-center gap-2 sm:w-auto">
              <span className="hidden text-xs font-medium text-slate-600 sm:inline">Search:</span>
              <Input
                placeholder="Search…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-8 border-slate-300 bg-white sm:min-w-[200px]"
              />
            </span>
          </label>
        </div>

        <div className="overflow-x-auto">
          {!showMembers ? (
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr>
                  <PlainTh label="#" className="w-12 text-center" />
                  <SortableTh label="Level" active={levelSort.key === "level"} dir={levelSort.dir} onClick={() => toggleLevelSort("level")} />
                  <SortableTh label="Total member" active={levelSort.key === "total"} dir={levelSort.dir} onClick={() => toggleLevelSort("total")} />
                  <PlainTh label="Action" className="text-center" />
                </tr>
              </thead>
              <tbody>
                {levelPageSlice.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-10 text-center text-sm text-slate-500">
                      {loading ? "Loading levels..." : "No levels match your search."}
                    </td>
                  </tr>
                ) : (
                  levelPageSlice.map((row, idx) => {
                    const globalIndex = sliceStart + idx + 1;
                    const stripe = idx % 2 === 0 ? "bg-white" : "bg-slate-50";
                    return (
                      <tr key={row.level} className={cn("border-b border-slate-100", stripe)}>
                        <td className="px-3 py-2.5 text-center text-slate-600 tabular-nums">{globalIndex}</td>
                        <td className="px-3 py-2.5 font-medium text-slate-900">Level {row.level}</td>
                        <td className="px-3 py-2.5 tabular-nums text-slate-800">{row.totalMembers}</td>
                        <td className="px-3 py-2.5 text-center">
                          <button type="button" onClick={() => goMembers(row.level)} className="inline-flex items-center gap-0.5 text-sm font-medium text-emerald-700 underline-offset-2 hover:text-emerald-800 hover:underline">
                            View Details
                            <ChevronRight className="size-3.5 opacity-80" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead>
                <tr>
                  <PlainTh label="#" className="w-10 text-center" />
                  <SortableTh label="User ID" active={memberSort.key === "userId"} dir={memberSort.dir} onClick={() => toggleMemberSort("userId")} />
                  <SortableTh label="Name" active={memberSort.key === "name"} dir={memberSort.dir} onClick={() => toggleMemberSort("name")} />
                  <SortableTh label="Contact No" active={memberSort.key === "contactNo"} dir={memberSort.dir} onClick={() => toggleMemberSort("contactNo")} />
                  <SortableTh label="Email" active={memberSort.key === "email"} dir={memberSort.dir} onClick={() => toggleMemberSort("email")} />
                  <SortableTh label="Registration Date" active={memberSort.key === "registrationDate"} dir={memberSort.dir} onClick={() => toggleMemberSort("registrationDate")} />
                  <SortableTh label="Status" active={memberSort.key === "status"} dir={memberSort.dir} onClick={() => toggleMemberSort("status")} className="text-center" />
                </tr>
              </thead>
              <tbody>
                {memberPageSlice.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-sm text-slate-500">
                      {loading ? "Loading members..." : "No members match your search."}
                    </td>
                  </tr>
                ) : (
                  memberPageSlice.map((row, idx) => {
                    const globalIndex = sliceStart + idx + 1;
                    const stripe = idx % 2 === 0 ? "bg-white" : "bg-slate-50";
                    return (
                      <tr key={`${row.userId}-${globalIndex}`} className={cn("border-b border-slate-100", stripe)}>
                        <td className="px-3 py-2.5 text-center text-slate-600 tabular-nums">{globalIndex}</td>
                        <td className="px-3 py-2.5">
                          <button type="button" onClick={() => drillUser(row.userId)} className="font-mono text-sm font-semibold text-[#2563eb] underline-offset-2 hover:text-[#1d4ed8] hover:underline">
                            {row.userId}
                          </button>
                        </td>
                        <td className="px-3 py-2.5 text-slate-900">{row.name || "-"}</td>
                        <td className="px-3 py-2.5 tabular-nums text-slate-800">{row.contactNo || "-"}</td>
                        <td className="max-w-[200px] truncate px-3 py-2.5 text-slate-700" title={row.email}>
                          {row.email}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs text-slate-700">{formatDateTime(row.registrationDate)}</td>
                        <td className="px-3 py-2.5 text-center">
                          <StatusBadge status={row.status} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs text-slate-600 sm:flex-row">
          <p>
            Showing {totalItems === 0 ? 0 : sliceStart + 1} to {Math.min(sliceStart + pageSize, totalItems)} of {totalItems} entries
          </p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs" disabled={safePage <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <span className="tabular-nums">
              Page {safePage} / {totalPages}
            </span>
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs" disabled={safePage >= totalPages || loading} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
