/**
 * Email module types
 */

export interface EmailOptions {
	to: string;
	subject: string;
	html: string;
	text?: string;
	from?: string;
	fromName?: string;
}
