'use client';

import HeroSection from './HeroSection';
import FeatureSection from './FeatureSection';
import SocialProofSection from './SocialProofSection';
import CTASection from './CTASection';
import { theme } from 'antd';

export default function LandingPage() {
	const { token } = theme.useToken();

	return (
		<div className="landing-page" style={{ background: token.colorBgLayout }}>
			<HeroSection />
			<FeatureSection />
			<SocialProofSection />
			<CTASection />
			<footer
				style={{
					padding: '24px',
					textAlign: 'center',
					background: token.colorBgLayout,
					color: token.colorTextSecondary,
					borderTop: `1px solid ${token.colorBorderSecondary}`,
				}}
			>
				© {new Date().getFullYear()} WatashiWa. All rights reserved.
			</footer>
		</div>
	);
}
