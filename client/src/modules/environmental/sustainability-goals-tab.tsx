import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Pencil, Plus, Trash2, Calendar, Target } from "lucide-react";
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
import { environmentalApi, type EnvironmentalGoal, type EnvironmentalGoalInput, type GoalStatus } from "./environmental-api";
import { ErrorState, EmptyState, LoadingState } from "../administration/shared-state";
import { z } from "zod";

const goalSchema = z.object({
  departmentId: z.string().uuid("Please select a department."),
  title: z.string().min(1, "Title is required."),
  targetValue: z.coerce.number().gt(0, "Target value must be positive."),
  deadline: z.string().min(1, "Please select a deadline date."),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "COMPLETED"]),
});

type GoalFormValues = z.infer<typeof goalSchema>;

function GoalFormDialog({
  open,
  onOpenChange,
  departments,
  goal,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: { id: string; name: string; code: string }[];
  goal?: EnvironmentalGoal | null;
  onSubmit: (values: EnvironmentalGoalInput) => Promise<void>;
  submitting: boolean;
}) {
  const defaultValues: GoalFormValues = {
    departmentId: goal?.departmentId ?? "",
    title: goal?.title ?? "",
    targetValue: goal ? Number(goal.targetValue) : 1000,
    deadline: goal ? (new Date(goal.deadline).toISOString().split("T")[0] ?? "") : "",
    description: goal?.description ?? "",
    status: goal?.status ?? "ACTIVE",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues,
  });

  React.useEffect(() => {
    reset(defaultValues);
  }, [goal, open, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      departmentId: values['departmentId'],
      title: values['title'],
      targetValue: values['targetValue'],
      deadline: values['deadline'],
      description: values['description'] || null,
      status: values['status'],
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{goal ? "Edit Sustainability Goal" : "Create Sustainability Goal"}</DialogTitle>
          <DialogDescription>
            Define environmental targets for specific departments.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="goal-dept">Department</Label>
            <Select id="goal-dept" {...register("departmentId")} disabled={!!goal}>
              <option value="">Select Department...</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </Select>
            {errors['departmentId'] ? <p className="text-sm text-red-500">{errors['departmentId'].message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-title">Goal Title</Label>
            <Input id="goal-title" placeholder="e.g. Q3 Carbon Reduction Cap" {...register("title")} />
            {errors['title'] ? <p className="text-sm text-red-500">{errors['title'].message}</p> : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goal-target">Target CO₂ limit (kg CO₂)</Label>
              <Input id="goal-target" type="number" step="any" {...register("targetValue")} />
              {errors['targetValue'] ? <p className="text-sm text-red-500">{errors['targetValue'].message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-deadline">Deadline</Label>
              <Input id="goal-deadline" type="date" {...register("deadline")} />
              {errors['deadline'] ? <p className="text-sm text-red-500">{errors['deadline'].message}</p> : null}
            </div>
          </div>

          {goal && (
            <div className="space-y-2">
              <Label htmlFor="goal-status">Status</Label>
              <Select id="goal-status" {...register("status")}>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="goal-desc">Description</Label>
            <Input id="goal-desc" placeholder="Goal details" {...register("description")} />
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SustainabilityGoalsTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedGoal, setSelectedGoal] = React.useState<EnvironmentalGoal | null>(null);

  const isAdminOrAssetOrHead = user?.role.name === "Admin" || user?.role.name === "Asset Manager" || user?.role.name === "Department Head";

  // Fetch Report (for progress and chart comparison)
  const reportQuery = useQuery({
    queryKey: ["environment-report"],
    queryFn: () => environmentalApi.getEnvironmentReport(),
  });

  // Fetch Departments
  const deptsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: () => administrationApi.getDepartments(),
  });

  // Fetch Goals
  const goalsQuery = useQuery({
    queryKey: ["environmental-goals"],
    queryFn: () => environmentalApi.getEnvironmentalGoals(),
  });

  const createMutation = useMutation({
    mutationFn: environmentalApi.createEnvironmentalGoal,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["environmental-goals"] });
      void queryClient.invalidateQueries({ queryKey: ["environment-report"] });
      toast({ title: "Success", description: "Goal created successfully." });
      setDialogOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to create goal." });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<EnvironmentalGoalInput> }) =>
      environmentalApi.updateEnvironmentalGoal(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["environmental-goals"] });
      void queryClient.invalidateQueries({ queryKey: ["environment-report"] });
      toast({ title: "Success", description: "Goal updated successfully." });
      setDialogOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to update goal." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: environmentalApi.deleteEnvironmentalGoal,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["environmental-goals"] });
      void queryClient.invalidateQueries({ queryKey: ["environment-report"] });
      toast({ title: "Success", description: "Goal deleted successfully." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to delete goal." });
    },
  });

  const handleFormSubmit = async (values: EnvironmentalGoalInput) => {
    if (selectedGoal) {
      await updateMutation.mutateAsync({ id: selectedGoal.id, input: values });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleMarkComplete = async (goal: EnvironmentalGoal) => {
    await updateMutation.mutateAsync({ id: goal.id, input: { status: "COMPLETED" } });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this sustainability goal?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const isLoading = goalsQuery.isLoading || deptsQuery.isLoading || reportQuery.isLoading;
  const isError = goalsQuery.isError || deptsQuery.isError || reportQuery.isError;

  if (isLoading) return <LoadingState label="Sustainability Goals" />;
  if (isError) {
    const retryAll = () => {
      void goalsQuery.refetch();
      void deptsQuery.refetch();
      void reportQuery.refetch();
    };
    return <ErrorState message="Failed to load goals data." onRetry={retryAll} />;
  }

  const rawGoals = goalsQuery.data?.environmentalGoals ?? [];
  const departments = deptsQuery.data?.departments ?? [];
  const reportGoals = reportQuery.data?.goalProgress ?? [];

  // Integrate current emissions stats into the goals list
  const goals = rawGoals.map((g) => {
    const matchedReportGoal = reportGoals.find((rg) => rg.id === g.id);
    return {
      ...g,
      currentEmissions: matchedReportGoal?.currentEmissions ?? 0,
      progress: matchedReportGoal?.progress ?? 0,
    };
  });

  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.status === "COMPLETED").length;
  const activeGoals = totalGoals - completedGoals;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-500 font-medium">Total Goals</CardDescription>
            <CardTitle className="text-3xl font-bold text-slate-900">{totalGoals}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500 flex items-center gap-1 mt-2">
            <Target className="h-3 w-3" /> Configured targets
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-500 font-medium">Active Targets</CardDescription>
            <CardTitle className="text-3xl font-bold text-blue-600">{activeGoals}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500 flex items-center gap-1 mt-2">
            <Calendar className="h-3 w-3" /> Monitoring operational limits
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-500 font-medium">Completed Targets</CardDescription>
            <CardTitle className="text-3xl font-bold text-green-600">{completedGoals}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500 flex items-center gap-1 mt-2">
            <CheckCircle2 className="h-3 w-3 text-green-500" /> Successfully closed goals
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      {isAdminOrAssetOrHead && (
        <div className="flex justify-end">
          <Button
            onClick={() => {
              setSelectedGoal(null);
              setDialogOpen(true);
            }}
            type="button"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Goal
          </Button>
        </div>
      )}

      {/* Goals Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">Goals & Target Thresholds</CardTitle>
          <CardDescription>
            Carbon emissions progress vs target limits set for each department.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            if (goals.length === 0) {
              const emptyProps: any = {
                title: "No Sustainability Goals Defined",
                description: "Define a carbon cap goal for your departments to start measuring success."
              };
              if (isAdminOrAssetOrHead) {
                emptyProps.actionLabel = "Create Goal";
                emptyProps.onAction = () => {
                  setSelectedGoal(null);
                  setDialogOpen(true);
                };
              }
              return <EmptyState {...emptyProps} />;
            }
            return (
            <div className="rounded-md border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Goal Title</TableHead>
                    <TableHead>Target Limit</TableHead>
                    <TableHead>Progress Bar (Emissions vs Target)</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdminOrAssetOrHead && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {goals.map((g) => {
                    const isCompleted = g.status === "COMPLETED";
                    const isOverLimit = g.currentEmissions > Number(g.targetValue);
                    
                    return (
                      <TableRow key={g.id}>
                        <TableCell className="font-semibold text-slate-900">
                          {g.department.name} ({g.department.code})
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{g.title}</div>
                          {g.description && <div className="text-xs text-slate-400 mt-0.5">{g.description}</div>}
                        </TableCell>
                        <TableCell className="font-mono font-medium">
                          {Number(g.targetValue).toLocaleString()} kg CO₂
                        </TableCell>
                        <TableCell className="w-1/4">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-slate-500">
                              <span>{g.currentEmissions.toLocaleString()} kg CO₂</span>
                              <span className={isOverLimit ? "text-red-500 font-semibold" : ""}>
                                {g.progress.toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                              <div
                                className={[
                                  "h-full rounded-full transition-all duration-500",
                                  isOverLimit ? "bg-red-500" : g.progress > 85 ? "bg-amber-500" : "bg-blue-500",
                                ].join(" ")}
                                style={{ width: `${g.progress}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {new Date(g.deadline).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border",
                              isCompleted
                                ? "bg-green-50 text-green-700 border-green-200"
                                : isOverLimit
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200",
                            ].join(" ")}
                          >
                            {isCompleted ? "Completed" : isOverLimit ? "Over Limit" : "Active"}
                          </span>
                        </TableCell>
                        {isAdminOrAssetOrHead && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1.5">
                              {!isCompleted && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    type="button"
                                    onClick={() => void handleMarkComplete(g)}
                                    title="Mark complete"
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    type="button"
                                    onClick={() => {
                                      setSelectedGoal(g);
                                      setDialogOpen(true);
                                    }}
                                    title="Edit goal"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                type="button"
                                onClick={() => void handleDelete(g.id)}
                                title="Delete goal"
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
        </CardContent>
      </Card>

      <GoalFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        departments={departments}
        goal={selectedGoal}
        onSubmit={handleFormSubmit}
        submitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
