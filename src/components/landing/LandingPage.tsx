'use client';

import { createClient } from '@/utils/supabase/client';
import { Flex, Space, Typography } from 'antd';
import { theme } from 'antd';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import CTASection from './CTASection';
import FeatureSection from './FeatureSection';
import HeroSection from './HeroSection';
import SocialProofSection from './SocialProofSection';

const { Text } = Typography;

export default function LandingPage() {
	const { token } = theme.useToken();
	const router = useRouter();
	const t = useTranslations('Landing');

	useEffect(() => {
		// Hide the entire server-rendered HeroLCP section when client component loads
		const serverHeroSection = document.querySelector('.hero-lcp-section') as HTMLElement;
		if (serverHeroSection) {
			serverHeroSection.style.display = 'none';
		}
	}, []);

	// Non-blocking auth check - don't delay initial render
	useEffect(() => {
		// Defer auth check to avoid blocking LCP
		const timer = setTimeout(() => {
			const checkAuth = async () => {
				try {
					const supabase = createClient();
					const {
						data: { user },
					} = await supabase.auth.getUser();

					if (user) {
						// User is authenticated, redirect to dashboard
						router.push('/dashboard?app=true');
					}
				} catch (error) {
					// Fail silently - show landing page if check fails
					console.error('[LandingPage] Auth check failed:', error);
				}
			};

			checkAuth();
		}, 100); // Small delay to not block initial render

		return () => clearTimeout(timer);
	}, [router]);

	return (
		<div className="landing-page" style={{ background: token.colorBgLayout }}>
			<HeroSection />
			<FeatureSection />
			<SocialProofSection />
			<CTASection />
			<footer
				style={{
					padding: '32px 24px',
					background: token.colorBgLayout,
					color: token.colorTextSecondary,
					borderTop: `1px solid ${token.colorBorderSecondary}`,
				}}
			>
				<Flex vertical align="center" gap={16}>
					<Space size="large" wrap style={{ justifyContent: 'center' }}>
						<Link
							href="/privacy-policy"
							style={{ color: token.colorTextSecondary, textDecoration: 'none' }}
						>
							{t('footerPrivacy')}
						</Link>
						<Link
							href="/terms-of-service"
							style={{ color: token.colorTextSecondary, textDecoration: 'none' }}
						>
							{t('footerTerms')}
						</Link>
						<Link
							href="/cookie-policy"
							style={{ color: token.colorTextSecondary, textDecoration: 'none' }}
						>
							{t('footerCookies')}
						</Link>
						<Link
							href="/data-rights"
							style={{ color: token.colorTextSecondary, textDecoration: 'none' }}
						>
							{t('footerDataRights')}
						</Link>
						<Link
							href="/contact"
							style={{ color: token.colorTextSecondary, textDecoration: 'none' }}
						>
							{t('footerContact')}
						</Link>
						<Link href="/about" style={{ color: token.colorTextSecondary, textDecoration: 'none' }}>
							{t('footerAbout')}
						</Link>
					</Space>
					<Text type="secondary" style={{ fontSize: 14 }}>
						© {new Date().getFullYear()} WatashiWa. {t('footerRights')}
					</Text>
				</Flex>
			</footer>
		</div>
	);
}
