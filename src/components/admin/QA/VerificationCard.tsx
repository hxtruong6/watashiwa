'use client';

import type { EtymologyData, ExamplesData, MeaningsData, MnemonicData } from '@/lib/schemas/jsonb';
import {
	BulbOutlined,
	CheckOutlined,
	CloseOutlined,
	EditOutlined,
	HistoryOutlined,
	SoundOutlined,
	ThunderboltOutlined,
} from '@ant-design/icons';
import type { Vocabulary } from '@prisma/client';
import {
	Badge,
	Button,
	Card,
	Collapse,
	Divider,
	Flex,
	Tag,
	Tooltip,
	Typography,
	theme,
} from 'antd';
import { useTranslations } from 'next-intl';
import React from 'react';

const { Title, Text, Paragraph } = Typography;

// Extended Type with Strict JSONB checking
export interface ExtendedVocabulary extends Omit<
	Vocabulary,
	'meanings' | 'etymology' | 'examples' | 'mnemonic'
> {
	meanings: MeaningsData;
	etymology: EtymologyData;
	examples: ExamplesData;
	mnemonic: MnemonicData | null;
	confusions?: {
		word: string;
		explanation: {
			mnemonic: { vi: string; en: string };
			item1_nuance: { vi: string; en: string };
			item2_nuance: { vi: string; en: string };
		};
	}[];
}

export interface VerificationCardProps {
	data: ExtendedVocabulary;
	mode?: 'review' | 'readonly';
	loading?: boolean;
	onApprove?: () => void;
	onReject?: () => void;
	onEdit?: () => void;
	onPlayAudio?: () => void;
	hideActions?: boolean;
}

const TagColors: Record<string, string> = {
	// Levels
	n5: 'blue',
	n4: 'geekblue',
	n3: 'cyan',
	n2: 'purple',
	n1: 'magenta',
	// POS
	verb: 'green',
	noun: 'orange',
	adj: 'gold',
	adverb: 'lime',
	// Attributes
	transitive: 'volcano',
	intransitive: 'salmon',
	'u-verb': 'geekblue',
	'ru-verb': 'purple',
};

const PitchPatternLabels: Record<number, string> = {
	0: 'Heiban',
	1: 'Atamadaka',
	2: 'Nakadaka',
	3: 'Nakadaka',
	4: 'Kio',
	5: 'Kio',
};

