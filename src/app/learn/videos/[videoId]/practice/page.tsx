import { getUser } from '@/modules/auth/auth.actions';
import { PageSkeleton } from '@/modules/ui/components/skeletons';
import { getVideoData } from '@/modules/videos/actions';
import { ListenTypePracticePage } from '@/modules/videos/components/practice/ListenTypePracticePage';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';

async function PracticeContent({ videoId }: { videoId: string }) {
	const user = await getUser();

	if (!user) {
		redirect('/login');
	}

	const videoResult = await getVideoData({ videoId });

	if (!videoResult.success || !videoResult.data) {
		notFound();
	}

	return <ListenTypePracticePage video={videoResult.data} />;
}

export default async function PracticeRoute({ params }: { params: Promise<{ videoId: string }> }) {
	const { videoId } = await params;

	return (
		<Suspense fallback={<PageSkeleton />}>
			<PracticeContent videoId={videoId} />
		</Suspense>
	);
}
