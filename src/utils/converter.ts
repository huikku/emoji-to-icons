/**
 * Emoji processing utilities for converting emojis to various icon styles
 */

/**
 * Map of keycap number emojis to Unicode circled numbers
 */
const CIRCLED_NUMBERS: Record<string, string> = {
  '0️⃣': '⓪',  // U+24EA
  '1️⃣': '①',  // U+2460
  '2️⃣': '②',  // U+2461
  '3️⃣': '③',  // U+2462
  '4️⃣': '④',  // U+2463
  '5️⃣': '⑤',  // U+2464
  '6️⃣': '⑥',  // U+2465
  '7️⃣': '⑦',  // U+2466
  '8️⃣': '⑧',  // U+2467
  '9️⃣': '⑨',  // U+2468
  '🔟': '⑩',  // U+2469
}

const ALLOWED_TAGS = new Set([
  'a',
  'b',
  'blockquote',
  'br',
  'code',
  'del',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  'span',
  'strong',
  'sub',
  'sup',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'ul',

  // SVG tags used by icon sets
  'svg',
  'g',
  'path',
  'circle',
  'rect',
  'line',
  'polyline',
  'polygon',
])

const DISALLOWED_TAGS = new Set([
  'base',
  'embed',
  'iframe',
  'link',
  'meta',
  'object',
  'script',
  'style',
])

const ALLOWED_GLOBAL_ATTRS = new Set([
  'class',
  'id',
  'title',
  'role',
  'aria-label',
  'aria-hidden',
])

const STYLE_ALLOWED_TAGS = new Set(['span', 'svg', 'path', 'g', 'circle', 'rect', 'line', 'polyline', 'polygon'])

const ALLOWED_ATTRS_BY_TAG: Record<string, Set<string>> = {
  a: new Set(['href', 'target', 'rel']),
  img: new Set(['src', 'alt', 'width', 'height', 'loading', 'decoding']),
  th: new Set(['colspan', 'rowspan', 'scope']),
  td: new Set(['colspan', 'rowspan']),
  svg: new Set([
    'xmlns',
    'viewBox',
    'width',
    'height',
    'fill',
    'stroke',
    'stroke-width',
    'stroke-linecap',
    'stroke-linejoin',
    'focusable',
    'aria-hidden',
  ]),
  path: new Set(['d', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'opacity', 'transform']),
  g: new Set(['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'opacity', 'transform']),
  circle: new Set(['cx', 'cy', 'r', 'fill', 'stroke', 'stroke-width', 'opacity', 'transform']),
  rect: new Set(['x', 'y', 'width', 'height', 'rx', 'ry', 'fill', 'stroke', 'stroke-width', 'opacity', 'transform']),
  line: new Set(['x1', 'x2', 'y1', 'y2', 'stroke', 'stroke-width', 'opacity', 'transform']),
  polyline: new Set(['points', 'fill', 'stroke', 'stroke-width', 'opacity', 'transform']),
  polygon: new Set(['points', 'fill', 'stroke', 'stroke-width', 'opacity', 'transform']),
}

function isSafeUrl(rawUrl: string, kind: 'href' | 'src'): boolean {
  const url = rawUrl.trim()
  if (!url) return false

  if (url.startsWith('#') || url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    return true
  }

  const lower = url.toLowerCase()
  if (lower.startsWith('javascript:') || lower.startsWith('vbscript:')) return false

  if (kind === 'src' && lower.startsWith('data:image/')) return true

  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' || parsed.protocol === 'mailto:' || parsed.protocol === 'tel:'
  } catch {
    return false
  }
}

function unwrapElement(el: Element) {
  const parent = el.parentNode
  if (!parent) return
  while (el.firstChild) parent.insertBefore(el.firstChild, el)
  parent.removeChild(el)
}

function sanitizeDocument(doc: Document) {
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT)
  const elements: Element[] = []
  let node = walker.nextNode()
  while (node) {
    elements.push(node as Element)
    node = walker.nextNode()
  }

  for (const el of elements) {
    const tag = el.tagName.toLowerCase()

    if (DISALLOWED_TAGS.has(tag)) {
      el.remove()
      continue
    }

    if (!ALLOWED_TAGS.has(tag)) {
      unwrapElement(el)
      continue
    }

    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase()
      const value = attr.value

      if (name.startsWith('on')) {
        el.removeAttribute(attr.name)
        continue
      }

      if (name === 'style' && !STYLE_ALLOWED_TAGS.has(tag)) {
        el.removeAttribute(attr.name)
        continue
      }

      if (name === 'href' && tag === 'a') {
        if (!isSafeUrl(value, 'href')) el.removeAttribute(attr.name)
        continue
      }

      if (name === 'src' && tag === 'img') {
        if (!isSafeUrl(value, 'src')) el.removeAttribute(attr.name)
        continue
      }

      const allowedForTag = ALLOWED_ATTRS_BY_TAG[tag]
      if (ALLOWED_GLOBAL_ATTRS.has(name)) continue
      if (allowedForTag?.has(name)) continue

      el.removeAttribute(attr.name)
    }
  }
}

