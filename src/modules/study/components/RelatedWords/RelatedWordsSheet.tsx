'use client';

import type { RelatedWord } from '@/modules/study/types/related-words';
import { BranchesOutlined } from '@ant-design/icons';
import { Drawer, Flex, Typography, theme } from 'antd';
import React from 'react';

import { RelatedWordsList } from './RelatedWordsList';

interface RelatedWordsSheetProps {
	open: boolean;
	onClose: () => void;
	relatedWords: RelatedWord[];
	onSelectWord: (word: RelatedWord) => void;
}

export const RelatedWordsSheet: React.FC<RelatedWordsSheetProps> = ({
	open,
	onClose,
	relatedWords,
	onSelectWord,
}) => {
	const { token } = theme.useToken();

	return (
		<Drawer
			placement="bottom"
			open={open}
			onClose={onClose}
			height="50vh"
			closable={false}
			maskClosable
			styles={{
				header: { display: 'none' },
				body: {
					padding: 0,
					// Use elevated background to stand out from card (Dev Notes)
					background: token.colorBgElevated,
				},
				wrapper: {
					// Rounded top corners (16px) matching "Zen" aesthetic (AC4)
					borderTopLeftRadius: 16,
					borderTopRightRadius: 16,
					overflow: 'hidden',
				},
			}}
		>
			{/* Drag Handle */}
			<Flex justify="center" style={{ padding: '12px 0 8px' }}>
				<div
					style={{
						width: 40,
						height: 4,
						borderRadius: 2,
						background: token.colorBorder,
					}}
				/>
			</Flex>

			{/* Header */}
			<div style={{ padding: '0 16px 16px' }}>
				<Flex align="center" gap={8}>
					<BranchesOutlined style={{ color: token.colorPrimary, fontSize: 18 }} />
					<Typography.Title level={5} style={{ margin: 0 }}>
						Related Words
					</Typography.Title>
				</Flex>
			</div>

			{/* Content */}
			<div
				style={{
					padding: '0 16px 24px',
					overflowY: 'auto',
					maxHeight: 'calc(50vh - 80px)',
				}}
			>
				<RelatedWordsList words={relatedWords} onSelect={onSelectWord} variant="sheet" />
			</div>
		</Drawer>
	);
};
