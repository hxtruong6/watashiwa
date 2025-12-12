import React from 'react';
import { Form, Input, Card, Button, Space, Divider, Row, Col } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

export default function KanjiEditor() {
	return (
		<>
			<Divider>Kanji Info</Divider>
			<Row gutter={16}>
				<Col span={6}>
					<Form.Item name="kanji" label="Kanji" rules={[{ required: true }]}>
						<Input style={{ fontSize: 24, textAlign: 'center' }} />
					</Form.Item>
				</Col>
				<Col span={9}>
					<Form.Item name="hanViet" label="Han-Viet">
						<Input />
					</Form.Item>
				</Col>
				<Col span={9}>
					<Form.Item name="strokes" label="Strokes">
						<Input type="number" />
					</Form.Item>
				</Col>
			</Row>

			<Row gutter={16}>
				<Col span={12}>
					<Form.Item name="onyomi" label="Onyomi">
						<Input placeholder="ア、 カ" />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item name="kunyomi" label="Kunyomi">
						<Input placeholder="あ.う、 ..." />
					</Form.Item>
				</Col>
			</Row>

			<Form.Item name="meaning" label="Meaning" rules={[{ required: true }]}>
				<Input.TextArea rows={2} />
			</Form.Item>

			<Divider>Examples (Compounds)</Divider>
			<Form.List name="examples">
				{(fields, { add, remove }) => (
					<>
						{fields.map(({ key, name, ...restField }) => (
							<Card
								size="small"
								key={key}
								style={{ marginBottom: 8 }}
								styles={{ body: { padding: '12px' } }}
							>
								<Space align="baseline" style={{ display: 'flex', width: '100%' }}>
									<Form.Item
										{...restField}
										name={[name, 'compound']}
										label="Word"
										style={{ width: 120 }}
									>
										<Input />
									</Form.Item>
									<Form.Item
										{...restField}
										name={[name, 'reading']}
										label="Reading"
										style={{ width: 120 }}
									>
										<Input />
									</Form.Item>
									<Form.Item
										{...restField}
										name={[name, 'meaning']}
										label="Meaning"
										style={{ flex: 1 }}
									>
										<Input />
									</Form.Item>
									<MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
								</Space>
							</Card>
						))}
						<Form.Item>
							<Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
								Add Compound Example
							</Button>
						</Form.Item>
					</>
				)}
			</Form.List>
		</>
	);
}
