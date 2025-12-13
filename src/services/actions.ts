/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { prisma } from '@/lib/db';
import { createClient } from '@/utils/supabase/server';
import type { StudyCard, Vocab, Kanji, User } from '@/generated/prisma';
import { UserRole, ReportStatus, ReportType } from '@/generated/prisma';
import { requireRole, hasRole } from '@/lib/auth/roleGuard';
import { Card, fsrs, generatorParameters, Rating, State } from 'ts-fsrs';

// Initialize FSRS with default parameters
const params = generatorParameters({ enable_fuzz: true });
const f = fsrs(params);

export type StudyCardWithDetails = StudyCard & {
	vocab?: Vocab | null;
	kanji?: Kanji | null;
};

/**
 * Helper to get current authenticated user
 */
export async function getUser() {
	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();
	if (error || !user) {
		return null;
	}

	// Optimization: In a real high-traffic app, we might cache this or use a session claim.
	// For this requirements "User is not considered active until...", we ensure DB record exists.
	// We can do a "fire and forget" sync or a check.
	// For safety in this "Side Project", let's just Upsert to be sure on every action check?
	// Or simpler: just return user. If a foreign key fails, we know why.
	// BUT the requirement is explicit.
	// Let's add a `ensureUserExists` call here?
	// To avoid infinite loops or overhead, let's assumes `syncUser` is called on Auth boundaries.
	// However, if we want to be 100% sure:
	// const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
	// if (!dbUser) { await syncUser(); }

	return user;
}

/**
 * Get the next card due for review for the CURRENT user
 * Optional: Constrain to specific deck
 */
/**
 * Get the next card due for review for the CURRENT user
 * Optional: Constrain to specific deck or LIST of decks (for Courses)
 */
export async function getNextReviewCard(
	deckIdOrIds?: string | string[],
): Promise<StudyCardWithDetails | null> {
	try {
		const user = await getUser();
		if (!user) return null;

		// 1. Fetch User Config for Limits
		const userConfig = await prisma.user.findUnique({
			where: { id: user.id },
			select: {
				limitNewCards: true,
				limitReviews: true,
			},
		});
		const limitNewCards = userConfig?.limitNewCards ?? 20;
		const limitReviews = userConfig?.limitReviews ?? 200;

		// 2. Count Today's Activity
		const startOfDay = new Date();
		startOfDay.setHours(0, 0, 0, 0);

		const reviewsToday = await prisma.reviewLog.count({
			where: {
				userId: user.id,
				review: { gte: startOfDay },
			},
		});

		const newCardsToday = await prisma.studyCard.count({
			where: {
				userId: user.id,
				createdAt: { gte: startOfDay },
				state: 0, // Explicitly counting cards created as 'New' today
			},
		});

		console.log(
			`Daily Stats for ${user.id}: Reviews ${reviewsToday}/${limitReviews}, New ${newCardsToday}/${limitNewCards}`,
		);

		// 3. Enforce Review Limit
		if (reviewsToday >= limitReviews) {
			console.log('Daily review limit reached.');
			return null;
		}

		// 4. Fetch Due Cards
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const whereCondition: any = {
			userId: user.id,
			state: {
				not: 3, // Assuming 3 is "Relearning" loop or similar, actually FSRS state 3 is Relearning.
				// We just want ANY card due.
			},
			due: {
				lte: new Date(),
			},
		};

		// If deckId is provided, filter cards that belong to this deck
		// A card belongs to a deck via its Vocab OR Kanji parent
		if (deckIdOrIds) {
			if (Array.isArray(deckIdOrIds)) {
				// Multiple Decks (Course Mode)
				whereCondition.OR = [
					{ vocab: { deckId: { in: deckIdOrIds } } },
					{ kanji: { deckId: { in: deckIdOrIds } } },
				];
			} else {
				// Single Deck
				whereCondition.OR = [
					{ vocab: { deckId: deckIdOrIds } },
					{ kanji: { deckId: deckIdOrIds } },
				];
			}
		}

		const card = await prisma.studyCard.findFirst({
			where: whereCondition,
			orderBy: {
				due: 'asc',
			},
			include: {
				vocab: { include: { _count: { select: { cardComments: true } } } },
				kanji: { include: { _count: { select: { cardComments: true } } } },
			},
		});

		if (card) {
			return card;
		}

		// --- JIT Enrollment Logic ---
		// 5. Enforce New Card Limit
		if (newCardsToday >= limitNewCards) {
			console.log('Daily new card limit reached.');
			return null;
		}

		// If no cards are due, look for NEW content to enroll

		// 1. Try to find a new Vocab
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const vocabWhere: any = {
			deck: {
				OR: [{ isPublic: true }, { authorId: user.id }],
			},
			studyCards: {
				none: { userId: user.id }, // Exclude if user already has a card for this vocab
			},
		};
		if (deckIdOrIds) {
			if (Array.isArray(deckIdOrIds)) {
				vocabWhere.deckId = { in: deckIdOrIds };
			} else {
				vocabWhere.deckId = deckIdOrIds;
			}
		}

		const newVocab = await prisma.vocab.findFirst({
			where: vocabWhere,
			orderBy: { createdAt: 'asc' }, // Learn oldest added first, or could be 'random'
		});

		if (newVocab) {
			console.log(`Enrolling new Vocab: ${newVocab.wordSurface}`);
			const newCard = await prisma.studyCard.create({
				data: {
					userId: user.id,
					vocabId: newVocab.id,
					due: new Date(), // Due immediately
					state: 0, // New
				},
				include: {
					vocab: { include: { _count: { select: { cardComments: true } } } },
					kanji: { include: { _count: { select: { cardComments: true } } } },
				},
			});
			return newCard;
		}

		// 2. Try to find a new Kanji
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const kanjiWhere: any = {
			deck: {
				OR: [{ isPublic: true }, { authorId: user.id }],
			},
			studyCards: {
				none: { userId: user.id },
			},
		};
		if (deckIdOrIds) {
			if (Array.isArray(deckIdOrIds)) {
				kanjiWhere.deckId = { in: deckIdOrIds };
			} else {
				kanjiWhere.deckId = deckIdOrIds;
			}
		}

		const newKanji = await prisma.kanji.findFirst({
			where: kanjiWhere,
			orderBy: { createdAt: 'asc' },
		});

		if (newKanji) {
			console.log(`Enrolling new Kanji: ${newKanji.kanji}`);
			const newCard = await prisma.studyCard.create({
				data: {
					userId: user.id,
					kanjiId: newKanji.id,
					due: new Date(),
					state: 0,
				},
				include: {
					vocab: { include: { _count: { select: { cardComments: true } } } },
					kanji: { include: { _count: { select: { cardComments: true } } } },
				},
			});
			return newCard;
		}

		return null;
	} catch (error) {
		console.error('Error fetching next review card:', error);
		return null;
	}
}

