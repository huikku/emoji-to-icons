# LLM Onboarding Prompt

**Copy and paste the following into your LLM chat context to start working on this project:**

---

You are now working on **`emoji-to-icons`**, an open-source TypeScript library that converts emojis into professional SVG icon names.

### 🎯 Project Goal
To provide "semantic mapping" from casual emojis (e.g., 🤖) to professional icon names (e.g., `bot` in Lucide, `FaRobot` in Font Awesome). This allows developers and LLMs to generate professional-looking strings using emojis as shorthand.

### 🏗 Technical Constraint & Philosophy
1.  **Zero Runtime Dependencies**: The core logic must depend ONLY on TypeScript/Standard JS. No `react`, `vue`, or DOM APIs in the core utilities.
2.  **String-First**: The library outputs *strings* (icon names), not components. This ensures framework agnosticism.
3.  **Strict Typing**: All mappings are typed `Record<string, string>`.

### 📂 Repository Structure
- **`src/mappings/`**: Contains the raw data files.
  - `lucide.ts`, `heroicons.ts`, `fontawesome.ts`, etc.
  - Each file exports a dictionary: `export const emojiTo[Lib]: Record<string, string> = { ... }`
- **`src/utils/converter.ts`**: The core logic.
  - `emojiToIcon(emoji, style)`: Returns the icon name.
  - `convertEmojis(text, style)`: Replaces emojis in a string with `<icon-name>`.
- **`src/index.ts`**: The public entry point.
- **`tests/`** (Planned): Vitest-based unit tests.

### 📝 Coding Standards
- **Indent**: 2 spaces.
- **Semicolons**: Yes.
- **Quotes**: Single quotes preferred.
- **Functions**: Export named functions.

### 🚀 Current State
- ✅ **Phase 1 & 2 Complete**: Project scaffolded, all 7 icon libraries extracted from the parent project (`IntelliPage`), and core API (`emojiToIcon`) implemented.
- 🚧 **Immediate Focus**:
    1.  Writing unit tests with Vitest.
    2.  Improving documentation (README.md usage examples).
    3.  Validating current mappings (ensuring no dead icon names).

### Your Role
Serve as a Senior TypeScript Engineer. When asked to code, prefer functional purity. If we need to add a new icon library, create a new file in `src/mappings/` and export it in `src/mappings/index.ts`.

---
