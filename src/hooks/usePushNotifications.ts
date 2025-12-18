import { message } from 'antd';
import { useEffect, useState } from 'react';

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string | undefined) {
	if (!base64String) return new Uint8Array();
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

export function usePushNotifications() {
	const [permission, setPermission] = useState<NotificationPermission>('default');
	const [isSubscribed, setIsSubscribed] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (typeof window !== 'undefined' && 'Notification' in window) {
			setPermission(Notification.permission);

			// Check if already subscribed
			navigator.serviceWorker.ready.then((reg) => {
				reg.pushManager.getSubscription().then((sub) => {
					setIsSubscribed(!!sub);
				});
			});
		}
	}, []);

	const subscribe = async () => {
		if (!PUBLIC_KEY) {
			console.error('VAPID Public Key is missing');
			return;
		}

		setLoading(true);
		try {
			// 1. Request Permission
			const result = await Notification.requestPermission();
			setPermission(result);

			if (result !== 'granted') {
				message.warning('Permission denied or dismissed');
				setLoading(false);
				return;
			}

			// 2. Register Service Worker (Ensuring it's ready)
			const reg = await navigator.serviceWorker.ready;

			// 3. Subscribe to Browser Push Service
			const sub = await reg.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY),
			});

			// 4. Send to Backend | Send localized Welcome Notification
			await fetch('/api/notifications/subscribe', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					subscription: sub,
					userAgent: navigator.userAgent,
				}),
			});

			setIsSubscribed(true);
			message.success('Push notifications enabled!');
		} catch (error) {
			console.error('Failed to subscribe:', error);
			message.error('Failed to enable notifications');
		} finally {
			setLoading(false);
		}
	};

	return { permission, isSubscribed, subscribe, loading };
}
