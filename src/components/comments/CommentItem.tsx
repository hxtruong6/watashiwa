'use client';

import React, { useState } from 'react';
import {
	Card,
	Button,
	Typography,
	Tag,
	Space,
	Avatar,
	Flex,
	Input,
	Select,
	message,
	Popconfirm,
	theme,
} from 'antd';
import {
	LikeOutlined,
	LikeFilled,
	DislikeOutlined,
	DislikeFilled,
	UserOutlined,
	DeleteOutlined,
	EditOutlined,
	SaveOutlined,
	CloseOutlined,
} from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import { voteComment, deleteComment, updateComment } from '@/services/comments';
import { CommentType } from '@/generated/prisma';
import { useTranslations } from 'next-intl';

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { useToken } = theme;

interface CommentProps {
	comment: {
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
	};
	currentUserId?: string; // To check if can delete
	userRole?: string; // To check if can delete (admin/mod)
	onDeleted?: (id: string) => void;
	onUpdated?: () => void;
}

const TagColors: Record<string, string> = {
	MNEMONIC: 'magenta',
	USAGE_TIP: 'blue',
	CULTURAL_NOTE: 'gold',
	EXAMPLE: 'cyan',
	GRAMMAR: 'geekblue',
	GENERAL: 'default',
};

export default function CommentItem({
	comment,
	currentUserId,
	userRole,
	onDeleted,
	onUpdated,
}: CommentProps) {
	const tComment = useTranslations('Comments');
	const tCommon = useTranslations('Common');
	const { token } = useToken();

	const [vote, setVote] = useState(comment.userVote);
	const [score, setScore] = useState(comment.score);
	const [loading, setLoading] = useState(false);

	// Edit Mode State
	const [isEditing, setIsEditing] = useState(false);
	const [editContent, setEditContent] = useState(comment.content);
	const [editType, setEditType] = useState<CommentType>(comment.type);

	const handleVote = async (value: number) => {
		// Optimistic update
		const oldVote = vote;

		if (vote === value) {
			// Toggle off
			setVote(0);
			setScore((s) => s - value);
			await voteComment(comment.id, 0);
		} else {
			// Change vote
			const diff = value - oldVote;
			setVote(value);
			setScore((s) => s + diff);
			await voteComment(comment.id, value);
		}
	};

	const handleDelete = async () => {
		// Confirm handled by Popconfirm
		setLoading(true);
		const res = await deleteComment(comment.id);
		if (res.success && onDeleted) {
			onDeleted(comment.id);
		} else {
			setLoading(false);
			message.error(tCommon('error'));
		}
	};

	const handleUpdate = async () => {
		if (!editContent.trim()) return;
		setLoading(true);
		const res = await updateComment(comment.id, editContent, editType);
		if (res.success) {
			setIsEditing(false);
			message.success(tComment('updateSuccess'));
			if (onUpdated) onUpdated(); // Trigger refresh
		} else {
			message.error(tComment('updateError'));
		}
		setLoading(false);
	};

	const canDelete =
		currentUserId === comment.authorId || userRole === 'ADMIN' || userRole === 'MODERATOR';
	const canEdit = currentUserId === comment.authorId;

	return (
		<Card size="small" style={{ marginBottom: 16, borderColor: token.colorBorderSecondary }}>
			<Flex gap="small" align="start">
				<Flex vertical align="center" style={{ minWidth: 40, marginRight: 8 }}>
					<Button
						type="text"
						size="small"
						icon={
							vote === 1 ? <LikeFilled style={{ color: token.colorPrimary }} /> : <LikeOutlined />
						}
						onClick={() => handleVote(1)}
						style={{ color: vote === 1 ? token.colorPrimary : undefined }}
					/>
					<Text
						strong
						style={{
							color:
								score > 0
									? token.colorPrimary
									: score < 0
										? token.colorError
										: token.colorTextSecondary,
						}}
					>
						{score}
					</Text>
					<Button
						type="text"
						size="small"
						icon={
							vote === -1 ? (
								<DislikeFilled style={{ color: token.colorError }} />
							) : (
								<DislikeOutlined />
							)
						}
						onClick={() => handleVote(-1)}
						style={{ color: vote === -1 ? token.colorError : undefined }}
					/>
				</Flex>

				<Flex vertical style={{ width: '100%' }} gap={2}>
					<Flex justify="space-between" align="start" wrap="wrap" gap="small">
						<Space size={4} wrap style={{ flex: 1, minWidth: 0 }}>
							<Avatar
								size="small"
								icon={<UserOutlined />}
								style={{ backgroundColor: token.colorSuccess, flexShrink: 0 }}
							>
								{comment.author.name?.[0]}
							</Avatar>
							<Text type="secondary" style={{ fontSize: 12 }} ellipsis>
								{comment.author.name || 'User'}
							</Text>
							<Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
								• {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
							</Text>
						</Space>
						{!isEditing && (
							<Tag color={TagColors[comment.type] || 'default'} style={{ margin: 0 }}>
								{/* Map type to translated label */}
								{{
									MNEMONIC: tComment('typeMnemonic'),
									USAGE_TIP: tComment('typeTip'),
									CULTURAL_NOTE: tComment('typeCulture'),
									EXAMPLE: tComment('typeExample'),
									GRAMMAR: tComment('typeGrammar'),
									GENERAL: tComment('typeGeneral'),
								}[comment.type] || comment.type}
							</Tag>
						)}
					</Flex>

					{isEditing ? (
						<Flex vertical gap="small" style={{ marginTop: 8 }}>
							<Select
								value={editType}
								onChange={setEditType}
								style={{ width: '100%' }}
								size="small"
							>
								<Option value="MNEMONIC">🧠 {tComment('typeMnemonic')}</Option>
								<Option value="USAGE_TIP">💡 {tComment('typeTip')}</Option>
								<Option value="CULTURAL_NOTE">⛩️ {tComment('typeCulture')}</Option>
								<Option value="EXAMPLE">📝 {tComment('typeExample')}</Option>
								<Option value="GRAMMAR">📖 {tComment('typeGrammar')}</Option>
								<Option value="GENERAL">💬 {tComment('typeGeneral')}</Option>
							</Select>
							<TextArea
								value={editContent}
								onChange={(e) => setEditContent(e.target.value)}
								autoSize={{ minRows: 2, maxRows: 6 }}
							/>
							<Flex gap="small" justify="flex-end">
								<Button size="small" onClick={() => setIsEditing(false)} icon={<CloseOutlined />}>
									{tCommon('cancel')}
								</Button>
								<Button
									size="small"
									type="primary"
									onClick={handleUpdate}
									loading={loading}
									icon={<SaveOutlined />}
								>
									{tCommon('save')}
								</Button>
							</Flex>
						</Flex>
					) : (
						<div style={{ marginTop: 8, whiteSpace: 'pre-line' }}>
							<Text>{comment.content}</Text>
						</div>
					)}

					{!isEditing && (canEdit || canDelete) && (
						<Flex justify="flex-end" style={{ marginTop: 8 }} gap="small">
							{canEdit && (
								<Button
									size="small"
									type="text"
									icon={<EditOutlined />}
									onClick={() => setIsEditing(true)}
								>
									{tCommon('edit')}
								</Button>
							)}
							{canDelete && (
								<Popconfirm
									title={tComment('deleteTitle')}
									description={tComment('deleteConfirm')}
									onConfirm={handleDelete}
									okText={tCommon('yes')}
									cancelText={tCommon('no')}
								>
									<Button
										size="small"
										type="text"
										danger
										icon={<DeleteOutlined />}
										loading={loading}
									>
										{tCommon('delete')}
									</Button>
								</Popconfirm>
							)}
						</Flex>
					)}
				</Flex>
			</Flex>
		</Card>
	);
}
