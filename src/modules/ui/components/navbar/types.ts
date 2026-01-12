import type { User } from '@supabase/supabase-js';

/**
 * Shared types for navbar components
 * Uses Supabase User type for consistency across the app
 */
export type NavBarUser = User | null;

export interface NavBarClientProps {
	user?: NavBarUser;
	streak?: number;
}
