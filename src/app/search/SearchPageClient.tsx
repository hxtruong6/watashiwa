'use client';

import { searchDecks } from '@/modules/course/course.actions';
import { BookOutlined, ReadOutlined, SearchOutlined } from '@ant-design/icons';
import type { User } from '@supabase/supabase-js';
import { Card, Empty, Flex, Input, Space, Spin, Tabs, Tag, Typography, theme } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const { Title, Text } = Typography;
const { useToken } = theme;

interface SearchPageClientProps {
	user: User;
}

interface SearchResult {
	id: string;
	title: string;
	description: string | null;
	type: 'deck' | 'course';
	author?: { name: string | null };
	_count?: { vocabularies: number; stories: number };
}

export default function SearchPageClient({}: SearchPageClientProps) {
	const { token } = useToken();
	const [searchQuery, setSearchQuery] = useState('');
	const [results, setResults] = useState<SearchResult[]>([]);
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState('all');

	// Debounced search
	useEffect(() => {
		if (!searchQuery.trim()) {
			setResults([]);
			return;
		}

		const timeoutId = setTimeout(async () => {
			setLoading(true);
			try {
				const decks = await searchDecks(searchQuery);
				const formattedResults: SearchResult[] = decks.map((deck) => ({
					id: deck.id,
					title: deck.title,
					description: deck.description,
					type: 'deck' as const,
					author: deck.author,
					_count: deck._count,
				}));
				setResults(formattedResults);
			} catch (error) {
				console.error('Search error:', error);
			} finally {
				setLoading(false);
			}
		}, 300);

		return () => clearTimeout(timeoutId);
	}, [searchQuery]);

	const filteredResults =
		activeTab === 'all' ? results : results.filter((r) => r.type === activeTab);

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.05,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				type: 'spring' as const,
				stiffness: 300,
				damping: 24,
			},
		},
	};

	return (
		<div
			style={{
				minHeight: '100vh',
				background: token.colorBgLayout,
				padding: '24px 16px',
				maxWidth: 1200,
				margin: '0 auto',
			}}
		>
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				style={{ marginBottom: 32 }}
			>
				<Title level={1} style={{ margin: 0, marginBottom: 8 }}>
					Search
				</Title>
				<Text type="secondary">Find decks, courses, and vocabulary</Text>
			</motion.div>

			{/* Search Input */}
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.3, delay: 0.1 }}
				style={{ marginBottom: 24 }}
			>
				<Input
					size="large"
					prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
					placeholder="Search decks, courses, vocabulary..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					allowClear
					style={{
						borderRadius: '16px',
						height: '56px',
						fontSize: '16px',
						background: token.colorBgContainer,
						border: `1px solid ${token.colorBorderSecondary}`,
					}}
					autoFocus
				/>
			</motion.div>

			{/* Tabs */}
			{searchQuery && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3 }}
					style={{ marginBottom: 24 }}
				>
					<Tabs
						activeKey={activeTab}
						onChange={setActiveTab}
						items={[
							{
								key: 'all',
								label: (
									<Space>
										<Text>All</Text>
										<Tag color="blue">{results.length}</Tag>
									</Space>
								),
							},
							{
								key: 'deck',
								label: (
									<Space>
										<BookOutlined />
										<Text>Decks</Text>
										<Tag color="blue">{results.filter((r) => r.type === 'deck').length}</Tag>
									</Space>
								),
							},
							{
								key: 'course',
								label: (
									<Space>
										<ReadOutlined />
										<Text>Courses</Text>
										<Tag color="blue">{results.filter((r) => r.type === 'course').length}</Tag>
									</Space>
								),
							},
						]}
					/>
				</motion.div>
			)}

			{/* Results */}
			{loading ? (
				<Flex justify="center" align="center" style={{ minHeight: '400px' }}>
					<Spin size="large" />
				</Flex>
			) : searchQuery && filteredResults.length === 0 ? (
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 64 }}>
					<Empty
						description={
							<Text type="secondary">No results found for &quot;{searchQuery}&quot;</Text>
						}
					/>
				</motion.div>
			) : !searchQuery ? (
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 64 }}>
					<Empty
						description={
							<Text type="secondary">Start typing to search decks, courses, and vocabulary</Text>
						}
					/>
				</motion.div>
			) : (
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
						gap: 16,
					}}
				>
					<AnimatePresence>
						{filteredResults.map((result) => (
							<motion.div key={result.id} variants={itemVariants} layout>
								<Link href={`/decks/${result.id}`}>
									<Card
										hoverable
										style={{
											height: '100%',
											borderRadius: '16px',
											border: `1px solid ${token.colorBorderSecondary}`,
											transition: 'all 0.3s',
										}}
										bodyStyle={{ padding: 20 }}
									>
										<Flex vertical gap="small">
											<Flex align="center" gap="small">
												{result.type === 'deck' ? (
													<BookOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
												) : (
													<ReadOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
												)}
												<Title level={5} style={{ margin: 0, flex: 1 }}>
													{result.title}
												</Title>
											</Flex>
											{result.description && (
												<Text type="secondary" ellipsis>
													{result.description}
												</Text>
											)}
											<Flex gap="small" wrap="wrap">
												{result._count?.vocabularies && (
													<Tag icon={<BookOutlined />}>{result._count.vocabularies} words</Tag>
												)}
												{result.author?.name && <Tag>by {result.author.name}</Tag>}
											</Flex>
										</Flex>
									</Card>
								</Link>
							</motion.div>
						))}
					</AnimatePresence>
				</motion.div>
			)}
		</div>
	);
}
