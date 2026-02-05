import type { KanaScript } from '../types';

/**
 * One example word: script-specific form (Hiragana or Katakana) with meaning.
 * We always provide two examples per syllable: one for Hiragana tab, one for Katakana tab.
 */
export interface SingleExample {
	word: string;
	romaji: string;
	meaningEn: string;
	meaningVi?: string;
}

/**
 * Two examples per syllable: hiragana (native / Hiragana spelling) and katakana (loanword or Katakana spelling).
 * So each tab gets its own example; no mixing scripts.
 */
export interface KanaExampleEntry {
	hiragana: SingleExample;
	katakana: SingleExample;
}

/** Kept for backward compatibility: script-agnostic "word" is the Hiragana example. */
export type KanaExampleWord = SingleExample;

const EXAMPLES: Record<string, KanaExampleEntry> = {
	// --- Basic (gojūon) ---
	a: {
		hiragana: { word: 'あお', romaji: 'ao', meaningEn: 'blue', meaningVi: 'màu xanh' },
		katakana: { word: 'アニメ', romaji: 'anime', meaningEn: 'anime', meaningVi: 'anime' },
	},
	i: {
		hiragana: { word: 'いぬ', romaji: 'inu', meaningEn: 'dog', meaningVi: 'chó' },
		katakana: { word: 'インク', romaji: 'inku', meaningEn: 'ink', meaningVi: 'mực' },
	},
	u: {
		hiragana: { word: 'うみ', romaji: 'umi', meaningEn: 'sea', meaningVi: 'biển' },
		katakana: { word: 'ウサギ', romaji: 'usagi', meaningEn: 'rabbit', meaningVi: 'thỏ' },
	},
	e: {
		hiragana: { word: 'え', romaji: 'e', meaningEn: 'picture', meaningVi: 'tranh' },
		katakana: {
			word: 'エレベーター',
			romaji: 'erebeetaa',
			meaningEn: 'elevator',
			meaningVi: 'thang máy',
		},
	},
	o: {
		hiragana: { word: 'おかね', romaji: 'okane', meaningEn: 'money', meaningVi: 'tiền' },
		katakana: { word: 'オレンジ', romaji: 'orenji', meaningEn: 'orange', meaningVi: 'cam' },
	},
	// K row
	ka: {
		hiragana: { word: 'かぞく', romaji: 'kazoku', meaningEn: 'family', meaningVi: 'gia đình' },
		katakana: { word: 'カメラ', romaji: 'kamera', meaningEn: 'camera', meaningVi: 'máy ảnh' },
	},
	ki: {
		hiragana: { word: 'き', romaji: 'ki', meaningEn: 'tree', meaningVi: 'cây' },
		katakana: { word: 'キー', romaji: 'kii', meaningEn: 'key', meaningVi: 'chìa khóa' },
	},
	ku: {
		hiragana: { word: 'くつ', romaji: 'kutsu', meaningEn: 'shoes', meaningVi: 'giày' },
		katakana: {
			word: 'クーラー',
			romaji: 'kuuraa',
			meaningEn: 'air conditioner',
			meaningVi: 'điều hòa',
		},
	},
	ke: {
		hiragana: { word: 'けさ', romaji: 'kesa', meaningEn: 'this morning', meaningVi: 'sáng nay' },
		katakana: { word: 'ケーキ', romaji: 'keeki', meaningEn: 'cake', meaningVi: 'bánh ngọt' },
	},
	ko: {
		hiragana: { word: 'こども', romaji: 'kodomo', meaningEn: 'child', meaningVi: 'trẻ em' },
		katakana: { word: 'コーヒー', romaji: 'koohii', meaningEn: 'coffee', meaningVi: 'cà phê' },
	},
	// S row
	sa: {
		hiragana: {
			word: 'さくら',
			romaji: 'sakura',
			meaningEn: 'cherry blossom',
			meaningVi: 'hoa anh đào',
		},
		katakana: { word: 'サラダ', romaji: 'sarada', meaningEn: 'salad', meaningVi: 'sa lát' },
	},
	shi: {
		hiragana: {
			word: 'しあわせ',
			romaji: 'shiawase',
			meaningEn: 'happiness',
			meaningVi: 'hạnh phúc',
		},
		katakana: { word: 'シャツ', romaji: 'shatsu', meaningEn: 'shirt', meaningVi: 'áo sơ mi' },
	},
	su: {
		hiragana: { word: 'すし', romaji: 'sushi', meaningEn: 'sushi', meaningVi: 'sushi' },
		katakana: {
			word: 'スーパー',
			romaji: 'suupaa',
			meaningEn: 'supermarket',
			meaningVi: 'siêu thị',
		},
	},
	se: {
		hiragana: { word: 'せんせい', romaji: 'sensei', meaningEn: 'teacher', meaningVi: 'thầy cô' },
		katakana: { word: 'セーター', romaji: 'seetaa', meaningEn: 'sweater', meaningVi: 'áo len' },
	},
	so: {
		hiragana: { word: 'そら', romaji: 'sora', meaningEn: 'sky', meaningVi: 'bầu trời' },
		katakana: { word: 'ソファー', romaji: 'sofaa', meaningEn: 'sofa', meaningVi: 'ghế sofa' },
	},
	// T row
	ta: {
		hiragana: { word: 'たべる', romaji: 'taberu', meaningEn: 'to eat', meaningVi: 'ăn' },
		katakana: { word: 'タクシー', romaji: 'takushii', meaningEn: 'taxi', meaningVi: 'taxi' },
	},
	chi: {
		hiragana: { word: 'ちち', romaji: 'chichi', meaningEn: 'father', meaningVi: 'bố' },
		katakana: { word: 'チーズ', romaji: 'chiizu', meaningEn: 'cheese', meaningVi: 'phô mai' },
	},
	tsu: {
		hiragana: { word: 'つき', romaji: 'tsuki', meaningEn: 'moon', meaningVi: 'mặt trăng' },
		katakana: { word: 'ツアー', romaji: 'tsuaa', meaningEn: 'tour', meaningVi: 'tour' },
	},
	te: {
		hiragana: { word: 'て', romaji: 'te', meaningEn: 'hand', meaningVi: 'tay' },
		katakana: { word: 'テレビ', romaji: 'terebi', meaningEn: 'TV', meaningVi: 'tivi' },
	},
	to: {
		hiragana: { word: 'とり', romaji: 'tori', meaningEn: 'bird', meaningVi: 'chim' },
		katakana: { word: 'トイレ', romaji: 'toire', meaningEn: 'toilet', meaningVi: 'nhà vệ sinh' },
	},
	// N row
	na: {
		hiragana: { word: 'なつ', romaji: 'natsu', meaningEn: 'summer', meaningVi: 'mùa hè' },
		katakana: { word: 'ナイフ', romaji: 'naifu', meaningEn: 'knife', meaningVi: 'dao' },
	},
	ni: {
		hiragana: { word: 'にほん', romaji: 'nihon', meaningEn: 'Japan', meaningVi: 'Nhật Bản' },
		katakana: { word: 'ニンジン', romaji: 'ninjin', meaningEn: 'carrot', meaningVi: 'cà rốt' },
	},
	nu: {
		hiragana: { word: 'ぬの', romaji: 'nuno', meaningEn: 'cloth', meaningVi: 'vải' },
		katakana: { word: 'ヌードル', romaji: 'nuudoru', meaningEn: 'noodle', meaningVi: 'mì' },
	},
	ne: {
		hiragana: { word: 'ねこ', romaji: 'neko', meaningEn: 'cat', meaningVi: 'mèo' },
		katakana: { word: 'ネクタイ', romaji: 'nekutai', meaningEn: 'tie', meaningVi: 'cà vạt' },
	},
	no: {
		hiragana: { word: 'のむ', romaji: 'nomu', meaningEn: 'to drink', meaningVi: 'uống' },
		katakana: { word: 'ノート', romaji: 'nooto', meaningEn: 'notebook', meaningVi: 'vở' },
	},
	// H row
	ha: {
		hiragana: { word: 'はな', romaji: 'hana', meaningEn: 'flower', meaningVi: 'hoa' },
		katakana: {
			word: 'ハンカチ',
			romaji: 'hankachi',
			meaningEn: 'handkerchief',
			meaningVi: 'khăn tay',
		},
	},
	hi: {
		hiragana: { word: 'ひ', romaji: 'hi', meaningEn: 'sun', meaningVi: 'mặt trời' },
		katakana: { word: 'ヒーター', romaji: 'hiitaa', meaningEn: 'heater', meaningVi: 'lò sưởi' },
	},
	fu: {
		hiragana: { word: 'ふね', romaji: 'fune', meaningEn: 'ship', meaningVi: 'tàu' },
		katakana: { word: 'フランス', romaji: 'furansu', meaningEn: 'France', meaningVi: 'Pháp' },
	},
	he: {
		hiragana: { word: 'へや', romaji: 'heya', meaningEn: 'room', meaningVi: 'phòng' },
		katakana: {
			word: 'ヘリコプター',
			romaji: 'herikoputaa',
			meaningEn: 'helicopter',
			meaningVi: 'trực thăng',
		},
	},
	ho: {
		hiragana: { word: 'ほん', romaji: 'hon', meaningEn: 'book', meaningVi: 'sách' },
		katakana: { word: 'ホテル', romaji: 'hoteru', meaningEn: 'hotel', meaningVi: 'khách sạn' },
	},
	// M row
	ma: {
		hiragana: { word: 'まど', romaji: 'mado', meaningEn: 'window', meaningVi: 'cửa sổ' },
		katakana: { word: 'マンガ', romaji: 'manga', meaningEn: 'manga', meaningVi: 'manga' },
	},
	mi: {
		hiragana: { word: 'みず', romaji: 'mizu', meaningEn: 'water', meaningVi: 'nước' },
		katakana: { word: 'ミルク', romaji: 'miruku', meaningEn: 'milk', meaningVi: 'sữa' },
	},
	mu: {
		hiragana: { word: 'むし', romaji: 'mushi', meaningEn: 'insect', meaningVi: 'côn trùng' },
		katakana: { word: 'ムービー', romaji: 'muubii', meaningEn: 'movie', meaningVi: 'phim' },
	},
	me: {
		hiragana: { word: 'め', romaji: 'me', meaningEn: 'eye', meaningVi: 'mắt' },
		katakana: { word: 'メニュー', romaji: 'menyuu', meaningEn: 'menu', meaningVi: 'thực đơn' },
	},
	mo: {
		hiragana: { word: 'もり', romaji: 'mori', meaningEn: 'forest', meaningVi: 'rừng' },
		katakana: { word: 'モーター', romaji: 'mootaa', meaningEn: 'motor', meaningVi: 'động cơ' },
	},
	// Y row
	ya: {
		hiragana: { word: 'やま', romaji: 'yama', meaningEn: 'mountain', meaningVi: 'núi' },
		katakana: { word: 'ヤンキー', romaji: 'yankii', meaningEn: 'yankee', meaningVi: 'Mỹ' },
	},
	yu: {
		hiragana: { word: 'ゆき', romaji: 'yuki', meaningEn: 'snow', meaningVi: 'tuyết' },
		katakana: { word: 'ユーモア', romaji: 'yuumoa', meaningEn: 'humor', meaningVi: 'hài hước' },
	},
	yo: {
		hiragana: { word: 'よる', romaji: 'yoru', meaningEn: 'night', meaningVi: 'đêm' },
		katakana: { word: 'ヨーロッパ', romaji: 'yooroppa', meaningEn: 'Europe', meaningVi: 'châu Âu' },
	},
	// R row
	ra: {
		hiragana: { word: 'らめん', romaji: 'ramen', meaningEn: 'ramen', meaningVi: 'mì ramen' },
		katakana: { word: 'ラーメン', romaji: 'raamen', meaningEn: 'ramen', meaningVi: 'mì ramen' },
	},
	ri: {
		hiragana: { word: 'りんご', romaji: 'ringo', meaningEn: 'apple', meaningVi: 'táo' },
		katakana: { word: 'リモコン', romaji: 'rimokon', meaningEn: 'remote', meaningVi: 'điều khiển' },
	},
	ru: {
		hiragana: { word: 'るす', romaji: 'rusu', meaningEn: 'absence', meaningVi: 'vắng nhà' },
		katakana: { word: 'ルール', romaji: 'ruuru', meaningEn: 'rule', meaningVi: 'quy tắc' },
	},
	re: {
		hiragana: { word: 'れきし', romaji: 'rekishi', meaningEn: 'history', meaningVi: 'lịch sử' },
		katakana: {
			word: 'レストラン',
			romaji: 'resutoran',
			meaningEn: 'restaurant',
			meaningVi: 'nhà hàng',
		},
	},
	ro: {
		hiragana: { word: 'ろく', romaji: 'roku', meaningEn: 'six', meaningVi: 'số sáu' },
		katakana: { word: 'ロボット', romaji: 'robotto', meaningEn: 'robot', meaningVi: 'người máy' },
	},
	// W row
	wa: {
		hiragana: { word: 'わかる', romaji: 'wakaru', meaningEn: 'to understand', meaningVi: 'hiểu' },
		katakana: { word: 'ワイン', romaji: 'wain', meaningEn: 'wine', meaningVi: 'rượu vang' },
	},
	wo: {
		hiragana: {
			word: 'を',
			romaji: 'wo',
			meaningEn: 'object particle',
			meaningVi: 'trợ từ tân ngữ',
		},
		katakana: {
			word: 'ヲ',
			romaji: 'wo',
			meaningEn: 'object particle',
			meaningVi: 'trợ từ tân ngữ',
		},
	},
	n: {
		hiragana: { word: 'にほん', romaji: 'nihon', meaningEn: 'Japan', meaningVi: 'Nhật Bản' },
		katakana: { word: 'ニホン', romaji: 'nihon', meaningEn: 'Japan', meaningVi: 'Nhật Bản' },
	},

	// --- Dakuten & handakuten ---
	ga: {
		hiragana: { word: 'がっこう', romaji: 'gakkou', meaningEn: 'school', meaningVi: 'trường học' },
		katakana: { word: 'ガソリン', romaji: 'gasorin', meaningEn: 'gasoline', meaningVi: 'xăng' },
	},
	gi: {
		hiragana: { word: 'ぎんこう', romaji: 'ginkou', meaningEn: 'bank', meaningVi: 'ngân hàng' },
		katakana: { word: 'ギター', romaji: 'gitaa', meaningEn: 'guitar', meaningVi: 'ghi ta' },
	},
	gu: {
		hiragana: { word: 'ぐん', romaji: 'gun', meaningEn: 'military', meaningVi: 'quân đội' },
		katakana: { word: 'グラス', romaji: 'gurasu', meaningEn: 'glass', meaningVi: 'ly' },
	},
	ge: {
		hiragana: {
			word: 'げんき',
			romaji: 'genki',
			meaningEn: 'healthy / energy',
			meaningVi: 'khỏe mạnh',
		},
		katakana: { word: 'ゲーム', romaji: 'geemu', meaningEn: 'game', meaningVi: 'trò chơi' },
	},
	go: {
		hiragana: { word: 'ごはん', romaji: 'gohan', meaningEn: 'rice / meal', meaningVi: 'cơm' },
		katakana: { word: 'ゴルフ', romaji: 'gorufu', meaningEn: 'golf', meaningVi: 'golf' },
	},
	za: {
		hiragana: { word: 'ざっし', romaji: 'zasshi', meaningEn: 'magazine', meaningVi: 'tạp chí' },
		katakana: {
			word: 'ザンネン',
			romaji: 'zannen',
			meaningEn: 'regrettable',
			meaningVi: 'đáng tiếc',
		},
	},
	ji: {
		hiragana: { word: 'じかん', romaji: 'jikan', meaningEn: 'time', meaningVi: 'thời gian' },
		katakana: { word: 'ジーンズ', romaji: 'jiinzu', meaningEn: 'jeans', meaningVi: 'quần jean' },
	},
	zu: {
		hiragana: {
			word: 'ずるい',
			romaji: 'zurui',
			meaningEn: 'sly / unfair',
			meaningVi: 'xảo quyệt',
		},
		katakana: { word: 'ズボン', romaji: 'zubon', meaningEn: 'trousers', meaningVi: 'quần dài' },
	},
	ze: {
		hiragana: { word: 'ぜんぶ', romaji: 'zenbu', meaningEn: 'all', meaningVi: 'tất cả' },
		katakana: { word: 'ゼリー', romaji: 'zerii', meaningEn: 'jelly', meaningVi: 'thạch' },
	},
	zo: {
		hiragana: { word: 'ぞう', romaji: 'zou', meaningEn: 'elephant', meaningVi: 'voi' },
		katakana: { word: 'ゾウ', romaji: 'zou', meaningEn: 'elephant', meaningVi: 'voi' },
	},
	da: {
		hiragana: {
			word: 'だいがく',
			romaji: 'daigaku',
			meaningEn: 'university',
			meaningVi: 'đại học',
		},
		katakana: { word: 'ダンス', romaji: 'dansu', meaningEn: 'dance', meaningVi: 'khiêu vũ' },
	},
	de: {
		hiragana: { word: 'でんわ', romaji: 'denwa', meaningEn: 'telephone', meaningVi: 'điện thoại' },
		katakana: {
			word: 'デザート',
			romaji: 'dezaato',
			meaningEn: 'dessert',
			meaningVi: 'món tráng miệng',
		},
	},
	do: {
		hiragana: { word: 'どうぶつ', romaji: 'doubutsu', meaningEn: 'animal', meaningVi: 'động vật' },
		katakana: { word: 'ドア', romaji: 'doa', meaningEn: 'door', meaningVi: 'cửa' },
	},
	ba: {
		hiragana: { word: 'ばんごはん', romaji: 'bangohan', meaningEn: 'dinner', meaningVi: 'bữa tối' },
		katakana: { word: 'バス', romaji: 'basu', meaningEn: 'bus', meaningVi: 'xe buýt' },
	},
	bi: {
		hiragana: {
			word: 'びょういん',
			romaji: 'byouin',
			meaningEn: 'hospital',
			meaningVi: 'bệnh viện',
		},
		katakana: { word: 'ビール', romaji: 'biiru', meaningEn: 'beer', meaningVi: 'bia' },
	},
	bu: {
		hiragana: { word: 'ぶた', romaji: 'buta', meaningEn: 'pig', meaningVi: 'lợn' },
		katakana: { word: 'ブーツ', romaji: 'buutsu', meaningEn: 'boots', meaningVi: 'ủng' },
	},
	be: {
		hiragana: { word: 'べんきょう', romaji: 'benkyou', meaningEn: 'study', meaningVi: 'học' },
		katakana: { word: 'ベル', romaji: 'beru', meaningEn: 'bell', meaningVi: 'chuông' },
	},
	bo: {
		hiragana: { word: 'ぼうし', romaji: 'boushi', meaningEn: 'hat', meaningVi: 'mũ' },
		katakana: { word: 'ボール', romaji: 'booru', meaningEn: 'ball', meaningVi: 'bóng' },
	},
	pa: {
		hiragana: { word: 'ぱん', romaji: 'pan', meaningEn: 'bread', meaningVi: 'bánh mì' },
		katakana: { word: 'パン', romaji: 'pan', meaningEn: 'bread', meaningVi: 'bánh mì' },
	},
	pi: {
		hiragana: { word: 'ぴんく', romaji: 'pinku', meaningEn: 'pink', meaningVi: 'màu hồng' },
		katakana: { word: 'ピンク', romaji: 'pinku', meaningEn: 'pink', meaningVi: 'màu hồng' },
	},
	pu: {
		hiragana: { word: 'ぷりん', romaji: 'purin', meaningEn: 'pudding', meaningVi: 'bánh pudding' },
		katakana: { word: 'プリン', romaji: 'purin', meaningEn: 'pudding', meaningVi: 'bánh pudding' },
	},
	pe: {
		hiragana: { word: 'ぺん', romaji: 'pen', meaningEn: 'pen', meaningVi: 'bút' },
		katakana: { word: 'ペン', romaji: 'pen', meaningEn: 'pen', meaningVi: 'bút' },
	},
	po: {
		hiragana: {
			word: 'ぽすと',
			romaji: 'posuto',
			meaningEn: 'post / mailbox',
			meaningVi: 'thùng thư',
		},
		katakana: {
			word: 'ポスト',
			romaji: 'posuto',
			meaningEn: 'post / mailbox',
			meaningVi: 'thùng thư',
		},
	},
};

/**
 * Returns the full entry (two examples) for a syllable, or undefined.
 */
export function getExampleEntry(romaji: string): KanaExampleEntry | undefined {
	const key = romaji.toLowerCase().trim();
	return EXAMPLES[key];
}

/**
 * Returns the single example for the given script (Hiragana or Katakana tab).
 * Each syllable now has two explicit examples.
 */
export function getExampleForScript(romaji: string, script: KanaScript): SingleExample | undefined {
	const entry = getExampleEntry(romaji);
	if (!entry) return undefined;
	return script === 'hiragana' ? entry.hiragana : entry.katakana;
}

/**
 * Returns the meaning for an example in the given locale (en or vi).
 */
export function getMeaningForExample(example: SingleExample | undefined, locale: string): string {
	if (!example) return '';
	return locale === 'vi' && example.meaningVi ? example.meaningVi : example.meaningEn;
}

/**
 * Backward-compatible: returns the Hiragana example as "the" example.
 * Prefer getExampleEntry or getExampleForScript for new code.
 */
export function getExampleWord(romaji: string): KanaExampleWord | undefined {
	return getExampleForScript(romaji, 'hiragana');
}
