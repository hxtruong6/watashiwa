'use client';

import { createComment } from '@/services/comments';
import { SendOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input, Select } from 'antd';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

interface CommentFormProps {
	entityId: string;
	entityType: 'vocab' | 'kanji';
	onSuccess: () => void;
}

const { Option } = Select;
const { TextArea } = Input;

export default function CommentForm({ entityId, entityType, onSuccess }: CommentFormProps) {
	const t = useTranslations('Comments');
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const onFinish = async (values: {
		content: string;
		type: 'MNEMONIC' | 'USAGE_TIP' | 'CULTURAL_NOTE' | 'EXAMPLE' | 'GRAMMAR' | 'GENERAL';
	}) => {
		setLoading(true);
		setError(null);

		const result = await createComment(entityId, entityType, values.content, values.type);

		if (result.success) {
			form.resetFields();
			onSuccess();
		} else {
			setError(result.error || t('postError'));
		}
		setLoading(false);
	};

	return (
		<div style={{ padding: 16, background: '#f9f9f9', borderRadius: 8, marginBottom: 16 }}>
			{error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
			<Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ type: 'GENERAL' }}>
				<Form.Item
					name="type"
					label={t('typeLabel')}
					rules={[{ required: true }]}
					style={{ marginBottom: 12 }}
				>
					<Select>
						<Option value="MNEMONIC">🧠 {t('typeMnemonic')}</Option>
						<Option value="USAGE_TIP">💡 {t('typeTip')}</Option>
						<Option value="CULTURAL_NOTE">⛩️ {t('typeCulture')}</Option>
						<Option value="EXAMPLE">📝 {t('typeExample')}</Option>
						<Option value="GRAMMAR">📖 {t('typeGrammar')}</Option>
						<Option value="GENERAL">💬 {t('typeGeneral')}</Option>
					</Select>
				</Form.Item>

				<Form.Item
					name="content"
					label={t('contentLabel')}
					rules={[
						{ required: true, message: t('validationRequired') },
						{ min: 5, message: t('validationTooShort') },
						{ max: 500, message: t('validationTooLong') },
					]}
					style={{ marginBottom: 24 }}
				>
					<TextArea
						style={{ fontSize: 12 }}
						rows={3}
						placeholder={t('placeholder')}
						showCount
						maxLength={500}
					/>
				</Form.Item>

				<Form.Item style={{ marginBottom: 0, marginTop: 12 }}>
					<Button type="primary" htmlType="submit" loading={loading} icon={<SendOutlined />} block>
						{t('postButton')}
					</Button>
				</Form.Item>
			</Form>
		</div>
	);
}
