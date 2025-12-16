import { emojiToLucideIcon } from "../mappings/lucide";
import { emojiToHeroIcon } from "../mappings/heroicons";
import { emojiToMaterialIcon } from "../mappings/material";
import { emojiToFontAwesome } from "../mappings/fontawesome";
import { emojiToFeather } from "../mappings/feather";
import { emojiToRemix } from "../mappings/remix";
import { emojiToPhosphor } from "../mappings/phosphor";
import { emojiToTabler } from "../mappings/tabler";
import { emojiToBoxicons } from "../mappings/boxicons";
import { emojiToNoto } from "../mappings/noto";

export type IconStyle =
  | "lucide"
  | "heroicons"
  | "material"
  | "fontawesome"
  | "feather"
  | "remix"
  | "phosphor"
  | "tabler"
  | "boxicons"
  | "noto-color"
  | "noto-mono";

const mappings: Record<IconStyle, Record<string, string>> = {
  lucide: emojiToLucideIcon,
  heroicons: emojiToHeroIcon,
  material: emojiToMaterialIcon,
  fontawesome: emojiToFontAwesome,
  feather: emojiToFeather,
  remix: emojiToRemix,
  phosphor: emojiToPhosphor,
  tabler: emojiToTabler,
  boxicons: emojiToBoxicons,
  "noto-color": emojiToNoto,
  "noto-mono": emojiToNoto,
};

/**
 * Convert a single emoji to an icon name
 * @param emoji The emoji character (e.g. '🤖')
 * @param style The icon set library (e.g. 'lucide')
 * @returns The icon name (e.g. 'bot') or undefined if not found
 */
export function emojiToIcon(
  emoji: string,
  style: IconStyle,
): string | undefined {
  return mappings[style]?.[emoji];
}

/**
 * Get all supported emojis for a specific icon style
 * @param style The icon style
 * @returns Array of supported emoji characters
 */
export function getSupportedEmojis(style: IconStyle): string[] {
  return Object.keys(mappings[style] || {});
}

/**
 * Replace all supported emojis in a text with their icon placeholders
 * @param text The input text
 * @param style The target icon style
 * @returns Text with emojis replaced by <icon-name>
 */
export function convertEmojis(text: string, style: IconStyle): string {
  const mapping = mappings[style];
  if (!mapping) return text;

  // Create a regex pattern from all keys
  // processing keys to escape special regex chars if any (unlikely for emojis but safe to do)
  const keys = Object.keys(mapping).sort((a, b) => b.length - a.length); // Match longest first (e.g. combinators)
  if (keys.length === 0) return text;

  // Escape special regex characters in keys (e.g. *️⃣ which starts with *)
  const escapedKeys = keys.map((key) =>
    key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const pattern = new RegExp(escapedKeys.join("|"), "g");

  return text.replace(pattern, (match) => {
    return `<${mapping[match]}>`;
  });
}
