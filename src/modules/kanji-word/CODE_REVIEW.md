# KanjiWord Module - Code Review

## ✅ **Strengths**

1. **Good Architecture**: Follows Vertical Slice Architecture with proper module organization
2. **Type Safety**: Strong TypeScript usage with proper types
3. **Separation of Concerns**: Clear separation between data, actions, components, and utils
4. **React Best Practices**: Proper use of hooks, memoization, and callbacks
5. **Accessibility**: Basic ARIA attributes and semantic HTML (`<ruby>` tags)

---

## 🔴 **Critical Issues**

### 1. **Memory Leak: Audio Element Not Cleaned Up**

**Location**: `components/KanjiWordTooltip.tsx:32, 87`

**Issue**: Audio element is created but never cleaned up, causing memory leaks.

```typescript
// ❌ BAD: Audio ref is never cleaned up
const audioRef = useRef<HTMLAudioElement | null>(null);
audioRef.current = new Audio(vocab.audioUrl);
```

**Fix**:

```typescript
// ✅ GOOD: Cleanup on unmount
useEffect(() => {
  return () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };
}, []);
```

### 2. **Missing Error Handling in Tooltip**

**Location**: `components/KanjiWordTooltip.tsx:90-93`

**Issue**: Audio playback errors are only logged, no user feedback.

**Fix**: Add user-friendly error message or fallback UI.

### 3. **Portal Memory Leak**

**Location**: `utils/tooltipHelpers.ts:63-79`

**Issue**: Portal is created but never removed, accumulating in DOM.

**Fix**: Add cleanup mechanism or reuse existing portal.

### 4. **Type Safety: Unsafe Type Assertion**

**Location**: `components/KanjiWord.tsx:73`

**Issue**: Using `as Vocabulary` bypasses type checking.

```typescript
// ❌ BAD: Unsafe type assertion
} as Vocabulary;
```

**Fix**: Create proper type guard or use Partial<Vocabulary>.

---

## 🟡 **Major Issues**

### 5. **Performance: Inefficient Text Parsing**

**Location**: `utils.ts:64-177`

**Issue**: `parseTextForKanji` iterates through entire cache for each kanji word (O(n*m) complexity).

**Fix**: Use Trie data structure or pre-index by first character.

### 6. **Missing Input Validation**

**Location**: `components/KanjiWord.tsx:50-76`

**Issue**: No validation for `wordSurface`/`wordReading` before creating vocab object.

**Fix**: Add Zod schema validation.

### 7. **Console.warn in Production**

**Location**: `components/KanjiWord.tsx:79`

**Issue**: `console.warn` should not be in production code.

**Fix**: Use proper error logging service or remove.

### 8. **Missing Error Boundary**

**Location**: All components

**Issue**: No error boundary to catch rendering errors.

**Fix**: Wrap components in error boundary.

---

## 🟠 **Minor Issues**

### 9. **Code Duplication: Meaning Parsing**

**Location**: `components/KanjiWordTooltip.tsx:119-121`

**Issue**: Meaning parsing logic is duplicated (also in StoryReader).

**Fix**: Extract to shared utility function.

### 10. **Hardcoded Values**

**Location**: Multiple files

**Issue**: Magic numbers (320, 300, 8, etc.) should be constants.

**Fix**: Extract to constants file.

### 11. **Missing JSDoc for Complex Functions**

**Location**: `utils.ts:64-177`

**Issue**: Complex parsing function lacks detailed documentation.

**Fix**: Add comprehensive JSDoc with examples.

### 12. **Accessibility: Missing Keyboard Navigation**

**Location**: `components/KanjiWord.tsx`

**Issue**: Tooltip opens on hover but no keyboard alternative.

**Fix**: Add `onFocus` handler for keyboard users.

### 13. **Type Narrowing Issue**

**Location**: `components/KanjiWord.tsx:193`

**Issue**: Type guard could be more explicit.

```typescript
// ⚠️ Could be clearer
effectiveReadingMode === 'furigana' || effectiveReadingMode === 'both'
```

