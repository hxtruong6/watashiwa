import { cache } from 'react';

/**
 * Helper: Get Start of Day in User's Timezone (returned as UTC Date object)
 * e.g. If User is Tokyo (UTC+9), and it's 10am Tokyo, Start of Day is 00:00 Tokyo.
 * We need the UTC equivalent of 00:00 Tokyo, which is 15:00 UTC Previous Day.
 */
export const getStartOfDayInTimezone = cache((timezone: string = 'UTC'): Date => {
	try {
		const now = new Date();
		// Get date string in user's timezone: "MM/DD/YYYY"
		const formatter = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone,
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
		});
		const parts = formatter.formatToParts(now);
		const month = parts.find((p) => p.type === 'month')?.value;
		const day = parts.find((p) => p.type === 'day')?.value;
		const year = parts.find((p) => p.type === 'year')?.value;

		if (!month || !day || !year) throw new Error('Invalid date parts');

		// Or try to parse offset from `longOffset`? "GMT+09:00".
		const offsetStr = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone,
			timeZoneName: 'longOffset',
		}).format(now);
		// Example: "12/12/2023, GMT+09:00"
		const match = offsetStr.match(/GMT([+-]\d{2}:\d{2})/);
		if (match) {
			const offset = match[1];
			const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00${offset}`;
			return new Date(iso);
		}

		return new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
	} catch (e) {
		console.warn('Timezone calculation failed, falling back to UTC', e);
		const d = new Date();
		d.setUTCHours(0, 0, 0, 0);
		return d;
	}
});
