/**
 * DeckView - Header Component
 *
 * Displays deck title, description, stats, and action buttons
 */
import {
	CheckCircleOutlined,
	PlaySquareOutlined,
	ReadOutlined,
	RocketOutlined,
	SyncOutlined,
	TeamOutlined,
} from '@ant-design/icons';
import {
	Button,
	Card,
	Col,
	Divider,
	Flex,
	Progress,
	Row,
	Statistic,
	Tag,
	Typography,
	theme,
} from 'antd';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import type { DeckWithStats } from '../../types';

const { Title, Paragraph, Text } = Typography;
const { useToken } = theme;

interface DeckHeaderProps {
	deck: DeckWithStats;
	vocabCount: number;
	storiesCount: number;
}

export function DeckHeader({ deck, vocabCount, storiesCount }: DeckHeaderProps) {
	const { token } = useToken();
	const t = useTranslations('Decks');

	const stats = deck.stats || {
		total: 0,
		started: 0,
		new: 0,
		learning: 0,
		review: 0,
		unseen: 0,
	};

	const percentLearned = stats.total > 0 ? Math.round((stats.started / stats.total) * 100) : 0;

	return (
		<Card
			variant="borderless"
			style={{
				borderRadius: 16,
				boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
				marginBottom: 24,
				background: token.colorBgContainer,
			}}
		>
			<Flex vertical gap="middle">
				{/* Top Header */}
				<Flex justify="space-between" align="start" wrap="wrap" gap="small">
					<div>
						<Title level={2} style={{ margin: 0, color: token.colorPrimary }}>
							{deck.title}
						</Title>
						<div style={{ marginTop: 8 }}>
							{!deck.isPublic && (
								<Tag icon={<TeamOutlined />} color="blue">
									{t('privateTag')}
								</Tag>
							)}
							<Tag>{t('itemsCount', { count: vocabCount + storiesCount })}</Tag>
						</div>
						<Paragraph
							style={{
								margin: '12px 0 0',
								color: token.colorTextSecondary,
								maxWidth: 600,
							}}
						>
							{deck.description || t('noDescription')}
						</Paragraph>
					</div>
					<div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 200 }}>
						<Link href={`/study?deckId=${deck.id}`} style={{ width: '100%' }}>
							<Button
								type="primary"
								icon={<PlaySquareOutlined />}
								size="large"
								style={{ width: '100%', height: 48, fontSize: 18 }}
							>
								{t('playButton')}
							</Button>
						</Link>
						{/* <Link href={`/exercises?deckId=${deck.id}`} style={{ width: '100%' }}>
							<Button
								icon={<RocketOutlined />}
								size="large"
								style={{ width: '100%', height: 48, fontSize: 16 }}
							>
								{t('exercises.title')}
							</Button>
						</Link> */}
						{stats.unseen > 0 && (
							<Tag
								color="geekblue"
								style={{ textAlign: 'center', margin: 0, padding: 8, fontSize: 13 }}
							>
								{t('newItemsAvailable', { count: stats.unseen })}
							</Tag>
						)}
					</div>
				</Flex>

				<Divider style={{ margin: '12px 0' }} />

				{/* Progress Section */}
				<Row gutter={[24, 24]} align="middle">
					<Col xs={24} md={14}>
						<Flex vertical gap="small">
							<Flex justify="space-between">
								<Text strong>{t('overallProgress')}</Text>
								<Text type="secondary">
									{t('learnedCount', { started: stats.started, total: stats.total })}
								</Text>
							</Flex>
							<Progress
								percent={percentLearned}
								strokeColor={{
									'0%': '#108ee9',
									'100%': '#87d068',
								}}
								size={12}
							/>
						</Flex>
					</Col>
					<Col xs={24} md={10}>
						<Flex justify="space-around">
							<Statistic
								title={t('statUnseen')}
								value={stats.unseen}
								styles={{ content: { color: token.colorWarning, fontSize: 20 } }}
								prefix={<SyncOutlined spin={false} />}
							/>
							<Statistic
								title={t('statActive')}
								value={stats.learning + stats.review}
								styles={{ content: { color: token.colorPrimary, fontSize: 20 } }}
								prefix={<ReadOutlined />}
							/>
							<Statistic
								title={t('statMastered')}
								value={0}
								styles={{ content: { color: token.colorSuccess, fontSize: 20 } }}
								prefix={<CheckCircleOutlined />}
							/>
						</Flex>
					</Col>
				</Row>
			</Flex>
		</Card>
	);
}
