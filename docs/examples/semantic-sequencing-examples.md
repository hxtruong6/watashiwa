# Semantic Sequencing: Practical Examples

**Concrete examples for preparing vocabulary data for semantic sequencing**

---

## Example 1: Etymology-Based Relationships

### Vocabulary Entries

**Word 1: 大学 (University)**

```json
{
  "id": "vocab-uuid-1",
  "wordSurface": "大学",
  "wordReading": "だいがく",
  "etymology": {
    "parts": [
      {
        "kanji": "大",
        "han_viet": "ĐẠI",
        "meaning": {
          "vi": "Lớn, to lớn",
          "en": "Big, large"
        },
        "stroke_count": 3
      },
      {
        "kanji": "学",
        "han_viet": "HỌC",
        "meaning": {
          "vi": "Học tập, nghiên cứu",
          "en": "Study, learning"
        },
        "stroke_count": 8
      }
    ],
    "note": {
      "vi": "大学 = Nơi học tập lớn (Trường đại học)",
      "en": "University = Large place of learning"
    }
  }
}
```

**Word 2: 大きい (Big)**

```json
{
  "id": "vocab-uuid-2",
  "wordSurface": "大きい",
  "wordReading": "おおきい",
  "etymology": {
    "parts": [
      {
        "kanji": "大",
        "han_viet": "ĐẠI",
        "meaning": {
          "vi": "Lớn, to lớn",
          "en": "Big, large"
        }
      }
    ]
  }
}
```

**Word 3: 学ぶ (To study)**

```json
{
  "id": "vocab-uuid-3",
  "wordSurface": "学ぶ",
  "wordReading": "まなぶ",
  "etymology": {
    "parts": [
      {
        "kanji": "学",
        "han_viet": "HỌC",
        "meaning": {
          "vi": "Học tập",
          "en": "Study, learning"
        }
      }
    ]
  }
}
```

### Relationship Detection Result

**Automatic relationships created:**

1. **大学 ↔ 大きい**
   - Shared kanji: `大`
   - Strength: `1 / 2 = 0.5` (1 shared kanji / 2 total unique kanji)
   - Type: `ETYMOLOGY`

2. **大学 ↔ 学ぶ**
   - Shared kanji: `学`
   - Strength: `1 / 2 = 0.5`
   - Type: `ETYMOLOGY`

3. **大きい ↔ 学ぶ**
   - Shared kanji: None
   - Relationship: None

### Study Session Behavior

**FSRS Queue:**

```
[大学, 大きい, 学ぶ, 学生, 大きさ]
```

**After Semantic Sequencing:**

```
[大学, 大きい, 大きさ, 学ぶ, 学生]
 ↑      ↑        ↑      ↑     ↑
Cluster 1: 大-related    Cluster 2: 学-related
```

**Learning Flow:**

1. Learner sees 大学 (University)
2. Next: 大きい (Big) - "Oh, both have 大 meaning 'big'!"
3. Next: 大きさ (Size) - "Another 大 word!"
4. Next: 学ぶ (To study) - "Now I see 学 means 'study'!"
5. Next: 学生 (Student) - "Another 学 word!"

**Educational Benefit:** Pattern recognition through shared kanji roots.

---

## Example 2: Confusion Pair Relationships

### Confusion Pair Entry

```json
{
  "vocabId1": "貸す",
  "vocabId2": "借りる",
  "type": "ANTONYM",
  "explanation": {
    "mnemonic": {
      "vi": "Kasu (Cho mượn) vs Kariru (Mượn). Nhớ: Kasu = Cho đi, Kariru = Nhận về.",
      "en": "Kasu (Lend) vs Kariru (Borrow). Remember: Kasu = Give away, Kariru = Receive."
    },
    "item1_nuance": {
      "vi": "貸す: Chủ ngữ là người sở hữu vật, cho người khác mượn (Cho đi).",
      "en": "貸す: Subject owns the item, lends it to someone (Give)."
    },
    "item2_nuance": {
      "vi": "借りる: Chủ ngữ là người cần vật, mượn từ người khác (Nhận về).",
      "en": "借りる: Subject needs the item, borrows from someone (Receive)."
    }
  }
}
```

### Relationship Detection Result

**Explicit relationship created:**

1. **貸す ↔ 借りる**
   - Strength: `0.9` (fixed high strength for confusion pairs)
   - Type: `CONFUSION`
   - Metadata: `{ confusionType: "ANTONYM" }`

### Study Session Behavior

**FSRS Queue:**

```
[貸す, 借りる, 買う, 売る, 持つ]
```

**After Semantic Sequencing:**

