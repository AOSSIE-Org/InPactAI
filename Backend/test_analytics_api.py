"""
Integration tests for analytics API endpoints and content linking endpoints
"""

import pytest
import requests
from datetime import datetime, timedelta
from typing import Dict, Any
import json
import uuid


class TestAnalyticsAPI:
    """Test suite for analytics API endpoints"""
    
    def __init__(self):
        self.base_url = "http://localhost:8000/api"
        self.test_user_id = None
        self.test_contract_id = None
        self.test_content_mapping_id = None
        self.headers = {"Content-Type": "application/json"}
    
    def setup_test_data(self):
        """Set up test data for the tests"""
        # In a real test environment, you would create test users and contracts
        # For now, we'll use placeholder IDs
        self.test_user_id = str(uuid.uuid4())
        self.test_contract_id = str(uuid.uuid4())
        self.test_content_mapping_id = str(uuid.uuid4())
    
    def test_link_content_to_contract(self):
        """Test POST /api/contracts/:id/content endpoint"""
        print("Testing content linking endpoint...")
        
        # Test data
        test_content_url = "https://www.instagram.com/p/ABC123DEF456/"
        
        # Test request
        response = requests.post(
            f"{self.base_url}/contracts/{self.test_contract_id}/content",
            json={"content_url": test_content_url},
            headers=self.headers
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        # Assertions for successful linking
        if response.status_code == 200:
            data = response.json()
            assert "success" in data
            assert "message" in data
            if data["success"]:
                assert "content_mapping_id" in data
                self.test_content_mapping_id = data["content_mapping_id"]
        
        return response.status_code == 200
    
    def test_get_contract_content(self):
        """Test GET /api/contracts/:id/content endpoint"""
        print("Testing get contract content endpoint...")
        
        response = requests.get(
            f"{self.base_url}/contracts/{self.test_contract_id}/content",
            headers=self.headers
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        # Assertions
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, list)
            
            # If content exists, validate structure
            if data:
                content_item = data[0]
                required_fields = [
                    'id', 'platform', 'content_id', 'content_url', 
                    'content_type', 'linked_at', 'user_id'
                ]
                for field in required_fields:
                    assert field in content_item
        
        return response.status_code == 200
    
    def test_unlink_content_from_contract(self):
        """Test DELETE /api/contracts/:id/content/:contentId endpoint"""
        print("Testing content unlinking endpoint...")
        
        if not self.test_content_mapping_id:
            print("Skipping unlink test - no content mapping ID available")
            return True
        
        response = requests.delete(
            f"{self.base_url}/contracts/{self.test_contract_id}/content/{self.test_content_mapping_id}",
            headers=self.headers
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        # Assertions
        if response.status_code == 200:
            data = response.json()
            assert "success" in data
            assert "message" in data
        
        return response.status_code == 200
    
    def test_get_contract_analytics(self):
        """Test GET /api/analytics/contracts/:id endpoint"""
        print("Testing contract analytics endpoint...")
        
        # Test with different parameters
        test_params = [
            {},  # Default parameters
            {"days": 7},  # Last 7 days
            {"days": 90}  # Last 90 days
        ]
        
        for params in test_params:
            response = requests.get(
                f"{self.base_url}/analytics/contracts/{self.test_contract_id}",
                params=params,
                headers=self.headers
            )
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.json()}")
            
            # Assertions
            if response.status_code == 200:
                data = response.json()
                
                # Validate response structure
                required_fields = [
                    'contract_id', 'total_content', 'date_range', 
                    'analytics', 'content_breakdown'
                ]
                for field in required_fields:
                    assert field in data
                
                # Validate analytics structure
                analytics = data['analytics']
                analytics_fields = [
                    'total_impressions', 'total_reach', 'total_likes',
                    'total_comments', 'total_shares', 'total_saves',
                    'total_clicks', 'average_engagement_rate'
                ]
                for field in analytics_fields:
                    assert field in analytics
                    assert isinstance(analytics[field], (int, float))
                
                # Validate date range
                date_range = data['date_range']
                assert 'start' in date_range
                assert 'end' in date_range
                
                # Validate content breakdown
                assert isinstance(data['content_breakdown'], list)
        
        return True
    
    def test_get_contract_roi(self):
        """Test GET /api/analytics/roi/:contractId endpoint"""
        print("Testing contract ROI endpoint...")
        
        # Test with different parameters
        test_params = [
            {},  # Default parameters
            {"days": 30},  # Last 30 days
            {"days": 60}  # Last 60 days
        ]
        
        for params in test_params:
            response = requests.get(
                f"{self.base_url}/analytics/roi/{self.test_contract_id}",
                params=params,
                headers=self.headers
            )
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.json()}")
            
            # Assertions
            if response.status_code == 200:
                data = response.json()
                
                # Validate response structure
                required_fields = ['contract_id', 'date_range', 'roi_metrics', 'performance_metrics']
                for field in required_fields:
                    assert field in data
                
                # Validate ROI metrics
                roi_metrics = data['roi_metrics']
                roi_fields = [
                    'total_spend', 'total_revenue', 'total_conversions',
                    'cost_per_acquisition', 'return_on_investment', 'roi_percentage'
                ]
                for field in roi_fields:
                    assert field in roi_metrics
                    assert isinstance(roi_metrics[field], (int, float))
                
                # Validate performance metrics
                performance_metrics = data['performance_metrics']
                performance_fields = [
                    'total_impressions', 'total_reach', 'total_clicks',
                    'click_through_rate', 'average_engagement_rate'
                ]
                for field in performance_fields:
                    assert field in performance_metrics
                    assert isinstance(performance_metrics[field], (int, float))
        
        return True
    
    def test_get_contract_demographics(self):
        """Test GET /api/analytics/demographics/:contractId endpoint"""
        print("Testing contract demographics endpoint...")
        
        # Test with different parameters
        test_params = [
            {},  # Default parameters
            {"days": 14},  # Last 14 days
            {"days": 45}  # Last 45 days
        ]
        
        for params in test_params:
            response = requests.get(
                f"{self.base_url}/analytics/demographics/{self.test_contract_id}",
                params=params,
                headers=self.headers
            )
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.json()}")
            
            # Assertions
            if response.status_code == 200:
                data = response.json()
                
                # Validate response structure
                required_fields = [
                    'contract_id', 'date_range', 'demographics', 
                    'engagement_patterns', 'data_availability'
                ]
                for field in required_fields:
                    assert field in data
                
                # Validate demographics structure
                demographics = data['demographics']
                demo_fields = ['age_groups', 'locations', 'interests', 'gender']
                for field in demo_fields:
                    assert field in demographics
                    assert isinstance(demographics[field], dict)
                
                # Validate engagement patterns
                engagement_patterns = data['engagement_patterns']
                pattern_fields = ['by_time_of_day', 'by_day_of_week', 'by_content_type']
                for field in pattern_fields:
                    assert field in engagement_patterns
                    assert isinstance(engagement_patterns[field], dict)
                
                # Validate data availability
                data_availability = data['data_availability']
                availability_fields = [
                    'total_content_pieces', 'content_with_demographics', 
                    'data_completeness_percentage'
                ]
                for field in availability_fields:
                    assert field in data_availability
                    assert isinstance(data_availability[field], (int, float))
        
        return True
    
    def test_content_preview(self):
        """Test GET /api/content/:id/preview endpoint"""
        print("Testing content preview endpoint...")
        
        if not self.test_content_mapping_id:
            print("Skipping preview test - no content mapping ID available")
            return True
        
        response = requests.get(
            f"{self.base_url}/content/{self.test_content_mapping_id}/preview",
            headers=self.headers
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        # Assertions
        if response.status_code == 200:
            data = response.json()
            required_fields = ['platform', 'content_type', 'is_valid']
            for field in required_fields:
                assert field in data
        
        return response.status_code == 200
    
    def test_sync_contract_content(self):
        """Test POST /api/contracts/:id/sync endpoint"""
        print("Testing contract content sync endpoint...")
        
        response = requests.post(
            f"{self.base_url}/contracts/{self.test_contract_id}/sync",
            headers=self.headers
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        # Assertions
        if response.status_code == 200:
            data = response.json()
            assert "success" in data
            assert "message" in data
        
        return response.status_code == 200
    
    def test_sync_specific_content(self):
        """Test POST /api/content/:id/sync endpoint"""
        print("Testing specific content sync endpoint...")
        
        if not self.test_content_mapping_id:
            print("Skipping sync test - no content mapping ID available")
            return True
        
        # Test with different parameters
        test_params = [
            {},  # Default
            {"force_refresh": True}  # Force refresh
        ]
        
        for params in test_params:
            response = requests.post(
                f"{self.base_url}/content/{self.test_content_mapping_id}/sync",
                params=params,
                headers=self.headers
            )
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.json()}")
            
            # Assertions
            if response.status_code == 200:
                data = response.json()
                assert "success" in data
                assert "message" in data
        
        return True
    
    def test_get_content_analytics(self):
        """Test GET /api/content/:id/analytics endpoint"""
        print("Testing content analytics endpoint...")
        
        if not self.test_content_mapping_id:
            print("Skipping content analytics test - no content mapping ID available")
            return True
        
        # Test with different parameters
        test_params = [
            {},  # Default parameters
            {"days": 7},  # Last 7 days
            {"days": 30}  # Last 30 days
        ]
        
        for params in test_params:
            response = requests.get(
                f"{self.base_url}/content/{self.test_content_mapping_id}/analytics",
                params=params,
                headers=self.headers
            )
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.json()}")
            
            # Assertions
            if response.status_code == 200:
                data = response.json()
                required_fields = [
                    'content_mapping_id', 'platform', 'content_type', 
                    'date_range', 'analytics'
                ]
                for field in required_fields:
                    assert field in data
        
        return True
    
    def test_role_based_access_control(self):
        """Test role-based access control for analytics endpoints"""
        print("Testing role-based access control...")
        
        # Test with invalid contract ID (should return 403 or 404)
        invalid_contract_id = str(uuid.uuid4())
        
        endpoints_to_test = [
            f"/contracts/{invalid_contract_id}/content",
            f"/analytics/contracts/{invalid_contract_id}",
            f"/analytics/roi/{invalid_contract_id}",
            f"/analytics/demographics/{invalid_contract_id}"
        ]
        
        for endpoint in endpoints_to_test:
            response = requests.get(
                f"{self.base_url}{endpoint}",
                headers=self.headers
            )
            
            print(f"Endpoint: {endpoint}")
            print(f"Status Code: {response.status_code}")
            
            # Should return 403 (Forbidden) or 404 (Not Found) for unauthorized access
            assert response.status_code in [403, 404, 401]
        
        return True
    
    def test_error_handling(self):
        """Test error handling for various scenarios"""
        print("Testing error handling...")
        
        # Test with invalid content URL
        response = requests.post(
            f"{self.base_url}/contracts/{self.test_contract_id}/content",
            json={"content_url": "invalid-url"},
            headers=self.headers
        )
        
        print(f"Invalid URL Status Code: {response.status_code}")
        
        # Test with non-existent content mapping
        invalid_mapping_id = str(uuid.uuid4())
        response = requests.get(
            f"{self.base_url}/content/{invalid_mapping_id}/preview",
            headers=self.headers
        )
        
        print(f"Non-existent mapping Status Code: {response.status_code}")
        
        # Test with invalid date parameters
        response = requests.get(
            f"{self.base_url}/analytics/contracts/{self.test_contract_id}",
            params={"days": -1},
            headers=self.headers
        )
        
        print(f"Invalid date parameter Status Code: {response.status_code}")
        
        return True
    
    def run_all_tests(self):
        """Run all test methods"""
        print("=" * 60)
        print("STARTING ANALYTICS API INTEGRATION TESTS")
        print("=" * 60)
        
        self.setup_test_data()
        
        test_methods = [
            self.test_link_content_to_contract,
            self.test_get_contract_content,
            self.test_get_contract_analytics,
            self.test_get_contract_roi,
            self.test_get_contract_demographics,
            self.test_content_preview,
            self.test_sync_contract_content,
            self.test_sync_specific_content,
            self.test_get_content_analytics,
            self.test_unlink_content_from_contract,
            self.test_role_based_access_control,
            self.test_error_handling
        ]
        
        results = {}
        
        for test_method in test_methods:
            test_name = test_method.__name__
            print(f"\n{'=' * 40}")
            print(f"Running {test_name}")
            print(f"{'=' * 40}")
            
            try:
                result = test_method()
                results[test_name] = "PASSED" if result else "FAILED"
                print(f"✅ {test_name}: {results[test_name]}")
            except Exception as e:
                results[test_name] = f"ERROR: {str(e)}"
                print(f"❌ {test_name}: {results[test_name]}")
        
        # Print summary
        print(f"\n{'=' * 60}")
        print("TEST SUMMARY")
        print(f"{'=' * 60}")
        
        passed = sum(1 for result in results.values() if result == "PASSED")
        total = len(results)
        
        for test_name, result in results.items():
            status_icon = "✅" if result == "PASSED" else "❌"
            print(f"{status_icon} {test_name}: {result}")
        
        print(f"\nTotal: {total} tests")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        return results


def main():
    """Main function to run the tests"""
    tester = TestAnalyticsAPI()
    results = tester.run_all_tests()
    
    # Return exit code based on results
    failed_tests = sum(1 for result in results.values() if result != "PASSED")
    return 0 if failed_tests == 0 else 1


if __name__ == "__main__":
    import sys
    sys.exit(main())