/**
 * Template Loader System
 * Auto-loads email templates from files
 * Enables designers to create templates without code changes
 */
import { existsSync, readFileSync, readdirSync } from 'fs';
import mjml2html from 'mjml';
import { join } from 'path';

import { emailTokens } from './email-tokens';

interface TemplateConfig {
	id: string;
	name: string;
	subject: {
		en: string;
		vi?: string;
		ja?: string;
	};
	variables: {
		required: string[];
		optional?: string[];
	};
	metadata?: {
		category?: string;
		designer?: string;
		version?: string;
	};
}

interface TemplateData {
	[key: string]: string | undefined;
}

/**
 * Strip HTML tags for plain text version
 */
function stripHtml(html: string): string {
	return html
		.replace(/<style[^>]*>.*?<\/style>/gi, '')
		.replace(/<script[^>]*>.*?<\/script>/gi, '')
		.replace(/<[^>]+>/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Replace template variables with actual values
 * Handles design tokens and user variables
 */
function replaceVariables(template: string, data: TemplateData, appUrl: string): string {
	let result = template;

	// Replace design tokens - colors
	result = result.replace(/\{\{colors\.(\w+)\}\}/g, (_, key) => {
		return (emailTokens.colors as Record<string, string>)[key] || '';
	});

	// Replace design tokens - spacing
	result = result.replace(/\{\{spacing\.(\w+)\}\}/g, (_, key) => {
		return (emailTokens.spacing as Record<string, string>)[key] || '';
	});

	// Replace design tokens - typography
	result = result.replace(/\{\{typography\.(\w+)\}\}/g, (_, key) => {
		return (emailTokens.typography as Record<string, string>)[key] || '';
	});

	// Replace design tokens - shape
	result = result.replace(/\{\{shape\.(\w+)\}\}/g, (_, key) => {
		return (emailTokens.shape as Record<string, string>)[key] || '';
	});

	// Replace user variables
	Object.entries(data).forEach(([key, value]) => {
		const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
		result = result.replace(regex, value || '');
	});

	// Replace appUrl
	result = result.replace(/\{\{appUrl\}\}/g, appUrl);

	// Replace companyAddress (CAN-SPAM compliance)
	const companyAddress = process.env.COMPANY_PHYSICAL_ADDRESS || 'WatashiWa, [Your Address Here]';
	result = result.replace(/\{\{companyAddress\}\}/g, companyAddress);

	return result;
}

/**
 * Load template from file system
 * Supports language-specific templates: template.{language}.mjml
 * Falls back to template.mjml if language-specific file doesn't exist
 */
function loadTemplateFromFile(
	templateId: string,
	language: string = 'en',
): {
	mjml: string;
	config: TemplateConfig;
} {
	const templateDir = join(process.cwd(), 'src/modules/email/templates', templateId);

	// Try language-specific template first (e.g., template.en.mjml, template.vi.mjml)
	const languageSpecificPath = join(templateDir, `template.${language}.mjml`);
	// Fallback to generic template.mjml
	const genericPath = join(templateDir, 'template.mjml');

	let mjmlPath: string;
	if (existsSync(languageSpecificPath)) {
		mjmlPath = languageSpecificPath;
	} else if (existsSync(genericPath)) {
		mjmlPath = genericPath;
	} else {
		throw new Error(`Template file not found. Tried: ${languageSpecificPath} and ${genericPath}`);
	}

	const configPath = join(templateDir, 'config.json');
	if (!existsSync(configPath)) {
		throw new Error(`Template config not found: ${configPath}`);
	}

	const mjml = readFileSync(mjmlPath, 'utf-8');
	const config = JSON.parse(readFileSync(configPath, 'utf-8')) as TemplateConfig;

	return { mjml, config };
}

/**
 * Render template from file
 * Main function to load, process, and render email templates
 */
export function renderTemplateFromFile(
	templateId: string,
	data: TemplateData,
	language: string = 'en',
): { html: string; text: string; subject: string; config: TemplateConfig } {
	const { mjml, config } = loadTemplateFromFile(templateId, language);

	// Validate required variables
	const missingVars = config.variables.required.filter((key) => !data[key]);
	if (missingVars.length > 0) {
		throw new Error(`Missing required variables: ${missingVars.join(', ')}`);
	}

	const appUrl = data.appUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

	// Replace variables in MJML
	const processedMjml = replaceVariables(mjml, data, appUrl);

	// Compile MJML to HTML
	const { html, errors } = mjml2html(processedMjml, {
		validationLevel: 'soft',
		minify: true,
	});

	if (errors.length > 0) {
		console.warn(`MJML compilation warnings for ${templateId}:`, errors);
	}

	// Get subject line based on language
	const subject = config.subject[language as keyof typeof config.subject] || config.subject.en;

	return {
		html,
		text: stripHtml(html),
		subject,
		config,
	};
}

/**
 * Auto-discover all templates in templates directory
 */
export function discoverTemplates(): string[] {
	const templatesDir = join(process.cwd(), 'src/modules/email/templates');

	if (!existsSync(templatesDir)) {
		return [];
	}

	return readdirSync(templatesDir, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);
}

/**
 * Validate template structure
 */
export function validateTemplate(templateId: string): { valid: boolean; errors: string[] } {
	const errors: string[] = [];
	const templateDir = join(process.cwd(), 'src/modules/email/templates', templateId);

	if (!existsSync(templateDir)) {
		errors.push(`Template directory not found: ${templateDir}`);
		return { valid: false, errors };
	}

	// Check for language-specific or generic template
	const genericPath = join(templateDir, 'template.mjml');
	const enPath = join(templateDir, 'template.en.mjml');
	const viPath = join(templateDir, 'template.vi.mjml');
	const jaPath = join(templateDir, 'template.ja.mjml');

	if (
		!existsSync(genericPath) &&
		!existsSync(enPath) &&
		!existsSync(viPath) &&
		!existsSync(jaPath)
	) {
		errors.push(
			`Template file not found. Expected one of: template.mjml, template.en.mjml, template.vi.mjml, or template.ja.mjml`,
		);
	}

	const configPath = join(templateDir, 'config.json');
	if (!existsSync(configPath)) {
		errors.push(`Config file not found: ${configPath}`);
	} else {
		try {
			const config = JSON.parse(readFileSync(configPath, 'utf-8')) as TemplateConfig;
			if (!config.id || !config.name || !config.subject || !config.variables) {
				errors.push('Invalid config structure: missing required fields');
			}
		} catch (error) {
			errors.push(
				`Invalid JSON in config: ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}
