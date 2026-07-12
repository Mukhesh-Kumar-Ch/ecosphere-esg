import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2, Calendar, Target, CheckCircle2, ChevronRight, Award } from "lucide-react";
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
import { socialApi, type Challenge, type ChallengeStatus, type DifficultyLevel } from "./social-api";
import { ErrorState, EmptyState, LoadingState } from "../administration/shared-state";
import { z } from "zod";

const challengeSchema = z.object({
  title: z.string().min(1, "Title is required.").max(150),
  description: z.string().optional(),
  categoryId: z.string().uuid("Please select a category."),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  xpReward: z.coerce.number().int().gt(0, "XP Reward must be positive."),
  deadline: z.string().min(1, "Deadline date is required."),
  evidenceRequired: z.boolean().default(false),
  status: z.enum(["DRAFT", "ACTIVE", "UNDER_REVIEW", "COMPLETED", "ARCHIVED"]),
});

type ChallengeFormValues = z.infer<typeof challengeSchema>;

function ChallengeFormDialog({
  open,
  onOpenChange,
  categories,
  challenge,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: { id: string; name: string; type: string }[];
  challenge?: Challenge | null;
  onSubmit: (values: any) => Promise<void>;
  submitting: boolean;
}) {
  const defaultValues: ChallengeFormValues = {
    title: challenge?.title ?? "",
    description: challenge?.description ?? "",
    categoryId: challenge?.categoryId ?? "",
    difficulty: challenge?.difficulty ?? "MEDIUM",
    xpReward: challenge?.xpReward ?? 100,
    deadline: challenge ? new Date(challenge.deadline).toISOString().split("T")[0] ?? "" : "",
    evidenceRequired: challenge?.evidenceRequired ?? false,
    status: challenge?.status ?? "DRAFT",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChallengeFormValues>({
    resolver: zodResolver(challengeSchema),
    defaultValues,
  });

  React.useEffect(() => {
    reset(defaultValues);
  }, [challenge, open, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const isCompleted = challenge && challenge.status === "COMPLETED";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{challenge ? "Edit Sustainability Challenge" : "Create Sustainability Challenge"}</DialogTitle>
          <DialogDescription>
            Configure sustainability goals, XP rewards, and target categories.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="ch-title">Challenge Title</Label>
            <Input id="ch-title" placeholder="e.g. Single-Use Plastic Ban Week" {...register("title")} disabled={!!isCompleted} />
            {errors['title'] ? <p className="text-sm text-red-500">{errors['title'].message}</p> : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ch-cat">Category</Label>
              <Select id="ch-cat" {...register("categoryId")} disabled={!!isCompleted}>
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              {errors['categoryId'] ? <p className="text-sm text-red-500">{errors['categoryId'].message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ch-diff">Difficulty</Label>
              <Select id="ch-diff" {...register("difficulty")} disabled={!!isCompleted}>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ch-xp">XP Reward</Label>
              <Input id="ch-xp" type="number" step="1" {...register("xpReward")} disabled={!!isCompleted} />
              {errors['xpReward'] ? <p className="text-sm text-red-500">{errors['xpReward'].message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ch-deadline">Deadline</Label>
              <Input id="ch-deadline" type="date" {...register("deadline")} disabled={!!isCompleted} />
              {errors['deadline'] ? <p className="text-sm text-red-500">{errors['deadline'].message}</p> : null}
            </div>
          </div>

          <div className="flex items-center gap-2 py-2">
            <input id="ch-evidence" type="checkbox" {...register("evidenceRequired")} disabled={!!isCompleted} className="rounded border-slate-350" />
            <Label htmlFor="ch-evidence" className="text-sm">Require evidence proof files from employees</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ch-status">Status</Label>
            <Select id="ch-status" {...register("status")}>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ch-desc">Description</Label>
            <Input id="ch-desc" placeholder="Challenge terms and requirements summary" {...register("description")} disabled={!!isCompleted} />
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              Save Challenge
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProgressDialog({
  open,
  onOpenChange,
  currentProgress,
  evidenceRequired,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProgress: number;
  evidenceRequired: boolean;
  onSubmit: (progress: number, proofFile?: string) => Promise<void>;
  submitting: boolean;
}) {
  const [progress, setProgress] = React.useState(currentProgress);
  const [proof, setProof] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setProgress(currentProgress);
      setProof("");
    }
  }, [open, currentProgress]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (progress === 100 && evidenceRequired && !proof.trim()) {
      alert("Proof file URL is required to complete this challenge.");
      return;
    }
    await onSubmit(progress, proof.trim() ? proof : undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Challenge Progress</DialogTitle>
          <DialogDescription>
            Adjust your completion progress and submit evidence if completing the goal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between font-semibold">
              <Label htmlFor="ch-progress-slider">Current Progress</Label>
              <span className="font-mono text-indigo-600 font-bold">{progress}%</span>
            </div>
            <Input
              id="ch-progress-slider"
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
            />
          </div>

          {progress === 100 && evidenceRequired && (
            <div className="space-y-2">
              <Label htmlFor="ch-proof-input">Proof File URL (Required)</Label>
              <Input
                id="ch-proof-input"
                placeholder="e.g. https://files.company.com/proof/doc1.pdf"
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                required
              />
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Updating..." : "Update Progress"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ChallengesTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<ChallengeStatus | "">("");
  const [categoryFilter, setCategoryFilter] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [progressDialogOpen, setProgressDialogOpen] = React.useState(false);
  const [selectedChallenge, setSelectedChallenge] = React.useState<Challenge | null>(null);

  const isAdminOrHead = user?.role.name === "Admin" || user?.role.name === "Asset Manager" || user?.role.name === "Department Head";

  // Fetch Challenges
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["social-challenges", search, statusFilter, categoryFilter],
    queryFn: () => {
      const filters: any = {};
      if (search) filters.search = search;
      if (statusFilter) filters.status = statusFilter;
      if (categoryFilter) filters.categoryId = categoryFilter;
      return socialApi.getChallenges(filters);
    },
  });

  // Fetch Categories of type CHALLENGE
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => administrationApi.getCategories(),
  });

  // Fetch my challenge participations
  const myParticipationsQuery = useQuery({
    queryKey: ["my-challenge-participations", user?.id],
    queryFn: () => {
      if (!user) return { participations: [] };
      return socialApi.getChallengeParticipations({ userId: user.id });
    },
  });

  const createMutation = useMutation({
    mutationFn: socialApi.createChallenge,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["social-challenges"] });
      void queryClient.invalidateQueries({ queryKey: ["social-report"] });
      toast({ title: "Success", description: "Sustainability challenge created." });
      setDialogOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to create challenge." });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: any }) => socialApi.updateChallenge(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["social-challenges"] });
      void queryClient.invalidateQueries({ queryKey: ["social-report"] });
      toast({ title: "Success", description: "Sustainability challenge updated." });
      setDialogOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to update challenge." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: socialApi.deleteChallenge,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["social-challenges"] });
      void queryClient.invalidateQueries({ queryKey: ["social-report"] });
      toast({ title: "Success", description: "Sustainability challenge deleted." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to delete challenge." });
    },
  });

  const joinMutation = useMutation({
    mutationFn: socialApi.joinChallenge,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["social-challenges"] });
      void queryClient.invalidateQueries({ queryKey: ["my-challenge-participations"] });
      void queryClient.invalidateQueries({ queryKey: ["social-report"] });
      toast({ title: "Success", description: "Joined challenge! Go crush it!" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to join challenge." });
    },
  });

  const progressMutation = useMutation({
    mutationFn: ({ id, progress, proofFile }: { id: string; progress: number; proofFile?: string }) =>
      socialApi.updateChallengeProgress(id, progress, proofFile),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["social-challenges"] });
      void queryClient.invalidateQueries({ queryKey: ["my-challenge-participations"] });
      void queryClient.invalidateQueries({ queryKey: ["social-report"] });
      void queryClient.invalidateQueries({ queryKey: ["my-xp"] });
      void queryClient.invalidateQueries({ queryKey: ["governance-report"] }); // invalidate reports
      toast({ title: "Success", description: "Challenge progress updated." });
      setProgressDialogOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to update challenge progress." });
    },
  });

  const handleFormSubmit = async (values: any) => {
    if (selectedChallenge) {
      await updateMutation.mutateAsync({ id: selectedChallenge.id, input: values });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this challenge?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleJoin = async (id: string) => {
    await joinMutation.mutateAsync(id);
  };

  const handleProgressUpdate = async (progress: number, proofFile?: string) => {
    if (selectedChallenge) {
      const input: any = { id: selectedChallenge.id, progress };
      if (proofFile !== undefined) {
        input.proofFile = proofFile;
      }
      await progressMutation.mutateAsync(input);
    }
  };

  const loading = isLoading || categoriesQuery.isLoading || myParticipationsQuery.isLoading;
  const isErr = error || categoriesQuery.isError || myParticipationsQuery.isError;

  if (loading) return <LoadingState label="Challenges List" />;
  if (isErr) {
    const retryAll = () => {
      void refetch();
      void categoriesQuery.refetch();
      void myParticipationsQuery.refetch();
    };
    return <ErrorState message="Failed to load challenges." onRetry={retryAll} />;
  }

  const challenges = data?.challenges ?? [];
  const categories = (categoriesQuery.data?.categories ?? []).filter(
    (c) => c.type === "CHALLENGE" || c.type === "GENERAL"
  );
  const myParticipations = myParticipationsQuery.data?.participations ?? [];

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2 max-w-2xl flex-1">
          <Input
            placeholder="Search sustainability challenges..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ChallengeStatus | "")}
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        {isAdminOrHead && (
          <Button
            onClick={() => {
              setSelectedChallenge(null);
              setDialogOpen(true);
            }}
            type="button"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Challenge
          </Button>
        )}
      </div>

      {/* Main List */}
      {(() => {
        if (challenges.length === 0) {
          const emptyProps: any = {
            title: "No Challenges Active",
            description: "Check back later for active corporate challenges and tasks."
          };
          if (isAdminOrHead) {
            emptyProps.actionLabel = "Create Challenge";
            emptyProps.onAction = () => {
              setSelectedChallenge(null);
              setDialogOpen(true);
            };
          }
          return <EmptyState {...emptyProps} />;
        }

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((c) => {
              const isCompleted = c.status === "COMPLETED" || c.status === "ARCHIVED";
              const myPart = myParticipations.find((p) => p.challengeId === c.id);
              const isJoined = !!myPart;

              return (
                <Card key={c.id} className="relative hover:shadow-md transition">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <span className={[
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border",
                        c.difficulty === "HARD"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : c.difficulty === "MEDIUM"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-green-50 text-green-700 border-green-200"
                      ].join(" ")}>
                        {c.difficulty}
                      </span>
                      <span className="font-mono text-xs bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-indigo-700 font-bold flex items-center gap-1">
                        <Award className="h-3.5 w-3.5" /> {c.xpReward} XP
                      </span>
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-900 mt-2">{c.title}</CardTitle>
                    {c.description && <CardDescription className="text-sm mt-1">{c.description}</CardDescription>}
                  </CardHeader>

                  <CardContent className="space-y-4 pb-4">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Deadline: {new Date(c.deadline).toLocaleDateString()}</span>
                      <span className="capitalize">Status: {c.status.toLowerCase()}</span>
                    </div>

                    {isJoined && (
                      <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-indigo-700">My Progress</span>
                          <span className="font-mono font-bold text-indigo-700">{myPart.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${myPart.progress}%` }} />
                        </div>
                        {myPart.approvalStatus !== "PENDING" && (
                          <div className="text-[10px] text-slate-400 font-medium">Status: {myPart.approvalStatus}</div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2">
                      <div className="flex gap-1.5">
                        {isAdminOrHead && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              onClick={() => {
                                setSelectedChallenge(c);
                                setDialogOpen(true);
                              }}
                              disabled={isCompleted}
                              title="Edit challenge"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              onClick={() => void handleDelete(c.id)}
                              title="Delete challenge"
                              className="text-red-600 hover:text-red-700"
                              disabled={isCompleted}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>

                      {/* Action buttons */}
                      {!isJoined && !isCompleted && (
                        <Button
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                          type="button"
                          onClick={() => void handleJoin(c.id)}
                        >
                          Accept Challenge
                        </Button>
                      )}

                      {isJoined && !myPart.completedAt && !isCompleted && (
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          onClick={() => {
                            setSelectedChallenge(c);
                            setProgressDialogOpen(true);
                          }}
                        >
                          Update Progress
                        </Button>
                      )}

                      {isJoined && myPart.completedAt && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded px-2.5 py-1">
                          <CheckCircle2 className="h-4 w-4" /> Completed
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        );
      })()}

      <ChallengeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories}
        challenge={selectedChallenge}
        onSubmit={handleFormSubmit}
        submitting={createMutation.isPending || updateMutation.isPending}
      />

      <ProgressDialog
        open={progressDialogOpen}
        onOpenChange={setProgressDialogOpen}
        currentProgress={selectedChallenge ? myParticipations.find((p) => p.challengeId === selectedChallenge.id)?.progress ?? 0 : 0}
        evidenceRequired={selectedChallenge?.evidenceRequired ?? false}
        onSubmit={handleProgressUpdate}
        submitting={progressMutation.isPending}
      />
    </div>
  );
}
export default ChallengesTab;
