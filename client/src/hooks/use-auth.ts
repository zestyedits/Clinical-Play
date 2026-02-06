import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { User } from "@shared/models/auth";

async function fetchUser(session: Session | null): Promise<User | null> {
  if (!session?.access_token) return null;

  const response = await fetch("/api/auth/user", {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (response.status === 401) return null;
  if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
  return response.json();
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

  const { data: user, isLoading: userLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user", session?.access_token],
    queryFn: () => fetchUser(session),
    enabled: !sessionLoading && !!session,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

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
    user: session ? user ?? null : null,
    isLoading: sessionLoading || (!!session && userLoading),
    isAuthenticated: !!session && !!user,
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
