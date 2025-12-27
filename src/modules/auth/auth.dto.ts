import { z } from 'zod';

/**
 * Email validation with sanitization
 * Rejects common injection patterns and validates format
 */
const emailSchema = z
	.email('Invalid email format')
	.max(255, 'Email is too long')
	.min(1, 'Email is required')
	.transform((email) => email.toLowerCase().trim())
	.refine(
		(email) => {
			// Reject potential injection patterns
			const dangerousPatterns = [/<script/i, /javascript:/i, /on\w+\s*=/i];
			return !dangerousPatterns.some((pattern) => pattern.test(email));
		},
		{ message: 'Invalid email format' },
	);

/**
 * Password validation with security requirements
 * Minimum 6 chars for signup, no minimum for login (Supabase handles validation)
 */
const passwordSchema = z
	.string()
	.min(1, 'Password is required')
	.max(1000, 'Password is too long') // Prevent DoS via extremely long passwords
	.refine(
		(pwd) => {
			// Reject null bytes and control characters
			return !/[^\x20-\x7E]/.test(pwd);
		},
		{ message: 'Password contains invalid characters' },
	);

const passwordSignupSchema = passwordSchema.min(6, 'Password must be at least 6 characters');

/**
 * Name validation with sanitization
 * Rejects HTML/script tags and validates length
 */
const nameSchema = z
	.string()
	.min(1, 'Name is required')
	.max(100, 'Name is too long')
	.transform((name) => name.trim())
	.refine(
		(name) => {
			// Reject HTML/script tags
			return !/<[^>]*>/g.test(name);
		},
		{ message: 'Name contains invalid characters' },
	);

/**
 * Login input schema
 * Validates email and password for login flow
 */
export const loginSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
});

/**
 * Signup input schema
 * Validates email, password (min 6 chars), and name for signup flow
 */
export const signupSchema = z.object({
	email: emailSchema,
	password: passwordSignupSchema,
	name: nameSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
