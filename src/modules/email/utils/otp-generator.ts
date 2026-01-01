/**
 * OTP Generation and Validation Utilities
 */

/**
 * Generate a 6-digit numeric OTP
 */
export function generateOTP(): string {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash OTP for secure storage
 * In production, use bcrypt or similar
 * For now, we'll use a simple hash (consider upgrading to bcrypt)
 */
export async function hashOTP(otp: string): Promise<string> {
	// Simple hash for now - in production, use bcrypt
	// For security, we should use bcrypt.hash(otp, 10)
	// But for simplicity and to avoid adding bcrypt dependency, we'll use a simple approach
	// TODO: Upgrade to bcrypt for production
	const encoder = new TextEncoder();
	const data = encoder.encode(otp);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify OTP against hashed value
 */
export async function verifyOTP(otp: string, hashedOTP: string): Promise<boolean> {
	const hashedInput = await hashOTP(otp);
	return hashedInput === hashedOTP;
}

/**
 * Check if OTP is expired
 */
export function isOTPExpired(expiresAt: Date | null): boolean {
	if (!expiresAt) return true;
	return new Date() > expiresAt;
}
