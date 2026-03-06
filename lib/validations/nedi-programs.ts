import { statusEnum } from "@/db/schema";
import { z } from "zod";

export const statusValues = [
  "Planned",
  "Ongoing",
  "Completed",
  "Operational",
] as const;
export const serviceTypes = [
  "Training",
  "Mentoring & Coaching",
  "Business Advisory",
  "Financial Assistance",
  "Study Tour",
  "Trade Fair Support",
  "Infrastructure",
  "Monitoring & Evaluation",
] as const;

export const nediProgramsSchema = z.object({
  programName: z.string().min(1, "Program name is required"),
  targetGroup: z.string().min(1, "Target group is required"),
  beneficiaries: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Beneficiaries must be a positive number",
    }),
  serviceType: z.string().min(1, "Service type is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(statusValues, {
    message: "Select a Status",
  }),
  location: z.string().min(1, "Location is required"),
  maleParticipants: z.string().optional(),
  femaleParticipants: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  implementingPartner: z.string().min(1, "Implementing partner is required"),
  fundingSource: z.string().min(1, "Funding source is required"),
});

export type NediProgramsFormValues = z.infer<typeof nediProgramsSchema>;
export type StatusEnumType = (typeof statusValues)[number];
