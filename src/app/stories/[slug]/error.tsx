/**
 * Story Reader Error Boundary
 *
 * Handles errors in the Story Reader component
 * Provides graceful error recovery with retry functionality
 */

'use client';

import { Button, Card, Result, Space, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const { Title, Text } = Typography;

interface StoryErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function StoryError({ error, reset }: StoryErrorProps) {
	const router = useRouter();

	// Log error for monitoring
	useEffect(() => {
		console.error('Story Reader Error:', {
			message: error.message,
			stack: error.stack,
			digest: error.digest,
		});
	}, [error]);

	const handleGoBack = () => {
		router.push('/stories');
	};

	const handleRetry = () => {
		reset();
	};

	return (
		<div
			style={{
				maxWidth: '800px',
				margin: '0 auto',
				padding: '48px 24px',
				minHeight: '60vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<Card
				style={{
					width: '100%',
					textAlign: 'center',
					borderRadius: '16px',
					boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
				}}
			>
				<Result
					status="error"
					title={
						<Title level={3} style={{ margin: 0 }}>
							Unable to Load Story
						</Title>
					}
					subTitle={
						<Text type="secondary" style={{ fontSize: '16px' }}>
							{process.env.NODE_ENV === 'development'
								? error.message || 'An unexpected error occurred while loading the story.'
								: 'Something went wrong while loading the story. Please try again.'}
						</Text>
					}
					extra={
						<Space size="middle" direction="vertical" style={{ width: '100%' }}>
							<Space size="middle">
								<Button type="primary" size="large" onClick={handleRetry}>
									Try Again
								</Button>
								<Button size="large" onClick={handleGoBack}>
									Back to Stories
								</Button>
							</Space>
							{process.env.NODE_ENV === 'development' && error.stack && (
								<details
									style={{
										marginTop: '24px',
										textAlign: 'left',
										backgroundColor: '#f5f5f5',
										padding: '16px',
										borderRadius: '8px',
									}}
								>
									<summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '8px' }}>
										Error Details (Dev Only)
									</summary>
									<pre
										style={{
											margin: 0,
											fontSize: '12px',
											overflow: 'auto',
											maxHeight: '200px',
										}}
									>
										{error.stack}
									</pre>
									{error.digest && (
										<Text
											type="secondary"
											style={{ fontSize: '12px', display: 'block', marginTop: '8px' }}
										>
											Digest: {error.digest}
										</Text>
									)}
								</details>
							)}
						</Space>
					}
				/>
			</Card>
		</div>
	);
}
