'use client';

/**
 * Memory Garden Demo Page
 *
 * Showcases all three scenarios of the Memory Garden visualization:
 * - Scenario A: Dashboard Hero (Morning Reflection)
 * - Scenario B: Intervention Blocker (Burnout Shield)
 * - Scenario C: Post-Session Animation (Dopamine Hit)
 */
import {
	InterventionBlocker,
	MemoryGarden,
	MemoryGardenHero,
	PostSessionAnimation,
} from '@/modules/dashboard/components/memory-garden';
import type { MemoryGardenData } from '@/modules/dashboard/components/memory-garden';
import { Card, Flex, Spin, Tabs, Typography, theme } from 'antd';
import React, { useEffect, useState } from 'react';

const { Title, Text } = Typography;
const { useToken } = theme;

/**
 * Generate realistic demo data for Memory Garden visualization
 * Shows all states: leeches (red holes), mastered (green hills), new/learning (flat)
 */
function generateDemoData(tileCount: number = 200): MemoryGardenData {
	const japaneseWords = [
		'学ぶ',
		'食べる',
		'見る',
		'行く',
		'来る',
		'話す',
		'聞く',
		'読む',
		'書く',
		'考える',
		'勉強',
		'日本語',
		'英語',
		'時間',
		'今日',
		'明日',
		'昨日',
		'今',
		'今度',
		'今週',
		'学校',
		'会社',
		'家',
		'友達',
		'家族',
		'先生',
		'学生',
		'仕事',
		'休み',
		'旅行',
		'美味しい',
		'楽しい',
		'難しい',
		'易しい',
		'大きい',
		'小さい',
		'新しい',
		'古い',
		'高い',
		'安い',
		'猫',
		'犬',
		'鳥',
		'魚',
		'花',
		'木',
		'山',
		'川',
		'海',
		'空',
		'朝',
		'昼',
		'夜',
		'午前',
		'午後',
		'夜中',
		'朝ごはん',
		'昼ごはん',
		'晩ごはん',
		'お茶',
		'本',
		'新聞',
		'雑誌',
		'映画',
		'音楽',
		'スポーツ',
		'ゲーム',
		'趣味',
		'休暇',
		'週末',
		'春',
		'夏',
		'秋',
		'冬',
		'天気',
		'雨',
		'雪',
		'風',
		'晴れ',
		'曇り',
		'赤',
		'青',
		'緑',
		'黄色',
		'白',
		'黒',
		'茶色',
		'ピンク',
		'紫',
		'オレンジ',
		'一',
		'二',
		'三',
		'四',
		'五',
		'六',
		'七',
		'八',
		'九',
		'十',
		'百',
		'千',
		'万',
		'億',
		'兆',
		'円',
		'ドル',
		'ユーロ',
		'ポンド',
		'元',
		'東京',
		'大阪',
		'京都',
		'名古屋',
		'横浜',
		'福岡',
		'札幌',
		'仙台',
		'広島',
		'神戸',
		'電車',
		'バス',
		'車',
		'自転車',
		'飛行機',
		'船',
		'新幹線',
		'地下鉄',
		'タクシー',
		'歩く',
		'買う',
		'売る',
		'持つ',
		'使う',
		'作る',
		'作る',
		'開く',
		'閉じる',
		'始める',
		'終わる',
		'起きる',
		'寝る',
		'食べる',
		'飲む',
		'着る',
		'脱ぐ',
		'入る',
		'出る',
		'上がる',
		'下がる',
		'会う',
		'別れる',
		'結婚',
		'離婚',
		'生まれる',
		'死ぬ',
		'生きる',
		'死ぬ',
		'病気',
		'健康',
		'医者',
		'病院',
		'薬',
		'治療',
		'手術',
		'診察',
		'検査',
		'結果',
		'原因',
		'症状',
		'大学',
		'高校',
		'中学',
		'小学校',
		'幼稚園',
		'授業',
		'試験',
		'宿題',
		'勉強',
		'研究',
		'コンピューター',
		'インターネット',
		'スマートフォン',
		'タブレット',
		'アプリ',
		'ウェブサイト',
		'メール',
		'メッセージ',
		'電話',
		'ビデオ',
	];

	const meanings = [
		'to learn',
		'to eat',
		'to see',
		'to go',
		'to come',
		'to speak',
		'to hear',
		'to read',
		'to write',
		'to think',
		'study',
		'Japanese',
		'English',
		'time',
		'today',
		'tomorrow',
		'yesterday',
		'now',
		'next time',
		'this week',
		'school',
		'company',
		'house',
		'friend',
		'family',
		'teacher',
		'student',
		'work',
		'rest',
		'travel',
		'delicious',
		'fun',
		'difficult',
		'easy',
		'big',
		'small',
		'new',
		'old',
		'expensive',
		'cheap',
		'cat',
		'dog',
		'bird',
		'fish',
		'flower',
		'tree',
		'mountain',
		'river',
		'sea',
		'sky',
		'morning',
		'noon',
		'night',
		'AM',
		'PM',
		'midnight',
		'breakfast',
		'lunch',
		'dinner',
		'tea',
		'book',
		'newspaper',
		'magazine',
		'movie',
		'music',
		'sports',
		'game',
		'hobby',
		'vacation',
		'weekend',
		'spring',
		'summer',
		'autumn',
		'winter',
		'weather',
		'rain',
		'snow',
		'wind',
		'sunny',
		'cloudy',
		'red',
		'blue',
		'green',
		'yellow',
		'white',
		'black',
		'brown',
		'pink',
		'purple',
		'orange',
		'one',
		'two',
		'three',
		'four',
		'five',
		'six',
		'seven',
		'eight',
		'nine',
		'ten',
		'hundred',
		'thousand',
		'ten thousand',
		'hundred million',
		'trillion',
		'yen',
		'dollar',
		'euro',
		'pound',
		'yuan',
		'Tokyo',
		'Osaka',
		'Kyoto',
		'Nagoya',
		'Yokohama',
		'Fukuoka',
		'Sapporo',
		'Sendai',
		'Hiroshima',
		'Kobe',
		'train',
		'bus',
		'car',
		'bicycle',
		'airplane',
		'ship',
		'bullet train',
		'subway',
		'taxi',
		'to walk',
		'to buy',
		'to sell',
		'to have',
		'to use',
		'to make',
		'to create',
		'to open',
		'to close',
		'to start',
		'to end',
		'to wake up',
		'to sleep',
		'to eat',
		'to drink',
		'to wear',
		'to take off',
		'to enter',
		'to exit',
		'to go up',
		'to go down',
		'to meet',
		'to part',
		'marriage',
		'divorce',
		'to be born',
		'to die',
		'to live',
		'to die',
		'illness',
		'health',
		'doctor',
		'hospital',
		'medicine',
		'treatment',
		'surgery',
		'examination',
		'test',
		'result',
		'cause',
		'symptom',
		'university',
		'high school',
		'middle school',
		'elementary school',
		'kindergarten',
		'class',
		'exam',
		'homework',
		'study',
		'research',
		'computer',
		'internet',
		'smartphone',
		'tablet',
		'app',
		'website',
		'email',
		'message',
		'phone',
		'video',
	];

	const tiles = Array.from({ length: tileCount }, (_, i) => {
		const wordIndex = i % japaneseWords.length;
		const wordSurface = japaneseWords[wordIndex];
		const meaning = meanings[wordIndex];

		// Create realistic distribution:
		// - 10% leeches (red holes)
		// - 40% mastered (green hills, stability > 21)
		// - 50% new/learning (flat ground, stability <= 21)

		let stability: number;
		let lapses: number;
		let srsStage: number;
		let isLeech: boolean;

		if (i % 10 === 0) {
			// 10% leeches (red holes)
			stability = Math.random() * 10; // Low stability
			lapses = 3 + Math.floor(Math.random() * 3); // 3-5 lapses
			srsStage = 3; // Relearning
			isLeech = true;
		} else if (i % 10 < 5) {
			// 40% mastered (green hills)
			stability = 25 + Math.random() * 75; // 25-100 days
			lapses = Math.floor(Math.random() * 2); // 0-1 lapses
			srsStage = 2; // Review stage
			isLeech = false;
		} else {
			// 50% new/learning (flat ground)
			stability = Math.random() * 20; // 0-20 days
			lapses = 0;
			srsStage = Math.random() < 0.5 ? 0 : 1; // New or Learning
			isLeech = false;
		}

		const stabilityNormalized = Math.min(stability / 100, 1.0);

		return {
			vocabId: `demo-${i}`,
			wordSurface,
			meaning,
			stability,
			lapses,
			srsStage,
			isLeech,
			stabilityNormalized,
		};
	});

	const leechCount = tiles.filter((t) => t.isLeech).length;
	const masteredCount = tiles.filter((t) => t.stability > 21).length;
	const leechRatio = leechCount / tileCount;
	const masteredRatio = masteredCount / tileCount;
	const healthScore = Math.round((1 - leechRatio) * 50 + masteredRatio * 50);

	return {
		tiles,
		totalCount: tileCount,
		leechCount,
		masteredCount,
		healthScore,
	};
}

