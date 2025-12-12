'use client';

import { Select } from 'antd';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function LanguageSelector() {
	const router = useRouter();
	const locale = useLocale();

	const handleChange = (newLocale: string) => {
		document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
		router.refresh();
	};

	return (
		<Select
			value={locale}
			onChange={handleChange}
			variant="borderless"
			title={locale === 'vi' ? 'Tiếng Việt' : 'English'}
			style={{ minWidth: 60 }} // Reduced minWidth since we only show flag
			optionLabelProp="short" // Use the 'short' property for the selected value display
			dropdownStyle={{ minWidth: 150 }} // Ensure dropdown is wide enough
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
