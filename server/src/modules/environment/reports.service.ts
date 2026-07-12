import { prisma } from "../../config/prisma.js";

export async function getEnvironmentReport() {
  const now = new Date();
  
  // Start and end of today in UTC (BR-007)
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const endOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));

  // Start and end of current month in UTC
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  
  // Fetch all transactions to perform dynamic calculations
  const allTransactions = await prisma.carbonTransaction.findMany({
    include: {
      department: true,
    },
  });

  // Calculate totals
  let totalEmissions = 0;
  let todayEmissions = 0;
  let monthlyEmissions = 0;

  allTransactions.forEach((tx) => {
    const emissionVal = Number(tx.calculatedEmission);
    totalEmissions += emissionVal;

    const txDate = new Date(tx.transactionDate);
    if (txDate >= startOfToday && txDate < endOfToday) {
      todayEmissions += emissionVal;
    }
    if (txDate >= startOfMonth && txDate < endOfToday) {
      monthlyEmissions += emissionVal;
    }
  });

  // Calculate monthly emissions trend (last 6 months)
  const last6Months: { name: string; emissions: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const monthName = d.toLocaleString("default", { month: "short", timeZone: "UTC" });
    const monthStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
    const monthEnd = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));

    const emissionsInMonth = allTransactions
      .filter((tx) => {
        const txDate = new Date(tx.transactionDate);
        return txDate >= monthStart && txDate < monthEnd;
      })
      .reduce((sum, tx) => sum + Number(tx.calculatedEmission), 0);

    last6Months.push({
      name: monthName,
      emissions: Number(emissionsInMonth.toFixed(2)),
    });
  }

  // Fetch departments
  const departments = await prisma.department.findMany({
    where: {
      deletedAt: null,
      status: "ACTIVE",
    },
    include: {
      environmentalGoals: true,
    },
  });

  // Calculate department comparisons & department tracking cards
  const departmentTracking = departments.map((dept) => {
    // Emissions for this department
    const deptTx = allTransactions.filter((tx) => tx.departmentId === dept.id);
    const deptEmissions = deptTx.reduce((sum, tx) => sum + Number(tx.calculatedEmission), 0);

    // Calculate trend: Compare current 30 days vs previous 30 days
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const curr30Emissions = deptTx
      .filter((tx) => new Date(tx.transactionDate) >= thirtyDaysAgo)
      .reduce((sum, tx) => sum + Number(tx.calculatedEmission), 0);

    const prev30Emissions = deptTx
      .filter((tx) => {
        const txDate = new Date(tx.transactionDate);
        return txDate >= sixtyDaysAgo && txDate < thirtyDaysAgo;
      })
      .reduce((sum, tx) => sum + Number(tx.calculatedEmission), 0);

    let trendVal = 0;
    if (prev30Emissions > 0) {
      trendVal = ((curr30Emissions - prev30Emissions) / prev30Emissions) * 100;
    }

    const completedGoalsCount = dept.environmentalGoals.filter((g) => g.status === "COMPLETED").length;
    const totalGoalsCount = dept.environmentalGoals.length;

    return {
      id: dept.id,
      name: dept.name,
      code: dept.code,
      totalEmissions: Number(deptEmissions.toFixed(2)),
      completedGoalsCount,
      totalGoalsCount,
      trend: Number(trendVal.toFixed(1)),
    };
  });

  // Department Comparison (specifically for charting)
  const departmentComparison = departmentTracking.map((t) => ({
    name: t.name,
    code: t.code,
    emissions: t.totalEmissions,
  }));

  // Fetch Goals progress
  const allGoals = await prisma.environmentalGoal.findMany({
    include: {
      department: true,
    },
  });

  const goalProgress = allGoals.map((goal) => {
    // Current emissions for this department
    const deptTx = allTransactions.filter((tx) => tx.departmentId === goal.departmentId);
    
    // In business logic: usually, we measure emissions during the goal period or overall.
    // Let's measure overall emissions for this department since the goal's inception (or just overall department emissions).
    const currentEmissions = deptTx.reduce((sum, tx) => sum + Number(tx.calculatedEmission), 0);
    
    const target = Number(goal.targetValue);
    const progressPercent = target > 0 ? (currentEmissions / target) * 100 : 0;

    return {
      id: goal.id,
      title: goal.title,
      departmentName: goal.department.name,
      targetValue: target,
      currentEmissions: Number(currentEmissions.toFixed(2)),
      progress: Number(Math.min(progressPercent, 100).toFixed(1)),
      deadline: goal.deadline,
      status: goal.status,
    };
  });

  return {
    summary: {
      totalEmissions: Number(totalEmissions.toFixed(2)),
      todayEmissions: Number(todayEmissions.toFixed(2)),
      monthlyEmissions: Number(monthlyEmissions.toFixed(2)),
    },
    charts: {
      monthlyEmissionsTrend: last6Months,
      departmentComparison,
    },
    goalProgress,
    departmentTracking,
  };
}
