# Next.js 16 App Router Development Guide

**Version:** Next.js 16+ with React 19  
**Last Updated:** 2025-01-01  
**Status:** Active Development Standard

This guide documents the established patterns and best practices for building pages and components in WatashiWa using Next.js 16 App Router with `cacheComponents` (Partial Prerendering) enabled.

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Component Architecture](#component-architecture)
3. [Server vs Client Components](#server-vs-client-components)
4. [Data Fetching Patterns](#data-fetching-patterns)
5. [React 19 `connection()` Pattern](#react-19-connection-pattern)
6. [Dynamic Route Parameters](#dynamic-route-parameters)
7. [Server Actions](#server-actions)
8. [Form Components: Ant Design vs Next.js Form](#form-components-ant-design-recommended-vs-nextjs-form)
9. [Cache Control Patterns](#cache-control-patterns)
10. [Suspense Boundaries](#suspense-boundaries)
11. [Loading States](#loading-states)
12. [Error Boundaries](#error-boundaries)
13. [File Structure & Naming](#file-structure--naming)
14. [Examples from Codebase](#examples-from-codebase)
15. [Scalability Considerations](#scalability-considerations)
16. [Best Practices](#best-practices)
17. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
18. [Quick Reference Checklist](#quick-reference-checklist)

---

## Core Principles

### 1. **Server-First Architecture**

- Default to Server Components
- Only use Client Components when necessary (interactivity, hooks, browser APIs)
- Fetch data on the server, pass as props to client components

### 2. **Partial Prerendering (PPR)**

- Static shell renders immediately (SEO-friendly)
- Dynamic parts stream in via Suspense boundaries
- Fast initial page load with progressive enhancement

### 3. **Separation of Concerns**

- **Server Components**: Data fetching, authentication, SEO metadata
- **Client Components**: Interactivity, state management, browser APIs

### 4. **React 19 Compatibility**

- Use `connection()` before accessing cookies/headers
- Proper error handling for prerendering scenarios

---

## Component Architecture

### Standard Pattern: Server + Client Split

```text
src/app/[route]/
├── page.tsx              # Server Component (data fetching)
└── Client[Name].tsx     # Client Component (interactivity)
```

**Example Structure:**

```typescript
// page.tsx (Server Component)
interface PageProps {
  params?: Promise<{ id?: string }>;
}

export default async function Page({ params }: PageProps) {
  await connection();
  const data = await fetchData();
  return <ClientComponent data={data} />;
}

// ClientComponent.tsx (Client Component)
'use client';

import { useState } from 'react';

interface ClientComponentProps {
  data: DataType;
}

export default function ClientComponent({ data }: ClientComponentProps) {
  const [state, setState] = useState();
  // All interactivity here
}
```

---

## Server vs Client Components

### Use Server Components When

- ✅ Fetching data from database/API
- ✅ Accessing backend resources (filesystem, etc.)
- ✅ Keeping sensitive information (API keys, tokens) on server
- ✅ Large dependencies that should be excluded from client bundle
- ✅ Static content that doesn't need interactivity

### Use Client Components When

- ✅ Using React hooks (`useState`, `useEffect`, `useContext`, etc.)
- ✅ Event listeners (`onClick`, `onChange`, etc.)
- ✅ Browser-only APIs (`localStorage`, `window`, etc.)
- ✅ State management libraries (Zustand, etc.)
- ✅ Third-party libraries that require client-side rendering
- ✅ Ant Design components (most require client-side)

### Decision Tree

```text
Need interactivity or hooks?
├─ NO → Server Component
└─ YES → Client Component
    └─ Does it need data from server?
        ├─ NO → Pure Client Component
        └─ YES → Split: Server fetches, Client renders
```

---

## Data Fetching Patterns

### Pattern 1: Simple Server Component Fetch

```typescript
// ✅ CORRECT: Server component fetches data
export default async function Page() {
  await connection(); // React 19: Wait for request context
  const data = await fetchData();
  return <div>{data}</div>;
}
```

### Pattern 2: Server Fetches, Client Renders

```typescript
// ✅ CORRECT: Server fetches, passes to client
// page.tsx
export default async function Page() {
  await connection();
  const user = await getUser();
  const data = await fetchData();
  return <ClientComponent user={user} data={data} />;
}

// ClientComponent.tsx
'use client';

import { useState } from 'react';

interface ClientComponentProps {
  user: User | null;
  data: DataType;
}

export default function ClientComponent({ user, data }: ClientComponentProps) {
  const [state, setState] = useState();
  // Render with interactivity
}
```

### Pattern 3: Multiple Data Sources with Suspense

```typescript
// ✅ CORRECT: Separate Suspense boundaries for different data
export default async function Page() {
  return (
    <>
      <Suspense fallback={<HeaderSkeleton />}>
        <PageHeader />
      </Suspense>
      <Suspense fallback={<ContentSkeleton />}>
        <PageContent />
      </Suspense>
    </>
  );
}

async function PageHeader() {
  await connection();
  const headerData = await fetchHeaderData();
  return <header>{headerData}</header>;
}

async function PageContent() {
  await connection();
  const contentData = await fetchContentData();
  return <main>{contentData}</main>;
}
```

---

## React 19 `connection()` Pattern

### When to Use `connection()`

**ALWAYS use `connection()` before:**

- Accessing `cookies()` from `next/headers`
- Accessing `headers()` from `next/headers`
- Any server action that reads request context
- Data fetching that depends on user session

### When NOT to Use `connection()`

**You do NOT need `connection()` for:**

- ✅ Static data fetching (no cookies/headers needed)
- ✅ Database queries that don't depend on user session
- ✅ Public API calls
- ✅ Server Actions (they already have request context)

```typescript
// ✅ CORRECT: No connection() needed for static data
export default async function Page() {
  const posts = await db.post.findMany(); // No connection() needed
  return <PostsList posts={posts} />;
}

// ✅ CORRECT: connection() only needed when accessing cookies/headers
export default async function Page() {
  await connection(); // Needed because getUser() uses cookies
  const user = await getUser();
  return <UserProfile user={user} />;
}
```

### Correct Usage

```typescript
import { connection } from 'next/server';
import { cookies } from 'next/headers';

// ✅ CORRECT: connection() before cookies()
export default async function Component() {
  await connection(); // Wait for request context
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  // Use token...
}
```

### Utility Functions with Cookies

When creating utility functions that access cookies/headers, ensure they call `connection()` first:

```typescript
// ✅ CORRECT: Utility function with connection()
import { connection } from 'next/server';
import { cookies } from 'next/headers';

export async function createClient() {
  await connection(); // ✅ Required before cookies()
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // ...
      },
    }
  );
}
```

**Note:** If a utility function is called from a Server Action (which already has request context), `connection()` may be redundant, but it's safe to include it.

### Error Handling

```typescript
// ✅ CORRECT: Handle prerendering errors gracefully
export default async function Component() {
  await connection();
  
  let user = null;
  try {
    const { getUser } = await import('@/modules/auth/auth.actions');
    user = await getUser();
  } catch {
    // During prerendering, cookies() may reject
    // Component should handle null user gracefully
  }
  
  return <ClientComponent user={user} />;
}
```

### Common Pattern in Our Codebase

```typescript
// Pattern used in NavBar, AppProviders, etc.
async function DataFetchingComponent() {
  await connection(); // React 19: Wait for request context
  
  let data = null;
  try {
    data = await fetchData();
  } catch {
    // Fallback for prerendering
    data = getDefaultData();
  }
  
  return <ClientComponent data={data} />;
}
```

---

## Dynamic Route Parameters

In Next.js 16, route parameters are provided as Promises and must be awaited.

### Correct Pattern

```typescript
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DeckDetailPage({ params }: PageProps) {
  const { id } = await params; // ✅ Must await
  
  const deck = await getDeck(id);
  return <DeckClient deck={deck} />;
}
```

### ❌ Incorrect Pattern

```typescript
// ❌ WRONG: params is not a Promise in Next.js 16
interface PageProps {
  params: { id: string }; // ERROR: Should be Promise
}

export default async function DeckDetailPage({ params }: PageProps) {
  const deck = await getDeck(params.id); // ERROR!
}
```

### With Search Params

```typescript
interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { filter } = await searchParams;
  
  const data = await fetchDashboardData(id, filter);
  return <DashboardClient data={data} />;
}
```

---

## Server Actions

### When to Use Server Actions

- ✅ Form submissions and data mutations
- ✅ User-initiated actions (create, update, delete)
- ✅ Operations that require authentication
- ✅ Actions that need to revalidate cache

### Basic Pattern

```typescript
'use server';

import { executeSafeAction } from '@/modules/core/action-client';
import { z } from 'zod';

const CreatePostSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
});

export async function createPost(input: unknown) {
  return executeSafeAction(
    CreatePostSchema,
    input,
    async (data, { userId }) => {
      // userId is guaranteed if requireAuth: true (default)
      const post = await db.post.create({
        data: {
          ...data,
          authorId: userId,
        },
      });
      return post;
    },
    { requireAuth: true }
  );
}
```

### Response Format

All Server Actions should return a consistent format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: Record<string, string[]>;
}
```

### Calling from Client Components (Ant Design Form)

```typescript
'use client';

import { Form, Input, Button, message } from 'antd';
import { createPost } from '@/modules/posts/posts.actions';
import { useState } from 'react';

export default function NewPostForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const result = await createPost(values);
      
      if (result.success) {
        message.success('Post created successfully');
        form.resetFields();
      } else {
        message.error(result.error || 'Failed to create post');
      }
    } catch (error) {
      // Validation errors handled by Ant Design
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        name="title"
        label="Title"
        rules={[{ required: true, message: 'Title is required' }]}
      >
        <Input placeholder="Post title" />
      </Form.Item>
      
      <Form.Item
        name="content"
        label="Content"
        rules={[{ required: true, message: 'Content is required' }]}
      >
        <Input.TextArea rows={4} placeholder="Post content" />
      </Form.Item>
      
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Create Post
        </Button>
      </Form.Item>
    </Form>
  );
}
```

### Cache Invalidation in Server Actions

Use `updateTag()` or `revalidateTag()` in Server Actions to invalidate cache:

```typescript
'use server';

import { updateTag } from 'next/cache';
import { executeSafeAction } from '@/modules/core/action-client';

export async function createPost(input: unknown) {
  return executeSafeAction(CreatePostSchema, input, async (data, { userId }) => {
    const post = await db.post.create({
      data: {
        ...data,
        authorId: userId,
      },
    });
    
    // Immediately expire cache
    updateTag('posts');
    updateTag(`post-${post.id}`);
    
    return post;
  });
}
```

---

## Form Components: Ant Design (Recommended) vs Next.js Form

### Ant Design Form (Recommended)

**We use Ant Design Form as our standard** because it provides:

- ✅ Better UI/UX with rich components (Input, Select, DatePicker, etc.)
- ✅ Easier configuration and validation
- ✅ Consistent design system integration
- ✅ Better user feedback (error messages, loading states)
- ✅ Works seamlessly with Server Actions

### Ant Design Form Pattern

```typescript
'use client';

import { Form, Input, Button, message } from 'antd';
import { createDeck } from '@/modules/deck/deck.actions';
import { useState } from 'react';

interface DeckFormProps {
  onSuccess: () => void;
}

export default function DeckForm({ onSuccess }: DeckFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      // Client-side validation
      const values = await form.validateFields();
      setLoading(true);

      // Call Server Action
      const result = await createDeck(values);

      if (result.success) {
        message.success('Deck created successfully');
        form.resetFields();
        onSuccess();
      } else {
        message.error(result.error || 'Failed to create deck');
      }
    } catch (error) {
      // Validation errors are handled by Ant Design Form
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        name="title"
        label="Title"
        rules={[{ required: true, message: 'Please enter a title' }]}
      >
        <Input placeholder="Deck title" />
      </Form.Item>

      <Form.Item name="description" label="Description">
        <Input.TextArea rows={3} placeholder="Deck description" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Create Deck
        </Button>
      </Form.Item>
    </Form>
  );
}
```

### Benefits of Ant Design Form

1. **Rich Components**: Input, Select, DatePicker, Upload, etc.
2. **Built-in Validation**: Rules-based validation with custom messages
3. **Better UX**: Loading states, error display, success feedback
4. **Type Safety**: Works with TypeScript and Zod schemas
5. **Consistent Design**: Matches your Ant Design theme

### Server Action Integration

```typescript
'use server';

import { executeSafeAction } from '@/modules/core/action-client';
import { z } from 'zod';

const CreateDeckSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

export async function createDeck(input: unknown) {
  return executeSafeAction(
    CreateDeckSchema,
    input,
    async (data, { userId }) => {
      const deck = await db.deck.create({
        data: {
          ...data,
          userId,
        },
      });
      return deck;
    },
    { requireAuth: true }
  );
}
```

### Next.js Form Component (Optional)

Next.js 16 includes a `Form` component for progressive enhancement, but **it's optional** in our codebase. Use it only if you need:

- Progressive enhancement (works without JavaScript)
- Simple forms without complex UI requirements

```typescript
import Form from 'next/form';
import { createPost } from '@/modules/posts/posts.actions';

export default function SimpleForm() {
  return (
    <Form action={createPost}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit">Create Post</button>
    </Form>
  );
}
```

**Recommendation**: Use Ant Design Form for all forms in WatashiWa for consistency and better UX.

---

## Cache Control Patterns

Next.js 16 provides declarative cache control with `cacheLife()` and `cacheTag()`.

### Using `cacheLife()` with Predefined Profiles

```typescript
'use cache';

import { cacheLife, cacheTag } from 'next/cache';

export async function getProducts() {
  'use cache';
  cacheLife('hours'); // Cache for 1 hour with 5 min stale time
  cacheTag('products');
  
  const response = await fetch('https://api.example.com/products');
  return response.json();
}
```

### Custom Cache Configuration

```typescript
'use cache';

import { cacheLife, cacheTag } from 'next/cache';

export async function getUserData(userId: string) {
  'use cache';
  cacheLife({
    stale: 60,      // 1 minute stale
    revalidate: 300, // 5 minutes revalidate
    expire: 3600,   // 1 hour expire
  });
  cacheTag('user', `user-${userId}`);
  
  const response = await fetch(`https://api.example.com/users/${userId}`);
  return response.json();
}
```

### Available Profiles

- `'seconds'` - 5s stale, 30s revalidate, 60s expire
- `'minutes'` - 1m stale, 5m revalidate, 10m expire
- `'hours'` - 5m stale, 1h revalidate, 24h expire
- `'days'` - 1h stale, 1d revalidate, 7d expire
- `'weeks'` - 1d stale, 1w revalidate, 4w expire
- `'max'` - Maximum cache duration

### Cache Invalidation

```typescript
'use server';

import { updateTag, revalidateTag } from 'next/cache';

export async function updatePost(id: string) {
  await db.post.update({ where: { id }, data: { ... } });
  
  // Immediately expire (read-your-own-writes)
  updateTag(`post-${id}`);
  
  // Or mark as stale (stale-while-revalidate)
  revalidateTag(`post-${id}`, 'max');
}
```

---

## Suspense Boundaries

### Why Suspense?

- Enables Partial Prerendering (PPR)
- Allows static shell to render immediately
- Dynamic parts stream in progressively
- Better SEO (static HTML sent first)

### Placement Strategy

1. **Root Layout**: Wrap dynamic providers
2. **Page Level**: Wrap data-fetching components
3. **Component Level**: Wrap individual async components

### Example from Layout

```typescript
// src/app/layout.tsx
export default async function RootLayout({ children }) {
  return (
    <html>
      <body>
        {/* Static - renders immediately */}
        <StructuredData />
        <Analytics />
        
        {/* Dynamic - streams in */}
        <Suspense fallback={<LoadingShell />}>
          <AppProviders>{children}</AppProviders>
        </Suspense>
      </body>
    </html>
  );
}
```

### Example from Page

```typescript
// src/app/about/page.tsx
export default async function AboutPage() {
  return (
    <article>
      {/* Server component with Suspense */}
      <Suspense fallback={<HeaderSkeleton />}>
        <AboutHeader />
      </Suspense>
      
      {/* Client component - no Suspense needed */}
      <ClientAboutContent />
    </article>
  );
}
```

### Fallback Best Practices

```typescript
// ✅ GOOD: Meaningful fallback
<Suspense fallback={<NavBarSkeleton />}>
  <NavBar />
</Suspense>

// ❌ BAD: : Bad UX, not friendly to users
<Suspense fallback={<div>Loading...</div>}>
  <Component />
</Suspense>

// ❌ BAD: Empty fallback (bad UX)
<Suspense fallback={null}>
  <Component />
</Suspense>
```

### Ant Design Components in Suspense Fallbacks

**Important**: When using Ant Design components (like `Skeleton`, `Flex`, etc.) in Suspense fallbacks, especially in root layout, you must handle SSR/prerendering carefully.

**Problem**: Ant Design components may use `Date.now()` internally, which causes build errors during prerendering:

```
Error: Route "/about" used `Date.now()` inside a Client Component without a Suspense boundary above it.
```

**Solution**: Use a mounted check pattern to conditionally render Ant Design components only after client-side hydration:

```typescript
'use client';

import { Flex, Skeleton } from 'antd';
import { startTransition, useLayoutEffect, useState } from 'react';

export default function LayoutSkeleton() {
 const [mounted, setMounted] = useState(false);

 useLayoutEffect(() => {
  startTransition(() => {
   setMounted(true);
  });
 }, []);

 // During SSR/prerender, render plain HTML (no Date.now() calls)
 if (!mounted) {
  return (
   <main className="app-main">
    <div
     style={{
      minHeight: '60vh',
      padding: 24,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
     }}
    >
     <div
      style={{
       width: '100%',
       maxWidth: 400,
       height: 200,
       background: 'rgba(0,0,0,0.06)',
       borderRadius: 8,
       animation: 'pulse 1.5s ease-in-out infinite',
      }}
     />
    </div>
   </main>
  );
 }

 // On client, render Ant Design components
 return (
  <main className="app-main">
   <Flex
    vertical
    align="center"
    justify="center"
    style={{
     minHeight: '60vh',
     padding: 24,
     width: '100%',
    }}
   >
    <Skeleton active paragraph={{ rows: 4 }} />
   </Flex>
  </main>
 );
}
```

**Key Points**:

1. **Use `useLayoutEffect` instead of `useEffect`**: Ensures the state update happens synchronously before paint, reducing layout shift
2. **Wrap in `startTransition`**: Marks the state update as non-urgent, allowing React to prioritize other updates
3. **Plain HTML fallback**: During SSR/prerender, use plain HTML/CSS to avoid any client-only APIs
4. **Ant Design after mount**: Only render Ant Design components after the component has mounted on the client
5. **⚠️ CRITICAL: Match Dimensions Exactly**: The SSR skeleton MUST have the exact same dimensions as the Ant Design skeleton to prevent Cumulative Layout Shift (CLS)

### Preventing Layout Shift (CLS) in Skeletons

**The Golden Rule**: SSR skeleton dimensions = Client skeleton dimensions = Actual content dimensions

**Why This Matters**:

- **Cumulative Layout Shift (CLS)** is a Core Web Vital that affects SEO and UX
- Layout shifts occur when skeleton dimensions don't match actual content
- Users perceive layout shifts as poor quality and slow loading

**Best Practice Pattern**:

```typescript
'use client';

import { Flex, Skeleton } from 'antd';
import { startTransition, useLayoutEffect, useState } from 'react';

export default function LayoutSkeleton() {
 const [mounted, setMounted] = useState(false);

 useLayoutEffect(() => {
  startTransition(() => {
   setMounted(true);
  });
 }, []);

 // SSR skeleton: Match EXACT dimensions of Ant Design Skeleton
 if (!mounted) {
  return (
   <main className="app-main">
    <div
     style={{
      minHeight: '60vh',
      padding: 24,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
     }}
    >
     {/* Match Ant Design Skeleton: 4 rows, ~16px height, ~16px gap */}
     <div
      style={{
       width: '100%',
       maxWidth: 400,
       display: 'flex',
       flexDirection: 'column',
       gap: 16,
      }}
     >
      {[1, 2, 3, 4].map((i) => (
       <div
        key={i}
        style={{
         width: i === 1 ? '100%' : i === 4 ? '60%' : '100%',
         height: 16,
         background: 'rgba(0,0,0,0.06)',
         borderRadius: 4,
         animation: 'pulse 1.5s ease-in-out infinite',
        }}
       />
      ))}
     </div>
    </div>
   </main>
  );
 }

 // Client skeleton: Same structure, uses Ant Design
 return (
  <main className="app-main">
   <Flex
    vertical
    align="center"
    justify="center"
    style={{
     minHeight: '60vh',
     padding: 24,
     width: '100%',
    }}
   >
    <Skeleton active paragraph={{ rows: 4 }} />
   </Flex>
  </main>
 );
}
```

**How to Match Dimensions**:

1. **Measure First**: Check the actual rendered dimensions of your Ant Design Skeleton
2. **Replicate in SSR**: Use the same width, height, padding, gap, and layout structure
3. **Test**: Use Chrome DevTools Layout Shift visualization to verify no shifts occur
4. **Verify**: Check CLS score in Lighthouse/PageSpeed Insights

**Common Mistakes**:

- ❌ Different widths between SSR and client skeleton
- ❌ Different heights (especially for multi-row skeletons)
- ❌ Different padding/margins
- ❌ Different layout structure (flex vs grid, etc.)
- ❌ Not accounting for Ant Design's internal spacing

**When This Pattern Is Needed**:

- ✅ Suspense fallbacks in root layout (`src/app/layout.tsx`)
- ✅ Suspense fallbacks that use Ant Design components
- ✅ Any client component that might use time-based APIs during prerendering

**When This Pattern Is NOT Needed**:

- ✅ Route-level `loading.tsx` files (they're handled differently by Next.js)
- ✅ Suspense fallbacks with plain HTML/Server Components
- ✅ Client components that don't use Ant Design or time-based APIs

---

## Loading States

### Route-Level Loading UI

Create `loading.tsx` in your route directory to automatically show a loading state while the page is loading:

```typescript
// src/app/dashboard/loading.tsx
'use client';

import { Skeleton } from 'antd';

export default function Loading() {
  return <Skeleton active paragraph={{ rows: 8 }} />;
}
```

This automatically shows while the page is loading, before Suspense boundaries are needed.

**Note**: Route-level `loading.tsx` files can use Ant Design components directly without the mounted check pattern. They're handled differently by Next.js and don't trigger the `Date.now()` prerender error.

### Loading.tsx Best Practices

- ✅ Use meaningful loading states (skeletons matching content structure)
- ✅ Match the layout of the actual content
- ✅ Use Ant Design `Skeleton` component for consistency
- ✅ Route-level `loading.tsx` can use Ant Design directly (no mounted check needed)
- ✅ **Match dimensions exactly**: Skeleton should have same dimensions as actual content to prevent CLS

```typescript
// ✅ GOOD: Matches content structure
export default function Loading() {
  return (
    <div>
      <Skeleton active paragraph={{ rows: 1 }} />
      <Skeleton active paragraph={{ rows: 5 }} />
    </div>
  );
}

// ❌ BAD: Generic loading message
export default function Loading() {
  return <div>Loading...</div>;
}
```

---

## Error Boundaries

Use `error.tsx` files to handle errors gracefully at the route level.

### Route-Level Error Boundary

```typescript
// src/app/dashboard/error.tsx
'use client';

import { Button } from 'antd';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <Button onClick={reset} type="primary">
        Try again
      </Button>
    </div>
  );
}
```

### Global Error Boundary

```typescript
// src/app/global-error.tsx
'use client';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html>
      <body>
        <div style={{ padding: 24, textAlign: 'center' }}>
          <h2>Something went wrong!</h2>
          <p>{error.message}</p>
          <button onClick={reset}>Try again</button>
        </div>
      </body>
    </html>
  );
}
```

**Note:** `global-error.tsx` must include `<html>` and `<body>` tags as it replaces the root layout on error.

### Error Boundary Best Practices

- ✅ Provide clear error messages
- ✅ Include a reset function to retry
- ✅ Log errors for debugging
- ✅ Show user-friendly messages (don't expose internal errors)

---

## File Structure & Naming

### Page Files

```text
src/app/
├── [route]/
│   ├── page.tsx              # Server Component (required)
│   ├── Client[Name].tsx      # Client Component (optional)
│   ├── [Name]Header.tsx      # Server Component for header (optional)
│   └── loading.tsx           # Loading UI (optional)
```

### Component Files

```text
src/modules/[module]/
├── components/
│   ├── [Component].tsx       # Server Component (default)
│   └── [Component]Client.tsx # Client Component (if needed)
```

### Naming Conventions

- **Server Components**: PascalCase, no suffix (e.g., `NavBar.tsx`, `AboutPage.tsx`)
- **Client Components**: PascalCase + `Client` suffix (e.g., `NavBarClient.tsx`, `ClientAboutContent.tsx`)
- **Page Files**: Always `page.tsx` (Next.js convention)
- **Layout Files**: Always `layout.tsx` (Next.js convention)

---

## Examples from Codebase

### Example 1: About Page (Simple Pattern)

**File:** `src/app/about/page.tsx`

```typescript
import { Suspense } from 'react';
import ClientAboutContent from './ClientAboutContent';

async function AboutHeader() {
  const t = await getTranslations('About');
  return (
    <header>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
    </header>
  );
}

export default async function AboutPage() {
  return (
    <article>
      <Suspense fallback={<HeaderSkeleton />}>
        <AboutHeader />
      </Suspense>
      <ClientAboutContent />
    </article>
  );
}
```

**File:** `src/app/about/ClientAboutContent.tsx`

```typescript
'use client';

import { Button, Typography } from 'antd';
import { useTranslations } from 'next-intl';

export default function ClientAboutContent() {
  const t = useTranslations('About');
  // All interactivity here
  return <div>{/* Ant Design components */}</div>;
}
```

### Example 2: NavBar (Server + Client Split)

**File:** `src/modules/ui/components/NavBar.tsx`

```typescript
import { connection } from 'next/server';
import NavBarClient from './NavBarClient';

export default async function NavBar() {
  await connection();
  
  let user = null;
  try {
    const { getUser } = await import('@/modules/auth/auth.actions');
    user = await getUser();
  } catch {
    // Handle prerendering gracefully
  }
  
  return <NavBarClient user={user} />;
}
```

**File:** `src/modules/ui/components/NavBarClient.tsx`

```typescript
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface NavBarClientProps {
  user: User | null;
}

export default function NavBarClient({ user }: NavBarClientProps) {
  const pathname = usePathname();
  const [state, setState] = useState();
  // All hooks and interactivity here
  return <nav>{/* UI */}</nav>;
}
```

### Example 3: Dashboard with Auth Guard

**File:** `src/app/dashboard/page.tsx`

```typescript
import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getUser } from '@/modules/auth/auth.actions';

async function DashboardContent() {
  await connection();
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  const data = await fetchDashboardData(user.id);
  return <DashboardClient user={user} data={data} />;
}

export default async function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
```

---

## Scalability Considerations

### Database Query Optimization

For applications targeting 10,000+ concurrent users, optimize database queries:

- ✅ Use `select` to fetch only needed fields
- ✅ Use `include` carefully (avoid deep nesting)
- ✅ Implement pagination for lists
- ✅ Use database indexes for frequently queried fields
- ✅ Avoid N+1 queries (use `include` or batch queries)

```typescript
// ✅ GOOD: Select only needed fields
const users = await db.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
});

// ❌ BAD: Fetching all fields
const users = await db.user.findMany(); // Fetches everything
```

### Avoiding N+1 Queries

```typescript
// ✅ GOOD: Single query with include
const decks = await db.deck.findMany({
  include: {
    vocabulary: {
      select: { id: true, word: true },
    },
  },
});

// ❌ BAD: N+1 queries
const decks = await db.deck.findMany();
for (const deck of decks) {
  deck.vocabulary = await db.vocabulary.findMany({
    where: { deckId: deck.id },
  });
}
```

### Caching Strategy

- Use `cacheLife()` for frequently accessed data
- Use `cacheTag()` for granular invalidation
- Cache at the right level (component vs page vs route)
- Consider ISR (Incremental Static Regeneration) for public content

### Performance Monitoring

- Monitor database query times
- Track page load times
- Use Next.js Analytics or similar tools
- Set up alerts for slow queries

---

## Best Practices

### ✅ DO

1. **Always use `connection()` before accessing cookies/headers**

   ```typescript
   await connection();
   const cookies = await cookies();
   ```

2. **Split server and client concerns clearly**
   - Server: Data fetching
   - Client: Interactivity

3. **Use meaningful Suspense fallbacks**

   ```typescript
   <Suspense fallback={<ComponentSkeleton />}>
     <Component />
   </Suspense>
   ```

4. **Handle prerendering errors gracefully**

   ```typescript
   try {
     data = await fetchData();
   } catch {
     data = getDefaultData();
   }
   ```

5. **Use TypeScript for type safety**

   ```typescript
   interface Props {
     user: User | null;
     data: DataType;
   }
   ```

6. **Keep server components thin**
   - Fetch data
   - Pass to client components
   - Minimal rendering logic

7. **Use async/await for all server data fetching**

   ```typescript
   export default async function Page() {
     const data = await fetchData();
     return <Component data={data} />;
   }
   ```

### ❌ DON'T

1. **Don't use hooks in Server Components**

   ```typescript
   // ❌ WRONG
   export default async function Component() {
     const [state, setState] = useState(); // ERROR!
   }
   ```

2. **Don't access cookies without `connection()`**

   ```typescript
   // ❌ WRONG
   export default async function Component() {
     const cookies = await cookies(); // May fail during prerendering
   }
   
   // ✅ CORRECT
   export default async function Component() {
     await connection();
     const cookies = await cookies();
   }
   ```

3. **Don't mix server and client code**

   ```typescript
   // ❌ WRONG: Server component with client-side logic
   export default async function Component() {
     const data = await fetchData();
     const [state, setState] = useState(); // ERROR!
     return <div>{data}</div>;
   }
   ```

4. **Don't forget error handling for prerendering**

   ```typescript
   // ❌ WRONG: No error handling
   export default async function Component() {
     const user = await getUser(); // May throw during prerendering
     return <Component user={user} />;
   }
   ```

5. **Don't use `'use client'` unnecessarily**
   - Only when you need hooks, events, or browser APIs

6. **Don't fetch data in Client Components**

   ```typescript
   // ❌ WRONG: Fetching in client component
   'use client';
   export default function Component() {
     useEffect(() => {
       fetch('/api/data').then(...); // Should be server-side
     }, []);
   }
   ```

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Mixed Server/Client Component

```typescript
// ❌ WRONG
export default async function Component() {
  const data = await fetchData();
  const [state, setState] = useState(); // ERROR: Can't use hooks in server component
  return <div onClick={handleClick}>{data}</div>; // ERROR: Can't use events
}
```

**✅ Correct:**

```typescript
// Server Component
export default async function Component() {
  const data = await fetchData();
  return <ClientComponent data={data} />;
}

// Client Component
'use client';
export default function ClientComponent({ data }) {
  const [state, setState] = useState();
  return <div onClick={handleClick}>{data}</div>;
}
```

### ❌ Anti-Pattern 2: Missing `connection()`

```typescript
// ❌ WRONG
export default async function Component() {
  const cookies = await cookies(); // May fail during prerendering
  const token = cookies.get('token');
}
```

**✅ Correct:**

```typescript
export default async function Component() {
  await connection(); // Wait for request context
  const cookies = await cookies();
  const token = cookies.get('token');
}
```

### ❌ Anti-Pattern 3: No Error Handling

```typescript
// ❌ WRONG
export default async function Component() {
  const user = await getUser(); // Throws during prerendering
  return <Component user={user} />;
}
```

**✅ Correct:**

```typescript
export default async function Component() {
  await connection();
  let user = null;
  try {
    user = await getUser();
  } catch {
    // Handle gracefully
  }
  return <Component user={user} />;
}
```

### ❌ Anti-Pattern 4: Client Component Fetching Data

```typescript
// ❌ WRONG
'use client';
export default function Component() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/data').then(res => res.json()).then(setData);
  }, []);
  return <div>{data}</div>;
}
```

**✅ Correct:**

```typescript
// Server Component
export default async function Component() {
  const data = await fetchData();
  return <ClientComponent data={data} />;
}

// Client Component
'use client';
export default function ClientComponent({ data }) {
  return <div>{data}</div>;
}
```

---

## Quick Reference Checklist

### Creating a New Page

- [ ] Create `src/app/[route]/page.tsx` (Server Component)
- [ ] Use `connection()` before accessing cookies/headers (if needed)
- [ ] Await `params` if using dynamic routes (Next.js 16 requirement)
- [ ] Fetch data server-side with proper error handling
- [ ] Create `Client[Name].tsx` if interactivity needed
- [ ] Add `generateMetadata()` for SEO if needed
- [ ] Wrap async components in Suspense with fallback
- [ ] Pass data as props to client components
- [ ] Add TypeScript types for props

### Creating a New Component

- [ ] Determine if Server or Client Component needed
- [ ] If Server: Fetch data, pass to client
- [ ] If Client: Mark with `'use client'`, use hooks/events
- [ ] Follow naming convention (`Component.tsx` or `ComponentClient.tsx`)
- [ ] Add TypeScript types for props
- [ ] Handle null/undefined props gracefully

### Data Fetching

- [ ] Use `connection()` before cookies/headers (only when needed)
- [ ] Wrap in try/catch for prerendering
- [ ] Use async/await in Server Components
- [ ] Pass data as props, don't fetch in Client Components
- [ ] Use Suspense for streaming data
- [ ] Use `cacheLife()` and `cacheTag()` for cache control
- [ ] Optimize database queries (select only needed fields, avoid N+1)

### Testing Your Implementation

- [ ] Server Component doesn't use hooks/events
- [ ] Client Component marked with `'use client'`
- [ ] `connection()` used before cookies/headers (when needed)
- [ ] `params` awaited if using dynamic routes
- [ ] Error handling for prerendering scenarios
- [ ] Suspense boundaries with meaningful fallbacks
- [ ] TypeScript types are correct
- [ ] Error boundaries in place (`error.tsx`)
- [ ] Loading states defined (`loading.tsx`)
- [ ] Build succeeds (`pnpm build`)

---

## Additional Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Partial Prerendering](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming#partial-prerendering)
- [React 19 `connection()` API](https://react.dev/reference/react/use)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Next.js 16 Form Component](https://nextjs.org/docs/app/api-reference/components/form)
- [Cache Control](https://nextjs.org/docs/app/building-your-application/caching)

---

## Questions or Issues?

If you encounter patterns not covered in this guide:

1. Check existing codebase examples (`src/app/about`, `src/modules/ui/components/NavBar`)
2. Review Next.js 16 documentation
3. Consult with the team
4. Update this guide with new patterns

---

**Remember:** When in doubt, default to Server Components and split into Client Components only when interactivity is needed.
