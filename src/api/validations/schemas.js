// src/api/validations/schemas.js - Zod Validation Schemas

const { z } = require('zod');

const emailSchema = z.string().email();
const phoneSchema = z.string().regex(/^\d{10}$/);
const uuidSchema = z.string().uuid();
const aadhaarSchema = z.string().regex(/^\d{12}$/);
const pincodeSchema = z.string().regex(/^\d{6}$/);

const userRoles = ['operator', 'csc_admin', 'superadmin'];
const jobStatuses = ['pending', 'queued', 'running', 'completed', 'failed', 'cancelled'];
const serviceTypes = [
  'ssc',
  'army',
  'railway',
  'banking',
  'police',
  'defence',
  'postal',
  'apprenticeship',
  'stateSsc',
  'aadhaar_update',
  'pan_card',
  'passport',
  'ration_card',
  'land_record',
  'Scholarship',
  'pension',
  'driving_license',
  'voter_id',
  'birth_certificate',
  'income_certificate',
  'caste_certificate',
  'other'
];

const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(8),
  name: z.string().min(1).max(100),
  role: z.enum(userRoles).optional().default('operator')
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1)
});

const candidateSchema = z.object({
  name: z.string().min(1).max(100),
  father_name: z.string().min(1).max(100),
  mother_name: z.string().max(100).optional(),
  dob: z.string().datetime(),
  gender: z.enum(['male', 'female', 'other']),
  aadhaar_number: aadhaarSchema,
  mobile: phoneSchema,
  email: emailSchema.optional(),
  village: z.string().min(1).max(100),
  tehsil: z.string().min(1).max(100),
  district: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  pincode: pincodeSchema,
  category: z.enum(['general', 'obc', 'sc', 'st', 'other']).optional(),
  occupation: z.string().max(100).optional(),
  annual_income: z.number().min(0).optional()
});

const updateCandidateSchema = candidateSchema.partial();

const jobSchema = z.object({
  candidate_id: uuidSchema,
  service_type: z.enum(serviceTypes),
  form_url: z.string().url().optional().default('https://example.com/form'),
  priority: z.number().int().min(0).max(10).optional().default(0),
  notes: z.string().max(1000).optional()
});

const otpRequestSchema = z.object({
  job_id: uuidSchema,
  phone_number: phoneSchema
});

const otpVerifySchema = z.object({
  job_id: uuidSchema,
  otp: z.string().regex(/^\d{6}$/)
});

const captchaSolveSchema = z.object({
  job_id: uuidSchema,
  captcha_image: z.string()
});

const manualInputSchema = z.object({
  job_id: uuidSchema,
  field_name: z.string().min(1),
  field_value: z.string().min(1)
});

const approvalSchema = z.object({
  job_id: uuidSchema
});

const rejectionSchema = z.object({
  job_id: uuidSchema,
  reason: z.string().min(1).max(500)
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(jobStatuses).optional(),
  search: z.string().optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  candidateSchema,
  updateCandidateSchema,
  jobSchema,
  otpRequestSchema,
  otpVerifySchema,
  captchaSolveSchema,
  manualInputSchema,
  approvalSchema,
  rejectionSchema,
  paginationSchema,
  userRoles,
  jobStatuses,
  serviceTypes
};
