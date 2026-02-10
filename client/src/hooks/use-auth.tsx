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

async function fetchUser(session: Session | null): Promise<AuthResult> {
  if (!session?.access_token) return { user: null, accessDenied: false, emailConfirmed: false };

  const response = await fetch("/api/auth/user", {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (response.status === 401) return { user: null, accessDenied: false, emailConfirmed: false };
  if (response.status === 403) return { user: null, accessDenied: true, emailConfirmed: false };
  if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
  const data = await response.json();
  const { emailConfirmed, ...user } = data;
  return { user, accessDenied: false, emailConfirmed: !!emailConfirmed };
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
      const supabase = await getSupabase();
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (mounted) {
        setSession(currentSession);
        setSessionLoading(false);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
        if (mounted) {
          setSession(newSession);
          setSessionLoading(false);
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        }
      });

      unsubscribe = () => subscription.unsubscribe();
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#faf9f7] to-[#f0ede8]">
        <div className="text-center">
          <img src="/images/logo-icon.png" alt="" className="w-14 h-14 mx-auto mb-3 object-contain animate-pulse" />
          <p className="text-sm text-[#1B2A4A]/40 font-medium">Loading...</p>
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
