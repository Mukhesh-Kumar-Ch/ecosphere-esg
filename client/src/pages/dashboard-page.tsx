import { Activity, Leaf, Target, Users, Info, Layers, CheckCircle2, TrendingUp, BarChart3, ShieldCheck, AlertOctagon, Clipboard, Heart, Award, Trophy, Star, BookOpen } from "lucide-react";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/auth-context";
import { environmentalApi } from "@/modules/environmental/environmental-api";
import { administrationApi } from "@/modules/administration/administration-api";
import { governanceApi } from "@/modules/governance/governance-api";
import { socialApi } from "@/modules/social/social-api";
import { ErrorState, LoadingState } from "@/modules/administration/shared-state";

export function DashboardPage() {
  const { user } = useAuth();

  // Fetch Environmental Report
  const reportQuery = useQuery({
    queryKey: ["environment-report"],
    queryFn: () => environmentalApi.getEnvironmentReport(),
  });

  // Fetch Departments
  const deptsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: () => administrationApi.getDepartments(),
  });

  // Fetch Carbon Transactions
  const txQuery = useQuery({
    queryKey: ["carbon-transactions"],
    queryFn: () => environmentalApi.getCarbonTransactions(),
  });

  // Fetch Governance Report
  const govQuery = useQuery({
    queryKey: ["governance-report"],
    queryFn: () => governanceApi.getGovernanceReport(),
  });

  // Fetch Social Report
  const socialQuery = useQuery({
    queryKey: ["social-report"],
    queryFn: () => socialApi.getSocialReport(),
  });

  // Fetch Leaderboard
  const leaderboardQuery = useQuery({
    queryKey: ["social-leaderboard"],
    queryFn: () => socialApi.getLeaderboard(),
  });

  const isLoading =
    reportQuery.isLoading ||
    deptsQuery.isLoading ||
    txQuery.isLoading ||
    govQuery.isLoading ||
    socialQuery.isLoading ||
    leaderboardQuery.isLoading;

  const isError =
    reportQuery.isError ||
    deptsQuery.isError ||
    txQuery.isError ||
    govQuery.isError ||
    socialQuery.isError ||
    leaderboardQuery.isError;

  if (isLoading) return <LoadingState label="Dashboard Page" />;
  if (isError) {
    const retryAll = () => {
      void reportQuery.refetch();
      void deptsQuery.refetch();
      void txQuery.refetch();
      void govQuery.refetch();
      void socialQuery.refetch();
      void leaderboardQuery.refetch();
    };
    return <ErrorState message="Failed to load dashboard statistics." onRetry={retryAll} />;
  }

  const report = reportQuery.data!;
  const departments = deptsQuery.data?.departments ?? [];
  const transactions = txQuery.data?.carbonTransactions ?? [];
  const govReport = govQuery.data!;
  const socialReport = socialQuery.data!;
  const leaderboard = leaderboardQuery.data?.leaderboard ?? [];

  const totalEmissions = report.summary.totalEmissions;
  const activeGoalsCount = report.goalProgress.filter((g) => g.status === "ACTIVE").length;
  const totalGoalsCount = report.goalProgress.length;
  const departmentCount = departments.length;
  const transactionCount = transactions.length;

  // Calculate Environmental Score
  const compliantGoalsCount = report.goalProgress.filter(
    (g) => g.status === "COMPLETED" || g.currentEmissions <= g.targetValue
  ).length;
  const environmentalScore = totalGoalsCount > 0 
    ? Math.round((compliantGoalsCount / totalGoalsCount) * 100) 
    : 100;

  const governanceScore = govReport.governanceScore;
  const socialScore = socialReport.socialScore;

  // Calculate Overall ESG Score (40% Environmental, 30% Social, 30% Governance)
  const overallScore = Math.round(environmentalScore * 0.4 + socialScore * 0.3 + governanceScore * 0.3);

  // Get recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  // Get top 3 leaderboard users
  const topPerformers = leaderboard.slice(0, 3);

  // Scales for CSS charts
  const maxMonthEmissions = Math.max(...report.charts.monthlyEmissionsTrend.map((m) => m.emissions), 1);
  const maxDeptEmissions = Math.max(...report.charts.departmentComparison.map((d) => d.emissions), 1);

  return (
    <div className="space-y-6">
      {/* Executive ESG Scorecard Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Overall ESG Score */}
        <Card className="bg-slate-900 text-white border-none shadow-md overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Layers className="h-24 w-24" />
          </div>
          <CardHeader className="pb-2 pt-5">
            <div className="flex justify-between items-center">
              <CardDescription className="text-slate-400 font-semibold text-xs uppercase tracking-wider">
                Overall ESG Score
              </CardDescription>
              <Badge className="bg-green-500/20 text-green-300 hover:bg-green-500/20 text-[10px] font-bold">
                Live Rating
              </Badge>
            </div>
            <CardTitle className="text-4xl font-black mt-2 font-mono">{overallScore}</CardTitle>
          </CardHeader>
          <CardContent className="pb-5">
            <div className="text-[11px] font-medium text-slate-300">Composite Sustainability Rating</div>
            <div className="text-[10px] text-slate-400 mt-2 italic flex items-center gap-1 border-t border-slate-800 pt-2">
              <Info className="h-3 w-3 text-green-400 shrink-0" />
              Environmental, Social, & Governance Combined
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Environmental Score */}
        <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 pt-5">
            <div className="flex justify-between items-center">
              <CardDescription className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
                Environmental (E)
              </CardDescription>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px] font-bold">
                Live
              </Badge>
            </div>
            <CardTitle className="text-4xl font-black mt-2 text-green-700 font-mono">{environmentalScore}</CardTitle>
          </CardHeader>
          <CardContent className="pb-5">
            <div className="text-[11px] font-medium text-slate-500">Resource and emission tracking</div>
            <div className="text-[10px] text-slate-400 mt-2 border-t border-slate-100 pt-2">
              Based on {compliantGoalsCount} of {totalGoalsCount} goals compliant
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Social Score */}
        <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 pt-5">
            <div className="flex justify-between items-center">
              <CardDescription className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
                Social (S)
              </CardDescription>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold">
                Live
              </Badge>
            </div>
            <CardTitle className="text-4xl font-black mt-2 text-emerald-700 font-mono">{socialScore}</CardTitle>
          </CardHeader>
          <CardContent className="pb-5">
            <div className="text-[11px] font-medium text-slate-500">Employee & CSR participation</div>
            <div className="text-[10px] text-slate-400 mt-2 border-t border-slate-100 pt-2">
              Based on challenges, CSR activities, & training
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Governance Score */}
        <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 pt-5">
            <div className="flex justify-between items-center">
              <CardDescription className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
                Governance (G)
              </CardDescription>
              <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 text-[10px] font-bold">
                Live
              </Badge>
            </div>
            <CardTitle className="text-4xl font-black mt-2 text-indigo-700 font-mono">{governanceScore}</CardTitle>
          </CardHeader>
          <CardContent className="pb-5">
            <div className="text-[11px] font-medium text-slate-500">Audit & policy alignment</div>
            <div className="text-[10px] text-slate-400 mt-2 border-t border-slate-100 pt-2">
              Based on policies, audits, & issues resolved
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Environmental Operational KPI Grid */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Environmental Performance</h3>
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Emissions */}
          <Card className="shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Emissions</div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {totalEmissions.toLocaleString()}{" "}
                  <span className="text-xs font-normal text-slate-500">kg CO₂</span>
                </div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-500 border border-blue-100">
                <Leaf className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Carbon Transactions */}
          <Card className="shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Carbon Transactions</div>
                <div className="text-2xl font-black text-slate-900 font-mono">{transactionCount}</div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-500 border border-emerald-100">
                <Activity className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Active Goals */}
          <Card className="shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Goals</div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {activeGoalsCount}{" "}
                  <span className="text-xs font-normal text-slate-500">/ {totalGoalsCount} total</span>
                </div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-500 border border-indigo-100">
                <Target className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Departments Count */}
          <Card className="shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Departments</div>
                <div className="text-2xl font-black text-slate-900 font-mono">{departmentCount}</div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-500 border border-amber-100">
                <Users className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Social Operational KPI Grid */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Social & Gamification Performance</h3>
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CSR Participation Rate */}
          <Card className="shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CSR Approved Rate</div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {socialReport.csr.csrParticipationRate}%
                </div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Heart className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Challenge Completion */}
          <Card className="shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Challenges Finished</div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {socialReport.challenges.completedChallengeParticipations}{" "}
                  <span className="text-xs font-normal text-slate-500">/ {socialReport.challenges.totalChallengeParticipations} total</span>
                </div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Star className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Training Completion */}
          <Card className="shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Training Completion</div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {socialReport.training.trainingCompletionRate}%
                </div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <BookOpen className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Total XP Awarded */}
          <Card className="shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Organization XP</div>
                <div className="text-2xl font-black text-amber-600 font-mono">
                  {socialReport.xp.totalXpAwarded.toLocaleString()} <span className="text-xs font-normal text-slate-500">XP</span>
                </div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-500 border border-amber-105">
                <Award className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Governance Operational KPI Grid */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Governance Performance</h3>
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Policy Compliance */}
          <Card className="shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Policy Compliance</div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {govReport.policyStats.policyComplianceRate}%
                </div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-50 text-green-600 border border-green-100">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Audit Count */}
          <Card className="shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Audits Completed</div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {govReport.auditSummary.completedAudits}{" "}
                  <span className="text-xs font-normal text-slate-500">/ {govReport.auditSummary.totalAudits} total</span>
                </div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Clipboard className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Open Compliance Issues */}
          <Card className="shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Open Issues</div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {govReport.complianceStats.openIssues + govReport.complianceStats.inProgressIssues}
                </div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                <AlertOctagon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Overdue Issues */}
          <Card className="shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue Issues</div>
                <div className="text-2xl font-black text-red-600 font-mono">
                  {govReport.complianceStats.overdueIssues}
                </div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-500 border border-red-100">
                <AlertOctagon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Visual Analytics / Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Emissions Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Monthly Emissions Trend
            </CardTitle>
            <CardDescription>
              Carbon output trajectory over the last 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-56 flex items-end justify-between pt-6 px-4">
            {report.charts.monthlyEmissionsTrend.length === 0 ? (
              <div className="w-full text-center text-sm text-slate-400 py-12">No transactions recorded.</div>
            ) : (
              report.charts.monthlyEmissionsTrend.map((month) => {
                const heightPercent = Math.max((month.emissions / maxMonthEmissions) * 100, 4);
                return (
                  <div key={month.name} className="flex flex-col items-center flex-1 group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-mono whitespace-nowrap z-10 shadow-lg">
                      {month.emissions.toLocaleString()} kg CO₂
                    </div>
                    
                    {/* Bar */}
                    <div 
                      className="w-8 bg-gradient-to-t from-blue-600 to-sky-400 hover:from-blue-700 hover:to-sky-500 rounded-t transition-all duration-500 shadow-sm"
                      style={{ height: `${heightPercent}%` }}
                    />
                    
                    {/* Label */}
                    <span className="text-[11px] text-slate-500 font-semibold mt-2">{month.name}</span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Department Emissions Comparison */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-500" />
              Emissions by Department
            </CardTitle>
            <CardDescription>
              Comparative carbon output analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {report.charts.departmentComparison.length === 0 ? (
              <div className="text-center text-sm text-slate-400 py-12">No data available.</div>
            ) : (
              report.charts.departmentComparison.map((dept) => {
                const widthPercent = Math.max((dept.emissions / maxDeptEmissions) * 100, 3);
                return (
                  <div key={dept.code} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{dept.name} ({dept.code})</span>
                      <span className="font-mono text-slate-900">{dept.emissions.toLocaleString()} kg CO₂</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200 relative group">
                      <div 
                        className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full rounded-full transition-all duration-500 hover:from-emerald-700 hover:to-teal-500"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </section>

      {/* Goal Progress & Recent Activity Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goal Progress Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-indigo-500" />
              Sustainability Goal Progress
            </CardTitle>
            <CardDescription>
              Department goals tracking against carbon caps.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {report.goalProgress.length === 0 ? (
              <div className="text-center text-sm text-slate-400 py-6">No goals configured.</div>
            ) : (
              <div className="space-y-4">
                {report.goalProgress.slice(0, 4).map((goal) => {
                  const isCompleted = goal.status === "COMPLETED";
                  const isOver = goal.currentEmissions > goal.targetValue;

                  return (
                    <div key={goal.id} className="space-y-1 bg-slate-50/50 border border-slate-100 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs font-bold text-slate-950">{goal.title}</div>
                          <div className="text-[10px] text-slate-500 font-medium">Dept: {goal.departmentName}</div>
                        </div>
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border",
                            isCompleted 
                              ? "bg-green-50 text-green-700 border-green-200" 
                              : isOver 
                                ? "bg-red-50 text-red-700 border-red-200" 
                                : "bg-blue-50 text-blue-700 border-blue-200"
                          ].join(" ")}
                        >
                          {isCompleted ? "Completed" : isOver ? "Over Limit" : "Active"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-2">
                        <span>{goal.currentEmissions.toLocaleString()} kg CO₂</span>
                        <span>{goal.progress}% of {goal.targetValue.toLocaleString()} kg Limit</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                        <div
                          className={[
                            "h-full rounded-full",
                            isCompleted ? "bg-green-500" : isOver ? "bg-red-500" : "bg-indigo-500"
                          ].join(" ")}
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-500" />
              Recent Environmental Activity
            </CardTitle>
            <CardDescription>
              Last 5 operational carbon transactions.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {recentTransactions.length === 0 ? (
              <div className="text-center text-sm text-slate-400 py-6">No activity logged.</div>
            ) : (
              <div className="rounded-md border border-slate-100 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Dept</TableHead>
                      <TableHead className="text-xs">Source</TableHead>
                      <TableHead className="text-xs text-right">Emissions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((tx) => (
                      <TableRow key={tx.id} className="hover:bg-slate-50/20">
                        <TableCell className="text-xs py-2.5 font-medium">
                          {new Date(tx.transactionDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-xs py-2.5">{tx.department.code}</TableCell>
                        <TableCell className="text-xs py-2.5 text-slate-500">
                          <span className="capitalize">{tx.sourceType.toLowerCase()}</span>
                        </TableCell>
                        <TableCell className="text-xs py-2.5 text-right font-mono font-bold text-slate-900">
                          {Number(tx.calculatedEmission).toFixed(0)} kg
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Leaderboard Preview & Top Performers */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500 shrink-0" />
              Sustainability Leaderboard Top Performers
            </CardTitle>
            <CardDescription>
              Our organization's leading contributors driving ESG goals and values.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topPerformers.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-6">No leaderboard data recorded yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                {topPerformers.map((tp, idx) => {
                  return (
                    <div 
                      key={tp.id} 
                      className={[
                        "p-4 rounded-xl border flex flex-col justify-between relative shadow-sm",
                        idx === 0 
                          ? "border-amber-200 bg-amber-50/10" 
                          : idx === 1 
                            ? "border-slate-200 bg-slate-50/10" 
                            : "border-amber-600/20 bg-amber-700/5"
                      ].join(" ")}
                    >
                      <div className="absolute top-3 right-3 text-lg font-black text-slate-300">
                        #{tp.rank}
                      </div>
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 text-sm">{tp.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{tp.departmentName}</div>
                      </div>
                      <div className="mt-4 flex justify-between items-center text-xs">
                        <span className="font-bold text-amber-600 font-mono">{tp.totalXp} XP</span>
                        <span className="bg-slate-100 text-slate-650 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">
                          {tp.badgesCount} Badges
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
export default DashboardPage;
