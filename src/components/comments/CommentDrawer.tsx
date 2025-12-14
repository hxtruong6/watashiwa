'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Drawer, Button, Typography } from 'antd';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
// import { useSession } from '@/services/auth'; // Assuming we have auth hook, or pass user prop
import { getComments } from '@/services/comments';
import { getUserWithRole } from '@/services/actions';
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;

interface CommentDrawerProps {
	open: boolean;
	onClose: () => void;
	entityId?: string;
	entityType?: 'vocab' | 'kanji';
	entityTitle?: string; // e.g. "学生"
}

import { CardComment } from '@/generated/prisma';

interface CommentWithUserVote extends CardComment {
	author: {
		id: string;
		name: string | null;
		email: string;
	};
	userVote: number;
}

export default function CommentDrawer({
	open,
	onClose,
	entityId,
	entityType,
	entityTitle,
}: CommentDrawerProps) {
	const [comments, setComments] = useState<CommentWithUserVote[]>([]);
	const [loading, setLoading] = useState(false);
	const [showForm, setShowForm] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [currentUser, setCurrentUser] = useState<any>(null); // Ideally User type but role is needed

	// Fetch user on mount (or could pass as prop)
	useEffect(() => {
		if (open) {
			getUserWithRole().then((u) => setCurrentUser(u));
		}
	}, [open]);

	const fetchComments = useCallback(async () => {
		if (!entityId || !entityType) return;
		setLoading(true);
		try {
			const data = await getComments(entityId, entityType);
			setComments(data);
		} catch (error) {
			console.error('Failed to load comments', error);
		} finally {
			setLoading(false);
		}
	}, [entityId, entityType]);

	useEffect(() => {
		if (open && entityId) {
			fetchComments();
			setShowForm(false);
		}
	}, [open, entityId, fetchComments]);

	const handleCommentSuccess = () => {
		fetchComments();
		setShowForm(false);
	};

	const handleDeleted = (id: string) => {
		setComments((prev) => prev.filter((c) => c.id !== id));
	};

	const t = useTranslations('Comments');
	const tCommon = useTranslations('Common');

	return (
		<Drawer
			title={
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						width: '100%',
					}}
				>
					<span>
						{t('title')}: <Text code>{entityTitle}</Text>
					</span>
					{!showForm && (
						<Button
							type="primary"
							size="small"
							icon={<PlusOutlined />}
							onClick={() => setShowForm(true)}
						>
							{t('addTip')}
						</Button>
					)}
				</div>
			}
			placement="bottom"
			style={{ height: '85vh' }}
			onClose={onClose}
			open={open}
			styles={{ body: { padding: '16px 12px' } }}
			extra={<Button type="text" onClick={onClose} icon={<CloseOutlined />} />}
			destroyOnHidden
		>
			<div style={{ maxWidth: 600, margin: '0 auto' }}>
				{showForm && entityId && entityType && (
					<div style={{ marginBottom: 24 }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
							<Title level={5} style={{ margin: 0 }}>
								{t('writeTip')}
							</Title>
							<Button size="small" onClick={() => setShowForm(false)}>
								{tCommon('cancel')}
							</Button>
						</div>
						<CommentForm
							entityId={entityId}
							entityType={entityType}
							onSuccess={handleCommentSuccess}
						/>
					</div>
				)}

				<CommentList
					comments={comments}
					loading={loading}
					currentUserId={currentUser?.id}
					userRole={currentUser?.role}
					onDeleted={handleDeleted}
					onUpdated={handleCommentSuccess}
					t={t}
				/>
			</div>
		</Drawer>
	);
}
