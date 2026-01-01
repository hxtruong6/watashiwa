#!/usr/bin/env tsx
/**
 * Email Template Validation Script
 *
 * Use Cases:
 * - CI/CD pipeline validation before deployment
 * - Pre-commit hook to catch template errors
 * - Development tool to validate templates
 *
 * Usage:
 *   pnpm tsx scripts/validate-email-templates.ts
 *   pnpm tsx scripts/validate-email-templates.ts welcome
 */
import { discoverTemplates, validateTemplate } from '../src/modules/email/utils/template-loader';

const templateId = process.argv[2];

async function main() {
	console.log('🔍 Validating Email Templates...\n');

	if (templateId) {
		// Validate specific template
		console.log(`Validating template: ${templateId}\n`);
		const result = validateTemplate(templateId);

		if (result.valid) {
			console.log(`✅ Template "${templateId}" is valid\n`);
			process.exit(0);
		} else {
			console.error(`❌ Template "${templateId}" has errors:\n`);
			result.errors.forEach((error) => {
				console.error(`  - ${error}`);
			});
			console.error('');
			process.exit(1);
		}
	} else {
		// Validate all templates
		const templates = discoverTemplates();

		if (templates.length === 0) {
			console.error('❌ No templates found in src/modules/email/templates/\n');
			process.exit(1);
		}

		console.log(`Found ${templates.length} template(s): ${templates.join(', ')}\n`);

		let allValid = true;
		const results: Array<{ id: string; valid: boolean; errors: string[] }> = [];

		for (const templateId of templates) {
			const result = validateTemplate(templateId);
			results.push({ id: templateId, ...result });

			if (!result.valid) {
				allValid = false;
			}
		}

		// Print results
		for (const result of results) {
			if (result.valid) {
				console.log(`✅ ${result.id} - Valid`);
			} else {
				console.error(`❌ ${result.id} - Invalid:`);
				result.errors.forEach((error) => {
					console.error(`   - ${error}`);
				});
			}
		}

		console.log('');

		if (allValid) {
			console.log('✅ All templates are valid!\n');
			process.exit(0);
		} else {
			console.error('❌ Some templates have errors. Please fix them before deploying.\n');
			process.exit(1);
		}
	}
}

main().catch((error) => {
	console.error('Error:', error);
	process.exit(1);
});