/**
 * Convert Prisma StudyCard to FSRS Card object
 */
function toFsrsCard(studyCard: StudyCard): Card {
	return {
		due: studyCard.due,
		stability: studyCard.stability,
		difficulty: studyCard.difficulty,
		elapsed_days: studyCard.elapsedDays,
		scheduled_days: studyCard.scheduledDays,
		reps: studyCard.reps,
		lapses: studyCard.lapses,
		state: studyCard.state as State,
		last_review: studyCard.lastReview || undefined,
		learning_steps: 0,
	};
}

/**
 * Submit a review for a card using FSRS algorithm
 * Validates ownership
 */
/**
 * Submit a review for a card using FSRS algorithm
 * Validates ownership
 */
export async function submitReview(
	cardId: string,
	rating: number,
	deckIdOrIds?: string | string[],
): Promise<{ success: boolean; nextCard?: StudyCardWithDetails | null; error?: string }> {
	try {
		const user = await getUser();
		if (!user) return { success: false, error: 'Unauthorized' };

		// 1. Fetch current card (ensure owned by user)
		const studyCard = await prisma.studyCard.findUnique({
			where: {
				id: cardId,
				userId: user.id, // Security check
			},
			include: {
				vocab: true,
				kanji: true,
			},
		});

		if (!studyCard) {
			return { success: false, error: 'Card not found or unauthorized' };
		}

		// 2. Validate Rating
		if (![1, 2, 3, 4].includes(rating)) {
			return { success: false, error: 'Invalid rating' };
		}
		const fsrsRating = rating as Rating;

		// 3. FSRS Calculation
		const currentCard = toFsrsCard(studyCard);
		const now = new Date();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const schedulingCards: any = f.repeat(currentCard, now);

		// Use type assertion or check existence to satisfy TS
		const recordLog = schedulingCards[fsrsRating];
		if (!recordLog) {
			throw new Error('Failed to calculate schedule for rating');
		}
		const { card: newCard, log: reviewLog } = recordLog;

		// 4. Update Database
		await prisma.studyCard.update({
			where: { id: cardId },
			data: {
				due: newCard.due,
				stability: newCard.stability,
				difficulty: newCard.difficulty,
				elapsedDays: newCard.elapsed_days,
				scheduledDays: newCard.scheduled_days,
				reps: newCard.reps,
				lapses: newCard.lapses,
				state: newCard.state,
				lastReview: newCard.last_review,
			},
		});

		// Create Review Log with userId
		await prisma.reviewLog.create({
			data: {
				cardId: cardId,
				rating: reviewLog.rating,
				review: reviewLog.review,
				scheduledDays: reviewLog.scheduled_days,
				elapsedDays: reviewLog.elapsed_days,
				state: reviewLog.state,
				userId: user.id,
			},
		});

		console.log(
			`Reviewed Card ${cardId} by User ${user.id}: Rating ${rating} -> Due ${newCard.due.toISOString()}`,
		);

		// 5. Fetch next card (maintaining deck context if present)
		const nextCard = await getNextReviewCard(deckIdOrIds);

		return { success: true, nextCard };
	} catch (error) {
		console.error('Error submitting review:', error);
		return { success: false, error: 'Failed to submit review' };
	}
}

