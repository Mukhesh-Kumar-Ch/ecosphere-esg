import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmissionFactorsTab } from "./emission-factors-tab";
import { CarbonTransactionsTab } from "./carbon-transactions-tab";
import { SustainabilityGoalsTab } from "./sustainability-goals-tab";
import { DepartmentTrackingTab } from "./department-tracking-tab";

export function EnvironmentalPage() {
  const [tab, setTab] = useState("tracking");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Environmental Management</CardTitle>
          <CardDescription>
            Measure and monitor carbon footprint, manage emission conversion factors, set sustainability targets, and track department carbon performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs onValueChange={setTab} value={tab}>
            <TabsList className="mb-6">
              <TabsTrigger value="tracking">Department Carbon Tracking</TabsTrigger>
              <TabsTrigger value="transactions">Carbon Transactions</TabsTrigger>
              <TabsTrigger value="goals">Sustainability Goals</TabsTrigger>
              <TabsTrigger value="factors">Emission Factors</TabsTrigger>
            </TabsList>

            <TabsContent value="tracking">
              <DepartmentTrackingTab />
            </TabsContent>

            <TabsContent value="transactions">
              <CarbonTransactionsTab />
            </TabsContent>

            <TabsContent value="goals">
              <SustainabilityGoalsTab />
            </TabsContent>

            <TabsContent value="factors">
              <EmissionFactorsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
export default EnvironmentalPage;
