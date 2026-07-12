import { z } from "zod";

export const setMetricSchema = z.object({
  category: z.string().min(1, "Category is required.").max(100),
  label: z.string().min(1, "Label is required.").max(100),
  value: z.coerce.number().min(0, "Percentage must be at least 0.").max(100, "Percentage cannot exceed 100."),
});
