import { EditOutlined } from '@ant-design/icons';
import { Input, Typography, theme } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface InlineInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	multiline?: boolean;
	textStyle?: React.CSSProperties;
	bordered?: boolean;
	className?: string;
}

export const InlineInput: React.FC<InlineInputProps> = ({
	value,
	onChange,
	placeholder = 'Click to edit...',
	multiline = false,
	textStyle,
	bordered = false,
	className,
}) => {
	const { token } = theme.useToken();
	const [isEditing, setIsEditing] = useState(false);
	const [tempValue, setTempValue] = useState(value);
	const inputRef = useRef<any>(null);

	useEffect(() => {
		setTempValue(value);
	}, [value]);

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isEditing]);

	const handleBlur = () => {
		setIsEditing(false);
		if (tempValue !== value) {
			onChange(tempValue);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !multiline) {
			handleBlur();
		}
		if (e.key === 'Escape') {
			setTempValue(value);
			setIsEditing(false);
		}
	};

	const [isHovered, setIsHovered] = useState(false);

	if (isEditing) {
		return multiline ? (
			<TextArea
				ref={inputRef}
				value={tempValue}
				onChange={(e) => setTempValue(e.target.value)}
				onBlur={handleBlur}
				onKeyDown={handleKeyDown}
				autoSize={{ minRows: 2, maxRows: 10 }}
				variant={bordered ? 'outlined' : 'filled'}
				className={className}
				style={{
					padding: '4px 32px 4px 8px', // Match View Mode padding
					fontSize: 'inherit',
					...textStyle,
				}}
			/>
		) : (
			<Input
				ref={inputRef}
				value={tempValue}
				onChange={(e) => setTempValue(e.target.value)}
				onBlur={handleBlur}
				onKeyDown={handleKeyDown}
				variant={bordered ? 'outlined' : 'filled'}
				className={className}
				style={{
					padding: '4px 8px',
					fontSize: 'inherit',
					...textStyle,
				}}
			/>
		);
	}

	return (
		<div
			onClick={() => setIsEditing(true)}
			onKeyDown={(e) => {
				if (e.key === 'Enter') {
					setIsEditing(true);
					e.preventDefault();
				}
			}}
			tabIndex={0}
			role="button"
			className={className}
			style={{
				cursor: 'text',
				minHeight: multiline ? 24 : 32,
				padding: '4px 32px 4px 8px', // Reserve space for right-aligned icon
				border: '1px solid transparent', // Prevent layout shift
				borderRadius: token.borderRadius,
				transition: 'all 0.2s',
				position: 'relative',
				...textStyle,
			}}
			onMouseEnter={(e) => {
				setIsHovered(true);
				e.currentTarget.style.background = token.colorFillQuaternary;
				e.currentTarget.style.boxShadow = `0 0 0 1px ${token.colorBorderSecondary}`; // Subtle border hint
			}}
			onMouseLeave={(e) => {
				setIsHovered(false);
				e.currentTarget.style.background = 'transparent';
				e.currentTarget.style.boxShadow = 'none';
			}}
		>
			{multiline ? (
				<Paragraph style={{ margin: 0, color: value ? 'inherit' : token.colorTextPlaceholder }}>
					{value || placeholder}
				</Paragraph>
			) : (
				<Text
					style={{ color: value ? 'inherit' : token.colorTextPlaceholder, fontSize: 'inherit' }}
				>
					{value || placeholder}
				</Text>
			)}
			{/* Hover Edit Hint - Always render but control opacity */}
			<EditOutlined
				style={{
					position: 'absolute',
					right: 8,
					top: '50%',
					transform: 'translateY(-50%)',
					color: token.colorTextSecondary,
					opacity: isHovered ? 1 : 0.2, // Low opacity when idle, distinct when hovered
					transition: 'opacity 0.2s',
					fontSize: 16, // Prevent inheriting large font size from parent
				}}
			/>
		</div>
	);
};
