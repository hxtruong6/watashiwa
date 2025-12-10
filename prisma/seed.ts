import prisma from '../src/lib/db.js';

async function main() {
	console.log('🌱 Seeding database with Golden Data...');

	// Clear existing data
	await prisma.reviewLog.deleteMany();
	await prisma.vocabCard.deleteMany();

	// Golden Data: 5 Test Cards (JLPT N5-N3)
	const cards = [
		{
			word_surface: '学生',
			reading_kana: 'がくせい',
			kanji_breakdown: [
				{ kanji: '学', han_viet: 'HỌC', meaning: 'study' },
				{ kanji: '生', han_viet: 'SINH', meaning: 'life/birth' },
			],
			han_viet: 'HỌC SINH',
			meaning: 'Student',
			example_sentence: {
				sentence: '私は学生です。',
				translation: 'I am a student.',
			},
		},
		{
			word_surface: '先生',
			reading_kana: 'せんせい',
			kanji_breakdown: [
				{ kanji: '先', han_viet: 'TIÊN', meaning: 'before/ahead' },
				{ kanji: '生', han_viet: 'SINH', meaning: 'life' },
			],
			han_viet: 'TIÊN SINH',
			meaning: 'Teacher',
			example_sentence: {
				sentence: '田中先生は優しいです。',
				translation: 'Tanaka-sensei is kind.',
			},
		},
		{
			word_surface: '図書館',
			reading_kana: 'としょかん',
			kanji_breakdown: [
				{ kanji: '図', han_viet: 'ĐỒ', meaning: 'diagram' },
				{ kanji: '書', han_viet: 'THƯ', meaning: 'write' },
				{ kanji: '館', han_viet: 'QUÁN', meaning: 'building' },
			],
			han_viet: 'ĐỒ THƯ QUÁN',
			meaning: 'Library',
			example_sentence: {
				sentence: '図書館で勉強します。',
				translation: 'I study at the library.',
			},
		},
		{
			word_surface: '勉強',
			reading_kana: 'べんきょう',
			kanji_breakdown: [
				{ kanji: '勉', han_viet: 'MIỄN', meaning: 'exertion' },
				{ kanji: '強', han_viet: 'CƯỜNG', meaning: 'strong' },
			],
			han_viet: 'MIỄN CƯỜNG',
			meaning: 'Study',
			example_sentence: {
				sentence: '毎日日本語を勉強します。',
				translation: 'I study Japanese every day.',
			},
		},
		{
			word_surface: '友達',
			reading_kana: 'ともだち',
			kanji_breakdown: [
				{ kanji: '友', han_viet: 'HỮU', meaning: 'friend' },
				{ kanji: '達', han_viet: 'ĐẠT', meaning: 'plural' },
			],
			han_viet: 'HỮU ĐẠT',
			meaning: 'Friend',
			example_sentence: {
				sentence: '友達と映画を見ます。',
				translation: 'I watch movies with friends.',
			},
		},
	];

	for (const card of cards) {
		await prisma.vocabCard.create({
			data: card,
		});
	}

	console.log('✅ Seeded 5 vocabulary cards successfully!');
}

main()
	.catch((e) => {
		console.error('❌ Seeding failed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
