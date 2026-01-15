/**
 * Convert SRT subtitle file to JSON format for video learning
 * Filters subtitles between startTime and endTime
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface SRTSegment {
	index: number;
	startTime: number; // in seconds
	endTime: number; // in seconds
	text: string;
}

/**
 * Parse SRT time format (HH:MM:SS,mmm) to seconds
 */
function parseSRTTime(timeStr: string): number {
	const [time, milliseconds] = timeStr.split(',');
	const [hours, minutes, seconds] = time.split(':').map(Number);
	return (
		Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + Number(milliseconds) / 1000
	);
}

/**
 * Parse SRT file content
 */
function parseSRT(content: string): SRTSegment[] {
	const segments: SRTSegment[] = [];
	const blocks = content.trim().split(/\n\s*\n/);

	for (const block of blocks) {
		const lines = block.trim().split('\n');
		if (lines.length < 3) continue;

		const index = parseInt(lines[0], 10);
		if (isNaN(index)) continue;

		const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
		if (!timeMatch) continue;

		const startTime = parseSRTTime(timeMatch[1]);
		const endTime = parseSRTTime(timeMatch[2]);
		const text = lines.slice(2).join(' ').trim();

		// Clean up text - remove English translations and special markers
		const cleanedText = text
			.replace(/\[音楽\]/g, '') // Remove [音楽]
			.replace(/\[音楽\]/g, '') // Remove [音楽] again
			.replace(
				/Welcome to|javorite|in this|lessents|エジソン|パティスペイト|トライ|Wecandothis|Ihelpyou|TAKE|isdon'tliketohave|ミンス|Areyouready|I'MSorry|Whatlong|Ithankispossible|IThink|Believeinyourself|yourLight|Shallwego|ウォッチアウト|creach|Thankyousomuchfor|subs/g,
				'',
			)
			.replace(/\s+/g, ' ')
			.trim();

		if (cleanedText) {
			segments.push({
				index,
				startTime,
				endTime,
				text: cleanedText,
			});
		}
	}

	return segments;
}

/**
 * Split Japanese text into words/phrases
 * Simple heuristic: split by common particles and punctuation
 */
function splitJapaneseText(text: string): string[] {
	// Split by common particles, punctuation, and spaces
	const words: string[] = [];
	let currentWord = '';

	for (let i = 0; i < text.length; i++) {
		const char = text[i];
		const nextChar = text[i + 1];

		// Common particles that typically separate words
		if (
			[
				'は',
				'が',
				'を',
				'に',
				'で',
				'と',
				'から',
				'まで',
				'より',
				'の',
				'も',
				'か',
				'ね',
				'よ',
				'さ',
			].includes(char)
		) {
			if (currentWord) {
				words.push(currentWord + char);
				currentWord = '';
			} else {
				words.push(char);
			}
		} else if (['、', '。', '！', '？', ' '].includes(char)) {
			if (currentWord) {
				words.push(currentWord);
				currentWord = '';
			}
			if (char !== ' ') {
				words.push(char);
			}
		} else {
			currentWord += char;
		}
	}

	if (currentWord) {
		words.push(currentWord);
	}

	return words.filter((w) => w.trim().length > 0);
}

/**
 * Generate romaji (placeholder - would need proper library)
 * For now, return a simple placeholder
 */
function generateRomaji(text: string): string {
	// This is a placeholder - in production, use a proper Japanese-to-romaji library
	// For now, return a simplified version
	return (
		text
			.replace(/[あ-ん]/g, (char) => {
				// Very basic hiragana to romaji mapping (incomplete)
				const map: Record<string, string> = {
					あ: 'a',
					い: 'i',
					う: 'u',
					え: 'e',
					お: 'o',
					か: 'ka',
					き: 'ki',
					く: 'ku',
					け: 'ke',
					こ: 'ko',
					さ: 'sa',
					し: 'shi',
					す: 'su',
					せ: 'se',
					そ: 'so',
					た: 'ta',
					ち: 'chi',
					つ: 'tsu',
					て: 'te',
					と: 'to',
					な: 'na',
					に: 'ni',
					ぬ: 'nu',
					ね: 'ne',
					の: 'no',
					は: 'ha',
					ひ: 'hi',
					ふ: 'fu',
					へ: 'he',
					ほ: 'ho',
					ま: 'ma',
					み: 'mi',
					む: 'mu',
					め: 'me',
					も: 'mo',
					や: 'ya',
					ゆ: 'yu',
					よ: 'yo',
					ら: 'ra',
					り: 'ri',
					る: 'ru',
					れ: 're',
					ろ: 'ro',
					わ: 'wa',
					を: 'wo',
					ん: 'n',
				};
				return map[char] || char;
			})
			.replace(/[ア-ン]/g, (char) => {
				// Basic katakana to romaji (same as hiragana)
				return generateRomaji(char.toLowerCase());
			})
			.trim() || text
	);
}

