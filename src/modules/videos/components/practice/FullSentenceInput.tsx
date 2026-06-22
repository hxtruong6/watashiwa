'use client';

import { Input } from 'antd';
import { memo } from 'react';

const { TextArea } = Input;

export interface FullSentenceInputProps {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	placeholder?: string;
	/** Revealed prefix from Hint button (e.g. "みどりさんこ"). */
	hintPrefix?: string;
	'aria-label'?: string;
	onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
	inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

function FullSentenceInputComponent({
	value,
	onChange,
	disabled = false,
	placeholder,
	hintPrefix,
	'aria-label': ariaLabel,
	onKeyDown,
	inputRef,
}: FullSentenceInputProps) {
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
			{hintPrefix != null && hintPrefix.length > 0 && (
				<span
					style={{
						fontSize: 16,
						color: 'var(--ant-colorPrimary)',
						fontWeight: 500,
					}}
				>
					{hintPrefix}
				</span>
			)}
			<TextArea
				ref={inputRef}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={onKeyDown}
				disabled={disabled}
				placeholder={placeholder}
				autoSize={{ minRows: 2, maxRows: 5 }}
				style={{ width: '100%' }}
				aria-label={ariaLabel ?? 'Type the full sentence'}
				autoComplete="off"
			/>
		</div>
	);
}

export const FullSentenceInput = memo(FullSentenceInputComponent);