export default function DemoPage() {
	const { token } = useToken();
	const [loading, setLoading] = useState(true);
	const [memoryGardenData, setMemoryGardenData] = useState<MemoryGardenData | null>(null);
	const [showPostSession, setShowPostSession] = useState(false);
	const [beforeData, setBeforeData] = useState<MemoryGardenData | null>(null);
	const [afterData, setAfterData] = useState<MemoryGardenData | null>(null);

	// Generate demo data (always use demo data for demo page)
	useEffect(() => {
		// Simulate a brief loading state for better UX
		const timer = setTimeout(() => {
			// Generate main demo data
			const demoData = generateDemoData(200);
			setMemoryGardenData(demoData);

			// Generate "before" state (more leeches, worse health)
			const beforeDataDemo: MemoryGardenData = {
				...demoData,
				tiles: demoData.tiles.map((tile, i) => {
					// Convert some mastered/new tiles to leeches for "before" state
					if (!tile.isLeech && i % 7 === 0) {
						return {
							...tile,
							isLeech: true,
							lapses: 3,
							srsStage: 3,
							stability: Math.random() * 10,
						};
					}
					return tile;
				}),
			};
			beforeDataDemo.leechCount = beforeDataDemo.tiles.filter((t) => t.isLeech).length;
			beforeDataDemo.healthScore = Math.max(
				0,
				Math.round(
					(1 - beforeDataDemo.leechCount / beforeDataDemo.totalCount) * 50 +
						(beforeDataDemo.masteredCount / beforeDataDemo.totalCount) * 50,
				),
			);

			setBeforeData(beforeDataDemo);
			setAfterData(demoData);
			setLoading(false);
		}, 500);

		return () => clearTimeout(timer);
	}, []);

	if (loading) {
		return (
			<div
				style={{
					minHeight: '100vh',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: token.colorBgLayout,
				}}
			>
				<Flex vertical align="center" gap={16}>
					<Spin size="large" />
					<Text type="secondary">Loading Memory Garden demo...</Text>
				</Flex>
			</div>
		);
	}

	const tabItems = [
		{
			key: 'hero',
			label: 'Scenario A: Dashboard Hero',
			children: (
				<div style={{ padding: '24px 0' }}>
					<MemoryGardenHero data={memoryGardenData} loading={false} />
				</div>
			),
		},
		{
			key: 'blocker',
			label: 'Scenario B: Intervention Blocker',
			children: (
				<div style={{ padding: '24px 0' }}>
					<InterventionBlocker
						data={memoryGardenData}
						dueCount={memoryGardenData?.leechCount ? memoryGardenData.leechCount * 10 : 50}
						leechCount={memoryGardenData?.leechCount || 5}
					/>
					<Card style={{ marginTop: 24, background: token.colorInfoBg }} title="Demo Note">
						<Text type="secondary">
							This blocker appears when:
							<br />• Leech count ≥ 5 (unstable foundation)
							<br />• Due count ≥ 50 (review backlog)
							<br />
							<br />
							It visualizes WHY new card learning is blocked, making the restriction feel helpful
							rather than annoying.
						</Text>
					</Card>
				</div>
			),
		},
		{
			key: 'animation',
			label: 'Scenario C: Post-Session Animation',
			children: (
				<div style={{ padding: '24px 0' }}>
					<Card>
						<Flex vertical gap={16} align="center">
							<Title level={4}>Post-Session Satisfaction Animation</Title>
							<Text type="secondary" style={{ textAlign: 'center' }}>
								Click the button below to see the before/after animation that plays when a user
								completes a review session. Watch the red holes fill and turn green as memory
								strengthens.
							</Text>
							<button
								onClick={() => setShowPostSession(true)}
								style={{
									padding: '12px 24px',
									background: token.colorPrimary,
									color: 'white',
									border: 'none',
									borderRadius: 8,
									fontSize: 16,
									fontWeight: 600,
									cursor: 'pointer',
								}}
							>
								Show Post-Session Animation
							</button>
						</Flex>
					</Card>
					{showPostSession && beforeData && afterData && (
						<PostSessionAnimation
							beforeData={beforeData}
							afterData={afterData}
							onComplete={() => setShowPostSession(false)}
						/>
					)}
				</div>
			),
		},
		{
			key: 'raw',
			label: 'Raw Visualization',
			children: (
				<div style={{ padding: '24px 0' }}>
					<Card title="Raw Memory Garden Component">
						<Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
							This is the core Memory Garden component without any wrapper. Use this for custom
							integrations.
						</Text>
						{memoryGardenData && (
							<MemoryGarden
								data={memoryGardenData}
								height={500}
								showControls={true}
								autoRotate={true}
								animationMode="static"
							/>
						)}
					</Card>
				</div>
			),
		},
	];

	return (
		<div
			style={{
				minHeight: '100vh',
				background: token.colorBgLayout,
				padding: '24px 16px',
			}}
		>
			<div style={{ maxWidth: 1200, margin: '0 auto' }}>
				<Card
					style={{
						marginBottom: 24,
						background: token.colorBgContainer,
					}}
				>
					<Flex vertical gap={16}>
						<Title level={2} style={{ margin: 0 }}>
							Memory Garden Demo
						</Title>
						<Text type="secondary">
							This demo page showcases the Memory Garden visualization feature. The Memory Garden
							transforms abstract memory metrics (stability, lapses, SRS stage) into an emotional,
							visual landscape.
						</Text>
						<Flex vertical gap={8}>
							<Text strong>Visual Language:</Text>
							<Text type="secondary">
								• <span style={{ color: '#708238' }}>High Ground (Green Hills)</span> = Mastered
								words (stability &gt; 21 days)
								<br />• <span style={{ color: '#E0E5D5' }}>Flat Ground (Light Green)</span> =
								New/Learning words
								<br />• <span style={{ color: '#E64A19' }}>Depressions (Red Holes)</span> = Leeches
								(lapses ≥ 3 or relearning)
							</Text>
						</Flex>
						{memoryGardenData && (
							<Flex gap={24} wrap="wrap">
								<Flex vertical>
									<Text type="secondary" style={{ fontSize: 12 }}>
										Total Words
									</Text>
									<Text strong style={{ fontSize: 20 }}>
										{memoryGardenData.totalCount}
									</Text>
								</Flex>
								<Flex vertical>
									<Text type="secondary" style={{ fontSize: 12 }}>
										Leeches
									</Text>
									<Text strong style={{ fontSize: 20, color: token.colorError }}>
										{memoryGardenData.leechCount}
									</Text>
								</Flex>
								<Flex vertical>
									<Text type="secondary" style={{ fontSize: 12 }}>
										Mastered
									</Text>
									<Text strong style={{ fontSize: 20, color: token.colorSuccess }}>
										{memoryGardenData.masteredCount}
									</Text>
								</Flex>
								<Flex vertical>
									<Text type="secondary" style={{ fontSize: 12 }}>
										Health Score
									</Text>
									<Text strong style={{ fontSize: 20, color: token.colorPrimary }}>
										{memoryGardenData.healthScore}/100
									</Text>
								</Flex>
							</Flex>
						)}
					</Flex>
				</Card>

				<Tabs
					defaultActiveKey="hero"
					items={tabItems}
					size="large"
					style={{
						background: token.colorBgContainer,
						padding: 24,
						borderRadius: 12,
					}}
				/>
			</div>
		</div>
	);
}
