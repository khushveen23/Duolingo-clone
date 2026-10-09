"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchPath } from "@/lib/api";
import type { PathData } from "@/types";

/**
 * usePath — loads the full learning tree (Course → Units → Skills).
 * Returns path, data, a loading flag, an error string, and a refresh function.
 */
export function usePath() {
  const [data, setData] = useState<PathData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const path = await fetchPath();
      setData(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load path");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    fetchPath()
      .then((path) => {
        if (!ignore) {
          setData(path);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load path");
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  return { path: data, data, loading, error, refresh: load };
}
