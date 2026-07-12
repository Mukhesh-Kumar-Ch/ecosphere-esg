import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, ToggleLeft, ToggleRight } from "lucide-react";
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
import { environmentalApi, type EmissionFactor, type EmissionFactorInput, type Status } from "./environmental-api";
import { ErrorState, EmptyState, LoadingState } from "../administration/shared-state";
import { z } from "zod";

const emissionFactorSchema = z.object({
  name: z.string().min(1, "Name is required."),
  source: z.string().min(1, "Source is required."),
  unit: z.string().min(1, "Unit is required."),
  factor: z.coerce.number().gt(0, "Factor must be positive."),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

type EmissionFactorFormValues = z.infer<typeof emissionFactorSchema>;

function EmissionFactorFormDialog({
  open,
  onOpenChange,
  factor,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  factor?: EmissionFactor | null;
  onSubmit: (values: EmissionFactorInput) => Promise<void>;
  submitting: boolean;
}) {
  const defaultValues: EmissionFactorFormValues = {
    name: factor?.name ?? "",
    source: factor?.source ?? "",
    unit: factor?.unit ?? "",
    factor: factor ? Number(factor.factor) : 1,
    description: factor?.description ?? "",
    status: factor?.status ?? "ACTIVE",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmissionFactorFormValues>({
    resolver: zodResolver(emissionFactorSchema),
    defaultValues,
  });

  React.useEffect(() => {
    reset(defaultValues);
  }, [factor, open, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      name: values.name,
      source: values.source,
      unit: values.unit,
      factor: values.factor,
      description: values.description || null,
      status: values.status,
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{factor ? "Edit Emission Factor" : "Create Emission Factor"}</DialogTitle>
          <DialogDescription>
            Configure carbon conversion rates for automatic emissions calculation.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="factor-name">Name</Label>
            <Input id="factor-name" placeholder="e.g. Electricity, Diesel" {...register("name")} />
            {errors['name'] ? <p className="text-sm text-red-500">{errors['name'].message}</p> : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="factor-source">Source</Label>
              <Input id="factor-source" placeholder="e.g. EPA 2024" {...register("source")} />
              {errors['source'] ? <p className="text-sm text-red-500">{errors['source'].message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="factor-unit">Unit</Label>
              <Input id="factor-unit" placeholder="e.g. kWh, L, kg" {...register("unit")} />
              {errors['unit'] ? <p className="text-sm text-red-500">{errors['unit'].message}</p> : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="factor-value">Conversion Factor (kg CO₂ / Unit)</Label>
              <Input id="factor-value" type="number" step="any" placeholder="0.82" {...register("factor")} />
              {errors['factor'] ? <p className="text-sm text-red-500">{errors['factor'].message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="factor-status">Status</Label>
              <Select id="factor-status" {...register("status")}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="factor-desc">Description</Label>
            <Input id="factor-desc" placeholder="Carbon intensity details" {...register("description")} />
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Factor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EmissionFactorsTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | Status>("ALL");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedFactor, setSelectedFactor] = React.useState<EmissionFactor | null>(null);

  const isAdminOrAssetManager = user?.role.name === "Admin" || user?.role.name === "Asset Manager";

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["emission-factors"],
    queryFn: async () => environmentalApi.getEmissionFactors(),
  });

  const createMutation = useMutation({
    mutationFn: environmentalApi.createEmissionFactor,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["emission-factors"] });
      toast({ title: "Success", description: "Emission factor created successfully." });
      setDialogOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to create factor." });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<EmissionFactorInput> }) =>
      environmentalApi.updateEmissionFactor(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["emission-factors"] });
      toast({ title: "Success", description: "Emission factor updated successfully." });
      setDialogOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to update factor." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: environmentalApi.deleteEmissionFactor,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["emission-factors"] });
      toast({ title: "Success", description: "Emission factor deactivated successfully." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to deactivate factor." });
    },
  });

  const handleFormSubmit = async (values: EmissionFactorInput) => {
    if (selectedFactor) {
      await updateMutation.mutateAsync({ id: selectedFactor.id, input: values });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleToggleStatus = async (factor: EmissionFactor) => {
    const nextStatus: Status = factor.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await updateMutation.mutateAsync({ id: factor.id, input: { status: nextStatus } });
  };

  if (isLoading) return <LoadingState label="Emission Factors" />;
  if (error) return <ErrorState message={error.message || "Failed to load factors."} onRetry={refetch} />;

  const factors = data?.emissionFactors ?? [];

  const filteredFactors = factors.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.source.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 max-w-sm gap-2">
          <Input placeholder="Search name or source..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </Select>
        </div>

        {isAdminOrAssetManager && (
          <Button
            onClick={() => {
              setSelectedFactor(null);
              setDialogOpen(true);
            }}
            type="button"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Factor
          </Button>
        )}
      </div>

      {(() => {
        if (filteredFactors.length === 0) {
          const emptyProps: any = {
            title: "No Emission Factors Found",
            description: "Create conversion factors to start tracking operational greenhouse gas emissions."
          };
          if (isAdminOrAssetManager) {
            emptyProps.actionLabel = "Create Factor";
            emptyProps.onAction = () => {
              setSelectedFactor(null);
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
                <TableHead>Name</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Factor (kg CO₂/Unit)</TableHead>
                <TableHead>Status</TableHead>
                {isAdminOrAssetManager && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFactors.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium text-slate-900">{f.name}</TableCell>
                  <TableCell className="text-slate-500">{f.source}</TableCell>
                  <TableCell>{f.unit}</TableCell>
                  <TableCell className="font-mono">{Number(f.factor).toFixed(4)}</TableCell>
                  <TableCell>
                    <span
                      className={[
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold",
                        f.status === "ACTIVE" ? "bg-green-50 text-green-700 border border-green-200" : "bg-slate-100 text-slate-600 border border-slate-200",
                      ].join(" ")}
                    >
                      {f.status === "ACTIVE" ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  {isAdminOrAssetManager && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => {
                            setSelectedFactor(f);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => void handleToggleStatus(f)}
                          className={f.status === "ACTIVE" ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                        >
                          {f.status === "ACTIVE" ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
      })()}

      <EmissionFactorFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        factor={selectedFactor}
        onSubmit={handleFormSubmit}
        submitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
