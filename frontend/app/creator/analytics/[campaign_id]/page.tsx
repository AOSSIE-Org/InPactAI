"use client";

import { use } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import SlidingMenu from "@/components/SlidingMenu";
import CreatorCampaignDetailsView from "@/components/analytics/CreatorCampaignDetailsView";

export default function CreatorCampaignDetailsPage({
  params,
}: {
  params: Promise<{ campaign_id: string }>;
}) {
  const { campaign_id } = use(params);

  return (
    <AuthGuard requiredRole="Creator">
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <SlidingMenu role="creator" />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <CreatorCampaignDetailsView campaignId={campaign_id} />
        </main>
      </div>
    </AuthGuard>
  );
}

