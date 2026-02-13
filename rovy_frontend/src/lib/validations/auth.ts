import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  inviteCode: z.string().min(1, "Invite code is required"),
});

export const onboardingSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  name: z.string().min(1, "Name is required"),
  age: z.string().min(1, "Age is required").regex(/^\d+$/, "Age must be a number"),
  gender: z.string().min(1, "Gender is required"),
  vehicleType: z.string().min(1, "Vehicle type is required"),
  buildStatus: z.string().min(1, "Build status is required"),
  selfie: z.string().nullable().optional(),
  rigPhoto: z.string().nullable().optional(),
  enableCoPilot: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type OnboardingFormData = z.infer<typeof onboardingSchema>;
