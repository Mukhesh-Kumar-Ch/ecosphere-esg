import { Check, X, FileText, CheckCircle2, ShieldAlert, UploadCloud, Heart } from "lucide-react";
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/contexts/auth-context";
import { socialApi, type CsrParticipation, type ChallengeParticipation, type ApprovalStatus } from "./social-api";
import { ErrorState, EmptyState, LoadingState } from "../administration/shared-state";

function SubmitProofDialog({
  open,
  onOpenChange,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (proofFile: string) => Promise<void>;
  submitting: boolean;
}) {
  const [proof, setProof] = React.useState("");

  React.useEffect(() => {
    if (open) setProof("");
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proof.trim()) return;
    await onSubmit(proof);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Participation Evidence</DialogTitle>
          <DialogDescription>
            Provide a document link, image URL, or file path as proof of completion.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proof-url">Proof File Path / Link</Label>
            <Input
              id="proof-url"
              placeholder="e.g. https://files.company.com/proof/doc1.pdf"
              value={proof}
              onChange={(e) => setProof(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !proof.trim()}>
              {submitting ? "Uploading..." : "Submit Proof"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ParticipationTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeSubTab, setActiveSubTab] = React.useState<"my" | "approvals">("my");
  const [proofDialogOpen, setProofDialogOpen] = React.useState(false);
  const [selectedCsrId, setSelectedCsrId] = React.useState<string | null>(null);

  const isAdminOrHead = user?.role.name === "Admin" || user?.role.name === "Asset Manager" || user?.role.name === "Department Head";

  // 1. Fetch CSR Participations (My or All)
  const csrPartsQuery = useQuery({
    queryKey: ["csr-participations", activeSubTab, user?.id],
    queryFn: () => {
      const filters: any = {};
      if (activeSubTab === "my" && user) {
        filters.userId = user.id;
      } else if (activeSubTab === "approvals") {
        filters.approvalStatus = "PENDING" as ApprovalStatus;
      }
      return socialApi.getParticipations(filters);
    },
  });

  // 2. Fetch Challenge Participations (My or All)
  const challengePartsQuery = useQuery({
    queryKey: ["challenge-participations", activeSubTab, user?.id],
    queryFn: () => {
      const filters: any = {};
      if (activeSubTab === "my" && user) {
        filters.userId = user.id;
      } else if (activeSubTab === "approvals") {
        filters.approvalStatus = "PENDING" as ApprovalStatus;
      }
      return socialApi.getChallengeParticipations(filters);
    },
  });

  // Mutations
  const approveCsrMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApprovalStatus }) =>
      socialApi.approveParticipation(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["csr-participations"] });
      void queryClient.invalidateQueries({ queryKey: ["social-report"] });
      toast({ title: "Success", description: "CSR participation updated." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to update participation." });
    },
  });

  const approveChallengeMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApprovalStatus }) =>
      socialApi.approveChallengeParticipation(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["challenge-participations"] });
      void queryClient.invalidateQueries({ queryKey: ["social-report"] });
      toast({ title: "Success", description: "Challenge completion updated." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to update challenge completion." });
    },
  });

  const submitProofMutation = useMutation({
    mutationFn: ({ activityId, proofFile }: { activityId: string; proofFile: string }) =>
      socialApi.submitProof(activityId, proofFile),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["csr-participations"] });
      toast({ title: "Success", description: "Proof uploaded successfully." });
      setProofDialogOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to submit proof." });
    },
  });

  const handleProofSubmit = async (proofFile: string) => {
    if (selectedCsrId) {
      await submitProofMutation.mutateAsync({ activityId: selectedCsrId, proofFile });
    }
  };

  const handleApproveCsr = async (id: string, status: ApprovalStatus) => {
    await approveCsrMutation.mutateAsync({ id, status });
  };

  const handleApproveChallenge = async (id: string, status: ApprovalStatus) => {
    await approveChallengeMutation.mutateAsync({ id, status });
  };

  const loading = csrPartsQuery.isLoading || challengePartsQuery.isLoading;
  const isErr = csrPartsQuery.isError || challengePartsQuery.isError;

  if (loading) return <LoadingState label="Participation Details" />;
  if (isErr) {
    const retryAll = () => {
      void csrPartsQuery.refetch();
      void challengePartsQuery.refetch();
    };
    return <ErrorState message="Failed to load participation data." onRetry={retryAll} />;
  }

  const csrParticipations = csrPartsQuery.data?.participations ?? [];
  const challengeParticipations = challengePartsQuery.data?.participations ?? [];

  return (
    <div className="space-y-6">
      {/* Tab Select Bar */}
      {isAdminOrHead && (
        <div className="flex border-b border-slate-200 gap-4 mb-4">
          <button
            className={[
              "pb-2 font-semibold text-sm transition border-b-2",
              activeSubTab === "my"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900",
            ].join(" ")}
            type="button"
            onClick={() => setActiveSubTab("my")}
          >
            My Activity Sign-offs
          </button>
          <button
            className={[
              "pb-2 font-semibold text-sm transition border-b-2",
              activeSubTab === "approvals"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900",
            ].join(" ")}
            type="button"
            onClick={() => setActiveSubTab("approvals")}
          >
            Awaiting Approval (Manager View)
          </button>
        </div>
      )}

      {/* 1. CSR Activity Sign-offs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Heart className="h-5 w-5 text-emerald-500 shrink-0" />
            CSR Activity Participations
          </CardTitle>
          <CardDescription>
            {activeSubTab === "my" 
              ? "Track your joined CSR initiatives and submit proof files to claim XP." 
              : "Review and approve employee CSR participation requests."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {csrParticipations.length === 0 ? (
            <EmptyState
              title="No CSR Participations Found"
              description="There are no participations logged under this tab."
            />
          ) : (
            <div className="rounded-md border border-slate-200 bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Proof File</TableHead>
                    <TableHead>Approval Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csrParticipations.map((p) => {
                    const isPending = p.approvalStatus === "PENDING";
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-semibold text-slate-900">
                          {p.activity.title}
                          <div className="text-xs text-slate-400 mt-0.5">{new Date(p.activity.startDate).toLocaleDateString()}</div>
                        </TableCell>
                        <TableCell className="text-sm font-medium">{p.user.name}</TableCell>
                        <TableCell>
                          {p.proofFile ? (
                            <a
                              href={p.proofFile}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1 text-xs"
                            >
                              <FileText className="h-4 w-4 shrink-0" /> View Document
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No proof submitted</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border",
                              p.approvalStatus === "APPROVED"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : p.approvalStatus === "PENDING"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-red-50 text-red-700 border-red-200",
                            ].join(" ")}
                          >
                            {p.approvalStatus}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {activeSubTab === "my" && isPending && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedCsrId(p.activityId);
                                setProofDialogOpen(true);
                              }}
                              type="button"
                            >
                              <UploadCloud className="mr-1.5 h-3.5 w-3.5" /> Submit Proof
                            </Button>
                          )}

                          {activeSubTab === "approvals" && (
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white shadow-sm font-bold text-xs"
                                type="button"
                                onClick={() => void handleApproveCsr(p.id, "APPROVED")}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white shadow-sm font-bold text-xs"
                                type="button"
                                onClick={() => void handleApproveCsr(p.id, "REJECTED")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Challenge Progress & Approvals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-indigo-500 shrink-0" />
            Sustainability Challenges
          </CardTitle>
          <CardDescription>
            {activeSubTab === "my" 
              ? "Track your joined challenges and verify completion status." 
              : "Review and approve completed challenges requiring proof."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {challengeParticipations.length === 0 ? (
            <EmptyState
              title="No Challenge Progress Found"
              description="There are no participations logged under this tab."
            />
          ) : (
            <div className="rounded-md border border-slate-200 bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Challenge</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Proof File</TableHead>
                    <TableHead>Approval Status</TableHead>
                    {activeSubTab === "approvals" && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {challengeParticipations.map((p) => {
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-semibold text-slate-900">
                          {p.challenge.title}
                          <span className="ml-2 font-mono text-[10px] bg-slate-100 border border-slate-200 px-1 py-0.5 rounded text-slate-500 font-normal">
                            +{p.challenge.xpReward} XP
                          </span>
                        </TableCell>
                        <TableCell className="text-sm font-medium">{p.user.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 w-32">
                            <span className="font-mono text-xs text-slate-600 font-bold">{p.progress}%</span>
                            <div className="w-full bg-slate-150 h-1.5 rounded-full overflow-hidden border border-slate-200">
                              <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${p.progress}%` }} />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {p.proofFile ? (
                            <a
                              href={p.proofFile}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1 text-xs"
                            >
                              <FileText className="h-4 w-4 shrink-0" /> View Document
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No proof submitted</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border",
                              p.approvalStatus === "APPROVED"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : p.approvalStatus === "PENDING"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-red-50 text-red-700 border-red-200",
                            ].join(" ")}
                          >
                            {p.approvalStatus}
                          </span>
                        </TableCell>
                        {activeSubTab === "approvals" && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white shadow-sm font-bold text-xs"
                                type="button"
                                onClick={() => void handleApproveChallenge(p.id, "APPROVED")}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white shadow-sm font-bold text-xs"
                                type="button"
                                onClick={() => void handleApproveChallenge(p.id, "REJECTED")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <SubmitProofDialog
        open={proofDialogOpen}
        onOpenChange={setProofDialogOpen}
        onSubmit={handleProofSubmit}
        submitting={submitProofMutation.isPending}
      />
    </div>
  );
}
export default ParticipationTab;
