import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Pencil, Plus, Trash2, Calendar, ClipboardCheck, AlertTriangle } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/contexts/auth-context";
import { administrationApi } from "../administration/administration-api";
import { governanceApi, type Audit, type AuditInput, type AuditStatus } from "./governance-api";
import { ErrorState, EmptyState, LoadingState } from "../administration/shared-state";
import { z } from "zod";

const auditSchema = z.object({
  title: z.string().min(1, "Title is required.").max(150),
  description: z.string().optional(),
  departmentId: z.string().uuid("Please select a department."),
  auditStartDate: z.string().min(1, "Start Date is required."),
  auditEndDate: z.string().min(1, "End Date is required."),
  auditorId: z.string().uuid("Please select an auditor."),
  status: z.enum(["PLANNED", "ONGOING", "COMPLETED", "CANCELLED"]),
  findings: z.string().optional(),
  score: z.coerce.number().min(0, "Score must be at least 0.").max(100, "Score cannot exceed 100.").nullable().optional(),
}).refine(
  (data) => new Date(data.auditEndDate).getTime() >= new Date(data.auditStartDate).getTime(),
  {
    message: "Audit End Date must not precede Start Date.",
    path: ["auditEndDate"],
  }
);

type AuditFormValues = z.infer<typeof auditSchema>;

