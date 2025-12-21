Here is a complete **"Golden Data"** specimen for the word **`借ります` (Karimasu - To Borrow)**.

I chose this word because it perfectly demonstrates all 4 pillars of your C.U.B.E method:

1. **Context (Story):** Common daily usage.
2. **Understanding (Etymology):** The Hán Việt root helps distinguish it.
3. **Block (Confusion):** It has a famous "Enemy" (`Kashimasu` - To Lend) that creates a perfect Interference Shield.
4. **Encode (Variants):** It needs multiple card types to master.

---

### The Data Blueprint (JSON Representation)

This is exactly how the data should look in your database (and pass your Zod validation).

#### 1. The Anchor (Table: `Vocabulary`)

*This is the core truth of the word.*

```json
{
  "id": "uuid-1234-5678",
  "word_surface": "借ります",
  "word_reading": "かります",
  "word_romaji": "karimasu",
  "tags": ["n5", "verb_group_2", "transitive"],
  
  // PITCH ACCENT VISUALIZER
  // Pattern 0 (Heiban - Flat). 
  // Visual: Starts Low, goes High, stays High.
  "pitch_pattern": 0,
  "pitch_svg_path": "M0,20 L25,5 L50,5 L75,5", 

  // PILLAR U: UNDERSTANDING (Etymology)
  // The "Aha!" moment for Vietnamese learners.
  "etymology": {
    "parts": [
      {
        "kanji": "借",
        "han_viet": "TÁ",
        "meaning_vi": "Vay, mượn, nhờ vả",
        "stroke_count": 10
      }
    ],
    // The bridge logic
    "note": {
      "vi": "Chữ TÁ (借) trong 'Tá túc' (ở nhờ), 'Vay tá' (vay mượn). Người (人) xưa (昔 - Tích) hay đi vay mượn."
      "en": "The Kanji 借 (Borrow) is made of Person (人) + Ancient Times (昔). Imagine an ancient person asking to borrow something."
    }
  },

  "meanings": {
    "vi": ["Mượn", "Vay"],
    "en": ["To borrow", "To rent"]
  },

  "examples": [
    {
      "sentence": "図書館で本を借ります。",
      "translation" : {
        "vi": "Tôi mượn sách ở thư viện.",
        "en": "I borrow books at the library."
      },
      "audio_url": "https://s3.watashiwa.com/audio/ex_karimasu_1.mp3"
    }
  ],

  "audio_url": "https://s3.watashiwa.com/audio/vocab_karimasu.mp3"
}

```

---

#### 2. The Context (Table: `Story`)

*The "Priming" phase before they learn the word.*

```json
{
  "unit_id": "deck-unit-5",
  "content": {
    "title": {
      "vi": "Chuyện ở thư viện",
      "en": "Library Story"
    },
    // The text the user reads.
    "body_text": "Hôm qua, tôi đi thư viện. Vì quên mang tiền, tôi phải mượn bút của bạn.",
    
    // PILLAR C: CONTEXT HIGHLIGHTS
    // These link the text "mượn" back to the vocab ID of "Karimasu"
    "highlights": [
      {
        "vocab_id": "uuid-1234-5678", // ID of Karimasu
        "word_surface": "mượn",       // The text in the story
        "start_index": 43,            // Position in body_text
        "length": 4
      },
      {
        "vocab_id": "uuid-9999-8888", // ID of 'Library' (Tosho-kan)
        "word_surface": "thư viện",
        "start_index": 16,
        "length": 8
      }
    ]
  }
}

```

---

#### 3. The Shield (Table: `ConfusionPair`)

*The "Interference Shield" logic. This prevents the user from confusing "Borrow" and "Lend".*

```json
{
  "vocab_id_1": "uuid-1234-5678", // Karimasu (Borrow)
  "vocab_id_2": "uuid-5678-1234", // Kashimasu (Lend)
  "type": "SYNONYM", // Conceptual confusion

  // PILLAR B: BLOCK (Nuance Explanation)
  "explanation": {
    "mnemonic": {
      "vi": "Kari (Karimasu) là Cầm về. Kashi (Kashimasu) là Cho đi.",
      "en": "Kari is taking in. Kashi is giving out."
    },
    // Distinct nuances forces the brain to separate them
    "item1_nuance": "Hành động nhận lấy (Borrow/Rent)",
    "item2_nuance": "Hành động trao đi (Lend/Rent out)"
  }
}

```

---

#### 4. The Variants (Table: `CardVariant`)

*The dynamic "CUBE" faces.*

**Variant A: Gap Fill (Recall)**

```json
{
  "variant_type": "CONTEXT_GAP_FILL",
  "content_payload": {
    "type": "GAP_FILL",
    "question_template": "Tomodachi ni okane wo [___].", // Friend from money [___]
    "correct_answer": "karimashita",
    "distractors": ["kashimashita", "agemashita", "urimashita"],
    "translation": {
      "vi": "Tôi đã mượn tiền của bạn."
    }
  }
}

```

