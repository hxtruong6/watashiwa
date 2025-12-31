---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# watashi-jp - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for watashi-jp, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Users can experience semantic word sequencing based on contextual relationships rather than time-based intervals
FR2: Users can switch between semantic algorithm mode and traditional SRS mode based on preference
FR3: System can detect and present semantically related words (e.g., "university" suggests "student" and "teacher")
FR4: System can generate authentic contextual examples linking new vocabulary to previously learned words
FR5: Users can receive algorithm performance feedback and switch modes if semantic approach isn't effective
FR6: System can analyze user learning patterns to optimize semantic relationship suggestions
FR7: Users can provide feedback on algorithm suggestions to improve future recommendations
FR8: System can adapt semantic sequencing based on individual user confusion patterns
FR9: Users can access algorithm transparency showing why specific words were selected for learning
FR10: Users can visualize learned vocabulary as interactive semantic networks
FR11: Users can explore relationships between words through interactive graph navigation
FR12: System can progressively build and display knowledge graph growth over time
FR13: Users can search and filter within their personal knowledge graph
FR14: System can highlight semantic connections when users encounter related vocabulary
FR15: Users can click on graph nodes to access detailed word information and examples
FR16: Users can expand or collapse graph sections to focus on specific relationship clusters
FR17: System can suggest graph exploration paths based on learning goals
FR18: Users can share specific graph sections or insights with others
FR19: System can automatically detect user confusion patterns (homonyms, readings, pitch variations)
FR20: Users can receive targeted interventions when system identifies learning difficulties
FR21: System can provide multi-modal feedback (visual, audio, textual) for different learning styles
FR22: Users can access detailed explanations of why interventions were triggered
FR23: Users can participate in focused practice sets for specific confusion types
FR24: System can adapt intervention intensity based on user progress and preferences
FR25: Users can review intervention history and effectiveness tracking
FR26: System can suggest alternative learning approaches when standard interventions fail
FR27: Users can access native Vietnamese interface and navigation throughout the application
FR28: System can leverage Hán Việt knowledge as semantic bridges for kanji recognition
FR29: Users can receive culturally relevant examples and contextual usage
FR30: System can provide Vietnamese phonetic guidance alongside Japanese pronunciation
FR31: Users can toggle between Vietnamese and English interface languages
FR32: System can generate Vietnamese explanations for complex Japanese grammar concepts
FR33: Users can access Hán Việt etymology and meaning connections for kanji learning
FR34: System can adapt content difficulty based on Vietnamese language proficiency
FR35: Users can participate in seamless study sessions with semantic word presentation
FR36: System can maintain session continuity across device interruptions and app closures
FR37: Users can customize session length and focus areas within semantic constraints
FR38: System can provide session summaries showing semantic connections discovered
FR39: Users can view real-time progress within semantic learning frameworks
FR40: System can track intervention effectiveness and adjust future session recommendations
FR41: Users can review session history with semantic insights and relationship discoveries
FR42: System can suggest optimal session timing based on semantic learning patterns
FR43: Users can create and manage personalized learning profiles with Vietnamese preferences
FR44: System can synchronize learning progress across multiple devices and platforms
FR45: Users can export learning data and knowledge graph for external analysis
FR46: System can maintain learning history for long-term progress tracking
FR47: System can adapt semantic suggestions based on individual learning patterns and preferences
FR48: Users can set learning goals and receive personalized semantic pathways
FR49: System can remember user preferences for interface language and presentation modes
FR50: Users can access personalized insights about their semantic learning journey
FR51: System can conduct A/B testing between semantic and traditional SRS approaches
FR52: Users can participate in algorithm validation studies with optional data contribution
FR53: System can provide algorithm performance metrics and learning outcome comparisons
FR54: Users can access research insights from their learning data (privacy-protected)
FR55: System can validate AI-generated examples for cultural and linguistic accuracy
FR56: Users can report content issues and suggest improvements
FR57: System can maintain content quality standards for Vietnamese localization
FR58: Users can access content source attribution and learning methodology explanations

### NonFunctional Requirements

**Performance Requirements:**

NFR1: Semantic algorithm queries for word relationships complete in <500ms under normal load
NFR2: Knowledge graph relationship calculations complete in <200ms for graph operations
NFR3: Initial page loads complete in <3 seconds on 3G network connections
NFR4: Study session card transitions and interactions complete in <100ms for smooth user experience
NFR5: Knowledge graph visualizations render in <1 second for networks up to 50 nodes
NFR6: Vietnamese interface translations load within <200ms of user language selection
NFR7: PWA offline functionality activates core learning features within 2 seconds
NFR8: Multi-modal feedback (audio, visual, haptic) triggers within <50ms of user actions
NFR9: System maintains <500ms algorithm response times with 10,000+ concurrent users
NFR10: Database queries for user progress and knowledge graphs complete in <200ms at peak load
NFR11: API endpoints sustain 100+ requests per second during usage spikes
NFR12: CDN caching achieves 90%+ hit rate for static learning assets and media

**Security Requirements:**

NFR13: All user learning data encrypted at rest using industry-standard AES-256 encryption
NFR14: Data in transit protected with TLS 1.3 encryption for all communications
NFR15: Vietnamese language preferences and cultural settings stored securely
NFR16: Algorithm performance data anonymized before any research or analytics usage
NFR17: User sessions secured with JWT tokens with appropriate expiration policies
NFR18: Knowledge graph data accessible only to authenticated users who own the data
NFR19: Admin access to system analytics requires multi-factor authentication
NFR20: API access controlled through OAuth 2.0 or similar secure authorization protocols
NFR21: Educational user data protected under COPPA/FERPA guidelines for learning platforms
NFR22: Vietnamese users' personal learning patterns and progress data safeguarded
NFR23: Third-party AI services comply with data processing and privacy regulations
NFR24: Users maintain full control over data sharing preferences and consent

**Scalability Requirements:**

NFR25: Architecture designed to support 10,000+ concurrent learning sessions without performance degradation
NFR26: Database schema optimized for knowledge graph relationships at enterprise scale
NFR27: Load balancing infrastructure handles 10x traffic spikes during peak learning periods
NFR28: Multi-region deployment capability for global Vietnamese learner distribution
NFR29: Knowledge graph storage scales efficiently with growing vocabulary networks
NFR30: User progress tracking maintains performance with extensive learning histories
NFR31: Algorithm training data storage supports continuous improvement without bottlenecks
NFR32: Backup and recovery systems scale with data growth requirements

**Accessibility Requirements:**

NFR33: All user interfaces achieve WCAG 2.1 AA compliance for web accessibility standards
NFR34: Screen reader compatibility for Japanese vocabulary pronunciation and semantic explanations
NFR35: Keyboard navigation support for all study session controls, graph interactions, and settings
NFR36: High contrast mode support for extended learning sessions and visual comfort
NFR37: Vietnamese text scaling and readability across all device sizes and zoom levels
NFR38: Multi-modal feedback systems (visual, audio, haptic) accommodate different user needs
NFR39: Font and display customization options for users with visual processing differences
NFR40: Error prevention mechanisms for critical learning actions and data preservation
NFR41: Vietnamese language interface maintains full functionality across all accessibility features
NFR42: Hán Việt content presented in accessible formats for screen readers and braille displays
NFR43: Cultural context explanations provided in multiple formats (text, audio, visual)
NFR44: Learning progress indicators designed for accessibility compliance

**Reliability Requirements:**

NFR45: Core learning functionality maintains 99.5% uptime for production deployment
NFR46: Semantic algorithm services achieve 99.9% availability for uninterrupted learning
NFR47: PWA offline capabilities ensure learning continuity during connectivity issues
NFR48: Scheduled maintenance windows minimize impact on user learning sessions
NFR49: Knowledge graph relationships maintained with ACID compliance for data consistency
NFR50: User progress and learning statistics preserved across system updates and migrations
NFR51: Algorithm improvements validated through comprehensive testing before deployment
NFR52: Backup systems ensure <4 hours of data loss in worst-case failure scenarios
NFR53: Graceful degradation when semantic algorithm services experience temporary issues
NFR54: SRS fallback mode automatically activates when semantic processing fails
NFR55: User data preserved and recoverable from all error states and system crashes
NFR56: Clear error messaging in Vietnamese with actionable recovery instructions

### Additional Requirements

**Technical Requirements from Architecture:**

- Next.js 16.1.1 (App Router) - Server Components + Client Components pattern must be maintained
- PostgreSQL with Prisma 7.2.0 ORM - JSONB support for flexible content (Story, Vocabulary etymology)
- Ant Design 6.1.2 - NO Tailwind CSS (explicit constraint)
- Zustand 5.0.9 - Lightweight global state for session management
- Vertical Slice Architecture (feature-first organization) - Must maintain module boundaries
- Story Engine: Story model with JSONB content schema, StoryLog tracking for user progress
- AI Content Factory: LLM-based story generation with JSON validation (Zod schemas)
- Priming Logic: Deck-specific story checks (only when `deckId` present), soft gates (toasts/warnings, not hard redirects)
- Story content rendering with highlighted keywords, audio playback <200ms
- Supabase Auth: OAuth and email/password authentication integration
- PostHog 1.310.1: Analytics tracking (story events, priming conversion)
- Sentry 10.32.1: Error monitoring and performance tracking
- External LLM APIs: Story generation (Phase 3) - GPT-4o for content creation
- Study Session Initialization Flow: Priming check (if `deckId` present) → Story fetch → StoryLog verification → Card fetch → Algorithm selection (must complete in <3s on 3G)
- Knowledge Graph Query Path: Relationship calculation → Graph data fetch → Visualization rendering (must complete in <200ms for queries, <1s for 50+ node rendering)
- Story Content Rendering: Story fetch → Content parsing → Keyword highlighting → Audio pre-loading (must support interactive keyword tapping with <200ms audio playback)
- Semantic Sequencer Service: Core Phase 3 feature enabling semantic word sequencing, integrates with existing FSRS system, uses etymology graph relationships
- Caching Layer: Enables performance targets (<500ms algorithm, <200ms graph), supports scalability (10,000+ concurrent users)
- IndexedDB offline support for PWA enhancement
- Performance monitoring integration to validate targets

**UX Requirements from UX Design Specification:**

