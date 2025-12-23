'use client';

// Ensure this matches your Prisma Client location
import { submitReport } from '@/modules/admin/admin.actions';
import { FlagOutlined } from '@ant-design/icons';
import { ReportType } from '@prisma/client';
import { Input, Modal, Select, message } from 'antd';
import React, { useState } from 'react';

const { TextArea } = Input;

type ReportModalProps = {
	open: boolean;
	onClose: () => void;
	vocabId?: string;
	currentText?: string; // Optional context
};

export default function ReportModal({ open, onClose, vocabId, currentText }: ReportModalProps) {
	const [confirmLoading, setConfirmLoading] = useState(false);
	const [type, setType] = useState<ReportType | null>(null);
	const [suggestedValue, setSuggestedValue] = useState('');
	const [notes, setNotes] = useState('');

	const handleSubmit = async () => {
		if (!type) {
			message.error('Please select an issue type');
			return;
		}

		setConfirmLoading(true);
		try {
			const result = await submitReport({
				vocabId,
				type,
				currentValue: currentText,
				suggestedValue,
				notes,
			});

			setConfirmLoading(false);
			if (result.success) {
				message.success('Report submitted! Thank you for your contribution.');
				onClose();
				// Reset form
				setType(null);
				setSuggestedValue('');
				setNotes('');
			} else {
				message.error(result.error || 'Failed to submit report');
			}
		} catch (e) {
			setConfirmLoading(false);
			message.error('An unexpected error occurred');
		}
	};

	return (
		<Modal
			title={
				<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<FlagOutlined /> Report Issue
				</div>
			}
			open={open}
			onOk={handleSubmit}
			onCancel={onClose}
			confirmLoading={confirmLoading}
			okText="Submit Report"
			cancelButtonProps={{ disabled: confirmLoading }}
		>
			<div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
				{currentText && (
					<div
						style={{
							padding: 12,
							background: '#f5f5f5',
							borderRadius: 8,
							fontSize: 14,
							color: '#555',
						}}
					>
						<strong>Reporting:</strong> {currentText}
					</div>
				)}

				<div>
					<label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Issue Type</label>
					<Select
						style={{ width: '100%' }}
						placeholder="What's wrong?"
						value={type}
						onChange={setType}
						options={[
							{ value: 'INCORRECT_READING', label: 'Incorrect Reading' },
							{ value: 'INCORRECT_MEANING', label: 'Incorrect Meaning' },
							{ value: 'INCORRECT_HAN_VIET', label: 'Incorrect Hán Việt' },
							{ value: 'TYPO', label: 'Typo / Spelling' },
							{ value: 'MISSING_AUDIO', label: 'Missing / Bad Audio' },
							{ value: 'WRONG_EXAMPLE', label: 'Wrong Example Sentence' },
							{ value: 'DUPLICATE', label: 'Duplicate Card' },
							{ value: 'OTHER', label: 'Other Issue' },
						]}
					/>
				</div>

				<div>
					<label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
						Correction (Optional)
					</label>
					<Input
						placeholder="What should it be?"
						value={suggestedValue}
						onChange={(e) => setSuggestedValue(e.target.value)}
					/>
				</div>

				<div>
					<label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
						Additional Notes
					</label>
					<TextArea
						rows={3}
						placeholder="Any extra details..."
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
					/>
				</div>
			</div>
		</Modal>
	);
}
