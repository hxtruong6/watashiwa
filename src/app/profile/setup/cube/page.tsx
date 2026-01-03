import { redirect } from 'next/navigation';

/**
 * Redirect old /profile/setup/cube route to new public /info/cube route
 * This preserves any existing bookmarks or links
 */
export default async function CubeIntroductionPage() {
	redirect('/info/cube');
}
