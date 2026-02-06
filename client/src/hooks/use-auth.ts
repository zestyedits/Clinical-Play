import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { User } from "@shared/models/auth";

async function fetchUser(session: Session | null): Promise<{ user: User | null; accessDenied: boolean }> {
  if (!session?.access_token) return { user: null, accessDenied: false };

  const response = await fetch("/api/auth/user", {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (response.status === 401) return { user: null, accessDenied: false };
  if (response.status === 403) return { user: null, accessDenied: true };
  if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
  const user = await response.json();
  return { user, accessDenied: false };
}

export function useAuth() {
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

  const { data: authResult, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user", session?.access_token],
    queryFn: () => fetchUser(session),
    enabled: !sessionLoading && !!session,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const user = authResult?.user ?? null;
  const accessDenied = authResult?.accessDenied ?? false;

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
