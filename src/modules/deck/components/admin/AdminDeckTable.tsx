'use client';

import { createDeck, deleteDeck, updateDeck } from '@/modules/deck/deck.actions';
import { deckParsers } from '@/modules/deck/deck.params';
import { DeleteOutlined, EditOutlined, FolderOpenOutlined, PlusOutlined } from '@ant-design/icons';
import {
	Button,
	Form,
	Input,
	Modal,
	Popconfirm,
	Space,
	Switch,
	Table,
	Tag,
	Tooltip,
	message,
} from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import React, { useState } from 'react';

interface Deck {
	id: string;
	title: string;
	description: string | null;
	isPublic: boolean;
	author: { name: string | null; email: string | null };
	_count: { vocabularies: number; stories: number };
	createdAt: Date;
}

interface AdminDeckTableProps {
	decks: Deck[];
	total: number;
}

export default function AdminDeckTable({ decks, total }: AdminDeckTableProps) {
	// Nuqs State
	const [page, setPage] = useQueryState('page', deckParsers.page.withOptions({ shallow: false }));
	const [limit, setLimit] = useQueryState(
		'limit',
		deckParsers.limit.withOptions({ shallow: false }),
	);
	const [sort, setSort] = useQueryState('sort', deckParsers.sort.withOptions({ shallow: false }));
	const [order, setOrder] = useQueryState(
		'order',
		deckParsers.order.withOptions({ shallow: false }),
	);

	// Local UI State
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
	const [loading, setLoading] = useState(false);
	const [form] = Form.useForm();
	const router = useRouter();

	const handleTableChange = (pagination: any, filters: any, sorter: any) => {
		// Pagination
		setPage(pagination.current);
		setLimit(pagination.pageSize);

		// Sorting
		if (sorter.field) {
			setSort(sorter.field as string);
			setOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
		} else {
			setSort(null);
			setOrder(null);
		}
	};

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
				const res = await updateDeck(editingDeck.id, values);
				if (!res.success) throw new Error(res.error);
				message.success('Deck updated');
			} else {
				const res = await createDeck(values);
				if (!res.success) throw new Error(res.error);
				message.success('Deck created');
			}
			setIsModalOpen(false);
			router.refresh(); // Data refresh still needed for Create/Update content changes
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
			sorter: true,
			sortOrder: sort === 'title' ? (order === 'asc' ? 'ascend' : 'descend') : null,
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
					<Tag>{r._count.vocabularies || 0} Vocab</Tag>
					<Tag>{r._count.stories || 0} Stories</Tag>
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

			<Table
				dataSource={decks}
				columns={columns as any}
				rowKey="id"
				pagination={{
					current: page || 1,
					pageSize: limit || 10,
					total: total,
					showSizeChanger: true,
				}}
				onChange={handleTableChange}
			/>

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
