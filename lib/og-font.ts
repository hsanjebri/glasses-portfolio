/**
 * Fetches Instrument Serif as TTF for the generated images (Satori cannot read
 * woff2). Returns null when the network is unavailable, in which case the
 * images fall back to the renderer's built-in face rather than failing.
 */
export async function loadDisplayFont(style: 'normal' | 'italic'): Promise<ArrayBuffer | null> {
  try {
    const axis = style === 'italic' ? 'ital@1' : 'ital@0'
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Instrument+Serif:${axis}`)).text()
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1]
    if (!url) return null
    return await (await fetch(url)).arrayBuffer()
  } catch {
    return null
  }
}
