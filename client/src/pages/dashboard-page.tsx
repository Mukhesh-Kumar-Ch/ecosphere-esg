import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Overall ESG Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-semibold text-slate-900">--</div>
            <p className="mt-2 text-sm text-slate-500">Awaiting live data connection.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-emerald-100 text-emerald-700">Authenticated</Badge>
            <p className="mt-4 text-sm text-slate-500">{user?.email}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-base font-medium text-slate-900">{user?.role.name}</div>
            <p className="mt-2 text-sm text-slate-500">{user?.department.name}</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Next foundation step</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            Authentication is wired end-to-end. Environmental, Social, Governance, and shared modules are
            scaffolded next without business logic.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
