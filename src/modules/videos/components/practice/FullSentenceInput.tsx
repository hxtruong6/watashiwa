'use client';

import { Input } from 'antd';
import { memo } from 'react';

const { TextArea } = Input;

export interface FullSentenceInputProps {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	placeholder?: string;
	'aria-label'?: string;
	onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
	inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

function FullSentenceInputComponent({
	value,
	onChange,
	disabled = false,
	placeholder,
	'aria-label': ariaLabel,
	onKeyDown,
	inputRef,
}: FullSentenceInputProps) {
	return (
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
	);
}

export const FullSentenceInput = memo(FullSentenceInputComponent);
