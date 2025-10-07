import requests
from typing import Dict, Optional, List, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models.models import UserSocialToken, ContractContentMapping, ContentAnalytics
from app.services.oauth_service import oauth_service
from app.services.error_handling_service import error_handling_service


class RawMetrics:
    """Data class for raw metrics from social platforms"""
    def __init__(self, platform: str, content_id: str, metrics: Dict[str, Any], 
                 demographics: Dict[str, Any] = None, collected_at: datetime = None):
        self.platform = platform
        self.content_id = content_id
        self.metrics = metrics
        self.demographics = demographics or {}
        self.collected_at = collected_at or datetime.utcnow()


class InstagramDataCollector:
    """Collector for Instagram content analytics using Instagram Basic Display API"""
    
    def __init__(self):
        self.base_url = "https://graph.instagram.com"
    
    def collect_content_metrics(self, content_id: str, user_token: UserSocialToken) -> Optional[RawMetrics]:
        """
        Collect metrics for specific Instagram content
        
        Args:
            content_id: Instagram media ID
            user_token: User's Instagram access token
            
        Returns:
            RawMetrics object if successful, None otherwise
        """
        try:
            # Check if token is still valid
            if not self._validate_token(user_token):
                return None
            
            # Get media insights (requires Instagram Business account)
            insights_url = f"{self.base_url}/{content_id}/insights"
            insights_params = {
                'metric': 'impressions,reach,likes,comments,shares,saves',
                'access_token': user_token.access_token
            }
            
            # Get basic media info first
            media_url = f"{self.base_url}/{content_id}"
            media_params = {
                'fields': 'id,media_type,caption,timestamp,like_count,comments_count',
                'access_token': user_token.access_token
            }
            
            media_response = requests.get(media_url, params=media_params)
            media_response.raise_for_status()
            media_data = media_response.json()
            
            # Try to get insights (may fail for personal accounts)
            insights_data = {}
            try:
                insights_response = requests.get(insights_url, params=insights_params)
                if insights_response.status_code == 200:
                    insights_result = insights_response.json()
                    for insight in insights_result.get('data', []):
                        insights_data[insight['name']] = insight.get('values', [{}])[0].get('value', 0)
            except requests.exceptions.RequestException:
                # Insights not available for personal accounts
                pass
            
            # Compile metrics
            metrics = {
                'impressions': insights_data.get('impressions', 0),
                'reach': insights_data.get('reach', 0),
                'likes': media_data.get('like_count', 0),
                'comments': media_data.get('comments_count', 0),
                'shares': insights_data.get('shares', 0),
                'saves': insights_data.get('saves', 0),
                'engagement_rate': self._calculate_engagement_rate(
                    media_data.get('like_count', 0) + media_data.get('comments_count', 0),
                    insights_data.get('reach', 1)
                )
            }
            
            return RawMetrics(
                platform='instagram',
                content_id=content_id,
                metrics=metrics,
                collected_at=datetime.utcnow()
            )
            
        except requests.exceptions.RequestException as e:
            error = error_handling_service.handle_api_error(e, 'instagram', user_token.user_id, content_id)
            error_handling_service.log_error(error)
            return None
        except Exception as e:
            error = error_handling_service.handle_api_error(e, 'instagram', user_token.user_id, content_id)
            error_handling_service.log_error(error)
            return None
    
    def collect_user_demographics(self, user_token: UserSocialToken) -> Optional[Dict[str, Any]]:
        """
        Collect user's audience demographics (requires Instagram Business account)
        
        Args:
            user_token: User's Instagram access token
            
        Returns:
            Demographics data if available, None otherwise
        """
        try:
            # This requires Instagram Business API which needs additional setup
            # For now, return empty demographics
            return {}
            
        except Exception as e:
            print(f"Error collecting Instagram demographics: {e}")
            return {}
    
    def _validate_token(self, user_token: UserSocialToken) -> bool:
        """Validate Instagram access token"""
        try:
            url = f"{self.base_url}/me"
            params = {'access_token': user_token.access_token}
            
            response = requests.get(url, params=params)
            return response.status_code == 200
            
        except requests.exceptions.RequestException:
            return False
    
    def _calculate_engagement_rate(self, total_engagements: int, reach: int) -> float:
        """Calculate engagement rate"""
        if reach == 0:
            return 0.0
        return round((total_engagements / reach) * 100, 4)


