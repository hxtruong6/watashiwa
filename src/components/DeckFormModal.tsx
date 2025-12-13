'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Switch, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { createDeck, updateDeck } from '@/services/user-content-actions';
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import { useTranslations } from 'next-intl';

interface DeckFormModalProps {
	visible: boolean;
	onCancel: () => void;
	onSuccess: () => void;
	initialValues?: {
		id?: string;
		title: string;
		description?: string;
		isPublic: boolean;
		headerImage?: string;
	};
}

export default function DeckFormModal({
	visible,
	onCancel,
	onSuccess,
	initialValues,
}: DeckFormModalProps) {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const isEdit = !!initialValues?.id;

	// Reset form when visible or initialValues change
	useEffect(() => {
		if (visible) {
			form.resetFields();
			if (initialValues) {
				form.setFieldsValue(initialValues);
			}
		}
	}, [visible, initialValues, form]);

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();
			setLoading(true);

			let result;
			if (isEdit && initialValues?.id) {
				result = await updateDeck(initialValues.id, values);
			} else {
				result = await createDeck(values);
			}

			if (result.success) {
				message.success(isEdit ? 'Deck updated successfully' : 'Deck created successfully');
				onSuccess();
				onCancel();
			} else {
				message.error(result.error || 'Operation failed');
			}
		} catch (error) {
			console.error('Validate Failed:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal
			title={isEdit ? 'Edit Deck' : 'Create New Deck'}
			open={visible}
			onOk={handleSubmit}
			onCancel={onCancel}
			confirmLoading={loading}
			okText={isEdit ? 'Update' : 'Create'}
		>
			<Form form={form} layout="vertical" initialValues={{ isPublic: false }}>
				<Form.Item
					name="title"
					label="Title"
					rules={[{ required: true, message: 'Please enter a title' }]}
				>
					<Input placeholder="e.g., JLPT N5 Vocabulary" />
				</Form.Item>

				<Form.Item name="description" label="Description">
					<Input.TextArea placeholder="What is this deck about?" rows={3} />
				</Form.Item>

				<Form.Item name="isPublic" label="Public Deck" valuePropName="checked">
					<Switch checkedChildren="Public" unCheckedChildren="Private" />
				</Form.Item>

				<Form.Item name="headerImage" label="Cover Image URL (Optional)">
					<Input prefix={<UploadOutlined />} placeholder="https://example.com/image.jpg" />
				</Form.Item>
			</Form>
		</Modal>
	);
}
