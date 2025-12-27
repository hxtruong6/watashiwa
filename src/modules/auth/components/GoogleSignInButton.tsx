'use client';

import { useAuth } from '@/modules/auth/hooks/useAuth';
import { GoogleOutlined } from '@ant-design/icons';
import { Button, Tooltip, theme } from 'antd';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

const { useToken } = theme;

interface GoogleSignInButtonProps {
	onClick?: () => void;
	loading?: boolean;
	block?: boolean;
}

export function GoogleSignInButton({ onClick, loading, block = false }: GoogleSignInButtonProps) {
	const { token } = useToken();
	const t = useTranslations('Login');
	const { signInWithGoogle, loading: authLoading } = useAuth();
	// Lazy initializer: safely check navigator.onLine only on client-side mount
	// Falls back to false for SSR safety
	const [isOnline, setIsOnline] = useState(() => {
		if (typeof window === 'undefined') return false;
		return navigator.onLine;
	});

	useEffect(() => {
		// Client-side only: set up online/offline event listeners
		if (typeof window === 'undefined') return;

		const handleOnlineStatusChange = () => {
			setIsOnline(navigator.onLine);
		};

		// Listen for online/offline events
		window.addEventListener('online', handleOnlineStatusChange);
		window.addEventListener('offline', handleOnlineStatusChange);

		// Cleanup: remove event listeners on unmount
		return () => {
			window.removeEventListener('online', handleOnlineStatusChange);
			window.removeEventListener('offline', handleOnlineStatusChange);
		};
	}, []);

	const handleClick = async () => {
		if (!isOnline) return;
		onClick?.();
		await signInWithGoogle();
	};

	const isLoading = loading || authLoading;
	const isDisabled = !isOnline || isLoading;

	const button = (
		<Button
			type="default"
			icon={<GoogleOutlined />}
			onClick={handleClick}
			loading={isLoading}
			disabled={isDisabled}
			block={block}
			size="large"
			style={{
				height: 48,
				borderRadius: 12,
				fontWeight: 500,
				borderColor: token.colorBorder,
				color: token.colorText,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 8,
			}}
			aria-label={t('signInWithGoogle') || 'Sign in with Google'}
		>
			{t('signInWithGoogle') || 'Sign in with Google'}
		</Button>
	);

	// Show tooltip when offline
	if (!isOnline) {
		return (
			<Tooltip title={t('errorOfflineGoogle') || 'Internet connection required for Google sign-in'}>
				{button}
			</Tooltip>
		);
	}

	return button;
}
