'use client';

import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Flex, Select, Space, Typography, theme } from 'antd';
import type { MenuProps } from 'antd';
import React, { useState } from 'react';

const { Title, Text } = Typography;
const { useToken } = theme;

export default function TestDropdownPage() {
	const { token } = useToken();
	const [select1Value, setSelect1Value] = useState('option1');
	const [select3Value, setSelect3Value] = useState('option1');

	const menuItems: MenuProps['items'] = [
		{
			key: '1',
			label: 'Item 1',
		},
		{
			key: '2',
			label: 'Item 2',
		},
		{
			key: '3',
			label: 'Item 3',
		},
	];

	return (
		<div
			style={{
				minHeight: '200vh', // Force scroll to test positioning
				padding: '100px 24px',
				background: token.colorBgLayout,
			}}
		>
			<Flex vertical gap="large" align="center" style={{ maxWidth: 800, margin: '0 auto' }}>
				<Title level={2}>Dropdown Test Page</Title>
				<Text type="secondary" style={{ marginBottom: 24 }}>
					Scroll down to test dropdown positioning at different scroll positions
				</Text>

				{/* Spacer to push content down */}
				<div style={{ height: '50vh' }} />

				<Space direction="vertical" size="large" style={{ width: '100%' }}>
					{/* Test 1: Simple Select */}
					<Flex vertical gap="small">
						<Text strong>Test 1: Select Dropdown (Current: {select1Value})</Text>
						<Select
							style={{ width: 200 }}
							value={select1Value}
							onChange={setSelect1Value}
							options={[
								{ value: 'option1', label: 'Option 1' },
								{ value: 'option2', label: 'Option 2' },
								{ value: 'option3', label: 'Option 3' },
							]}
						/>
					</Flex>

					{/* Test 2: Dropdown with Button */}
					<Flex vertical gap="small">
						<Text strong>Test 2: Dropdown with Button</Text>
						<Dropdown menu={{ items: menuItems }} trigger={['click']}>
							<Button>
								Click me <DownOutlined />
							</Button>
						</Dropdown>
					</Flex>

					{/* Test 3: Select with getPopupContainer */}
					<Flex vertical gap="small">
						<Text strong>
							Test 3: Select with explicit getPopupContainer (Current: {select3Value})
						</Text>
						<Select
							style={{ width: 200 }}
							value={select3Value}
							onChange={setSelect3Value}
							getPopupContainer={() => document.body}
							options={[
								{ value: 'option1', label: 'Option 1' },
								{ value: 'option2', label: 'Option 2' },
								{ value: 'option3', label: 'Option 3' },
							]}
						/>
					</Flex>

					{/* Test 4: Dropdown with getPopupContainer */}
					<Flex vertical gap="small">
						<Text strong>Test 4: Dropdown with explicit getPopupContainer</Text>
						<Dropdown
							menu={{ items: menuItems }}
							trigger={['click']}
							getPopupContainer={() => document.body}
						>
							<Button>
								Click me (explicit container) <DownOutlined />
							</Button>
						</Dropdown>
					</Flex>
				</Space>

				{/* More spacer to test at bottom of page */}
				<div style={{ height: '100vh' }} />

				<Text type="secondary" style={{ marginTop: 48 }}>
					Test dropdowns at the bottom of the page too
				</Text>
			</Flex>
		</div>
	);
}
