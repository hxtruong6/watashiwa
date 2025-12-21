# AI Data Generation Protocol: The "Smart CUBE" Standard

> **Objective**: Generate Japanese Vocabulary Data that is "Native-Level" accurate for both Vietnamese and English learners, enforcing a strict separation of concerns between Hán-Việt (VN) and Pictographic/Phonetic (EN) mnemonics.

> **Source**: `data/All Decks_2.txt`
> **Destination**: `data/seed/minna_1/unitXX.json`

## Unit Tracking

| Unit   | Status     | Target Count | Lines (Approx) | Context / Keywords                                    |
| :----- | :--------- | :----------- | :------------- | :---------------------------------------------------- |
| **01** | [x]    | 52           | 3-37           | Introductions, Countries (Actual: 35)                 |
| **02** | [x]| 52           | 38-77          | `本`, `これ`, `それ` (Actual: 40)                     |
| **03** | [x]| 44           | 78-121         | `ここ`, `教室` (Actual: 44)                           |
| **04** | [x]| 63           | 122-178        | `時間`, `起きます` (Actual: 57)                       |
| **05** | [x]| 56           | 179-216        | `行きます`, `電車` (Actual: 38)                       |
| **06** | ⏳ Pending    | 61           | 217-262        | `食べます`, `サッカー` (Actual: 46)                   |
| **07** | ⏳ Pending    | 57           | 263-301        | `切ります`, `パソコン` (Actual: 39)                   |
| **08** | ⏳ Pending    | 71           | 302-349        | `ハンサム`, `きれい` (Actual: 48)                     |
| **09** | ⏳ Pending    | 59           | 350-395        | `わかります`, `好き` (Actual: 46)                     |
| **10** | ⏳ Pending    | 51           | 396-439        | `います`, `上`, `下` (Actual: 44)                     |
| **11** | ⏳ Pending    | 74           | 440-472        | `いくつ`, `枚` (Actual: 33)                           |
| **12** | ⏳ Pending    | 57           | 473-543        | `簡単`, `天気` (Actual: 71)                           |
| **13** | ⏳ Pending    | 53           | 544-558        | `欲しい`, `散歩します` (Actual: 15 - **Low**)         |
| **14** | ⏳ Pending    | 51           | 3-42           | `つけます` (Source: `MinaN5_14_25.txt`)               |
| **15** | ⏳ Pending    | 28           | 43-61          | `置きます` (Source: `MinaN5_14_25.txt`)               |
| **16** | ⏳ Pending    | 62           | 62-110         | `乗ります` (Source: `MinaN5_14_25.txt`)               |
| **17** | ⏳ Pending    | 42           | 111-138        | `覚えます` (Source: `MinaN5_14_25.txt`)               |
| **18** | ⏳ Pending    | 34           | 162-185        | `できます` (Source: `MinaN5_14_25.txt`)               |
| **19** | ⏳ Pending    | 36           | 139-161        | `登ります` (Source: `MinaN5_14_25.txt`)               |
| **20** | ⏳ Pending    | 30           | 186-202        | `要ります` (Actual: 17 - **Low**)                     |
| **21** | ⏳ Pending    | 35           | 238-259        | `思います` (Source: `MinaN5_14_25.txt`)               |
| **22** | ⏳ Pending    | 35           | 260-281        | `着ます` (Source: `MinaN5_14_25.txt`)                 |
| **23** | ⏳ Pending    | 30           | 282-306        | `聞きます` (Source: `MinaN5_14_25.txt`)               |
| **24** | ⏳ Pending    | 30           | 203-214        | `直します` (Actual: 12 - **Low**)                     |
| **25** | ⏳ Pending    | 35           | 215-237        | `考えます` (Source: `MinaN5_14_25.txt`)               |
| **26** | ⏳ Pending | 55           | 3-57           | `やります` (Source: `MinaN4_26_38.txt`)               |
| **27** | ⏳ Pending | 42           | 58-99          | `飼います` (Source: `MinaN4_26_38.txt`)               |
| **28** | ⏳ Pending | 46           | 100-145        | `売れます` (Source: `MinaN4_26_38.txt`)               |
| **29** | ⏳ Pending | 37           | 146-182        | `開きます` (Source: `MinaN4_26_38.txt`)               |
| **30** | ⏳ Pending | 41           | 183-223        | `貼ります` (Source: `MinaN4_26_38.txt`)               |
| **31** | ⏳ Pending | 53           | 224-276        | `生活します` (Source: `MinaN4_26_38.txt`)             |
| **32** | ⏳ Pending | 40           | 277-316        | `運動します` (Source: `MinaN4_26_38.txt`)             |
| **33** | ⏳ Pending | 46           | 317-362        | `逃げます` (Source: `MinaN4_26_38.txt`)               |
| **34** | ⏳ Pending | 39           | 363-401        | `磨きます` (Source: `MinaN4_26_38.txt`)               |
| **35** | ⏳ Pending | 30           | 402-431        | `咲きます` (Source: `MinaN4_26_38.txt`)               |
| **36** | ⏳ Pending | 42           | 432-473        | `貯金します` (Source: `MinaN4_26_38.txt`)             |
| **37** | ⏳ Pending | 50           | 474-523        | `褒めます` (Source: `MinaN4_26_38.txt`)               |
| **38** | ⏳ Pending | 37           | 524-560        | `参加します` (Source: `MinaN4_26_38.txt`)             |
| **39** | ⏳ Pending | 61           | 3-63           | `びっくりします` (Source: `MinaN4_39_50.txt`)         |
| **40** | ⏳ Pending | 42           | 64-105         | `数えます` (Source: `MinaN4_39_50.txt`)               |
| **41** | ⏳ Pending | 63           | 106-168        | `いただきます` (Source: `MinaN4_39_50.txt`)           |
| **42** | ⏳ Pending | 41           | 169-209        | `包みます` (Source: `MinaN4_39_50.txt`)               |
| **43** | ⏳ Pending | 30           | 210-223        | `増えます` (Actual: 14 - **Low**)                     |
| **44** | ⏳ Pending | 32           | 224-255        | `泣きます` (Source: `MinaN4_39_50.txt`)               |
| **45** | ⏳ Pending | 33           | 256-270        | `信じます` (Actual: 15 - **Low**)                     |
| **46** | ⏳ Pending | 28           | 271-298        | `渡します` (Source: `MinaN4_39_50.txt`)               |
| **47** | ⏳ Pending | 32           | 299-330        | `集まります` (Source: `MinaN4_39_50.txt`)             |
| **48** | ⏳ Pending | 32           | 331-342        | `降ろします` (Actual: 12 - **Low**)                   |
| **49** | ⏳ Pending | 25           | 343-367        | `利用します` (Source: `MinaN4_39_50.txt`)             |
| **50** | ⏳ Pending | 28           | 368-395        | `参ります` (Source: `MinaN4_39_50.txt`)               |

