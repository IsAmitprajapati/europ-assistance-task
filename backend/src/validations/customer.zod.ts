import { z } from "zod";

// Location schema
const locationSchema = z.object({
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});

// Create Customer schema
export const createCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  age: z.number().int().nonnegative().optional(),
  location: locationSchema.optional(),
  segmentIds: z.array(z.string()).optional(), // array of Segment ObjectId strings
  tags: z.array(z.string()).optional(),
  status: z.enum(["Active", "Inactive"]).optional(),
  total_policies: z.number().int().nonnegative().optional(),
  lifetime_value: z.number().nonnegative().optional(),
  engagement_score: z.number().min(0).max(100).optional(),
  lifecycle_stage: z.enum(["Prospect", "Active", "At-Risk", "Churned"]).optional(),
  last_interaction: z.string().datetime().optional(), // ISO date string
  claim_count: z.number().int().nonnegative().optional(),
  payment_behavior: z.enum(["On-time", "Delayed"]).optional(),
  created_by: z.string().optional(),
});
