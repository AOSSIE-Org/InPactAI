"use client";

import { useState, useEffect } from "react";
import {
  getCreatorCampaigns,
  CreatorCampaign,
} from "@/lib/api/analytics";
import {
  TrendingUp,
  DollarSign,
  Building2,
  RefreshCw,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreatorAnalyticsDashboard() {
  const [campaigns, setCampaigns] = useState<CreatorCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getCreatorCampaigns();
      setCampaigns(result.campaigns);
    } catch (err: any) {
      setError(err.message || "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && campaigns.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Campaigns</h1>
          <p className="mt-2 text-gray-600">
            Track your campaign progress and deliverables
          </p>
        </div>
        <button
          onClick={loadCampaigns}
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

      {/* Campaigns Grid */}
      {campaigns.length === 0 ? (
        <div className="rounded-xl bg-white p-6 shadow-md">
          <p className="text-gray-600">
            No campaigns found. You'll see your campaigns here once you accept proposals.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              onClick={() => router.push(`/creator/analytics/${campaign.id}`)}
              className="cursor-pointer rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg hover:scale-105"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {campaign.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="h-4 w-4" />
                    <span>{campaign.brand_name || "Unknown Brand"}</span>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                    campaign.contract_status || campaign.status
                  )}`}
                >
                  {campaign.contract_status || campaign.status}
                </span>
              </div>

              <div className="mb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Value</span>
                  <span className="flex items-center gap-1 font-semibold text-gray-900">
                    <DollarSign className="h-4 w-4" />
                    {formatCurrency(campaign.value)}
                  </span>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">
                      {campaign.progress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                      style={{ width: `${Math.min(campaign.progress, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end text-purple-600">
                <span className="text-sm font-medium">View Details</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

