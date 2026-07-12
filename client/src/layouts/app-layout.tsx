import { LogOut, Bell, Search, ShieldCheck, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-slate-200 bg-slate-950 px-6 py-8 text-slate-100">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-500/15 text-blue-300">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">EcoSphere</div>
              <div className="text-xs text-slate-400">Enterprise ESG</div>
            </div>
          </div>

          <nav className="mt-10 space-y-2 text-sm">
            <div className="rounded-xl bg-white/5 px-4 py-3 font-medium text-white">Dashboard</div>
            <div className="rounded-xl px-4 py-3 text-slate-300">Environmental</div>
            <div className="rounded-xl px-4 py-3 text-slate-300">Social</div>
            <div className="rounded-xl px-4 py-3 text-slate-300">Governance</div>
          </nav>
        </aside>

        <main className="flex min-h-screen flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
            <div>
              <p className="text-sm text-slate-500">Welcome back</p>
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <Search className="h-4 w-4" />
                Search
              </div>
              <Button variant="outline" size="sm" type="button">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Button>
              <Button variant="outline" size="sm" type="button" onClick={() => void logout()}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </header>

          <div className="border-b border-slate-200 bg-white px-6 py-3 text-sm text-slate-600">
            Signed in as <span className="font-medium text-slate-900">{user?.name}</span> · {user?.role.name}
          </div>

          <div className="flex-1 p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
