import React from 'react';
import HeroSection from './HeroSection';
import FeatureSection from './FeatureSection';
import CTASection from './CTASection';

export default function LandingPage() {
	return (
		<main>
			<HeroSection />
			<FeatureSection />
			<CTASection />
			<footer
				style={{ padding: '24px', textAlign: 'center', background: '#F9F7F2', color: '#888' }}
			>
				© {new Date().getFullYear()} WatashiWa. All rights reserved.
			</footer>
		</main>
	);
}
