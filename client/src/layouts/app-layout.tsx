import * as React from "react";
import { LogOut, Bell, Leaf, LayoutDashboard, Settings2, Users, ShieldCheck, FileText, Check, CheckCheck, X } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { notificationsApi, type Notification } from "@/modules/notifications/notifications-api";

/** Maps notification types to colour classes */
function notifTypeColor(type: Notification["type"]) {
  const map: Record<Notification["type"], string> = {
    CSR: "bg-emerald-100 text-emerald-700",
    CHALLENGE: "bg-violet-100 text-violet-700",
    BADGE: "bg-amber-100 text-amber-700",
    REWARD: "bg-pink-100 text-pink-700",
    POLICY: "bg-blue-100 text-blue-700",
    AUDIT: "bg-indigo-100 text-indigo-700",
    COMPLIANCE: "bg-red-100 text-red-700",
    SYSTEM: "bg-slate-100 text-slate-700",
  };
  return map[type] ?? "bg-slate-100 text-slate-700";
}

/** Formats a UTC ISO string as a human-readable relative time */
function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

function NotificationsBell() {
  const [open, setOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);

  const fetchNotifications = React.useCallback(async () => {
    try {
      const data = await notificationsApi.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // Silently ignore — user may not be authenticated yet
    }
  }, []);

  // Poll every 30 seconds for new notifications
  React.useEffect(() => {
    void fetchNotifications();
    const interval = setInterval(() => void fetchNotifications(), 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close panel on outside click
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = async () => {
    setOpen((prev) => !prev);
    if (!open) {
      setLoading(true);
      await fetchNotifications();
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        id="notifications-bell-btn"
        className="relative flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        onClick={() => void handleOpen()}
        aria-label="Open notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[380px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-slate-500" />
              <span className="font-semibold text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  title="Mark all as read"
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  onClick={() => void handleMarkAllRead()}
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                title="Close"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-50">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <Bell className="h-8 w-8 text-slate-300" />
                <p className="text-sm font-medium text-slate-500">All caught up!</p>
                <p className="text-xs text-slate-400">No notifications yet.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`group flex gap-3 px-4 py-3 transition hover:bg-slate-50 ${!notif.isRead ? "bg-blue-50/40" : ""}`}
                >
                  <div className={`mt-0.5 flex-shrink-0 rounded-lg px-1.5 py-0.5 text-[10px] font-bold uppercase ${notifTypeColor(notif.type)}`}>
                    {notif.type}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`truncate text-sm ${!notif.isRead ? "font-semibold text-slate-900" : "text-slate-700"}`}>
                      {notif.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{notif.message}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{relativeTime(notif.createdAt)}</p>
                  </div>
                  {!notif.isRead && (
                    <button
                      type="button"
                      title="Mark as read"
                      className="mt-0.5 flex-shrink-0 rounded-lg p-1 text-slate-300 opacity-0 transition hover:bg-slate-100 hover:text-blue-500 group-hover:opacity-100"
                      onClick={() => void handleMarkRead(notif.id)}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-2 text-center">
              <p className="text-xs text-slate-400">Showing up to 50 recent notifications</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const pageTitle = location.pathname.startsWith("/administration")
    ? "Administration"
    : location.pathname.startsWith("/environmental")
    ? "Environmental"
    : location.pathname.startsWith("/governance")
    ? "Governance"
    : location.pathname.startsWith("/social")
    ? "Social & Gamification"
    : location.pathname.startsWith("/reports")
    ? "Reports"
    : "Dashboard";

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "flex items-center gap-3 rounded-xl px-4 py-3 transition",
      isActive ? "bg-white/10 font-medium text-white" : "text-slate-300 hover:bg-white/5 hover:text-white",
    ].join(" ");

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
            <NavLink className={navLinkClass} to="/">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>
            <NavLink className={navLinkClass} to="/environmental">
              <Leaf className="h-4 w-4" />
              Environmental
            </NavLink>
            <NavLink className={navLinkClass} to="/governance">
              <ShieldCheck className="h-4 w-4" />
              Governance
            </NavLink>
            <NavLink className={navLinkClass} to="/social">
              <Users className="h-4 w-4" />
              Social & Gamification
            </NavLink>
            <NavLink className={navLinkClass} to="/reports">
              <FileText className="h-4 w-4" />
              Reports
            </NavLink>
            <NavLink className={navLinkClass} to="/administration">
              <Settings2 className="h-4 w-4" />
              Administration
            </NavLink>
          </nav>
        </aside>

        <main className="flex min-h-screen flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
            <div>
              <p className="text-sm text-slate-500">Welcome back</p>
              <h1 className="text-xl font-semibold">{pageTitle}</h1>
            </div>
            <div className="flex items-center gap-3">
              <NotificationsBell />
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
