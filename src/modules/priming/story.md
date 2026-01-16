# Contextual Story Reader - Sample Data & Quick Reference

**Module:** `src/modules/priming/`  
**Status:** 🔄 Design Phase → Development Ready  
**Last Updated:** January 16, 2026

---

## 📚 Documentation Structure

This feature is documented across three files:

1. **[PRD.md](./PRD.md)** - **START HERE** → Comprehensive Product Requirements Document
   - Executive summary, user journeys, functional requirements
   - Technical architecture, success metrics, go-to-market strategy
   - **For:** Product Managers, Engineers, Stakeholders

2. **[DESIGN_CONTEXT.md](./DESIGN_CONTEXT.md)** - Design Research & UX Specifications
   - Design philosophy, interaction patterns, micro-animations
   - Accessibility considerations, edge cases, implementation details
   - **For:** UX Designers, Frontend Engineers

3. **story.md (this file)** - Sample Data & Quick Reference
   - Real story data examples for testing and development
   - JSON structure reference
   - **For:** Engineers implementing the feature

---

## 🎯 Quick Summary

**What:** Interactive story reader where users discover Japanese vocabulary embedded in native language narratives.

**Why:** Contextual learning (words in stories) produces 2-3x better retention than isolated flashcard memorization. Reduces cold-start anxiety for new vocabulary.

**How:**

- 90% native language (English/Vietnamese) + 10% Japanese vocabulary
- Click Japanese words → tooltip with meaning + audio
- Collection mechanics (Pokémon-style) gamify word discovery
- Seamlessly transitions to flashcard study

**Key Innovation:** Collection drawer that fills as users click words, creating satisfying progress visualization and completion motivation.

---

## 📊 Sample Story Data

### Story Arc 1: Daily Life

#### Part 1: The Daily Commute

