"use client";

import { useState, useEffect } from "react";
import {
  getPredictiveAnalytics,
  getAutomatedInsights,
  getAudienceSegmentation,
  analyzeSentiment,
  detectAnomalies,
  getAttributionModeling,
  getBenchmarking,
  predictChurn,
  naturalLanguageQuery,
  getKPIOptimization,
  type PredictiveAnalyticsResponse,
  type AutomatedInsightsResponse,
  type AudienceSegmentationResponse,
  type SentimentAnalysisResponse,
  type AnomalyDetectionResponse,
  type AttributionModelingResponse,
  type BenchmarkingResponse,
  type ChurnPredictionResponse,
  type NaturalLanguageQueryResponse,
  type KPIOptimizationResponse,
} from "@/lib/api/analytics";
import {
  TrendingUp,
  Brain,
  Users,
  MessageSquare,
  AlertTriangle,
  BarChart3,
  Target,
  TrendingDown,
  Search,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Zap,
  Activity,
  PieChart,
} from "lucide-react";

interface AIAnalyticsDashboardProps {
  campaignId?: string;
  role?: "brand" | "creator";
}

export default function AIAnalyticsDashboard({
  campaignId,
  role = "brand",
}: AIAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("insights");
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string | null>>({});

  // Data states
  const [insights, setInsights] = useState<AutomatedInsightsResponse | null>(null);
  const [predictive, setPredictive] = useState<PredictiveAnalyticsResponse | null>(null);
  const [segmentation, setSegmentation] = useState<AudienceSegmentationResponse | null>(null);
  const [sentiment, setSentiment] = useState<SentimentAnalysisResponse | null>(null);
  const [sentimentText, setSentimentText] = useState("");
  const [anomalies, setAnomalies] = useState<AnomalyDetectionResponse | null>(null);
  const [attribution, setAttribution] = useState<AttributionModelingResponse | null>(null);
  const [benchmarking, setBenchmarking] = useState<BenchmarkingResponse | null>(null);
  const [churn, setChurn] = useState<ChurnPredictionResponse | null>(null);
  const [kpiOptimization, setKPIOptimization] = useState<KPIOptimizationResponse | null>(null);

  // Natural language query
  const [nlQuery, setNlQuery] = useState("");
  const [nlResponse, setNlResponse] = useState<NaturalLanguageQueryResponse | null>(null);
  const [nlLoading, setNlLoading] = useState(false);

  useEffect(() => {
    loadInsights();
  }, [campaignId]);

  const setLoadingState = (key: string, value: boolean) => {
    setLoading((prev) => ({ ...prev, [key]: value }));
  };

  const setErrorState = (key: string, value: string | null) => {
    setError((prev) => ({ ...prev, [key]: value }));
  };

  const loadInsights = async () => {
    setLoadingState("insights", true);
    setErrorState("insights", null);
    try {
      const data = await getAutomatedInsights(campaignId);
      setInsights(data);
    } catch (err: any) {
      setErrorState("insights", err.message || "Failed to load insights");
    } finally {
      setLoadingState("insights", false);
    }
  };

  const loadPredictive = async () => {
    setLoadingState("predictive", true);
    setErrorState("predictive", null);
    try {
      const data = await getPredictiveAnalytics({
        campaign_id: campaignId,
        forecast_periods: 30,
      });
      setPredictive(data);
    } catch (err: any) {
      setErrorState("predictive", err.message || "Failed to load predictive analytics");
    } finally {
      setLoadingState("predictive", false);
    }
  };

  const loadSegmentation = async () => {
    setLoadingState("segmentation", true);
    setErrorState("segmentation", null);
    try {
      const data = await getAudienceSegmentation(campaignId);
      setSegmentation(data);
    } catch (err: any) {
      setErrorState("segmentation", err.message || "Failed to load audience segmentation");
    } finally {
      setLoadingState("segmentation", false);
    }
  };

  const loadSentiment = async (customText?: string) => {
    setLoadingState("sentiment", true);
    setErrorState("sentiment", null);
    try {
      const data = await analyzeSentiment({
        campaign_id: campaignId,
        text: customText || sentimentText || undefined
      });
      setSentiment(data);
      if (customText || sentimentText) {
        setSentimentText(""); // Clear after successful analysis
      }
    } catch (err: any) {
      setErrorState("sentiment", err.message || "Failed to analyze sentiment");
    } finally {
      setLoadingState("sentiment", false);
    }
  };

  const loadAnomalies = async () => {
    setLoadingState("anomalies", true);
    setErrorState("anomalies", null);
    try {
      const data = await detectAnomalies(campaignId);
      setAnomalies(data);
    } catch (err: any) {
      setErrorState("anomalies", err.message || "Failed to detect anomalies");
    } finally {
      setLoadingState("anomalies", false);
    }
  };

  const loadAttribution = async () => {
    setLoadingState("attribution", true);
    setErrorState("attribution", null);
    try {
      const data = await getAttributionModeling(campaignId);
      setAttribution(data);
    } catch (err: any) {
      setErrorState("attribution", err.message || "Failed to load attribution modeling");
    } finally {
      setLoadingState("attribution", false);
    }
  };

  const loadBenchmarking = async () => {
    setLoadingState("benchmarking", true);
    setErrorState("benchmarking", null);
    try {
      const data = await getBenchmarking(campaignId);
      setBenchmarking(data);
    } catch (err: any) {
      setErrorState("benchmarking", err.message || "Failed to load benchmarking");
    } finally {
      setLoadingState("benchmarking", false);
    }
  };

  const loadChurn = async () => {
    setLoadingState("churn", true);
    setErrorState("churn", null);
    try {
      const data = await predictChurn(campaignId);
      setChurn(data);
    } catch (err: any) {
      setErrorState("churn", err.message || "Failed to predict churn");
    } finally {
      setLoadingState("churn", false);
    }
  };

  const loadKPIOptimization = async () => {
    setLoadingState("kpi", true);
    setErrorState("kpi", null);
    try {
      const data = await getKPIOptimization(campaignId);
      setKPIOptimization(data);
    } catch (err: any) {
      setErrorState("kpi", err.message || "Failed to load KPI optimization");
    } finally {
      setLoadingState("kpi", false);
    }
  };

  const handleNLQuery = async () => {
    if (!nlQuery.trim()) return;
    setNlLoading(true);
    try {
      const response = await naturalLanguageQuery({
        query: nlQuery,
        campaign_id: campaignId,
      });
      setNlResponse(response);
    } catch (err: any) {
      setErrorState("nl", err.message || "Failed to process query");
    } finally {
      setNlLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Load data when tab is first accessed
    if (tab === "predictive" && !predictive) loadPredictive();
    if (tab === "segmentation" && !segmentation) loadSegmentation();
    if (tab === "sentiment" && !sentiment) loadSentiment();
    if (tab === "anomalies" && !anomalies) loadAnomalies();
    if (tab === "attribution" && !attribution) loadAttribution();
    if (tab === "benchmarking" && !benchmarking) loadBenchmarking();
    if (tab === "churn" && !churn) loadChurn();
    if (tab === "kpi" && !kpiOptimization) loadKPIOptimization();
  };

  const tabs = [
    { id: "insights", label: "Automated Insights", icon: Brain },
    { id: "predictive", label: "Predictive Analytics", icon: TrendingUp },
    { id: "segmentation", label: "Audience Segmentation", icon: Users },
    { id: "sentiment", label: "Sentiment Analysis", icon: MessageSquare },
    { id: "anomalies", label: "Anomaly Detection", icon: AlertTriangle },
    { id: "attribution", label: "Attribution Modeling", icon: BarChart3 },
    { id: "benchmarking", label: "Benchmarking", icon: Target },
    { id: "churn", label: "Churn Prediction", icon: TrendingDown },
    { id: "kpi", label: "KPI Optimization", icon: Zap },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI-Powered Analytics</h1>
          <p className="text-gray-600 mt-1">
            Advanced analytics powered by AI to help you make data-driven decisions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-500" />
          <span className="text-sm text-gray-500">Powered by AI</span>
        </div>
      </div>

      {/* Natural Language Query */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Search className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold text-gray-900">Ask Your Data</h3>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={nlQuery}
            onChange={(e) => setNlQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleNLQuery()}
            placeholder="Ask a question about your analytics data... (e.g., 'What's my average engagement rate?')"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={handleNLQuery}
            disabled={nlLoading || !nlQuery.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {nlLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Ask
          </button>
        </div>
        {nlResponse && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <p className="text-gray-900">{nlResponse.answer}</p>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
              <span>Confidence: {nlResponse.confidence}</span>
              {nlResponse.data_sources.length > 0 && (
                <span>Sources: {nlResponse.data_sources.join(", ")}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "insights" && (
          <InsightsTab
            data={insights}
            loading={loading.insights}
            error={error.insights}
            onRefresh={loadInsights}
          />
        )}
        {activeTab === "predictive" && (
          <PredictiveTab
            data={predictive}
            loading={loading.predictive}
            error={error.predictive}
            onRefresh={loadPredictive}
          />
        )}
        {activeTab === "segmentation" && (
          <SegmentationTab
            data={segmentation}
            loading={loading.segmentation}
            error={error.segmentation}
            onRefresh={loadSegmentation}
          />
        )}
        {activeTab === "sentiment" && (
          <SentimentTab
            data={sentiment}
            loading={loading.sentiment}
            error={error.sentiment}
            onRefresh={loadSentiment}
            sentimentText={sentimentText}
            setSentimentText={setSentimentText}
            onAnalyzeText={loadSentiment}
          />
        )}
        {activeTab === "anomalies" && (
          <AnomaliesTab
            data={anomalies}
            loading={loading.anomalies}
            error={error.anomalies}
            onRefresh={loadAnomalies}
          />
        )}
        {activeTab === "attribution" && (
          <AttributionTab
            data={attribution}
            loading={loading.attribution}
            error={error.attribution}
            onRefresh={loadAttribution}
          />
        )}
        {activeTab === "benchmarking" && (
          <BenchmarkingTab
            data={benchmarking}
            loading={loading.benchmarking}
            error={error.benchmarking}
            onRefresh={loadBenchmarking}
          />
        )}
        {activeTab === "churn" && (
          <ChurnTab
            data={churn}
            loading={loading.churn}
            error={error.churn}
            onRefresh={loadChurn}
          />
        )}
        {activeTab === "kpi" && (
          <KPITab
            data={kpiOptimization}
            loading={loading.kpi}
            error={error.kpi}
            onRefresh={loadKPIOptimization}
          />
        )}
      </div>
    </div>
  );
}

// Tab Components
function InsightsTab({
  data,
  loading,
  error,
  onRefresh,
}: {
  data: AutomatedInsightsResponse | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}) {
  if (loading)
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Automated Insights</h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
        <h3 className="font-semibold text-gray-900 mb-2">Executive Summary</h3>
        <p className="text-gray-700">{data.summary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Key Trends
          </h3>
          <ul className="space-y-2">
            {data.trends.map((trend, idx) => (
              <li key={idx} className="text-gray-700 flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                {trend}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Recommendations
          </h3>
          <ul className="space-y-2">
            {data.recommendations.map((rec, idx) => (
              <li key={idx} className="text-gray-700 flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {data.anomalies.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Detected Anomalies
          </h3>
          <div className="space-y-3">
            {data.anomalies.map((anomaly, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${
                  anomaly.severity === "high"
                    ? "bg-red-50 border-red-200"
                    : anomaly.severity === "medium"
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="font-medium text-gray-900">{anomaly.metric}</div>
                <div className="text-sm text-gray-600 mt-1">{anomaly.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PredictiveTab({
  data,
  loading,
  error,
  onRefresh,
}: {
  data: PredictiveAnalyticsResponse | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}) {
  if (loading)
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Predictive Analytics</h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Predicted Value</div>
          <div className="text-3xl font-bold text-gray-900">
            {data.forecast.predicted_value.toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Growth Rate</div>
          <div className="text-3xl font-bold text-green-600">
            {(data.forecast.growth_rate * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Confidence</div>
          <div className="text-3xl font-bold text-purple-600 capitalize">{data.confidence}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Forecasted Values</h3>
        <div className="space-y-2">
          {data.forecast.forecasted_values.slice(0, 10).map((fv, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-gray-700">{fv.date}</span>
              <span className="font-medium text-gray-900">{fv.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Key Factors</h3>
        <ul className="space-y-2">
          {data.factors.map((factor, idx) => (
            <li key={idx} className="text-gray-700 flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              {factor}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recommendations</h3>
        <ul className="space-y-2">
          {data.recommendations.map((rec, idx) => (
            <li key={idx} className="text-gray-700 flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SegmentationTab({
  data,
  loading,
  error,
  onRefresh,
}: {
  data: AudienceSegmentationResponse | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}) {
  if (loading)
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Audience Segmentation</h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.segments.map((segment, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{segment.name}</h3>
              <span className="text-sm text-gray-600">{segment.size}%</span>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Characteristics:</div>
              <ul className="space-y-1">
                {segment.characteristics.map((char, charIdx) => (
                  <li key={charIdx} className="text-gray-700 text-sm flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    {char}
                  </li>
                ))}
              </ul>
              {segment.engagement_score !== undefined && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600">Engagement Score</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {(segment.engagement_score * 100).toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SentimentTab({
  data,
  loading,
  error,
  onRefresh,
  sentimentText,
  setSentimentText,
  onAnalyzeText,
}: {
  data: SentimentAnalysisResponse | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  sentimentText: string;
  setSentimentText: (text: string) => void;
  onAnalyzeText: (text?: string) => void;
}) {
  if (loading)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Sentiment Analysis</h2>
        </div>
        {/* Text Input Section - Show even while loading */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Analyze Custom Text</h3>
          <p className="text-sm text-gray-600 mb-4">
            Paste text from social media comments, reviews, or feedback to analyze sentiment
          </p>
          <div className="space-y-3">
            <textarea
              value={sentimentText}
              onChange={(e) => setSentimentText(e.target.value)}
              placeholder="Paste text here to analyze sentiment... (e.g., social media comments, reviews, feedback)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={() => onAnalyzeText(sentimentText)}
                disabled={loading || !sentimentText.trim()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4 animate-spin" />
                Analyzing...
              </button>
              {sentimentText && (
                <button
                  onClick={() => setSentimentText("")}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  if (error)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Sentiment Analysis</h2>
          <button
            onClick={onRefresh}
            className="px-4 py-2 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
        {/* Text Input Section - Show even on error */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Analyze Custom Text</h3>
          <p className="text-sm text-gray-600 mb-4">
            Paste text from social media comments, reviews, or feedback to analyze sentiment
          </p>
          <div className="space-y-3">
            <textarea
              value={sentimentText}
              onChange={(e) => setSentimentText(e.target.value)}
              placeholder="Paste text here to analyze sentiment... (e.g., social media comments, reviews, feedback)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={() => onAnalyzeText(sentimentText)}
                disabled={loading || !sentimentText.trim()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Analyze Text
              </button>
              {sentimentText && (
                <button
                  onClick={() => setSentimentText("")}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  if (!data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Sentiment Analysis</h2>
          <button
            onClick={onRefresh}
            className="px-4 py-2 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
        {/* Text Input Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Analyze Custom Text</h3>
          <p className="text-sm text-gray-600 mb-4">
            Paste text from social media comments, reviews, or feedback to analyze sentiment
          </p>
          <div className="space-y-3">
            <textarea
              value={sentimentText}
              onChange={(e) => setSentimentText(e.target.value)}
              placeholder="Paste text here to analyze sentiment... (e.g., social media comments, reviews, feedback)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={() => onAnalyzeText(sentimentText)}
                disabled={loading || !sentimentText.trim()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Analyze Text
              </button>
              {sentimentText && (
                <button
                  onClick={() => setSentimentText("")}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Or click "Refresh" above to analyze feedback from your campaign metrics
          </p>
        </div>
      </div>
    );
  }

  const sentimentColor =
    data.overall_sentiment === "positive"
      ? "green"
      : data.overall_sentiment === "negative"
      ? "red"
      : "gray";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Sentiment Analysis</h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Text Input Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Analyze Custom Text</h3>
        <p className="text-sm text-gray-600 mb-4">
          Paste text from social media comments, reviews, or feedback to analyze sentiment
        </p>
        <div className="space-y-3">
          <textarea
            value={sentimentText}
            onChange={(e) => setSentimentText(e.target.value)}
            placeholder="Paste text here to analyze sentiment... (e.g., social media comments, reviews, feedback)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={4}
          />
          <div className="flex gap-2">
            <button
              onClick={() => onAnalyzeText(sentimentText)}
              disabled={loading || !sentimentText.trim()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
              Analyze Text
            </button>
            {sentimentText && (
              <button
                onClick={() => setSentimentText("")}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Or click "Refresh" above to analyze feedback from your campaign metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Overall Sentiment</div>
          <div className={`text-3xl font-bold text-${sentimentColor}-600 capitalize mb-2`}>
            {data.overall_sentiment}
          </div>
          <div className="text-sm text-gray-600">Score: {data.sentiment_score.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">Sentiment Score</div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full ${
                data.sentiment_score > 0 ? "bg-green-500" : "bg-red-500"
              }`}
              style={{ width: `${Math.abs(data.sentiment_score) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-green-700">Positive Aspects</h3>
          <ul className="space-y-2">
            {data.positive_aspects.map((aspect, idx) => (
              <li key={idx} className="text-gray-700 flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                {aspect}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-red-700">Negative Aspects</h3>
          <ul className="space-y-2">
            {data.negative_aspects.map((aspect, idx) => (
              <li key={idx} className="text-gray-700 flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                {aspect}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recommendations</h3>
        <ul className="space-y-2">
          {data.recommendations.map((rec, idx) => (
            <li key={idx} className="text-gray-700 flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AnomaliesTab({
  data,
  loading,
  error,
  onRefresh,
}: {
  data: AnomalyDetectionResponse | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}) {
  if (loading)
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Anomaly Detection</h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
        <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
        <p className="text-gray-700">{data.summary}</p>
      </div>

      {data.anomalies.length > 0 ? (
        <div className="space-y-4">
          {data.anomalies.map((anomaly, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-lg shadow-sm border p-6 ${
                anomaly.severity === "high"
                  ? "border-red-300 bg-red-50"
                  : anomaly.severity === "medium"
                  ? "border-yellow-300 bg-yellow-50"
                  : "border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{anomaly.metric}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    anomaly.severity === "high"
                      ? "bg-red-100 text-red-800"
                      : anomaly.severity === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {anomaly.severity}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">Date: {anomaly.date}</div>
              <div className="text-sm text-gray-700 mb-2">{anomaly.description}</div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <div className="text-xs text-gray-600">Value</div>
                  <div className="font-medium text-gray-900">{anomaly.value.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Expected</div>
                  <div className="font-medium text-gray-900">{anomaly.expected_value.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Deviation</div>
                  <div className="font-medium text-red-600">{anomaly.deviation.toFixed(2)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <p className="text-green-800">No anomalies detected. Your metrics are within normal ranges.</p>
        </div>
      )}
    </div>
  );
}

function AttributionTab({
  data,
  loading,
  error,
  onRefresh,
}: {
  data: AttributionModelingResponse | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}) {
  if (loading)
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Attribution Modeling</h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Attribution Breakdown</h3>
        <div className="space-y-4">
          {Object.entries(data.attribution).map(([channel, percent]) => (
            <div key={channel}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-700">{channel}</span>
                <span className="font-medium text-gray-900">{percent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Top Contributors</h3>
        <div className="space-y-4">
          {data.top_contributors.map((contributor, idx) => (
            <div key={idx} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{contributor.name}</h4>
                <span className="text-lg font-bold text-purple-600">
                  {contributor.contribution_percent.toFixed(1)}%
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-1">
                Total Value: {contributor.total_value.toFixed(2)}
              </div>
              <div className="text-sm text-gray-700">{contributor.insight}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Insights</h3>
        <ul className="space-y-2">
          {data.insights.map((insight, idx) => (
            <li key={idx} className="text-gray-700 flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              {insight}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function BenchmarkingTab({
  data,
  loading,
  error,
  onRefresh,
}: {
  data: BenchmarkingResponse | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}) {
  if (loading)
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Industry Benchmarking</h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(data.comparison).map(([metric, comp]) => (
          <div key={metric} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">{metric}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Your Value</span>
                <span className="font-medium text-gray-900">{comp.your_value.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Industry Average</span>
                <span className="font-medium text-gray-600">{comp.industry_avg.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Percentile</span>
                <span className="font-medium text-purple-600">{comp.percentile}th</span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    comp.status === "above"
                      ? "bg-green-100 text-green-800"
                      : comp.status === "below"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {comp.status} average
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recommendations</h3>
        <ul className="space-y-2">
          {data.recommendations.map((rec, idx) => (
            <li key={idx} className="text-gray-700 flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ChurnTab({
  data,
  loading,
  error,
  onRefresh,
}: {
  data: ChurnPredictionResponse | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}) {
  if (loading)
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Churn Prediction</h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {data.at_risk_segments.length > 0 ? (
        <div className="space-y-4">
          {data.at_risk_segments.map((segment, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow-sm border border-red-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{segment.segment}</h3>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  {(segment.risk_score * 100).toFixed(0)}% Risk
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Indicators</div>
                  <ul className="space-y-1">
                    {segment.indicators.map((indicator, indIdx) => (
                      <li key={indIdx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        {indicator}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Recommendations</div>
                  <ul className="space-y-1">
                    {segment.recommendations.map((rec, recIdx) => (
                      <li key={recIdx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <p className="text-green-800">No high-risk segments detected. Your audience engagement is stable.</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">General Recommendations</h3>
        <ul className="space-y-2">
          {data.recommendations.map((rec, idx) => (
            <li key={idx} className="text-gray-700 flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function KPITab({
  data,
  loading,
  error,
  onRefresh,
}: {
  data: KPIOptimizationResponse | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}) {
  if (loading)
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">KPI Optimization</h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Current KPIs</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(data.current_kpis).map(([kpi, value]) => (
            <div key={kpi} className="text-center">
              <div className="text-sm text-gray-600 mb-1">{kpi}</div>
              <div className="text-2xl font-bold text-gray-900">{value.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {data.optimization_suggestions.map((suggestion, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{suggestion.kpi}</h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  suggestion.expected_impact === "high"
                    ? "bg-green-100 text-green-800"
                    : suggestion.expected_impact === "medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {suggestion.expected_impact} impact
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-600">Current Value</div>
                <div className="text-lg font-medium text-gray-900">
                  {suggestion.current_value.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Target Value</div>
                <div className="text-lg font-medium text-green-600">
                  {suggestion.target_value.toFixed(2)}
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-2">Suggestions</div>
              <ul className="space-y-1">
                {suggestion.suggestions.map((sug, sugIdx) => (
                  <li key={sugIdx} className="text-gray-700 text-sm flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    {sug}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
        <h3 className="font-semibold text-gray-900 mb-4">Priority Actions</h3>
        <ul className="space-y-2">
          {data.priority_actions.map((action, idx) => (
            <li key={idx} className="text-gray-700 flex items-start gap-2">
              <span className="text-purple-500 mt-1 font-bold">{idx + 1}.</span>
              {action}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

