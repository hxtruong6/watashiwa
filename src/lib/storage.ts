import { Storage, GetSignedUrlConfig } from '@google-cloud/storage';
import mime from 'mime-types';
import fs from 'node:fs';
import path from 'node:path';

// --- Configuration Resolution ---
const projectId = process.env.GCP_STORAGE_BUCKET_PROJECT_ID;
const bucketName = process.env.GCP_STORAGE_BUCKET_NAME;
let keyFilename = process.env.GCP_STORAGE_BUCKET_KEY_FILENAME;

// Fallback: Check for gcs.json in project root if ENV is not set
if (!keyFilename) {
	const localKeyFile = path.join(process.cwd(), 'gcs.json');
	if (fs.existsSync(localKeyFile)) {
		keyFilename = localKeyFile;
	}
}

// --- Validation ---
if (!projectId && !keyFilename) {
	console.error('Missing Google Cloud Storage Credentials (PROJECT_ID or KEY_FILENAME)');
	// We don't throw here to allow build even if config is missing, but runtime will fail
}

if (!bucketName) {
	console.error('Missing Google Cloud Storage Bucket Name (GCP_STORAGE_BUCKET_NAME)');
}

// Initialize Storage
const storage = new Storage({
	projectId,
	keyFilename,
});

/**
 * Generates a V4 signed URL for uploading a file to GCS.
 * @param filename - The full path of the file in the bucket (e.g., avatars/user123.jpg)
 * @param contentType - The MIME type of the file
 * @param expiresInSeconds - Expiration time in seconds (default 1 hour)
 * @returns Object containing the signed PUT URL and the eventual public URL
 */
export async function generateUploadUrl(
	filename: string,
	contentType: string,
	expiresInSeconds = 3600,
) {
	if (!bucketName) {
		throw new Error('GCP_STORAGE_BUCKET_NAME is not properly configured.');
	}

	// Validate Content Type
	const contentTypeMime = mime.contentType(contentType);
	if (!contentTypeMime) {
		throw new Error(`Invalid content type: ${contentType}`);
	}

	const options: GetSignedUrlConfig = {
		version: 'v4',
		action: 'write',
		expires: Date.now() + expiresInSeconds * 1000,
		contentType: contentTypeMime as string,
	};

	try {
		const [url] = await storage.bucket(bucketName).file(filename).getSignedUrl(options);

		// Public URL (assuming public access or future proxy)
		const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;

		return { url, publicUrl };
	} catch (error) {
		console.error('Error generating pre-signed URL:', error);
		throw new Error('Failed to generate upload URL');
	}
}
