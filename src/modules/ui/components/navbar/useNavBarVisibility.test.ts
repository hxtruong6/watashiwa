import { useUIStore } from '@/modules/ui/store/useUIStore';
import { renderHook } from '@testing-library/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';

import { useNavBarVisibility } from './useNavBarVisibility';

// Mock next/navigation
vi.mock('next/navigation', () => ({
	usePathname: vi.fn(),
	useSearchParams: vi.fn(),
}));

// Mock UI store
vi.mock('@/modules/ui/store/useUIStore', () => ({
	useUIStore: vi.fn(),
}));

describe('useNavBarVisibility', () => {
	it('should return visible for normal routes', () => {
		(usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/dashboard');
		(useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(new URLSearchParams());
		(useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

		const { result } = renderHook(() => useNavBarVisibility());

		expect(result.current.shouldShow).toBe(true);
		expect(result.current.reason).toBe('visible');
	});

	it('should hide on auth pages', () => {
		(usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/login');
		(useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(new URLSearchParams());
		(useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

		const { result } = renderHook(() => useNavBarVisibility());

		expect(result.current.shouldShow).toBe(false);
		expect(result.current.reason).toBe('auth_page');
	});

	it('should hide on forgot-password page', () => {
		(usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/forgot-password');
		(useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(new URLSearchParams());
		(useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

		const { result } = renderHook(() => useNavBarVisibility());

		expect(result.current.shouldShow).toBe(false);
		expect(result.current.reason).toBe('auth_page');
	});

	it('should hide on reset-password page', () => {
		(usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/reset-password');
		(useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(new URLSearchParams());
		(useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

		const { result } = renderHook(() => useNavBarVisibility());

		expect(result.current.shouldShow).toBe(false);
		expect(result.current.reason).toBe('auth_page');
	});

	it('should hide on active study session with deckId', () => {
		(usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/study');
		(useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(
			new URLSearchParams('deckId=123'),
		);
		(useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

		const { result } = renderHook(() => useNavBarVisibility());

		expect(result.current.shouldShow).toBe(false);
		expect(result.current.reason).toBe('active_study_session');
	});

	it('should hide on active study session with courseId', () => {
		(usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/study');
		(useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(
			new URLSearchParams('courseId=456'),
		);
		(useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

		const { result } = renderHook(() => useNavBarVisibility());

		expect(result.current.shouldShow).toBe(false);
		expect(result.current.reason).toBe('active_study_session');
	});

	it('should show on study dashboard (no deckId/courseId)', () => {
		(usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/study');
		(useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(new URLSearchParams());
		(useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

		const { result } = renderHook(() => useNavBarVisibility());

		expect(result.current.shouldShow).toBe(true);
		expect(result.current.reason).toBe('visible');
	});

	it('should hide on exercises page', () => {
		(usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/exercises');
		(useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(new URLSearchParams());
		(useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

		const { result } = renderHook(() => useNavBarVisibility());

		expect(result.current.shouldShow).toBe(false);
		expect(result.current.reason).toBe('exercises_page');
	});

	it('should hide on admin routes', () => {
		(usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/admin/users');
		(useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(new URLSearchParams());
		(useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

		const { result } = renderHook(() => useNavBarVisibility());

		expect(result.current.shouldShow).toBe(false);
		expect(result.current.reason).toBe('admin_route');
	});

	it('should hide when store says hidden (focus mode)', () => {
		(usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/dashboard');
		(useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(new URLSearchParams());
		(useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

		const { result } = renderHook(() => useNavBarVisibility());

		expect(result.current.shouldShow).toBe(false);
		expect(result.current.reason).toBe('store_hidden');
	});
});