```json
{
	"id": "story-001-daily-commute-part1",
	"slug": "daily-commute-part-1",
	"order": 1,
	"title": {
		"en": "The Daily Commute - Part 1",
		"vi": "Việc Đi Lại Hằng Ngày - Phần 1",
		"ja": "毎日の通勤 - パート1"
	},
	"body_text": {
		"en": "Every morning, I usually いきます to 学校 by バス. However, today the weather was beautiful, so I decided to go 歩いて. On my way, I saw a 人 waiting for a タクシー in front of the 駅. After classes finished, I went to the スーパー 一人で to buy some snacks. Surprisingly, I met my brother there; he was riding his new 自転車. We decided to かえります home together. Later tonight, my cousin きます to our house for dinner.",
		"vi": "Mỗi sáng, tôi thường いきます đến 学校 bằng バス. Tuy nhiên, hôm nay thời tiết rất đẹp, nên tôi quyết định đi 歩いて. Trên đường đi, tôi thấy một 人 đang đợi タクシー ở phía trước 駅. Sau khi tan học, tôi đi đến スーパー 一人で để mua đồ ăn nhẹ. Thật ngạc nhiên, tôi gặp anh trai ở đó; anh ấy đang đi chiếc 自転車 mới của mình. Chúng tôi quyết định かえります về nhà cùng nhau. Tối nay, em họ của tôi きます đến nhà chúng tôi ăn tối.",
		"ja": "毎朝、私はたいていバスで学校へいきます。しかし、今日は天気が良かったので、歩いていくことにしました。途中で、駅の前でタクシーを待っている人を見かけました。授業が終わった後、スナックを買うために一人でスーパーへ行きました。驚いたことに、そこで兄に会いました。彼は新しい自転車に乗っていました。私たちは一緒に家にかえりますことにしました。今夜遅く、いとこが夕食のために私たちの家に来ます。"
	},
	"translation": {
		"en": "Every morning, I usually go to school by bus. However, today the weather was beautiful, so I decided to go on foot. On my way, I saw a person waiting for a taxi in front of the station. After classes finished, I went to the supermarket alone to buy some snacks. Surprisingly, I met my brother there; he was riding his new bicycle. We decided to return home together. Later tonight, my cousin will come to our house for dinner.",
		"vi": "Mỗi sáng, tôi thường đi đến trường học bằng xe buýt. Tuy nhiên, hôm nay thời tiết rất đẹp, nên tôi quyết định đi bộ. Trên đường đi, tôi thấy một người đang đợi taxi ở phía trước nhà ga. Sau khi tan học, tôi đi đến siêu thị một mình để mua đồ ăn nhẹ. Thật ngạc nhiên, tôi gặp anh trai ở đó; anh ấy đang đi chiếc xe đạp mới của mình. Chúng tôi quyết định về nhà cùng nhau. Tối nay, em họ của tôi sẽ đến nhà chúng tôi ăn tối."
	},
	"highlights": [
		{
			"word_surface": "いきます",
			"length": 4,
			"positions": { "en": [25], "vi": [21], "ja": [13] },
			"vocabulary_id": "vocab-ikimasu",
			"reading": "いきます",
			"meaning_en": "to go (polite form)",
			"meaning_vi": "đi (lịch sự)",
			"han_viet_hint": "Động từ di chuyển: đi, tới"
		},
		{
			"word_surface": "学校",
			"length": 2,
			"positions": { "en": [33], "vi": [30], "ja": [9] },
			"vocabulary_id": "vocab-gakkou",
			"reading": "がっこう",
			"meaning_en": "school",
			"meaning_vi": "trường học",
			"han_viet_hint": "学 (HỌC) + 校 (HIỆU) = Trường học"
		},
		{
			"word_surface": "バス",
			"length": 2,
			"positions": { "en": [39], "vi": [38], "ja": [6] },
			"vocabulary_id": "vocab-basu",
			"reading": "バス",
			"meaning_en": "bus",
			"meaning_vi": "xe buýt",
			"han_viet_hint": null
		},
		{
			"word_surface": "歩いて",
			"length": 3,
			"positions": { "en": [98], "vi": [88], "ja": [32] },
			"vocabulary_id": "vocab-aruite",
			"reading": "あるいて",
			"meaning_en": "on foot, by walking",
			"meaning_vi": "đi bộ",
			"han_viet_hint": "歩 (BỘ) = Đi, bước"
		},
		{
			"word_surface": "人",
			"length": 1,
			"positions": { "en": [117], "vi": [108], "ja": [58] },
			"vocabulary_id": "vocab-hito",
			"reading": "ひと",
			"meaning_en": "person",
			"meaning_vi": "người",
			"han_viet_hint": "人 (NHÂN) = Người"
		},
		{
			"word_surface": "タクシー",
			"length": 4,
			"positions": { "en": [133], "vi": [123], "ja": [48] },
			"vocabulary_id": "vocab-takushii",
			"reading": "タクシー",
			"meaning_en": "taxi",
			"meaning_vi": "taxi",
			"han_viet_hint": null
		},
		{
			"word_surface": "駅",
			"length": 1,
			"positions": { "en": [156], "vi": [152], "ja": [44] },
			"vocabulary_id": "vocab-eki",
			"reading": "えき",
			"meaning_en": "station",
			"meaning_vi": "nhà ga",
			"han_viet_hint": "駅 (DỊCH) = Trạm, ga"
		},
		{
			"word_surface": "スーパー",
			"length": 4,
			"positions": { "en": [190], "vi": [181], "ja": [83] },
			"vocabulary_id": "vocab-suupaa",
			"reading": "スーパー",
			"meaning_en": "supermarket",
			"meaning_vi": "siêu thị",
			"han_viet_hint": null
		},
		{
			"word_surface": "一人で",
			"length": 3,
			"positions": { "en": [195], "vi": [186], "ja": [78] },
			"vocabulary_id": "vocab-hitoride",
			"reading": "ひとりで",
			"meaning_en": "alone, by oneself",
			"meaning_vi": "một mình",
			"han_viet_hint": "一人 (NHẤT NHÂN) = Một người"
		},
		{
			"word_surface": "自転車",
			"length": 3,
			"positions": { "en": [267], "vi": [252], "ja": [105] },
			"vocabulary_id": "vocab-jitensha",
			"reading": "じてんしゃ",
			"meaning_en": "bicycle",
			"meaning_vi": "xe đạp",
			"han_viet_hint": "自 (TỰ) + 転 (CHUYỂN) + 車 (XA) = Xe tự chuyển"
		},
		{
			"word_surface": "かえります",
			"length": 5,
			"positions": { "en": [285], "vi": [283], "ja": [116] },
			"vocabulary_id": "vocab-kaerimasu",
			"reading": "かえります",
			"meaning_en": "to return, to go back",
			"meaning_vi": "về, trở về",
			"han_viet_hint": "Động từ: quay về nhà"
		},
		{
			"word_surface": "きます",
			"length": 3,
			"positions": { "en": [323], "vi": [324], "ja": [140] },
			"vocabulary_id": "vocab-kimasu",
			"reading": "きます",
			"meaning_en": "to come",
			"meaning_vi": "đến",
			"han_viet_hint": "Động từ: đến đây"
		}
	],
	"difficulty": "N5",
	"category": "daily_life",
	"read_time_min": 2,
	"illustration_url": "/assets/stories/daily-commute-1.png"
}
```

#### Part 2: Plans with Friends

