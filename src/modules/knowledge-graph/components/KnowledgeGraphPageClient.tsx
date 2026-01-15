'use client';
import type { ApiResponse } from '@/modules/core/dto';
import { Typography } from 'antd';

import type { KnowledgeGraphPayload } from '../types';
import { KnowledgeGraphPanel } from './KnowledgeGraphPanel';

const { Title } = Typography;

type KnowledgeGraphPageClientProps = {
	response: ApiResponse<KnowledgeGraphPayload>;
};

export function KnowledgeGraphPageClient({ response }: KnowledgeGraphPageClientProps) {
	return (
		<div>
			<Title level={3}>Knowledge Graph</Title>
			<KnowledgeGraphPanel payload={response.data ?? null} errorMessage={response.error} />
		</div>
	);
}
