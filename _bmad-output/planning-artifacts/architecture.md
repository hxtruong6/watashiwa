---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
phase: 3
focus: Story Engine, Knowledge Graph, Semantic Algorithm
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2025-12-31'
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-watashi-jp-2025-12-30.md
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - docs/phase3_plan.md
  - docs/architecture.md
  - docs/project-overview.md
workflowType: 'architecture'
project_name: 'watashi-jp'
user_name: 'iDev'
date: '2025-12-31'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

The project defines 58 functional requirements organized into 6 major capability areas:

1. **Semantic Learning Engine (9 FRs)**: Core algorithm capabilities including semantic word sequencing based on contextual relationships (not just time intervals), algorithm mode switching, relationship detection and presentation, contextual example generation, and adaptive learning based on user patterns.

2. **Knowledge Graph System (9 FRs)**: Interactive visualization of vocabulary as semantic networks, graph navigation and exploration, progressive network building, search/filter capabilities, and relationship highlighting during study sessions.

3. **Smart Intervention System (8 FRs)**: Automatic confusion pattern detection (homonyms, readings, pitch variations), targeted intervention delivery, multi-modal feedback (visual, audio, textual), and adaptive intervention intensity.

4. **Vietnamese-First Learning Experience (8 FRs)**: Native Vietnamese interface throughout, Hán Việt knowledge integration as semantic bridges, culturally relevant examples, and language toggling capabilities.

5. **Learning Session Management (8 FRs)**: Seamless study sessions with semantic word presentation, cross-device session continuity, customizable session parameters, and semantic connection summaries.

6. **User Account & Personalization (8 FRs)**: Profile management with Vietnamese preferences, cross-device synchronization, learning data export, and personalized semantic pathway generation.

7. **Quality Assurance & Validation (8 FRs)**: A/B testing framework for algorithm validation, content quality validation for AI-generated examples, and research insights with privacy protection.

**Non-Functional Requirements:**

**Performance:**

- Algorithm responsiveness: <500ms for semantic relationship queries, <200ms for graph operations
- Content loading: <1s for knowledge graph rendering (50+ nodes), <200ms for language switching
- Scalability: Maintain <500ms algorithm response with 10,000+ concurrent users, 100+ req/sec API capacity
- Mobile performance: PWA offline activation <2s, <100ms card transitions

**Security:**

- Data encryption: AES-256 at rest, TLS 1.3 in transit
- Authentication: JWT tokens with expiration policies, OAuth 2.0 for API access
- Privacy compliance: COPPA/FERPA guidelines for educational data, Vietnamese user data protection

**Scalability:**

- User capacity: 10,000+ concurrent learning sessions
- Data volume: Efficient knowledge graph storage scaling, extensive learning history support
- Infrastructure: Load balancing for 10x traffic spikes, multi-region deployment capability

**Accessibility:**

- WCAG 2.1 AA compliance across all interfaces
- Vietnamese-specific: Screen reader support with pronunciation guides, Vietnamese input method support
- Multi-modal feedback: Visual, audio, and haptic accommodations

**Reliability:**

- Availability: 99.5% uptime for core learning, 99.9% for semantic algorithm services
- Data integrity: ACID compliance for knowledge graphs, <4 hours data loss in worst-case scenarios
- Error handling: Graceful degradation, automatic SRS fallback, Vietnamese error messaging

**Scale & Complexity:**

- **Primary domain:** Full-stack web application (Next.js PWA with mobile-first design)
- **Complexity level:** Medium-High
  - Real-time semantic algorithm processing
  - Interactive knowledge graph visualization (SVG/Canvas)
  - AI content generation pipeline (Phase 3)
  - Multi-modal feedback systems
  - Cross-device synchronization
- **Estimated architectural components:** 8-10 major modules
  - Authentication (Supabase integration)
  - Study session orchestration
  - Flashcard/SRS engine
  - Knowledge graph system
  - Smart intervention engine
  - Story/Priming system (Phase 3)
  - Dashboard/analytics
  - Deck/Course management

### Technical Constraints & Dependencies

**Current Technology Stack (Must Maintain):**

- **Framework:** Next.js 16.1.1 (App Router) - Server Components + Client Components pattern
- **Database:** PostgreSQL with Prisma 7.2.0 ORM - JSONB support for flexible content
- **UI Library:** Ant Design 6.1.2 - NO Tailwind CSS (explicit constraint)
- **State Management:** Zustand 5.0.9 - Lightweight global state
- **Architecture Pattern:** Vertical Slice Architecture (feature-first organization) - Must maintain module boundaries

**Phase 3 Specific Constraints (Current Phase):**

- **Story Engine:** Story model with JSONB content schema, StoryLog tracking for user progress
- **AI Content Factory:** LLM-based story generation with JSON validation (Zod schemas)
- **Priming Logic:** Deck-specific story checks (only when `deckId` present), soft gates (toasts/warnings, not hard redirects)
- **Performance:** Story content rendering with highlighted keywords, audio playback <200ms

**External Dependencies:**

- **Supabase Auth:** OAuth and email/password authentication
- **PostHog 1.310.1:** Analytics tracking (story events, priming conversion)
- **Sentry 10.32.1:** Error monitoring and performance tracking
- **External LLM APIs:** Story generation (Phase 3) - GPT-4o for content creation

**Performance Constraints:**

- Algorithm queries must complete in <500ms (critical for UX)
- Knowledge graph rendering <1s for 50+ node networks
- PWA offline functionality required for core learning features
- Mobile-first: 44px minimum touch targets, thumb-zone optimization

**Regulatory & Compliance:**

- COPPA/FERPA compliance for educational user data
- Vietnamese data privacy requirements
- Third-party AI service compliance (story generation data processing)

### Cross-Cutting Concerns Identified

1. **Semantic Algorithm Performance**
   - Affects: Study sessions, knowledge graph queries, intervention triggers
   - Challenge: Real-time relationship calculations must maintain <500ms response time with 10,000+ concurrent users
   - Solution approach: Algorithm optimization, caching strategies, potential background processing

2. **Vietnamese Localization**
   - Affects: All UI components, error messages, accessibility features, content generation
   - Challenge: Full Vietnamese-first interface with Hán Việt integration, screen reader support
   - Solution approach: Component-level localization, Vietnamese ARIA labels, cultural adaptation

3. **Offline/PWA Capability**
   - Affects: Study sessions, progress tracking, story content access, knowledge graph exploration
   - Challenge: Core learning features must work offline, session continuity across interruptions
   - Solution approach: Service worker caching, IndexedDB for local state, background sync

4. **Multi-Modal Feedback**
   - Affects: Smart interventions, story keyword interactions, accessibility compliance
   - Challenge: Visual, audio, and haptic feedback must trigger within <50ms of user actions
   - Solution approach: Pre-loaded audio assets, optimized animation libraries, haptic API integration

5. **Knowledge Graph Data Structure**
   - Affects: Graph visualization, semantic sequencing algorithm, relationship queries
   - Challenge: Efficient storage and querying of complex relationship networks, <200ms query times
   - Solution approach: Optimized JSONB schema, graph database considerations, indexing strategy

6. **Story Content Management (Phase 3)**
   - Affects: AI generation pipeline, content validation, user progress tracking
   - Challenge: LLM-generated content quality, validation pipeline, graceful degradation
   - Solution approach: Zod schema validation, human-in-the-loop review, content status workflow

7. **Cross-Device Synchronization**
   - Affects: Session continuity, progress tracking, user preferences, knowledge graph state
   - Challenge: Seamless experience across mobile PWA, tablet, and desktop
   - Solution approach: Real-time sync via Supabase, optimistic UI updates, conflict resolution

8. **Algorithm Fallback (SRS)**
   - Affects: Reliability, error handling, user experience during semantic algorithm failures
   - Challenge: Automatic fallback to traditional SRS when semantic processing fails
   - Solution approach: Circuit breaker pattern, health checks, transparent mode switching

### Architectural Implications

**High Complexity Areas Requiring Special Attention:**

1. **Semantic Algorithm Engine**
   - Real-time relationship calculations with strict performance requirements
   - Adaptive learning based on user patterns
   - A/B testing framework for algorithm validation
   - Fallback mechanisms to traditional SRS

2. **Knowledge Graph Visualization**
   - Interactive SVG/Canvas rendering with 50+ nodes
   - Real-time relationship updates during study sessions
   - Mobile-optimized touch interactions
   - Accessibility support for screen readers

3. **Story Priming System (Phase 3)**
   - Deck-specific story logic (only when `deckId` present)
   - Soft gate implementation (toasts/warnings, not hard redirects)
   - Skip handling and graceful degradation
   - StoryLog tracking for user progress

4. **AI Content Generation Pipeline (Phase 3)**
   - LLM integration for story generation
   - Content validation using Zod schemas
   - Quality control and human review workflow
   - Cost optimization for 50+ units

**Critical Performance Paths:**

1. **Study Session Initialization Flow:**
   - Priming check (if `deckId` present) → Story fetch → StoryLog verification → Card fetch → Algorithm selection
   - Must complete in <3s on 3G connections

2. **Knowledge Graph Query Path:**
   - Relationship calculation → Graph data fetch → Visualization rendering
   - Must complete in <200ms for queries, <1s for 50+ node rendering

3. **Story Content Rendering:**
   - Story fetch → Content parsing → Keyword highlighting → Audio pre-loading
   - Must support interactive keyword tapping with <200ms audio playback

**Integration Points:**

- **Supabase Auth:** User authentication and session management
- **PostHog Analytics:** Story events (`STORY_OPENED`, `KEYWORD_TAPPED`, `STORY_COMPLETED`, `PRIMING_CONVERSION`)
- **Sentry:** Error monitoring for semantic algorithm, story generation, and graph visualization
- **External LLM APIs:** Story generation with validation and quality control

## Starter Template Evaluation

### Primary Technology Domain

**Full-stack web application (Next.js PWA)** - The project is a brownfield application with an established Next.js 16.1.1 codebase using the App Router pattern. No new starter template evaluation is needed; the current setup serves as the architectural foundation.

### Current Foundation Analysis

**Note:** This is an existing project, not a greenfield setup. The current codebase already provides a production-ready foundation with the following architectural decisions established:

### Architectural Decisions Provided by Current Setup

**Language & Runtime:**

- **TypeScript 5** with strict mode enabled
- **ES2023** target with modern JavaScript features
- **React 19.2.3** with React Server Components support
- **Next.js 16.1.1** with App Router (Server Components + Client Components pattern)
- Path aliases configured (`@/*` → `./src/*`)

**Styling Solution:**

- **Ant Design 6.1.2** - Component library (explicit constraint: NO Tailwind CSS)
- **Framer Motion 12.23.26** - Animation library for rich interactions
- **next-themes 0.4.6** - Theme management (dark/light mode support)
- **CSS Modules** - Component-scoped styling (inferred from project structure)

**Build Tooling:**

- **Next.js Turbopack** - Development server with fast refresh
- **Next.js Image Optimization** - AVIF/WebP formats, responsive image sizes
- **Package Import Optimization** - Tree-shaking for Ant Design, Framer Motion, Zustand, etc.
- **Production Console Removal** - Automatic console.log removal in production builds
- **Sentry Integration** - Source map upload and error tracking configured

**Testing Framework:**

- **Vitest 4.0.16** - Unit and integration testing with React Testing Library
- **Playwright 1.57.0** - E2E testing framework
- **jsdom** - DOM environment for unit tests
- **Test Database Setup** - Docker Compose configuration for integration tests

**Code Organization:**

- **Vertical Slice Architecture** - Feature-first organization (`src/modules/`)
- **App Router Structure** - Next.js 16 App Router with route groups
- **Module Pattern** - Each feature module contains components, actions, services, types
- **Shared Utilities** - `src/lib/` for database, theme, and common utilities

**Development Experience:**