```json
{
	"id": "story-001-daily-commute-part2",
	"slug": "daily-commute-part-2",
	"order": 2,
	"title": {
		"en": "Plans with Friends - Part 2",
		"vi": "Kế Hoạch Với Bạn Bè - Phần 2",
		"ja": "友達との計画 - パート2"
	},
	"body_text": {
		"en": "先週, I met my 友達 and 彼女 wanted to visit the city. 彼 suggested taking the 地下鉄 because it is fast. My 家族 usually prefers the 電車, but we agreed to try something new. 今週, we are all very busy with work. 先月 was quiet, but 今月 has been hectic. Hopefully, 来週 we will have more free time. We are planning a big trip for 来月. Everyone is excited to relax after working hard.",
		"vi": "先週, tôi đã gặp 友達 của mình và 彼女 muốn đi thăm thành phố. 彼 gợi ý đi 地下鉄 vì nó nhanh. 家族 của tôi thường thích 電車, nhưng chúng tôi đồng ý thử cái gì đó mới. 今週, tất cả chúng tôi đều rất bận rộn với công việc. 先月 khá yên tĩnh, nhưng 今月 lại rất bận rộn. Hy vọng rằng, 来週 chúng tôi sẽ có nhiều thời gian rảnh hơn. Chúng tôi đang lên kế hoạch cho một chuyến đi lớn vào 来月. Mọi người đều hào hứng để thư giãn sau khi làm việc chăm chỉ.",
		"ja": "先週、私は友達に会い、彼女は街に行きたがっていました。彼は速いので地下鉄に乗ることを勧めました。私の家族はたいてい電車を好みますが、私たちは新しいことを試すことに同意しました。今週、私たちは皆仕事でとても忙しいです。先月は静かでしたが、今月は大忙しです。来週はもっと自由な時間があることを願っています。私たちは来月のために大きな旅行を計画しています。皆、一生懸命働いた後にリラックスすることを楽しみにしています。"
	},
	"translation": {
		"en": "Last week, I met my friend and she wanted to visit the city. He suggested taking the subway because it is fast. My family usually prefers the electric train, but we agreed to try something new. This week, we are all very busy with work. Last month was quiet, but this month has been hectic. Hopefully, next week we will have more free time. We are planning a big trip for next month. Everyone is excited to relax after working hard.",
		"vi": "Tuần trước, tôi đã gặp bạn bè của mình và chị ấy muốn đi thăm thành phố. Anh ấy gợi ý đi tàu điện ngầm vì nó nhanh. Gia đình của tôi thường thích tàu điện, nhưng chúng tôi đồng ý thử cái gì đó mới. Tuần này, tất cả chúng tôi đều rất bận rộn với công việc. Tháng trước khá yên tĩnh, nhưng tháng này lại rất bận rộn. Hy vọng rằng, tuần sau chúng tôi sẽ có nhiều thời gian rảnh hơn. Chúng tôi đang lên kế hoạch cho một chuyến đi lớn vào tháng sau. Mọi người đều hào hứng để thư giãn sau khi làm việc chăm chỉ."
	},
	"highlights": [
		{
			"word_surface": "先週",
			"length": 2,
			"positions": { "en": [0], "vi": [0], "ja": [0] },
			"vocabulary_id": "vocab-senshuu",
			"reading": "せんしゅう",
			"meaning_en": "last week",
			"meaning_vi": "tuần trước",
			"han_viet_hint": "先 (TIÊN - trước) + 週 (CHU - tuần)"
		},
		{
			"word_surface": "友達",
			"length": 2,
			"positions": { "en": [18], "vi": [16], "ja": [6] },
			"vocabulary_id": "vocab-tomodachi",
			"reading": "ともだち",
			"meaning_en": "friend",
			"meaning_vi": "bạn bè",
			"han_viet_hint": "友 (HỮU - bạn) + 達 (ĐẠT - đạt tới, nhiều người)"
		},
		{
			"word_surface": "彼女",
			"length": 2,
			"positions": { "en": [25], "vi": [27], "ja": [12] },
			"vocabulary_id": "vocab-kanojo",
			"reading": "かのじょ",
			"meaning_en": "she, girlfriend",
			"meaning_vi": "cô ấy, bạn gái",
			"han_viet_hint": "彼 (BỈ - người đó) + 女 (NỮ - nữ)"
		},
		{
			"word_surface": "彼",
			"length": 1,
			"positions": { "en": [52], "vi": [52], "ja": [24] },
			"vocabulary_id": "vocab-kare",
			"reading": "かれ",
			"meaning_en": "he, boyfriend",
			"meaning_vi": "anh ấy, bạn trai",
			"han_viet_hint": "彼 (BỈ - người đó, nam)"
		},
		{
			"word_surface": "地下鉄",
			"length": 3,
			"positions": { "en": [69], "vi": [64], "ja": [31] },
			"vocabulary_id": "vocab-chikatetsu",
			"reading": "ちかてつ",
			"meaning_en": "subway, metro",
			"meaning_vi": "tàu điện ngầm",
			"han_viet_hint": "地 (ĐỊA - đất) + 下 (HẠ - dưới) + 鉄 (THIẾT - sắt)"
		},
		{
			"word_surface": "家族",
			"length": 2,
			"positions": { "en": [95], "vi": [80], "ja": [45] },
			"vocabulary_id": "vocab-kazoku",
			"reading": "かぞく",
			"meaning_en": "family",
			"meaning_vi": "gia đình",
			"han_viet_hint": "家 (GIA - nhà) + 族 (TỘC - tộc, dòng họ)"
		},
		{
			"word_surface": "電車",
			"length": 2,
			"positions": { "en": [115], "vi": [101], "ja": [52] },
			"vocabulary_id": "vocab-densha",
			"reading": "でんしゃ",
			"meaning_en": "train (electric)",
			"meaning_vi": "tàu điện",
			"han_viet_hint": "電 (ĐIỆN - điện) + 車 (XA - xe)"
		},
		{
			"word_surface": "今週",
			"length": 2,
			"positions": { "en": [160], "vi": [146], "ja": [73] },
			"vocabulary_id": "vocab-konshuu",
			"reading": "こんしゅう",
			"meaning_en": "this week",
			"meaning_vi": "tuần này",
			"han_viet_hint": "今 (KIM - bây giờ) + 週 (CHU - tuần)"
		},
		{
			"word_surface": "先月",
			"length": 2,
			"positions": { "en": [200], "vi": [194], "ja": [92] },
			"vocabulary_id": "vocab-sengetsu",
			"reading": "せんげつ",
			"meaning_en": "last month",
			"meaning_vi": "tháng trước",
			"han_viet_hint": "先 (TIÊN - trước) + 月 (NGUYỆT - tháng)"
		},
		{
			"word_surface": "今月",
			"length": 2,
			"positions": { "en": [223], "vi": [223], "ja": [103] },
			"vocabulary_id": "vocab-kongetsu",
			"reading": "こんげつ",
			"meaning_en": "this month",
			"meaning_vi": "tháng này",
			"han_viet_hint": "今 (KIM - bây giờ) + 月 (NGUYỆT - tháng)"
		},
		{
			"word_surface": "来週",
			"length": 2,
			"positions": { "en": [256], "vi": [259], "ja": [114] },
			"vocabulary_id": "vocab-raishuu",
			"reading": "らいしゅう",
			"meaning_en": "next week",
			"meaning_vi": "tuần sau",
			"han_viet_hint": "来 (LAI - đến, tới) + 週 (CHU - tuần)"
		},
		{
			"word_surface": "来月",
			"length": 2,
			"positions": { "en": [322], "vi": [342], "ja": [143] },
			"vocabulary_id": "vocab-raigetsu",
			"reading": "らいげつ",
			"meaning_en": "next month",
			"meaning_vi": "tháng sau",
			"han_viet_hint": "来 (LAI - đến) + 月 (NGUYỆT - tháng)"
		}
	],
	"difficulty": "N5",
	"category": "daily_life",
	"read_time_min": 2
}
```

