'use client';

import React from 'react';
import { Empty, Spin, Flex } from 'antd';
import CommentItem from './CommentItem';
import { CommentType } from '@/generated/prisma';

interface CommentListProps {
	comments: {
		id: string;
		content: string;
		type: CommentType;
		score: number;
		createdAt: Date;
		authorId: string;
		author: {
			name: string | null;
			email: string | null;
		};
		userVote: number;
	}[];
	loading: boolean;
	currentUserId?: string;
	userRole?: string;
	onDeleted?: (id: string) => void;
	onUpdated?: () => void;
	t?: any;
}

export default function CommentList({
	comments,
	loading,
	currentUserId,
	userRole,
	onDeleted,
	onUpdated,
	t,
}: CommentListProps) {
	if (loading) {
		return (
			<Flex justify="center" style={{ padding: 24 }}>
				<Spin />
			</Flex>
		);
	}

	if (comments.length === 0) {
		return <Empty description={t('noComments')} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
	}

	return (
		<div>
			{comments.map((comment) => (
				<CommentItem
					key={comment.id}
					comment={comment}
					currentUserId={currentUserId}
					userRole={userRole}
					onDeleted={onDeleted}
					onUpdated={onUpdated}
				/>
			))}
		</div>
	);
}