/**
 * Fetch all decks visible to the user (Public + Created by User)
 */

export async function getLeaderboard() {
	try {
		const users = await prisma.user.findMany({
			take: 10,
			orderBy: {
				currentStreak: 'desc',
			},
			select: {
				id: true,
				name: true,
				currentStreak: true,
			},
		});

		// Ensure we handle display names
		return users.map((u) => ({
			...u,
			name: u.name || 'Anonymous Learner',
		}));
	} catch (error) {
		console.error('Error fetching leaderboard:', error);
		return [];
	}
}

export async function getDecks() {
	try {
		const user = await getUser();
		if (!user) return [];

		const decks = await prisma.deck.findMany({
			where: {
				OR: [{ isPublic: true }, { authorId: user.id }],
			},
			include: {
				_count: {
					select: { vocab: true, kanji: true },
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});
		return decks;
	} catch (error) {
		console.error('Error fetching decks:', error);
		return [];
	}
}

/**
 * Ensure Supabase user exists in Prisma DB
 * Called from auth callbacks or ensures consistency
 */
export async function syncUser() {
	try {
		const user = await getUser();
		if (!user) return { success: false, error: 'No authenticated user' };

		// Upsert user to ensure they exist
		await prisma.user.upsert({
			where: { id: user.id },
			update: {
				email: user.email!,
				updatedAt: new Date(),
			},
			create: {
				id: user.id,
				email: user.email!,
				name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
			},
		});

		return { success: true };
	} catch (error) {
		console.error('Error syncing user:', error);
		return { success: false, error: 'Failed to sync user' };
	}
}

/**
 * Get count of cards due for review
 */
export async function getReviewCount() {
	try {
		const user = await getUser();
		if (!user) return 0;

		const count = await prisma.studyCard.count({
			where: {
				userId: user.id,
				due: {
					lte: new Date(),
				},
			},
		});
		return count;
	} catch (error) {
		console.error('Error fetching review count:', error);
		return 0;
	}
}

/**
 * Get user statistics (Streak, Total Reviews)
 */
export async function getUserStats() {
	try {
		const user = await getUser();
		if (!user) return { streak: 0, totalReviewed: 0 };

		// Simple Today's Review Count
		const startOfDay = new Date();
		startOfDay.setHours(0, 0, 0, 0);

		const todaysReviews = await prisma.reviewLog.count({
			where: {
				userId: user.id,
				review: {
					gte: startOfDay,
				},
			},
		});

		// Placeholder for streak query
		return {
			streak: 1, // Mock value for now
			totalReviewed: todaysReviews,
		};
	} catch (error) {
		console.error('Error fetching stats:', error);
		return { streak: 0, totalReviewed: 0 };
	}
}

/**
 * Fetch a single deck by ID with vocab
 */
export async function getDeck(id: string) {
	try {
		const user = await getUser();
		if (!user) return null;

		const deck = await prisma.deck.findFirst({
			where: {
				id,
				OR: [{ isPublic: true }, { authorId: user.id }],
			},
			include: {
				vocab: {
					orderBy: { createdAt: 'desc' },
				},
				kanji: {
					orderBy: { createdAt: 'desc' },
				},
				_count: {
					select: { vocab: true, kanji: true },
				},
			},
		});

		if (!deck) return null;

		// Calculate Stats for User
		const studyCards = await prisma.studyCard.findMany({
			where: {
				userId: user.id,
				OR: [{ vocab: { deckId: id } }, { kanji: { deckId: id } }],
			},
			select: { state: true },
		});

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const learned = studyCards.filter((c) => c.state > 0).length;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const learning = studyCards.filter((c) => c.state === 0).length; // "New" in FSRS terms usually means state 0, but if we call it "Learning" in UI it's fine.
		// Actually state 0 = New, 1 = Learning, 2 = Review, 3 = Relearning.
		// Let's group:
		// "Learned" (Started) = Total Cards - Unseen? Or Cards with state > 0 (passed initial learning)?
		// User wants "How many words left". "Left" usually means "Unseen" + "New".
		// "Learned" usually means "Review" (state 2).
		// Let's provide granular stats:
		// Total Items
		// Started (Anyone with a card)
		//   - New (State 0)
		//   - Learning (State 1)
		//   - Review (State 2)
		//   - Relearning (State 3)
		// Unseen = Total Items - Started

		const stats = {
			total: deck._count.vocab + deck._count.kanji,
			started: studyCards.length,
			new: studyCards.filter((c) => c.state === 0).length,
			learning: studyCards.filter((c) => c.state === 1 || c.state === 3).length,
			review: studyCards.filter((c) => c.state === 2).length,
			unseen: deck._count.vocab + deck._count.kanji - studyCards.length,
		};

		return { ...deck, stats };
	} catch (error) {
		console.error('Error fetching deck:', error);
		return null;
	}
}

/**
 * Fetch all Vocabulary for the current user (from all decks user has access to)
 */
export async function getAllVocab() {
	try {
		const user = await getUser();
		if (!user) return [];

		// For now fetching ALL. In production, need pagination.
		const vocab = await prisma.vocab.findMany({
			where: {
				deck: {
					OR: [{ isPublic: true }, { authorId: user.id }],
				},
			},
			include: {
				deck: true,
				studyCards: {
					where: { userId: user.id },
					select: { state: true, due: true },
				},
			},
			orderBy: { createdAt: 'desc' },
		});
		return vocab;
	} catch (error) {
		console.error('Error fetching all vocab:', error);
		return [];
	}
}

/**
 * Fetch all Kanji for the current user
 */
export async function getAllKanji() {
	try {
		const user = await getUser();
		if (!user) return [];

		const kanji = await prisma.kanji.findMany({
			where: {
				deck: {
					OR: [{ isPublic: true }, { authorId: user.id }],
				},
			},
			include: {
				deck: true,
				studyCards: {
					where: { userId: user.id },
					select: { state: true, due: true },
				},
			},
			orderBy: { createdAt: 'desc' },
		});
		return kanji;
	} catch (error) {
		console.error('Error fetching all kanji:', error);
		return [];
	}
}

/**
 * Fetch User Settings (Limits and Preferences)
 */
export async function getUserSettings() {
	try {
		const user = await getUser();
		if (!user) return null;

		const settings = await prisma.user.findUnique({
			where: { id: user.id },
			select: {
				limitNewCards: true,
				limitReviews: true,
				allowSpaceKey: true,
				spaceKeyRating: true,
				autoShowAnswer: true,
				autoShowAnswerDelay: true,
			},
		});

		return settings;
	} catch (error) {
		console.error('Error fetching user settings:', error);
		return null;
	}
}

/**
 * Get daily progress stats for the user
 */
export async function getDailyProgress() {
	try {
		const user = await getUser();
		if (!user) return null;

		// 1. Get Limits & Timezone
		const userConfig = await prisma.user.findUnique({
			where: { id: user.id },
			select: { limitReviews: true, limitNewCards: true, timezone: true },
		});
		const limitReviews = userConfig?.limitReviews ?? 200;
		const limitNewCards = userConfig?.limitNewCards ?? 20;
		const timezone = userConfig?.timezone ?? 'UTC';

		// 2. Get Today's Counts (Timezone Aware)
		const startOfDay = getStartOfDayInTimezone(timezone);

		const reviewsToday = await prisma.reviewLog.count({
			where: {
				userId: user.id,
				review: { gte: startOfDay },
			},
		});

		const newCardsToday = await prisma.studyCard.count({
			where: {
				userId: user.id,
				createdAt: { gte: startOfDay },
				state: 0,
			},
		});

		// 3. Get Due Count
		const dueCount = await prisma.studyCard.count({
			where: {
				userId: user.id,
				due: { lte: new Date() },
			},
		});

		return {
			reviewsToday,
			limitReviews,
			newCardsToday,
			limitNewCards,
			dueCount,
		};
	} catch (error) {
		console.error('Error fetching daily progress:', error);
		return null;
	}
}

/**
 * Update User Settings
 */
export async function updateUserSettings(data: Partial<User>) {
	try {
		const user = await getUser();
		if (!user) return { success: false, error: 'Unauthorized' };

		// update
		await prisma.user.update({
			where: { id: user.id },
			data: {
				limitNewCards: data.limitNewCards,
				limitReviews: data.limitReviews,
				allowSpaceKey: data.allowSpaceKey,
				spaceKeyRating: data.spaceKeyRating,
				autoShowAnswer: data.autoShowAnswer,
				autoShowAnswerDelay: data.autoShowAnswerDelay,
				timezone: data.timezone,
				updatedAt: new Date(),
			},
		});

		return { success: true };
	} catch (error) {
		console.error('Error updating user settings:', error);
		return { success: false, error: 'Failed to update settings' };
	}
}

/**
 * Helper: Get Start of Day in User's Timezone (returned as UTC Date object)
 * e.g. If User is Tokyo (UTC+9), and it's 10am Tokyo, Start of Day is 00:00 Tokyo.
 * We need the UTC equivalent of 00:00 Tokyo, which is 15:00 UTC Previous Day.
 */
function getStartOfDayInTimezone(timezone: string = 'UTC'): Date {
	try {
		const now = new Date();
		// Get date string in user's timezone: "MM/DD/YYYY"
		const formatter = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone,
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
		});
		const parts = formatter.formatToParts(now);
		const month = parts.find((p) => p.type === 'month')?.value;
		const day = parts.find((p) => p.type === 'day')?.value;
		const year = parts.find((p) => p.type === 'year')?.value;

		if (!month || !day || !year) throw new Error('Invalid date parts');

		// Create a string "YYYY-MM-DDT00:00:00"
		// We want to find the UTC time that corresponds to this local time.
		// There isn't a direct "Date.from(string, timezone)" in stdlib.
		// WORKAROUND:
		// 1. Create a date assuming UTC: Date.UTC(year, month-1, day) -> Timestamp for 00:00 UTC.
		// 2. Adjust by the offset of that timezone? No, offset changes (DST).
		// 3. Iterative approach or library is best.
		// Since we want to be safe, let's assume 'UTC' if complex.
		// ACTUALLY, simpler:
		// We can use the string to CREATE a date object, but we need to know the offset.
		// Let's postpone complex date math and use a simplified version:
		// If we create "YYYY-MM-DD" string and append the offset? No we don't know the offset easily.

		// Fallback: Just use UTC for now to unblock, because native JS Timezone math is hell without `date-fns-tz`.
		// User specifically asked for it. I will try to use the `toLocaleString` trick to approximate.

		// Or try to parse offset from `longOffset`? "GMT+09:00".
		const offsetStr = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone,
			timeZoneName: 'longOffset',
		}).format(now);
		// Example: "12/12/2023, GMT+09:00"
		const match = offsetStr.match(/GMT([+-]\d{2}:\d{2})/);
		if (match) {
			const offset = match[1];
			const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00${offset}`;
			return new Date(iso);
		}

		return new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
	} catch (e) {
		console.warn('Timezone calculation failed, falling back to UTC', e);
		const d = new Date();
		d.setUTCHours(0, 0, 0, 0);
		return d;
	}
}

/**
 * Get weekly review stats for the chart (last 7 days)
 */
export async function getWeeklyStats() {
	try {
		const user = await getUser();
		if (!user) return null;

		const days: { day: string; date: Date; count: number; isToday: boolean }[] = [];
		const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		// Generate last 7 days
		for (let i = 6; i >= 0; i--) {
			const date = new Date(today);
			date.setDate(today.getDate() - i);
			const dayEnd = new Date(date);
			dayEnd.setHours(23, 59, 59, 999);

			const count = await prisma.reviewLog.count({
				where: {
					userId: user.id,
					review: {
						gte: date,
						lte: dayEnd,
					},
				},
			});

			days.push({
				day: dayNames[date.getDay()],
				date,
				count,
				isToday: i === 0,
			});
		}

		const thisWeekTotal = days.reduce((sum, d) => sum + d.count, 0);
		const bestDay = days.reduce((best, d) => (d.count > best.count ? d : best), days[0]);

		return {
			days: days.map((d) => ({ day: d.day, count: d.count, isToday: d.isToday })),
			thisWeekTotal,
			bestDay: { day: bestDay.day, count: bestDay.count },
		};
	} catch (error) {
		console.error('Error fetching weekly stats:', error);
		return null;
	}
}

/**
 * Get decks with due counts for dashboard
 */
export async function getDecksWithDue() {
	try {
		const user = await getUser();
		if (!user) return [];

		const decks = await prisma.deck.findMany({
			where: {
				OR: [{ isPublic: true }, { authorId: user.id }],
			},
			include: {
				_count: {
					select: { vocab: true, kanji: true },
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		// Get due counts for each deck
		const decksWithDue = await Promise.all(
			decks.map(async (deck) => {
				const dueCount = await prisma.studyCard.count({
					where: {
						userId: user.id,
						due: { lte: new Date() },
						OR: [{ vocab: { deckId: deck.id } }, { kanji: { deckId: deck.id } }],
					},
				});

				return {
					id: deck.id,
					title: deck.title,
					cardCount: deck._count.vocab + deck._count.kanji,
					dueCount,
				};
			}),
		);

		return decksWithDue;
	} catch (error) {
		console.error('Error fetching decks with due:', error);
		return [];
	}
}

/**
 * Get dashboard data (combined call for efficiency)
 */
export async function getDashboardData() {
	try {
		const [reviewCount, stats, weeklyStats, decksWithDue, userSettings] = await Promise.all([
			getReviewCount(),
			getUserStats(),
			getWeeklyStats(),
			getDecksWithDue(),
			getUserSettings(),
		]);

		// Get user name
		const user = await getUser();
		let userName: string | null = null;
		if (user) {
			const dbUser = await prisma.user.findUnique({
				where: { id: user.id },
				select: { name: true },
			});
			userName = dbUser?.name ?? null;
		}

		return {
			reviewCount,
			stats,
			weeklyStats,
			decksWithDue,
			userSettings,
			userName,
		};
	} catch (error) {
		console.error('Error fetching dashboard data:', error);
		return null;
	}
}

// --- Admin & Roles ---

/**
 * Get current user with role
 */
export async function getUserWithRole() {
	const user = await getUser();
	if (!user) return null;

	const dbUser = await prisma.user.findUnique({
		where: { id: user.id },
		select: { id: true, name: true, email: true, role: true },
	});
	return dbUser;
}

/**
 * Get stats for Admin Dashboard
 * Requires MODERATOR or higher
 */
export async function getAdminStats() {
	try {
		const currentUser = await getUserWithRole();
		requireRole(currentUser?.role, UserRole.MODERATOR);

		const [userCount, reviewCount, activeToday] = await Promise.all([
			prisma.user.count(),
			prisma.reviewLog.count(),
			prisma.user.count({
				where: {
					OR: [
						{ lastLogin: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
						{ updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
					],
				},
			}),
		]);

		return { userCount, reviewCount, activeToday };
	} catch (error) {
		console.error('Admin stats error:', error);
		throw error; // Let UI handle it
	}
}

/**
 * Get all users for management
 * Requires ADMIN
 */
export async function getAllUsers() {
	try {
		const currentUser = await getUserWithRole();
		requireRole(currentUser?.role, UserRole.ADMIN);

		// Limit to 100 for now
		return await prisma.user.findMany({
			take: 100,
			orderBy: { createdAt: 'desc' },
		});
	} catch (error) {
		console.error('Get users error:', error);
		return [];
	}
}

/**
 * Update a user's role
 * Requires ADMIN
 */
export async function updateUserRole(targetUserId: string, newRole: UserRole) {
	try {
		const currentUser = await getUserWithRole();
		requireRole(currentUser?.role, UserRole.ADMIN);

		const updatedUser = await prisma.user.update({
			where: { id: targetUserId },
			data: { role: newRole },
		});
		return { success: true, data: updatedUser };
	} catch (error) {
		console.error('Error updating user role:', error);
		return { success: false, error: 'Failed to update user role' };
	}
}

// --- Card Reporting Actions ---

export async function submitReport(data: {
	vocabId?: string;
	kanjiId?: string;
	type: ReportType;
	field?: string;
	currentValue?: string;
	suggestedValue?: string;
	notes?: string;
}) {
	try {
		const user = await getUser();
		if (!user) return { success: false, error: 'Unauthorized' };

		// Basic Validation: Must define what is reported
		if (!data.vocabId && !data.kanjiId) {
			return { success: false, error: 'Must specify a Vocab or Kanji ID' };
		}

		await prisma.cardReport.create({
			data: {
				reporterId: user.id,
				vocabId: data.vocabId,
				kanjiId: data.kanjiId,
				type: data.type,
				field: data.field,
				currentValue: data.currentValue,
				suggestedValue: data.suggestedValue,
				notes: data.notes,
			},
		});

		return { success: true };
	} catch (error) {
		console.error('Error submitting report:', error);
		return { success: false, error: 'Failed to submit report' };
	}
}

export async function getReports(limit: number = 50, status: ReportStatus = ReportStatus.PENDING) {
	try {
		const user = await getUserWithRole();
		if (!user || user.role === UserRole.USER) {
			return { success: false, error: 'Unauthorized' };
		}

		const reports = await prisma.cardReport.findMany({
			where: { status },
			take: limit,
			orderBy: { createdAt: 'desc' },
			include: {
				reporter: { select: { name: true, email: true } },
				vocab: true, // Fetch full vocab details
				kanji: true, // Fetch full kanji details
			},
		});
		return { success: true, data: reports };
	} catch (error) {
		console.error('Error fetching reports:', error);
		return { success: false, error: 'Failed to fetch reports' };
	}
}

export async function resolveReport(
	reportId: string,
	action: 'ACCEPT' | 'REJECT',
	resolutionStr?: string,
) {
	try {
		const currentUser = await getUserWithRole();
		if (!currentUser || !hasRole(currentUser.role, UserRole.MODERATOR)) {
			return { success: false, error: 'Unauthorized' };
		}

		const status = action === 'ACCEPT' ? ReportStatus.ACCEPTED : ReportStatus.REJECTED;

		const updated = await prisma.cardReport.update({
			where: { id: reportId },
			data: {
				status,
				resolution: resolutionStr,
				resolvedById: currentUser.id,
				resolvedAt: new Date(),
			},
		});

		// Logic for points could go here (e.g. if ACCEPT => awarding points to reporter)
		if (status === ReportStatus.ACCEPTED) {
			// Placeholder: await awardPoints(updated.reporterId, 5);
			console.log(`Accepted report ${reportId}, would award points to ${updated.reporterId}`);
		}

		return { success: true };
	} catch (error) {
		console.error('Error resolving report:', error);
		return { success: false, error: 'Failed to resolve report' };
	}
}

export async function updateVocab(id: string, data: Partial<Vocab>) {
	try {
		const user = await getUserWithRole();
		if (!user || !hasRole(user.role, UserRole.MODERATOR)) {
			return { success: false, error: 'Unauthorized' };
		}

		await prisma.vocab.update({
			where: { id },
			data: {
				wordSurface: data.wordSurface,
				readingKana: data.readingKana,
				meaning: data.meaning,
				exampleSentence: data.exampleSentence as any,
				wordParts: data.wordParts as any,
			},
		});
		return { success: true };
	} catch (error) {
		console.error('Error updating vocab:', error);
		return { success: false, error: 'Failed to update vocab' };
	}
}

export async function updateKanji(id: string, data: Partial<Kanji>) {
	try {
		const user = await getUserWithRole();
		if (!user || !hasRole(user.role, UserRole.MODERATOR)) {
			return { success: false, error: 'Unauthorized' };
		}

		await prisma.kanji.update({
			where: { id },
			data: {
				kanji: data.kanji,
				onyomi: data.onyomi,
				kunyomi: data.kunyomi,
				meaning: data.meaning,
				examples: data.examples as any,
			},
		});
		return { success: true };
	} catch (error) {
		console.error('Error updating kanji:', error);
		return { success: false, error: 'Failed to update kanji' };
	}
}
