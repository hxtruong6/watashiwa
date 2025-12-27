'use client';

import { updateUserSettings } from '@/modules/user/user.actions';
import { Select } from 'antd';
import { useLocale } from 'next-intl';

export default function LanguageSelector() {
	const locale = useLocale();

	const handleChange = async (newLocale: 'en' | 'vi' | 'ja') => {
		// 1. Set Cookie for Next-Intl (Client-side immediate)
		document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

		// 2. Persist to DB (Server-side) - Only if user is authenticated
		// For public users, we only update the cookie
		try {
			await updateUserSettings({ language: newLocale });
		} catch (err) {
			// Silently fail for public users - cookie update is sufficient
			if (err instanceof Error && err.message.includes('Unauthorized')) {
				// Public user - this is expected, cookie update is enough
			} else {
				console.error('Failed to sync language preference:', err);
			}
		}

		// 3. Reload to apply changes
		window.location.reload();
	};

	return (
		<Select
			value={locale as any}
			onChange={handleChange}
			variant="borderless"
			title={locale === 'vi' ? 'Tiếng Việt' : 'English'}
			style={{ minWidth: 60 }} // Reduced minWidth since we only show flag
			optionLabelProp="short" // Use the 'short' property for the selected value display
			popupMatchSelectWidth={150}
			options={[
				{
					value: 'vi',
					label: (
						<span style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
							<span style={{ fontSize: 18 }}>🇻🇳</span> Tiếng Việt
						</span>
					),
					short: <span style={{ fontSize: 20 }}>🇻🇳</span>, // Displayed in the trigger
				},
				{
					value: 'en',
					label: (
						<span style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
							<span style={{ fontSize: 18 }}>🇺🇸</span> English
						</span>
					),
					short: <span style={{ fontSize: 20 }}>🇺🇸</span>, // Displayed in the trigger
				},
			]}
		/>
	);
}
