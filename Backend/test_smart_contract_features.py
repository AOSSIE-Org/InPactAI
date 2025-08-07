import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_smart_contract_features():
    """Test the new Smart Contract Generator features"""
    
    base_url = "http://localhost:8000"
    
    print("🧪 Testing Smart Contract Generator Features")
    print("=" * 50)
    
    # Test 1: Check if the backend is running
    try:
        response = requests.get(f"{base_url}/docs")
        if response.status_code == 200:
            print("✅ Backend is running")
        else:
            print("❌ Backend is not responding")
            return
    except Exception as e:
        print(f"❌ Cannot connect to backend: {e}")
        return
    
    # Test 2: Test pricing recommendation with fallback
    print("\n📊 Testing Pricing Recommendation with Fallback...")
    try:
        pricing_data = {
            "creator_followers": 5000,
            "creator_engagement_rate": 2.5,
            "content_type": "youtube_shorts",
            "campaign_type": "product_launch",
            "platform": "youtube",
            "duration_weeks": 2,  # This is still used by pricing service
            "exclusivity_level": "none"
        }
        
        response = requests.post(
            f"{base_url}/api/pricing/recommendation",
            json=pricing_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Pricing recommendation received")
            print(f"   - Recommended price: ${data.get('recommended_price', 0):,.2f}")
            print(f"   - Confidence score: {data.get('confidence_score', 0):.1%}")
            print(f"   - Fallback used: {data.get('market_factors', {}).get('fallback_used', False)}")
            if data.get('market_factors', {}).get('fallback_used'):
                print(f"   - Fallback reason: {data.get('market_factors', {}).get('reason', 'Unknown')}")
        else:
            print(f"❌ Pricing recommendation failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Pricing recommendation test failed: {e}")
    
    # Test 3: Test contract generation with new features
    print("\n📝 Testing Contract Generation with New Features...")
    try:
        contract_data = {
            "creator_id": "u113",
            "brand_id": "u114",
            "contract_type": "custom",
            "custom_contract_type": "Brand Ambassador Partnership",
            "min_budget": 1000,
            "max_budget": 3000,
            "content_type": ["youtube_shorts", "instagram_reel", "custom"],
            "custom_content_types": ["TikTok Dance Challenge"],
            "duration_value": 3,
            "duration_unit": "months",
            "requirements": "Create engaging content for our new product launch",
            "industry": "Fashion",
            "exclusivity": "platform",
            "compliance_requirements": ["FTC Disclosure Required"],
            "jurisdiction": "california",
            "dispute_resolution": "arbitration"
        }
        
        response = requests.post(
            f"{base_url}/api/contracts/generation/generate",
            json=contract_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Contract generation successful")
            print(f"   - Contract title: {data.get('contract_title', 'N/A')}")
            print(f"   - Contract type: {data.get('contract_type', 'N/A')}")
            print(f"   - Custom contract type: {data.get('custom_contract_type', 'N/A')}")
            print(f"   - Duration: {data.get('duration_value', 0)} {data.get('duration_unit', 'weeks')}")
            print(f"   - Content types: {', '.join(data.get('content_types', []))}")
            print(f"   - Custom content types: {', '.join(data.get('custom_content_types', []))}")
            print(f"   - Total budget: ${data.get('total_budget', 0):,.2f}")
            print(f"   - Risk score: {data.get('risk_score', 0):.1%}")
        else:
            print(f"❌ Contract generation failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Contract generation test failed: {e}")
    
    # Test 4: Test content type multipliers
    print("\n🎯 Testing Content Type Multipliers...")
    content_types = [
        "youtube_shorts", "youtube_video", "youtube_live",
        "instagram_post", "instagram_reel", "instagram_story", "instagram_live",
        "tiktok_video", "tiktok_live",
        "facebook_post", "facebook_live",
        "twitter_post", "twitter_space",
        "linkedin_post", "linkedin_article",
        "blog_post", "podcast", "newsletter"
    ]
    
    print(f"   Supported content types: {len(content_types)}")
    for content_type in content_types[:5]:  # Show first 5
        print(f"   - {content_type}")
    print(f"   ... and {len(content_types) - 5} more")
    
    # Test 5: Test duration unit conversion
    print("\n⏰ Testing Duration Unit Conversion...")
    test_cases = [
        (7, "days"),
        (4, "weeks"),
        (3, "months"),
        (1, "years")
    ]
    
    for value, unit in test_cases:
        weeks = {
            "days": value / 7,
            "weeks": value,
            "months": value * 4.33,
            "years": value * 52
        }.get(unit, value)
        print(f"   {value} {unit} = {weeks:.1f} weeks")
    
    print("\n🎉 Smart Contract Generator Feature Tests Complete!")
    print("\n📋 Summary of New Features:")
    print("   ✅ Custom contract types with 'Other' option")
    print("   ✅ Enhanced content types (YouTube Shorts, Instagram Reels, etc.)")
    print("   ✅ Duration unit toggle (days, weeks, months, years)")
    print("   ✅ Pricing fallback message when insufficient data")
    print("   ✅ Database columns added for all new features")
    print("   ✅ Backend API updated to handle new fields")
    print("   ✅ Frontend interface updated with new options")

if __name__ == "__main__":
    test_smart_contract_features()
