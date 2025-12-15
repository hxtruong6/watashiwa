# Native Mobile Experience Strategy

This document outlines the strategy for creating a "native-like" feel for the WatashiWa web application, utilizing PWA capabilities and viewport overrides.

## 1. Philosophy: "Zen" Immersion

For a Spaced Repetition System (SRS) app, flow is critical. Browsers introduce UI elements (URL bars, back buttons) and behaviors (rubber banding, zooming) that break this flow. Our goal is to remove distractions and create a dedicated study environment.

## 2. PWA Standalone Mode

We use a web app manifest to enable "Add to Home Screen" functionality. This launches the app in a standalone window, removing browser UI.

- **Display**: `standalone`
- **Theme Color**: `#1E3A5F` (Indigo) to match the brand.
- **Background**: `#F9F7F2` (Washi) for splash screens.

## 3. Viewport Control

We enforce strict viewport settings to prevent accidental scaling, which is often triggered during rapid tapping sessions (e.g., reviewing cards).

- **Viewport Meta**: `user-scalable=no`, `maximum-scale=1`.
- **JavaScript Override**: We intercept `touchmove` and `touchend` events to prevent pinch-to-zoom and double-tap-to-zoom behavior on iOS Safari, which sometimes ignores meta tags.

## 4. CSS Enforcements

- **Overscroll**: `overscroll-behavior: none` prevents the "rubber band" effect when scrolling past the top/bottom.
- **Touch Actions**: `touch-action: pan-x pan-y` disables double-tap zoom delay and ensures touches are interpreted as pans or clicks immediately.

## 5. Accessibility Note

> [!WARNING]
> Disabling zoom is generally an accessibility anti-pattern. However, for a gesture-heavy application like this, accidental zooming is a significant usability issue. We mitigate this by ensuring all text and touch targets are sufficiently large by default (designing for readability without zoom).

## 6. Implementation Checklist

- [x] `public/manifest.json` for PWA metadata.
- [x] `src/app/layout.tsx` for `appleWebApp` and `viewport` configuration.
- [x] `src/app/globals.css` for `overscroll` and `touch-action` rules.
- [x] `src/components/DisableZoom.tsx` for iOS specific overrides.
