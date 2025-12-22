import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize Prisma directly or import from lib if available
// Assuming ../src/lib/db exists and exports prisma
import { prisma } from '../src/lib/db';

async function seedMinnaCourse() {
	console.log('🚀 Starting Minna no Nihongo N5 Course Seed...');

	// 1. Resolve Author (Admin)
	const author =
		(await prisma.user.findFirst({
			where: { role: 'ADMIN' },
		})) || (await prisma.user.findFirst());

	if (!author) {
		throw new Error('❌ No user found. Please create a user first.');
	}

	console.log(`👤 Using Author: ${author.email || author.id}`);

	// 2. Upsert Course
	const courseTitle = 'Minna no Nihongo N5';
	let course = await prisma.course.findFirst({
		where: { title: courseTitle, authorId: author.id },
	});

	if (!course) {
		console.log(`✨ Creating Course: ${courseTitle}`);
		course = await prisma.course.create({
			data: {
				title: 'Minna no Nihongo N5 (Sơ cấp 1)',
				titleEn: 'Minna no Nihongo N5 (Beginner 1)',
				description:
					'Trọn bộ từ vựng giáo trình Minna no Nihongo I (Bài 1-25) dành cho người mới bắt đầu.',
				descriptionEn:
					'Complete vocabulary list for Minna no Nihongo I (Units 1-25) for beginners.',
				authorId: author.id,
				isPublic: true,
				level: 'N5',
				tags: ['minna', 'n5', 'textbook'],
			},
		});
	} else {
		console.log(`✅ Using Existing Course: ${course.id}`);
		// Update localized fields if they don't match or just to be safe
		await prisma.course.update({
			where: { id: course.id },
			data: {
				title: 'Minna no Nihongo N5 (Sơ cấp 1)',
				description:
					'Trọn bộ từ vựng giáo trình Minna no Nihongo I (Bài 1-25) dành cho người mới bắt đầu.',
				descriptionEn:
					'Complete vocabulary list for Minna no Nihongo I (Units 1-25) for beginners.',
			},
		});
	}

	// 3. Process Units 1-25
	const DATA_DIR = path.resolve(process.cwd(), 'data/seed/minna_1');

	for (let i = 1; i <= 25; i++) {
		const unitNum = String(i).padStart(2, '0');
		// Try both filename patterns just in case, though we verified unitXX.json
		const filename = `unit${unitNum}.json`;
		const filePath = path.join(DATA_DIR, filename);

		if (!fs.existsSync(filePath)) {
			console.warn(`⚠️ File not found: ${filename}. Skipping.`);
			continue;
		}

		console.log(`\n📦 Processing Unit ${i}...`);
		const rawData = fs.readFileSync(filePath, 'utf-8');
		const items = JSON.parse(rawData);

		if (!Array.isArray(items)) {
			console.error(`❌ Invalid data format in ${filename}. Expected array.`);
			continue;
		}

		// 3a. Upsert Deck
		const deckTitleVn = `Minna no Nihongo Bài ${i}`;
		const deckTitleEn = `Minna no Nihongo Unit ${i}`;

		let deck = await prisma.deck.findFirst({
			where: {
				authorId: author.id,
				OR: [{ title: deckTitleVn }, { titleEn: deckTitleEn }],
			},
		});

		if (!deck) {
			deck = await prisma.deck.create({
				data: {
					title: deckTitleVn,
					titleEn: deckTitleEn,
					description: `Danh sách từ vựng ${deckTitleVn}`,
					descriptionEn: `Vocabulary list for ${deckTitleEn}`,
					authorId: author.id,
					isPublic: true,
					sortOrder: i,
				},
			});
			console.log(`   + Created Deck: ${deckTitleVn}`);
		} else {
			console.log(`   = Found Deck: ${deck.title}`);
			await prisma.deck.update({
				where: { id: deck.id },
				data: {
					title: deckTitleVn,
					titleEn: deckTitleEn,
					description: `Danh sách từ vựng ${deckTitleVn}`,
					descriptionEn: `Vocabulary list for ${deckTitleEn}`,
					sortOrder: i,
				},
			});
		}

		// 3b. Link Course <-> Deck
		const link = await prisma.courseDeck.findUnique({
			where: {
				courseId_deckId: {
					courseId: course.id,
					deckId: deck.id,
				},
			},
		});

		if (!link) {
			await prisma.courseDeck.create({
				data: {
					courseId: course.id,
					deckId: deck.id,
					sortOrder: i,
				},
			});
			console.log(`   🔗 Linked Deck to Course`);
		}

		// 3c. Upsert Vocabulary (Parallel)
		console.log(`   > Upserting ${items.length} words...`);

		let createdCount = 0;
		let updatedCount = 0;

		await Promise.all(
			items.map(async (item: any) => {
				// --- NORMALIZATION LOGIC ---

				const wordSurface = item.word_surface || item.wordSurface || item.word;
				const wordReading = item.kana || item.readingKana;

				if (!wordSurface || !wordReading) {
					// console.warn(`Skipping invalid item: ${JSON.stringify(item)}`);
					return;
				}

				// Handle Meanings (Convert string -> Object if needed)
				let meanings = item.meanings || {};
				if (typeof item.meaning === 'string') {
					meanings = {
						en: [item.meaning],
						vi: [],
					};
					// Try to extract VI from complex mnemonic or just leave empty?
					// Unit 21 has mnemonics.vi.idea
					if (item.mnemonics?.vi?.idea) {
						meanings.vi.push(item.mnemonics.vi.idea);
					}
				}

				// Handle Mnemonic (Convert complex object -> simple string {vi, en})
				let mnemonic = item.mnemonic || item.mnemonics || null;
				if (mnemonic) {
					// Normalize strict structure {vi: string, en: string}
					const normalizedMnemonic: any = {};

					if (typeof mnemonic.vi === 'string') {
						normalizedMnemonic.vi = mnemonic.vi;
					} else if (mnemonic.vi?.idea) {
						normalizedMnemonic.vi = mnemonic.vi.idea; // Flatten
					}

					if (typeof mnemonic.en === 'string') {
						normalizedMnemonic.en = mnemonic.en;
					} else if (mnemonic.en?.idea) {
						normalizedMnemonic.en = mnemonic.en.idea; // Flatten
					}

					mnemonic = normalizedMnemonic;
				}

				const existingVocab = await prisma.vocabulary.findFirst({
					where: {
						deckId: deck.id,
						wordSurface: wordSurface,
						wordReading: wordReading,
					},
				});

				const vocabData = {
					wordSurface: wordSurface,
					wordReading: wordReading,
					wordRomaji: item.romaji || item.wordRomaji || null,
					hanViet: item.han_viet || item.hanViet || null,

					tags: item.tags || [],
					pitchPattern: item.pitch_pattern || 0,
					pitchSvgPath: item.pitch_svg_path || null,

					etymology: item.etymology || {},
					meanings: meanings,
					examples: item.examples || [],
					mnemonic: mnemonic,

					contentStatus: 'VERIFIED',
				};

				if (existingVocab) {
					await prisma.vocabulary.update({
						where: { id: existingVocab.id },
						data: {
							...vocabData,
							contentStatus: existingVocab.contentStatus === 'DRAFT' ? 'VERIFIED' : undefined,
						},
					});
					updatedCount++;
				} else {
					await prisma.vocabulary.create({
						data: {
							deckId: deck.id,
							...vocabData,
							contentStatus: 'VERIFIED',
						},
					});
					createdCount++;
				}
			}),
		);

		console.log(`   Summary: ${createdCount} created, ${updatedCount} updated.`);
	}

	console.log('\n🎉 Seed Complete!');
}

seedMinnaCourse()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
