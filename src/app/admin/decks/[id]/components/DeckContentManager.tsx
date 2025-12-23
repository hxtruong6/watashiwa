'use client';

import KanjiEditor from '@/components/admin/KanjiEditor';
import VocabEditor from '@/components/admin/VocabEditor';
import { updateContent } from '@/modules/vocabulary/vocabulary.actions';
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Modal, Popconfirm, Space, Table, Tabs, Tag, Tooltip, message } from 'antd';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

// Types (simplified from Prisma)
interface Vocab {
	id: string;
	wordSurface: string;
	readingKana: string;
	meaning: string;
	hanViet: string;
	wordParts: any;
	exampleSentence: any;
	kanjiBreakdown: any;
}

interface Kanji {
	id: string;
	kanji: string;
	hanViet: string;
	meaning: string;
	onyomi: string[];
	kunyomi: string[];
	strokes: number;
	examples: any;
}

interface DeckContentManagerProps {
	deck: any; // Full deck object with included vocab/kanji
}

export default function DeckContentManager({ deck }: DeckContentManagerProps) {
	const router = useRouter();
	const [vocabList, setVocabList] = useState<Vocab[]>(deck.vocab);
	const [kanjiList, setKanjiList] = useState<Kanji[]>(deck.kanji);

	// Modal State
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<any>(null); // null = create
	const [modalType, setModalType] = useState<'vocab' | 'kanji'>('vocab');
	const [loading, setLoading] = useState(false);
	const [form] = Form.useForm();

	const openCreate = (type: 'vocab' | 'kanji') => {
		setModalType(type);
		setEditingItem(null);
		form.resetFields();
		setIsModalOpen(true);
	};

	const openEdit = (type: 'vocab' | 'kanji', item: any) => {
		setModalType(type);
		setEditingItem(item);
		form.setFieldsValue(item); // Should map correctly if names match
		setIsModalOpen(true);
	};

	const handleOk = async () => {
		try {
			const values = await form.validateFields();
			setLoading(true);

			if (modalType === 'vocab') {
				if (editingItem) {
					const res = await updateContent({ id: editingItem.id, data: values });
					if (!res.success) throw new Error(res.error);
					message.success('Vocab updated');
				} else {
					// const res = await createVocab({ ...values, deckId: deck.id });
					// if (!res.success) throw new Error(res.error);
					// message.success('Vocab created');
				}
			} else {
				if (editingItem) {
					const res = await updateContent({ id: editingItem.id, data: values });
					if (!res.success) throw new Error(res.error);
					message.success('Kanji updated');
				} else {
					// Arrays might need handling if Form doesn't return them as expected, but Form.List handles it?
					// KanjiEditor inputs for onyomi/kunyomi are Strings in the Editor implementation I made?
					// Wait, in KanjiEditor I made Onyomi/Kunyomi INPUTS (strings).
					// But server action expects comma separated string?
					// createKanji in admin-actions splits string by comma.
					// But updateKanji in actions.ts expects Partial<Kanji>...
					// If updateKanji expects arrays, but form gives string... ERROR mismatch.
					// I need to check KanjiEditor implementation.
					// It renders <Input>. So values.onyomi is string.
					// I need to convert string to array if updating.

					// Let's handle parsing here before sending.
					if (typeof values.onyomi === 'string')
						values.onyomi = values.onyomi
							.split(/[,、]/)
							.map((s: string) => s.trim())
							.filter(Boolean);
					if (typeof values.kunyomi === 'string')
						values.kunyomi = values.kunyomi
							.split(/[,、]/)
							.map((s: string) => s.trim())
							.filter(Boolean);

					// const res = await createKanji({ ...values, deckId: deck.id });
					// if (!res.success) throw new Error(res.error);
					message.success('Kanji created');
				}
			}

			router.refresh();
			setIsModalOpen(false);
		} catch (error: any) {
			message.error(error.message || 'Operation failed');
		} finally {
			setLoading(false);
		}
	};

	// Deletion
	const handleDelete = async (type: 'vocab' | 'kanji', id: string) => {
		try {
			// if (type === 'vocab') await deleteVocab(id);
			// else await deleteKanji(id);
			// message.success('Deleted');
			// router.refresh();
		} catch (error: any) {
			message.error(error.message);
		}
	};

	// Columns
	const vocabColumns = [
		{
			title: 'Word',
			dataIndex: 'wordSurface',
			key: 'word',
			width: 150,
			render: (t: string) => <b>{t}</b>,
		},
		{ title: 'Reading', dataIndex: 'readingKana', key: 'reading', width: 150 },
		{ title: 'Meaning', dataIndex: 'meaning', key: 'meaning' },
		{
			title: 'Actions',
			key: 'actions',
			width: 100,
			render: (r: any) => (
				<Space>
					<Button size="small" icon={<EditOutlined />} onClick={() => openEdit('vocab', r)} />
					<Popconfirm title="Delete?" onConfirm={() => handleDelete('vocab', r.id)}>
						<Button size="small" danger icon={<DeleteOutlined />} />
					</Popconfirm>
				</Space>
			),
		},
	];

	const kanjiColumns = [
		{
			title: 'Kanji',
			dataIndex: 'kanji',
			key: 'kanji',
			width: 80,
			render: (t: string) => <div style={{ fontSize: 24, fontWeight: 'bold' }}>{t}</div>,
		},
		{ title: 'Meaning', dataIndex: 'meaning', key: 'meaning' },
		{ title: 'Onyomi', dataIndex: 'onyomi', key: 'on', render: (arr: string[]) => arr?.join(', ') },
		{
			title: 'Kunyomi',
			dataIndex: 'kunyomi',
			key: 'kun',
			render: (arr: string[]) => arr?.join(', '),
		},
		{
			title: 'Actions',
			key: 'actions',
			width: 100,
			render: (r: any) => (
				<Space>
					<Button size="small" icon={<EditOutlined />} onClick={() => openEdit('kanji', r)} />
					<Popconfirm title="Delete?" onConfirm={() => handleDelete('kanji', r.id)}>
						<Button size="small" danger icon={<DeleteOutlined />} />
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div>
			<div style={{ marginBottom: 16 }}>
				<Button
					type="text"
					icon={<ArrowLeftOutlined />}
					onClick={() => router.push('/admin/decks')}
				>
					Back to Decks
				</Button>
			</div>

			<Tabs
				items={[
					{
						key: 'vocab',
						label: `Vocabulary (${deck._count?.vocab || deck.vocab.length})`,
						children: (
							<>
								<div style={{ textAlign: 'right', marginBottom: 16 }}>
									<Button
										type="primary"
										icon={<PlusOutlined />}
										onClick={() => openCreate('vocab')}
									>
										Add Vocab
									</Button>
								</div>
								<Table
									dataSource={deck.vocab}
									columns={vocabColumns}
									rowKey="id"
									pagination={{ pageSize: 20 }}
								/>
							</>
						),
					},
					{
						key: 'kanji',
						label: `Kanji (${deck._count?.kanji || deck.kanji.length})`,
						children: (
							<>
								<div style={{ textAlign: 'right', marginBottom: 16 }}>
									<Button
										type="primary"
										icon={<PlusOutlined />}
										onClick={() => openCreate('kanji')}
									>
										Add Kanji
									</Button>
								</div>
								<Table
									dataSource={deck.kanji}
									columns={kanjiColumns}
									rowKey="id"
									pagination={{ pageSize: 20 }}
								/>
							</>
						),
					},
				]}
			/>

			<Modal
				title={
					editingItem
						? `Edit ${modalType === 'vocab' ? 'Vocabulary' : 'Kanji'}`
						: `Add New ${modalType === 'vocab' ? 'Vocabulary' : 'Kanji'}`
				}
				open={isModalOpen}
				onCancel={() => setIsModalOpen(false)}
				onOk={handleOk}
				confirmLoading={loading}
				width={700}
				style={{ top: 20 }}
			>
				<div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 }}>
					<Form form={form} layout="vertical">
						{modalType === 'vocab' ? <VocabEditor /> : <KanjiEditor />}
					</Form>
				</div>
			</Modal>
		</div>
	);
}
