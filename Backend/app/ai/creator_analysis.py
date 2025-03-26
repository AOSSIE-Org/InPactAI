from typing import Dict, List, Any
from .data_preprocessor import CreatorDataPreprocessor
import logging

class CreatorAnalyzer:
    def __init__(self):
        self.preprocessor = CreatorDataPreprocessor()
        self.logger = logging.getLogger(__name__)

    def analyze_creator(self, creator_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze creator profile data"""
        try:
            # Preprocess the data
            processed_data = self.preprocessor.process_profile(creator_data)
            
            # Extract insights
            insights = {
                'content_style': self._analyze_content_style(processed_data),
                'audience_engagement': self._analyze_engagement(processed_data),
                'brand_alignment': self._analyze_brand_alignment(processed_data),
                'growth_potential': self._analyze_growth_potential(processed_data)
            }
            
            return {
                'processed_data': processed_data,
                'insights': insights
            }
            
        except Exception as e:
            self.logger.error(f"Error analyzing creator: {str(e)}")
            raise

    def _analyze_content_style(self, processed_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze creator's content style"""
        return {
            'sentiment_tone': self._get_sentiment_tone(processed_data.get('sentiment_score', 0)),
            'emoji_usage': self._get_emoji_usage_level(processed_data.get('emoji_count', 0)),
            'hashtag_strategy': self._analyze_hashtag_strategy(processed_data.get('hashtags', [])),
            'content_length': self._analyze_content_length(processed_data.get('cleaned_description', ''))
        }

    def _analyze_engagement(self, processed_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze engagement metrics"""
        normalized_engagement = processed_data.get('normalized_engagement', 0)
        return {
            'engagement_level': self._get_engagement_level(normalized_engagement),
            'audience_size': self._get_audience_size_category(processed_data.get('normalized_followers', 0)),
            'growth_rate': self._calculate_growth_rate(processed_data)
        }

    def _analyze_brand_alignment(self, processed_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze brand alignment potential"""
        return {
            'content_quality': self._assess_content_quality(processed_data),
            'audience_match': self._assess_audience_match(processed_data),
            'engagement_quality': self._assess_engagement_quality(processed_data)
        }

    def _analyze_growth_potential(self, processed_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze growth potential"""
        return {
            'content_optimization': self._get_content_optimization_suggestions(processed_data),
            'audience_expansion': self._get_audience_expansion_suggestions(processed_data),
            'engagement_improvement': self._get_engagement_improvement_suggestions(processed_data)
        }

    # Helper methods for analysis
    def _get_sentiment_tone(self, sentiment_score: float) -> str:
        if sentiment_score > 0.2:
            return "positive"
        elif sentiment_score < -0.2:
            return "negative"
        return "neutral"

    def _get_emoji_usage_level(self, emoji_count: int) -> str:
        if emoji_count > 5:
            return "high"
        elif emoji_count > 2:
            return "moderate"
        return "low"

    def _analyze_hashtag_strategy(self, hashtags: List[str]) -> Dict[str, Any]:
        return {
            'count': len(hashtags),
            'diversity': len(set(hashtags)) / len(hashtags) if hashtags else 0,
            'effectiveness': self._calculate_hashtag_effectiveness(hashtags)
        }

    def _analyze_content_length(self, content: str) -> str:
        words = len(content.split())
        if words > 100:
            return "long"
        elif words > 50:
            return "medium"
        return "short"

    def _get_engagement_level(self, normalized_engagement: float) -> str:
        if normalized_engagement > 0.7:
            return "excellent"
        elif normalized_engagement > 0.4:
            return "good"
        elif normalized_engagement > 0.2:
            return "moderate"
        return "needs_improvement"

    def _get_audience_size_category(self, normalized_followers: float) -> str:
        if normalized_followers > 0.8:
            return "large"
        elif normalized_followers > 0.5:
            return "medium"
        return "small"

    def _calculate_growth_rate(self, processed_data: Dict[str, Any]) -> float:
        # This would need historical data to calculate actual growth rate
        return 0.0

    def _assess_content_quality(self, processed_data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'score': self._calculate_content_quality_score(processed_data),
            'strengths': self._identify_content_strengths(processed_data),
            'areas_for_improvement': self._identify_improvement_areas(processed_data)
        }

    def _assess_audience_match(self, processed_data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'match_score': self._calculate_audience_match_score(processed_data),
            'target_audience': self._identify_target_audience(processed_data),
            'audience_quality': self._assess_audience_quality(processed_data)
        }

    def _assess_engagement_quality(self, processed_data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'quality_score': self._calculate_engagement_quality_score(processed_data),
            'engagement_patterns': self._analyze_engagement_patterns(processed_data),
            'interaction_quality': self._assess_interaction_quality(processed_data)
        }

    # Additional helper methods for detailed analysis
    def _calculate_content_quality_score(self, processed_data: Dict[str, Any]) -> float:
        # Implement content quality scoring logic
        return 0.0

    def _identify_content_strengths(self, processed_data: Dict[str, Any]) -> List[str]:
        # Implement strength identification logic
        return []

    def _identify_improvement_areas(self, processed_data: Dict[str, Any]) -> List[str]:
        # Implement improvement area identification logic
        return []

    def _calculate_audience_match_score(self, processed_data: Dict[str, Any]) -> float:
        # Implement audience match scoring logic
        return 0.0

    def _identify_target_audience(self, processed_data: Dict[str, Any]) -> Dict[str, Any]:
        # Implement target audience identification logic
        return {}

    def _assess_audience_quality(self, processed_data: Dict[str, Any]) -> Dict[str, Any]:
        # Implement audience quality assessment logic
        return {}

    def _calculate_engagement_quality_score(self, processed_data: Dict[str, Any]) -> float:
        # Implement engagement quality scoring logic
        return 0.0

    def _analyze_engagement_patterns(self, processed_data: Dict[str, Any]) -> Dict[str, Any]:
        # Implement engagement pattern analysis logic
        return {}

    def _assess_interaction_quality(self, processed_data: Dict[str, Any]) -> Dict[str, Any]:
        # Implement interaction quality assessment logic
        return {}

    def _calculate_hashtag_effectiveness(self, hashtags: List[str]) -> float:
        # Implement hashtag effectiveness calculation logic
        return 0.0

    def _get_content_optimization_suggestions(self, processed_data: Dict[str, Any]) -> List[str]:
        # Implement content optimization suggestion logic
        return []

    def _get_audience_expansion_suggestions(self, processed_data: Dict[str, Any]) -> List[str]:
        # Implement audience expansion suggestion logic
        return []

    def _get_engagement_improvement_suggestions(self, processed_data: Dict[str, Any]) -> List[str]:
        # Implement engagement improvement suggestion logic
        return [] 