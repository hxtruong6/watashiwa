import ImageUploader from '@/components/Shared/ImageUploader';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Divider, Form, Input, Row, Select, Space } from 'antd';
import { useTranslations } from 'next-intl';
import React from 'react';

const TAG_OPTIONS = ['n5', 'n4', 'n3', 'n2', 'n1', 'noun', 'verb', 'adj', 'kanji', 'vocab'];

export default function VocabEditor() {
	const t = useTranslations('Admin.VocabEditor');

	return (
		<>
			<Divider orientation="left">{t('basicInfo')}</Divider>
			<Row gutter={16}>
				<Col span={6}>
					<Form.Item name="wordSurface" label={t('wordSurface')} rules={[{ required: true }]}>
						<Input placeholder="e.g. 私" />
					</Form.Item>
				</Col>
				<Col span={6}>
					<Form.Item name="wordReading" label={t('readingKana')} rules={[{ required: true }]}>
						<Input placeholder="e.g. わたし" />
					</Form.Item>
				</Col>
				<Col span={6}>
					<Form.Item name="wordRomaji" label={t('romaji')}>
						<Input placeholder="e.g. watashi" />
					</Form.Item>
				</Col>
				<Col span={6}>
					<Form.Item name="hanViet" label={t('hanViet')}>
						<Input placeholder="e.g. TƯ" />
					</Form.Item>
				</Col>
			</Row>

			<Row gutter={16}>
				<Col span={12}>
					<Form.Item name="tags" label={t('tags')}>
						<Select mode="tags" options={TAG_OPTIONS.map((t) => ({ label: t, value: t }))} />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item name="imageUrl" label={t('image')}>
						<ImageUploader purpose="card" shape="rect" />
					</Form.Item>
				</Col>
			</Row>

			<Divider orientation="left">{t('meanings')}</Divider>
			<Row gutter={16}>
				<Col span={12}>
					<Form.Item
						name={['meanings', 'vi']}
						label={t('meaningsVi')}
						rules={[{ required: true }]}
						help="Enter meanings separated by commas"
					>
						<Input.TextArea rows={3} placeholder="e.g. tôi, tớ, mình" />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item
						name={['meanings', 'en']}
						label={t('meaningsEn')}
						help="Enter meanings separated by commas"
					>
						<Input.TextArea rows={3} placeholder="e.g. I, me, myself" />
					</Form.Item>
				</Col>
			</Row>

			<Divider orientation="left">{t('mnemonics')}</Divider>
			<Row gutter={16}>
				<Col span={12}>
					<Form.Item name={['mnemonic', 'vi']} label={t('mnemonicVi')}>
						<Input.TextArea rows={3} />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item name={['mnemonic', 'en']} label={t('mnemonicEn')}>
						<Input.TextArea rows={3} />
					</Form.Item>
				</Col>
			</Row>

			<Divider orientation="left">{t('etymology')}</Divider>
			<Form.List name="parts">
				{(fields, { add, remove }) => (
					<>
						{fields.map(({ key, name, ...restField }, index) => (
							<Card
								size="small"
								key={key}
								style={{ marginBottom: 8 }}
								styles={{ body: { padding: '12px' } }}
							>
								<Row gutter={8} align="middle">
									<Col span={1}>{index + 1}</Col>
									<Col span={5}>
										<Form.Item
											{...restField}
											name={[name, 'kanji']}
											label="Kanji"
											style={{ marginBottom: 0 }}
										>
											<Input />
										</Form.Item>
									</Col>
									<Col span={5}>
										<Form.Item
											{...restField}
											name={[name, 'han_viet']}
											label="Han-Viet"
											style={{ marginBottom: 0 }}
										>
											<Input />
										</Form.Item>
									</Col>
									<Col span={11}>
										<Form.Item
											{...restField}
											name={[name, 'meaning', 'vi']}
											label="Meaning (VI)"
											style={{ marginBottom: 0 }}
										>
											<Input />
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
								{t('addEtymology')}
							</Button>
						</Form.Item>
					</>
				)}
			</Form.List>

			<Divider orientation="left">{t('examples')}</Divider>
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
								<Space direction="vertical" style={{ width: '100%' }}>
									<Form.Item
										{...restField}
										name={[name, 'sentence']}
										label={t('sentence')}
										rules={[{ required: true }]}
									>
										<Input />
									</Form.Item>
									<Row gutter={16}>
										<Col span={12}>
											<Form.Item
												{...restField}
												name={[name, 'translation', 'vi']}
												label={t('translationVi')}
											>
												<Input />
											</Form.Item>
										</Col>
										<Col span={12}>
											<Form.Item
												{...restField}
												name={[name, 'translation', 'en']}
												label={t('translationEn')}
											>
												<Input />
											</Form.Item>
										</Col>
									</Row>
									<Button
										type="text"
										danger
										icon={<MinusCircleOutlined />}
										onClick={() => remove(name)}
										style={{ alignSelf: 'flex-end' }}
									>
										Remove Example
									</Button>
								</Space>
							</Card>
						))}
						<Form.Item>
							<Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
								{t('addExample')}
							</Button>
						</Form.Item>
					</>
				)}
			</Form.List>
		</>
	);
}
