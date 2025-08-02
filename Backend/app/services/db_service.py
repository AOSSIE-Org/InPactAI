from supabase import create_client, Client
import os
from dotenv import load_dotenv
from typing import List, Dict, Any

# Load environment variables
load_dotenv()
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
if not url or not key:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
supabase: Client = create_client(url, key)


def match_creators_for_brand(sponsorship_id: str) -> List[Dict[str, Any]]:
    # Fetch sponsorship details
    sponsorship_resp = supabase.table("sponsorships").select("*").eq("id", sponsorship_id).execute()
    if not sponsorship_resp.data:
        return []
    sponsorship = sponsorship_resp.data[0]

    # Fetch all audience insights (for creators)
    audience_resp = supabase.table("audience_insights").select("*").execute()
    creators = []
    for audience in audience_resp.data:
        # Basic matching logic: audience, engagement, price, etc.
        match_score = 0
        # Audience age group overlap
        if 'required_audience' in sponsorship and 'audience_age_group' in audience:
            required_ages = sponsorship['required_audience'].get('age_group', [])
            creator_ages = audience.get('audience_age_group', {})
            overlap = sum([creator_ages.get(age, 0) for age in required_ages])
            if overlap > 0:
                match_score += 1
        # Audience location overlap
        if 'required_audience' in sponsorship and 'audience_location' in audience:
            required_locs = sponsorship['required_audience'].get('location', [])
            creator_locs = audience.get('audience_location', {})
            overlap = sum([creator_locs.get(loc, 0) for loc in required_locs])
            if overlap > 0:
                match_score += 1
        # Engagement rate
        if audience.get('engagement_rate', 0) >= sponsorship.get('engagement_minimum', 0):
            match_score += 1
        # Price expectation
        if audience.get('price_expectation', 0) <= sponsorship.get('budget', 0):
            match_score += 1
        if match_score >= 2:  # Threshold for a match
            creators.append({"user_id": audience["user_id"], "match_score": match_score, **audience})
    return creators


def match_brands_for_creator(creator_id: str) -> List[Dict[str, Any]]:
    # Fetch creator's audience insights
    audience_resp = supabase.table("audience_insights").select("*").eq("user_id", creator_id).execute()
    if not audience_resp.data:
        return []
    audience = audience_resp.data[0]

    # Fetch all sponsorships
    sponsorships_resp = supabase.table("sponsorships").select("*").execute()
    matches = []
    for sponsorship in sponsorships_resp.data:
        match_score = 0
        # Audience age group overlap
        if 'required_audience' in sponsorship and 'audience_age_group' in audience:
            required_ages = sponsorship['required_audience'].get('age_group', [])
            creator_ages = audience.get('audience_age_group', {})
            overlap = sum([creator_ages.get(age, 0) for age in required_ages])
            if overlap > 0:
                match_score += 1
        # Audience location overlap
        if 'required_audience' in sponsorship and 'audience_location' in audience:
            required_locs = sponsorship['required_audience'].get('location', [])
            creator_locs = audience.get('audience_location', {})
            overlap = sum([creator_locs.get(loc, 0) for loc in required_locs])
            if overlap > 0:
                match_score += 1
        # Engagement rate
        if audience.get('engagement_rate', 0) >= sponsorship.get('engagement_minimum', 0):
            match_score += 1
        # Price expectation
        if audience.get('price_expectation', 0) <= sponsorship.get('budget', 0):
            match_score += 1
        if match_score >= 2:  # Threshold for a match
            matches.append({"sponsorship_id": sponsorship["id"], "match_score": match_score, **sponsorship})
    return matches
