This is a strong pivot. You are moving from a commodity product (flashcards) to a premium methodology (The CUBE). Your landing page cannot just look like a SaaS tool; it must feel like a **paradigm shift**.

As a Senior Product Designer, I will be direct: **Do not add effects just to be "cool."** That creates noise, and your brand is "Zen."

Instead, use motion and 3D to **visualize the invisible problem**: that 2D learning (Duolingo/Anki) is flat, and your 3D learning (WatashiWa) has depth.

Here is the tech stack and UX strategy to build a high-performance, "Zen-Impressive" landing page in Next.js.

---

### 1. The "Zen Mastery" Tech Stack (Next.js Ecosystem)

For a Next.js app, you need libraries that play well with React's hydration and Server Components.

#### A. The 3D Engine: `React Three Fiber` (R3F)

- **Why:** You cannot sell a "Cube" architecture without a literal 3D cube. R3F is the standard for WebGL in React.
- **Use Case:** The Hero section. A beautiful, glass-like or washi-paper-textured cube that floats.
- **Helpers:** `Reflect` and `softShadows` from `@react-three/drei` (a helper library) to make it look premium, not like a video game.

#### B. The Motion Engine: `Framer Motion`

- **Why:** It is arguably the best animation library for React. It handles layout transitions and "scroll-linked" animations perfectly.
- **Use Case:** "Scrollytelling." As the user scrolls down, text doesn't just fade in; it _slides and locks_ into place, reinforcing the "Architecture" feel.

#### C. The Texture/Feel: `glsl-noise` (Custom Shaders)

- **Why:** Your design system mentions "Washi Paper." Static images are boring.
- **Use Case:** Use a fragment shader to create a subtle, moving grain background that looks like living paper. It breathes slowly.

#### D. The Mouse Interaction: `react-use-gesture`

- **Why:** We want physics-based interaction.
- **Use Case:** When the user hovers over the Cube, it shouldn't just spin. It should tilt with "spring physics" (mass and friction), making it feel heavy and valuable.

---

### 2. UX "Wow" Moments (The Implementation Strategy)

Don't just throw effects at the screen. Build these three specific interactive moments to tell your story.

#### Moment 1: The "Flat vs. Deep" Hero Section

**The Concept:** Show, don't tell, the "2D vs 3D" conflict.

- **Initial State:** When the page loads, show a flat, boring 2D flashcard (representing Anki/Duolingo) in the center.
- **The Effect:** As the page loads, the card _extrudes_ upwards, unfolding into your "Smart Cube."
- **Library:** **React Three Fiber**.
- **Interaction:** The mouse position controls the light source. As you move your mouse, the shadows shift across the 3D Cube, revealing the engraved words "Context," "Etymology," and "Pitch."
- **Why it works:** It instantly communicates: "This is deeper than what you are used to."

#### Moment 2: The "Fog of Forgetfulness" (Mouse Tracking)

**The Concept:** Visualizing your "Intervention" layer.

- **Visual:** A section of Japanese text that is slightly blurred or covered in a "fog" (Gaussian Blur).
- **The Effect:** The mouse cursor acts as a **torch**. Wherever the user hovers, the fog clears, and the Kanji becomes sharp and crisp.
- **Library:** **Framer Motion** (using `useScroll` or `useMouseMove` to drive a clip-path or mask).
- **Why it works:** It metaphorically proves your promise: "We clarify the confusion."

#### Moment 3: The "Etymology Connection" (Scroll Trigger)

**The Concept:** Visualizing how you connect concepts.

- **Visual:** Floating particles or "nodes" scattered on the screen.
- **The Effect:** As the user scrolls to the "Smart Layer" section, the scattered nodes magnetically snap together to form a structured network or a kanji stroke order.
- **Library:** **React Three Fiber (Instances)** or **tsparticles** (lighter weight).
- **Why it works:** It feels like "Order from Chaos," which is exactly what a student wants to feel.

---

### 3. Design Trap Warning (The Senior Critique)

I reviewed your current site (`watashiwa.app`). It is clean, but it feels "static." However, be careful with the upgrade:

1. **Avoid "Scroll-Jacking":** Do not force the user's scroll bar to behave differently (e.g., stopping them from scrolling until an animation finishes). This frustrates users. Use **Scroll-Linked** animations (where the animation plays _while_ they scroll naturally) instead.
2. **Performance is a UX Feature:** 3D in the browser can kill mobile batteries.

- **Senior Tip:** Use `drei/View` to only render the 3D canvas when it is in the viewport.
- **Senior Tip:** If the device is low-power (detectable via JS), fallback to a high-quality video or static image instead of live WebGL.

### 4. Implementation Snippet (The "Smart Cube" Hero)

Here is a conceptual starting point for your Hero component using R3F. This creates a "Zen" cube that rotates slowly and reacts to the mouse.

