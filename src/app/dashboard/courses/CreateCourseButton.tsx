'use client';

import { useState } from 'react';
import { Button, Drawer, Form, Input, Switch, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { createCourse } from '@/services/course-actions';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function CreateCourseButton({
	text,
	type = 'default',
}: {
	text?: string;
	type?: 'default' | 'primary' | 'dashed' | 'link' | 'text';
}) {
	const t = useTranslations('Courses');
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [form] = Form.useForm();
	const router = useRouter();

	const onFinish = async (values: any) => {
		setLoading(true);
		try {
			const res = await createCourse(values);
			if (res.success) {
				message.success(t('createSuccess'));
				setOpen(false);
				form.resetFields();
				router.refresh();
			} else {
				message.error(res.error || t('createError'));
			}
		} catch (error) {
			message.error(t('createError'));
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Button icon={<PlusOutlined />} onClick={() => setOpen(true)} type={type}>
				{text || t('createNew')}
			</Button>
			<Drawer
				title={t('createNew')}
				open={open}
				onClose={() => setOpen(false)}
				width={480}
				styles={{ body: { paddingBottom: 80 } }}
				footer={
					<div style={{ textAlign: 'right' }}>
						<Button onClick={() => setOpen(false)} style={{ marginRight: 8 }}>
							{t('cancel')}
						</Button>
						<Button onClick={() => form.submit()} type="primary" loading={loading}>
							{t('create')}
						</Button>
					</div>
				}
			>
				<Form layout="vertical" form={form} onFinish={onFinish} requiredMark="optional">
					<Form.Item
						name="title"
						label={t('courseTitle')}
						rules={[{ required: true, message: 'Please enter a title' }]}
					>
						<Input placeholder={t('courseTitlePlaceholder')} size="large" />
					</Form.Item>

					<Form.Item name="description" label={t('description')}>
						<Input.TextArea rows={4} placeholder={t('descriptionPlaceholder')} />
					</Form.Item>

					<Form.Item name="headerImage" label={t('headerImage')}>
						<Input placeholder={t('headerImagePlaceholder')} />
					</Form.Item>

					<Form.Item name="level" label={t('levelTag')}>
						<Input placeholder={t('levelTagPlaceholder')} />
					</Form.Item>

					<Form.Item name="isPublic" label={t('publicCourse')} valuePropName="checked">
						<Switch checkedChildren={t('public')} unCheckedChildren={t('private')} />
					</Form.Item>
				</Form>
			</Drawer>
		</>
	);
}
