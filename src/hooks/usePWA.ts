import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWA() {
	const [isInstallable, setIsInstallable] = useState(false);
	const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
	const [isIOS, setIsIOS] = useState(false);
	const [isStandalone, setIsStandalone] = useState(false);

	useEffect(() => {
		// Detect iOS
		const userAgent = window.navigator.userAgent.toLowerCase();
		const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
		// eslint-disable-next-line
		setIsIOS(isIosDevice);

		// Detect Standalone mode
		interface NavigatorWithStandalone extends Navigator {
			standalone?: boolean;
		}
		const nav = window.navigator as NavigatorWithStandalone;
		const isStandaloneMode =
			window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;

		setIsStandalone(isStandaloneMode);

		// Handle beforeinstallprompt (Android/Desktop)
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e as BeforeInstallPromptEvent);
			setIsInstallable(true);
		};

		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

		return () => {
			window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
		};
	}, []);

	const install = async () => {
		if (deferredPrompt) {
			deferredPrompt.prompt();
			const choiceResult = await deferredPrompt.userChoice;
			if (choiceResult.outcome === 'accepted') {
				setIsInstallable(false);
			}
			setDeferredPrompt(null);
		}
	};

	return { isInstallable, isIOS, isStandalone, install };
}
