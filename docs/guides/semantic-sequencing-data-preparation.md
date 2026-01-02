# Semantic Sequencing: Data Preparation Guide

## Expert Guide for Language Education & Product Design

## Overview

The semantic sequencer uses **three types of relationships** to group related words together during study sessions. This guide explains how to prepare your vocabulary data to maximize learning effectiveness.

---

## 🎯 Current Implementation: Three Relationship Types

### 1. **Etymology Relationships** (Strongest: 0.3-1.0 strength)

**Source:** `Vocabulary.etymology` JSONB field  
**How it works:** Words sharing the same kanji roots are automatically detected and grouped.

### 2. **Confusion Pair Relationships** (Very Strong: 0.9 strength)

**Source:** `ConfusionPair` table  
**How it works:** Explicitly defined pairs of words that learners commonly confuse.

### 3. **Deck Context Relationships** (Weakest: 0.3 strength)

**Source:** `Vocabulary.deckId`  
**How it works:** Words from the same deck are grouped together (automatic).

---

## 📊 Relationship Strength Hierarchy

```text
Confusion Pairs (0.9) > Etymology (0.3-1.0) > Deck Context (0.3)
```

**Why this matters:** The sequencer prioritizes stronger relationships when clustering words. Confusion pairs get highest priority because they address specific learning challenges.

---

## ✅ Schema Status: **NO CHANGES NEEDED**

Your current Prisma schema is **perfectly designed** for semantic sequencing:

- ✅ `Vocabulary.etymology` (JSONB) - Already supports etymology-based relationships
- ✅ `ConfusionPair` table - Already supports explicit confusion relationships
- ✅ `Vocabulary.deckId` - Already supports contextual grouping

**You don't need to modify the schema.** You just need to **populate the data correctly**.

---

## 📝 Data Preparation: Step-by-Step

### Step 1: Prepare Etymology Data (Automatic Detection)

**What to do:** Ensure each vocabulary item has a properly structured `etymology` field.

**Example Structure:**

```json
{
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
        "vi": "Học tập",
        "en": "Study, learning"
      }
    }
  ],
  "note": {
    "vi": "大学 (Đại học) = Nơi học tập lớn",
    "en": "University = Large place of learning"
  }
}
```

**How it creates relationships:**

- Words sharing kanji "大" (大, 大きい, 大学) will be automatically grouped
- Words sharing kanji "学" (学ぶ, 学生, 大学) will be automatically grouped
- **Strength calculated:** `sharedKanjiCount / totalUniqueKanji`

**Example Relationships Created:**

```text
大学 (University) ↔ 大きい (Big)     [Shared: 大] → Strength: 0.5
大学 (University) ↔ 学ぶ (To study)  [Shared: 学] → Strength: 0.5
大きい (Big) ↔ 学ぶ (To study)      [No shared] → No relationship
```

**Best Practice (Language Education):**

- ✅ Include **all component kanji** in etymology parts
- ✅ Use **han_viet** for Vietnamese learners (critical for understanding)
- ✅ Add **meaning** for each kanji part (helps with pattern recognition)

---

### Step 2: Prepare Confusion Pairs (Explicit Relationships)

**What to do:** Create entries in the `ConfusionPair` table for words learners commonly confuse.

**Current Process:**

1. Prepare JSON file: `scripts/confusion_pair.json`
2. Run seed script: `npx tsx prisma/seed_confusions.ts`

**Example JSON Entry:**

```json
{
  "vocabId1": "貸す",
  "vocabId2": "借りる",
  "type": "ANTONYM",
  "explanation": {
    "mnemonic": {
      "vi": "Kasu (Cho mượn) vs Kariru (Mượn).",
      "en": "Kasu (Lend) vs Kariru (Borrow)."
    },
    "item1_nuance": {
      "vi": "Chủ ngữ là người sở hữu vật (Cho đi).",
      "en": "Lend (Give)."
    },
    "item2_nuance": {
      "vi": "Chủ ngữ là người cần vật (Nhận về).",
      "en": "Borrow (Receive)."
    }
  }
}
```

**Confusion Types Available:**

- `HOMONYM` - Same reading, different meaning (はし/橋 vs はし/箸)
- `LOOKALIKE` - Visually or phonetically similar (持つ vs 待つ)
- `SYNONYM` - Similar meaning, different nuance (わかる vs 知る)
- `ANTONYM` - Opposites often confused (貸す vs 借りる)
- `GRAMMAR` - Grammatical usage differences (ある vs いる)

**Best Practice (Language Education):**

- ✅ Focus on **high-frequency confusion pairs** first
- ✅ Include **nuance explanations** (critical for understanding differences)
- ✅ Use **mnemonics** to help learners remember distinctions
- ✅ Prioritize pairs that cause **real learning problems** (not just theoretical)

**Product Design Consideration:**

- Confusion pairs have **0.9 strength** (highest priority)
- They will **always cluster together** in study sessions
- Use this for **intervention mode** (showing pairs side-by-side)

---

### Step 3: Deck Context (Automatic)

**What to do:** Nothing! This is automatic based on `Vocabulary.deckId`.

**How it works:**