---

## 1. Categorization Logic (The Router)

Before processing any word, classify it into one of these 4 types. This determines the "Enrichment Level".

| Category | Description | Example | Logic Rule | Enrichment Level |
| :--- | :--- | :--- | :--- | :--- |
| **Type A: Phonetic** | Katakana words, foreign loans. | `アメリカ` (America), `ノート` (Note) | **Katakana-only.** No Kanji breakdown. | **Low**: Audio + Basic Pitch. No etymology needed. |
| **Type B: Standard** | Simple Nouns, Verbs, Adjectives. | `机` (Bàn), `本` (Sách), `歩く` (Đi bộ) | Standard Kanji breakdown. | **Medium**: Kanji breakdown + 1 Context sentence. |
| **Type C: Structural** | Grammar markers, suffixes. | `～さん`, `～ご`, `～たち` | Suffixes/Grammar logic. | **Medium**: usage rules instead of "meaning". |
| **Type D: High-Risk** | Synonyms, Nuance Heavy. | `先生` vs `教師`, `行く` vs `来る` | **Confusable Pairs.** | **High**: "Interference Shield" (Confusion Matrix) required. |

---

## 2. The Bilingual "Iron Rule"

You **MUST** follow this bilingual separation for every single field:

### 🇻🇳 Vietnamese (`vi`)

