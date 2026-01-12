import React from 'react';
import { describe, expect, it } from 'vitest';

import type { NavItem } from './NavConfig';
import { isActiveRoute } from './useNavBarConstants';

describe('isActiveRoute', () => {
	const missionItem: NavItem = {
		key: 'mission',
		label: 'Mission',
		path: '/dashboard?app=true',
		icon: React.createElement('div'),
	};

	const discoverItem: NavItem = {
		key: 'discover',
		label: 'Discover',
		path: '/decks',
		icon: React.createElement('div'),
	};

	const collectionItem: NavItem = {
		key: 'collection',
		label: 'Collection',
		path: '/dashboard/decks',
		icon: React.createElement('div'),
	};

	const journeyItem: NavItem = {
		key: 'journey',
		label: 'Journey',
		path: '/dashboard/courses',
		icon: React.createElement('div'),
	};

	describe('Mission route (special case)', () => {
		it('should be active on root with app=true param', () => {
			const searchParams = new URLSearchParams('app=true');
			expect(isActiveRoute('/', missionItem, searchParams)).toBe(true);
		});

		it('should be active on /dashboard path', () => {
			expect(isActiveRoute('/dashboard', missionItem)).toBe(true);
		});

		it('should be active on /dashboard/courses path', () => {
			expect(isActiveRoute('/dashboard/courses', missionItem)).toBe(true);
		});

		it('should not be active on root without app=true', () => {
			const searchParams = new URLSearchParams();
			expect(isActiveRoute('/', missionItem, searchParams)).toBe(false);
		});

		it('should not be active on other paths', () => {
			expect(isActiveRoute('/decks', missionItem)).toBe(false);
		});
	});

	describe('Discover route', () => {
		it('should be active on /decks path', () => {
			expect(isActiveRoute('/decks', discoverItem)).toBe(true);
		});

		it('should be active on /decks/123 path', () => {
			expect(isActiveRoute('/decks/123', discoverItem)).toBe(true);
		});

		it('should not be active on other paths', () => {
			expect(isActiveRoute('/dashboard', discoverItem)).toBe(false);
		});
	});

	describe('Collection route', () => {
		it('should be active on /dashboard/decks path', () => {
			expect(isActiveRoute('/dashboard/decks', collectionItem)).toBe(true);
		});

		it('should be active on /dashboard/decks/123 path', () => {
			expect(isActiveRoute('/dashboard/decks/123', collectionItem)).toBe(true);
		});

		it('should not be active on /dashboard path', () => {
			expect(isActiveRoute('/dashboard', collectionItem)).toBe(false);
		});
	});

	describe('Journey route', () => {
		it('should be active on /dashboard/courses path', () => {
			expect(isActiveRoute('/dashboard/courses', journeyItem)).toBe(true);
		});

		it('should be active on /dashboard/courses/123 path', () => {
			expect(isActiveRoute('/dashboard/courses/123', journeyItem)).toBe(true);
		});

		it('should not be active on /dashboard path', () => {
			expect(isActiveRoute('/dashboard', journeyItem)).toBe(false);
		});
	});
});