function emojiToCodePointSequence(emoji: string): string | null {
  const codePoints: string[] = []
  for (const part of emoji) {
    const cp = part.codePointAt(0)
    if (cp == null) return null
    // Skip variation selectors (U+FE0E and U+FE0F)
    // OpenMoji doesn't use them in filenames
    if (cp === 0xFE0E || cp === 0xFE0F) continue
    codePoints.push(cp.toString(16).toUpperCase())
  }
  return codePoints.length ? codePoints.join('-') : null
}

/**
 * Get all supported emojis from all icon mapping sets
 */
export function getAllSupportedEmojis(
  lucideIcons: Record<string, string>,
  heroIcons: Record<string, string>,
  materialIcons: Record<string, string>,
  fontAwesomeIcons: Record<string, string> = {},
  featherIcons: Record<string, string> = {},
  remixIcons: Record<string, string> = {},
  phosphorIcons: Record<string, string> = {}
): Set<string> {
  return new Set([
    ...Object.keys(lucideIcons),
    ...Object.keys(heroIcons),
    ...Object.keys(materialIcons),
    ...Object.keys(fontAwesomeIcons),
    ...Object.keys(featherIcons),
    ...Object.keys(remixIcons),
    ...Object.keys(phosphorIcons),
  ])
}

/**
 * Convert a single emoji to HTML based on the selected style
 */
export function getEmojiHtml(
  emoji: string,
  style: string,
  isMonochrome: boolean,
  lucideIcons: Record<string, string>,
  heroIcons: Record<string, string>,
  materialIcons: Record<string, string>,
  fontAwesomeIcons: Record<string, string> = {},
  featherIcons: Record<string, string> = {},
  remixIcons: Record<string, string> = {},
  phosphorIcons: Record<string, string> = {}
): string {
  const monoClass = isMonochrome ? 'grayscale brightness-75 contrast-125' : ''

  // Native emoji - just return the emoji character
  if (style === 'native') {
    return `<span class="text-2xl align-middle mx-1 ${monoClass}">${emoji}</span>`
  }

  // Special handling for number emojis - use Unicode circled numbers for Lucide/Hero/Feather/Remix/Phosphor
  // Material Icons has filter_1-9 but NOT filter_0, so we handle 0️⃣ specially
  // Font Awesome has Fa0-Fa9, so it doesn't need special handling
  // Native/Noto use original emojis
  const needsCircledNumbers = style === 'lucide' || style === 'hero' || style === 'feather' ||
    style === 'remix' || style === 'phosphor' ||
    (style === 'material' && emoji === '0️⃣')

  if (emoji in CIRCLED_NUMBERS && needsCircledNumbers) {
    const circledNumber = CIRCLED_NUMBERS[emoji]
    const colorStyle = isMonochrome ? 'color: #000000;' : 'color: #3b82f6;'
    return `<span class="inline-block align-middle text-2xl font-bold" style="${colorStyle}">${circledNumber}</span>`
  }

  // SVG-based icon styles
  if (style === 'lucide' || style === 'hero' || style === 'material' ||
    style === 'fontawesome' || style === 'feather' || style === 'remix' || style === 'phosphor') {
    let svgContent = ''
    let isMaterialIcon = false
    let isFontAwesomeIcon = false
    let isRemixIcon = false
    let isPhosphorIcon = false

    // Select icon based on style with fallbacks
    if (style === 'material') {
      svgContent = materialIcons[emoji] || lucideIcons[emoji] || ''
      isMaterialIcon = !!materialIcons[emoji]
    } else if (style === 'hero') {
      svgContent = heroIcons[emoji] || lucideIcons[emoji] || ''
    } else if (style === 'fontawesome') {
      svgContent = fontAwesomeIcons[emoji] || lucideIcons[emoji] || ''
      isFontAwesomeIcon = !!fontAwesomeIcons[emoji]
    } else if (style === 'feather') {
      svgContent = featherIcons[emoji] || lucideIcons[emoji] || ''
    } else if (style === 'remix') {
      svgContent = remixIcons[emoji] || lucideIcons[emoji] || ''
      isRemixIcon = !!remixIcons[emoji]
    } else if (style === 'phosphor') {
      svgContent = phosphorIcons[emoji] || lucideIcons[emoji] || ''
      isPhosphorIcon = !!phosphorIcons[emoji]
    } else {
      svgContent = lucideIcons[emoji] || ''
    }

    if (!svgContent) return ''

    // Determine color style based on icon type
    let colorStyle = ''
    if (isMaterialIcon) {
      // Material Icons use fill only
      colorStyle = isMonochrome
        ? 'color: #000000; fill: currentColor;'
        : 'color: #3b82f6; fill: currentColor;'
    } else if (isFontAwesomeIcon || isRemixIcon || isPhosphorIcon) {
      // Font Awesome, Remix, and Phosphor use fill
      colorStyle = isMonochrome
        ? 'color: #000000; fill: currentColor;'
        : 'color: #3b82f6; fill: currentColor;'
    } else {
      // Lucide, Heroicons, and Feather use stroke
      colorStyle = isMonochrome
        ? 'color: #000000; stroke: currentColor; fill: none;'
        : 'color: #3b82f6; stroke: currentColor; fill: none;'
    }

    // Parse the SVG and add inline styles
    const styledSvg = svgContent.replace(
      '<svg',
      `<svg style="${colorStyle} width: 1.5rem; height: 1.5rem; display: inline-block; vertical-align: middle;"`
    )

    return `<span class="icon-marker" style="display: inline-flex; align-items: center; vertical-align: -0.125em; line-height: 1;">${styledSvg}</span>`
  }

  // Image-based emoji styles (OpenMoji, Noto)
  const codePointSequence = emojiToCodePointSequence(emoji)
  if (!codePointSequence) return ''

  if (style === 'openmoji') {
    const url = `https://openmoji.org/data/color/svg/${codePointSequence}.svg`
    return `<img src="${url}" class="w-6 h-6 inline-block align-middle ${monoClass}" alt="${emoji}" />`
  }

  if (style === 'noto') {
    // Using Noto Emoji font (monochrome outline version from Google Fonts)
    return `<span class="text-2xl align-middle mx-1 ${monoClass}" style="font-family: 'Noto Emoji', sans-serif;">${emoji}</span>`
  }

  return ''
}

