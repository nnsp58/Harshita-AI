# CSC Automation API Documentation

## Overview

REST API for the CSC (Common Service Center) Automation System. Provides endpoints for managing candidates, jobs, documents, and reviews with real-time updates via Socket.IO.

## Base URL

```
http://localhost:3000/api
```

## Response Format

All responses follow this structure:

```json
{
  "success": boolean,
  "data": any,
  "error": string,
  "message": string
}
```

## Authentication

### Register User

**POST** `/auth/register`

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "vle"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "name": "...", "role": "vle" },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Login

**POST** `/auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Get Current User

**GET** `/auth/me`

Requires: `Authorization: Bearer <token>`

### Refresh Token

**POST** `/auth/refresh`

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Logout

**POST** `/auth/logout`

Requires: `Authorization: Bearer <token>`

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## Candidates

### Upload Candidate with Documents

**POST** `/candidate/upload`

Requires: `Authorization: Bearer <token>`

Content-Type: `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Full name |
| father_name | string | Yes | Father's name |
| mother_name | string | No | Mother's name |
| dob | string (ISO8601) | Yes | Date of birth |
| gender | string | Yes | male/female/other |
| aadhaar_number | string (12 digits) | Yes | Aadhaar number |
| mobile | string (10 digits) | Yes | Mobile number |
| email | string | No | Email address |
| village | string | Yes | Village name |
| tehsil | string | Yes | Tehsil name |
| district | string | Yes | District name |
| state | string | Yes | State name |
| pincode | string (6 digits) | Yes | Pincode |
| category | string | No | general/obc/sc/st/other |
| occupation | string | No | Occupation |
| annual_income | number | No | Annual income |
| photo | file | No | Photo |
| aadhaar_front | file | No | Aadhaar front |
| aadhaar_back | file | No | Aadhaar back |
| marksheet | file | No | Marksheet |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "...",
    "aadhaar_number": "...",
    "mobile": "...",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Candidate

**GET** `/candidate/:id`

Requires: `Authorization: Bearer <token>`

### List Candidates

**GET** `/candidate?page=1&limit=20&search=`

Requires: `Authorization: Bearer <token>`

Query Parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search by name/aadhaar/mobile

### Update Candidate

**PUT** `/candidate/:id`

Requires: `Authorization: Bearer <token>`

### Delete Candidate

**DELETE** `/candidate/:id`

Requires: `Authorization: Bearer <token>` + Admin role

### Upload Additional Documents

**POST** `/candidate/:id/documents`

Requires: `Authorization: Bearer <token>`

Content-Type: `multipart/form-data`

---

## Jobs

### Create Job

**POST** `/job`

Requires: `Authorization: Bearer <token>`

```json
{
  "candidate_id": "uuid",
  "service_type": "aadhaar_update",
  "form_url": "https://example.com/form",
  "priority": 5,
  "notes": "Optional notes"
}
```

Service Types:
- `aadhaar_update`
- `pan_card`
- `passport`
- `ration_card`
- `land_record`
- `scholarship`
- `pension`
- `driving_license`
- `voter_id`
- `birth_certificate`
- `income_certificate`
- `caste_certificate`
- `other`

### Get Job

**GET** `/job/:id`

Requires: `Authorization: Bearer <token>`

### List Jobs

**GET** `/job?page=1&limit=20&status=pending&search=`

Requires: `Authorization: Bearer <token>`

Query Parameters:
- `page` - Page number
- `limit` - Items per page
- `status` - Filter by status (pending/queued/running/completed/failed/cancelled)
- `search` - Search by candidate name or aadhaar

### Start Job

**POST** `/job/:id/start`

Requires: `Authorization: Bearer <token>`

### Retry Job

**POST** `/job/:id/retry`

Requires: `Authorization: Bearer <token>`

### Cancel Job

**POST** `/job/:id/cancel`

Requires: `Authorization: Bearer <token>`

### Delete Job

**DELETE** `/job/:id`

Requires: `Authorization: Bearer <token>` + Admin role

### Get Job Stats

**GET** `/job/stats/overview`

