#!/usr/bin/env tsx
/**
 * Analytics Events Migration Helper
 *
 * This script helps identify and migrate analytics event names from strings
 * to the new type-safe AnalyticsEvents constants.
 *
 * Usage:
 *   pnpm tsx scripts/migrate-analytics-events.ts
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { extname, join } from 'path';

const EVENT_MAPPINGS: Record<string, string> = {
	user_signed_up: 'AnalyticsEvents.Auth.UserSignedUp',
	user_returned: 'AnalyticsEvents.Auth.UserReturned',
	study_session_started: 'AnalyticsEvents.Study.SessionStarted',
	user_first_study_session_started: 'AnalyticsEvents.Study.FirstSessionStarted',
	study_session_first_card_shown: 'AnalyticsEvents.Study.FirstCardShown',
	study_session_completed: 'AnalyticsEvents.Study.SessionCompleted',
	user_first_study_session_completed: 'AnalyticsEvents.Study.FirstSessionCompleted',
	study_session_reset: 'AnalyticsEvents.Study.SessionReset',
	study_empty_state_shown: 'AnalyticsEvents.Study.EmptyStateShown',
	study_summary_continue_clicked: 'AnalyticsEvents.Study.SummaryContinueClicked',
	study_navigation_timing: 'AnalyticsEvents.Study.NavigationTiming',
	card_reviewed: 'AnalyticsEvents.Study.CardReviewed',
	priming_skipped: 'AnalyticsEvents.Priming.Skipped',
	priming_modal_read_clicked: 'AnalyticsEvents.Priming.ModalReadClicked',
	priming_modal_skip_clicked: 'AnalyticsEvents.Priming.ModalSkipClicked',
	story_opened: 'AnalyticsEvents.Priming.StoryOpened',
	story_completed: 'AnalyticsEvents.Priming.StoryCompleted',
	keyword_tapped: 'AnalyticsEvents.Priming.KeywordTapped',
	deck_created: 'AnalyticsEvents.Deck.Created',
	feature_discovered: 'AnalyticsEvents.Feature.Discovered',
	algorithm_mode_switched: 'AnalyticsEvents.Algorithm.ModeSwitched',
	error_occurred: 'AnalyticsEvents.Error.Occurred',
};

interface MigrationResult {
	file: string;
	line: number;
	oldCode: string;
	newCode: string;
	eventName: string;
}

function findTrackEventCalls(content: string, filePath: string): MigrationResult[] {
	const results: MigrationResult[] = [];
	const lines = content.split('\n');

	// Pattern: trackEvent('event_name', ...) or trackEvent("event_name", ...)
	const trackEventPattern = /trackEvent\s*\(\s*['"]([^'"]+)['"]/g;

	lines.forEach((line, index) => {
		let match;
		while ((match = trackEventPattern.exec(line)) !== null) {
			const eventName = match[1];
			if (EVENT_MAPPINGS[eventName]) {
				const oldCode = line.trim();
				const newCode = line.replace(
					/trackEvent\s*\(\s*['"][^'"]+['"]/,
					`trackEvent(${EVENT_MAPPINGS[eventName]}`,
				);

				results.push({
					file: filePath,
					line: index + 1,
					oldCode,
					newCode,
					eventName,
				});
			}
		}
	});

	return results;
}

function findLogAnalyticsEventCalls(content: string, filePath: string): MigrationResult[] {
	const results: MigrationResult[] = [];
	const lines = content.split('\n');

	// Pattern: logAnalyticsEvent('event_name', ...) or logAnalyticsEvent("event_name", ...)
	const logEventPattern = /logAnalyticsEvent\s*\(\s*['"]([^'"]+)['"]/g;

	lines.forEach((line, index) => {
		let match;
		while ((match = logEventPattern.exec(line)) !== null) {
			const eventName = match[1];
			if (EVENT_MAPPINGS[eventName]) {
				const oldCode = line.trim();
				const newCode = line.replace(
					/logAnalyticsEvent\s*\(\s*['"][^'"]+['"]/,
					`logAnalyticsEvent(${EVENT_MAPPINGS[eventName]}`,
				);

				results.push({
					file: filePath,
					line: index + 1,
					oldCode,
					newCode,
					eventName,
				});
			}
		}
	});

	return results;
}

function scanDirectory(dir: string, results: MigrationResult[]): void {
	const files = readdirSync(dir);

	for (const file of files) {
		const filePath = join(dir, file);
		const stat = statSync(filePath);

		// Skip node_modules, .next, dist, etc.
		if (
			file.startsWith('.') ||
			file === 'node_modules' ||
			file === '.next' ||
			file === 'dist' ||
			file === 'build'
		) {
			continue;
		}

		if (stat.isDirectory()) {
			scanDirectory(filePath, results);
		} else if (extname(file) === '.ts' || extname(file) === '.tsx') {
			try {
				const content = readFileSync(filePath, 'utf-8');
				results.push(...findTrackEventCalls(content, filePath));
				results.push(...findLogAnalyticsEventCalls(content, filePath));
			} catch (error) {
				console.error(`Error reading ${filePath}:`, error);
			}
		}
	}
}

function main() {
	console.log('🔍 Scanning for analytics events to migrate...\n');

	const results: MigrationResult[] = [];
	const srcDir = join(process.cwd(), 'src');
	scanDirectory(srcDir, results);

	if (results.length === 0) {
		console.log('✅ No events found that need migration!');
		return;
	}

	// Group by file
	const byFile = new Map<string, MigrationResult[]>();
	for (const result of results) {
		const relativePath = result.file.replace(process.cwd() + '/', '');
		if (!byFile.has(relativePath)) {
			byFile.set(relativePath, []);
		}
		byFile.get(relativePath)!.push(result);
	}

	// Print report
	console.log(`📊 Found ${results.length} event(s) to migrate in ${byFile.size} file(s):\n`);

	for (const [file, fileResults] of byFile.entries()) {
		console.log(`📄 ${file}`);
		for (const result of fileResults) {
			console.log(`   Line ${result.line}: ${result.eventName}`);
			console.log(`   ❌ ${result.oldCode}`);
			console.log(`   ✅ ${result.newCode}`);
			console.log('');
		}
	}

	console.log('\n💡 To migrate:');
	console.log('   1. Add import: import { AnalyticsEvents } from "@/lib/analytics";');
	console.log('   2. Replace string literals with AnalyticsEvents constants');
	console.log('   3. Verify TypeScript compiles without errors');
}

if (require.main === module) {
	main();
}

export { main };
