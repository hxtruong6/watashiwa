import { InlineInput } from '@/modules/admin/components/QA/InlineInput';
import { useWorkbenchStore } from '@/modules/admin/store/useWorkbenchStore';
import { DeleteOutlined, PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Button, Divider, Flex, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';
import React from 'react';

const { Text } = Typography;

export const CardShield: React.FC = () => {
	const { token } = theme.useToken();
	const t = useTranslations('Admin.Content');
	const { activeItem, locale, addConfusion, updateConfusion, removeConfusion } =
		useWorkbenchStore();

	if (!activeItem) return null;
	const confusions = activeItem.confusions || [];

	// If no confusions and no intent to add, we can hide?
	// Usually we want to show it exists to add items.

	const handleAdd = () => {
		addConfusion({
			word: 'New Word',
			explanation: {
				mnemonic: { vi: '', en: '' },
				item1_nuance: { vi: '', en: '' },
				item2_nuance: { vi: '', en: '' },
			},
		});
	};

	if (confusions.length === 0) {
		// Render just a "Add Confusion" button or section wrapper?
		// Let's render a collapsed or minimal state to encourage adding.
		return (
			<div style={{ marginTop: 16 }}>
				<Button type="dashed" size="small" icon={<PlusOutlined />} onClick={handleAdd}>
					Add Interference Shield
				</Button>
			</div>
		);
	}

	return (
		<div
			style={{
				background: token.colorWarningBg,
				padding: '16px',
				borderRadius: token.borderRadiusLG,
				border: `1px dashed ${token.colorWarningBorder}`,
				marginTop: 16,
			}}
		>
			<Flex align="center" gap="small" style={{ marginBottom: 8 }}>
				<ThunderboltOutlined style={{ color: token.colorWarning }} />
				<Text strong style={{ color: token.colorWarningText }}>
					{t('cardShield')}
				</Text>
			</Flex>

			{confusions.map((conf, idx) => (
				<div key={idx} style={{ marginTop: idx > 0 ? 12 : 0, position: 'relative' }}>
					{/* Header: Word + Delete */}
					<Flex justify="space-between" align="baseline">
						<Flex gap="small" align="baseline">
							<Text type="danger">vs.</Text>
							<InlineInput
								value={conf.word}
								onChange={(val) => updateConfusion(idx, { ...conf, word: val })}
								textStyle={{ fontWeight: 'bold', color: token.colorError }}
							/>
						</Flex>
						<Button
							type="text"
							size="small"
							danger
							icon={<DeleteOutlined />}
							onClick={() => removeConfusion(idx)}
						/>
					</Flex>

					{/* Target Word Nuance */}
					<div style={{ marginBottom: 4 }}>
						<Text type="secondary" style={{ fontSize: 11 }}>
							Target Word Nuance:
						</Text>
						<InlineInput
							multiline
							value={conf.explanation.item1_nuance[locale]}
							onChange={(val) =>
								updateConfusion(idx, {
									...conf,
									explanation: {
										...conf.explanation,
										item1_nuance: { ...conf.explanation.item1_nuance, [locale]: val },
									},
								})
							}
							textStyle={{ fontSize: 13 }}
							placeholder="Nuance of this card's word..."
						/>
					</div>

					{/* Confusion Word Nuance */}
					<div style={{ marginBottom: 4 }}>
						<Text type="secondary" style={{ fontSize: 11 }}>
							{conf.word || 'Other'} Nuance:
						</Text>
						<InlineInput
							multiline
							value={conf.explanation.item2_nuance[locale]}
							onChange={(val) =>
								updateConfusion(idx, {
									...conf,
									explanation: {
										...conf.explanation,
										item2_nuance: { ...conf.explanation.item2_nuance, [locale]: val },
									},
								})
							}
							textStyle={{ fontSize: 13 }}
							placeholder={`Nuance of ${conf.word || 'other word'}...`}
						/>
					</div>

					{/* Mnemonic */}
					<div
						style={{
							marginTop: 4,
							padding: '4px 8px',
							background: 'rgba(255,255,255,0.5)',
							borderRadius: 4,
						}}
					>
						<Flex gap="small">
							<Text>💡</Text>
							<InlineInput
								multiline
								value={conf.explanation.mnemonic[locale]}
								onChange={(val) =>
									updateConfusion(idx, {
										...conf,
										explanation: {
											...conf.explanation,
											mnemonic: { ...conf.explanation.mnemonic, [locale]: val },
										},
									})
								}
								textStyle={{ fontSize: 12 }}
								placeholder="Differentiation trick..."
							/>
						</Flex>
					</div>

					{idx < confusions.length - 1 && <Divider style={{ margin: '8px 0' }} />}
				</div>
			))}

			<Button
				type="dashed"
				block
				size="small"
				icon={<PlusOutlined />}
				onClick={handleAdd}
				style={{ marginTop: 8 }}
			>
				Add Confusion
			</Button>
		</div>
	);
};
