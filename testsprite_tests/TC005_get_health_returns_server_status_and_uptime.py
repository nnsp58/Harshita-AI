import requests

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_get_health_returns_server_status_and_uptime():
    url = f"{BASE_URL}/health"
    try:
        response = requests.get(url, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
        data = response.json()

        assert "status" in data and isinstance(data["status"], str) and data["status"], "Missing or invalid 'status'"
        assert "timestamp" in data and isinstance(data["timestamp"], str) and data["timestamp"], "Missing or invalid 'timestamp'"
        assert "uptime" in data and (isinstance(data["uptime"], int) or isinstance(data["uptime"], float)), "Missing or invalid 'uptime'"
        assert data["uptime"] >= 0, "Uptime should be non-negative"
    except requests.RequestException as e:
        assert False, f"Request to /health endpoint failed: {e}"
    except ValueError:
        assert False, "Response is not valid JSON"

test_get_health_returns_server_status_and_uptime()
