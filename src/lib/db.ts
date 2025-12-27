import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;

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
