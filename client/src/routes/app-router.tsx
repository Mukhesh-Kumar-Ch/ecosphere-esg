import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/layouts/app-layout";
import { DashboardPage } from "@/pages/dashboard-page";
import { LoginPage } from "@/modules/auth/login-page";
import { SignupPage } from "@/modules/auth/signup-page";
import { AdministrationPage } from "@/modules/administration/administration-page";
import { EnvironmentalPage } from "@/modules/environmental/environmental-page";
import { GovernancePage } from "@/modules/governance/governance-page";
import { SocialPage } from "@/modules/social/social-page";
import { ReportsPage } from "@/modules/reports/reports-page";
import { ProtectedRoute } from "./protected-route";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<ProtectedRoute />}>
        <Route
          path="/"
          element={
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          }
        />
        <Route
          path="/administration"
          element={
            <AppLayout>
              <AdministrationPage />
            </AppLayout>
          }
        />
        <Route
          path="/environmental"
          element={
            <AppLayout>
              <EnvironmentalPage />
            </AppLayout>
          }
        />
        <Route
          path="/governance"
          element={
            <AppLayout>
              <GovernancePage />
            </AppLayout>
          }
        />
        <Route
          path="/social"
          element={
            <AppLayout>
              <SocialPage />
            </AppLayout>
          }
        />
        <Route
          path="/reports"
          element={
            <AppLayout>
              <ReportsPage />
            </AppLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
