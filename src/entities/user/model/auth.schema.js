import { z } from 'zod'

const emailField = z
  .string()
  .min(1, 'Email address is required')
  .email('Please enter a valid email address')

const passwordField = z
  .string()
  .min(1, 'Password is required')
  .min(6, 'Password must be at least 6 characters long')

// why: must match the server's authSchema.register (name: 3-15 chars) or registration
// always fails validation server-side after passing client-side
const nameField = z
  .string()
  .min(3, 'Name must be at least 3 characters')
  .max(15, 'Name cannot exceed 15 characters')

export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
  remember: z.boolean().default(false),
})

export const registerSchema = z
  .object({
    name: nameField,
    email: emailField,
    password: passwordField,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: emailField,
})

export const resetPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
