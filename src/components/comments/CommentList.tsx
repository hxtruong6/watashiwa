'use client';

import { CommentType } from '@prisma/client';
import { Empty, Flex, Spin } from 'antd';
import React from 'react';

import CommentItem from './CommentItem';

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