- **ESLint 9** - Next.js core web vitals + TypeScript rules + Prettier integration
- **Prettier 3.7.4** - Code formatting with tab indentation
- **Husky** - Git hooks for pre-commit checks
- **TypeScript Path Aliases** - `@/*` imports for cleaner imports
- **Turbopack Dev Server** - Fast development experience

**Internationalization:**

- **next-intl 4.6.1** - Multi-language support (en, vi, ja)
- **Vietnamese-First** - Primary interface language support

**State Management:**

- **Zustand 5.0.9** - Lightweight global state (session management, preferences)
- **React Server Components** - Server-side state via Server Components
- **Server Actions** - Type-safe mutations with Zod validation

**Database & ORM:**

- **PostgreSQL** - Relational database with JSONB support
- **Prisma 7.2.0** - Type-safe ORM with migrations
- **Database Scripts** - Generate, migrate, push, seed, studio commands

**External Integrations:**

- **Supabase Auth** - OAuth and email/password authentication
- **PostHog 1.310.1** - Analytics and user behavior tracking
- **Sentry 10.32.1** - Error monitoring and performance tracking
- **Google Cloud Storage** - File storage for media assets
- **Google GenAI** - AI content generation (Phase 3 story generation)

**Specialized Libraries:**

- **ts-fsrs 5.2.3** - FSRS algorithm for spaced repetition
- **react-force-graph-2d** - Knowledge graph visualization
- **Three.js 0.182.0** - 3D graphics (Memory Garden)
- **@react-three/fiber** - React renderer for Three.js
- **canvas-confetti** - Celebration animations
- **web-push** - Push notification support

### Rationale for Current Foundation

The existing setup provides:

1. **Production-Ready Configuration**: All essential tools configured (testing, linting, formatting, error monitoring)
2. **Performance Optimizations**: Package import optimization, image optimization, console removal
3. **Type Safety**: TypeScript strict mode + Prisma type generation + Zod validation
4. **Developer Experience**: Fast dev server (Turbopack), path aliases, comprehensive tooling
5. **Architectural Alignment**: Vertical Slice Architecture already established, matches project requirements
6. **Phase 3 Readiness**: AI integration (Google GenAI) and JSONB support (Prisma) ready for story generation

### Architectural Decisions Already Made

✅ **Framework**: Next.js 16.1.1 App Router (matches requirements)  
✅ **UI Library**: Ant Design 6.1.2 (matches requirements, NO Tailwind)  
✅ **Database**: PostgreSQL + Prisma (matches requirements)  
✅ **State Management**: Zustand (matches requirements)  
✅ **Architecture Pattern**: Vertical Slice (matches requirements)  
✅ **Internationalization**: next-intl (supports Vietnamese-first requirement)  
✅ **Testing**: Vitest + Playwright (comprehensive test coverage)  
✅ **Error Monitoring**: Sentry (production-ready)  
✅ **Analytics**: PostHog (ready for Phase 3 story events)

### Next Steps

Since the foundation is already established and aligns with all architectural requirements, we can proceed directly to making specific architectural decisions for:

1. **Phase 3 Story Engine** - Story model schema, StoryLog tracking, priming logic
2. **Knowledge Graph System** - Data structure, query optimization, visualization approach
3. **Semantic Algorithm** - Performance optimization, caching strategy, fallback mechanisms
4. **PWA Capabilities** - Service worker configuration, offline support, background sync

**Note:** No project initialization needed - the codebase is already established and ready for Phase 3 implementation.

## Core Architectural Decisions

### Decision Priority Analysis

**Already Decided (from existing setup):**

- Framework: Next.js 16.1.1 App Router
- Database: PostgreSQL + Prisma 7.2.0
- UI Library: Ant Design 6.1.2
- State Management: Zustand 5.0.9
- Architecture Pattern: Vertical Slice
- Testing: Vitest + Playwright
- Authentication: Supabase Auth
- Analytics: PostHog
- Error Monitoring: Sentry

**Critical Decisions for Phase 3 Implementation:**

1. ✅ **Story Engine Data Architecture** - DECIDED: Strict Zod Schema Validation (already implemented)
2. **Priming Logic Flow** - Deck-specific checks, soft gates, skip handling
3. **AI Content Generation Pipeline** - LLM integration, validation workflow, quality control
4. **Knowledge Graph Data Structure** - Relationship storage, query optimization
5. **Semantic Algorithm Performance** - Caching strategy, fallback mechanisms

**Important Decisions (Shape Architecture):**

- PWA/Offline Strategy - Service worker configuration, IndexedDB usage
- Real-time Updates - WebSocket vs polling for knowledge graph
- Content Delivery - Story audio storage and CDN strategy

### Data Architecture

#### Story Engine Data Architecture

**Decision:** Use Strict Zod Schema Validation for Story Content

**Status:** ✅ Already Implemented

**Decision Record:**

**Context:** Phase 3 Story Engine requires robust data architecture for Story model JSONB content. The Story model stores AI-generated content with title, body text, and highlighted keywords that must be validated for type safety and content quality.

**Options Considered:**

1. **Strict Zod Schema Validation** (Selected)
   - Full TypeScript type inference
   - Runtime validation at creation and retrieval
   - Matches existing codebase patterns (CardVariant, Etymology)
   - Clear error messages for AI pipeline debugging

2. **Flexible JSONB with Minimal Validation** (Rejected)
   - Too risky for AI-generated content
   - No type safety
   - Difficult to catch hallucinations early

**Rationale:**

1. **Consistency**: Matches existing JSONB validation pattern used throughout codebase
2. **Type Safety**: Full TypeScript support with `z.infer<typeof StoryContentSchema>`
3. **AI Pipeline Safety**: Validates LLM-generated content before database storage
4. **Developer Experience**: Autocomplete, type checking, clear error messages
5. **Maintainability**: Schema changes are explicit and testable

**Implementation Details:**

- **Schema Location**: `src/lib/schemas/jsonb.ts` (lines 52-70)
- **Schema Name**: `StoryContentSchema`
- **Type Export**: `StoryContent` (inferred type)
- **Schema Structure**:

  ```typescript
  export const StoryContentSchema = z
  	.object({
  		title: LocalizedStringSchema,
  		body_text: z.string(),
  		translation: LocalizedStringSchema.optional(),
  		highlights: z.array(StoryHighlightSchema),
  	})
  	.strict();
  ```

**Validation Strategy:**

1. **AI Generation**: Validate immediately after LLM response, before database write
   - Location: `scripts/generate_stories.ts`
   - Purpose: Catch invalid content before storage
   - Error Handling: Log validation failures, retry generation if needed

2. **Story Creation**: Validate in server action before Prisma create
   - Location: `src/modules/story/actions.ts` (to be created)
   - Purpose: Ensure data integrity on manual story creation
   - Error Handling: Return user-friendly errors to admin

3. **Story Retrieval**: Defensive validation recommended for Phase 3
   - Location: `src/modules/story/actions.ts` (getStoryByDeckId)
   - Purpose: Handle corrupted data gracefully
   - Error Handling: Return null, log error for admin review

**Trade-offs Accepted:**

- **Performance**: ~1-2ms validation overhead per story (acceptable for creation/retrieval)
- **Flexibility**: Schema changes require code updates (intentional change management)
- **Complexity**: Additional validation layer (worth it for AI-generated content safety)

**Related Decisions:**

- StoryLog tracking: Separate model for user progress (already in Phase 3 plan)
- Content Status workflow: Use existing `ContentStatus` enum pattern (DRAFT → AI_GENERATED → VERIFIED → PUBLISHED)
- Audio storage: CDN strategy (separate decision needed)

**Validation Points Checklist:**

- [ ] AI generation script validates before database write
- [ ] Story creation server action validates input
- [ ] Story retrieval includes defensive validation
- [ ] Unit tests for invalid content scenarios

#### Priming Logic Flow Architecture

**Decision:** Deck-Specific Story Priming with Soft Gates

**Status:** ⚠️ To Be Implemented (Phase 3)

**Decision Record:**

**Context:** Phase 3 requires a "soft gate" system that encourages users to read stories before studying, but never blocks them from accessing flashcards. The system must check for stories only when a specific `deckId` is present, and gracefully handle all edge cases.

**Options Considered:**

1. **Deck-Specific Priming with Soft Gates** (Selected)
   - Check priming only when `deckId` parameter present
   - Soft gates: Toasts/warnings, not hard redirects
   - Skip handling: User can skip, system remembers preference
   - Graceful degradation: Network errors don't block study

2. **Hard Gate (Blocking)** (Rejected)
   - ❌ Violates "Zen" UX principle
   - ❌ Creates frustration for power users
   - ❌ No graceful degradation

3. **Always Show Priming** (Rejected)
   - ❌ Doesn't respect user preferences
   - ❌ Shows priming even when user already read story
   - ❌ Poor UX for returning users

**Rationale:**

1. **User Experience**: Soft gates preserve "Zen" feel while encouraging story reading
2. **Flexibility**: Users can skip without frustration, system adapts to preferences
3. **Performance**: Priming check only when needed (deckId present), not on every session
4. **Reliability**: Graceful degradation ensures study is never blocked by priming failures
5. **Analytics**: Track priming conversion without forcing behavior

**Implementation Architecture:**

**Location:** `src/modules/study/actions.ts` (new function: `getSessionDataWithPriming`)

**Flow Logic:**

```text
User Action → Study Page
    ↓
[Has deckId parameter?]
    ├─ NO → Skip Priming Check → Fetch Cards (Global/Course Session)
    └─ YES → getSessionDataWithPriming({ deckId })
            ↓
        [Story exists for deck?]
            ├─ NO → Skip Priming → Fetch Cards
            └─ YES → [StoryLog entry exists?]
                    ├─ YES → Skip Priming → Fetch Cards
                    └─ NO → [User skipped before?]
                            ├─ YES → Skip Priming → Fetch Cards
                            └─ NO → Return { requiresPriming: true, story }
                                    ↓
                                SessionController shows StoryReader
                                    ↓
                                User reads story → Clicks "Begin Training"
                                    ↓
                                createStoryLog() → Fetch Cards → Start Session
```

**Server Action: `getSessionDataWithPriming`**

```typescript
export async function getSessionDataWithPriming(input: { deckId: string }) {
	// 1. Check if story exists for deck
	const story = await prisma.story.findFirst({
		where: { unitId: input.deckId, contentStatus: 'PUBLISHED' },
	});

	if (!story) {
		return { requiresPriming: false, story: null };
	}

	// 2. Check if user has read story (StoryLog entry)
	const userId = await getCurrentUserId();
	const storyLog = await prisma.storyLog.findUnique({
		where: { userId_storyId: { userId, storyId: story.id } },
	});

	if (storyLog) {
		return { requiresPriming: false, story: null };
	}

	// 3. Validate story content (defensive validation)
	const validatedContent = StoryContentSchema.safeParse(story.content);
	if (!validatedContent.success) {
		// Log error, return null story
		console.error('Invalid story content:', validatedContent.error);
		return { requiresPriming: false, story: null };
	}

	// 4. Return story for priming
	return {
		requiresPriming: true,
		story: { ...story, content: validatedContent.data },
	};
}
```

**Integration Points:**

1. **Study Page (`src/app/study/page.tsx`)**
   - Passes `deckId` to `SessionController` when present
   - No priming check at page level (delegated to SessionController)

2. **SessionController (`src/modules/study/components/Session/SessionController.tsx`)**
   - Calls `getSessionDataWithPriming` in `useEffect` initialization
   - Manages `studyPhase` state: 'priming' → 'quiz'
   - Handles skip logic: `hasSkippedPriming` state

3. **StoryReader Component (`src/modules/study/components/Priming/StoryReader.tsx`)**
   - Renders story content with highlighted keywords
   - Handles "Begin Training" button → calls `createStoryLog` action
   - Handles "Skip to Cards" button → sets `hasSkippedPriming = true`

**Edge Cases & Graceful Degradation:**

1. **Network Error During Priming Check:**
   - **Behavior**: Try-catch in `getSessionDataWithPriming` → Return `{ requiresPriming: false }`
   - **User Impact**: Can still study, priming silently skipped
   - **Logging**: Error logged to Sentry for monitoring

