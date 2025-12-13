import { z } from "zod";

// Step 1 Schema
export const step1Schema = z.object({
  brandName: z.string().min(1, "Brand name is required"),
  campaignType: z.string().min(1, "Campaign type is required"),
  platform: z.string().min(1, "Platform is required"),
});

// Step 2 Schema
export const step2Schema = z.object({
  budgetRange: z
    .tuple([z.number(), z.number()])
    .refine((range) => range[0] < range[1], {
      message: "Minimum budget must be less than maximum budget",
    }),
  duration: z.string().min(1, "Duration is required"),
  deliverables: z
    .array(z.string())
    .min(1, "Please select at least one deliverable"),
});

// Step 3 Schema
export const step3Schema = z.object({
  message: z
    .string()
    .min(50, "Proposal message must be at least 50 characters")
    .max(2000, "Proposal message must not exceed 2000 characters"),
  attachments: z.array(z.instanceof(File)).optional(),
  contactPreference: z.string().min(1, "Contact preference is required"),
});

// Complete Proposal Schema
export const proposalSchema = z.object({
  ...step1Schema.shape,
  ...step2Schema.shape,
  ...step3Schema.shape,
});

export type ProposalFormData = z.infer<typeof proposalSchema>;

// Helper to get schema for specific step
export function getStepSchema(step: number) {
  switch (step) {
    case 1:
      return step1Schema;
    case 2:
      return step2Schema;
    case 3:
      return step3Schema;
    default:
      return proposalSchema;
  }
}

// Helper to get field names for specific step
export function getStepFields(step: number): (keyof ProposalFormData)[] {
  switch (step) {
    case 1:
      return ["brandName", "campaignType", "platform"];
    case 2:
      return ["budgetRange", "duration", "deliverables"];
    case 3:
      return ["message", "contactPreference"];
    default:
      return [];
  }
}
