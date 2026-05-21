import requests

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_post_api_pdf_process_ta_valid_and_missing_pdfpath():
    url = f"{BASE_URL}/api/pdf/process-ta"
    headers = {
        "Content-Type": "application/json"
    }

    # Test with valid pdfPath
    valid_payload = {
        "pdfPath": "sample.pdf"
    }
    try:
        response_valid = requests.post(url, json=valid_payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed for valid pdfPath: {e}"
    else:
        assert response_valid.status_code == 200, f"Expected 200, got {response_valid.status_code}"
        try:
            json_resp = response_valid.json()
        except ValueError:
            assert False, "Response is not valid JSON for valid pdfPath"
        assert isinstance(json_resp, dict), "Response JSON should be an object on success"

    # Test with missing pdfPath
    missing_payload = {}
    try:
        response_missing = requests.post(url, json=missing_payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed for missing pdfPath: {e}"
    else:
        assert response_missing.status_code == 400, f"Expected 400, got {response_missing.status_code}"

test_post_api_pdf_process_ta_valid_and_missing_pdfpath()
