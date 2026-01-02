# Component Inventory

**Generated:** 2025-12-29T19:51:25Z

This is an auto-generated inventory of React component files (primarily `*.tsx`) across `src/components/` and `src/modules/**/components/`.

## Summary

- **Total component files:** 133
- **Client components (heuristic):** 106

### By Category (heuristic)

- **Other**: 63
- **Flashcard**: 20
- **Study**: 14
- **Admin**: 11
- **Overlay**: 6
- **Navigation**: 5
- **Forms**: 4
- **PWA**: 3
- **Visualization**: 3
- **Layout**: 2
- **Audio**: 1
- **SEO**: 1

### By Feature Module

- **dashboard**: 39
- **admin**: 18
- **study**: 12
- **flashcard**: 10
- **marketing**: 9
- **ui**: 7
- **community**: 6
- **deck**: 5
- **auth**: 3
- **priming**: 3
- **user**: 3
- **vocabulary**: 3
- **report**: 2

## Detailed Inventory

| Area   | Module     | Category      | Client? | Path                                                                                        |
| ------ | ---------- | ------------- | ------- | ------------------------------------------------------------------------------------------- |
| global | -          | Other         | yes     | `src/components/Analytics/PostHogPageTracker.tsx`                                           |
| global | -          | Other         | yes     | `src/components/Analytics/UserReturnTracker.tsx`                                            |
| global | -          | Audio         | no      | `src/components/Audio/VoiceSettings.tsx`                                                    |
| global | -          | Other         | yes     | `src/components/BackButton.tsx`                                                             |
| global | -          | Other         | yes     | `src/components/DisableZoom.tsx`                                                            |
| global | -          | PWA           | yes     | `src/components/PWA/NotificationManager.tsx`                                                |
| global | -          | PWA           | yes     | `src/components/PWA/PWAInstallPrompt.tsx`                                                   |
| global | -          | PWA           | yes     | `src/components/PWA/PWALifecycle.tsx`                                                       |
| global | -          | SEO           | no      | `src/components/SEO/StructuredData.tsx`                                                     |
| global | -          | Other         | yes     | `src/components/Shared/ImageUploader.tsx`                                                   |
| global | -          | Other         | yes     | `src/components/Shared/Loading.tsx`                                                         |
| global | -          | Other         | yes     | `src/components/theme/AntdConfig.tsx`                                                       |
| global | -          | Other         | yes     | `src/components/theme/ThemeProvider.tsx`                                                    |
| module | admin      | Admin         | no      | `src/modules/admin/components/Dashboard/AdminStatsWidget.tsx`                               |
| module | admin      | Admin         | yes     | `src/modules/admin/components/Dashboard/DashboardErrorBoundary.tsx`                         |
| module | admin      | Admin         | yes     | `src/modules/admin/components/Dashboard/DashboardTitle.tsx`                                 |
| module | admin      | Flashcard     | yes     | `src/modules/admin/components/Dashboard/StatCard.tsx`                                       |
| module | admin      | Admin         | no      | `src/modules/admin/components/Dashboard/VocabStatsWidget.tsx`                               |
| module | admin      | Layout        | yes     | `src/modules/admin/components/Layout/AdminShell.tsx`                                        |
| module | admin      | Admin         | yes     | `src/modules/admin/components/QA/ContentWorkbench.tsx`                                      |
| module | admin      | Forms         | no      | `src/modules/admin/components/QA/EditVocabularyForm.tsx`                                    |
| module | admin      | Forms         | no      | `src/modules/admin/components/QA/InlineInput.tsx`                                           |
| module | admin      | Admin         | yes     | `src/modules/admin/components/QA/QAStats.tsx`                                               |
| module | admin      | Flashcard     | yes     | `src/modules/admin/components/QA/VerificationCard.tsx`                                      |
| module | admin      | Admin         | yes     | `src/modules/admin/components/QA/VerificationDeck.tsx`                                      |
| module | admin      | Flashcard     | no      | `src/modules/admin/components/QA/parts/CardEtymology.tsx`                                   |
| module | admin      | Flashcard     | no      | `src/modules/admin/components/QA/parts/CardExamples.tsx`                                    |
| module | admin      | Flashcard     | no      | `src/modules/admin/components/QA/parts/CardMeanings.tsx`                                    |
| module | admin      | Flashcard     | no      | `src/modules/admin/components/QA/parts/CardMnemonic.tsx`                                    |
| module | admin      | Flashcard     | no      | `src/modules/admin/components/QA/parts/CardShield.tsx`                                      |
| module | admin      | Admin         | no      | `src/modules/admin/components/VocabEditor.tsx`                                              |
| module | auth       | Other         | yes     | `src/modules/auth/components/GoogleSignInButton.tsx`                                        |
| module | auth       | Other         | yes     | `src/modules/auth/components/LoginMethodSelector.tsx`                                       |
| module | auth       | Other         | yes     | `src/modules/auth/components/OAuthCacheUpdater.tsx`                                         |
| module | community  | Overlay       | yes     | `src/modules/community/components/comments/CommentDrawer.tsx`                               |
| module | community  | Forms         | yes     | `src/modules/community/components/comments/CommentForm.tsx`                                 |
| module | community  | Other         | yes     | `src/modules/community/components/comments/CommentItem.tsx`                                 |
| module | community  | Other         | yes     | `src/modules/community/components/comments/CommentList.tsx`                                 |
| module | community  | Other         | yes     | `src/modules/community/components/feed/CommunityFeed.tsx`                                   |
| module | community  | Other         | yes     | `src/modules/community/components/feed/FeedItem.tsx`                                        |
| module | dashboard  | Other         | yes     | `src/modules/dashboard/components/DashboardOverview.tsx`                                    |
| module | dashboard  | Visualization | yes     | `src/modules/dashboard/components/etymology-graph/EtymologyGraph.tsx`                       |
| module | dashboard  | Other         | yes     | `src/modules/dashboard/components/home/DashboardDailyRitual.tsx`                            |
| module | dashboard  | Other         | yes     | `src/modules/dashboard/components/home/DashboardErrorState.tsx`                             |
| module | dashboard  | Other         | no      | `src/modules/dashboard/components/home/DashboardHeader.tsx`                                 |
| module | dashboard  | Overlay       | yes     | `src/modules/dashboard/components/home/DeckPickerDrawer.tsx`                                |
| module | dashboard  | Other         | yes     | `src/modules/dashboard/components/home/DonationButton.tsx`                                  |
| module | dashboard  | Other         | yes     | `src/modules/dashboard/components/home/DonationSection.tsx`                                 |
| module | dashboard  | Other         | yes     | `src/modules/dashboard/components/home/DueCTA.tsx`                                          |
| module | dashboard  | Other         | yes     | `src/modules/dashboard/components/home/GlobalLeaderboard.tsx`                               |
| module | dashboard  | Other         | yes     | `src/modules/dashboard/components/home/HeroSection.tsx`                                     |
| module | dashboard  | Flashcard     | no      | `src/modules/dashboard/components/home/ItemCard.tsx`                                        |
| module | dashboard  | Other         | yes     | `src/modules/dashboard/components/home/MatchaWisdomWidget.tsx`                              |
| module | dashboard  | Other         | yes     | `src/modules/dashboard/components/home/MyContributions.tsx`                                 |
| module | dashboard  | Other         | yes     | `src/modules/dashboard/components/home/MyDecks.tsx`                                         |
| module | dashboard  | Other         | yes     | `src/modules/dashboard/components/home/MyDecksList.tsx`                                     |
| module | dashboard  | Other         | yes     | `src/modules/dashboard/components/home/NextReviewWidget.tsx`                                |
| module | dashboard  | Other         | yes     | `src/modules/dashboard/components/home/QuickActions.tsx`                                    |
| module | dashboard  | Other         | yes     | `src/modules/dashboard/components/home/StatsGrid.tsx`                                       |
| module | dashboard  | Other         | no      | `src/modules/dashboard/components/home/StatsOverview.tsx`                                   |
| module | dashboard  | Study         | yes     | `src/modules/dashboard/components/home/StudyIntentChooser.tsx`                              |
| module | dashboard  | Other         | yes     | `src/modules/dashboard/components/home/TrendingTips.tsx`                                    |
| module | dashboard  | Visualization | yes     | `src/modules/dashboard/components/home/WeeklyChart.tsx`                                     |
| module | dashboard  | Other         | yes     | `src/modules/dashboard/components/learning-map/LearningMapDemo.tsx`                         |
| module | dashboard  | Visualization | yes     | `src/modules/dashboard/components/learning-map/components/LearningMapHeatmap.tsx`           |
| module | dashboard  | Other         | yes     | `src/modules/dashboard/components/learning-map/components/LearningMapNetwork.tsx`           |
| module | dashboard  | Other         | yes     | `src/modules/dashboard/components/learning-map/components/LearningMapRadial.tsx`            |
| module | dashboard  | Other         | yes     | `src/modules/dashboard/components/learning-map/components/LearningMapTimeline.tsx`          |
| module | dashboard  | Other         | yes     | `src/modules/dashboard/components/memory-garden/InterventionBlocker.tsx`                    |
| module | dashboard  | Other         | yes     | `src/modules/dashboard/components/memory-garden/MemoryGarden.tsx`                           |
| module | dashboard  | Other         | yes     | `src/modules/dashboard/components/memory-garden/MemoryGardenHero.tsx`                       |
| module | dashboard  | Study         | yes     | `src/modules/dashboard/components/memory-garden/PostSessionAnimation.tsx`                   |
| module | dashboard  | Other         | no      | `src/modules/dashboard/components/memory-garden/components/ColumnLabels.tsx`                |
| module | dashboard  | Other         | no      | `src/modules/dashboard/components/memory-garden/components/GardenControls.tsx`              |
| module | dashboard  | Other         | no      | `src/modules/dashboard/components/memory-garden/components/MemoryGardenMesh.refactored.tsx` |
| module | dashboard  | Other         | no      | `src/modules/dashboard/components/memory-garden/components/MemoryGardenMesh.tsx`            |
| module | dashboard  | Other         | no      | `src/modules/dashboard/components/memory-garden/components/MemoryGardenScene.tsx`           |
| module | dashboard  | Other         | no      | `src/modules/dashboard/components/memory-garden/components/TileTooltip.tsx`                 |
| module | dashboard  | Other         | no      | `src/modules/dashboard/components/memory-garden/components/VocabularyLabels.tsx`            |
| module | deck       | Overlay       | yes     | `src/modules/deck/components/DeckFormModal.tsx`                                             |
| module | deck       | Other         | yes     | `src/modules/deck/components/DeckList.tsx`                                                  |
| module | deck       | Overlay       | yes     | `src/modules/deck/components/ShareModal.tsx`                                                |
| module | deck       | Admin         | yes     | `src/modules/deck/components/admin/AdminDeckTable.tsx`                                      |
| module | deck       | Admin         | yes     | `src/modules/deck/components/admin/DeckContentManager.tsx`                                  |
| module | flashcard  | Flashcard     | yes     | `src/modules/flashcard/components/CardShell/CardFace.tsx`                                   |
| module | flashcard  | Flashcard     | yes     | `src/modules/flashcard/components/CardShell/CardFlipContainer.tsx`                          |
| module | flashcard  | Flashcard     | no      | `src/modules/flashcard/components/CardShell/Faces/InterventionFace.tsx`                     |
| module | flashcard  | Flashcard     | yes     | `src/modules/flashcard/components/CardShell/Sections/ConfusionsSection.tsx`                 |
| module | flashcard  | Flashcard     | yes     | `src/modules/flashcard/components/CardShell/Sections/EtymologySection.tsx`                  |
| module | flashcard  | Flashcard     | yes     | `src/modules/flashcard/components/CardShell/Sections/MoreExamplesSection.tsx`               |
| module | flashcard  | Flashcard     | yes     | `src/modules/flashcard/components/CardShell/StandardFace.tsx`                               |
| module | flashcard  | Flashcard     | yes     | `src/modules/flashcard/components/CardShell/cardVariantRegistry.tsx`                        |
| module | flashcard  | Flashcard     | yes     | `src/modules/flashcard/components/CardShell/index.tsx`                                      |
| module | flashcard  | Flashcard     | yes     | `src/modules/flashcard/components/FlashCard.tsx`                                            |
| module | marketing  | Other         | yes     | `src/modules/marketing/components/animations/CountUpNumber.tsx`                             |
| module | marketing  | Other         | yes     | `src/modules/marketing/components/animations/FadeInOnScroll.tsx`                            |
| module | marketing  | Other         | yes     | `src/modules/marketing/components/landing/CTASection.tsx`                                   |
| module | marketing  | Other         | yes     | `src/modules/marketing/components/landing/FeatureSection.tsx`                               |
| module | marketing  | Other         | yes     | `src/modules/marketing/components/landing/HeroSection.tsx`                                  |
| module | marketing  | Flashcard     | yes     | `src/modules/marketing/components/landing/InteractiveFlipCard.tsx`                          |
| module | marketing  | Other         | yes     | `src/modules/marketing/components/landing/LandingPage.tsx`                                  |
| module | marketing  | Other         | yes     | `src/modules/marketing/components/landing/LandingPageClient.tsx`                            |
| module | marketing  | Other         | yes     | `src/modules/marketing/components/landing/SocialProofSection.tsx`                           |
| module | priming    | Other         | yes     | `src/modules/priming/components/KeywordHighlight.tsx`                                       |
| module | priming    | Overlay       | yes     | `src/modules/priming/components/PrimingModal.tsx`                                           |
| module | priming    | Other         | yes     | `src/modules/priming/components/StoryReader.tsx`                                            |
| module | report     | Admin         | yes     | `src/modules/report/components/AdminReportTable.tsx`                                        |
| module | report     | Overlay       | yes     | `src/modules/report/components/ReportModal.tsx`                                             |
| module | study      | Study         | yes     | `src/modules/study/components/AppTutorial.tsx`                                              |
| module | study      | Study         | no      | `src/modules/study/components/Session/RatingBar.tsx`                                        |
| module | study      | Study         | yes     | `src/modules/study/components/Session/SessionBriefing.tsx`                                  |
| module | study      | Study         | yes     | `src/modules/study/components/Session/SessionContainer.tsx`                                 |
| module | study      | Study         | yes     | `src/modules/study/components/Session/SessionController.tsx`                                |
| module | study      | Study         | yes     | `src/modules/study/components/Session/SessionSummary.tsx`                                   |
| module | study      | Study         | yes     | `src/modules/study/components/Session/StudySettings.tsx`                                    |
| module | study      | Study         | yes     | `src/modules/study/components/SessionEmptyState.tsx`                                        |
| module | study      | Study         | yes     | `src/modules/study/components/Settings/AdvancedSettings.tsx`                                |
| module | study      | Study         | yes     | `src/modules/study/components/Settings/KeyboardShortcuts.tsx`                               |
| module | study      | Study         | yes     | `src/modules/study/components/Settings/QuickSettingsBar.tsx`                                |
| module | study      | Study         | yes     | `src/modules/study/components/StudyDashboard.tsx`                                           |
| module | ui         | Navigation    | yes     | `src/modules/ui/components/NavBar.tsx`                                                      |
| module | ui         | Other         | yes     | `src/modules/ui/components/ProtectedLink.tsx`                                               |
| module | ui         | Layout        | yes     | `src/modules/ui/components/layout/DashboardLayout.tsx`                                      |
| module | ui         | Navigation    | no      | `src/modules/ui/components/navbar/NavConfig.tsx`                                            |
| module | ui         | Navigation    | yes     | `src/modules/ui/components/navbar/NavDrawer.tsx`                                            |
| module | ui         | Navigation    | yes     | `src/modules/ui/components/navbar/NotificationPopover.tsx`                                  |
| module | ui         | Navigation    | yes     | `src/modules/ui/components/navbar/SettingsModal.tsx`                                        |
| module | user       | Other         | yes     | `src/modules/user/components/LanguageSelector.tsx`                                          |
| module | user       | Other         | yes     | `src/modules/user/components/RoleBadge.tsx`                                                 |
| module | user       | Other         | yes     | `src/modules/user/components/ThemeToggle.tsx`                                               |
| module | vocabulary | Other         | yes     | `src/modules/vocabulary/components/KanjiBreakdown.tsx`                                      |
| module | vocabulary | Forms         | no      | `src/modules/vocabulary/components/SmartContentInput.tsx`                                   |
| module | vocabulary | Flashcard     | no      | `src/modules/vocabulary/components/VocabCard.tsx`                                           |
