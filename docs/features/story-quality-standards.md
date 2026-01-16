# Story Feature: Product Owner Quality Standards

**Document Owner:** Product Owner  
**Last Updated:** 2025-01-XX  
**Status:** Active Standards

---

## 1. UNDERSTANDING THE STORY FEATURE

### 1.1 What is the Story Feature?

The **Story Feature** (also called "Active Priming") is a **context-first learning mechanism** that transforms vocabulary acquisition from passive memorization to meaningful engagement.

**Core Concept:**

- Users encounter new vocabulary words in a **meaningful narrative context** before drilling them as flashcards
- Stories act as "priming" - preparing the brain to recognize and retain vocabulary more effectively
- This replaces the traditional "vocabulary list → flashcards" flow with "story → flashcards"

### 1.2 Strategic Value (The "Why")

**The 3 Strategic Pillars:**

1. **Retention is Revenue**
   - Flashcards cause burnout; Stories create 'Aha!' moments that keep users actively paying
   - Users who read stories before flashcards show **+50% retention** (target metric)

2. **Differentiation (The Moat)**
   - Anyone can clone a flashcard app
   - No competitor has **contextual narratives** generated for specific vocab units
   - This is our unique value proposition

3. **The 'Cold Open' Effect**
   - The first 5 minutes determine session length
   - Stories are the hook that prevents early drop-off
   - Users who engage with stories complete **80% more flashcard sessions**

### 1.3 Technical Architecture

**Data Model:**

- `Story` model (linked to `Deck` via `unitId`)
- `content` field: JSONB with `StoryContentSchema`
- `StoryLog` tracks user progress (who read what)

**Content Structure:**

```typescript
{
  title: { en: "The Lost Umbrella", vi: "Cái Ô Bị Mất" },
  body_text: "I went to the スーパー to buy groceries...",
  highlights: [
    {
      vocab_id: "uuid-1",
      word_surface: "スーパー",
      start_index: 14,
      length: 4
    }
  ]
}
```

**User Flow:**

1. User starts study session with `deckId`
2. System checks: Story exists? User hasn't read it?
3. If yes → Show `StoryReader` component
4. User reads story, taps highlighted words
5. User clicks "Begin Training" → Transitions to flashcards
6. First flashcard shown is one of the story keywords (Recency Effect)

---

## 2. WHAT IS A HIGH-QUALITY STORY?

### 2.1 Content Quality Standards

#### ✅ **MUST-HAVE Requirements**

**1. Length & Word Ratio**

- **Target:** 100-150 words total
- **Vocabulary Ratio:** 80% known words + 20% target words
- **Rationale:** Too many new words = cognitive overload. Too few = not challenging enough.

**2. Natural Integration**

- Target vocabulary words must appear **naturally** in context
- ❌ **BAD:** "I went to the スーパー. Then I bought りんご. Then I saw ねこ."
- ✅ **GOOD:** "I went to the スーパー to buy fresh りんご, but a friendly ねこ followed me home."

**3. Engaging Narrative**

- Story must have a **beginning, middle, and end**
- Must be **contextually meaningful** (not just a word list)
- Should be **relatable** to language learners
- **Examples of good themes:**
  - Daily life scenarios (shopping, cooking, commuting)
  - Cultural experiences (festivals, traditions)
  - Personal anecdotes (meeting friends, solving problems)

**4. Complete Vocabulary Coverage**

- **ALL** vocabulary words from the unit must appear in the story
- No words can be skipped or omitted
- Each word must be properly highlighted with correct `start_index` and `length`

**5. Mixed Language Format**

- Use **English grammar and structure**
- Naturally include **Japanese nouns/verbs** where appropriate
- This reduces cognitive load while maintaining Japanese exposure
- **Example:** "I went to the スーパー (supermarket) to buy りんご (apples)."

#### ✅ **SHOULD-HAVE Requirements**

**6. Cultural Authenticity**

