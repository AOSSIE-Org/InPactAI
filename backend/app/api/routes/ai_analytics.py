"""
AI-Powered Analytics endpoints for predictive analytics, insights, segmentation, etc.
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
import json
from groq import Groq
from app.core.supabase_clients import supabase_anon
from app.core.dependencies import get_current_user
from app.core.config import settings

router = APIRouter()


def get_groq_client():
    """Get Groq client instance"""
    if not settings.groq_api_key:
        raise HTTPException(status_code=500, detail="GROQ API key not configured")
    return Groq(api_key=settings.groq_api_key)


async def get_user_profile(user: dict):
    """Get brand or creator profile based on user role"""
    role = user.get("role")
    user_id = user.get("id")

    if role == "Brand":
        brand_res = supabase_anon.table("brands") \
            .select("*") \
            .eq("user_id", user_id) \
            .single() \
            .execute()
        if brand_res.data:
            return {"type": "brand", "profile": brand_res.data}
    elif role == "Creator":
        creator_res = supabase_anon.table("creators") \
            .select("*") \
            .eq("user_id", user_id) \
            .single() \
            .execute()
        if creator_res.data:
            return {"type": "creator", "profile": creator_res.data}

    raise HTTPException(
        status_code=403,
        detail="User profile not found. Please complete onboarding."
    )


def get_historical_metrics(brand_id: Optional[str] = None, creator_id: Optional[str] = None, campaign_id: Optional[str] = None):
    """Fetch historical metrics data for analysis"""
    # Build query for metric updates
    query = supabase_anon.table("campaign_deliverable_metric_updates").select("*")

    # Get metric IDs based on filters
    metric_ids = []
    has_filters = False

    if brand_id:
        has_filters = True
        # Filter by brand through campaigns
        campaigns_res = supabase_anon.table("campaigns") \
            .select("id") \
            .eq("brand_id", brand_id) \
            .execute()
        campaign_ids = [c["id"] for c in campaigns_res.data or []]
        if campaign_ids:
            deliverables_res = supabase_anon.table("campaign_deliverables") \
                .select("id") \
                .in_("campaign_id", campaign_ids) \
                .execute()
            deliverable_ids = [d["id"] for d in deliverables_res.data or []]
            if deliverable_ids:
                metrics_res = supabase_anon.table("campaign_deliverable_metrics") \
                    .select("id") \
                    .in_("campaign_deliverable_id", deliverable_ids) \
                    .execute()
                metric_ids = [m["id"] for m in metrics_res.data or []]

    if campaign_id:
        has_filters = True
        deliverables_res = supabase_anon.table("campaign_deliverables") \
            .select("id") \
            .eq("campaign_id", campaign_id) \
            .execute()
        deliverable_ids = [d["id"] for d in deliverables_res.data or []]
        if deliverable_ids:
            metrics_res = supabase_anon.table("campaign_deliverable_metrics") \
                .select("id") \
                .in_("campaign_deliverable_id", deliverable_ids) \
                .execute()
            campaign_metric_ids = [m["id"] for m in metrics_res.data or []]
            if metric_ids:
                # Intersect with brand filter
                metric_ids = [m for m in metric_ids if m in campaign_metric_ids]
            else:
                metric_ids = campaign_metric_ids

    # Apply metric filters only if we have specific filters
    # If no filters, get all updates (for creator-only case)
    if has_filters:
        if metric_ids:
            query = query.in_("campaign_deliverable_metric_id", metric_ids)
        else:
            # If we have filters but no metrics found, return empty
            # This means the brand/campaign exists but has no metrics/updates yet
            return []

    if creator_id:
        query = query.eq("submitted_by", creator_id)

    # Execute query
    try:
        result = query.order("submitted_at", desc=False).limit(1000).execute()
        updates = result.data or []
    except Exception as e:
        # If query fails, return empty
        return []

    if not updates:
        return []

    # Enrich with metric and deliverable data
    metric_ids_from_updates = list(set([u["campaign_deliverable_metric_id"] for u in updates if u.get("campaign_deliverable_metric_id")]))

    if metric_ids_from_updates:
        metrics_res = supabase_anon.table("campaign_deliverable_metrics") \
            .select("id, name, display_name, campaign_deliverable_id") \
            .in_("id", metric_ids_from_updates) \
            .execute()
        metrics = {m["id"]: m for m in (metrics_res.data or [])}
    else:
        metrics = {}

    deliverable_ids = list(set([m.get("campaign_deliverable_id") for m in metrics.values() if m.get("campaign_deliverable_id")]))
    if deliverable_ids:
        deliverables_res = supabase_anon.table("campaign_deliverables") \
            .select("id, campaign_id, platform, content_type") \
            .in_("id", deliverable_ids) \
            .execute()
        deliverables = {d["id"]: d for d in (deliverables_res.data or [])}
    else:
        deliverables = {}

    # Combine data
    enriched_updates = []
    for update in updates:
        metric_id = update.get("campaign_deliverable_metric_id")
        metric = metrics.get(metric_id, {}) if metric_id else {}
        deliverable_id = metric.get("campaign_deliverable_id")
        deliverable = deliverables.get(deliverable_id, {}) if deliverable_id else {}

        enriched_update = {
            **update,
            "campaign_deliverable_metrics": metric,
            "campaign_deliverables": deliverable
        }
        enriched_updates.append(enriched_update)

    return enriched_updates


# ==================== Pydantic Models ====================

class PredictiveAnalyticsRequest(BaseModel):
    campaign_id: Optional[str] = None
    metric_type: Optional[str] = None  # 'performance', 'roi', 'engagement'
    forecast_periods: int = 30  # days


class PredictiveAnalyticsResponse(BaseModel):
    forecast: Dict[str, Any]
    confidence: str
    factors: List[str]
    recommendations: List[str]


class AutomatedInsightsResponse(BaseModel):
    summary: str
    trends: List[str]
    anomalies: List[Dict[str, Any]]
    recommendations: List[str]
    key_metrics: Dict[str, Any]


class AudienceSegmentationResponse(BaseModel):
    segments: List[Dict[str, Any]]
    visualization_data: Dict[str, Any]


class SentimentAnalysisRequest(BaseModel):
    text: Optional[str] = None
    campaign_id: Optional[str] = None


class SentimentAnalysisResponse(BaseModel):
    overall_sentiment: str
    sentiment_score: float
    positive_aspects: List[str]
    negative_aspects: List[str]
    recommendations: List[str]


class AnomalyDetectionResponse(BaseModel):
    anomalies: List[Dict[str, Any]]
    summary: str


class AttributionModelingResponse(BaseModel):
    attribution: Dict[str, float]
    top_contributors: List[Dict[str, Any]]
    insights: List[str]


class BenchmarkingResponse(BaseModel):
    your_metrics: Dict[str, float]
    industry_benchmarks: Dict[str, float]
    comparison: Dict[str, Any]
    recommendations: List[str]


class ChurnPredictionResponse(BaseModel):
    churn_risk: Dict[str, float]
    at_risk_segments: List[Dict[str, Any]]
    recommendations: List[str]


class NaturalLanguageQueryRequest(BaseModel):
    query: str
    campaign_id: Optional[str] = None


class NaturalLanguageQueryResponse(BaseModel):
    answer: str
    data_sources: List[str]
    confidence: str


class KPIOptimizationResponse(BaseModel):
    current_kpis: Dict[str, float]
    optimization_suggestions: List[Dict[str, Any]]
    priority_actions: List[str]


# ==================== API Endpoints ====================

@router.post("/analytics/ai/predictive", response_model=PredictiveAnalyticsResponse)
async def get_predictive_analytics(
    request: PredictiveAnalyticsRequest,
    user: dict = Depends(get_current_user)
):
    """Forecast campaign performance, ROI, or audience engagement using historical data"""
    try:
        user_profile = await get_user_profile(user)
        profile = user_profile["profile"]
        user_type = user_profile["type"]

        historical_data = get_historical_metrics(
            brand_id=profile["id"] if user_type == "brand" else None,
            creator_id=profile["id"] if user_type == "creator" else None,
            campaign_id=request.campaign_id
        )

        if not historical_data:
            return PredictiveAnalyticsResponse(
                forecast={
                    "predicted_value": 0.0,
                    "trend": "stable",
                    "growth_rate": 0.0,
                    "forecasted_values": []
                },
                confidence="low",
                factors=["No historical data available"],
                recommendations=[
                    "Start by creating metrics for your campaign deliverables",
                    "Have creators submit metric values to build historical data",
                    "Once you have at least 5-10 data points, predictions will be available"
                ]
            )

        # Prepare data for AI analysis
        metrics_summary = {}
        for entry in historical_data[-30:]:  # Last 30 entries
            metric_name = entry.get("campaign_deliverable_metrics", {}).get("name", "unknown")
            value = entry.get("value", 0)
            date = entry.get("submitted_at", "")
            if metric_name not in metrics_summary:
                metrics_summary[metric_name] = []
            metrics_summary[metric_name].append({"value": value, "date": date})

        groq_client = get_groq_client()

        prompt = f"""Analyze this historical campaign metrics data and provide predictive analytics:

