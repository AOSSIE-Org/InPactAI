"use client";

import { useState, useEffect } from "react";
import {
  X,
  TrendingUp,
  Target,
  MessageSquare,
  Send,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  getCreatorDeliverableMetrics,
  submitMetricValue,
  createCreatorComment,
  DeliverableMetricsResponse,
  CampaignDeliverableMetric,
} from "@/lib/api/analytics";

interface DeliverableMetricsModalProps {
  deliverableId: string;
  onClose: () => void;
}

export default function DeliverableMetricsModal({
  deliverableId,
  onClose,
}: DeliverableMetricsModalProps) {
  const [data, setData] = useState<DeliverableMetricsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [metricValue, setMetricValue] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, [deliverableId]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getCreatorDeliverableMetrics(deliverableId);
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to load metrics");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMetric = async (metricId: string) => {
    if (!metricValue || isNaN(parseFloat(metricValue))) {
      setError("Please enter a valid number");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await submitMetricValue(metricId, {
        value: parseFloat(metricValue),
      });
      setMetricValue("");
      setSelectedMetric(null);
      await loadMetrics();
    } catch (err: any) {
      setError(err.message || "Failed to submit metric value");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitComment = async (metricId: string) => {
    if (!commentText.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await createCreatorComment(metricId, {
        comment_text: commentText,
      });
      setCommentText("");
      await loadMetrics();
    } catch (err: any) {
      setError(err.message || "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const calculateProgress = (metric: CampaignDeliverableMetric): number => {
    if (!metric.target_value || !metric.latest_update) return 0;
    return (metric.latest_update.value / metric.target_value) * 100;
  };

  const getCreatorComments = (metric: CampaignDeliverableMetric) => {
    if (!metric.latest_update?.demographics) return [];
    const comments = metric.latest_update.demographics.creator_comments;
    return Array.isArray(comments) ? comments : [];
  };

  if (loading && !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-xl bg-white p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl rounded-xl bg-white shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Deliverable Metrics</h2>
            <p className="mt-1 text-sm text-gray-600">
              {data.deliverable.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-100 p-2 hover:bg-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {data.metrics.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No metrics defined for this deliverable.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {data.metrics.map((metric) => {
                const progress = calculateProgress(metric);
                const creatorComments = getCreatorComments(metric);
                const isSelected = selectedMetric === metric.id;

                return (
                  <div
                    key={metric.id}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    {/* Metric Header */}
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {metric.display_name || metric.name}
                        </h3>
                        <p className="text-sm text-gray-500">{metric.name}</p>
                      </div>
                      {metric.is_custom && (
                        <span className="rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                          Custom
                        </span>
                      )}
                    </div>

                    {/* Current Value */}
                    {metric.latest_update ? (
                      <div className="mb-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 p-4">
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-medium text-gray-600">
                            Current Value
                          </span>
                          <span className="text-3xl font-bold text-gray-900">
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
                      <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                        <p className="text-sm text-yellow-800">
                          <AlertCircle className="h-4 w-4 inline mr-1" />
                          No data submitted yet
                        </p>
                      </div>
                    )}

                    {/* Update Metric */}
                    {!isSelected ? (
                      <button
                        onClick={() => setSelectedMetric(metric.id)}
                        className="mb-4 w-full rounded-lg bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
                      >
                        {metric.latest_update ? "Update Value" : "Submit Value"}
                      </button>
                    ) : (
                      <div className="mb-4 space-y-2">
                        <input
                          type="number"
                          value={metricValue}
                          onChange={(e) => setMetricValue(e.target.value)}
                          placeholder="Enter metric value"
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedMetric(null);
                              setMetricValue("");
                            }}
                            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSubmitMetric(metric.id)}
                            disabled={submitting}
                            className="flex-1 rounded-lg bg-purple-500 px-4 py-2 text-white hover:bg-purple-600 disabled:opacity-50"
                          >
                            {submitting ? "Submitting..." : "Submit"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Comments Section */}
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-900">
                        <MessageSquare className="h-4 w-4" />
                        Comments & Feedback
                      </h4>

                      {/* Brand Feedback */}
                      {metric.feedback && metric.feedback.length > 0 && (
                        <div className="mb-4 space-y-2">
                          {metric.feedback.map((fb: any) => (
                            <div
                              key={fb.id}
                              className="rounded-lg bg-blue-50 border border-blue-200 p-3"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-blue-900">
                                  Brand Feedback
                                </span>
                                <span className="text-xs text-blue-600">
                                  {new Date(fb.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-blue-800">{fb.feedback_text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Creator Comments */}
                      {creatorComments.length > 0 && (
                        <div className="mb-4 space-y-2">
                          {creatorComments.map((comment: any, idx: number) => (
                            <div
                              key={idx}
                              className="rounded-lg bg-purple-50 border border-purple-200 p-3"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-purple-900">
                                  Your Comment
                                </span>
                                <span className="text-xs text-purple-600">
                                  {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-purple-800">{comment.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Comment */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && !submitting) {
                              handleSubmitComment(metric.id);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleSubmitComment(metric.id)}
                          disabled={submitting || !commentText.trim()}
                          className="rounded-lg bg-purple-500 px-4 py-2 text-white hover:bg-purple-600 disabled:opacity-50"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

