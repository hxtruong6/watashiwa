'use server';

import { generateUploadUrl } from '@/lib/storage';
import { randomUUID } from 'crypto';
import { z } from 'zod';

const PresignedUrlSchema = z.object({
	fileType: z.string().regex(/^image\/(jpeg|png|webp|gif)$/),
	purpose: z.enum(['avatar', 'card']),
});

export type UploadPurpose = 'avatar' | 'card';

export async function getPresignedUrl(fileType: string, purpose: UploadPurpose) {
	try {
		const validation = PresignedUrlSchema.safeParse({ fileType, purpose });
		if (!validation.success) return { success: false, error: 'Invalid input' };

		// Basic validation
		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
		if (!allowedTypes.includes(fileType)) {
			return {
				success: false,
				error: 'Invalid file type. Only JPG, PNG, WebP, and GIF are allowed.',
			};
		}

		const ext = fileType.split('/')[1];
		// Generate a unique filename: purpose/uuid.ext
		// purpose is pluralized for folder organization: avatars/..., cards/...
		const folder = `${purpose}s`;
		const filename = `${folder}/${randomUUID()}.${ext}`;

		const { url, publicUrl } = await generateUploadUrl(filename, fileType);

		return { success: true, url, publicUrl };
	} catch (error) {
		console.error('Error in getPresignedUrl:', error);
		return { success: false, error: 'Failed to generate upload URL' };
	}
}
