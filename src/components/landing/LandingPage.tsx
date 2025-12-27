'use client';

import { Flex, Space, Typography } from 'antd';
import { theme } from 'antd';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import CTASection from './CTASection';
import FeatureSection from './FeatureSection';
import HeroSection from './HeroSection';
import SocialProofSection from './SocialProofSection';

const { Text } = Typography;

export default function LandingPage() {
	const { token } = theme.useToken();
	const t = useTranslations('Common');

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
							Privacy Policy
						</Link>
						<Link
							href="/terms-of-service"
							style={{ color: token.colorTextSecondary, textDecoration: 'none' }}
						>
							Terms of Service
						</Link>
						<Link
							href="/cookie-policy"
							style={{ color: token.colorTextSecondary, textDecoration: 'none' }}
						>
							Cookie Policy
						</Link>
						<Link
							href="/data-rights"
							style={{ color: token.colorTextSecondary, textDecoration: 'none' }}
						>
							Data Rights
						</Link>
						<Link
							href="/contact"
							style={{ color: token.colorTextSecondary, textDecoration: 'none' }}
						>
							Contact
						</Link>
						<Link href="/about" style={{ color: token.colorTextSecondary, textDecoration: 'none' }}>
							About
						</Link>
					</Space>
					<Text type="secondary" style={{ fontSize: 14 }}>
						© {new Date().getFullYear()} WatashiWa. All rights reserved.
					</Text>
				</Flex>
			</footer>
		</div>
	);
}