**Variant B: Audio Match (Listening)**

```json
{
  "variant_type": "AUDIO_MATCH",
  "content_payload": {
    "type": "AUDIO_MATCH",
    "audio_url": "https://.../karimasu_fast.mp3",
    "choices": [
      { "image_url": "img_hand_taking.png", "label": "Mượn", "is_correct": true },
      { "image_url": "img_hand_giving.png", "label": "Cho mượn", "is_correct": false },
      { "image_url": "img_eating.png", "label": "Ăn", "is_correct": false },
      { "image_url": "img_drinking.png", "label": "Uống", "is_correct": false }
    ]
  }
}

```

---

### Deep Dive: Why is this "Golden Data"?

To prepare your dataset, you must check every row against these 4 criteria:

#### 1. The "Hán Việt" Hook (Crucial)

* **Bad Data:** `{"han_viet": "TÁ"}` (Just the word).
* **Golden Data:** `{"han_viet": "TÁ", "note": "Tá túc, Vay tá..."}`
* **Why:** A user sees "TÁ" and thinks "So what?". But when they see "Tá túc" (To stay temporarily), they connect **Borrowing** with **Temporary usage**. That is the "Aha!" moment.

#### 2. The Pitch Accent Visualizer

* **Bad Data:** No pitch data.
* **Golden Data:** `pitch_svg_path: "M0,20..."`
* **Why:** Japanese has homonyms (Hashi vs Hashi). Storing the SVG path allows the Frontend to draw the line *over* the text instantly without complex calculation.

#### 3. The Story "Anchor"

* **Bad Data:** A random sentence: "This is a pen."
* **Golden Data:** A cohesive mini-story about a library.
* **Why:** When the user learns `Karimasu` later, their brain triggers: *"Wait, I saw this word in the library story 5 minutes ago!"*. This is **Priming**.

#### 4. The Confusion "Nuance"

* **Bad Data:** Explanation: "Don't confuse them."
* **Golden Data:** Explanation: "Kari = Cầm về (Take in), Kashi = Cho đi (Give out)."
* **Why:** You must provide a **Directional Logic** (In vs Out) to solve the confusion, not just say "You are wrong".

### Your Action Plan for Data Prep

1. **Don't write JSON manually.** It is too error-prone.
2. **Use the "Golden Template":** Copy the structure above into a `karimasu_gold.json` file.
3. **Prompt Engineering:** When you use AI (GPT-4) to generate the N5 list, feed it this **exact JSON** as the "One-Shot Example".

* *Prompt:* "Generate data for 'Tabemasu' following this exact JSON structure: [Insert Karimasu JSON]..."

4. **Human Verification:** You only need to verify the `etymology.note_vi` and `confusion.explanation`. AI is bad at cultural nuance (Hán Việt links). Humans must polish that part.

### The Bilingual Golden Data (JSON)

Here is the perfect entry for **`借ります` (Karimasu)**.

#### A. The Anchor (Table: `Vocabulary`)

```json
{
  "id": "uuid-karimasu-001",
  "word_surface": "借ります",
  "word_reading": "かります",
  "word_romaji": "karimasu",
  "tags": ["n5", "verb", "transitive"],
  
  "pitch_pattern": 0, 
  "pitch_svg_path": "M0,20 L25,5 L50,5 L75,5", 

  // PILLAR U: UNDERSTANDING (Bilingual Etymology)
  "etymology": {
    "parts": [
      {
        "kanji": "借",
        "han_viet": "TÁ",
        "meaning_vi": "Vay, mượn",
        "stroke_count": 10
      }
    ],
    "note": {
      "vi": "Chữ TÁ (借) gồm Nhân (人) + Tích (昔 - Ngày xưa). Người xưa hay đi vay mượn (Tá túc).",
      "en": "The Kanji 借 (Borrow) is made of Person (人) + Ancient Times (昔). Imagine an ancient person asking to borrow something."
    }
  },

  "meanings": {
    "vi": ["Mượn", "Vay"],
    "en": ["To borrow", "To rent"]
  },

  "examples": [
    {
      "sentence": "図書館で本を借ります。",
      "translation_vi": "Tôi mượn sách ở thư viện.",
      "translation_en": "I borrow books at the library.",
      "audio_url": "https://s3.watashiwa.com/audio/ex_karimasu_1.mp3"
    }
  ],
  "audio_url": "https://s3.watashiwa.com/audio/vocab_karimasu.mp3"
}

```

#### B. The Context (Table: `Story`)

*Crucial Change:* The `body_text` is in **Japanese** (the target language), because the user needs to click on the Japanese words to learn them. I added a `translation` field for the full text.

