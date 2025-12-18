import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

import { routing } from './routing';

export default getRequestConfig(async () => {
	const cookieStore = await cookies();
	const locale = cookieStore.get('NEXT_LOCALE')?.value;

	// specific valid locale check
	const finalLocale =
		locale && routing.locales.includes(locale as 'vi' | 'en') ? locale : routing.defaultLocale;

	return {
		locale: finalLocale,
		messages: (await import(`./messages/${finalLocale}.json`)).default,
	};
});