2. **Story Content Validation Fails:**
   - **Behavior**: Defensive validation returns `null` story
   - **User Impact**: Priming skipped, proceeds to cards
   - **Admin Action**: Error logged, story flagged for review

3. **User Skips Story:**
   - **Behavior**: Click "Skip to Cards" → `hasSkippedPriming = true` (session state)
   - **Analytics**: Track `PRIMING_SKIPPED` event
   - **Next Session**: Priming check skipped for same deck in same session
   - **Future Sessions**: Priming check runs again (user can change mind)

4. **Story Marked as Read Fails:**
   - **Behavior**: Optimistic UI - allow proceeding even if API fails
   - **User Impact**: Can study immediately, story may show again next time
   - **Background Retry**: Could be added in Phase 4

5. **Authorization Failure:**
   - **Behavior**: `getSessionDataWithPriming` returns `null` if user can't access deck
   - **User Impact**: No priming shown, proceeds to normal flow
   - **Security**: Authorization check happens before priming check

**State Management:**

- **Session State**: `hasSkippedPriming` (Zustand store or component state)
- **Story State**: `requiresPriming`, `story` (fetched in SessionController)
- **StoryLog**: Database record (persistent across sessions)

**Performance Considerations:**

- **Priming Check**: Single database query (Story + StoryLog join)
- **Caching**: Story content can be cached if frequently accessed
- **Lazy Loading**: Story content only fetched when `requiresPriming === true`

**Analytics Events:**

- `STORY_OPENED`: When StoryReader component mounts
- `KEYWORD_TAPPED`: When user taps highlighted word
- `STORY_COMPLETED`: When user clicks "Begin Training"
- `PRIMING_SKIPPED`: When user clicks "Skip to Cards"

**Implementation Checklist:**

- [ ] Create `getSessionDataWithPriming` server action
- [ ] Create `createStoryLog` server action
- [ ] Update `SessionController` to check priming on initialization
- [ ] Create `StoryReader` component with keyword highlighting
- [ ] Add "Skip to Cards" button with skip state management
- [ ] Implement defensive story content validation
- [ ] Add error handling and graceful degradation
- [ ] Add analytics events (PostHog)
- [ ] Unit tests for priming logic flow
- [ ] E2E tests for priming scenarios

#### AI Content Generation Pipeline

**Decision:** LLM-Based Story Generation with Zod Validation and Human Review Workflow

**Status:** ⚠️ Partially Implemented (Script exists, needs completion)

**Decision Record:**

**Context:** Phase 3 requires generating 50+ unit stories using AI. The pipeline must generate high-quality, validated content at scale while maintaining cost control and quality standards.

**Options Considered:**

1. **LLM Generation with Zod Validation + Human Review** (Selected)
   - Google GenAI (Gemini 2.5 Flash) for cost-effective generation
   - Zod schema validation ensures all required words are present
   - Human-in-the-loop review before publishing
   - Batch processing with rate limiting

2. **Manual Content Creation** (Rejected)
   - ❌ Not scalable for 50+ units
   - ❌ Time-consuming and expensive
   - ❌ Inconsistent quality

3. **Fully Automated (No Review)** (Rejected)
   - ❌ Risk of AI hallucinations
   - ❌ No quality control
   - ❌ Potential cultural insensitivity

**Rationale:**

1. **Scalability**: AI generation enables 50+ units in reasonable time
2. **Cost Control**: Gemini 2.5 Flash is cost-effective (~$0.05/story)
3. **Quality Assurance**: Zod validation + human review ensures quality
4. **Consistency**: Structured prompts ensure consistent format
5. **Maintainability**: Script-based approach allows iteration and improvement

**Implementation Architecture:**

**Script Location:** `scripts/generate_stories.ts` (already exists, needs completion)

**Pipeline Flow:**

```text
1. Input: Unit ID(s) from command line
   ↓
2. Fetch Vocabulary: prisma.vocabulary.findMany({ where: { unit: X } })
   ↓
3. Generate Prompt: "Japanese Novelist" role + vocabulary list
   ↓
4. Call Gemini API: gemini-2.5-flash with JSON response format
   ↓
5. Parse JSON Response: Extract story content
   ↓
6. Validate Content: StoryContentSchema.safeParse()
   ↓
7. Check Word Coverage: Verify all vocabulary words present in highlights
   ↓
8. Create Story Record: prisma.story.create({ contentStatus: 'AI_GENERATED' })
   ↓
9. Human Review: Admin reviews and sets contentStatus to 'VERIFIED' or 'PUBLISHED'
```

**Prompt Engineering Strategy:**

```typescript
const prompt = `You are a Japanese novelist writing educational stories for Vietnamese learners.

Task: Write a 100-word story using these ${vocabWords.length} vocabulary words:
${vocabWords.map((v) => `- ${v.surface} (${v.reading}) - ${v.meanings.vi}`).join('\n')}

Requirements:
1. Use "Mixed Language" format: English grammar structure with Japanese nouns/verbs
2. Story must be engaging and culturally appropriate
3. All ${vocabWords.length} words must appear naturally in the story
4. Highlight each vocabulary word when it appears

Return JSON:
{
  "title": { "en": "...", "vi": "..." },
  "body_text": "Story text with {1}, {2}, ... placeholders for highlights",
  "highlights": [
    { "vocab_id": "...", "word_surface": "...", "start_index": 0, "length": 5 }
  ]
}`;
```

**Validation Strategy:**

1. **Schema Validation**: `StoryContentSchema.safeParse()` ensures structure
2. **Word Coverage Check**: Verify all vocabulary words appear in highlights
3. **Content Quality Checks**:
   - Story length: 80-120 words
   - Highlight count matches vocabulary count
   - No duplicate highlights
   - Valid UUIDs for vocab_id references

**Cost Control:**

- **Model**: `gemini-2.5-flash` (~$0.05/story)
- **Rate Limiting**: 2 second delay between API calls
- **Batch Limit**: Max 10 units per run (prevents runaway costs)
- **Estimated Total**: ~$7.50 for 50 units (one-time cost)

**Quality Control Workflow:**

1. **Generation**: Script creates stories with `contentStatus: 'AI_GENERATED'`
2. **Admin Review**: Admin dashboard shows stories pending review
3. **Verification**: Admin reviews story, can edit if needed
4. **Publishing**: Admin sets `contentStatus: 'VERIFIED'` or `'PUBLISHED'`
5. **User Access**: Only `PUBLISHED` stories shown to users

**Error Handling:**

1. **API Failures**: Retry with exponential backoff (max 3 retries)
2. **Validation Failures**: Log error, skip story, continue with next unit
3. **Partial Failures**: Generate report of successful/failed units
4. **Rate Limiting**: Respect API rate limits, add delays between calls

**Implementation Details:**

**Script Structure:**

```typescript
// scripts/generate_stories.ts
- Command-line interface: Accept unit IDs
- Vocabulary fetching: Prisma query for unit vocabulary
- Prompt generation: Dynamic prompt with vocabulary list
- API calls: Google GenAI with rate limiting
- Validation: StoryContentSchema + word coverage check
- Database writes: Prisma story creation
- Error handling: Comprehensive try-catch with logging
- Progress reporting: Console output for each unit
```

**Server Action (Future):**

```typescript
// src/modules/story/actions.ts
export async function generateStoryForUnit(input: { unitId: string }) {
	// Admin-only action
	// Calls same generation logic as script
	// Returns generated story for review
}
```

**Related Decisions:**

- **Content Status Workflow**: Use existing `ContentStatus` enum (DRAFT → AI_GENERATED → VERIFIED → PUBLISHED)
- **Admin Dashboard**: Add story review interface (separate decision)
- **Audio Generation**: TTS for story audio (Phase 4 consideration)

**Implementation Checklist:**

- [ ] Complete `generate_stories.ts` script implementation
- [ ] Add word coverage validation
- [ ] Add rate limiting and error handling
- [ ] Add progress reporting and logging
- [ ] Create admin review interface for stories
- [ ] Add story editing capability for admins
- [ ] Add content status workflow enforcement
- [ ] Unit tests for generation logic
- [ ] Integration tests for API calls
- [ ] Cost monitoring and alerts
- [ ] Error logging for admin review of validation failures

### Decision Impact Analysis

**Phase 3 Implementation Sequence:**

1. **Story Engine Data Architecture** ✅ (Already Implemented)
   - Schema exists: `StoryContentSchema` in `src/lib/schemas/jsonb.ts`
   - Validation pattern established
   - Ready for use

2. **AI Content Generation Pipeline** ⚠️ (Script Exists, Needs Completion)
   - Script: `scripts/generate_stories.ts` (partially complete)
   - Validation logic implemented
   - Word coverage check implemented
   - Needs: Error handling improvements, admin review interface

3. **Priming Logic Flow** ⚠️ (To Be Implemented)
   - Requires: `getSessionDataWithPriming` server action
   - Requires: `createStoryLog` server action
   - Requires: `StoryReader` component
   - Requires: SessionController integration

**Cross-Component Dependencies:**

- **Story Model**: Must exist before priming logic can work
- **StoryLog Model**: Must exist before priming tracking works
- **SessionController**: Must integrate priming check before card fetch
- **StoryReader Component**: Depends on Story model and StoryLog actions
- **AI Generation Script**: Depends on Story model and validation schema

**Implementation Priority:**

1. **High Priority (Blocking Phase 3):**
   - Complete Story model migration (if not exists)
   - Complete StoryLog model migration
   - Complete AI generation script error handling
   - Implement `getSessionDataWithPriming` action
   - Implement `createStoryLog` action

2. **Medium Priority (Core Features):**
   - Create `StoryReader` component
   - Integrate priming check in SessionController
   - Add skip logic and state management
   - Add analytics events

3. **Low Priority (Polish):**
   - Admin review interface for stories
   - Story editing capability
   - Defensive validation on retrieval
   - Background retry for failed StoryLog creation

**Risk Mitigation:**

- **AI Generation Failures**: Script includes validation and error handling
- **Priming Check Failures**: Graceful degradation ensures study is never blocked
- **Content Quality**: Human review workflow prevents bad content from reaching users
- **Performance**: Priming check is single query, minimal overhead

#### Knowledge Graph Architecture

**Decision:** Etymology-Based Graph with Future Semantic Relationship Expansion

**Status:** ✅ Partially Implemented (Etymology Graph exists, semantic relationships planned)

**Decision Record:**

**Context:** The PRD requires a knowledge graph system that visualizes word relationships and enables semantic exploration. The current implementation uses etymology (shared kanji roots via Hán Việt), but the vision includes broader semantic relationships.

**Current Implementation:**

**Etymology Graph (Implemented):**

- **Location**: `src/modules/dashboard/components/etymology-graph/`
- **Visualization**: `react-force-graph-2d` for 2D force-directed graph
- **Data Source**: Shared kanji roots extracted from `Vocabulary.etymology` JSONB
- **Relationship Type**: Kanji-based connections (e.g., "学生" and "先生" share "生")
- **Performance**: Limits to 50 nodes, in-memory graph building (<50ms)

**Graph Building Algorithm:**

1. Fetch user's learned words (stability > 0)
2. Extract kanji roots from etymology.parts
3. Build edges: Words sharing ≥1 kanji root get connected
4. Visualize: Force-directed layout with node colors based on SRS stage

**Options for Semantic Relationship Expansion:**

1. **Etymology-Only (Current)** ✅ (Implemented)
   - Pros: Fast, simple, culturally relevant (Hán Việt)
   - Cons: Limited to kanji-based connections
   - Status: Working well for Vietnamese learners

2. **Hybrid Etymology + Semantic Tags** (Recommended for Future)
   - Add semantic tags to Vocabulary model (JSONB array)
   - Relationships: Etymology (kanji) + Semantic (meaning) + Contextual (usage)
   - Pros: Richer connections, supports PRD vision
   - Cons: Requires content tagging, more complex queries

