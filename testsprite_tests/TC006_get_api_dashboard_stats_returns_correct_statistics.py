import requests

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_get_api_dashboard_stats_returns_correct_statistics():
    url = f"{BASE_URL}/api/dashboard/stats"
    try:
        response = requests.get(url, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to {url} failed with exception: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(data, dict), "Response JSON is not an object"

    # Validate required fields presence and types
    required_fields = {
        "totalTransactions": int,
        "activeOperators": int,
        "centerRevenue": (int, float)
    }

    for field, expected_type in required_fields.items():
        assert field in data, f"Field '{field}' missing in response"
        assert isinstance(data[field], expected_type), f"Field '{field}' is not of type {expected_type}"

test_get_api_dashboard_stats_returns_correct_statistics()