```
[貸す, 借りる, 買う, 売る, 持つ]
 ↑      ↑      ↑    ↑
Cluster 1: Confusion pairs
```

**Learning Flow:**

1. Learner sees 貸す (Lend)
2. Next: 借りる (Borrow) - **Immediately compared** (high strength = always adjacent)
3. System can show intervention card comparing both
4. Learner understands the distinction before confusion sets in

**Educational Benefit:** Proactive error prevention through side-by-side comparison.

---

## Example 3: Combined Relationships (Etymology + Confusion)

### Vocabulary Entries

**Word 1: 持つ (To hold)**

```json
{
  "id": "vocab-uuid-4",
  "wordSurface": "持つ",
  "wordReading": "もつ",
  "etymology": {
    "parts": [
      {
        "kanji": "持",
        "han_viet": "TRÌ",
        "meaning": {
          "vi": "Cầm, giữ",
          "en": "Hold, keep"
        }
      }
    ]
  }
}
```

**Word 2: 待つ (To wait)**

```json
{
  "id": "vocab-uuid-5",
  "wordSurface": "待つ",
  "wordReading": "まつ",
  "etymology": {
    "parts": [
      {
        "kanji": "待",
        "han_viet": "ĐÃI",
        "meaning": {
          "vi": "Chờ đợi",
          "en": "Wait"
        }
      }
    ]
  }
}
```

### Confusion Pair Entry

```json
{
  "vocabId1": "持つ",
  "vocabId2": "待つ",
  "type": "LOOKALIKE",
  "explanation": {
    "mnemonic": {
      "vi": "Motsu (Cầm) vs Matsu (Chờ). Dễ nhầm lẫn âm thanh.",
      "en": "Motsu (Hold) vs Matsu (Wait). Easy to confuse sounds."
    },
    "item1_nuance": {
      "vi": "持つ: Cầm nắm, sở hữu vật.",
      "en": "持つ: Hold, possess an object."
    },
    "item2_nuance": {
      "vi": "待つ: Chờ đợi, mong đợi.",
      "en": "待つ: Wait, expect."
    }
  }
}
```

### Relationship Detection Result

**Multiple relationships created:**

1. **持つ ↔ 待つ** (Confusion Pair)
   - Strength: `0.9` (CONFUSION type)
   - Priority: **Highest** (will always cluster together)

2. **持つ ↔ 待つ** (Etymology - if they shared kanji)
   - Strength: `0.0` (No shared kanji)
   - Relationship: None (different kanji)

**Result:** Confusion pair relationship takes precedence.

### Study Session Behavior

**FSRS Queue:**

```
[持つ, 待つ, 買う, 売る, 食べる]
```

**After Semantic Sequencing:**

```
[持つ, 待つ, 買う, 売る, 食べる]
 ↑      ↑
Cluster: Confusion pair (highest priority)
```

**Learning Flow:**

1. Learner sees 持つ (Hold)
2. Next: 待つ (Wait) - **Immediately compared** (confusion pair)
3. System shows intervention explaining the difference
4. Learner avoids future confusion

**Educational Benefit:** Multiple relationship types work together, with confusion pairs getting highest priority.

---

## Example 4: Deck Context Relationships

### Vocabulary in Same Deck

**Deck: "Restaurant" (deck-uuid-1)**

```json
[
  {
    "id": "vocab-uuid-6",
    "wordSurface": "食べる",
    "deckId": "deck-uuid-1"
  },
  {
    "id": "vocab-uuid-7",
    "wordSurface": "飲む",
    "deckId": "deck-uuid-1"
  },
  {
    "id": "vocab-uuid-8",
    "wordSurface": "注文",
    "deckId": "deck-uuid-1"
  },
  {
    "id": "vocab-uuid-9",
    "wordSurface": "お会計",
    "deckId": "deck-uuid-1"
  }
]
```

### Relationship Detection Result

**Automatic relationships created:**

All pairs within the deck:

- 食べる ↔ 飲む (strength: 0.3)
- 食べる ↔ 注文 (strength: 0.3)
- 食べる ↔ お会計 (strength: 0.3)
- 飲む ↔ 注文 (strength: 0.3)
- 飲む ↔ お会計 (strength: 0.3)
- 注文 ↔ お会計 (strength: 0.3)

Type: `DECK_CONTEXT`

### Study Session Behavior

**FSRS Queue:**

```
[食べる, 飲む, 注文, お会計, 学校]
```

**After Semantic Sequencing:**

```
[食べる, 飲む, 注文, お会計, 学校]
 ↑        ↑     ↑      ↑
Cluster: Restaurant deck (thematic grouping)
```