```json
{
  "unit_id": "deck-unit-5",
  "content": {
    "title": {
      "vi": "Chuyện ở thư viện",
      "en": "A Library Story"
    },
    // The LEARNING content (Japanese)
    "body_text": "昨日、図書館へ行きました。お金を忘れましたから、友達にペンを借りました。",
    
    "translation": {
      "vi": "Hôm qua tôi đi thư viện. Vì quên tiền nên tôi đã mượn bút của bạn.",
      "en": "Yesterday I went to the library. Since I forgot my money, I borrowed a pen from a friend."
    },

    // Highlights map Japanese text -> Vocab IDs
    "highlights": [
      {
        "vocab_id": "uuid-karimasu-001", 
        "word_surface": "借りました", // Conjugated form in text
        "start_index": 35,            
        "length": 5
      },
      {
        "vocab_id": "uuid-tosho-002", 
        "word_surface": "図書館",
        "start_index": 3,
        "length": 3
      }
    ]
  }
}

```

#### C. The Shield (Table: `ConfusionPair`)

*Goal:* Distinguish `Karimasu` (Borrow) from `Kashimasu` (Lend).

```json
{
  "vocab_id_1": "uuid-karimasu-001",
  "vocab_id_2": "uuid-kashimasu-002",
  "type": "SYNONYM",

  "explanation": {
    "mnemonic": {
      "vi": "Kari (Karimasu) là Cầm về. Kashi (Kashimasu) là Cho đi.",
      "en": "Karimasu = 'Carry' it in (Borrow). Kashimasu = 'Cash' out (Lend)."
    },
    "item1_nuance": {
      "vi": "Hành động nhận lấy (Vay/Mượn)",
      "en": "Action of taking/receiving (Inward)"
    },
    "item2_nuance": {
      "vi": "Hành động trao đi (Cho vay)",
      "en": "Action of giving (Outward)"
    }
  }
}

```

#### D. The Variant (Table: `CardVariant`)

*Example: Gap Fill*

```json
{
  "variant_type": "CONTEXT_GAP_FILL",
  "content_payload": {
    "type": "GAP_FILL",
    "question_template": "Tomodachi ni okane wo [___].",
    "correct_answer": "karimashita",
    "distractors": ["kashimashita", "agemashita", "urimashita"],
    "translation": {
      "vi": "Tôi đã mượn tiền của bạn.",
      "en": "I borrowed money from my friend."
    }
  }
}

```

### 3. Implementation Note for You

When you generate this data using AI (GPT-4), your prompt must be explicit about the language requirements.

**Use this System Prompt for your AI Factory:**

> "You are a linguist expert in Japanese, Vietnamese, and English.
> Generate the JSON output following this schema.
> For 'etymology.note' and 'confusion.explanation', you MUST provide distinct logic for:
>
> 1. **Vietnamese (vi):** Focus on Hán Việt (Sino-Vietnamese) roots and mnemonics.
> 2. **English (en):** Focus on Kanji breakdown (pictographs) or English sound-alike mnemonics. Do not reference Hán Việt in the English field."
>
>

## 3 The "Zen Mastery" Admin QA Checklist

### I. Linguistic Accuracy (The "Truth" Check)

* [ ] **Pitch Accuracy:** Does the `pitchPattern` match a reputable source (e.g., NHK Pitch Accent Dictionary)?
* [ ] **Part of Speech (POS):** Is the verb group correct? (e.g., Is *Kuru* marked as an irregular verb?)
* [ ] **Hán-Việt Integrity:** Is the Hán-Việt character correct for the Vietnamese mnemonic? (e.g., *来る* is LAI, not LAI-LÁI).

### II. The "CUBE" Quality Check (The "Stickiness" Check)

* [ ] **Mnemonic Sanity:** Is the mnemonic actually helpful? (AI sometimes writes weird, nonsensical stories).
* [ ] **No "Breadth" Meanings:** Does the card only show the **Minna-specific** meaning? (Example: *Ageru* has 20 meanings, but N5 users only need "To give").
* [ ] **Context Sentence Logic:** Does the example sentence use only N5-level grammar? (Don't use N1 grammar to teach an N5 word).

### III. UI/UX Asset Check (The "Zen" Check)

* [ ] **SVG Validity:** Does the `pitchSvgPath` render correctly without overlapping text?
* [ ] **Audio-Visual Match:** If there is an image, does it represent the word without ambiguity? (e.g., for "Hashi," is it clearly a Bridge and not just "scenery"?)

---

## 4. Technical Tip: The AI Prompting "Factory"

To get high-quality data from the start, use a "Chain-of-Thought" prompt.

**Example Prompt for your Script:**

> "Acting as a Japanese Linguistics Expert, analyze the N5 word '来る'.
>
> 1. Identify its Hán-Việt (Vietnamese).
> 2. Create a mnemonic for a Vietnamese student using that Hán-Việt.
> 3. Create a mnemonic for an English student using a phonetic pun.
> 4. Identify if it has a common homonym (same reading).
> Output only in the following JSON format..."
