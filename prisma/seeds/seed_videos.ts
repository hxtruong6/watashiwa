/**
 * Seed script for Video Learning module
 *
 * Imports video and subtitle data from JSON files
 * Usage: npx tsx prisma/seed_videos.ts
 */
import { ContentStatus, type Prisma } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';
import { v7 } from 'uuid';

import { prisma } from '../../src/lib/db';

interface SubtitleWord {
	text: string;
	romaji: string;
	startTime: number;
	endTime: number;
	color?: string;
	type?: string;
}

interface SubtitleData {
	id: string;
	order: number;
	startTime: number;
	endTime: number;
	sentence: string;
	translation: {
		vi: string;
		en?: string;
	};
	words: SubtitleWord[];
}

interface VideoSubtitleFile {
	version: string;
	videoId: string;
	language: string;
	targetLanguage: string;
	subtitles: SubtitleData[];
}

/**
 * Load and parse JSON subtitle file
 */
function loadSubtitleFile(filePath: string): VideoSubtitleFile {
	const content = readFileSync(filePath, 'utf-8');
	return JSON.parse(content) as VideoSubtitleFile;
}

/**
 * Seed a single video with subtitles
 */
async function seedVideo(videoData: {
	id: string;
	title: string;
	titleEn?: string;
	description?: string;
	videoUrl: string;
	thumbnailUrl?: string;
	duration: number;
	level?: string;
	tags?: string[];
	deckId?: string;
	subtitleFile: string;
}) {
	console.log(`\n📹 Seeding video: ${videoData.title}`);

	// Load subtitle file
	const subtitleFile = loadSubtitleFile(videoData.subtitleFile);
	console.log(`   📄 Loaded ${subtitleFile.subtitles.length} subtitles from JSON`);

	// Check if video already exists
	const existingVideo = await prisma.video.findUnique({
		where: { id: videoData.id },
	});

	if (existingVideo) {
		console.log(`   ⚠️  Video ${videoData.id} already exists, skipping...`);
		return;
	}

	// Create video
	const video = await prisma.video.create({
		data: {
			id: videoData.id,
			title: videoData.title,
			titleEn: videoData.titleEn,
			description: videoData.description,
			videoUrl: videoData.videoUrl,
			thumbnailUrl: videoData.thumbnailUrl,
			duration: videoData.duration,
			level: videoData.level,
			tags: videoData.tags || [],
			deckId: videoData.deckId,
			language: subtitleFile.language,
			targetLanguage: subtitleFile.targetLanguage,
			contentStatus: ContentStatus.PUBLISHED,
		},
	});

	console.log(`   ✅ Created video: ${video.id}`);

	// Create subtitles
	const subtitles = subtitleFile.subtitles.map((sub) => ({
		videoId: video.id,
		startTime: sub.startTime,
		endTime: sub.endTime,
		sentence: sub.sentence,
		translation: sub.translation as unknown as Prisma.InputJsonValue,
		words: sub.words as unknown as Prisma.InputJsonValue,
		order: sub.order,
	}));

	// Insert subtitles in batches to avoid overwhelming the database
	const batchSize = 50;
	for (let i = 0; i < subtitles.length; i += batchSize) {
		const batch = subtitles.slice(i, i + batchSize);
		await prisma.subtitle.createMany({
			data: batch,
		});
	}

	console.log(`   ✅ Created ${subtitles.length} subtitles`);
	console.log(`   🎬 Video ready: ${video.videoUrl}`);
}

/**
 * Main seed function
 */
async function main() {
	console.log('🌱 Starting video seed...\n');

	const video1SubtitlePath = join(
		process.cwd(),
		'src/modules/videos/samples/video1-subtitles.json',
	);

	// IMPORTANT:
	// The `/learn/videos/[videoId]` route validates `videoId` as a UUID (z.uuid()).
	// So seeded videos must use UUID ids (not "video1", "video2", etc.).
	const VIDEO1_ID = v7() as string;

	// Seed video1
	await seedVideo({
		id: VIDEO1_ID,
		title: 'Japanese Listening Practice - Tournament (Intermediate)',
		titleEn: 'Japanese Listening Practice - Tournament (Intermediate)',
		description:
			'Intermediate Japanese listening practice video about a bouldering tournament. Practice informal Japanese conversation.',
		videoUrl: 'https://storage.googleapis.com/watashiwa_app/videos/video1.mp4',
		duration: 156, // 2:36 in seconds
		level: 'Intermediate',
		tags: ['listening', 'conversation', 'informal', 'tournament', 'bouldering'],
		subtitleFile: video1SubtitlePath,
	});

	console.log('\n✅ Video seed completed!');
	console.log(`\n🔗 Demo URL: /learn/videos/${VIDEO1_ID}`);
}

// Execute
main()
	.catch((error) => {
		console.error('❌ Error seeding videos:', error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
