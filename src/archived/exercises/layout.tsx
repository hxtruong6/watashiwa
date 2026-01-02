import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Active Recall Exercises | WatashiWa',
	description: 'Practice your vocabulary with active recall exercises.',
};

export default function ExercisesLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