**Learning Flow:**

1. Learner sees 食べる (Eat)
2. Next: 飲む (Drink) - "Restaurant context!"
3. Next: 注文 (Order) - "Still restaurant!"
4. Next: お会計 (Bill) - "Complete restaurant experience!"
5. Next: 学校 (School) - Different context

**Educational Benefit:** Thematic learning improves retention through context.

---

## Example 5: Complex Multi-Relationship Scenario

### Scenario Setup

**Vocabulary:**

- 大学 (University) - Shares 大 with 大きい, shares 学 with 学ぶ
- 大きい (Big) - Shares 大 with 大学
- 学ぶ (To study) - Shares 学 with 大学
- 学生 (Student) - Shares 学 with 大学, 学ぶ
- 貸す (Lend) - Confusion pair with 借りる
- 借りる (Borrow) - Confusion pair with 貸す

**FSRS Queue:**

```
[大学, 大きい, 学ぶ, 学生, 貸す, 借りる]
```

### Relationship Map

```
大学:
  - ↔ 大きい (ETYMOLOGY, strength: 0.5)
  - ↔ 学ぶ (ETYMOLOGY, strength: 0.5)
  - ↔ 学生 (ETYMOLOGY, strength: 0.5)

大きい:
  - ↔ 大学 (ETYMOLOGY, strength: 0.5)

学ぶ:
  - ↔ 大学 (ETYMOLOGY, strength: 0.5)
  - ↔ 学生 (ETYMOLOGY, strength: 0.5)

学生:
  - ↔ 大学 (ETYMOLOGY, strength: 0.5)
  - ↔ 学ぶ (ETYMOLOGY, strength: 0.5)

貸す:
  - ↔ 借りる (CONFUSION, strength: 0.9)

借りる:
  - ↔ 貸す (CONFUSION, strength: 0.9)
```

### Clustering Algorithm Result

**Step 1: Separate by FSRS Priority**

- Due Reviews: [大学, 大きい, 学ぶ, 学生, 貸す, 借りる]
- New Cards: []

**Step 2: Cluster by Relationships**

**Cluster 1: 学-related words** (strongest cluster)

```
[大学, 学ぶ, 学生]
```

**Cluster 2: 大-related words**

```
[大きい]
```

**Cluster 3: Confusion pair** (highest priority)

```
[貸す, 借りる]
```

**Step 3: Final Sequence**

```
[貸す, 借りる, 大学, 学ぶ, 学生, 大きい]
 ↑      ↑      ↑     ↑     ↑      ↑
Confusion  Etymology cluster (学)
pair
```

**Why this order?**

1. Confusion pairs get highest priority (0.9 strength)
2. Etymology clusters group related words
3. 大きい appears last (only shares 大, weaker connection)

### Learning Flow

1. **貸す (Lend)** → Confusion pair intervention
2. **借りる (Borrow)** → Immediate comparison
3. **大学 (University)** → Etymology cluster starts
4. **学ぶ (To study)** → "I see 学 means study!"
5. **学生 (Student)** → "Another 学 word!"
6. **大きい (Big)** → "And 大 means big!"

**Educational Benefit:** Multiple relationship types create rich, interconnected learning experiences.

---

## 🎯 Key Takeaways

1. **Etymology relationships are automatic** - Just populate the `etymology` field correctly
2. **Confusion pairs have highest priority** - Use them for critical distinctions
3. **Deck context provides fallback grouping** - Organize decks thematically
4. **Multiple relationships work together** - The algorithm clusters based on all available relationships
5. **Strength determines priority** - Confusion (0.9) > Etymology (0.3-1.0) > Deck (0.3)

---

## 📋 Quick Reference

### To Create Etymology Relationships

```json
{
  "etymology": {
    "parts": [
      { "kanji": "大", "han_viet": "ĐẠI", "meaning": {...} }
    ]
  }
}
```

### To Create Confusion Pair

```json
{
  "vocabId1": "word1",
  "vocabId2": "word2",
  "type": "HOMONYM|LOOKALIKE|SYNONYM|ANTONYM|GRAMMAR",
  "explanation": {
    "mnemonic": { "vi": "...", "en": "..." },
    "item1_nuance": { "vi": "...", "en": "..." },
    "item2_nuance": { "vi": "...", "en": "..." }
  }
}
```

### To Create Deck Context

```json
{
  "deckId": "thematic-deck-uuid"
}
```

---

**Remember:** Your schema is ready. Focus on **data quality** - complete etymology data and well-defined confusion pairs will create the best learning experiences.
