import requests
import uuid

BASE_URL = "http://localhost:3001"
REGISTER_ENDPOINT = "/api/auth/register"
TIMEOUT = 30

def test_post_api_auth_register_with_valid_user_data():
    # Generate unique email to avoid conflicts
    unique_email = f"testuser_{uuid.uuid4().hex}@example.com"
    payload = {
        "email": unique_email,
        "password": "StrongPass123!",
        "name": "Test User"
    }
    url = BASE_URL + REGISTER_ENDPOINT

    response = requests.post(url, json=payload, timeout=TIMEOUT)
    assert response.status_code == 201, f"Expected status 201 but got {response.status_code}"
    json_response = response.json()
    assert json_response.get("success") is True, "Response 'success' field is not True"
    token = json_response.get("token")
    assert isinstance(token, str) and len(token) > 0, "JWT token is missing or empty in response"


test_post_api_auth_register_with_valid_user_data()
