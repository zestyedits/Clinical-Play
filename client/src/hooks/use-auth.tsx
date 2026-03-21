import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import type { User } from "@shared/models/auth";

interface AuthResult {
  user: User | null;
  accessDenied: boolean;
  emailConfirmed: boolean;
}

const AUTH_FETCH_TIMEOUT_MS = 20_000;

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = AUTH_FETCH_TIMEOUT_MS,
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchUser(session: Session | null): Promise<AuthResult> {
  if (!session?.access_token) return { user: null, accessDenied: false, emailConfirmed: false };

  try {
    const response = await fetchWithTimeout("/api/auth/user", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (response.status === 401) return { user: null, accessDenied: false, emailConfirmed: false };
    if (response.status === 403) return { user: null, accessDenied: true, emailConfirmed: false };
    if (!response.ok) {
      console.error("[auth] /api/auth/user returned", response.status);
      return { user: null, accessDenied: false, emailConfirmed: false };
    }
    const data = await response.json();
    const { emailConfirmed, ...user } = data;
    return { user, accessDenied: false, emailConfirmed: !!emailConfirmed };
  } catch (err) {
    console.error("[auth] fetchUser error:", err);
    return { user: null, accessDenied: false, emailConfirmed: false };
  }
}

// Shared session context — single source of truth for Supabase session
interface SessionContextValue {
  session: Session | null;
  sessionLoading: boolean;
  setSession: (s: Session | null) => void;
}

const SessionContext = createContext<SessionContextValue>({
  session: null,
  sessionLoading: true,
  setSession: () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | null = null;

    async function init() {
      try {
        const supabase = await getSupabase();

        // Subscribe to auth changes FIRST so we don't miss events
        // (e.g. OAuth redirect token exchange that happens during initialization)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
          if (mounted) {
            setSession(newSession);
            setSessionLoading(false);
            queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

            if (event === "PASSWORD_RECOVERY") {
              window.location.href = "/reset-password";
            }
          }
        });

        unsubscribe = () => subscription.unsubscribe();

        // Also call getSession as a fallback to ensure we have the current state
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(currentSession);
          setSessionLoading(false);
        }
      } catch (err) {
        console.error("[auth] Session initialization failed:", err);
        if (mounted) {
          setSession(null);
          setSessionLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [queryClient]);

  // Pre-fetch user data so it's cached before any page renders
  const { isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user", session?.access_token],
    queryFn: () => fetchUser(session),
    enabled: !sessionLoading && !!session,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  // Gate rendering until session is resolved AND user is fetched (if session exists)
  const isReady = !sessionLoading && (!session || !userLoading);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <img src="/images/logo-icon.png" alt="" className="w-12 h-12 mx-auto mb-4 object-contain" />
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ session, sessionLoading, setSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { session, sessionLoading, setSession } = useContext(SessionContext);

  const { data: authResult, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user", session?.access_token],
    queryFn: () => fetchUser(session),
    enabled: !sessionLoading && !!session,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const user = authResult?.user ?? null;
  const accessDenied = authResult?.accessDenied ?? false;
  const emailConfirmed = authResult?.emailConfirmed ?? false;

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const supabase = await getSupabase();
      await supabase.auth.signOut();
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user", undefined], null);
      setSession(null);
      window.location.href = "/";
    },
  });

  return {
    user: session ? user : null,
    isLoading: sessionLoading || (!!session && userLoading),
    isAuthenticated: !!session && !!user,
    hasSession: !!session,
    emailConfirmed,
    accessDenied,
    session,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}

export function createAuthFetch(token?: string) {
  return async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
  };
}

export function useAuthFetch() {
  const { session } = useAuth();
  return createAuthFetch(session?.access_token);
}
