import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { governanceApi } from "./governance-api";
import { PoliciesTab } from "./policies-tab";
import { AcknowledgementsTab } from "./acknowledgements-tab";
import { AuditsTab } from "./audits-tab";
import { ComplianceTab } from "./compliance-tab";
import { ShieldAlert, BookOpen, Clipboard, BarChart } from "lucide-react";
import { ErrorState, LoadingState } from "../administration/shared-state";

export function GovernancePage() {
  const [tab, setTab] = useState("policies");

  const reportQuery = useQuery({
    queryKey: ["governance-report"],
    queryFn: () => governanceApi.getGovernanceReport(),
  });

  const isLoading = reportQuery.isLoading;
  const isError = reportQuery.isError;

  if (isLoading) return <LoadingState label="Governance Dashboard" />;
  if (isError) return <ErrorState message="Failed to load governance scorecard." onRetry={reportQuery.refetch} />;

  const report = reportQuery.data!;

  return (
    <div className="space-y-6">
      {/* Executive Governance Scorecard */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Governance Score */}
        <Card className="bg-slate-900 text-white shadow-md relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400 font-semibold text-xs uppercase tracking-wider">
              Governance Rating
            </CardDescription>
            <CardTitle className="text-3xl font-black mt-1 font-mono">{report.governanceScore}</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-[11px] font-medium text-slate-300">Composite Index</div>
          </CardContent>
        </Card>

        {/* Policy Compliance */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
              Policy Compliance
            </CardDescription>
            <CardTitle className="text-3xl font-black mt-1 font-mono text-green-700">
              {report.policyStats.policyComplianceRate}%
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-[11px] font-medium text-slate-500">Employee sign-off rate</div>
          </CardContent>
        </Card>

        {/* Audit Score */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
              Avg Audit Performance
            </CardDescription>
            <CardTitle className="text-3xl font-black mt-1 font-mono text-blue-700">
              {report.auditSummary.averageAuditScore}%
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-[11px] font-medium text-slate-500">Across {report.auditSummary.totalAudits} audits</div>
          </CardContent>
        </Card>

        {/* Compliance Issues */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
              Open Violations
            </CardDescription>
            <CardTitle className="text-3xl font-black mt-1 font-mono text-red-600">
              {report.complianceStats.openIssues + report.complianceStats.inProgressIssues + report.complianceStats.overdueIssues}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-[11px] font-medium text-slate-500">
              {report.complianceStats.overdueIssues} flagged as overdue
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Main Tabs Container */}
      <Card>
        <CardHeader>
          <CardTitle>Governance Control Center</CardTitle>
          <CardDescription>
            Manage organizational compliance guidelines, track scheduled department audits, monitor open compliance issues, and record employee policy acknowledgements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs onValueChange={setTab} value={tab}>
            <TabsList className="mb-6">
              <TabsTrigger value="policies">ESG Policies</TabsTrigger>
              <TabsTrigger value="acknowledgements">Acknowledge Policies</TabsTrigger>
              <TabsTrigger value="audits">Compliance Audits</TabsTrigger>
              <TabsTrigger value="compliance">Compliance Issues</TabsTrigger>
            </TabsList>

            <TabsContent value="policies">
              <PoliciesTab />
            </TabsContent>

            <TabsContent value="acknowledgements">
              <AcknowledgementsTab />
            </TabsContent>

            <TabsContent value="audits">
              <AuditsTab />
            </TabsContent>

            <TabsContent value="compliance">
              <ComplianceTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
export default GovernancePage;