- Mobile-first Progressive Web App (PWA) optimized for mobile touch interactions with desktop enhancement
- Touch targets ≥44px for all semantic interaction elements
- Thumb zone optimization for one-handed learning session navigation
- Responsive knowledge graph scaling from mobile cards to desktop networks
- Smooth transitions (>200ms, ease-out) for knowledge graph animations and semantic reveals
- Progressive disclosure preventing cognitive overload
- Multi-modal feedback (visual, audio, haptic) for different learning styles
- Vietnamese-first interface with cultural adaptation throughout
- Cross-device continuity: Seamless synchronization across phones, tablets, and desktops
- Browser support: Modern browsers with graceful degradation for older versions
- Desktop: Full keyboard navigation and advanced graph interaction capabilities
- Mobile: Touch-based interactions with thumb zone optimization
- Tablet: Hybrid touch/mouse interaction support
- Semantic discovery: Learning feels like exploring meaningful relationships, not memorizing disconnected items
- Emotional validation: Every interaction reinforces that learning creates lasting understanding networks
- Immediate, encouraging feedback: Clear responses to semantic interactions that build confidence
- Flexible interaction models: Give users control over how they engage with learning content
- Semantic learning support: Rich component library suitable for complex interactions (knowledge graphs, semantic interventions)
- PWA compatibility: Strong mobile-first responsive design with PWA capabilities
- Accessibility compliance: WCAG 2.1 AA compliance built into core components
- Cultural accessibility: Vietnamese language interface maintains full functionality across all accessibility features
- Hán Việt content presented in accessible formats for screen readers and braille displays
- Cultural context explanations provided in multiple formats (text, audio, visual)

**Infrastructure and Deployment Requirements:**

- No starter template needed (brownfield project - existing Next.js 16.1.1 codebase serves as foundation)
- Vertical Slice Architecture must be maintained (feature-first organization in `src/modules/`)
- Module boundaries must be clearly defined and maintained
- Integration points: Server Actions, State Management (Zustand), External APIs (Supabase, PostHog, Sentry, LLM APIs)
- Cross-cutting concerns: Semantic Algorithm Performance, Vietnamese Localization, Offline/PWA Capability, Multi-Modal Feedback, Knowledge Graph Data Structure, Story Content Management, Cross-Device Synchronization, Algorithm Fallback (SRS)

### FR Coverage Map

FR1: Epic 2 - Semantic word sequencing based on contextual relationships
FR2: Epic 2 - Switch between semantic algorithm mode and traditional SRS mode
FR3: Epic 2 - Detect and present semantically related words
FR4: Epic 2 - Generate authentic contextual examples linking new vocabulary
FR5: Epic 2 - Receive algorithm performance feedback and switch modes
FR6: Epic 2 - Analyze user learning patterns to optimize semantic relationship suggestions
FR7: Epic 2 - Provide feedback on algorithm suggestions
FR8: Epic 2 - Adapt semantic sequencing based on individual user confusion patterns
FR9: Epic 2 - Access algorithm transparency showing why specific words were selected
FR10: Epic 3 - Visualize learned vocabulary as interactive semantic networks
FR11: Epic 3 - Explore relationships between words through interactive graph navigation
FR12: Epic 3 - Progressively build and display knowledge graph growth over time
FR13: Epic 3 - Search and filter within personal knowledge graph
FR14: Epic 3 - Highlight semantic connections when users encounter related vocabulary
FR15: Epic 3 - Click on graph nodes to access detailed word information and examples
FR16: Epic 3 - Expand or collapse graph sections to focus on specific relationship clusters
FR17: Epic 3 - Suggest graph exploration paths based on learning goals
FR18: Epic 3 - Share specific graph sections or insights with others
FR19: Epic 4 - Automatically detect user confusion patterns (homonyms, readings, pitch variations)
FR20: Epic 4 - Receive targeted interventions when system identifies learning difficulties
FR21: Epic 4 - Provide multi-modal feedback (visual, audio, textual) for different learning styles
FR22: Epic 4 - Access detailed explanations of why interventions were triggered
FR23: Epic 4 - Participate in focused practice sets for specific confusion types
FR24: Epic 4 - Adapt intervention intensity based on user progress and preferences
FR25: Epic 4 - Review intervention history and effectiveness tracking
FR26: Epic 4 - Suggest alternative learning approaches when standard interventions fail
FR27: Epic 5 - Access native Vietnamese interface and navigation throughout the application
FR28: Epic 5 - Leverage Hán Việt knowledge as semantic bridges for kanji recognition
FR29: Epic 5 - Receive culturally relevant examples and contextual usage
FR30: Epic 5 - Provide Vietnamese phonetic guidance alongside Japanese pronunciation
FR31: Epic 5 - Toggle between Vietnamese and English interface languages
FR32: Epic 5 - Generate Vietnamese explanations for complex Japanese grammar concepts
FR33: Epic 5 - Access Hán Việt etymology and meaning connections for kanji learning
FR34: Epic 5 - Adapt content difficulty based on Vietnamese language proficiency
FR35: Epic 2 - Participate in seamless study sessions with semantic word presentation
FR36: Epic 2 - Maintain session continuity across device interruptions and app closures
FR37: Epic 2 - Customize session length and focus areas within semantic constraints
FR38: Epic 2 - Provide session summaries showing semantic connections discovered
FR39: Epic 2 - View real-time progress within semantic learning frameworks
FR40: Epic 2 - Track intervention effectiveness and adjust future session recommendations
FR41: Epic 2 - Review session history with semantic insights and relationship discoveries
FR42: Epic 2 - Suggest optimal session timing based on semantic learning patterns
FR43: Epic 1 - Create and manage personalized learning profiles with Vietnamese preferences
FR44: Epic 1 - Synchronize learning progress across multiple devices and platforms
FR45: Epic 1 - Export learning data and knowledge graph for external analysis
FR46: Epic 1 - Maintain learning history for long-term progress tracking
FR47: Epic 1 - Adapt semantic suggestions based on individual learning patterns and preferences
FR48: Epic 1 - Set learning goals and receive personalized semantic pathways
FR49: Epic 1 - Remember user preferences for interface language and presentation modes
FR50: Epic 1 - Access personalized insights about their semantic learning journey
FR51: Epic 6 - Conduct A/B testing between semantic and traditional SRS approaches
FR52: Epic 6 - Participate in algorithm validation studies with optional data contribution
FR53: Epic 6 - Provide algorithm performance metrics and learning outcome comparisons
FR54: Epic 6 - Access research insights from their learning data (privacy-protected)
FR55: Epic 6 - Validate AI-generated examples for cultural and linguistic accuracy
FR56: Epic 6 - Report content issues and suggest improvements
FR57: Epic 6 - Maintain content quality standards for Vietnamese localization
FR58: Epic 6 - Access content source attribution and learning methodology explanations

## Epic List

### Epic 1: User Account & Profile Setup

Users can create accounts, set Vietnamese preferences, and personalize their learning experience. This epic establishes the foundation for all other features by enabling user authentication, profile management, cross-device synchronization, and personalization preferences.

**FRs covered:** FR43, FR44, FR45, FR46, FR47, FR48, FR49, FR50

**Security NFRs covered:** NFR13, NFR14, NFR17, NFR18, NFR19, NFR20

**User Outcomes:**

- Users can register and authenticate securely
- Users can create and manage personalized learning profiles
- Users can set Vietnamese language preferences and cultural settings
- Users can synchronize learning progress across multiple devices
- Users can export learning data for external analysis
- Users can set learning goals and receive personalized pathways
- Users can access personalized insights about their learning journey
- System is protected with security headers (CSP, HSTS) and proper access control

**Implementation Notes:**

- Foundation epic that enables all other features
- Integrates with Supabase Auth for authentication
- Requires cross-device synchronization infrastructure
- Must support Vietnamese-first personalization from the start
- Includes infrastructure security (CSP, HSTS, Permissions Policy) and RBAC enforcement

### Story 1.1: User Registration with Email/Password

As a new user,
I want to create an account using my email and password,
So that I can access personalized learning features and track my progress.

**Acceptance Criteria:**

**Given** I am on the registration page
**When** I enter a valid email address, a secure password (min 6 characters), and confirm my password
**Then** my account is created successfully
**And** I receive a verification email
**And** I am redirected to the profile setup page
**And** my user profile is initialized with default Vietnamese preferences (FR43, FR49)

**Given** I enter an email that already exists
**When** I attempt to register
**Then** I see an error message indicating the email is already registered
**And** I can navigate to the login page

**Given** I enter a password that doesn't meet security requirements
**When** I attempt to register
**Then** I see validation feedback indicating password requirements
**And** I cannot submit the form until requirements are met

**Given** I am registering during a network interruption
**When** I submit the registration form
**Then** I see a network error message
**And** my registration data is preserved locally
**And** I can retry when connectivity is restored

**Given** I enter an email with invalid format (e.g., "notanemail")
**When** I attempt to register
**Then** I see validation feedback indicating invalid email format
**And** I cannot submit the form until email is valid

**Given** I enter a password confirmation that doesn't match
**When** I attempt to register
**Then** I see an error indicating password mismatch
**And** I can correct the password confirmation

**Given** the verification email service is temporarily unavailable
**When** I successfully register
**Then** my account is created
**And** I see a message that verification email will be sent when service is available
**And** I can request a new verification email later

### Story 1.2: User Login and Session Management

As a registered user,
I want to log in with my email and password,
So that I can access my personalized learning profile and continue my studies.

**Acceptance Criteria:**

**Given** I have a verified account
**When** I enter my correct email and password on the login page
**Then** I am authenticated successfully
**And** a secure session is created with JWT token (NFR17)
**And** I am redirected to my dashboard
**And** my user preferences are loaded (FR49)

**Given** I enter incorrect credentials
**When** I attempt to log in
**Then** I see an error message indicating invalid credentials
**And** I remain on the login page
**And** my session is not created

**Given** I am logged in
**When** my session expires or I log out
**Then** I am redirected to the login page
**And** my session data is cleared securely

**Given** I attempt to log in during a network outage
**When** I submit login credentials
**Then** I see a network error message
**And** I can retry when connectivity is restored
**And** my credentials are not stored locally

**Given** I enter my email but forget my password
**When** I attempt to log in
**Then** I can access a "Forgot Password" link
**And** I can reset my password via email

**Given** I am logged in on multiple devices simultaneously
**When** I log out from one device
**Then** my session on other devices remains active
**And** I can continue using the app on other devices

**Given** my session token is invalid or corrupted
**When** I attempt to access protected content
**Then** I am redirected to login
**And** I see a message that my session has expired
**And** I can log in again to continue

### Story 1.3: User Profile Management

As a logged-in user,
I want to manage my profile settings and Vietnamese preferences,
So that my learning experience is personalized to my language and cultural context.

**Acceptance Criteria:**

**Given** I am logged in and viewing my profile page
**When** I update my display name, language preference (Vietnamese/English), and cultural settings
**Then** my profile is updated successfully
**And** changes are saved to the database
**And** the interface language updates immediately if changed (FR27, FR31, FR49)

**Given** I am on the profile settings page
**When** I select Vietnamese as my interface language
**Then** all UI elements switch to Vietnamese
**And** my preference is saved for future sessions (FR27, FR49)
**And** Vietnamese text rendering is optimized (NFR37)

