import { authenticatedFetch } from "@/lib/auth-helpers";
import {
  CampaignDeliverableMetric,
  MetricUpdate,
  MetricFeedback,
  UpdateRequest,
  DeliverableWithMetrics,
  AnalyticsDashboard,
  MetricHistory,
  MetricCreateInput,
  MetricValueSubmitInput,
  FeedbackCreateInput,
  UpdateRequestCreateInput,
  ScreenshotExtractionResult,
  DeliverableMetricsResponse,
} from "@/types/analytics";

const API_BASE_URL = "https://in-pact-ai-1k47.vercel.app";

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = "Request failed";
    try {
      const errorBody = await response.json();
      detail = errorBody.detail || errorBody.error || detail;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(detail);
  }
  return response.json();
}

// ==================== Brand Endpoints ====================

export async function createMetric(
  input: MetricCreateInput
): Promise<CampaignDeliverableMetric> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/analytics/metrics`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );
  return parseJson<CampaignDeliverableMetric>(response);
}

export async function getMetric(
  metricId: string
): Promise<CampaignDeliverableMetric> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/analytics/metrics/${metricId}`
  );
  return parseJson<CampaignDeliverableMetric>(response);
}

export async function updateMetric(
  metricId: string,
  input: Partial<MetricCreateInput>
): Promise<CampaignDeliverableMetric> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/analytics/metrics/${metricId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );
  return parseJson<CampaignDeliverableMetric>(response);
}

export async function deleteMetric(metricId: string): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/analytics/metrics/${metricId}`,
    {
      method: "DELETE",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to delete metric");
  }
}

export async function getAnalyticsDashboard(
  campaignId: string
): Promise<AnalyticsDashboard> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/analytics/campaigns/${campaignId}/dashboard`
  );
  return parseJson<AnalyticsDashboard>(response);
}

export async function getDeliverableMetrics(
  deliverableId: string
): Promise<{ metrics: CampaignDeliverableMetric[] }> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/analytics/deliverables/${deliverableId}/metrics`
  );
  return parseJson<{ metrics: CampaignDeliverableMetric[] }>(response);
}

export interface AllDeliverablesResponse {
  deliverables: Array<{
    id: string;
    campaign_id: string;
    platform: string;
    content_type: string;
    quantity: number;
    guidance?: string;
    required: boolean;
    created_at: string;
    campaign: {
      id: string;
      title: string;
      status: string;
    };
    metrics: CampaignDeliverableMetric[];
  }>;
  campaigns: Array<{
    id: string;
    title: string;
    status: string;
  }>;
  total_deliverables: number;
  total_metrics: number;
  metrics_with_updates: number;
}

export async function getAllBrandDeliverables(): Promise<AllDeliverablesResponse> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/analytics/brand/all-deliverables`
  );
  return parseJson<AllDeliverablesResponse>(response);
}

export async function createFeedback(
  updateId: string,
  input: FeedbackCreateInput
): Promise<MetricFeedback> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/analytics/metric-updates/${updateId}/feedback`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );
  return parseJson<MetricFeedback>(response);
}

export async function createUpdateRequest(
  input: UpdateRequestCreateInput
): Promise<UpdateRequest> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/analytics/update-requests`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );
  return parseJson<UpdateRequest>(response);
}

// ==================== Creator Endpoints ====================

export async function getCreatorDeliverables(
  campaignId: string
): Promise<{ deliverables: DeliverableWithMetrics[] }> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/analytics/creator/campaigns/${campaignId}/deliverables`
  );
  return parseJson<{ deliverables: DeliverableWithMetrics[] }>(response);
}

export async function submitMetricValue(
  metricId: string,
  input: MetricValueSubmitInput
): Promise<MetricUpdate> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/analytics/metrics/${metricId}/submit`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );
  return parseJson<MetricUpdate>(response);
}

export async function extractMetricsFromScreenshot(
  metricId: string,
  file: File
): Promise<ScreenshotExtractionResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await authenticatedFetch(
    `${API_BASE_URL}/analytics/metrics/${metricId}/extract-from-screenshot`,
    {
      method: "POST",
      body: formData,
    }
  );
  return parseJson<ScreenshotExtractionResult>(response);
}

export async function getPendingUpdateRequests(): Promise<{
  requests: UpdateRequest[];
}> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/analytics/creator/pending-requests`
  );
  return parseJson<{ requests: UpdateRequest[] }>(response);
}

export async function getMetricHistory(
  metricId: string
): Promise<MetricHistory> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/analytics/metrics/${metricId}/history`
  );
  return parseJson<MetricHistory>(response);
}

// ==================== Creator Analytics Endpoints ====================

export interface CreatorCampaign {
  id: string;
  title: string;
  brand_name?: string;
  brand_id?: string;
  value: number;
  progress: number;
  contract_id?: string;
  contract_status?: string;
  status: string;
}

export interface CreatorCampaignsResponse {
  campaigns: CreatorCampaign[];
}

