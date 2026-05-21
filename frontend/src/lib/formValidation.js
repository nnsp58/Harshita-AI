import { z } from 'zod';

// Personal Info Validation
export const personalInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[\+]?[1-9\-\s\(\)]*$/, 'Invalid phone number').or(z.literal('')),
  location: z.string().max(200).or(z.literal('')),
  linkedin: z.string().url('Invalid URL').or(z.literal('')),
  portfolio: z.string().url('Invalid URL').or(z.literal('')),
  photo: z.string().optional(),
});

// Summary Validation
export const summarySchema = z.object({
  text: z.string().min(20, 'Summary should be at least 20 characters').max(1000, 'Summary should not exceed 1000 characters'),
});

// Skill Validation
export const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  level: z.enum(['beginner', 'intermediate', 'expert']).optional(),
});

// Experience Validation
export const experienceSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Job title is required'),
  duration: z.string().min(1, 'Duration is required'),
  description: z.array(z.string().min(1, 'Bullet point cannot be empty')).min(1, 'At least one bullet point is required'),
});

// Education Validation
export const educationSchema = z.object({
  institution: z.string().min(1, 'Institution name is required'),
  degree: z.string().min(1, 'Degree is required'),
  field: z.string().min(1, 'Field of study is required'),
  year: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
  grade: z.string().optional(),
});

// Project Validation
export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.array(z.string().min(1, 'Description cannot be empty')).min(1),
  technologies: z.array(z.string()).min(1, 'At least one technology is required'),
});

// Certification Validation
export const certificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required'),
  issuer: z.string().min(1, 'Issuer is required'),
  year: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
});

// Language Validation
export const languageSchema = z.object({
  name: z.string().min(1, 'Language name is required'),
  proficiency: z.string().min(1, 'Proficiency level is required'),
});

// Helper to validate an array of items
export const validateArray = (schema) =>
  z.array(schema).min(1, 'At least one item is required');
