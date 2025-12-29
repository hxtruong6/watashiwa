import { InlineInput } from '@/modules/admin/components/QA/InlineInput';
import { useWorkbenchStore } from '@/modules/admin/store/useWorkbenchStore';
import { Flex, theme } from 'antd';
import React from 'react';

export const CardMeanings: React.FC = () => {
	const { token } = theme.useToken();
	const { activeItem, locale, updateMeanings } = useWorkbenchStore();

	if (!activeItem) return null;

	const list = activeItem.meanings?.[locale] || [];

	const handleChange = (index: number, val: string) => {
		const newList = [...list];
		newList[index] = val;
		updateMeanings(newList);
	};

	return (
		<Flex vertical gap="small" wrap="wrap" className="mb-4" align="start">
			{list.map((m, i) => (
				<InlineInput
					key={`${locale}-${i}`}
					value={m}
					onChange={(val) => handleChange(i, val)}
					bordered
					textStyle={{
						fontSize: token.fontSizeLG,
						padding: '4px 12px',
						width: '100%',
						textAlign: 'start',
					}}
				/>
			))}
		</Flex>
	);
};
