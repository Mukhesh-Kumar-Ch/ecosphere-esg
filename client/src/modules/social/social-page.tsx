import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { socialApi } from "./social-api";
import { CsrTab } from "./csr-tab";
import { ParticipationTab } from "./participation-tab";
import { ChallengesTab } from "./challenges-tab";
import { RewardsTab } from "./rewards-tab";
import { LeaderboardTab } from "./leaderboard-tab";
import { ErrorState, LoadingState } from "../administration/shared-state";

export function SocialPage() {
  const [tab, setTab] = useState("csr");

  const reportQuery = useQuery({
    queryKey: ["social-report"],
    queryFn: () => socialApi.getSocialReport(),
  });

  const isLoading = reportQuery.isLoading;
  const isError = reportQuery.isError;

  if (isLoading) return <LoadingState label="Social Dashboard" />;
  if (isError) return <ErrorState message="Failed to load social report statistics." onRetry={reportQuery.refetch} />;

  const report = reportQuery.data!;

  return (
    <div className="space-y-6">
      {/* Executive Social Scorecard */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Social Score */}
        <Card className="relative overflow-hidden hover:shadow-md transition-shadow bg-white border border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
              Social Rating
            </CardDescription>
            <CardTitle className="text-3xl font-black mt-1 font-mono text-slate-900">{report.socialScore}</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-[11px] font-medium text-slate-500">Composite Score</div>
          </CardContent>
        </Card>

        {/* CSR Participation Rate */}
        <Card className="relative overflow-hidden hover:shadow-md transition-shadow bg-white border border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
              CSR Approval Rate
            </CardDescription>
            <CardTitle className="text-3xl font-black mt-1 font-mono text-emerald-700">
              {report.csr.csrParticipationRate}%
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-[11px] font-medium text-slate-500">
              {report.csr.approvedParticipations} of {report.csr.totalParticipations} approved
            </div>
          </CardContent>
        </Card>

        {/* Challenge Completion Rate */}
        <Card className="relative overflow-hidden hover:shadow-md transition-shadow bg-white border border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
              Challenge Completion
            </CardDescription>
            <CardTitle className="text-3xl font-black mt-1 font-mono text-indigo-700">
              {report.challenges.challengeCompletionRate}%
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-[11px] font-medium text-slate-500">
              {report.challenges.completedChallengeParticipations} of {report.challenges.totalChallengeParticipations} completed
            </div>
          </CardContent>
        </Card>

        {/* Training Completion Rate */}
        <Card className="relative overflow-hidden hover:shadow-md transition-shadow bg-white border border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
              Training Completion
            </CardDescription>
            <CardTitle className="text-3xl font-black mt-1 font-mono text-blue-700">
              {report.training.trainingCompletionRate}%
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-[11px] font-medium text-slate-500">
              {report.training.completedTrainings} of {report.training.totalTrainings} completed
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Main Tabs Container */}
      <Card>
        <CardHeader>
          <CardTitle>Social & Gamification Workspace</CardTitle>
          <CardDescription>
            Manage Corporate Social Responsibility activities, track challenges, redeem rewards, and monitor leaderboards.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs onValueChange={setTab} value={tab}>
            <TabsList className="mb-6">
              <TabsTrigger value="csr">CSR Activities</TabsTrigger>
              <TabsTrigger value="participation">Evidence & Sign-offs</TabsTrigger>
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
              <TabsTrigger value="rewards">Rewards Store</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard & Badges</TabsTrigger>
            </TabsList>

            <TabsContent value="csr">
              <CsrTab />
            </TabsContent>

            <TabsContent value="participation">
              <ParticipationTab />
            </TabsContent>

            <TabsContent value="challenges">
              <ChallengesTab />
            </TabsContent>

            <TabsContent value="rewards">
              <RewardsTab />
            </TabsContent>

            <TabsContent value="leaderboard">
              <LeaderboardTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
export default SocialPage;
