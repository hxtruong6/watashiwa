import { validateTemplate } from '@/modules/email/utils/template-loader';
import { NextResponse } from 'next/server';

/**
 * GET /api/admin/email-templates/[templateId]
 *
 * Use Cases:
 * - Validate specific template before sending
 * - Admin panel template detail view
 * - Pre-send validation
 *
 * Returns: Validation status for specific template
 */
export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ templateId: string }> },
) {
	try {
		const { templateId } = await params;
		const validation = validateTemplate(templateId);

		if (validation.valid) {
			return NextResponse.json({
				success: true,
				templateId,
				valid: true,
			});
		}

		return NextResponse.json(
			{
				success: false,
				templateId,
				valid: false,
				errors: validation.errors,
			},
			{ status: 400 },
		);
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
