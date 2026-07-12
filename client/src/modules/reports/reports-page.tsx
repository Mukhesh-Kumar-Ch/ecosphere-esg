import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { reportsApi, type EsgSummaryReport, type CustomReportResult } from "./reports-api";
import { administrationApi } from "../administration/administration-api";
import { governanceApi } from "../governance/governance-api";
import { socialApi } from "../social/social-api";
import { exportToCsv } from "./export-utils";
import { ErrorState, LoadingState, EmptyState } from "../administration/shared-state";
import {
  FileText,
  BarChart3,
  Users,
  ShieldCheck,
  TrendingUp,
  Award,
  Download,
  Filter,
  RefreshCw,
  Search,
  Calendar,
  Layers,
  Heart,
  Globe,
  Settings2
} from "lucide-react";

export function ReportsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"summary" | "environmental" | "social" | "governance" | "custom">("summary");

  // Search/Filters for individual report views
  const [summarySearch, setSummarySearch] = useState("");
  const [envSearch, setEnvSearch] = useState("");
  const [socSearch, setSocSearch] = useState("");
  const [govSearch, setGovSearch] = useState("");

  // Custom report builder states
  const [customDeptId, setCustomDeptId] = useState("");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [customModule, setCustomModule] = useState<"ENVIRONMENT" | "SOCIAL" | "GOVERNANCE" | "ALL">("ALL");
  const [customUserId, setCustomUserId] = useState("");
  const [customChallengeId, setCustomChallengeId] = useState("");
  const [customCategoryId, setCustomCategoryId] = useState("");
  const [customReportData, setCustomReportData] = useState<CustomReportResult | null>(null);

  // Queries for dropdown selectors
  const deptsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: () => administrationApi.getDepartments(),
  });

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => governanceApi.getUsers(),
  });

  const challengesQuery = useQuery({
    queryKey: ["challenges"],
    queryFn: () => socialApi.getChallenges(),
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => administrationApi.getCategories(),
  });

  // Fetch ESG Summary Report
  const esgSummaryQuery = useQuery({
    queryKey: ["esg-summary-report"],
    queryFn: () => reportsApi.getEsgSummaryReport(),
  });

  // Fetch individual reports
  const envReportQuery = useQuery({
    queryKey: ["environmental-report"],
    queryFn: () => reportsApi.getEnvironmentReport(),
  });

  const socReportQuery = useQuery({
    queryKey: ["social-report"],
    queryFn: () => reportsApi.getSocialReport(),
  });

  const govReportQuery = useQuery({
    queryKey: ["governance-report"],
    queryFn: () => reportsApi.getGovernanceReport(),
  });

  // Generate Custom Report Mutation
  const generateCustomMutation = useMutation({
    mutationFn: reportsApi.generateCustomReport,
    onSuccess: (data) => {
      setCustomReportData(data);
      toast({ title: "Report Generated", description: "Custom data filters applied successfully." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to generate custom report." });
    },
  });

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateCustomMutation.mutate({
      departmentId: customDeptId || null,
      startDate: customStartDate || null,
      endDate: customEndDate || null,
      module: customModule,
      userId: customUserId || null,
      challengeId: customChallengeId || null,
      categoryId: customCategoryId || null,
    });
  };

  // CSV Export handlers
  const handleExportSummary = () => {
    if (!esgSummaryQuery.data) return;
    const summary = esgSummaryQuery.data;

    // Export Department Rankings
    const headers = ["Department Code", "Department Name", "Environmental Rating", "Social Rating", "Governance Rating", "Overall ESG Score", "Total Carbon emissions (kg CO2)"];
    const rows = summary.departmentRankings.map((dept) => [
      dept.code,
      dept.name,
      `${dept.environmentalScore}%`,
      `${dept.socialScore}%`,
      `${dept.governanceScore}%`,
      `${dept.overallScore}%`,
      dept.totalEmissions,
    ]);

    exportToCsv("ESG_Summary_Department_Rankings.csv", headers, rows);
  };

  const handleExportEnvironmental = () => {
    if (!envReportQuery.data) return;
    const env = envReportQuery.data;

    const headers = ["Goal Title", "Department Name", "Target Limit (kg CO2)", "Current emissions", "Progress (%)", "Deadline", "Status"];
    const rows = env.goalProgress.map((goal) => [
      goal.title,
      goal.departmentName,
      goal.targetValue,
      goal.currentEmissions,
      `${goal.progress}%`,
      new Date(goal.deadline).toLocaleDateString(),
      goal.status,
    ]);

    exportToCsv("Environmental_Goals_Report.csv", headers, rows);
  };

  const handleExportSocial = () => {
    if (!socReportQuery.data) return;
    const soc = socReportQuery.data;

    const headers = ["Metric Item", "Approved/Completed Value", "Total/Target Value", "Completion Rate (%)"];
    const rows = [
      ["CSR Activity Participation", soc.csr.approvedParticipations, soc.csr.totalParticipations, `${soc.csr.csrParticipationRate}%`],
      ["Sustainability Challenges Completed", soc.challenges.completedChallengeParticipations, soc.challenges.totalChallengeParticipations, `${soc.challenges.challengeCompletionRate}%`],
      ["ESG Employee Training courses", soc.training.completedTrainings, soc.training.totalTrainings, `${soc.training.trainingCompletionRate}%`],
    ];

    exportToCsv("Social_Performance_Report.csv", headers, rows);
  };

  const handleExportGovernance = () => {
    if (!govReportQuery.data) return;
    const gov = govReportQuery.data;

    const headers = ["Governance Scope", "Resolved/Approved Count", "Total Count", "Compliance Rate (%)"];
    const rows = [
      ["ESG Policy Acknowledgements", gov.policyStats.totalAcknowledgements, gov.policyStats.activePolicies, `${gov.policyStats.policyComplianceRate}%`],
      ["Overdue Compliance Violations", gov.complianceStats.resolvedIssues, gov.complianceStats.totalIssues, `${Math.round((gov.complianceStats.resolvedIssues / Math.max(gov.complianceStats.totalIssues, 1)) * 100)}%`],
      ["ESG Internal Audits Completed", gov.auditSummary.completedAudits, gov.auditSummary.totalAudits, `${Math.round((gov.auditSummary.completedAudits / Math.max(gov.auditSummary.totalAudits, 1)) * 100)}%`],
    ];

    exportToCsv("Governance_Compliance_Report.csv", headers, rows);
  };

  const handleExportCustom = () => {
    if (!customReportData) return;
    const data = customReportData.results;

    // We can export carbon transactions if available
    if (data.carbonTransactions && data.carbonTransactions.length > 0) {
      const headers = ["Date", "Department", "Source Type", "Quantity", "Calculated Emissions (kg CO2)", "Recorded By"];
      const rows = data.carbonTransactions.map((tx) => [
        new Date(tx.transactionDate).toLocaleDateString(),
        tx.department.name,
        tx.sourceType,
        tx.quantity,
        tx.calculatedEmission,
        tx.creator.name,
      ]);
      exportToCsv("Custom_Environmental_Report.csv", headers, rows);
    } else if (data.csrParticipations && data.csrParticipations.length > 0) {
      const headers = ["Activity Title", "Participant Name", "Department", "Proof", "Approval Status", "Date Joined"];
      const rows = data.csrParticipations.map((part) => [
        part.activity.title,
        part.user.name,
        part.user.department?.name ?? "N/A",
        part.proofFile ?? "None",
        part.approvalStatus,
        new Date(part.createdAt).toLocaleDateString(),
      ]);
      exportToCsv("Custom_Social_CSR_Report.csv", headers, rows);
    } else {
      toast({ title: "Export Info", description: "Select specific modules or results to download." });
    }
  };

  const loading =
    esgSummaryQuery.isLoading ||
    envReportQuery.isLoading ||
    socReportQuery.isLoading ||
    govReportQuery.isLoading;

  const isErr =
    esgSummaryQuery.isError ||
    envReportQuery.isError ||
    socReportQuery.isError ||
    govReportQuery.isError;

  if (loading) return <LoadingState label="ESG Reports Dashboard" />;
  if (isErr) {
    const retryAll = () => {
      void esgSummaryQuery.refetch();
      void envReportQuery.refetch();
      void socReportQuery.refetch();
      void govReportQuery.refetch();
    };
    return <ErrorState message="Failed to load ESG reporting metrics." onRetry={retryAll} />;
  }

  const esgSummary = esgSummaryQuery.data!;
  const envReport = envReportQuery.data!;
  const socReport = socReportQuery.data!;
  const govReport = govReportQuery.data!;

  const departments = deptsQuery.data?.departments ?? [];
  const users = usersQuery.data?.users ?? [];
  const challenges = challengesQuery.data?.challenges ?? [];
  const categories = categoriesQuery.data?.categories ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
      {/* Sidebar Submenu */}
      <aside className="space-y-2">
        <h3 className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Report Views</h3>
        <button
          onClick={() => setActiveTab("summary")}
          type="button"
          className={[
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition text-left",
            activeTab === "summary"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-650 hover:bg-slate-100 hover:text-slate-950",
          ].join(" ")}
        >
          <Globe className="h-4 w-4 shrink-0" />
          ESG Summary
        </button>
        <button
          onClick={() => setActiveTab("environmental")}
          type="button"
          className={[
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition text-left",
            activeTab === "environmental"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-650 hover:bg-slate-100 hover:text-slate-950",
          ].join(" ")}
        >
          <TrendingUp className="h-4 w-4 shrink-0" />
          Environmental Report
        </button>
        <button
          onClick={() => setActiveTab("social")}
          type="button"
          className={[
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition text-left",
            activeTab === "social"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-650 hover:bg-slate-100 hover:text-slate-950",
          ].join(" ")}
        >
          <Heart className="h-4 w-4 shrink-0" />
          Social Report
        </button>
        <button
          onClick={() => setActiveTab("governance")}
          type="button"
          className={[
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition text-left",
            activeTab === "governance"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-650 hover:bg-slate-100 hover:text-slate-950",
          ].join(" ")}
        >
          <ShieldCheck className="h-4 w-4 shrink-0" />
          Governance Report
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          type="button"
          className={[
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition text-left",
            activeTab === "custom"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-650 hover:bg-slate-100 hover:text-slate-950",
          ].join(" ")}
        >
          <Filter className="h-4 w-4 shrink-0" />
          Custom Report Builder
        </button>
      </aside>

      {/* Main Report Dashboard */}
      <main className="space-y-6">
        {/* 1. ESG Summary Tab */}
        {activeTab === "summary" && (
          <div className="space-y-6">
            <section className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-900">Executive Summary</h2>
                <p className="text-sm text-slate-500">Live dynamic reporting from all operational nodes.</p>
              </div>
              <Button onClick={handleExportSummary} type="button">
                <Download className="mr-2 h-4 w-4" /> Export Rankings
              </Button>
            </section>

            {/* Scorecard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-900 text-white shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Layers className="h-20 w-20" />
                </div>
                <CardHeader className="pb-1 pt-5">
                  <CardDescription className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Overall ESG Rating</CardDescription>
                  <CardTitle className="text-3xl font-black mt-1 font-mono">{esgSummary.scores.overallScore}</CardTitle>
                </CardHeader>
                <CardContent className="pb-5">
                  <div className="text-[11px] text-slate-300">
                    E ({esgSummary.scores.weights.environmental}%) S ({esgSummary.scores.weights.social}%) G ({esgSummary.scores.weights.governance}%)
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-1 pt-5">
                  <CardDescription className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider">Environmental Rating</CardDescription>
                  <CardTitle className="text-3xl font-black mt-1 font-mono text-green-700">{esgSummary.scores.environmentalScore}</CardTitle>
                </CardHeader>
                <CardContent className="pb-5">
                  <div className="text-[11px] text-slate-500">Resource limits & emissions</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-1 pt-5">
                  <CardDescription className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider">Social Rating</CardDescription>
                  <CardTitle className="text-3xl font-black mt-1 font-mono text-emerald-700">{esgSummary.scores.socialScore}</CardTitle>
                </CardHeader>
                <CardContent className="pb-5">
                  <div className="text-[11px] text-slate-500">CSR, challenges, & training</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-1 pt-5">
                  <CardDescription className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider">Governance Rating</CardDescription>
                  <CardTitle className="text-3xl font-black mt-1 font-mono text-indigo-700">{esgSummary.scores.governanceScore}</CardTitle>
                </CardHeader>
                <CardContent className="pb-5">
                  <div className="text-[11px] text-slate-500">Audit & policies compliance</div>
                </CardContent>
              </Card>
            </div>

            {/* Department Rankings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-500" />
                  Department Rankings
                </CardTitle>
                <CardDescription>
                  ESG performance and metrics grouped by business departments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-slate-200 bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-center">Environmental</TableHead>
                        <TableHead className="text-center">Social</TableHead>
                        <TableHead className="text-center">Governance</TableHead>
                        <TableHead className="text-right">Overall ESG</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {esgSummary.departmentRankings.map((dept) => (
                        <TableRow key={dept.id}>
                          <TableCell className="font-mono text-xs font-semibold">{dept.code}</TableCell>
                          <TableCell className="font-semibold text-slate-900">{dept.name}</TableCell>
                          <TableCell className="text-center font-mono text-xs text-green-700 font-bold">{dept.environmentalScore}%</TableCell>
                          <TableCell className="text-center font-mono text-xs text-emerald-700 font-bold">{dept.socialScore}%</TableCell>
                          <TableCell className="text-center font-mono text-xs text-indigo-700 font-bold">{dept.governanceScore}%</TableCell>
                          <TableCell className="text-right font-mono font-black text-slate-950">{dept.overallScore}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  Top Contributors
                </CardTitle>
                <CardDescription>
                  Leading employees ranked by sustainability achievements.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-slate-200 bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16 text-center">Rank</TableHead>
                        <TableHead>Contributor</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-right">Total XP</TableHead>
                        <TableHead className="text-center">Badges</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {esgSummary.topContributors.slice(0, 5).map((tc, idx) => (
                        <TableRow key={tc.id}>
                          <TableCell className="text-center font-bold text-xs">{idx + 1}</TableCell>
                          <TableCell className="font-semibold text-slate-900">
                            {tc.name}
                            <div className="text-xs text-slate-400 font-normal mt-0.5">{tc.email}</div>
                          </TableCell>
                          <TableCell className="text-sm font-medium">{tc.departmentName}</TableCell>
                          <TableCell className="text-right font-mono font-bold text-amber-600">{tc.totalXp} XP</TableCell>
                          <TableCell className="text-center">{tc.badgesCount} 🏆</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 2. Environmental Report Tab */}
        {activeTab === "environmental" && (
          <div className="space-y-6">
            <section className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-900">Environmental Dashboard</h2>
                <p className="text-sm text-slate-500">Live environmental caps and carbon totals.</p>
              </div>
              <Button onClick={handleExportEnvironmental} type="button">
                <Download className="mr-2 h-4 w-4" /> Export Goals
              </Button>
            </section>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-1 pt-5">
                  <CardDescription className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider">Total Emissions</CardDescription>
                  <CardTitle className="text-2xl font-black mt-1 font-mono text-blue-700">
                    {envReport.summary.totalEmissions.toLocaleString()} <span className="text-xs font-normal">kg CO₂</span>
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-1 pt-5">
                  <CardDescription className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider">This Month</CardDescription>
                  <CardTitle className="text-2xl font-black mt-1 font-mono text-emerald-700">
                    {envReport.summary.monthlyEmissions.toLocaleString()} <span className="text-xs font-normal">kg CO₂</span>
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-1 pt-5">
                  <CardDescription className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider">Today's Total</CardDescription>
                  <CardTitle className="text-2xl font-black mt-1 font-mono text-indigo-700">
                    {envReport.summary.todayEmissions.toLocaleString()} <span className="text-xs font-normal">kg CO₂</span>
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Goals Table */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-bold">Goal Targets Progress</CardTitle>
                  <Input
                    placeholder="Search goals..."
                    value={envSearch}
                    onChange={(e) => setEnvSearch(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  const filtered = envReport.goalProgress.filter(
                    (g) =>
                      g.title.toLowerCase().includes(envSearch.toLowerCase()) ||
                      g.departmentName.toLowerCase().includes(envSearch.toLowerCase())
                  );

                  if (filtered.length === 0) {
                    return <EmptyState title="No Goals Found" description="Try broadening your search query." />;
                  }

                  return (
                    <div className="rounded-md border border-slate-200 bg-white">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Goal</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead className="text-right">Target Limit</TableHead>
                            <TableHead className="text-right">Current emissions</TableHead>
                            <TableHead className="text-right">Progress</TableHead>
                            <TableHead>Deadline</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filtered.map((goal) => (
                            <TableRow key={goal.id}>
                              <TableCell className="font-semibold text-slate-900">{goal.title}</TableCell>
                              <TableCell className="text-sm font-medium">{goal.departmentName}</TableCell>
                              <TableCell className="text-right font-mono text-xs">{goal.targetValue.toLocaleString()} kg</TableCell>
                              <TableCell className="text-right font-mono text-xs font-bold text-slate-700">{goal.currentEmissions.toLocaleString()} kg</TableCell>
                              <TableCell className="text-right font-mono text-xs font-bold text-indigo-750">{goal.progress}%</TableCell>
                              <TableCell className="text-xs text-slate-500">{new Date(goal.deadline).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border bg-slate-50 text-slate-600 border-slate-200">
                                  {goal.status}
                                </span>
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
          </div>
        )}

        {/* 3. Social Report Tab */}
        {activeTab === "social" && (
          <div className="space-y-6">
            <section className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-900">Social & Gamification Dashboard</h2>
                <p className="text-sm text-slate-500">Live social score, CSR initiatives, and learning metrics.</p>
              </div>
              <Button onClick={handleExportSocial} type="button">
                <Download className="mr-2 h-4 w-4" /> Export CSR Summary
              </Button>
            </section>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-1 pt-5">
                  <CardDescription className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider">CSR Participation Rate</CardDescription>
                  <CardTitle className="text-2xl font-black mt-1 font-mono text-emerald-700">
                    {socReport.csr.csrParticipationRate}%
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-1 pt-5">
                  <CardDescription className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider">Challenges Completed</CardDescription>
                  <CardTitle className="text-2xl font-black mt-1 font-mono text-indigo-700">
                    {socReport.challenges.challengeCompletionRate}%
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-1 pt-5">
                  <CardDescription className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider">Training Completion Rate</CardDescription>
                  <CardTitle className="text-2xl font-black mt-1 font-mono text-blue-700">
                    {socReport.training.trainingCompletionRate}%
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* CSR Summary List */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-bold">Social KPI Details</CardTitle>
                  <Input
                    placeholder="Search CSR activity stats..."
                    value={socSearch}
                    onChange={(e) => setSocSearch(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-slate-200 bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ESG Dimension</TableHead>
                        <TableHead className="text-right">Approved / Completed</TableHead>
                        <TableHead className="text-right">Total Submissions</TableHead>
                        <TableHead className="text-right">Efficiency Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-semibold text-slate-900">Corporate Social Responsibility (CSR)</TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold text-slate-700">{socReport.csr.approvedParticipations}</TableCell>
                        <TableCell className="text-right font-mono text-xs text-slate-500">{socReport.csr.totalParticipations}</TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold text-emerald-700">{socReport.csr.csrParticipationRate}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold text-slate-900">Sustainability Challenges</TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold text-slate-700">{socReport.challenges.completedChallengeParticipations}</TableCell>
                        <TableCell className="text-right font-mono text-xs text-slate-500">{socReport.challenges.totalChallengeParticipations}</TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold text-indigo-700">{socReport.challenges.challengeCompletionRate}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold text-slate-900">Employee Training Courses</TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold text-slate-700">{socReport.training.completedTrainings}</TableCell>
                        <TableCell className="text-right font-mono text-xs text-slate-500">{socReport.training.totalTrainings}</TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold text-blue-700">{socReport.training.trainingCompletionRate}%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 4. Governance Report Tab */}
        {activeTab === "governance" && (
          <div className="space-y-6">
            <section className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-900">Governance & Compliance Dashboard</h2>
                <p className="text-sm text-slate-500">Audited policy compliance and active issues tracking.</p>
              </div>
              <Button onClick={handleExportGovernance} type="button">
                <Download className="mr-2 h-4 w-4" /> Export Violations
              </Button>
            </section>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-1 pt-5">
                  <CardDescription className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider">Policy compliance rate</CardDescription>
                  <CardTitle className="text-2xl font-black mt-1 font-mono text-indigo-700">
                    {govReport.policyStats.policyComplianceRate}%
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-1 pt-5">
                  <CardDescription className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider">Internal Audits Scheduled</CardDescription>
                  <CardTitle className="text-2xl font-black mt-1 font-mono text-blue-700">
                    {govReport.auditSummary.totalAudits} <span className="text-xs font-normal">audits</span>
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-1 pt-5">
                  <CardDescription className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider">Overdue Issues</CardDescription>
                  <CardTitle className="text-2xl font-black mt-1 font-mono text-red-650">
                    {govReport.complianceStats.overdueIssues} <span className="text-xs font-normal">unresolved</span>
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Audit Scorecard */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold">Policy & Audit Compliance Ledger</CardTitle>
                <CardDescription>Status summaries across compliance cycles.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-slate-200 bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Audit Dimension</TableHead>
                        <TableHead className="text-right">Completed Count</TableHead>
                        <TableHead className="text-right">Total Count</TableHead>
                        <TableHead className="text-right">Compliance Rating</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-semibold text-slate-900">Internal Audit Cycles</TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold text-slate-700">{govReport.auditSummary.completedAudits}</TableCell>
                        <TableCell className="text-right font-mono text-xs text-slate-500">{govReport.auditSummary.totalAudits}</TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold text-indigo-750">{govReport.auditSummary.averageAuditScore}/100 Score</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold text-slate-900">Compliance Issue Resolution</TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold text-slate-700">{govReport.complianceStats.resolvedIssues}</TableCell>
                        <TableCell className="text-right font-mono text-xs text-slate-500">{govReport.complianceStats.totalIssues}</TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold text-green-700">
                          {Math.round((govReport.complianceStats.resolvedIssues / Math.max(govReport.complianceStats.totalIssues, 1)) * 100)}%
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 5. Custom Report Builder Tab */}
        {activeTab === "custom" && (
          <div className="space-y-6">
            <section className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-900">Custom Report Builder</h2>
                <p className="text-sm text-slate-500">Cross-reference indicators across departments, employees, and goals.</p>
              </div>
              {customReportData && (
                <Button onClick={handleExportCustom} type="button">
                  <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
              )}
            </section>

            {/* Filter controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Settings2 className="h-4 w-4 text-slate-400" />
                  Report Configurations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCustomSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="custom-module">ESG Module</Label>
                      <Select
                        id="custom-module"
                        value={customModule}
                        onChange={(e) => setCustomModule(e.target.value as any)}
                      >
                        <option value="ALL">All Modules</option>
                        <option value="ENVIRONMENT">Environmental</option>
                        <option value="SOCIAL">Social</option>
                        <option value="GOVERNANCE">Governance</option>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="custom-dept">Department</Label>
                      <Select
                        id="custom-dept"
                        value={customDeptId}
                        onChange={(e) => setCustomDeptId(e.target.value)}
                      >
                        <option value="">All Departments</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="custom-user">Employee</Label>
                      <Select
                        id="custom-user"
                        value={customUserId}
                        onChange={(e) => setCustomUserId(e.target.value)}
                      >
                        <option value="">All Employees</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="custom-start">Start Date</Label>
                      <Input
                        id="custom-start"
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="custom-end">End Date</Label>
                      <Input
                        id="custom-end"
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="custom-cat">ESG Category</Label>
                      <Select
                        id="custom-cat"
                        value={customCategoryId}
                        onChange={(e) => setCustomCategoryId(e.target.value)}
                      >
                        <option value="">All Categories</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={generateCustomMutation.isPending}>
                      <RefreshCw className="mr-2 h-4 w-4" /> Run Query
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Custom Report Results Area */}
            {customReportData && (
              <div className="space-y-6">
                {/* Environmental Results */}
                {customReportData.results.carbonTransactions && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-bold">Environmental Matches (Carbon Transactions)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {customReportData.results.carbonTransactions.length === 0 ? (
                        <div className="text-xs text-slate-450 italic py-2">No matching transactions found.</div>
                      ) : (
                        <div className="rounded-md border border-slate-200 bg-white">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Source Type</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Emissions (kg CO2)</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {customReportData.results.carbonTransactions.map((tx) => (
                                <TableRow key={tx.id}>
                                  <TableCell className="text-xs font-mono">{new Date(tx.transactionDate).toLocaleDateString()}</TableCell>
                                  <TableCell className="font-semibold text-slate-900">{tx.department.name}</TableCell>
                                  <TableCell className="text-slate-500 font-mono text-xs">{tx.sourceType}</TableCell>
                                  <TableCell className="text-right font-mono text-xs">{Number(tx.quantity).toFixed(1)}</TableCell>
                                  <TableCell className="text-right font-mono text-xs font-bold text-indigo-700">{Number(tx.calculatedEmission).toFixed(0)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Social Matches */}
                {customReportData.results.csrParticipations && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-bold">Social Matches (CSR Participations)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {customReportData.results.csrParticipations.length === 0 ? (
                        <div className="text-xs text-slate-450 italic py-2">No matching CSR participations found.</div>
                      ) : (
                        <div className="rounded-md border border-slate-200 bg-white">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>CSR Activity</TableHead>
                                <TableHead>Employee</TableHead>
                                <TableHead>Proof Document</TableHead>
                                <TableHead>Approval Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {customReportData.results.csrParticipations.map((part) => (
                                <TableRow key={part.id}>
                                  <TableCell className="font-semibold text-slate-900">{part.activity.title}</TableCell>
                                  <TableCell className="text-sm font-medium">{part.user.name}</TableCell>
                                  <TableCell className="text-xs text-slate-500">{part.proofFile ?? "None"}</TableCell>
                                  <TableCell>
                                    <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold bg-slate-100 border text-slate-700">
                                      {part.approvalStatus}
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
                )}

                {/* Governance Matches */}
                {customReportData.results.complianceIssues && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-bold">Governance Matches (Compliance Issues)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {customReportData.results.complianceIssues.length === 0 ? (
                        <div className="text-xs text-slate-450 italic py-2">No matching compliance issues found.</div>
                      ) : (
                        <div className="rounded-md border border-slate-200 bg-white">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Issue Title</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {customReportData.results.complianceIssues.map((issue) => (
                                <TableRow key={issue.id}>
                                  <TableCell className="font-semibold text-slate-900">{issue.title}</TableCell>
                                  <TableCell className="text-sm font-medium">{issue.department.name}</TableCell>
                                  <TableCell>
                                    <span className="text-xs font-bold font-mono text-indigo-705">{issue.severity}</span>
                                  </TableCell>
                                  <TableCell className="text-xs text-slate-500 font-mono">{new Date(issue.dueDate).toLocaleDateString()}</TableCell>
                                  <TableCell>
                                    <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold bg-slate-100 border text-slate-700">
                                      {issue.status}
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
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
export default ReportsPage;
