import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

/**
 * Get database connection string with connection pool parameters
 * Appends pool configuration if not already present in DATABASE_URL
 */
function getConnectionString(): string {
	const url = process.env.DATABASE_URL;
	if (!url) {
		throw new Error('DATABASE_URL environment variable is not set');
	}

	try {
		const urlObj = new URL(url);

		// Append connection pool parameters if not present
		if (!urlObj.searchParams.has('connection_limit')) {
			urlObj.searchParams.set('connection_limit', '20');
		}
		if (!urlObj.searchParams.has('pool_timeout')) {
			urlObj.searchParams.set('pool_timeout', '10');
		}
		if (!urlObj.searchParams.has('connect_timeout')) {
			urlObj.searchParams.set('connect_timeout', '5');
		}

		return urlObj.toString();
	} catch (error) {
		// If URL parsing fails, return original string (might be a connection string format)
		console.warn('[db] Failed to parse DATABASE_URL, using as-is:', error);
		return url;
	}
}

const connectionString = getConnectionString();

/**
 * Prisma Client Singleton Pattern for Next.js
 * Prevents multiple instances in development (hot reload) and production
 * This is critical to avoid connection pool exhaustion
 */
const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({ connectionString });

const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter,
		log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
	});

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}

// Graceful shutdown: disconnect on process termination
if (typeof process !== 'undefined') {
	process.on('beforeExit', async () => {
		await prisma.$disconnect();
	});
}

export { prisma };

export default prisma;
