from typing import Dict, List, Any, Optional
import re
import numpy as np
from datetime import datetime
import logging
from textblob import TextBlob
import emoji

class TextProcessor:
    """Handles text cleaning and analysis"""
    
    @staticmethod
    def clean_text(text: str) -> str:
        """Clean and normalize text content"""
        if not text:
            return ""
        # Convert to lowercase
        text = text.lower()
        # Remove special characters but keep emojis and hashtags
        text = re.sub(r'[^\w\s#\U0001F300-\U0001F9FF]', ' ', text)
        # Remove extra whitespace
        text = ' '.join(text.split())
        return text

    @staticmethod
    def extract_hashtags(text: str) -> List[str]:
        """Extract hashtags from text"""
        if not text:
            return []
        return re.findall(r'#\w+', text)

    @staticmethod
    def count_emojis(text: str) -> int:
        """Count emoji usage in text"""
        if not text:
            return 0
        return len([c for c in text if emoji.is_emoji(c)])

    @staticmethod
    def get_sentiment(text: str) -> float:
        """Get text sentiment score"""
        if not text:
            return 0.0
        return TextBlob(text).sentiment.polarity

class MetricsNormalizer:
    """Handles normalization of numerical metrics"""
    
    @staticmethod
    def normalize_followers(followers: int) -> float:
        """Normalize follower count to a 0-1 scale"""
        if not followers:
            return 0.0
        # Log normalization to handle large follower counts
        return np.log1p(followers) / np.log1p(1000000)  # Assuming 1M followers as max

    @staticmethod
    def normalize_engagement(engagement: float, followers: int) -> float:
        """Normalize engagement rate"""
        if not followers or not engagement:
            return 0.0
        # Convert to percentage and normalize
        engagement_rate = (engagement / followers) * 100
        return min(engagement_rate / 10, 1.0)  # Assuming 10% as max engagement rate

    @staticmethod
    def normalize_timestamp(timestamp: str) -> float:
        """Convert timestamp to normalized value"""
        try:
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            # Normalize to 0-1 scale based on last 30 days
            return (datetime.now(dt.tzinfo) - dt).days / 30
        except:
            return 0.0

class VectorGenerator:
    """Generates structured vectors from processed data"""
    
    @staticmethod
    def create_profile_vector(processed_data: Dict[str, Any]) -> np.ndarray:
        """Create a normalized vector from processed profile data"""
        vector = []
        
        # Add numerical features
        vector.extend([
            processed_data.get('normalized_followers', 0),
            processed_data.get('normalized_engagement', 0),
            processed_data.get('sentiment_score', 0),
            processed_data.get('normalized_timestamp', 0)
        ])
        
        # Add categorical features (one-hot encoded)
        categories = ['travel', 'lifestyle', 'fashion', 'tech', 'food', 'gaming']
        category_vector = [0] * len(categories)
        for i, category in enumerate(categories):
            if category in processed_data.get('categories', []):
                category_vector[i] = 1
        vector.extend(category_vector)
        
        return np.array(vector)

class CreatorDataPreprocessor:
    """Main class for preprocessing creator profile data"""
    
    def __init__(self):
        self.text_processor = TextProcessor()
        self.metrics_normalizer = MetricsNormalizer()
        self.vector_generator = VectorGenerator()
        self.logger = logging.getLogger(__name__)

    def process_profile(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Main processing pipeline for creator profile data"""
        try:
            processed_data = {}
            
            # Process text content
            if 'description' in profile_data:
                description = self.text_processor.clean_text(profile_data['description'])
                processed_data.update({
                    'cleaned_description': description,
                    'hashtags': self.text_processor.extract_hashtags(description),
                    'emoji_count': self.text_processor.count_emojis(description),
                    'sentiment_score': self.text_processor.get_sentiment(description)
                })
            
            # Process metrics
            if 'followers' in profile_data:
                processed_data['normalized_followers'] = self.metrics_normalizer.normalize_followers(
                    profile_data['followers']
                )
            
            if 'engagement' in profile_data and 'followers' in profile_data:
                processed_data['normalized_engagement'] = self.metrics_normalizer.normalize_engagement(
                    profile_data['engagement'],
                    profile_data['followers']
                )
            
            # Process timestamp
            if 'created_at' in profile_data:
                processed_data['normalized_timestamp'] = self.metrics_normalizer.normalize_timestamp(
                    profile_data['created_at']
                )
            
            # Generate profile vector
            processed_data['profile_vector'] = self.vector_generator.create_profile_vector(processed_data)
            
            return processed_data
            
        except Exception as e:
            self.logger.error(f"Error processing profile data: {str(e)}")
            raise

    def batch_process_profiles(self, profiles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process multiple profiles"""
        return [self.process_profile(profile) for profile in profiles] 