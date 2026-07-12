import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DepartmentsTab } from "./departments-tab";
import { CategoriesTab } from "./categories-tab";
import { SettingsTab } from "./settings-tab";

export function AdministrationPage() {
  const [tab, setTab] = useState("departments");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Administration</CardTitle>
          <CardDescription>Manage master data for departments, categories, and global settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs onValueChange={setTab} value={tab}>
            <TabsList>
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="departments">
              <DepartmentsTab />
            </TabsContent>

            <TabsContent value="categories">
              <CategoriesTab />
            </TabsContent>

            <TabsContent value="settings">
              <SettingsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}