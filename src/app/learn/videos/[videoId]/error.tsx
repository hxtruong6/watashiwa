'use client';

import { Alert, Button, Flex } from 'antd';
import { useEffect } from 'react';

export default function VideoError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error('Video learning error:', error);
	}, [error]);

	return (
		<Flex
			vertical
			align="center"
			justify="center"
			style={{
				minHeight: '60vh',
				padding: '24px',
			}}
		>
			<Alert
				message="Error Loading Video"
				description={error.message || 'An error occurred while loading the video'}
				type="error"
				showIcon
				action={
					<Button size="small" onClick={reset}>
						Try Again
					</Button>
				}
				style={{
					maxWidth: '600px',
					width: '100%',
				}}
			/>
		</Flex>
	);
}
