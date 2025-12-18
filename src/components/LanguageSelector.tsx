'use client';

import { updateUserSettings } from '@/services/actions';
import { Select } from 'antd';
import { useLocale } from 'next-intl';

export default function LanguageSelector() {
	const locale = useLocale();

	const handleChange = async (newLocale: string) => {
		// 1. Set Cookie for Next-Intl (Client-side immediate)
		document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

		// 2. Persist to DB (Server-side)
		// We don't await this blocking the UI, but we want to ensure it fires.
		// Since we reload immediately after, we might want to use beacon or just await it quickly.
		// Awaiting is safer to ensure DB sync before reload might fetch old data?
		// Actually, reload will fetch from DB/Cookie.
		try {
			await updateUserSettings({ language: newLocale });
		} catch (err) {
			console.error('Failed to sync language preference:', err);
		}

		// 3. Reload to apply changes
		window.location.reload();
	};

	return (
		<Select
			value={locale}
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
