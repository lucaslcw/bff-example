import { z } from 'zod';

export const createUserSchema = z.object({
  email: z
    .email({ message: 'Invalid email format' })
    .min(1, { message: 'Email is required' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(100, { message: 'Password must not exceed 100 characters' }),
});

export type CreateUserInputZod = z.infer<typeof createUserSchema>;

export const authenticateUserSchema = z.object({
  email: z
    .email({ message: 'Invalid email format' })
    .min(1, { message: 'Email is required' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(100, { message: 'Password must not exceed 100 characters' }),
});

export type AuthenticateUserInputZod = z.infer<typeof authenticateUserSchema>;
