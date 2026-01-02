import { getUser } from '@/modules/auth/auth.actions';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import CubeIntroduction from './CubeIntroduction';

async function CubeIntroductionContent() {
	// Server-side authentication check
	const user = await getUser();
	if (!user) {
		redirect('/login');
	}

	return <CubeIntroduction />;
}

export default async function CubeIntroductionPage() {
	return (
		<Suspense
			fallback={
				<div
					style={{
						minHeight: '100vh',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					Loading...
				</div>
			}
		>
			<CubeIntroductionContent />
		</Suspense>
	);
}
