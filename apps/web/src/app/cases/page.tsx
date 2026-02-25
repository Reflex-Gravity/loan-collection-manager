"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api, CaseRow, CaseFilters } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function stageBadgeVariant(stage: string) {
  if (stage === "SOFT") return "soft";
  if (stage === "HARD") return "hard";
  return "legal";
}

function statusBadgeVariant(status: string) {
  if (status === "OPEN") return "open";
  if (status === "IN_PROGRESS") return "inProgress";
  if (status === "RESOLVED") return "resolved";
  return "closed";
}

export default function CasesPage() {
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [kpis, setKpis] = useState({
    openCases: 0,
    resolvedToday: 0,
    avgDpd: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CaseFilters>({ page: 1, limit: 10 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ customerId: "", loanId: "" });
  const [createError, setCreateError] = useState("");

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.cases.list(filters);
      setCases(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCases();
    api.cases.kpis().then(setKpis).catch(console.error);
  }, [fetchCases]);

  async function handleCreate() {
    setCreateError("");
    try {
      await api.cases.create({
        customerId: Number(createForm.customerId),
        loanId: Number(createForm.loanId),
      });
      setShowCreateModal(false);
      setCreateForm({ customerId: "", loanId: "" });
      fetchCases();
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : "Failed to create case");
    }
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {kpis.openCases}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resolved Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {kpis.resolvedToday}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg DPD (Open)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {kpis.averageDpd}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cases</CardTitle>
            <Button size="sm" onClick={() => setShowCreateModal(true)}>
              + New Case
            </Button>
          </div>
          {/* Filter bar */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Select
              onValueChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  status: v === "ALL" ? undefined : v,
                  page: 1,
                }))
              }
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              onValueChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  stage: v === "ALL" ? undefined : v,
                  page: 1,
                }))
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Stages</SelectItem>
                <SelectItem value="SOFT">Soft</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
                <SelectItem value="LEGAL">Legal</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="DPD min"
              type="number"
              className="w-24"
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  dpdMin: e.target.value ? Number(e.target.value) : undefined,
                  page: 1,
                }))
              }
            />
            <Input
              placeholder="DPD max"
              type="number"
              className="w-24"
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  dpdMax: e.target.value ? Number(e.target.value) : undefined,
                  page: 1,
                }))
              }
            />
            <Input
              placeholder="Assigned to"
              className="w-36"
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  assignedTo: e.target.value || undefined,
                  page: 1,
                }))
              }
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">ID</th>
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">DPD</th>
                    <th className="pb-2 font-medium">Stage</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Assigned To</th>
                    <th className="pb-2 font-medium">Outstanding</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-muted/30">
                      <td className="py-2 font-mono text-xs text-muted-foreground">
                        #{c.id}
                      </td>
                      <td className="py-2">
                        <div className="font-medium">{c.customer.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {c.customer.email}
                        </div>
                      </td>
                      <td className="py-2 font-semibold text-red-600">
                        {c.dpd}d
                      </td>
                      <td className="py-2">
                        <Badge variant={stageBadgeVariant(c.stage) as any}>
                          {c.stage}
                        </Badge>
                      </td>
                      <td className="py-2">
                        <Badge variant={statusBadgeVariant(c.status) as any}>
                          {c.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="py-2 text-sm">
                        {c.assignedTo ?? c.assignGroup ?? "—"}
                      </td>
                      <td className="py-2 font-mono text-sm">
                        $
                        {Number(c.loan.outstanding).toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                        })}
                      </td>
                      <td className="py-2">
                        <Link href={`/cases/${c.id}`}>
                          <Button variant="ghost" size="sm">
                            View →
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {cases.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No cases found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                <span>{total} total cases</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={(filters.page ?? 1) <= 1}
                    onClick={() =>
                      setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))
                    }
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-2">
                    Page {filters.page ?? 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={(filters.page ?? 1) >= totalPages}
                    onClick={() =>
                      setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Case Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Create New Case</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Customer ID
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 1"
                  value={createForm.customerId}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, customerId: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Loan ID
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 1"
                  value={createForm.loanId}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, loanId: e.target.value }))
                  }
                />
              </div>
              {createError && (
                <p className="text-sm text-red-600">{createError}</p>
              )}
            </div>
            <div className="flex gap-2 mt-5 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!createForm.customerId || !createForm.loanId}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
