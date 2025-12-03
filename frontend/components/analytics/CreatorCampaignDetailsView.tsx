"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getCreatorCampaignDetails,
  getPlatformDeliverables,
  CreatorCampaignDetails,
  PlatformDeliverablesResponse,
} from "@/lib/api/analytics";
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Package,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";
import PlatformDeliverablesModal from "./PlatformDeliverablesModal";
import DeliverableMetricsModal from "./DeliverableMetricsModal";

interface CreatorCampaignDetailsViewProps {
  campaignId: string;
}

export default function CreatorCampaignDetailsView({
  campaignId,
}: CreatorCampaignDetailsViewProps) {
  const [campaign, setCampaign] = useState<CreatorCampaignDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedDeliverableId, setSelectedDeliverableId] = useState<
    string | null
  >(null);
  const [platformDeliverables, setPlatformDeliverables] = useState<
    PlatformDeliverablesResponse | null
  >(null);
  const router = useRouter();

  useEffect(() => {
    loadCampaignDetails();
  }, [campaignId]);

  const loadCampaignDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCreatorCampaignDetails(campaignId);
      setCampaign(data);
    } catch (err: any) {
      setError(err.message || "Failed to load campaign details");
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformClick = async (platform: string) => {
    try {
      setSelectedPlatform(platform);
      const data = await getPlatformDeliverables(campaignId, platform);
      setPlatformDeliverables(data);
    } catch (err: any) {
      setError(err.message || "Failed to load platform deliverables");
    }
  };

  const handleDeliverableClick = (deliverableId: string) => {
    setSelectedDeliverableId(deliverableId);
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading && !campaign) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-md">
        <p className="text-gray-600">Campaign not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/creator/analytics")}
            className="rounded-lg bg-gray-100 p-2 hover:bg-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {campaign.title}
            </h1>
            <p className="mt-1 text-gray-600">
              Brand: {campaign.brand_name || "Unknown"}
            </p>
          </div>
        </div>
        <button
          onClick={loadCampaignDetails}
          className="flex items-center gap-2 rounded-lg bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Platforms Grid */}
      {campaign.platforms.length === 0 ? (
        <div className="rounded-xl bg-white p-6 shadow-md">
          <p className="text-gray-600">No deliverables found for this campaign.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaign.platforms.map((platform) => (
            <div
              key={platform.platform}
              onClick={() => handlePlatformClick(platform.platform)}
              className="cursor-pointer rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg hover:scale-105"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {platform.platform}
                </h3>
                {getStatusIcon(
                  platform.completed === platform.total
                    ? "completed"
                    : "pending"
                )}
              </div>

              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Deliverables</span>
                  <span className="font-medium text-gray-900">
                    {platform.completed}/{platform.total}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                    style={{ width: `${platform.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Progress</span>
                  <span className="font-medium">{platform.progress.toFixed(1)}%</span>
                </div>
              </div>

              <div className="text-sm text-purple-600">
                Click to view deliverables →
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Platform Deliverables Modal */}
      {selectedPlatform && platformDeliverables && (
        <PlatformDeliverablesModal
          platform={selectedPlatform}
          deliverables={platformDeliverables.deliverables}
          onClose={() => {
            setSelectedPlatform(null);
            setPlatformDeliverables(null);
          }}
          onDeliverableClick={handleDeliverableClick}
        />
      )}

      {/* Deliverable Metrics Modal */}
      {selectedDeliverableId && (
        <DeliverableMetricsModal
          deliverableId={selectedDeliverableId}
          onClose={() => setSelectedDeliverableId(null)}
        />
      )}
    </div>
  );
}

