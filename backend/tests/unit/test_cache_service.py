import pytest
import os
import shutil
import time
from backend.services.cache_service import ImageCacheService

@pytest.fixture
def cache_service(tmp_path):
    # Create a temporary cache service for each test
    temp_dir = tmp_path / "cache"
    service = ImageCacheService(cache_dir=str(temp_dir))
    return service

def test_get_cache_key_consistency(cache_service):
    """Test that cache key is consistent for same parameters"""
    key1 = cache_service.get_cache_key("a cat", steps=4)
    key2 = cache_service.get_cache_key("a cat", steps=4)
    key3 = cache_service.get_cache_key("a cat", steps=5)
    
    assert key1 == key2
    assert key1 != key3

def test_cache_miss(cache_service):
    """Test behavior when key is not in cache"""
    result = cache_service.get_cached_image("nonexistent_key")
    assert result is None

def test_save_and_retrieve(cache_service):
    """Test saving and retrieving an image"""
    key = "test_key"
    data = b"fake_image_data"
    
    # Save
    cache_service.save_to_cache(key, data, metadata={"prompt": "test"})
    
    # Retrieve
    retrieved = cache_service.get_cached_image(key)
    assert retrieved == data
    
    # Check metadata
    assert key in cache_service.metadata
    assert cache_service.metadata[key]["prompt"] == "test"

def test_metadata_persistence(tmp_path):
    """Test that metadata survives service restart"""
    temp_dir = tmp_path / "persistent_cache"
    
    # First instance
    service1 = ImageCacheService(cache_dir=str(temp_dir))
    service1.save_to_cache("key1", b"data1")
    
    # Second instance pointing to same dir
    service2 = ImageCacheService(cache_dir=str(temp_dir))
    assert "key1" in service2.metadata
    assert service2.get_cached_image("key1") == b"data1"

def test_clear_old_cache(cache_service):
    """Test clearing old cache entries"""
    # Save old entry
    cache_service.save_to_cache("old_key", b"old_data")
    # Manually modify timestamp to be old
    cache_service.metadata["old_key"]["created_at"] = time.time() - (8 * 24 * 60 * 60) # 8 days ago
    cache_service._save_metadata()
    
    # Save new entry
    cache_service.save_to_cache("new_key", b"new_data")
    
    # Clear cache older than 7 days
    cache_service.clear_old_cache(max_age_days=7)
    
    # Verify
    assert cache_service.get_cached_image("old_key") is None
    assert cache_service.get_cached_image("new_key") == b"new_data"
