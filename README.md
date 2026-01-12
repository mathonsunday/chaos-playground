# Chaos Playground

A boundary-pushing visual effects playground — not meant to be "usable" in a conventional sense, but rather a collection of weird, surprising, and hypnotic interactive experiences. Also serves as an **experimentation and learning resource** for web-based visual effects technologies.

## ✨ Concept

This is a testbed for interesting and intentionally janky visual effects. The app features multiple "rooms," each offering a distinct visual experience. The goal is to evoke feelings of being **hypnotized**, **playful**, and **amazed** — while carefully avoiding anything overwhelming or unsettling.

A key aesthetic direction is **"intentionally janky code art"**: effects that attempt realism but fall into an uncanny valley due to the inherent limitations of rendering in code/CSS. This creates something aesthetically creepy and weird, but marketable — not gross or disgusting.

## 🏠 Rooms

### Living Typography
Interactive text that reacts chaotically to cursor presence. Words scatter, flee, and reform in unexpected ways. Includes personalized messages based on your visit history that blend seamlessly with ambient chaos.

### The Figure
A tall, shadowy humanoid silhouette with glowing red eyes that tracks your cursor. Intentionally looks like "a kid's drawing of a spooky character." The figure grows larger and leans closer with repeated visits.

### The Creature
A "creepy-cute" creature with a single large eye and tentacle-like appendages. Remembers you across visits and progresses through relationship stages: Stranger → Curious → Familiar → Friend → Bonded. Each stage has dramatically different behaviors and animations.

### Aquarium
An underwater scene attempting realistic rendering of jellyfish and fish — but falling into uncanny valley territory. Features depth-of-field blur, caustic light patterns, and creatures that increasingly recognize and drift toward returning visitors. A rare anglerfish unlocks after 5+ visits.

### Forest
A geometric, parallax forest with watching eyes hidden in the darkness. Trees grow from saplings to mature over visits. Deer appear after 3 visits, owls after 5. Features time-of-day lighting (morning/afternoon/evening/night) and fog that clears for returning visitors.

### The Abyss
A bioluminescent deep-sea experience built with **Canvas 2D**. Unlike the CSS-based rooms, this one succeeds through **interactivity over aesthetics**:

- **You are the light source** — your cursor is the only illumination in total darkness
- **Things respond to you** — seekers are drawn to your light, scatter when you move fast
- **Tendrils reach from the edges** — darkness itself seems alive
- **A leviathan passes through** — and shining your light on it reveals hidden details (texture, a second eye, teeth)

This room demonstrates that Canvas 2D can work for atmospheric themes when the **user becomes the interesting part**, rather than trying to render detailed creatures.

## 🎭 Personalization System

The app tracks visitor behavior to create an uncanny, slightly unsettling personalization experience:

- **Visit counting** (total and per-room)
- **Time spent** tracking
- **Favorite room** detection
- **Time-of-day awareness** (late night = 10pm+, evening = 8pm+)
- **Days since first visit**

Each room uses this data differently to create the feeling that "the app knows you."

### Technical Implementation

```
src/
├── context/
│   └── PersonalizationContext.tsx    # React context provider
├── hooks/
│   └── usePersonalization.ts         # localStorage persistence & data management
└── rooms/
    └── [Room]/
        └── [Room].tsx                 # Each room consumes context
```

Data persists in `localStorage` under the key `chaos-playground-data`.

---

## 🔬 Technology Exploration & Learnings

This project served as an exploration of different web technologies for visual effects. Here's what we actually learned through trial and error:

### CSS-Only Effects (Primary Technology)

**Best for:**
- "Intentionally janky" aesthetic — CSS attempts at realism have an inherent uncanniness
- Simple shapes, geometric effects, silhouettes
- Responsive layouts and transforms
- The 5 core rooms (Typography, Figure, Creature, Aquarium, Forest)

**Why it works for this project:**
The "janky code art" aesthetic succeeds *because* of CSS constraints, not despite them. When you try to render a jellyfish or a spooky figure in CSS, it naturally falls into an uncanny valley that serves the creepy-cute vibe.

**Limitations:**
- Can't do smooth particles or complex physics
- Performance degrades with many animated elements
- No good way to do dynamic lighting or atmospheric depth

### Canvas 2D (Successfully Used in The Abyss)

**What failed first:**
- Abstract glowing shapes without recognizable form → boring, nothing to look at
- Detailed SVG creatures (anglerfish, jellyfish, etc.) → looked bad, uncanny valley but not in a good way
- "Atmospheric" approach → translated to "I don't see anything interesting"