HISTORICAL DATA:
{json.dumps(metrics_summary, indent=2)}

METRIC TYPE: {request.metric_type or 'general performance'}
FORECAST PERIOD: {request.forecast_periods} days
USER TYPE: {user_type}

Based on the historical trends, provide:
1. Forecasted values for the next {request.forecast_periods} days
2. Confidence level (high/medium/low)
3. Key factors influencing the forecast
4. Actionable recommendations

Return your response as JSON with this exact structure:
{{
  "forecast": {{
    "predicted_value": 0.0,
    "trend": "increasing|decreasing|stable",
    "growth_rate": 0.0,
    "forecasted_values": [{{"date": "YYYY-MM-DD", "value": 0.0}}]
  }},
  "confidence": "high|medium|low",
  "factors": ["Factor 1", "Factor 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}}"""

        completion = groq_client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert data analyst specializing in predictive analytics for marketing campaigns. Always respond with valid JSON only."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_completion_tokens=1500,
            response_format={"type": "json_object"}
        )

        content = completion.choices[0].message.content if completion.choices else "{}"
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        result = json.loads(content)
        return PredictiveAnalyticsResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating predictive analytics: {str(e)}")


@router.get("/analytics/ai/insights", response_model=AutomatedInsightsResponse)
async def get_automated_insights(
    campaign_id: Optional[str] = Query(None),
    user: dict = Depends(get_current_user)
):
    """Generate plain-language summaries of analytics data with trends, anomalies, and recommendations"""
    try:
        user_profile = await get_user_profile(user)
        profile = user_profile["profile"]
        user_type = user_profile["type"]

        historical_data = get_historical_metrics(
            brand_id=profile["id"] if user_type == "brand" else None,
            creator_id=profile["id"] if user_type == "creator" else None,
            campaign_id=campaign_id
        )

        if not historical_data:
            return AutomatedInsightsResponse(
                summary="No analytics data available yet. Start tracking metrics to get automated insights.",
                trends=[],
                anomalies=[],
                recommendations=[
                    "Create metrics for your campaign deliverables",
                    "Have creators submit metric values",
                    "Once you have data, insights will appear here automatically"
                ],
                key_metrics={}
            )

        # Aggregate metrics
        metrics_by_name = {}
        for entry in historical_data:
            metric_name = entry.get("campaign_deliverable_metrics", {}).get("display_name") or entry.get("campaign_deliverable_metrics", {}).get("name", "unknown")
            value = float(entry.get("value", 0))
            date = entry.get("submitted_at", "")

            if metric_name not in metrics_by_name:
                metrics_by_name[metric_name] = []
            metrics_by_name[metric_name].append({"value": value, "date": date})

        # Calculate trends
        trends_data = {}
        for metric_name, values in metrics_by_name.items():
            if len(values) >= 2:
                recent_avg = sum(v["value"] for v in values[-7:]) / min(7, len(values))
                older_avg = sum(v["value"] for v in values[:-7]) / max(1, len(values) - 7) if len(values) > 7 else recent_avg
                change = ((recent_avg - older_avg) / older_avg * 100) if older_avg > 0 else 0
                trends_data[metric_name] = {
                    "current_avg": recent_avg,
                    "previous_avg": older_avg,
                    "change_percent": change,
                    "trend": "increasing" if change > 5 else "decreasing" if change < -5 else "stable"
                }

        groq_client = get_groq_client()

        prompt = f"""Analyze this campaign analytics data and provide automated insights:

METRICS DATA:
{json.dumps(metrics_by_name, indent=2)}

TRENDS ANALYSIS:
{json.dumps(trends_data, indent=2)}

USER TYPE: {user_type}

Provide:
1. A plain-language executive summary (2-3 sentences)
2. Key trends identified
3. Any anomalies or unusual patterns
4. Actionable recommendations

Return your response as JSON with this exact structure:
{{
  "summary": "Executive summary in plain language",
  "trends": ["Trend 1", "Trend 2"],
  "anomalies": [{{"metric": "Metric name", "description": "Anomaly description", "severity": "high|medium|low"}}],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "key_metrics": {{"metric_name": "value"}}
}}"""

        completion = groq_client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert analytics consultant. Provide clear, actionable insights in plain language. Always respond with valid JSON only."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            max_completion_tokens=1200,
            response_format={"type": "json_object"}
        )

        content = completion.choices[0].message.content if completion.choices else "{}"
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        result = json.loads(content)
        return AutomatedInsightsResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating insights: {str(e)}")


@router.get("/analytics/ai/audience-segmentation", response_model=AudienceSegmentationResponse)
async def get_audience_segmentation(
    campaign_id: Optional[str] = Query(None),
    user: dict = Depends(get_current_user)
):
    """Use AI to identify and visualize key audience segments based on demographics, interests, and behaviors"""
    try:
        user_profile = await get_user_profile(user)
        profile = user_profile["profile"]

        historical_data = get_historical_metrics(
            brand_id=profile["id"] if user_profile["type"] == "brand" else None,
            creator_id=profile["id"] if user_profile["type"] == "creator" else None,
            campaign_id=campaign_id
        )

        # Extract demographics data
        demographics_data = []
        for entry in historical_data:
            demographics = entry.get("demographics")
            if demographics and isinstance(demographics, dict):
                demographics_data.append(demographics)

        if not demographics_data:
            # Return default segments if no demographics data
            return AudienceSegmentationResponse(
                segments=[
                    {"name": "General Audience", "size": 100, "characteristics": ["No demographic data available"]}
                ],
                visualization_data={}
            )

        groq_client = get_groq_client()

        prompt = f"""Analyze this audience demographics data and identify key segments:

DEMOGRAPHICS DATA:
{json.dumps(demographics_data[:50], indent=2)}  # Limit to 50 for prompt size

Identify distinct audience segments based on:
- Demographics (age, gender, location)
- Interests
- Behaviors
- Engagement patterns

Return your response as JSON with this exact structure:
{{
  "segments": [
    {{
      "name": "Segment Name",
      "size": 25,
      "characteristics": ["Characteristic 1", "Characteristic 2"],
      "demographics": {{"age_range": "25-34", "gender": "mixed", "location": "urban"}},
      "interests": ["Interest 1", "Interest 2"],
      "engagement_score": 0.75
    }}
  ],
  "visualization_data": {{
    "segment_sizes": {{"Segment 1": 25, "Segment 2": 30}},
    "demographic_breakdown": {{}}
  }}
}}"""

        completion = groq_client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert in audience segmentation and market research. Identify meaningful audience segments. Always respond with valid JSON only."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_completion_tokens=1500,
            response_format={"type": "json_object"}
        )

        content = completion.choices[0].message.content if completion.choices else "{}"
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        result = json.loads(content)
        return AudienceSegmentationResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating audience segmentation: {str(e)}")


