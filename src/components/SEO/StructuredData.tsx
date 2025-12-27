/**
 * Structured Data Component
 * Injects JSON-LD schema markup into pages
 */
import {
	generateOrganizationSchema,
	generateWebApplicationSchema,
	schemaToJsonLd,
} from '@/lib/seo/structured-data';

export function StructuredData() {
	const organizationSchema = generateOrganizationSchema();
	const webAppSchema = generateWebApplicationSchema();

	// Wrap in a container with suppressHydrationWarning to prevent
	// hydration mismatches from PostHog or other client-side script injections
	return (
		<span suppressHydrationWarning style={{ display: 'none' }}>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: schemaToJsonLd(organizationSchema),
				}}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: schemaToJsonLd(webAppSchema),
				}}
			/>
		</span>
	);
}
