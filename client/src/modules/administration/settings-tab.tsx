import { Pencil } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/contexts/auth-context";
import { administrationApi, type Setting } from "./administration-api";
import { ErrorState, LoadingState, EmptyState } from "./shared-state";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const settingSchema = z.object({
  value: z.string().min(1, "Setting value is required."),
  description: z.string().optional(),
});

type SettingFormValues = z.infer<typeof settingSchema>;

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function SettingFormDialog({
  open,
  onOpenChange,
  setting,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setting?: Setting | null;
  onSubmit: (values: SettingFormValues) => Promise<void>;
  submitting: boolean;
}) {
  const defaultValues: SettingFormValues = {
    value: setting?.value ?? "",
    description: setting?.description ?? "",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingFormValues>({
    resolver: zodResolver(settingSchema),
    defaultValues,
  });

  React.useEffect(() => {
    reset(defaultValues);
  }, [setting, open, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Setting</DialogTitle>
          <DialogDescription>Update a platform configuration value used by the ESG workflows.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="setting-key">Key</Label>
            <Input id="setting-key" value={setting?.key ?? ""} readOnly />
          </div>

          <div className="space-y-2">
            <Label htmlFor="setting-value">Value</Label>
            <Input id="setting-value" placeholder="true" {...register("value")} />
            {errors.value ? <p className="text-sm text-danger">{errors.value.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="setting-description">Description</Label>
            <Textarea id="setting-description" placeholder="Explain how this setting is used." {...register("description")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Setting"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SettingsTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role.name === "Admin";
  const [search, setSearch] = React.useState("");
  const [editSetting, setEditSetting] = React.useState<Setting | null>(null);

  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: async () => administrationApi.getSettings(),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ key, values }: { key: string; values: SettingFormValues }) =>
      administrationApi.updateSettings([
        {
          key,
          value: values.value,
          description: values.description?.trim() ? values.description.trim() : null,
        },
      ]),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["settings"] });
      setEditSetting(null);
      toast({ title: "Setting updated", description: "The configuration value was saved." });
    },
    onError: (error) => {
      toast({ title: "Unable to update setting", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const filteredSettings = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    const settings = settingsQuery.data?.settings ?? [];

    if (!term) {
      return settings;
    }

    return settings.filter((setting) => {
      const haystack = [setting.key, setting.value, setting.description ?? ""].join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }, [settingsQuery.data?.settings, search]);

  if (settingsQuery.isLoading) {
    return <LoadingState label="Settings" />;
  }

  if (settingsQuery.isError) {
    return <ErrorState message="Failed to load settings." onRetry={() => void settingsQuery.refetch()} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input className="md:max-w-md" placeholder="Search settings..." value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      {filteredSettings.length === 0 ? (
        <EmptyState
          description="No settings match the current search or no settings have been loaded yet."
          title="No settings found"
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Settings</CardTitle>
            <CardDescription>Organization-wide ESG configuration managed by administrators.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Updated By</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSettings.map((setting) => (
                  <TableRow key={setting.id}>
                    <TableCell className="font-medium text-slate-950">{setting.key}</TableCell>
                    <TableCell>{setting.value}</TableCell>
                    <TableCell>{setting.description ?? "-"}</TableCell>
                    <TableCell>{setting.updatedBy?.name ?? "-"}</TableCell>
                    <TableCell>{formatDate(setting.updatedAt)}</TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditSetting(setting)} type="button">
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
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
        <SettingFormDialog
          onOpenChange={(open) => {
            if (!open) {
              setEditSetting(null);
            }
          }}
          onSubmit={async (values) => {
            if (!editSetting) {
              return;
            }

            await updateMutation.mutateAsync({ key: editSetting.key, values });
          }}
          open={Boolean(editSetting)}
          setting={editSetting}
          submitting={updateMutation.isPending}
        />
      ) : null}
    </div>
  );
}