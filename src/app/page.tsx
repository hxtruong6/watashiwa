import { generatePageMetadata } from '@/lib/seo/metadata';
import LandingPageClient from '@/modules/marketing/components/landing/LandingPageClient';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { connection } from 'next/server';
import React, { Suspense } from 'react';

const locale = 'vi' as const;

export const metadata: Metadata = generatePageMetadata({
	locale,
	url: '/',
	canonical: '/',
});

async function HeroLCP() {
	await connection();
	const t = await getTranslations('Landing');

	return (
		<section
			className="hero-lcp-section"
			style={{
				minHeight: 'calc(100svh - 68px)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '0 24px',
				position: 'relative',
				overflow: 'hidden',
				background: 'var(--color-background)',
			}}
		>
			{/* Background gradient orbs - matching client HeroSection */}
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

			{/* Main content container - matching client HeroSection structure */}
			<div
				style={{
					maxWidth: 1200,
					width: '100%',
					padding: '0 24px',
					position: 'relative',
					zIndex: 10,
					display: 'flex',
					flexWrap: 'wrap-reverse',
					justifyContent: 'center',
					alignItems: 'center',
					gap: 40,
				}}
			>
				{/* Left Content (Text) - matching client HeroSection */}
				<div
					style={{
						flex: '1 1 340px',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'flex-start',
						textAlign: 'left',
						marginBottom: 20,
					}}
				>
					<div style={{ width: '100%' }}>
						{/* Badge placeholder - reserves space for client badge */}
						<div
							style={{
								height: 32,
								marginBottom: 16,
								opacity: 0,
								pointerEvents: 'none',
							}}
							aria-hidden="true"
						/>

						{/* Title */}
						<h1
							className="hero-title-lcp"
							style={{
								fontSize: 'clamp(32px, 6vw, 64px)',
								fontWeight: 800,
								color: 'var(--color-foreground)',
								lineHeight: 1.1,
								marginTop: 8,
								marginBottom: 24,
								letterSpacing: '-0.02em',
								textAlign: 'left',
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

						{/* Subtitle */}
						<p
							className="hero-subtitle-lcp"
							style={{
								fontSize: 'clamp(1rem, 2vw, 1.25rem)',
								color: 'var(--color-foreground)',
								marginBottom: 32,
								maxWidth: '600px',
								lineHeight: 1.6,
								textAlign: 'left',
								opacity: 0,
								animation: 'fadeIn 0.6s ease-out 0.4s forwards',
							}}
						>
							{t('heroSubtitle')}
						</p>

						{/* Buttons placeholder - reserves space for two CTA buttons */}
						<div
							style={{
								display: 'flex',
								flexWrap: 'wrap',
								gap: 16,
								justifyContent: 'flex-start',
								width: '100%',
								marginBottom: 32,
								minHeight: 56, // Button height
							}}
							aria-hidden="true"
						>
							<div style={{ flex: '1 1 auto', minWidth: '140px', height: 56 }} />
							<div style={{ flex: '1 1 auto', minWidth: '140px', height: 56 }} />
						</div>

						{/* Checkmarks placeholder - reserves space for three checkmarks */}
						<div
							style={{
								display: 'flex',
								gap: 'middle',
								flexWrap: 'wrap',
								marginTop: 0,
								minHeight: 24, // Approximate height for checkmarks row
								opacity: 0,
								pointerEvents: 'none',
							}}
							aria-hidden="true"
						>
							<div style={{ height: 24, width: 120 }} />
							<div style={{ height: 24, width: 120 }} />
							<div style={{ height: 24, width: 120 }} />
						</div>
					</div>
				</div>

				{/* Right Content (Card) - reserves space for InteractiveFlipCard */}
				<div
					style={{
						flex: '1 1 340px',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						position: 'relative',
					}}
					aria-hidden="true"
				>
					{/* Card placeholder - matching InteractiveFlipCard dimensions */}
					<div
						style={{
							width: 'min(340px, 85vw)',
							aspectRatio: '360/520',
							borderRadius: '32px',
							background: 'transparent',
							opacity: 0,
							pointerEvents: 'none',
						}}
					/>
				</div>
			</div>
		</section>
	);
}

export default async function Page() {
	return (
		<>
			<Suspense fallback={<div style={{ minHeight: 'calc(100svh - 68px)' }} />}>
				<HeroLCP />
			</Suspense>
			<LandingPageClient />
		</>
	);
}