3. **Vector Embeddings (pgvector)** (Deferred to V3)
   - Full semantic similarity using embeddings
   - Pros: Most accurate semantic relationships
   - Cons: Requires pgvector extension, embedding generation, complex queries
   - Status: Deferred per product_v3_roadmap.md

**Decision:** Maintain current etymology-based graph, plan for semantic tag expansion

**Rationale:**

1. **Current Value**: Etymology graph provides immediate value for Vietnamese learners
2. **Performance**: Current implementation meets <200ms query requirement
3. **Scalability**: 50-node limit handles current scale, can increase as needed
4. **Future Path**: Semantic tags can be added incrementally without breaking existing graph

**Data Structure:**

**Current (Etymology Graph):**

```typescript
interface EtymologyGraphNode {
	id: string; // vocabId
	wordSurface: string; // "学生"
	meaning: string; // Primary meaning
	stability: number; // FSRS stability
	srsStage: number; // 0=New, 1=Learning, 2=Review, 3=Relearning
	kanjiRoots: string[]; // ["学", "生"]
	isLeech: boolean; // lapses >= 3
}

interface EtymologyGraphEdge {
	source: string; // vocabId
	target: string; // vocabId
	sharedRoot: string; // "生" (the kanji connecting them)
}
```

**Future (Semantic Graph):**

```typescript
interface SemanticGraphNode extends EtymologyGraphNode {
	semanticTags: string[]; // ["education", "people", "profession"]
	relationships: {
		type: 'etymology' | 'semantic' | 'contextual';
		strength: number; // 0-1 relationship strength
		targetId: string;
	}[];
}
```

**Query Optimization:**

**Current Query Pattern:**

```typescript
// Single query with include
const reviews = await prisma.userReview.findMany({
	where: { userId, stability: { gt: 0 } },
	take: 100, // Fetch 2x limit to filter
	include: { vocab: { select: { id, wordSurface, meanings, etymology } } },
	orderBy: { stability: 'desc' },
});
// In-memory graph building: O(n²) for edge creation, but n ≤ 50
```

**Performance Characteristics:**

- **Query Time**: <100ms for 50 nodes (single Prisma query)
- **Graph Building**: <50ms in-memory (O(n²) but n ≤ 50)
- **Rendering**: <1s for 50 nodes (react-force-graph-2d)
- **Total**: <200ms query + <1s render = Meets <1s requirement

**Caching Strategy:**

1. **Request-Level Caching**: React `cache()` for server actions
2. **Client-Side Caching**: Consider SWR/React Query for graph data
3. **Future**: Redis caching for frequently accessed graphs (if needed)

**Visualization Architecture:**

**Component**: `EtymologyGraph.tsx`

- **Library**: `react-force-graph-2d` (2D force-directed graph)
- **Features**: Zoom, pan, hover tooltips, node click navigation
- **Styling**: Zen color palette (Matcha Green, Indigo, Vermilion)
- **Responsive**: Adapts to container width

**Future Enhancements:**

- 3D visualization option (Three.js integration)
- Filter by relationship type (etymology vs semantic)
- Search within graph
- Export graph as image

**Implementation Checklist:**

- [x] Etymology graph data fetching (implemented)
- [x] Graph visualization component (implemented)
- [ ] Semantic tag system (future)
- [ ] Relationship strength calculation (future)
- [ ] Graph search/filter functionality (future)
- [ ] Performance optimization for 100+ nodes (future)

#### Semantic Algorithm Architecture

**Decision:** Hybrid FSRS + Semantic Sequencing with Fallback

**Status:** ⚠️ Partially Implemented (FSRS exists, semantic sequencing to be added)

**Decision Record:**

**Context:** The PRD's core innovation thesis is "Semantic Connections > Perfect SRS Timing". The system should present words based on contextual relationships, not just SRS timing. However, FSRS provides proven retention benefits, so we need a hybrid approach.

**Current Implementation:**

**FSRS Foundation (Implemented):**

- **Location**: `src/modules/study/actions/getReviewQueue.ts`
- **Algorithm**: ts-fsrs 5.2.3 (FSRS v5)
- **Priority**: Due Reviews → Relearning → New Cards
- **Smart Layer**: Pacing control, intervention triggers, focus metrics

**Semantic Sequencing (To Be Implemented):**

- **Status**: Described in PRD, not yet implemented
- **Goal**: Present words based on relationships, not just timing
- **Example**: Learning "大学" → suggest "学生" and "先生" next

**Options Considered:**

1. **Hybrid FSRS + Semantic Sequencing** (Selected)
   - FSRS determines timing (when to review)
   - Semantic algorithm determines ordering (which words to show together)
   - Fallback to pure FSRS if semantic processing fails
   - Pros: Best of both worlds, proven retention + semantic connections
   - Cons: More complex, requires relationship data

2. **Pure Semantic Algorithm** (Rejected)
   - ❌ Abandons proven FSRS retention benefits
   - ❌ No fallback if semantic processing fails
   - ❌ Risk of poor retention outcomes

3. **FSRS-Only with Relationship Hints** (Rejected)
   - ❌ Doesn't fulfill PRD innovation thesis
   - ❌ Relationships are passive, not active sequencing

**Decision:** Hybrid approach - FSRS for timing, semantic algorithm for sequencing

**Rationale:**

1. **Proven Foundation**: FSRS provides reliable retention scheduling
2. **Innovation Layer**: Semantic sequencing adds differentiation without sacrificing retention
3. **Reliability**: FSRS fallback ensures system always works
4. **Performance**: Semantic queries can be optimized/cached separately from SRS

**Architecture Design:**

**Semantic Sequencing Service:**

**Location**: `src/modules/study/services/semantic-sequencer.service.ts` (to be created)

**Algorithm Flow:**

```text
1. Get FSRS Queue (Due Reviews + New Cards)
   ↓
2. For each word in queue:
   - Query semantic relationships (etymology, tags, context)
   - Calculate relationship strength
   - Group related words
   ↓
3. Reorder Queue:
   - Cluster related words together
   - Maintain FSRS priority (Due > New)
   - Within clusters, prioritize by relationship strength
   ↓
4. Return Sequenced Queue
```

**Relationship Detection:**

**Current (Etymology-Based):**

- Shared kanji roots (from existing etymology graph)
- Confusion pairs (from ConfusionPair model)
- Same deck/unit (contextual grouping)

**Future (Semantic Tags):**

- Semantic tags (to be added to Vocabulary model)
- Usage context (from examples)
- Hán Việt connections (existing)

**Performance Requirements:**

- **Semantic Query**: <200ms for relationship lookups
- **Queue Reordering**: <100ms for 50-card queue
- **Total Overhead**: <300ms added to session initialization
- **Fallback**: If semantic processing >500ms, use pure FSRS queue

**Caching Strategy:**

1. **Relationship Cache**: Cache word relationships per user (TTL: 1 hour)
2. **Queue Cache**: Cache sequenced queue for active sessions (TTL: 5 minutes)
3. **Invalidation**: Invalidate on new word learned, review completed

**Integration Points:**

1. **getReviewQueue Action** (`src/modules/study/actions/getReviewQueue.ts`)
   - Call semantic sequencer after FSRS queue generation
   - Apply semantic reordering
   - Fallback to pure FSRS on error

2. **SessionController** (`src/modules/study/components/Session/SessionController.tsx`)
   - No changes needed (uses queue as-is)
   - Semantic sequencing is transparent to UI

3. **Study Service** (`src/modules/study/services/study.service.ts`)
   - Add semantic relationship queries
   - Add queue reordering logic

**Fallback Mechanism:**

```typescript
async function getSemanticallySequencedQueue(fsrsQueue: SmartCard[]): Promise<SmartCard[]> {
	try {
		// Attempt semantic sequencing
		const relationships = await getWordRelationships(fsrsQueue);
		const sequenced = reorderByRelationships(fsrsQueue, relationships);

		// Performance check: If sequencing took too long, use FSRS queue
		if (sequencingTime > 500) {
			console.warn('Semantic sequencing too slow, using FSRS queue');
			return fsrsQueue;
		}

		return sequenced;
	} catch (error) {
		// Graceful degradation: Return FSRS queue on any error
		console.error('Semantic sequencing failed:', error);
		return fsrsQueue;
	}
}
```

**A/B Testing Framework:**

- **Control Group**: Pure FSRS queue (current implementation)
- **Test Group**: Semantic-sequenced queue
- **Metrics**: D30 retention, confusion reduction, session completion
- **Decision Point**: If semantic sequencing shows 25%+ retention improvement, make it default

**Implementation Checklist:**

- [ ] Create `semantic-sequencer.service.ts`
- [ ] Implement relationship detection (etymology-based first)
- [ ] Implement queue reordering algorithm
- [ ] Add performance monitoring and fallback
- [ ] Add caching for relationship queries
- [ ] Integrate with `getReviewQueue` action
- [ ] Add A/B testing framework
- [ ] Unit tests for sequencing logic
- [ ] Performance tests (<300ms overhead)
- [ ] Analytics tracking for semantic vs FSRS performance

#### PWA/Offline Strategy

**Decision:** Workbox-Based PWA with Network-First Strategy for Learning Content

**Status:** ✅ Implemented (Service worker exists, needs Phase 3 enhancements)

**Decision Record:**

**Context:** The PRD requires PWA offline functionality for core learning features. Users must be able to study even without internet connectivity, maintaining session continuity and progress tracking.

**Current Implementation:**

**Service Worker (`public/sw.js`):**

