import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { administrationApi, type Department, type DepartmentInput, type DepartmentStatus } from "./administration-api";
import { ErrorState, EmptyState, LoadingState } from "./shared-state";
import { z } from "zod";

const departmentSchema = z.object({
  name: z.string().min(2, "Department name is required."),
  code: z.string().min(2, "Department code is required.").max(20),
  parentDepartmentId: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

function formatDepartmentStatus(status: DepartmentStatus) {
  return status === "ACTIVE" ? "Active" : "Inactive";
}

function DepartmentFormDialog({
  open,
  onOpenChange,
  department,
  departments,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: Department | null;
  departments: Department[];
  onSubmit: (values: DepartmentInput) => Promise<void>;
  submitting: boolean;
}) {
  const defaultValues: DepartmentFormValues = {
    name: department?.name ?? "",
    code: department?.code ?? "",
    parentDepartmentId: department?.parentDepartmentId ?? "",
    status: department?.status ?? "ACTIVE",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues,
  });

  React.useEffect(() => {
    reset(defaultValues);
  }, [department, open, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      name: values.name,
      code: values.code,
      parentDepartmentId: values.parentDepartmentId ? values.parentDepartmentId : null,
      status: values.status,
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{department ? "Edit Department" : "Create Department"}</DialogTitle>
          <DialogDescription>Maintain organizational master data for the ESG platform.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="department-name">Name</Label>
            <Input id="department-name" placeholder="Operations" {...register("name")} />
            {errors.name ? <p className="text-sm text-danger">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department-code">Code</Label>
            <Input id="department-code" placeholder="OPS" {...register("code")} />
            {errors.code ? <p className="text-sm text-danger">{errors.code.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department-parent">Parent Department</Label>
            <Select id="department-parent" {...register("parentDepartmentId")}>
              <option value="">No parent</option>
              {departments
                .filter((item) => item.id !== department?.id)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department-status">Status</Label>
            <Select id="department-status" {...register("status")}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DepartmentsTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role.name === "Admin";
  const [search, setSearch] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editDepartment, setEditDepartment] = React.useState<Department | null>(null);
  const [deleteDepartment, setDeleteDepartment] = React.useState<Department | null>(null);

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: async () => administrationApi.getDepartments(),
  });

  const createMutation = useMutation({
    mutationFn: administrationApi.createDepartment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["departments"] });
      setCreateOpen(false);
      toast({ title: "Department created", description: "The department was saved successfully." });
    },
    onError: (error) => {
      toast({ title: "Unable to create department", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: DepartmentInput }) =>
      administrationApi.updateDepartment(id, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["departments"] });
      setEditDepartment(null);
      toast({ title: "Department updated", description: "The department changes were saved." });
    },
    onError: (error) => {
      toast({ title: "Unable to update department", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: administrationApi.deleteDepartment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["departments"] });
      setDeleteDepartment(null);
      toast({ title: "Department deleted", description: "The department was archived using soft delete." });
    },
    onError: (error) => {
      toast({ title: "Unable to delete department", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const filteredDepartments = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    const departments = departmentsQuery.data?.departments ?? [];

    if (!term) {
      return departments;
    }

    return departments.filter((department) => {
      const haystack = [
        department.name,
        department.code,
        department.status,
        department.parentDepartment?.name ?? "",
        department.headUser?.name ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [departmentsQuery.data?.departments, search]);

  if (departmentsQuery.isLoading) {
    return <LoadingState label="Departments" />;
  }

  if (departmentsQuery.isError) {
    return <ErrorState message="Failed to load departments." onRetry={() => void departmentsQuery.refetch()} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input className="md:max-w-md" placeholder="Search departments..." value={search} onChange={(event) => setSearch(event.target.value)} />
        {isAdmin ? (
          <Button onClick={() => setCreateOpen(true)} type="button">
            <Plus className="mr-2 h-4 w-4" />
            Create Department
          </Button>
        ) : null}
      </div>

      {filteredDepartments.length === 0 ? (
        <EmptyState
          actionLabel="Create Department"
          description="No departments match the current search or no departments have been created yet."
          onAction={() => setCreateOpen(true)}
          title="No departments found"
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Departments</CardTitle>
            <CardDescription>Organizational units used across ESG workflows.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Head</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell className="font-medium text-slate-950">{department.name}</TableCell>
                    <TableCell>{department.code}</TableCell>
                    <TableCell>{department.parentDepartment?.name ?? "-"}</TableCell>
                    <TableCell>{department.headUser?.name ?? "-"}</TableCell>
                    <TableCell>
                      <span className={department.status === "ACTIVE" ? "text-success" : "text-slate-500"}>
                        {formatDepartmentStatus(department.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditDepartment(department)} type="button">
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setDeleteDepartment(department)} type="button">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      ) : (
                        <span className="text-slate-400">View only</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {isAdmin ? (
        <>
          <DepartmentFormDialog
            departments={departmentsQuery.data?.departments ?? []}
            onOpenChange={setCreateOpen}
            onSubmit={async (values) => {
              await createMutation.mutateAsync(values);
            }}
            open={createOpen}
            submitting={createMutation.isPending}
          />

          <DepartmentFormDialog
            departments={departmentsQuery.data?.departments ?? []}
            department={editDepartment}
            onOpenChange={(open) => {
              if (!open) {
                setEditDepartment(null);
              }
            }}
            onSubmit={async (values) => {
              if (!editDepartment) {
                return;
              }

              await updateMutation.mutateAsync({ id: editDepartment.id, values });
            }}
            open={Boolean(editDepartment)}
            submitting={updateMutation.isPending}
          />

          <Dialog open={Boolean(deleteDepartment)} onOpenChange={(open) => !open && setDeleteDepartment(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Delete Department</DialogTitle>
                <DialogDescription>
                  This will soft delete <span className="font-medium text-slate-950">{deleteDepartment?.name}</span>. Historical records are preserved.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDepartment(null)} type="button">
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteDepartment && void deleteMutation.mutateAsync(deleteDepartment.id)}
                  type="button"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : null}
    </div>
  );
}