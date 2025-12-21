'use client';

import {
	getPendingVocabularySafe,
	rejectContent,
	updateContent,
	verifyContent,
} from '@/modules/vocabulary/vocabulary.actions';
import { getVocabularyByStatus } from '@/modules/vocabulary/vocabulary.actions';
import { Button, Empty, Flex, Modal, Spin, Typography, message, notification } from 'antd';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { EditVocabularyForm } from './EditVocabularyForm';
import { type ExtendedVocabulary, VerificationCard } from './VerificationCard';

const { Title } = Typography;

export const VerificationDeck: React.FC = () => {
	// State
	const [queue, setQueue] = useState<ExtendedVocabulary[]>([]);
	const [loading, setLoading] = useState(true);
	const [editingItem, setEditingItem] = useState<ExtendedVocabulary | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalLoading, setModalLoading] = useState(false);

	const searchParams = useSearchParams();
	const statusFilter = searchParams.get('status');

	// Refs for avoiding stale closures in Keydown handlers
	const queueRef = useRef(queue);
	const isModalOpenRef = useRef(isModalOpen);

	useEffect(() => {
		queueRef.current = queue;
		isModalOpenRef.current = isModalOpen;
	}, [queue, isModalOpen]);

	// Fetch Data on Mount or Status Change
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
				// Cast strictly because Prisma JSON types are loose
				setQueue(res.data as unknown as ExtendedVocabulary[]);
			} else {
				message.error(res.error || 'Failed to fetch vocabulary');
			}
			setLoading(false);
		};
		fetchData();
	}, [statusFilter]);

	// Derived
	const currentCard = queue[0];
	const [api, contextHolder] = notification.useNotification();

	// Handlers
	const nextCard = useCallback(() => {
		setQueue((prev) => {
			if (prev.length === 0) return prev;
			const [, ...rest] = prev;
			return rest;
		});
	}, []);

	const handleUndo = useCallback(() => {
		// Undo logic removed for simplicity in this version as requested by linting.
		// Can be re-added when history tracking is robust.
		message.info('Undo temporarily disabled for refactor cleanup.');
	}, []);

	const handleApprove = useCallback(async () => {
		const item = queueRef.current[0];
		if (!item) return;

		// Optimistic Update
		nextCard();
		message.success({ content: 'Verified', key: 'action', duration: 1 });

		// Server Call
		const res = await verifyContent({ vocabId: item.id });
		if (!res.success) {
			message.error('Server error: ' + res.error);
			// Rollback logic could go here
		}
	}, [nextCard]);

	const handleReject = useCallback(async () => {
		const item = queueRef.current[0];
		if (!item) return;

		// Optimistic Update
		nextCard();
		message.warning({ content: 'Flagged', key: 'action', duration: 1 });

		// Server Call
		const res = await rejectContent({ vocabId: item.id });
		if (!res.success) {
			message.error('Server error: ' + res.error);
		}
	}, [nextCard]);

	const handleEdit = useCallback(() => {
		const current = queueRef.current[0];
		if (current) {
			setEditingItem(current);
			setIsModalOpen(true);
		}
	}, []);

	const handleSaveEdit = async (values: Partial<ExtendedVocabulary>) => {
		if (!editingItem) return;
		setModalLoading(true);

		const res = await updateContent({ id: editingItem.id, data: values });
		if (res.success) {
			// Update local state
			const updated = { ...currentCard, ...values };
			// Replace head
			setQueue((prev) => [updated as unknown as ExtendedVocabulary, ...prev.slice(1)]);

			setIsModalOpen(false);
			setEditingItem(null);
			message.success('Changes saved!');
		} else {
			message.error(res.error || 'Failed to save changes');
		}
		setModalLoading(false);
	};

	const handlePlayAudio = useCallback(() => {
		const current = queueRef.current[0];
		// Use custom audio if available, else TTS
		if (current?.audioUrl) {
			const audio = new Audio(current.audioUrl);
			audio.play().catch((e) => console.error('Audio playback error', e));
		} else {
			const text = current?.wordReading || current?.wordSurface;
			if (text) {
				const u = new SpeechSynthesisUtterance(text);
				u.lang = 'ja-JP';
				window.speechSynthesis.speak(u);
			}
		}
	}, []);

	// Keyboard Shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (isModalOpenRef.current) return; // Disable keys when editing

			switch (e.key) {
				case 'ArrowRight':
					e.preventDefault();
					handleApprove();
					break;
				case 'ArrowLeft':
					e.preventDefault();
					handleReject();
					break;
				case ' ': // Space
				case 'AudioVolumeUp':
					e.preventDefault();
					handlePlayAudio();
					break;
				case 'e':
				case 'E':
					e.preventDefault();
					handleEdit();
					break;
				case 'z':
					if (e.metaKey || e.ctrlKey) {
						e.preventDefault();
						handleUndo();
					}
					break;
				default:
					break;
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [handleApprove, handleReject, handlePlayAudio, handleEdit, handleUndo]);

	if (loading) {
		return (
			<Flex justify="center" align="center" style={{ minHeight: '60vh' }}>
				<Spin size="large" tip="Loading pending content..." />
			</Flex>
		);
	}

	if (!currentCard) {
		return (
			<Flex justify="center" align="center" style={{ minHeight: '60vh' }} vertical>
				<Empty description="All caught up! No pending content." />
				<Button onClick={() => window.location.reload()} type="dashed" className="mt-4">
					Check Again
				</Button>
			</Flex>
		);
	}

	return (
		<div style={styles.container}>
			{contextHolder}
			<Title level={2} style={styles.title}>
				{statusFilter ? `${statusFilter} Content` : 'Pending Review'} ({queue.length})
			</Title>

			<VerificationCard
				data={currentCard}
				mode="review"
				onApprove={handleApprove}
				onReject={handleReject}
				onEdit={handleEdit}
				onPlayAudio={handlePlayAudio}
			/>

			<div style={styles.controls}>
				<span style={styles.keyHint}>← Reject</span>
				<span style={styles.keyHint}>→ Approve</span>
				<span style={styles.keyHint}>Space: Audio</span>
				<span style={styles.keyHint}>E: Edit</span>
			</div>

			<Modal
				title="Edit Vocabulary"
				open={isModalOpen}
				onCancel={() => setIsModalOpen(false)}
				footer={null}
				width={600}
				destroyOnClose
				style={{ top: 20 }}
			>
				{editingItem && (
					<EditVocabularyForm
						initialValues={editingItem}
						onSubmit={handleSaveEdit}
						onCancel={() => setIsModalOpen(false)}
						loading={modalLoading}
					/>
				)}
			</Modal>
		</div>
	);
};

const styles = {
	container: {
		position: 'relative' as const,
		maxWidth: 600,
		margin: '0 auto',
		padding: '20px 0',
	},
	title: {
		textAlign: 'center' as const,
		marginBottom: 32,
	},
	controls: {
		textAlign: 'center' as const,
		marginTop: 16,
		color: '#999',
		fontSize: 12,
	},
	keyHint: {
		margin: '0 8px',
	},
};
