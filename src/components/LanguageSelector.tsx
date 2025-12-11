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
			style={{ minWidth: 100 }}
			options={[
				{
					value: 'vi',
					label: <span style={{ fontSize: 14 }}>🇻🇳 Tiếng Việt</span>,
				},
				{
					value: 'en',
					label: <span style={{ fontSize: 14 }}>🇺🇸 English</span>,
				},
			]}
		/>
	);
}
