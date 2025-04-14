import pytest
from app.ai.data_preprocessor import (
    TextProcessor,
    MetricsNormalizer,
    VectorGenerator,
    CreatorDataPreprocessor
)

def test_text_processor():
    processor = TextProcessor()
    
    # Test text cleaning
    text = "Hello! This is a #test post with 😊 emojis!"
    cleaned = processor.clean_text(text)
    assert cleaned == "hello this is a #test post with 😊 emojis"
    
    # Test hashtag extraction
    hashtags = processor.extract_hashtags(text)
    assert hashtags == ["#test"]
    
    # Test emoji counting
    emoji_count = processor.count_emojis(text)
    assert emoji_count == 1
    
    # Test sentiment analysis
    sentiment = processor.get_sentiment("I love this amazing product!")
    assert sentiment > 0

def test_metrics_normalizer():
    normalizer = MetricsNormalizer()
    
    # Test follower normalization
    followers = 100000
    normalized = normalizer.normalize_followers(followers)
    assert 0 <= normalized <= 1
    
    # Test engagement normalization
    engagement = 5000
    followers = 100000
    normalized = normalizer.normalize_engagement(engagement, followers)
    assert 0 <= normalized <= 1
    
    # Test timestamp normalization
    timestamp = "2024-03-20T10:00:00Z"
    normalized = normalizer.normalize_timestamp(timestamp)
    assert 0 <= normalized <= 1

def test_vector_generator():
    generator = VectorGenerator()
    
    # Test profile vector generation
    processed_data = {
        'normalized_followers': 0.5,
        'normalized_engagement': 0.3,
        'sentiment_score': 0.2,
        'normalized_timestamp': 0.4,
        'categories': ['travel', 'lifestyle']
    }
    
    vector = generator.create_profile_vector(processed_data)
    assert len(vector) == 10  # 4 numerical features + 6 categorical features
    assert all(0 <= x <= 1 for x in vector)

def test_creator_data_preprocessor():
    preprocessor = CreatorDataPreprocessor()
    
    # Test profile processing
    profile_data = {
        'description': 'Travel blogger exploring the world! 🌍 #travel #adventure',
        'followers': 50000,
        'engagement': 2500,
        'created_at': '2024-03-20T10:00:00Z',
        'categories': ['travel', 'lifestyle']
    }
    
    processed = preprocessor.process_profile(profile_data)
    
    # Check processed data structure
    assert 'cleaned_description' in processed
    assert 'hashtags' in processed
    assert 'emoji_count' in processed
    assert 'sentiment_score' in processed
    assert 'normalized_followers' in processed
    assert 'normalized_engagement' in processed
    assert 'normalized_timestamp' in processed
    assert 'profile_vector' in processed
    
    # Test batch processing
    profiles = [profile_data, profile_data]
    batch_processed = preprocessor.batch_process_profiles(profiles)
    assert len(batch_processed) == 2
    assert all(isinstance(p, dict) for p in batch_processed)

def test_error_handling():
    preprocessor = CreatorDataPreprocessor()
    
    # Test with invalid data
    with pytest.raises(Exception):
        preprocessor.process_profile(None)
    
    # Test with missing data
    profile_data = {}
    processed = preprocessor.process_profile(profile_data)
    assert isinstance(processed, dict)
    assert 'profile_vector' in processed 