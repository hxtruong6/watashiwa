import { InlineInput } from '@/modules/admin/components/QA/InlineInput';
import { useWorkbenchStore } from '@/modules/admin/store/useWorkbenchStore';
import { DeleteOutlined, PlusOutlined, SoundOutlined } from '@ant-design/icons';
import { Button, Collapse, Flex, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';
import React from 'react';

const { Text } = Typography;

export const CardExamples: React.FC = () => {
	const { token } = theme.useToken();
	const t = useTranslations('Admin.Content');
	const { activeItem, locale, addExample, updateExample, removeExample } = useWorkbenchStore();

	if (!activeItem) return null;
	const examples = activeItem.examples || [];

	const handleAdd = () => {
		addExample({
			sentence: '',
			translation: { vi: '', en: '' },
			audio: '',
		});
	};

	const handlePlay = (e: React.MouseEvent, url: string, text: string) => {
		e.stopPropagation();
		if (url) {
			new Audio(url).play().catch(console.error);
		} else {
			const u = new SpeechSynthesisUtterance(text);
			u.lang = 'ja-JP';
			window.speechSynthesis.speak(u);
		}
	};

	return (
		<Collapse
			ghost
			size="small"
			defaultActiveKey={['1']}
			items={[
				{
					key: '1',
					label: (
						<Text type="secondary">
							{t('cardExamples')} ({examples.length})
						</Text>
					),
					children: (
						<Flex vertical gap="medium">
							{examples.map((ex, i) => (
								<div
									key={i}
									className="group" // For hover effects
									style={{
										position: 'relative',
										padding: '8px',
										borderRadius: 8,
										border: `1px solid ${token.colorBorderSecondary}`,
										background: token.colorFillQuaternary,
									}}
								>
									{/* Top Row: Sentence + Audio + Delete */}
									<Flex justify="space-between" align="start" gap="small">
										<div style={{ flex: 1 }}>
											<InlineInput
												value={ex.sentence}
												onChange={(val) => updateExample(i, { ...ex, sentence: val })}
												placeholder="Japanese sentence"
												textStyle={{ fontWeight: 600 }}
											/>
										</div>
										<Button
											type="text"
											size="small"
											icon={<SoundOutlined />}
											onClick={(e) => handlePlay(e, ex.audio || '', ex.sentence)}
										/>
										<Button
											type="text"
											size="small"
											danger
											icon={<DeleteOutlined />}
											onClick={() => removeExample(i)}
											// Only show on hover?
											// For now, always visible or use opacity trick
											style={{ opacity: 0.5 }}
											onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
											onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
										/>
									</Flex>

									{/* Translation Row */}
									<InlineInput
										value={ex.translation[locale] || ''}
										onChange={(val) =>
											updateExample(i, {
												...ex,
												translation: { ...ex.translation, [locale]: val },
											})
										}
										placeholder="Translation..."
										textStyle={{ fontSize: 13, color: token.colorTextSecondary }}
									/>
								</div>
							))}

							{/* Add Button */}
							<Button
								type="dashed"
								block
								icon={<PlusOutlined />}
								onClick={handleAdd}
								style={{ color: token.colorTextSecondary }}
							>
								Add Example
							</Button>
						</Flex>
					),
				},
			]}
		/>
	);
};
