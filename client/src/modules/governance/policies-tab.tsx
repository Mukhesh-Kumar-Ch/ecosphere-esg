import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Pencil, Plus, Trash2, Calendar, ShieldCheck } from "lucide-react";
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
import { governanceApi, type Policy, type PolicyInput, type PolicyStatus } from "./governance-api";
import { ErrorState, EmptyState, LoadingState } from "../administration/shared-state";
import { z } from "zod";

const policySchema = z.object({
  title: z.string().min(1, "Title is required.").max(200),
  description: z.string().optional(),
  version: z.string().min(1, "Version is required.").max(20),
  effectiveDate: z.string().min(1, "Please select an effective date."),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
});

type PolicyFormValues = z.infer<typeof policySchema>;

function PolicyFormDialog({
  open,
  onOpenChange,
  policy,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy?: Policy | null;
  onSubmit: (values: PolicyInput) => Promise<void>;
  submitting: boolean;
}) {
  const defaultValues: PolicyFormValues = {
    title: policy?.title ?? "",
    description: policy?.description ?? "",
    version: policy?.version ?? "",
    effectiveDate: policy ? new Date(policy.effectiveDate).toISOString().split("T")[0] ?? "" : "",
    status: policy?.status ?? "ACTIVE",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PolicyFormValues>({
    resolver: zodResolver(policySchema),
    defaultValues,
  });

  React.useEffect(() => {
    reset(defaultValues);
  }, [policy, open, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      title: values['title'],
      description: values['description'] || null,
      version: values['version'],
      effectiveDate: values['effectiveDate'],
      status: values['status'],
    });
  });

  const isPublished = !!(policy && (policy.status === "ACTIVE" || policy.status === "ARCHIVED"));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{policy ? "Edit ESG Policy" : "Publish ESG Policy"}</DialogTitle>
          <DialogDescription>
            Configure policy guidelines and compliance requirements.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="policy-title">Policy Title</Label>
            <Input 
              id="policy-title" 
              placeholder="e.g. Code of Environmental Ethics" 
              {...register("title")} 
              disabled={isPublished}
            />
            {errors['title'] ? <p className="text-sm text-red-500">{errors['title'].message}</p> : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="policy-version">Version</Label>
              <Input 
                id="policy-version" 
                placeholder="e.g. v1.0" 
                {...register("version")} 
                disabled={isPublished}
              />
              {errors['version'] ? <p className="text-sm text-red-500">{errors['version'].message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="policy-date">Effective Date</Label>
              <Input 
                id="policy-date" 
                type="date" 
                {...register("effectiveDate")} 
                disabled={isPublished}
              />
              {errors['effectiveDate'] ? <p className="text-sm text-red-500">{errors['effectiveDate'].message}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="policy-status">Status</Label>
            <Select id="policy-status" {...register("status")}>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="policy-desc">Description</Label>
            <Input 
              id="policy-desc" 
              placeholder="Summary of terms" 
              {...register("description")} 
              disabled={isPublished}
            />
          </div>

          {isPublished && (
            <div className="p-3 bg-amber-50 rounded border border-amber-200 text-xs text-amber-800 flex gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Published policies are read-only. Only the status may be modified to archive or toggle states.</span>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Policy"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PoliciesTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<PolicyStatus | "">("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedPolicy, setSelectedPolicy] = React.useState<Policy | null>(null);

  const isAdminOrAssetManager = user?.role.name === "Admin" || user?.role.name === "Asset Manager";

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["governance-policies", search, statusFilter],
    queryFn: () => {
      const filters: any = {};
      if (search) filters.search = search;
      if (statusFilter) filters.status = statusFilter;
      return governanceApi.getPolicies(filters);
    },
  });

  const createMutation = useMutation({
    mutationFn: governanceApi.createPolicy,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["governance-policies"] });
      void queryClient.invalidateQueries({ queryKey: ["governance-report"] });
      toast({ title: "Success", description: "Policy created successfully." });
      setDialogOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to create policy." });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<PolicyInput> }) =>
      governanceApi.updatePolicy(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["governance-policies"] });
      void queryClient.invalidateQueries({ queryKey: ["governance-report"] });
      toast({ title: "Success", description: "Policy updated successfully." });
      setDialogOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to update policy." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: governanceApi.deletePolicy,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["governance-policies"] });
      void queryClient.invalidateQueries({ queryKey: ["governance-report"] });
      toast({ title: "Success", description: "Policy deleted successfully." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to delete policy." });
    },
  });

  const handleFormSubmit = async (values: PolicyInput) => {
    if (selectedPolicy) {
      await updateMutation.mutateAsync({ id: selectedPolicy.id, input: values });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this ESG policy?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (isLoading) return <LoadingState label="ESG Policies" />;
  if (error) return <ErrorState message="Failed to load policies." onRetry={refetch} />;

  const policies = data?.policies ?? [];

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 gap-2 max-w-md">
          <Input
            placeholder="Search policies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PolicyStatus | "")}
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
        </div>

        {isAdminOrAssetManager && (
          <Button
            onClick={() => {
              setSelectedPolicy(null);
              setDialogOpen(true);
            }}
            type="button"
          >
            <Plus className="mr-2 h-4 w-4" /> Publish Policy
          </Button>
        )}
      </div>

      {/* Main List */}
      {(() => {
        if (policies.length === 0) {
          const emptyProps: any = {
            title: "No Policies Configured",
            description: "Publish ESG guidelines and policies for employees to review and acknowledge."
          };
          if (isAdminOrAssetManager) {
            emptyProps.actionLabel = "Publish Policy";
            emptyProps.onAction = () => {
              setSelectedPolicy(null);
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
                  <TableHead>Version</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published By</TableHead>
                  {isAdminOrAssetManager && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((p) => {
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-semibold text-slate-900">
                        {p.title}
                        {p.description && <div className="text-xs text-slate-400 font-normal mt-0.5">{p.description}</div>}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{p.version}</TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {new Date(p.effectiveDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border",
                            p.status === "ACTIVE"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : p.status === "ARCHIVED"
                                ? "bg-slate-50 text-slate-600 border-slate-200"
                                : "bg-amber-50 text-amber-700 border-amber-200",
                          ].join(" ")}
                        >
                          {p.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">{p.creator.name}</TableCell>
                      {isAdminOrAssetManager && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              onClick={() => {
                                setSelectedPolicy(p);
                                setDialogOpen(true);
                              }}
                              title="Edit policy"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              onClick={() => void handleDelete(p.id)}
                              title="Delete policy"
                              className="text-red-600 hover:text-red-700"
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

      <PolicyFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        policy={selectedPolicy}
        onSubmit={handleFormSubmit}
        submitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
