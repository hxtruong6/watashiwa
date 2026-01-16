# Semantic Sequencing: Quick Answer Guide

**Direct answers to your questions about preparing semantic word relationships**

---

## ❓ Your Questions Answered

### Q1: "How do I prepare the semantic word to query in semantic-queue?"

**Answer:** You don't need to prepare words for querying. The semantic sequencer **automatically queries** relationships from three sources:

1. **Etymology** (from `Vocabulary.etymology` JSONB field)
2. **Confusion Pairs** (from `ConfusionPair` table)
3. **Deck Context** (from `Vocabulary.deckId`)

**What you need to do:**

- ✅ Populate `etymology` field for vocabulary items
- ✅ Create `ConfusionPair` entries for commonly confused words
- ✅ Organize vocabulary into thematic decks

**The system automatically:**

- Detects shared kanji from etymology
- Queries confusion pairs from database
- Groups words by deck context

---

### Q2: "Currently it looks like it gets it from confusion pair?"

**Answer:** **Partially correct!** The semantic sequencer uses **three sources**, not just confusion pairs:

1. **Confusion Pairs** (0.9 strength) - Highest priority
2. **Etymology** (0.3-1.0 strength) - Automatic from kanji roots
3. **Deck Context** (0.3 strength) - Automatic from same deck

**Current Implementation:**

```typescript
// From semantic-sequencer.service.ts
const [etymologyRels, confusionRels, deckRels] = await Promise.all([
	getEtymologyRelationships(vocabIds), // ← Etymology
	getConfusionPairRelationships(vocabIds), // ← Confusion Pairs
	getDeckContextRelationships(queue), // ← Deck Context
]);
```

**Why confusion pairs might seem primary:**

- They have **highest strength (0.9)** so they cluster first
- They're **explicitly defined** (more visible than automatic etymology)
- They're used for **intervention mode** (special UI treatment)

**But etymology relationships are equally important** - they're just automatic and less visible.

---

### Q3: "Could you show me some examples?"

**Answer:** See detailed examples in:

- `docs/examples/semantic-sequencing-examples.md` - Complete examples with data structures
- `docs/guides/semantic-sequencing-data-preparation.md` - Step-by-step guide

**Quick Example:**

**Etymology Relationship (Automatic):**

```json
// Word 1: 大学 (University)
{
  "etymology": {
    "parts": [
      { "kanji": "大", "han_viet": "ĐẠI" },
      { "kanji": "学", "han_viet": "HỌC" }
    ]
  }
}

// Word 2: 大きい (Big)
{
  "etymology": {
    "parts": [
      { "kanji": "大", "han_viet": "ĐẠI" }
    ]
  }
}

// Result: Automatic relationship created
// 大学 ↔ 大きい (Shared kanji: 大, Strength: 0.5)
```

**Confusion Pair (Explicit):**

```json
// In scripts/confusion_pair.json
{
	"vocabId1": "貸す",
	"vocabId2": "借りる",
	"type": "ANTONYM",
	"explanation": {
		"mnemonic": {
			"vi": "Kasu (Cho mượn) vs Kariru (Mượn)",
			"en": "Kasu (Lend) vs Kariru (Borrow)"
		}
	}
}

// Result: Explicit relationship created
// 貸す ↔ 借りる (Strength: 0.9, Highest priority)
```

---

### Q4: "Do I need to change @prisma/schema.prisma?"

**Answer: NO!** Your schema is **perfectly designed** for semantic sequencing:

✅ **Already has:**

- `Vocabulary.etymology` (JSONB) - For etymology relationships
- `ConfusionPair` table - For explicit confusion relationships
- `Vocabulary.deckId` - For contextual grouping

✅ **No changes needed:**

- All relationship types are supported
- Performance is optimized (indexes exist)
- Data structure is flexible (JSONB for etymology)

**What you need to do instead:**

- ✅ **Populate data** (etymology, confusion pairs)
- ✅ **Organize decks** thematically
- ✅ **Run seed scripts** for confusion pairs

**Schema is ready. Focus on data quality.**

---

## 🎯 Summary: What You Need to Do

