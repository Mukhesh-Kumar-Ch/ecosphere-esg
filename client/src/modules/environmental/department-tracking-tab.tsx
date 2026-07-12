import { ArrowDown, ArrowUp, Minus, TrendingDown, TrendingUp, CheckCircle, BarChart3 } from "lucide-react";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { environmentalApi } from "./environmental-api";
import { ErrorState, LoadingState } from "../administration/shared-state";

export function DepartmentTrackingTab() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["environment-report"],
    queryFn: () => environmentalApi.getEnvironmentReport(),
  });

  if (isLoading) return <LoadingState label="Department Carbon Tracking" />;
  if (error) return <ErrorState message={error.message || "Failed to load tracking report."} onRetry={refetch} />;

  const tracking = data?.departmentTracking ?? [];
  const chartData = data?.charts ?? { monthlyEmissionsTrend: [], departmentComparison: [] };
  const goalProgress = data?.goalProgress ?? [];

  // Calculate highest emissions for department comparison scale
  const maxDeptEmissions = Math.max(...chartData.departmentComparison.map((d) => d.emissions), 1);
  // Calculate highest monthly emissions for trend chart scale
  const maxMonthEmissions = Math.max(...chartData.monthlyEmissionsTrend.map((m) => m.emissions), 1);

  return (
    <div className="space-y-8">
      {/* Department Cards Grid */}
      <div>
        <h3 className="text-base font-semibold text-slate-900 mb-4">Department Carbon Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracking.map((dept) => {
            const hasTrend = dept.trend !== 0;
            const isTrendGood = dept.trend < 0; // Negative emissions growth is good!
            const completionRate = dept.totalGoalsCount > 0 
              ? (dept.completedGoalsCount / dept.totalGoalsCount) * 100 
              : 0;

            return (
              <Card key={dept.id} className="relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-slate-300 bg-white">
                {/* Decorative Top Accent */}
                <div 
                  className={[
                    "absolute top-0 left-0 right-0 h-1",
                    isTrendGood ? "bg-green-500" : dept.trend > 0 ? "bg-red-500" : "bg-slate-300"
                  ].join(" ")}
                />
                
                <CardHeader className="pb-2 pt-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900">{dept.name}</CardTitle>
                      <CardDescription className="text-xs font-mono">{dept.code}</CardDescription>
                    </div>

                    {/* Trend Badge */}
                    <span
                      className={[
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold border",
                        !hasTrend 
                          ? "bg-slate-50 text-slate-500 border-slate-200"
                          : isTrendGood 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : "bg-red-50 text-red-700 border-red-200"
                      ].join(" ")}
                    >
                      {!hasTrend ? (
                        <>
                          <Minus className="h-3 w-3" />
                          Stable
                        </>
                      ) : isTrendGood ? (
                        <>
                          <ArrowDown className="h-3 w-3 text-green-600" />
                          {Math.abs(dept.trend)}%
                        </>
                      ) : (
                        <>
                          <ArrowUp className="h-3 w-3 text-red-600" />
                          +{dept.trend}%
                        </>
                      )}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Emissions Counter */}
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Monthly Carbon Output</div>
                    <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                      {dept.totalEmissions.toLocaleString()}{" "}
                      <span className="text-sm font-normal text-slate-500">kg CO₂</span>
                    </div>
                  </div>

                  {/* Goal Completion Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-500">Goal Completion</span>
                      <span className="text-slate-800 font-bold">
                        {dept.completedGoalsCount}/{dept.totalGoalsCount}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                      <div 
                        className="bg-green-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Visual Analytics / Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-slate-200">
        
        {/* Chart 1: Monthly Emissions Trend */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Monthly Carbon Output (Last 6 Months)
            </CardTitle>
            <CardDescription>
              Organization-wide carbon footprint trend.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-end justify-between pt-6 px-4">
            {chartData.monthlyEmissionsTrend.length === 0 ? (
              <div className="w-full text-center text-sm text-slate-400 py-12">No data logged.</div>
            ) : (
              chartData.monthlyEmissionsTrend.map((month) => {
                const heightPercent = Math.max((month.emissions / maxMonthEmissions) * 100, 4);
                return (
                  <div key={month.name} className="flex flex-col items-center flex-1 group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-mono whitespace-nowrap z-10 shadow-lg">
                      {month.emissions.toLocaleString()} kg CO₂
                    </div>
                    
                    {/* Bar */}
                    <div 
                      className="w-10 bg-gradient-to-t from-blue-600 to-sky-400 hover:from-blue-700 hover:to-sky-500 rounded-t transition-all duration-500 shadow-sm"
                      style={{ height: `${heightPercent}%` }}
                    />
                    
                    {/* Label */}
                    <span className="text-xs text-slate-500 font-semibold mt-2">{month.name}</span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Chart 2: Department Comparison */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-500" />
              Department Emissions Comparison
            </CardTitle>
            <CardDescription>
              Compare total emissions by department.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {chartData.departmentComparison.length === 0 ? (
              <div className="text-center text-sm text-slate-400 py-12">No data available.</div>
            ) : (
              chartData.departmentComparison.map((dept) => {
                const widthPercent = Math.max((dept.emissions / maxDeptEmissions) * 100, 3);
                return (
                  <div key={dept.code} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{dept.name} ({dept.code})</span>
                      <span className="font-mono text-slate-900">{dept.emissions.toLocaleString()} kg CO₂</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200 relative group">
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

        {/* Chart 3 / Widget: Goal Tracker List */}
        <Card className="lg:col-span-2 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-indigo-500" />
              Department Goal Progress Tracker
            </CardTitle>
            <CardDescription>
              Status of all active and completed sustainability goals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {goalProgress.length === 0 ? (
              <div className="text-center text-sm text-slate-400 py-6">No sustainability goals configured.</div>
            ) : (
              <div className="space-y-4">
                {goalProgress.map((goal) => {
                  const isCompleted = goal.status === "COMPLETED";
                  const isOver = goal.currentEmissions > goal.targetValue;
                  
                  return (
                    <div key={goal.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition">
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-slate-900">{goal.title}</div>
                        <div className="text-xs text-slate-500 font-medium">
                          Department: {goal.departmentName} · Target: {goal.targetValue.toLocaleString()} kg CO₂
                        </div>
                      </div>

                      {/* Goal progress indicator */}
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="w-40 text-right space-y-1">
                          <div className="text-xs font-mono text-slate-800">
                            {goal.currentEmissions.toLocaleString()} / {goal.targetValue.toLocaleString()} ({goal.progress}%)
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={[
                                "h-full rounded-full",
                                isCompleted ? "bg-green-500" : isOver ? "bg-red-500" : "bg-indigo-500"
                              ].join(" ")}
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                        </div>

                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border",
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
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
