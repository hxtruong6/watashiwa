/* eslint-disable @typescript-eslint/no-require-imports */
const fetch = require('node-fetch');

// This script is designed to be run by PM2 in cron mode.
// It simply triggers the Next.js API route for reminders.

const API_URL = process.env.API_URL || 'http://localhost:3050';
const CRON_SECRET = process.env.CRON_SECRET;

async function triggerReminders() {
	try {
		console.log(
			`[${new Date().toISOString()}] Triggering reminders at ${API_URL}/api/cron/reminders`,
		);

		const response = await fetch(`${API_URL}/api/cron/reminders`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${CRON_SECRET}`,
			},
		});

		if (!response.ok) {
			throw new Error(`API responded with ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		console.log('Reminders triggered successfully:', data);
	} catch (error) {
		console.error('Failed to trigger reminders:', error);
		process.exit(1);
	}
}

triggerReminders();
