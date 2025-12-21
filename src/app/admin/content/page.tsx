import { ContentWorkbench } from '@/components/admin/QA/ContentWorkbench';
import React from 'react';

export default function AdminContentPage() {
	// Negative margin to break out of AdminShell's default padding (24px)
	return (
		<div style={{ margin: -24, height: 'calc(100vh - 112px)', overflow: 'hidden' }}>
			<ContentWorkbench />
		</div>
	);
}
