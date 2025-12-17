/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { Table, Tag, Button, Space, Modal, message, Descriptions, Form } from 'antd';
import { CheckOutlined, EyeOutlined } from '@ant-design/icons';
import { ReportStatus, ReportType } from '@prisma/client';
import { resolveReport, updateVocab, updateKanji } from '@/services/actions';
import VocabEditor from '@/components/admin/VocabEditor';
import KanjiEditor from '@/components/admin/KanjiEditor';
import { useRouter } from 'next/navigation';

// Define type based on Prisma result (simplified for now)

type Report = any;

interface ClientReportsTableProps {
	initialReports: Report[];
}

export default function ClientReportsTable({ initialReports }: ClientReportsTableProps) {
	const [reports, setReports] = useState<Report[]>(initialReports);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleResolve = async (reportId: string, action: 'ACCEPT' | 'REJECT') => {
		setLoading(true);
		try {
			const result = await resolveReport(reportId, action);
			if (result.success) {
				message.success(`Report ${action === 'ACCEPT' ? 'Accepted' : 'Rejected'}`);
				// Optimistic update
				setReports((prev) =>
					prev.map((r) =>
						r.id === reportId
							? {
									...r,
									status: action === 'ACCEPT' ? ReportStatus.ACCEPTED : ReportStatus.REJECTED,
								}
							: r,
					),
				);
				router.refresh();
			} else {
				message.error('Failed to resolve report');
			}
		} catch {
			message.error('An error occurred');
		} finally {
			setLoading(false);
		}
	};

	const [editModalVisible, setEditModalVisible] = useState(false);
	const [currentReport, setCurrentReport] = useState<Report | null>(null);
	const [form] = Form.useForm();

	// Open Review Modal
	const openReview = (record: Report) => {
		setCurrentReport(record);
		if (record.vocab) {
			form.setFieldsValue({
				wordSurface: record.vocab.wordSurface,
				readingKana: record.vocab.readingKana,
				hanViet: record.vocab.hanViet,
				meaning: record.vocab.meaning,
				exampleSentence: record.vocab.exampleSentence,
				wordParts: record.vocab.wordParts,
				kanjiBreakdown: record.vocab.kanjiBreakdown,
			});
		} else if (record.kanji) {
			form.setFieldsValue({
				kanji: record.kanji.kanji,
				hanViet: record.kanji.hanViet,
				onyomi: record.kanji.onyomi,
				kunyomi: record.kanji.kunyomi,
				meaning: record.kanji.meaning,
				examples: record.kanji.examples,
				strokes: record.kanji.strokes,
			});
		}
		setEditModalVisible(true);
	};

	const handleUpdateAndAccept = async () => {
		if (!currentReport) return;
		try {
			setLoading(true);
			const values = await form.validateFields();

			// 1. Update Content
			if (currentReport.vocab) {
				const res = await updateVocab(currentReport.vocab.id, values);
				if (!res.success) throw new Error(res.error);
			} else if (currentReport.kanji) {
				const res = await updateKanji(currentReport.kanji.id, values);
				if (!res.success) throw new Error(res.error);
			}

			// 2. Resolve Report
			const resolveRes = await resolveReport(currentReport.id, 'ACCEPT');
			if (!resolveRes.success) throw new Error(resolveRes.error);

			message.success('Content updated & Report accepted');
			setEditModalVisible(false);

			// Optimistic Update
			setReports((prev) =>
				prev.map((r) => (r.id === currentReport.id ? { ...r, status: ReportStatus.ACCEPTED } : r)),
			);
			router.refresh();
		} catch (error: any) {
			message.error(error.message || 'Failed to update');
		} finally {
			setLoading(false);
		}
	};

	// Wrap handleResolve to work from modal
	const handleRejectFromModal = () => {
		if (currentReport) {
			handleResolve(currentReport.id, 'REJECT');
			setEditModalVisible(false);
		}
	};

	const columns = [
		{
			title: 'Type',
			dataIndex: 'type',
			key: 'type',
			render: (type: ReportType) => <Tag color="blue">{type}</Tag>,
		},
		{
			title: 'Target',
			key: 'target',
			render: (record: Report) => {
				if (record.vocab)
					return (
						<div>
							<div>
								Vocab: <b>{record.vocab.wordSurface}</b>
							</div>
							<div style={{ fontSize: 12, color: '#888' }}>{record.vocab.meaning}</div>
						</div>
					);
				if (record.kanji)
					return (
						<div>
							<div>
								Kanji: <b>{record.kanji.kanji}</b>
							</div>
							<div style={{ fontSize: 12, color: '#888' }}>{record.kanji.meaning}</div>
						</div>
					);
				return 'Unknown';
			},
		},
		{
			title: 'Reporter',
			dataIndex: ['reporter', 'name'],
			key: 'reporter',
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			render: (status: ReportStatus) => {
				let color = 'default';
				if (status === ReportStatus.PENDING) color = 'gold';
				if (status === ReportStatus.ACCEPTED) color = 'success';
				if (status === ReportStatus.REJECTED) color = 'error';
				return <Tag color={color}>{status}</Tag>;
			},
		},
		{
			title: 'Created At',
			dataIndex: 'createdAt',
			key: 'createdAt',
			render: (date: Date) => new Date(date).toLocaleDateString(),
		},
		{
			title: 'Actions',
			key: 'actions',
			render: (record: Report) => (
				<Space>
					{record.status === ReportStatus.PENDING ? (
						<Button
							type="primary"
							size="small"
							icon={<EyeOutlined />}
							onClick={() => openReview(record)}
						>
							Review
						</Button>
					) : (
						<Button size="small" disabled>
							Resolved
						</Button>
					)}
				</Space>
			),
		},
	];

	return (
		<>
			<Table dataSource={reports} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />

			<Modal
				title="Review Report & Edit Content"
				open={editModalVisible}
				onCancel={() => setEditModalVisible(false)}
				width="90%"
				footer={[
					<Button key="reject" danger onClick={handleRejectFromModal}>
						Reject Report
					</Button>,
					<Button key="cancel" onClick={() => setEditModalVisible(false)}>
						Cancel
					</Button>,
					<Button
						key="submit"
						type="primary"
						loading={loading}
						onClick={handleUpdateAndAccept}
						icon={<CheckOutlined />}
					>
						Update & Accept
					</Button>,
				]}
			>
				{currentReport && (
					<div style={{ display: 'flex', gap: 24 }}>
						{/* Left: Report Info */}
						<div style={{ flex: 1, borderRight: '1px solid #f0f0f0', paddingRight: 24 }}>
							<Descriptions title="Report Details" column={1} size="small">
								<Descriptions.Item label="Reporter">
									{currentReport.reporter?.name}
								</Descriptions.Item>
								<Descriptions.Item label="Issue">{currentReport.type}</Descriptions.Item>
								<Descriptions.Item label="Note">{currentReport.notes}</Descriptions.Item>
								<Descriptions.Item label="Suggested">
									<b style={{ color: 'green' }}>{currentReport.suggestedValue}</b>
								</Descriptions.Item>
							</Descriptions>
						</div>

						{/* Right: Edit Form */}
						<div style={{ flex: 2, maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 }}>
							<h4>Edit Content</h4>
							<Form form={form} layout="vertical">
								{currentReport.vocab && <VocabEditor />}
								{currentReport.kanji && <KanjiEditor />}
							</Form>
						</div>
					</div>
				)}
			</Modal>
		</>
	);
}