**Given** I am updating my profile
**When** I attempt to save invalid data (e.g., empty required fields)
**Then** I see validation errors
**And** my changes are not saved
**And** I can correct the errors and retry

**Given** I am updating my profile during a network interruption
**When** I attempt to save changes
**Then** I see a network error message
**And** my unsaved changes are preserved locally
**And** I can retry saving when connectivity is restored

**Given** I enter a display name with special characters or emoji
**When** I save my profile
**Then** the name is validated and sanitized if needed
**And** I see confirmation of what was saved
**And** the name displays correctly throughout the application

**Given** I am updating my profile while another device is also updating it
**When** both devices save changes
**Then** the most recent changes take precedence
**And** I receive a notification about the conflict
**And** I can review what was overwritten

### Story 1.4: Cross-Device Synchronization

As a user with multiple devices,
I want my learning progress to synchronize across all my devices,
So that I can seamlessly continue studying on any device.

**Acceptance Criteria:**

**Given** I am logged in on Device A and complete a study session
**When** I log in on Device B
**Then** my learning progress from Device A is visible on Device B
**And** my session history is synchronized (FR44)
**And** my knowledge graph state is consistent across devices

**Given** I am studying on Device A
**When** I switch to Device B mid-session
**Then** I can resume my session from where I left off (FR36)
**And** all progress is preserved
**And** no data is lost during synchronization

**Given** I have conflicting changes on two devices
**When** synchronization occurs
**Then** the most recent changes take precedence
**And** I receive a notification about the conflict resolution
**And** my data remains consistent

**Given** I am on a device with no internet connection
**When** I make changes to my learning progress
**Then** changes are stored locally
**And** I see an indicator that sync is pending
**And** changes are synchronized automatically when connectivity is restored

**Given** I have a very large amount of learning data (10,000+ words)
**When** synchronization occurs
**Then** synchronization completes within reasonable time (<2 minutes)
**And** progress indicators show sync status
**And** data integrity is maintained throughout the process

**Given** synchronization fails due to server error
**When** the error occurs
**Then** I see an error message
**And** my local data is preserved
**And** the system automatically retries synchronization
**And** I can manually trigger a retry if needed

### Story 1.5: Learning Goals and Personalized Pathways

As a learner,
I want to set learning goals and receive personalized semantic pathways,
So that my study sessions are aligned with my objectives and learning patterns.

**Acceptance Criteria:**

**Given** I am on my dashboard
**When** I set a learning goal (e.g., "Learn 100 words this month" or "Pass JLPT N4")
**Then** my goal is saved to my profile
**And** I can view my goal progress
**And** the system adapts semantic suggestions based on my goal (FR48)

**Given** I have set learning goals and have learning history
**When** I start a new study session
**Then** the system suggests a personalized semantic pathway aligned with my goals
**And** word sequencing considers my learning patterns (FR47)
**And** suggestions adapt based on my progress toward goals

**Given** I have completed several study sessions
**When** I view my personalized insights
**Then** I see recommendations based on my learning patterns
**And** I can see how my progress aligns with my goals
**And** I receive suggestions for optimizing my learning path (FR47, FR48)

**Given** I have no learning history yet
**When** I set a learning goal
**Then** my goal is saved
**And** I see a message encouraging me to start studying
**And** the system will adapt suggestions once I have learning data

**Given** I have set an unrealistic goal (e.g., "Learn 10,000 words in 1 day")
**When** I view goal progress
**Then** the system accepts the goal but may suggest more realistic alternatives
**And** progress tracking still works correctly
**And** I can adjust the goal at any time

### Story 1.6: Learning Data Export

As a user,
I want to export my learning data and knowledge graph,
So that I can analyze my progress externally or backup my learning history.

**Acceptance Criteria:**

**Given** I am logged in and have learning history
**When** I request to export my learning data
**Then** a JSON file is generated containing my learning progress, vocabulary history, and knowledge graph structure
**And** the file is downloadable
**And** all data is formatted in a structured, readable format (FR45)

**Given** I request a data export
**When** the export is generated
**Then** my personal information is included only if I consent
**And** the export includes timestamps and metadata
**And** the knowledge graph relationships are preserved in the export format

**Given** I have a large amount of learning data
**When** I request an export
**Then** the export process completes within reasonable time (<30 seconds)
**And** I receive a notification when the export is ready
**And** the file size is optimized for download

**Given** I have no learning data yet
**When** I request an export
**Then** I receive an empty export file with proper structure
**And** I see a message indicating no data to export
**And** the export format is still valid JSON

**Given** the export process fails due to server error
**When** the error occurs
**Then** I see an error message
**And** I can retry the export
**And** my data is not affected by the failure

**Given** I request an export while another export is in progress
**When** I submit the second request
**Then** I see a message that an export is already in progress
**And** I can cancel the current export or wait for completion
**And** only one export process runs at a time

### Story 1.7: Learning History and Personalized Insights

As a learner,
I want to view my learning history and receive personalized insights,
So that I can understand my progress and optimize my learning journey.

**Acceptance Criteria:**

**Given** I have completed multiple study sessions
**When** I view my learning history
**Then** I see a chronological list of all my study sessions
**And** each session shows date, duration, words studied, and semantic connections discovered
**And** I can filter and search my history (FR46)

**Given** I have accumulated learning data over time
**When** I access my personalized insights dashboard
**Then** I see statistics about my learning patterns (e.g., most active days, retention rates, confusion patterns)
**And** I receive insights about my semantic learning journey (FR50)
**And** insights are presented in my preferred language (Vietnamese/English)

**Given** I am viewing my learning history
**When** I click on a specific session
**Then** I see detailed information about that session
**And** I can see which semantic connections were discovered
**And** I can review the words I studied during that session

**Given** I have no study sessions yet
**When** I view my learning history
**Then** I see an empty state message encouraging me to start studying
**And** I see a button to start my first study session
**And** the interface is still functional and navigable

**Given** I have thousands of study sessions in my history
**When** I view my learning history
**Then** sessions are paginated or virtualized for performance
**And** I can search and filter to find specific sessions
**And** the interface remains responsive (<200ms interactions, NFR10)

**Given** I am viewing learning history during a network interruption
**When** I try to load more sessions
**Then** I see cached sessions if available
**And** I see an indicator that new data cannot be loaded
**And** I can refresh when connectivity is restored

### Story 1.8: Implement Security Headers (CSP, HSTS, Permissions Policy)

As a system administrator,
I want to implement security headers (CSP, HSTS, Permissions Policy) in the infrastructure,
So that the application is protected against XSS attacks, MITM attacks, and unauthorized browser feature access.

**Acceptance Criteria:**

**Given** the application is deployed
**When** users access the application
**Then** Content Security Policy (CSP) headers are configured with specific allowed domains (not wildcard protocols)
**And** CSP restricts script-src to 'self' and specific trusted domains (Supabase, PostHog, Sentry)
**And** CSP prevents XSS attacks by avoiding overly permissive 'http:' and 'https:' wildcards
**And** CSP maintains Next.js compatibility while maximizing security (NFR13, NFR14)

**Given** users access the application over HTTPS
**When** they visit the application
**Then** HSTS (HTTP Strict Transport Security) header is present
**And** HSTS is configured with max-age=63072000, includeSubDomains, and preload
**And** users are protected from MITM attacks on first visit (NFR14)

**Given** the application is served
**When** security headers are sent
**Then** Permissions Policy header is configured to disable unused browser features
**And** camera, microphone, geolocation, and browsing-topics are explicitly disabled
**And** only necessary browser features are enabled

**Given** security headers are configured
**When** the application is tested
**Then** CSP is validated to ensure it doesn't break Next.js functionality
**And** security headers are tested across all routes
**And** headers are properly configured in Nginx/Next.js middleware

**Given** security headers are implemented
**When** users access the application
**Then** no security header warnings appear in browser console
**And** security headers are verified using security testing tools
**And** headers are consistently applied across all pages

### Story 1.9: Enforce Role-Based Access Control in Server Actions

As a system administrator,
I want to ensure all sensitive Server Actions are protected with role-based access control,
So that unauthorized users cannot access or modify data they shouldn't have access to.

**Acceptance Criteria:**

**Given** I have Server Actions that perform sensitive operations (deleteDeck, updateUser, admin functions)
**When** these actions are called
**Then** all actions are wrapped with `requireRole` or `hasRole` checks (NFR18, NFR19, NFR20)
**And** unauthorized access attempts return proper error responses
**And** access control is enforced before any business logic executes

**Given** a user attempts to access a protected Server Action
**When** they don't have the required role
**Then** they receive a clear error message indicating insufficient permissions
**And** the action is not executed
**And** the unauthorized attempt is logged for security monitoring

**Given** admin-level Server Actions exist
**When** they are accessed
**Then** multi-factor authentication is required for admin access (NFR19)
**And** admin actions are logged with user identification
**And** admin access follows the principle of least privilege

**Given** Server Actions handle user data
**When** actions are executed
**Then** users can only access their own data (NFR18)
**And** data ownership is verified before any operations
**And** cross-user data access is prevented

**Given** RBAC is implemented across all Server Actions
**When** I audit the codebase
**Then** all sensitive actions have explicit role checks
**And** no actions bypass authorization
**And** RBAC coverage is documented and verified

---

### Epic 2: Core Semantic Learning Sessions

Users can participate in study sessions with semantic word sequencing, contextual relationships, and comprehensive session management. This epic delivers the core learning experience where users encounter words in meaningful semantic relationships rather than isolated memorization.

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR35, FR36, FR37, FR38, FR39, FR40, FR41, FR42

**Security NFRs covered:** NFR13, NFR14 (Input validation and rate limiting support data protection)

**User Outcomes:**

- Users can experience semantic word sequencing based on contextual relationships
- Users can switch between semantic algorithm mode and traditional SRS mode
- Users can see semantically related words suggested during study
- Users can receive contextual examples linking new vocabulary to previously learned words
- Users can participate in seamless study sessions with session continuity
- Users can customize session length and focus areas
- Users can view real-time progress and session summaries
- Users can review session history with semantic insights
- System validates all inputs and protects against abuse with rate limiting

**Implementation Notes:**

- Core learning experience epic
- Requires semantic sequencer service implementation
- Integrates with existing FSRS system
- Must maintain session state across device interruptions
- Performance critical: <500ms algorithm response times
- Includes input validation (Zod) and rate limiting for security

### Story 2.1: Start Study Session with Semantic Sequencing

As a learner,
I want to start a study session where words are presented based on semantic relationships,
So that I learn vocabulary in meaningful contextual connections rather than random order.

**Acceptance Criteria:**

**Given** I am logged in and have vocabulary in my deck
**When** I start a new study session
**Then** words are presented based on contextual relationships rather than time-based intervals (FR1)
**And** the semantic sequencer service selects words with semantic connections (<500ms response time, NFR1)
**And** I see the first word card with its semantic context
**And** the session state is initialized and saved (FR35)