@router.post("/analytics/ai/sentiment", response_model=SentimentAnalysisResponse)
async def analyze_sentiment(
    request: SentimentAnalysisRequest,
    user: dict = Depends(get_current_user)
):
    """Analyze social media and campaign feedback to gauge public sentiment"""
    try:
        # Get feedback data if campaign_id provided
        feedback_texts = []
        if request.campaign_id:
            feedback_res = supabase_anon.table("campaign_deliverable_metric_feedback") \
                .select("feedback_text") \
                .execute()
            feedback_texts = [f["feedback_text"] for f in feedback_res.data or [] if f.get("feedback_text")]

        if request.text:
            feedback_texts.append(request.text)

        if not feedback_texts:
            raise HTTPException(status_code=400, detail="No text data provided for sentiment analysis")

        combined_text = "\n\n".join(feedback_texts[:20])  # Limit to 20 feedback items

        groq_client = get_groq_client()

        prompt = f"""Analyze the sentiment of this campaign feedback and social media data:

FEEDBACK DATA:
{combined_text}

Provide a comprehensive sentiment analysis including:
1. Overall sentiment (positive, neutral, negative, mixed)
2. Sentiment score from -1 (very negative) to 1 (very positive)
3. Positive aspects mentioned
4. Negative aspects mentioned
5. Recommendations for improvement

Return your response as JSON with this exact structure:
{{
  "overall_sentiment": "positive|neutral|negative|mixed",
  "sentiment_score": 0.75,
  "positive_aspects": ["Aspect 1", "Aspect 2"],
  "negative_aspects": ["Aspect 1", "Aspect 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}}"""

        completion = groq_client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert sentiment analyst specializing in brand and campaign feedback. Always respond with valid JSON only."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_completion_tokens=1000,
            response_format={"type": "json_object"}
        )

        content = completion.choices[0].message.content if completion.choices else "{}"
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        result = json.loads(content)
        return SentimentAnalysisResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing sentiment: {str(e)}")