- **Key Strategy**: **Hán-Việt (Sino-Vietnamese)**.
- **Why**: Vietnamese users implicitly understand Kanji meanings via Hán-Việt.
- **Rule**: ALWAYS provide the UPPERCASE Hán-Việt reading (e.g., `学生` -> `HỌC SINH`).
- **Mnemonic**: Use Hán-Việt associations or Vietnamese puns.

### 🇺🇸 English (`en`)

- **Key Strategy**: **Pictograph & Phonetic Puns**.
- **Why**: English users typically do *not* know Hán-Việt. Reference to it confuses them.
- **Rule**: NEVER mention Hán-Việt in English fields.
- **Mnemonic**: Use English sound-alikes (e.g., `iku` -> "Eek! I must go") or visual stories.

---

## 3. Strict Output Schema

Format: `JSON Array`.
Schema reference: `src/lib/schemas/jsonb.ts`.

```typescript
{
  "word_surface": string,  // e.g., "行く" or "アメリカ" (The actual word being learned)
  "han_viet": string,      // e.g., "HÀNH" (UPPERCASE). Mapped to `Vocabulary.hanViet` in DB.
  "kana": string,          // e.g., "いく"
  "romaji": string,        // e.g., "iku"
  "tags": string[],        // e.g., ["n5", "verb", "intransitive"]
  "pitch_pattern": number, // 0, 1, 2, 3
  "pitch_svg_path": string,// e.g., "M0,20 L25,5 L50,5"
  
  // ETYMOLOGY: The Origin Story
  "etymology": {
    "parts": [
      {
        "kanji": string,
        "han_viet": string, // "HÀNH"
        "meaning": { "vi": string, "en": string } // "đi/go"
      }
    ],
    "note": {
      "vi": string, // "Chữ HÀNH (行) mô phỏng ngã tư đường..."
      "en": string  // "The kanji 行 is a pictograph of a crossroad..." (NO Hán-Việt here!)
    }
  },

  // MEANINGS: Core definition
  "meanings": {
    "vi": string[],
    "en": string[]
  },

  // EXAMPLES: N5 Level Sentences
  "examples": [
    {
      "sentence": string,     // "東京へ行きます。"
      "translation": { "vi": string, "en": string }
    }
  ],

  // MNEMONIC: The "Hook"
  "mnemonic": {
    "vi": string, // "Lữ HÀNH là đi..." (Hán-Việt focus)
    "en": string  // "I-KU! (Eek!) I have to GO..." (Phonetic focus)
  },

  // CONFUSIONS: The "Interference Shield" (Type D Only)
  "confusions": [
    {
      "word": string, // e.g., "来る"
      "explanation": {
        "mnemonic": { "vi": string, "en": string },
        "item1_nuance": { "vi": string, "en": string }, // The target word
        "item2_nuance": { "vi": string, "en": string }  // The confused word
      }
    }
  ]
}
```

---

## 4. Golden Data Examples

### Example 1: Type D (High-Risk Verb) - `行く`

```json
{
  "word_surface": "行く",
  "han_viet": "HÀNH",
  "kana": "いく",
  "romaji": "iku",
  "tags": ["n5", "verb", "intransitive", "u-verb"],
  "pitch_pattern": 0,
  "pitch_svg_path": "M0,20 L25,5 L50,5",
  "etymology": {
    "parts": [
      { "kanji": "行", "han_viet": "HÀNH", "meaning": { "vi": "đi, tổ chức", "en": "go, conduct" } }
    ],
    "note": {
      "vi": "Chữ HÀNH (行) mô phỏng hình ảnh ngã tư đường. Trong tiếng Việt, 'Hành trình' là chuyến đi.",
      "en": "The kanji 行 is a pictograph of a crossroad. It represents the act of moving forward."
    }
  },
  "meanings": {
    "vi": ["đi"],
    "en": ["to go"]
  },
  "examples": [
    {
      "sentence": "東京へ行きます。",
      "translation": {
        "vi": "Tôi đi Tokyo.",
        "en": "I go to Tokyo."
      }
    }
  ],
  "mnemonic": {
    "vi": "Lữ HÀNH là đi. 'I-ku' nghe như 'Đi-cứ' thế mà đi.",
    "en": "I-KU! (Eek!) I have to GO now before I'm late!"
  },
  "confusions": [
    {
      "word": "来る",
      "explanation": {
        "mnemonic": {
          "vi": "HÀNH (行く) là đi khỏi đây, LAI (来る) là đến đây.",
          "en": "Iku is going away, Kuru is coming toward."
        },
        "item1_nuance": {
          "vi": "Đi ra xa vị trí người nói.",
          "en": "Movement away from the speaker."
        },
        "item2_nuance": {
          "vi": "Đến gần vị trí người nói.",
          "en": "Movement toward the speaker."
        }
      }
    }
  ]
}
```