**Given** I am starting a study session
**When** the semantic algorithm processes word relationships
**Then** the algorithm response completes in <500ms (NFR1)
**And** words are sequenced to create meaningful learning connections
**And** previously learned words influence the selection of new words

**Given** I have no vocabulary in my deck
**When** I attempt to start a study session
**Then** I see a message indicating I need to add vocabulary first
**And** I am directed to the deck management page

**Given** the semantic algorithm service is temporarily unavailable
**When** I start a study session
**Then** the system automatically falls back to SRS mode (NFR54)
**And** I see a notification that semantic mode is unavailable
**And** the session continues normally with SRS sequencing

**Given** the semantic algorithm takes longer than 500ms to respond
**When** I start a study session
**Then** the system shows a loading indicator
**And** if timeout occurs (>2 seconds), it falls back to SRS mode
**And** I can retry semantic mode later

**Given** I have only one word in my deck
**When** I start a study session
**Then** the session starts with that word
**And** I see a message suggesting I add more vocabulary for better semantic sequencing
**And** the session completes normally

### Story 2.2: Switch Between Semantic and SRS Algorithm Modes

As a learner,
I want to switch between semantic algorithm mode and traditional SRS mode,
So that I can choose the learning approach that works best for me.

**Acceptance Criteria:**

**Given** I am in an active study session
**When** I access the algorithm mode settings
**Then** I can see the current mode (Semantic or SRS)
**And** I can switch between modes
**And** the switch takes effect immediately for the next word (FR2)

**Given** I switch from semantic mode to SRS mode
**When** the switch is confirmed
**Then** subsequent words are presented using traditional SRS timing
**And** my preference is saved for future sessions
**And** I receive confirmation of the mode change

**Given** I am using semantic mode and experiencing poor performance
**When** I view algorithm performance feedback
**Then** I can see metrics about semantic algorithm effectiveness (FR5)
**And** I receive recommendations to switch to SRS mode if needed
**And** I can switch modes based on the feedback

**Given** I switch algorithm modes mid-session
**When** the switch occurs
**Then** my current progress is preserved
**And** the next word uses the new algorithm mode
**And** I don't lose any words I've already studied

**Given** I attempt to switch modes during a network interruption
**When** I make the switch
**Then** the switch is saved locally
**And** it syncs to the server when connectivity is restored
**And** the mode change takes effect immediately locally

### Story 2.3: View Semantically Related Words During Study

As a learner,
I want to see semantically related words suggested during my study session,
So that I can understand vocabulary connections and build knowledge networks.

**Acceptance Criteria:**

**Given** I am studying a word (e.g., "university/大学")
**When** the system detects semantic relationships
**Then** I see related words suggested (e.g., "student/学生" and "teacher/先生") (FR3)
**And** the relationship type is indicated (e.g., "related concept", "contextual usage")
**And** suggestions appear within <500ms of word presentation (NFR1)

**Given** I am viewing a word with semantic suggestions
**When** I click on a suggested related word
**Then** I can see details about that word
**And** I can add it to my current study session if desired
**And** the relationship between words is visually highlighted

**Given** the system cannot find semantic relationships for a word
**When** I study that word
**Then** I see the word without related suggestions
**And** the study session continues normally
**And** no error is displayed

### Story 2.4: Receive Contextual Examples Linking Vocabulary

As a learner,
I want to see authentic contextual examples that link new vocabulary to words I've already learned,
So that I can understand how words are used together in meaningful contexts.

**Acceptance Criteria:**

**Given** I am studying a new word
**When** the system generates contextual examples
**Then** examples link the new word to previously learned vocabulary (FR4)
**And** examples are authentic and culturally appropriate
**And** examples are displayed with highlighted connections to known words

**Given** I am studying "eat/食べる"
**When** contextual examples are generated
**Then** I see examples like "ご飯を食べる (eat rice)" if I've learned "rice/ご飯" (FR4)
**And** the connection to previously learned words is clearly indicated
**And** examples help reinforce both the new word and existing vocabulary

**Given** I am viewing contextual examples
**When** I interact with highlighted words in examples
**Then** I can see details about those previously learned words
**And** I can review their meanings and usage
**And** the connection strengthens my understanding

### Story 2.5: Provide Feedback on Algorithm Suggestions

As a learner,
I want to provide feedback on semantic algorithm suggestions,
So that the system can improve future recommendations based on my learning preferences.

**Acceptance Criteria:**

**Given** I receive a semantic relationship suggestion during study
**When** I provide feedback (helpful, not helpful, incorrect)
**Then** my feedback is recorded
**And** the system uses this feedback to improve future suggestions (FR7)
**And** I receive confirmation that my feedback was received

**Given** I have provided feedback on multiple suggestions
**When** I continue studying
**Then** future suggestions better align with my preferences
**And** the algorithm adapts based on my feedback history
**And** I notice improved relevance of suggestions over time

**Given** I mark a suggestion as incorrect
**When** I submit the feedback
**Then** the system flags the relationship for review
**And** the incorrect suggestion is not shown to me again
**And** other users are not affected until the relationship is validated

### Story 2.6: View Algorithm Transparency and Reasoning

As a learner,
I want to understand why specific words were selected for my study session,
So that I can trust the semantic algorithm and understand my learning path.

**Acceptance Criteria:**

**Given** I am in a study session
**When** I view algorithm transparency information
**Then** I can see why each word was selected (FR9)
**And** I see the semantic relationships that influenced the selection
**And** the reasoning is presented in clear, understandable language

**Given** I am viewing algorithm transparency
**When** I see a word was selected
**Then** I can see which previously learned words influenced this selection
**And** I can see the strength of the semantic connection
**And** I understand how this word fits into my knowledge network

**Given** I want to understand my learning path
**When** I access the algorithm transparency view
**Then** I see a summary of how words are connected in my current session
**And** I can see the overall semantic strategy for my learning
**And** the information helps me understand the learning approach

### Story 2.7: Customize Session Length and Focus Areas

As a learner,
I want to customize my study session length and focus on specific areas,
So that I can study according to my available time and learning priorities.

**Acceptance Criteria:**

**Given** I am starting a new study session
**When** I configure session parameters
**Then** I can set the session length (e.g., 10, 20, 30 minutes) (FR37)
**And** I can select focus areas (e.g., specific decks, difficulty levels, semantic themes)
**And** my preferences are saved for future sessions

**Given** I have set a 20-minute session length
**When** I start the session
**Then** the system estimates the number of words I can study in that time
**And** words are selected to fit within the time constraint
**And** I see a progress indicator showing time remaining

**Given** I select a specific focus area (e.g., "food vocabulary")
**When** I start the session
**Then** words are prioritized from that focus area
**And** semantic relationships are emphasized within that theme
**And** the session maintains semantic sequencing within the focus constraint (FR37)

### Story 2.8: View Session Summary and Real-Time Progress

As a learner,
I want to see real-time progress and a summary of semantic connections discovered during my session,
So that I can track my learning and understand what I've accomplished.

**Acceptance Criteria:**

**Given** I am in an active study session
**When** I view my progress
**Then** I see real-time statistics (words studied, time elapsed, accuracy rate) (FR39)
**And** I see semantic connections discovered in this session
**And** progress updates continuously as I study

**Given** I complete a study session
**When** I view the session summary
**Then** I see a summary of all semantic connections discovered (FR38)
**And** I see statistics about words learned, reviewed, and mastered
**And** I can see how this session contributed to my knowledge network

**Given** I am viewing the session summary
**When** I review the semantic connections
**Then** I can see which words were connected
**And** I can see the types of relationships discovered
**And** I understand how my vocabulary network grew during this session

### Story 2.9: Maintain Session Continuity Across Devices

As a learner,
I want my study session to continue seamlessly if I switch devices or the app is interrupted,
So that I don't lose progress and can study flexibly across devices.

**Acceptance Criteria:**

**Given** I am in the middle of a study session on Device A
**When** I switch to Device B or the app is closed
**Then** my session state is saved automatically (FR36)
**And** all progress (words studied, answers given, time spent) is preserved
**And** no data is lost

**Given** I resume my session on Device B
**When** I log in and continue studying
**Then** I can resume exactly where I left off
**And** the session state is restored completely
**And** I can continue with the same word sequence

**Given** I experience a network interruption during study
**When** connectivity is restored
**Then** my session progress is synchronized
**And** I can continue without losing any work
**And** the session maintains continuity seamlessly

**Given** I am studying on Device A and Device B simultaneously
**When** I make progress on both devices
**Then** the system detects concurrent sessions
**And** it merges progress intelligently (most recent answers take precedence)
**And** I receive a notification about concurrent session resolution

**Given** my session state becomes corrupted or invalid
**When** I attempt to resume a session
**Then** the system detects the corruption
**And** it attempts to recover from the last valid checkpoint
**And** if recovery fails, I can start a new session with progress preserved up to the last sync

**Given** I have been away from a session for more than 24 hours
**When** I attempt to resume the session
**Then** the system asks if I want to continue the old session or start fresh
**And** I can choose to continue or abandon the old session
**And** my learning progress is preserved regardless of choice

### Story 2.10: Review Session History with Semantic Insights

As a learner,
I want to review my past study sessions with insights about semantic connections discovered,
So that I can understand my learning journey and see how my knowledge network has grown.

**Acceptance Criteria:**

**Given** I have completed multiple study sessions
**When** I view my session history
**Then** I see a chronological list of all sessions (FR41)
**And** each session shows semantic insights and relationships discovered
**And** I can see how my vocabulary network evolved over time

**Given** I am viewing a specific past session
**When** I review the session details
**Then** I see all words studied in that session
**And** I see the semantic connections that were discovered
**And** I can see my performance and accuracy for that session

**Given** I am reviewing session history
**When** I analyze multiple sessions
**Then** I can see patterns in my learning
**And** I can see how semantic relationships accumulated
**And** I understand the progression of my knowledge network

### Story 2.11: Track Intervention Effectiveness and Receive Recommendations

As a learner,
I want the system to track how effective interventions are and adjust future session recommendations,
So that my learning becomes more efficient and personalized over time.

**Acceptance Criteria:**

**Given** I have received interventions during study sessions
**When** the system analyzes intervention effectiveness
**Then** it tracks which interventions helped me learn successfully (FR40)
**And** it identifies patterns in intervention success
**And** future session recommendations are adjusted based on this data

**Given** the system has tracked intervention effectiveness
**When** I start a new study session
**Then** I receive recommendations based on what worked before
**And** intervention strategies are adapted to my learning patterns
**And** the system suggests optimal approaches for my learning style

**Given** I am viewing my learning analytics
**When** I check intervention effectiveness
**Then** I can see which types of interventions were most helpful
**And** I can see how interventions improved my learning outcomes
**And** I understand how the system is personalizing my experience

