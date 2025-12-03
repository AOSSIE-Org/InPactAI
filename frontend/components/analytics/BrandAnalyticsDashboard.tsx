"use client";

import { useState, useEffect } from "react";
import {
  getAllBrandDeliverables,
  createMetric,
  createUpdateRequest,
  createFeedback,
  getDeliverableMetrics,
  AllDeliverablesResponse,
} from "@/lib/api/analytics";
import type {
  CampaignDeliverableMetric,
  MetricUpdate,
} from "@/types/analytics";
import {
  Plus,
  RefreshCw,
  AlertCircle,
  Target,
  TrendingUp,
  Package,
  MessageSquare,
  Send,
  X,
  Edit,
  Trash2,
} from "lucide-react";

export default function BrandAnalyticsDashboard() {
  const [data, setData] = useState<AllDeliverablesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [selectedDeliverable, setSelectedDeliverable] = useState<any>(null);
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedMetric, setSelectedMetric] =
    useState<CampaignDeliverableMetric | null>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<MetricUpdate | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [newMetric, setNewMetric] = useState({
    name: "",
    display_name: "",
    target_value: "",
    is_custom: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllBrandDeliverables();
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to load deliverables");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMetric = async () => {
    if (!selectedDeliverable || !newMetric.name) return;
    try {
      await createMetric({
        campaign_deliverable_id: selectedDeliverable.id,
        name: newMetric.name,
        display_name: newMetric.display_name || newMetric.name,
        target_value: newMetric.target_value
          ? parseFloat(newMetric.target_value)
          : undefined,
        is_custom: newMetric.is_custom,
      });
      setShowMetricModal(false);
      setNewMetric({ name: "", display_name: "", target_value: "", is_custom: false });
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to create metric");
    }
  };

  const handleRequestUpdate = async () => {
    if (!selectedDeliverable || !selectedCreatorId) return;
    try {
      await createUpdateRequest({
        campaign_deliverable_metric_id: selectedMetric?.id,
        creator_id: selectedCreatorId,
      });
      setShowRequestModal(false);
      setSelectedCreatorId(null);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to request update");
    }
  };

  const handleCreateFeedback = async () => {
    if (!selectedUpdate) return;
    try {
      await createFeedback(selectedUpdate.id, {
        feedback_text: feedbackText,
      });
      setShowFeedbackModal(false);
      setFeedbackText("");
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to create feedback");
    }
  };

  const filteredDeliverables = data?.deliverables.filter((deliverable) => {
    if (!selectedCampaign) return true;
    return deliverable.campaign_id === selectedCampaign;
  }) || [];

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Campaign Analytics Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Define metrics, track performance, and request updates from creators
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Deliverables</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.total_deliverables}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Metrics</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.total_metrics}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Metrics Updated</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.metrics_with_updates}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.campaigns.length}
                </p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* Campaign Filter */}
      {data && data.campaigns.length > 0 && (
        <div className="rounded-xl bg-white p-4 shadow-md">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Filter by Campaign
          </label>
          <select
            value={selectedCampaign || ""}
            onChange={(e) => setSelectedCampaign(e.target.value || null)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Campaigns</option>
            {data.campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Deliverables List */}
      {!data || filteredDeliverables.length === 0 ? (
        <div className="rounded-xl bg-white p-6 shadow-md">
          <p className="text-gray-600">
            {!data
              ? "Loading deliverables..."
              : "No deliverables found. Create a campaign with deliverables to start tracking metrics."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDeliverables.map((deliverable) => (
            <div
              key={deliverable.id}
              className="rounded-xl bg-white p-6 shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {deliverable.content_type}
                    </h3>
                    <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      {deliverable.platform}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                    <span>Campaign: {deliverable.campaign?.title || "Unknown"}</span>
                    <span>Quantity: {deliverable.quantity}</span>
                  </div>
                  {deliverable.guidance && (
                    <p className="mt-2 text-sm text-gray-600">{deliverable.guidance}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedDeliverable(deliverable);
                    setShowMetricModal(true);
                  }}
                  className="ml-4 flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                  <Plus className="h-4 w-4" />
                  Add Metric
                </button>
              </div>

              {/* Metrics */}
              <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-700">
                  Metrics ({deliverable.metrics.length})
                </h4>
                {deliverable.metrics.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No metrics defined. Add one to start tracking.
                  </p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {deliverable.metrics.map((metric) => (
                      <MetricCard
                        key={metric.id}
                        metric={metric}
                        deliverable={deliverable}
                        onRequestUpdate={() => {
                          setSelectedDeliverable(deliverable);
                          setSelectedMetric(metric);
                          setShowRequestModal(true);
                        }}
                        onAddFeedback={(update) => {
                          setSelectedUpdate(update);
                          setShowFeedbackModal(true);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Metric Modal */}
      {showMetricModal && selectedDeliverable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Create New Metric</h3>
              <button
                onClick={() => setShowMetricModal(false)}
                className="rounded-lg bg-gray-100 p-2 hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Metric Name *
                </label>
                <input
                  type="text"
                  value={newMetric.name}
                  onChange={(e) =>
                    setNewMetric({ ...newMetric, name: e.target.value })
                  }
                  placeholder="e.g., impressions, likes, views"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Display Name
                </label>
                <input
                  type="text"
                  value={newMetric.display_name}
                  onChange={(e) =>
                    setNewMetric({
                      ...newMetric,
                      display_name: e.target.value,
                    })
                  }
                  placeholder="e.g., Total Impressions"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Target Value
                </label>
                <input
                  type="number"
                  value={newMetric.target_value}
                  onChange={(e) =>
                    setNewMetric({
                      ...newMetric,
                      target_value: e.target.value,
                    })
                  }
                  placeholder="e.g., 10000"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newMetric.is_custom}
                  onChange={(e) =>
                    setNewMetric({
                      ...newMetric,
                      is_custom: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                <label className="text-sm text-gray-700">Custom Metric</label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMetricModal(false)}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateMetric}
                  className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Update Modal */}
      {showRequestModal && selectedDeliverable && selectedMetric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Request Metric Update</h3>
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setSelectedCreatorId(null);
                }}
                className="rounded-lg bg-gray-100 p-2 hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Request creator to update: <strong>{selectedMetric.display_name || selectedMetric.name}</strong>
              </p>
              {selectedDeliverable.campaign?.creators &&
              selectedDeliverable.campaign.creators.length > 0 ? (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Select Creator
                  </label>
                  <div className="space-y-2">
                    {selectedDeliverable.campaign.creators.map((creator: any) => (
                      <button
                        key={creator.id}
                        onClick={() => setSelectedCreatorId(creator.id)}
                        className={`w-full rounded-lg border px-4 py-2 text-left transition-colors ${
                          selectedCreatorId === creator.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 bg-white hover:bg-gray-50"
                        }`}
                      >
                        {creator.display_name || "Unknown Creator"}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setShowRequestModal(false);
                        setSelectedCreatorId(null);
                      }}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRequestUpdate}
                      disabled={!selectedCreatorId}
                      className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
                    >
                      Send Request
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No creators found for this campaign.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Feedback</h3>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="rounded-lg bg-gray-100 p-2 hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Feedback
                </label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={4}
                  placeholder="Provide feedback on this metric update..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setFeedbackText("");
                  }}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFeedback}
                  className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  metric,
  deliverable,
  onRequestUpdate,
  onAddFeedback,
}: {
  metric: CampaignDeliverableMetric;
  deliverable: any;
  onRequestUpdate: () => void;
  onAddFeedback: (update: MetricUpdate) => void;
}) {
  const progress =
    metric.target_value && metric.latest_update
      ? (metric.latest_update.value / metric.target_value) * 100
      : 0;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h5 className="font-semibold text-gray-900">
            {metric.display_name || metric.name}
          </h5>
          {metric.is_custom && (
            <span className="mt-1 inline-block rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
              Custom
            </span>
          )}
        </div>
      </div>

      {metric.latest_update ? (
        <div className="mb-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-3">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-gray-600">Current Value</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatNumber(metric.latest_update.value)}
            </span>
          </div>
          {metric.target_value && (
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Target: {formatNumber(metric.target_value)}
                </span>
                <span
                  className={`font-medium ${
                    progress >= 100
                      ? "text-green-600"
                      : progress >= 50
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {progress.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className={`h-2 rounded-full ${
                    progress >= 100
                      ? "bg-green-500"
                      : progress >= 50
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-3 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
          <p className="text-sm text-yellow-800">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            No data submitted yet
          </p>
        </div>
      )}

      <div className="flex items-center gap-2">
        {deliverable.campaign?.creators &&
          deliverable.campaign.creators.length > 0 && (
            <button
              onClick={onRequestUpdate}
              className="flex items-center gap-1 rounded bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
            >
              <RefreshCw className="h-3 w-3" />
              Request Update
            </button>
          )}
        {metric.latest_update && (
          <button
            onClick={() => onAddFeedback(metric.latest_update!)}
            className="flex items-center gap-1 rounded bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100"
          >
            <MessageSquare className="h-3 w-3" />
            Add Feedback
          </button>
        )}
      </div>

      {metric.latest_feedback && (
        <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 p-3">
          <p className="text-xs font-medium text-blue-900 mb-1">Your Feedback:</p>
          <p className="text-sm text-blue-800">{metric.latest_feedback.feedback_text}</p>
        </div>
      )}
    </div>
  );
}

