import fs from 'fs';
import path from 'path';
import * as emoji from 'node-emoji';

// Function to convert unicode character to hex codepoint string (dash separated)
function toHex(str: string) {
    const points: string[] = [];
    for (const char of str) {
        // We use codePointAt to handle surrogate pairs correctly?
        // Actually str is an emoji sequence. We need to iterate code points.
    }
    // Using Array.from ensures we split by code points, not UTF-16 units
    return Array.from(str).map(c => c.codePointAt(0)!.toString(16)).join('-');
}

// However, standard naming (like Noto) usually omits the VS16 selector (fe0f)
// e.g. '2600-fe0f' often becomes just '2600' in filenames, BUT some libraries keep it.
// Noto usually STRIPS VS16 for fully qualified sequences, but keys might vary.
// Let's generate the "canonical" hex sequence.

function normalizeHex(str: string) {
    const codePoints = Array.from(str).map(c => c.codePointAt(0)!);
    // Remove FE0F (Variation Selector-16) generally
    const filtered = codePoints.filter(c => c !== 0xfe0f);
    return filtered.map(c => c.toString(16)).join('-');
}

const allEmojiData = emoji.search('');
const notoMappings: Record<string, string> = {};
const openmojiMappings: Record<string, string> = {};
const twemojiMappings: Record<string, string> = {};

for (const e of allEmojiData) {
    const hex = normalizeHex(e.emoji);
    notoMappings[e.emoji] = hex;
    openmojiMappings[e.emoji] = hex; // Usually same convention
    twemojiMappings[e.emoji] = hex;  // Usually same convention
}

// Generate files
const libs = [
    { name: 'noto', data: notoMappings, desc: 'Noto Emoji (Google)' },
    { name: 'openmoji', data: openmojiMappings, desc: 'OpenMoji' },
    { name: 'twemoji', data: twemojiMappings, desc: 'Twemoji (Twitter)' }
];

for (const lib of libs) {
    const content = `/**
 * ${lib.desc} Mappings
 * Maps emojis to their standard Hex Code sequences (e.g. '1f600').
 * Useful for constructing URLs to SVG/PNG assets.
 */
export const emojiTo${lib.name.charAt(0).toUpperCase() + lib.name.slice(1)}: Record<string, string> = ${JSON.stringify(lib.data, null, 2)};
`;
    // const outputPath = path.join(process.cwd(), `src/mappings/${lib.name}.ts`);
    // fs.writeFileSync(outputPath, content);
}
// For now, let's just do NOTO as requested.
const notoContent = `/**
 * Noto Emoji Mappings
 * Maps emojis to their standard Hex Code sequences (e.g. '1f600').
 * Useful for constructing URLs to SVG/PNG assets (like Google Fonts CDN).
 */
export const emojiToNoto: Record<string, string> = ${JSON.stringify(notoMappings, null, 2)};
`;

fs.writeFileSync(path.join(process.cwd(), 'src/mappings/noto.ts'), notoContent);
console.log('Generated src/mappings/noto.ts');
