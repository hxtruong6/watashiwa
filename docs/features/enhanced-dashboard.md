# Enhanced Dashboard Design

## Overview

Redesign the dashboard to maximize user engagement, encourage daily study habits, and provide clear navigation to all features.

## Design Goals

1. **Hook**: Immediately show what needs attention (due cards)
2. **Motivate**: Display progress and achievements
3. **Guide**: Clear navigation to all app sections
4. **Retain**: Streak and gamification elements

## Inspiration

Best-in-class dashboard patterns from:

- **Duolingo**: Streak, daily goals, XP, leagues
- **Anki**: Due count, forecast graph
- **Notion**: Clean layout, quick actions
- **Linear**: Modern aesthetic, keyboard shortcuts hint

---

## Dashboard Layout

### Desktop (1200px+)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🏯 Watashi                         [🔍] [🔔 3] [👤 Profile ▼]          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  🔥 12 Day Streak!                         Good morning, Truong! │   │
│  │  ━━━━━━━━━━━━━━━━━━━━━━                                          │   │
│  │  Today's Goal: 15/50 cards                                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │  📚 Due Now             │  │  📈 Weekly Progress                 │  │
│  │                         │  │  ┌─────────────────────────────┐    │  │
│  │     47 cards            │  │  │ ▁▃▅▇▅▃▁  (mini chart)      │    │  │
│  │                         │  │  └─────────────────────────────┘    │  │
│  │  [▶ Start Review]       │  │  This week: 234 reviews             │  │
│  │                         │  │  Best day: Wednesday (52)           │  │
│  └─────────────────────────┘  └─────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  ⚡ Quick Actions                                                │   │
│  │                                                                  │   │
│  │  [📖 Browse Library]  [📥 Import Cards]  [🔖 Wishlist (12)]     │   │
│  │  [📊 Statistics]      [⚙️ Settings]      [❓ Help]               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  🗂️ My Decks                                            [+ New] │   │
│  │                                                                  │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │   │
│  │  │ N5 Vocab     │ │ N4 Vocab     │ │ Unit 15      │             │   │
│  │  │ 120 cards    │ │ 89 cards     │ │ 58 cards     │             │   │
│  │  │ 12 due       │ │ 5 due        │ │ 0 due        │             │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Mobile (< 768px)

```
┌───────────────────────────────┐
│  🏯 Watashi      [🔔] [👤]    │
├───────────────────────────────┤
│                               │
│  🔥 12 Day Streak!            │
│  ━━━━━━━━━━━━━━━━             │
│  15/50 cards today            │
│                               │
│  ┌───────────────────────┐    │
│  │      47 Due Now       │    │
│  │   [▶ Start Review]    │    │
│  └───────────────────────┘    │
│                               │
│  ┌───────────────────────┐    │
│  │ 📖 Browse  │ 📥 Import │    │
│  │ 🔖 Wishlist│ 📊 Stats  │    │
│  └───────────────────────┘    │
│                               │
│  🗂️ My Decks                  │
│  ┌───────────────────────┐    │
│  │ N5 Vocab     12 due → │    │
│  │ N4 Vocab      5 due → │    │
│  │ Unit 15       0 due → │    │
│  └───────────────────────┘    │
│                               │
└───────────────────────────────┘
```

---

## Key Components

### 1. Hero Section (Top)

- **Streak Counter**: Fire emoji + day count
- **Daily Progress Bar**: Visual progress toward goal
- **Greeting**: Personalized by time of day

### 2. Primary CTA: Due Cards

- Large, prominent card showing due count
- Single button: "Start Review"
- Shows "All done! 🎉" when queue is empty

### 3. Weekly Progress Chart

- Mini bar chart (7 days)
- Shows review count per day
- Highlights best day

### 4. Quick Actions Grid

- 6 action buttons in 2x3 grid
- Icons + labels
- Keyboard shortcut hints on hover

### 5. Deck Carousel

- Horizontal scroll on mobile
- Grid on desktop
- Each deck shows: Name, Card count, Due count

---

## Gamification Elements

### Streak System

- Increment on any review day
- Reset if no reviews for 24h (adjustable)
- Milestone badges: 7, 30, 100, 365 days

### Daily Goal

- Configurable target (default: 50 cards)
- Progress bar fills as reviews complete
- Celebration animation on goal completion

### Achievement Badges (Future)

- First Review
- 7-Day Streak
- 100 Cards Mastered
- Top Contributor
- etc.

---

## Color Palette (Zen Mastery Theme)

| Element | Color | Hex |
|:--------|:------|:----|
| Background | Off-white | `#FAF9F6` |
| Card BG | White | `#FFFFFF` |
| Primary | Indigo | `#4F46E5` |
| Success | Matcha | `#708238` |
| Warning | Orange | `#F59E0B` |
| Text | Charcoal | `#1F2937` |
| Muted | Gray | `#6B7280` |

---

## Micro-Interactions

1. **Streak Fire**: Subtle flame animation
2. **Progress Bar**: Smooth fill on load
3. **Due Card**: Gentle pulse to draw attention
4. **Deck Hover**: Slight lift (translateY)
5. **Button Click**: Ripple effect

---

## Accessibility

- All interactive elements have focus states
- Color is not sole indicator (icons + text)
- Screen reader friendly labels
- Keyboard navigation support