@router.get("/analytics/ai/anomaly-detection", response_model=AnomalyDetectionResponse)
async def detect_anomalies(
    campaign_id: Optional[str] = Query(None),
    user: dict = Depends(get_current_user)
):
    """Automatically flag unusual spikes or drops in metrics"""
    try:
        user_profile = await get_user_profile(user)
        profile = user_profile["profile"]

        historical_data = get_historical_metrics(
            brand_id=profile["id"] if user_profile["type"] == "brand" else None,
            creator_id=profile["id"] if user_profile["type"] == "creator" else None,
            campaign_id=campaign_id
        )

        if len(historical_data) < 5:
            return AnomalyDetectionResponse(
                anomalies=[],
                summary="Insufficient data for anomaly detection (need at least 5 data points)"
            )

        # Organize by metric
        metrics_data = {}
        for entry in historical_data:
            metric_name = entry.get("campaign_deliverable_metrics", {}).get("display_name") or entry.get("campaign_deliverable_metrics", {}).get("name", "unknown")
            value = float(entry.get("value", 0))
            date = entry.get("submitted_at", "")

            if metric_name not in metrics_data:
                metrics_data[metric_name] = []
            metrics_data[metric_name].append({"value": value, "date": date})

        # Calculate basic statistics for anomaly detection
        stats = {}
        for metric_name, values in metrics_data.items():
            if len(values) >= 3:
                vals = [v["value"] for v in values]
                mean = sum(vals) / len(vals)
                variance = sum((x - mean) ** 2 for x in vals) / len(vals)
                std_dev = variance ** 0.5
                stats[metric_name] = {
                    "mean": mean,
                    "std_dev": std_dev,
                    "values": values[-10:]  # Last 10 values
                }

        groq_client = get_groq_client()

        prompt = f"""Analyze this metrics data and detect anomalies (unusual spikes or drops):

METRICS DATA WITH STATISTICS:
{json.dumps(stats, indent=2)}

Identify anomalies where:
- Values are significantly above or below the mean (more than 2 standard deviations)
- Sudden spikes or drops in trends
- Unusual patterns

Return your response as JSON with this exact structure:
{{
  "anomalies": [
    {{
      "metric": "Metric name",
      "date": "YYYY-MM-DD",
      "value": 0.0,
      "expected_value": 0.0,
      "deviation": 0.0,
      "severity": "high|medium|low",
      "description": "Description of the anomaly"
    }}
  ],
  "summary": "Summary of detected anomalies"
}}"""

        completion = groq_client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert data analyst specializing in anomaly detection. Always respond with valid JSON only."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_completion_tokens=1200,
            response_format={"type": "json_object"}
        )

        content = completion.choices[0].message.content if completion.choices else "{}"
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        result = json.loads(content)
        return AnomalyDetectionResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error detecting anomalies: {str(e)}")


