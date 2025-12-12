'use server';

import { prisma } from '@/lib/db';
import { getUser } from '@/services/actions';
import { CommentType } from '@/generated/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Get comments for a speicific Vocab or Kanji
 */
export async function getComments(entityId: string, type: 'vocab' | 'kanji') {
	const user = await getUser();
	const where = type === 'vocab' ? { vocabId: entityId } : { kanjiId: entityId };

	const comments = await prisma.cardComment.findMany({
		where: {
			...where,
			isHidden: false,
		},
		include: {
			author: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
			votes: user
				? {
						where: {
							userId: user.id,
						},
					}
				: false,
		},
		orderBy: [{ isPinned: 'desc' }, { score: 'desc' }, { createdAt: 'desc' }],
	});

	// Transform to include userVote status
	return comments.map((c) => ({
		...c,
		userVote: c.votes?.[0]?.value || 0, // 0 if no vote or not logged in
	}));
}

/**
 * Create a new comment
 */
export async function createComment(
	entityId: string,
	entityType: 'vocab' | 'kanji',
	content: string,
	commentType: CommentType = 'GENERAL',
) {
	const user = await getUser();
	if (!user) {
		return { success: false, error: 'Unauthorized' };
	}

	if (!content || content.trim().length === 0) {
		return { success: false, error: 'Content cannot be empty' };
	}

	try {
		const data = entityType === 'vocab' ? { vocabId: entityId } : { kanjiId: entityId };

		await prisma.cardComment.create({
			data: {
				...data,
				content,
				type: commentType,
				authorId: user.id,
			},
		});

		revalidatePath('/study');
		revalidatePath(`/decks`);
		return { success: true };
	} catch (error) {
		console.error('Failed to create comment', error);
		return { success: false, error: 'Failed to create comment' };
	}
}

/**
 * Vote on a comment (Upvote/Downvote)
 * Value: 1 (up), -1 (down), 0 (remove vote)
 */
export async function voteComment(commentId: string, value: number) {
	const user = await getUser();
	if (!user) {
		return { success: false, error: 'Unauthorized' };
	}

	if (![-1, 0, 1].includes(value)) {
		return { success: false, error: 'Invalid vote value' };
	}

	try {
		// Transaction to ensure vote record and score count stay in sync
		await prisma.$transaction(async (tx) => {
			const existingVote = await tx.commentVote.findUnique({
				where: {
					commentId_userId: {
						commentId,
						userId: user.id,
					},
				},
			});

			// If removing vote
			if (value === 0) {
				if (existingVote) {
					await tx.commentVote.delete({
						where: { id: existingVote.id },
					});

					// Adjust score
					await tx.cardComment.update({
						where: { id: commentId },
						data: {
							score: { decrement: existingVote.value },
							upvotes: existingVote.value === 1 ? { decrement: 1 } : undefined,
							downvotes: existingVote.value === -1 ? { decrement: 1 } : undefined,
						},
					});
				}
				return;
			}

			// If updating or creating vote
			if (existingVote) {
				// Changing vote
				if (existingVote.value !== value) {
					await tx.commentVote.update({
						where: { id: existingVote.id },
						data: { value },
					});

					// Update counts
					// e.g. was -1, now 1. Score +2. Down -1, Up +1.
					const scoreDiff = value - existingVote.value;
					await tx.cardComment.update({
						where: { id: commentId },
						data: {
							score: { increment: scoreDiff },
							upvotes: { increment: value === 1 ? 1 : -1 }, // if new is 1, inc. if new is -1, dec (because old was 1)
							downvotes: { increment: value === -1 ? 1 : -1 },
						},
					});
					// Wait, simplistic increment logic above is risky. Let's be explicit.
					// Actually, simpler to just recalculate? No, that's heavy.
					// Correct logic:
					// Remove old effect:
					//   if old=1: score-1, up-1
					//   if old=-1: score+1, down-1
					// Add new effect:
					//   if new=1: score+1, up+1
					//   if new=-1: score-1, down+1
				}
				// If same vote, do nothing
			} else {
				// New vote
				await tx.commentVote.create({
					data: {
						commentId,
						userId: user.id,
						value,
					},
				});

				await tx.cardComment.update({
					where: { id: commentId },
					data: {
						score: { increment: value },
						upvotes: value === 1 ? { increment: 1 } : undefined,
						downvotes: value === -1 ? { increment: 1 } : undefined,
					},
				});
			}
		});

		return { success: true };
	} catch (error) {
		console.error('Failed to vote', error);
		return { success: false, error: 'Failed to vote' };
	}
}