function AuditFormDialog({
  open,
  onOpenChange,
  departments,
  users,
  audit,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: { id: string; name: string; code: string }[];
  users: { id: string; name: string; email: string }[];
  audit?: Audit | null;
  onSubmit: (values: AuditInput) => Promise<void>;
  submitting: boolean;
}) {
  const defaultValues: AuditFormValues = {
    title: audit?.title ?? "",
    description: audit?.description ?? "",
    departmentId: audit?.departmentId ?? "",
    auditStartDate: audit ? new Date(audit.auditStartDate).toISOString().split("T")[0] ?? "" : "",
    auditEndDate: audit ? new Date(audit.auditEndDate).toISOString().split("T")[0] ?? "" : "",
    auditorId: audit?.auditorId ?? "",
    status: audit?.status ?? "PLANNED",
    findings: audit?.findings ?? "",
    score: audit && audit.score !== null ? Number(audit.score) : null as any,
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AuditFormValues>({
    resolver: zodResolver(auditSchema),
    defaultValues,
  });

  React.useEffect(() => {
    reset(defaultValues);
  }, [audit, open, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      title: values['title'],
      description: values['description'] || null,
      departmentId: values['departmentId'],
      auditStartDate: values['auditStartDate'],
      auditEndDate: values['auditEndDate'],
      auditorId: values['auditorId'],
      status: values['status'],
      findings: values['findings'] || null,
      score: values['score'] !== undefined && values['score'] !== null ? Number(values['score']) : null,
    });
  });

  const isCompleted = !!(audit && audit.status === "COMPLETED");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{audit ? "Edit Audit Record" : "Schedule Audit Cycle"}</DialogTitle>
          <DialogDescription>
            Configure governance compliance audit scopes and scores.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="audit-title">Audit Title</Label>
            <Input id="audit-title" placeholder="e.g. Q3 Operational Compliance Audit" {...register("title")} disabled={isCompleted} />
            {errors['title'] ? <p className="text-sm text-red-500">{errors['title'].message}</p> : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="audit-dept">Department</Label>
              <Select id="audit-dept" {...register("departmentId")} disabled={isCompleted}>
                <option value="">Select Dept...</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </Select>
              {errors['departmentId'] ? <p className="text-sm text-red-500">{errors['departmentId'].message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="audit-auditor">Auditor</Label>
              <Select id="audit-auditor" {...register("auditorId")} disabled={isCompleted}>
                <option value="">Select Auditor...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </Select>
              {errors['auditorId'] ? <p className="text-sm text-red-500">{errors['auditorId'].message}</p> : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="audit-start">Start Date</Label>
              <Input id="audit-start" type="date" {...register("auditStartDate")} disabled={isCompleted} />
              {errors['auditStartDate'] ? <p className="text-sm text-red-500">{errors['auditStartDate'].message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="audit-end">End Date</Label>
              <Input id="audit-end" type="date" {...register("auditEndDate")} disabled={isCompleted} />
              {errors['auditEndDate'] ? <p className="text-sm text-red-500">{errors['auditEndDate'].message}</p> : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="audit-status">Status</Label>
              <Select id="audit-status" {...register("status")} disabled={isCompleted}>
                <option value="PLANNED">Planned</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="audit-score">Score (0-100)</Label>
              <Input id="audit-score" type="number" step="1" {...register("score")} disabled={isCompleted} />
              {errors['score'] ? <p className="text-sm text-red-500">{errors['score'].message}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audit-findings">Findings Summary</Label>
            <Input id="audit-findings" placeholder="Compliance issues, comments" {...register("findings")} disabled={isCompleted} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audit-desc">Description</Label>
            <Input id="audit-desc" placeholder="Audit scope details" {...register("description")} disabled={isCompleted} />
          </div>

          {isCompleted && (
            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600 flex gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" />
              <span>Completed audits are read-only. Please create a new audit scope to adjust metrics.</span>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || isCompleted}>
              {submitting ? "Saving..." : "Save Audit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AuditsTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<AuditStatus | "">("");
  const [deptFilter, setDeptFilter] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedAudit, setSelectedAudit] = React.useState<Audit | null>(null);

  const isAuditEditor = user?.role.name === "Admin" || user?.role.name === "Asset Manager" || user?.role.name === "Department Head";

  // Fetch Audits
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["governance-audits", search, statusFilter, deptFilter],
    queryFn: () => {
      const filters: any = {};
      if (search) filters.search = search;
      if (statusFilter) filters.status = statusFilter;
      if (deptFilter) filters.departmentId = deptFilter;
      return governanceApi.getAudits(filters);
    },
  });

  // Fetch Departments
  const deptsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: () => administrationApi.getDepartments(),
  });

  // Fetch Users
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => governanceApi.getUsers(),
  });

  const createMutation = useMutation({
    mutationFn: governanceApi.createAudit,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["governance-audits"] });
      void queryClient.invalidateQueries({ queryKey: ["governance-report"] });
      toast({ title: "Success", description: "Audit cycle scheduled." });
      setDialogOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to create audit." });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<AuditInput> }) =>
      governanceApi.updateAudit(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["governance-audits"] });
      void queryClient.invalidateQueries({ queryKey: ["governance-report"] });
      toast({ title: "Success", description: "Audit cycle updated." });
      setDialogOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to update audit." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: governanceApi.deleteAudit,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["governance-audits"] });
      void queryClient.invalidateQueries({ queryKey: ["governance-report"] });
      toast({ title: "Success", description: "Audit cycle deleted." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to delete audit." });
    },
  });

  const handleFormSubmit = async (values: AuditInput) => {
    if (selectedAudit) {
      await updateMutation.mutateAsync({ id: selectedAudit.id, input: values });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this audit cycle?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const loading = isLoading || deptsQuery.isLoading || usersQuery.isLoading;
  const isErr = error || deptsQuery.isError || usersQuery.isError;

  if (loading) return <LoadingState label="Compliance Audits" />;
  if (isErr) {
    const retryAll = () => {
      void refetch();
      void deptsQuery.refetch();
      void usersQuery.refetch();
    };
    return <ErrorState message="Failed to load audits data." onRetry={retryAll} />;
  }

  const audits = data?.audits ?? [];
  const departments = deptsQuery.data?.departments ?? [];
  const users = usersQuery.data?.users ?? [];

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2 max-w-2xl flex-1">
          <Input
            placeholder="Search audits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AuditStatus | "")}
          >
            <option value="">All Statuses</option>
            <option value="PLANNED">Planned</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
          <Select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </div>

        {isAuditEditor && (
          <Button
            onClick={() => {
              setSelectedAudit(null);
              setDialogOpen(true);
            }}
            type="button"
          >
            <Plus className="mr-2 h-4 w-4" /> Schedule Audit
          </Button>
        )}
      </div>

      {/* Main List */}
      {(() => {
        if (audits.length === 0) {
          const emptyProps: any = {
            title: "No Audits Scheduled",
            description: "Schedule compliance audit cycles to monitor department governance."
          };
          if (isAuditEditor) {
            emptyProps.actionLabel = "Schedule Audit";
            emptyProps.onAction = () => {
              setSelectedAudit(null);
              setDialogOpen(true);
            };
          }
          return <EmptyState {...emptyProps} />;
        }

        return (
          <div className="rounded-md border border-slate-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Auditor</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  {isAuditEditor && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {audits.map((a) => {
                  const isCompleted = a.status === "COMPLETED";
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-semibold text-slate-900">
                        {a.title}
                        {a.findings && <div className="text-xs text-slate-400 font-normal mt-0.5">{a.findings}</div>}
                      </TableCell>
                      <TableCell className="font-medium">{a.department.name}</TableCell>
                      <TableCell className="text-sm">{a.auditor.name}</TableCell>
                      <TableCell className="text-slate-500 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 shrink-0 text-slate-400" />
                          <span>
                            {new Date(a.auditStartDate).toLocaleDateString()} - {new Date(a.auditEndDate).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border",
                            a.status === "COMPLETED"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : a.status === "ONGOING"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : a.status === "CANCELLED"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-slate-50 text-slate-600 border-slate-200",
                          ].join(" ")}
                        >
                          {a.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {a.score !== null ? (
                          <span
                            className={[
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold font-mono border",
                              a.score >= 80 
                                ? "bg-green-50 text-green-700 border-green-200" 
                                : a.score >= 50 
                                  ? "bg-amber-50 text-amber-700 border-amber-200" 
                                  : "bg-red-50 text-red-700 border-red-200"
                            ].join(" ")}
                          >
                            {a.score}%
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-mono">--</span>
                        )}
                      </TableCell>
                      {isAuditEditor && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            {!isCompleted && (
                              <Button
                                variant="outline"
                                size="sm"
                                type="button"
                                onClick={() => {
                                  setSelectedAudit(a);
                                  setDialogOpen(true);
                                }}
                                title="Edit audit"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              onClick={() => void handleDelete(a.id)}
                              title="Delete audit"
                              className="text-red-600 hover:text-red-700"
                              disabled={isCompleted}
                            >
                              <Trash2 className="h-4 w-4" />
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
        );
      })()}

      <AuditFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        departments={departments}
        users={users}
        audit={selectedAudit}
        onSubmit={handleFormSubmit}
        submitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
export default AuditsTab;
