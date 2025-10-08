"""
Unit tests for ROI Service

Tests all ROI calculation methods for accuracy and edge cases.
"""

import pytest
from datetime import datetime, timedelta
from decimal import Decimal
from unittest.mock import Mock, patch
from sqlalchemy.orm import Session

from app.services.roi_service import ROIService, ROIMetrics, ROITrend, ROITarget
from app.models.models import (
    CampaignMetrics,
    Sponsorship,
    SponsorshipPayment,
    User
)


class TestROIService:
    """Test suite for ROI Service"""
    
    @pytest.fixture
    def mock_db(self):
        """Mock database session"""
        return Mock(spec=Session)
    
    @pytest.fixture
    def roi_service(self, mock_db):
        """ROI service instance with mocked database"""
        return ROIService(mock_db)
    
    @pytest.fixture
    def sample_campaign(self):
        """Sample campaign for testing"""
        campaign = Mock(spec=Sponsorship)
        campaign.id = "campaign_123"
        campaign.brand_id = "brand_456"
        campaign.budget = Decimal('1000.00')
        return campaign
    
    @pytest.fixture
    def sample_metrics(self):
        """Sample campaign metrics for testing"""
        metrics = []
        
        # Metric 1
        m1 = Mock(spec=CampaignMetrics)
        m1.campaign_id = "campaign_123"
        m1.revenue = Decimal('500.00')
        m1.conversions = 10
        m1.impressions = 5000
        m1.reach = 3000
        m1.clicks = 150
        m1.engagement_rate = Decimal('0.05')
        m1.recorded_at = datetime(2024, 1, 15)
        metrics.append(m1)
        
        # Metric 2
        m2 = Mock(spec=CampaignMetrics)
        m2.campaign_id = "campaign_123"
        m2.revenue = Decimal('300.00')
        m2.conversions = 5
        m2.impressions = 3000
        m2.reach = 2000
        m2.clicks = 90
        m2.engagement_rate = Decimal('0.04')
        m2.recorded_at = datetime(2024, 1, 20)
        metrics.append(m2)
        
        return metrics
    
    def test_calculate_roi_percentage(self, roi_service):
        """Test ROI percentage calculation"""
        # Test positive ROI
        revenue = Decimal('1200.00')
        spend = Decimal('1000.00')
        roi = roi_service._calculate_roi_percentage(revenue, spend)
        assert roi == Decimal('20.00')  # ((1200 - 1000) / 1000) * 100 = 20%
        
        # Test negative ROI
        revenue = Decimal('800.00')
        spend = Decimal('1000.00')
        roi = roi_service._calculate_roi_percentage(revenue, spend)
        assert roi == Decimal('-20.00')  # ((800 - 1000) / 1000) * 100 = -20%
        
        # Test zero spend
        roi = roi_service._calculate_roi_percentage(Decimal('100.00'), Decimal('0'))
        assert roi == Decimal('0')
        
        # Test zero revenue
        roi = roi_service._calculate_roi_percentage(Decimal('0'), Decimal('1000.00'))
        assert roi == Decimal('-100.00')
    
    def test_calculate_cpa(self, roi_service):
        """Test cost per acquisition calculation"""
        # Test normal CPA
        spend = Decimal('1000.00')
        conversions = 20
        cpa = roi_service._calculate_cpa(spend, conversions)
        assert cpa == Decimal('50.00')  # 1000 / 20 = 50
        
        # Test zero conversions
        cpa = roi_service._calculate_cpa(spend, 0)
        assert cpa == spend  # Should return total spend when no conversions
        
        # Test fractional CPA
        spend = Decimal('333.33')
        conversions = 7
        cpa = roi_service._calculate_cpa(spend, conversions)
        assert cpa == Decimal('47.62')  # 333.33 / 7 = 47.619... rounded to 47.62
    
    def test_calculate_ctr(self, roi_service):
        """Test click-through rate calculation"""
        # Test normal CTR
        clicks = 150
        impressions = 5000
        ctr = roi_service._calculate_ctr(clicks, impressions)
        assert ctr == Decimal('3.00')  # (150 / 5000) * 100 = 3%
        
        # Test zero impressions
        ctr = roi_service._calculate_ctr(100, 0)
        assert ctr == Decimal('0')
        
        # Test zero clicks
        ctr = roi_service._calculate_ctr(0, 5000)
        assert ctr == Decimal('0.00')
    
    def test_calculate_average_engagement_rate(self, roi_service, sample_metrics):
        """Test average engagement rate calculation"""
        avg_rate = roi_service._calculate_average_engagement_rate(sample_metrics)
        expected = Decimal('0.05')  # (0.05 + 0.04) / 2 = 0.045 rounded to 0.05
        assert avg_rate == expected
        
        # Test with empty metrics
        avg_rate = roi_service._calculate_average_engagement_rate([])
        assert avg_rate == Decimal('0')
        
        # Test with None values
        metrics_with_none = sample_metrics.copy()
        none_metric = Mock(spec=CampaignMetrics)
        none_metric.engagement_rate = None
        metrics_with_none.append(none_metric)
        
        avg_rate = roi_service._calculate_average_engagement_rate(metrics_with_none)
        assert avg_rate == expected  # Should ignore None values
    
    def test_calculate_percentage_variance(self, roi_service):
        """Test percentage variance calculation"""
        # Test positive variance
        actual = Decimal('120.00')
        target = Decimal('100.00')
        variance = roi_service._calculate_percentage_variance(actual, target)
        assert variance == Decimal('20.00')  # ((120 - 100) / 100) * 100 = 20%
        
        # Test negative variance
        actual = Decimal('80.00')
        target = Decimal('100.00')
        variance = roi_service._calculate_percentage_variance(actual, target)
        assert variance == Decimal('-20.00')
        
        # Test zero target
        variance = roi_service._calculate_percentage_variance(Decimal('50.00'), Decimal('0'))
        assert variance == Decimal('0')
    
    @patch.object(ROIService, '_calculate_campaign_spend')
    def test_calculate_campaign_roi_success(self, mock_spend, roi_service, mock_db, sample_campaign, sample_metrics):
        """Test successful campaign ROI calculation"""
        # Setup mocks
        mock_db.query.return_value.filter.return_value.first.return_value = sample_campaign
        mock_db.query.return_value.filter.return_value.all.return_value = sample_metrics
        mock_spend.return_value = Decimal('1000.00')
        
        # Calculate ROI
        start_date = datetime(2024, 1, 1)
        end_date = datetime(2024, 1, 31)
        result = roi_service.calculate_campaign_roi("campaign_123", start_date, end_date)
        
        # Verify results
        assert result is not None
        assert result.campaign_id == "campaign_123"
        assert result.total_spend == Decimal('1000.00')
        assert result.total_revenue == Decimal('800.00')  # 500 + 300
        assert result.roi_percentage == Decimal('-20.00')  # ((800 - 1000) / 1000) * 100
        assert result.conversions == 15  # 10 + 5
        assert result.impressions == 8000  # 5000 + 3000
        assert result.reach == 5000  # 3000 + 2000
        assert result.cost_per_acquisition == Decimal('66.67')  # 1000 / 15
        assert result.engagement_rate == Decimal('0.05')  # (0.05 + 0.04) / 2 = 0.045 rounded to 0.05
        assert result.click_through_rate == Decimal('3.00')  # (240 / 8000) * 100
    
    def test_calculate_campaign_roi_no_campaign(self, roi_service, mock_db):
        """Test ROI calculation when campaign doesn't exist"""
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        result = roi_service.calculate_campaign_roi("nonexistent_campaign")
        assert result is None
    
    @patch.object(ROIService, '_calculate_campaign_spend')
    def test_calculate_campaign_roi_zero_spend(self, mock_spend, roi_service, mock_db, sample_campaign):
        """Test ROI calculation with zero spend"""
        mock_db.query.return_value.filter.return_value.first.return_value = sample_campaign
        mock_spend.return_value = Decimal('0')
        
        result = roi_service.calculate_campaign_roi("campaign_123")
        assert result is None
    
    @patch.object(ROIService, '_calculate_campaign_spend')
    def test_calculate_campaign_roi_no_metrics(self, mock_spend, roi_service, mock_db, sample_campaign):
        """Test ROI calculation with no metrics data"""
        mock_db.query.return_value.filter.return_value.first.return_value = sample_campaign
        mock_db.query.return_value.filter.return_value.all.return_value = []
        mock_spend.return_value = Decimal('1000.00')
        
        result = roi_service.calculate_campaign_roi("campaign_123")
        assert result is None
    
    @patch.object(ROIService, '_calculate_campaign_spend')
    def test_calculate_roi_trends_daily(self, mock_spend, roi_service, mock_db, sample_metrics):
        """Test daily ROI trend calculation"""
        mock_spend.return_value = Decimal('100.00')
        mock_db.query.return_value.filter.return_value.all.return_value = [sample_metrics[0]]
        
        trends = roi_service.calculate_roi_trends("campaign_123", "daily", 3)
        
        assert len(trends) == 3
        assert all(isinstance(trend, ROITrend) for trend in trends)
        assert trends[0].spend == Decimal('100.00')
        assert trends[0].revenue == Decimal('500.00')
        assert trends[0].roi_percentage == Decimal('400.00')  # ((500 - 100) / 100) * 100
    
    def test_calculate_roi_trends_invalid_period(self, roi_service):
        """Test ROI trends with invalid period type"""
        with pytest.raises(ValueError, match="period_type must be"):
            roi_service.calculate_roi_trends("campaign_123", "invalid_period")
    
    @patch.object(ROIService, 'calculate_campaign_roi')
    def test_compare_roi_to_targets_success(self, mock_calculate, roi_service):
        """Test successful ROI target comparison"""
        # Setup mock ROI metrics
        mock_roi = ROIMetrics(
            campaign_id="campaign_123",
            total_spend=Decimal('1000.00'),
            total_revenue=Decimal('1200.00'),
            roi_percentage=Decimal('20.00'),
            cost_per_acquisition=Decimal('50.00'),
            conversions=20,
            impressions=10000,
            reach=8000,
            engagement_rate=Decimal('5.00'),
            click_through_rate=Decimal('2.50'),
            period_start=datetime(2024, 1, 1),
            period_end=datetime(2024, 1, 31)
        )
        mock_calculate.return_value = mock_roi
        
        # Test target comparison
        target_roi = Decimal('15.00')
        target_cpa = Decimal('60.00')
        
        result = roi_service.compare_roi_to_targets("campaign_123", target_roi, target_cpa)
        
        assert result is not None
        assert result.target_roi == target_roi
        assert result.actual_roi == Decimal('20.00')
        assert result.target_cpa == target_cpa
        assert result.actual_cpa == Decimal('50.00')
        assert result.target_met is True  # ROI > target and CPA < target
        assert result.variance_percentage == Decimal('33.33')  # ((20 - 15) / 15) * 100
    
    @patch.object(ROIService, 'calculate_campaign_roi')
    def test_compare_roi_to_targets_not_met(self, mock_calculate, roi_service):
        """Test ROI target comparison when targets are not met"""
        mock_roi = ROIMetrics(
            campaign_id="campaign_123",
            total_spend=Decimal('1000.00'),
            total_revenue=Decimal('1100.00'),
            roi_percentage=Decimal('10.00'),
            cost_per_acquisition=Decimal('70.00'),
            conversions=20,
            impressions=10000,
            reach=8000,
            engagement_rate=Decimal('5.00'),
            click_through_rate=Decimal('2.50'),
            period_start=datetime(2024, 1, 1),
            period_end=datetime(2024, 1, 31)
        )
        mock_calculate.return_value = mock_roi
        
        target_roi = Decimal('15.00')
        target_cpa = Decimal('60.00')
        
        result = roi_service.compare_roi_to_targets("campaign_123", target_roi, target_cpa)
        
        assert result.target_met is False  # ROI < target and CPA > target
        assert result.variance_percentage == Decimal('-33.33')  # ((10 - 15) / 15) * 100
    
    @patch.object(ROIService, 'calculate_campaign_roi')
    def test_get_campaign_roi_summary(self, mock_calculate, roi_service):
        """Test getting ROI summary for multiple campaigns"""
        # Setup mock returns
        roi_1 = Mock(spec=ROIMetrics)
        roi_1.campaign_id = "campaign_1"
        roi_2 = Mock(spec=ROIMetrics)
        roi_2.campaign_id = "campaign_2"
        
        mock_calculate.side_effect = [roi_1, roi_2, None]  # Third campaign has no data
        
        campaign_ids = ["campaign_1", "campaign_2", "campaign_3"]
        summary = roi_service.get_campaign_roi_summary(campaign_ids)
        
        assert len(summary) == 2
        assert "campaign_1" in summary
        assert "campaign_2" in summary
        assert "campaign_3" not in summary  # Should be excluded due to None result
        assert summary["campaign_1"] == roi_1
        assert summary["campaign_2"] == roi_2
    
    @patch('app.services.roi_service.db_optimization_service')
    @patch.object(ROIService, '_calculate_campaign_spend')
    def test_calculate_portfolio_roi(self, mock_spend, mock_db_optimization, roi_service, mock_db):
        """Test portfolio ROI calculation for a brand"""
        # Setup mock campaigns
        campaign_1 = Mock(spec=Sponsorship)
        campaign_1.id = "campaign_1"
        campaign_2 = Mock(spec=Sponsorship)
        campaign_2.id = "campaign_2"
        
        # Mock the database query for campaigns
        campaigns_query = Mock()
        campaigns_query.filter.return_value.all.return_value = [campaign_1, campaign_2]
        mock_db.query.return_value = campaigns_query
        
        # Mock the aggregated campaign summary
        mock_summary = {
            "campaign_1": {
                'total_impressions': 2000,
                'total_reach': 1500,
                'total_clicks': 60,
                'total_conversions': 5,
                'total_revenue': 300.00,
                'avg_engagement_rate': 0.04
            },
            "campaign_2": {
                'total_impressions': 3000,
                'total_reach': 2500,
                'total_clicks': 90,
                'total_conversions': 8,
                'total_revenue': 400.00,
                'avg_engagement_rate': 0.06
            }
        }
        mock_db_optimization.get_aggregated_campaign_summary.return_value = mock_summary
        
        # Mock spend calculation to return different values for each campaign
        mock_spend.side_effect = [Decimal('500.00'), Decimal('500.00')]
        
        result = roi_service.calculate_portfolio_roi("brand_456")
        
        assert result is not None
        assert result.campaign_id == "portfolio_brand_456"
        assert result.total_spend == Decimal('1000.00')  # 500 * 2 campaigns
        assert result.total_revenue == Decimal('700.00')  # 300 + 400
        assert result.roi_percentage == Decimal('-30.00')  # ((700 - 1000) / 1000) * 100
        assert result.conversions == 13  # 5 + 8
        assert result.impressions == 5000  # 2000 + 3000
        assert result.reach == 4000  # 1500 + 2500
    
    def test_calculate_portfolio_roi_no_campaigns(self, roi_service, mock_db):
        """Test portfolio ROI calculation when brand has no campaigns"""
        mock_db.query.return_value.filter.return_value.all.return_value = []
        
        result = roi_service.calculate_portfolio_roi("brand_456")
        assert result is None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])