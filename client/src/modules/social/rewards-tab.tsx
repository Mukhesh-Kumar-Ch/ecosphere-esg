import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2, Award, Coins, ShoppingBag, Check } from "lucide-react";
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
import { socialApi, type Reward } from "./social-api";
import { ErrorState, EmptyState, LoadingState } from "../administration/shared-state";
import { z } from "zod";

const rewardSchema = z.object({
  name: z.string().min(1, "Name is required.").max(100),
  description: z.string().optional(),
  pointsRequired: z.coerce.number().int().gt(0, "Points Required must be positive."),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

type RewardFormValues = z.infer<typeof rewardSchema>;

function RewardFormDialog({
  open,
  onOpenChange,
  reward,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reward?: Reward | null;
  onSubmit: (values: any) => Promise<void>;
  submitting: boolean;
}) {
  const defaultValues: RewardFormValues = {
    name: reward?.name ?? "",
    description: reward?.description ?? "",
    pointsRequired: reward?.pointsRequired ?? 100,
    stock: reward?.stock ?? 10,
    status: (reward?.status ?? "ACTIVE") as any,
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RewardFormValues>({
    resolver: zodResolver(rewardSchema),
    defaultValues,
  });

  React.useEffect(() => {
    reset(defaultValues);
  }, [reward, open, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{reward ? "Edit Reward" : "Create Reward"}</DialogTitle>
          <DialogDescription>
            Configure reward redemption values and stock details.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="rw-name">Reward Name</Label>
            <Input id="rw-name" placeholder="e.g. Eco Reusable Water Bottle" {...register("name")} />
            {errors['name'] ? <p className="text-sm text-red-500">{errors['name'].message}</p> : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rw-points">XP Points Required</Label>
              <Input id="rw-points" type="number" step="1" {...register("pointsRequired")} />
              {errors['pointsRequired'] ? <p className="text-sm text-red-500">{errors['pointsRequired'].message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rw-stock">Stock Available</Label>
              <Input id="rw-stock" type="number" step="1" {...register("stock")} />
              {errors['stock'] ? <p className="text-sm text-red-500">{errors['stock'].message}</p> : null}
            </div>
          </div>

          {reward && (
            <div className="space-y-2">
              <Label htmlFor="rw-status">Status</Label>
              <Select id="rw-status" {...register("status")}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="rw-desc">Description</Label>
            <Input id="rw-desc" placeholder="Details of physical or digital item" {...register("description")} />
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              Save Reward
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RewardsTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedReward, setSelectedReward] = React.useState<Reward | null>(null);

  const isAdmin = user?.role.name === "Admin" || user?.role.name === "Asset Manager";

  // Fetch Rewards
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["social-rewards"],
    queryFn: () => socialApi.getRewards(),
  });

  // Fetch my XP balance
  const xpQuery = useQuery({
    queryKey: ["my-xp", user?.id],
    queryFn: () => socialApi.getMyXp(),
  });

  // Fetch Redemptions History
  const redemptionsQuery = useQuery({
    queryKey: ["reward-redemptions"],
    queryFn: () => socialApi.getRedemptions(),
  });

  const createMutation = useMutation({
    mutationFn: socialApi.createReward,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["social-rewards"] });
      void queryClient.invalidateQueries({ queryKey: ["social-report"] });
      toast({ title: "Success", description: "Reward created." });
      setDialogOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to create reward." });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: any }) => socialApi.updateReward(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["social-rewards"] });
      void queryClient.invalidateQueries({ queryKey: ["social-report"] });
      toast({ title: "Success", description: "Reward updated." });
      setDialogOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to update reward." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: socialApi.deleteReward,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["social-rewards"] });
      void queryClient.invalidateQueries({ queryKey: ["social-report"] });
      toast({ title: "Success", description: "Reward deleted." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to delete reward." });
    },
  });

  const redeemMutation = useMutation({
    mutationFn: socialApi.redeemReward,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["social-rewards"] });
      void queryClient.invalidateQueries({ queryKey: ["my-xp"] });
      void queryClient.invalidateQueries({ queryKey: ["reward-redemptions"] });
      void queryClient.invalidateQueries({ queryKey: ["social-report"] });
      toast({ title: "Success", description: "Reward redeemed successfully!" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to redeem reward." });
    },
  });

  const handleFormSubmit = async (values: any) => {
    if (selectedReward) {
      await updateMutation.mutateAsync({ id: selectedReward.id, input: values });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this reward?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleRedeem = async (id: string) => {
    if (confirm("Are you sure you want to redeem this reward?")) {
      await redeemMutation.mutateAsync(id);
    }
  };

  const loading = isLoading || xpQuery.isLoading || redemptionsQuery.isLoading;
  const isErr = error || xpQuery.isError || redemptionsQuery.isError;

  if (loading) return <LoadingState label="Rewards Store" />;
  if (isErr) {
    const retryAll = () => {
      void refetch();
      void xpQuery.refetch();
      void redemptionsQuery.refetch();
    };
    return <ErrorState message="Failed to load rewards." onRetry={retryAll} />;
  }

  const rewards = data?.rewards ?? [];
  const xpBalance = xpQuery.data?.balance ?? 0;
  const redemptions = redemptionsQuery.data?.redemptions ?? [];

  return (
    <div className="space-y-8">
      {/* XP Balance Header */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="space-y-1">
          <CardDescription className="text-slate-400 font-semibold text-xs uppercase tracking-wider">
            Available Gamification Balance
          </CardDescription>
          <div className="text-4xl font-black font-mono flex items-center gap-2">
            <Coins className="h-8 w-8 text-amber-400 shrink-0" />
            {xpBalance.toLocaleString()}{" "}
            <span className="text-sm font-normal text-slate-400">XP</span>
          </div>
        </div>

        {isAdmin && (
          <Button
            onClick={() => {
              setSelectedReward(null);
              setDialogOpen(true);
            }}
            type="button"
            className="bg-white text-slate-900 hover:bg-slate-100 font-semibold"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Reward
          </Button>
        )}
      </section>

      {/* Rewards Grid */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Rewards Store</h3>
        {rewards.length === 0 ? (
          <EmptyState
            title="Store is Empty"
            description="There are currently no items available in the rewards catalog."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rewards.map((r) => {
              const outOfStock = r.stock <= 0;
              const insufficientXp = xpBalance < r.pointsRequired;
              const isInactive = r.status === "INACTIVE";

              return (
                <Card key={r.id} className="flex flex-col hover:shadow-md transition relative overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold text-slate-900">{r.name}</CardTitle>
                    {r.description && <CardDescription className="text-xs">{r.description}</CardDescription>}
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between space-y-4 pt-2">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-amber-600 font-mono font-bold">{r.pointsRequired} XP</span>
                      <span className={[
                        "text-xs font-mono",
                        outOfStock ? "text-red-500 font-bold" : "text-slate-500"
                      ].join(" ")}>
                        {outOfStock ? "Out of Stock" : `${r.stock} left`}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2 gap-2">
                      <div className="flex gap-1">
                        {isAdmin && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              onClick={() => {
                                setSelectedReward(r);
                                setDialogOpen(true);
                              }}
                              title="Edit reward"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              onClick={() => void handleDelete(r.id)}
                              title="Delete reward"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>

                      <Button
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                        type="button"
                        onClick={() => void handleRedeem(r.id)}
                        disabled={outOfStock || insufficientXp || isInactive || redeemMutation.isPending}
                      >
                        <ShoppingBag className="mr-1.5 h-3.5 w-3.5" /> Redeem
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Redemption History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-indigo-500 shrink-0" />
            Redemption Ledger
          </CardTitle>
          <CardDescription>
            Audited history of reward claims and XP deductions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {redemptions.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-6">No redemptions recorded.</div>
          ) : (
            <div className="rounded-md border border-slate-200 bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reward</TableHead>
                    <TableHead>Redeemed By</TableHead>
                    <TableHead>Redeemed On</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {redemptions.map((red) => (
                    <TableRow key={red.id}>
                      <TableCell className="font-semibold text-slate-900">{red.reward.name}</TableCell>
                      <TableCell className="text-sm font-medium">{red.user.name}</TableCell>
                      <TableCell className="text-xs text-slate-500 font-mono">
                        {new Date(red.redeemedAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-amber-600 font-mono text-sm font-bold">-{red.reward.pointsRequired} XP</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 rounded bg-green-50 border border-green-200 px-2 py-0.5 text-[10px] font-bold text-green-700">
                          <Check className="h-3 w-3" /> SUCCESS
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

      <RewardFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        reward={selectedReward}
        onSubmit={handleFormSubmit}
        submitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
export default RewardsTab;