/**
 * Delete a comment (Author or Admin/Mod)
 */
export async function deleteComment(commentId: string) {
	const user = await getUser();
	if (!user) return { success: false, error: 'Unauthorized' };

	try {
		const comment = await prisma.cardComment.findUnique({
			where: { id: commentId },
		});

		if (!comment) return { success: false, error: 'Comment not found' };

		// Check ownership or role
		const isAuthor = comment.authorId === user.id;
		const isAdmin = user.role === 'ADMIN' || user.role === 'MODERATOR';

		if (!isAuthor && !isAdmin) {
			return { success: false, error: 'Forbidden' };
		}

		await prisma.cardComment.delete({
			where: { id: commentId },
		});

		revalidatePath('/study');
		return { success: true };
	} catch (error) {
		console.error('Failed to delete comment', error);
		return { success: false, error: 'Failed to delete' };
	}
}

/**
 * Get trending/top comments for Dashboard
 */
export async function getTrendingComments(limit = 5) {
	// We want comments with high score, recent
	const comments = await prisma.cardComment.findMany({
		where: {
			isHidden: false,
			score: { gt: 0 }, // Must have positive score
		},
		take: limit,
		orderBy: {
			score: 'desc',
		},
		include: {
			author: { select: { name: true } },
			vocab: { select: { wordSurface: true, id: true } },
			kanji: { select: { kanji: true, id: true } },
		},
	});

	return comments;
}

/**
 * Update a comment
 */
export async function updateComment(commentId: string, content: string, type: CommentType) {
	const user = await getUser();
	if (!user) return { success: false, error: 'Unauthorized' };

	try {
		const comment = await prisma.cardComment.findUnique({
			where: { id: commentId },
		});

		if (!comment) return { success: false, error: 'Comment not found' };

		if (comment.authorId !== user.id) {
			return { success: false, error: 'Forbidden' };
		}

		await prisma.cardComment.update({
			where: { id: commentId },
			data: { content, type },
		});

		return { success: true };
	} catch (error) {
		console.error('Failed to update comment', error);
		return { success: false, error: 'Failed to update' };
	}
}

/**
 * Get user's top contributions (comments with votes)
 */
export async function getUserContributions() {
	const user = await getUser();
	if (!user) return [];

	const comments = await prisma.cardComment.findMany({
		where: {
			authorId: user.id,
			score: { gt: 0 },
		},
		orderBy: { score: 'desc' },
		take: 5,
		include: {
			vocab: { select: { wordSurface: true, id: true } },
			kanji: { select: { kanji: true, id: true } },
		},
	});

	return comments;
}

/**
 * Get full community feed with filtering and pagination
 */
export async function getCommunityFeed({
	filter = 'trending',
	tag,
	page = 1,
	limit = 10,
}: {
	filter?: 'trending' | 'newest' | 'mine';
	tag?: 'ALL' | CommentType;
	page?: number;
	limit?: number;
}) {
	const user = await getUser();
	const skip = (page - 1) * limit;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const where: any = { isHidden: false };

	// Filter by Tag
	if (tag && tag !== 'ALL') {
		where.type = tag;
	}

	// Filter by "Mine"
	if (filter === 'mine') {
		if (!user) return { data: [], total: 0 };
		where.authorId = user.id;
	} else {
		// Public feeds: trending or newest
		// For Trending, only show positive score?
		if (filter === 'trending') {
			where.score = { gt: 0 };
		}
	}

	const [total, comments] = await Promise.all([
		prisma.cardComment.count({ where }),
		prisma.cardComment.findMany({
			where,
			take: limit,
			skip,
			orderBy: filter === 'trending' ? { score: 'desc' } : { createdAt: 'desc' },
			include: {
				author: { select: { id: true, name: true, email: true } },
				vocab: { select: { wordSurface: true, id: true, meaning: true, deckId: true } },
				kanji: { select: { kanji: true, id: true, meaning: true } },
				votes: user ? { where: { userId: user.id } } : false,
			},
		}),
	]);

	const data = comments.map((c) => ({
		...c,
		userVote: c.votes?.[0]?.value || 0,
	}));

	return { data, total };
}
