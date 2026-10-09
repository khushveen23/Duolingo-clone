"use client";

import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PathView } from "@/components/path/PathView";
import { usePath } from "@/hooks/usePath";
import { Button } from "@/components/ui/Button";
import { RefreshCw, AlertCircle } from "lucide-react";

export default function HomePage() {
  const { path, loading, error, refresh } = usePath();

  return (
    <MainLayout>
      {loading ? (
        <div className="w-full max-w-xl mx-auto px-4 py-8 space-y-6">
          {/* Skeleton Unit Banner */}
          <div className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
          {/* Skeleton Skill Nodes */}
          <div className="flex flex-col items-center space-y-8 py-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse" />
            <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse translate-x-12" />
            <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse" />
            <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse -translate-x-12" />
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <AlertCircle className="w-12 h-12 text-duo-red mb-3" />
          <h2 className="text-xl font-black text-duo-text-dark mb-2">
            Couldn&apos;t load your course
          </h2>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">
            Make sure the backend is running at http://localhost:8000
          </p>
          <Button
            onClick={() => refresh()}
            variant="primary"
            size="md"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </Button>
        </div>
      ) : path ? (
        <PathView path={path} />
      ) : null}
    </MainLayout>
  );
}
