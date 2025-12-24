import { createSerializer, parseAsInteger } from 'nuqs/server';

export const reportParams = {
	limit: parseAsInteger.withDefault(50),
};

export const reportParamsCache = createSerializer(reportParams);
