import { NextResponse } from 'next/server';

export async function GET(req: Request) {
	// Security Check (CRON_SECRET)
	// Vercel automatically safeguards this if configured in vercel.json,
	// but manual header check is good practice.
	const authHeader = req.headers.get('authorization');
	if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}
}
