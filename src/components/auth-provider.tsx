"use client";

import type { User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { setActivePracticeUser, syncEntries } from "@/lib/practice-store";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

type SyncStatus = "local" | "syncing" | "synced" | "error";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  syncStatus: SyncStatus;
  signOut: () => Promise<void>;
  syncNow: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("local");

  const syncNow = useCallback(async () => {
    setSyncStatus("syncing");
    try {
      await syncEntries();
      setSyncStatus("synced");
    } catch {
      setSyncStatus("error");
    }
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured()) await getSupabase().auth.signOut();
    setActivePracticeUser(null);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setActivePracticeUser(null);
      return;
    }

    const supabase = getSupabase();
    supabase.auth.getSession().then(async ({ data }) => {
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);
      setActivePracticeUser(currentUser?.id ?? null);
      if (currentUser) {
        setSyncStatus("syncing");
        try {
          await syncEntries();
          setSyncStatus("synced");
        } catch {
          setSyncStatus("error");
        }
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setActivePracticeUser(currentUser?.id ?? null);
      setLoading(false);
      if (currentUser) {
        setSyncStatus("syncing");
        window.setTimeout(() => {
          syncEntries()
            .then(() => setSyncStatus("synced"))
            .catch(() => setSyncStatus("error"));
        }, 0);
      } else {
        setSyncStatus("local");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      syncStatus,
      signOut,
      syncNow,
    }),
    [loading, signOut, syncNow, syncStatus, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
