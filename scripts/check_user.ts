import { prisma } from '../src/lib/db';

async function main() {
	const user = await prisma.user.findFirst();
	if (user) {
		console.log('Found user:', user.id, user.name);
	} else {
		console.log('No users found.');
	}
}

main();
