import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Plus, Calendar, FileText } from "lucide-react";
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
import { environmentalApi, type CarbonTransaction, type CarbonTransactionInput, type SourceType, type EmissionFactor } from "./environmental-api";
import { ErrorState, EmptyState, LoadingState } from "../administration/shared-state";
import { z } from "zod";

const transactionSchema = z.object({
  departmentId: z.string().uuid("Please select a department."),
  emissionFactorId: z.string().uuid("Please select an emission factor."),
  sourceType: z.enum(["PURCHASE", "MANUFACTURING", "EXPENSE", "FLEET", "MANUAL"]),
  referenceNumber: z.string().optional(),
  quantity: z.coerce.number().gt(0, "Quantity must be positive."),
  transactionDate: z.string().min(1, "Please select a transaction date."),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

function TransactionFormDialog({
  open,
  onOpenChange,
  departments,
  factors,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: { id: string; name: string; code: string }[];
  factors: EmissionFactor[];
  onSubmit: (values: CarbonTransactionInput) => Promise<void>;
  submitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      departmentId: "",
      emissionFactorId: "",
      sourceType: "MANUAL",
      referenceNumber: "",
      quantity: 1,
      transactionDate: new Date().toISOString().split("T")[0] ?? "",
    },
  });

  const selectedFactorId = watch("emissionFactorId");
  const enteredQuantity = watch("quantity");

  // Calculate live preview CO2
  const selectedFactor = factors.find((f) => f.id === selectedFactorId);
  const liveCO2Preview = selectedFactor && enteredQuantity > 0
    ? enteredQuantity * Number(selectedFactor.factor)
    : 0;

  React.useEffect(() => {
    if (open) {
      reset({
        departmentId: "",
        emissionFactorId: "",
        sourceType: "MANUAL",
        referenceNumber: "",
        quantity: 1,
        transactionDate: new Date().toISOString().split("T")[0] ?? "",
      });
    }
  }, [open, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      departmentId: values['departmentId'],
      emissionFactorId: values['emissionFactorId'],
      sourceType: values['sourceType'],
      referenceNumber: values['referenceNumber'] || null,
      quantity: values['quantity'],
      transactionDate: values['transactionDate'],
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Carbon Transaction</DialogTitle>
          <DialogDescription>
            Manually enter a transaction to calculate carbon emissions for your department.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="tx-dept">Department</Label>
            <Select id="tx-dept" {...register("departmentId")}>
              <option value="">Select Department...</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </Select>
            {errors['departmentId'] ? <p className="text-sm text-red-500">{errors['departmentId'].message}</p> : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tx-source">Source Type</Label>
              <Select id="tx-source" {...register("sourceType")}>
                <option value="MANUAL">Manual</option>
                <option value="PURCHASE">Purchase</option>
                <option value="MANUFACTURING">Manufacturing</option>
                <option value="EXPENSE">Expense</option>
                <option value="FLEET">Fleet</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx-ref">Ref Number</Label>
              <Input id="tx-ref" placeholder="e.g. INV-1002" {...register("referenceNumber")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tx-factor">Emission Factor</Label>
            <Select id="tx-factor" {...register("emissionFactorId")}>
              <option value="">Select Emission Factor...</option>
              {factors.filter(f => f.status === "ACTIVE").map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.source}) · {Number(f.factor).toFixed(4)} kg CO₂/{f.unit}
                </option>
              ))}
            </Select>
            {errors['emissionFactorId'] ? <p className="text-sm text-red-500">{errors['emissionFactorId'].message}</p> : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tx-qty">Quantity</Label>
              <Input id="tx-qty" type="number" step="any" {...register("quantity")} />
              {errors['quantity'] ? <p className="text-sm text-red-500">{errors['quantity'].message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx-date">Transaction Date</Label>
              <Input id="tx-date" type="date" {...register("transactionDate")} />
              {errors['transactionDate'] ? <p className="text-sm text-red-500">{errors['transactionDate'].message}</p> : null}
            </div>
          </div>

          {selectedFactor && (
            <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-4 flex gap-3">
              <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-800">
                  Emissions Preview (Calculated Automatically)
                </div>
                <div className="mt-1 text-lg font-bold text-blue-900">
                  {liveCO2Preview.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}{" "}
                  <span className="text-sm font-normal text-blue-700">kg CO₂</span>
                </div>
                <div className="text-xs text-blue-600 mt-0.5">
                  Calculation: {enteredQuantity} {selectedFactor.unit} × {Number(selectedFactor.factor)} kg CO₂/{selectedFactor.unit}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Logging..." : "Create Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CarbonTransactionsTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [deptFilter, setDeptFilter] = React.useState("");
  const [sourceFilter, setSourceFilter] = React.useState("");
  const [factorFilter, setFactorFilter] = React.useState("");

  const isAllowedToLog = user?.role.name === "Admin" || user?.role.name === "Asset Manager" || user?.role.name === "Department Head";

  // Fetch Report (for KPI cards)
  const reportQuery = useQuery({
    queryKey: ["environment-report"],
    queryFn: () => environmentalApi.getEnvironmentReport(),
  });

  // Fetch Departments
  const deptsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: () => administrationApi.getDepartments(),
  });

  // Fetch Factors
  const factorsQuery = useQuery({
    queryKey: ["emission-factors"],
    queryFn: () => environmentalApi.getEmissionFactors(),
  });

  // Fetch Carbon Transactions
  const txQuery = useQuery({
    queryKey: ["carbon-transactions", deptFilter, sourceFilter, factorFilter],
    queryFn: () => {
      const filters: any = {};
      if (deptFilter) filters.departmentId = deptFilter;
      if (sourceFilter) filters.sourceType = sourceFilter;
      if (factorFilter) filters.emissionFactorId = factorFilter;
      return environmentalApi.getCarbonTransactions(filters);
    },
  });

  const createMutation = useMutation({
    mutationFn: environmentalApi.createCarbonTransaction,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["carbon-transactions"] });
      void queryClient.invalidateQueries({ queryKey: ["environment-report"] });
      toast({ title: "Success", description: "Carbon transaction logged successfully." });
      setDialogOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to log transaction." });
    },
  });

  const handleFormSubmit = async (values: CarbonTransactionInput) => {
    await createMutation.mutateAsync(values);
  };

  const isLoading = txQuery.isLoading || deptsQuery.isLoading || factorsQuery.isLoading || reportQuery.isLoading;
  const isError = txQuery.isError || deptsQuery.isError || factorsQuery.isError || reportQuery.isError;

  if (isLoading) return <LoadingState label="Carbon Transactions" />;
  if (isError) {
    const retryAll = () => {
      void txQuery.refetch();
      void deptsQuery.refetch();
      void factorsQuery.refetch();
      void reportQuery.refetch();
    };
    return <ErrorState message="Failed to load transaction data." onRetry={retryAll} />;
  }

  const transactions = txQuery.data?.carbonTransactions ?? [];
  const departments = deptsQuery.data?.departments ?? [];
  const factors = factorsQuery.data?.emissionFactors ?? [];
  const summary = reportQuery.data?.summary ?? { totalEmissions: 0, todayEmissions: 0, monthlyEmissions: 0 };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden hover:shadow-md transition-shadow bg-white border border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-500 font-medium">All-Time Emissions</CardDescription>
            <CardTitle className="text-3xl font-bold text-slate-900">
              {summary.totalEmissions.toLocaleString("en-US")} <span className="text-lg font-normal text-slate-500">kg CO₂</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500 flex items-center gap-1 mt-2 border-t border-slate-100 pt-2">
            <Calendar className="h-3 w-3 text-slate-450" /> Ledger inception total emissions
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-md transition-shadow bg-white border border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-500 font-medium">Today's Emissions</CardDescription>
            <CardTitle className="text-3xl font-bold text-emerald-700">
              {summary.todayEmissions.toLocaleString("en-US")} <span className="text-lg font-normal text-slate-500">kg CO₂</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500 flex items-center gap-1 mt-2 border-t border-slate-100 pt-2">
            <Calendar className="h-3 w-3 text-slate-450" /> Real-time operations today
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-md transition-shadow bg-white border border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-500 font-medium">This Month's Emissions</CardDescription>
            <CardTitle className="text-3xl font-bold text-sky-750">
              {summary.monthlyEmissions.toLocaleString("en-US")} <span className="text-lg font-normal text-slate-500">kg CO₂</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500 flex items-center gap-1 mt-2 border-t border-slate-100 pt-2">
            <Calendar className="h-3 w-3 text-slate-450" /> Month-to-date carbon total
          </CardContent>
        </Card>
      </div>

      {/* Filter and Actions bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
          <Select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
            <option value="">All Sources</option>
            <option value="MANUAL">Manual</option>
            <option value="PURCHASE">Purchase</option>
            <option value="MANUFACTURING">Manufacturing</option>
            <option value="EXPENSE">Expense</option>
            <option value="FLEET">Fleet</option>
          </Select>
          <Select value={factorFilter} onChange={(e) => setFactorFilter(e.target.value)}>
            <option value="">All Factors</option>
            {factors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </Select>
        </div>

        {isAllowedToLog && (
          <Button onClick={() => setDialogOpen(true)} type="button" className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Log Transaction
          </Button>
        )}
      </div>

      {/* Transaction History table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-400" />
            Emissions Ledger
          </CardTitle>
          <CardDescription>
            Historical records of all operational carbon transactions with conversion rates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            if (transactions.length === 0) {
              const emptyProps: any = {
                title: "No Carbon Transactions Found",
                description: "Log a manual carbon transaction or configure triggers to generate transactional emissions records."
              };
              if (isAllowedToLog) {
                emptyProps.actionLabel = "Log Transaction";
                emptyProps.onAction = () => setDialogOpen(true);
              }
              return <EmptyState {...emptyProps} />;
            }
            return (
            <div className="rounded-md border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Source Type</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Conversion Rate</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Calculated Emissions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">
                        {new Date(tx.transactionDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>{tx.department.name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                          {tx.sourceType}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-500 font-mono text-xs">{tx.referenceNumber ?? "N/A"}</TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {tx.emissionFactor.name} ({Number(tx.emissionFactor.factor).toFixed(4)}/{tx.emissionFactor.unit})
                      </TableCell>
                      <TableCell className="font-mono">
                        {Number(tx.quantity).toLocaleString()} {tx.emissionFactor.unit}
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-900 font-mono">
                        {Number(tx.calculatedEmission).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                        <span className="text-xs font-normal text-slate-500">kg CO₂</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          );
          })()}
        </CardContent>
      </Card>

      <TransactionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        departments={departments}
        factors={factors}
        onSubmit={handleFormSubmit}
        submitting={createMutation.isPending}
      />
    </div>
  );
}
