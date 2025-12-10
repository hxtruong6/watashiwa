# Technical Specification

## 1. Tech Stack

- **Frontend:** Next.js (App Router), React, Ant Design (antd), pnpm
- **Backend:** Next.js API Routes (Serverless functions). Python (Optional for complex NLP tasks if Node.js SDK is insufficient, otherwise Node.js preferred for simplicity).
- **Database:** PostgreSQL (via Supabase).
- **ORM:** Prisma.
- **AI/LLM:** OpenAI API (GPT-4o or GPT-3.5-turbo).
- **Audio:** Web Speech API (`SpeechSynthesisUtterance`) for MVP.

## 2. Architecture Overview

The application follows a standard Next.js Serverless architecture.

- **Client:** React components handle UI and state. Fetches data via SWR or React Query.
- **API Layer:** `/app/api/...` endpoints handle secure database operations and AI calls.
- **Database:** Hosted PostgreSQL.

## 3. Data Model

### `VocabCard` Table

Primary entity for the SRS system.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `word_surface` | String | The word (e.g., 学生) |
| `reading_kana` | String | Kana reading (e.g., がくせい) |
| `kanji_breakdown` | JSONB | e.g., `[{"kanji": "学", "han_viet": "HỌC", "meaning": "study"}]` |
| `han_viet` | String | Full Hán Việt (e.g., Kim, mộc, tĩnh, tâm, Học) |
| `meaning` | String | Native definition |
| `example_sentence` | JSONB | `{ "sentence": "...", "translation": "..." }` |
| `next_review` | DateTime | When the card is due next |
| `interval` | Integer | Days until next review (current SRS stage) |
| `ease_factor` | Float | SM-2 multiplier (default 2.5) |
| `repetition_count` | Integer | Consecutive correct answers |

## 4. API Design Guidelines

- **RESTful**: standard methods (`GET`, `POST`, `PUT`, `DELETE`).
- **Response Format**: JSON `{ data: ..., error: null }`.
- **Authentication**: Usage of Middleware for protected routes.
