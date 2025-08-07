import json
import math
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

class PricingService:
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")
            
        self.supabase: Client = create_client(supabase_url, supabase_key)
    
    def find_similar_contracts(
        self,
        creator_followers: int,
        creator_engagement_rate: float,
        content_type: str,
        campaign_type: str,
        platform: str,
        duration_weeks: int,
        exclusivity_level: str = "none",
        limit: int = 10
    ) -> List[Dict]:
        """
        Find similar contracts based on creator metrics and campaign parameters
        """
        try:
            # Build similarity query - less restrictive to get more matches
            query = self.supabase.table("contracts").select(
                "*, users!creator_id(username, email), users!brand_id(username, email)"
            ).not_.is_("total_budget", "null")
            
            # Filter by content_type for better matching
            if content_type:
                # Handle new content types by extracting the platform
                platform = content_type.split('_')[0] if '_' in content_type else content_type
                query = query.ilike("content_type", f"%{platform}%")
            
            # Don't filter by platform or campaign_type initially to get more matches
            
            response = query.execute()
            contracts = response.data
            
            print(f"Found {len(contracts)} contracts in database")
            print(f"Query filters: content_type={content_type}, platform={platform}")
            
            if not contracts:
                print("No contracts found with current filters")
                return []
            
            # Calculate similarity scores
            scored_contracts = []
            for contract in contracts:
                score = self._calculate_similarity_score(
                    contract,
                    creator_followers,
                    creator_engagement_rate,
                    content_type,
                    campaign_type,
                    platform,
                    duration_weeks,
                    exclusivity_level
                )
                
                print(f"Contract {contract.get('id', 'unknown')}: score={score:.3f}, followers={contract.get('creator_followers')}, engagement={contract.get('creator_engagement_rate')}")
                
                if score > 0.05:  # Very low minimum similarity threshold for testing
                    scored_contracts.append({
                        **contract,
                        "similarity_score": score
                    })
            
            # Sort by similarity score and return top matches
            scored_contracts.sort(key=lambda x: x["similarity_score"], reverse=True)
            return scored_contracts[:limit]
            
        except Exception as e:
            print(f"Error finding similar contracts: {e}")
            return []
    
    def _calculate_similarity_score(
        self,
        contract: Dict,
        target_followers: int,
        target_engagement: float,
        target_content_type: str,
        target_campaign_type: str,
        target_platform: str,
        target_duration: int,
        target_exclusivity: str
    ) -> float:
        """
        Calculate similarity score between target contract and historical contract
        """
        score = 0.0
        weights = {
            "follower_range": 0.25,
            "engagement_rate": 0.20,
            "content_type": 0.15,
            "platform": 0.15,
            "campaign_type": 0.10,
            "duration": 0.10,
            "exclusivity": 0.05
        }
        
        # 1. Follower range similarity (logarithmic scale)
        contract_followers = contract.get("creator_followers", 0)
        if contract_followers > 0 and target_followers > 0:
            follower_diff = abs(math.log10(contract_followers) - math.log10(target_followers))
            follower_score = max(0, 1 - (follower_diff / 3))  # More lenient normalization
            score += follower_score * weights["follower_range"]
        
        # 2. Engagement rate similarity
        contract_engagement = contract.get("creator_engagement_rate", 0)
        if contract_engagement > 0 and target_engagement > 0:
            engagement_diff = abs(contract_engagement - target_engagement)
            engagement_score = max(0, 1 - (engagement_diff / 10))  # 10% difference threshold
            score += engagement_score * weights["engagement_rate"]
        
        # 3. Content type exact match
        if contract.get("content_type") == target_content_type:
            score += weights["content_type"]
        
        # 4. Platform exact match
        if contract.get("platform") == target_platform:
            score += weights["platform"]
        
        # 5. Campaign type exact match
        if contract.get("campaign_type") == target_campaign_type:
            score += weights["campaign_type"]
        
        # 6. Duration similarity
        contract_duration = contract.get("duration_weeks", 0)
        if contract_duration > 0 and target_duration > 0:
            duration_diff = abs(contract_duration - target_duration)
            duration_score = max(0, 1 - (duration_diff / 4))  # 4 weeks difference threshold
            score += duration_score * weights["duration"]
        
        # 7. Exclusivity level match
        if contract.get("exclusivity_level") == target_exclusivity:
            score += weights["exclusivity"]
        
        return min(score, 1.0)  # Cap at 1.0
    
    def generate_price_recommendation(
        self,
        similar_contracts: List[Dict],
        creator_followers: int,
        creator_engagement_rate: float,
        content_type: str,
        campaign_type: str,
        platform: str,
        duration_weeks: int,
        exclusivity_level: str = "none"
    ) -> Dict:
        """
        Generate price recommendation with fallback handling
        """
        # Check if we have enough similar contracts for reliable pricing
        has_sufficient_data = len(similar_contracts) >= 3
        
        if not has_sufficient_data:
            # Use fallback pricing with market-based calculations
            base_price = self._calculate_fallback_price(
                creator_followers, creator_engagement_rate, content_type, 
                campaign_type, platform, duration_weeks, exclusivity_level
            )
            
            return {
                "recommended_price": base_price,
                "confidence_score": 0.3,  # Low confidence for fallback
                "reasoning": f"Limited similar contracts found ({len(similar_contracts)} contracts). Using market-based pricing with industry averages. Consider this as a starting point and adjust based on your specific requirements.",
                "similar_contracts_used": similar_contracts,
                "market_factors": {
                    "fallback_used": True,
                    "similar_contracts_count": len(similar_contracts),
                    "reason": "Insufficient similar contracts for AI-powered pricing"
                },
                "is_fallback": True
            }
        """
        Generate price recommendation based on similar contracts
        """
        if not similar_contracts:
            return {
                "recommended_price": 0,
                "confidence_score": 0,
                "reasoning": "No similar contracts found",
                "similar_contracts_used": [],
                "market_factors": {}
            }
        
        # Calculate weighted average price
        total_weight = 0
        weighted_price_sum = 0
        used_contracts = []
        
        for contract in similar_contracts:
            weight = contract["similarity_score"]
            price = contract.get("total_budget", 0)
            
            if price > 0:
                weighted_price_sum += price * weight
                total_weight += weight
                used_contracts.append({
                    "contract_id": contract["id"],
                    "price": price,
                    "similarity_score": weight,
                    "creator_followers": contract.get("creator_followers"),
                    "engagement_rate": contract.get("creator_engagement_rate")
                })
        
        if total_weight == 0:
            return {
                "recommended_price": 0,
                "confidence_score": 0,
                "reasoning": "No valid pricing data in similar contracts",
                "similar_contracts_used": [],
                "market_factors": {}
            }
        
        base_price = weighted_price_sum / total_weight
        
        # Apply market adjustments
        adjusted_price = self._apply_market_adjustments(
            base_price,
            creator_followers,
            creator_engagement_rate,
            content_type,
            platform,
            duration_weeks,
            exclusivity_level
        )
        
        # Calculate confidence score
        confidence_score = self._calculate_confidence_score(similar_contracts, used_contracts)
        
        # Generate reasoning
        reasoning = self._generate_reasoning(used_contracts, adjusted_price, base_price)
        
        return {
            "recommended_price": round(adjusted_price, 2),
            "confidence_score": round(confidence_score, 3),
            "reasoning": reasoning,
            "similar_contracts_used": used_contracts,
            "market_factors": {
                "base_price": round(base_price, 2),
                "adjustment_factor": round(adjusted_price / base_price, 3) if base_price > 0 else 1.0,
                "follower_multiplier": self._get_follower_multiplier(creator_followers),
                "engagement_multiplier": self._get_engagement_multiplier(creator_engagement_rate),
                "content_type_multiplier": self._get_content_type_multiplier(content_type),
                "platform_multiplier": self._get_platform_multiplier(platform),
                "duration_multiplier": self._get_duration_multiplier(duration_weeks),
                "exclusivity_multiplier": self._get_exclusivity_multiplier(exclusivity_level)
            }
        }
    
    def _apply_market_adjustments(
        self,
        base_price: float,
        followers: int,
        engagement_rate: float,
        content_type: str,
        platform: str,
        duration_weeks: int,
        exclusivity_level: str
    ) -> float:
        """
        Apply market-based adjustments to the base price
        """
        adjusted_price = base_price
        
        # Follower-based adjustment
        follower_multiplier = self._get_follower_multiplier(followers)
        adjusted_price *= follower_multiplier
        
        # Engagement-based adjustment
        engagement_multiplier = self._get_engagement_multiplier(engagement_rate)
        adjusted_price *= engagement_multiplier
        
        # Content type adjustment
        content_multiplier = self._get_content_type_multiplier(content_type)
        adjusted_price *= content_multiplier
        
        # Platform adjustment
        platform_multiplier = self._get_platform_multiplier(platform)
        adjusted_price *= platform_multiplier
        
        # Duration adjustment
        duration_multiplier = self._get_duration_multiplier(duration_weeks)
        adjusted_price *= duration_multiplier
        
        # Exclusivity adjustment
        exclusivity_multiplier = self._get_exclusivity_multiplier(exclusivity_level)
        adjusted_price *= exclusivity_multiplier
        
        return adjusted_price
    
    def _get_follower_multiplier(self, followers: int) -> float:
        """Calculate price multiplier based on follower count"""
        if followers < 1000:
            return 0.5
        elif followers < 5000:
            return 0.8
        elif followers < 10000:
            return 1.0
        elif followers < 50000:
            return 1.2
        elif followers < 100000:
            return 1.5
        elif followers < 500000:
            return 2.0
        else:
            return 3.0
    
    def _get_engagement_multiplier(self, engagement_rate: float) -> float:
        """Calculate price multiplier based on engagement rate"""
        if engagement_rate < 1.0:
            return 0.7
        elif engagement_rate < 2.0:
            return 0.9
        elif engagement_rate < 3.0:
            return 1.0
        elif engagement_rate < 5.0:
            return 1.2
        elif engagement_rate < 8.0:
            return 1.5
        else:
            return 2.0
    
    def _get_content_type_multiplier(self, content_type: str) -> float:
        """Calculate price multiplier based on content type"""
        multipliers = {
            # YouTube content types
            "youtube_shorts": 0.8,
            "youtube_video": 1.5,
            "youtube_live": 1.3,
            # Instagram content types
            "instagram_post": 1.0,
            "instagram_reel": 1.2,
            "instagram_story": 0.8,
            "instagram_live": 1.3,
            # TikTok content types
            "tiktok_video": 1.1,
            "tiktok_live": 1.3,
            # Facebook content types
            "facebook_post": 0.9,
            "facebook_live": 1.3,
            # Twitter content types
            "twitter_post": 0.8,
            "twitter_space": 1.2,
            # LinkedIn content types
            "linkedin_post": 1.1,
            "linkedin_article": 1.4,
            # Other content types
            "blog_post": 1.2,
            "podcast": 1.5,
            "newsletter": 1.0,
            # Legacy support
            "video": 1.5,
            "live": 1.3,
            "story": 0.8,
            "post": 1.0,
            "review": 1.2,
            "tutorial": 1.4
        }
        return multipliers.get(content_type.lower(), 1.0)
    
    def _get_platform_multiplier(self, platform: str) -> float:
        """Calculate price multiplier based on platform"""
        multipliers = {
            "youtube": 1.3,
            "instagram": 1.0,
            "tiktok": 0.9,
            "twitter": 0.8,
            "facebook": 0.7,
            "linkedin": 1.1
        }
        return multipliers.get(platform.lower(), 1.0)
    
    def _get_duration_multiplier(self, duration_weeks: int) -> float:
        """Calculate price multiplier based on campaign duration"""
        if duration_weeks <= 1:
            return 0.8
        elif duration_weeks <= 2:
            return 0.9
        elif duration_weeks <= 4:
            return 1.0
        elif duration_weeks <= 8:
            return 1.1
        else:
            return 1.2
    
    def _get_exclusivity_multiplier(self, exclusivity_level: str) -> float:
        """Calculate price multiplier based on exclusivity level"""
        multipliers = {
            "none": 1.0,
            "platform": 1.2,
            "category": 1.5,
            "full": 2.0
        }
        return multipliers.get(exclusivity_level.lower(), 1.0)
    
    def _calculate_confidence_score(self, similar_contracts: List[Dict], used_contracts: List[Dict]) -> float:
        """Calculate confidence score based on data quality and quantity"""
        if not used_contracts:
            return 0.0
        
        # Base confidence on number of similar contracts
        num_contracts = len(used_contracts)
        base_confidence = min(num_contracts / 5, 1.0)  # Max confidence at 5+ contracts
        
        # Adjust based on similarity scores
        avg_similarity = sum(c["similarity_score"] for c in used_contracts) / len(used_contracts)
        
        # Adjust based on price consistency
        prices = [c["price"] for c in used_contracts]
        if len(prices) > 1:
            price_variance = (max(prices) - min(prices)) / max(prices)
            consistency_factor = max(0, 1 - price_variance)
        else:
            consistency_factor = 0.5
        
        # Calculate final confidence
        confidence = (base_confidence * 0.4 + avg_similarity * 0.4 + consistency_factor * 0.2)
        return min(confidence, 1.0)
    
    def _generate_reasoning(self, used_contracts: List[Dict], final_price: float, base_price: float) -> str:
        """Generate human-readable reasoning for the price recommendation"""
        if not used_contracts:
            return "No similar contracts found for comparison."
        
        num_contracts = len(used_contracts)
        avg_similarity = sum(c["similarity_score"] for c in used_contracts) / num_contracts
        
        reasoning = f"Based on {num_contracts} similar contracts with {avg_similarity:.1%} average similarity:"
        
        # Add price range info
        prices = [c["price"] for c in used_contracts]
        price_range = f"${min(prices):,.0f} - ${max(prices):,.0f}"
        reasoning += f"\n• Price range from similar contracts: {price_range}"
        
        # Add adjustment explanation
        if abs(final_price - base_price) > 0.01:
            adjustment = "increased" if final_price > base_price else "decreased"
            reasoning += f"\n• Price {adjustment} by {abs(final_price - base_price):.1%} based on market factors"
        
        # Add top similar contract details
        top_contract = max(used_contracts, key=lambda x: x["similarity_score"])
        reasoning += f"\n• Most similar contract: ${top_contract['price']:,.0f} ({(top_contract['similarity_score']*100):.0f}% match)"
        
        return reasoning
    
    def learn_from_outcome(
        self,
        contract_id: str,
        recommended_price: float,
        actual_price: float,
        satisfaction_score: int,
        roi_achieved: float,
        repeat_business: bool
    ) -> bool:
        """
        Learn from contract outcomes to improve future recommendations
        """
        try:
            # Store pricing feedback
            feedback_data = {
                "contract_id": contract_id,
                "recommended_price": recommended_price,
                "actual_price": actual_price,
                "price_accuracy_score": self._calculate_accuracy_score(recommended_price, actual_price),
                "market_conditions": "normal",  # Could be enhanced with market data
                "feedback_notes": f"Satisfaction: {satisfaction_score}/10, ROI: {roi_achieved}%, Repeat: {repeat_business}"
            }
            
            self.supabase.table("pricing_feedback").insert(feedback_data).execute()
            
            # Update contract with outcome data
            outcome_data = {
                "brand_satisfaction_score": satisfaction_score,
                "roi_achieved": roi_achieved,
                "repeat_business": repeat_business,
                "updated_at": datetime.now().isoformat()
            }
            
            self.supabase.table("contracts").update(outcome_data).eq("id", contract_id).execute()
            
            return True
            
        except Exception as e:
            print(f"Error learning from outcome: {e}")
            return False
    
    def _calculate_accuracy_score(self, recommended: float, actual: float) -> int:
        """Calculate accuracy score (1-10) for price recommendation"""
        if actual == 0:
            return 5  # Neutral if no actual price
        
        percentage_diff = abs(recommended - actual) / actual
        
        if percentage_diff <= 0.05:  # Within 5%
            return 10
        elif percentage_diff <= 0.10:  # Within 10%
            return 8
        elif percentage_diff <= 0.15:  # Within 15%
            return 6
        elif percentage_diff <= 0.25:  # Within 25%
            return 4
        elif percentage_diff <= 0.50:  # Within 50%
            return 2
        else:
            return 1 

    def _calculate_fallback_price(
        self,
        creator_followers: int,
        creator_engagement_rate: float,
        content_type: str,
        campaign_type: str,
        platform: str,
        duration_weeks: int,
        exclusivity_level: str
    ) -> float:
        """
        Calculate fallback price using market-based pricing when insufficient similar contracts are found
        """
        # Base price per follower (industry average)
        base_price_per_follower = 0.01  # $0.01 per follower
        
        # Calculate base price
        base_price = creator_followers * base_price_per_follower
        
        # Apply engagement rate multiplier
        engagement_multiplier = self._get_engagement_multiplier(creator_engagement_rate)
        base_price *= engagement_multiplier
        
        # Apply content type multiplier
        content_multiplier = self._get_content_type_multiplier(content_type)
        base_price *= content_multiplier
        
        # Apply platform multiplier
        platform_multiplier = self._get_platform_multiplier(platform)
        base_price *= platform_multiplier
        
        # Apply duration multiplier
        duration_multiplier = self._get_duration_multiplier(duration_weeks)
        base_price *= duration_multiplier
        
        # Apply exclusivity multiplier
        exclusivity_multiplier = self._get_exclusivity_multiplier(exclusivity_level)
        base_price *= exclusivity_multiplier
        
        # Apply campaign type multiplier
        campaign_multiplier = 1.2 if campaign_type == "product_launch" else 1.0
        base_price *= campaign_multiplier
        
        # Ensure minimum price
        min_price = 500
        base_price = max(base_price, min_price)
        
        return round(base_price, 2) 