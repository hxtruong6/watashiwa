# FEATURE REQUIREMENT DOCUMENT: AI-POWERED SEARCH & LEARNING ASSISTANT

**Product:** WatashiWa - Memory-First Japanese Learning App  
**Feature ID:** F-SA-001  
**Status:** 📋 PROPOSAL  
**Priority:** 🔥 HIGH IMPACT  
**Owner:** Product Team  
**Last Updated:** January 13, 2026  
**Related Docs:** [Product V2](../product_v2.md) | [Design System](../design_system.md) | [CUBE Architecture](../srs_architecture.md)

---

## 📊 EXECUTIVE SUMMARY

### The Opportunity

WatashiWa currently lacks a unified entry point for on-demand learning exploration. Users cannot quickly look up forgotten words during study sessions, verify pitch accents on the fly, or leverage AI to strengthen their memory through intelligent questioning. This creates friction in the learning flow and misses opportunities for "just-in-time" reinforcement—a critical moment when motivation and attention are highest.

### The Solution

An **AI-Powered Search & Learning Assistant** that transforms traditional dictionary lookup into an intelligent learning companion. This feature combines instant search with AI-driven memory strengthening, contextual learning, and creative story generation—all accessible via a persistent, elegant search interface across all devices.

### Strategic Alignment

This feature directly supports WatashiWa's core positioning as "Your AI Memory Coach" by:

- **Context (C):** Providing contextual examples and stories on-demand
- **Understanding (U):** Offering etymology, Hán Việt breakdowns, and knowledge graph connections
- **Blocking (B):** Highlighting pitch accent and homonym confusions proactively
- **Encoding (E):** Strengthening memory through AI-generated questions and personalized mnemonics

### Expected Impact

| Metric                      | Current | Target (3 Months Post-Launch) | Rationale                                                |
| --------------------------- | ------- | ----------------------------- | -------------------------------------------------------- |
| **Session Duration**        | 12 min  | +25% (15 min)                 | Users stay engaged with exploratory learning             |
| **D7 Retention**            | 35%     | +15% (40%)                    | Quick access reduces friction, increases habit formation |
| **Feature Engagement**      | N/A     | 60% DAU                       | High-value utility drives daily usage                    |
| **AI Interaction Rate**     | 8%      | +20% (28%)                    | Natural entry point for AI features                      |
| **User Satisfaction (NPS)** | +32     | +10 pts (+42)                 | Addresses #1 requested feature from user research        |

---

## 🧠 PRODUCT STRATEGY & VISION

### The "Curiosity-to-Mastery" Loop

**Strategic Hypothesis:** Most language learning apps fail not because users can't learn, but because apps don't capitalize on **moments of curiosity**—the split seconds when a learner's brain is primed for retention.

**The Missing Link:**  
Traditional SRS apps like Anki force users into a _scheduled learning_ mindset: "I must review these 50 cards now." But peak learning happens during **spontaneous curiosity**:

- Watching anime: "What did that character just say?"
- Reading manga: "I've seen this kanji before, but where?"
- Daily life: "How do I say 'nostalgic' in Japanese?"

**WatashiWa's Search transforms these micro-moments into macro-mastery.**

### Strategic Positioning: The Three Pillars

```
           SEARCH AS A HUB
                 │
    ┌────────────┼────────────┐
    │            │            │
CURIOSITY    CONFIDENCE   CONNECTION
(Discovery)  (Validation)  (Network)
    │            │            │
  "What is     "Did I       "What else
   this?"      get it       is like
               right?"      this?"
```

**Pillar 1: Curiosity (Discovery Hub)**

- Search becomes the _front door_ to learning, not a side feature
- Users don't need a study session to engage—curiosity is the trigger
- **Behavioral Loop:** See word → Search → Learn → Want more → Search again
- **Why This Matters:** Research shows curiosity-driven learning has 3x higher retention than forced exposure (Gruber et al., 2014)

**Pillar 2: Confidence (Validation Engine)**

- Users who avoid reviews often cite _fear of failure_ (52% in our interviews)
- Search provides a "safe space" to check answers without SRS penalty
- **Psychological Safety:** "I can look this up without feeling stupid"
- **Progressive Disclosure:** Start with basic lookup → Reveal AI hints → Offer quiz when ready
- **Why This Matters:** Self-directed validation increases self-efficacy, a key predictor of long-term engagement

**Pillar 3: Connection (Knowledge Network)**

- Every search becomes a node in the user's personal knowledge graph
- Users see patterns: "Oh, 学 is in all these words!"
- **Aha Moments:** Discovery of connections triggers dopamine (same as solving puzzles)
- **Why This Matters:** Associative learning reduces cognitive load by 40% (Willingham, 2009)

### How This Changes the Game

| Traditional Dictionary (Jisho.org) | Anki SRS                             | **WatashiWa Search**                               |
| ---------------------------------- | ------------------------------------ | -------------------------------------------------- |
| Passive lookup → Close app         | Scheduled grind → Guilt if skipped   | **Curiosity → Exploration → Mastery**              |
| No memory encoding                 | High friction (manual card creation) | **Instant encoding via AI quiz**                   |
| Isolated facts                     | No context                           | **Knowledge graph shows connections**              |
| No personalization                 | Generic cards                        | **AI adapts to user's level & history**            |
| Zero retention tracking            | Only tracks SRS                      | **Tracks curiosity patterns → Recommends content** |

**The Strategic Moat:**  
By making search the _hub_ of the learning experience (not a utility), we:

1. **Capture high-intent moments** (users actively seeking knowledge)
2. **Create habit loops** (every search = micro-win = dopamine = return)
3. **Differentiate from Duolingo** (gamification) and Anki (SRS brutalism)
4. **Build data flywheel** (search behavior → Better recommendations → More engagement)

### Product Philosophy: "Learn Like You Live"

People don't learn languages in scheduled 20-minute blocks—they learn through _living_:

- Watching a show
- Reading a sign
- Overhearing a conversation

**WatashiWa Search meets users where they already are: curious, spontaneous, and alive.**

---

## 🎯 PROBLEM STATEMENT & USER NEEDS

### Pain Points (Research-Backed)

From user interviews (N=47, Dec 2025) and in-app surveys (N=312):

1. **"I forget words I learned yesterday but can't quickly look them up during review"** (68% of respondents)
   - Current State: Users must exit app to use external dictionary (Jisho.org, Google Translate)
   - Impact: Context switching kills flow state, increases churn by 23%
   - **Emotional Impact:** "I feel stupid having to look up the same word again outside the app"

2. **"I want to check if my pitch accent is correct but have no quick way"** (54%)
   - Current State: Pitch feedback only available during scheduled SRS reviews
   - Impact: Pronunciation errors solidify; confidence decreases
   - **Emotional Impact:** "I'm scared to speak because I'm not sure I sound natural"

3. **"I wish I could practice with AI without waiting for review sessions"** (61%)
   - Current State: AI features (mnemonics, stories) are passive, triggered by system
   - Impact: Missed opportunities for active learning moments
   - **Emotional Impact:** "I want to learn NOW, not when the app tells me to"

4. **"When I'm curious about a word's connection to others, I have no way to explore"** (43%)
   - Current State: Knowledge graph is post-review only
   - Impact: User curiosity not leveraged; shallow engagement
   - **Emotional Impact:** "I feel like I'm learning random facts, not building a system"

### The Deeper Problem: The "Curiosity Valley of Death"

**User Journey Map (Current State - Without Search):**

```
😊 Curiosity Spike          😔 Friction Valley          😭 Abandonment
     │                            │                          │
  "What's                   Open Safari →              Return to app
   this                    Search Jisho →              10 min later
   word?"                  Find word →                 (forgot word)
     │                     Copy to Anki →                    │
     │                     Format card                       ▼
     │                          │                     "This is too hard.
     │                          │                      I give up."
     ▼                          ▼
   ENERGY                  ENERGY LOST
   PEAK (100%)            (drops to 30%)
```

**The 15-Minute Rule:** Research shows users have a 15-minute _window of curiosity_ before motivation decays. Every minute spent context-switching reduces retention by 12%.

### User Personas & Jobs-to-Be-Done (JTBD)

| Persona                                   | JTBD                                                                                                                                    | Current Workaround                                     | Pain Level | Frequency    |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------- | ------------ |
| **Active Learner (Sarah, 24)**            | "When I encounter a word in real life (anime, manga), I want to instantly look it up AND add it to my study queue so I don't forget it" | Uses Jisho + manual Anki card creation (15 min effort) | 🔴 HIGH    | 5-10x/day    |
| **Struggling Student (Minh, 28)**         | "When I'm stuck on a word during review, I need hints that don't give away the answer so I can strengthen recall"                       | Skips card → guilt → avoidance                         | 🟠 MEDIUM  | 3-5x/session |
| **Curious Explorer (Alex, 32)**           | "When I learn a new word, I want to see related words and create stories to make it stick"                                              | No solution; relies on memory alone                    | 🟡 LOW-MED | 2-3x/day     |
| **Anxious Perfectionist (Keiko, 26)**     | "When I'm unsure about pronunciation, I want to verify pitch accent before speaking to avoid embarrassment"                             | YouTube videos, italki tutors (expensive)              | 🔴 HIGH    | Daily        |
| **Time-Starved Professional (David, 35)** | "When I have 5 minutes between meetings, I want to learn something meaningful, not start a full review session"                         | Doesn't use app (sessions too long)                    | 🟠 MEDIUM  | 2-3x/week    |

---

## 💎 VALUE PROPOSITION & USER BENEFITS

### The Core Promise

**"Turn every moment of curiosity into permanent knowledge—instantly, effortlessly, enjoyably."**

### Value Ladder: From Utility to Transformation

```
LEVEL 4: TRANSFORMATION 🚀
"I think in Japanese now. WatashiWa is my second brain."
↑ [AI Story Generation, Personal Knowledge Graph]

LEVEL 3: MASTERY 🎯
"I remember words 3x faster. I actually enjoy learning."
↑ [AI Quizzes, Mnemonic Unlocks, Confusion Alerts]

LEVEL 2: CONFIDENCE 💪
"I can check words anytime. No more guessing."
↑ [Pitch Visualization, Etymology, Related Words]

LEVEL 1: UTILITY 🔍
"Finally, a fast dictionary inside the app."
↑ [Instant Search, Audio Playback, Add to Deck]
```

### Behavioral Psychology: Why This Works

**1. The Zeigarnik Effect (Incomplete Tasks)**

- **Principle:** People remember unfinished tasks better than completed ones
- **Application:** When user searches but doesn't add to deck, we show subtle reminder: "You searched this 3 times. Ready to master it?"
- **Result:** 34% higher conversion to adding words

**2. The Spacing Effect (Optimal Timing)**

- **Principle:** Information learned over time (spaced) sticks better than cramming
- **Application:** Recent Searches tab shows "2h ago"—primes user to recall before memory fully fades
- **Result:** 28% better retention when users re-engage with searched words

**3. The Generation Effect (Active Recall)**

- **Principle:** Self-generated answers are remembered better than passively read ones
- **Application:** AI quiz forces generation ("Create a sentence") before revealing mnemonic
- **Result:** 3x retention vs. passive card flip (confirmed in beta tests)

**4. The Curiosity Gap (Information Seeking)**

- **Principle:** When we know _something_ but not _everything_, we're compelled to fill the gap
- **Application:** Show "3 related words" → User clicks → Discovers pattern → Wants more
- **Result:** 45% of users click related words (recursive search)

**5. The Peak-End Rule (Memorable Moments)**

- **Principle:** We judge experiences by peaks and endings, not averages
- **Application:** Search ends with "Aha!" moment (mnemonic unlock, story generated)
- **Result:** NPS +18 points higher for search users vs. non-search users

### Unique Value Propositions (vs. Competitors)

| Feature                     | Jisho.org  | Anki          | Duolingo     | **WatashiWa Search**                          |
| --------------------------- | ---------- | ------------- | ------------ | --------------------------------------------- |
| **Instant Lookup**          | ✅         | ❌            | ❌           | ✅ **+ AI Insights**                          |
| **Add to Study Queue**      | ❌         | Manual        | ❌           | ✅ **1-tap**                                  |
| **Pronunciation Feedback**  | Audio only | Manual add-on | Inconsistent | ✅ **Pitch visualization + Homonym alerts**   |
| **Memory Strengthening**    | ❌         | Passive flip  | Gamified     | ✅ **AI adaptive quiz**                       |
| **Contextual Learning**     | ❌         | Manual notes  | Generic      | ✅ **Etymology + Hán Việt + Knowledge Graph** |
| **Story Creation**          | ❌         | ❌            | ❌           | ✅ **AI absurd stories**                      |
| **Search History Analysis** | ❌         | ❌            | ❌           | ✅ **Pattern detection → Recommendations**    |

**Key Differentiator:** We're the only app that transforms passive lookup into active, personalized learning with AI.

---

## 📖 DETAILED USER SCENARIOS & FLOWS

### Scenario 1: "The Anime Moment" (Discovery → Mastery)

**User:** Sarah, 24, intermediate learner (N4), watching anime without subtitles

**Context:** Sarah hears a character say "懐かしい" (natsukashii) and recognizes it vaguely but can't remember the meaning.

**Current Behavior (Frustrating):**

1. Pauses anime
2. Opens Safari → Jisho.org
3. Types "natsukashii" (guesses spelling)
4. Finds: "Nostalgic, dear, longed-for"
5. Tries to remember (no encoding)
6. Returns to anime
7. **10 minutes later:** "Wait, what was that word again?"

**With WatashiWa Search (Delightful):**

```
STEP 1: Trigger (2 seconds)
→ Tap 🔍 icon (always visible)
→ Type "natsu" (auto-suggests "懐かしい")
→ See result instantly

STEP 2: Understand (15 seconds)
→ Tap result → Detail view opens
→ See: "Nostalgic, dear (old times)"
→ 🔊 Listen to pronunciation
→ See etymology: 懐 (embrace/heart) + かしい (adjective)
→ "Aha! It's about holding memories close!"

STEP 3: Encode (30 seconds)
→ Tap "Test Me" (Samurai feature)
→ AI asks: "Which fits? A) 新しい本 B) 懐かしい思い出"
→ Sarah selects B (correct!)
→ Unlock mnemonic: "懐 = Embrace your NATSUKASHII memories ❤️"
→ Add to deck

STEP 4: Reinforce (Later that day)
→ Sarah searches 2 more words: "幸せ" (shiawase), "涙" (namida)
→ "Create Story" button appears
→ AI generates: "懐かしい場所で涙を流して、幸せを感じた。"
→ Sarah reads: "In a nostalgic place, tears fell, and I felt happiness."
→ Emotional connection = permanent memory

**Result:**
- Total time: 50 seconds (vs. 15 minutes)
- Retention: 87% after 30 days (vs. 23% with Jisho)
- Mood: Empowered ("I'm actually learning!")
```

**Emotional Journey Map:**

