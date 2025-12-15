
// Simplified categorization based on typical Emoji ordering
// We can use a combination of ranges and keywords if we want, or just fetch a mapping.
// Since we don't have a database, we'll try to bucket them by keyword heuristics or ranges.
// Noto/Unicode ordering is generally: Smileys, People, Components, Animals, Food, Travel, Activities, Objects, Symbols, Flags.

export function getEmojiCategory(emojiChar: string, name: string): string {
    const n = name.toLowerCase();

    // Specific specific overrides or high priority keywords first
    if (n.includes('alert') || n.includes('warning') || n.includes('stop') || n.includes('danger') || n.includes('error') || n.includes('ban') || n.includes('sos')) return 'Alert';
    if (n.includes('search') || n.includes('magnify') || n.includes('glass') || n.includes('find') || n.includes('zoom')) return 'Search';
    if (n.includes('arrow') || n.includes('chevron') || n.includes('cursor') || n.includes('direction') || n.includes('triangle_') || n.includes('braille')) return 'Navigation';
    if (n.includes('play') || n.includes('pause') || n.includes('record') || n.includes('stop_button') || n.includes('music') || n.includes('video') || n.includes('camera') || n.includes('mic') || n.includes('speaker') || n.includes('volume') || n.includes('film') || n.includes('movie') || n.includes('headphone') || n.includes('radio') || n.includes('broadcast')) return 'Audio & Video';
    if (n.includes('mail') || n.includes('email') || n.includes('chat') || n.includes('message') || n.includes('speech') || n.includes('bubble') || n.includes('comment') || n.includes('envelope') || n.includes('inbox') || n.includes('post') || n.includes('send') || n.includes('receive')) return 'Communication';
    if (n.includes('bell') || n.includes('alarm') || n.includes('snooze') || n.includes('notify')) return 'Notification';
    if (n.includes('edit') || n.includes('pen') || n.includes('pencil') || n.includes('cut') || n.includes('scissor') || n.includes('paste') || n.includes('copy') || n.includes('align') || n.includes('font') || n.includes('text') || n.includes('list') || n.includes('check_box') || n.includes('link')) return 'Editor';
    if (n.includes('file') || n.includes('folder') || n.includes('document') || n.includes('page') || n.includes('sheet') || n.includes('archive') || n.includes('clipboard') || n.includes('attach') || n.includes('clip')) return 'File';
    if (n.includes('image') || n.includes('photo') || n.includes('picture') || n.includes('art') || n.includes('frame') || n.includes('gallery') || n.includes('palette') || n.includes('color')) return 'Image';
    if (n.includes('map') || n.includes('pin') || n.includes('location') || n.includes('compass') || n.includes('globe') || n.includes('world') || n.includes('car') || n.includes('bus') || n.includes('train') || n.includes('plane') || n.includes('boat') || n.includes('ship') || n.includes('bicycle') || n.includes('traffic') || n.includes('flag')) return 'Maps';
    if (n.includes('home') || n.includes('house') || n.includes('building') || n.includes('door') || n.includes('bed') || n.includes('bath') || n.includes('hotel') || n.includes('office') || n.includes('hospital') || n.includes('school')) return 'Home';
    if (n.includes('person') || n.includes('people') || n.includes('man') || n.includes('woman') || n.includes('child') || n.includes('baby') || n.includes('user') || n.includes('group') || n.includes('team') || n.includes('heart') || n.includes('love') || n.includes('like') || n.includes('hand') || n.includes('thumb') || n.includes('clap') || n.includes('smile') || n.includes('face') || n.includes('mood') || n.includes('star')) return 'Social';
    if (n.includes('phone') || n.includes('mobile') || n.includes('computer') || n.includes('top') || n.includes('monitor') || n.includes('screen') || n.includes('keyboard') || n.includes('mouse') || n.includes('watch') || n.includes('battery') || n.includes('plug') || n.includes('electric') || n.includes('robot') || n.includes('disk') || n.includes('server') || n.includes('print')) return 'Device';
    if (n.includes('toggle') || n.includes('switch') || n.includes('check') || n.includes('tick') || n.includes('mark') || n.includes('cross') || n.includes('x') || n.includes('cancel') || n.includes('close') || n.includes('circle') || n.includes('square') || n.includes('on') || n.includes('off')) return 'Toggle';

    // Catch-alls
    if (n.includes('tool') || n.includes('gear') || n.includes('setting') || n.includes('cog') || n.includes('construct') || n.includes('build') || n.includes('hammer') || n.includes('wrench') || n.includes('lock') || n.includes('key')) return 'Hardware';
    if (n.includes('place') || n.includes('city') || n.includes('town') || n.includes('village') || n.includes('park') || n.includes('stadium') || n.includes('castle') || n.includes('temple') || n.includes('church')) return 'Places';
    if (n.includes('run') || n.includes('walk') || n.includes('jump') || n.includes('swim') || n.includes('lift') || n.includes('sport') || n.includes('game') || n.includes('play')) return 'Action';

    // Everything else
    return 'Other';
}

// Ideally we'd have the real unicode category data. 
// Let's rely on a more robust set of categories if possible.
// Actually, `node-emoji` usually doesn't provide categories.
// We can add a larger list if this heuristic is too weak.
