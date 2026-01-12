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

This project served as an exploration of different web technologies for visual effects. Here's what we learned:

### CSS-Only Effects (What We Used)

**Best for:**
- "Intentionally janky" aesthetic — CSS attempts at realism have an inherent uncanniness
- Simple shapes, geometric effects, silhouettes
- Responsive layouts and transforms
- Gradients, shadows, blur filters
- CSS animations for rhythmic/looping motion

**Techniques demonstrated:**
- Complex gradients for depth/atmosphere
- CSS transforms for parallax layers
- `filter: blur()` for depth-of-field simulation
- CSS variables for dynamic theming
- Keyframe animations for organic movement
- DOM element spawning/manipulation for particle-like effects

**Limitations:**
- Hard to achieve photorealism
- Performance degrades with many animated elements
- Limited control over precise timing/physics
- Blur and shadows are expensive at scale

### Canvas 2D (Explored, didn't land)

**What we tried:**
- Atmospheric underwater scene with floating particles
- Radial gradient "bioluminescence" effects  
- Vignette and depth effects

**Why it wasn't kept:**
- Output was too abstract — soft glowing shapes without recognizable form
- Lacked the detail and character needed to be interesting
- "Atmospheric" became "vague" — nothing concrete to look at
- The technology worked fine, but the result was underwhelming

**Theoretical strengths:** smooth particles, soft glows, good performance for many elements

### SVG (Explored, execution didn't land)

**What we tried:**
- Detailed deep-sea creatures (anglerfish, viperfish, jellyfish, dragonfish, lanternfish)
- Anatomically accurate with teeth, photophores, fins, etc.
- SVG filters for glow effects

**Why it wasn't kept:**
- The execution was poor — creatures were either too small to see detail, or too large and awkward
- Composition and animation didn't come together cohesively
- The bioluminescent/abyssal theme is still appealing and could work with better execution
- This is a failed attempt, not a verdict on the technology or theme

**Theoretical strengths:** scalable detail, crisp at any size, works as React components

**Open question:** Could a well-executed bioluminescent/abyssal room work? Probably yes — this attempt just wasn't it.

### Technologies Not Explored (Future Possibilities)

**WebGL / Three.js:**
- True 3D rendering, realistic lighting
- Shader-based effects (water caustics, volumetric fog)
- Would be needed for: realistic underwater scenes, complex particle physics, 3D creatures

**GLSL Shaders:**
- Custom GPU-accelerated effects
- Would be needed for: procedural textures, distortion effects, complex lighting

**Lottie/After Effects:**
- Pre-animated vector animations
- Would be needed for: complex character animations, smooth morphing

### Aesthetic Categories Explored

| Aesthetic | Technology Match | Notes |
|-----------|-----------------|-------|
| **Janky Code Art** | CSS | Embraces limitations as features |
| **Bioluminescent/Abyssal** | Canvas + SVG | Needs smooth glow + detail |
| **ASCII/Terminal** | CSS/DOM | Tried it, just wasn't the right vibe for this project |
| **Dreamcore/Weirdcore** | CSS + images | Surreal compositions possible with transforms |
| **Glitch** | CSS + Canvas | RGB split, scanlines achievable in CSS |

### Key Insight

**Technology capability ≠ good output.**

Canvas 2D and SVG are technically capable tools, but capability alone doesn't guarantee good results. We tried both and the output didn't land — not because the technology failed or the theme was wrong, but because the execution was poor.

**What actually worked:** CSS with its inherent limitations. The "janky code art" aesthetic succeeds *because* of CSS constraints, not despite them. The uncanny valley effect of CSS-rendered creatures and shapes serves the creepy-cute vibe.

**What remains unexplored:** A well-executed bioluminescent/abyssal room using Canvas/SVG could still work. The failed attempts here reflect execution quality, not a fundamental mismatch between theme and project.

---

## 🛠 Tech Stack

- **React 18** + **TypeScript** — Component architecture
- **Vite 5** — Fast development and hot reloading
- **CSS** — Primary visual effects (embracing the "janky code art" aesthetic)
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

Each room includes a debug panel (bottom-right) to test personalization features:
- **Visits override** — Test different visit counts without waiting
- **Time-of-day toggle** — Test morning/afternoon/evening/night modes
- **Reset All Data** — Clear localStorage and start fresh (bottom-left)

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
│       └── ThePet/             # "The Creature"
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🎨 Design Philosophy

1. **Simple but deep** — Each room focuses on one core effect, explored thoroughly
2. **Uncanny valley** — Intentionally imperfect attempts at realism
3. **Creepy-cute, not gross** — Aesthetically weird but marketable
4. **Personalization as unsettling** — The app remembers you in ways that feel slightly off
5. **Hypnotic over overwhelming** — Calming weirdness, not sensory overload

---

*Built as an experimental visual playground for boundary-pushing web effects.*