export async function getCreatorCampaigns(): Promise<CreatorCampaignsResponse> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/analytics/creator/campaigns`
  );
  return parseJson<CreatorCampaignsResponse>(response);
}

export interface PlatformDeliverable {
  platform: string;
  deliverables: Array<{
    id: string;
    contract_deliverable_id: string;
    campaign_deliverable_id?: string;
    description: string;
    status: string;
    due_date?: string;
    platform: string;
    content_type?: string;
    quantity: number;
    guidance?: string;
  }>;
  total: number;
  completed: number;
  progress: number;
}

export interface CreatorCampaignDetails {
  id: string;
  title: string;
  brand_name?: string;
  brand_id?: string;
  platforms: PlatformDeliverable[];
  contract_id?: string;
}

export async function getCreatorCampaignDetails(
  campaignId: string
): Promise<CreatorCampaignDetails> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/analytics/creator/campaigns/${campaignId}`
  );
  return parseJson<CreatorCampaignDetails>(response);
}

export interface PlatformDeliverablesResponse {
  deliverables: Array<{
    id: string;
    contract_deliverable_id: string;
    campaign_deliverable_id?: string;
    description: string;
    status: string;
    due_date?: string;
    platform: string;
    content_type?: string;
    quantity: number;
    guidance?: string;
  }>;
  platform: string;
}

export async function getPlatformDeliverables(
  campaignId: string,
  platform: string
): Promise<PlatformDeliverablesResponse> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/analytics/creator/campaigns/${campaignId}/platform/${platform}/deliverables`
  );
  return parseJson<PlatformDeliverablesResponse>(response);
}

export async function getCreatorDeliverableMetrics(
  deliverableId: string
): Promise<DeliverableMetricsResponse> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/analytics/creator/deliverables/${deliverableId}/metrics`
  );
  return parseJson<DeliverableMetricsResponse>(response);
}

export interface CreatorCommentInput {
  comment_text: string;
  metric_update_id?: string;
}

export async function createCreatorComment(
  metricId: string,
  input: CreatorCommentInput
): Promise<{ success: boolean; message: string; metric_update_id: string }> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/analytics/creator/metrics/${metricId}/comment`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );
  return parseJson(response);
}

// ==================== Dashboard Stats Endpoints ====================

export interface BrandDashboardStats {
  overview: {
    total_campaigns: number;
    active_campaigns: number;
    draft_campaigns: number;
    completed_campaigns: number;
    total_contracts: number;
    active_contracts: number;
    total_proposals: number;
    accepted_proposals: number;
    pending_proposals: number;
    total_deliverables: number;
    total_metrics: number;
    metrics_with_updates: number;
    total_budget: number;
    total_engagement: number;
    avg_engagement: number;
  };
  platform_distribution: Record<string, number>;
  status_distribution: Record<string, number>;
  monthly_campaigns: Record<string, number>;
  monthly_engagement: Record<string, number>;
}

export async function getBrandDashboardStats(): Promise<BrandDashboardStats> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/analytics/brand/dashboard-stats`
  );
  return parseJson<BrandDashboardStats>(response);
}

export interface CreatorDashboardStats {
  overview: {
    total_campaigns: number;
    active_campaigns: number;
    completed_campaigns: number;
    total_proposals: number;
    accepted_proposals: number;
    pending_proposals: number;
    rejected_proposals: number;
    total_deliverables: number;
    completed_deliverables: number;
    pending_deliverables: number;
    total_metrics: number;
    metrics_submitted: number;
    total_earnings: number;
    total_engagement: number;
    avg_engagement: number;
  };
  platform_distribution: Record<string, number>;
  status_distribution: Record<string, number>;
  deliverable_status: Record<string, number>;
  monthly_earnings: Record<string, number>;
  monthly_engagement: Record<string, number>;
}

export async function getCreatorDashboardStats(): Promise<CreatorDashboardStats> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/analytics/creator/dashboard-stats`
  );
  return parseJson<CreatorDashboardStats>(response);
}

// ==================== AI-Powered Analytics Endpoints ====================

export interface PredictiveAnalyticsRequest {
  campaign_id?: string;
  metric_type?: string; // 'performance', 'roi', 'engagement'
  forecast_periods?: number; // days
}

export interface PredictiveAnalyticsResponse {
  forecast: {
    predicted_value: number;
    trend: string;
    growth_rate: number;
    forecasted_values: Array<{ date: string; value: number }>;
  };
  confidence: string;
  factors: string[];
  recommendations: string[];
}

export async function getPredictiveAnalytics(
  request: PredictiveAnalyticsRequest
): Promise<PredictiveAnalyticsResponse> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/analytics/ai/predictive`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    }
  );
  return parseJson<PredictiveAnalyticsResponse>(response);
}

export interface AutomatedInsightsResponse {
  summary: string;
  trends: string[];
  anomalies: Array<{
    metric: string;
    description: string;
    severity: string;
  }>;
  recommendations: string[];
  key_metrics: Record<string, any>;
}

export async function getAutomatedInsights(
  campaignId?: string
): Promise<AutomatedInsightsResponse> {
  const url = campaignId
    ? `${API_BASE_URL}/analytics/ai/insights?campaign_id=${campaignId}`
    : `${API_BASE_URL}/analytics/ai/insights`;
  const response = await authenticatedFetch(url);
  return parseJson<AutomatedInsightsResponse>(response);
}