- Stories should reflect **real Japanese cultural contexts**
- Avoid stereotypes or cultural insensitivity
- Use appropriate honorifics and formality levels when relevant

**7. Progressive Difficulty**

- Early units (1-5): Simple, concrete scenarios
- Mid units (6-15): More complex narratives
- Advanced units (16+): Abstract concepts, nuanced expressions

**8. Audio Quality (Future Enhancement)**

- `audioUrl` should provide native speaker narration
- Pronunciation should be clear and natural
- Audio enhances immersion and listening comprehension

### 2.2 Technical Quality Standards

#### ✅ **Schema Compliance**

**StoryContentSchema Validation:**

```typescript
{
  title: LocalizedStringSchema,      // { en: "...", vi: "..." }
  body_text: string,                 // Complete story text
  translation?: LocalizedStringSchema, // Optional translation
  highlights: StoryHighlightSchema[]  // Array of vocab highlights
}
```

**Highlight Accuracy:**

- `start_index` must be **0-based** and **exact** character position
- `length` must match the actual word length in `body_text`
- `vocab_id` must reference a valid `Vocabulary` record
- `word_surface` must exactly match the text in `body_text` at `start_index`

#### ✅ **Data Integrity**

- All `vocab_id` references must exist in the database
- No orphaned highlights (vocab deleted but story still references it)
- `contentStatus` workflow: `AI_GENERATED` → `VERIFIED` → `PUBLISHED`

### 2.3 User Experience Quality Standards

#### ✅ **Engagement Metrics**

**Target Metrics:**

- **Click-through Rate:** ≥70% of highlights tapped per story
- **Time on Screen:** ≥30 seconds for a 150-word story
- **Completion Rate:** ≥80% of users who start a story complete it
- **Conversion Rate:** ≥80% of story readers proceed to flashcard session

**Interaction Quality:**

- Highlighted words must be **visually distinct** (Indigo/Gold color, bold)
- Tooltip must appear **within 200ms** of tap
- Audio playback must be **instant** (no loading delay)
- "Begin Training" button must be **clearly visible** at story end

#### ✅ **Accessibility**

- Story text must be **readable on mobile** (16px base font, no horizontal scroll)
- Color contrast must meet **WCAG AA standards**
- Keyboard navigation support for tooltips
- Screen reader compatibility for story content

### 2.4 Learning Effectiveness Standards

#### ✅ **Pedagogical Quality**

**Contextual Learning:**

- Words appear in **multiple contexts** within the story (if possible)
- Story provides **semantic connections** between related words
- Narrative creates **emotional hooks** that aid memory

**Cognitive Load Management:**

- Story complexity matches **unit difficulty level**
- New grammar structures are **minimal** (focus on vocabulary)
- Sentence length is **appropriate** for learner level

**Retention Optimization:**

- Story themes are **memorable** (unusual, emotional, or relatable)
- Vocabulary appears in **meaningful relationships** (not isolated)
- Story ending creates **closure** (satisfying narrative arc)

---

## 3. QUALITY CHECKLIST FOR STORY CREATION

### Pre-Generation Checklist

- [ ] Unit vocabulary list is complete and validated
- [ ] All vocabulary words have proper readings and meanings
- [ ] Unit difficulty level is determined
- [ ] Story theme is appropriate for unit level

### Post-Generation Checklist

**Content Quality:**

- [ ] Story length is 100-150 words
- [ ] All vocabulary words appear naturally in story
- [ ] Story has clear narrative arc (beginning, middle, end)
- [ ] Story is engaging and relatable
- [ ] Cultural context is appropriate

**Technical Quality:**

- [ ] StoryContentSchema validation passes
- [ ] All highlights have correct `start_index` and `length`
- [ ] All `vocab_id` references are valid
- [ ] No duplicate highlights for same word
- [ ] `body_text` matches highlight positions exactly

**User Experience:**

- [ ] Story title is clear and engaging
- [ ] Translation is provided (if applicable)
- [ ] Highlighted words are visually distinct
- [ ] Story flows naturally when read aloud

