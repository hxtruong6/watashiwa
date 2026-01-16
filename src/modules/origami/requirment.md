### 1. Refined Feature Specifications

We will define three core concepts: **The Hub (Word)**, **The Roots (Kanji)**, and **The Branches (Related Vocab)**.

#### Feature A: Dynamic Expansion (The "Constellation")

- **Concept:** The graph is never "complete." It is "just-in-time."
- **Requirement:**
- **Initial State:** User views a word (e.g., `先生`).
- **Render:** Center node is `先生`. Two child nodes appear: `先` and `生`.
- **Interaction:** User clicks `先`.
- **Action:** The graph re-centers or expands. `先` becomes a temporary hub. New branches sprout: `先月` (Last month), `先輩` (Senior), `行き先` (Destination).

- **Constraint:** Limit expansion to maximum 6 "branches" (related words) per Kanji node to prevent UI overcrowding.

#### Feature B: Contextual Edges (The Reading Logic)

- **Concept:** The connection between a Kanji and a Word explains _how_ it is used.
- **Requirement:**
- The edge (line) connecting `生` and `先生` must carry metadata.
- **Visual Indicator:**
- **Solid Blue Line:** On'yomi (Chinese reading).
- **Dashed Pink Line:** Kun'yomi (Japanese reading).
- **Label on Edge:** The specific sound (e.g., "SEI").

- **Why:** This solves the confusion of why `生` sounds like "SEI" in one word and "IKI" in another.

#### Feature C: JLPT Fog of War (The Filter)

- **Concept:** A beginner (N5) should not see Advanced (N1) words in the graph.
- **Requirement:**
- **Input:** User's current level (e.g., N4).
- **Logic:** When expanding branches for the Kanji `先`, query the database for words containing `先` BUT filter `WHERE word_level <= N4`.
- **Impact:** This ensures the graph is always relevant to the learner's current ability.

---

### 2. UI/UX Wireframe (The "Solar System" Layout)

Since you are using React Flow, imagine a **force-directed layout**.

**A. The Canvas (Main View)**

- **Center Node (The Sun):** The current target word (e.g., `先生`).
- _Style:_ Large circle, bold text, definition in a tooltip on hover.

- **Orbiting Nodes (Planets):** The component Kanji (`先`, `生`).
- _Style:_ Medium squares or hexagons. distinct color from words.

- **Satellite Nodes (Moons):** Related words stemming from the Kanji.
- _Style:_ Small circles.
- _Position:_ Radiating outward from their respective Kanji.

**B. The Sidebar (Details Panel)**

- **Trigger:** When a user clicks any node.
- **Content:**
- **If Word:** Definition, audio pronunciation, sample sentence.
- **If Kanji:** Stroke order animation (SVG), On/Kun readings list, and meaning.
- **Action:** "Add to Flashcards" button (Crucial for WatashiWa integration).

---

### 3. Backend Architecture (PostgreSQL)

You do not need a Graph DB yet. A relational schema with **Recursive Common Table Expressions (CTEs)** is sufficient and easier to host.

#### Data Sources

1. **JMdict (XML):** For vocabulary (English meanings, readings, JLPT levels).
2. **KANJIDIC2 (XML):** For Kanji details (Stroke count, meanings, readings).
3. **Use a Parser:** Do not parse XML at runtime. Use a script (Python/Node) to parse these once and seed your Postgres DB.

#### Database Schema

You need a Many-to-Many relationship between Kanji and Words.

```sql
-- 1. The Kanji Table (Source: KANJIDIC2)
CREATE TABLE kanji (
    id SERIAL PRIMARY KEY,
    character CHAR(1) NOT NULL UNIQUE, -- e.g., '先'
    meaning TEXT[], -- Array of meanings
    onyomi TEXT[],
    kunyomi TEXT[],
    jlpt_level INT -- 5 to 1
);

-- 2. The Word Table (Source: JMdict)
CREATE TABLE words (
    id SERIAL PRIMARY KEY,
    kanji_spelling VARCHAR(50) NOT NULL, -- e.g., '先生'
    kana_reading VARCHAR(50) NOT NULL, -- e.g., 'せんせい'
    meanings JSONB, -- Flexible storage for definitions
    jlpt_level INT
);

-- 3. The Composition Map (The Graph Edges)
-- This is the most important table.
CREATE TABLE kanji_composition (
    word_id INT REFERENCES words(id),
    kanji_id INT REFERENCES kanji(id),
    position INT, -- Is it the 1st, 2nd, or 3rd char in the word?
    active_reading VARCHAR(20), -- How is this SPECIFIC kanji read in this word? (e.g. 'SEI')
    reading_type VARCHAR(10), -- 'ONYOMI' or 'KUNYOMI' (Derived during data seeding)
    PRIMARY KEY (word_id, kanji_id, position)
);

```

**The Logic for `active_reading`:**

- This is hard to automate perfectly.
- _Heuristic for MVP:_ If the word is `先生` (sensei) and the kanji is `先` (sen), you can string-match the kana reading to the kanji position.