export interface AudienceSegmentationResponse {
  segments: Array<{
    name: string;
    size: number;
    characteristics: string[];
    demographics?: Record<string, any>;
    interests?: string[];
    engagement_score?: number;
  }>;
  visualization_data: Record<string, any>;
}

export async function getAudienceSegmentation(
  campaignId?: string
): Promise<AudienceSegmentationResponse> {
  const url = campaignId
    ? `${API_BASE_URL}/analytics/ai/audience-segmentation?campaign_id=${campaignId}`
    : `${API_BASE_URL}/analytics/ai/audience-segmentation`;
  const response = await authenticatedFetch(url);
  return parseJson<AudienceSegmentationResponse>(response);
}

export interface SentimentAnalysisRequest {
  text?: string;
  campaign_id?: string;
}

export interface SentimentAnalysisResponse {
  overall_sentiment: string;
  sentiment_score: number;
  positive_aspects: string[];
  negative_aspects: string[];
  recommendations: string[];
}

export async function analyzeSentiment(
  request: SentimentAnalysisRequest
): Promise<SentimentAnalysisResponse> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/analytics/ai/sentiment`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    }
  );
  return parseJson<SentimentAnalysisResponse>(response);
}

export interface AnomalyDetectionResponse {
  anomalies: Array<{
    metric: string;
    date: string;
    value: number;
    expected_value: number;
    deviation: number;
    severity: string;
    description: string;
  }>;
  summary: string;
}

export async function detectAnomalies(
  campaignId?: string
): Promise<AnomalyDetectionResponse> {
  const url = campaignId
    ? `${API_BASE_URL}/analytics/ai/anomaly-detection?campaign_id=${campaignId}`
    : `${API_BASE_URL}/analytics/ai/anomaly-detection`;
  const response = await authenticatedFetch(url);
  return parseJson<AnomalyDetectionResponse>(response);
}

export interface AttributionModelingResponse {
  attribution: Record<string, number>;
  top_contributors: Array<{
    name: string;
    contribution_percent: number;
    total_value: number;
    insight: string;
  }>;
  insights: string[];
}

export async function getAttributionModeling(
  campaignId?: string
): Promise<AttributionModelingResponse> {
  const url = campaignId
    ? `${API_BASE_URL}/analytics/ai/attribution?campaign_id=${campaignId}`
    : `${API_BASE_URL}/analytics/ai/attribution`;
  const response = await authenticatedFetch(url);
  return parseJson<AttributionModelingResponse>(response);
}

export interface BenchmarkingResponse {
  your_metrics: Record<string, number>;
  industry_benchmarks: Record<string, number>;
  comparison: Record<string, {
    your_value: number;
    industry_avg: number;
    percentile: number;
    status: string;
  }>;
  recommendations: string[];
}

export async function getBenchmarking(
  campaignId?: string
): Promise<BenchmarkingResponse> {
  const url = campaignId
    ? `${API_BASE_URL}/analytics/ai/benchmarking?campaign_id=${campaignId}`
    : `${API_BASE_URL}/analytics/ai/benchmarking`;
  const response = await authenticatedFetch(url);
  return parseJson<BenchmarkingResponse>(response);
}

export interface ChurnPredictionResponse {
  churn_risk: Record<string, number>;
  at_risk_segments: Array<{
    segment: string;
    risk_score: number;
    indicators: string[];
    recommendations: string[];
  }>;
  recommendations: string[];
}

export async function predictChurn(
  campaignId?: string
): Promise<ChurnPredictionResponse> {
  const url = campaignId
    ? `${API_BASE_URL}/analytics/ai/churn-prediction?campaign_id=${campaignId}`
    : `${API_BASE_URL}/analytics/ai/churn-prediction`;
  const response = await authenticatedFetch(url);
  return parseJson<ChurnPredictionResponse>(response);
}

export interface NaturalLanguageQueryRequest {
  query: string;
  campaign_id?: string;
}

export interface NaturalLanguageQueryResponse {
  answer: string;
  data_sources: string[];
  confidence: string;
}

export async function naturalLanguageQuery(
  request: NaturalLanguageQueryRequest
): Promise<NaturalLanguageQueryResponse> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/analytics/ai/natural-language-query`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    }
  );
  return parseJson<NaturalLanguageQueryResponse>(response);
}

export interface KPIOptimizationResponse {
  current_kpis: Record<string, number>;
  optimization_suggestions: Array<{
    kpi: string;
    current_value: number;
    target_value: number;
    suggestions: string[];
    expected_impact: string;
  }>;
  priority_actions: string[];
}

export async function getKPIOptimization(
  campaignId?: string
): Promise<KPIOptimizationResponse> {
  const url = campaignId
    ? `${API_BASE_URL}/analytics/ai/kpi-optimization?campaign_id=${campaignId}`
    : `${API_BASE_URL}/analytics/ai/kpi-optimization`;
  const response = await authenticatedFetch(url);
  return parseJson<KPIOptimizationResponse>(response);
}

