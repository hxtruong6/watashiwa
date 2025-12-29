import { routing } from '@/i18n/routing';
import { generatePageMetadata } from '@/lib/seo/metadata';
import LandingPageClient from '@/modules/marketing/components/landing/LandingPageClient';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import React from 'react';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
	return generatePageMetadata({
		locale: routing.defaultLocale as 'vi' | 'en',
		url: '/',
	});
}

async function HeroLCP() {
	const t = await getTranslations('Landing');

	return (
		<section
			className="hero-lcp-section"
			style={{
				minHeight: 'calc(100svh - 64px)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '0 24px',
				position: 'relative',
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					position: 'absolute',
					top: '-20%',
					right: '-10%',
					width: 'min(80vw, 800px)',
					height: 'min(80vw, 800px)',
					background:
						'radial-gradient(circle, rgba(112, 130, 56, 0.15) 0%, rgba(255,255,255,0) 70%)',
					filter: 'blur(80px)',
					borderRadius: '50%',
					zIndex: 0,
					pointerEvents: 'none',
					willChange: 'transform',
					animation: 'gradientDrift 20s ease-in-out infinite',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					bottom: '-10%',
					left: '-10%',
					width: 'min(70vw, 600px)',
					height: 'min(70vw, 600px)',
					background: 'radial-gradient(circle, rgba(30, 58, 95, 0.1) 0%, rgba(255,255,255,0) 70%)',
					filter: 'blur(80px)',
					borderRadius: '50%',
					zIndex: 0,
					pointerEvents: 'none',
					willChange: 'transform',
					animation: 'gradientDrift 25s ease-in-out infinite reverse',
				}}
			/>
			<div style={{ maxWidth: 1200, width: '100%', position: 'relative', zIndex: 10 }}>
				<h1
					className="hero-title-lcp"
					style={{
						fontSize: 'clamp(32px, 6vw, 64px)',
						fontWeight: 800,
						color: 'var(--foreground)',
						lineHeight: 1.1,
						margin: '8px 0 24px 0',
						letterSpacing: '-0.02em',
						opacity: 0,
						animation: 'fadeIn 0.6s ease-out forwards',
					}}
				>
					{t('heroTitle')} <br />
					<span
						style={{
							color: '#68D391',
							display: 'inline-block',
							animation: 'breathingGlow 3s ease-in-out infinite',
						}}
					>
						{t('heroTitleAccent')}
					</span>
				</h1>
				<p
					className="hero-subtitle-lcp"
					style={{
						fontSize: 'clamp(1rem, 2vw, 1.25rem)',
						color: 'var(--foreground)',
						marginBottom: 32,
						maxWidth: 600,
						lineHeight: 1.6,
						opacity: 0,
						animation: 'fadeIn 0.6s ease-out 0.4s forwards',
					}}
				>
					{t('heroSubtitle')}
				</p>
			</div>
		</section>
	);
}

export default async function Page() {
	return (
		<>
			<HeroLCP />
			<LandingPageClient />
		</>
	);
}
