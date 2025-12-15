# FinalPoint Design System & Agent Instructions

**Target Audience:** LLM Coding Agents & Frontend Developers
**Goal:** Unified "Tactical Industrial" Aesthetic across all products.

---

## 1. Core Visual Identity

**Theme Name:** Tactical Dark (Glass & Metal)
**Principles:**
1.  **High Contrast & Legibility:** Critical data must pop against dark backgrounds.
2.  **No Decorative Gradients:** Use solid colors and subtle glass effects (`bg-opacity`).
3.  **Industrial Framing:** Elements should look like physical instrument panels with 1px borders (`border-metal-trim`).
4.  **Semantic Color Use:** Colors always indicate state (Green=Good, Amber=Warn, Red=Critical, Blue=Neutral/Nav).
5.  **Micro-Interactions:** Buttons and interactive elements must have hover states (typically brightening).

---

## 2. Technical Implementation (Source of Truth)

### 2.1 Tailwind Configuration
Agents **MUST** use this exact configuration. Do not invent new colors.

```javascript
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Barlow', 'sans-serif'],           // UI Text, Headers, Labels
        mono: ['JetBrains Mono', 'monospace'],    // Data, Telemetry, Code, Coordinates
      },
      colors: {
        bg: {
          primary: '#0A0C0E',   // Main background (Deep Void)
          secondary: '#14171C', // Component background (Dark Plate)
        },
        frame: '#1E2328',       // Panel backgrounds (Lighter Plate)
        text: {
          primary: '#C1C5C8',   // Main text (High readability)
          muted: '#6F7477',     // Secondary text / metadata
        },
        accent: {
          green: {
            active: '#3FFF59',  // Success / Online / Safe
            idle: '#1C8E32',    // Dimmed state
          },
          amber: {
            active: '#E79C35',  // Warning / Degraded / Caution
            idle: '#A06715',    // Dimmed state
          },
          red: {
            active: '#C32D2D',  // Critical / Error / Hostile
            idle: '#6C1B1B',    // Dimmed state
          },
          blue: {
            active: '#68A9EC',  // Info / Navigation / Friendly
            idle: '#305575',    // Dimmed state
          },
        },
        metal: {
          base: '#6F7477',      // Generic metallic elements
          trim: '#464B4E',      // Borders / Dividers
          highlight: '#C1C5C8', // Selected states / Bright accents
        },
      }
    }
  }
}
```

### 2.2 Global CSS Rules
*   **Scrollbars:** Thin, dark, non-intrusive.
*   **Leaflet Maps:** Background must match `bg-primary`. Popups must be dark themed.
*   **Glassmorphism:** Use `backdrop-blur-md` with low-opacity backgrounds for overlays.

### 2.3 Typography & Sizing Regulations
*   **Font Family Strategy:**
    *   **Headers:** `Barlow` (Sans) | Weights: `500` (Medium), `600` (SemiBold).
    *   **Body/Labels:** `Barlow` (Sans) | Weight: `400` (Regular).
    *   **Data/Code:** `JetBrains Mono` (Mono) | Weight: `500` for values, `400` for units.
*   **Scale (Tailwind standard + modifications):**
    *   `text-xs` (12px): Metadata, secondary labels, timestamp logos.
    *   `text-sm` (14px): Standard body text, button labels, form inputs.
    *   `text-base` (16px): Section headers, primary values types.
    *   `text-lg` (18px): Panel titles, major KPIs.
    *   `text-xl+`: Rare. Only for critical alerts or massive HUD counters.
*   **Tracking (Letter Spacing):**
    *   **Uppercase Labels:** ALWAYS use `tracking-wider` or `tracking-widest`.
    *   **Mono Numbers:** `tracking-tight` if space is constrained, otherwise normal.

---

## 3. UI Component Construction Kit

### 3.1 Frames & Panels ("The Glass Cockpit")
*   **Base Layer:** `bg-bg-primary` (Opaque).
*   **Floating Panel:** `bg-frame/90` or `bg-bg-secondary/95` with `backdrop-blur-sm`.
*   **Border:** `border border-metal-trim` (1px solid #464B4E).
*   **Shadows:** `shadow-lg` or `shadow-xl ` for floating modals. rarely used for flat panels.
*   **Rounding:**
    *   Outer windows/modals: `rounded-lg` or `rounded-md`.
    *   Inner grouping containers: `rounded-sm`.
    *   NEVER use `rounded-xl` or larger (looks too "soft/mobile").

### 3.2 Form Controls & Inputs

#### A. Dropdowns & Selects ("Tipdowns")
*   **Trigger:** `bg-bg-secondary` + `border-metal-trim` + `text-text-primary`.
*   **Dropdown Body:** `bg-frame` + `border-metal-highlight` (focused state) + `shadow-2xl`.
*   **Item State:**
    *   *Idle:* `text-text-muted hover:text-text-primary`.
    *   *Hover:* `bg-white/5` (subtle lighting).
    *   *Active/Selected:* `text-accent-blue-active` or `border-l-2 border-accent-blue-active`.

#### B. Toggles & Switches
*   **Track:** `h-5 w-9 rounded-full`.
    *   *Off:* `bg-metal-trim` (Gray).
    *   *On:* `bg-accent-green-idle` (Dim Green) or `bg-accent-blue-idle`.
*   **Thumb:** `h-4 w-4 bg-text-primary rounded-full shadow-sm transform transition`.
*   **Label:** Always place label to the *left* or *right* with `text-sm font-medium text-text-muted`.

#### C. Sliders & Range Inputs
*   **Track:** `h-1 bg-metal-trim rounded-full`.
*   **Fill/Progress:** `bg-accent-blue-active` or `bg-accent-amber-active` (if warning level).
*   **Thumb:**
    *   Standard: `w-3 h-3 bg-text-primary rounded-full`.
    *   Tactical: `w-2 h-4 bg-metal-highlight rounded-sm` (vertical bar style).

#### D. Text Inputs
*   **Style:** `bg-bg-primary/50` + `border-b border-metal-trim` (Underline style prefered) OR `border border-metal-trim rounded-sm` (Box style).
*   **Focus:** `border-accent-blue-active` + `outline-none` + `ring-1 ring-accent-blue-active/50`.
*   **Placeholder:** `text-metal-base italic`.

### 3.3 Interactive Feedback
*   **Hover Effects:**
    *   Do NOT change layout (width/height).
    *   DO change: `border-color`, `text-color`, `bg-opacity`.
    *   Example: `hover:border-metal-highlight hover:text-white`.
*   **Active/Pressed:** `transform scale-[0.98]` (subtle scaling) for strictly clickable buttons.

---

## 4. Iconography & Visual Markers

---

## 5. Agent Workflow Rules FOR CODING AGENTS

1.  **Dependency Check:**
    *   **Do NOT** install tailwind/postcss via npm. Use the CDN script provided in `index.html`.
    *   **Do NOT** use `fs` or `path` in browser-side code.

2.  **Code Style:**
    *   Use functional React components with Hooks.
    *   Prioritize `useEffect` safety (cleanup listeners).
    *   Use explicit types for all Props-`interface Props { ... }`.

3.  **Refactoring:**
    *   When creating new views, check `components/` first to reuse `PrimaryActionButton`, `BottomSheet`, etc.
    *   Keep logic in `services/` or `contexts/`, keep UI in `components/`.

---

## 6. Tone & Copy
*   **Voice:** Professional, Military-Standard, Concise.
*   **Good:** "Mission Aborted", "Link Established", "Target Acquired".
*   **Bad:** "Oops, something went wrong", "Click here", "Welcome back!".
