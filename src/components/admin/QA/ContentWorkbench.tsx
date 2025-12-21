'use client';

import {
	getPendingVocabularySafe,
	getVocabularyByStatus,
	rejectContent,
	updateContent,
	verifyContent,
} from '@/modules/vocabulary/vocabulary.actions';
import {
	CheckCircleOutlined,
	CloseCircleOutlined,
	EditOutlined,
	QuestionCircleOutlined,
	SaveOutlined,
} from '@ant-design/icons';
import {
	Button,
	Card,
	Empty,
	Flex,
	Layout,
	List,
	Modal,
	Space,
	Spin,
	Tag,
	Tooltip,
	Typography,
	message,
	theme,
} from 'antd';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { EditVocabularyForm } from './EditVocabularyForm';
import { type ExtendedVocabulary, VerificationCard } from './VerificationCard';

const { Title, Text } = Typography;
const { Sider, Content } = Layout;

export const ContentWorkbench: React.FC = () => {
	const t = useTranslations('Admin.Content');
	// State
	const [queue, setQueue] = useState<ExtendedVocabulary[]>([]);
	const [selectedIndex, setSelectedIndex] = useState<number>(0);
	const [loading, setLoading] = useState(true);
	const [isEditing, setIsEditing] = useState(false);
	const [saveLoading, setSaveLoading] = useState(false);
	const [helpOpen, setHelpOpen] = useState(false);

	const searchParams = useSearchParams();
	const statusFilter = searchParams.get('status');

	// Access Ant Design Token
	const { token } = theme.useToken();

	// Refs
	const queueRef = useRef(queue);
	const selectedIndexRef = useRef(selectedIndex);
	const isEditingRef = useRef(isEditing);

	useEffect(() => {
		queueRef.current = queue;
		selectedIndexRef.current = selectedIndex;
		isEditingRef.current = isEditing;

		// Auto-scroll
		const el = document.getElementById(`queue-item-${selectedIndex}`);
		if (el) {
			el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
		}
	}, [queue, selectedIndex, isEditing]);

	// Fetch Data
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			let res;
			if (statusFilter) {
				res = await getVocabularyByStatus(statusFilter);
			} else {
				res = await getPendingVocabularySafe();
			}

			if (res.success && res.data) {
				setQueue(res.data as unknown as ExtendedVocabulary[]);
				setSelectedIndex(0); // Reset selection on fetch
			} else {
				message.error(res.error || 'Failed to fetch vocabulary');
			}
			setLoading(false);
		};
		fetchData();
	}, [statusFilter]);

	// Current Item
	const currentItem = queue[selectedIndex];

	// Actions
	const handleSelect = (index: number) => {
		if (index >= 0 && index < queue.length) {
			setSelectedIndex(index);
			setIsEditing(false); // Exit edit mode when switching
		}
	};

	const handleNext = useCallback(() => {
		if (queueRef.current.length === 0) return;

		// Move selection or Remove item?
		// For "Queue" workflow, usually we remove processed items or mark them done.
		// Let's remove for now to keep the list clean, similar to previous deck.
		// OR: Keep in list but mark status visually?
		// Current logic removes from queue state for "nextCard". Let's update that to behave like a queue.

		setQueue((prev) => {
			const next = [...prev];
			next.splice(selectedIndexRef.current, 1);
			return next;
		});
		// Selection stays at current index (next item shifts up), unless it was last
		if (selectedIndexRef.current >= queueRef.current.length - 1) {
			setSelectedIndex(Math.max(0, queueRef.current.length - 2));
		}
	}, []);

	const handleApprove = useCallback(async () => {
		const item = queueRef.current[selectedIndexRef.current];
		if (!item) return;

		// Optimistic UI
		handleNext();
		message.success({ content: t('statusVerified'), key: 'action', duration: 1 });

		const res = await verifyContent({ vocabId: item.id });
		if (!res.success) {
			message.error('Server error: ' + res.error);
			// In real app, re-fetch or rollback
		}
	}, [handleNext, t]);

	const handleReject = useCallback(async () => {
		const item = queueRef.current[selectedIndexRef.current];
		if (!item) return;

		handleNext();
		message.warning({ content: t('statusFlagged'), key: 'action', duration: 1 });

		const res = await rejectContent({ vocabId: item.id });
		if (!res.success) {
			message.error('Server error: ' + res.error);
		}
	}, [handleNext, t]);

	const handleSaveEdit = async (values: Partial<ExtendedVocabulary>) => {
		if (!currentItem) return;
		setSaveLoading(true);

		const res = await updateContent({ id: currentItem.id, data: values });
		if (res.success) {
			// Update local state BUT DON'T REMOVE
			const updated = { ...currentItem, ...values };
			const newQueue = [...queue];
			newQueue[selectedIndex] = updated as unknown as ExtendedVocabulary;
			setQueue(newQueue);

			setIsEditing(false);
			message.success('Saved changes');
		} else {
			message.error(res.error || 'Failed to save');
		}
		setSaveLoading(false);
	};

	// Keyboard Shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Provide global ignore for inputs if in Edit Mode
			if (isEditingRef.current) {
				// Allow Esc to cancel edit
				if (e.key === 'Escape') setIsEditing(false);
				// Allow Cmd+S to save? (Handled inside form usually, but can trigger global submit if needed)
				return;
			}

			switch (e.key) {
				case 'j':
				case 'J':
				case 'ArrowDown':
					e.preventDefault();
					if (selectedIndexRef.current < queueRef.current.length - 1) {
						setSelectedIndex((s) => s + 1);
					}
					break;
				case 'k':
				case 'K':
				case 'ArrowUp':
					e.preventDefault();
					if (selectedIndexRef.current > 0) {
						setSelectedIndex((s) => s - 1);
					}
					break;
				case 'a':
				case 'A':
					e.preventDefault();
					handleApprove();
					break;
				// case 'r':
				// case 'R':
				// 	e.preventDefault();
				// 	handleReject();
				// 	break;
				case 'e':
				case 'E':
					e.preventDefault();
					setIsEditing(true);
					break;
				case '?':
					e.preventDefault();
					setHelpOpen(true);
					break;
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [handleApprove, handleReject]);

	// RENDER HELPERS
	const renderStatusTag = (status: string) => {
		let color = 'default';
		if (status === 'Pending') color = 'processing';
		if (status === 'AI_GENERATED') color = 'cyan';
		if (status === 'VERIFIED') color = 'success';
		if (status === 'FLAGGED') color = 'error';
		return (
			<Tag color={color} style={{ marginRight: 0 }}>
				{status.slice(0, 2)}
			</Tag>
		);
	};

	return (
		<Layout
			style={{
				height: '100%', // Take full height of parent
				background: token.colorBgContainer,
				// border: `1px solid ${token.colorBorderSecondary}`, // Remove double border if preferred
				// borderRadius: 8, // Remove rounded corners if full bleed
			}}
		>
			{/* LEFT PANEL: QUEUE */}
			<Sider
				width={320}
				theme="light"
				style={{ borderRight: `1px solid ${token.colorBorderSecondary}` }}
			>
				<div
					style={{
						padding: '16px',
						borderBottom: `1px solid ${token.colorBorderSecondary}`,
						background: token.colorFillQuaternary,
					}}
				>
					<Text strong>
						{t('queueTitle')} ({queue.length})
					</Text>
					<Tooltip title={`${t('shortcutsTitle')} (?)`}>
						<Button
							type="text"
							size="small"
							icon={<QuestionCircleOutlined />}
							style={{ float: 'right' }}
							onClick={() => setHelpOpen(true)}
						/>
					</Tooltip>
				</div>
				<div style={{ overflowY: 'auto', height: 'calc(100% - 53px)' }}>
					{loading ? (
						<Flex justify="center" style={{ padding: 20 }}>
							<Spin />
						</Flex>
					) : (
						<List
							itemLayout="horizontal"
							dataSource={queue}
							renderItem={(item, index) => (
								<List.Item
									id={`queue-item-${index}`}
									className={index === selectedIndex ? 'bg-primary-light' : ''}
									style={{
										padding: '12px 16px',
										cursor: 'pointer',
										background: index === selectedIndex ? token.colorPrimaryBg : 'transparent',
										borderLeft:
											index === selectedIndex
												? `3px solid ${token.colorPrimary}`
												: '3px solid transparent',
									}}
									onClick={() => handleSelect(index)}
								>
									<Flex style={{ width: '100%' }} justify="space-between" align="center">
										<div
											style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
										>
											<Text strong>{item.wordSurface}</Text>
											<div style={{ fontSize: 12, color: token.colorTextSecondary }}>
												{item.wordReading}
											</div>
										</div>
										{renderStatusTag(item.contentStatus)}
									</Flex>
								</List.Item>
							)}
						/>
					)}
					{!loading && queue.length === 0 && (
						<Empty
							image={Empty.PRESENTED_IMAGE_SIMPLE}
							description={t('emptyQueue')}
							style={{ marginTop: 50 }}
						/>
					)}
				</div>
			</Sider>

			{/* RIGHT PANEL: WORKBENCH */}
			<Content
				style={{ padding: 0, overflowY: 'auto', background: token.colorBgLayout, height: '100%' }}
			>
				{currentItem ? (
					<div
						style={{
							// Add internal padding to container instead of Content
							padding: '24px',
							maxWidth: isEditing ? '100%' : 550, // Slightly wider mobile view
							margin: '0 auto',
							transition: 'max-width 0.3s ease',
						}}
					>
						{/* HEADER ACTIONS */}
						<Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
							{/* Hide Title in Review Mode (it's redundant with Card) */}
							{isEditing ? (
								<Space>
									<Title level={3} style={{ margin: 0 }}>
										{currentItem.wordSurface}
									</Title>
									<Tag>{currentItem.wordReading}</Tag>
								</Space>
							) : (
								<div /> // spacer
							)}
							<Space>
								{isEditing ? (
									<>
										<Button onClick={() => setIsEditing(false)}>{t('actionCancel')}</Button>
										<Button
											type="primary"
											icon={<SaveOutlined />}
											onClick={() => document.getElementById('workbench-submit')?.click()}
											loading={saveLoading}
										>
											{t('actionSave')}{' '}
											<span style={{ fontSize: 10, opacity: 0.8, marginLeft: 4 }}>⌘S</span>
										</Button>
									</>
								) : (
									<>
										{/* <Tooltip title={`${t('actionReject')} (R)`}> */}
										<Button danger icon={<CloseCircleOutlined />} onClick={handleReject}>
											{t('actionReject')}
										</Button>
										{/* </Tooltip> */}
										<Tooltip title={`${t('actionEdit')} (E)`}>
											<Button icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
												{t('actionEdit')}
											</Button>
										</Tooltip>
										<Tooltip title={`${t('actionApprove')} (A)`}>
											<Button type="primary" icon={<CheckCircleOutlined />} onClick={handleApprove}>
												{t('actionApprove')}
											</Button>
										</Tooltip>
									</>
								)}
							</Space>
						</Flex>

						{/* CONTENT AREA */}
						<Card bordered={false} style={{ boxShadow: token.boxShadowTertiary }}>
							{isEditing ? (
								<EditVocabularyForm
									initialValues={currentItem}
									onSubmit={handleSaveEdit}
									onCancel={() => setIsEditing(false)}
									loading={saveLoading}
									id="workbench-submit" // Trigger ID
								/>
							) : (
								<VerificationCard
									data={currentItem}
									mode="review"
									// Disable card internal actions, we use workbench header
									hideActions
								/>
							)}
						</Card>
					</div>
				) : (
					<Flex justify="center" align="center" style={{ height: '100%' }}>
						<Empty description={t('emptyState')} />
					</Flex>
				)}
			</Content>

			{/* SHORTCUTS MODAL */}
			<Modal
				title={t('shortcutsTitle')}
				open={helpOpen}
				onCancel={() => setHelpOpen(false)}
				footer={null}
				width={400}
			>
				<List size="small">
					<List.Item>
						<Text strong style={{ width: 60 }}>
							J / ↓
						</Text>{' '}
						{t('shortcutNext')}
					</List.Item>
					<List.Item>
						<Text strong style={{ width: 60 }}>
							K / ↑
						</Text>{' '}
						{t('shortcutPrev')}
					</List.Item>
					<List.Item>
						<Text strong style={{ width: 60 }}>
							A
						</Text>{' '}
						<Tag color="success">{t('shortcutApprove')}</Tag>
					</List.Item>
					<List.Item>
						<Text strong style={{ width: 60 }}>
							R
						</Text>{' '}
						<Tag color="error">{t('shortcutReject')}</Tag>
					</List.Item>
					<List.Item>
						<Text strong style={{ width: 60 }}>
							E
						</Text>{' '}
						{t('shortcutEdit')}
					</List.Item>
					<List.Item>
						<Text strong style={{ width: 60 }}>
							?
						</Text>{' '}
						{t('shortcutHelp')}
					</List.Item>
				</List>
			</Modal>
		</Layout>
	);
};
