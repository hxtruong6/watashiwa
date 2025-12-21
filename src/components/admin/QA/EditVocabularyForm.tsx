import {
	HistoryOutlined,
	MinusCircleOutlined,
	PlusOutlined,
	ThunderboltOutlined,
} from '@ant-design/icons';
// Import from sibling
import { Button, Divider, Flex, Form, Input, Select, Space, Typography } from 'antd';
import React, { useEffect } from 'react';

import type { ExtendedVocabulary } from './VerificationCard';

const { Title, Text } = Typography;
const { TextArea } = Input;

export interface EditVocabularyFormProps {
	initialValues: ExtendedVocabulary;
	onSubmit: (values: Partial<ExtendedVocabulary>) => void;
	onCancel: () => void;
	loading?: boolean;
	id?: string;
}

export const EditVocabularyForm: React.FC<EditVocabularyFormProps> = ({
	initialValues,
	onSubmit,
	onCancel,
	loading,
	id,
}) => {
	const [form] = Form.useForm();

	// Hydrate form on mount
	useEffect(() => {
		// Ensure nested objects are initialized to avoid undefined errors
		const vals = {
			...initialValues,
			etymology: initialValues.etymology || { parts: [], note: { vi: '', en: '' } },
			confusions: initialValues.confusions || [], // Flattened structure for UI
		};
		form.setFieldsValue(vals);
	}, [initialValues, form]);

	const handleFinish = (values: any) => {
		onSubmit(values); // In real app, we might need to transform 'confusions' back to relations
	};

	return (
		<Form
			form={form}
			layout="vertical"
			onFinish={handleFinish}
			initialValues={initialValues}
			requiredMark="optional"
			id={id}
		>
			<Title level={4}>Core Data</Title>
			<Flex gap="middle" wrap="wrap">
				<Form.Item
					name="wordSurface"
					label="Kanji / Surface"
					rules={[{ required: true }]}
					style={{ flex: '1 1 200px' }}
				>
					<Input size="large" />
				</Form.Item>
				<Form.Item
					name="wordReading"
					label="Reading (Hiragana)"
					rules={[{ required: true }]}
					style={{ flex: '1 1 200px' }}
				>
					<Input size="large" />
				</Form.Item>
			</Flex>
			<Flex gap="middle" wrap="wrap">
				<Form.Item name="wordRomaji" label="Romaji" style={{ flex: '1 1 200px' }}>
					<Input />
				</Form.Item>
				<Form.Item name="tags" label="Tags" style={{ flex: '1 1 200px' }}>
					<Select mode="tags" placeholder="e.g. n5, verb" />
				</Form.Item>
			</Flex>
			{/* Pitch Accent Section */}
			<Flex gap="middle" wrap="wrap">
				<Form.Item name="pitchPattern" label="Pitch Pattern (Int)" style={{ width: 120 }}>
					<Select>
						<Select.Option value={0}>0 (Heiban)</Select.Option>
						<Select.Option value={1}>1 (Atamadaka)</Select.Option>
						<Select.Option value={2}>2 (Nakadaka)</Select.Option>
						<Select.Option value={3}>3 (Nakadaka)</Select.Option>
						<Select.Option value={4}>4 (Kio)</Select.Option>
						<Select.Option value={5}>5 (Kio)</Select.Option>
					</Select>
				</Form.Item>
				<Form.Item name="pitchSvgPath" label="SVG Path (d attribute)" style={{ flex: 1 }}>
					<Input placeholder="M0,20 L25,5..." />
				</Form.Item>
			</Flex>
			<Divider />
			{/* MEANINGS */}
			<Title level={4}>Meanings</Title>
			<Form.Item label="Vietnamese Meanings">
				<Form.List name={['meanings', 'vi']}>
					{(fields, { add, remove }) => (
						<>
							{fields.map(({ key, name, ...restField }) => (
								<Flex key={key} gap="small" className="mb-2">
									<Form.Item
										{...restField}
										name={[name]}
										noStyle
										rules={[{ required: true, message: 'Missing meaning' }]}
									>
										<Input placeholder="Meaning (e.g. Ăn)" />
									</Form.Item>
									<Button onClick={() => remove(name)} icon={<MinusCircleOutlined />} danger />
								</Flex>
							))}
							<Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
								Add VI Meaning
							</Button>
						</>
					)}
				</Form.List>
			</Form.Item>
			<Form.Item label="English Meanings">
				<Form.List name={['meanings', 'en']}>
					{(fields, { add, remove }) => (
						<>
							{fields.map(({ key, name, ...restField }) => (
								<Flex key={key} gap="small" className="mb-2">
									<Form.Item
										{...restField}
										name={[name]}
										noStyle
										rules={[{ required: true, message: 'Missing meaning' }]}
									>
										<Input placeholder="Meaning (e.g. To Eat)" />
									</Form.Item>
									<Button onClick={() => remove(name)} icon={<MinusCircleOutlined />} danger />
								</Flex>
							))}
							<Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
								Add EN Meaning
							</Button>
						</>
					)}
				</Form.List>
			</Form.Item>
			<Divider />
			{/* ETYMOLOGY */}
			<Title level={4}>
				<HistoryOutlined /> Etymology
			</Title>
			<Form.List name={['etymology', 'parts']}>
				{(fields, { add, remove }) => (
					<div style={{ marginBottom: 16 }}>
						{fields.map(({ key, name, ...restField }) => (
							<Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
								<Form.Item
									{...restField}
									name={[name, 'kanji']}
									rules={[{ required: true }]}
									noStyle
								>
									<Input placeholder="Kanji (e.g. 食)" style={{ width: 80 }} />
								</Form.Item>
								<Form.Item
									{...restField}
									name={[name, 'han_viet']}
									rules={[{ required: true }]}
									noStyle
								>
									<Input placeholder="Han Viet (e.g. THỰC)" style={{ width: 100 }} />
								</Form.Item>
								<Form.Item {...restField} name={[name, 'meaning', 'vi']} noStyle>
									<Input placeholder="Meaning (e.g. Ăn)" style={{ width: 120 }} />
								</Form.Item>
								<MinusCircleOutlined onClick={() => remove(name)} />
							</Space>
						))}
						<Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
							Add Etymology Part
						</Button>
					</div>
				)}
			</Form.List>
			<Form.Item name={['etymology', 'note', 'vi']} label="Etymology Note (VI)">
				<TextArea rows={2} placeholder="Note about kanji composition..." />
			</Form.Item>
			<Divider />
			{/* MNEMONICS */}
			<Title level={4}>
				<ThunderboltOutlined /> Mnemonic (The Hook)
			</Title>
			<Form.Item name={['mnemonic', 'vi']} label="Vietnamese Mnemonic">
				<TextArea rows={2} />
			</Form.Item>
			<Form.Item name={['mnemonic', 'en']} label="English Mnemonic">
				<TextArea rows={2} />
			</Form.Item>
			<Divider />
			{/* INTERFERENCE SHIELD (Confusions) */}
			<Title level={4} type="warning">
				<ThunderboltOutlined /> Interference Shield
			</Title>
			<Form.List name="confusions">
				{(fields, { add, remove }) => (
					<>
						{fields.map(({ key, name, ...restField }) => (
							<div
								key={key}
								style={{
									border: '1px solid #f0f0f0',
									padding: 12,
									marginBottom: 16,
									borderRadius: 8,
								}}
							>
								<Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
									<Text strong>Confusion Pair #{name + 1}</Text>
									<Button
										onClick={() => remove(name)}
										type="text"
										danger
										icon={<MinusCircleOutlined />}
									/>
								</Flex>

								<Form.Item
									{...restField}
									name={[name, 'word']}
									label="Confusing Word"
									rules={[{ required: true }]}
								>
									<Input placeholder="e.g. 飲む" />
								</Form.Item>

								<Form.Item
									{...restField}
									name={[name, 'explanation', 'mnemonic', 'vi']}
									label="Distinction Mnemonic"
								>
									<TextArea rows={2} placeholder="Explain the difference..." />
								</Form.Item>

								<Flex gap="small">
									<Form.Item
										{...restField}
										name={[name, 'explanation', 'item1_nuance', 'vi']}
										label="This Word Nuance"
										style={{ flex: 1 }}
									>
										<Input />
									</Form.Item>
									<Form.Item
										{...restField}
										name={[name, 'explanation', 'item2_nuance', 'vi']}
										label="Other Word Nuance"
										style={{ flex: 1 }}
									>
										<Input />
									</Form.Item>
								</Flex>
							</div>
						))}
						<Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
							Add Confusion Pair
						</Button>
					</>
				)}
			</Form.List>
			<div style={{ height: 60 }} /> {/* Spacer for sticky footer */}
			<div
				style={{
					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
					padding: '16px 24px',
					background: 'rgba(255,255,255,0.9)',
					backdropFilter: 'blur(10px)',
					borderTop: '1px solid #f0f0f0',
					display: 'flex',
					justifyContent: 'flex-end',
					gap: 8,
					borderRadius: '0 0 8px 8px',
				}}
			>
				<Button onClick={onCancel}>Cancel</Button>
				<Button type="primary" htmlType="submit" loading={loading}>
					Save Changes
				</Button>
			</div>
		</Form>
	);
};
