import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2, Calendar, Link, Users, Heart, ShieldAlert } from "lucide-react";
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
import { socialApi, type CsrActivity, type ActivityStatus } from "./social-api";
import { ErrorState, EmptyState, LoadingState } from "../administration/shared-state";
import { z } from "zod";

const csrSchema = z.object({
  title: z.string().min(1, "Title is required.").max(150),
  description: z.string().optional(),
  departmentId: z.string().uuid("Please select a department."),
  categoryId: z.string().uuid("Please select a category."),
  startDate: z.string().min(1, "Start Date is required."),
  endDate: z.string().min(1, "End Date is required."),
  status: z.enum(["PLANNED", "ONGOING", "COMPLETED", "CANCELLED"]),
}).refine(
  (data) => new Date(data.endDate).getTime() >= new Date(data.startDate).getTime(),
  {
    message: "End Date must not precede Start Date.",
    path: ["endDate"],
  }
);

type CsrFormValues = z.infer<typeof csrSchema>;

function CsrFormDialog({
  open,
  onOpenChange,
  departments,
  categories,
  activity,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: { id: string; name: string; code: string }[];
  categories: { id: string; name: string; type: string }[];
  activity?: CsrActivity | null;
  onSubmit: (values: any) => Promise<void>;
  submitting: boolean;
}) {
  const defaultValues: CsrFormValues = {
    title: activity?.title ?? "",
    description: activity?.description ?? "",
    departmentId: activity?.departmentId ?? "",
    categoryId: activity?.categoryId ?? "",
    startDate: activity ? new Date(activity.startDate).toISOString().split("T")[0] ?? "" : "",
    endDate: activity ? new Date(activity.endDate).toISOString().split("T")[0] ?? "" : "",
    status: activity?.status ?? "PLANNED",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CsrFormValues>({
    resolver: zodResolver(csrSchema),
    defaultValues,
  });

  React.useEffect(() => {
    reset(defaultValues);
  }, [activity, open, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const isCompleted = activity && (activity.status === "COMPLETED" || activity.status === "CANCELLED");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{activity ? "Edit CSR Activity" : "Schedule CSR Activity"}</DialogTitle>
          <DialogDescription>
            Configure social engagement scopes and target departments.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="csr-title">Activity Title</Label>
            <Input id="csr-title" placeholder="e.g. Community Reforestation Drive" {...register("title")} disabled={!!isCompleted} />
            {errors['title'] ? <p className="text-sm text-red-500">{errors['title'].message}</p> : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="csr-dept">Department</Label>
              <Select id="csr-dept" {...register("departmentId")} disabled={!!isCompleted}>
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
              <Label htmlFor="csr-cat">Category</Label>
              <Select id="csr-cat" {...register("categoryId")} disabled={!!isCompleted}>
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              {errors['categoryId'] ? <p className="text-sm text-red-500">{errors['categoryId'].message}</p> : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="csr-start">Start Date</Label>
              <Input id="csr-start" type="date" {...register("startDate")} disabled={!!isCompleted} />
              {errors['startDate'] ? <p className="text-sm text-red-500">{errors['startDate'].message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="csr-end">End Date</Label>
              <Input id="csr-end" type="date" {...register("endDate")} disabled={!!isCompleted} />
              {errors['endDate'] ? <p className="text-sm text-red-500">{errors['endDate'].message}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csr-status">Status</Label>
            <Select id="csr-status" {...register("status")} disabled={!!isCompleted}>
              <option value="PLANNED">Planned</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csr-desc">Description</Label>
            <Input id="csr-desc" placeholder="Scope and targets summary" {...register("description")} disabled={!!isCompleted} />
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !!isCompleted}>
              {submitting ? "Saving..." : "Save Activity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CsrTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<ActivityStatus | "">("");
  const [deptFilter, setDeptFilter] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedActivity, setSelectedActivity] = React.useState<CsrActivity | null>(null);

  const isAdminOrHead = user?.role.name === "Admin" || user?.role.name === "Asset Manager" || user?.role.name === "Department Head";

  // Fetch CSR Activities
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["social-activities", search, statusFilter, deptFilter],
    queryFn: () => {
      const filters: any = {};
      if (search) filters.search = search;
      if (statusFilter) filters.status = statusFilter;
      if (deptFilter) filters.departmentId = deptFilter;
      return socialApi.getActivities(filters);
    },
  });

  // Fetch Departments
  const deptsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: () => administrationApi.getDepartments(),
  });

  // Fetch Categories of type GENERAL / CSR_ACTIVITY
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => administrationApi.getCategories(),
  });

  // Fetch my CSR participations to show join state
  const myParticipationsQuery = useQuery({
    queryKey: ["my-participations", user?.id],
    queryFn: () => {
      if (!user) return { participations: [] };
      return socialApi.getParticipations({ userId: user.id });
    },
  });

  const createMutation = useMutation({
    mutationFn: socialApi.createActivity,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["social-activities"] });
      void queryClient.invalidateQueries({ queryKey: ["social-report"] });
      toast({ title: "Success", description: "CSR Activity created." });
      setDialogOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to create activity." });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: any }) => socialApi.updateActivity(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["social-activities"] });
      void queryClient.invalidateQueries({ queryKey: ["social-report"] });
      toast({ title: "Success", description: "CSR Activity updated." });
      setDialogOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to update activity." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: socialApi.deleteActivity,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["social-activities"] });
      void queryClient.invalidateQueries({ queryKey: ["social-report"] });
      toast({ title: "Success", description: "CSR Activity deleted." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to delete activity." });
    },
  });

  const joinMutation = useMutation({
    mutationFn: socialApi.joinActivity,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["social-activities"] });
      void queryClient.invalidateQueries({ queryKey: ["my-participations"] });
      void queryClient.invalidateQueries({ queryKey: ["social-report"] });
      toast({ title: "Success", description: "Joined activity successfully." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to join activity." });
    },
  });

  const handleFormSubmit = async (values: any) => {
    if (selectedActivity) {
      await updateMutation.mutateAsync({ id: selectedActivity.id, input: values });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this CSR activity?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleJoin = async (id: string) => {
    await joinMutation.mutateAsync(id);
  };

  const loading = isLoading || deptsQuery.isLoading || categoriesQuery.isLoading || myParticipationsQuery.isLoading;
  const isErr = error || deptsQuery.isError || categoriesQuery.isError || myParticipationsQuery.isError;

  if (loading) return <LoadingState label="CSR Activities" />;
  if (isErr) {
    const retryAll = () => {
      void refetch();
      void deptsQuery.refetch();
      void categoriesQuery.refetch();
      void myParticipationsQuery.refetch();
    };
    return <ErrorState message="Failed to load CSR activities." onRetry={retryAll} />;
  }

  const activities = data?.activities ?? [];
  const departments = deptsQuery.data?.departments ?? [];
  // Filter categories to only allow CSR_ACTIVITY or GENERAL for CSR Activity creation
  const categories = (categoriesQuery.data?.categories ?? []).filter(
    (c) => c.type === "CSR_ACTIVITY" || c.type === "GENERAL"
  );
  const myParticipations = myParticipationsQuery.data?.participations ?? [];

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2 max-w-2xl flex-1">
          <Input
            placeholder="Search CSR activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ActivityStatus | "")}
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

        {isAdminOrHead && (
          <Button
            onClick={() => {
              setSelectedActivity(null);
              setDialogOpen(true);
            }}
            type="button"
          >
            <Plus className="mr-2 h-4 w-4" /> Schedule CSR
          </Button>
        )}
      </div>

      {/* Main List */}
      {(() => {
        if (activities.length === 0) {
          const emptyProps: any = {
            title: "No CSR Activities",
            description: "No Corporate Social Responsibility activities scheduled for this organization."
          };
          if (isAdminOrHead) {
            emptyProps.actionLabel = "Schedule Activity";
            emptyProps.onAction = () => {
              setSelectedActivity(null);
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
                  <TableHead>CSR Activity</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Participations</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((a) => {
                  const isCompleted = a.status === "COMPLETED" || a.status === "CANCELLED";
                  
                  // Check if current user is already participating
                  const myPart = myParticipations.find((p) => p.activityId === a.id);
                  const isJoined = !!myPart;

                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-semibold text-slate-900">
                        {a.title}
                        {a.description && <div className="text-xs text-slate-400 font-normal mt-0.5">{a.description}</div>}
                      </TableCell>
                      <TableCell className="font-medium text-sm">{a.department.name}</TableCell>
                      <TableCell className="text-slate-600 text-sm">{a.category.name}</TableCell>
                      <TableCell className="text-slate-500 text-xs font-mono">
                        {new Date(a.startDate).toLocaleDateString()} - {new Date(a.endDate).toLocaleDateString()}
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
                        <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          {a._count?.participants ?? 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          {/* Join Option for Employees */}
                          {!isJoined && !isCompleted && (
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold text-xs"
                              type="button"
                              onClick={() => void handleJoin(a.id)}
                            >
                              Join
                            </Button>
                          )}
                          
                          {isJoined && (
                            <span
                              className={[
                                "inline-flex items-center rounded px-2.5 py-1 text-xs font-semibold border",
                                myPart.approvalStatus === "APPROVED"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : myPart.approvalStatus === "PENDING"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-red-50 text-red-700 border-red-200",
                              ].join(" ")}
                            >
                              {myPart.approvalStatus === "APPROVED" ? "Approved" : myPart.approvalStatus === "PENDING" ? "Joined" : "Rejected"}
                            </span>
                          )}

                          {isAdminOrHead && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                type="button"
                                onClick={() => {
                                  setSelectedActivity(a);
                                  setDialogOpen(true);
                                }}
                                disabled={isCompleted}
                                title="Edit activity"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                type="button"
                                onClick={() => void handleDelete(a.id)}
                                title="Delete activity"
                                className="text-red-600 hover:text-red-700"
                                disabled={isCompleted}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        );
      })()}

      <CsrFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        departments={departments}
        categories={categories}
        activity={selectedActivity}
        onSubmit={handleFormSubmit}
        submitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
export default CsrTab;