### Story 2.12: Analyze Learning Patterns for Semantic Optimization

As a learner,
I want the system to analyze my learning patterns to optimize semantic relationship suggestions,
So that I receive increasingly relevant and effective word sequencing over time.

**Acceptance Criteria:**

**Given** I have completed multiple study sessions
**When** the system analyzes my learning patterns
**Then** it identifies which semantic relationships help me learn best (FR6)
**And** it adapts future semantic sequencing based on these patterns (FR8)
**And** word suggestions become more personalized to my learning style

**Given** the system has identified my confusion patterns
**When** semantic sequencing is calculated
**Then** the algorithm adapts to avoid sequences that cause confusion (FR8)
**And** words are presented in orders that minimize my known confusion points
**And** semantic relationships are prioritized to support my learning weaknesses

**Given** I am studying with optimized semantic sequencing
**When** I progress through words
**Then** I notice improved learning efficiency
**And** semantic connections feel more relevant to my needs
**And** the system continues to refine suggestions based on my ongoing performance

### Story 2.13: Receive Optimal Session Timing Suggestions

As a learner,
I want the system to suggest optimal times for study sessions based on my semantic learning patterns,
So that I can study when I'm most likely to retain information effectively.

**Acceptance Criteria:**

**Given** I have learning history and semantic pattern data
**When** the system analyzes my learning patterns
**Then** it suggests optimal session timing based on semantic learning effectiveness (FR42)
**And** recommendations consider my historical performance patterns
**And** suggestions are personalized to my learning rhythm

**Given** I receive a session timing suggestion
**When** I view the recommendation
**Then** I can see the reasoning (e.g., "Based on your patterns, studying now would be optimal")
**And** I can accept or defer the suggestion
**And** the system learns from my timing choices

**Given** I follow timing suggestions consistently
**When** the system tracks my results
**Then** it refines future suggestions based on actual outcomes
**And** timing recommendations become more accurate over time
**And** I experience improved learning retention

### Story 2.14: Implement Zod Schema Validation for Server Actions

As a developer,
I want to implement Zod schema validation for all Server Action inputs,
So that malformed or malicious data cannot cause errors or security vulnerabilities.

**Acceptance Criteria:**

**Given** I have Server Actions that accept user input
**When** inputs are received
**Then** all inputs are validated using Zod schemas before processing
**And** UUIDs, strings, numbers, and complex objects are validated according to their expected types
**And** invalid inputs return clear error messages without exposing internal details

**Given** a user submits a review with invalid data
**When** the Server Action processes the request
**Then** Zod schema validates cardId (UUID format) and rating (1-4 integer)
**And** invalid data is rejected with a user-friendly error message
**And** no business logic executes with invalid data

**Given** Server Actions accept complex objects
**When** objects are received
**Then** Zod schemas validate the complete object structure
**And** nested objects and arrays are validated
**And** type coercion and sanitization are applied where appropriate

**Given** validation fails for an input
**When** the error is returned
**Then** error messages are user-friendly and don't expose internal validation details
**And** errors are logged for debugging purposes
**And** sensitive information is not included in error responses

**Given** Zod validation is implemented across all Server Actions
**When** I audit the codebase
**Then** all Server Actions have Zod schemas defined
**And** no actions bypass validation
**And** validation coverage is documented

### Story 2.15: Implement Rate Limiting for Study Actions

As a system administrator,
I want to implement rate limiting for critical study actions,
So that the system is protected from abuse, brute force attacks, and DoS attempts.

**Acceptance Criteria:**

**Given** users can submit study reviews and perform study actions
**When** actions are performed
**Then** rate limiting is enforced using @upstash/ratelimit or Redis implementation
**And** limits are configured appropriately for each action type (reviews, deck creation, etc.)
**And** rate limits prevent abuse while allowing normal usage patterns

**Given** a user exceeds the rate limit for study reviews
**When** they attempt to submit another review
**Then** they receive a clear rate limit error message
**And** the action is rejected
**And** they are informed when they can retry (with retry-after information)

**Given** rate limiting is implemented
**When** legitimate users perform actions
**Then** normal usage patterns are not affected
**And** rate limits are set high enough for typical study sessions
**And** limits are configurable for different user tiers if needed

**Given** rate limiting detects potential abuse
**When** abuse patterns are identified
**Then** abuse attempts are logged for security monitoring
**And** temporary restrictions may be applied
**And** legitimate users are not impacted

**Given** rate limiting is configured
**When** the system is tested
**Then** rate limits are verified to work correctly
**And** limits are tested under load
**And** rate limiting doesn't impact system performance significantly

---

### Epic 3: Knowledge Graph Visualization & Exploration

Users can visualize and explore their semantic knowledge networks, discovering relationships between learned vocabulary through interactive graph navigation. This epic transforms abstract learning progress into visible, explorable semantic networks.

**FRs covered:** FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18

**User Outcomes:**

- Users can visualize learned vocabulary as interactive semantic networks
- Users can explore relationships between words through interactive graph navigation
- Users can see knowledge graph growth over time
- Users can search and filter within their personal knowledge graph
- Users can access detailed word information by clicking graph nodes
- Users can focus on specific relationship clusters
- Users can follow suggested exploration paths
- Users can share graph sections or insights with others

**Implementation Notes:**

- Interactive visualization system using react-force-graph-2d or similar
- Performance critical: <1s rendering for 50+ node networks
- Must support mobile touch interactions and desktop keyboard navigation
- Requires efficient graph data structure and querying

### Story 3.1: Visualize Knowledge Graph Network

As a learner,
I want to visualize my learned vocabulary as an interactive semantic network,
So that I can see how words are connected and understand my knowledge structure.

**Acceptance Criteria:**

**Given** I have learned multiple words with semantic relationships
**When** I view my knowledge graph
**Then** I see an interactive visualization of my vocabulary as a network (FR10)
**And** words appear as nodes connected by relationship edges
**And** the graph renders within <1 second for networks up to 50 nodes (NFR5)
**And** the visualization is interactive and responsive

**Given** I continue learning new words over time
**When** I view my knowledge graph
**Then** I can see the graph progressively build and display growth over time (FR12)
**And** new words and connections appear as I learn them
**And** I can see how my network has expanded since I started

**Given** I have no learned words yet
**When** I view my knowledge graph
**Then** I see an empty graph with a message encouraging me to start learning
**And** I am directed to start a study session

**Given** I have a very large knowledge graph (500+ nodes)
**When** I view my knowledge graph
**Then** the graph renders with performance optimizations (lazy loading, clustering)
**And** initial render completes within <2 seconds
**And** I can navigate and interact smoothly despite the size

**Given** the graph rendering service is slow or unavailable
**When** I attempt to view my knowledge graph
**Then** I see a loading indicator
**And** if timeout occurs (>3 seconds), I see an error message with retry option
**And** my graph data is preserved and can be loaded when service recovers

### Story 3.2: Interactive Graph Navigation

As a learner,
I want to explore relationships between words through interactive graph navigation,
So that I can discover connections and understand how my vocabulary network is structured.

**Acceptance Criteria:**

**Given** I am viewing my knowledge graph
**When** I interact with the graph (drag, zoom, pan)
**Then** I can navigate through the network smoothly (FR11)
**And** the graph responds to my interactions in real-time
**And** navigation works on both desktop (mouse) and mobile (touch) devices

**Given** I am navigating the graph on a mobile device
**When** I use touch gestures
**Then** I can pan by dragging
**And** I can zoom by pinching
**And** touch targets are ≥44px for easy interaction (UX requirement)

**Given** I am navigating the graph on desktop
**When** I use keyboard navigation
**Then** I can move focus between nodes using arrow keys
**And** I can zoom using keyboard shortcuts
**And** all interactions are accessible via keyboard (NFR35)

### Story 3.3: Search and Filter Knowledge Graph

As a learner,
I want to search and filter within my personal knowledge graph,
So that I can quickly find specific words or relationship types.

**Acceptance Criteria:**

**Given** I am viewing my knowledge graph
**When** I use the search function
**Then** I can search for words by Japanese text, reading, or meaning (FR13)
**And** matching nodes are highlighted in the graph
**And** the graph automatically focuses on search results

**Given** I am viewing my knowledge graph
**When** I apply filters (e.g., relationship type, difficulty level, date learned)
**Then** the graph displays only nodes and connections matching the filters (FR13)
**And** filter options are clearly visible and easy to use
**And** I can combine multiple filters

**Given** I have applied filters to my graph
**When** I clear the filters
**Then** the full graph is displayed again
**And** all nodes and connections are visible
**And** the graph state resets to default view

### Story 3.4: Highlight Semantic Connections During Study

As a learner,
I want to see semantic connections highlighted when I encounter related vocabulary during study,
So that I can understand how new words relate to my existing knowledge network.

**Acceptance Criteria:**

**Given** I am studying a word that has semantic relationships to learned words
**When** the word is presented
**Then** the system highlights semantic connections in my knowledge graph (FR14)
**And** related words are visually indicated
**And** the connection type is clearly shown

**Given** I am viewing a word with highlighted connections
**When** I interact with the highlighted connections
**Then** I can see details about how the words are related
**And** I can navigate to those related words in the graph
**And** the relationship is explained clearly

**Given** I encounter a word with no semantic connections yet
**When** I study that word
**Then** no connections are highlighted
**And** the study session continues normally
**And** the word will appear in the graph after I learn it

### Story 3.5: Access Word Details from Graph Nodes

As a learner,
I want to click on graph nodes to access detailed word information and examples,
So that I can review words and understand their usage in context.

**Acceptance Criteria:**

**Given** I am viewing my knowledge graph
**When** I click on a word node
**Then** I can access detailed information about that word (FR15)
**And** I see the word's meaning, readings, kanji breakdown, and examples
**And** the information is displayed in an overlay or side panel

**Given** I have clicked on a word node
**When** I view the word details
**Then** I can see contextual examples showing how the word is used
**And** I can see semantic relationships to other words
**And** I can see my learning history for this word

**Given** I am viewing word details from a graph node
**When** I want to study this word again
**Then** I can add it to my study queue
**And** I can start a focused review session for this word
**And** the action is easily accessible from the details view

### Story 3.6: Expand and Collapse Graph Sections

As a learner,
I want to expand or collapse graph sections to focus on specific relationship clusters,
So that I can explore complex networks without being overwhelmed.

**Acceptance Criteria:**

**Given** I am viewing my knowledge graph with multiple relationship clusters
**When** I collapse a section
**Then** that cluster is hidden or minimized (FR16)
**And** the graph view becomes less cluttered
**And** I can focus on other sections

**Given** I have collapsed a graph section
**When** I expand it again
**Then** the full cluster is displayed
**And** all nodes and connections in that section are visible
**And** the graph layout adjusts smoothly

