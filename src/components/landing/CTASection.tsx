'use client';

import React from 'react';
import { Button, Typography, Flex } from 'antd';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

export default function CTASection() {
	return (
		<section
			style={{
				padding: '100px 24px',
				background: '#1E3A5F',
				textAlign: 'center',
				color: '#fff',
			}}
		>
			<Flex vertical align="center" style={{ maxWidth: 600, margin: '0 auto' }}>
				<Title level={2} style={{ color: '#fff', marginBottom: 24 }}>
					Ready to start your journey?
				</Title>
				<Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 40 }}>
					Join thousands of learners mastering Japanese efficiently. No credit card required.
				</Paragraph>
				<Link href="/login">
					<Button
						type="primary"
						size="large"
						style={{
							height: 56,
							padding: '0 40px',
							fontSize: 18,
							borderRadius: 28,
							background: '#708238',
							border: 'none',
						}}
					>
						Get Started for Free
					</Button>
				</Link>
			</Flex>
		</section>
	);
}