- Words from the same deck are automatically grouped
- Strength: 0.3 (weakest, used as fallback)
- Useful for: Course-based learning, thematic units

**Best Practice:**

- ✅ Organize decks by **thematic units** (e.g., "Restaurant", "Transportation")
- ✅ Keep related words in the same deck for better contextual learning

---

## 🎓 Language Education Best Practices

### 1. **Etymology-First Approach**

**Why:** Kanji-based relationships create strong memory anchors.

**Example Learning Sequence:**

```text
Session 1: 大 (Big) → 大きい (Big) → 大学 (University)
Session 2: 学 (Study) → 学ぶ (To study) → 学生 (Student)
```

**Benefit:** Learners see patterns and build mental models.

### 2. **Confusion Pair Intervention**

**Why:** Addressing confusion proactively prevents fossilized errors.

**Example:**

```text
When learner sees "貸す" → System shows "借りる" nearby
→ Learner compares nuances → Better retention
```

**Benefit:** Reduces common mistakes before they become habits.

### 3. **Thematic Grouping**

**Why:** Contextual learning improves retention.

**Example:**

```text
Restaurant Deck:
- 食べる (eat)
- 飲む (drink)
- 注文 (order)
- お会計 (bill)
```

**Benefit:** Words learned together in context are easier to recall.

---

## 🎨 Product Design Considerations

### 1. **Relationship Strength Visualization**

**Consider showing:**

- Strong relationships (etymology/confusion) → Visual indicators on cards
- Relationship type badges → "Related by kanji", "Commonly confused"
- Semantic context hints → "You're learning words with 大"

### 2. **Progressive Disclosure**

**Show relationships:**

- **During study:** Subtle hints (e.g., "Related to 大きい")
- **After review:** Full relationship explanation
- **In dashboard:** Relationship graph visualization

### 3. **Adaptive Sequencing**

**Future enhancement:**

- Track which relationship types help each learner most
- Adjust strength weights based on learner performance
- Personalize sequencing based on confusion patterns

---

## 📋 Data Preparation Checklist

### For Each Vocabulary Item

- [ ] **Etymology populated** with all component kanji
- [ ] **Han Viet** included for Vietnamese learners
- [ ] **Kanji meanings** included for each part
- [ ] **Deck assignment** makes thematic sense

### For Confusion Pairs

- [ ] **High-frequency pairs** identified
- [ ] **Nuance explanations** written (vi + en)
- [ ] **Mnemonics** created for distinction
- [ ] **Type correctly assigned** (HOMONYM, LOOKALIKE, etc.)

### For Decks

- [ ] **Thematic organization** (related words together)
- [ ] **Appropriate size** (20-50 words per deck)
- [ ] **Clear learning objectives** per deck

---

## 🔍 Example: Complete Data Flow

### Scenario: Learning "大学" (University)

**1. Vocabulary Entry:**

```json
{
  "wordSurface": "大学",
  "wordReading": "だいがく",
  "etymology": {
    "parts": [
      { "kanji": "大", "han_viet": "ĐẠI", "meaning": {...} },
      { "kanji": "学", "han_viet": "HỌC", "meaning": {...} }
    ]
  },
  "deckId": "academic-deck-uuid"
}
```

**2. Automatic Relationships Created:**

- ✅ **Etymology:** Links to 大きい (shares 大), 学ぶ (shares 学)
- ✅ **Deck Context:** Links to other words in "academic-deck"
- ✅ **Confusion Pair:** (if exists) Links to 大学校 (if defined)

**3. Study Session Behavior:**

```text
FSRS Queue: [大学, 大きい, 学ぶ, 学生, ...]
           ↓ Semantic Sequencing
Sequenced: [大学, 大きい, 学ぶ, 学生, ...]
           ↑ Clustered by relationships
```

**4. Learning Experience:**

- Learner sees 大学 first
- Next card: 大きい (related by 大) → "Ah, I see the pattern!"
- Next card: 学ぶ (related by 学) → "This kanji means study!"
- Better retention through pattern recognition

---

## 🚀 Next Steps

1. **Audit your vocabulary data:**
   - Check etymology completeness
   - Identify missing confusion pairs
   - Review deck organization

2. **Populate missing data:**
   - Add etymology for kanji-based words
   - Create confusion pair entries
   - Reorganize decks thematically

3. **Test semantic sequencing:**
   - Start a study session
   - Observe word ordering
   - Verify relationships are working

4. **Monitor and iterate:**
   - Track learner performance
   - Adjust relationship strengths if needed
   - Add more confusion pairs based on learner errors

---

## 📚 References

- **Implementation:** `src/modules/study/services/semantic-sequencer.service.ts`
- **Types:** `src/modules/study/types.ts`
- **Schema:** `prisma/schema.prisma`
- **Etymology Schema:** `src/lib/schemas/jsonb.ts`
- **Confusion Seed:** `prisma/seed_confusions.ts`

---

**Summary:** Your schema is ready. Focus on **populating etymology data** and **creating confusion pairs** to maximize the semantic sequencer's effectiveness. The system will automatically detect relationships and create meaningful learning sequences.
