import requests

BASE_URL = "http://localhost:3001"
LOGIN_ENDPOINT = "/api/auth/login"
TIMEOUT = 30

def test_post_api_auth_login_with_valid_and_invalid_credentials():
    url = BASE_URL + LOGIN_ENDPOINT

    # Valid credentials test
    valid_payload = {
        "email": "demo@harshita.ai",
        "password": "demo123"
    }
    try:
        valid_response = requests.post(url, json=valid_payload, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed with exception: {e}"
    assert valid_response.status_code == 200, f"Expected 200 for valid login but got {valid_response.status_code}"
    valid_json = valid_response.json()
    assert "success" in valid_json and valid_json["success"] is True, "Login success flag missing or false in valid login"
    assert "token" in valid_json and isinstance(valid_json["token"], str) and len(valid_json["token"]) > 0, "JWT token missing or invalid in valid login"

    # Invalid credentials test (wrong password)
    invalid_payload = {
        "email": "demo@harshita.ai",
        "password": "wrongpassword"
    }
    try:
        invalid_response = requests.post(url, json=invalid_payload, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed with exception: {e}"
    assert invalid_response.status_code == 401, f"Expected 401 for invalid login but got {invalid_response.status_code}"

    # Invalid credentials test (wrong email)
    invalid_email_payload = {
        "email": "wrong@harshita.ai",
        "password": "demo123"
    }
    try:
        invalid_email_response = requests.post(url, json=invalid_email_payload, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed with exception: {e}"
    assert invalid_email_response.status_code == 401, f"Expected 401 for invalid login with wrong email but got {invalid_email_response.status_code}"

test_post_api_auth_login_with_valid_and_invalid_credentials()
