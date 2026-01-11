'use client';

import { useWorkbenchStore } from '@/modules/admin/store/useWorkbenchStore';
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
	CloseOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
	QuestionCircleOutlined,
	SaveOutlined,
} from '@ant-design/icons';
import {
	Badge,
	Button,
	Empty,
	Flex,
	Layout,
	List,
	Modal,
	Select,
	Space,
	Spin,
	Tag,
	Tooltip,
	Typography,
	message,
	theme,
} from 'antd';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { EditVocabularyForm } from './EditVocabularyForm';
import { type ExtendedVocabulary, VerificationCard } from './VerificationCard';

const { Title, Text } = Typography;
const { Sider, Content } = Layout;

export const ContentWorkbench: React.FC = () => {
	const t = useTranslations('Admin.Content');

	// Store
	const { activeItem, isDirty, init, updateField } = useWorkbenchStore();

	// Local State (Queue Management)
	const [queue, setQueue] = useState<ExtendedVocabulary[]>([]);
	const [selectedIndex, setSelectedIndex] = useState<number>(0);
	const [loading, setLoading] = useState(true);
	const [saveLoading, setSaveLoading] = useState(false);
	const [helpOpen, setHelpOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);

	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const statusFilter = searchParams.get('status');

	const handleFilterChange = (value: string) => {
		const params = new URLSearchParams(searchParams.toString());
		if (value && value !== 'Pending') {
			params.set('status', value);
		} else {
			params.delete('status');
		}
		router.push(`${pathname}?${params.toString()}`);
	};

	// Access Ant Design Token
	const { token } = theme.useToken();

	// Refs for keyboard shortcuts to access latest state
	const queueRef = useRef(queue);
	const selectedIndexRef = useRef(selectedIndex);
	const isDirtyRef = useRef(isDirty);
	const activeItemRef = useRef(activeItem);

	useEffect(() => {
		queueRef.current = queue;
		selectedIndexRef.current = selectedIndex;
		isDirtyRef.current = isDirty;
		activeItemRef.current = activeItem;

		// Auto-scroll
		const el = document.getElementById(`queue-item-${selectedIndex}`);
		if (el) {
			el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
		}
	}, [queue, selectedIndex, isDirty, activeItem]);

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
				// Note: The Effect below will catch selectedIndex change and init store
			} else {
				message.error(res.error || 'Failed to fetch vocabulary');
			}
			setLoading(false);
		};
		fetchData();
	}, [statusFilter]);

	// Sync Store with Selection
	useEffect(() => {
		if (queue[selectedIndex]) {
			init(queue[selectedIndex]);
		}
	}, [queue, selectedIndex, init]);

	// Actions
	const confirmNavigation = (callback: () => void) => {
		if (isDirty) {
			Modal.confirm({
				title: t('unsavedTitle') || 'Unsaved Changes',
				icon: <ExclamationCircleOutlined />,
				content: t('unsavedMessage') || 'You have unsaved changes. Discard them?',
				okText: 'Discard',
				okType: 'danger',
				cancelText: 'Cancel',
				onOk: callback,
			});
		} else {
			callback();
		}
	};

	const handleSelect = (index: number) => {
		if (index >= 0 && index < queue.length) {
			confirmNavigation(() => {
				setSelectedIndex(index);
			});
		}
	};

	const handleNext = useCallback(() => {
		// Queue logic: splice out current item
		setQueue((prev) => {
			const next = [...prev];
			next.splice(selectedIndexRef.current, 1);
			return next;
		});
		// Adjust index
		if (selectedIndexRef.current >= queueRef.current.length - 1) {
			setSelectedIndex(Math.max(0, queueRef.current.length - 2));
		}
		// No need confirmNavigation here because we are "Committing" the action (Approve/Reject) usually
		// But if just skipping? We don't have a "Skip" button mapped currently.
	}, []);

	const handleSave = useCallback(
		async (silent = false) => {
			if (!activeItemRef.current) return false;
			setSaveLoading(true);

			// API Call
			const res = await updateContent({
				id: activeItemRef.current.id,
				data: activeItemRef.current,
			});

			setSaveLoading(false);

			if (res.success) {
				if (!silent) message.success('Saved changes');

				// Update Queue with new data to prevent "re-init" reverting changes if we navigated back
				setQueue((prev) => {
					const next = [...prev];
					next[selectedIndex] = activeItemRef.current!;
					return next;
				});

				// Re-init store to reset "originalItem" to "activeItem" (clear dirty)
				init(activeItemRef.current);
				return true;
			} else {
				message.error(res.error || 'Failed to save');
				return false;
			}
		},
		[selectedIndex, init],
	); // init is stable from store usually, but ok to add.

	const handleApprove = useCallback(async () => {
		const item = queueRef.current[selectedIndexRef.current];
		if (!item) return;

		// If dirty, save first
		if (isDirtyRef.current) {
			const saved = await updateContent({
				id: activeItemRef.current!.id,
				data: activeItemRef.current!,
			});
			if (!saved.success) {
				message.error('Failed to save before approving');
				return;
			}
		}

		// Optimistic UI
		handleNext();
		message.success({ content: t('statusVerified'), key: 'action', duration: 1 });

		const res = await verifyContent({ vocabId: item.id });
		if (!res.success) {
			message.error('Server error: ' + res.error);
		}
	}, [handleNext, t]); // handleSave dep missing but we use ref logic inside logic if we extracted

	const handleReject = useCallback(async () => {
		// Rejecting usually implies data doesn't matter, just flag it.
		const item = queueRef.current[selectedIndexRef.current];
		if (!item) return;

		handleNext();
		message.warning({ content: t('statusFlagged'), key: 'action', duration: 1 });

		const res = await rejectContent({ vocabId: item.id });
		if (!res.success) {
			message.error('Server error: ' + res.error);
		}
	}, [handleNext, t]);

	const handlePlayAudio = useCallback(() => {
		const current = activeItemRef.current; // Store source for audio
		if (!current) return;

		if (current.audioUrl) {
			const audio = new Audio(current.audioUrl);
			audio.play().catch((e) => console.error('Audio playback error', e));
		} else {
			const text = current.wordReading || current.wordSurface;
			if (text) {
				const u = new SpeechSynthesisUtterance(text);
				u.lang = 'ja-JP';
				const voices = window.speechSynthesis.getVoices();
				const kyoko = voices.find((v) => v.name === 'Kyoko' || v.name.includes('Kyoko'));
				if (kyoko) u.voice = kyoko;
				window.speechSynthesis.speak(u);
			}
		}
	}, []);

	// KEYBOARD SHORTCUTS
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Disable shortcuts if editing form or input is focused
			if (isEditModalOpen) return;
			// Ignore if input focused (global check)
			if (
				document.activeElement?.tagName === 'INPUT' ||
				document.activeElement?.tagName === 'TEXTAREA' ||
				(document.activeElement as HTMLElement)?.isContentEditable
			) {
				// Allow Cmd/Ctrl+S for saving even if an input is focused
				if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
					// Do nothing, let the save shortcut proceed
				} else {
					return;
				}
			}

			// Check if we are in an input/textarea
			const isInput =
				document.activeElement?.tagName === 'INPUT' ||
				document.activeElement?.tagName === 'TEXTAREA' ||
				(document.activeElement as HTMLElement)?.isContentEditable;

			switch (e.key) {
				case 'j':
				case 'J':
				case 'ArrowDown':
					if (isInput) return;
					e.preventDefault();
					if (selectedIndexRef.current < queueRef.current.length - 1) {
						// We need to trigger handleSelect logic to check dirty
						// But we are in event listener.
						// Check ref dirty
						if (isDirtyRef.current) {
							message.warning('Please save or discard current changes'); // Simple block for shortcut
							return;
						}
						setSelectedIndex((s) => s + 1);
					}
					break;
				case 'k':
				case 'K':
				case 'ArrowUp':
					if (isInput) return;
					e.preventDefault();
					if (selectedIndexRef.current > 0) {
						if (isDirtyRef.current) {
							message.warning('Please save or discard current changes');
							return;
						}
						setSelectedIndex((s) => s - 1);
					}
					break;
				case 'a':
				case 'A':
					if (isInput) return;
					e.preventDefault();
					handleApprove();
					break;
				case 's':
					if (e.metaKey || e.ctrlKey) {
						e.preventDefault();
						handleSave();
					}
					break;
				// case 'r': // Dangerous to match with R key?
				//     if (isInput) return;
				// 	e.preventDefault();
				// 	handleReject();
				// 	break;
				case ' ': // Space to play audio
					if (isInput) return;
					e.preventDefault();
					handlePlayAudio();
					break;
				case '?':
					if (isInput) return;
					e.preventDefault();
					setHelpOpen(true);
					break;
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [handleApprove, handleReject, handlePlayAudio, handleSave, isEditModalOpen]);
	// RENDER HELPERS
	const renderStatusTag = (status: string) => {
		let color: 'default' | 'processing' | 'success' | 'error' | 'warning' = 'default';
		if (status === 'Pending') color = 'processing';
		if (status === 'AI_GENERATED') color = 'processing';
		if (status === 'VERIFIED') color = 'success';
		if (status === 'FLAGGED') color = 'error';

		return (
			<Badge status={color} text={status.slice(0, 2)} style={{ color: token.colorTextSecondary }} />
		);
	};

	return (
		<Layout
			style={{
				height: '100%',
				background: token.colorBgContainer,
			}}
		>
			{/* LEFT PANEL: QUEUE */}
			<Sider
				width={300}
				theme="light"
				style={{ borderRight: `1px solid ${token.colorBorderSecondary}` }}
			>
				<div
					style={{
						padding: '12px 16px',
						borderBottom: `1px solid ${token.colorBorderSecondary}`,
						background: token.colorFillQuaternary,
					}}
				>
					<Flex justify="space-between" align="center">
						<Text strong>
							{t('queueTitle')} ({queue.length})
						</Text>
						<Space size="small">
							<Select
								defaultValue={statusFilter || 'Pending'}
								value={statusFilter || 'Pending'}
								onChange={handleFilterChange}
								size="small"
								style={{ width: 130, fontSize: 14 }}
								variant="borderless"
								popupMatchSelectWidth={false}
								options={[
									{ value: 'Pending', label: 'Pending' },
									{ value: 'AI_GENERATED', label: 'AI Generated' },
									{ value: 'VERIFIED', label: 'Verified' },
									{ value: 'FLAGGED', label: 'Flagged' },
								]}
							/>
							<Tooltip title={`${t('shortcutsTitle')} (?)`}>
								<Button
									type="text"
									size="small"
									icon={<QuestionCircleOutlined />}
									onClick={() => setHelpOpen(true)}
								/>
							</Tooltip>
						</Space>
					</Flex>
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
										padding: '16px 20px',
										cursor: 'pointer',
										background: index === selectedIndex ? token.colorFillQuaternary : 'transparent',
										borderLeft:
											index === selectedIndex
												? `3px solid ${token.colorPrimary}`
												: '3px solid transparent',
										transition: 'background 0.2s',
									}}
									onClick={() => handleSelect(index)}
								>
									<Flex style={{ width: '100%' }} justify="space-between" align="center">
										<div
											style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
										>
											<Text strong>{item.wordSurface}</Text>
											<Flex vertical gap="small" justify="space-between">
												<Text
													style={{
														fontSize: 11,
														color: token.colorTextSecondary,
													}}
												>
													{item.wordReading}
												</Text>
												<Text
													style={{
														fontSize: 12,
														color: token.colorTextSecondary,
													}}
												>
													{item.meanings?.vi?.join(', ')}
												</Text>
											</Flex>
										</div>
										<Flex gap="small" align="center">
											{/* Dirty Indicator (Small dot if unsaved) */}
											{/* Only show if this item is the currently selected one AND dirty */}
											{index === selectedIndex && isDirty && (
												<Badge status="warning" style={{ marginRight: 0 }} />
											)}
											{renderStatusTag(item.contentStatus)}
										</Flex>
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
				{activeItem ? (
					<div
						style={{
							padding: '24px',
							maxWidth: '100%',
							margin: '0 auto',
							transition: 'max-width 0.3s ease',
						}}
					>
						{/* HEADER ACTIONS */}
						<Flex
							justify="space-between"
							align="center"
							style={{
								marginBottom: 16,
								position: 'sticky',
								top: 0,
								zIndex: 100,
								background: token.colorBgLayout,
								margin: '-24px -24px 16px -24px',
								padding: '16px 24px',
								borderBottom: `1px solid ${token.colorBorderSecondary}`,
							}}
						>
							<Space>
								<Title level={3} style={{ margin: 0 }}>
									{activeItem.wordSurface}
								</Title>
								{isDirty && (
									<Tag color="warning" icon={<ExclamationCircleOutlined />}>
										Unsaved
									</Tag>
								)}
							</Space>
							<Space>
								<>
									<Tooltip title={`${t('actionSave')} (⌘S)`}>
										<Button
											type="primary"
											icon={<SaveOutlined />}
											onClick={() => handleSave()}
											loading={saveLoading}
											disabled={!isDirty}
										>
											{t('actionSave')}
											<span style={{ fontSize: 10, opacity: 0.8, marginLeft: 4 }}>⌘S</span>
										</Button>
									</Tooltip>

									<Tooltip title={`${t('actionReject')} (R)`}>
										<Button danger icon={<CloseCircleOutlined />} onClick={handleReject}>
											{t('actionReject')}
										</Button>
									</Tooltip>

									{!isEditModalOpen && (
										<Button icon={<EditOutlined />} onClick={() => setIsEditModalOpen(true)}>
											Edit
										</Button>
									)}
									{/* // show cancel button if isEditModalOpen */}
									{isEditModalOpen && (
										<Tooltip title={`${t('actionCancel')} (Esc)`}>
											<Button icon={<CloseOutlined />} onClick={() => setIsEditModalOpen(false)}>
												Cancel
											</Button>
										</Tooltip>
									)}

									<Tooltip title={`${t('actionApprove')} (A)`}>
										<Button type="primary" icon={<CheckCircleOutlined />} onClick={handleApprove}>
											{t('actionApprove')}
										</Button>
									</Tooltip>
								</>
							</Space>
						</Flex>

						{/* CONTENT AREA */}
						{isEditModalOpen ? (
							<EditVocabularyForm
								initialValues={activeItem}
								onCancel={() => setIsEditModalOpen(false)}
								onSubmit={(values: Partial<ExtendedVocabulary>) => {
									Object.entries(values).forEach(([k, v]) => {
										// @ts-expect-error - Dynamic key assignment
										updateField(k, v);
									});
									setIsEditModalOpen(false);
									message.success('Draft updated. Click Save to persist.');
								}}
							/>
						) : (
							<VerificationCard
								mode="review"
								hideActions // We use the workbench header actions
								onPlayAudio={handlePlayAudio}
								// Store handles data
							/>
						)}
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
							Cmd+S
						</Text>{' '}
						<Tag color="warning">{t('actionSave')}</Tag>
					</List.Item>
					<List.Item>
						<Text strong style={{ width: 60 }}>
							T
						</Text>{' '}
						Switch Locale
					</List.Item>
				</List>
			</Modal>
		</Layout>
	);
};