```jsx
// components/HeroCube.jsx
'use client';
import { MeshDistortMaterial, RoundedBox } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';

function ZenCube() {
	const mesh = useRef();
	const [hovered, setHover] = useState(false);

	useFrame((state) => {
		// Gentle rotation
		mesh.current.rotation.x += 0.002;
		mesh.current.rotation.y += 0.005;

		// Slight "breathing" scale effect
		const t = state.clock.getElapsedTime();
		mesh.current.position.y = Math.sin(t / 2) * 0.1;
	});

	return (
		<RoundedBox
			ref={mesh}
			args={[2.5, 2.5, 2.5]} // Size
			radius={0.1} // Smooth edges for "Zen" feel
			onPointerOver={() => setHover(true)}
			onPointerOut={() => setHover(false)}
		>
			{/* DistortMaterial gives a "liquid" or "organic" feel. 
         Speed speeds up the distortion. 
      */}
			<MeshDistortMaterial
				color={hovered ? '#708238' : '#1E3A5F'} // Matcha Green on hover, Indigo default
				speed={2}
				distort={0.3} // 0 = rigid, 1 = very liquid
				roughness={0.4}
			/>
		</RoundedBox>
	);
}

export default function HeroSection() {
	return (
		<div className="h-[60vh] w-full bg-[#F9F7F2]">
			<Canvas>
				<ambientLight intensity={0.5} />
				<spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
				<pointLight position={[-10, -10, -10]} />
				<ZenCube />
			</Canvas>
		</div>
	);
}
```

### Next Step

This 3D direction requires assets. Do you have vector/SVG versions of the Kanji you want to feature on the "Cube" faces, or **would you like me to outline the specific "Scrollytelling" script (what text appears at what scroll depth)?**

Verdict (conversion + Zen)
Yes—this direction can increase conversion, but only if you treat 3D/motion as a metaphor for the learner’s pain (“flat learning doesn’t stick”) and keep it progressively enhanced so you don’t trade “impressive” for “slow / battery-draining”.
Two key realities from your current codebase:
You already optimized LCP with a server-rendered HeroLCP in src/app/page.tsx, then hide it after hydration. Any WebGL hero must not break that.
R3F / drei / gesture libs are not installed right now, so adopting them is a product + perf decision, not just a visual tweak.
What I’d keep (high-signal, low-noise)
Moment 1: “Flat → Cube” Hero
This is the clearest visualization of the “2D vs 3D learning” claim. It explains the product in 2 seconds without jargon. This is the only one I’d call “must test”.
Moment 2: “Fog of Confusion” (but make it subtle + cheap)
Conceptually strong (intervention = clarity). Implement it with lightweight CSS masking + pointer tracking (or even a short looped video on mobile) to keep it Zen.
What I’d cut (or postpone) because it risks “noise”
Custom shader grain (glsl-noise): easy to overdo, hard to QA across devices, and it can read as “tech demo”. If you want washi feel, start with static texture + ultra-slow opacity drift.
Node particles snapping into networks (Moment 3): cool, but it’s the easiest to become “random motion”. If we do it, it must be tied to a specific insight (e.g., “roots connect words”) and be restrained.
The “Zen-Impressive” implementation strategy I recommend (V1 → V2)
V1 (fast + safe): CSS 3D + Framer Motion (no WebGL)
Build a single 3D object: a “card” that extrudes into a cube.
Use scroll-linked micro motion (no scroll-jacking): as you scroll 0–20% of hero, thickness increases + faces appear.
This will feel premium and communicate depth without the perf risk of WebGL.
V2 (premium upgrade): R3F only as progressive enhancement
Desktop/high-power only + render only in viewport.
Mobile/low-power falls back to V1 CSS cube or a high-quality video.
This approach respects your “Zen” rule: motion only when it teaches.
Performance guardrails (non-negotiable if you add 3D)
Keep HeroLCP server-rendered; load 3D after first paint (idle / after hydration).
Respect “Reduce Motion”: if prefers-reduced-motion, show a static cube (no hover/tilt).
Low-power fallback: deviceMemory / hardwareConcurrency heuristic → no WebGL.
Budget mindset: if 3D costs you even a small LCP/INP regression, it will hurt conversion more than it helps.
The scrollytelling script (what the user should “feel” at each scroll)
0% (first impression): “This is calm, premium.”
Visual: flat card, quiet lighting.
5–20%: “Oh—depth.”
Visual: card extrudes into cube; faces reveal Context / Meaning / Pitch (or your chosen 3–4).
20–40%: “It fixes my real pain: confusion.”
Visual: fog clears on hover over a short Japanese line; one confusing pair becomes crisp.
40%+: “It’s structured, not overwhelming.”
Visual: the cube settles; CTA stays stable; no more big motion—Zen closure.
Quick recommendation for your next step
If the goal is conversion, start by A/B testing only Moment 1 (Flat → Cube) against current hero, with guardrails on LCP/INP. If it wins, add Moment 2 in a restrained way.
If you want, I can draft the exact face labels (the 4 “engraved” words) and the microcopy that appears as each face reveals—so the animation reads like a product explanation, not decoration.