- **Library**: Workbox 7.3.0 (Google's PWA toolkit)
- **Strategies**:
  - **Cache First**: Images, fonts (static assets)
  - **Stale While Revalidate**: JS/CSS assets (updates in background)
  - **Network First**: API routes, navigation (fresh content, cache fallback)
- **Offline Fallback**: `/offline` page for navigation failures
- **Push Notifications**: Configured for study reminders

**PWA Components:**

- **PWALifecycle**: Registers service worker
- **PWAInstallPrompt**: Prompts users to install PWA
- **usePWA Hook**: Detects installability, iOS, standalone mode

**Options for Phase 3 Enhancements:**

1. **IndexedDB for Study Session State** (Recommended)
   - Store active study session in IndexedDB
   - Sync to server when online
   - Resume session from IndexedDB if offline
   - Pros: Full offline study capability
   - Cons: Requires sync conflict resolution

2. **Cache Study Content** (Recommended)
   - Pre-cache vocabulary data for active decks
   - Cache story content for units being studied
   - Cache audio files for vocabulary
   - Pros: Enables offline study sessions
   - Cons: Storage limits, cache invalidation complexity

3. **Background Sync** (Future)
   - Queue review submissions when offline
   - Sync when connection restored
   - Pros: Seamless offline experience
   - Cons: Complex conflict resolution, data integrity

**Decision:** Implement IndexedDB session state + content caching for Phase 3

**Rationale:**

1. **User Experience**: Users can study completely offline
2. **Session Continuity**: Progress preserved across interruptions
3. **Performance**: Cached content loads faster
4. **Reliability**: Works on unreliable mobile connections

**Implementation Architecture:**

**IndexedDB Schema:**

```typescript
// Database: watashiwa_offline
// Stores:
// - Active study sessions
// - Pending review submissions
// - Cached vocabulary data
// - Cached story content

interface OfflineSession {
	id: string;
	deckId: string;
	cards: SmartCard[];
	currentIndex: number;
	startTime: number;
	lastSync: number;
}

interface PendingReview {
	id: string;
	cardId: string;
	rating: number;
	timestamp: number;
	retryCount: number;
}
```

**Caching Strategy:**

**Study Content Caching:**

- **Vocabulary Data**: Cache vocabulary for active decks (last 3 studied decks)
- **Story Content**: Cache stories for decks with active sessions
- **Audio Files**: Cache audio for vocabulary in active sessions
- **Cache Size**: Limit to ~50MB (reasonable for mobile)

**Cache Invalidation:**

- **On Deck Update**: Invalidate deck vocabulary cache
- **On Story Update**: Invalidate story cache
- **On New Words Learned**: Update vocabulary cache
- **TTL**: 24 hours for vocabulary, 7 days for stories

**Offline Study Flow:**

```text
1. User starts study session (online)
   ↓
2. System caches vocabulary + story content
   ↓
3. User goes offline
   ↓
4. Session continues from IndexedDB
   ↓
5. Reviews stored in IndexedDB (pending sync)
   ↓
6. User comes online
   ↓
7. Background sync: Submit pending reviews
   ↓
8. Update server state, clear pending queue
```

**Background Sync Implementation:**

**Service Worker Background Sync:**

```typescript
// In sw.js
self.addEventListener('sync', (event) => {
	if (event.tag === 'sync-reviews') {
		event.waitUntil(syncPendingReviews());
	}
});

async function syncPendingReviews() {
	const pending = await getPendingReviewsFromIndexedDB();
	for (const review of pending) {
		try {
			await submitReview(review);
			await removePendingReview(review.id);
		} catch (error) {
			// Retry on next sync
			incrementRetryCount(review.id);
		}
	}
}
```

**Conflict Resolution:**

- **Last Write Wins**: Server state takes precedence
- **Optimistic UI**: Client shows local state immediately
- **Reconciliation**: On sync, merge server state with local changes
- **User Notification**: Alert if conflicts detected

**Implementation Checklist:**

- [ ] Create IndexedDB schema for offline storage
- [ ] Implement session state persistence
- [ ] Implement pending review queue
- [ ] Add content caching for active decks
- [ ] Add background sync for pending reviews
- [ ] Add conflict resolution logic
- [ ] Add offline detection and UI indicators
- [ ] Add cache size management
- [ ] Add cache invalidation logic
- [ ] Unit tests for offline functionality
- [ ] E2E tests for offline study sessions

#### Performance Optimization Strategy

**Decision:** Multi-Layer Caching with Query Optimization

**Status:** ⚠️ Partially Implemented (Some optimizations exist, needs expansion)

**Decision Record:**

**Context:** Performance requirements are strict (<500ms algorithm queries, <200ms graph operations, <3s initial loads). The system must handle 10,000+ concurrent users while maintaining these targets.

**Current Optimizations:**

**Database:**

- Prisma query optimization (single queries with includes)
- Indexes on frequently queried fields
- JSONB GIN indexes for content queries

**Frontend:**

- Next.js Image Optimization
- Package import optimization (tree-shaking)
- React Server Components (less JS)

**Caching (Current):**

- React `cache()` for server actions
- Service worker caching (static assets)
- No application-level caching yet

**Options for Performance Enhancement:**

1. **Multi-Layer Caching Strategy** (Selected)
   - **Request-Level**: React cache() (already used)
   - **Application-Level**: In-memory cache for frequently accessed data
   - **Database-Level**: Query result caching (future: Redis)
   - **CDN**: Static assets and media files

2. **Query Optimization**
   - Database query optimization (indexes, joins)
   - Graph query optimization (relationship caching)
   - Algorithm result caching

3. **Background Processing**
   - Pre-compute semantic relationships
   - Pre-generate graph data
   - Batch process algorithm calculations

**Decision:** Implement multi-layer caching with query optimization

**Rationale:**

1. **Scalability**: Caching reduces database load for 10,000+ users
2. **Performance**: Meets <500ms algorithm requirement
3. **Cost**: Reduces database query costs
4. **User Experience**: Faster response times improve engagement

**Caching Architecture:**

**Layer 1: Request-Level Caching (React cache)**

- **Location**: Server actions using React `cache()`
- **Scope**: Per-request, automatic deduplication
- **TTL**: Request duration
- **Use Cases**: User data, session data, frequently accessed queries

**Layer 2: Application-Level Caching (In-Memory)**

- **Location**: `src/lib/cache/` (to be created)
- **Implementation**: Map-based cache with TTL
- **Scope**: Per-server instance
- **TTL**: 5-60 minutes depending on data type
- **Use Cases**: Knowledge graph data, semantic relationships, story content

**Layer 3: Database Query Optimization**

- **Indexes**: Ensure all frequently queried fields are indexed
- **Query Patterns**: Use single queries with includes (avoid N+1)
- **JSONB Queries**: Use GIN indexes for content queries
- **Connection Pooling**: Prisma connection pooling (already configured)

**Layer 4: CDN Caching (Future)**

- **Static Assets**: Images, fonts, JS/CSS bundles
- **Media Files**: Story audio, vocabulary audio
- **Cache Headers**: Appropriate cache-control headers

**Caching Strategy by Data Type:**

**Knowledge Graph Data:**

- **Cache Key**: `graph:${userId}:${limit}`
- **TTL**: 5 minutes (graph changes as user learns)
- **Invalidation**: On new word learned, review completed
- **Size**: ~50KB per user graph (50 nodes)

**Semantic Relationships:**

- **Cache Key**: `relationships:${vocabId}`
- **TTL**: 1 hour (relationships change infrequently)
- **Invalidation**: On vocabulary update, new word learned
- **Size**: ~5KB per vocabulary item

**Story Content:**

- **Cache Key**: `story:${deckId}`
- **TTL**: 24 hours (stories change infrequently)
- **Invalidation**: On story update, content status change
- **Size**: ~10KB per story

**Algorithm Results:**

- **Cache Key**: `algorithm:${userId}:${deckId}`
- **TTL**: 5 minutes (algorithm results change with learning)
- **Invalidation**: On review completed, new word learned
- **Size**: ~20KB per algorithm result

**Performance Targets:**

**Algorithm Queries:**

- **Target**: <500ms (including cache lookup)
- **Cache Hit**: <50ms (in-memory lookup)
- **Cache Miss**: <500ms (database query + cache write)

**Graph Operations:**

- **Target**: <200ms
- **Cache Hit**: <20ms (cached graph data)
- **Cache Miss**: <200ms (query + graph building + cache write)

**Initial Page Loads:**

- **Target**: <3s on 3G
- **Optimization**: Code splitting, image optimization, CDN caching

**Implementation Details:**

**In-Memory Cache Implementation:**

```typescript
// src/lib/cache/memory-cache.ts
class MemoryCache<T> {
	private cache = new Map<string, { data: T; expires: number }>();

	get(key: string): T | null {
		const entry = this.cache.get(key);
		if (!entry || entry.expires < Date.now()) {
			this.cache.delete(key);
			return null;
		}
		return entry.data;
	}

	set(key: string, data: T, ttl: number): void {
		this.cache.set(key, {
			data,
			expires: Date.now() + ttl * 1000,
		});
	}
}
```

**Cache Integration Points:**

- `getEtymologyGraphData`: Cache graph data
- `getSessionDataWithPriming`: Cache story data
- Semantic sequencer: Cache relationship queries
- Algorithm queries: Cache algorithm results

**Monitoring & Metrics:**

- **Cache Hit Rate**: Track cache effectiveness
- **Query Performance**: Monitor database query times
- **Cache Size**: Monitor memory usage
- **Invalidation Frequency**: Track cache invalidation patterns

**Implementation Checklist:**

- [ ] Create in-memory cache utility
- [ ] Add caching to knowledge graph queries
- [ ] Add caching to semantic relationship queries
- [ ] Add caching to story content queries
- [ ] Add caching to algorithm results
- [ ] Implement cache invalidation logic
- [ ] Add cache size limits and eviction
- [ ] Add cache monitoring and metrics
- [ ] Performance testing with caching
- [ ] Document cache strategies

**Related Decisions:**

- **Knowledge Graph**: Provides relationship data for sequencing
- **Caching Strategy**: Redis vs in-memory (separate decision)
- **Performance Monitoring**: Sentry integration for sequencing failures

---

## Summary of Architectural Decisions

**Phase 3 Critical Decisions (Documented):**

1. ✅ **Story Engine Data Architecture** - Strict Zod Schema Validation (Already Implemented)
2. ⚠️ **Priming Logic Flow** - Deck-specific soft gates (To Be Implemented)
3. ⚠️ **AI Content Generation Pipeline** - LLM-based with validation (Partially Implemented)
4. ✅ **Knowledge Graph Architecture** - Etymology-based with semantic expansion path (Implemented)
5. ⚠️ **Semantic Algorithm Architecture** - Hybrid FSRS + Semantic Sequencing (To Be Implemented)
6. ✅ **PWA/Offline Strategy** - Workbox-based with IndexedDB enhancement path (Implemented, needs Phase 3 enhancements)
7. ⚠️ **Performance Optimization** - Multi-layer caching strategy (Partially Implemented)

**Key Architectural Principles Established:**

- **Type Safety First**: Zod schemas for all JSONB content, TypeScript strict mode
- **Graceful Degradation**: All features degrade gracefully, never block core functionality
- **Performance Targets**: <500ms algorithm, <200ms graph, <3s initial loads
- **Scalability**: Architecture supports 10,000+ concurrent users
- **Vertical Slice**: Maintain feature-first organization, no monoliths
- **Vietnamese-First**: All decisions consider Vietnamese learner context

**Implementation Readiness:**

- **Ready for Implementation**: Story Engine schema, Knowledge Graph visualization, PWA foundation
- **Needs Development**: Priming logic, Semantic sequencing, Offline enhancements, Caching layer
- **Future Considerations**: Vector embeddings (V3), Deep Knowledge Tracing (V3), Redis caching (if needed)

**Next Steps:**

1. Complete Phase 3 implementation based on documented decisions
2. Add performance monitoring to validate <500ms targets
3. Implement A/B testing framework for semantic algorithm validation
4. Expand knowledge graph with semantic tags (post-Phase 3)
5. Enhance PWA offline capabilities with IndexedDB (Phase 3)

---

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
8 areas where AI agents could make different choices have been addressed with consistent patterns.

### Naming Patterns

**Database Naming Conventions:**

- **Models**: PascalCase (User, Vocabulary, Story)
- **Columns**: snake_case with @map() (user_id, created_at, deck_id)
- **Foreign Keys**: snake_case matching column pattern (userId → user_id)
- **Indexes**: Prisma auto-generated, no manual naming needed
- **Enums**: PascalCase (UserRole, ContentStatus, SRSStage)

**API Naming Conventions:**

- **Server Actions**: camelCase verbs (getReviewQueue, fetchSessionAction, submitReview)
- **Action Files**: {module}.actions.ts (flashcard.actions.ts, study.actions.ts)
- **API Routes**: kebab-case (/api/webhooks, /api/push-notifications)
- **Route Parameters**: Next.js dynamic routes [id], [slug]
- **Query Parameters**: camelCase (deckId, courseId, limit)

**Code Naming Conventions:**

- **Components**: PascalCase (SessionController, DeckList, EtymologyGraph)
- **Component Files**: PascalCase matching component name (SessionController.tsx)
- **Hooks**: camelCase with "use" prefix (useStudySession, usePWA, useAuth)
- **Functions**: camelCase (getUser, mapVocabularyToSmartCard, extractKanjiRoots)
- **Variables**: camelCase (userId, deckId, currentIndex)
- **Constants**: UPPER_SNAKE_CASE (DAILY_REVIEW_LIMIT, MAX_NODES)
- **Types/Interfaces**: PascalCase (SmartCard, EtymologyGraphNode, ActionContext)
- **Type Files**: types.ts (co-located) or types/ folder for complex modules

### Structure Patterns

**Project Organization:**

- **Modules**: Vertical Slice in `src/modules/{feature}/`
- **Components**: `src/modules/{feature}/components/` (private to module)
- **Server Actions**: `src/modules/{feature}/actions.ts` (single file per module)
- **Services**: `src/modules/{feature}/services.ts` or `services/` folder if multiple
- **Hooks**: `src/modules/{feature}/hooks/` or `src/hooks/` for shared hooks
- **Stores**: `src/modules/{feature}/store/` (Zustand stores)
- **Types**: `src/modules/{feature}/types.ts` (co-located) or `types/` folder
- **Utils**: `src/modules/{feature}/utils/` (module-specific) or `src/lib/` (shared)
- **Tests**: Co-located with `.test.ts` suffix (study.service.test.ts)

**File Structure Patterns:**

- **Config Files**: `src/lib/` for shared config, module root for module-specific
- **Static Assets**: `public/assets/` organized by type (images/, audio/, lottie/)
- **Documentation**: `docs/` at project root, feature docs in `docs/features/`
- **Environment Files**: `.env.local`, `.env.production` at project root

**Module Structure Template:**

```
modules/{feature}/
├── components/          # React components (PascalCase files)
├── actions.ts           # Server Actions ('use server')
├── services.ts          # Business logic (optional)
├── data.ts             # Data access layer (optional)
├── types.ts            # TypeScript types
├── hooks/              # React hooks (optional)
├── store/              # Zustand stores (optional)
└── utils/              # Module utilities (optional)
```

### Format Patterns

**API Response Formats:**

- **Server Actions**: MUST use `executeSafeAction` wrapper returning `ApiResponse<T>`
- **Response Shape**: `{ success: boolean, data?: T, error?: string, validationErrors?: Record<string, string[]> }`
- **Error Handling**: NEVER throw in Server Actions, always return error in response
- **Direct Returns**: Only for non-action functions (utilities, mappers)

**Data Exchange Formats:**

- **JSON Fields**: camelCase in TypeScript, snake_case in database (Prisma maps automatically)
- **Dates**: ISO 8601 strings in JSON (DateTime in Prisma)
- **Booleans**: true/false (never 1/0)
- **Null Handling**: Use null (never undefined in JSON)
- **Arrays**: Always arrays, never single-item objects

**Server Action Pattern:**

```typescript
'use server';

import { executeSafeAction } from '@/modules/core/action-client';
import { z } from 'zod';

const InputSchema = z.object({
	deckId: z.string().uuid().optional(),
});

export async function getReviewQueue(input: unknown) {
	return executeSafeAction(
		InputSchema,
		input,
		async (data, { userId }) => {
			// Business logic here
			// userId is guaranteed if requireAuth: true (default)
			return result;
		},
		{ requireAuth: true }, // Optional, defaults to true
	);
}
```

### Communication Patterns

**Event System Patterns:**

- **Client Events**: Use React event handlers (onClick, onChange)
- **Custom Events**: Avoid unless necessary, use callbacks instead
- **Event Naming**: camelCase (onCardFlip, onReviewSubmit)
- **Event Payloads**: Type-safe with TypeScript interfaces

**State Management Patterns:**

- **Zustand Stores**: Named `use{Feature}Store` (useSessionStore, useStudyPreferences)
- **Store Files**: `store/use{Feature}Store.ts` in module directory
- **State Updates**: Immutable updates only (Zustand enforces this)
- **Actions**: Defined in store, named as verbs (startSession, submitReview, resetState)
- **Selectors**: Use Zustand selectors for performance (shallow comparison)

**Zustand Store Pattern:**

```typescript
import { create } from 'zustand';

interface SessionState {
	cards: SmartCard[];
	currentIndex: number;
	startSession: (cards: SmartCard[]) => void;
	nextCard: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
	cards: [],
	currentIndex: 0,
	startSession: (cards) => set({ cards, currentIndex: 0 }),
	nextCard: () => set((state) => ({ currentIndex: state.currentIndex + 1 })),
}));
```

### Process Patterns

**Error Handling Patterns:**

- **Server Actions**: Return error in ApiResponse, never throw
- **Client Components**: Use try/catch for async operations, show user-friendly messages
- **Error Boundaries**: Use React Error Boundaries for component tree errors
- **Logging**: console.error for server-side, Sentry for production errors
- **User Messages**: Always user-friendly, never expose internal errors

**Loading State Patterns:**

- **Naming**: `isLoading`, `isFetching`, `isSubmitting` (specific to action)
- **Scope**: Local state for component-specific loading, global for app-wide
- **UI**: Ant Design Spin component or Skeleton for loading states
- **Persistence**: Don't persist loading state across navigation

**Validation Patterns:**

- **Input Validation**: Zod schemas for all Server Action inputs
- **Client Validation**: Zod schemas reused on client when possible
- **Error Messages**: User-friendly messages from validation errors
- **Timing**: Validate on submit, show errors immediately

### Enforcement Guidelines

**All AI Agents MUST:**

1. **Use executeSafeAction** for all Server Actions (never direct returns or throws)
2. **Follow Vertical Slice** organization (modules/{feature}/, not technical layers)
3. **Use PascalCase** for components and component files
4. **Use camelCase** for functions, variables, and hooks
5. **Co-locate tests** with `.test.ts` suffix
6. **Return ApiResponse<T>** from all Server Actions
7. **Never create circular dependencies** between modules
8. **Use TypeScript strict mode** (no `any` without explicit reason)
9. **Include Hán Việt data** in all kanji-related content
10. **Use Ant Design components** (no Tailwind, no custom CSS files)

**Pattern Enforcement:**

- **ESLint Rules**: Configured to catch naming violations
- **TypeScript**: Strict mode prevents type errors
- **Code Review**: Check for executeSafeAction usage, naming conventions
- **Documentation**: Update docs/conventions.md if patterns change
- **Process**: Discuss pattern changes before implementing

### Pattern Examples

**Good Examples:**

```typescript
// ✅ Server Action with executeSafeAction
export async function getReviewQueue(input: unknown) {
	return executeSafeAction(InputSchema, input, async (data, { userId }) => {
		const queue = await prisma.userReview.findMany({ where: { userId } });
		return { queue, source: 'DUE_REVIEWS' };
	});
}

// ✅ Component with PascalCase
export default function SessionController({ deckId }: { deckId?: string }) {
	const { cards, isLoading } = useSessionStore();
	// ...
}

// ✅ Zustand store with use prefix
export const useSessionStore = create<SessionState>((set) => ({
	// ...
}));

// ✅ Hook with use prefix
export function useStudySession() {
	// ...
}
```

**Anti-Patterns:**

```typescript
// ❌ Direct return without executeSafeAction
export async function getReviewQueue(deckId: string) {
  const queue = await prisma.userReview.findMany();
  return queue; // Missing error handling, auth check
}

// ❌ Throwing errors in Server Actions
export async function submitReview(data: ReviewData) {
  if (!user) throw new Error('Unauthorized'); // Should return error
  // ...
}

// ❌ Wrong file naming
export default function session-controller() { } // Should be SessionController.tsx

// ❌ Circular dependency
// In flashcard module:
import { useSessionStore } from '@/modules/study/store/useSessionStore';
// In study module:
import { Card } from '@/modules/flashcard/types';
```

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
watashi-jp/
├── README.md
├── package.json
├── pnpm-lock.yaml
├── next.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── eslint.config.mjs
├── prisma.config.ts
├── sentry.edge.config.ts
├── sentry.server.config.ts
├── ecosystem.config.cjs
├── .env.local
├── .env.example
├── .gitignore
├── .cursorignore
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   │   ├── [migration files]
│   │   └── migration_lock.toml
│   ├── seed.ts
│   └── seed_confusions.ts
│
├── public/
│   ├── assets/
│   │   ├── images/
│   │   ├── audio/
│   │   └── lottie/
│   ├── favicon.ico
│   ├── manifest.json
│   ├── sw.js (Service Worker)
│   └── og/
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── error.tsx
│   │   ├── global-error.tsx
│   │   ├── not-found.tsx
│   │   ├── offline/
│   │   │   └── page.tsx
│   │   ├── api/                      # API Routes (special cases)
│   │   │   ├── cron/
│   │   │   └── notifications/
│   │   ├── auth/                     # Auth routes
│   │   │   ├── callback/
│   │   │   └── auth-code-error/
│   │   ├── study/                    # Study session page
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   ├── dashboard/                # Dashboard pages
│   │   │   ├── page.tsx
│   │   │   ├── courses/
│   │   │   └── decks/
│   │   ├── decks/                    # Deck pages
│   │   │   ├── [id]/
│   │   │   └── page.tsx
│   │   ├── courses/                  # Course pages
│   │   │   └── [id]/
│   │   ├── admin/                    # Admin pages
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── content/
│   │   │   ├── decks/
│   │   │   ├── users/
│   │   │   └── reports/
│   │   └── [other pages]
│   │
│   ├── modules/                      # Vertical Slice Architecture
│   │   ├── auth/                     # Authentication
│   │   │   ├── auth.actions.ts
│   │   │   ├── auth.dto.ts
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── utils/
│   │   │
│   │   ├── study/                    # Study Session (Core)
│   │   │   ├── study.actions.ts
│   │   │   ├── study.service.ts
│   │   │   ├── study.data.ts
│   │   │   ├── study.dto.ts
│   │   │   ├── study.mapper.ts
│   │   │   ├── study.types.ts
│   │   │   ├── intervention.service.ts
│   │   │   ├── actions/
│   │   │   │   └── getReviewQueue.ts
│   │   │   ├── components/
│   │   │   │   ├── Session/
│   │   │   │   └── Settings/
│   │   │   ├── store/
│   │   │   │   ├── useSessionStore.ts
│   │   │   │   └── useStudyPreferences.ts
│   │   │   ├── utils/
│   │   │   └── [test files]
│   │   │
│   │   ├── flashcard/                # Flashcard System
│   │   │   ├── flashcard.actions.ts
│   │   │   ├── types.ts
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── utils/
│   │   │
│   │   ├── priming/                  # Active Priming (Story Engine)
│   │   │   ├── actions.ts
│   │   │   ├── types.ts
│   │   │   └── components/
│   │   │
│   │   ├── dashboard/                # Dashboard & Visualizations
│   │   │   ├── dashboard.actions.ts
│   │   │   └── components/
│   │   │       ├── etymology-graph/   # Knowledge Graph
│   │   │       ├── learning-map/
│   │   │       └── memory-garden/
│   │   │
│   │   ├── deck/                     # Deck Management
│   │   │   ├── deck.actions.ts
│   │   │   ├── deck.data.ts
│   │   │   └── components/
│   │   │
│   │   ├── course/                   # Course Management
│   │   │   ├── course.actions.ts
│   │   │   └── course.data.ts
│   │   │
│   │   ├── vocabulary/               # Vocabulary Content
│   │   │   ├── vocabulary.actions.ts
│   │   │   └── vocabulary.data.ts
│   │   │
│   │   ├── core/                     # Core Infrastructure
│   │   │   ├── action-client.ts      # executeSafeAction wrapper
│   │   │   └── dto.ts                # ApiResponse types
│   │   │
│   │   └── [other modules]
│   │
│   ├── lib/                          # Shared Libraries
│   │   ├── db.ts                     # Prisma client
│   │   ├── schemas/
│   │   │   └── jsonb.ts              # Zod schemas for JSONB
│   │   ├── theme/
│   │   ├── seo/
│   │   └── utils/
│   │
│   ├── components/                   # Global Components
│   │   ├── PWA/
│   │   ├── Analytics/
│   │   └── SEO/
│   │
│   ├── hooks/                        # Global Hooks
│   │   ├── usePWA.ts
│   │   └── usePushNotifications.ts
│   │
│   ├── types/                        # Global Types
│   │   ├── smart-cube.ts
│   │   └── user.ts
│   │
│   ├── i18n/                         # Internationalization
│   │   ├── messages/
│   │   │   ├── en.json
│   │   │   └── vi.json
│   │   └── routing.ts
│   │
│   └── instrumentation-client.ts
│
├── tests/                            # Test Utilities
│   └── setup.ts
│
├── e2e/                              # E2E Tests
│   ├── study-flow.spec.ts
│   └── study-navigation.spec.ts
│
├── scripts/                          # Utility Scripts
│   ├── generate_content.ts
│   └── generate_stories.ts
│
├── docs/                             # Documentation
│   ├── api/
│   ├── architecture/
│   ├── features/
│   └── models/
│
└── config/                           # Configuration Files
    └── security_recommendations.md
```

### Architectural Boundaries

**API Boundaries:**

**Server Actions (Primary Pattern):**

- **Location**: `src/modules/{feature}/actions.ts`
- **Wrapper**: `src/modules/core/action-client.ts` (executeSafeAction)
- **Response Format**: `ApiResponse<T>` with `{ success, data?, error?, validationErrors? }`
- **Authentication**: Handled by executeSafeAction wrapper

**API Routes (Special Cases Only):**

- **Location**: `src/app/api/`
- **Use Cases**: Webhooks, push notifications, external integrations

**Component Boundaries:**

**Module Components (Private):**

- **Location**: `src/modules/{feature}/components/`
- **Scope**: Private to module, not exported globally
- **Pattern**: PascalCase component files

**Global Components (Shared):**

- **Location**: `src/components/`
- **Scope**: Shared across multiple modules

**Service Boundaries:**

**Business Logic Services:**

- **Location**: `src/modules/{feature}/services.ts`
- **Pattern**: Pure TypeScript, no React dependencies

**Data Access Layer:**

- **Location**: `src/modules/{feature}/data.ts`
- **Pattern**: Prisma queries, data transformation

**State Management Boundaries:**

**Zustand Stores:**

- **Location**: `src/modules/{feature}/store/`
- **Naming**: `use{Feature}Store.ts`
- **Scope**: Module-specific state

**Data Boundaries:**

**Database Schema:**

- **Location**: `prisma/schema.prisma`
- **Pattern**: Hybrid SQL + JSONB
- **Key Models**: User, Vocabulary, Story, StoryLog, Deck, Course

**JSONB Schema Validation:**

- **Location**: `src/lib/schemas/jsonb.ts`
- **Pattern**: Zod schemas for all JSONB content

**Caching Boundaries:**

**Request-Level Caching:**

- **Pattern**: React `cache()` for server actions

**Application-Level Caching (Phase 3):**

- **Location**: `src/lib/cache/` (to be created)
- **Pattern**: In-memory cache with TTL

**Service Worker Caching:**

- **Location**: `public/sw.js`
- **Pattern**: Workbox strategies

### Requirements to Structure Mapping

**Phase 3 Feature Mapping:**

**1. Story Engine (Active Priming):**

- **Module**: `src/modules/priming/`
- **Actions**: `src/modules/priming/actions.ts`
- **Components**: `src/modules/priming/components/`
- **Database**: `prisma/schema.prisma` (Story, StoryLog models)
- **Schemas**: `src/lib/schemas/jsonb.ts` (StoryContentSchema)

**2. Knowledge Graph (Etymology Constellation):**

- **Module**: `src/modules/dashboard/components/etymology-graph/`
- **Actions**: `etymology-graph.actions.ts`
- **Component**: `EtymologyGraph.tsx`
- **Database**: Uses Vocabulary.etymology JSONB field

**3. Semantic Algorithm (Sequencing Engine):**

- **Service**: `src/modules/study/services/semantic-sequencer.service.ts` (to be created)
- **Integration**: `src/modules/study/actions/getReviewQueue.ts`
- **Caching**: `src/lib/cache/` for relationship queries

**4. Performance Optimization:**

- **Cache Layer**: `src/lib/cache/memory-cache.ts` (to be created)
- **Integration Points**: Graph actions, semantic sequencer, priming actions

**5. PWA/Offline Enhancements:**

- **Service Worker**: `public/sw.js` (exists, needs enhancement)
- **Offline Storage**: IndexedDB schema (to be created)
- **Components**: `src/components/PWA/` (exists)

### Integration Points

**Internal Communication:**

**Server Actions → Components:**

```
Component → Server Action → executeSafeAction → Prisma → ApiResponse<T>
```

**State Management Flow:**

```
Component → Zustand Store → Local State → Server Action (if needed)
```

**Module Communication:**

- **High-level → Low-level**: Allowed (study → flashcard)
- **Low-level → High-level**: Forbidden (no circular dependencies)
- **Shared Code**: `src/lib/` for utilities, `src/components/` for shared UI

**External Integrations:**

**Supabase Auth**: `src/utils/supabase/`
**Google Cloud Storage**: `src/lib/upload/upload.actions.ts`
**PostHog Analytics**: `src/lib/analytics.ts`
**Sentry Error Tracking**: `sentry.server.config.ts`, `sentry.edge.config.ts`

**Data Flow:**

**Study Session Flow:**

```
User clicks "Start Study" → study/page.tsx → getReviewQueue.ts →
FSRS Algorithm → Semantic Sequencer [Phase 3] → useSessionStore → SessionController
```

**Priming Flow (Phase 3):**

```
Study Session Starts → getSessionDataWithPriming → Check Story Requirement →
Show PrimingModal → StoryReader → Continue to study
```

**Knowledge Graph Flow:**

```
Dashboard → etymology-graph.actions.ts → Query User Reviews + Vocabulary →
Build Graph (shared kanji roots) → EtymologyGraph.tsx → react-force-graph-2d
```

### File Organization Patterns

**Configuration Files:**

- **Root Level**: `package.json`, `tsconfig.json`, `next.config.ts`
- **Environment**: `.env.local`, `.env.example`
- **Database**: `prisma/schema.prisma`, `prisma.config.ts`
- **Testing**: `vitest.config.ts`, `playwright.config.ts`

**Source Organization:**

- **Vertical Slice**: `src/modules/{feature}/` (feature-first)
- **Shared Libraries**: `src/lib/` (database, utilities, schemas)
- **Global Components**: `src/components/` (PWA, Analytics, SEO)
- **Global Hooks**: `src/hooks/`
- **Global Types**: `src/types/`

**Test Organization:**

- **Co-located**: `*.test.ts` files next to source
- **E2E Tests**: `e2e/` directory

**Asset Organization:**

- **Static Assets**: `public/assets/` (images/, audio/, lottie/)
- **Service Worker**: `public/sw.js`
- **Manifest**: `public/manifest.json`

### Development Workflow Integration

**Development Server Structure:**

- **Next.js Dev**: `npm run dev` (port 3000)
- **Hot Reload**: Automatic for all changes

**Build Process Structure:**

- **Build Command**: `npm run build`
- **Output**: `.next/` directory

**Deployment Structure:**

- **Platform**: Vercel (recommended) or self-hosted
- **Environment Variables**: Set in deployment platform
- **Database Migrations**: Run via Prisma migrate

**Phase 3 Implementation Checklist:**

**New Files to Create:**

- [ ] `src/modules/study/services/semantic-sequencer.service.ts`
- [ ] `src/lib/cache/memory-cache.ts`
- [ ] `src/lib/cache/index.ts`
- [ ] IndexedDB schema/types for offline storage

**Files to Enhance:**

- [ ] `src/modules/study/actions/getReviewQueue.ts` (add semantic sequencing)
- [ ] `src/modules/dashboard/components/etymology-graph/etymology-graph.actions.ts` (add caching)
- [ ] `public/sw.js` (add IndexedDB sync, content caching)
- [ ] `src/modules/priming/actions.ts` (enhance priming logic)

**Database Changes:**

- [ ] Story and StoryLog models (already in schema.prisma)
- [ ] Migration for any new fields
- [ ] Indexes for performance (if needed)

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**

All architectural decisions are compatible and work together seamlessly:

- **Technology Stack Compatibility**: ✅
  - Next.js 16.1.1 (App Router) + Prisma 7.2.0 + Ant Design 6.1.2 + Zustand 5.0.9 - All versions compatible
  - TypeScript 5.x strict mode ensures type safety across all decisions
  - PostgreSQL JSONB support enables flexible content storage (Story, Vocabulary etymology)
  - Supabase Auth integrates cleanly with Next.js Server Actions

- **Architecture Pattern Alignment**: ✅
  - Vertical Slice Architecture consistently applied across all modules
  - Server Actions pattern (executeSafeAction) used uniformly
  - Module boundaries respected (no circular dependencies)
  - Feature-first organization supports all Phase 3 features

- **Decision Interdependencies**: ✅
  - Story Engine → Priming Logic → Study Session flow is coherent
  - Knowledge Graph → Semantic Algorithm → Study Queue integration is logical
  - Performance Optimization → Caching → Graph/Algorithm queries are aligned
  - PWA/Offline → IndexedDB → Session State persistence is consistent

**Pattern Consistency:**

All implementation patterns support architectural decisions:

- **Naming Conventions**: ✅ Consistent across database, API, code, and components
- **Structure Patterns**: ✅ Vertical Slice organization enables all features
- **Communication Patterns**: ✅ Server Actions + Zustand stores align with Next.js architecture
- **Process Patterns**: ✅ Error handling, loading states, validation patterns are comprehensive

**Structure Alignment:**

Project structure fully supports all architectural decisions:

- **Module Organization**: ✅ All Phase 3 features have dedicated modules (priming, study, dashboard)
- **Boundary Definitions**: ✅ Clear separation between modules, shared lib, and global components
- **Integration Points**: ✅ Well-defined communication patterns between components
- **File Organization**: ✅ Configuration, source, tests, and assets properly organized

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**

All 58 Functional Requirements are architecturally supported:

**Semantic Learning Engine (FR1-FR9):** ✅

- FR1-FR3: Semantic sequencing → `semantic-sequencer.service.ts` (to be created)
- FR4: Contextual examples → Story Engine + AI Content Factory
- FR5: Algorithm feedback → A/B testing framework (documented)
- FR6-FR9: Pattern analysis → Semantic algorithm with relationship detection

**Knowledge Graph System (FR10-FR18):** ✅

- FR10-FR14: Graph visualization → `etymology-graph/` module (implemented)
- FR15-FR18: Graph interaction → EtymologyGraph component with react-force-graph-2d

**Smart Intervention System (FR19-FR26):** ✅

- FR19-FR22: Confusion detection → `intervention.service.ts` (exists)
- FR23-FR26: Intervention delivery → Smart CUBE system (documented)

**Vietnamese-First Learning Experience (FR27-FR34):** ✅

- FR27-FR30: Cultural adaptation → i18n system (implemented)
- FR31-FR34: Language integration → next-intl with Vietnamese support

**Learning Session Management (FR35-FR42):** ✅

- FR35-FR38: Session flow → Study module with semantic sequencing
- FR39-FR42: Progress integration → Dashboard + analytics (implemented)

**User Account & Personalization (FR43-FR50):** ✅

- FR43-FR46: Profile management → User module + Supabase Auth
- FR47-FR50: Personalization → Semantic algorithm with user patterns

**Quality Assurance & Validation (FR51-FR58):** ✅

- FR51-FR54: Algorithm validation → A/B testing framework (documented)
- FR55-FR58: Content quality → AI Content Factory with validation workflow

**Non-Functional Requirements Coverage:**

All NFR categories are architecturally addressed:

**Performance Requirements:** ✅

- Algorithm responsiveness <500ms → Caching strategy + query optimization
- Graph operations <200ms → In-memory graph building + caching
- Initial loads <3s → Next.js optimization + CDN caching
- Scalability 10,000+ users → Multi-layer caching + database optimization

**Security Requirements:** ✅

- Data encryption → Supabase handles at-rest encryption, TLS 1.3 in transit
- Authentication → Supabase Auth + executeSafeAction wrapper
- Privacy compliance → COPPA/FERPA considerations documented

**Scalability Requirements:** ✅

- User capacity → Architecture supports 10,000+ concurrent sessions
- Data volume → JSONB + efficient graph storage patterns
- Infrastructure → Load balancing + multi-region capability (documented)

**Accessibility Requirements:** ✅

- WCAG 2.1 AA → Ant Design components provide accessibility
- Vietnamese-specific → Screen reader support + input method (documented)

**Reliability Requirements:** ✅

- Availability 99.5% → Graceful degradation + SRS fallback
- Data integrity → ACID compliance via Prisma/PostgreSQL
- Error handling → executeSafeAction + Error Boundaries

### Implementation Readiness Validation ✅

**Decision Completeness:**

All critical decisions are documented with sufficient detail:

- ✅ **Story Engine**: Data architecture, schema validation, implementation details
- ✅ **Priming Logic**: Flow architecture, soft gates, skip handling
- ✅ **AI Content Factory**: Pipeline, validation, review workflow
- ✅ **Knowledge Graph**: Current implementation + future expansion path
- ✅ **Semantic Algorithm**: Hybrid approach, fallback mechanism, performance targets
- ✅ **PWA/Offline**: Service worker strategy + IndexedDB enhancement plan
- ✅ **Performance**: Multi-layer caching strategy with specific TTLs and invalidation

**Structure Completeness:**

Project structure is complete and specific:

- ✅ **Complete Directory Tree**: All files and directories defined
- ✅ **Integration Points**: Clear communication patterns documented
- ✅ **Component Boundaries**: Well-defined module vs global component separation
- ✅ **Requirements Mapping**: Phase 3 features mapped to specific files

**Pattern Completeness:**

Implementation patterns are comprehensive:

- ✅ **Naming Conventions**: All areas covered (database, API, code, components)
- ✅ **Structure Patterns**: Module organization, file structure, test organization
- ✅ **Communication Patterns**: Server Actions, state management, event handling
- ✅ **Process Patterns**: Error handling, loading states, validation
- ✅ **Examples Provided**: Good examples and anti-patterns for all major patterns

### Gap Analysis Results

**Critical Gaps:** None identified

All blocking architectural decisions have been made. The architecture is ready for implementation.

**Important Gaps (To Address During Implementation):**

1. **Semantic Tag System**: Currently using etymology-only relationships. Semantic tags for Vocabulary model should be added post-Phase 3 for richer relationships.

2. **A/B Testing Framework**: Documented but needs implementation details for semantic vs FSRS comparison.

3. **IndexedDB Schema**: Offline storage schema needs to be defined during Phase 3 implementation.

4. **Cache Monitoring**: Cache hit rate and performance metrics need instrumentation.

**Nice-to-Have Gaps (Future Enhancements):**

1. **Vector Embeddings**: Deferred to V3 (pgvector integration)
2. **Deep Knowledge Tracing**: Deferred to V3 (DKT model)
3. **Redis Caching**: In-memory caching sufficient for Phase 3, Redis can be added if needed
4. **3D Graph Visualization**: Three.js integration for advanced graph views (future)

### Validation Issues Addressed

**No Critical Issues Found**

The architecture is coherent, complete, and ready for implementation. All requirements are architecturally supported, and all patterns are consistent.

**Minor Recommendations:**

1. **Performance Monitoring**: Add Sentry performance tracking for semantic algorithm queries to validate <500ms targets
2. **Cache Metrics**: Implement cache hit rate tracking during Phase 3 implementation
3. **Documentation**: Consider adding sequence diagrams for complex flows (Story Engine → Priming → Study Session)

### Architecture Completeness Checklist

**✅ Requirements Analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Medium-High, 8-10 modules)
- [x] Technical constraints identified (Next.js, Prisma, Ant Design, Vertical Slice)
- [x] Cross-cutting concerns mapped (Auth, i18n, Analytics, Error Handling)

**✅ Architectural Decisions**

- [x] Critical decisions documented with versions
  - Story Engine: Zod Schema Validation ✅
  - Priming Logic: Deck-specific soft gates ✅
  - AI Content Factory: LLM-based with validation ✅
  - Knowledge Graph: Etymology-based with expansion path ✅
  - Semantic Algorithm: Hybrid FSRS + Sequencing ✅
  - PWA/Offline: Workbox + IndexedDB ✅
  - Performance: Multi-layer caching ✅
- [x] Technology stack fully specified (Next.js 16.1.1, Prisma 7.2.0, Ant Design 6.1.2, Zustand 5.0.9)
- [x] Integration patterns defined (Server Actions, Zustand stores, Module boundaries)
- [x] Performance considerations addressed (<500ms algorithm, <200ms graph, <3s loads)

**✅ Implementation Patterns**

- [x] Naming conventions established (Database, API, Code, Components)
- [x] Structure patterns defined (Vertical Slice, Module organization, File structure)
- [x] Communication patterns specified (Server Actions, State management, Events)
- [x] Process patterns documented (Error handling, Loading states, Validation)

**✅ Project Structure**

- [x] Complete directory structure defined (all files and directories specified)
- [x] Component boundaries established (Module vs Global components)
- [x] Integration points mapped (Internal communication, External integrations, Data flows)
- [x] Requirements to structure mapping complete (Phase 3 features → specific files)

### Architecture Readiness Assessment

**Overall Status:** ✅ **READY FOR IMPLEMENTATION**

**Confidence Level:** **HIGH** - All critical decisions documented, requirements fully covered, patterns comprehensive

**Key Strengths:**

1. **Complete Requirements Coverage**: All 58 FRs and all NFRs are architecturally supported
2. **Coherent Decision Set**: All architectural decisions work together without conflicts
3. **Comprehensive Patterns**: Implementation patterns address all potential conflict points
4. **Clear Structure**: Project structure is complete and specific, enabling consistent implementation
5. **Performance Focus**: Multi-layer caching and optimization strategies address all performance targets
6. **Graceful Degradation**: Fallback mechanisms ensure system reliability (FSRS fallback, offline support)
7. **Vietnamese-First**: All decisions consider Vietnamese learner context and Hán Việt integration

**Areas for Future Enhancement:**

1. **Semantic Tag Expansion**: Add semantic tags to Vocabulary model for richer relationships (post-Phase 3)
2. **Vector Embeddings**: Integrate pgvector for advanced semantic similarity (V3)
3. **Deep Knowledge Tracing**: Replace FSRS with DKT model when sufficient data available (V3)
4. **Advanced Graph Visualizations**: Three.js integration for 3D graph exploration (future)

### Implementation Handoff

**AI Agent Guidelines:**

- **Follow all architectural decisions exactly as documented** - No deviations without discussion
- **Use implementation patterns consistently** - Naming, structure, communication patterns are mandatory
- **Respect project structure and boundaries** - Module boundaries, component organization, integration points
- **Refer to this document for all architectural questions** - This is the single source of truth
- **Maintain Vertical Slice Architecture** - Feature-first organization, no technical layer organization
- **Use executeSafeAction for all Server Actions** - Never direct returns or throws
- **Validate all JSONB content with Zod schemas** - Type safety is non-negotiable
- **Implement graceful degradation** - All features must degrade gracefully, never block core functionality

**First Implementation Priority:**

Based on Phase 3 focus, implementation should begin with:

1. **Semantic Sequencer Service** (`src/modules/study/services/semantic-sequencer.service.ts`)
   - Core Phase 3 feature enabling semantic word sequencing
   - Integrates with existing FSRS system
   - Uses etymology graph relationships

2. **Priming Logic Enhancement** (`src/modules/priming/actions.ts`)
   - Deck-specific story checks
   - Soft gate implementation (toasts/warnings)
   - Skip handling for user preferences

3. **Caching Layer** (`src/lib/cache/memory-cache.ts`)
   - Enables performance targets (<500ms algorithm, <200ms graph)
   - Supports scalability (10,000+ concurrent users)
   - Foundation for all Phase 3 performance optimizations

**Implementation Sequence Recommendation:**

1. Create caching layer (foundation for performance)
2. Implement semantic sequencer (core Phase 3 feature)
3. Enhance priming logic (completes Story Engine integration)
4. Add IndexedDB offline support (PWA enhancement)
5. Integrate performance monitoring (validate targets)

**Success Metrics:**

- Semantic algorithm queries complete in <500ms
- Knowledge graph operations complete in <200ms
- All 58 FRs implemented and tested
- All NFRs validated (performance, security, scalability, accessibility, reliability)
- Zero circular dependencies between modules
- 100% Server Actions use executeSafeAction wrapper
- All JSONB content validated with Zod schemas

---

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅
**Total Steps Completed:** 8
**Date Completed:** 2025-12-31
**Document Location:** `_bmad-output/planning-artifacts/architecture.md`

### Final Architecture Deliverables

**📋 Complete Architecture Document**

- All architectural decisions documented with specific versions
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping
- Validation confirming coherence and completeness

**🏗️ Implementation Ready Foundation**

- **7 major architectural decisions** made (Story Engine, Priming Logic, AI Content Factory, Knowledge Graph, Semantic Algorithm, PWA/Offline, Performance Optimization)
- **8 implementation pattern categories** defined (Naming, Structure, Format, Communication, Process patterns)
- **10+ architectural components** specified (modules, services, stores, components)
- **58 functional requirements + all NFRs** fully supported

**📚 AI Agent Implementation Guide**

- Technology stack with verified versions (Next.js 16.1.1, Prisma 7.2.0, Ant Design 6.1.2, Zustand 5.0.9)
- Consistency rules that prevent implementation conflicts
- Project structure with clear boundaries
- Integration patterns and communication standards

### Implementation Handoff

**For AI Agents:**
This architecture document is your complete guide for implementing watashi-jp Phase 3 features. Follow all decisions, patterns, and structures exactly as documented.

**First Implementation Priority:**

Based on Phase 3 focus, begin with:

1. **Semantic Sequencer Service** (`src/modules/study/services/semantic-sequencer.service.ts`)
   - Core Phase 3 feature enabling semantic word sequencing
   - Integrates with existing FSRS system
   - Uses etymology graph relationships

2. **Priming Logic Enhancement** (`src/modules/priming/actions.ts`)
   - Deck-specific story checks
   - Soft gate implementation (toasts/warnings)
   - Skip handling for user preferences

3. **Caching Layer** (`src/lib/cache/memory-cache.ts`)
   - Enables performance targets (<500ms algorithm, <200ms graph)
   - Supports scalability (10,000+ concurrent users)
   - Foundation for all Phase 3 performance optimizations

**Development Sequence:**

1. Create caching layer (foundation for performance)
2. Implement semantic sequencer (core Phase 3 feature)
3. Enhance priming logic (completes Story Engine integration)
4. Add IndexedDB offline support (PWA enhancement)
5. Integrate performance monitoring (validate targets)

### Quality Assurance Checklist

**✅ Architecture Coherence**

- [x] All decisions work together without conflicts
- [x] Technology choices are compatible (Next.js, Prisma, Ant Design, Zustand)
- [x] Patterns support the architectural decisions (Vertical Slice, Server Actions, Zustand stores)
- [x] Structure aligns with all choices (modules/{feature}/ organization)

**✅ Requirements Coverage**

- [x] All 58 functional requirements are supported
- [x] All non-functional requirements are addressed (Performance, Security, Scalability, Accessibility, Reliability)
- [x] Cross-cutting concerns are handled (Auth, i18n, Analytics, Error Handling)
- [x] Integration points are defined (Server Actions, State Management, External APIs)

**✅ Implementation Readiness**

- [x] Decisions are specific and actionable (with versions, file paths, code examples)
- [x] Patterns prevent agent conflicts (8 conflict areas addressed)
- [x] Structure is complete and unambiguous (all files and directories specified)
- [x] Examples are provided for clarity (good examples and anti-patterns)

### Project Success Factors

**🎯 Clear Decision Framework**
Every technology choice was made collaboratively with clear rationale, ensuring all stakeholders understand the architectural direction. All 7 major decisions include detailed ADRs with options, rationale, and implementation details.

**🔧 Consistency Guarantee**
Implementation patterns and rules ensure that multiple AI agents will produce compatible, consistent code that works together seamlessly. 8 critical conflict points have been addressed with comprehensive patterns.

**📋 Complete Coverage**
All project requirements are architecturally supported, with clear mapping from business needs to technical implementation. All 58 FRs and all NFRs have architectural support.

**🏗️ Solid Foundation**
The existing Next.js codebase and architectural patterns provide a production-ready foundation following current best practices. Vertical Slice Architecture is maintained throughout.

---

**Architecture Status:** ✅ **READY FOR IMPLEMENTATION**

**Next Phase:** Begin Phase 3 implementation using the architectural decisions and patterns documented herein.

**Document Maintenance:** Update this architecture when major technical decisions are made during implementation.
