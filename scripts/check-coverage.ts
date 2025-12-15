import fs from 'fs';
import path from 'path';
import { emojiToIcon } from '../src/utils/converter';
import { emojiToLucideIcon } from '../src/mappings/lucide';
import { emojiToHeroIcon } from '../src/mappings/heroicons';

// Add other mappings as needed or iterate over all styles if detailed
const styles = ['lucide', 'heroicons', 'material', 'fontawesome', 'feather', 'remix', 'phosphor'] as const;

async function checkCoverage() {
    const resourcePath = path.join(process.cwd(), 'resources/all_emojis_unicode_v17.md');

    if (!fs.existsSync(resourcePath)) {
        console.error('Resource file not found:', resourcePath);
        process.exit(1);
    }

    const content = fs.readFileSync(resourcePath, 'utf-8');
    // Regex to match emojis (simplified for the space-separated format in the file)
    // The file has emojis separated by spaces. We can just split by whitespace.
    // However, some emojis might be multi-codepoint. Splitting by whitespace should preserve them if the file is well-formatted.
    const emojis = content.split(/\s+/).filter(Boolean); // Filter empty strings

    console.log(`Total emojis found in resource: ${emojis.length}`);

    const stats: Record<string, { covered: number, total: number }> = {};

    for (const style of styles) {
        let coveredCount = 0;
        for (const emoji of emojis) {
            if (emojiToIcon(emoji, style)) {
                coveredCount++;
            }
        }
        stats[style] = {
            covered: coveredCount,
            total: emojis.length
        };
    }

    console.table(Object.entries(stats).map(([style, stat]) => ({
        Style: style,
        Covered: stat.covered,
        Total: stat.total,
        Coverage: `${((stat.covered / stat.total) * 100).toFixed(2)}%`
    })));
}

checkCoverage();
