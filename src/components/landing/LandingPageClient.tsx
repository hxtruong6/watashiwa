'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const LandingPage = dynamic(() => import('./LandingPage'), {
	ssr: false,
});

export default function LandingPageClient() {
	return <LandingPage />;
}