export const VerificationCard: React.FC<VerificationCardProps> = ({
	data,
	mode = 'readonly',
	loading = false,
	onApprove,
	onReject,
	onEdit,
	onPlayAudio,
	hideActions = false,
}) => {
	const { token } = theme.useToken();
	const t = useTranslations('Admin.Content');

	// Destructure strictly typed fields
	const { meanings, mnemonic, etymology, examples } = data;

	const renderMeanings = () => (
		<Flex gap="small" wrap="wrap" className="mb-4">
			{meanings?.vi?.map((m, i) => (
				<Tag
					key={`vi-${i}`}
					color="blue"
					style={{ fontSize: token.fontSizeLG, padding: '4px 8px' }}
				>
					{m}
				</Tag>
			))}
			{meanings?.en?.map((m, i) => (
				<Tag key={`en-${i}`} bordered={false} style={{ fontSize: token.fontSize }}>
					{m}
				</Tag>
			))}
		</Flex>
	);

	return (
		<Card
			loading={loading}
			bordered={false}
			style={{
				maxWidth: 500,
				width: '100%',
				margin: '0 auto',
				background: token.colorBgContainer,
				boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
				borderRadius: token.borderRadiusLG * 1.5,
				overflow: 'hidden',
			}}
			bodyStyle={{
				padding: 0,
				display: 'flex',
				flexDirection: 'column',
				height: '70vh', // Fixed height for "Tinder" feel
				maxHeight: 700,
			}}
			className="verification-card"
			actions={
				mode === 'review' && !hideActions
					? [
							<Button
								key="reject"
								type="text"
								danger
								icon={<CloseOutlined style={{ fontSize: 24 }} />}
								onClick={onReject}
								style={{ height: 60, width: '100%' }}
							/>,
							<Button
								key="edit"
								type="text"
								icon={<EditOutlined style={{ fontSize: 24, color: token.colorPrimary }} />}
								onClick={onEdit}
								style={{ height: 60, width: '100%' }}
							/>,
							<Button
								key="approve"
								type="text"
								className="approve-btn"
								icon={<CheckOutlined style={{ fontSize: 24 }} />}
								onClick={onApprove}
								style={{ height: 60, width: '100%', color: token.colorSuccess }}
							/>,
						]
					: []
			}
		>
			<Flex vertical style={{ height: '100%' }}>
				{/* HEADER (Fixed) */}
				<Flex
					justify="center"
					align="center"
					vertical
					className="relative py-4"
					style={{ flexShrink: 0, borderBottom: '1px solid #f0f0f0' }}
				>
					<Badge
						status={data.contentStatus === 'AI_GENERATED' ? 'processing' : 'default'}
						text={data.contentStatus}
						style={{ position: 'absolute', top: 12, right: 12, opacity: 0.5 }}
					/>

					{/* Pitch Accent Visualization */}
					<div
						style={{
							position: 'relative',
							display: 'inline-block',
							textAlign: 'center',
							marginTop: 12,
						}}
					>
						{/* Reading & Fallback Pitch */}
						<Text type="secondary" style={{ fontSize: token.fontSize }}>
							{data.wordReading} {data.wordRomaji && `• ${data.wordRomaji}`}
							{/* Pitch Fallback if SVG missing but pattern exists */}
							{!data.pitchSvgPath && data.pitchPattern !== null && (
								<Tag bordered={false} style={{ marginLeft: 8, fontSize: 10 }}>
									{data.pitchPattern} ({PitchPatternLabels[data.pitchPattern] || '?'})
								</Tag>
							)}
						</Text>

						{/* SVG Overlay if available */}
						{data.pitchSvgPath && (
							<svg
								viewBox="0 0 100 25"
								style={{
									position: 'absolute',
									top: -10,
									left: 0,
									width: '100%',
									height: '25px',
									pointerEvents: 'none',
									opacity: 0.6,
								}}
							>
								<path
									d={data.pitchSvgPath}
									fill="none"
									stroke={token.colorTextSecondary}
									strokeWidth="2"
									strokeLinecap="round"
								/>
							</svg>
						)}
					</div>

					{/* HERO KANJI */}
					<Title
						level={1}
						style={{
							fontSize: 64,
							margin: '4px 0 0 0',
							fontWeight: 500,
							fontFamily: '"Noto Serif JP", serif', // More elegant for Kanji
							color: token.colorTextHeading,
						}}
					>
						{data.wordSurface}
					</Title>

					{/* Audio Button */}
					<Button
						type="primary"
						shape="circle"
						icon={<SoundOutlined />}
						size="middle"
						onClick={(e) => {
							e.stopPropagation();
							onPlayAudio?.();
						}}
						style={{
							backgroundColor: token.colorPrimaryBg,
							color: token.colorPrimary,
							boxShadow: 'none',
							marginTop: 16,
							marginBottom: 8,
						}}
					/>
				</Flex>

				{/* SCROLLABLE BODY */}
				<Flex
					vertical
					gap="large"
					style={{
						flex: 1,
						overflowY: 'auto',
						padding: '16px 24px 24px 24px',
						background: '#fafafa',
					}}
				>
					{/* Tags Row */}
					<Flex gap="4px" wrap="wrap" justify="center" style={{ marginBottom: 16 }}>
						{data.tags.map((tag) => (
							<Tag
								key={tag}
								bordered={false}
								color={TagColors[tag] || 'default'}
								style={{ fontSize: 11, margin: 0 }}
							>
								#{tag}
							</Tag>
						))}
					</Flex>

					{/* Meanings */}
					<div style={{ textAlign: 'center' }}>{renderMeanings()}</div>

					{/* Etymology / Han Viet */}
					{(etymology?.parts?.length > 0 || etymology?.note) && (
						<Card
							size="small"
							style={{ border: 'none', boxShadow: 'none', background: 'transparent' }}
						>
							<Title
								level={5}
								type="secondary"
								style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}
							>
								<HistoryOutlined /> {t('cardEtymology')}
							</Title>

							{/* Parts */}
							<Flex gap="small" wrap="wrap" className="mb-2">
								{etymology?.parts?.map((p, i) => (
									<Tooltip key={i} title={p.meaning.vi}>
										<Tag color="geekblue" style={{ fontSize: 14, padding: '4px 8px' }}>
											{p.kanji} : {p.han_viet}
										</Tag>
									</Tooltip>
								))}
							</Flex>

							{/* Note */}
							{etymology?.note && (etymology.note.vi || etymology.note.en) && (
								<Text
									type="secondary"
									style={{ fontSize: 13, display: 'block', fontStyle: 'italic', marginTop: 8 }}
								>
									{etymology.note.vi || etymology.note.en}
								</Text>
							)}
						</Card>
					)}

					{/* Mnemonic */}
					{mnemonic && (mnemonic.vi || mnemonic.en) && (
						<div
							style={{
								background: token.colorSuccessBg,
								padding: token.padding,
								borderRadius: token.borderRadius,
								borderLeft: `4px solid ${token.colorSuccess}`,
							}}
						>
							<Title level={5} style={{ color: token.colorSuccess, margin: 0, fontSize: 14 }}>
								<BulbOutlined /> {t('cardMemoryHook')}
							</Title>
							<Paragraph style={{ margin: 0, marginTop: 8, fontSize: 15 }}>
								{mnemonic.vi || mnemonic.en}
							</Paragraph>
						</div>
					)}

					{/* INTERFERENCE SHIELD (Confusions) */}
					{data.confusions && data.confusions.length > 0 && (
						<div
							style={{
								background: token.colorWarningBg,
								padding: token.padding,
								borderRadius: token.borderRadius,
								border: `1px solid ${token.colorWarningBorder}`,
							}}
						>
							<Title level={5} style={{ color: token.colorWarning, margin: 0, fontSize: 14 }}>
								<ThunderboltOutlined /> {t('cardShield')}
							</Title>
							{data.confusions.map((conf, idx) => (
								<div key={idx} style={{ marginTop: 8 }}>
									<Text strong style={{ color: token.colorError }}>
										{t('cardVs')} {conf.word}
									</Text>
									<Paragraph
										style={{ margin: '4px 0 0 0', fontSize: 13, color: token.colorTextSecondary }}
									>
										{conf.explanation.item1_nuance.vi} (vs {conf.explanation.item2_nuance.vi})
									</Paragraph>
									<Paragraph style={{ margin: '4px 0 0 0', fontSize: 13, fontWeight: 500 }}>
										💡 {conf.explanation.mnemonic.vi}
									</Paragraph>
									{idx < data.confusions!.length - 1 && <Divider style={{ margin: '8px 0' }} />}
								</div>
							))}
						</div>
					)}

					{/* EXAMPLES (Footer) */}
					{examples && examples.length > 0 && (
						<Collapse
							ghost
							size="small"
							items={[
								{
									key: '1',
									label: (
										<Text type="secondary">
											{t('cardExamples')} ({examples.length})
										</Text>
									),
									children: (
										<Flex vertical gap="small">
											{examples.map((ex, i) => (
												<div key={i} className="mb-2">
													<Flex justify="space-between" align="start">
														<Text strong>{ex.sentence}</Text>
														<Button
															type="text"
															size="small"
															icon={<SoundOutlined />}
															onClick={(e) => {
																e.stopPropagation();
																if (ex.audio) {
																	const audio = new Audio(ex.audio);
																	audio
																		.play()
																		.catch((err) => console.error('Audio play error', err));
																} else {
																	const u = new SpeechSynthesisUtterance(ex.sentence);
																	u.lang = 'ja-JP';
																	const voices = window.speechSynthesis.getVoices();
																	const kyoko = voices.find((v) => v.name === 'Kyoko');
																	if (kyoko) u.voice = kyoko;
																	window.speechSynthesis.speak(u);
																}
															}}
														/>
													</Flex>
													<Text type="secondary" style={{ fontSize: 13 }}>
														{ex.translation.vi}
													</Text>
												</div>
											))}
										</Flex>
									),
								},
							]}
						/>
					)}
				</Flex>
			</Flex>
		</Card>
	);
};