/**
 * Assign color to word based on type (heuristic)
 */
function assignColor(
	word: string,
): 'yellow' | 'green' | 'purple' | 'red' | 'blue' | 'light-blue' | undefined {
	// Time expressions
	if (word.includes('今') || word.includes('時') || word.includes('日')) {
		return 'yellow';
	}
	// Verbs (ending with る, う, etc.)
	if (/[るうつぬむくぐすすぶ]$/.test(word)) {
		return 'red';
	}
	// Nouns (ending with さん, さん, etc.)
	if (word.includes('さん') || word.includes('くん') || word.includes('もの')) {
		return 'blue';
	}
	// Particles
	if (['は', 'が', 'を', 'に', 'で', 'と', 'から', 'の', 'も'].includes(word)) {
		return 'green';
	}
	// Adverbs
	if (word.includes('そう') || word.includes('たくさん')) {
		return 'purple';
	}
	return undefined;
}

/**
 * Convert SRT segments to JSON format
 */
function convertToJSON(
	segments: SRTSegment[],
	videoId: string,
	startTimeFilter: number,
	endTimeFilter: number,
): unknown {
	const filteredSegments = segments.filter(
		(seg) => seg.startTime >= startTimeFilter && seg.endTime <= endTimeFilter,
	);

	const subtitles = filteredSegments.map((seg, index) => {
		const words = splitJapaneseText(seg.text);
		const duration = seg.endTime - seg.startTime;
		const wordDuration = duration / words.length;

		const wordData = words.map((word, wordIndex) => {
			const wordStart = wordIndex * wordDuration;
			const wordEnd = (wordIndex + 1) * wordDuration;

			return {
				text: word,
				romaji: generateRomaji(word),
				startTime: wordStart,
				endTime: wordEnd,
				color: assignColor(word),
				type:
					assignColor(word) === 'red' ? 'verb' : assignColor(word) === 'blue' ? 'noun' : undefined,
			};
		});

		return {
			id: `sub-${seg.index}`,
			order: index + 1,
			startTime: seg.startTime,
			endTime: seg.endTime,
			sentence: seg.text,
			translation: {
				vi: '', // Will need manual translation
				en: '', // Optional
			},
			words: wordData,
		};
	});

	return {
		version: '1.0',
		videoId,
		language: 'ja',
		targetLanguage: 'vi',
		subtitles,
	};
}

// Main execution
const srtPath = join(
	process.cwd(),
	'src/modules/videos/samples/Japanese Listening Practice With A Story (Informal) #3 _ Tournament [Intermediate].srt',
);
const outputPath = join(process.cwd(), 'src/modules/videos/samples/video1-subtitles.json');

const srtContent = readFileSync(srtPath, 'utf-8');
const segments = parseSRT(srtContent);

// Filter: 0:20 (20 seconds) to 2:36 (156 seconds)
const startTime = 20;
const endTime = 156;

const jsonData = convertToJSON(segments, 'video1', startTime, endTime);

writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), 'utf-8');

console.log(`✅ Converted SRT to JSON`);
console.log(`📁 Output: ${outputPath}`);
console.log(`📊 Subtitles: ${(jsonData as { subtitles: unknown[] }).subtitles.length} segments`);
console.log(`⏱️  Time range: ${startTime}s - ${endTime}s`);
