"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import {
  ProposalsWorkspace,
  TabKey,
} from "@/components/proposals/ProposalsWorkspace";
import SlidingMenu from "@/components/SlidingMenu";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export default function CreatorProposalsPage() {
  const searchParams = useSearchParams();

  const initialTab = useMemo<TabKey>(() => {
    const section = searchParams?.get("section")?.toLowerCase();
    if (section === "negotiations") {
      return section as TabKey;
    }
    return "proposals";
  }, [searchParams]);

  // --- AI Review Progress Bar State ---
  const [aiLoading, setAiLoading] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiStatusIdx, setAiStatusIdx] = useState(0);
  const aiStatusMessages = [
    "Running initial checks...",
    "Comparing with reference contracts...",
    "Analyzing proposal structure...",
    "Evaluating pricing fairness...",
    "Checking for missing details...",
    "Generating actionable feedback...",
  ];
  const aiIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate progress bar and rotating status messages (message every 3s, progress every 300ms)
  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null;
    if (aiLoading) {
      setAiProgress(0);
      setAiStatusIdx(0);
      // Progress bar increments every 300ms
      progressInterval = setInterval(() => {
        setAiProgress((prev) => {
          if (prev >= 100) return 100;
          return prev + Math.floor(Math.random() * 5) + 2; // 2-6%
        });
      }, 300);
      // Status message changes every 3 seconds
      aiIntervalRef.current = setInterval(() => {
        setAiStatusIdx((prev) => (prev + 1) % aiStatusMessages.length);
      }, 3000);
    } else {
      setAiProgress(0);
      setAiStatusIdx(0);
      if (aiIntervalRef.current) clearInterval(aiIntervalRef.current);
      if (progressInterval) clearInterval(progressInterval);
    }
    return () => {
      if (aiIntervalRef.current) clearInterval(aiIntervalRef.current);
      if (progressInterval) clearInterval(progressInterval);
    };
    // eslint-disable-next-line
  }, [aiLoading]);

  // Pass setAiLoading, aiLoading, aiProgress, aiStatusIdx, aiStatusMessages to ProposalsWorkspace or modal as needed

  return (
    <AuthGuard requiredRole="Creator">
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <SlidingMenu role="creator" />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <ProposalsWorkspace
            role="Creator"
            initialTab={initialTab}
            aiLoading={aiLoading}
            setAiLoading={setAiLoading}
            aiProgress={aiProgress}
            aiStatusIdx={aiStatusIdx}
            aiStatusMessages={aiStatusMessages}
          />
        </main>
      </div>
    </AuthGuard>
  );
}
