/**
 * Campaign Analytics & ROI Tracking Types
 */

export interface CampaignDeliverableMetric {
  id: string;
  campaign_deliverable_id: string;
  name: string;
  display_name?: string;
  target_value?: number;
  is_custom: boolean;
  created_at: string;
  latest_update?: MetricUpdate;
  latest_feedback?: MetricFeedback;
  feedback?: MetricFeedback[];
  pending_requests?: UpdateRequest[];
}

export interface MetricUpdate {
  id: string;
  campaign_deliverable_metric_id: string;
  value: number;
  demographics?: Record<string, any>;
  screenshot_url?: string;
  ai_extracted_data?: Record<string, any>;
  submitted_by: string;
  submitted_at: string;
}

export interface MetricFeedback {
  id: string;
  metric_update_id: string;
  brand_id: string;
  feedback_text: string;
  created_at: string;
}

export interface UpdateRequest {
  id: string;
  campaign_deliverable_metric_id?: string;
  brand_id: string;
  creator_id: string;
  requested_at: string;
  status: "pending" | "completed" | "cancelled";
  campaign_deliverable_metrics?: {
    name: string;
    display_name?: string;
    campaign_deliverable_id: string;
    campaign_deliverables?: {
      platform: string;
      content_type: string;
      campaign_id: string;
      campaigns?: {
        title: string;
      };
    };
  };
}

export interface DeliverableWithMetrics {
  id: string;
  platform: string;
  content_type: string;
  quantity: number;
  guidance?: string;
  metrics: CampaignDeliverableMetric[];
}

export interface AnalyticsDashboard {
  campaign_id: string;
  campaign_title: string;
  platforms: Array<{
    platform: string;
    deliverables: Array<{
      id: string;
      platform: string;
      content_type: string;
    }>;
    metrics: CampaignDeliverableMetric[];
  }>;
  total_deliverables: number;
  total_metrics: number;
  metrics_with_updates: number;
  overall_progress: number;
}

export interface MetricHistory {
  audit_logs: Array<{
    id: string;
    campaign_deliverable_metric_id: string;
    old_value?: number;
    new_value?: number;
    changed_by: string;
    changed_at: string;
    change_reason?: string;
    profiles?: {
      name: string;
    };
  }>;
  updates: Array<MetricUpdate & {
    profiles?: {
      name: string;
    };
  }>;
}

export interface MetricCreateInput {
  campaign_deliverable_id: string;
  name: string;
  display_name?: string;
  target_value?: number;
  is_custom?: boolean;
}

export interface MetricValueSubmitInput {
  value: number;
  demographics?: Record<string, any>;
  screenshot_url?: string;
  ai_extracted_data?: Record<string, any>;
}

export interface FeedbackCreateInput {
  feedback_text: string;
}

export interface UpdateRequestCreateInput {
  campaign_deliverable_metric_id?: string;
  creator_id: string;
}

export interface ScreenshotExtractionResult {
  extracted_data: Record<string, any>;
  metric_name: string;
  suggested_value?: number;
}

export interface DeliverableMetricsResponse {
  metrics: CampaignDeliverableMetric[];
  deliverable: {
    id: string;
    description: string;
    status: string;
  };
}

