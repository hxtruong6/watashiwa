# Data Processing Plan: MinaN5

> **Source**: `data/MinaN5_1_13.txt`
> **Destination**: `data/jlpt_n5/unitXX.json`

## Unit Tracking

| Unit | Status | Est. Count | Lines (Approx) | Context / Keywords |
| :--- | :--- | :--- | :--- | :--- |
| **01** | ✅ Done | 35 | 3-37 | Introductions, Countries |
| **02** | ✅ Done | 40 | 38-77 | `本`, `これ`, `それ`, `あれ` |
| **03** | ✅ Done | 44 | 78-121 | `ここ`, `教室`, `国` |
| **04** | ✅ Done | 57 | 122-178 | `時間`, `起きます`, `昨日` |
| **05** | ✅ Done | 38 | 179-216 | `行きます`, `電車`, `誕生日` |
| **06** | ✅ Done | 46 | 217-262 | `食べます`, `サッカー`, `お花見` |
| **07** | ✅ Done | 39 | 263-301 | `切ります`, `パソコン`, `家族` |
| **08** | ✅ Done | 48 | 302-349 | `ハンサム`, `きれい`, Adjectives |
| **09** | ✅ Done | 46 | 350-395 | `わかります`, `好き`, `病気` |
| **10** | ✅ Done | 44 | 396-439 | `います` (exist), `上`, `下` |
| **11** | ✅ Done | 33 | 440-472 | `いくつ`, `枚`, `兄弟` |
| **12** | ✅ Done | ~71 | 473-543 | `簡単`, `天気`, `雨` |
| **13** | ✅ Done | ~15 | 544-558 | `欲しい`, `散歩します` |

## Generation Rules

### 1. File & Structure

- **Path Pattern**: `data/jlpt_n5/unit{XX}.json` (e.g., `unit02.json`).
- **Format**: JSON Array of objects.

### 2. Data Fields

| Field | Source Type | Requirement | Data Rules |
| :--- | :--- | :--- | :--- |
| `id` | Generated | **Required** | UUID v4 preferred. |
| `wordSurface` | Text | **Required** | The Kanji form if exists, else Kana. |
| `readingKana` | Text | **Required** | Full Hiragana reading. |
| `hanViet` | Text | Optional | Uppercase. Normalize dividers (e.g. `Học - Sinh` → `HỌC SINH`). |
| `meaning` | Text | **Required** | Vietnamese meaning from source. |
| `enMeaning` | AI Gen | **Required** | English definition. Concise. |
| `kanjiBreakdown`| JSON | Optional | Array of individual Kanji details. |
| `wordParts` | JSON | **Required** | Tokenized parts for Furigana (e.g. `[{"text": "学", "furigana": "がく"}, ...]`). |
| `exampleSentence`| JSON | **Required** | Object with `sentence` (JP), `translation` (VN), `enTranslation` (EN), and optional `parts`. |

### 3. Verification Steps

1. **Count Check**: The number of generated items must match the line count for that unit range.
2. **Missing Field Check**: Ensure no empty `enMeaning` or `meaning`.
3. **JSON Validity**: Must be valid JSON.
4. **Example Check**: Ensure every word has a meaningful example sentence.
