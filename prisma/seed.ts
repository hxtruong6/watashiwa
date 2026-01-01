// ❯ npx tsx prisma/seed.ts
import { ADMIN_USER_ID } from '@/lib/constants';

import { prisma } from '../src/lib/db';

async function main() {
	console.log('🌱 Starting seed...');
	let user = await prisma.user.findFirst();
	if (!user) {
		console.log('No user found, creating default user...');
		user = await prisma.user.upsert({
			where: { id: ADMIN_USER_ID },
			create: {
				id: ADMIN_USER_ID,
				email: 'admin@watashiwa.app',
				name: 'WatashiWa',
				role: 'ADMIN',
			},
			update: {},
		});
	}
	console.log(`Created user: ${user.email} (${user.id})`);
	console.log('✅ Seeded successfully.');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