@router.get("/analytics/ai/attribution", response_model=AttributionModelingResponse)
async def get_attribution_modeling(
    campaign_id: Optional[str] = Query(None),
    user: dict = Depends(get_current_user)
):
    """Use AI to determine which channels, creators, or content types contribute most to conversions"""
    try:
        user_profile = await get_user_profile(user)
        profile = user_profile["profile"]

        historical_data = get_historical_metrics(
            brand_id=profile["id"] if user_profile["type"] == "brand" else None,
            creator_id=profile["id"] if user_profile["type"] == "creator" else None,
            campaign_id=campaign_id
        )

        # Organize by platform/channel/creator
        attribution_data = {}
        for entry in historical_data:
            metric_data = entry.get("campaign_deliverable_metrics", {})
            deliverable_data = metric_data.get("campaign_deliverables", {}) if isinstance(metric_data.get("campaign_deliverables"), dict) else {}
            platform = deliverable_data.get("platform", "unknown")
            content_type = deliverable_data.get("content_type", "unknown")
            value = float(entry.get("value", 0))

            key = f"{platform}_{content_type}"
            if key not in attribution_data:
                attribution_data[key] = {
                    "platform": platform,
                    "content_type": content_type,
                    "total_value": 0,
                    "count": 0,
                    "avg_value": 0
                }
            attribution_data[key]["total_value"] += value
            attribution_data[key]["count"] += 1

        # Calculate averages
        for key, data in attribution_data.items():
            data["avg_value"] = data["total_value"] / data["count"] if data["count"] > 0 else 0

        groq_client = get_groq_client()

        prompt = f"""Analyze this attribution data and determine which channels, creators, or content types contribute most:

ATTRIBUTION DATA:
{json.dumps(attribution_data, indent=2)}

Determine:
1. Attribution percentages for each channel/content type
2. Top contributors to conversions/engagement
3. Insights about what's working best

Return your response as JSON with this exact structure:
{{
  "attribution": {{
    "Channel/Content Type": 25.5
  }},
  "top_contributors": [
    {{
      "name": "Channel/Content Type",
      "contribution_percent": 25.5,
      "total_value": 1000,
      "insight": "Why this is effective"
    }}
  ],
  "insights": ["Insight 1", "Insight 2"]
}}"""

        completion = groq_client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert in marketing attribution modeling. Always respond with valid JSON only."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_completion_tokens=1000,
            response_format={"type": "json_object"}
        )

        content = completion.choices[0].message.content if completion.choices else "{}"
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        result = json.loads(content)
        return AttributionModelingResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating attribution model: {str(e)}")


