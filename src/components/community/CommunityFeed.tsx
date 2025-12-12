'use client';

import React, { useEffect, useState } from 'react';
import { Flex, Segmented, Button, Spin, Empty, Tag as AntTag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { getCommunityFeed } from '@/services/comments';
import FeedItem from './FeedItem';
import { useTranslations } from 'next-intl';

// const { Title } = Typography;

const TAGS = ['ALL', 'MNEMONIC', 'USAGE_TIP', 'CULTURAL_NOTE', 'EXAMPLE', 'GRAMMAR', 'GENERAL'];

export default function CommunityFeed() {
	// const t = useTranslations('NavBar');
	const tComment = useTranslations('Comments');

	const [filter, setFilter] = useState<'trending' | 'newest' | 'mine'>('trending');
	const [activeTag, setActiveTag] = useState<string>('ALL');
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [items, setItems] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	const loadData = async (reset = false) => {
		const currentPage = reset ? 1 : page;
		if (reset) setLoading(true);

		try {
			const res = await getCommunityFeed({
				filter,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				tag: activeTag as any,
				page: currentPage,
				limit: 10,
			});

			if (reset) {
				setItems(res.data);
				setPage(2);
			} else {
				setItems((prev) => [...prev, ...res.data]);
				setPage((p) => p + 1);
			}

			if (res.data.length < 10) {
				setHasMore(false);
			} else {
				setHasMore(true);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	// Reload on Filter change
	useEffect(() => {
		loadData(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filter, activeTag]);

	return (
		<Flex vertical gap="large" style={{ maxWidth: 800, margin: '0 auto' }}>
			{/* Controls Header */}
			<div
				style={{
					position: 'sticky',
					top: 64,
					zIndex: 10,
					background: '#f5f5f5',
					padding: '16px 0',
				}}
			>
				<Flex vertical gap="middle">
					<Segmented
						block
						value={filter}
						onChange={(v: string) => setFilter(v as 'trending' | 'newest' | 'mine')}
						options={[
							{ label: 'Trending', value: 'trending' }, // Could localize these
							{ label: 'Newest', value: 'newest' },
							{ label: 'My Tips', value: 'mine' },
						]}
						size="large"
					/>

					{/* Tag Filter Scroll */}
					<div
						style={{
							overflowX: 'auto',
							whiteSpace: 'nowrap',
							paddingBottom: 4,
							// Hide scrollbar
							scrollbarWidth: 'none',
						}}
					>
						<Flex gap="small">
							{TAGS.map((tag) => (
								<AntTag.CheckableTag
									key={tag}
									checked={activeTag === tag}
									onChange={(checked) => checked && setActiveTag(tag)}
									style={{
										fontSize: 13,
										padding: '4px 12px',
										borderRadius: 16,
										border: activeTag === tag ? 'none' : '1px solid #d9d9d9',
										background: activeTag === tag ? '#1E3A5F' : 'transparent',
									}}
								>
									{tag === 'ALL'
										? 'All'
										: {
												MNEMONIC: tComment('typeMnemonic'),
												USAGE_TIP: tComment('typeTip'),
												CULTURAL_NOTE: tComment('typeCulture'),
												EXAMPLE: tComment('typeExample'),
												GRAMMAR: tComment('typeGrammar'),
												GENERAL: tComment('typeGeneral'),
											}[tag] || tag}
								</AntTag.CheckableTag>
							))}
						</Flex>
					</div>
				</Flex>
			</div>

			{/* List */}
			{items.length === 0 && !loading ? (
				<Empty description="No tips found" />
			) : (
				<Flex vertical gap="middle">
					{items.map((item) => (
						<FeedItem key={item.id} item={item} />
					))}
				</Flex>
			)}

			{/* Loading / Load More */}
			{loading && <Spin style={{ margin: '20px auto' }} />}

			{!loading && hasMore && items.length > 0 && (
				<Button
					onClick={() => loadData(false)}
					style={{ margin: '0 auto', maxWidth: 200 }}
					icon={<ReloadOutlined />}
				>
					Load More
				</Button>
			)}

			{!loading && !hasMore && items.length > 0 && (
				<div style={{ textAlign: 'center', color: '#888', padding: 20 }}>
					You&apos;ve reached the end!
				</div>
			)}
		</Flex>
	);
}
