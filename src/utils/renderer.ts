export type IconStyle =
  | 'lucide'
  | 'hero'
  | 'material'
  | 'fontawesome'
  | 'feather'
  | 'remix'
  | 'phosphor'

import { generateLucideIconMappings } from '@/utils/iconGenerators/lucide'

const iconMappingsCache = new Map<IconStyle, Promise<Record<string, string>>>()
let lucideIconMappings: Record<string, string> | null = null

export function getLucideIconMappings(): Record<string, string> {
  if (lucideIconMappings) return lucideIconMappings
  lucideIconMappings = generateLucideIconMappings()
  return lucideIconMappings
}

export function loadIconMappings(style: IconStyle): Promise<Record<string, string>> {
  const cached = iconMappingsCache.get(style)
  if (cached) return cached

  const loader = (async () => {
    switch (style) {
      case 'lucide': {
        return getLucideIconMappings()
      }
      case 'hero': {
        const mod = await import('@/utils/iconGenerators/hero')
        return mod.generateHeroIconMappings()
      }
      case 'material': {
        const mod = await import('@/utils/iconGenerators/material')
        return mod.generateMaterialIconMappings()
      }
      case 'fontawesome': {
        const mod = await import('@/utils/iconGenerators/fontawesome')
        return mod.generateFontAwesomeIconMappings()
      }
      case 'feather': {
        const mod = await import('@/utils/iconGenerators/feather')
        return mod.generateFeatherIconMappings()
      }
      case 'remix': {
        const mod = await import('@/utils/iconGenerators/remix')
        return mod.generateRemixIconMappings()
      }
      case 'phosphor': {
        const mod = await import('@/utils/iconGenerators/phosphor')
        return mod.generatePhosphorIconMappings()
      }
    }
  })()

  iconMappingsCache.set(style, loader)
  return loader
}

export async function warmIconMappings(styles: IconStyle[]) {
  await Promise.all(styles.map(s => loadIconMappings(s)))
}