**Given** I am exploring a large knowledge graph
**When** I use expand/collapse controls
**Then** I can manage the visual complexity
**And** I can focus on specific semantic themes or relationship types
**And** the graph remains interactive and navigable

### Story 3.7: Follow Suggested Exploration Paths

As a learner,
I want the system to suggest graph exploration paths based on my learning goals,
So that I can discover new vocabulary connections efficiently.

**Acceptance Criteria:**

**Given** I have set learning goals and have a knowledge graph
**When** I view exploration suggestions
**Then** the system suggests graph exploration paths aligned with my goals (FR17)
**And** suggestions highlight words and relationships relevant to my objectives
**And** I can see why each path was suggested

**Given** I am following a suggested exploration path
**When** I navigate through the suggested nodes
**Then** I can see a visual guide showing the path
**And** I can move forward or backward along the path
**And** I can see how each word connects to the next

**Given** I complete a suggested exploration path
**When** I finish exploring
**Then** I can see a summary of what I discovered
**And** I can add discovered words to my study queue
**And** the system suggests the next exploration path if available

**Given** I have no learning goals set
**When** I view exploration suggestions
**Then** I see generic exploration paths based on my knowledge graph
**And** I am encouraged to set learning goals for more personalized paths
**And** suggestions are still useful and relevant

**Given** I am following an exploration path and lose network connection
**When** connectivity is restored
**Then** my path progress is preserved
**And** I can continue from where I left off
**And** the path remains available

### Story 3.8: Share Graph Sections and Insights

As a learner,
I want to share specific graph sections or insights with others,
So that I can collaborate, get help, or showcase my learning progress.

**Acceptance Criteria:**

**Given** I am viewing my knowledge graph
**When** I select a section of the graph to share
**Then** I can create a shareable link or image of that section (FR18)
**And** the shared content includes the selected nodes and relationships
**And** I can choose what information to include (word details, relationships, progress)

**Given** I have created a shareable graph section
**When** I share it with others
**Then** recipients can view the graph section
**And** they can see the semantic relationships I've discovered
**And** my personal learning data remains private (only the graph structure is shared)

**Given** I want to share learning insights
**When** I generate an insight summary
**Then** I can create a shareable summary of my knowledge network growth
**And** insights include statistics about my learning progress
**And** the summary is formatted for easy sharing (social media, study groups, etc.)

**Given** I attempt to share a graph section with no selected nodes
**When** I try to create a shareable link
**Then** I see a message that I need to select nodes first
**And** I can select nodes and try again

**Given** the sharing service is temporarily unavailable
**When** I attempt to share a graph section
**Then** I see an error message
**And** I can retry sharing when the service is available
**And** my graph selection is preserved

---

### Epic 4: Smart Intervention & Confusion Resolution

Users can receive targeted help when struggling with vocabulary confusion, including automatic detection of homonyms, readings, and pitch variations. This epic delivers the Smart CUBE intervention system that provides multi-modal feedback and adaptive practice sets.

**FRs covered:** FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26

**User Outcomes:**

- Users can receive automatic detection of confusion patterns
- Users can receive targeted interventions when learning difficulties are identified
- Users can access multi-modal feedback (visual, audio, textual)
- Users can understand why interventions were triggered
- Users can participate in focused practice sets for specific confusion types
- Users can review intervention history and effectiveness
- Users can receive alternative learning approaches when standard interventions fail

**Implementation Notes:**

- Requires confusion detection algorithm
- Multi-modal feedback system (visual, audio, haptic)
- Must integrate with study session flow
- Adaptive intervention intensity based on user progress
- Performance critical: <50ms feedback trigger times

### Story 4.1: Detect User Confusion Patterns

As a learner,
I want the system to automatically detect when I'm confused by similar words,
So that I can receive help before my confusion becomes a persistent problem.

**Acceptance Criteria:**

**Given** I am studying vocabulary and making mistakes
**When** I repeatedly confuse similar words (homonyms, similar readings, pitch variations)
**Then** the system automatically detects these confusion patterns (FR19)
**And** confusion clusters are identified (e.g., "山/yama" vs "さん/san")
**And** the detection happens in real-time during study sessions

**Given** the system detects a confusion pattern
**When** I continue studying
**Then** the confusion is tracked and analyzed
**And** patterns are stored for future intervention
**And** the system identifies the specific type of confusion (homonym, reading, pitch)

**Given** I have multiple confusion patterns
**When** the system analyzes my learning data
**Then** it prioritizes the most frequent or impactful confusion patterns
**And** it groups related confusions into clusters
**And** it tracks the severity and persistence of each pattern

**Given** I make a single mistake on a word
**When** the system analyzes my performance
**Then** it doesn't immediately create a confusion pattern (requires multiple instances)
**And** it tracks the mistake for potential pattern detection
**And** patterns are only created after sufficient evidence

**Given** the confusion detection algorithm encounters an error
**When** an error occurs during detection
**Then** the system logs the error and continues with study session
**And** confusion detection is retried on the next word
**And** the user experience is not disrupted

### Story 4.2: Trigger Targeted Interventions

As a learner,
I want to receive targeted interventions when the system identifies learning difficulties,
So that I can overcome confusion and continue learning effectively.

**Acceptance Criteria:**

**Given** the system has detected a confusion pattern
**When** I encounter a word from that confusion cluster
**Then** a targeted intervention is automatically triggered (FR20)
**And** the intervention appears within <50ms of the confusion detection (NFR8)
**And** the intervention is contextually relevant to my specific confusion

**Given** I am struggling with a word during study
**When** the system identifies this as a learning difficulty
**Then** an intervention is presented immediately
**And** the intervention doesn't interrupt the flow unnecessarily
**And** I can choose to engage with or dismiss the intervention

**Given** I have received multiple interventions
**When** the system tracks intervention effectiveness
**Then** it adapts when and how interventions are triggered
**And** interventions become more targeted over time
**And** the system learns which intervention types work best for me

**Given** an intervention is triggered but I dismiss it immediately
**When** I dismiss the intervention
**Then** the dismissal is tracked
**And** the system learns not to show similar interventions too frequently
**And** I can still access the intervention later if needed

**Given** I receive an intervention during a network interruption
**When** the intervention is triggered
**Then** the intervention works offline (cached content)
**And** intervention effectiveness is tracked locally
**And** data syncs when connectivity is restored

### Story 4.3: Provide Multi-Modal Feedback

As a learner with different learning preferences,
I want to receive feedback through multiple modes (visual, audio, textual),
So that I can learn in the way that works best for me.

**Acceptance Criteria:**

**Given** I receive an intervention during study
**When** the intervention is presented
**Then** I receive multi-modal feedback including visual, audio, and textual elements (FR21)
**And** visual feedback includes kanji differentiation, color coding, or diagrams
**And** audio feedback includes pronunciation comparisons or pitch differences
**And** textual feedback includes explanations and examples

**Given** I am a visual learner
**When** I receive intervention feedback
**Then** visual elements are prominent (kanji breakdowns, visual comparisons)
**And** I can see clear visual distinctions between confused words
**And** visual feedback helps me understand the differences

**Given** I am an auditory learner
**When** I receive intervention feedback
**Then** audio elements are prominent (pronunciation guides, pitch comparisons)
**And** I can hear clear audio distinctions between confused words
**And** audio feedback triggers within <50ms of user action (NFR8)

**Given** I prefer textual explanations
**When** I receive intervention feedback
**Then** detailed textual explanations are provided
**And** examples and usage contexts are clearly explained
**And** text is presented in my preferred language (Vietnamese/English)

### Story 4.4: Explain Intervention Triggers

As a learner,
I want to understand why interventions were triggered,
So that I can learn from my mistakes and improve my learning approach.

**Acceptance Criteria:**

**Given** I receive an intervention
**When** I want to understand why it was triggered
**Then** I can access detailed explanations of the trigger reason (FR22)
**And** I see which confusion pattern was detected
**And** I see my mistake history that led to the intervention

**Given** I am viewing intervention trigger explanations
**When** I review the details
**Then** I can see the specific confusion type (homonym, reading, pitch)
**And** I can see examples of my mistakes
**And** I understand how the system identified the pattern

**Given** I want to learn from interventions
**When** I access trigger explanations
**Then** I receive educational content about the confusion type
**And** I learn strategies to avoid this confusion in the future
**And** the explanation helps me understand the underlying learning challenge

### Story 4.5: Participate in Focused Practice Sets

As a learner,
I want to practice specific confusion types through focused practice sets,
So that I can overcome persistent confusion patterns.

**Acceptance Criteria:**

**Given** I have a detected confusion pattern
**When** I access focused practice sets
**Then** I can participate in practice sets specifically designed for my confusion type (FR23)
**And** practice sets include words from my confusion cluster
**And** exercises are tailored to address my specific learning difficulty

**Given** I am practicing homonym confusion
**When** I complete focused practice exercises
**Then** I see words that look similar but have different meanings
**And** exercises help me distinguish between the confused words
**And** I receive immediate feedback on my practice attempts

**Given** I am practicing pitch variation confusion
**When** I complete focused practice exercises
**Then** I hear pronunciation differences clearly
**And** exercises help me recognize pitch patterns
**And** I practice distinguishing words with similar sounds but different pitches

**Given** I complete a focused practice set
**When** I finish the exercises
**Then** I see my performance summary
**And** I can see improvement in my confusion pattern
**And** the system tracks practice effectiveness

### Story 4.6: Adapt Intervention Intensity

As a learner,
I want interventions to adapt to my progress and preferences,
So that I receive the right amount of help without being overwhelmed.

**Acceptance Criteria:**

**Given** I am receiving interventions
**When** I make progress on a confusion pattern
**Then** intervention intensity decreases as I improve (FR24)
**And** interventions become less frequent for patterns I'm mastering
**And** the system adapts based on my learning progress

**Given** I have intervention preferences set
**When** interventions are triggered
**Then** intensity matches my preferences (e.g., minimal, moderate, intensive)
**And** I can adjust preferences at any time
**And** the system respects my learning style preferences

**Given** I am struggling with a new confusion pattern
**When** the system detects persistent difficulty
**Then** intervention intensity increases to provide more support
**And** I receive more frequent and detailed interventions
**And** the system provides additional help until I show improvement

### Story 4.7: Review Intervention History and Effectiveness

As a learner,
I want to review my intervention history and see how effective interventions have been,
So that I can understand my learning challenges and track improvement.

**Acceptance Criteria:**

**Given** I have received multiple interventions
**When** I view my intervention history
**Then** I can see a chronological list of all interventions (FR25)
**And** each intervention shows the confusion type, date, and outcome
**And** I can see effectiveness tracking for each intervention type

