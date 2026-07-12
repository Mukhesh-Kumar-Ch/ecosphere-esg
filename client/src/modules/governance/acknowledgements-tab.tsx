import { CheckCircle2, AlertCircle, FileText, Check } from "lucide-react";
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { governanceApi } from "./governance-api";
import { ErrorState, EmptyState, LoadingState } from "../administration/shared-state";

export function AcknowledgementsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all active policies
  const policiesQuery = useQuery({
    queryKey: ["governance-policies-active"],
    queryFn: () => governanceApi.getPolicies({ status: "ACTIVE" }),
  });

  // Fetch my acknowledgements
  const acksQuery = useQuery({
    queryKey: ["my-acknowledgements"],
    queryFn: () => governanceApi.getMyAcknowledgements(),
  });

  const acknowledgeMutation = useMutation({
    mutationFn: governanceApi.acknowledgePolicy,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-acknowledgements"] });
      void queryClient.invalidateQueries({ queryKey: ["governance-policies-active"] });
      void queryClient.invalidateQueries({ queryKey: ["governance-report"] });
      toast({ title: "Success", description: "Policy acknowledged successfully." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to acknowledge policy." });
    },
  });

  const handleAcknowledge = async (policyId: string) => {
    await acknowledgeMutation.mutateAsync(policyId);
  };

  const isLoading = policiesQuery.isLoading || acksQuery.isLoading;
  const isError = policiesQuery.isError || acksQuery.isError;

  if (isLoading) return <LoadingState label="Policy Acknowledgements" />;
  if (isError) {
    const retryAll = () => {
      void policiesQuery.refetch();
      void acksQuery.refetch();
    };
    return <ErrorState message="Failed to load acknowledgement details." onRetry={retryAll} />;
  }

  const activePolicies = policiesQuery.data?.policies ?? [];
  const myAcknowledgements = acksQuery.data?.acknowledgements ?? [];

  // Determine pending policies (active policies not in myAcknowledgements)
  const pendingPolicies = activePolicies.filter(
    (p) => !myAcknowledgements.some((ack) => ack.policyId === p.id)
  );

  return (
    <div className="space-y-8">
      {/* 1. Pending Sign-Offs */}
      <Card className="border border-amber-200 bg-amber-50/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-amber-900">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            Required Policy Acknowledgements
          </CardTitle>
          <CardDescription className="text-amber-800 text-xs">
            Review and acknowledge the latest versions of ESG policies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingPolicies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center text-slate-500">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
                <Check className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-slate-900">All Active Policies Acknowledged</p>
              <p className="text-xs text-slate-400 mt-1">You are fully compliant with all current operational policies.</p>
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              {pendingPolicies.map((p) => (
                <div 
                  key={p.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-amber-200 bg-white shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span className="font-bold text-slate-900">{p.title}</span>
                      <span className="font-mono text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                        {p.version}
                      </span>
                    </div>
                    {p.description && <p className="text-xs text-slate-500">{p.description}</p>}
                    <p className="text-[10px] text-slate-400 font-medium">
                      Effective Date: {new Date(p.effectiveDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm shrink-0"
                    type="button"
                    onClick={() => void handleAcknowledge(p.id)}
                    disabled={acknowledgeMutation.isPending}
                  >
                    Acknowledge & Sign
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. History of Acknowledgements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            Acknowledgement History
          </CardTitle>
          <CardDescription>
            Record of all policies you have previously signed off on.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myAcknowledgements.length === 0 ? (
            <EmptyState
              title="No Acknowledgement History"
              description="A list of policies you acknowledge will appear here once you sign off on your first policy."
            />
          ) : (
            <div className="rounded-md border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Acknowledged On</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myAcknowledgements.map((ack) => (
                    <TableRow key={ack.id}>
                      <TableCell className="font-semibold text-slate-900">
                        {ack.policy.title}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{ack.policy.version}</TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {new Date(ack.acknowledgedAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                          <Check className="h-3 w-3 text-green-600" />
                          Signed
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
export default AcknowledgementsTab;
