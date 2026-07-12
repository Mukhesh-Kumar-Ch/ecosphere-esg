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
import { administrationApi, type Category, type CategoryInput, type CategoryType, type CategoryStatus } from "./administration-api";
import { ErrorState, EmptyState, LoadingState } from "./shared-state";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(2, "Category name is required."),
  type: z.enum(["CSR_ACTIVITY", "CHALLENGE", "TRAINING", "GENERAL"]),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

function formatCategoryType(type: CategoryType) {
  return {
    CSR_ACTIVITY: "CSR Activity",
    CHALLENGE: "Challenge",
    TRAINING: "Training",
    GENERAL: "General",
  }[type];
}

function formatCategoryStatus(status: CategoryStatus) {
  return status === "ACTIVE" ? "Active" : "Inactive";
}

function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onSubmit: (values: CategoryInput) => Promise<void>;
  submitting: boolean;
}) {
  const defaultValues: CategoryFormValues = {
    name: category?.name ?? "",
    type: category?.type ?? "GENERAL",
    status: category?.status ?? "ACTIVE",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues,
  });

  React.useEffect(() => {
    reset(defaultValues);
  }, [category, open, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "Create Category"}</DialogTitle>
          <DialogDescription>Classify CSR activities, challenges, training, or general engagement.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="category-name">Name</Label>
            <Input id="category-name" placeholder="Community Volunteering" {...register("name")} />
            {errors.name ? <p className="text-sm text-danger">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-type">Type</Label>
            <Select id="category-type" {...register("type")}>
              <option value="CSR_ACTIVITY">CSR Activity</option>
              <option value="CHALLENGE">Challenge</option>
              <option value="TRAINING">Training</option>
              <option value="GENERAL">General</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-status">Status</Label>
            <Select id="category-status" {...register("status")}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CategoriesTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role.name === "Admin";
  const [search, setSearch] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editCategory, setEditCategory] = React.useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = React.useState<Category | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => administrationApi.getCategories(),
  });

  const createMutation = useMutation({
    mutationFn: administrationApi.createCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      setCreateOpen(false);
      toast({ title: "Category created", description: "The category was saved successfully." });
    },
    onError: (error) => {
      toast({ title: "Unable to create category", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: CategoryInput }) =>
      administrationApi.updateCategory(id, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditCategory(null);
      toast({ title: "Category updated", description: "The category changes were saved." });
    },
    onError: (error) => {
      toast({ title: "Unable to update category", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: administrationApi.deleteCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeleteCategory(null);
      toast({ title: "Category deleted", description: "The category was removed." });
    },
    onError: (error) => {
      toast({ title: "Unable to delete category", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const filteredCategories = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    const categories = categoriesQuery.data?.categories ?? [];

    if (!term) {
      return categories;
    }

    return categories.filter((category) => {
      const haystack = [category.name, category.type, category.status].join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }, [categoriesQuery.data?.categories, search]);

  if (categoriesQuery.isLoading) {
    return <LoadingState label="Categories" />;
  }

  if (categoriesQuery.isError) {
    return <ErrorState message="Failed to load categories." onRetry={() => void categoriesQuery.refetch()} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input className="md:max-w-md" placeholder="Search categories..." value={search} onChange={(event) => setSearch(event.target.value)} />
        {isAdmin ? (
          <Button onClick={() => setCreateOpen(true)} type="button">
            <Plus className="mr-2 h-4 w-4" />
            Create Category
          </Button>
        ) : null}
      </div>

      {filteredCategories.length === 0 ? (
        <EmptyState
          actionLabel="Create Category"
          description="No categories match the current search or no categories have been created yet."
          onAction={() => setCreateOpen(true)}
          title="No categories found"
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Categories</CardTitle>
            <CardDescription>Reusable lookup values across CSR, challenge, training, and general workflows.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium text-slate-950">{category.name}</TableCell>
                    <TableCell>{formatCategoryType(category.type)}</TableCell>
                    <TableCell>
                      <span className={category.status === "ACTIVE" ? "text-success" : "text-slate-500"}>
                        {formatCategoryStatus(category.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditCategory(category)} type="button">
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setDeleteCategory(category)} type="button">
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
          <CategoryFormDialog
            onOpenChange={setCreateOpen}
            onSubmit={async (values) => {
              await createMutation.mutateAsync(values);
            }}
            open={createOpen}
            submitting={createMutation.isPending}
          />

          <CategoryFormDialog
            category={editCategory}
            onOpenChange={(open) => {
              if (!open) {
                setEditCategory(null);
              }
            }}
            onSubmit={async (values) => {
              if (!editCategory) {
                return;
              }

              await updateMutation.mutateAsync({ id: editCategory.id, values });
            }}
            open={Boolean(editCategory)}
            submitting={updateMutation.isPending}
          />

          <Dialog open={Boolean(deleteCategory)} onOpenChange={(open) => !open && setDeleteCategory(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Delete Category</DialogTitle>
                <DialogDescription>
                  This will remove <span className="font-medium text-slate-950">{deleteCategory?.name}</span> from the category list.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteCategory(null)} type="button">
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteCategory && void deleteMutation.mutateAsync(deleteCategory.id)}
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