**Fix**: Use helper function or enum.

---

## 📋 **Best Practices Violations**

### 14. **SRP Violation: KanjiWord Component**

**Location**: `components/KanjiWord.tsx`

**Issue**: Component handles rendering, state management, tooltip logic, and event handling.

**Fix**: Extract tooltip logic to custom hook `useKanjiWordTooltip`.

### 15. **Missing Null Checks**

**Location**: `components/KanjiWordTooltip.tsx:119`

**Issue**: `vocab.meanings` could be null/undefined.

**Fix**: Add proper null checks with fallbacks.

### 16. **Inconsistent Error Handling**

**Location**: `actions.ts:22-48`

**Issue**: Server actions don't handle database errors gracefully.

**Fix**: Add try-catch with user-friendly error messages.

### 17. **Missing Loading States**

**Location**: `app/demo/page.tsx`

**Issue**: No loading state while fetching vocab cache.

**Fix**: Add Suspense with proper fallback.

---

## 🔧 **Recommended Improvements**

### 18. **Extract Constants**

Create `src/modules/kanji-word/constants.ts`:

```typescript
export const TOOLTIP_CONFIG = {
  WIDTH: 320,
  HEIGHT: 300,
  OFFSET: 8,
  Z_INDEX: 10000,
} as const;

export const SIZE_STYLES = {
  small: { fontSize: '14px', furiganaSize: '10px', romajiSize: '11px' },
  medium: { fontSize: '18px', furiganaSize: '12px', romajiSize: '13px' },
  large: { fontSize: '24px', furiganaSize: '14px', romajiSize: '15px' },
} as const;
```

### 19. **Create Custom Hook for Tooltip**

Extract tooltip logic to `hooks/useKanjiWordTooltip.ts`:

```typescript
export function useKanjiWordTooltip(vocab: Vocabulary | null) {
  // Tooltip state and logic
  // Returns: { showTooltip, anchor, handlers }
}
```

### 20. **Add Type Guards**

Create `utils/typeGuards.ts`:

```typescript
export function isValidVocabulary(vocab: unknown): vocab is Vocabulary {
  // Validation logic
}
```

### 21. **Improve Error Messages**

Replace console.warn with proper error handling:

```typescript
// Instead of console.warn
if (!vocabData) {
  return <ErrorFallback message="Invalid vocabulary data" />;
}
```

### 22. **Add Unit Tests**

Missing test coverage for:

- `parseTextForKanji` (complex logic)
- `extractJLPTLevel` (edge cases)
- `findVocabInCache` (matching algorithm)

---

## ✅ **Action Items (Priority Order)**

### **P0 - Critical (Fix Immediately)**

1. ✅ Fix audio memory leak in `KanjiWordTooltip`
2. ✅ Fix portal memory leak in `tooltipHelpers`
3. ✅ Add error boundary wrapper
4. ✅ Remove unsafe type assertions

### **P1 - High (Fix Soon)**

5. ✅ Add input validation with Zod
2. ✅ Extract tooltip logic to custom hook
3. ✅ Add proper error handling for audio playback
4. ✅ Optimize `parseTextForKanji` performance

### **P2 - Medium (Nice to Have)**

9. ✅ Extract constants to separate file
2. ✅ Add keyboard navigation support
3. ✅ Add loading states
4. ✅ Extract meaning parsing to utility

### **P3 - Low (Future)**

13. ✅ Add comprehensive JSDoc
2. ✅ Add unit tests
3. ✅ Add E2E tests for tooltip interactions

---

## 📊 **Code Quality Metrics**

- **Type Safety**: 8/10 (some unsafe assertions)
- **Error Handling**: 5/10 (missing in several places)
- **Performance**: 7/10 (text parsing could be optimized)
- **Accessibility**: 6/10 (missing keyboard support)
- **Maintainability**: 8/10 (good structure, some duplication)
- **Test Coverage**: 0/10 (no tests)

**Overall Score: 6.3/10** - Good foundation, needs improvements in error handling and performance.
