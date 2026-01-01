import { redirect } from 'next/navigation';

/**
 * Privacy page - redirects to privacy-policy for consistency
 */
export default function PrivacyPage() {
	redirect('/privacy-policy');
}
