import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';

export const deckParsers = {
	page: parseAsInteger.withDefault(1),
	limit: parseAsInteger.withDefault(10),
	sort: parseAsString.withDefault('createdAt'),
	order: parseAsString.withDefault('desc'),
	search: parseAsString.withDefault(''),
};

export const deckParamsCache = createSearchParamsCache(deckParsers);
