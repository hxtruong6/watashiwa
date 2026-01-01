import { discoverTemplates, validateTemplate } from '@/modules/email/utils/template-loader';
import { NextResponse } from 'next/server';

/**
 * GET /api/admin/email-templates
 *
 * Use Cases:
 * - Admin panel to list all available templates
 * - Health check endpoint
 * - Template management UI
 *
 * Returns: List of all templates with validation status
 */
export async function GET() {
	try {
		const templates = discoverTemplates();

		const templatesWithStatus = templates.map((templateId) => {
			const validation = validateTemplate(templateId);
			return {
				id: templateId,
				valid: validation.valid,
				errors: validation.errors,
			};
		});

		return NextResponse.json({
			success: true,
			templates: templatesWithStatus,
			count: templates.length,
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 },
		);
	}
}
