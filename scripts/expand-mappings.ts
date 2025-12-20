import fs from 'fs';
import path from 'path';
import * as emoji from 'node-emoji';
import { emojiToLucideIcon } from '../src/mappings/lucide';
import { emojiToHeroIcon } from '../src/mappings/heroicons';
import { emojiToMaterialIcon } from '../src/mappings/material';
import { emojiToFontAwesome } from '../src/mappings/fontawesome';
import { emojiToFeather } from '../src/mappings/feather';
import { emojiToRemix } from '../src/mappings/remix';
import { emojiToPhosphor } from '../src/mappings/phosphor';

// Configuration
const LIBS = [
    { name: 'lucide', prefix: 'Lucide', path: 'lucide' },
    { name: 'heroicons', prefix: 'Hi', path: 'hi2' },
    { name: 'material', prefix: 'Md', path: 'md' },
    { name: 'fontawesome', prefix: 'Fa', path: 'fa6' },
    { name: 'remix', prefix: 'Ri', path: 'ri' },
    { name: 'phosphor', prefix: 'Pi', path: 'pi' },
    { name: 'feather', prefix: 'Fi', path: 'fi' },
    { name: 'tabler', prefix: 'Tb', path: 'tb' },
    { name: 'boxicons', prefix: 'Bi', path: 'bi' },
];

const EXISTING_MAPPINGS: any = {
    lucide: emojiToLucideIcon,
    heroicons: emojiToHeroIcon,
    material: emojiToMaterialIcon,
    fontawesome: emojiToFontAwesome,
    feather: emojiToFeather,
    remix: emojiToRemix,
    phosphor: emojiToPhosphor,
    tabler: {},
    boxicons: {}
};

// Helper to normalize strings for comparison (remove spaces, lowercase)
const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

const findReactIconsPath = () => {
    const paths = [
        path.join(process.cwd(), 'validator/node_modules/react-icons'),
        path.join(process.cwd(), 'node_modules/react-icons'),
    ];
    for (const p of paths) {
        if (fs.existsSync(p)) return p;
    }
    // Fallback if not found locally, try to resolve via node
    try {
        return path.dirname(require.resolve('react-icons/package.json'));
    } catch (e) {
        return paths[0]; // Fallback to original
    }
};

const REACT_ICONS_PATH = findReactIconsPath();

async function getAvailableIcons(libPath: string, prefix: string) {
    const dtsPath = path.join(REACT_ICONS_PATH, libPath, 'index.d.ts');
    if (!fs.existsSync(dtsPath)) {
        console.warn(`Skipping ${libPath}, path not found: ${dtsPath}`);
        return [];
    }
    const content = fs.readFileSync(dtsPath, 'utf-8');
    const regex = new RegExp(`export declare const (${prefix}[a-zA-Z0-9]+): IconType;`, 'g');
    const matches = [...content.matchAll(regex)];
    return matches.map(m => m[1]);
}

async function expand() {
    // Use all unicode emojis + node-emoji for keywords
    // node-emoji search('') gives us the list with keywords
    const allEmojiData = emoji.search('');

    // Structure for candidates: candidates[style][emoji] = [icon1, icon2, ...]
    const allCandidates: Record<string, Record<string, string[]>> = {};

    // Initialize structure
    for (const lib of LIBS) {
        allCandidates[lib.name] = {};
    }

    for (const lib of LIBS) {
        console.log(`Processing ${lib.name}...`);
        const availableIcons = await getAvailableIcons(lib.path, lib.prefix);
        if (availableIcons.length === 0) continue;

        // Create a searchable list
        // normalizedName -> { original: string, clean: string }
        const iconList = availableIcons.map(icon => {
            const cleanName = icon.replace(new RegExp(`^${lib.prefix}`), '');
            return {
                original: icon,
                clean: cleanName,
                normalized: normalize(cleanName)
            };
        });

        const newMappings: Record<string, string> = { ...EXISTING_MAPPINGS[lib.name] };

        // For every emoji, find candidates
        for (const e of allEmojiData) {
            const keywords = [e.name, ...(e.name.split('_'))].filter(k => k.length > 2);
            const uniqueCandidates = new Set<string>();

            // 1. Current mapping is top candidate if exists
            if (newMappings[e.emoji]) {
                uniqueCandidates.add(newMappings[e.emoji]);
            }

            // 2. Search by keywords
            for (const keyword of keywords) {
                const nKeyword = normalize(keyword);
                // Exact match on normalized
                const exactMatches = iconList.filter(i => i.normalized === nKeyword);
                exactMatches.forEach(m => uniqueCandidates.add(m.original));

                // Contains match (if explicit match failed or we want more options)
                // Limit contains matches to avoid noise
                const containsMatches = iconList.filter(i => i.normalized.includes(nKeyword));
                containsMatches.slice(0, 5).forEach(m => uniqueCandidates.add(m.original));
            }

            // 3. Save candidates
            if (uniqueCandidates.size > 0) {
                allCandidates[lib.name][e.emoji] = Array.from(uniqueCandidates).slice(0, 10); // Limit to 10

                // If no mapping existed, pick the first one as default? 
                // We already did this in previous step, but let's re-affirm or expand if we want.
                // For now, let's NOT overwrite existing mappings in src/mappings/*.ts unless we strictly want to.
                // The user wants to PICK via UI. So we just need to ensure *some* default exists if possible.
                if (!newMappings[e.emoji] && allCandidates[lib.name][e.emoji].length > 0) {
                    newMappings[e.emoji] = allCandidates[lib.name][e.emoji][0];
                }
            }
        }

        // Write updated mappings (with new defaults)
        // Construct correct export name
        let exportName = `emojiTo${lib.name.charAt(0).toUpperCase() + lib.name.slice(1)}`;
        if (lib.name === 'fontawesome') exportName = 'emojiToFontAwesome';
        if (lib.name === 'heroicons') exportName = 'emojiToHeroIcon';
        if (lib.name === 'material') exportName = 'emojiToMaterialIcon';
        if (lib.name === 'lucide') exportName = 'emojiToLucideIcon';

        const mappingContent = `/**
 * ${lib.name.charAt(0).toUpperCase() + lib.name.slice(1)} Mappings
 * Auto-generated expansion
 */
export const ${exportName}: Record<string, string> = ${JSON.stringify(newMappings, null, 2)};
`;
        const outputPath = path.join(process.cwd(), `src/mappings/${lib.name}.ts`);
        fs.writeFileSync(outputPath, mappingContent);
    }

    // Write candidates to validator
    const candidatesPath = path.join(process.cwd(), 'validator/src/candidates.json');
    fs.writeFileSync(candidatesPath, JSON.stringify(allCandidates, null, 2));
    console.log(`Candidates saved to ${candidatesPath} `);
}

expand();
