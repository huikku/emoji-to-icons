import { emojiToLucideIcon } from '../src/mappings/lucide';
import { emojiToHeroIcon } from '../src/mappings/heroicons';
import { emojiToMaterialIcon } from '../src/mappings/material';
import { emojiToFontAwesome } from '../src/mappings/fontawesome';
import { emojiToFeather } from '../src/mappings/feather';
import { emojiToRemix } from '../src/mappings/remix';
import { emojiToPhosphor } from '../src/mappings/phosphor';

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
