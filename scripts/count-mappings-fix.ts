import { emojiToLucideIcon } from '../src/mappings/lucide.js';
import { emojiToHeroIcon } from '../src/mappings/heroicons.js';
import { emojiToMaterialIcon } from '../src/mappings/material.js';
import { emojiToFontAwesome } from '../src/mappings/fontawesome.js';
import { emojiToFeather } from '../src/mappings/feather.js';
import { emojiToRemix } from '../src/mappings/remix.js';
import { emojiToPhosphor } from '../src/mappings/phosphor.js';

const mappings = {
    lucide: emojiToLucideIcon,
    heroicons: emojiToHeroIcon,
    material: emojiToMaterialIcon,
    fontawesome: emojiToFontAwesome,
    feather: emojiToFeather,
    remix: emojiToRemix,
    phosphor: emojiToPhosphor
};

console.log('Mapping Counts:');
for (const [name, map] of Object.entries(mappings)) {
    console.log(`${name}: ${Object.keys(map).length}`);
}
