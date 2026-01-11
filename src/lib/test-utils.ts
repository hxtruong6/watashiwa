import { prisma } from './db';

/**
 * Clean up the database by deleting all records from all tables.
 * This is used between integration tests to ensure a clean state.
 */
export async function cleanDatabase() {
	if (process.env.NODE_ENV === 'production') {
		throw new Error('cleanDatabase() called in production environment!');
	}

	// Check if we are pointing to the test DB to be extra safe
	const dbUrl = process.env.DATABASE_URL || '';
	if (!dbUrl.includes('5433') && !dbUrl.includes('test')) {
		throw new Error(
			`🚨 SAFETY: cleanDatabase() called on a DB that does not look like a test DB. URL: ${dbUrl}. This prevents accidental data loss.`,
		);
	}

	const tablenames = await prisma.$queryRaw<
		Array<{ tablename: string }>
	>`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '_prisma_migrations'`;

	const tables = tablenames.map(({ tablename }) => `"${tablename}"`).join(', ');

	try {
		await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
	} catch (error) {
		console.error('Error cleaning database:', error);
	}
}
