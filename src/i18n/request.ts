import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
	// Use cookies or headers to determine locale, falling back to 'vi'
	// Since middleware handles negotiation, we can often rely on the locale passed to the layout,
	// but here we ensure we load the right messages.
	const cookieStore = await cookies();
	const locale = cookieStore.get('NEXT_LOCALE')?.value || 'vi';

	return {
		locale,
		messages: (await import(`../../messages/${locale}.json`)).default,
	};
});
