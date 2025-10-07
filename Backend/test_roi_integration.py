"""
Integration tests for ROI Analytics API

Tests the ROI service integration with FastAPI endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
from decimal import Decimal

from app.main import app
from app.db.db import get_db, Base
from app.models.models import (
    User, Sponsorship, CampaignMetrics, SponsorshipPayment
)


# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_roi.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


def override_get_current_user():
    """Override current user for testing"""
    return User(
        id="brand_123",
        username="testbrand",
        email="brand@test.com",
        role="brand"
    )


app.dependency_overrides[get_db] = override_get_db

# Import and override the get_current_user dependency
import app.routes.roi_analytics as roi_routes
app.dependency_overrides[roi_routes.get_current_user] = override_get_current_user


@pytest.fixture(scope="module")
def setup_database():
    """Set up test database with sample data"""
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    
    # Create test user (brand)
    brand_user = User(
        id="brand_123",
        username="testbrand",
        email="brand@test.com",
        role="brand"
    )
    db.add(brand_user)
    
    # Create test campaign
    campaign = Sponsorship(
        id="campaign_123",
        brand_id="brand_123",
        title="Test Campaign",
        description="Test campaign for ROI testing",
        budget=Decimal('1000.00'),
        status="active"
    )
    db.add(campaign)
    
    # Create test metrics
    metrics_1 = CampaignMetrics(
        id="metrics_1",
        campaign_id="campaign_123",
        impressions=5000,
        clicks=150,
        conversions=10,
        revenue=Decimal('500.00'),
        reach=3000,
        engagement_rate=Decimal('0.05'),
        click_through_rate=Decimal('0.03'),
        cost_per_acquisition=Decimal('50.00'),
        return_on_investment=Decimal('0.25'),
        recorded_at=datetime.now() - timedelta(days=5)
    )
    db.add(metrics_1)
    
    metrics_2 = CampaignMetrics(
        id="metrics_2",
        campaign_id="campaign_123",
        impressions=3000,
        clicks=90,
        conversions=5,
        revenue=Decimal('300.00'),
        reach=2000,
        engagement_rate=Decimal('0.04'),
        click_through_rate=Decimal('0.03'),
        cost_per_acquisition=Decimal('60.00'),
        return_on_investment=Decimal('0.20'),
        recorded_at=datetime.now() - timedelta(days=2)
    )
    db.add(metrics_2)
    
    # Create test payment
    payment = SponsorshipPayment(
        id="payment_123",
        creator_id="creator_123",
        brand_id="brand_123",
        sponsorship_id="campaign_123",
        amount=Decimal('1000.00'),
        status="completed",
        transaction_date=datetime.now() - timedelta(days=10)
    )
    db.add(payment)
    
    db.commit()
    db.close()
    
    yield
    
    # Cleanup
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    """Test client for API requests"""
    return TestClient(app)


class TestROIAnalyticsAPI:
    """Test suite for ROI Analytics API endpoints"""
    
    def test_get_campaign_roi(self, client, setup_database):
        """Test getting campaign ROI metrics"""
        response = client.get("/api/roi/campaigns/campaign_123?days=30")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["campaign_id"] == "campaign_123"
        assert "total_spend" in data
        assert "total_revenue" in data
        assert "roi_percentage" in data
        assert "cost_per_acquisition" in data
        assert "conversions" in data
        assert "impressions" in data
        assert "reach" in data
        assert "engagement_rate" in data
        assert "click_through_rate" in data
        assert "period_start" in data
        assert "period_end" in data
        
        # Verify calculated values
        assert data["total_revenue"] == 800.0  # 500 + 300
        assert data["conversions"] == 15  # 10 + 5
        assert data["impressions"] == 8000  # 5000 + 3000
        assert data["reach"] == 5000  # 3000 + 2000
    
    def test_get_campaign_roi_trends(self, client, setup_database):
        """Test getting campaign ROI trends"""
        response = client.get("/api/roi/campaigns/campaign_123/trends?period_type=daily&num_periods=7")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        # Should have some trend data
        if data:  # If there's data
            trend = data[0]
            assert "period" in trend
            assert "roi_percentage" in trend
            assert "spend" in trend
            assert "revenue" in trend
            assert "conversions" in trend
            assert "date" in trend
    
    def test_compare_campaign_roi_to_targets(self, client, setup_database):
        """Test comparing campaign ROI to targets"""
        response = client.get(
            "/api/roi/campaigns/campaign_123/targets?target_roi=15.0&target_cpa=55.0&days=30"
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "target_roi" in data
        assert "actual_roi" in data
        assert "target_cpa" in data
        assert "actual_cpa" in data
        assert "target_met" in data
        assert "variance_percentage" in data
        
        assert data["target_roi"] == 15.0
        assert data["target_cpa"] == 55.0
        assert isinstance(data["target_met"], bool)
    
    def test_get_campaigns_roi_summary(self, client, setup_database):
        """Test getting ROI summary for multiple campaigns"""
        response = client.get("/api/roi/campaigns/summary", params={
            "campaign_ids": ["campaign_123"],
            "days": 30
        })
        
        print(f"Response status: {response.status_code}")
        print(f"Response content: {response.content}")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, dict)
        assert "campaign_123" in data
        
        campaign_data = data["campaign_123"]
        assert "campaign_id" in campaign_data
        assert "total_spend" in campaign_data
        assert "total_revenue" in campaign_data
        assert "roi_percentage" in campaign_data
    
    def test_get_brand_portfolio_roi(self, client, setup_database):
        """Test getting brand portfolio ROI"""
        response = client.get("/api/roi/portfolio/brand_123?days=30&include_top_campaigns=5")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "brand_id" in data
        assert "portfolio_metrics" in data
        assert "campaign_count" in data
        assert "top_performing_campaigns" in data
        
        assert data["brand_id"] == "brand_123"
        assert isinstance(data["campaign_count"], int)
        assert isinstance(data["top_performing_campaigns"], list)
        
        portfolio_metrics = data["portfolio_metrics"]
        assert "total_spend" in portfolio_metrics
        assert "total_revenue" in portfolio_metrics
        assert "roi_percentage" in portfolio_metrics
    
    def test_get_roi_benchmarks(self, client, setup_database):
        """Test getting ROI benchmarks"""
        response = client.get("/api/roi/benchmarks")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "all_benchmarks" in data
        benchmarks = data["all_benchmarks"]
        
        assert "general" in benchmarks
        assert "by_industry" in benchmarks
        assert "by_platform" in benchmarks
        
        general = benchmarks["general"]
        assert "average_roi" in general
        assert "good_roi" in general
        assert "excellent_roi" in general
        assert "average_cpa" in general
        assert "average_ctr" in general
        assert "average_engagement_rate" in general
    
    def test_get_roi_benchmarks_by_industry(self, client, setup_database):
        """Test getting ROI benchmarks filtered by industry"""
        response = client.get("/api/roi/benchmarks?industry=fashion")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "industry" in data
        assert "benchmarks" in data
        assert "general_benchmarks" in data
        
        assert data["industry"] == "fashion"
        benchmarks = data["benchmarks"]
        assert "average_roi" in benchmarks
        assert "average_cpa" in benchmarks
    
    def test_get_roi_benchmarks_by_platform(self, client, setup_database):
        """Test getting ROI benchmarks filtered by platform"""
        response = client.get("/api/roi/benchmarks?platform=instagram")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "platform" in data
        assert "benchmarks" in data
        assert "general_benchmarks" in data
        
        assert data["platform"] == "instagram"
        benchmarks = data["benchmarks"]
        assert "average_roi" in benchmarks
        assert "average_cpa" in benchmarks
    
    def test_campaign_not_found(self, client, setup_database):
        """Test handling of non-existent campaign"""
        response = client.get("/api/roi/campaigns/nonexistent_campaign")
        
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
    
    def test_invalid_period_type(self, client, setup_database):
        """Test handling of invalid period type in trends"""
        response = client.get("/api/roi/campaigns/campaign_123/trends?period_type=invalid")
        
        assert response.status_code == 422  # Validation error
    
    def test_invalid_days_parameter(self, client, setup_database):
        """Test handling of invalid days parameter"""
        response = client.get("/api/roi/campaigns/campaign_123?days=0")
        
        assert response.status_code == 422  # Validation error
        
        response = client.get("/api/roi/campaigns/campaign_123?days=400")
        
        assert response.status_code == 422  # Validation error


if __name__ == "__main__":
    pytest.main([__file__, "-v"])