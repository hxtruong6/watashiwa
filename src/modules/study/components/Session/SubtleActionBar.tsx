'use client';

import { BranchesOutlined, ReadOutlined, SearchOutlined, WarningOutlined } from '@ant-design/icons';
import { Button, Tooltip, theme } from 'antd';
import { motion } from 'framer-motion';
import React from 'react';

interface SubtleActionBarProps {
	onRelatedWords: () => void;
	onConfusions: () => void;
	onEtymology: () => void;
	onMoreExamples: () => void;
	visibility: {
		relatedWords: boolean;
		confusions: boolean;
		etymology: boolean;
		moreExamples: boolean;
	};
}

export const SubtleActionBar: React.FC<SubtleActionBarProps> = ({
	onRelatedWords,
	onConfusions,
	onEtymology,
	onMoreExamples,
	visibility,
}) => {
	const { token } = theme.useToken();

	const iconButtonStyle: React.CSSProperties = {
		color: token.colorTextTertiary,
		opacity: 0.7,
		transition: 'opacity 0.2s, transform 0.2s',
	};

	const actions = [
		{
			key: 'related',
			icon: <BranchesOutlined />,
			visible: visibility.relatedWords,
			onClick: onRelatedWords,
			label: 'Related Words',
		},
		{
			key: 'confusions',
			icon: <WarningOutlined />,
			visible: visibility.confusions,
			onClick: onConfusions,
			label: 'Confusions',
		},
		{
			key: 'etymology',
			icon: <SearchOutlined />,
			visible: visibility.etymology,
			onClick: onEtymology,
			label: 'Etymology',
		},
		{
			key: 'examples',
			icon: <ReadOutlined />,
			visible: visibility.moreExamples,
			onClick: onMoreExamples,
			label: 'More Examples',
		},
	].filter((a) => a.visible);

	if (actions.length === 0) return null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: 0.2 }}
			style={{
				display: 'flex',
				justifyContent: 'center',
				gap: 16,
				marginTop: 16,
				padding: '8px 0',
			}}
		>
			{actions.map((action) => (
				<Tooltip key={action.key} title={action.label}>
					<Button
						type="text"
						shape="circle"
						size="small"
						icon={React.cloneElement(action.icon, { style: iconButtonStyle })}
						onClick={action.onClick}
						onMouseEnter={(e) => {
							e.currentTarget.style.opacity = '1';
							e.currentTarget.style.transform = 'scale(1.1)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.opacity = '0.7';
							e.currentTarget.style.transform = 'scale(1)';
						}}
						aria-label={action.label}
						style={{
							width: 40,
							height: 40,
						}}
					/>
				</Tooltip>
			))}
		</motion.div>
	);
};
