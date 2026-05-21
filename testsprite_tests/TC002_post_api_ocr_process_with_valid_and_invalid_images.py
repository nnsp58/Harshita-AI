import requests
import io

BASE_URL = "http://localhost:3001"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
OCR_PROCESS_URL = f"{BASE_URL}/api/ocr/process"
TIMEOUT = 30

def test_post_api_ocr_process_with_valid_and_invalid_images():
    # Authenticate and get JWT token
    auth_payload = {"email": "demo@harshita.ai", "password": "demo123"}
    auth_resp = requests.post(LOGIN_URL, json=auth_payload, timeout=TIMEOUT)
    assert auth_resp.status_code == 200, f"Login failed: {auth_resp.text}"
    auth_data = auth_resp.json()
    assert "token" in auth_data and auth_data.get("success") is True
    token = auth_data["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Helper function to post image to OCR endpoint
    def post_ocr(file_tuple):
        files = {"file": file_tuple} if file_tuple else {}
        try:
            resp = requests.post(OCR_PROCESS_URL, headers=headers, files=files, timeout=TIMEOUT)
            return resp
        except requests.RequestException as e:
            raise AssertionError(f"Request failed: {e}")

    # Test 1: Valid image file upload (simulate with a small PNG binary representing a valid image)
    valid_image_content = (
        b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01'
        b'\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00'
        b'\x00\x00\nIDAT\x08\xd7c```\x00\x00\x00\x05\x00\x01'
        b'\x0d\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
    )
    valid_image_file = ("valid.png", io.BytesIO(valid_image_content), "image/png")
    resp_valid = post_ocr(valid_image_file)
    assert resp_valid.status_code == 200, f"Expected 200 for valid image, got {resp_valid.status_code}"
    resp_json = resp_valid.json()
    assert isinstance(resp_json.get("success"), bool)
    assert resp_json.get("success") is True
    assert isinstance(resp_json.get("data"), dict)

    # Test 2: Corrupt image file upload (random bytes)
    corrupt_image_content = b"\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09"
    corrupt_image_file = ("corrupt.jpg", io.BytesIO(corrupt_image_content), "image/jpeg")
    resp_corrupt = post_ocr(corrupt_image_file)
    assert resp_corrupt.status_code != 200, "Expected failure status code for corrupt image"
    try:
        err_json = resp_corrupt.json()
        assert err_json.get("success") in (False, None) or resp_corrupt.status_code >= 400
    except Exception:
        # Acceptable if response is not JSON or unexpected format, error still confirmed by status code
        pass

    # Test 3: Missing image file (no file in request)
    resp_missing = post_ocr(None)
    assert resp_missing.status_code != 200, "Expected failure status code when no image file sent"
    try:
        err_json = resp_missing.json()
        assert err_json.get("success") in (False, None) or resp_missing.status_code >= 400
    except Exception:
        pass

test_post_api_ocr_process_with_valid_and_invalid_images()