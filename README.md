# emoji-to-icons 🚀

> Convert emojis to professional SVG icons.

**emoji-to-icons** is a semantic mapping library that converts casual emojis (e.g., 🤖) into professional icon names (e.g., `bot` for Lucide, `FaRobot` for Font Awesome). 

It is designed for:
- **Developers** building documentation tools or CMSs.
- **LLM Workflows** where you want to turn AI-generated emoji content into professional UIs.
- **Design Systems** needing a bridge between playful user input and formal icon sets.

---

## ✨ Features

- **Semantic Mapping**: Intelligent conversion (e.g., 🧠 → `brain`, 🔒 → `lock`).
- **Framework Agnostic**: Returns simple strings (icon names), not React/Vue components.
- **Micro-Library**: Zero runtime dependencies.
- **Typing**: Fully typed with TypeScript.

## 📦 Supported Libraries

We currently support mappings for **7 major icon libraries**:

| Library | Key | Emojis Mapped |
|---------|-----|---------------|
| **Lucide** | `lucide` | ~510 |
| **Heroicons** | `heroicons` | ~470 |
| **Material Icons** | `material` | ~760 |
| **Font Awesome 6** | `fontawesome` | ~870 |
| **Feather Icons** | `feather` | ~410 |
| **Remix Icon** | `remix` | ~700 |
| **Phosphor Icons** | `phosphor` | ~820 |
| **Tabler Icons** | `tabler` | ~930 |
| **BoxIcons** | `boxicons` | ~670 |
| **Noto Color Emoji** | `noto-color` | ~1570 |
| **Noto Emoji (Mono)** | `noto-mono` | ~1570 |

## 🛠️ Installation

```bash
npm install emoji-to-icons
# or
yarn add emoji-to-icons
# or
pnpm add emoji-to-icons
```

## 💻 Usage

### Basic Conversion

```typescript
import { emojiToIcon } from 'emoji-to-icons';

// Simple lookup
const icon = emojiToIcon('🤖', 'lucide'); 
console.log(icon); // Output: 'bot'

const faIcon = emojiToIcon('🤖', 'fontawesome');
console.log(faIcon); // Output: 'FaRobot'

// Returns undefined if not found
const unknown = emojiToIcon('🥴', 'lucide');
console.log(unknown); // Output: undefined
```

### Text Replacement

Perfect for allowing users (or LLMs) to write with emojis, but rendering with icons.

```typescript
import { convertEmojis } from 'emoji-to-icons';

const text = "Our AI 🤖 uses a complex neural net 🧠 to secure 🔒 your data.";
const processed = convertEmojis(text, 'lucide');

console.log(processed);
// Output: "Our AI <bot> uses a complex neural net <brain> to secure <lock> your data."

// You can then process this string to render actual components
// e.g., replacing <name> with <IconComponent name="name" />
```

### Get Supported Emoji List

Useful for prompt engineering (telling an LLM which emojis it is allowed to use).

```typescript
import { getSupportedEmojis } from 'emoji-to-icons';

const emojis = getSupportedEmojis('lucide');
console.log(emojis); // ['🤖', '🧠', '🔒', ...]
```

## 🤝 Contributing

We welcome contributions! If you find an emoji that isn't mapped, or a mapping that could be better:

1.  Fork the repo.
2.  Edit `src/mappings/<library>.ts`.
3.  Submit a Pull Request.

## 📄 License

MIT © [Huikku](https://github.com/huikku)
