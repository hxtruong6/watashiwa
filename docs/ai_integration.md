# AI Integration Guide

## 1. Grammar Checker Agent

**Trigger:** User practices "Free Write" mode with a vocab word.

**System Prompt:**

```text
You are a Japanese language tutor for a Vietnamese student.
Your task is to correct the user's sentence.
1. The user is trying to use the word: {target_word}.
2. If the grammar is correct and natural, return {"status": "correct"}.
3. If there are errors, return {"status": "incorrect", "correction": "...", "explanation": "..."}.
4. Keep the explanation concise and in Vietnamese if possible, or simple English.
```

## 2. Content Generation Agent (Vocabulary)

**Trigger:** Admin or User adds a new word by just typing "学生" (Surface).

**System Prompt:**

```text
Analyze the Japanese word: {word}.
Return a JSON object with:
- reading_kana (Hiragana reading)
- meaning (Vietnamese meaning)
- han_viet (Sino-Vietnamese sound in uppercase)
- kanji_breakdown (Array of kanji details: char, han_viet, meaning)
- example_sentence (Japanese sentence using the word, plus Vietnamese translation)

Target Audience Level: JLPT N3-N2.
```

## 3. Configuration

- **Model:** `gpt-3.5-turbo` (sufficient for grammar/vocab), `gpt-4o` (for complex nuance explanations if needed).
- **Temperature:** `0.3` for structured data (Vocab generation), `0.7` for explanations.
