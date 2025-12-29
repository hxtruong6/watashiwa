import { InlineInput } from '@/modules/admin/components/QA/InlineInput';
import { useWorkbenchStore } from '@/modules/admin/store/useWorkbenchStore';
import { HistoryOutlined } from '@ant-design/icons';
import { Card, Flex, Tag, Tooltip, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';
import React from 'react';

const { Title } = Typography;

export const CardEtymology: React.FC = () => {
	const { token } = theme.useToken();
	const t = useTranslations('Admin.Content');
	const { activeItem, locale, updateEtymologyNote } = useWorkbenchStore();

	if (!activeItem) return null;

	const { etymology } = activeItem;
	// Always allow editing if component renders?
	// The parent renders this part. We can hide if empty inside, BUT we want to allow adding notes.
	// So we render if we have data OR to allow input.

	return (
		<Card size="small" style={{ border: 'none', boxShadow: 'none', background: 'transparent' }}>
			<Title
				level={5}
				type="secondary"
				style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}
			>
				<HistoryOutlined /> {t('cardEtymology')}
			</Title>

			{/* Parts (Read Only mainly, they come from data) */}
			<Flex gap="small" wrap="wrap" className="mb-2">
				{etymology?.parts?.map((p, i) => (
					<Tooltip key={i} title={p.meaning.vi}>
						<Tag color="geekblue" style={{ fontSize: 14, padding: '4px 8px' }}>
							{p.kanji} : {p.han_viet}
						</Tag>
					</Tooltip>
				))}
			</Flex>

			{/* Note - Inline Editable */}
			<div style={{ marginTop: 8 }}>
				<InlineInput
					multiline
					value={etymology?.note?.[locale] || ''}
					onChange={updateEtymologyNote}
					placeholder={t('cardEtymology') + ' note...'}
					textStyle={{
						fontSize: 13,
						fontStyle: 'italic',
						color: token.colorTextSecondary,
					}}
				/>
			</div>
		</Card>
	);
};
