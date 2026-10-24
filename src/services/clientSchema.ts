import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional()
    .default(null);

export const newClientSchema = z.object({
  name: z.string().trim().min(1, "Client name is required").max(120),
  industry: optionalText(80),
  city: optionalText(80),
});

export type NewClient = z.infer<typeof newClientSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});
