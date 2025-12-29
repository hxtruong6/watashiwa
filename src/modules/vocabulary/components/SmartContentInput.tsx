import ImageUploader from '@/components/Shared/ImageUploader';
import VocabEditor from '@/modules/admin/components/VocabEditor';
import { createVocabulary } from '@/modules/vocabulary/vocabulary.actions';
import {
	EditOutlined,
	PlusOutlined,
	ThunderboltOutlined,
	TranslationOutlined,
} from '@ant-design/icons';
import {
	Button,
	Card,
	Col,
	Form,
	Input,
	InputNumber,
	Row,
	Select,
	Tabs,
	Tag,
	message,
	theme,
} from 'antd';
import { Modal } from 'antd';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

interface SmartContentInputProps {
	deckId: string;
	onSuccess: () => void;
}

const { useToken } = theme;

export default function SmartContentInput({ deckId, onSuccess }: SmartContentInputProps) {
	const { token } = useToken();
	const t = useTranslations('MyDecks');
	const [form] = Form.useForm();
	const [advancedForm] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState('manual-vocab');
	const [messageApi, contextHolder] = message.useMessage();
	const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleFinishVocab = async (values: any) => {
		setLoading(true);
		try {
			const res = await createVocabulary({
				deckId,
				data: {
					wordSurface: values.wordSurface,
					readingKana: values.readingKana || '',
					meanings: values.meaning, // Passed as string, handled by action
					hanViet: values.hanViet,
					exampleSentence: values.exampleSentence, // Special field handled by action Logic
					// Or better pass as examples array:
					examples: values.exampleSentence
						? [{ sentence: values.exampleSentence, translation: values.exampleTranslation }]
						: [],
					imageUrl: values.imageUrl,
				},
			});

			if (res.success) {
				messageApi.success(t('msgVocabAdded') || 'Vocabulary added successfully!');
				form.resetFields();
				onSuccess();
			} else {
				messageApi.error(res.error || 'Failed to add vocabulary');
			}
		} catch (error) {
			console.error(error);
			messageApi.error('An error occurred');
		} finally {
			setLoading(false);
		}
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleFinishKanji = async (values: any) => {
		setLoading(true);
		try {
			const res = await createVocabulary({
				deckId,
				data: {
					kanji: values.kanji,
					// meaning -> meanings
					meanings: values.meaning,
					onyomi: values.onyomi || [],
					kunyomi: values.kunyomi || [],
					strokes: values.strokes || 0,
					hanViet: values.hanViet,
					imageUrl: values.imageUrl,
				},
			});

			if (res.success) {
				messageApi.success(t('msgKanjiAdded') || 'Kanji added successfully!');
				form.resetFields();
				onSuccess();
			} else {
				messageApi.error(res.error || 'Failed to add kanji');
			}
		} catch (error) {
			console.error(error);
			messageApi.error('An error occurred');
		} finally {
			setLoading(false);
		}
	};

	const handleAdvancedSubmit = async () => {
		try {
			const values = await advancedForm.validateFields();
			setLoading(true);

			let res;
			if (activeTab === 'manual-vocab') {
				res = await createVocabulary({
					deckId,
					data: {
						wordSurface: values.wordSurface,
						readingKana: values.readingKana,
						meanings: values.meaning,
						hanViet: values.hanViet,
						examples: values.exampleSentence, // Assuming Advanced Form passes full objects?
						// Wait, advanced form naming is ambiguous.
						// Let's pass as is, Action handles mapping of legacy keys
						exampleSentence: values.exampleSentence,
						kanjiBreakdown: values.kanjiBreakdown,
						wordParts: values.wordParts,
					},
				});
				if (res.success) {
					messageApi.success(t('msgAdvancedVocabAdded'));
					advancedForm.resetFields();
					setIsAdvancedModalOpen(false);
					onSuccess();
				} else {
					messageApi.error(res.error || 'Failed to add vocabulary');
				}
			} else if (activeTab === 'manual-kanji') {
				res = await createVocabulary({
					deckId,
					data: {
						kanji: values.kanji,
						meanings: values.meaning,
						onyomi: values.onyomi || [],
						kunyomi: values.kunyomi || [],
						strokes: values.strokes || 0,
						hanViet: values.hanViet,
						radicals: values.radicals,
						examples: values.examples,
					},
				});
				if (res.success) {
					messageApi.success(t('msgAdvancedKanjiAdded'));
					advancedForm.resetFields();
					setIsAdvancedModalOpen(false);
					onSuccess();
				} else {
					messageApi.error(res.error || 'Failed to add kanji');
				}
			}
		} catch (error) {
			console.error(error);
			messageApi.error('Validation failed or error occurred');
		} finally {
			setLoading(false);
		}
	};

	const renderVocabForm = () => (
		<>
			{/* Simple Form */}
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
						<Form.Item name="readingKana" label={t('labelReading')}>
							<Input placeholder="e.g. ねこ" />
						</Form.Item>
					</Col>
				</Row>

				<Form.Item name="imageUrl" label="Image">
					<ImageUploader purpose="card" shape="rect" />
				</Form.Item>

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

			<div style={{ textAlign: 'center', marginTop: 16 }}>
				<Button type="link" onClick={() => setIsAdvancedModalOpen(true)}>
					{t('advancedModeVocab')}
				</Button>
			</div>
		</>
	);

	const renderKanjiForm = () => (
		<>
			<Form form={form} layout="vertical" onFinish={handleFinishKanji}>
				{/* Keep existing simple kanji fields */}
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

				<Form.Item name="imageUrl" label="Image">
					<ImageUploader purpose="card" shape="rect" />
				</Form.Item>

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

			<div style={{ textAlign: 'center', marginTop: 16 }}>
				<Button type="link" onClick={() => setIsAdvancedModalOpen(true)}>
					{t('advancedModeKanji')}
				</Button>
			</div>
		</>
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
					<p style={{ color: '#666' }}> {t('aiDescription')}</p>
				</div>
			),
		},
	];

	return (
		<>
			<Card
				title="Add Content"
				style={{ marginBottom: 24, borderRadius: 16, border: '1px solid #e0e0e0' }}
				styles={{ header: { borderBottom: 'none', fontSize: 18, color: token.colorPrimary } }}
			>
				{contextHolder}
				<Tabs
					activeKey={activeTab}
					onChange={setActiveTab}
					items={items}
					style={{ marginTop: -16 }}
				/>
			</Card>

			<Modal
				title={activeTab === 'manual-vocab' ? t('advancedTitleVocab') : t('advancedTitleKanji')}
				open={isAdvancedModalOpen}
				onCancel={() => setIsAdvancedModalOpen(false)}
				onOk={handleAdvancedSubmit}
				width={800}
				okText={t('saveToDeck')}
				confirmLoading={loading}
			>
				<Form form={advancedForm} layout="vertical">
					{activeTab === 'manual-vocab' ? <VocabEditor /> : <div>Kanji Editor Not Available</div>}
				</Form>
			</Modal>
		</>
	);
}