**Given** I am reviewing intervention history
**When** I analyze effectiveness data
**Then** I can see which interventions helped me learn successfully
**And** I can see patterns in intervention success rates
**And** I understand which confusion types are most challenging for me

**Given** I want to track my improvement
**When** I view intervention effectiveness over time
**Then** I can see how my confusion patterns have decreased
**And** I can see improvement in areas where interventions were most effective
**And** I understand my learning progress through intervention data

### Story 4.8: Suggest Alternative Learning Approaches

As a learner,
I want the system to suggest alternative learning approaches when standard interventions fail,
So that I can find learning methods that work better for my individual needs.

**Acceptance Criteria:**

**Given** standard interventions have not been effective for a confusion pattern
**When** the system analyzes my learning data
**Then** it suggests alternative learning approaches (FR26)
**And** suggestions are personalized to my learning style and history
**And** alternatives include different study methods or presentation styles

**Given** I am struggling with a persistent confusion pattern
**When** I receive alternative approach suggestions
**Then** I can see multiple learning strategies to try
**And** each suggestion includes an explanation of why it might help
**And** I can choose which alternative approach to implement

**Given** I try an alternative learning approach
**When** I use the suggested method
**Then** the system tracks effectiveness of the alternative
**And** it adapts future suggestions based on what works for me
**And** successful alternatives become part of my personalized learning strategy

**Given** no alternative approaches are available for a confusion pattern
**When** the system analyzes my learning data
**Then** I see a message that standard interventions are the best available option
**And** the system continues to monitor for new alternative approaches
**And** I can still access standard interventions

---

### Epic 5: Vietnamese-First Learning Experience

Users can learn Japanese through Vietnamese cultural bridges, Hán Việt connections, and a fully localized interface. This epic ensures the entire application feels native to Vietnamese learners while leveraging their existing knowledge as semantic anchors.

**FRs covered:** FR27, FR28, FR29, FR30, FR31, FR32, FR33, FR34

**User Outcomes:**

- Users can access native Vietnamese interface throughout the application
- Users can leverage Hán Việt knowledge as semantic bridges for kanji recognition
- Users can receive culturally relevant examples and contextual usage
- Users can access Vietnamese phonetic guidance alongside Japanese pronunciation
- Users can toggle between Vietnamese and English interface languages
- Users can access Vietnamese explanations for complex Japanese grammar concepts
- Users can explore Hán Việt etymology and meaning connections
- Users can experience content adapted to Vietnamese language proficiency

**Implementation Notes:**

- Cross-cutting epic that affects all other features
- Requires comprehensive i18n implementation with next-intl
- Hán Việt integration throughout vocabulary and kanji learning
- Cultural adaptation for examples and content
- Must maintain accessibility compliance in Vietnamese

### Story 5.1: Vietnamese Interface Localization

As a Vietnamese learner,
I want to access the entire application interface in Vietnamese,
So that I can learn Japanese without language barriers in the interface itself.

**Acceptance Criteria:**

**Given** I have set Vietnamese as my interface language
**When** I navigate through the application
**Then** all UI elements, menus, buttons, and labels are displayed in Vietnamese (FR27)
**And** Vietnamese text rendering is optimized and readable (NFR37)
**And** all interface text loads within <200ms of language selection (NFR6)

