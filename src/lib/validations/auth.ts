import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email address is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().min(1, 'Email address is required').email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Include at least one uppercase letter')
    .regex(/[0-9]/, 'Include at least one number'),
  confirm_password: z.string().min(1, 'Please confirm your password'),
  role: z.enum(['student', 'instructor', 'vendor']),
  agreed_to_terms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms to continue',
  }),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ['confirm_password'],
});

export const onboardingSchema = z.object({
  interests: z.array(z.string()).min(1, 'Please select at least one interest'),
  preferred_language: z.enum(['en', 'ta']),
  bio: z.string().max(200, 'Bio must be less than 200 characters').optional(),
});

export const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type OnboardingValues = z.infer<typeof onboardingSchema>;
export type AdminLoginValues = z.infer<typeof adminLoginSchema>;
