'use client';

import React, { useState } from 'react';
import {
	Table,
	Button,
	Space,
	Modal,
	Form,
	Input,
	Switch,
	message,
	Tooltip,
	Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { createDeck, updateDeck, deleteDeck } from '@/services/admin-actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Deck {
	id: string;
	title: string;
	description: string | null;
	isPublic: boolean;
	author: { name: string | null; email: string | null };
	_count: { vocab: number; kanji: number };
	createdAt: Date;
}

export default function AdminDeckTable({ initialDecks }: { initialDecks: Deck[] }) {
	const [decks, setDecks] = useState<Deck[]>(initialDecks);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingDeck, setEditingDeck] = useState<Deck | null>(null); // If null, creating new
	const [loading, setLoading] = useState(false);
	const [form] = Form.useForm();
	const router = useRouter();

	const openCreate = () => {
		setEditingDeck(null);
		form.resetFields();
		form.setFieldValue('isPublic', false);
		setIsModalOpen(true);
	};

	const openEdit = (deck: Deck) => {
		setEditingDeck(deck);
		form.setFieldsValue({
			title: deck.title,
			description: deck.description,
			isPublic: deck.isPublic,
		});
		setIsModalOpen(true);
	};

	const handleOk = async () => {
		try {
			const values = await form.validateFields();
			setLoading(true);

			if (editingDeck) {
				// Update
				const res = await updateDeck(editingDeck.id, values);
				if (!res.success) throw new Error(res.error);
				message.success('Deck updated');
				// Optimistic or Refresh? Refresh helps sync everything.
				router.refresh();
				// Local update for immediate feedback (optional but nice)
				setDecks((prev) => prev.map((d) => (d.id === editingDeck.id ? { ...d, ...values } : d)));
			} else {
				// Create
				const res = await createDeck(values);
				if (!res.success) throw new Error(res.error);
				message.success('Deck created');
				router.refresh();
				// We can't easily add to local state without full author object etc return,
				// so router.refresh() handles next fetch.
			}
			setIsModalOpen(false);
		} catch (error: any) {
			message.error(error.message || 'Operation failed');
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			const res = await deleteDeck(id);
			if (!res.success) throw new Error(res.error);
			message.success('Deck deleted');
			setDecks((prev) => prev.filter((d) => d.id !== id));
			router.refresh();
		} catch (error: any) {
			message.error(error.message || 'Delete failed');
		}
	};

	const columns = [
		{
			title: 'Title',
			dataIndex: 'title',
			key: 'title',
			render: (text: string, record: Deck) => (
				<div>
					<div style={{ fontWeight: 600 }}>{text}</div>
					<div style={{ fontSize: 12, color: '#888' }}>{record.description}</div>
				</div>
			),
		},
		{
			title: 'Author',
			key: 'author',
			render: (r: Deck) => r.author?.name || r.author?.email || 'Unknown',
		},
		{
			title: 'Content',
			key: 'content',
			render: (r: Deck) => (
				<Space>
					<Tag>{r._count.vocab} Vocab</Tag>
					<Tag>{r._count.kanji} Kanji</Tag>
				</Space>
			),
		},
		{
			title: 'Status',
			dataIndex: 'isPublic',
			key: 'isPublic',
			render: (pub: boolean) => (
				<Tag color={pub ? 'green' : 'orange'}>{pub ? 'Public' : 'Private'}</Tag>
			),
		},
		{
			title: 'Actions',
			key: 'actions',
			render: (r: Deck) => (
				<Space>
					<Tooltip title="Manage Content">
						<Link href={`/admin/decks/${r.id}`}>
							<Button icon={<FolderOpenOutlined />} size="small" type="primary" ghost />
						</Link>
					</Tooltip>
					<Tooltip title="Edit Info">
						<Button icon={<EditOutlined />} size="small" onClick={() => openEdit(r)} />
					</Tooltip>
					<Popconfirm title="Delete deck?" onConfirm={() => handleDelete(r.id)}>
						<Button icon={<DeleteOutlined />} size="small" danger />
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div>
			<div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
				<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
					Create Deck
				</Button>
			</div>

			<Table dataSource={decks} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />

			<Modal
				title={editingDeck ? 'Edit Deck' : 'Create New Deck'}
				open={isModalOpen}
				onCancel={() => setIsModalOpen(false)}
				onOk={handleOk}
				confirmLoading={loading}
			>
				<Form form={form} layout="vertical">
					<Form.Item name="title" label="Deck Title" rules={[{ required: true }]}>
						<Input />
					</Form.Item>
					<Form.Item name="description" label="Description">
						<Input.TextArea rows={3} />
					</Form.Item>
					<Form.Item name="isPublic" label="Visibility" valuePropName="checked">
						<Switch checkedChildren="Public" unCheckedChildren="Private" />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}

// Helper for Tag (was missing import above? No, I see Space above, Tag missing)
import { Tag } from 'antd';