**What finally worked:**
- **Make the USER the interesting part** — your cursor is the light source
- **Interactivity is the content** — things respond to how you move
- **Progressive reveal** — shine your light on the leviathan to see hidden details
- **Abstraction over realism** — dark silhouettes and shapes, not detailed creatures

**Key realization:** Canvas 2D is great for particles, glows, and atmosphere — but that alone is boring. It needs to be paired with meaningful interaction that makes the user feel like they're discovering something.

### SVG Creatures (Failed Experiment)

**What we tried:**
- Detailed deep-sea creatures with anatomical accuracy
- Teeth, photophores, fins, transparent bells
- Multiple creature types at various depths

**Why it didn't work:**
- Code-drawn creatures hit an uncanny valley — they're *trying* to look detailed but they're just not good enough
- This isn't "intentionally janky" (which works), it's "trying to be good and failing" (which doesn't)
- No amount of SVG detail can compete with actual art assets
- The creatures looked "cartoonish and unpolished" — wrong vibe entirely

**Honest conclusion:** If you want detailed creatures that look good, you need actual art (images, 3D models, illustrations by artists). Code-drawn creatures will always be limited unless you lean into abstraction or intentional jankiness.

### What Makes Each Technology Work

| Technology | Works When... | Fails When... |
|------------|---------------|---------------|
| **CSS** | Embracing limitations, geometric shapes, intentional jankiness | Trying for photorealism or smooth animation |
| **Canvas 2D** | User is central to the experience, interactivity drives engagement | Just rendering ambient "atmosphere" with no focal point |
| **SVG** | Simple icons, UI elements, intentionally flat graphics | Trying to draw detailed realistic creatures |

### The Actual Key Insight

**You can't code your way to "good looking creatures."**

Detailed creatures require actual art. What code *can* do well:
1. **Interactivity** — responding to user behavior in surprising ways
2. **Abstraction** — shapes and silhouettes that suggest rather than show
3. **Atmosphere** — lighting, particles, depth effects as a backdrop
4. **Intentional jankiness** — leaning into the uncanny valley of code-rendered realism

The Abyss works not because it renders beautiful fish, but because **you are the light in the darkness** and **things respond to you**. The leviathan is just a dark shape with an eye — but it's interesting because shining your light on it reveals hidden details.

---

## 🛠 Tech Stack

- **React 18** + **TypeScript** — Component architecture
- **Vite 5** — Fast development and hot reloading
- **CSS** — Primary visual effects for 5 rooms (embracing "janky code art")
- **Canvas 2D** — The Abyss room (interactivity-focused atmosphere)
- **localStorage** — Personalization persistence

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🐛 Debug Controls

Rooms include debug controls to test features:
- **Visits override** — Test different visit counts without waiting
- **Time-of-day toggle** — Test morning/afternoon/evening/night modes
- **Reset All Data** — Clear localStorage and start fresh
- **Summon** (The Abyss) — Trigger the leviathan on demand

## 📁 Project Structure

```
chaos-playground/
├── src/
│   ├── App.tsx                 # Router between Hub and rooms
│   ├── main.tsx                # Entry point
│   ├── index.css               # Global styles
│   ├── components/
│   │   ├── Hub.tsx             # Central lobby with room portals
│   │   └── Hub.css
│   ├── context/
│   │   └── PersonalizationContext.tsx
│   ├── hooks/
│   │   ├── usePersonalization.ts
│   │   └── useAnimationFrame.ts
│   └── rooms/
│       ├── Aquarium/
│       ├── Forest/
│       ├── LivingTypography/
│       ├── Portrait/           # "The Figure"
│       ├── TheAbyss/           # Canvas 2D bioluminescent room
│       └── ThePet/             # "The Creature"
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🎨 Design Philosophy

1. **Simple but deep** — Each room focuses on one core effect, explored thoroughly
2. **Uncanny valley as feature** — Intentionally imperfect attempts at realism (CSS rooms)
3. **User as the experience** — Interactivity makes YOU the interesting part (Canvas room)
4. **Creepy-cute, not gross** — Aesthetically weird but marketable
5. **Personalization as unsettling** — The app remembers you in ways that feel slightly off
6. **Hypnotic over overwhelming** — Calming weirdness, not sensory overload

---

*Built as an experimental visual playground for boundary-pushing web effects.*
