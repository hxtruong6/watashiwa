'use client';

// import { useSession } from '@/services/auth'; // Assuming we have auth hook, or pass user prop
import { getComments } from '@/modules/community/community.actions';
import { getUserWithRole } from '@/services/actions';
import { ClockCircleOutlined, CloseOutlined, FireOutlined, PlusOutlined } from '@ant-design/icons';
import { CardComment } from '@prisma/client';
import { Button, Drawer, Flex, Grid, Segmented, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import CommentForm from './CommentForm';
import CommentList from './CommentList';

const { Title, Text } = Typography;
const { useToken } = theme;

interface CommentDrawerProps {
	open: boolean;
	onClose: () => void;
	entityId?: string;
	entityType?: 'vocab' | 'kanji';
	entityTitle?: string; // e.g. "学生"
}

interface UserWithRole {
	id: string;
	role: string;
	name?: string | null;
	email?: string | null;
}

interface CommentWithUserVote extends CardComment {
	author: {
		id: string;
		name: string | null;
		email: string;
	};
	userVote: number;
}

type SortOption = 'popular' | 'newest';

const { useBreakpoint } = Grid;

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
	const [currentUser, setCurrentUser] = useState<UserWithRole | null>(null);
	const [sortBy, setSortBy] = useState<SortOption>('popular');

	const { token } = useToken();
	const screens = useBreakpoint();
	const t = useTranslations('Comments');
	const tCommon = useTranslations('Common');

	const isMobile = !screens.md;

	// Fetch user on mount (or could pass as prop)
	useEffect(() => {
		if (open) {
			getUserWithRole()
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				.then((u: any) => setCurrentUser(u))
				.catch((err) => console.error('Failed to fetch user', err));
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

	const sortedComments = useMemo(() => {
		return [...comments].sort((a, b) => {
			if (sortBy === 'popular') {
				// Sort by score (desc), then createdAt (desc)
				return (
					b.score - a.score || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				);
			} else {
				// Sort by createdAt (desc)
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			}
		});
	}, [comments, sortBy]);

	return (
		<Drawer
			title={
				<div style={{ width: '100%', paddingRight: 24 }}>
					<Flex justify="space-between" align="center" wrap="wrap" gap="small">
						<Flex align="center" gap="small" style={{ overflow: 'hidden' }}>
							<span style={{ whiteSpace: 'nowrap' }}>{t('title')}:</span>
							<Text code ellipsis style={{ maxWidth: 150, margin: 0 }}>
								{entityTitle}
							</Text>
						</Flex>
						{!showForm && (
							<Button
								type="primary"
								size="small"
								icon={<PlusOutlined />}
								onClick={() => setShowForm(true)}
								style={{ flexShrink: 0 }}
							>
								{t('addTip')}
							</Button>
						)}
					</Flex>
				</div>
			}
			placement={isMobile ? 'bottom' : 'right'}
			width={isMobile ? '100%' : 500}
			height={isMobile ? '80vh' : '100%'}
			onClose={onClose}
			open={open}
			styles={{ body: { padding: '16px 12px', overflowY: 'auto', paddingBottom: 40 } }}
			extra={<Button type="text" onClick={onClose} icon={<CloseOutlined />} />}
			destroyOnHidden
		>
			<div style={{ maxWidth: 640, margin: '0 auto', paddingBottom: 24 }}>
				{/* Sorting & Filter Controls - Only show if not adding new tip and has comments */}
				{!showForm && comments.length > 0 && (
					<Flex justify="flex-end" style={{ marginBottom: 16 }}>
						<Segmented<SortOption>
							options={[
								{
									label: t('sortPopular'),
									value: 'popular',
									icon: <FireOutlined />,
								},
								{
									label: t('sortNewest'),
									value: 'newest',
									icon: <ClockCircleOutlined />,
								},
							]}
							value={sortBy}
							onChange={(val) => setSortBy(val as SortOption)}
							size="small"
						/>
					</Flex>
				)}

				{showForm && entityId && entityType && (
					<div
						style={{
							marginBottom: 24,
							background: token.colorBgContainer,
							padding: 16,
							borderRadius: token.borderRadiusLG,
							border: `1px solid ${token.colorBorderSecondary}`,
						}}
					>
						<Flex justify="space-between" style={{ marginBottom: 16 }}>
							<Title level={5} style={{ margin: 0 }}>
								{t('writeTip')}
							</Title>
							<Button size="small" onClick={() => setShowForm(false)}>
								{tCommon('cancel')}
							</Button>
						</Flex>
						<CommentForm
							entityId={entityId}
							entityType={entityType}
							onSuccess={handleCommentSuccess}
						/>
					</div>
				)}

				<CommentList
					comments={sortedComments}
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
