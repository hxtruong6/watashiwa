'use client';

import VocabEditor from '@/modules/admin/components/VocabEditor';
import {
	createVocabulary,
	deleteVocabulary,
	updateContent,
} from '@/modules/vocabulary/vocabulary.actions';
import {
	ArrowLeftOutlined,
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import { Deck, Vocabulary } from '@prisma/client';
import { Button, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, message } from 'antd';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

interface DeckContentManagerProps {
	deck: Deck & {
		_count: { vocabularies: number; stories: number };
	};
	vocabularies: Vocabulary[];
	total: number;
	currentPage: number;
	searchParams: {
		search?: string;
		status?: string;
	};
}

export default function DeckContentManager({
	deck,
	vocabularies,
	total,
	currentPage,
	searchParams = { search: '', status: '' },
}: DeckContentManagerProps) {
	const t = useTranslations('Admin.DeckDetail');
	const router = useRouter();
	const pathname = usePathname();
	// We don't use useSearchParams hook for reading, we use the prop passed from page.tsx (Cleaner in App Router)
	// Actually, for router.push we need to construct query.

	// Modal State
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<Vocabulary | null>(null); // null = create
	const [loading, setLoading] = useState(false);
	const [form] = Form.useForm();

	// --- URL State Management ---
	const handleSearch = (value: string) => {
		const params = new URLSearchParams();
		if (value) params.set('search', value);
		if (searchParams.status) params.set('status', searchParams.status);
		router.push(`${pathname}?${params.toString()}`);
	};

	const handleStatusFilter = (value: string) => {
		const params = new URLSearchParams();
		if (searchParams.search) params.set('search', searchParams.search);
		if (value) params.set('status', value);
		router.push(`${pathname}?${params.toString()}`);
	};

	const handlePageChange = (page: number, pageSize: number) => {
		const params = new URLSearchParams();
		if (searchParams.search) params.set('search', searchParams.search);
		if (searchParams.status) params.set('status', searchParams.status);
		params.set('page', page.toString());
		// params.set('limit', pageSize.toString()); // If we want variable page size
		router.push(`${pathname}?${params.toString()}`);
	};

	// --- Transformations (Same as before) ---
	const toFormValues = (item: Vocabulary) => {
		const meanings = item.meanings as any;
		const etymology = item.etymology as any;
		const mnemonic = item.mnemonic as any;
		const examples = item.examples as any;

		return {
			...item,
			tags: item.tags || [],
			meanings: {
				vi: Array.isArray(meanings?.vi) ? meanings.vi.join(', ') : meanings?.vi || '',
				en: Array.isArray(meanings?.en) ? meanings.en.join(', ') : meanings?.en || '',
			},
			mnemonic: {
				vi: mnemonic?.vi || '',
				en: mnemonic?.en || '',
			},
			parts: etymology?.parts || [],
			examples: examples || [],
			// Legacy/Schema compat
			readingKana: item.wordReading,
		};
	};

	const toApiValues = (values: any) => {
		// Parse meanings from Comma Separated String to Array
		const parseCsv = (str: string) =>
			str
				? str
						.split(/,|、/)
						.map((s: string) => s.trim())
						.filter(Boolean)
				: [];

		return {
			...values,
			wordReading: values.wordReading || values.readingKana, // Fallback
			meanings: {
				vi: parseCsv(values.meanings?.vi),
				en: parseCsv(values.meanings?.en),
			},
			mnemonic: values.mnemonic,
			etymology: {
				parts: values.parts || [],
			},
			examples: values.examples || [],
		};
	};

	// --- Actions ---

	const openCreate = () => {
		setEditingItem(null);
		form.resetFields();
		// Set some defaults
		form.setFieldsValue({ tags: ['vocab'] });
		setIsModalOpen(true);
	};

	const openEdit = (item: Vocabulary) => {
		setEditingItem(item);
		form.resetFields();
		form.setFieldsValue(toFormValues(item));
		setIsModalOpen(true);
	};

	const handleOk = async () => {
		try {
			const values = await form.validateFields();
			setLoading(true);

			const apiData = toApiValues(values);

			if (editingItem) {
				const res = await updateContent({ id: editingItem.id, data: apiData });
				if (!res.success) throw new Error(res.error);
				message.success('Vocabulary updated');
			} else {
				const res = await createVocabulary({ deckId: deck.id, data: apiData });
				if (!res.success) throw new Error(res.error);
				message.success('Vocabulary created');
			}

			router.refresh();
			setIsModalOpen(false);
		} catch (error: any) {
			message.error(error.message || 'Operation failed');
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			const res = await deleteVocabulary({ id });
			if (!res?.success) throw new Error(res?.error);
			message.success('Deleted');
			router.refresh();
		} catch (error: any) {
			message.error(error.message);
		}
	};

	// --- Table ---

	const vocabColumns = [
		{
			title: t('columns.word'),
			key: 'word',
			width: 180,
			render: (_: any, r: Vocabulary) => (
				<Space direction="vertical" size={0}>
					<span style={{ fontSize: 16, fontWeight: 'bold' }}>{r.wordSurface}</span>
					<span style={{ color: '#666' }}>
						{r.wordReading} {r.wordRomaji ? `(${r.wordRomaji})` : ''}
					</span>
				</Space>
			),
		},
		{
			title: t('columns.hanViet'),
			dataIndex: 'hanViet',
			key: 'hanViet',
			width: 100,
			render: (t: string) => <Tag color="blue">{t}</Tag>,
		},
		{
			title: t('columns.meaning'),
			key: 'meaning',
			render: (_: any, r: Vocabulary) => {
				const m = r.meanings as any; // JSON
				return (
					<Space direction="vertical" size={0} style={{ fontSize: 13 }}>
						{m?.vi && (
							<div style={{ color: '#1677ff' }}>
								🇻🇳 {Array.isArray(m.vi) ? m.vi.join(', ') : m.vi}
							</div>
						)}
						{m?.en && (
							<div style={{ color: '#666' }}>🇬🇧 {Array.isArray(m.en) ? m.en.join(', ') : m.en}</div>
						)}
					</Space>
				);
			},
		},
		{
			title: t('columns.status'),
			dataIndex: 'contentStatus',
			key: 'status',
			width: 100,
			render: (status: string) => {
				const color =
					status === 'PUBLISHED'
						? 'green'
						: status === 'DRAFT'
							? 'orange'
							: status === 'VERIFIED'
								? 'cyan'
								: 'red';
				return <Tag color={color}>{status}</Tag>;
			},
		},
		{
			title: t('columns.actions'),
			key: 'actions',
			width: 100,
			render: (r: Vocabulary) => (
				<Space>
					<Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
					<Popconfirm
						title={t('columns.actions')}
						description="This cannot be undone."
						onConfirm={() => handleDelete(r.id)}
					>
						<Button size="small" danger icon={<DeleteOutlined />} />
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div>
			<div
				style={{
					marginBottom: 16,
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<Space>
					<Button
						type="text"
						icon={<ArrowLeftOutlined />}
						onClick={() => router.push('/admin/decks')}
					>
						{t('backToDecks')}
					</Button>
					<Input.Search
						placeholder={t('searchPlaceholder')}
						defaultValue={searchParams.search}
						onSearch={handleSearch}
						style={{ width: 200 }}
						allowClear
					/>
					<Select
						placeholder={t('statusFilter')}
						allowClear
						style={{ width: 120 }}
						defaultValue={searchParams.status}
						options={['DRAFT', 'AI_GENERATED', 'VERIFIED', 'PUBLISHED'].map((s) => ({
							label: s,
							value: s,
						}))}
						onChange={handleStatusFilter}
					/>
				</Space>
				<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
					{t('addVocab')}
				</Button>
			</div>

			<Table
				dataSource={vocabularies}
				columns={vocabColumns}
				rowKey="id"
				pagination={{
					current: currentPage,
					pageSize: 20,
					total: total,
					onChange: handlePageChange,
					showSizeChanger: false, // Keep it simple for now
				}}
				size="small"
			/>

			<Modal
				title={editingItem ? t('addVocab').replace('Add', 'Edit') : t('addVocab')}
				open={isModalOpen}
				onCancel={() => setIsModalOpen(false)}
				onOk={handleOk}
				confirmLoading={loading}
				width={800}
				style={{ top: 20 }}
				destroyOnClose
			>
				<div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 }}>
					<Form form={form} layout="vertical">
						<VocabEditor />
					</Form>
				</div>
			</Modal>
		</div>
	);
}
