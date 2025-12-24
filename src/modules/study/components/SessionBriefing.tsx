'use client';
import { Button, Typography } from 'antd';
import React from 'react';

const { Title, Text } = Typography;

interface SessionBriefingProps {
	queue: any[];
	stats: any;
	onStart: () => void;
}

export default function SessionBriefing({ queue, stats, onStart }: SessionBriefingProps) {
	return (
		<div style={{ padding: 24, textAlign: 'center' }}>
			<Title level={3}>Session Briefing</Title>
			<Text>Ready to review {queue.length} cards?</Text>
			<div style={{ marginTop: 24 }}>
				<Button type="primary" size="large" onClick={onStart}>
					Start Session
				</Button>
			</div>
		</div>
	);
}