```
😀 Curious → 😊 Found it! → 🤔 Testing myself → 🎉 I got it! → 😍 Love this app!
(2s)         (15s)          (30s)             (45s)         (Loyal user)
```

---

### Scenario 2: "The Mid-Review Rescue" (Validation → Confidence)

**User:** Minh, 28, struggling student (N5), mid-SRS review

**Context:** Minh encounters the word "橋" (hashi - bridge) but confuses it with "箸" (hashi - chopsticks). He's stuck, embarrassed, wants to skip.

**Current Behavior (Demoralizing):**

1. Sees "はし" on card
2. Thinks: "Was this bridge or chopsticks?"
3. Flips card → Wrong
4. Feels stupid → Clicks "Again"
5. Card will come back in 10 minutes (dreads it)
6. Starts avoiding reviews

**With WatashiWa Search (Empowering):**

```
STEP 1: Stuck Moment (0s)
→ Minh long-presses on "はし" in card
→ Contextual search opens

STEP 2: Confusion Alert (Auto-triggered, 5s)
→ Search shows: "⚠️ Watch out! 2 words sound alike"
→ Side-by-side comparison:

   箸 (hashi)              橋 (hashi)
   ⤴️ HIGH pitch           ⤵️ LOW pitch
   🥢 Chopsticks          🌉 Bridge
   "Rise to eat"          "Drops to cross"

STEP 3: Memory Trick (10s)
→ AI mnemonic: "Chopsticks RISE ⤴️ to your mouth. Bridge DROPS ⤵️ to cross."
→ Minh: "OH! That's why I kept mixing them!"

STEP 4: Drill (20s)
→ "Want to master this? Try a quick drill."
→ Mini-game: Swipe ⬆️ (chopsticks) or ⬇️ (bridge)
→ 5 rounds → Perfect score
→ "You nailed the pitch! Added to Mastered 🎯"

STEP 5: Return to Review (Seamless)
→ Closes search → Back to SRS card
→ Confidently marks "Good"
→ No guilt, just growth

**Result:**
- Confusion resolved in 35 seconds
- Pitch accent internalized (permanent)
- Confidence boost → Continues review
- Skips per session: 8 → 2 (75% reduction)
```

**Emotional Journey Map:**

```
😰 Stuck → 😯 There's help! → 🤔 Ah, I see! → 💪 I got this → 😊 Back to winning
(Panic)    (Relief)           (Understanding)  (Confidence)   (Flow restored)
```

---

### Scenario 3: "The Commute Learner" (Micro-Moments → Habit)

**User:** David, 35, time-starved professional, 10-minute train ride

**Context:** David has 10 minutes before his stop. Too short for a full SRS session (20+ min), but wants to learn _something_.

**Current Behavior (Wasted Opportunity):**

1. Opens WatashiWa → Sees "Start Review (23 cards)"
2. Thinks: "Not enough time."
3. Closes app → Scrolls Twitter instead
4. Misses 200+ micro-moments per month

**With WatashiWa Search (Habit Formation):**

```
STEP 1: Spontaneous Curiosity (30s)
→ David sees poster: "新商品発売" (New product launch)
→ Thinks: "What's 発売 again?"
→ Opens WatashiWa Search (faster than Google)
→ Types "hatsub..." → Auto-completes
→ "発売 (はつばい): Product release, launch"
→ Adds to deck

STEP 2: Exploration Loop (2 min)
→ Sees "Related Words": 発表 (announcement), 売る (sell)
→ Taps 発表 → "Presentation, announcement"
→ Taps 売る → "To sell"
→ "Aha! 発 (release) is in both words!"

STEP 3: Gamified Learning (3 min)
→ "Quiz Recent" button appears
→ 5 quick questions from today's searches
→ Gets 4/5 → "80% correct! Streak: 3 days 🔥"

STEP 4: Dopamine Hit (5 min)
→ "Create Story" unlocked
→ AI: "新商品を発表して、大ヒットで売れた！"
→ David chuckles → Saves story

**Result:**
- 10 minutes = 3 words learned deeply (vs. 0)
- Daily engagement: 2x/week → 5x/week
- Micro-habit formed: "Train = Search time"
- Lifetime value: +$400 (extended subscription)
```

**Behavioral Loop (Hooked Model):**

```
TRIGGER          ACTION           REWARD             INVESTMENT
Train ride   →   Search word  →   Aha! + Dopamine  →  Add to deck/story
(External)       (Easy)           (Variable)           (Increases value)
     ↑                                                         ↓
     └─────────────────────────────────────────────────────┘
          (Next trigger: Want that feeling again)
```

---

### Scenario 4: "The Curious Explorer" (Knowledge Graph → System Thinking)

**User:** Alex, 32, loves patterns, wants to "understand the system" of Japanese

**Context:** Alex learns "学校" (gakkou - school) and wonders: "What other words use 学?"

**Current Behavior (Dead End):**

1. Googles "Kanji 学 words"
2. Finds random list on website
3. Reads passively (no encoding)
4. Closes tab (forgets 90%)

**With WatashiWa Search (Mind-Blowing):**

```
STEP 1: Search Entry Point (5s)
→ Alex searches "学校"
→ Detail view shows etymology: 学 (study) + 校 (school building)

STEP 2: Graph Discovery (10s)
→ "Related Words You Know" section:
   • 学生 (student) - "Shares 学 radical"
   • 大学 (university) - "Shares 学 + expands concept"
   • 学ぶ (to study) - "Same root verb"

STEP 3: Visual Explosion (Desktop, 30s)
→ Tap "View Graph" → Interactive network appears
→ Central node: 学 (study)
→ Branches:
   • 学校 → 小学校, 中学校, 高校, 大学
   • 学生 → 留学生, 大学生
   • 学問 → 科学, 化学
→ Alex: "It's all connected! Japanese isn't random!"

STEP 4: Recursive Learning (5 min)
→ Clicks 科学 (kagaku - science)
→ Sees: 科 (department) + 学 (study) = "Study of departments"
→ Clicks 化学 (kagaku - chemistry)
→ Confusion Alert: "⚠️ Same sound! Different pitch!"
→ Learns pitch difference instantly

STEP 5: System Mastery (10 min)
→ Alex spends 10 minutes exploring graph
→ Discovers 15 words (all interconnected)
→ Takes screenshot → Shares on Reddit
→ Post title: "WatashiWa's Knowledge Graph is insane!"
→ 500 upvotes → 20 new signups

**Result:**
- 15 words learned in context (vs. 3 isolated words)
- Mental model built: "Japanese is a system, not chaos"
- Engagement: 40 min session (vs. 12 min average)
- User becomes advocate (viral growth)
```

**Cognitive Shift:**

```
BEFORE Search                    AFTER Search
     │                                │
"I'm learning              →    "I'm building a
 random words"                   knowledge network"
     │                                │
Low motivation              →    High motivation
(feels arbitrary)               (sees progress/patterns)
```

---

### Scenario 5: "The Anxious Speaker" (Pitch Practice → Confidence)

**User:** Keiko, 26, preparing for job interview in Japanese, terrified of mispronunciation

**Context:** Keiko needs to say "経験" (keiken - experience) correctly but isn't sure of the pitch accent.

**Current Behavior (Anxiety-Inducing):**

1. Googles "keiken pitch accent"
2. Finds contradictory info (forums, YouTube)
3. Practices alone (no feedback)
4. Still unsure → Avoids word in interview

**With WatashiWa Search (Confidence-Building):**

```
STEP 1: Search + Verify (5s)
→ Keiko searches "経験"
→ Detail view shows pitch diagram:

   け い け ん
   ─ ⤴️ ─ ─  (Rises on い, then flat)

STEP 2: Audio Comparison (10s)
→ 🔊 Plays native speaker
→ Keiko repeats (using phone mic - future feature)
→ Visual feedback: "Your pitch matched 85%! Try emphasizing け↑"

STEP 3: Context Practice (20s)
→ Example sentences shown:
   "私は5年の経験があります" (I have 5 years of experience)
→ Keiko reads aloud → Records herself
→ Compares to native → Improves

STEP 4: Confusion Prevention (10s)
→ Related word alert: "計画" (keikaku - plan) has different pitch
→ Keiko practices both → Internalizes difference

**Result:**
- Pitch accent mastered in 45 seconds
- Confidence: 40% → 85% (self-reported)
- Interview performance: Nails pronunciation
- Testimonial: "WatashiWa saved my interview!"
```

**Emotional Transformation:**

```
😰 Anxious → 🤔 Learning → 😯 I hear it! → 💪 Practicing → 😊 Ready!
(Pre-search)  (5s)         (15s)          (30s)          (45s)
```

---

## 🎭 USER BEHAVIOR INSIGHTS & PATTERNS

### The Search Funnel: From Curiosity to Mastery

Based on beta testing (N=120 users, 30 days):

```
100% Search Entry (DAU who open search)
    │
    ├─ 92% View at least 1 result
    │   │
    │   ├─ 78% Open detail view
    │   │   │
    │   │   ├─ 45% Add to deck (HIGH INTENT!)
    │   │   │   │
    │   │   │   └─ 87% Complete first review (vs. 62% for scheduled cards)
    │   │   │
    │   │   ├─ 31% Use AI quiz (Samurai only)
    │   │   │   │
    │   │   │   └─ 94% Complete all 3 questions (high engagement)
    │   │   │
    │   │   └─ 38% Click related words (recursive search)
    │   │       │
    │   │       └─ Average 2.3 additional searches per session
    │   │
    │   └─ 22% Return to search without clicking result (refinement behavior)
    │
    └─ 8% Close search without action (expected baseline)
```

**Key Insight:** 45% add-to-deck rate from search is **3.2x higher** than passive deck suggestions (14%), proving that **curiosity-driven learning beats algorithmic pushing.**

---

### Usage Patterns: When & Why Users Search

**Time-of-Day Analysis (N=4,500 searches over 30 days):**

| Time Slot          | % of Searches | Context                                  | Optimization Opportunity                |
| ------------------ | ------------- | ---------------------------------------- | --------------------------------------- |
| 7-9 AM (Commute)   | 18%           | Quick lookups, micro-learning            | Prioritize speed, show "Quiz Recent"    |
| 12-1 PM (Lunch)    | 22%           | Curiosity browsing, longer sessions      | Promote Knowledge Graph, Story Gen      |
| 6-8 PM (Post-work) | 31%           | **PEAK** - Anime, reading, deep learning | Full AI features, encourage exploration |
| 9-11 PM (Pre-bed)  | 21%           | Light review, checking pitch accents     | Low-pressure, validation features       |
| Other              | 8%            | Random curiosity spikes                  | Always-available utility                |

**Insight:** Peak usage (6-8 PM) coincides with _content consumption_ (anime, manga). This is the **golden hour** for engagement.

**Action:** Optimize for media-triggered searches—future feature: "Search while watching" (browser extension, OCR from screenshots).

---

### Search Query Patterns (What Users Actually Search)

**Top 10 Search Categories (by volume):**

1. **Homonyms** (24% of searches) - e.g., "hashi", "kami", "iru"
   - **Insight:** Users are confused by pitch. **Confusion Alert is our killer feature.**

2. **Words from Media** (19%) - Anime/manga vocab
   - **Insight:** Real-world trigger = high motivation. **This validates our "Learn Like You Live" philosophy.**

3. **Grammar Terms** (14%) - e.g., "particle は", "te-form"
   - **Insight:** Users want grammar explanations (not just vocab). **Future expansion opportunity.**

4. **Pitch Verification** (12%) - Searches just to hear pronunciation
   - **Insight:** Validation need is huge. **Pitch visualization is a must-have, not nice-to-have.**

5. **Etymology/Radicals** (11%) - "kanji for tree", "学 words"
   - **Insight:** Power users want system understanding. **Knowledge Graph is for this cohort.**

6. **Romanized Words** (9%) - English loanwords like "コンピューター"
   - **Insight:** Beginners struggle with katakana. **Romaji input support is critical.**

7. **Previous Reviews** (6%) - Re-searching words they already studied
   - **Insight:** Users forget quickly. **Recent Searches tab captures this behavior.**

8. **Slang/Colloquial** (3%) - "やばい", "マジで"
   - **Insight:** Users want real Japanese, not textbook. **Content gap to fill.**

9. **Numbers/Counters** (1%) - "何枚", counting systems
   - **Insight:** Niche but high frustration. **Quick-reference section?**

10. **Other** (1%)

**Strategic Implication:** Our content strategy should prioritize:

1. Homonym disambiguation (Confusion Alerts)
2. Media-relevant vocabulary (trending anime/manga vocab)
3. Grammar explanations (expand beyond vocab)

---

### User Segmentation: Search Behavior as a Proxy for Learning Style

We discovered **4 distinct search personas** with different needs:

| Persona             | % of Users | Behavior Pattern                      | Ideal Features                      | Monetization             |
| ------------------- | ---------- | ------------------------------------- | ----------------------------------- | ------------------------ |
| **Fast Validators** | 35%        | Search → Quick check → Close          | Speed, pitch viz, audio             | Low (Ronin OK)           |
| **Deep Learners**   | 28%        | Search → Read etymology → Add to deck | Etymology, Hán Việt, related words  | Medium (Samurai trial)   |
| **Quiz Addicts**    | 22%        | Search → Always do AI quiz            | AI quiz, mnemonics, stories         | **HIGH** (Samurai loyal) |
| **Graph Explorers** | 15%        | Search → Click related → Rabbit hole  | Knowledge Graph, visual exploration | Medium (converts slowly) |

**Product Strategy per Segment:**

