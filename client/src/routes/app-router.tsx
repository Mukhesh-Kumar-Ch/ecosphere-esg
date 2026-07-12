import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/layouts/app-layout";
import { DashboardPage } from "@/pages/dashboard-page";
import { LoginPage } from "@/modules/auth/login-page";
import { SignupPage } from "@/modules/auth/signup-page";
import { AdministrationPage } from "@/modules/administration/administration-page";
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
