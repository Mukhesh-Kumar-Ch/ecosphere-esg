import * as React from "react";
import { authApi, type AuthSession, type AuthUser } from "@/services/api";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

function setSession(session: AuthSession | null) {
  if (!session) {
    localStorage.removeItem("ecosphere_access_token");
    localStorage.removeItem("ecosphere_refresh_token");
    return;
  }

  localStorage.setItem("ecosphere_access_token", session.accessToken);
  localStorage.setItem("ecosphere_refresh_token", session.refreshToken);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const bootstrap = async () => {
      const accessToken = localStorage.getItem("ecosphere_access_token");
      const refreshToken = localStorage.getItem("ecosphere_refresh_token");

      if (!accessToken || !refreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        const session = await authApi.me();
        setUser(session.user);
      } catch {
        try {
          const refreshed = await authApi.refresh(refreshToken);
          setSession(refreshed);
          setUser(refreshed.user);
        } catch {
          setSession(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    const session = await authApi.login(email, password);
    setSession(session);
    setUser(session.user);
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setSession(null);
      setUser(null);
    }
  }, []);

  const value = React.useMemo(
    () => ({ user, isLoading, login, logout }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