### ✅ DO THIS

1. **Populate Etymology Data**

   ```json
   {
     "etymology": {
       "parts": [
         { "kanji": "大", "han_viet": "ĐẠI", "meaning": {...} }
       ]
     }
   }
   ```

2. **Create Confusion Pairs**

   ```bash
   # Edit scripts/confusion_pair.json
   # Run: npx tsx prisma/seed_confusions.ts
   ```

3. **Organize Decks Thematically**
   - Group related words together
   - Use clear deck names (e.g., "Restaurant", "Transportation")

### ❌ DON'T DO THIS

- ❌ Don't modify `prisma/schema.prisma` (it's already perfect)
- ❌ Don't create manual relationship tables (use existing structure)
- ❌ Don't query relationships manually (sequencer does it automatically)

---

## 🔍 How It Works (Technical Overview)

### 1. Relationship Detection Flow

```
FSRS Queue (SmartCard[])
    ↓
Extract vocabIds
    ↓
Parallel Queries:
  ├─→ Etymology (Vocabulary.etymology)
  ├─→ Confusion Pairs (ConfusionPair table)
  └─→ Deck Context (Vocabulary.deckId)
    ↓
Merge Relationships
    ↓
RelationshipMap: vocabId → WordRelationship[]
    ↓
Cluster by Relationships
    ↓
Sequenced Queue
```

### 2. Relationship Strength Priority

```
Confusion Pairs:    0.9  (Highest - always cluster)
Etymology:          0.3-1.0 (Based on shared kanji ratio)
Deck Context:      0.3  (Lowest - fallback grouping)
```

### 3. Clustering Algorithm

1. **Separate by FSRS priority:** Due Reviews > New Cards
2. **Within each group, cluster by relationships:**
   - Find connected components (DFS)
   - Sort clusters by relationship strength
   - Preserve original order for unconnected words
3. **Combine:** Due Reviews first, then New Cards

---

## 📊 Current Implementation Status

### ✅ Already Implemented

- ✅ Etymology relationship detection (automatic from kanji)
- ✅ Confusion pair querying (from database)
- ✅ Deck context grouping (automatic)
- ✅ Relationship strength calculation
- ✅ Clustering algorithm
- ✅ Performance monitoring (<500ms)
- ✅ Graceful fallback to FSRS

### 📝 Can Be Enhanced

- 📝 UI indicators for relationship types
- 📝 Relationship visualization in dashboard
- 📝 Adaptive strength adjustment based on learner performance
- 📝 More relationship types (semantic similarity, frequency co-occurrence)

---

## 🚀 Next Steps

1. **Audit your vocabulary data:**
   - Check which words have etymology populated
   - Identify missing confusion pairs
   - Review deck organization

2. **Populate missing data:**
   - Add etymology for kanji-based words
   - Create confusion pair entries for common mistakes
   - Reorganize decks thematically

3. **Test the system:**
   - Start a study session
   - Observe word ordering
   - Verify relationships are working

4. **Monitor and iterate:**
   - Track which relationships help learners most
   - Add more confusion pairs based on errors
   - Adjust deck organization based on feedback

---

## 📚 Reference Files

- **Implementation:** `src/modules/study/services/semantic-sequencer.service.ts`
- **Types:** `src/modules/study/types.ts`
- **Schema:** `prisma/schema.prisma`
- **Etymology Schema:** `src/lib/schemas/jsonb.ts`
- **Confusion Seed:** `prisma/seed_confusions.ts`
- **Examples:** `docs/examples/semantic-sequencing-examples.md`
- **Guide:** `docs/guides/semantic-sequencing-data-preparation.md`

---

## 💡 Key Insight

**The semantic sequencer is a query system, not a data preparation system.**

You prepare the data (etymology, confusion pairs, deck organization), and the sequencer automatically:

- Queries relationships
- Calculates strengths
- Clusters words
- Creates learning sequences

**Your job:** Data quality  
**System's job:** Relationship detection and sequencing

---

**Bottom Line:** Your schema is ready. Focus on populating etymology data and creating confusion pairs. The system will automatically detect relationships and create meaningful learning sequences.
