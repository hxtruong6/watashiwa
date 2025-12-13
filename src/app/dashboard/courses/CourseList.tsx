'use client';

import { Typography, Card, Row, Col, Tag, Empty } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import Link from 'next/link';
import CreateCourseButton from './CreateCourseButton';
import { useTranslations } from 'next-intl';

const { Title, Text, Paragraph } = Typography;

interface CourseListProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	courses: any[];
}

export default function CourseList({ courses }: CourseListProps) {
	const t = useTranslations('Courses');

	return (
		<div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: 32,
				}}
			>
				<div>
					<Title level={2} style={{ margin: 0 }}>
						{t('title')}
					</Title>
					<Text type="secondary">{t('subtitle')}</Text>
				</div>
				<CreateCourseButton />
			</div>

			{courses.length === 0 ? (
				<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('emptyState')}>
					<CreateCourseButton text={t('createFirst')} type="primary" />
				</Empty>
			) : (
				<Row gutter={[24, 24]}>
					{courses.map((course) => (
						<Col xs={24} sm={12} lg={8} key={course.id}>
							<Link href={`/courses/${course.id}`}>
								<Card
									hoverable
									cover={
										<div
											style={{
												height: 140,
												background: course.headerImage
													? `url(${course.headerImage}) center/cover`
													: '#f0f2f5',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												position: 'relative',
											}}
										>
											{!course.headerImage && (
												<BookOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
											)}
											{course.level && (
												<Tag
													color="gold"
													style={{ position: 'absolute', top: 12, right: 12, margin: 0 }}
												>
													{course.level}
												</Tag>
											)}
										</div>
									}
									actions={[
										<span key="decks">{t('decksCount', { count: course._count.decks })}</span>,
										<span key="status">
											{course.isPublic ? (
												<Tag color="green">{t('public')}</Tag>
											) : (
												<Tag>{t('private')}</Tag>
											)}
										</span>,
									]}
								>
									<Card.Meta
										title={course.title}
										description={
											<Paragraph ellipsis={{ rows: 2 }} type="secondary" style={{ minHeight: 44 }}>
												{course.description || t('noDescription')}
											</Paragraph>
										}
									/>
								</Card>
							</Link>
						</Col>
					))}
				</Row>
			)}
		</div>
	);
}
