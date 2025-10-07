from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.models import (
    ContractContentMapping, ContentAnalytics, UserSocialToken, User
)
from app.services.data_collectors import DataCollectorFactory, RawMetrics
from app.services.metrics_normalizer import metrics_normalizer, NormalizedMetrics
from app.services.oauth_service import oauth_service


class DataIngestionService:
    """Service for orchestrating data collection and ingestion from social platforms"""
    
    def __init__(self):
        self.rate_limits = {
            'instagram': {
                'requests_per_hour': 200,
                'requests_per_day': 4800
            },
            'youtube': {
                'requests_per_hour': 10000,
                'requests_per_day': 1000000
            }
        }
        
        # Track API usage (in production, this should use Redis or database)
        self.usage_tracker = {}
    
    def sync_content_data(self, content_mapping_id: str, db: Session, force_refresh: bool = False) -> Tuple[bool, str]:
        """
        Sync analytics data for a specific piece of linked content
        
        Args:
            content_mapping_id: ID of the content mapping to sync
            db: Database session
            force_refresh: Whether to force refresh even if recently synced
            
        Returns:
            Tuple of (success, message)
        """
        try:
            # Get content mapping
            content_mapping = db.query(ContractContentMapping).filter(
                ContractContentMapping.id == content_mapping_id,
                ContractContentMapping.is_active == True
            ).first()
            
            if not content_mapping:
                return False, "Content mapping not found"
            
            # Check if we need to sync (avoid too frequent syncing)
            if not force_refresh and self._is_recently_synced(content_mapping, db):
                return True, "Content data is up to date"
            
            # Get user's social token
            user_token = db.query(UserSocialToken).filter(
                UserSocialToken.user_id == content_mapping.user_id,
                UserSocialToken.platform == content_mapping.platform,
                UserSocialToken.is_active == True
            ).first()
            
            if not user_token:
                return False, f"No active {content_mapping.platform} token found"
            
            # Check rate limits
            if not self._check_rate_limit(content_mapping.platform, content_mapping.user_id):
                return False, "Rate limit exceeded, please try again later"
            
            # Collect data using appropriate collector
            collector = DataCollectorFactory.get_collector(content_mapping.platform)
            raw_metrics = collector.collect_content_metrics(content_mapping.content_id, user_token)
            
            if not raw_metrics:
                return False, "Failed to collect metrics from platform"
            
            # Normalize metrics
            normalized_metrics = metrics_normalizer.normalize_metrics(raw_metrics)
            
            # Store in database
            success = self._store_content_analytics(content_mapping, normalized_metrics, db)
            
            if success:
                # Update usage tracker
                self._update_usage_tracker(content_mapping.platform, content_mapping.user_id)
                
                # Trigger cache invalidation for real-time updates
                try:
                    from app.services.cache_invalidation_service import cache_invalidation_service
                    import asyncio
                    
                    # Check if there's a running event loop
                    try:
                        loop = asyncio.get_running_loop()
                        # Run cache invalidation in background
                        asyncio.create_task(
                            cache_invalidation_service.invalidate_related_data(
                                db, 'content', content_mapping_id
                            )
                        )
                    except RuntimeError:
                        # No running event loop, skip cache invalidation
                        print("Warning: No running event loop for cache invalidation")
                except Exception as e:
                    print(f"Warning: Cache invalidation failed: {e}")
                
                return True, "Content data synced successfully"
            else:
                return False, "Failed to store analytics data"
                
        except Exception as e:
            return False, f"Error syncing content data: {str(e)}"
    
    def sync_contract_content(self, contract_id: str, db: Session) -> Tuple[bool, str, Dict]:
        """
        Sync analytics data for all content linked to a contract
        
        Args:
            contract_id: ID of the contract
            db: Database session
            
        Returns:
            Tuple of (success, message, results_summary)
        """
        try:
            # Get all active content mappings for the contract
            content_mappings = db.query(ContractContentMapping).filter(
                ContractContentMapping.contract_id == contract_id,
                ContractContentMapping.is_active == True
            ).all()
            
            if not content_mappings:
                return True, "No content linked to this contract", {}
            
            results = {
                'total': len(content_mappings),
                'successful': 0,
                'failed': 0,
                'skipped': 0,
                'errors': []
            }
            
            for mapping in content_mappings:
                success, message = self.sync_content_data(mapping.id, db)
                
                if success:
                    if "up to date" in message:
                        results['skipped'] += 1
                    else:
                        results['successful'] += 1
                else:
                    results['failed'] += 1
                    results['errors'].append({
                        'content_id': mapping.content_id,
                        'platform': mapping.platform,
                        'error': message
                    })
            
            overall_success = results['failed'] == 0
            summary_message = f"Synced {results['successful']} items, skipped {results['skipped']}, failed {results['failed']}"
            
            return overall_success, summary_message, results
            
        except Exception as e:
            return False, f"Error syncing contract content: {str(e)}", {}
    
    def sync_user_content(self, user_id: str, db: Session) -> Tuple[bool, str, Dict]:
        """
        Sync analytics data for all content owned by a user
        
        Args:
            user_id: ID of the user
            db: Database session
            
        Returns:
            Tuple of (success, message, results_summary)
        """
        try:
            # Get all active content mappings for the user
            content_mappings = db.query(ContractContentMapping).filter(
                ContractContentMapping.user_id == user_id,
                ContractContentMapping.is_active == True
            ).all()
            
            if not content_mappings:
                return True, "No content linked for this user", {}
            
            results = {
                'total': len(content_mappings),
                'successful': 0,
                'failed': 0,
                'skipped': 0,
                'errors': []
            }
            
            for mapping in content_mappings:
                success, message = self.sync_content_data(mapping.id, db)
                
                if success:
                    if "up to date" in message:
                        results['skipped'] += 1
                    else:
                        results['successful'] += 1
                else:
                    results['failed'] += 1
                    results['errors'].append({
                        'content_id': mapping.content_id,
                        'platform': mapping.platform,
                        'error': message
                    })
            
            overall_success = results['failed'] == 0
            summary_message = f"Synced {results['successful']} items, skipped {results['skipped']}, failed {results['failed']}"
            
            return overall_success, summary_message, results
            
        except Exception as e:
            return False, f"Error syncing user content: {str(e)}", {}
    
    def get_content_analytics(self, content_mapping_id: str, db: Session, 
                            date_range: Optional[Tuple[datetime, datetime]] = None) -> Optional[List[Dict]]:
        """
        Get analytics data for specific content
        
        Args:
            content_mapping_id: ID of the content mapping
            db: Database session
            date_range: Optional tuple of (start_date, end_date)
            
        Returns:
            List of analytics data or None if not found
        """
        try:
            query = db.query(ContentAnalytics).filter(
                ContentAnalytics.contract_content_id == content_mapping_id
            )
            
            if date_range:
                start_date, end_date = date_range
                query = query.filter(
                    and_(
                        ContentAnalytics.metrics_collected_at >= start_date,
                        ContentAnalytics.metrics_collected_at <= end_date
                    )
                )
            
            analytics = query.order_by(ContentAnalytics.metrics_collected_at.desc()).all()
            
            result = []
            for record in analytics:
                result.append({
                    'id': record.id,
                    'impressions': record.impressions,
                    'reach': record.reach,
                    'likes': record.likes,
                    'comments': record.comments,
                    'shares': record.shares,
                    'saves': record.saves,
                    'clicks': record.clicks,
                    'engagement_rate': float(record.engagement_rate) if record.engagement_rate else 0.0,
                    'demographics': record.demographics,
                    'content_published_at': record.content_published_at.isoformat() if record.content_published_at else None,
                    'metrics_collected_at': record.metrics_collected_at.isoformat(),
                    'created_at': record.created_at.isoformat()
                })
            
            return result
            
        except Exception as e:
            print(f"Error getting content analytics: {e}")
            return None
    
    def _is_recently_synced(self, content_mapping: ContractContentMapping, db: Session, 
                           hours_threshold: int = 1) -> bool:
        """Check if content was recently synced"""
        try:
            threshold_time = datetime.utcnow() - timedelta(hours=hours_threshold)
            
            recent_analytics = db.query(ContentAnalytics).filter(
                ContentAnalytics.contract_content_id == content_mapping.id,
                ContentAnalytics.metrics_collected_at >= threshold_time
            ).first()
            
            return recent_analytics is not None
            
        except Exception:
            return False
    
    def _check_rate_limit(self, platform: str, user_id: str) -> bool:
        """Check if API rate limit allows for another request"""
        try:
            current_time = datetime.utcnow()
            user_key = f"{platform}:{user_id}"
            
            if user_key not in self.usage_tracker:
                self.usage_tracker[user_key] = {
                    'hourly': {'count': 0, 'reset_time': current_time + timedelta(hours=1)},
                    'daily': {'count': 0, 'reset_time': current_time + timedelta(days=1)}
                }
            
            user_usage = self.usage_tracker[user_key]
            
            # Reset counters if time has passed
            if current_time >= user_usage['hourly']['reset_time']:
                user_usage['hourly'] = {'count': 0, 'reset_time': current_time + timedelta(hours=1)}
            
            if current_time >= user_usage['daily']['reset_time']:
                user_usage['daily'] = {'count': 0, 'reset_time': current_time + timedelta(days=1)}
            
            # Check limits
            platform_limits = self.rate_limits.get(platform, {'requests_per_hour': 100, 'requests_per_day': 1000})
            
            if user_usage['hourly']['count'] >= platform_limits['requests_per_hour']:
                return False
            
            if user_usage['daily']['count'] >= platform_limits['requests_per_day']:
                return False
            
            return True
            
        except Exception as e:
            print(f"Error checking rate limit: {e}")
            return True  # Allow request if rate limit check fails
    
    def _update_usage_tracker(self, platform: str, user_id: str):
        """Update API usage tracker"""
        try:
            user_key = f"{platform}:{user_id}"
            
            if user_key in self.usage_tracker:
                self.usage_tracker[user_key]['hourly']['count'] += 1
                self.usage_tracker[user_key]['daily']['count'] += 1
                
        except Exception as e:
            print(f"Error updating usage tracker: {e}")
    
    def _store_content_analytics(self, content_mapping: ContractContentMapping, 
                               normalized_metrics: NormalizedMetrics, db: Session) -> bool:
        """Store normalized metrics in the database"""
        try:
            # Create new analytics record
            analytics = ContentAnalytics(
                contract_content_id=content_mapping.id,
                impressions=normalized_metrics.metrics.get('impressions', 0),
                reach=normalized_metrics.metrics.get('reach', 0),
                likes=normalized_metrics.metrics.get('likes', 0),
                comments=normalized_metrics.metrics.get('comments', 0),
                shares=normalized_metrics.metrics.get('shares', 0),
                saves=normalized_metrics.metrics.get('saves', 0),
                clicks=normalized_metrics.metrics.get('clicks', 0),
                engagement_rate=normalized_metrics.metrics.get('engagement_rate', 0.0),
                demographics=normalized_metrics.demographics,
                metrics_collected_at=normalized_metrics.collected_at
            )
            
            db.add(analytics)
            db.commit()
            
            return True
            
        except Exception as e:
            db.rollback()
            print(f"Error storing content analytics: {e}")
            return False
    
    def validate_platform_credentials(self, platform: str, user_id: str, db: Session) -> Tuple[bool, str]:
        """Validate that user has valid credentials for the platform"""
        try:
            user_token = db.query(UserSocialToken).filter(
                UserSocialToken.user_id == user_id,
                UserSocialToken.platform == platform,
                UserSocialToken.is_active == True
            ).first()
            
            if not user_token:
                return False, f"No {platform} account connected"
            
            # Check if token is expired (for platforms that have expiration)
            if platform == 'youtube' and user_token.token_expires_at:
                if user_token.token_expires_at <= datetime.utcnow():
                    # Try to refresh token
                    success = oauth_service.refresh_youtube_token(user_token, db)
                    if not success:
                        return False, f"{platform} token expired and refresh failed"
            
            # Test the token with a simple API call
            collector = DataCollectorFactory.get_collector(platform)
            
            if platform == 'instagram':
                # Test Instagram token
                test_url = "https://graph.instagram.com/me"
                import requests
                response = requests.get(test_url, params={'access_token': user_token.access_token})
                if response.status_code != 200:
                    return False, f"{platform} token is invalid"
            
            elif platform == 'youtube':
                # Test YouTube token
                test_url = "https://www.googleapis.com/youtube/v3/channels"
                import requests
                response = requests.get(test_url, params={
                    'part': 'snippet',
                    'mine': 'true',
                    'access_token': user_token.access_token
                })
                if response.status_code != 200:
                    return False, f"{platform} token is invalid"
            
            return True, f"{platform} credentials are valid"
            
        except Exception as e:
            return False, f"Error validating {platform} credentials: {str(e)}"


# Global instance
data_ingestion_service = DataIngestionService()