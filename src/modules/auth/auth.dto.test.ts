import { describe, expect, it } from 'vitest';

import { signupSchema } from './auth.dto';

describe('signupSchema', () => {
	describe('email validation', () => {
		it('should accept valid email', () => {
			const result = signupSchema.safeParse({
				email: 'test@example.com',
				password: 'password123',
				name: 'Test User',
			});
			expect(result.success).toBe(true);
		});

		it('should reject invalid email format', () => {
			const result = signupSchema.safeParse({
				email: 'notanemail',
				password: 'password123',
				name: 'Test User',
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toContain('Invalid email');
			}
		});

		it('should sanitize email (lowercase, trim)', () => {
			const result = signupSchema.safeParse({
				email: '  TEST@EXAMPLE.COM  ',
				password: 'password123',
				name: 'Test User',
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.email).toBe('test@example.com');
			}
		});

		it('should reject dangerous email patterns', () => {
			const dangerousEmails = [
				'<script>alert("xss")</script>@example.com',
				'javascript:alert("xss")@example.com',
				'onclick=alert("xss")@example.com',
			];

			dangerousEmails.forEach((email) => {
				const result = signupSchema.safeParse({
					email,
					password: 'password123',
					name: 'Test User',
				});
				expect(result.success).toBe(false);
			});
		});
	});

	describe('password validation', () => {
		it('should accept password with min 6 characters', () => {
			const result = signupSchema.safeParse({
				email: 'test@example.com',
				password: 'pass12',
				name: 'Test User',
			});
			expect(result.success).toBe(true);
		});

		it('should reject password shorter than 6 characters', () => {
			const result = signupSchema.safeParse({
				email: 'test@example.com',
				password: 'pass1',
				name: 'Test User',
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toContain('at least 6');
			}
		});

		it('should reject password with control characters', () => {
			const result = signupSchema.safeParse({
				email: 'test@example.com',
				password: 'pass\x00123',
				name: 'Test User',
			});
			expect(result.success).toBe(false);
		});
	});

	describe('name validation', () => {
		it('should accept valid name', () => {
			const result = signupSchema.safeParse({
				email: 'test@example.com',
				password: 'password123',
				name: 'Test User',
			});
			expect(result.success).toBe(true);
		});

		it('should reject empty name', () => {
			const result = signupSchema.safeParse({
				email: 'test@example.com',
				password: 'password123',
				name: '',
			});
			expect(result.success).toBe(false);
		});

		it('should reject name with HTML tags', () => {
			const result = signupSchema.safeParse({
				email: 'test@example.com',
				password: 'password123',
				name: '<script>alert("xss")</script>',
			});
			expect(result.success).toBe(false);
		});

		it('should sanitize name (trim)', () => {
			const result = signupSchema.safeParse({
				email: 'test@example.com',
				password: 'password123',
				name: '  Test User  ',
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.name).toBe('Test User');
			}
		});
	});
});