/**
 * Process HTML content and replace emojis with icons based on the selected style
 */
export function processContent(
  html: string,
  style: string,
  isMonochrome: boolean,
  lucideIcons: Record<string, string>,
  heroIcons: Record<string, string>,
  materialIcons: Record<string, string>,
  fontAwesomeIcons: Record<string, string> = {},
  featherIcons: Record<string, string> = {},
  remixIcons: Record<string, string> = {},
  phosphorIcons: Record<string, string> = {},
  options?: { convertInCodeBlocks?: boolean }
): string {
  if (!html) return ''

  // Use DOMParser to safely parse HTML
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  sanitizeDocument(doc)

  // Create a TreeWalker to find all Text nodes
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null)
  const nodesToReplace: { node: Node; content: string }[] = []

  // Get all supported emojis (union of all icon sets)
  const allSupportedEmojis = getAllSupportedEmojis(
    lucideIcons,
    heroIcons,
    materialIcons,
    fontAwesomeIcons,
    featherIcons,
    remixIcons,
    phosphorIcons
  )

  let currentNode = walker.nextNode()
  while (currentNode) {
    const convertInCodeBlocks = options?.convertInCodeBlocks === true
    // Skip if parent is a script or style tag (always)
    // Skip code/pre unless convertInCodeBlocks is enabled
    if (
      currentNode.parentElement &&
      currentNode.parentElement.closest &&
      (currentNode.parentElement.closest('script') ||
        currentNode.parentElement.closest('style') ||
        (!convertInCodeBlocks &&
          (currentNode.parentElement.closest('code') ||
            currentNode.parentElement.closest('pre'))))
    ) {
      currentNode = walker.nextNode()
      continue
    }

    const text = currentNode.textContent || ''
    // Check if text contains any known emoji
    let hasMatch = false

    // Quick check to avoid processing nodes without emojis
    for (const emoji of allSupportedEmojis) {
      if (text.includes(emoji)) {
        hasMatch = true
        break
      }
    }

    if (hasMatch) {
      nodesToReplace.push({ node: currentNode, content: text })
    }

    currentNode = walker.nextNode()
  }

  // Perform replacements
  nodesToReplace.forEach(({ node, content }) => {
    let processedString = content
    let modified = false

    // Process all supported emojis
    for (const emoji of allSupportedEmojis) {
      if (processedString.includes(emoji)) {
        const replacement = getEmojiHtml(
          emoji,
          style,
          isMonochrome,
          lucideIcons,
          heroIcons,
          materialIcons,
          fontAwesomeIcons,
          featherIcons,
          remixIcons,
          phosphorIcons
        )
        if (replacement) {
          processedString = processedString.replaceAll(emoji, replacement)
          modified = true
        }
      }
    }

    if (modified && node.parentElement) {
      const span = document.createElement('span')
      span.innerHTML = processedString

      // Preserve any existing classes from parent if it's a heading
      const parent = node.parentElement
      if (parent && /^H[1-6]$/i.test(parent.tagName)) {
        // For headings, insert the span's content directly instead of wrapping
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = processedString
        while (tempDiv.firstChild) {
          parent.insertBefore(tempDiv.firstChild, node)
        }
        parent.removeChild(node)
      } else {
        parent?.replaceChild(span, node)
      }
    }
  })

  return doc.body.innerHTML
}