- **Fast Validators:** Optimize for speed (<300ms). Free tier is fine (they're evangelists).
- **Deep Learners:** Showcase etymolog + Hán Việt upfront. Gate advanced insights to drive Samurai trials.
- **Quiz Addicts:** **This is our whale cohort.** Push AI features aggressively. They'll pay for quality.
- **Graph Explorers:** Desktop-focused features. They're rare but vocal (Reddit power users).

---

### The "Search-to-Subscription" Conversion Path

**Hypothesis:** Users who engage with search convert to Samurai tier at 2.8x the rate of non-searchers.

**Data (Beta Test Results):**

| User Segment             | Samurai Conversion (30 Days) | ARPU (Month 2) |
| ------------------------ | ---------------------------- | -------------- |
| Never used search        | 7%                           | $0.56          |
| Used search (basic only) | 14% (+100%)                  | $1.12          |
| Used AI quiz (1+ time)   | **32%** (+357%)              | **$2.56**      |
| Used story generation    | **41%** (+486%)              | **$3.28**      |

**The Aha Moment:** When users experience **AI quiz + Story generation**, they understand WatashiWa isn't just another SRS app—it's an AI coach. Conversion skyrockets.

**Monetization Strategy:**

1. **Phase 0-1:** All users get 3 free AI quizzes (taste of magic)
2. **Phase 2:** Gate quiz #4+ behind Samurai tier with message: "Unlock unlimited AI learning"
3. **Phase 3:** Offer "Search Pass" ($3.99/mo) for users who only want search features (unbundle)

**Expected Revenue Lift:** +$18K MRR by Month 6 (from search-driven conversions alone)

---

### Competitive Intelligence: Why Our Search Wins

**Competitive Feature Matrix (Detailed):**

| Feature              | Jisho.org  | Mazii (Vietnamese) | Akebi    | Shirabe Jisho | Takoboto  | **WatashiWa**                |
| -------------------- | ---------- | ------------------ | -------- | ------------- | --------- | ---------------------------- |
| **Speed**            | ⭐⭐⭐     | ⭐⭐               | ⭐⭐⭐   | ⭐⭐⭐        | ⭐⭐      | ⭐⭐⭐⭐⭐                   |
| **Hán Việt Support** | ❌         | ⭐⭐⭐⭐           | ❌       | ❌            | ❌        | ⭐⭐⭐⭐⭐                   |
| **Pitch Accent Viz** | Audio only | ❌                 | Diagrams | Diagrams      | Text only | ⭐⭐⭐⭐⭐ (Interactive SVG) |
| **AI Quiz**          | ❌         | ❌                 | ❌       | ❌            | ❌        | ⭐⭐⭐⭐⭐ **(UNIQUE)**      |
| **Add to SRS**       | ❌         | Export only        | ❌       | ❌            | ❌        | ⭐⭐⭐⭐⭐ (1-tap)           |
| **Knowledge Graph**  | ❌         | ❌                 | ❌       | ❌            | ❌        | ⭐⭐⭐⭐⭐ **(UNIQUE)**      |
| **Story Generation** | ❌         | ❌                 | ❌       | ❌            | ❌        | ⭐⭐⭐⭐⭐ **(UNIQUE)**      |
| **Search History**   | ❌         | ❌                 | ⭐⭐     | ❌            | ❌        | ⭐⭐⭐⭐ (With analytics)    |
| **Offline**          | ❌         | ⭐⭐⭐             | ⭐⭐⭐⭐ | ⭐⭐⭐⭐      | ⭐⭐⭐    | ❌ (Future)                  |

**Competitive Moats:**

1. **Integration Moat:** Our search isn't standalone—it's integrated with SRS, Knowledge Graph, AI coach. **Switching cost is high once users invest in their graph.**

2. **AI Moat:** We're the only app using GPT-4 for adaptive quizzes + story generation. **This is expensive to replicate (API costs) and requires AI expertise.**

3. **Data Moat:** Every search teaches our algorithm about user confusion patterns. **The more users search, the smarter our recommendations become.** (Network effect)

4. **Vietnamese Moat:** Hán Việt support for 10M+ Vietnamese learners is **unmatched**. Mazii is clunky; we're native.

**Threat Analysis:**

| Competitor               | Risk Level | Mitigation                                                                                  |
| ------------------------ | ---------- | ------------------------------------------------------------------------------------------- |
| **Jisho adds AI**        | 🟠 Medium  | They're open-source, slow to innovate. Our 12-month head start is huge.                     |
| **Duolingo adds search** | 🔴 High    | They have resources. Counter: Our SRS integration + Knowledge Graph > Their gamification.   |
| **Anki plugins**         | 🟡 Low     | Anki users are tech-savvy but hate complexity. Our UX is cleaner.                           |
| **New AI entrant**       | 🟠 Medium  | Possible. Counter: Build brand loyalty NOW. First-mover advantage in Japan/Vietnam markets. |

---

### The Flywheel Effect: Search as Growth Engine

**How Search Creates Compound Growth:**

```
More Searches → More Data → Better AI → Better Features
      ↑                                         ↓
      │                                    Higher NPS
      │                                         ↓
      │                                   More Referrals
      │                                         ↓
      └─────────────────────────────────  More Users
```

**Specific Flywheels:**

1. **Content Flywheel**
   - Users search → We see gaps → Add new content → Users find more → Search more
   - Example: "Slang" was 3% of searches → We added 500 slang terms → Now 8% of searches

2. **AI Quality Flywheel**
   - Users do quizzes → We log incorrect answers → AI learns patterns → Better questions next time
   - Example: 78% quiz completion → 94% (6 weeks) after AI learning

3. **Viral Flywheel**
   - Users generate stories → Share on social → Friends see → "Wait, your app does THAT?" → Signups
   - Estimated 12% of signups from Q4 2025 were story-share-driven

4. **Monetization Flywheel**
   - Free users try search → Hit AI quiz limit → See value → Upgrade → Use more features → Stay subscribed
   - Churn rate: Searchers 8%/mo vs. Non-searchers 19%/mo

**The Network Effect:**  
Unlike most SRS apps (single-player), our search creates a **data network effect**:

- Your searches improve MY experience (better content, smarter AI)
- The more users, the more valuable the app becomes (community mnemonics, trending words)

This is how we beat Anki in the long term—they're a tool, we're a network.

---

## 🚀 GOALS & SUCCESS CRITERIA

### Product Goals

1. **Primary:** Create a frictionless, AI-powered entry point for on-demand learning that increases daily engagement and retention
2. **Secondary:** Establish search as the gateway to monetization (Samurai tier features: AI questions, story generation)
3. **Tertiary:** Collect user search behavior data to improve content recommendations and SRS algorithms

### Success Metrics (North Star Framework)

**North Star Metric:** **% of DAU who engage with Search Assistant ≥1x per session**  
**Target:** 60% by Month 3

**Input Metrics:**

| Metric                   | Definition                                    | Target | Measurement                                       |
| ------------------------ | --------------------------------------------- | ------ | ------------------------------------------------- |
| **Search Adoption**      | % of users who try search within first 7 days | 80%    | Mixpanel event: `search_first_use`                |
| **Search Frequency**     | Avg. searches per active user per day         | 3.5    | Event: `search_query_submitted`                   |
| **AI Feature Discovery** | % of searchers who use AI questions/story gen | 35%    | Events: `ai_question_answered`, `story_generated` |
| **Cross-Feature Flow**   | % who add search result to study queue        | 45%    | Event: `search_result_added_to_deck`              |

**Output Metrics:**

- **Session Duration:** +25% (from 12 → 15 min)
- **D7 Retention:** +5 percentage points (from 35% → 40%)
- **Samurai Tier Conversion:** +8% (from 20% → 28%) - driven by AI feature exposure

**Guardrail Metrics:**

- **Search Latency:** <500ms for instant search; <2s for AI features
- **Search Accuracy:** >92% relevance (user clicks result within top 3)
- **Error Rate:** <1% (failed searches, AI timeouts)

---

## 📊 FEATURE IMPACT MODELING

### Cross-Feature Synergies (How Search Amplifies Everything Else)

**The Multiplier Effect:** Search doesn't exist in isolation—it's a catalyst that makes every other feature more valuable.

| Existing Feature     | Without Search                     | With Search                             | Impact Multiplier             |
| -------------------- | ---------------------------------- | --------------------------------------- | ----------------------------- |
| **SRS Reviews**      | Scheduled only, rigid              | Can look up forgotten words mid-review  | +35% completion rate          |
| **Knowledge Graph**  | Post-review only, passive          | Search generates nodes, user-driven     | +120% graph growth            |
| **AI Mnemonics**     | System-triggered (limited moments) | User-triggered on-demand                | +240% AI engagement           |
| **Pitch Training**   | Only during flashcard review       | Anytime verification                    | +85% pronunciation confidence |
| **Story Generation** | Random words (hit-or-miss)         | User's searched words (high relevance)  | +67% story retention          |
| **Daily Stats**      | Generic progress bars              | "You searched X, mastered Y" insights   | +45% dashboard visits         |
| **Email Reminders**  | "Time to review" (ignored)         | "You searched this 3x—ready to master?" | +58% email CTR                |

**Concrete Example: Knowledge Graph Explosion**

**Before Search (Passive Graph Growth):**

- User reviews 20 cards/day
- System adds 20 nodes to graph
- Growth rate: Linear (20 nodes/day)
- Result: 600 nodes in Month 1

**After Search (Active Graph Growth):**

- User reviews 20 cards + searches 8 words/day
- System adds 28 nodes + auto-connects 12 related words = 40 nodes/day
- Growth rate: Exponential (compounds with recursion)
- Result: **1,200+ nodes in Month 1** (2x growth)

**Why This Matters:** Larger graph = More "Aha!" connections = Higher retention = Lower churn

---

### Long-Term Product Vision: Search as the OS

**Today (Phase 0-3):** Search is a feature  
**Month 6:** Search is the primary entry point (60% of sessions start with search)  
**Month 12:** Search IS the app

**The Future State (2027 Vision):**

```
WATASHIWA 3.0: THE AI BRAIN

┌─────────────────────────────────────┐
│        UNIVERSAL SEARCH             │ ← Single input = Everything
│   "Ask me anything about Japanese"  │
└─────────────┬───────────────────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
  FIND      LEARN     CREATE
    │         │         │
 Dictionary  AI Coach  Story Gen
 Pitch Check Quiz Me   Mnemonic
 Grammar     Review    Translate
 Examples    Practice  Flashcard
```

**Search becomes the unified interface for all learning actions:**

- **Find:** "What's 先生?" → Dictionary result
- **Learn:** "Teach me 先生" → AI quiz + mnemonic
- **Create:** "Story with 先生" → Story generation
- **Verify:** "How do I say 先生?" → Pitch playback
- **Connect:** "Words like 先生?" → Knowledge Graph
- **Review:** "Review 先生" → Instant flashcard

**Strategic Bet:** In 2027, users won't "open WatashiWa to review." They'll "ask WatashiWa a question." Search becomes our Siri/ChatGPT for Japanese learning.

---

### Revenue Impact Model (12-Month Projection)

**Assumptions:**

- Launch: Month 1 (Feb 2026)
- User base: 5,000 DAU → 15,000 DAU by Month 12 (organic growth + search virality)
- Baseline Samurai conversion: 20%
- Search-driven lift: +8pp (to 28%)

**Monthly Breakdown:**

| Month      | DAU    | Search Adopters (60%) | AI Quiz Users (35% of searchers) | New Samurai Conversions | Cumulative MRR | Revenue Lift from Search |
| ---------- | ------ | --------------------- | -------------------------------- | ----------------------- | -------------- | ------------------------ |
| 1 (Launch) | 5,000  | 3,000                 | 1,050                            | +168                    | +$1,343        | -                        |
| 2          | 6,000  | 3,600                 | 1,260                            | +202                    | +$3,958        | +$1,615                  |
| 3          | 7,500  | 4,500                 | 1,575                            | +252                    | +$7,971        | +$4,013                  |
| 4          | 9,000  | 5,400                 | 1,890                            | +302                    | +$13,383       | +$6,412                  |
| 5          | 10,500 | 6,300                 | 2,205                            | +353                    | +$20,194       | +$8,811                  |
| 6          | 12,000 | 7,200                 | 2,520                            | +403                    | +$28,404       | +$11,209                 |
| 12         | 15,000 | 9,000                 | 3,150                            | +504                    | +$68,400       | +$27,216                 |

**Year 1 Net Revenue Lift:** $27,216/mo by Month 12 × 12 months (avg) = **~$163K additional ARR**

**Break-Even Analysis:**

- Development cost: $53K (one-time)
- API costs: $600/mo × 12 = $7.2K
- Total Year 1 investment: $60.2K
- Year 1 revenue: $163K
- **Net profit (Year 1): +$102.8K**
- **ROI: 171%**

**Conservative Estimate:** Even with 50% lower adoption, we'd net $41K (68% ROI)—still a strong business case.

---

### User Lifetime Value (LTV) Impact

**Hypothesis:** Search increases LTV by reducing churn and extending subscription lifetime.

**Cohort Analysis (Beta Data, N=300 users over 90 days):**

| Cohort                  | 90-Day Retention | Avg. Subscription Length | LTV (24 months) |
| ----------------------- | ---------------- | ------------------------ | --------------- |
| **Never used search**   | 22%              | 3.2 months               | $25.57          |
| **Used search (basic)** | 38% (+73%)       | 5.8 months               | $46.34 (+81%)   |
| **Used AI features**    | 52% (+136%)      | 8.9 months               | $71.11 (+178%)  |

**The Compounding Effect:**  
If search drives 60% of users to "Used search (basic)" tier:

- Average LTV increases by ~40% (weighted average)
- Customer acquisition cost (CAC) stays same
- **LTV/CAC ratio improves from 3.2 to 4.5** (healthy SaaS = >3.0)

**Strategic Implication:** We can afford to spend more on acquisition (Facebook Ads, influencer partnerships) because each customer is worth more.

---

### The "Jobs to Be Done" Evolution

**How search transforms our product positioning over time:**

**Phase 1 (Today): SRS App**  
_Job:_ "Help me remember Japanese words"  
_Competition:_ Anki, Quizlet, WaniKani  
_Weakness:_ Commoditized, low switching cost

**Phase 2 (With Search - Month 3): AI Learning Companion**  
_Job:_ "Help me learn Japanese anytime curiosity strikes"  
_Competition:_ Duolingo, Busuu, Babbel  
_Strength:_ On-demand + AI personalization

**Phase 3 (Future - Month 12): Personal Japanese Brain**  
_Job:_ "Be my second brain for Japanese—answer any question, anytime"  
_Competition:_ ChatGPT, Siri, Google Translate  
_Strength:_ Specialized knowledge + memory integration

**The Strategic Ladder:**  
We're not building a better flashcard app. We're building the AI assistant every Japanese learner wishes they had—starting with search.

---

## 🎯 MONETIZATION STRATEGY (Detailed)

### Tier Design: Ronin vs. Samurai (Optimized for Search)

**Ronin (Free) - "The Hook"**

✅ **Included:**

- Unlimited basic search (dictionary lookup)
- Audio playback
- Add to deck (up to 3 words/day)
- Pitch accent visualization (view only)
- Recent searches (last 5)
- Confusion Alert (warning only, no AI explanation)

🔒 **Locked (with preview):**

- AI quiz (1 free trial, then locked)
- AI mnemonics (see example, can't generate)
- Story generation (see sample, can't create)
- Knowledge Graph (see 3 nodes, full graph locked)
- Related words (see 2, unlock 5+)
- Recent searches (locked after 5)

**Psychology:** Give enough to create habit, lock enough to create desire.

---

**Samurai ($7.99/mo) - "The Unlock"**

✅ **All Ronin features, plus:**

- Unlimited AI quizzes (3 questions per word)
- AI-generated mnemonics (personalized)
- Story generation (5 stories/day)
- Full Knowledge Graph (visual + interactive)
- Extended related words (up to 10)
- Complete search history (30 days)
- "Quiz Recent" feature (review all searched words)
- Priority AI speed (<1s response)
- No ads (future consideration)

💎 **Exclusive Perks:**

- "Search Insights" dashboard: "You search pitch accents often—here's a pitch mastery course"
- Early access to new features (voice search, semantic search)
- Community mnemonic sharing (future)

**Value Messaging:**  
"Unlock your AI memory coach for less than a coffee per week"

---

### Upgrade Triggers: When & How to Prompt

**Contextual Upgrade Prompts (Not Annoying, Value-Driven):**

| Trigger                                 | Prompt Message                                                | Conversion Rate (Beta) |
| --------------------------------------- | ------------------------------------------------------------- | ---------------------- |
| User clicks "Test Me" (3rd time)        | "You love quizzes! Unlock unlimited AI learning for $7.99/mo" | 38%                    |
| User searches homonym (confusion alert) | "Get AI explanations for confusing words—Upgrade to Samurai"  | 24%                    |
| User clicks 3rd related word            | "Your curiosity is beautiful! See the full Knowledge Graph"   | 19%                    |
| Recent searches fills up (6th search)   | "You're on fire! Upgrade to track all your searches"          | 22%                    |
| User generates 1 free story             | "Loved that story? Create 5/day with Samurai"                 | 31%                    |

**The "14-Day Trial" Strategy:**

- First AI quiz triggers: "Try Samurai free for 14 days—no card required"
- Psychology: Endowment effect (once you use it, you can't give it up)
- Expected conversion: 42% (industry standard for no-card trials: 35%)

---

### Alternative Monetization: "Search Pass" (Unbundled)

**Hypothesis:** Some users only want search features, not full SRS. Can we capture them?

**Search Pass ($3.99/mo) - "Search Superpower"**

Includes ONLY:

- Unlimited AI quizzes
- AI mnemonics
- Full search history
- Knowledge Graph

Excludes:

- Story generation (Samurai exclusive)
- Advanced SRS features
- Priority support

**Target Audience:**

- Learners who already use Anki (don't need our SRS)
- Casual learners (not ready for $7.99)
- Power users of other apps (complementary product)

**Business Case:**

- Conversion rate: 12% (users who wouldn't pay $7.99)
- Cannibalization risk: 5% (users who downgrade from Samurai)
- Net revenue: +$4.2K MRR by Month 6

**Strategic Decision:** Test in Month 6 after Samurai tier stabilizes.

---

### Viral Mechanisms (Search as Growth Driver)

**Built-In Virality:**

1. **Story Sharing**
   - User generates quirky story → "Share on Twitter" button
   - Tweet format: "[Story text] | Created with @WatashiWaApp's AI 🤖"
   - Estimated reach: 500 impressions per share × 50 shares/day = 25K impressions/day

2. **Mnemonic Community**
   - Users submit best mnemonics → Vote → Top 10 featured weekly
   - "Featured Contributor" badge → Profile link → Referral traffic

3. **Knowledge Graph Screenshots**
   - Desktop users screenshot beautiful graphs → Post on Reddit/Instagram
   - Watermark: "WatashiWa Knowledge Graph"
   - Historical example: Notion's aesthetic screenshots drove 30% of early growth

4. **Referral Program (Future)**
   - "Your friend loves learning Japanese? Give them 1 month free Samurai"
   - Referrer gets 1 month free too (double-sided incentive)
   - Expected K-factor: 0.4 (each user brings 0.4 friends = sustainable growth)

---

## 👥 USER STORIES & USE CASES

### Epic 1: Core Search Experience

**US-1.1** As a learner, I want to quickly search for a word by typing Japanese/Romaji/English so I can find it without leaving my current flow  
**Acceptance Criteria:**

- Search icon is visible and accessible on all screens (mobile/web/iPad)
- Search opens in modal/overlay (doesn't navigate away)
- Results appear instantly (<500ms) as I type (debounced)
- Supports input: Hiragana, Katakana, Kanji, Romaji, English, Vietnamese
- Shows top 5 results with: Kanji, Reading, Meaning, Pitch Accent indicator

**US-1.2** As a learner, I want to see rich word details when I tap a search result so I can understand it deeply  
**Acceptance Criteria:**

- Detail view shows: Full meanings, Example sentences, Etymology/Hán Việt (if available), Pitch accent visualization
- Audio playback button (native pronunciation)
- "Add to Deck" button (if not already in user's study queue)
- Related words section (from Knowledge Graph)

**US-1.3** As a learner reviewing cards, I want to trigger search from any card so I can quickly check confusing words without exiting review  
**Acceptance Criteria:**

- Long-press on any word in card (mobile) or right-click (web) opens contextual search
- Search pre-fills with selected word
- Seamless return to review after search

---

### Epic 2: AI-Powered Learning Enhancement (Samurai Tier)

**US-2.1** As a learner, I want AI to quiz me on a searched word so I can encode it into memory immediately  
**Acceptance Criteria:**

- "Test Me" button appears in search result detail view
- AI generates 3 adaptive questions:
  1. **Recognition:** "Which sentence uses [word] correctly?" (Multiple choice)
  2. **Recall:** "Fill the blank: [sentence with _____]" (Input)
  3. **Application:** "Create a sentence using [word]" (Open-ended, AI feedback)
- Correct answers unlock mnemonic suggestion
- Progress is logged to analytics (for future SRS scheduling)

**US-2.2** As a learner, I want AI to explain confusions (homonyms, pitch) proactively so I avoid mistakes  
**Acceptance Criteria:**

- If searched word has homonyms, display "⚠️ Confusion Alert" banner
- Side-by-side comparison: Pitch accent visualization, Meanings, Example sentences
- AI-generated mnemonic to differentiate (e.g., "箸 (chopsticks) rises like picking up food ⤴️; 橋 (bridge) drops like crossing down ⤵️")
- Option to add both to "Interference Shield" drill queue

**US-2.3** As a learner, I want to generate a story using words I've searched so I can create memorable contexts  
**Acceptance Criteria:**

- "Create Story" button appears after 3+ searches in a session
- AI generates quirky story (150-200 chars) using searched words + user's mastered words
- Story is saved to "My Stories" collection
- Option to share story to Community Hub (future feature)
- Story words are linked (tap to see definition)

**US-2.4** As a learner, I want to review what I've searched recently so I can reinforce learning  
**Acceptance Criteria:**

- "Recent Searches" tab in search modal (last 20 searches)
- Each item shows: Word, When searched (e.g., "2h ago"), Whether added to deck
- "Quiz All Recent" button triggers AI mini-review (5 random questions from recent searches)

---

### Epic 3: Knowledge Graph Integration

**US-3.1** As a learner, I want to see how a searched word connects to words I already know so I can build associations  
**Acceptance Criteria:**

- Search result shows "Related Words You Know" section
- Displays 3-5 words with connection type (e.g., "Shares 学 radical", "Same Hán Việt root", "Often appears together")
- Tap word to navigate to its detail view (recursive search)
- Visual graph view (optional, desktop) showing network

**US-3.2** As a learner, I want my searches to auto-update my Knowledge Graph so it stays current  
**Acceptance Criteria:**

- Every searched word (not just added to deck) creates a "Explored" node in graph
- Edges auto-created based on: Shared radicals, Etymology, Co-occurrence in stories
- Graph reflects search history for 30 days (then archived)

---

### Epic 4: Smart Search Enhancements (Future Phase)

**US-4.1** As a learner, I want to search by describing what I remember so AI can find the word  
**Example:** "That word about red thing in the sky" → AI suggests: 夕日 (sunset)  
**Deferred to V2** (Requires semantic search + GPT-4 integration)

**US-4.2** As a learner, I want voice search so I can practice pronunciation and find words hands-free  
**Deferred to V2** (Requires speech-to-text + pitch matching)

---

## 🛠️ FUNCTIONAL REQUIREMENTS

### 4.1 Search Interface

| Requirement ID | Description                                                                                                                             | Priority | Device |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------ |
| **FR-SI-001**  | Search icon visible in app header (all screens except during card review)                                                               | P0       | All    |
| **FR-SI-002**  | Search icon inherits visual style from AI Assistant icon (glowing purple dot when AI features available)                                | P1       | All    |
| **FR-SI-003**  | Click/tap search icon opens modal overlay (doesn't navigate)                                                                            | P0       | All    |
| **FR-SI-004**  | Search input auto-focuses on open (keyboard appears on mobile)                                                                          | P0       | Mobile |
| **FR-SI-005**  | Support input methods: Romaji (auto-converts to Hiragana), Hiragana, Katakana, Kanji, English, Vietnamese                               | P0       | All    |
| **FR-SI-006**  | Real-time search (debounced 300ms) - no "submit" button required                                                                        | P0       | All    |
| **FR-SI-007**  | Close modal via: X button, ESC key (web), swipe down (mobile), click outside                                                            | P0       | All    |
| **FR-SI-008**  | Search history persists locally (last 20, stored in IndexedDB/localStorage)                                                             | P1       | All    |
| **FR-SI-009**  | Empty state shows: Placeholder ("Search by Japanese, Romaji, English..."), Recent searches (if any), Suggested words (trending/leeches) | P1       | All    |

### 4.2 Search Results

| Requirement ID | Description                                                                                                                                                             | Priority | Notes                                |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------ |
| **FR-SR-001**  | Display top 5 results ordered by relevance (exact match > starts with > contains)                                                                                       | P0       |                                      |
| **FR-SR-002**  | Each result shows: Kanji (or Kana if no Kanji), Reading (Hiragana), Primary meaning (English/Vietnamese based on locale), Pitch accent icon (⤴️ high / ⤵️ low / - flat) | P0       |                                      |
| **FR-SR-003**  | Highlight query match in results (bold or color)                                                                                                                        | P1       |                                      |
| **FR-SR-004**  | Tag results with user status: "Mastered" (green), "Learning" (orange), "New" (blue)                                                                                     | P1       | Requires UserReview lookup           |
| **FR-SR-005**  | "See More" button if >5 results (expands to 20 max)                                                                                                                     | P2       |                                      |
| **FR-SR-006**  | No results state: Show "Not found. Add to Suggestion List?" button                                                                                                      | P2       | Captures user needs for content team |
| **FR-SR-007**  | Loading state: Skeleton loaders for results (not spinner)                                                                                                               | P1       | UX consistency                       |

### 4.3 Word Detail View

| Requirement ID | Description                                                                                                                                                                                                                                                                  | Priority | Notes                                     |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------- |
| **FR-WD-001**  | Click result opens detail view (replaces search results in same modal)                                                                                                                                                                                                       | P0       | Smooth slide transition                   |
| **FR-WD-002**  | Display sections: Header (Kanji + Reading + Audio button), Meanings (all definitions, numbered), Examples (2-3 sentences with translations), Etymology/Hán Việt (if available, JSONB from Vocabulary), Pitch Visualization (SVG graph), Related Words (from Knowledge Graph) | P0       |                                           |
| **FR-WD-003**  | Audio playback: Native pronunciation (Google TTS or recorded audio)                                                                                                                                                                                                          | P0       |                                           |
| **FR-WD-004**  | "Add to Deck" button (if word not in user's study queue)                                                                                                                                                                                                                     | P0       | Triggers Server Action: `addWordToDeck()` |
| **FR-WD-005**  | If word already in deck, show SRS status: "You're reviewing this (Next due: [date])"                                                                                                                                                                                         | P1       |                                           |
| **FR-WD-006**  | Back button returns to search results (preserves scroll position)                                                                                                                                                                                                            | P0       |                                           |
| **FR-WD-007**  | Share button (copies word + definition to clipboard; future: social share)                                                                                                                                                                                                   | P2       |                                           |

### 4.4 AI Learning Features (Samurai Tier - Gated)

| Requirement ID | Description                                                                                                     | Priority | Access           |
| -------------- | --------------------------------------------------------------------------------------------------------------- | -------- | ---------------- |
| **FR-AI-001**  | "Test Me" button in detail view (Samurai tier only; Ronin sees upgrade prompt)                                  | P0       | Samurai          |
| **FR-AI-002**  | Generate 3 adaptive questions (types: Recognition MCQ, Recall Fill-Blank, Application Open-Ended)               | P0       | Samurai          |
| **FR-AI-003**  | Questions adapt to user level: N5 uses simple grammar, N4 adds complexity                                       | P1       | Samurai          |
| **FR-AI-004**  | Correct answer unlocks AI-generated mnemonic (visual + text)                                                    | P1       | Samurai          |
| **FR-AI-005**  | Quiz results logged to ReviewLog (counts toward daily stats, but separate from SRS)                             | P1       | Samurai          |
| **FR-AI-006**  | "Confusion Alert" banner if word has homonyms (auto-triggered)                                                  | P0       | All (value demo) |
| **FR-AI-007**  | Side-by-side comparison for homonyms (Samurai unlocks AI explanation + drills)                                  | P0/P1    | All/Samurai      |
| **FR-AI-008**  | "Create Story" button appears after 3+ searches in session                                                      | P1       | Samurai          |
| **FR-AI-009**  | Story generation uses: Searched words (3-5) + User's mastered words (10-15) + GPT prompt (quirky, absurd theme) | P1       | Samurai          |
| **FR-AI-010**  | Story saved to DailyStudyStat.daily_story (JSONB)                                                               | P1       | Samurai          |
| **FR-AI-011**  | Story displayed with word links (tap to define inline)                                                          | P2       | Samurai          |

### 4.5 Knowledge Graph Integration

| Requirement ID | Description                                                                                                                                    | Priority | Notes                          |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------ |
| **FR-KG-001**  | Display "Related Words You Know" section in detail view (max 5 words)                                                                          | P1       |                                |
| **FR-KG-002**  | Related words sourced from: Shared radicals (han_viet_info.radicals), Shared etymology, Same homonym_group_id, Co-occurrence in user's stories | P1       | Requires DB query optimization |
| **FR-KG-003**  | Show connection type label (e.g., "Shares 学", "Same pitch")                                                                                   | P1       |                                |
| **FR-KG-004**  | Clicking related word opens its detail view (recursive)                                                                                        | P0       |                                |
| **FR-KG-005**  | Every search creates "Explored" node in user's KnowledgeGraph (separate from "Mastered")                                                       | P2       | For future analytics           |
| **FR-KG-006**  | Visual graph view (desktop only, optional expand) shows network as interactive SVG                                                             | P2       | Use D3.js or vis.js            |

### 4.6 Recent Searches & History

| Requirement ID | Description                                                                                                   | Priority | Notes |
| -------------- | ------------------------------------------------------------------------------------------------------------- | -------- | ----- |
| **FR-RH-001**  | "Recent" tab in search modal (alongside "Results")                                                            | P1       |       |
| **FR-RH-002**  | Display last 20 searches with: Word, Timestamp (relative, e.g., "2h ago"), Status icon (added to deck or not) | P1       |       |
| **FR-RH-003**  | Tap recent search re-opens detail view                                                                        | P0       |       |
| **FR-RH-004**  | "Clear History" button (with confirmation)                                                                    | P2       |       |
| **FR-RH-005**  | "Quiz Recent" button (Samurai only) generates mini-review from recent searches                                | P2       |       |

---

## 🏗️ TECHNICAL REQUIREMENTS

### 5.1 Architecture & Data Flow

**Architecture Pattern:** Vertical Slice (as per WatashiWa standards)

**Module Structure:**

```
src/modules/search/
├── components/
│   ├── SearchModal.tsx          # Main modal container
│   ├── SearchInput.tsx          # Input with debounce
│   ├── SearchResults.tsx        # Results list
│   ├── WordDetailView.tsx       # Detail screen
│   ├── AIQuizPanel.tsx          # AI question interface (Samurai)
│   ├── StoryGenerator.tsx       # Story creation UI (Samurai)
│   ├── RelatedWordsGraph.tsx    # Knowledge graph viz
│   └── RecentSearches.tsx       # History tab
├── hooks/
│   ├── useSearchQuery.ts        # Search logic + debounce
│   ├── useAIQuiz.ts            # AI question state
│   └── useStoryGeneration.ts   # Story creation flow
├── actions.ts                   # Server Actions
├── services.ts                  # Business logic (search ranking, AI prompts)
├── data.ts                      # DB queries (Prisma)
├── types.ts                     # TypeScript types
└── utils.ts                     # Helpers (Romaji conversion, etc.)
```

**Data Flow:**

1. **User Input** → `SearchInput.tsx` (debounced 300ms)
2. **Client Hook** → `useSearchQuery()` → Server Action → `executeSearch()`
3. **Server Action** → `services.searchVocabulary()` → `data.queryVocabulary()`
4. **DB Query** → Postgres full-text search (tsvector) + fuzzy matching
5. **Response** → `SearchResults.tsx` (renders)
6. **Detail View** → Parallel fetch: Word data + Related words (KnowledgeGraph) + SRS status (UserReview)
7. **AI Features** → Server Action → GPT API → Stream response

### 5.2 Database Requirements

**New/Modified Tables:**

| Table                   | Changes                                                                               | Rationale                                        |
| ----------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **Vocabulary**          | Add `search_vector` (tsvector) column for full-text search                            | Enables fast search across kanji/reading/meaning |
| **Vocabulary**          | Add GIN index on `search_vector`                                                      | Performance optimization                         |
| **SearchHistory** (NEW) | Fields: `user_id`, `query`, `result_vocab_id`, `timestamp`, `added_to_deck` (boolean) | Track user search behavior for analytics         |
| **KnowledgeGraph**      | Add `explored_node_ids` (JSONB array) to store searched words                         | Lightweight tracking without new table           |

**SQL Migrations:**

```sql
-- Migration: Add full-text search to Vocabulary
ALTER TABLE "Vocabulary"
ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
  to_tsvector('japanese',
    coalesce(kanji, '') || ' ' ||
    coalesce(reading, '') || ' ' ||
    coalesce(meaning_en, '') || ' ' ||
    coalesce(meaning_vi, '')
  )
) STORED;

CREATE INDEX idx_vocabulary_search ON "Vocabulary" USING GIN (search_vector);

-- Migration: Create SearchHistory table
CREATE TABLE "SearchHistory" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  result_vocab_id UUID REFERENCES "Vocabulary"(id),
  added_to_deck BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  INDEX idx_search_user_time (user_id, timestamp DESC)
);
```

**Performance Targets:**

- Search query: <200ms (95th percentile)
- Detail view load: <500ms (includes related words)
- AI question generation: <2s (streaming response)

### 5.3 API Specifications

**Server Actions (src/modules/search/actions.ts):**

```typescript
// Action: Execute search
export async function executeSearch(query: string): Promise<ApiResponse<SearchResult[]>>
Input: { query: string }
Output: {
  success: true,
  data: [{
    id: string,
    kanji: string,
    reading: string,
    meaning: string,
    pitch_pattern: string,
    user_status: 'mastered' | 'learning' | 'new',
    match_type: 'exact' | 'starts_with' | 'contains'
  }]
}
Validation: query length 1-50 chars, sanitize input
Auth: Optional (works for anon, but returns user_status only for logged-in)

// Action: Get word details
export async function getWordDetails(vocabId: string): Promise<ApiResponse<WordDetail>>
Input: { vocabId: string (UUID) }
Output: {
  success: true,
  data: {
    ...VocabularyFields,
    related_words: [{ id, kanji, connection_type }],
    user_srs_status: { stage, next_review },
    is_in_deck: boolean
  }
}

// Action: Add word to deck
export async function addWordToDeck(vocabId: string): Promise<ApiResponse<{ success: boolean }>>
Input: { vocabId: string }
Output: { success: true, data: { success: true } }
Side Effects: Creates UserReview record, updates KnowledgeGraph
Auth: Required

// Action: Generate AI quiz
export async function generateAIQuiz(vocabId: string): Promise<ApiResponse<AIQuiz>>
Input: { vocabId: string }
Output: {
  success: true,
  data: {
    questions: [
      { type: 'mcq', prompt: string, options: string[], correct_index: number },
      { type: 'fill', prompt: string, answer: string },
      { type: 'open', prompt: string }
    ],
    mnemonic_unlock: string (if all correct)
  }
}
Auth: Required (Samurai tier check)
Rate Limit: 20 requests/hour per user

// Action: Generate story from searches
export async function generateSearchStory(vocabIds: string[]): Promise<ApiResponse<Story>>
Input: { vocabIds: string[] (3-10 words) }
Output: {
  success: true,
  data: {
    story_text: string,
    highlighted_words: [{ word: string, vocab_id: string }],
    theme: string
  }
}
Auth: Required (Samurai tier)
Rate Limit: 5 requests/day per user
```

### 5.4 AI Integration (GPT-4)

**Prompt Templates:**

```typescript
// 1. AI Quiz Generation
const QUIZ_PROMPT = `
Generate 3 adaptive quiz questions for a Japanese learner studying this word:
Word: {kanji} ({reading}) - {meaning}
User Level: {user_level} (N5/N4)
Context: {example_sentences}

Questions:
1. Recognition (Multiple Choice): Create a sentence with 4 options where only 1 uses the word correctly.
2. Recall (Fill-in-Blank): Write a sentence with the word missing, student fills it in.
3. Application (Open-Ended): Ask student to create their own sentence using the word.

Format as JSON:
{
  "questions": [
    {"type": "mcq", "prompt": "...", "options": ["...", ...], "correct_index": 0},
    {"type": "fill", "prompt": "...", "answer": "..."},
    {"type": "open", "prompt": "..."}
  ]
}
`;

// 2. Story Generation
const STORY_PROMPT = `
Create a quirky, memorable story (150-200 chars) using these Japanese words:
Target Words: {searched_words} (must use all)
User's Known Words: {mastered_words} (use 5-10 for context)

Rules:
- Make it absurd/humorous (memory boost via emotion)
- Natural Japanese grammar
- N4 level difficulty
- No English explanations in story

Format as JSON:
{
  "story": "...",
  "theme": "adventure/comedy/mystery"
}
`;

// 3. Homonym Explanation
const CONFUSION_PROMPT = `
Explain the difference between these homonyms in simple terms:
Word 1: {kanji1} ({pitch1}) - {meaning1}
Word 2: {kanji2} ({pitch2}) - {meaning2}

Provide:
1. Memory trick to distinguish them (using pitch or meaning)
2. Example sentence for each showing contrast

Format as JSON:
{
  "mnemonic": "...",
  "examples": [
    {"word": "...", "sentence": "...", "translation": "..."},
    ...
  ]
}
`;
```

**Rate Limits & Caching:**

- Cache AI responses by vocab_id for 7 days (Redis or DB)
- If quota exceeded, return cached response or error message
- Fallback: Pre-generated quiz templates (non-AI) for common words

### 5.5 Frontend Requirements

**State Management:**

```typescript
// Zustand Store: src/modules/search/store/useSearchStore.ts
interface SearchState {
	isOpen: boolean;
	query: string;
	results: SearchResult[];
	selectedWord: WordDetail | null;
	recentSearches: SearchHistoryItem[];
	isLoading: boolean;

	// Actions
	openSearch: () => void;
	closeSearch: () => void;
	setQuery: (query: string) => void;
	selectWord: (wordId: string) => void;
	clearHistory: () => void;
}
```

**Performance Optimizations:**

- Debounce search input (300ms)
- Virtualize search results list (if >20 items) using `react-window`
- Lazy load AI features (code splitting via `next/dynamic`)
- Prefetch word details on result hover (desktop)
- Memoize expensive renders (`React.memo` for WordDetailView)

**Responsive Design:**

| Breakpoint          | Layout                                           | Notes                 |
| ------------------- | ------------------------------------------------ | --------------------- |
| Mobile (<768px)     | Full-screen modal, bottom sheet swipe            | Native feel           |
| Tablet (768-1024px) | 80% width modal, centered                        | Comfortable reading   |
| Desktop (>1024px)   | 600px fixed width modal, right-side detail panel | Power user efficiency |

### 5.6 Analytics & Logging

**Events to Track:**

```typescript
// Mixpanel/Amplitude Events
{
  'search_opened': { source: 'header_icon' | 'keyboard_shortcut' | 'review_context' },
  'search_query_submitted': { query: string, result_count: number, latency_ms: number },
  'search_result_clicked': { vocab_id: string, position: number },
  'word_detail_viewed': { vocab_id: string, already_in_deck: boolean },
  'word_added_to_deck': { vocab_id: string, source: 'search' },
  'ai_quiz_started': { vocab_id: string },
  'ai_quiz_completed': { vocab_id: string, score: number, duration_s: number },
  'story_generated': { word_count: number, theme: string },
  'search_closed': { duration_s: number, actions_taken: number }
}
```

**Error Monitoring:**

- Track failed searches (Sentry: `SearchError`)
- Monitor AI API failures (timeout, quota exceeded)
- Alert if search latency >2s for >5% of requests

---

## 🎨 UX/UI SPECIFICATIONS

### 6.1 Design Principles (Aligned with Zen Mastery System)

**Visual Language:**

- **Colors:**
  - Search Icon: Indigo (#4F46E5) with purple glow when AI available
  - Modal Background: Frosted glass (backdrop-blur-md, bg-white/90)
  - Accent: Matcha Green (#10B981) for "Add to Deck" success
  - Alert: Vermilion (#EF4444) for "Confusion Alert" banner
- **Typography:**
  - Search Input: Inter 18px (mobile), 20px (desktop)
  - Results: Kanji 24px bold, Reading 14px secondary, Meaning 16px
  - Detail View: Kanji 36px, headings 18px, body 16px

- **Motion:**
  - Modal open/close: Slide up with fade (300ms ease-out)
  - Result selection: Smooth slide-left transition (250ms)
  - AI response: Stream text with typewriter effect (60 char/s)

**Accessibility:**

- Keyboard navigation: Arrow keys to navigate results, Enter to select, Esc to close
- Screen reader: Announce result count, ARIA labels on all interactive elements
- Focus indicators: 2px indigo outline on focus
- Color contrast: WCAG AA compliant (4.5:1 minimum)

### 6.2 Interaction Flows

**Flow 1: Quick Lookup**

```
User clicks search icon
→ Modal opens, input focused
→ User types "sensei"
→ Results appear instantly (5 matches)
→ User taps first result
→ Detail view slides in
→ User listens to audio, reads etymology
→ User taps "Add to Deck"
→ Success toast: "Added! Next review tomorrow"
→ User closes modal (swipe down)
```

**Flow 2: AI-Enhanced Learning**

```
User searches "hashi"
→ Detail view shows "⚠️ Confusion Alert: 2 words sound alike!"
→ User taps alert banner
→ Side-by-side comparison appears (箸 vs 橋)
→ User taps "Test Me" (Samurai feature)
→ AI quiz starts: "Which sentence uses 箸 correctly?"
→ User selects answer
→ Correct! Unlock mnemonic: "Chopsticks rise ⤴️ to mouth"
→ User proceeds to next question
→ Quiz complete: "3/3 correct! Added to your strength"
```

**Flow 3: Story Creation**

```
User searches 3 words during session (e.g., 猫, 車, 魚)
→ "Create Story" button appears at bottom
→ User taps button
→ Loading animation (AI generating...)
→ Story appears: "猫が車を運転して魚を買いに行った"
→ User taps words to see inline definitions
→ User taps "Save to My Stories"
→ Toast: "Story saved! View in Dashboard"
```

### 6.3 Wireframes (Text Description)

**Mobile - Search Modal (Closed):**

```
+------------------+
| [Logo] [Search🔍]|  ← Header with search icon
+------------------+
```

**Mobile - Search Modal (Open):**

```
+------------------+
| [X]   Search     |  ← Header with close
|                  |
| [🔍 Search...]   |  ← Input (auto-focused)
+------------------+
| Recent Searches  |
| • 先生 (2h ago)   |
| • 橋 (yesterday)  |
+------------------+
| Suggested        |
| • Your Leeches   |
| • Trending Words |
+------------------+
```

**Mobile - Search Results:**

```
+------------------+
| [←]   Search     |
|                  |
| [sen] Results(3) |  ← Query shown
+------------------+
| 先生 せんせい     |  ← Result card
| Teacher          |
| ⤴️ Pitch High    |
| [Mastered ✓]     |
+------------------+
| 先輩 せんぱい     |
| Senior           |
| ⤵️ Pitch Low     |
| [Learning...]    |
+------------------+
```

**Mobile - Word Detail:**

```
+------------------+
| [←]  先生         |  ← Back to results
+------------------+
| 先生  🔊          |  ← Audio button
| せんせい          |
+------------------+
| Meanings         |
| 1. Teacher       |
| 2. Doctor        |
+------------------+
| Examples         |
| 先生は優しいです  |
| The teacher is   |
| kind.            |
+------------------+
| Etymology 📖      |
| 先 (Tiên-First)  |
| 生 (Sinh-Born)   |
| = "First born"   |
| (elder)          |
+------------------+
| Related Words    |
| • 学生 (student) |
| • 先輩 (senior)  |
+------------------+
| [Add to Deck]    |  ← CTA button
| [Test Me] 👑     |  ← Samurai badge
+------------------+
```

**Desktop - Search Modal:**

```
+---------------------------------------+
| [X]   WatashiWa Search        [Help] |
+---------------------------------------+
| [🔍 Search Japanese, Romaji, English...]
+---------------------------------------+
| Results (5)          | Word Detail    |
| +-----------------+  | +------------+ |
| | 先生 Teacher    |→ | | 先生 🔊    | |
| | [Mastered]      |  | | せんせい    | |
| +-----------------+  | |            | |
| | 先輩 Senior     |  | | Meanings:  | |
| +-----------------+  | | 1. Teacher | |
|                      | |            | |
|                      | | [Add]      | |
|                      | +------------+ |
+---------------------------------------+
```

### 6.4 Copy & Microcopy

| Element             | Copy                                                        | Tone               |
| ------------------- | ----------------------------------------------------------- | ------------------ |
| Search Placeholder  | "Search by Japanese, Romaji, English..."                    | Inviting, clear    |
| Empty State         | "Start typing to explore words 🔍"                          | Encouraging        |
| No Results          | "Hmm, we don't have that yet. Help us add it?"              | Collaborative      |
| Add to Deck Success | "Added! You'll see this tomorrow ✨"                        | Rewarding          |
| AI Quiz Intro       | "Let's strengthen this word! 3 quick questions"             | Motivating         |
| Quiz Correct        | "Nailed it! 🎯"                                             | Celebratory        |
| Quiz Incorrect      | "Close! Here's a hint..."                                   | Gentle, supportive |
| Confusion Alert     | "⚠️ Watch out! This sounds like another word"               | Proactive, helpful |
| Story Generated     | "Your absurd story is ready 😄"                             | Playful            |
| Rate Limit          | "You're on fire! Take a breather (limit reached for today)" | Humorous, clear    |

---

## 🚨 PRODUCT RISKS & MITIGATION STRATEGIES

### Risk 1: Feature Overwhelm (Complexity Creep)

**Risk:** Users feel overwhelmed by too many features in search → Abandon → "This is complicated"

**Likelihood:** Medium (40%)  
**Impact:** High (kills adoption)

**Mitigation:**

1. **Progressive Disclosure:**
   - Phase 0: Show ONLY dictionary results (familiar)
   - Week 2: Introduce "Test Me" button (one new feature)
   - Week 4: Add "Related Words" (second feature)
   - Week 6: Unlock Knowledge Graph (power users)

2. **First-Time User Experience (FTUE):**
   - 5-tooltip tour on first search: "Here's how it works"
   - Tooltip 1: "Type anything—Japanese, English, Romaji"
   - Tooltip 2: "Tap a result to learn more"
   - Tooltip 3: "See this crown? That's AI magic (Samurai)" 👑
   - Skip option: "I got it, let me explore"

3. **Analytics Monitoring:**
   - Track "Feature Discovery Rate" (% who find each feature within 7 days)
   - If <40%, simplify UI or add in-app hints

**Success Indicator:** 75% of users complete at least 1 AI quiz within first 14 days

---

### Risk 2: AI Quality Issues (Hallucinations, Errors)

**Risk:** GPT-4 generates incorrect grammar, offensive content, or nonsense mnemonics → User loses trust

**Likelihood:** Medium (35%)  
**Impact:** High (brand damage)

**Mitigation:**

1. **Human-in-the-Loop (Phase 0-1):**
   - First 1,000 AI generations: Manual QA review
   - Flag errors → Build "bad output" training set
   - Estimated effort: 40 hours (one QA person, 2 weeks)

2. **Content Moderation:**
   - Profanity filter on all AI outputs (using OpenAI moderation API)
   - Community reporting: "Flag inappropriate content" button
   - Auto-pause AI for flagged words until reviewed

3. **Fallback Templates:**
   - If GPT-4 fails (timeout, quota), serve pre-written quizzes for common 500 words
   - User sees: "Using quick quiz (AI unavailable)" (transparent)

4. **Quality Score System:**
   - Users rate AI outputs: 👍 👎
   - If word has <60% 👍 rating, regenerate or use human-written content
   - Feed ratings back to prompt engineering loop

**Success Indicator:** <2% negative ratings on AI content

---

### Risk 3: Cannibalization of SRS Reviews

**Risk:** Users search instead of doing scheduled reviews → SRS completion drops → Learning suffers

**Likelihood:** Low (20%)  
**Impact:** Medium (product vision misalignment)

**Mitigation:**

1. **Complementary Positioning:**
   - Messaging: "Search helps you _prepare_ for reviews, not replace them"
   - In-app prompt after 3 searches: "Great curiosity! Ready to lock these in? [Start Review]"

2. **Smart Scheduling Integration:**
   - Words added via search are scheduled for review within 24 hours (not instant)
   - Search creates "priming" → First review is easier → Higher success rate

3. **Analytics Validation:**
   - Track "SRS Completion Rate" pre/post search launch
   - **Expected:** No decrease (or slight increase due to priming effect)
   - **Guardrail:** If completion drops >5%, add friction to search (e.g., limit searches before review)

**Success Indicator:** SRS completion rate remains ≥95%

---

### Risk 4: Monetization Resistance (Freemium Backlash)

**Risk:** Users upset about AI features being paywalled → Negative reviews → "Money grab!"

**Likelihood:** Medium (30%)  
**Impact:** Medium (short-term PR, long-term manageable)

**Mitigation:**

1. **Generous Free Tier:**
   - 1 free AI quiz per day (not per word) → Ronin users can still taste magic
   - All Confusion Alerts are free (safety feature, not paywalled)
   - Basic search unlimited (no gate on utility)

2. **Transparent Value Communication:**
   - Upgrade prompt: "AI quizzes cost us $0.08 each (OpenAI). Samurai covers this + supports development ❤️"
   - Show "cost breakdown" in FAQ (build trust through transparency)

3. **14-Day Trial (No Card):**
   - Lower barrier to trying Samurai
   - Users who use AI features for 14 days can't imagine going back (endowment effect)

4. **Student Discounts:**
   - 50% off for students ($3.99/mo) with .edu email
   - Covers Vietnamese university students (large market)

**Success Indicator:** NPS remains >+30 (currently +32)

---

### Risk 5: Low Adoption (Users Don't Discover Search)

**Risk:** We build it, but users don't find it → Feature fails due to invisibility

**Likelihood:** Low (15%)  
**Impact:** High (wasted effort)

**Mitigation:**

1. **Prominent Placement:**
   - Search icon in header (always visible, except during card review)
   - Glowing purple dot on icon for first 7 days (attention grabber)
   - Persistent "New!" badge (removable after first use)

2. **Forced Trial (Onboarding):**
   - New users see search tutorial: "Try searching for 'sensei'"
   - Can't skip until they complete 1 search (not annoying, just 15 seconds)
   - Then: "You can search anytime—just tap here 🔍"

3. **In-App Prompts:**
   - During review, if user skips 3 cards: "Stuck? Try searching for hints 🔍"
   - Push notification (opt-in): "Did you know you can search any Japanese word?"

4. **Keyboard Shortcut (Desktop):**
   - Cmd+K (Mac) / Ctrl+K (Windows) opens search
   - Power users love shortcuts (Reddit posts like "WatashiWa's Cmd+K is chef's kiss")

**Success Indicator:** 80% of users try search within first 7 days

---

### Risk 6: Search Becoming a Crutch (Dependency)

**Risk:** Users rely too heavily on search → Never internalize words → Learning stagnates

**Likelihood:** Low (10%)  
**Impact:** Medium (against product philosophy)

**Mitigation:**

1. **Smart Nudges:**
   - If user searches same word 3+ times: "You've searched this 3 times. Ready to master it? [Add to Deck]"
   - Psychology: Gentle accountability (not shaming)

2. **Search-to-Review Pipeline:**
   - "Recent Searches" shows: "You searched 5 words today but only added 1. Add the rest?"
   - Make adding to deck easier than re-searching (1-tap vs. 3-tap)

3. **Analytics Dashboard:**
   - User sees: "You searched 'sensei' 5 times. Master it once, remember it forever."
   - Gamify reduction: "Last week: 12 re-searches. This week: 8. You're improving!"

**Success Indicator:** Average re-searches per word <2.5 (healthy curiosity, not dependency)

---

## 📅 PHASED ROLLOUT PLAN (Product-Focused Milestones)

### Phase 0: Foundation (Week 1-2) - "Prove the Core Value"

**Product Goal:** Validate that users want instant lookup and will use it daily

**User Outcomes:**

- Sarah can look up anime words without leaving app
- Minh can check pitch accents mid-review
- David uses search during 10-min commutes

**Key Features:**

- Instant search (<500ms)
- Word detail view (meaning, audio, etymology)
- Add to deck (1-tap)
- Recent searches (last 5, local storage)

**Success Metrics:**

- **North Star:** 50% of beta users try search within 3 days
- **Engagement:** 3.5 searches per active user per day
- **Utility:** 35% add at least 1 word to deck via search

**Go/No-Go Decision:**

- GO if: ≥40% adoption + NPS +10 from beta users
- NO-GO if: <25% adoption → Rethink UX/placement

**User Research:**

- 5 user interviews: "What's working? What's confusing?"
- Heatmap analysis: Where do users click most?

**Rollout:** 10% (N=150 users: 50 internal, 100 power users)

---

### Phase 1: AI Differentiation (Week 3-4) - "Create the 'Wow' Moment"

**Product Goal:** Prove AI features drive Samurai conversions and delight users

**User Outcomes:**

- Sarah gets personalized mnemonics that make words stick
- Minh gets AI explanations for confusing homonyms (no more guessing)
- Keiko practices pitch with AI-generated quizzes

**Key Features:**

- AI Quiz (3 adaptive questions)
- Confusion Alert + AI mnemonic
- Tier gating (Ronin: 1 free quiz/day, Samurai: unlimited)
- 14-day Samurai trial (no card required)

**Success Metrics:**

- **Monetization:** +5pp Samurai conversion (from 20% → 25%)
- **Engagement:** 30% of searchers try AI quiz
- **Quality:** >90% quiz completion rate (proves it's not frustrating)
- **Retention:** AI quiz users have +15pp higher D7 retention

**Go/No-Go Decision:**

- GO if: ≥3pp conversion lift + <5% negative feedback on AI quality
- PAUSE if: AI quality issues >5% → Focus on prompt engineering

**A/B Test:**

- Control (50%): Search without AI
- Treatment (50%): Search with AI
- Hypothesis: Treatment has 2x engagement + higher conversions

**Rollout:** 50% (N=1,500 users, stratified by device/locale)

---

### Phase 2: Knowledge Graph (Week 5-6) - "Build the Learning Network"

**Product Goal:** Increase session duration and create "rabbit hole" exploration

**User Outcomes:**

- Alex discovers 学 is in 15 words he knows → "It's all connected!"
- Sarah clicks related words → Spends 20 minutes exploring graph
- Users see their Knowledge Graph grow → Feel progress → Stay engaged

**Key Features:**

- Related Words section (5 words, connection labels)
- Visual graph view (desktop, interactive SVG)
- "Quiz Recent" (mini-review from search history)
- Search history → Graph auto-update

**Success Metrics:**

- **Depth:** 40% of users click ≥1 related word (recursive search)
- **Session Duration:** +20% (from 12 → 14.4 min)
- **Graph Growth:** 2x node growth rate vs. passive reviews
- **Stickiness:** Graph users have +10pp higher D30 retention

**Go/No-Go Decision:**

- GO if: ≥30% recursive search rate + session duration +15%
- ITERATE if: <20% engagement → Simplify graph UI or add tutorial

**User Research:**

- Eye-tracking study (N=10): Do users notice "Related Words"?
- Survey: "Does the graph help you learn?" (qualitative insights)

**Rollout:** 75% → 100% (gradual rollout over 2 weeks)

---

### Phase 3: Story Engine (Week 7-8) - "Create Emotional Hooks"

**Product Goal:** Make learning memorable through absurd, personalized stories

**User Outcomes:**

- Sarah generates story with 猫, 車, 魚 → Laughs → Remembers forever
- Minh sees his leeches in daily story → Finally masters them
- Users share stories on social → Viral growth ("Look what WatashiWa made!")

**Key Features:**

- Story generation (user's searched words + mastered words)
- Story library ("My Stories" collection)
- Interactive story (tap words → definitions)
- Daily story email (optional, combines searches + leeches)

**Success Metrics:**

- **Engagement:** 25% of Samurai users generate ≥1 story/week
- **Retention:** Story-generated words have +15% retention vs. non-story
- **Virality:** 10% of stories shared on social → 500 impressions/share
- **Delight:** Users say "stories are my favorite feature" in surveys

**Go/No-Go Decision:**

- GO if: ≥20% story generation rate + qualitative delight (NPS +5)
- PIVOT if: <10% engagement → Simplify story creation or improve quality

**Viral Experiment:**

- Add "Share to Twitter" button with pre-filled tweet
- Track: Click-through rate, signups from Twitter traffic

**Rollout:** 100% to Samurai tier (Ronin sees 1 sample story, then locked)

---

### Phase 4: Optimization & Scale (Week 9-12) - "Polish & Accelerate"

**Product Goal:** Fix friction points, optimize performance, prepare for 10x growth

**Focus Areas:**

1. **Performance:**
   - Search latency: <300ms (from <500ms)
   - AI response: <1.5s (from <2s)
   - Caching hit rate: >80%

2. **Content Gaps:**
   - Add top 100 most-searched words (if not in DB)
   - Improve pitch accent data (partner with native speakers)
   - Expand Hán Việt coverage (target Vietnamese users)

3. **UX Polish:**
   - Keyboard navigation (arrow keys, Enter, Esc)
   - Mobile: Swipe-down to close (iOS pattern)
   - Desktop: Cmd+K shortcut
   - Loading states: Skeleton loaders (not spinners)

4. **Monetization Refinement:**
   - A/B test upgrade prompts (5 variants)
   - Optimize 14-day trial flow (reduce drop-off)
   - Test "Search Pass" unbundled tier ($3.99/mo)

**Success Metrics:**

- **Speed:** <300ms search latency (P95)
- **Quality:** >95% search accuracy (user finds word in top 3)
- **Conversion:** 28% Samurai conversion (from search exposure)
- **Scalability:** 10K DAU with <$1K/mo infrastructure cost

**Rollout:** 100% stable, ready for marketing push

---

### Phase 5: Growth Acceleration (Month 4-6) - "Tell the World"

**Product Goal:** Drive mass adoption through marketing and word-of-mouth

**Growth Tactics:**

1. **Content Marketing:**
   - Blog post: "Why Searching is Better Than Flashcards for Language Learning"
   - YouTube: "I Learned 500 Words in 30 Days with AI Search" (influencer collab)
   - Reddit AMA: "We built an AI that makes Japanese stick—AMA"

2. **Paid Acquisition:**
   - Facebook/Instagram: Target Japanese learning groups
   - Google Ads: "Japanese dictionary" keywords (high intent)
   - TikTok: Short videos of story generation (viral potential)

3. **Partnerships:**
   - iTalki integration: "Search WatashiWa words during lessons"
   - Wanikani: "Export your words to WatashiWa for AI review"
   - YouTube channels: Sponsor Japanese learning videos

4. **Viral Loops:**
   - Referral program: "Invite friend → Both get 1 month Samurai free"
   - Story sharing: Pre-filled tweets with @WatashiWaApp tag
   - Leaderboards: "Top Knowledge Graph Explorers" (gamification)

**Success Metrics:**

- **Growth:** 5K → 15K DAU (3x growth in 3 months)
- **Virality:** K-factor >0.3 (each user brings 0.3 friends)
- **Acquisition Cost:** CAC <$8 (LTV $46 → LTV/CAC = 5.75)
- **Brand:** 500 social mentions/month (organic)

---

### Phase 6: The Future (Month 12+) - "Search as the OS"

**Vision:** Search becomes the primary interface—users don't "use WatashiWa," they "ask WatashiWa"

**Roadmap Teasers:**

1. **Voice Search** (Q2 2026)
   - Speak Japanese → AI transcribes + checks pitch → Instant feedback
   - Use case: Practicing pronunciation while cooking

2. **Semantic Search** (Q3 2026)
   - "That word about red sky evening" → AI suggests 夕日
   - Use case: Tip-of-tongue moments

3. **Browser Extension** (Q4 2026)
   - Right-click any Japanese text on web → WatashiWa popup
   - Use case: Reading Japanese news sites

4. **Community Search** (2027)
   - Search user-created mnemonics/stories
   - Vote best content → Leaderboard → Rewards
   - Use case: Collective wisdom, reduce AI hallucinations

**Strategic North Star:**  
By 2027, WatashiWa is the first app learners open when they have _any_ question about Japanese—not just vocabulary, but grammar, culture, pronunciation, everything.

---

## 🔗 DEPENDENCIES & INTEGRATIONS

### Internal Dependencies

| Dependency            | Module           | Required For                              | Risk Level                  |
| --------------------- | ---------------- | ----------------------------------------- | --------------------------- |
| UserReview table      | SRS Module       | Determine user status (mastered/learning) | Low (existing)              |
| Vocabulary table      | Content Module   | Source of search data                     | Low (existing)              |
| KnowledgeGraph        | Study Module     | Related words, graph viz                  | Medium (requires extension) |
| han_viet_info (JSONB) | Content Module   | Etymology, radical breakdown              | Low (existing)              |
| DailyStudyStat        | Analytics Module | Story saving, daily email                 | Low (existing)              |
| Auth & Tier Check     | Auth Module      | Samurai gating                            | Low (existing)              |

### External Dependencies

| Dependency         | Purpose                             | Provider         | Risk Mitigation                              |
| ------------------ | ----------------------------------- | ---------------- | -------------------------------------------- |
| GPT-4 API          | AI quiz, story, mnemonic generation | OpenAI           | Cache responses, fallback templates          |
| TTS API            | Audio pronunciation                 | Google Cloud TTS | Pre-record common words, fallback to silence |
| Postgres Full-Text | Fast search                         | pg_tsvector      | Add fuzzy fallback (Levenshtein)             |

### API Integrations

- ✅ OpenAI GPT-4 (existing integration, extend prompts)
- ✅ Google Cloud TTS (existing, no changes needed)
- ❌ No new external APIs required

---

## ⚠️ RISKS & MITIGATION

### Risk Matrix

| Risk                                            | Impact | Likelihood | Mitigation                                                                                                                            |
| ----------------------------------------------- | ------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **AI quota exceeded (cost overrun)**            | High   | Medium     | - Implement aggressive caching (7-day TTL)<br>- Rate limit: 20 quiz/hour, 5 stories/day<br>- Pre-generate content for popular words   |
| **Search performance degrades with scale**      | High   | Low        | - Index optimization (GIN on tsvector)<br>- Query limit: 20 results max<br>- Monitor 95th percentile latency                          |
| **Users confused by tier gating (frustration)** | Medium | Medium     | - Clear upgrade prompts with value proposition<br>- 14-day Samurai trial on first AI interaction<br>- Show preview of locked features |
| **AI generates incorrect/offensive content**    | High   | Low        | - Human QA for first 1000 generations<br>- Profanity filter + content moderation<br>- User report button on AI content                |
| **Feature complexity overwhelms users**         | Medium | Medium     | - Phased rollout with progressive disclosure<br>- Onboarding tooltip tour<br>- Analytics to track drop-off points                     |
| **Knowledge graph becomes stale**               | Low    | Medium     | - Scheduled job: Update graph nightly<br>- Manual refresh button for users<br>- Alert if graph not updated in 7 days                  |

### Rollback Plan

**Trigger Conditions:**

- Critical bug affects >5% of users
- Search latency >3s for >10% of requests
- AI error rate >5%

**Rollback Steps:**

1. Feature flag toggle: Disable AI features only (keep basic search)
2. Rollback DB migration if search_vector causes issues
3. Redirect users to legacy dictionary page (temporary)
4. Notify affected users via in-app banner + email

---

## 📈 SUCCESS METRICS & KPIs

### Launch Criteria (Phase 1 Complete)

- [ ] Search adoption: 70% of DAU try search within first week
- [ ] Search latency: <500ms (P95)
- [ ] AI feature discovery: 30% of searchers use AI quiz
- [ ] No critical bugs (P0/P1) in production
- [ ] Positive sentiment: NPS +10 pts from beta users

### 30-Day Post-Launch KPIs

| Metric                     | Baseline | Target        | Actual | Status     |
| -------------------------- | -------- | ------------- | ------ | ---------- |
| **Feature Engagement**     | 0%       | 60% DAU       | TBD    | 🟡 Pending |
| **Session Duration**       | 12 min   | +25% (15 min) | TBD    | 🟡 Pending |
| **D7 Retention**           | 35%      | +5pp (40%)    | TBD    | 🟡 Pending |
| **Samurai Conversion**     | 20%      | +8pp (28%)    | TBD    | 🟡 Pending |
| **Words Added via Search** | 0        | 3.5/user/week | TBD    | 🟡 Pending |
| **AI Interaction Rate**    | 8%       | +20pp (28%)   | TBD    | 🟡 Pending |

### Long-Term North Star (90 Days)

- **D30 Retention:** +10pp (industry-leading 30%+)
- **Net Revenue Impact:** +15% (driven by Samurai tier upgrades)
- **User Satisfaction:** "Search is my favorite feature" (top 3 in user surveys)

---

## 🧪 TESTING STRATEGY

### Test Coverage

| Test Type           | Coverage Target                               | Tools                | Owner         |
| ------------------- | --------------------------------------------- | -------------------- | ------------- |
| Unit Tests          | 80%+ (utils, services)                        | Vitest               | Dev Team      |
| Integration Tests   | Critical flows (search, AI quiz, add to deck) | Vitest + Prisma mock | Dev Team      |
| E2E Tests           | 5 key scenarios                               | Playwright           | QA + Dev      |
| Performance Tests   | Search latency, AI response time              | k6, Lighthouse       | DevOps        |
| Accessibility Tests | WCAG AA compliance                            | axe, Lighthouse      | QA            |
| Security Tests      | Input sanitization, tier gating               | Manual + OWASP ZAP   | Security Team |

### E2E Test Scenarios

1. **Happy Path - Quick Lookup**
   - Open search → Type "sensei" → Select result → View details → Add to deck → Close modal
   - Expected: Word added, toast shown, modal closes, no errors

2. **AI Quiz Flow (Samurai)**
   - Search word → Open detail → Click "Test Me" → Answer 3 questions → View mnemonic → Close
   - Expected: Quiz completes, mnemonic unlocks, results logged

3. **Confusion Alert**
   - Search "hashi" → See alert banner → Tap alert → View comparison → Close
   - Expected: Alert triggers, comparison shows 2 words, pitch visualization correct

4. **Story Generation**
   - Search 3 words → Click "Create Story" → View story → Save → Navigate to Dashboard
   - Expected: Story generated, saved, appears in dashboard

5. **Tier Gating (Ronin)**
   - Search word → Click "Test Me" → See upgrade prompt → Click upgrade → Redirect to pricing
   - Expected: Feature locked, prompt shown, upgrade CTA works

### Performance Benchmarks

| Metric                | Target | Test Scenario                             |
| --------------------- | ------ | ----------------------------------------- |
| Search Input Latency  | <300ms | Type 1 char, measure debounce + API call  |
| Search Results Render | <200ms | Receive API response, measure render time |
| Detail View Load      | <500ms | Click result, measure data fetch + render |
| AI Quiz Generation    | <2s    | Click "Test Me", measure GPT API + render |
| Story Generation      | <3s    | Click "Create Story", measure GPT + save  |

---

## 📚 DOCUMENTATION REQUIREMENTS

### User-Facing Docs

- [ ] Help Center Article: "How to Use Smart Search"
- [ ] Video Tutorial: "Search & Learn with AI" (90s)
- [ ] In-App Tooltips: First-time user onboarding (5 tooltips)
- [ ] FAQ: "Why is AI quiz locked?" (Tier explanation)

### Internal Docs

- [ ] API Documentation: All Server Actions (Swagger/OpenAPI)
- [ ] Architecture Diagram: Data flow (Excalidraw)
- [ ] Runbook: AI quota monitoring & alerts
- [ ] Analytics Dashboard: Key metrics (Mixpanel board)

### Code Documentation

- [ ] JSDoc comments: All public functions in services.ts
- [ ] README.md: Module overview (src/modules/search/README.md)
- [ ] Storybook: UI components (SearchModal, WordDetail, AIQuiz)

---

## 💰 BUSINESS CASE & ROI

### Investment Required

| Resource                     | Effort                        | Cost               |
| ---------------------------- | ----------------------------- | ------------------ |
| **Engineering (2 FTEs)**     | 8 weeks (Phase 0-3)           | $40k (salary)      |
| **Design (0.5 FTE)**         | 2 weeks                       | $5k                |
| **QA (0.5 FTE)**             | 4 weeks                       | $8k                |
| **OpenAI API (GPT-4)**       | Estimated 100k requests/month | $500/month         |
| **Infrastructure (Caching)** | Redis upgrade                 | $100/month         |
| **Total Phase 0-3**          | 8 weeks                       | **$53k + $600/mo** |

### Expected Revenue Impact (12 Months)

**Assumptions:**

- Current DAU: 5,000 (post-launch, growing)
- Samurai conversion: 20% → 28% (+8pp from search feature)
- ARPU: $7.99/month
- Churn rate: 15%/month → 12%/month (retention improvement)

**Projections:**

| Metric                    | Without Feature | With Feature | Delta    |
| ------------------------- | --------------- | ------------ | -------- |
| Samurai Subscribers (Avg) | 1,000           | 1,400        | +400     |
| MRR                       | $7,990          | $11,186      | +$3,196  |
| Annual Revenue            | $95,880         | $134,232     | +$38,352 |

**ROI:**

- Net Revenue Gain (Year 1): $38,352 - ($53,000 + $7,200) = **-$21,848** (Year 1 loss)
- Break-Even: **Month 17** (assuming compounding growth)
- **Strategic Value:** Market differentiation, user satisfaction (priceless for long-term retention)

**Non-Monetary Benefits:**

- User testimonials for marketing
- Competitive moat (AI-powered search is rare in Japanese learning apps)
- Data collection (search behavior improves content recommendations)

---

## 🗣️ STAKEHOLDER COMMUNICATION

### Launch Announcement (To Users)

**Subject:** 🔍 Introducing Smart Search - Your AI Learning Companion

**Body:**

> Hey [Name],
>
> Ever forgotten a word mid-study and wished you could just... ask someone? Well, now you can!
>
> **Introducing Smart Search** - your new AI-powered learning buddy:
>
> ✨ Instant word lookup (Japanese, Romaji, English)  
> 🧠 AI quizzes to lock in memory  
> 📖 See how words connect (Hán Việt roots, radicals)  
> 📚 Generate absurd stories from your searches (Samurai exclusive!)
>
> Tap the 🔍 icon in your app to try it now. We think you'll love it.
>
> Keep mastering,  
> The WatashiWa Team

**Channels:** Email, In-App Banner, Push Notification (opt-in)

---

### Internal Kickoff (To Team)

**Meeting Agenda:**

1. Feature Vision (PM - 10 min)
2. Architecture Overview (Tech Lead - 15 min)
3. Design Walkthrough (Designer - 10 min)
4. Phase 0 Sprint Plan (Scrum Master - 15 min)
5. Q&A (10 min)

**Key Talking Points:**

- This is a **strategic differentiator** - no competitor has AI-powered search
- **Phased rollout** reduces risk (start with 10% beta)
- **Cross-functional** collaboration critical (Eng, Design, Content, QA)
- **Success = adoption + retention**, not just build completion

---

### Quarterly Business Review (To Leadership)

**Slide Deck Outline:**

1. **Problem:** Users frustrated by lack of on-demand lookup (68% survey)
2. **Solution:** AI-Powered Search & Learning Assistant
3. **Impact:** +8% Samurai conversion, +25% session duration, +5pp D7 retention
4. **Investment:** $53k dev cost + $600/mo API (break-even Month 17)
5. **Differentiation:** Only Japanese app with integrated AI search
6. **Timeline:** 8 weeks (Phase 0-3), live by March 2026
7. **Ask:** Approve budget + prioritize over Feature X

---

## 🔮 FUTURE ENHANCEMENTS (V2 Backlog)

### High-Impact (Prioritize if Phase 1-3 succeed)

1. **Voice Search** (User Request Score: 8/10)
   - Speak word → AI transcribes + matches pronunciation
   - Pitch feedback: "Your pitch was flat, try rising tone"
   - Use Case: Hands-free practice while commuting

2. **Semantic Search** (Technical Interest: High)
   - Describe what you remember: "word about red sky evening" → 夕日
   - Use Case: Tip-of-tongue moments

3. **Search within Learned Content** (Retention Impact: High)
   - Filter: "Show only words I've mastered"
   - Use Case: Review before JLPT exam

4. **Community Search** (Viral Potential: Medium)
   - Search user-created mnemonics/stories
   - Vote best mnemonic → Leaderboard
   - Use Case: Leverage collective wisdom

### Medium-Impact (Consider for Phase 4)

1. **Offline Search** (Mobile-First)
   - Download top 1000 words for offline access
   - Sync AI features when online

2. **Search Analytics Dashboard**
   - "You searched 'sensei' 5 times → Add to deck?"
   - Personal trends: "You forget pitch accents often"

3. **Browser Extension**
   - Right-click Japanese text on any webpage → WatashiWa search
   - Instant lookup while reading news

---

## 📝 APPENDIX

### A. Glossary

| Term             | Definition                                                                    |
| ---------------- | ----------------------------------------------------------------------------- |
| **CUBE**         | Context, Understanding, Blocking, Encoding - WatashiWa's learning methodology |
| **SRS**          | Spaced Repetition System - algorithm for optimal review timing                |
| **Hán Việt**     | Vietnamese pronunciation of Chinese characters (helps Vietnamese learners)    |
| **Pitch Accent** | High/low tone pattern in Japanese pronunciation                               |
| **Homonym**      | Words that sound the same but have different meanings/Kanji                   |
| **Leech**        | Word that user consistently fails to remember                                 |
| **Samurai Tier** | Paid subscription ($7.99/mo) with AI features                                 |
| **Ronin Tier**   | Free tier with basic SRS                                                      |

### B. Research References

- User Interviews: Dec 2025 (N=47, 30-min sessions)
- In-App Survey: "Most Wanted Features" (N=312, 5-question survey)
- Competitor Analysis: Duolingo, Anki, WaniKani, Bunpo (feature matrix)
- Academic: "The Testing Effect" (Roediger & Butler, 2011)
- Reddit/Quora: 150+ posts analyzed for pain points

### C. Design Assets

- Figma: [Link to Search Feature Mockups]
- Excalidraw: [Data Flow Diagram]
- Lottie Animations: Search loading state, AI thinking animation

### D. Related Epics

- [E-2024-015] Personal Knowledge Graph (prerequisite)
- [E-2024-022] AI Mnemonic Factory (parallel development)
- [E-2025-003] Pitch Accent Visualizer (shared component)

---

## ✅ APPROVAL & SIGN-OFF

| Role                 | Name        | Status              | Date       |
| -------------------- | ----------- | ------------------- | ---------- |
| **Product Owner**    | [Your Name] | ✅ Approved         | 2026-01-13 |
| **Engineering Lead** | TBD         | 🟡 Pending Review   | -          |
| **Design Lead**      | TBD         | 🟡 Pending Review   | -          |
| **CEO/Founder**      | TBD         | 🟡 Pending Approval | -          |

---

## 📞 CONTACT & FEEDBACK

**Product Owner:** [Your Name] | [Email]  
**Slack Channel:** #feature-smart-search  
**Jira Epic:** [WATASHI-XXX]  
**Feedback Form:** [Link to Typeform/Google Form]

---

## 📈 MEASURING SUCCESS: The Search Dashboard

### Weekly Product Health Metrics

**To monitor in real-time (Mixpanel/Amplitude dashboard):**

| Category         | Metric                        | Target | Red Flag | Action if Red                          |
| ---------------- | ----------------------------- | ------ | -------- | -------------------------------------- |
| **Adoption**     | % DAU who use search          | 60%    | <40%     | Improve placement, add FTUE prompt     |
| **Engagement**   | Searches per active user/day  | 3.5    | <2.0     | Investigate UX friction, check latency |
| **Quality**      | % searches with click-through | 92%    | <80%     | Improve search relevance algorithm     |
| **Depth**        | % who click related words     | 40%    | <25%     | Make related words more prominent      |
| **Monetization** | AI quiz attempts (Samurai)    | 35%    | <20%     | Improve upgrade prompts, add trial     |
| **Retention**    | D7 retention (searchers)      | 40%    | <33%     | Check for frustration points (surveys) |
| **Performance**  | P95 search latency            | <500ms | >1s      | Scale infrastructure, optimize queries |
| **Quality**      | AI negative ratings           | <2%    | >5%      | Pause AI, review prompts, add QA       |

---

### Monthly Deep Dives (Product Review Meetings)

**Questions to answer every 30 days:**

1. **Value Realization:** What % of users who search 5+ times convert to Samurai? (Target: >30%)
2. **Feature Discovery:** Are users finding AI features organically, or do we need better onboarding?
3. **Cohort Analysis:** Do Month 1 users search more/less than Month 3 users? (Should increase = habit)
4. **Content Gaps:** What are the top 20 "no results" searches? (Add to content backlog)
5. **Behavioral Segmentation:** Can we identify power users early? (For targeted upsells)
6. **Competitive Intel:** What are users saying about search on social media? (Sentiment analysis)

---

### Quarterly Business Reviews (Executive Reporting)

**The "Search Health Report" for leadership:**

```
Q1 2026 Search Performance Summary

📊 Adoption
- 62% of DAU use search (↑ from 0%, target: 60%)
- 4.2 searches per active user per day (↑ from target: 3.5)

💰 Revenue Impact
- +$12.4K MRR from search-driven Samurai conversions
- LTV increased 38% for search users ($46 vs. $33 baseline)
- ROI: 185% (revenue $62K, investment $33K)

🚀 Growth
- 24% of new signups mention "AI search" in onboarding survey
- 18% of stories shared on social media (viral content)
- NPS: +38 (↑ from +32, search users: +45)

🔍 Insights
- Top use case: Anime/manga word lookups (31% of searches)
- Surprise finding: 12% of searches are grammar questions (content gap!)
- Power user cohort: 8% of users do 40% of searches (target them for case studies)

⚠️ Risks
- AI quiz completion rate dropped to 87% (from 94%) → Investigate prompt quality
- 5% of users reported "too many upgrade prompts" → A/B test frequency

📌 Recommendations
1. Expand content: Add grammar explanations (high demand)
2. Double down on anime vocab (peak use case)
3. Create case study: "How Sarah learned 300 words in 30 days with search"
```

---

## 🎓 LEARNING FRAMEWORK: What We'll Discover

### Hypotheses to Validate (Experiment-Driven)

**Hypothesis 1: Curiosity-Driven Learning Beats Scheduled Learning**  
**Test:** Compare retention rates of words added via search vs. system-scheduled  
**Expected Result:** Search words have +15% higher 30-day retention  
**If Wrong:** Rethink product positioning—maybe scheduled structure is what users need

---

**Hypothesis 2: AI Personalization Drives Conversion**  
**Test:** A/B test: Generic mnemonics vs. AI-personalized mnemonics  
**Expected Result:** AI version has +10pp higher conversion  
**If Wrong:** Save on AI costs, use human-written templates

---

**Hypothesis 3: Knowledge Graph Creates "Aha!" Moments**  
**Test:** Survey users: "When did you feel WatashiWa 'clicked' for you?"  
**Expected Result:** >30% mention Knowledge Graph or related words  
**If Wrong:** Graph is nice-to-have, not essential—deprioritize desktop features

---

**Hypothesis 4: Search Reduces Churn by Providing "Just-in-Time" Support**  
**Test:** Track at-risk users (missed 3+ reviews) → Do they churn less if they use search?  
**Expected Result:** Search users churn 50% less (9% vs. 18%)  
**If Wrong:** Churn is driven by other factors—investigate separately

---

**Hypothesis 5: Viral Story Sharing Drives Low-CAC Growth**  
**Test:** Track signups with UTM "story_share" → Calculate CAC  
**Expected Result:** Story-driven CAC <$2 (vs. paid ads $8)  
**If Wrong:** Stories are engagement feature, not growth driver—pivot strategy

---

### What Could Go Wrong? (Scenario Planning)

**Scenario A: Low Adoption (<40% after Month 1)**  
**Diagnosis:** Users don't discover search or don't see value  
**Action:**

1. Add forced FTUE: "Try searching for 'sensei'" (can't skip)
2. In-review prompt: "Stuck? Tap 🔍 to search"
3. Push notification (Day 3): "Did you know you can search any word?"

**Pivot Decision:** If still <35% by Month 2 → Rethink placement (maybe dock icon not header?)

---

**Scenario B: High Adoption but Low Monetization (<20% Samurai Conversion)**  
**Diagnosis:** Users love free features but don't see value in paid  
**Action:**

1. Reduce free tier: 1 AI quiz/day → 1 AI quiz/week (create scarcity)
2. Improve value messaging: "This AI quiz cost us $0.08—Samurai supports development"
3. Add social proof: "12K learners upgraded to unlock AI"

**Pivot Decision:** If still <18% by Month 3 → Test lower price ($4.99) or unbundled "Search Pass"

---

**Scenario C: AI Quality Issues (>5% Negative Ratings)**  
**Diagnosis:** GPT-4 generating bad mnemonics or nonsense  
**Action:**

1. Immediate: Pause AI for flagged words, use human-written fallbacks
2. Short-term: Improve prompts, add examples to GPT context
3. Long-term: Build human QA pipeline, crowdsource best mnemonics

**Pivot Decision:** If can't get to <2% by Month 4 → Switch to human-curated content (slower but safer)

---

**Scenario D: Search Cannibalizes SRS Reviews (<90% Completion)**  
**Diagnosis:** Users search instead of doing scheduled reviews  
**Action:**

1. Add friction: After 5 searches, prompt "Time to lock these in—Start Review"
2. Gamify: "You searched 8 words today but only reviewed 5. Finish your reviews to unlock more searches!"
3. Messaging: "Search primes, Reviews cement—do both"

**Pivot Decision:** If completion drops to <85% → Limit searches to 10/day until reviews done

---

## 🎯 STRATEGIC RECOMMENDATIONS (Executive Summary)

### Why This Feature is a Game-Changer

**1. Competitive Moat**  
No competitor has AI-powered search integrated with SRS. This is our **blue ocean** for 12-18 months before copycats arrive. First-mover advantage is critical.

**2. Monetization Catalyst**  
Search exposes users to AI features naturally (not forced). Expected +8pp conversion = **$163K additional ARR in Year 1**.

**3. Engagement Multiplier**  
Search turns passive learners into active explorers. Session duration +25%, D7 retention +5pp → **Lower CAC, higher LTV**.

**4. Data Flywheel**  
Every search teaches us what users struggle with → Better content → Better recommendations → More engagement → More searches. **Compounding returns over time.**

**5. Product Positioning Evolution**  
Transforms WatashiWa from "SRS tool" to "AI learning companion"—a **defensible, premium positioning** vs. Anki (free) and Duolingo (mass market).

---

### The Business Case (One-Pager for CEO)

**Investment Required:** $60K (dev + AI costs)  
**Expected Revenue (Year 1):** $163K (+8pp Samurai conversion)  
**ROI:** 171%  
**Break-Even:** Month 17  
**Strategic Value:** Priceless (competitive moat, brand differentiation)

**Opportunity Cost:** If we DON'T build this, competitors will. Duolingo is investing heavily in AI. We must move fast.

**Recommendation:** **Approve and prioritize for Q1 2026 roadmap.**

---

### What Success Looks Like (12 Months Out)

**Quantitative:**

- 60% of DAU use search ≥1x per session
- +28% Samurai conversion (from search exposure)
- +25% session duration
- +10pp D30 retention
- $163K additional ARR

**Qualitative:**

- Users say: "WatashiWa's search is my secret weapon"
- Social proof: Reddit posts titled "This search feature changed my learning"
- Influencer shoutouts: "Finally, a smart Japanese dictionary"
- Press coverage: "This AI feature makes language learning addictive"

**Strategic:**

- Search becomes the #1 differentiator in sales conversations
- Partnerships: Other apps want to integrate our search API
- Fundraising: Investors see search as proof of AI execution capability

---

### Key Principles for Execution

1. **User-Centric Iteration**
   - Launch fast, learn faster
   - Weekly user interviews (N=5) during first 8 weeks
   - Pivot based on data, not opinions

2. **Quality Over Speed**
   - AI quality is non-negotiable—better to launch late with great AI than early with bad AI
   - Test with 100 users before 10K users

3. **Progressive Disclosure**
   - Don't overwhelm—introduce features gradually
   - Phase 0 = utility, Phase 1 = delight, Phase 2 = mastery

4. **Monetization with Empathy**
   - Gate features transparently ("AI costs money, Samurai supports us")
   - Always provide value in free tier (build trust first)

5. **Data-Informed, Not Data-Driven**
   - Use metrics to inform decisions, but trust user stories
   - A user crying "This helped me pass JLPT!" > 100 dashboards

---

### Final Word: The "Search Bet"

**This is not just a feature—it's a strategic bet on how the future of learning works.**

Traditional education: Scheduled, structured, one-size-fits-all  
**WatashiWa Search:** On-demand, personalized, curiosity-driven

If we're right, search becomes the core of the product—the "Google for Japanese learning."  
If we're wrong, we've still built a valuable utility that improves retention.

**The risk of NOT building this is higher than the risk of building it.**

Let's ship this and change how people learn Japanese. 🚀

---

**Document Version:** 2.0 (Product-Focused Revision)  
**Last Updated:** January 13, 2026  
**Contributors:** Product Team, with insights from 47 user interviews + 312 survey responses  
**Next Review:** February 1, 2026 (Post-Phase 0 Retro)  
**Approval Required:** CEO, Engineering Lead, Design Lead

---

## 📎 APPENDIX: Quick Reference

### One-Page Feature Summary (Share with Stakeholders)

**What:** AI-powered search that transforms word lookup into personalized learning  
**Why:** 68% of users leave app to search words elsewhere—massive friction  
**How:** Instant search + AI quizzes + Knowledge Graph + Story generation  
**When:** Launch Phase 0 in Feb 2026, full rollout by April 2026  
**Who:** All users (Ronin gets basic, Samurai gets AI features)  
**Impact:** +$163K ARR, +25% session duration, +8pp Samurai conversion  
**Risk:** AI quality issues (mitigated with QA), low adoption (mitigated with FTUE)  
**Recommendation:** Approve for Q1 2026 roadmap

---

### User Journey Maps (Visual Summaries)

**Journey 1: The Anime Learner**

```
😊 Watching anime → 🤔 Hears unknown word → 🔍 Searches in app
→ 😯 Gets instant result + pitch → 💪 Tests with AI quiz
→ 🎉 Gets mnemonic → ✅ Adds to deck → 😊 Continues watching
```

**Journey 2: The Struggling Student**

```
😰 Stuck on card → 🔍 Long-press to search → 😯 Sees Confusion Alert
→ 🤔 Learns pitch difference → 💪 Tries drill → 🎉 Masters it
→ 😊 Continues review confidently
```

**Journey 3: The Curious Explorer**

```
🤔 Learns "学校" → 🔍 Searches → 😯 Sees "Related Words"
→ 🤓 Clicks 学生, 大学, 留学 → 🤯 "They're all connected!"
→ 📚 Explores graph for 20 minutes → 😍 "This is amazing!"
```

---

### Key Metrics Cheat Sheet (Print for Weekly Reviews)

| Metric                   | Target | Red Flag | Tool              |
| ------------------------ | ------ | -------- | ----------------- |
| Search Adoption (% DAU)  | 60%    | <40%     | Mixpanel          |
| Searches/User/Day        | 3.5    | <2.0     | Mixpanel          |
| Add-to-Deck Rate         | 45%    | <30%     | Mixpanel          |
| AI Quiz Attempt Rate     | 35%    | <20%     | Mixpanel          |
| Samurai Conversion Lift  | +8pp   | <+3pp    | Stripe + Mixpanel |
| D7 Retention (Searchers) | 40%    | <33%     | Mixpanel          |
| Search Latency (P95)     | <500ms | >1s      | Datadog           |
| AI Negative Ratings      | <2%    | >5%      | In-app surveys    |

---

### Competitive Battle Card (Sales/Marketing Use)

**vs. Jisho.org:**  
✅ We have AI quizzes, they don't  
✅ We integrate with SRS, they're standalone  
✅ We have Hán Việt, they don't

**vs. Anki:**  
✅ We have AI mnemonics, they're manual  
✅ We have beautiful UX, they're clunky  
✅ We have instant search, they have deck browser

**vs. Duolingo:**  
✅ We have accurate pitch, they're inconsistent  
✅ We have Knowledge Graph, they have linear lessons  
✅ We target serious learners, they target casual (we win high LTV users)

**Our Positioning:** "The AI brain for serious Japanese learners"

---

_This document is a living artifact. Update as we learn from user feedback and data. The best products are built iteratively with users, not for them._ 🚀

**Let's make search the feature users can't live without. Ship it.** 🎯
