'use client';

import React, { useState } from 'react';
import { Layout, Menu, Button, Flex, Typography, Drawer } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { LogoutOutlined, BookOutlined, DashboardOutlined, MenuOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Header } = Layout;
const { Title } = Typography;

export default function NavBar() {
	const pathname = usePathname();
	const router = useRouter();
	const supabase = createClient();
	const [drawerOpen, setDrawerOpen] = useState(false);
	// Note: AntD Grid `xs` breakpoint is <576px. We can use `Grid.useBreakpoint` or react-responsive.
	// For simplicity with RSC/Client boundary, let's try CSS-in-JS logic or just use `Grid.useBreakpoint` inside component.
	// However, hooks need valid context. Let's use a simple media query check if react-responsive is added,
	// or just rely on CSS visibility helpers if available.
	// Since we don't have `react-responsive` installed yet, I'll install it or use AntD's `Grid`.

	// Better approach without extra deps: Use CSS media queries or AntD's visible classes if setup.
	// Or just simple window width check after mount.

	// Let's implement a standard Drawer pattern for mobile.

	const handleLogout = async () => {
		await supabase.auth.signOut();
		router.push('/login');
		router.refresh();
		setDrawerOpen(false);
	};

	const showDrawer = () => setDrawerOpen(true);
	const closeDrawer = () => setDrawerOpen(false);

	// Don't show NavBar on login or study pages (immersive mode)
	if (pathname === '/login' || pathname === '/study') {
		return null;
	}

	const menuItems = [
		{
			key: '/',
			icon: <DashboardOutlined />,
			label: (
				<Link href="/" onClick={closeDrawer}>
					Dashboard
				</Link>
			),
		},
		{
			key: '/decks',
			icon: <BookOutlined />,
			label: (
				<Link href="/decks" onClick={closeDrawer}>
					Decks
				</Link>
			),
		},
	];

	return (
		<Header
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				background: '#fff',
				padding: '0 24px',
				boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
				position: 'sticky',
				top: 0,
				zIndex: 1000,
				height: 64,
			}}
		>
			{/* Logo Area */}
			<Flex align="center" gap="small">
				<Title level={4} style={{ margin: 0, color: '#1E3A5F', minWidth: 120 }}>
					Zen Mastery
				</Title>
			</Flex>

			{/* Desktop Menu */}
			<div className="desktop-menu" style={{ display: 'none' }}>
				{/* We will rely on CSS to toggle this. Since we can't easily add global css here, 
                   we'll use inline styles with media query helper or just display logic.
                   Wait, inline styles don't support media queries.
                   
                   Alternative: Render BOTH simple mobile icon and desktop menu, hide one with CSS classes?
                   Or just use AntD's Responsive behavior.
                */}
			</div>

			{/* 
                Simplified Mobile-First Logic:
                Always show Hamburger on small screens.
            */}

			{/* Mobile Hamburger (Visible on small screens) */}
			<div className="mobile-nav-trigger">
				<Button type="text" icon={<MenuOutlined />} onClick={showDrawer} className="mobile-only" />
			</div>

			{/* Desktop Nav (Hidden on Mobile) - Requires Global CSS or Styled Components. 
                I'll allow both for now and assume the user can clean up resizing behavior, 
                or I'll inject a style tag.
            */}

			<style jsx global>{`
				@media (max-width: 768px) {
					.desktop-nav {
						display: none !important;
					}
					.mobile-only {
						display: inline-block !important;
					}
				}
				@media (min-width: 769px) {
					.desktop-nav {
						display: flex !important;
					}
					.mobile-only {
						display: none !important;
					}
				}
			`}</style>

			<Flex
				align="center"
				gap="large"
				className="desktop-nav"
				style={{ flex: 1, justifyContent: 'flex-end' }}
			>
				<Menu
					mode="horizontal"
					selectedKeys={[pathname]}
					items={menuItems}
					style={{ borderBottom: 'none', background: 'transparent', width: 200 }}
					disabledOverflow
				/>
				<Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
					Logout
				</Button>
			</Flex>

			{/* Mobile Drawer */}
			<Drawer title="Menu" placement="right" onClose={closeDrawer} open={drawerOpen} width={250}>
				<Menu
					mode="vertical"
					selectedKeys={[pathname]}
					items={menuItems}
					style={{ borderRight: 'none' }}
				/>
				<div style={{ padding: '16px 24px' }}>
					<Button block danger icon={<LogoutOutlined />} onClick={handleLogout}>
						Logout
					</Button>
				</div>
			</Drawer>
		</Header>
	);
}
