/**
 * UUID Detection Utility
 *
 * Provides functions to detect and validate UUID format
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Check if a string is a valid UUID format
 *
 * @param value - The string to check
 * @returns true if the string matches UUID format, false otherwise
 */
export function isUUID(value: string | string[] | undefined | null): value is string {
	if (!value || Array.isArray(value)) return false;
	return UUID_REGEX.test(value);
}
