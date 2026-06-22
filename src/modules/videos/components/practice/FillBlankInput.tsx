'use client';

import { WordWithFurigana } from '@/modules/vocabulary/components/WordWithFurigana';
import { Input, Space } from 'antd';
import type { InputRef } from 'antd/es/input';
import { memo, useCallback, useEffect, useRef } from 'react';
import * as wanakana from 'wanakana';

import type { Subtitle, SubtitleWord } from '../../types';

const BLANK_PLACEHOLDER = '______';

export interface FillBlankInputProps {
	subtitle: Subtitle;
	blankIndices: number[];
	values: string[];
	onChange: (values: string[]) => void;
	disabled?: boolean;
	'aria-label'?: string;
	/** When set, show correct answer below each blank (after incorrect or show answer). */
	revealedBlanks?: string[];
	/** Per-blank hint prefix (revealed characters from Hint button). */
	hintPrefixes?: string[];
	/** Ref to the first blank input DOM element (for focus on empty submit). */
	firstInputRef?: React.RefObject<HTMLInputElement | null>;
}

function romajiToReading(romaji: string): string {
	const t = (romaji || '').trim();
	if (!t) return '';
	return wanakana.toKana(t.toLowerCase(), { IMEMode: false });
}

function FillBlankInputComponent({
	subtitle,
	blankIndices,
	values,
	onChange,
	disabled = false,
	'aria-label': ariaLabel,
	revealedBlanks,
	hintPrefixes,
	firstInputRef,
}: FillBlankInputProps) {
	const firstBlankRef = useRef<InputRef>(null);
	const subtitleId = subtitle.id;
	const words = subtitle.words;
	const segments: Array<{ type: 'text'; word: SubtitleWord } | { type: 'blank'; index: number }> =
		[];

	if (words.length === 0) {
		segments.push({ type: 'blank', index: 0 });
	} else {
		const blankSet = new Set(blankIndices);
		words.forEach((w, i) => {
			if (blankSet.has(i)) {
				segments.push({ type: 'blank', index: blankIndices.indexOf(i) });
			} else {
				segments.push({ type: 'text', word: w });
			}
		});
	}

	useEffect(() => {
		firstBlankRef.current?.input?.focus();
	}, [subtitleId]);

	const handleChange = useCallback(
		(blankIndex: number, value: string) => {
			const next = [...values];
			next[blankIndex] = value;
			onChange(next);
		},
		[values, onChange],
	);

	return (
		<div role="group" aria-label={ariaLabel ?? 'Fill in the blanks'}>
			<Space wrap align="center" size="middle" style={{ width: '100%' }}>
				{segments.map((seg, i) =>
					seg.type === 'text' ? (
						<WordWithFurigana
							key={i}
							wordSurface={seg.word.text}
							wordReading={romajiToReading(seg.word.romaji) || undefined}
							showReadingLine={false}
							as="span"
							fontSize={18}
						/>
					) : (
						<span
							key={`blank-${seg.index}`}
							style={{
								display: 'inline-flex',
								flexDirection: 'column',
								alignItems: 'flex-start',
								gap: 4,
							}}
						>
							<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
								{hintPrefixes != null && hintPrefixes[seg.index] != null && (
									<span
										style={{
											fontSize: 18,
											color: 'var(--ant-colorPrimary)',
											fontWeight: 500,
										}}
									>
										{hintPrefixes[seg.index]}
									</span>
								)}
								<Input
									ref={
										seg.index === 0
											? (el) => {
													firstBlankRef.current = el;
													if (firstInputRef) {
														firstInputRef.current = el?.input ?? null;
													}
												}
											: undefined
									}
									value={values[seg.index] ?? ''}
									onChange={(e) => handleChange(seg.index, e.target.value)}
									placeholder={BLANK_PLACEHOLDER}
									disabled={disabled}
									style={{
										minWidth: 100,
										maxWidth: 220,
										borderRadius: 'var(--ant-borderRadius, 8px)',
										borderStyle: 'dashed',
										borderColor: 'var(--ant-colorBorder)',
										backgroundColor: 'var(--ant-colorFillQuaternary)',
									}}
									aria-label={`Blank ${seg.index + 1}`}
									autoComplete="off"
								/>
							</span>
							{revealedBlanks != null && revealedBlanks[seg.index] != null && (
								<span
									style={{
										fontSize: 13,
										fontWeight: 500,
										color: 'var(--ant-colorSuccess)',
									}}
								>
									{revealedBlanks[seg.index]}
								</span>
							)}
						</span>
					),
				)}
			</Space>
		</div>
	);
}

export const FillBlankInput = memo(FillBlankInputComponent);
