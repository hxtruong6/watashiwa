/**
 * DeckView - Add Content Section
 *
 * Section for adding new content to the deck
 */
import SmartContentInput from '@/modules/vocabulary/components/SmartContentInput';
import { CloseOutlined, EditOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface AddContentSectionProps {
	deckId: string;
	showAddContent: boolean;
	onShowAddContent: (show: boolean) => void;
}

export function AddContentSection({
	deckId,
	showAddContent,
	onShowAddContent,
}: AddContentSectionProps) {
	const t = useTranslations('Decks');
	const router = useRouter();

	if (!showAddContent) {
		return (
			<Button
				type="dashed"
				icon={<EditOutlined />}
				onClick={() => onShowAddContent(true)}
				block
				style={{ height: 48, borderRadius: 12, fontSize: 16 }}
			>
				{t('addNewContent')}
			</Button>
		);
	}

	return (
		<div style={{ position: 'relative' }}>
			<SmartContentInput deckId={deckId} onSuccess={() => router.refresh()} />
			<Button
				type="text"
				icon={<CloseOutlined />}
				onClick={() => onShowAddContent(false)}
				style={{ position: 'absolute', right: 16, top: 16, zIndex: 10 }}
				title={t('close')}
			/>
		</div>
	);
}
