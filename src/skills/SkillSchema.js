const { z } = require('zod');

// Schema for skill metadata validation
const SkillMetadataSchema = z.object({
  skillId: z.string().uuid().optional(),
  name: z.string().min(1),
  displayName: z.string().min(1),
  displayNameEn: z.string().optional(),
  category: z.string().min(1),
  description: z.string(),
  descriptionEn: z.string().optional(),
  intents: z.array(z.string()).min(1),
  keywords: z.object({
    hi: z.array(z.string()).optional(),
    en: z.array(z.string()).optional(),
    hinglish: z.array(z.string()).optional(),
  }),
  priority: z.number().min(1).max(10).default(5),
  confidenceThreshold: z.number().min(0).max(1).default(0.8),
  canRunOffline: z.boolean().default(false),
});

// Standard Output schema for all skills
const SkillOutputSchema = z.object({
  type: z.enum(['ai', 'error', 'data', 'action']),
  message: z.string(),
  data: z.any().optional(),
  action: z.any().optional(),
  skill: z.string(),
});

// Generic Input schema for skills that don't define a specific one
const GenericInputSchema = z.object({
  message: z.string().optional(),
  intent: z.string().optional(),
  params: z.record(z.any()).optional(),
});

module.exports = {
  SkillMetadataSchema,
  SkillOutputSchema,
  GenericInputSchema,
};
