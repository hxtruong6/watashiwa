import ImageUploader from '@/components/Shared/ImageUploader';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Divider, Form, Input, Row, Space } from 'antd';
import React from 'react';

export default function VocabEditor() {
	return (
		<>
			<Divider>Basic Info</Divider>
			<Row gutter={16}>
				<Col span={8}>
					<Form.Item name="wordSurface" label="Word" rules={[{ required: true }]}>
						<Input />
					</Form.Item>
				</Col>
				<Col span={8}>
					<Form.Item name="readingKana" label="Reading (Kana)" rules={[{ required: true }]}>
						<Input />
					</Form.Item>
				</Col>
				<Col span={8}>
					<Form.Item name="hanViet" label="Han-Viet">
						<Input />
					</Form.Item>
				</Col>
			</Row>

			<Form.Item name="imageUrl" label="Image">
				<ImageUploader purpose="card" shape="rect" />
			</Form.Item>

			<Form.Item name="meaning" label="Meaning" rules={[{ required: true }]}>
				<Input.TextArea rows={2} />
			</Form.Item>

			<Divider>Word Parts (Furigana & Romaji)</Divider>
			<Form.List name="wordParts">
				{(fields, { add, remove }) => (
					<>
						{fields.map(({ key, name, ...restField }, index) => (
							<Card
								size="small"
								key={key}
								style={{ marginBottom: 8 }}
								styles={{ body: { padding: '12px 12px 0 12px' } }}
							>
								<Row gutter={8} align="middle">
									<Col span={1} style={{ textAlign: 'center', color: '#888' }}>
										{index + 1}
									</Col>
									<Col span={7}>
										<Form.Item
											{...restField}
											name={[name, 'text']}
											label="Text"
											rules={[{ required: true, message: 'Missing text' }]}
										>
											<Input placeholder="Kanji/Kana" />
										</Form.Item>
									</Col>
									<Col span={7}>
										<Form.Item {...restField} name={[name, 'furigana']} label="Furigana">
											<Input placeholder="Reading" />
										</Form.Item>
									</Col>
									<Col span={7}>
										<Form.Item {...restField} name={[name, 'romaji']} label="Romaji">
											<Input placeholder="Roma" />
										</Form.Item>
									</Col>
									<Col span={2}>
										<MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
									</Col>
								</Row>
							</Card>
						))}
						<Form.Item>
							<Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
								Add Word Part
							</Button>
						</Form.Item>
					</>
				)}
			</Form.List>

			<Divider>Kanji Breakdown</Divider>
			<Form.List name="kanjiBreakdown">
				{(fields, { add, remove }) => (
					<>
						{fields.map(({ key, name, ...restField }) => (
							<Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
								<Form.Item
									{...restField}
									name={[name, 'kanji']}
									rules={[{ required: true, message: 'Missing kanji' }]}
									style={{ width: 60 }}
								>
									<Input placeholder="Kanji" />
								</Form.Item>
								<Form.Item {...restField} name={[name, 'han_viet']} style={{ width: 100 }}>
									<Input placeholder="Han-Viet" />
								</Form.Item>
								<Form.Item {...restField} name={[name, 'meaning']} style={{ width: 200 }}>
									<Input placeholder="Meaning" />
								</Form.Item>
								<MinusCircleOutlined onClick={() => remove(name)} />
							</Space>
						))}
						<Form.Item>
							<Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
								Add Kanji Breakdown
							</Button>
						</Form.Item>
					</>
				)}
			</Form.List>

			<Divider>Example Sentence</Divider>
			<Form.Item name={['exampleSentence', 'sentence']} label="Sentence">
				<Input />
			</Form.Item>
			<Form.Item name={['exampleSentence', 'translation']} label="Translation">
				<Input />
			</Form.Item>

			<Form.List name={['exampleSentence', 'parts']}>
				{(fields, { add, remove }) => (
					<>
						{fields.map(({ key, name, ...restField }, index) => (
							<Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
								<span style={{ color: '#888', marginRight: 8 }}>{index + 1}</span>
								<Form.Item
									{...restField}
									name={[name, 'text']}
									rules={[{ required: true }]}
									style={{ width: 120 }}
								>
									<Input placeholder="Text" />
								</Form.Item>
								<Form.Item {...restField} name={[name, 'furigana']} style={{ width: 120 }}>
									<Input placeholder="Furigana" />
								</Form.Item>
								<MinusCircleOutlined onClick={() => remove(name)} />
							</Space>
						))}
						<Form.Item>
							<Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
								Add Example Part
							</Button>
						</Form.Item>
					</>
				)}
			</Form.List>
		</>
	);
}