---

### 4. Frontend Implementation (React Flow)

React Flow is excellent, but you need to customize it to avoid it looking like a generic diagram.

**Technical Stack Recommendations:**

- **Library:** `reactflow` (or `@xyflow/react`).
- **Layout Engine:** `dagre` (for tree hierarchy) or `d3-force` (for organic clusters). _I recommend `d3-force` for this "constellation" feel._

**Implementation Details:**

1. **Custom Nodes:**
   Do not use the default rectangle. Create a `KanjiNode.tsx` and `WordNode.tsx`.

- `KanjiNode`: Needs to look "foundational" (maybe a stone texture or solid color).
- `WordNode`: Needs to look "clickable" (pill shape).

1. **Custom Edges:**
   Create a `ReadingEdge.tsx`.

- Use the `label` prop in React Flow to show the reading (e.g., "sen") explicitly on the line.
- Use SVG patterns (dashed vs solid) to indicate Onyomi/Kunyomi.

1. **State Management (Zustand/Redux):**

- Store the `graphData` (nodes and edges).
- Action `expandNode(nodeId)`: Fetches data from API -> Adds new nodes to `graphData` -> React Flow re-renders.

\_-------
This is the "Brain" of your backend. Since Japanese dictionaries (JMdict) provide the whole word (`先生`) and the whole reading (`せんせい`), they **do not** explicitly tell you which Kanji maps to which sound.

You need to build an **ETL (Extract, Transform, Load)** pipeline. Here is the high-level strategy to solve this puzzle and seed your database.

### The 3-Step Strategy (ETL Pipeline)

#### Step 1: Ingest the "Atoms" (KANJIDIC2)

First, you need a reference library of every individual Kanji.

1. **Extract:** Iterate through every entry in the KANJIDIC2 XML file.
2. **Transform:**

- Grab the literal character (e.g., `先`).
- Grab the **On'yomi** (Chinese readings) and **Kun'yomi** (Japanese readings) separately.
- Store the JLPT level (vital for your "Fog of War" feature).

1. **Load:** Insert these into your `kanji` table.

- _Result:_ Your database now knows that `先` exists and can be read as `SEN` (On) or `saki` (Kun).

#### Step 2: Ingest the "Molecules" (JMdict)

Now, process the vocabulary.

1. **Extract:** Iterate through JMdict entries.
2. **Filter (Crucial):** JMdict is massive. Filter out words that are:

- Obscure (marked as "archaic").
- Names of places/people (usually marked as `nam`).
- Keep only words with "common" priority flags (like `news1`, `ichi1`) or JLPT tags.

1. **Load:** Insert the word text (`先生`) and full reading (`せんせい`) into your `words` table.

#### Step 3: The "Matcher" Logic (The Hard Part)

This is where the magic happens. You need to fill the `kanji_composition` table by figuring out the links.

**The Algorithm:**
Loop through every `Word` you just inserted and look at its Kanji.

- **Example Case:** Word is `先生` (Sensei).
- **Kanji 1:** `先`
- **Kanji 2:** `生`

**The Heuristic Check (How to find the reading):**

1. **Lookup:** Query your `kanji` table for `先`. Get its list of known readings: `[SEN, saki, ma]`.
2. **Scan:** Look at the start of the word's reading (`sensei`).
3. **Match:** Does the word reading start with any of `先`'s known readings?

- _Check:_ Does it start with `SEN`? **Yes.**
- _Action:_ Assign `SEN` to `先`.
- _Remainder:_ The remaining sound is `sei`.

1. **Repeat:** Take the remainder (`sei`) and check the next Kanji (`生`).

- _Check:_ Does `生` have `SEI` in its known readings? **Yes.**
- _Action:_ Assign `SEI` to `生`.

1. **Validation:** If you have 0 sounds left and 0 Kanji left, you have a **Perfect Match**.
2. **Load:** Insert two rows into `kanji_composition`:

- `先生` + `先` + `active_reading: SEN` + `type: ONYOMI`
- `先生` + `生` + `active_reading: SEI` + `type: ONYOMI`

---

### What happens when the logic fails? (Edge Cases)

Sometimes, the heuristic fails (e.g., `明日` is "ashita" — irregular reading, neither Kanji maps cleanly).

- **The "Jukujikun" Trap:** These are words where the reading is applied to the _entire word_, not individual characters.
- **Strategy:** If your "Matcher" algorithm cannot find a clean split, **mark the edge as "Special/Irregular".**
- In your UI, when the user clicks the edge, instead of showing a specific reading, show a label "Special Reading" (Ateji/Jukujikun). This is pedagogically correct and saves you from writing impossible parsing logic.

### Recommended Tooling

Do not write XML parsers from scratch. Use Python libraries that have already solved this:

- **`jamdict` (Python):** A library that already interacts with JMdict/KanjiDic. It can save you weeks of work.
- **`mecab-python3`:** If you get stuck on splitting readings, you can pass the word to MeCab (a Japanese morphological analyzer) to see how it splits the tokens, though this is overkill for a start.