Requires: `Authorization: Bearer <token>`

---

## Documents

### Upload Document

**POST** `/document/upload`

Requires: `Authorization: Bearer <token>`

Content-Type: `multipart/form-data`

| Field | Type | Required |
|-------|------|----------|
| document | file | Yes |
| document_type | string | No |
| candidate_id | uuid | No |
| job_id | uuid | No |

### Get Document

**GET** `/document/:id`

Requires: `Authorization: Bearer <token>`

### Get Documents by Candidate

**GET** `/document/candidate/:candidate_id`

Requires: `Authorization: Bearer <token>`

### Process Document (OCR/AI)

**POST** `/document/:id/process`

Requires: `Authorization: Bearer <token>`

### Delete Document

**DELETE** `/document/:id`

Requires: `Authorization: Bearer <token>`

---

## Reviews (OTP/CAPTCHA)

### Request OTP

**POST** `/review/otp/request`

Requires: `Authorization: Bearer <token>`

```json
{
  "job_id": "uuid",
  "phone_number": "9876543210"
}
```

### Verify OTP

**POST** `/review/otp/verify`

Requires: `Authorization: Bearer <token>`

```json
{
  "job_id": "uuid",
  "otp": "123456"
}
```

### Solve CAPTCHA

**POST** `/review/captcha/solve`

Requires: `Authorization: Bearer <token>`

```json
{
  "job_id": "uuid",
  "captcha_image": "base64..."
}
```

### Submit Manual Input

**POST** `/review/manual`

Requires: `Authorization: Bearer <token>`

```json
{
  "job_id": "uuid",
  "field_name": "aadhaar_number",
  "field_value": "123456789012"
}
```

### Approve Job

**POST** `/review/:job_id/approve`

Requires: `Authorization: Bearer <token>`

### Reject Job

**POST** `/review/:job_id/reject`

Requires: `Authorization: Bearer <token>`

```json
{
  "reason": "Invalid data provided"
}
```

### Get Pending Items

**GET** `/review/:job_id/pending`

Requires: `Authorization: Bearer <token>`

---

## Downloads

### Download Job Files

**GET** `/download/job/:job_id`

Requires: `Authorization: Bearer <token>`

Returns: ZIP archive

### Download Candidate Files

**GET** `/download/candidate/:candidate_id`

Requires: `Authorization: Bearer <token>`

Returns: ZIP archive

### Download Document

**GET** `/download/document/:document_id`

Requires: `Authorization: Bearer <token>`

Returns: File download

### Download Processed Form

**GET** `/download/processed/:job_id`

Requires: `Authorization: Bearer <token>`

Returns: PDF file

---

## WebSocket Events (Socket.IO)

### Connection

Connect with auth token:
```javascript
const io = socket('http://localhost:3000', {
  auth: { token: 'Bearer <token>' }
});
```

### Events Emitted

- `job_update` - Job status change
- `job_progress` - Job progress updates
- `notification` - User notifications
- `candidate_created` - New candidate created
- `otp_sent` - OTP sent
- `otp_verified` - OTP verified
- `captcha_required` - CAPTCHA needs solving
- `manual_input_received` - Manual input received

### Subscribe to Job

```javascript
socket.emit('subscribe_job', jobId);
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate entry |
| 500 | Internal Server Error |

---

## Setup Instructions

1. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

2. **Generate Prisma Client:**
   ```bash
   npm run db:generate
   ```

3. **Push Database Schema:**
   ```bash
   npm run db:push
   ```

4. **Start Server:**
   ```bash
   npm run dev
   ```

5. **Open Prisma Studio (optional):**
   ```bash
   npm run db:studio
   ```

---

## File Structure

```
src/api/
├── server.js           # Express app setup
├── routes/             # API routes
├── controllers/        # Business logic
├── middleware/        # Auth, validation, upload
├── validations/       # Zod schemas
└── utils/             # Helper functions
```

---

## Notes

- All file uploads are stored in `uploads/` directory
- JWT tokens expire in 24 hours
- Refresh tokens expire in 7 days
- Rate limiting: 100 requests per 15 minutes