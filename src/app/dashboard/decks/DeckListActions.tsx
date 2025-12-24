'use client';

import DeckFormModal from '@/modules/deck/components/DeckFormModal';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface DeckListActionsProps {
	mode: 'create' | 'edit';
	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	deck?: any;
}

export default function DeckListActions({ mode, deck }: DeckListActionsProps) {
	const [visible, setVisible] = useState(false);
	const router = useRouter(); // To refresh page after action
	const t = useTranslations('MyDecks');

	const handleSuccess = () => {
		router.refresh();
	};

	if (mode === 'create') {
		return (
			<>
				<Button type="primary" icon={<PlusOutlined />} onClick={() => setVisible(true)}>
					{t('createNew')}
				</Button>
				<DeckFormModal
					visible={visible}
					onCancel={() => setVisible(false)}
					onSuccess={handleSuccess}
					initialValues={{
						title: '',
						description: '',
						isPublic: false,
						headerImage: '',
					}}
				/>
			</>
		);
	}

	return (
		<>
			<Button type="text" size="small" icon={<EditOutlined />} onClick={() => setVisible(true)}>
				{t('edit')}
			</Button>
			<DeckFormModal
				visible={visible}
				onCancel={() => setVisible(false)}
				onSuccess={handleSuccess}
				initialValues={{
					id: deck.id,
					title: deck.title,
					description: deck.description,
					isPublic: deck.isPublic,
					headerImage: deck.headerImage,
				}}
			/>
		</>
	);
}
