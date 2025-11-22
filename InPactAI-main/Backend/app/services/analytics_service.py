def calculate_metrics(data):
    impressions = data.get("impressions", 0)
    clicks = data.get("clicks", 0)
    likes = data.get("likes", 0)
    shares = data.get("shares", 0)
    comments = data.get("comments", 0)
    budget = data.get("budget", 1)

    ctr = (clicks / impressions) * 100 if impressions > 0 else 0
    engagement_rate = ((likes + shares + comments) / impressions) * 100 if impressions > 0 else 0
    cpm = (budget / impressions) * 1000 if impressions > 0 else 0
    cpc = (budget / clicks) if clicks > 0 else 0
    roi = ((data.get("revenue", 0) - budget) / budget) * 100 if budget > 0 else 0

    return {
        "CTR (%)": round(ctr, 2),
        "Engagement Rate (%)": round(engagement_rate, 2),
        "CPM": round(cpm, 2),
        "CPC": round(cpc, 2),
        "ROI (%)": round(roi, 2),
    }


def get_campaign_analytics(campaign_id: int):

    # TEMP MOCK DATA (replace with DB queries later)
    mock_data = {
        1: {
            "budget": 5000,
            "impressions": 120000,
            "clicks": 2500,
            "likes": 900,
            "shares": 200,
            "comments": 140,
            "revenue": 15000
        }
    }

    data = mock_data.get(campaign_id)
    if not data:
        return None

    return {
        "campaign_id": campaign_id,
        "metrics": calculate_metrics(data),
        "raw_data": data
    }


def get_creator_analytics(creator_id: int):

    # TEMP MOCK DATA (replace with DB queries later)
    mock_creator_data = {
        1: [
            {"impressions": 10000, "clicks": 200, "likes": 60, "shares": 10, "comments": 5, "budget": 300, "revenue": 1200},
            {"impressions": 50000, "clicks": 900, "likes": 300, "shares": 40, "comments": 20, "budget": 1000, "revenue": 6000}
        ]
    }

    campaigns = mock_creator_data.get(creator_id)
    if not campaigns:
        return None

    total = {
        key: sum(item[key] for item in campaigns)
        for key in ["impressions", "clicks", "likes", "shares", "comments", "budget", "revenue"]
    }

    return {
        "creator_id": creator_id,
        "campaign_count": len(campaigns),
        "metrics": calculate_metrics(total),
        "raw_total": total
    }
