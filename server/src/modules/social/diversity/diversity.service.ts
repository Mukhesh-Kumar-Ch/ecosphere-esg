import { prisma } from "../../../config/prisma.js";

export class DiversityService {
  static async getMetrics() {
    return prisma.diversityMetric.findMany({
      orderBy: [{ category: "asc" }, { label: "asc" }],
    });
  }

  static async getMetricsByCategory(category: string) {
    return prisma.diversityMetric.findMany({
      where: { category },
      orderBy: { label: "asc" },
    });
  }

  static async setMetric(category: string, label: string, value: number) {
    if (value < 0 || value > 100) {
      throw new Error("Metric value must be a percentage between 0 and 100.");
    }

    return prisma.diversityMetric.upsert({
      where: {
        category_label: { category, label },
      },
      update: {
        value,
      },
      create: {
        category,
        label,
        value,
      },
    });
  }

  static async deleteMetric(id: string) {
    return prisma.diversityMetric.delete({
      where: { id },
    });
  }
}
export default DiversityService;
