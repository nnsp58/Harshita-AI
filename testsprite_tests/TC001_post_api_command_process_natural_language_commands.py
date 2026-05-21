import requests
import time

BASE_URL = "http://localhost:3001"
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def test_post_api_command_process_natural_language_commands():
    # Step 1: Verify the dashboard title 'Harshita AI Ultimate Command Center' is present.
    try:
        resp_dashboard = requests.get(BASE_URL, timeout=TIMEOUT)
        resp_dashboard.raise_for_status()
    except Exception as e:
        assert False, f"Failed to load dashboard page: {e}"
    else:
        assert "Harshita AI Ultimate Command Center" in resp_dashboard.text, "Dashboard title not found"

    # Helper to POST command and return response json
    def post_command(userId, cmd):
        payload = {"userId": userId, "cmd": cmd}
        resp = requests.post(f"{BASE_URL}/api/command", json=payload, headers=HEADERS, timeout=TIMEOUT)
        return resp

    user_id = "testuser"

    # Step 2 & 3: Type 'Hello Harshita, who are you?' and verify response is present
    try:
        resp = post_command(user_id, "Hello Harshita, who are you?")
        resp.raise_for_status()
    except Exception as e:
        assert False, f"POST /api/command failed with 'Hello' command: {e}"
    else:
        data = resp.json()
        # Because the PRD does not specify exact response for greeting,
        # just check required keys and non-empty message
        assert isinstance(data, dict), "Response is not a JSON object"
        assert "message" in data and isinstance(data["message"], str) and len(data["message"]) > 0, "Missing or empty message in response"
        assert "skill" in data and isinstance(data["skill"], str), "Missing skill in response"

    # Step 3 additional: check AI response appears - we confirmed response.message above suffices

    # Step 4: Check 'Virtual Notepad' section is visible and responsive
    # Since this is UI-specific but we have no UI API, simulate by sending a command that triggers 'notepad' skill
    try:
        resp_np = post_command(user_id, "mujhe ek shayari sunao acchi wali")
        resp_np.raise_for_status()
    except Exception as e:
        assert False, f"POST /api/command failed with notepad command: {e}"
    else:
        data_np = resp_np.json()
        assert data_np.get("skill") == "notepad", f"Expected skill 'notepad', got {data_np.get('skill')}"
        assert "message" in data_np and isinstance(data_np["message"], str) and len(data_np["message"]) > 0, "Missing or empty message in notepad response"

    # Additional multilingual command test for form_fill skill
    try:
        resp_form = post_command(user_id, "सर मुझे एसएससी का फॉर्म भरना है")
        resp_form.raise_for_status()
    except Exception as e:
        assert False, f"POST /api/command failed with Hindi form_fill command: {e}"
    else:
        data_form = resp_form.json()
        assert data_form.get("skill") == "form_fill", f"Expected skill 'form_fill', got {data_form.get('skill')}"
        assert "message" in data_form and isinstance(data_form["message"], str) and len(data_form["message"]) > 0, "Missing or empty message in form_fill response"

    # Test empty command - expect error response (likely not 200)
    resp_empty = post_command(user_id, "")
    if resp_empty.status_code == 200:
        data_empty = resp_empty.json()
        assert ("skill" not in data_empty or not data_empty["skill"]) and ("message" in data_empty and "could not be understood" in data_empty["message"].lower()), \
            "Empty command did not return expected error message"
    else:
        # Accept non-200 status code as expected error
        assert resp_empty.status_code >= 400, f"Expected error status for empty command, got {resp_empty.status_code}"

    # Test unsupported command returns error response
    unsupported_cmd = "blargh unsupported command text"
    resp_unsup = post_command(user_id, unsupported_cmd)
    if resp_unsup.status_code == 200:
        data_unsup = resp_unsup.json()
        skill = data_unsup.get("skill", "")
        message = data_unsup.get("message", "").lower()
        assert skill == "" or skill is None, f"Unsupported command returned skill '{skill}' unexpectedly"
        assert "could not be understood" in message or "no skill matched" in message, "Unsupported command did not return expected error message"
    else:
        # Accept error status code as success for this negative test
        assert resp_unsup.status_code >= 400, f"Expected error status for unsupported command, got {resp_unsup.status_code}"

test_post_api_command_process_natural_language_commands()