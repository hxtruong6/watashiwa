import { getDeckUrl } from '@/lib/utils/urls';
import { addDeckToCourse, searchDecks } from '@/modules/course/course.actions';
import {
	CheckCircleFilled,
	CheckOutlined,
	EyeOutlined,
	PlusOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import { Button, Empty, Input, List, Modal, Spin, Tag, Tooltip, Typography, message } from 'antd';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const { Text } = Typography;

interface DeckSelectorProps {
	courseId: string;
	existingDeckIds: string[];
	onDeckAdded: () => void;
	trigger?: React.ReactNode;
}

const DeckListItem = ({
	deck,
	isAdded,
	addingId,
	onAdd,
}: {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	deck: any;
	isAdded: boolean;
	addingId: string | null;
	onAdd: (id: string) => void;
}) => {
	const t = useTranslations('Courses');

	return (
		<List.Item
			actions={[
				isAdded ? (
					<Tooltip title={t('deckAdded')} key="added">
						<Button
							type="text"
							icon={<CheckCircleFilled style={{ color: '#52c41a', fontSize: 20 }} />}
							disabled
						/>
					</Tooltip>
				) : (
					<Button
						key="add"
						type="primary"
						shape="circle"
						icon={addingId === deck.id ? <CheckOutlined /> : <PlusOutlined />}
						loading={addingId === deck.id}
						onClick={() => onAdd(deck.id)}
					/>
				),
			]}
		>
			<List.Item.Meta
				title={
					<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
						<Text strong>{deck.title}</Text>
						{deck.isPublic ? (
							<Tag color="green">{t('public')}</Tag>
						) : (
							<Tag color="orange">{t('private')}</Tag>
						)}
						{/* External Link */}
						<Link href={getDeckUrl({ id: deck.id, slug: deck.slug })} target="_blank">
							<Tooltip title="View Deck">
								<Button
									type="text"
									size="small"
									icon={<EyeOutlined />}
									style={{ color: '#1890ff' }}
								/>
							</Tooltip>
						</Link>
					</div>
				}
				description={
					<div>
						<Text type="secondary" ellipsis style={{ maxWidth: 350 }}>
							{deck.description || t('noDescription')}
						</Text>
						<div style={{ marginTop: 4, fontSize: 12 }}>
							<span style={{ marginRight: 16 }}>
								{t('by')} {deck.author.name}
							</span>
							<Tag>{deck._count.vocab} Vocab</Tag>
							<Tag>{deck._count.kanji} Kanji</Tag>
						</div>
					</div>
				}
			/>
		</List.Item>
	);
};

export default function DeckSelector({
	courseId,
	existingDeckIds,
	onDeckAdded,
	trigger,
}: DeckSelectorProps) {
	const t = useTranslations('Courses');
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [query, setQuery] = useState('');
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [decks, setDecks] = useState<any[]>([]);
	const [addingId, setAddingId] = useState<string | null>(null);

	// Debounced Search
	const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

	const fetchDecks = async (searchTerm: string) => {
		setLoading(true);
		try {
			const results = await searchDecks(searchTerm);
			setDecks(results);
		} catch (error) {
			console.error(error);
			message.error(t('createError'));
		} finally {
			setLoading(false);
		}
	};

	// Fetch initial suggestions when opened
	useEffect(() => {
		if (open) {
			fetchDecks('');
		}
	}, [open]);

	const handleAdd = async (deckId: string) => {
		setAddingId(deckId);
		try {
			const res = await addDeckToCourse(courseId, deckId);
			if (res.success) {
				message.success(t('createSuccess'));
				onDeckAdded();
			} else {
				message.error(res.error || t('createError'));
			}
		} catch {
			message.error(t('createError'));
		} finally {
			setAddingId(null);
		}
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setQuery(value);

		if (timer) clearTimeout(timer);

		const newTimer = setTimeout(() => {
			fetchDecks(value);
		}, 500); // 500ms debounce
		setTimer(newTimer);
	};

	return (
		<>
			<div onClick={() => setOpen(true)}>
				{trigger || <Button icon={<PlusOutlined />}>{t('addDeck')}</Button>}
			</div>

			<Modal
				title={t('addDeckTitle')}
				open={open}
				onCancel={() => setOpen(false)}
				footer={null}
				width={600}
				destroyOnClose
			>
				<Input
					placeholder={t('searchPlaceholder')}
					prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
					suffix={loading ? <Spin size="small" /> : null}
					size="large"
					value={query}
					onChange={handleSearchChange}
					style={{ marginBottom: 24 }}
					allowClear
				/>

				<div style={{ maxHeight: 400, overflowY: 'auto' }}>
					{decks.length > 0 ? (
						<List
							itemLayout="horizontal"
							dataSource={decks}
							renderItem={(deck) => (
								<DeckListItem
									deck={deck}
									isAdded={existingDeckIds.includes(deck.id)}
									addingId={addingId}
									onAdd={handleAdd}
								/>
							)}
						/>
					) : (
						<Empty
							image={Empty.PRESENTED_IMAGE_SIMPLE}
							description={query ? t('noDecksFound') : t('typeToSearch')}
						/>
					)}
				</div>
			</Modal>
		</>
	);
}