**Given** I am using the Vietnamese interface
**When** I access any feature (study sessions, knowledge graph, profile, etc.)
**Then** all interface elements are in Vietnamese
**And** Vietnamese language interface maintains full functionality across all features (NFR41)
**And** no English text appears in the interface (unless it's part of Japanese learning content)

**Given** I am using the Vietnamese interface
**When** I encounter error messages or notifications
**Then** all messages are displayed in Vietnamese
**And** error messages are clear and actionable in Vietnamese (NFR56)
**And** cultural context is appropriate for Vietnamese users

**Given** Vietnamese translation files are incomplete or missing
**When** I switch to Vietnamese interface
**Then** available translations are displayed
**And** missing translations fall back to English with an indicator
**And** I can report missing translations

**Given** I am using Vietnamese interface and encounter a very long text string
**When** the text is displayed
**Then** text wraps appropriately for Vietnamese
**And** readability is maintained across all screen sizes
**And** text scaling works correctly (NFR37)

### Story 5.2: Language Toggle Between Vietnamese and English

As a learner,
I want to toggle between Vietnamese and English interface languages,
So that I can choose the language that helps me learn most effectively.

**Acceptance Criteria:**

**Given** I am using the Vietnamese interface
**When** I access language settings and select English
**Then** the entire interface switches to English immediately (FR31)
**And** my preference is saved for future sessions
**And** the language switch completes within <200ms (NFR6)

**Given** I am using the English interface
**When** I switch to Vietnamese
**Then** all interface elements update to Vietnamese
**And** the switch is seamless without page reload
**And** my learning progress and data remain unchanged

**Given** I have toggled languages multiple times
**When** I view my language preference
**Then** the system remembers my last selected language
**And** the interface loads in my preferred language by default
**And** I can change languages at any time from settings

### Story 5.3: Hán Việt Semantic Bridges for Kanji Recognition

As a Vietnamese learner,
I want to leverage my Hán Việt knowledge as semantic bridges for kanji recognition,
So that I can use my existing knowledge to accelerate Japanese learning.

**Acceptance Criteria:**

**Given** I am learning a kanji that has Hán Việt connections
**When** I study the kanji
**Then** the system presents Hán Việt knowledge as semantic bridges (FR28)
**And** I can see how the kanji meaning relates to Vietnamese Hán Việt
**And** the connection helps me recognize and remember the kanji

**Given** I am studying kanji with Hán Việt roots
**When** I view kanji details
**Then** Hán Việt connections are prominently displayed
**And** I can see the semantic bridge between Vietnamese and Japanese meanings
**And** the connection reinforces my understanding of both languages

**Given** I have Hán Việt knowledge
**When** the system detects kanji I'm learning
**Then** it automatically highlights Hán Việt connections
**And** it uses my existing knowledge as anchors for new learning
**And** semantic bridges are presented in accessible formats (NFR42)

### Story 5.4: Hán Việt Etymology and Meaning Connections

As a Vietnamese learner,
I want to access Hán Việt etymology and meaning connections for kanji learning,
So that I can understand the historical and semantic relationships between languages.

**Acceptance Criteria:**

**Given** I am studying a kanji
**When** I access etymology information
**Then** I can see Hán Việt etymology and meaning connections (FR33)
**And** I can explore how the kanji evolved and its connections to Vietnamese
**And** etymology information is presented in Vietnamese with clear explanations

**Given** I am exploring kanji etymology
**When** I view meaning connections
**Then** I can see how Hán Việt meanings relate to Japanese kanji meanings
**And** I can understand semantic shifts and cultural adaptations
**And** connections are presented in accessible formats for screen readers (NFR42)

**Given** I want to deepen my understanding
**When** I explore Hán Việt etymology
**Then** I can see historical context and meaning evolution
**And** I can use this knowledge to strengthen my kanji recognition
**And** etymology information enhances my semantic learning network

### Story 5.5: Culturally Relevant Examples and Contextual Usage

As a Vietnamese learner,
I want to receive culturally relevant examples and contextual usage,
So that I can understand how Japanese vocabulary is used in ways that resonate with my cultural background.

**Acceptance Criteria:**

**Given** I am learning Japanese vocabulary
**When** I view examples and contextual usage
**Then** I receive culturally relevant examples that resonate with Vietnamese learners (FR29)
**And** examples consider Vietnamese cultural context and understanding
**And** contextual usage is explained in ways that make sense from a Vietnamese perspective

**Given** I am studying a word with cultural significance
**When** I view examples
**Then** examples are culturally appropriate and relevant
**And** cultural context is explained when necessary
**And** examples help bridge Vietnamese and Japanese cultural understanding

**Given** I am learning vocabulary
**When** I receive contextual examples
**Then** examples are authentic and natural
**And** examples link to Vietnamese cultural knowledge where appropriate
**And** contextual usage helps me understand practical application

### Story 5.6: Vietnamese Phonetic Guidance

As a Vietnamese learner,
I want to receive Vietnamese phonetic guidance alongside Japanese pronunciation,
So that I can learn correct pronunciation using familiar phonetic systems.

**Acceptance Criteria:**

**Given** I am learning Japanese pronunciation
**When** I view pronunciation guides
**Then** I receive Vietnamese phonetic guidance alongside Japanese pronunciation (FR30)
**And** Vietnamese phonetic approximations help me understand Japanese sounds
**And** guidance is presented clearly and accessibly

**Given** I am practicing pronunciation
**When** I hear Japanese audio
**Then** Vietnamese phonetic guidance is available as reference
**And** I can compare Japanese sounds to Vietnamese equivalents
**And** phonetic guidance helps me produce more accurate pronunciation

**Given** I am learning pitch-accented words
**When** I view pronunciation information
**Then** Vietnamese phonetic guidance includes pitch information
**And** I can understand pitch patterns using Vietnamese phonetic reference
**And** guidance helps me distinguish pitch variations

### Story 5.7: Vietnamese Grammar Explanations

As a Vietnamese learner,
I want to access Vietnamese explanations for complex Japanese grammar concepts,
So that I can understand grammar rules in my native language.

**Acceptance Criteria:**

**Given** I encounter a complex Japanese grammar concept
**When** I access grammar explanations
**Then** I receive Vietnamese explanations that help me understand the concept (FR32)
**And** explanations use Vietnamese language structures to explain Japanese grammar
**And** complex concepts are broken down in ways that make sense for Vietnamese speakers

**Given** I am studying Japanese grammar
**When** I view grammar explanations
**Then** explanations are comprehensive and clear in Vietnamese
**And** examples illustrate grammar points in Vietnamese context
**And** I can understand grammar rules without needing English translation

**Given** I want to deepen my grammar understanding
**When** I access detailed grammar information
**Then** Vietnamese explanations cover all aspects of the grammar point
**And** explanations connect to Vietnamese grammar where relevant
**And** I can use Vietnamese explanations to master Japanese grammar

### Story 5.8: Content Difficulty Adaptation Based on Vietnamese Proficiency

As a Vietnamese learner,
I want content difficulty to adapt based on my Vietnamese language proficiency,
So that learning materials are appropriately challenging and accessible.

**Acceptance Criteria:**

**Given** I have indicated my Vietnamese language proficiency level
**When** I access learning content
**Then** content difficulty adapts based on my Vietnamese proficiency (FR34)
**And** explanations and examples use appropriate Vietnamese language complexity
**And** content remains challenging but accessible

**Given** I am a native Vietnamese speaker
**When** I view learning content
**Then** content uses advanced Vietnamese explanations
**And** complex concepts are explained using sophisticated Vietnamese
**And** content leverages my full Vietnamese language ability

**Given** I am learning Vietnamese as a second language
**When** I view learning content
**Then** content uses simpler Vietnamese explanations
**And** complex concepts are broken down into accessible Vietnamese
**And** content adapts to my Vietnamese comprehension level

**Given** my Vietnamese proficiency changes over time
**When** I update my proficiency level
**Then** content difficulty adjusts accordingly
**And** explanations adapt to my current Vietnamese ability
**And** the system tracks my Vietnamese proficiency for content personalization

---

### Epic 6: Algorithm Validation & Quality Assurance

System can validate learning effectiveness, maintain content quality, and provide research insights while protecting user privacy. This epic ensures the semantic algorithm delivers measurable improvements and maintains high content quality standards.

**FRs covered:** FR51, FR52, FR53, FR54, FR55, FR56, FR57, FR58

**Security NFRs covered:** NFR16, NFR21, NFR22, NFR24 (Secure logging supports privacy compliance)

**User Outcomes:**

- System can conduct A/B testing between semantic and traditional SRS approaches
- Users can participate in algorithm validation studies with optional data contribution
- System can provide algorithm performance metrics and learning outcome comparisons
- Users can access research insights from their learning data (privacy-protected)
- System can validate AI-generated examples for cultural and linguistic accuracy
- Users can report content issues and suggest improvements
- System can maintain content quality standards for Vietnamese localization
- Users can access content source attribution and learning methodology explanations
- System implements secure logging practices to protect user privacy

**Implementation Notes:**

- System-level validation and quality assurance
- Requires A/B testing framework implementation
- Privacy-protected research data handling
- Content validation pipeline for AI-generated examples
- Quality control workflow for Vietnamese localization
- Includes secure logging practices for production deployment

### Story 6.1: Conduct A/B Testing Between Semantic and SRS Approaches

As a system administrator,
I want to conduct A/B testing between semantic and traditional SRS approaches,
So that I can validate which learning method delivers better outcomes for users.

**Acceptance Criteria:**

**Given** I have configured an A/B testing experiment
**When** users participate in study sessions
**Then** the system randomly assigns users to semantic or SRS algorithm groups (FR51)
**And** user assignments are tracked and maintained consistently
**And** both groups receive equivalent learning content and features

**Given** an A/B test is running
**When** users complete study sessions
**Then** learning outcomes are measured for both groups
**And** metrics include retention rates, confusion reduction, and engagement
**And** data is collected systematically for comparison

**Given** an A/B test has collected sufficient data
**When** I analyze the results
**Then** I can see performance comparisons between semantic and SRS approaches
**And** statistical significance is calculated
**And** results inform algorithm improvement decisions

### Story 6.2: Participate in Algorithm Validation Studies

As a learner,
I want to participate in algorithm validation studies with optional data contribution,
So that I can help improve the learning system while maintaining control over my data.

**Acceptance Criteria:**

**Given** I am a registered user
**When** I am invited to participate in a validation study
**Then** I can opt in or out of participation (FR52)
**And** I understand what data will be used and how it will be protected
**And** my participation is completely voluntary

**Given** I have opted into a validation study
**When** I use the learning system
**Then** my learning data is collected for research purposes
**And** data is anonymized before analysis (NFR16)
**And** I can withdraw my participation at any time

**Given** I am participating in a validation study
**When** I want to see how my data is being used
**Then** I can access information about the study
**And** I can see what insights are being generated
**And** I maintain full control over my data contribution

### Story 6.3: View Algorithm Performance Metrics and Comparisons

As a learner or administrator,
I want to view algorithm performance metrics and learning outcome comparisons,
So that I can understand how effective the semantic algorithm is compared to traditional methods.

**Acceptance Criteria:**

**Given** I have access to algorithm performance data
**When** I view performance metrics
**Then** I can see algorithm performance metrics and learning outcome comparisons (FR53)
**And** metrics include retention rates, confusion reduction, and user satisfaction
**And** comparisons show semantic vs. traditional SRS performance

**Given** I am viewing algorithm metrics
**When** I analyze the data
**Then** I can see trends over time
**And** I can see how algorithm improvements affect outcomes
**And** metrics are presented in clear, understandable formats

**Given** I want to understand algorithm effectiveness
**When** I access performance comparisons
**Then** I can see side-by-side comparisons of different approaches
**And** I can see which methods work best for different user types
**And** comparisons help inform learning strategy decisions

### Story 6.4: Access Privacy-Protected Research Insights

As a learner,
I want to access research insights from my learning data while maintaining privacy,
So that I can understand my learning patterns without compromising my personal information.

**Acceptance Criteria:**

**Given** I have contributed data to research studies
**When** I access research insights
**Then** I can see insights from my learning data (FR54)
**And** all insights are privacy-protected and anonymized
**And** my personal information is never exposed in research outputs

**Given** I am viewing research insights
**When** I explore the data
**Then** I can see patterns in my learning that contribute to research
**And** insights are presented in aggregate form to protect privacy
**And** I understand how my data contributes to learning science

**Given** I want to understand research findings
**When** I access research insights
**Then** I can see how my learning patterns compare to research findings
**And** insights help me understand my learning journey
**And** all data presentation maintains privacy protection (NFR16, NFR24)

**Given** I have not contributed data to research studies
**When** I attempt to access research insights
**Then** I see a message explaining how to participate
**And** I can opt in to contribute data if desired
**And** I can still see general research findings (without my personal data)

**Given** research data processing encounters an error
**When** an error occurs
**Then** my personal data remains secure and is not exposed
**And** the error is logged for system administrators
**And** I can retry accessing insights after the issue is resolved

### Story 6.5: Validate AI-Generated Content Quality

As a content administrator,
I want the system to validate AI-generated examples for cultural and linguistic accuracy,
So that users receive high-quality, accurate learning content.

**Acceptance Criteria:**

**Given** the system generates AI content (examples, explanations, etc.)
**When** content is created
**Then** the system validates content for cultural and linguistic accuracy (FR55)
**And** validation checks for cultural appropriateness for Vietnamese learners
**And** linguistic accuracy is verified against Japanese language standards

**Given** AI-generated content fails validation
**When** quality checks identify issues
**Then** content is flagged for review
**And** content is not presented to users until validated
**And** validation pipeline ensures only quality content is used

**Given** validated AI content is used
**When** users interact with the content
**Then** content meets quality standards (95%+ acceptance rate target)
**And** cultural accuracy is maintained
**And** linguistic correctness is verified

### Story 6.6: Report Content Issues and Suggest Improvements

As a learner,
I want to report content issues and suggest improvements,
So that I can help maintain content quality and contribute to system improvement.

**Acceptance Criteria:**

**Given** I encounter content that seems incorrect or could be improved
**When** I report the issue
**Then** I can submit a content issue report (FR56)
**And** I can describe the problem or suggest an improvement
**And** my report is submitted to the content quality team

**Given** I have submitted a content report
**When** the report is processed
**Then** I receive confirmation that my report was received
**And** I can track the status of my report
**And** I may receive updates on how the issue was resolved

**Given** I want to suggest content improvements
**When** I submit a suggestion
**Then** my suggestion is recorded and reviewed
**And** I can see if my suggestion was implemented
**And** the system learns from user feedback to improve content quality

**Given** I submit a content report during a network interruption
**When** I submit the report
**Then** the report is saved locally
**And** it is automatically submitted when connectivity is restored
**And** I receive confirmation once it's successfully submitted

**Given** I submit duplicate content reports for the same issue
**When** multiple reports are received
**Then** the system recognizes the duplicate
**And** reports are consolidated
**And** I receive acknowledgment that the issue is already being tracked

### Story 6.7: Maintain Content Quality Standards for Vietnamese Localization

As a content administrator,
I want the system to maintain content quality standards for Vietnamese localization,
So that Vietnamese learners receive accurate, culturally appropriate content.

**Acceptance Criteria:**

**Given** content is being localized for Vietnamese learners
**When** localization is performed
**Then** content quality standards are maintained for Vietnamese localization (FR57)
**And** translations are accurate and culturally appropriate
**And** Vietnamese language quality meets professional standards

**Given** Vietnamese-localized content is published
**When** users interact with the content
**Then** content maintains quality standards (<5% error rate target)
**And** cultural appropriateness is verified
**And** Vietnamese language usage is correct and natural

**Given** quality issues are detected in Vietnamese content
**When** issues are identified
**Then** content is flagged for review and correction
**And** quality control workflow ensures corrections are made
**And** corrected content is re-validated before being used

### Story 6.8: Access Content Source Attribution and Learning Methodology Explanations

As a learner,
I want to access content source attribution and learning methodology explanations,
So that I can understand where content comes from and how the learning approach works.

**Acceptance Criteria:**

**Given** I am viewing learning content
**When** I want to know the source
**Then** I can access content source attribution (FR58)
**And** I can see where content originated (AI-generated, human-created, etc.)
**And** attribution information is clearly displayed

**Given** I want to understand the learning methodology
**When** I access methodology explanations
**Then** I can see explanations of how the semantic learning approach works (FR58)
**And** I can understand the research and theory behind the methodology
**And** explanations help me trust and engage with the learning system

**Given** content source information is unavailable or incomplete
**When** I view content source attribution
**Then** available source information is displayed
**And** missing information is clearly indicated
**And** I can report missing source information

**Given** I want to verify content credibility
**When** I access source attribution
**Then** I can see the source type (AI-generated, human-created, verified, etc.)
**And** I can see when content was created or last updated
**And** I understand the quality assurance process for that content type

**Given** I am reviewing content sources
**When** I explore attribution information
**Then** I can see the credibility and reliability of sources
**And** I can understand how content quality is maintained
**And** source information builds confidence in the learning materials

### Story 6.9: Implement Secure Logging Practices

As a system administrator,
I want to implement secure logging practices throughout the application,
So that sensitive user data is not exposed in logs and production logging follows security best practices.

**Acceptance Criteria:**

**Given** the application generates logs
**When** logs are created
**Then** console.log statements are replaced with a proper logging library (Sentry or Pino)
**And** sensitive user data (user IDs, personal information, learning patterns) is sanitized before logging
**And** logs are structured and searchable

**Given** user actions trigger logging
**When** logs are generated
**Then** user identifiers are anonymized or hashed in logs
**And** personal learning patterns are not logged in detail
**And** only necessary information for debugging is logged

**Given** the application runs in production
**When** logs are generated
**Then** verbose logs are disabled in production
**And** only error and critical logs are enabled
**And** log levels are configurable via environment variables

**Given** logs are sent to log aggregation services
**When** logs are transmitted
**Then** sensitive data is sanitized before transmission
**And** logs comply with privacy regulations (NFR21, NFR22)
**And** log retention policies are enforced

**Given** secure logging is implemented
**When** I audit the codebase
**Then** all console.log statements are replaced with secure logging
**And** log sanitization is verified
**And** logging practices are documented

---
