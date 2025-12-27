import pytest
import json
from app import app, job_queue, jobs_status

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    """Test the base health check endpoint."""
    rv = client.get('/')
    assert rv.status_code == 200
    json_data = rv.get_json()
    assert json_data['status'] == 'online'
    assert json_data['mode'] == 'free_oss'

def test_get_avatars(client):
    """Test fetching available avatars."""
    rv = client.get('/avatars')
    assert rv.status_code == 200
    json_data = rv.get_json()
    assert json_data['status'] == 'success'
    assert len(json_data['avatars']) > 0

def test_render_video_queued(client):
    """Test that a video render job is correctly queued."""
    payload = {
        "avatarId": "av-1",
        "script": "Hola mundo",
        "generateSubtitles": True
    }
    rv = client.post('/render-video', json=payload)
    assert rv.status_code == 200
    json_data = rv.get_json()
    assert json_data['status'] == 'success'
    assert 'job_id' in json_data
    
    # Verify job is in status tracker
    job_id = json_data['job_id']
    assert job_id in jobs_status
    assert jobs_status[job_id]['type'] == 'video'

def test_get_invalid_job(client):
    """Test behavior when requesting a non-existent job."""
    rv = client.get('/api/jobs/non_existent_id')
    assert rv.status_code == 404
    assert rv.get_json()['status'] == 'error'

def test_gpu_status(client):
    """Test GPU status report (might be offline in CI/Test env)."""
    rv = client.get('/gpu-status')
    assert rv.status_code == 200
    # We don't assert it's online because the test runner might not have a GPU
    assert 'status' in rv.get_json()