### Post-Publication Monitoring

**Analytics to Track:**

- Story completion rate
- Average time spent on story
- Highlight click-through rate
- Conversion to flashcard session
- User-reported content issues

**Quality Signals:**

- ✅ **Good:** High engagement, low skip rate, positive user feedback
- ⚠️ **Review Needed:** Low engagement, high skip rate, user reports
- ❌ **Poor:** Validation failures, broken highlights, cultural insensitivity

---

## 4. EXAMPLES: GOOD vs BAD STORIES

### ✅ **GOOD Story Example**

**Title:** "The Lost Umbrella"  
**Unit:** Minna no Nihongo Unit 5  
**Vocabulary:** スーパー, りんご, ねこ, かさ, ともだち

**Story:**

> "Yesterday, I went to the スーパー to buy groceries. As I was picking out some fresh りんご, I noticed a friendly ねこ sitting by the entrance. When I left, I forgot my かさ (umbrella) inside! My ともだち (friend) who works there found it and called me. I was so grateful!"

**Why This is Good:**

- Natural narrative flow
- All words appear in meaningful context
- Relatable daily scenario
- Clear beginning, middle, end
- Emotional hook (gratitude)

### ❌ **BAD Story Example**

**Title:** "Shopping List"  
**Unit:** Minna no Nihongo Unit 5  
**Vocabulary:** スーパー, りんご, ねこ, かさ, ともだち

**Story:**

> "I went to スーパー. I bought りんご. I saw ねこ. I have かさ. My ともだち is nice."

**Why This is Bad:**

- No narrative structure
- Words appear in isolation
- No emotional connection
- Feels like a vocabulary list, not a story
- Users will skip this immediately

---

## 5. SUCCESS METRICS & KPIs

### Primary Metrics

1. **Story Engagement Rate**
   - Target: ≥70% of users interact with ≥3 highlights
   - Measurement: `KEYWORD_TAPPED` events / story views

2. **Story Completion Rate**
   - Target: ≥80% of users who start a story complete it
   - Measurement: `STORY_COMPLETED` events / `STORY_OPENED` events

3. **Priming Conversion Rate**
   - Target: ≥80% of story readers proceed to flashcards
   - Measurement: `PRIMING_CONVERSION` with `did_start_flashcards: true`

4. **Retention Impact**
   - Target: +50% retention for users who read stories vs. skip
   - Measurement: Compare flashcard session completion rates

### Secondary Metrics

- Average time on story (target: ≥30s for 150-word story)
- Highlight click-through rate (target: ≥70%)
- Story skip rate (target: ≤20%)
- User-reported content quality (target: ≥4.5/5 stars)

---

## 6. CONTINUOUS IMPROVEMENT

### Quality Review Process

1. **AI Generation:** Automated validation via `StoryContentSchema`
2. **Human Review:** Manual quality check before `PUBLISHED` status
3. **User Feedback:** Report content button for user-reported issues
4. **Analytics Review:** Monthly review of engagement metrics
5. **Iteration:** Update generation prompts based on quality signals

### Quality Escalation

- **Low Engagement:** Review story content, adjust theme or complexity
- **High Skip Rate:** Simplify story or improve narrative hook
- **User Reports:** Immediate review, flag for human editor
- **Validation Failures:** Retry generation with improved prompts

---

## 7. CONCLUSION

A **high-quality story** is one that:

1. ✅ **Engages** users emotionally and cognitively
2. ✅ **Teaches** vocabulary in meaningful context
3. ✅ **Converts** readers to active flashcard learners
4. ✅ **Retains** users through improved learning outcomes
5. ✅ **Differentiates** our product from competitors

**The Story Feature is not just content—it's our competitive moat and user retention engine.**

---

**Related Documents:**

- [Active Priming Feature Spec](./v2_active_priming.md)
- [Phase 3 Master Plan](../phase3_plan.md)
- [Story Data Model](../models/story.md)
- [Story Generation Script](../../scripts/generate_stories.ts)
