# Data Processing Plan: MinaN5

> **Source**: `data/MinaN5_1_13.txt`
> **Destination**: `data/minna_1/unitXX.json`

## Unit Tracking

| Unit   | Status     | Est. Count | Lines (Approx) | Context / Keywords                                    |
| :----- | :--------- | :--------- | :------------- | :---------------------------------------------------- |
| **01** | ✅ Done    | 35         | 3-37           | Introductions, Countries                              |
| **02** | ✅ Done    | 40         | 38-77          | `本`, `これ`, `それ`, `あれ`                          |
| **03** | ✅ Done    | 44         | 78-121         | `ここ`, `教室`, `国`                                  |
| **04** | ✅ Done    | 57         | 122-178        | `時間`, `起きます`, `昨日`                            |
| **05** | ✅ Done    | 38         | 179-216        | `行きます`, `電車`, `誕生日`                          |
| **06** | ✅ Done    | 46         | 217-262        | `食べます`, `サッカー`, `お花見`                      |
| **07** | ✅ Done    | 39         | 263-301        | `切ります`, `パソコン`, `家族`                        |
| **08** | ✅ Done    | 48         | 302-349        | `ハンサム`, `きれい`, Adjectives                      |
| **09** | ✅ Done    | 46         | 350-395        | `わかります`, `好き`, `病気`                          |
| **10** | ✅ Done    | 44         | 396-439        | `います` (exist), `上`, `下`                          |
| **11** | ✅ Done    | 33         | 440-472        | `いくつ`, `枚`, `兄弟`                                |
| **12** | ✅ Done    | ~71        | 473-543        | `簡単`, `天気`, `雨`                                  |
| **13** | ✅ Done    | ~15        | 544-558        | `欲しい`, `散歩します`                                |
| **14** | ✅ Done    | 40         | 3-42           | `つけます`, `雨` (Source: `MinaN5_14_25.txt`)         |
| **15** | ✅ Done    | 19         | 43-61          | `置きます`, `家族` (Source: `MinaN5_14_25.txt`)       |
| **16** | ✅ Done    | 49         | 62-110         | `乗ります`, `緑` (Source: `MinaN5_14_25.txt`)         |
| **17** | ✅ Done    | 28         | 111-138        | `覚えます`, `心配します` (Source: `MinaN5_14_25.txt`) |
| **18** | ✅ Done    | 24         | 162-185        | `できます`, `趣味` (Source: `MinaN5_14_25.txt`)       |
| **19** | ✅ Done    | 23         | 139-161        | `登ります`, `練習` (Source: `MinaN5_14_25.txt`)       |
| **20** | ✅ Done    | 17         | 186-202        | `要ります`, `ビザ` (Source: `MinaN5_14_25.txt`)       |
| **21** | ✅ Done    | 22         | 238-259        | `思います`, `意見` (Source: `MinaN5_14_25.txt`)       |
| **22** | ✅ Done    | 22         | 260-281        | `着ます`, `帽子` (Source: `MinaN5_14_25.txt`)         |
| **23** | ✅ Done    | 25         | 282-306        | `聞きます`, `故障` (Source: `MinaN5_14_25.txt`)       |
| **24** | ✅ Done    | 12         | 203-214        | `直します`, `紹介` (Source: `MinaN5_14_25.txt`)       |
| **25** | ✅ Done    | 23         | 215-237        | `考えます`, `もし` (Source: `MinaN5_14_25.txt`)       |
| **26** | ⏳ Pending | 55         | 3-57           | `やります`, `ごみ` (Source: `MinaN4_26_38.txt`)       |
| **27** | ⏳ Pending | 42         | 58-99          | `飼います`, `走ります` (Source: `MinaN4_26_38.txt`)   |
| **28** | ⏳ Pending | 46         | 100-145        | `売れます`, `踊ります` (Source: `MinaN4_26_38.txt`)   |
| **29** | ⏳ Pending | 37         | 146-182        | `開きます`, `閉まります` (Source: `MinaN4_26_38.txt`) |
| **30** | ⏳ Pending | 41         | 183-223        | `貼ります`, `植えます` (Source: `MinaN4_26_38.txt`)   |
| **31** | ⏳ Pending | 36         | 224-259        | `生活します`, `続けます` (Source: `MinaN4_26_38.txt`) |
| **32** | ⏳ Pending | 57         | 260-316        | `閉じます`, `運動します` (Source: `MinaN4_26_38.txt`) |
| **33** | ⏳ Pending | 46         | 317-362        | `逃げます`, `守ります` (Source: `MinaN4_26_38.txt`)   |
| **34** | ⏳ Pending | 39         | 363-401        | `磨きます`, `組立てます` (Source: `MinaN4_26_38.txt`) |
| **35** | ⏳ Pending | 30         | 402-431        | `咲きます`, `変わります` (Source: `MinaN4_26_38.txt`) |
| **36** | ⏳ Pending | 42         | 432-473        | `貯金します`, `あいます` (Source: `MinaN4_26_38.txt`) |
| **37** | ⏳ Pending | 50         | 474-523        | `褒めます`, `誘います` (Source: `MinaN4_26_38.txt`)   |
| **38** | ⏳ Pending | 37         | 524-560        | `参加します`, `育てます` (Source: `MinaN4_26_38.txt`) |

