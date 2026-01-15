import { getUser } from '@/modules/auth/auth.actions';
import { PageSkeleton } from '@/modules/ui/components/skeletons';
import { getVideoData } from '@/modules/videos/actions';
import { VideoLearningPage } from '@/modules/videos/components/VideoLearningPage';
import { getUserVideoProgress } from '@/modules/videos/data';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

async function VideoContent({ videoId }: { videoId: string }) {
	const user = await getUser();

	if (!user) {
		notFound();
	}

	// Fetch video data
	const videoResult = await getVideoData({ videoId });

	if (!videoResult.success || !videoResult.data) {
		notFound();
	}

	// Fetch user progress
	const progress = await getUserVideoProgress(user.id, videoId);

	return <VideoLearningPage video={videoResult.data} initialProgress={progress} />;
}

export default async function VideoLearningRoute({
	params,
}: {
	params: Promise<{ videoId: string }>;
}) {
	const { videoId } = await params;

	return (
		<Suspense fallback={<PageSkeleton />}>
			<VideoContent videoId={videoId} />
		</Suspense>
	);
}
