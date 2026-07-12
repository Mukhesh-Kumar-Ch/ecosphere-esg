import { Award, Trophy, Users, ShieldAlert, Check } from "lucide-react";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { socialApi } from "./social-api";
import { useAuth } from "@/contexts/auth-context";
import { ErrorState, LoadingState } from "../administration/shared-state";

export function LeaderboardTab() {
  const { user } = useAuth();

  // Fetch Leaderboard
  const leaderboardQuery = useQuery({
    queryKey: ["social-leaderboard"],
    queryFn: () => socialApi.getLeaderboard(),
  });

  // Fetch All Badges
  const badgesQuery = useQuery({
    queryKey: ["social-badges"],
    queryFn: () => socialApi.getBadges(),
  });

  // Fetch My Badges
  const myBadgesQuery = useQuery({
    queryKey: ["my-badges", user?.id],
    queryFn: () => socialApi.getMyBadges(),
  });

  const loading = leaderboardQuery.isLoading || badgesQuery.isLoading || myBadgesQuery.isLoading;
  const isErr = leaderboardQuery.isError || badgesQuery.isError || myBadgesQuery.isError;

  if (loading) return <LoadingState label="Gamification Leaderboard" />;
  if (isErr) {
    const retryAll = () => {
      void leaderboardQuery.refetch();
      void badgesQuery.refetch();
      void myBadgesQuery.refetch();
    };
    return <ErrorState message="Failed to load leaderboard details." onRetry={retryAll} />;
  }

  const leaderboard = leaderboardQuery.data?.leaderboard ?? [];
  const badges = badgesQuery.data?.badges ?? [];
  const myBadges = myBadgesQuery.data?.badges ?? [];
  const myBadgeIds = new Set(myBadges.map((ub) => ub.badgeId));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      {/* 1. Leaderboard Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500 shrink-0" />
            Sustainability Leaderboard
          </CardTitle>
          <CardDescription>
            Live rankings of employees driving ESG goals through CSR and challenges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-12">No leaderboard data available.</div>
          ) : (
            <div className="rounded-md border border-slate-200 bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">Rank</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Total XP</TableHead>
                    <TableHead className="text-center">Badges</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((entry) => {
                    const isCurrentUser = entry.id === user?.id;
                    const isTopThree = entry.rank <= 3;
                    return (
                      <TableRow 
                        key={entry.id} 
                        className={isCurrentUser ? "bg-indigo-50/40 hover:bg-indigo-50/50" : ""}
                      >
                        <TableCell className="text-center py-3.5">
                          {isTopThree ? (
                            <span 
                              className={[
                                "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-black text-white",
                                entry.rank === 1 
                                  ? "bg-amber-400" 
                                  : entry.rank === 2 
                                    ? "bg-slate-350" 
                                    : "bg-amber-700"
                              ].join(" ")}
                            >
                              {entry.rank}
                            </span>
                          ) : (
                            <span className="font-mono text-sm font-semibold text-slate-500">{entry.rank}</span>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-900">
                          {entry.name}
                          {isCurrentUser && <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded">You</span>}
                          <div className="text-xs text-slate-400 font-normal mt-0.5">{entry.email}</div>
                        </TableCell>
                        <TableCell className="text-sm font-medium">{entry.departmentName}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-amber-600">
                          {entry.totalXp.toLocaleString()} XP
                        </TableCell>
                        <TableCell className="text-center font-mono font-bold text-xs text-indigo-600">
                          {entry.badgesCount} 🏆
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Badge Collection Catalog */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Award className="h-5 w-5 text-indigo-600 shrink-0" />
              Badge Catalog
            </CardTitle>
            <CardDescription className="text-xs">
              Earn badges by completing sustainability actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {badges.map((b) => {
              const unlocked = myBadgeIds.has(b.id);
              return (
                <div 
                  key={b.id} 
                  className={[
                    "p-3.5 rounded-xl border flex gap-3 relative transition shadow-sm",
                    unlocked 
                      ? "border-green-200 bg-green-50/20" 
                      : "border-slate-200 bg-white opacity-70"
                  ].join(" ")}
                >
                  <div 
                    className={[
                      "h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                      unlocked 
                        ? "bg-green-100 text-green-700 border border-green-200" 
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    ].join(" ")}
                  >
                    🏆
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-900">{b.name}</span>
                      {unlocked && (
                        <span className="bg-green-100 text-green-750 text-[9px] font-bold px-1.5 py-0.5 rounded border border-green-200 flex items-center gap-0.5">
                          <Check className="h-2.5 w-2.5" /> Unlocked
                        </span>
                      )}
                    </div>
                    {b.description && <p className="text-xs text-slate-500">{b.description}</p>}
                    <p className="text-[10px] text-slate-400 font-mono italic">Rule: {b.unlockRule}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
export default LeaderboardTab;