class YouTubeDataCollector:
    """Collector for YouTube video analytics using YouTube Data API v3 and YouTube Analytics API"""
    
    def __init__(self):
        self.data_api_url = "https://www.googleapis.com/youtube/v3"
        self.analytics_api_url = "https://youtubeanalytics.googleapis.com/v2"
    
    def collect_content_metrics(self, content_id: str, user_token: UserSocialToken) -> Optional[RawMetrics]:
        """
        Collect metrics for specific YouTube video
        
        Args:
            content_id: YouTube video ID
            user_token: User's YouTube access token
            
        Returns:
            RawMetrics object if successful, None otherwise
        """
        try:
            # Check if token is valid and refresh if needed
            if not self._ensure_valid_token(user_token):
                return None
            
            # Get video statistics from YouTube Data API
            video_url = f"{self.data_api_url}/videos"
            video_params = {
                'part': 'statistics,snippet',
                'id': content_id,
                'access_token': user_token.access_token
            }
            
            video_response = requests.get(video_url, params=video_params)
            video_response.raise_for_status()
            video_data = video_response.json()
            
            if not video_data.get('items'):
                return None
            
            video_info = video_data['items'][0]
            statistics = video_info.get('statistics', {})
            snippet = video_info.get('snippet', {})
            
            # Get analytics data from YouTube Analytics API
            analytics_metrics = self._get_video_analytics(content_id, user_token)
            
            # Compile metrics
            metrics = {
                'impressions': analytics_metrics.get('impressions', 0),
                'reach': int(statistics.get('viewCount', 0)),  # Views as reach proxy
                'likes': int(statistics.get('likeCount', 0)),
                'comments': int(statistics.get('commentCount', 0)),
                'shares': analytics_metrics.get('shares', 0),
                'clicks': analytics_metrics.get('clicks', 0),
                'engagement_rate': self._calculate_engagement_rate(
                    int(statistics.get('likeCount', 0)) + int(statistics.get('commentCount', 0)),
                    int(statistics.get('viewCount', 1))
                )
            }
            
            # Get demographics if available
            demographics = self._get_video_demographics(content_id, user_token)
            
            return RawMetrics(
                platform='youtube',
                content_id=content_id,
                metrics=metrics,
                demographics=demographics,
                collected_at=datetime.utcnow()
            )
            
        except requests.exceptions.RequestException as e:
            error = error_handling_service.handle_api_error(e, 'youtube', user_token.user_id, content_id)
            error_handling_service.log_error(error)
            return None
        except Exception as e:
            error = error_handling_service.handle_api_error(e, 'youtube', user_token.user_id, content_id)
            error_handling_service.log_error(error)
            return None
    
    def _get_video_analytics(self, video_id: str, user_token: UserSocialToken) -> Dict[str, Any]:
        """Get detailed analytics for a video"""
        try:
            # Calculate date range (last 30 days)
            end_date = datetime.now().strftime('%Y-%m-%d')
            start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            
            analytics_url = f"{self.analytics_api_url}/reports"
            analytics_params = {
                'ids': f'channel=={user_token.platform_user_id}',
                'startDate': start_date,
                'endDate': end_date,
                'metrics': 'views,impressions,clicks,shares',
                'filters': f'video=={video_id}',
                'access_token': user_token.access_token
            }
            
            response = requests.get(analytics_url, params=analytics_params)
            response.raise_for_status()
            
            data = response.json()
            rows = data.get('rows', [])
            
            if rows:
                row = rows[0]
                return {
                    'views': row[0] if len(row) > 0 else 0,
                    'impressions': row[1] if len(row) > 1 else 0,
                    'clicks': row[2] if len(row) > 2 else 0,
                    'shares': row[3] if len(row) > 3 else 0
                }
            
            return {}
            
        except requests.exceptions.RequestException as e:
            print(f"YouTube Analytics API error: {e}")
            return {}
    
    def _get_video_demographics(self, video_id: str, user_token: UserSocialToken) -> Dict[str, Any]:
        """Get demographic data for a video"""
        try:
            # Calculate date range (last 30 days)
            end_date = datetime.now().strftime('%Y-%m-%d')
            start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            
            demographics = {}
            
            # Get age and gender demographics
            demo_url = f"{self.analytics_api_url}/reports"
            demo_params = {
                'ids': f'channel=={user_token.platform_user_id}',
                'startDate': start_date,
                'endDate': end_date,
                'metrics': 'viewerPercentage',
                'dimensions': 'ageGroup,gender',
                'filters': f'video=={video_id}',
                'access_token': user_token.access_token
            }
            
            response = requests.get(demo_url, params=demo_params)
            if response.status_code == 200:
                data = response.json()
                rows = data.get('rows', [])
                
                age_groups = {}
                for row in rows:
                    if len(row) >= 3:
                        age_group = row[0]
                        percentage = row[2]
                        age_groups[age_group] = percentage
                
                demographics['ageGroups'] = age_groups
            
            # Get geographic demographics
            geo_params = {
                'ids': f'channel=={user_token.platform_user_id}',
                'startDate': start_date,
                'endDate': end_date,
                'metrics': 'viewerPercentage',
                'dimensions': 'country',
                'filters': f'video=={video_id}',
                'sort': '-viewerPercentage',
                'maxResults': 10,
                'access_token': user_token.access_token
            }
            
            geo_response = requests.get(demo_url, params=geo_params)
            if geo_response.status_code == 200:
                geo_data = geo_response.json()
                geo_rows = geo_data.get('rows', [])
                
                locations = {}
                for row in geo_rows:
                    if len(row) >= 2:
                        country = row[0]
                        percentage = row[1]
                        locations[country] = percentage
                
                demographics['locations'] = locations
            
            return demographics
            
        except requests.exceptions.RequestException as e:
            print(f"YouTube demographics API error: {e}")
            return {}
    
    def _ensure_valid_token(self, user_token: UserSocialToken) -> bool:
        """Ensure token is valid and refresh if needed"""
        try:
            # Check if token is expired
            if user_token.token_expires_at and user_token.token_expires_at <= datetime.utcnow():
                # Try to refresh token
                from app.db.db import get_db
                db = next(get_db())
                success = oauth_service.refresh_youtube_token(user_token, db)
                db.close()
                return success
            
            return True
            
        except Exception as e:
            print(f"Error ensuring valid token: {e}")
            return False
    
    def _calculate_engagement_rate(self, total_engagements: int, views: int) -> float:
        """Calculate engagement rate for YouTube"""
        if views == 0:
            return 0.0
        return round((total_engagements / views) * 100, 4)


class DataCollectorFactory:
    """Factory for creating appropriate data collectors"""
    
    @staticmethod
    def get_collector(platform: str):
        """Get data collector for specified platform"""
        if platform == 'instagram':
            return InstagramDataCollector()
        elif platform == 'youtube':
            return YouTubeDataCollector()
        else:
            raise ValueError(f"Unsupported platform: {platform}")


# Global instances
instagram_collector = InstagramDataCollector()
youtube_collector = YouTubeDataCollector()