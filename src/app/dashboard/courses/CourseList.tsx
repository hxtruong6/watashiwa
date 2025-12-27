'use client';

import { useFeatureDiscovery } from '@/hooks/useFeatureDiscovery';
import { getCourseUrl } from '@/lib/utils/urls';
import {
	BookOutlined,
	CheckCircleOutlined,
	RocketOutlined,
	StarOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { Card, Col, Divider, Empty, Row, Tag, Typography } from 'antd';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

import CreateCourseButton from './CreateCourseButton';

const { Title, Text, Paragraph } = Typography;

interface CourseListProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	courses: any[];
	userId: string;
}

export default function CourseList({ courses, userId }: CourseListProps) {
	const t = useTranslations('Courses');
	const locale = useLocale();
	useFeatureDiscovery('courses', 'navigation');

	// Separate suggested (public admin) courses from user's custom paths
	const suggestedCourses = courses.filter((c) => c.isPublic && c.author.id !== userId);
	const customCourses = courses.filter((c) => !c.isPublic || c.author.id === userId);

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
				<>
					{/* Suggested Learning Paths Section */}
					{suggestedCourses.length > 0 && (
						<>
							<div style={{ marginBottom: 16 }}>
								<Title
									level={4}
									style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}
								>
									<RocketOutlined style={{ color: '#1890ff' }} />
									{t('suggestedPaths')}
								</Title>
								<Text type="secondary" style={{ fontSize: 14 }}>
									{t('suggestedPathsDesc')}
								</Text>
							</div>
							<Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
								{suggestedCourses.map((course) => {
									const displayTitle =
										locale === 'en' ? course.titleEn || course.title : course.title;
									const displayDescription =
										locale === 'en'
											? course.descriptionEn || course.description
											: course.description;

									return (
										<Col xs={24} sm={12} lg={8} key={course.id}>
											<Link href={getCourseUrl({ slug: course.slug })}>
												<Card
													hoverable
													cover={
														<div
															style={{
																height: 140,
																background: course.headerImage
																	? `url(${course.headerImage}) center/cover`
																	: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
																display: 'flex',
																alignItems: 'center',
																justifyContent: 'center',
																position: 'relative',
															}}
														>
															{!course.headerImage && (
																<StarOutlined
																	style={{ fontSize: 48, color: 'rgba(255,255,255,0.8)' }}
																/>
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
														<span key="decks">
															{t('decksCount', { count: course._count.decks })}
														</span>,
														<span key="verified">
															<Tag icon={<CheckCircleOutlined />} color="green">
																{t('verified')}
															</Tag>
														</span>,
													]}
												>
													<Card.Meta
														title={displayTitle}
														description={
															<Paragraph
																ellipsis={{ rows: 2 }}
																type="secondary"
																style={{ minHeight: 44 }}
															>
																{displayDescription || t('noDescription')}
															</Paragraph>
														}
													/>
												</Card>
											</Link>
										</Col>
									);
								})}
							</Row>
						</>
					)}

					{/* Custom Learning Paths Section */}
					{customCourses.length > 0 && (
						<>
							{suggestedCourses.length > 0 && <Divider />}
							<div style={{ marginBottom: 16 }}>
								<Title level={4} style={{ margin: 0 }}>
									{t('customPaths')}
								</Title>
								<Text type="secondary" style={{ fontSize: 14 }}>
									{t('customPathsDesc')}
								</Text>
							</div>
							<Row gutter={[24, 24]}>
								{customCourses.map((course) => {
									const displayTitle =
										locale === 'en' ? course.titleEn || course.title : course.title;
									const displayDescription =
										locale === 'en'
											? course.descriptionEn || course.description
											: course.description;

									return (
										<Col xs={24} sm={12} lg={8} key={course.id}>
											<Link href={getCourseUrl({ slug: course.slug })}>
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
														<span key="decks">
															{t('decksCount', { count: course._count.decks })}
														</span>,
														<span key="author">
															<Tag
																icon={<UserOutlined />}
																color={course.author.id === userId ? 'blue' : 'default'}
															>
																{course.author.id === userId
																	? t('byYou')
																	: t('byAuthor', { name: course.author.name })}
															</Tag>
														</span>,
													]}
												>
													<Card.Meta
														title={displayTitle}
														description={
															<Paragraph
																ellipsis={{ rows: 2 }}
																type="secondary"
																style={{ minHeight: 44 }}
															>
																{displayDescription || t('noDescription')}
															</Paragraph>
														}
													/>
												</Card>
											</Link>
										</Col>
									);
								})}
							</Row>
						</>
					)}
				</>
			)}
		</div>
	);
}
