'use client';

import { Button, Card, Space, Typography } from 'antd';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

export default function StudyDashboard() {
	const router = useRouter();

	// Ideally, fetch decks here. For now, static or links.
	return (
		<div style={{ padding: 40, maxWidth: 800, margin: '0 auto' }}>
			<Title level={2}>Study Dashboard</Title>
			<Text>Select a deck to start studying.</Text>

			<Space orientation="vertical" style={{ marginTop: 20, width: '100%' }}>
				<Card
					title="Continue Last Session"
					extra={
						<Button type="primary" onClick={() => router.push('/study?deckId=last')}>
							Resume
						</Button>
					}
				>
					Resume your previous study session.
				</Card>
				{/* Placeholder for Deck List */}
			</Space>
		</div>
	);
}
