import type { KanaScript } from '../types';

/**
 * Example words for each kana (gojūon + dakuten) – beginner-focused, common vocabulary.
 * One entry per syllable; both Hiragana and Katakana tabs can share the same syllable (same sound).
 *
 * - word: default form (usually Hiragana for native words). Shown on Hiragana tab.
 * - wordKatakana (optional): when the example is typically written in Katakana (e.g. loanwords),
 *   provide it here so the Katakana tab shows script-appropriate form. Falls back to word if absent.
 */
export interface KanaExampleWord {
	word: string;
	romaji: string;
	meaningEn: string;
	meaningVi?: string;
	/** Optional: Katakana spelling (e.g. loanwords). Used when current tab is Katakana. */
	wordKatakana?: string;
}

const EXAMPLES: Record<string, KanaExampleWord> = {
	// --- Basic (gojūon) ---
	// Vowel row
	a: { word: 'あお', romaji: 'ao', meaningEn: 'blue', meaningVi: 'màu xanh' },
	i: { word: 'いぬ', romaji: 'inu', meaningEn: 'dog', meaningVi: 'chó' },
	u: { word: 'うみ', romaji: 'umi', meaningEn: 'sea', meaningVi: 'biển' },
	e: { word: 'え', romaji: 'e', meaningEn: 'picture', meaningVi: 'tranh' },
	o: { word: 'おかね', romaji: 'okane', meaningEn: 'money', meaningVi: 'tiền' },
	// K row
	ka: { word: 'かぞく', romaji: 'kazoku', meaningEn: 'family', meaningVi: 'gia đình' },
	ki: { word: 'き', romaji: 'ki', meaningEn: 'tree', meaningVi: 'cây' },
	ku: { word: 'くつ', romaji: 'kutsu', meaningEn: 'shoes', meaningVi: 'giày' },
	ke: { word: 'けさ', romaji: 'kesa', meaningEn: 'this morning', meaningVi: 'sáng nay' },
	ko: { word: 'こども', romaji: 'kodomo', meaningEn: 'child', meaningVi: 'trẻ em' },
	// S row
	sa: { word: 'さくら', romaji: 'sakura', meaningEn: 'cherry blossom', meaningVi: 'hoa anh đào' },
	shi: { word: 'しあわせ', romaji: 'shiawase', meaningEn: 'happiness', meaningVi: 'hạnh phúc' },
	su: { word: 'すし', romaji: 'sushi', meaningEn: 'sushi', meaningVi: 'sushi' },
	se: { word: 'せんせい', romaji: 'sensei', meaningEn: 'teacher', meaningVi: 'thầy cô' },
	so: { word: 'そら', romaji: 'sora', meaningEn: 'sky', meaningVi: 'bầu trời' },
	// T row
	ta: { word: 'たべる', romaji: 'taberu', meaningEn: 'to eat', meaningVi: 'ăn' },
	chi: { word: 'ちち', romaji: 'chichi', meaningEn: 'father', meaningVi: 'bố' },
	tsu: { word: 'つき', romaji: 'tsuki', meaningEn: 'moon', meaningVi: 'mặt trăng' },
	te: { word: 'て', romaji: 'te', meaningEn: 'hand', meaningVi: 'tay' },
	to: { word: 'とり', romaji: 'tori', meaningEn: 'bird', meaningVi: 'chim' },
	// N row
	na: { word: 'なつ', romaji: 'natsu', meaningEn: 'summer', meaningVi: 'mùa hè' },
	ni: { word: 'にほん', romaji: 'nihon', meaningEn: 'Japan', meaningVi: 'Nhật Bản' },
	nu: { word: 'ぬの', romaji: 'nuno', meaningEn: 'cloth', meaningVi: 'vải' },
	ne: { word: 'ねこ', romaji: 'neko', meaningEn: 'cat', meaningVi: 'mèo' },
	no: { word: 'のむ', romaji: 'nomu', meaningEn: 'to drink', meaningVi: 'uống' },
	// H row
	ha: { word: 'はな', romaji: 'hana', meaningEn: 'flower', meaningVi: 'hoa' },
	hi: { word: 'ひ', romaji: 'hi', meaningEn: 'sun', meaningVi: 'mặt trời' },
	fu: { word: 'ふね', romaji: 'fune', meaningEn: 'ship', meaningVi: 'tàu' },
	he: { word: 'へや', romaji: 'heya', meaningEn: 'room', meaningVi: 'phòng' },
	ho: { word: 'ほん', romaji: 'hon', meaningEn: 'book', meaningVi: 'sách' },
	// M row
	ma: { word: 'まど', romaji: 'mado', meaningEn: 'window', meaningVi: 'cửa sổ' },
	mi: { word: 'みず', romaji: 'mizu', meaningEn: 'water', meaningVi: 'nước' },
	mu: { word: 'むし', romaji: 'mushi', meaningEn: 'insect', meaningVi: 'côn trùng' },
	me: { word: 'め', romaji: 'me', meaningEn: 'eye', meaningVi: 'mắt' },
	mo: { word: 'もり', romaji: 'mori', meaningEn: 'forest', meaningVi: 'rừng' },
	// Y row
	ya: { word: 'やま', romaji: 'yama', meaningEn: 'mountain', meaningVi: 'núi' },
	yu: { word: 'ゆき', romaji: 'yuki', meaningEn: 'snow', meaningVi: 'tuyết' },
	yo: { word: 'よる', romaji: 'yoru', meaningEn: 'night', meaningVi: 'đêm' },
	// R row (ramen is often written in Katakana as ラーメン)
	ra: {
		word: 'らめん',
		romaji: 'ramen',
		meaningEn: 'ramen',
		meaningVi: 'mì ramen',
		wordKatakana: 'ラーメン',
	},
	ri: { word: 'りんご', romaji: 'ringo', meaningEn: 'apple', meaningVi: 'táo' },
	ru: { word: 'るす', romaji: 'rusu', meaningEn: 'absence', meaningVi: 'vắng nhà' },
	re: { word: 'れきし', romaji: 'rekishi', meaningEn: 'history', meaningVi: 'lịch sử' },
	ro: { word: 'ろく', romaji: 'roku', meaningEn: 'six', meaningVi: 'số sáu' },
	// W row
	wa: { word: 'わかる', romaji: 'wakaru', meaningEn: 'to understand', meaningVi: 'hiểu' },
	wo: { word: 'を', romaji: 'wo', meaningEn: 'object particle', meaningVi: 'trợ từ tân ngữ' },
	// N (syllabic nasal)
	n: { word: 'にほん', romaji: 'nihon', meaningEn: 'Japan', meaningVi: 'Nhật Bản' },

	// --- Dakuten & handakuten ---
	// G row
	ga: { word: 'がっこう', romaji: 'gakkou', meaningEn: 'school', meaningVi: 'trường học' },
	gi: { word: 'ぎんこう', romaji: 'ginkou', meaningEn: 'bank', meaningVi: 'ngân hàng' },
	gu: { word: 'ぐん', romaji: 'gun', meaningEn: 'military', meaningVi: 'quân đội' },
	ge: { word: 'げんき', romaji: 'genki', meaningEn: 'healthy / energy', meaningVi: 'khỏe mạnh' },
	go: { word: 'ごはん', romaji: 'gohan', meaningEn: 'rice / meal', meaningVi: 'cơm' },
	// Z row
	za: { word: 'ざっし', romaji: 'zasshi', meaningEn: 'magazine', meaningVi: 'tạp chí' },
	ji: { word: 'じかん', romaji: 'jikan', meaningEn: 'time', meaningVi: 'thời gian' },
	zu: { word: 'ずるい', romaji: 'zurui', meaningEn: 'sly / unfair', meaningVi: 'xảo quyệt' },
	ze: { word: 'ぜんぶ', romaji: 'zenbu', meaningEn: 'all', meaningVi: 'tất cả' },
	zo: { word: 'ぞう', romaji: 'zou', meaningEn: 'elephant', meaningVi: 'voi' },
	// D row
	da: { word: 'だいがく', romaji: 'daigaku', meaningEn: 'university', meaningVi: 'đại học' },
	de: { word: 'でんわ', romaji: 'denwa', meaningEn: 'telephone', meaningVi: 'điện thoại' },
	do: { word: 'どうぶつ', romaji: 'doubutsu', meaningEn: 'animal', meaningVi: 'động vật' },
	// B row
	ba: { word: 'ばんごはん', romaji: 'bangohan', meaningEn: 'dinner', meaningVi: 'bữa tối' },
	bi: { word: 'びょういん', romaji: 'byouin', meaningEn: 'hospital', meaningVi: 'bệnh viện' },
	bu: { word: 'ぶた', romaji: 'buta', meaningEn: 'pig', meaningVi: 'lợn' },
	be: { word: 'べんきょう', romaji: 'benkyou', meaningEn: 'study', meaningVi: 'học' },
	bo: { word: 'ぼうし', romaji: 'boushi', meaningEn: 'hat', meaningVi: 'mũ' },
	// P row (loanwords – often written in Katakana)
	pa: {
		word: 'ぱん',
		romaji: 'pan',
		meaningEn: 'bread',
		meaningVi: 'bánh mì',
		wordKatakana: 'パン',
	},
	pi: {
		word: 'ぴんく',
		romaji: 'pinku',
		meaningEn: 'pink',
		meaningVi: 'màu hồng',
		wordKatakana: 'ピンク',
	},
	pu: {
		word: 'ぷりん',
		romaji: 'purin',
		meaningEn: 'pudding',
		meaningVi: 'bánh pudding',
		wordKatakana: 'プリン',
	},
	pe: {
		word: 'ぺん',
		romaji: 'pen',
		meaningEn: 'pen',
		meaningVi: 'bút',
		wordKatakana: 'ペン',
	},
	po: {
		word: 'ぽすと',
		romaji: 'posuto',
		meaningEn: 'post / mailbox',
		meaningVi: 'thùng thư',
		wordKatakana: 'ポスト',
	},
};

/**
 * Returns one example word for a given romaji syllable (gojūon or dakuten).
 * When script is 'katakana' and the entry has wordKatakana, the popover should show
 * wordKatakana so the example matches the script the user is viewing.
 */
export function getExampleWord(romaji: string): KanaExampleWord | undefined {
	const key = romaji.toLowerCase().trim();
	return EXAMPLES[key];
}

/**
 * Word form to display for the current script.
 * Use in popover: show this instead of always example.word.
 */
export function getExampleWordDisplay(
	example: KanaExampleWord | undefined,
	script: KanaScript,
): string {
	if (!example) return '';
	return script === 'katakana' && example.wordKatakana ? example.wordKatakana : example.word;
}