### Example 2: Type A (Phonetic / Katakana) - `アメリカ`

```json
{
  "word_surface": "アメリカ",
  "han_viet": "",
  "kana": "あめりか",
  "romaji": "amerika",
  "tags": ["n5", "noun", "katakana", "country"],
  "pitch_pattern": 0,
  "pitch_svg_path": "M0,20 L25,5 L50,5 L75,5 L100,5",
  "etymology": {
    "parts": [],
    "note": {
      "vi": "Từ mượn tiếng Anh: America.",
      "en": "Loan word from English: America."
    }
  },
  "meanings": {
    "vi": ["Mỹ", "Hoa Kỳ"],
    "en": ["America", "USA"]
  },
  "examples": [
    {
      "sentence": "アメリカへ行きたいです。",
      "translation": {
        "vi": "Tôi muốn đi Mỹ.",
        "en": "I want to go to America."
      }
    }
  ],
  "mnemonic": {
    "vi": "Đọc giống 'A-mê-ri-ca' trong tiếng Việt.",
    "en": "Sounds exactly like 'America'."
  },
  "confusions": []
}
```

### Example 3: Type B (Standard Noun) - `先生`

```json
{
  "word_surface": "先生",
  "han_viet": "TIÊN SINH",
  "kana": "せんせい",
  "romaji": "sensei",
  "tags": ["n5", "noun", "person"],
  "pitch_pattern": 3,
  "pitch_svg_path": "M0,20 L25,5 L50,5 L75,20",
  "etymology": {
    "parts": [
      { "kanji": "先", "han_viet": "TIÊN", "meaning": { "vi": "trước", "en": "before/ahead" } },
      { "kanji": "生", "han_viet": "SINH", "meaning": { "vi": "sinh ra", "en": "birth/life" } }
    ],
    "note": {
      "vi": "TIÊN SINH là người sinh ra trước, nên có kiến thức để dạy bảo.",
      "en": "Someone born (生) before (先) you, implying they have wisdom to teach."
    }
  },
  "meanings": {
    "vi": ["giáo viên", "thầy/cô"],
    "en": ["teacher", "master"]
  },
  "examples": [
    {
      "sentence": "田中先生は元気です。",
      "translation": {
        "vi": "Thầy Tanaka khỏe.",
        "en": "Mr/Ms (Teacher) Tanaka is healthy."
      }
    }
  ],
  "mnemonic": {
    "vi": "TIÊN SINH là người đẻ trước (Tiên). Kính trọng gọi là Thầy.",
    "en": "You say 'Sensei, say it!' when asking a teacher to speak."
  },
  "confusions": [
    {
      "word": "教師",
      "explanation": {
        "mnemonic": {
          "vi": "Tiên Sinh (Sensei) là cách gọi. Giáo Viên (Kyoushi) là nghề nghiệp.",
          "en": "Sensei is a title (honorific). Kyoushi is the job description."
        },
        "item1_nuance": {
          "vi": "Dùng để gọi/xưng hô với người khác.",
          "en": "Used to address someone (Title)."
        },
        "item2_nuance": {
          "vi": "Dùng để nói về nghề nghiệp của mình.",
          "en": "Used to state your occupation."
        }
      }
    }
  ]
}
```