@router.get("/analytics/ai/benchmarking", response_model=BenchmarkingResponse)
async def get_benchmarking(
    campaign_id: Optional[str] = Query(None),
    user: dict = Depends(get_current_user)
):
    """Compare brand's performance against industry standards using AI-driven benchmarks"""
    try:
        user_profile = await get_user_profile(user)
        profile = user_profile["profile"]

        historical_data = get_historical_metrics(
            brand_id=profile["id"] if user_profile["type"] == "brand" else None,
            creator_id=profile["id"] if user_profile["type"] == "creator" else None,
            campaign_id=campaign_id
        )

        if not historical_data:
            return BenchmarkingResponse(
                your_metrics={},
                industry_benchmarks={},
                comparison={},
                recommendations=[
                    "No metric data available yet. Start tracking metrics to compare against industry benchmarks.",
                    "Create metrics for your deliverables and have creators submit values",
                    "Once you have data, benchmarking will be available"
                ]
            )

        # Calculate your metrics
        your_metrics = {}
        total_value = 0
        count = 0
        for entry in historical_data:
            value = float(entry.get("value", 0))
            total_value += value
            count += 1

        if count > 0:
            your_metrics = {
                "avg_engagement": total_value / count,
                "total_engagement": total_value,
                "data_points": count
            }

        groq_client = get_groq_client()

        prompt = f"""Compare these campaign metrics against industry benchmarks:

YOUR METRICS:
{json.dumps(your_metrics, indent=2)}

Provide:
1. Industry benchmark values for similar campaigns
2. Comparison showing how you perform vs industry
3. Recommendations for improvement

Return your response as JSON with this exact structure:
{{
  "your_metrics": {{
    "metric_name": 0.0
  }},
  "industry_benchmarks": {{
    "metric_name": 0.0
  }},
  "comparison": {{
    "metric_name": {{
      "your_value": 0.0,
      "industry_avg": 0.0,
      "percentile": 75,
      "status": "above|below|at average"
    }}
  }},
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}}"""

        completion = groq_client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert in marketing analytics and industry benchmarking. Provide realistic industry benchmarks. Always respond with valid JSON only."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            max_completion_tokens=1200,
            response_format={"type": "json_object"}
        )

        content = completion.choices[0].message.content if completion.choices else "{}"
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        result = json.loads(content)
        return BenchmarkingResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating benchmarks: {str(e)}")


