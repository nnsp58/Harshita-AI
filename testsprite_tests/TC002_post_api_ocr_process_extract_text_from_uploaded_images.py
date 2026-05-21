import requests
from io import BytesIO

BASE_URL = "http://localhost:3001"
OCR_ENDPOINT = "/api/ocr/process"
DASHBOARD_URL = BASE_URL

# Assume we have a valid token for authenticated OCR requests
AUTH_TOKEN = "Bearer valid-authentication-token"

HEADERS_AUTH = {
    "Authorization": AUTH_TOKEN,
}

HEADERS_NO_AUTH = {}

FILES_DIR = "./test_files/"  # Directory where test images are placed

def test_post_api_ocr_process_extract_text_from_uploaded_images():
    timeout = 30

    # Step 1: Verify the dashboard title 'Harshita AI Ultimate Command Center' is present.
    try:
        resp_dashboard = requests.get(DASHBOARD_URL, timeout=timeout)
        resp_dashboard.raise_for_status()
        assert "Harshita AI Ultimate Command Center" in resp_dashboard.text, "Dashboard title not found"
    except Exception as e:
        raise AssertionError(f"Dashboard check failed: {e}")

    # Step 2: Type 'Hello Harshita, who are you?' into command input and send POST /api/command
    command_payload = {
        "userId": "test_user_123",
        "cmd": "Hello Harshita, who are you?"
    }
    try:
        resp_command = requests.post(f"{BASE_URL}/api/command", json=command_payload, timeout=timeout)
        resp_command.raise_for_status()
        json_command = resp_command.json()
        # AI response should appear in message
        assert "message" in json_command and len(json_command["message"]) > 0, "AI response message missing"
    except Exception as e:
        raise AssertionError(f"Command processing failed: {e}")

    # Step 3: Check 'Virtual Notepad' section is visible and responsive via GET /api/command with query 'notepad' to check skill
    # Since no exact API to check UI component, we simulate by sending a known notepad command and check response
    try:
        resp_notepad = requests.post(f"{BASE_URL}/api/command",
                                     json={"userId": "test_user_123", "cmd": "open virtual notepad"},
                                     timeout=timeout)
        resp_notepad.raise_for_status()
        json_notepad = resp_notepad.json()
        # Check skill response is 'notepad'
        assert json_notepad.get("skill") == "notepad", "Virtual Notepad skill not activated"
    except Exception as e:
        raise AssertionError(f"Virtual Notepad responsiveness check failed: {e}")

    # Step 4: Test OCR endpoint with valid image
    # Using a small sample clean image file from disk or binary content for test
    try:
        with open(FILES_DIR + "clean_document.jpg", "rb") as f:
            files = {"image": ("clean_document.jpg", f, "image/jpeg")}
            resp_ocr = requests.post(f"{BASE_URL}{OCR_ENDPOINT}", headers=HEADERS_AUTH, files=files, timeout=timeout)
            resp_ocr.raise_for_status()
            json_ocr = resp_ocr.json()
            # Validate response is an object and contains some extracted text key or property
            assert isinstance(json_ocr, dict), "OCR response is not a JSON object"
            # Assuming 'extractedText' or similar present in response, else check non-empty keys
            has_text = any(v for k, v in json_ocr.items() if isinstance(v, str) and v.strip())
            assert has_text, "OCR extracted text is empty or missing"
    except FileNotFoundError:
        raise AssertionError("Test file clean_document.jpg not found in test_files directory")
    except Exception as e:
        raise AssertionError(f"OCR processing with valid image failed: {e}")

    # Step 5: Test OCR endpoint with corrupt/unreadable image
    try:
        corrupt_content = b"thisisnotarealimagefile"
        files = {"image": ("corrupt_image.jpg", BytesIO(corrupt_content), "image/jpeg")}
        resp_corrupt = requests.post(f"{BASE_URL}{OCR_ENDPOINT}", headers=HEADERS_AUTH, files=files, timeout=timeout)
        # Should raise error or return 4xx/5xx
        assert resp_corrupt.status_code >= 400, "OCR accepted corrupt image without error"
    except Exception as e:
        # If server responds with HTTP error code, this is expected, pass
        if isinstance(e, requests.exceptions.HTTPError):
            pass
        else:
            raise AssertionError(f"OCR processing corrupt image test raised unexpected exception: {e}")

    # Step 6: Test OCR endpoint with missing image file (no file in request)
    try:
        resp_missing = requests.post(f"{BASE_URL}{OCR_ENDPOINT}", headers=HEADERS_AUTH, files={}, timeout=timeout)
        # Should raise error or return 4xx
        assert resp_missing.status_code >= 400, "OCR accepted request with missing image without error"
    except Exception as e:
        # If server responds with HTTP error code, this is expected, pass
        if isinstance(e, requests.exceptions.HTTPError):
            pass
        else:
            raise AssertionError(f"OCR processing missing image test raised unexpected exception: {e}")


test_post_api_ocr_process_extract_text_from_uploaded_images()