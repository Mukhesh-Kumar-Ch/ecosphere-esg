import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Pencil, Plus, Trash2, Calendar, AlertOctagon, Check } from "lucide-react";
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
import { governanceApi, type ComplianceIssue, type ComplianceIssueInput, type ComplianceStatus, type SeverityLevel } from "./governance-api";
import { ErrorState, EmptyState, LoadingState } from "../administration/shared-state";
import { z } from "zod";

const issueSchema = z.object({
  title: z.string().min(1, "Title is required.").max(150),
  description: z.string().min(1, "Description is required."),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  departmentId: z.string().uuid("Please select a department."),
  ownerId: z.string().uuid("Owner is mandatory."),
  dueDate: z.string().min(1, "Due date is mandatory."),
  auditId: z.string().uuid("Please select an audit cycle."),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "OVERDUE"]),
});

type IssueFormValues = z.infer<typeof issueSchema>;

function IssueFormDialog({
  open,
  onOpenChange,
  departments,
  users,
  audits,
  issue,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: { id: string; name: string; code: string }[];
  users: { id: string; name: string; email: string }[];
  audits: { id: string; title: string; status: string }[];
  issue?: ComplianceIssue | null;
  onSubmit: (values: ComplianceIssueInput) => Promise<void>;
  submitting: boolean;
}) {
  const defaultValues: IssueFormValues = {
    title: issue?.title ?? "",
    description: issue?.description ?? "",
    severity: issue?.severity ?? "MEDIUM",
    departmentId: issue?.departmentId ?? "",
    ownerId: issue?.ownerId ?? "",
    dueDate: issue ? new Date(issue.dueDate).toISOString().split("T")[0] ?? "" : "",
    auditId: issue?.auditId ?? "",
    status: issue?.status ?? "OPEN",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
    defaultValues,
  });

  React.useEffect(() => {
    reset(defaultValues);
  }, [issue, open, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      title: values['title'],
      description: values['description'],
      severity: values['severity'],
      departmentId: values['departmentId'],
      ownerId: values['ownerId'],
      dueDate: values['dueDate'],
      auditId: values['auditId'],
      status: values['status'],
    });
  });

  const isResolved = !!(issue && issue.status === "RESOLVED");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{issue ? "Edit Compliance Issue" : "Log Compliance Issue"}</DialogTitle>
          <DialogDescription>
            Report compliance gaps and assign owners/deadlines.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="issue-title">Issue Title</Label>
            <Input id="issue-title" placeholder="e.g. Missing Water Discharge Logs" {...register("title")} disabled={isResolved} />
            {errors['title'] ? <p className="text-sm text-red-500">{errors['title'].message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="issue-audit">Audit Context</Label>
            <Select id="issue-audit" {...register("auditId")} disabled={!!issue}>
              <option value="">Select Audit...</option>
              {audits.filter(a => a.status !== "COMPLETED").map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </Select>
            {errors['auditId'] ? <p className="text-sm text-red-500">{errors['auditId'].message}</p> : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issue-dept">Department</Label>
              <Select id="issue-dept" {...register("departmentId")} disabled={isResolved}>
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
              <Label htmlFor="issue-owner">Owner (Mandatory)</Label>
              <Select id="issue-owner" {...register("ownerId")} disabled={isResolved}>
                <option value="">Select Owner...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </Select>
              {errors['ownerId'] ? <p className="text-sm text-red-500">{errors['ownerId'].message}</p> : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issue-severity">Severity</Label>
              <Select id="issue-severity" {...register("severity")} disabled={isResolved}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="issue-due">Due Date (Mandatory)</Label>
              <Input id="issue-due" type="date" {...register("dueDate")} disabled={isResolved} />
              {errors['dueDate'] ? <p className="text-sm text-red-500">{errors['dueDate'].message}</p> : null}
            </div>
          </div>

          {issue && (
            <div className="space-y-2">
              <Label htmlFor="issue-status">Status</Label>
              <Select id="issue-status" {...register("status")} disabled={isResolved}>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="OVERDUE">Overdue</option>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="issue-desc">Description</Label>
            <Input id="issue-desc" placeholder="Details of the violation" {...register("description")} disabled={isResolved} />
            {errors['description'] ? <p className="text-sm text-red-500">{errors['description'].message}</p> : null}
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || isResolved}>
              {submitting ? "Saving..." : "Save Issue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ComplianceTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<ComplianceStatus | "">("");
  const [deptFilter, setDeptFilter] = React.useState("");
  const [severityFilter, setSeverityFilter] = React.useState<SeverityLevel | "">("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedIssue, setSelectedIssue] = React.useState<ComplianceIssue | null>(null);

  const isEditor = user?.role.name === "Admin" || user?.role.name === "Asset Manager" || user?.role.name === "Department Head";

  // Fetch Compliance Issues
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["governance-compliance-issues", search, statusFilter, deptFilter, severityFilter],
    queryFn: () => {
      const filters: any = {};
      if (search) filters.search = search;
      if (statusFilter) filters.status = statusFilter;
      if (deptFilter) filters.departmentId = deptFilter;
      if (severityFilter) filters.severity = severityFilter;
      return governanceApi.getComplianceIssues(filters);
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

  // Fetch Audits
  const auditsQuery = useQuery({
    queryKey: ["governance-audits-list"],
    queryFn: () => governanceApi.getAudits(),
  });

  const createMutation = useMutation({
    mutationFn: governanceApi.createComplianceIssue,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["governance-compliance-issues"] });
      void queryClient.invalidateQueries({ queryKey: ["governance-report"] });
      toast({ title: "Success", description: "Compliance issue logged." });
      setDialogOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to log compliance issue." });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ComplianceIssueInput> }) =>
      governanceApi.updateComplianceIssue(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["governance-compliance-issues"] });
      void queryClient.invalidateQueries({ queryKey: ["governance-report"] });
      toast({ title: "Success", description: "Compliance issue updated." });
      setDialogOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to update compliance issue." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: governanceApi.deleteComplianceIssue,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["governance-compliance-issues"] });
      void queryClient.invalidateQueries({ queryKey: ["governance-report"] });
      toast({ title: "Success", description: "Compliance issue deleted." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to delete compliance issue." });
    },
  });

  const handleFormSubmit = async (values: ComplianceIssueInput) => {
    if (selectedIssue) {
      await updateMutation.mutateAsync({ id: selectedIssue.id, input: values });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleResolve = async (issue: ComplianceIssue) => {
    await updateMutation.mutateAsync({ id: issue.id, input: { status: "RESOLVED" } as any });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this compliance issue?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const loading = isLoading || deptsQuery.isLoading || usersQuery.isLoading || auditsQuery.isLoading;
  const isErr = error || deptsQuery.isError || usersQuery.isError || auditsQuery.isError;

  if (loading) return <LoadingState label="Compliance Issues" />;
  if (isErr) {
    const retryAll = () => {
      void refetch();
      void deptsQuery.refetch();
      void usersQuery.refetch();
      void auditsQuery.refetch();
    };
    return <ErrorState message="Failed to load compliance issues." onRetry={retryAll} />;
  }

  const issues = data?.issues ?? [];
  const departments = deptsQuery.data?.departments ?? [];
  const users = usersQuery.data?.users ?? [];
  const audits = auditsQuery.data?.audits ?? [];

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2 max-w-3xl flex-1">
          <Input
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ComplianceStatus | "")}
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="OVERDUE">Overdue</option>
          </Select>
          <Select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as SeverityLevel | "")}
          >
            <option value="">All Severities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
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

        {isEditor && (
          <Button
            onClick={() => {
              setSelectedIssue(null);
              setDialogOpen(true);
            }}
            type="button"
          >
            <Plus className="mr-2 h-4 w-4" /> Log Issue
          </Button>
        )}
      </div>

      {/* Main List */}
      {(() => {
        if (issues.length === 0) {
          const emptyProps: any = {
            title: "No Compliance Issues Found",
            description: "Log governance gaps or audit violations to begin tracking resolution progress."
          };
          if (isEditor) {
            emptyProps.actionLabel = "Log Issue";
            emptyProps.onAction = () => {
              setSelectedIssue(null);
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
                  <TableHead>Owner</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  {isEditor && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {issues.map((i) => {
                  const isResolved = i.status === "RESOLVED";
                  const isOverdue = i.status === "OVERDUE";
                  return (
                    <TableRow key={i.id}>
                      <TableCell className="font-semibold text-slate-900">
                        {i.title}
                        {i.description && <div className="text-xs text-slate-400 font-normal mt-0.5">{i.description}</div>}
                        <div className="text-[10px] text-indigo-600 mt-1 font-medium">Audit: {i.audit.title}</div>
                      </TableCell>
                      <TableCell className="font-medium">{i.department.name}</TableCell>
                      <TableCell className="text-sm">{i.owner.name}</TableCell>
                      <TableCell>
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border",
                            i.severity === "CRITICAL"
                              ? "bg-red-100 text-red-800 border-red-200"
                              : i.severity === "HIGH"
                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                : i.severity === "MEDIUM"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-slate-50 text-slate-600 border-slate-200",
                          ].join(" ")}
                        >
                          {i.severity}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs">
                        <div className="flex items-center gap-1.5 font-mono">
                          <Calendar className="h-3 w-3 shrink-0 text-slate-400" />
                          <span>{new Date(i.dueDate).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border",
                            isResolved
                              ? "bg-green-50 text-green-700 border-green-200"
                              : isOverdue
                                ? "bg-red-50 text-red-700 border-red-200 font-black animate-pulse"
                                : "bg-amber-50 text-amber-700 border-amber-200",
                          ].join(" ")}
                        >
                          {isResolved ? "Resolved" : isOverdue ? "Overdue" : i.status}
                        </span>
                      </TableCell>
                      {isEditor && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            {!isResolved && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  type="button"
                                  onClick={() => void handleResolve(i)}
                                  title="Mark Resolved"
                                  className="text-green-600 hover:text-green-700 border-green-200"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  type="button"
                                  onClick={() => {
                                    setSelectedIssue(i);
                                    setDialogOpen(true);
                                  }}
                                  title="Edit issue"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              onClick={() => void handleDelete(i.id)}
                              title="Delete issue"
                              className="text-red-600 hover:text-red-700"
                              disabled={isResolved}
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

      <IssueFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        departments={departments}
        users={users}
        audits={audits}
        issue={selectedIssue}
        onSubmit={handleFormSubmit}
        submitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
export default ComplianceTab;
