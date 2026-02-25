const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export interface CaseFilters {
  status?: string;
  stage?: string;
  dpdMin?: number;
  dpdMax?: number;
  assignedTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const api = {
  cases: {
    list: (filters: CaseFilters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== "") params.set(k, String(v));
      });
      return request<{
        data: CaseRow[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/cases?${params}`);
    },
    get: (id: number) => request<CaseDetail>(`/cases/${id}`),
    create: (dto: { customerId: number; loanId: number }) =>
      request(`/cases`, { method: "POST", body: JSON.stringify(dto) }),
    addAction: (
      id: number,
      dto: { type: string; outcome: string; notes?: string },
    ) =>
      request(`/cases/${id}/actions`, {
        method: "POST",
        body: JSON.stringify(dto),
      }),
    assign: (id: number) => request(`/cases/${id}/assign`, { method: "POST" }),
    kpis: () =>
      request<{ openCases: number; resolvedToday: number; avgDpd: number }>(
        "/cases/kpis",
      ),
  },
  customers: {
    list: () => request<CustomerRow[]>("/customers"),
  },
  loans: {
    list: () => request<LoanRow[]>("/loans"),
  },
};

export interface CaseRow {
  id: number;
  dpd: number;
  stage: string;
  status: string;
  assignedTo: string | null;
  assignedGroup: string | null;
  createdAt: string;
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
    country: string;
    riskScore: number;
  };
  loan: { id: number; principal: string; outstanding: string; dueDate: string };
}

export interface CaseDetail extends CaseRow {
  actionLogs: ActionLogRow[];
  decisions: DecisionRow[];
}

export interface ActionLogRow {
  id: number;
  type: string;
  outcome: string;
  notes: string | null;
  createdAt: string;
}

export interface DecisionRow {
  id: number;
  matchedRules: string[];
  reason: string;
  createdAt: string;
}

export interface CustomerRow {
  id: number;
  name: string;
  phone: string;
  email: string;
  country: string;
  riskScore: number;
}

export interface LoanRow {
  id: number;
  customerId: number;
  principal: string;
  outstanding: string;
  dueDate: string;
  status: string;
  customer: { name: string };
}
