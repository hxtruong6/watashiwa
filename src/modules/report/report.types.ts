import { ReportStatus, ReportType } from '@prisma/client';
import { z } from 'zod';

export const IdSchema = z.string().min(1);

export const ReportSchema = z
	.object({
		vocabId: z.string().optional(),
		type: z.nativeEnum(ReportType),
		field: z.string().optional(),
		currentValue: z.string().optional(),
		suggestedValue: z.string().optional(),
		notes: z.string().optional(),
	})
	.refine((data) => data.vocabId, {
		message: 'Must specify a Vocab ID',
		path: ['vocabId'],
	});

export const ResolveReportSchema = z.object({
	reportId: IdSchema,
	action: z.enum(['ACCEPT', 'REJECT']),
	resolutionStr: z.string().optional(),
});

export type ReportPayload = z.infer<typeof ReportSchema>;
export type ResolveReportPayload = z.infer<typeof ResolveReportSchema>;

export interface AdminReportFilters {
	page?: number;
	limit?: number;
	status?: ReportStatus;
}
