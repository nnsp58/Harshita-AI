import requests

BASE_URL = "http://localhost:3001"
LOGIN_ENDPOINT = "/api/auth/login"
COMMAND_ENDPOINT = "/api/command"
TIMEOUT = 30

def test_post_api_command_with_valid_and_invalid_commands():
    # Authenticate and get JWT token
    login_payload = {"email": "demo@harshita.ai", "password": "demo123"}
    try:
        login_response = requests.post(BASE_URL + LOGIN_ENDPOINT, json=login_payload, timeout=TIMEOUT)
        assert login_response.status_code == 200, f"Login failed with status {login_response.status_code}"
        login_data = login_response.json()
        assert login_data.get("success") is True, "Login success flag not true"
        token = login_data.get("token")
        assert isinstance(token, str) and len(token) > 0, "Token missing in login response"
    except Exception as e:
        raise AssertionError(f"Authentication failed: {e}")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    userId = "test-user-123"

    # Test cases: valid multilingual commands with expected skill
    valid_commands = [
        ("सर मुझे एसएससी का फॉर्म भरना है", "form_fill"),
        ("mujhe ek shayari sunao acchi wali", "notepad"),
        ("please help me with job search", "job_search"),
        ("generate my resume", "resume_maker")
    ]

    for cmd, expected_skill in valid_commands:
        payload = {"userId": userId, "cmd": cmd}
        try:
            resp = requests.post(BASE_URL + COMMAND_ENDPOINT, headers=headers, json=payload, timeout=TIMEOUT)
            assert resp.status_code == 200, f"Valid command '{cmd}' returned status {resp.status_code}"
            data = resp.json()
            assert "skill" in data, f"'skill' missing in response for command '{cmd}'"
            assert data["skill"] == expected_skill, f"Expected skill '{expected_skill}', got '{data['skill']}'"
            assert "message" in data and isinstance(data["message"], str) and len(data["message"]) > 0, \
                f"Confirmation message missing or empty for command '{cmd}'"
        except Exception as e:
            raise AssertionError(f"Valid command test failed for '{cmd}': {e}")

    # Test cases: invalid commands (empty cmd or unsupported text)
    invalid_commands = [
        "",
        "   ",
        "unsupported command xyz123",
        "????",
        None
    ]

    for cmd in invalid_commands:
        payload = {"userId": userId, "cmd": cmd if cmd is not None else ""}
        try:
            resp = requests.post(BASE_URL + COMMAND_ENDPOINT, headers=headers, json=payload, timeout=TIMEOUT)
            # According to PRD, expected error for empty or unsupported cmd is 400
            assert resp.status_code == 400, f"Invalid command '{cmd}' returned status {resp.status_code} instead of 400"
            # Optionally check error message presence
            if resp.headers.get("Content-Type", "").startswith("application/json"):
                data = resp.json()
                assert isinstance(data, dict), "Error response json is not an object"
        except Exception as e:
            raise AssertionError(f"Invalid command test failed for '{cmd}': {e}")

    # Test unauthorized access (no token)
    try:
        payload = {"userId": userId, "cmd": "सर मुझे एसएससी का फॉर्म भरना है"}
        resp = requests.post(BASE_URL + COMMAND_ENDPOINT, json=payload, timeout=TIMEOUT)
        assert resp.status_code == 401, f"Unauthorized call returned {resp.status_code} instead of 401"
    except Exception as e:
        raise AssertionError(f"Unauthorized access test failed: {e}")

test_post_api_command_with_valid_and_invalid_commands()
