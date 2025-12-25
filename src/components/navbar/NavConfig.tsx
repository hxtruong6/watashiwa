import {
	CompassOutlined,
	DeploymentUnitOutlined,
	ReadOutlined,
	RocketOutlined,
} from '@ant-design/icons';

export interface NavItem {
	key: string;
	label: string;
	path: string;
	icon: React.ReactNode;
}

export const NAV_ITEMS: NavItem[] = [
	{
		key: 'mission',
		label: 'Mission',
		path: '/?app=true', // Keeping original 'dashboard' logic
		icon: <CompassOutlined />,
	},
	{
		key: 'discover',
		label: 'Discover',
		path: '/decks',
		icon: <RocketOutlined />, // 'Telescope' replacement
	},
	{
		key: 'collection',
		label: 'Collection',
		path: '/dashboard/decks',
		icon: <DeploymentUnitOutlined />, // 'LayerGroup' replacement or similar
	},
	{
		key: 'journey',
		label: 'Journey',
		path: '/dashboard/courses',
		icon: <ReadOutlined />,
	},
];
