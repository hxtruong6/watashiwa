import { FilterState, SortState } from '@/types/common.types';
import { SearchOutlined } from '@ant-design/icons';
import { Flex, Grid, Input, Segmented, Select, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';
import React from 'react';

const { Title } = Typography;
const { useBreakpoint } = Grid;
const { useToken } = theme;

interface DashboardHeaderProps {
	title: string;
	onSearch: (value: string) => void;
	onFilterChange: (value: FilterState) => void;
	currentFilter: FilterState;
	onSortChange: (value: SortState) => void;
	currentSort: SortState;
	// New: Deck Filter
	deckOptions?: { label: string; value: string }[];
	onDeckFilterChange?: (values: string[]) => void;
	selectedDecks?: string[];
}

export default function DashboardHeader({
	title,
	onSearch,
	onFilterChange,
	currentFilter,
	onSortChange,
	currentSort,
	deckOptions = [],
	onDeckFilterChange,
	selectedDecks = [],
}: DashboardHeaderProps) {
	const t = useTranslations('Dashboard');
	const { token } = useToken();
	const screens = useBreakpoint();

	const filterMap: Record<string, FilterState> = {
		[t('filterAll')]: 'all',
		[t('filterNew')]: 'new',
		[t('filterLearning')]: 'learning',
		[t('filterReview')]: 'review',
	};

	const sortMap: Record<string, SortState> = {
		[t('sortDate')]: 'date',
		[t('sortAlpha')]: 'alpha',
		[t('sortImportance')]: 'importance',
	};

	// Helper to find display value for internal state
	const getCurrentFilterLabel = () =>
		Object.keys(filterMap).find((key) => filterMap[key] === currentFilter) || t('filterAll');
	const getCurrentSortLabel = () =>
		Object.keys(sortMap).find((key) => sortMap[key] === currentSort) || t('sortDate');

	return (
		<Flex
			vertical
			gap="middle"
			style={{
				marginBottom: 24,
				background: token.colorBgContainer,
				padding: 24,
				borderRadius: token.borderRadiusLG,
				boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
			}}
		>
			<Flex justify="space-between" align="center" wrap="wrap" gap="small">
				<Title level={2} style={{ margin: 0 }}>
					{title}
				</Title>
			</Flex>
			<Flex gap="small" wrap="wrap" align="center">
				<Input
					prefix={<SearchOutlined style={{ color: token.colorTextDescription }} />}
					placeholder={t('searchPlaceholder')}
					onChange={(e) => onSearch(e.target.value)}
					style={{ maxWidth: screens.sm ? 240 : '100%' }}
					allowClear
				/>

				{/* Deck Filter Dropdown */}
				{deckOptions.length > 0 && (
					<Select
						mode="multiple"
						allowClear
						style={{ minWidth: 180, maxWidth: 300 }}
						placeholder={t('filterByDeck')}
						onChange={onDeckFilterChange}
						options={deckOptions}
						value={selectedDecks}
						maxTagCount="responsive"
					/>
				)}

				<Segmented
					options={Object.keys(filterMap)}
					value={getCurrentFilterLabel()}
					onChange={(val) => onFilterChange(filterMap[val as string])}
				/>
				<Segmented
					options={Object.keys(sortMap)}
					value={getCurrentSortLabel()}
					onChange={(val) => onSortChange(sortMap[val as string])}
				/>
			</Flex>
		</Flex>
	);
}