## Generation Rules

### 1. File & Structure

- **Path Pattern**: `data/minna_1/unit{XX}.json` (e.g., `unit02.json`).
- **Format**: JSON Array of objects.

### 2. Data Fields

| Field             | Source Type | Requirement  | Data Rules                                                                                                                                   |
| :---------------- | :---------- | :----------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`              | Generated   | **Required** | UUID v4 preferred.                                                                                                                           |
| `wordSurface`     | Text        | **Required** | The Kanji form if exists, else Kana.                                                                                                         |
| `readingKana`     | Text        | **Required** | Full Hiragana reading.                                                                                                                       |
| `hanViet`         | Text        | Optional     | Uppercase. Normalize dividers (e.g. `Học - Sinh` → `HỌC SINH`).                                                                              |
| `meaning`         | Text        | **Required** | Vietnamese meaning from source.                                                                                                              |
| `enMeaning`       | AI Gen      | **Required** | English definition. Concise.                                                                                                                 |
| `kanjiBreakdown`  | JSON        | Optional     | Array of individual Kanji details.                                                                                                           |
| `wordParts`       | JSON        | **Required** | Tokenized parts for Furigana and Romaji (e.g. `[{"text": "学", "furigana": "がく", "romaji": "gaku"}, ...]`).                                |
| `exampleSentence` | JSON        | **Required** | Object with `sentence` (JP), `translation` (VN), `enTranslation` (EN). **MUST include `parts`** array for tokenized breakdown with furigana. |

### 3. Detail Generation (Enrichment)

To ensure high-quality data (as seen in Unit 10), the following fields must be generated with precision:

#### A. Example Sentence Breakdown (`exampleSentence.parts`)

- **Goal**: Allow tap-to-scan and furigana display.
- **Format**: Array of objects.
- **Requirement**: Break the sentence into smallest meaningful tokens (morphemes).
- **Schema**:

  ```json
  "parts": [
    { "text": "私", "furigana": "わたし" },
    { "text": "は" },
    { "text": "学生", "furigana": "がくせい" },
    { "text": "です" },
    { "text": "。" }
  ]
  ```

#### B. Kanji Breakdown (`kanjiBreakdown`)

- **Goal**: Etymology and component analysis.
- **Format**: Array of objects.
- **Requirement**: Analyze clear Kanji compounds in `wordSurface`.
- **Schema**:

  ```json
  "kanjiBreakdown": [
    {
      "kanji": "学",
      "hanViet": "HỌC",
      "meaning": "learning, science"
    },
    {
      "kanji": "生",
      "hanViet": "SINH",
      "meaning": "life, birth"
    }
  ]
  ```

#### C. Word Parts Breakdown (`wordParts`)

- **Goal**: Frontend display and pronunciation.
- **Format**: Array of objects.
- **Requirement**: Must include `romaji` for every part.
- **Schema**:

  ```json
  "wordParts": [
    {
      "text": "学生",
      "furigana": "がくせい",
      "romaji": "gakusei"
    }
  ]
  ```

### 4. Verification Steps

1. **Count Check**: The number of generated items must match the line count for that unit range.
2. **Missing Field Check**: Ensure no empty `enMeaning` or `meaning`.
3. **JSON Validity**: Must be valid JSON.
4. **Example Check**: Ensure every word has a meaningful example sentence.

Based on the audit, here are the units that need data enrichment:

🔴 Critical (Missing Parts & Romaji & Kanji)
Units 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25 These units are missing exampleSentence.parts and romaji completely.

🟡 Partial (Missing Kanji Breakdown)
Units 03, 04, 06, 08, 09, 10, 11 These units have sentence parts and romaji (mostly), but are missing kanjiBreakdown.
