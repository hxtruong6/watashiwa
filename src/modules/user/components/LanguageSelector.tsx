'use client';

import { useLanguagePreference } from '@/modules/user/hooks/useLanguagePreference';
import type { Locale } from '@/modules/user/utils/locale';
import { Select } from 'antd';
import { useLocale } from 'next-intl';

export default function LanguageSelector() {
	const locale = useLocale();
	const { updateLanguage } = useLanguagePreference({
		onError: (error) => {
			// Only log non-unauthorized errors (unauthorized is expected for public users)
			if (error instanceof Error && !error.message.includes('Unauthorized')) {
				console.error('Failed to sync language preference:', error);
			}
		},
	});

	const handleChange = async (newLocale: Locale) => {
		await updateLanguage(newLocale);
	};

	return (
		<Select
			value={locale as Locale}
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
