import React, { useState } from 'react';
import { Card, Tabs, Form, Input, Button, message, Tag, InputNumber, Select, Row, Col } from 'antd';
import {
	ThunderboltOutlined,
	EditOutlined,
	TranslationOutlined,
	PlusOutlined,
} from '@ant-design/icons';
import { createVocab, createKanji } from '@/services/user-content-actions';
import { useTranslations } from 'next-intl';

interface SmartContentInputProps {
	deckId: string;
	onSuccess: () => void;
}

export default function SmartContentInput({ deckId, onSuccess }: SmartContentInputProps) {
	const t = useTranslations('MyDecks');
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState('manual-vocab');

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleFinishVocab = async (values: any) => {
		setLoading(true);
		try {
			const res = await createVocab(deckId, {
				wordSurface: values.wordSurface,
				readingKana: values.readingKana,
				meaning: values.meaning,
				hanViet: values.hanViet,
				exampleSentence: values.exampleSentence
					? { sentence: values.exampleSentence, translation: values.exampleTranslation }
					: {},
			});

			if (res.success) {
				message.success('Vocabulary added!');
				form.resetFields();
				onSuccess();
			} else {
				message.error(res.error || 'Failed to add vocabulary');
			}
		} catch (error) {
			console.error(error);
			message.error('An error occurred');
		} finally {
			setLoading(false);
		}
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleFinishKanji = async (values: any) => {
		setLoading(true);
		try {
			const res = await createKanji(deckId, {
				kanji: values.kanji,
				meaning: values.meaning,
				onyomi: values.onyomi || [],
				kunyomi: values.kunyomi || [],
				strokes: values.strokes || 0,
				hanViet: values.hanViet,
			});

			if (res.success) {
				message.success('Kanji added!');
				form.resetFields();
				onSuccess();
			} else {
				message.error(res.error || 'Failed to add kanji');
			}
		} catch (error) {
			console.error(error);
			message.error('An error occurred');
		} finally {
			setLoading(false);
		}
	};

	const renderVocabForm = () => (
		<Form form={form} layout="vertical" onFinish={handleFinishVocab}>
			<Row gutter={[16, 0]}>
				<Col xs={24} sm={12}>
					<Form.Item
						name="wordSurface"
						label={t('labelWord')}
						rules={[{ required: true, message: 'Required' }]}
					>
						<Input placeholder="e.g. 猫" />
					</Form.Item>
				</Col>
				<Col xs={24} sm={12}>
					<Form.Item
						name="readingKana"
						label={t('labelReading')}
						rules={[{ required: true, message: 'Required' }]}
					>
						<Input placeholder="e.g. ねこ" />
					</Form.Item>
				</Col>
			</Row>

			<Row gutter={[16, 0]}>
				<Col xs={24} sm={16}>
					<Form.Item name="meaning" label={t('labelMeaning')} rules={[{ required: true }]}>
						<Input placeholder="e.g. Cat" />
					</Form.Item>
				</Col>
				<Col xs={24} sm={8}>
					<Form.Item name="hanViet" label={t('labelHanViet')}>
						<Input placeholder="e.g. MIÊU" />
					</Form.Item>
				</Col>
			</Row>

			<Row gutter={[16, 0]}>
				<Col xs={24} sm={12}>
					<Form.Item name="exampleSentence" label={t('labelExample')}>
						<Input placeholder="Japanese sentence" />
					</Form.Item>
				</Col>
				<Col xs={24} sm={12}>
					<Form.Item name="exampleTranslation" label={t('labelTranslation')}>
						<Input placeholder="Meaning" />
					</Form.Item>
				</Col>
			</Row>

			<Form.Item>
				<Button type="primary" htmlType="submit" loading={loading} icon={<PlusOutlined />} block>
					{t('btnAddVocab')}
				</Button>
			</Form.Item>
		</Form>
	);

	const renderKanjiForm = () => (
		<Form form={form} layout="vertical" onFinish={handleFinishKanji}>
			<Row gutter={[16, 0]}>
				<Col xs={12} sm={6}>
					<Form.Item name="kanji" label={t('labelKanji')} rules={[{ required: true, max: 1 }]}>
						<Input placeholder="日" style={{ fontSize: 24, textAlign: 'center' }} maxLength={1} />
					</Form.Item>
				</Col>
				<Col xs={12} sm={6}>
					<Form.Item name="strokes" label={t('labelStrokes')}>
						<InputNumber min={1} style={{ width: '100%' }} />
					</Form.Item>
				</Col>
				<Col xs={24} sm={12}>
					<Form.Item name="hanViet" label={t('labelHanViet')}>
						<Input placeholder="NHẬT" />
					</Form.Item>
				</Col>
			</Row>

			<Form.Item name="meaning" label={t('labelMeaning')} rules={[{ required: true }]}>
				<Input placeholder="Day, Sun" />
			</Form.Item>

			<Row gutter={[16, 0]}>
				<Col xs={24} sm={12}>
					<Form.Item name="onyomi" label={t('labelOnyomi')}>
						<Select mode="tags" placeholder="e.g. ニチ, ジツ" tokenSeparators={[',', ' ']} />
					</Form.Item>
				</Col>
				<Col xs={24} sm={12}>
					<Form.Item name="kunyomi" label={t('labelKunyomi')}>
						<Select mode="tags" placeholder="e.g. ひ, -び" tokenSeparators={[',', ' ']} />
					</Form.Item>
				</Col>
			</Row>

			<Form.Item>
				<Button type="primary" htmlType="submit" loading={loading} icon={<PlusOutlined />} block>
					{t('btnAddKanji')}
				</Button>
			</Form.Item>
		</Form>
	);

	const items = [
		{
			key: 'manual-vocab',
			label: (
				<span>
					<EditOutlined /> {t('tabVocab')}
				</span>
			),
			children: renderVocabForm(),
		},
		{
			key: 'manual-kanji',
			label: (
				<span>
					<TranslationOutlined /> {t('tabKanji')}
				</span>
			),
			children: renderKanjiForm(),
		},
		{
			key: 'ai-magic',
			label: (
				<span>
					<ThunderboltOutlined /> {t('tabSmart')}
				</span>
			),
			children: (
				<div style={{ textAlign: 'center', padding: '24px' }}>
					<Tag color="purple" style={{ fontSize: 16, padding: '4px 12px', marginBottom: 16 }}>
						{t('aiComingSoon')}
					</Tag>
					<p style={{ color: '#666' }}>{t('aiDescription')}</p>
				</div>
			),
		},
	];

	return (
		<Card
			title="Add Content"
			style={{ marginBottom: 24, borderRadius: 16, border: '1px solid #e0e0e0' }}
			styles={{ header: { borderBottom: 'none', fontSize: 18, color: '#1E3A5F' } }}
		>
			<Tabs
				activeKey={activeTab}
				onChange={setActiveTab}
				items={items}
				style={{ marginTop: -16 }}
			/>
		</Card>
	);
}
