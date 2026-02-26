'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, CaseDetail } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

function stageBadgeVariant(stage: string) {
  if (stage === 'SOFT') return 'soft';
  if (stage === 'HARD') return 'hard';
  return 'legal';
}

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [assignResult, setAssignResult] = useState<string | null>(null);
  const [actionForm, setActionForm] = useState({ type: '', outcome: '', notes: '' });
  const [actionError, setActionError] = useState('');
  const [addingAction, setAddingAction] = useState(false);

  async function fetchCase() {
    try {
      const data = await api.cases.get(Number(id));
      setCaseData(data);
    } catch {
      router.push('/cases');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchCase(); }, [id]);

  async function handleAssign() {
    setAssigning(true);
    setAssignResult(null);
    try {
      const result = await api.cases.assign(Number(id)) as any;
      setAssignResult(result.decision?.reason ?? 'Assignment complete');
      fetchCase();
    } catch (e: unknown) {
      setAssignResult(`Error: ${e instanceof Error ? e.message : 'Assignment failed'}`);
    } finally {
      setAssigning(false);
    }
  }

  function handleDownloadPdf() {
    window.open(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/cases/${id}/notice.pdf`, '_blank');
  }

  async function handleAddAction() {
    if (!actionForm.type || !actionForm.outcome) return;
    setAddingAction(true);
    setActionError('');
    try {
      await api.cases.addAction(Number(id), {
        type: actionForm.type,
        outcome: actionForm.outcome,
        notes: actionForm.notes || undefined,
      });
      setActionForm({ type: '', outcome: '', notes: '' });
      fetchCase();
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : 'Failed to add action');
    } finally {
      setAddingAction(false);
    }
  }

  if (loading) {
    return <div className="text-center py-16 text-muted-foreground">Loading case...</div>;
  }

  if (!caseData) return null;

  const { customer, loan, actionLogs, decisions } = caseData;

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/cases')}>← Back</Button>
        <h2 className="text-xl font-semibold">Case #{caseData.id}</h2>
        <Badge variant={stageBadgeVariant(caseData.stage) as any}>{caseData.stage}</Badge>
        <Badge variant="outline">{caseData.status.replace('_', ' ')}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Customer + Loan */}
        <Card>
          <CardHeader><CardTitle className="text-base">Customer</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Name:</span> <strong>{customer.name}</strong></div>
            <div><span className="text-muted-foreground">Email:</span> {customer.email}</div>
            <div><span className="text-muted-foreground">Phone:</span> {customer.phone}</div>
            <div><span className="text-muted-foreground">Country:</span> {customer.country}</div>
            <div><span className="text-muted-foreground">Risk Score:</span> <strong className="text-red-600">{customer.riskScore}/100</strong></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Loan Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Loan ID:</span> #{loan.id}</div>
            <div><span className="text-muted-foreground">Principal:</span> ${Number(loan.principal).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div><span className="text-muted-foreground">Outstanding:</span> <strong className="text-red-600">${Number(loan.outstanding).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
            <div><span className="text-muted-foreground">Due Date:</span> {new Date(loan.dueDate).toLocaleDateString()}</div>
            <div><span className="text-muted-foreground">DPD:</span> <strong className="text-red-600">{caseData.dpd} days</strong></div>
            <div><span className="text-muted-foreground">Assigned To:</span> {caseData.assignedTo ?? caseData.assignedGroup ?? 'Unassigned'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Row */}
      <div className="flex gap-3 flex-wrap">
        <Button onClick={handleAssign} disabled={assigning} variant="outline">
          {assigning ? 'Running...' : 'Run Assignment'}
        </Button>
        <Button onClick={handleDownloadPdf} variant="outline">
          Generate PDF Notice
        </Button>
      </div>

      {assignResult && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
          <strong>Assignment result:</strong> {assignResult}
        </div>
      )}

      {/* Last Rule Decision */}
      {decisions.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Last Assignment Decision</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <div><span className="text-muted-foreground">Rules matched:</span> {decisions[0].matchedRules.join(', ') || 'None'}</div>
            <div className="mt-1"><span className="text-muted-foreground">Reason:</span> {decisions[0].reason}</div>
            <div className="mt-1 text-xs text-muted-foreground">{new Date(decisions[0].createdAt).toLocaleString()}</div>
          </CardContent>
        </Card>
      )}

      {/* Add Action */}
      <Card>
        <CardHeader><CardTitle className="text-base">Add Action Log</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="w-36">
              <label className="text-xs text-muted-foreground block mb-1">Type</label>
              <Select value={actionForm.type} onValueChange={(v) => setActionForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CALL">Call</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-44">
              <label className="text-xs text-muted-foreground block mb-1">Outcome</label>
              <Select value={actionForm.outcome} onValueChange={(v) => setActionForm((f) => ({ ...f, outcome: v }))}>
                <SelectTrigger><SelectValue placeholder="Outcome" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NO_ANSWER">No Answer</SelectItem>
                  <SelectItem value="PROMISE_TO_PAY">Promise to Pay</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="WRONG_NUMBER">Wrong Number</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-48">
              <label className="text-xs text-muted-foreground block mb-1">Notes (optional)</label>
              <Textarea
                placeholder="Add notes..."
                rows={1}
                value={actionForm.notes}
                onChange={(e) => setActionForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <Button
              onClick={handleAddAction}
              disabled={addingAction || !actionForm.type || !actionForm.outcome}
              size="sm"
            >
              {addingAction ? 'Adding...' : 'Add Action'}
            </Button>
          </div>
          {actionError && <p className="text-sm text-red-600 mt-2">{actionError}</p>}
        </CardContent>
      </Card>

      {/* Action Log Timeline */}
      <Card>
        <CardHeader><CardTitle className="text-base">Action Log</CardTitle></CardHeader>
        <CardContent>
          {actionLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No actions recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {actionLogs.map((log) => (
                <div key={log.id} className="flex gap-3 text-sm border-l-2 border-gray-200 pl-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{log.type}</Badge>
                      <Badge variant="outline" className="text-xs">{log.outcome.replace('_', ' ')}</Badge>
                      <span className="text-xs text-muted-foreground ml-auto">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    {log.notes && <p className="mt-1 text-muted-foreground">{log.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
