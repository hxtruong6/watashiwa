import { prisma } from '../src/lib/db';

async function main() {
	console.log('🌱 Starting seed...');

	// Clear existing data
	await prisma.reviewLog.deleteMany();
	await prisma.vocabCard.deleteMany();

	// Golden Data from Feature Spec
	const goldenData = [
		// 1. New Card (State: 0)
		{
			word_surface: '猫',
			reading_kana: 'ねこ',
			kanji_breakdown: [{ kanji: '猫', han_viet: 'MIÊU', meaning: 'cat' }],
			han_viet: 'MIÊU',
			meaning: 'Cat',
			example_sentence: {
				sentence: '猫が好きです。',
				translation: 'I like cats.',
			},
			state: 0, // New
			stability: 0,
			difficulty: 0,
			due: new Date(),
		},
		// 2. Learning Card (State: 1)
		{
			word_surface: '食べる',
			reading_kana: 'たべる',
			kanji_breakdown: [{ kanji: '食', han_viet: 'THỰC', meaning: 'eat' }],
			han_viet: 'THỰC',
			meaning: 'To eat',
			example_sentence: {
				sentence: '寿司を食べる。',
				translation: 'Eat sushi.',
			},
			state: 1, // Learning
			stability: 0,
			difficulty: 0,
			due: new Date(),
		},
		// 3. Review Card (State: 2) - Stability 5.0
		{
			word_surface: '日本',
			reading_kana: 'にほん',
			kanji_breakdown: [
				{ kanji: '日', han_viet: 'NHẬT', meaning: 'day/sun' },
				{ kanji: '本', han_viet: 'BẢN', meaning: 'book/origin' },
			],
			han_viet: 'NHẬT BẢN',
			meaning: 'Japan',
			example_sentence: {
				sentence: '日本に行きたい。',
				translation: 'I want to go to Japan.',
			},
			state: 2, // Review
			stability: 5.0,
			difficulty: 5.0,
			// Due in the past to trigger review
			due: new Date(new Date().setDate(new Date().getDate() - 1)),
		},
		// 4. Lapse Card (State: 3 - Relearning) - Stability 20.0 but failed recently if we want to simulate lapse,
		// actually feature spec says "Lapse: Review, Stability: 20.0 -> Again".
		// So let's create a card that IS in review but has high stability, ready to be lapsed.
		{
			word_surface: '難しい',
			reading_kana: 'むずかしい',
			kanji_breakdown: [{ kanji: '難', han_viet: 'NAN', meaning: 'difficult' }],
			han_viet: 'NAN',
			meaning: 'Difficult',
			example_sentence: {
				sentence: '日本語は難しいです。',
				translation: 'Japanese is difficult.',
			},
			state: 2, // Review
			stability: 20.0,
			difficulty: 5.0,
			due: new Date(new Date().setDate(new Date().getDate() - 1)),
		},
		// 5. Young Review Card (Just graduated)
		{
			word_surface: '学生',
			reading_kana: 'がくせい',
			kanji_breakdown: [
				{ kanji: '学', han_viet: 'HỌC', meaning: 'study' },
				{ kanji: '生', han_viet: 'SINH', meaning: 'life/student' },
			],
			han_viet: 'HỌC SINH',
			meaning: 'Student',
			example_sentence: {
				sentence: '私は学生です。',
				translation: 'I am a student.',
			},
			state: 2, // Review
			stability: 1.0,
			difficulty: 3.0,
			due: new Date(new Date().setDate(new Date().getDate() - 1)),
		},
	];

	for (const card of goldenData) {
		await prisma.vocabCard.create({
			data: card,
		});
	}

	console.log(`✅ Seeded ${goldenData.length} cards.`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
