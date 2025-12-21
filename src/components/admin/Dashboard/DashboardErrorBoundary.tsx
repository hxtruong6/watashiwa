'use client';

import { Alert, Button } from 'antd';
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export class DashboardErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
		error: null,
	};

	public static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('Uncaught error:', error, errorInfo);
	}

	public render() {
		if (this.state.hasError) {
			return (
				<Alert
					message="Dashboard Error"
					description={this.state.error?.message || 'Something went wrong loading this section.'}
					type="error"
					showIcon
					action={
						<Button size="small" type="primary" onClick={() => this.setState({ hasError: false })}>
							Retry
						</Button>
					}
				/>
			);
		}

		return this.props.children;
	}
}
