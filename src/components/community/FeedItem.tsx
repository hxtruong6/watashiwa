'use client';

import React, { useState } from 'react';
import { Card, Typography, Flex, Tag, Button, Space, Avatar, Tooltip } from 'antd';
import { LikeOutlined, LikeFilled, UserOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { voteComment } from '@/services/comments';

const { Text, Title } = Typography;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function FeedItem({ item }: { item: any }) {
	const tComment = useTranslations('Comments');
	const [voteStatus, setVoteStatus] = useState(item.userVote || 0); // 1, -1, 0
	const [score, setScore] = useState(item.score);

	const handleVote = async (value: number) => {
		// Optimistic update
		const oldStatus = voteStatus;
		// const oldScore = score;
		let newScore = score;

		if (value === oldStatus) {
			// Toggle off
			setVoteStatus(0);
			newScore -= value;
			await voteComment(item.id, 0);
		} else {
			// Change vote
			setVoteStatus(value);
			// Remove old effect
			if (oldStatus !== 0) newScore -= oldStatus;
			// Add new effect
			newScore += value;
			await voteComment(item.id, value);
		}
		setScore(newScore);
	};

	const contextTitle = item.vocab?.wordSurface || item.kanji?.kanji;
	const contextMeaning = item.vocab?.meaning || item.kanji?.meaning;
	const link = item.vocab?.deckId ? `/study?deckId=${item.vocab.deckId}` : '#';

	return (
		<Card
			hoverable
			style={{ borderRadius: 16, border: '1px solid #f0f0f0', overflow: 'hidden' }}
			styles={{ body: { padding: 0 } }}
		>
			<Flex vertical>
				{/* Context Header */}
				<div
					style={{
						background: '#fafafa',
						padding: '12px 16px',
						borderBottom: '1px solid #f0f0f0',
					}}
				>
					<Flex justify="space-between" align="start">
						<Flex vertical gap={2}>
							<Flex gap="small" align="center">
								<Title level={5} style={{ margin: 0, color: '#1E3A5F' }}>
									{contextTitle}
								</Title>
								<Tag color="geekblue" style={{ margin: 0 }}>
									{{
										MNEMONIC: tComment('typeMnemonic'),
										USAGE_TIP: tComment('typeTip'),
										CULTURAL_NOTE: tComment('typeCulture'),
										EXAMPLE: tComment('typeExample'),
										GRAMMAR: tComment('typeGrammar'),
										GENERAL: tComment('typeGeneral'),
									}[item.type as string] || item.type}
								</Tag>
							</Flex>
							<Text type="secondary" style={{ fontSize: 13 }}>
								{contextMeaning}
							</Text>
						</Flex>

						<Tooltip title="View in Deck">
							<Link href={link}>
								<Button
									size="small"
									type="text"
									icon={<ArrowRightOutlined />}
									style={{ color: '#1E3A5F' }}
								/>
							</Link>
						</Tooltip>
					</Flex>
				</div>

				{/* Content Body */}
				<div style={{ padding: '16px' }}>
					<Text style={{ fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
						{item.content}
					</Text>

					{/* Metadata Footer */}
					<Flex justify="space-between" align="center" style={{ marginTop: 16 }}>
						<Space>
							<Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#ccc' }}>
								{item.author?.name?.[0]?.toUpperCase()}
							</Avatar>
							<Flex vertical gap={0}>
								<Text style={{ fontSize: 12, fontWeight: 500, lineHeight: 1 }}>
									{item.author?.name || 'User'}
								</Text>
								<Text type="secondary" style={{ fontSize: 10 }}>
									{new Date(item.createdAt).toLocaleDateString()}
								</Text>
							</Flex>
						</Space>

						<Space>
							<Button
								type={voteStatus === 1 ? 'text' : 'text'}
								icon={voteStatus === 1 ? <LikeFilled /> : <LikeOutlined />}
								style={{ color: voteStatus === 1 ? '#1E3A5F' : undefined }}
								onClick={() => handleVote(1)}
							/>
							<Text strong style={{ minWidth: 20, textAlign: 'center' }}>
								{score}
							</Text>
						</Space>
					</Flex>
				</div>
			</Flex>
		</Card>
	);
}
