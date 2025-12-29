import { InlineInput } from '@/modules/admin/components/QA/InlineInput';
import { useWorkbenchStore } from '@/modules/admin/store/useWorkbenchStore';
import { BulbOutlined } from '@ant-design/icons';
import { Flex, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';
import React from 'react';

const { Text } = Typography;

export const CardMnemonic: React.FC = () => {
	const { token } = theme.useToken();
	const t = useTranslations('Admin.Content');
	const { activeItem, locale, updateMnemonic } = useWorkbenchStore();

	if (!activeItem) return null;

	const mnemonic = activeItem.mnemonic;

	return (
		<div
			style={{
				// background: token.colorSuccessBg,
				padding: '16px',
				borderRadius: token.borderRadiusLG,
				borderLeft: `4px solid ${token.colorSuccess}`,
				marginBottom: 16,
			}}
		>
			<Flex align="center" gap="small" style={{ marginBottom: 4 }}>
				<BulbOutlined style={{ color: token.colorSuccess }} />
				<Text strong style={{ color: token.colorSuccessText }}>
					{t('cardMemoryHook')} ({locale.toUpperCase()})
				</Text>
			</Flex>
			<InlineInput
				multiline
				value={mnemonic?.[locale] || ''}
				onChange={updateMnemonic}
				placeholder="Add a memory hook..."
				textStyle={{ fontSize: 15, lineHeight: 1.6 }}
			/>
		</div>
	);
};