@router.get("/analytics/ai/churn-prediction", response_model=ChurnPredictionResponse)
async def predict_churn(
    campaign_id: Optional[str] = Query(None),
    user: dict = Depends(get_current_user)
):
    """Predict which audience segments or customers are likely to disengage or churn"""
    try:
        user_profile = await get_user_profile(user)
        profile = user_profile["profile"]

        historical_data = get_historical_metrics(
            brand_id=profile["id"] if user_profile["type"] == "brand" else None,
            creator_id=profile["id"] if user_profile["type"] == "creator" else None,
            campaign_id=campaign_id
        )

        if len(historical_data) < 10:
            return ChurnPredictionResponse(
                churn_risk={},
                at_risk_segments=[],
                recommendations=["Insufficient data for churn prediction. Need at least 10 data points."]
            )

        # Analyze engagement trends
        engagement_trends = {}
        for entry in historical_data[-30:]:  # Last 30 entries
            date = entry.get("submitted_at", "")
            value = float(entry.get("value", 0))
            if date:
                engagement_trends[date] = value

        groq_client = get_groq_client()

        prompt = f"""Analyze this engagement data and predict churn risk:

ENGAGEMENT TRENDS:
{json.dumps(engagement_trends, indent=2)}

Identify:
1. Churn risk levels for different segments
2. At-risk audience segments
3. Recommendations to prevent churn

Return your response as JSON with this exact structure:
{{
  "churn_risk": {{
    "segment_name": 0.75
  }},
  "at_risk_segments": [
    {{
      "segment": "Segment name",
      "risk_score": 0.75,
      "indicators": ["Indicator 1", "Indicator 2"],
      "recommendations": ["Recommendation 1"]
    }}
  ],
  "recommendations": ["General recommendation 1", "General recommendation 2"]
}}"""

        completion = groq_client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert in customer retention and churn prediction. Always respond with valid JSON only."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_completion_tokens=1000,
            response_format={"type": "json_object"}
        )

        content = completion.choices[0].message.content if completion.choices else "{}"
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        result = json.loads(content)
        return ChurnPredictionResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error predicting churn: {str(e)}")


@router.post("/analytics/ai/natural-language-query", response_model=NaturalLanguageQueryResponse)
async def natural_language_query(
    request: NaturalLanguageQueryRequest,
    user: dict = Depends(get_current_user)
):
    """Let users ask questions about their analytics data in plain English and get AI-generated answers"""
    try:
        user_profile = await get_user_profile(user)
        profile = user_profile["profile"]

        historical_data = get_historical_metrics(
            brand_id=profile["id"] if user_profile["type"] == "brand" else None,
            creator_id=profile["id"] if user_profile["type"] == "creator" else None,
            campaign_id=request.campaign_id
        )

        # Prepare summary of available data
        data_summary = {
            "total_data_points": len(historical_data),
            "metrics": list(set([
                entry.get("campaign_deliverable_metrics", {}).get("display_name") or
                entry.get("campaign_deliverable_metrics", {}).get("name", "unknown")
                for entry in historical_data
            ])),
            "date_range": {
                "earliest": historical_data[0].get("submitted_at") if historical_data else None,
                "latest": historical_data[-1].get("submitted_at") if historical_data else None
            },
            "recent_values": [
                {
                    "metric": entry.get("campaign_deliverable_metrics", {}).get("display_name") or "unknown",
                    "value": entry.get("value"),
                    "date": entry.get("submitted_at")
                }
                for entry in historical_data[-10:]
            ]
        }

        groq_client = get_groq_client()

        prompt = f"""Answer this question about campaign analytics data:

USER QUESTION: {request.query}

AVAILABLE DATA SUMMARY:
{json.dumps(data_summary, indent=2)}

Provide a clear, helpful answer based on the available data. If the question cannot be answered with the available data, say so.

Return your response as JSON with this exact structure:
{{
  "answer": "Clear answer to the user's question",
  "data_sources": ["Data source 1", "Data source 2"],
  "confidence": "high|medium|low"
}}"""

        completion = groq_client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful analytics assistant. Answer questions about campaign data clearly and accurately. Always respond with valid JSON only."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_completion_tokens=800,
            response_format={"type": "json_object"}
        )

        content = completion.choices[0].message.content if completion.choices else "{}"
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        result = json.loads(content)
        return NaturalLanguageQueryResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")


