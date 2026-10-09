"use client";

/**
 * UserContext — global state for the currently logged-in learner.
 *
 * Loads /api/me on mount. Exposes `user`, `loading`, `error`, and a
 * `refresh()` function so any component (TopBar, hearts widget, etc.)
 * can trigger a re-fetch after a lesson completes or hearts change.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { fetchMe } from "@/lib/api";
import type { UserStats } from "@/types";

interface UserContextValue {
  user: UserStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Create the context with a meaningful default so TypeScript is happy.
const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  error: null,
  refresh: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMe();
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    let ignore = false;
    fetchMe()
      .then((data) => {
        if (!ignore) {
          setUser(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load user");
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error, refresh }}>
      {children}
    </UserContext.Provider>
  );
}

/** Hook to consume the UserContext inside any client component. */
export function useUser(): UserContextValue {
  return useContext(UserContext);
}