---

## 🔧 Technical Implementation Notes

### Position-Based Rendering (Critical)

**DO NOT use string replacement.** Use position indices to slice and render text segments.

**Why:** Same word may appear multiple times; string replacement will cause incorrect highlighting.

**Example Implementation:**

```typescript
// CORRECT: Position-based
function renderText(text: string, highlights: Highlight[], locale: 'en' | 'vi') {
  const segments = parseByPosition(text, highlights, locale);
  return segments.map(segment =>
    segment.type === 'vocab'
      ? <WordPill {...segment.meta} />
      : segment.content
  );
}

// WRONG: String replacement
function renderText(text: string, highlights: Highlight[]) {
  return text.replace('いきます', <WordPill />); // ❌ Breaks if word appears twice
}
```

### Data Validation

Before importing stories to database:

1. Validate position indices (automated test: `validateHighlightPositions(story)`)
2. Check vocabulary IDs exist in Vocabulary table
3. Verify all three languages have same number of highlights
4. Test render in UI (visual QA screenshot comparison)

---

## ✅ Next Steps for Engineers

1. **Read PRD.md** for full context and requirements
2. **Review DESIGN_CONTEXT.md** for UX specifications
3. **Use sample data above** for initial development
4. **Set up database schema** (Prisma migrations in `/prisma`)
5. **Implement position-based text parser** (critical component)
6. **Build WordPill and Tooltip components** (reuse existing Audio component)
7. **Test with sample stories** before connecting to real database

---

## 📞 Questions?

**Product Questions** → See [PRD.md](./PRD.md) or contact Product Team  
**Design Questions** → See [DESIGN_CONTEXT.md](./DESIGN_CONTEXT.md) or contact UX Team  
**Technical Questions** → Contact Engineering Lead or post in #engineering Slack

---

**Last Updated**: January 16, 2026  
**Maintained By**: Product & Engineering Teams