@router.get("/analytics/ai/kpi-optimization", response_model=KPIOptimizationResponse)
async def get_kpi_optimization(
    campaign_id: Optional[str] = Query(None),
    user: dict = Depends(get_current_user)
):
    """Recommend actions to improve key metrics based on AI analysis"""
    try:
        user_profile = await get_user_profile(user)
        profile = user_profile["profile"]

        historical_data = get_historical_metrics(
            brand_id=profile["id"] if user_profile["type"] == "brand" else None,
            creator_id=profile["id"] if user_profile["type"] == "creator" else None,
            campaign_id=campaign_id
        )

        if not historical_data:
            return KPIOptimizationResponse(
                current_kpis={},
                optimization_suggestions=[],
                priority_actions=[
                    "No metric data available yet. Start by creating metrics for your deliverables.",
                    "Have creators submit metric values to enable KPI optimization suggestions.",
                    "Once you have data, AI-powered optimization recommendations will appear here."
                ]
            )

        # Calculate current KPIs
        current_kpis = {}
        metrics_summary = {}
        for entry in historical_data[-30:]:  # Last 30 entries
            metric_name = entry.get("campaign_deliverable_metrics", {}).get("display_name") or entry.get("campaign_deliverable_metrics", {}).get("name", "unknown")
            value = float(entry.get("value", 0))

            if metric_name not in metrics_summary:
                metrics_summary[metric_name] = []
            metrics_summary[metric_name].append(value)

        for metric_name, values in metrics_summary.items():
            current_kpis[metric_name] = {
                "current_avg": sum(values) / len(values) if values else 0,
                "trend": "increasing" if len(values) >= 2 and values[-1] > values[0] else "decreasing" if len(values) >= 2 and values[-1] < values[0] else "stable"
            }

        groq_client = get_groq_client()

        prompt = f"""Analyze these KPIs and provide optimization recommendations:

CURRENT KPIs:
{json.dumps(current_kpis, indent=2)}

METRICS SUMMARY:
{json.dumps({k: {"values": v, "count": len(v)} for k, v in metrics_summary.items()}, indent=2)}

Provide:
1. Optimization suggestions for each KPI
2. Priority actions to improve metrics
3. Specific, actionable recommendations

Return your response as JSON with this exact structure:
{{
  "current_kpis": {{
    "KPI name": 0.0
  }},
  "optimization_suggestions": [
    {{
      "kpi": "KPI name",
      "current_value": 0.0,
      "target_value": 0.0,
      "suggestions": ["Suggestion 1", "Suggestion 2"],
      "expected_impact": "high|medium|low"
    }}
  ],
  "priority_actions": ["Action 1", "Action 2"]
}}"""

        completion = groq_client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert in KPI optimization and performance improvement. Provide actionable, specific recommendations. Always respond with valid JSON only."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            max_completion_tokens=1500,
            response_format={"type": "json_object"}
        )

        content = completion.choices[0].message.content if completion.choices else "{}"
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        result = json.loads(content)
        return KPIOptimizationResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating KPI optimization: {str(e)}")

