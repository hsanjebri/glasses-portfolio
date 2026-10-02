import type { FrameShape } from '@/content/types'

/**
 * Lens outline for the viewer's right lens, centred on (0, 0). The inner edge
 * (towards the nose) is at −x. The left lens is this mirrored.
 */
export function lensPath(shape: FrameShape, w: number, h: number): string {
  switch (shape) {
    case 'round':
      return `M${-w} 0A${w} ${h} 0 1 1 ${w} 0A${w} ${h} 0 1 1 ${-w} 0Z`

    case 'square':
      return roundedLens(w, h, w * 0.16, w * 0.2, w * 0.3)

    case 'rectangular':
      return roundedLens(w, h, w * 0.12, w * 0.2, w * 0.28)

    case 'oversized':
      return roundedLens(w, h, w * 0.22, w * 0.32, w * 0.44)

    case 'cat-eye':
      return [
        `M${-w} ${-h * 0.5}`,
        `C${-w * 0.42} ${-h * 1.02} ${w * 0.46} ${-h * 1.2} ${w * 1.04} ${-h * 1.14}`,
        `C${w * 1.1} ${-h * 0.6} ${w * 0.98} ${h * 0.42} ${w * 0.68} ${h * 0.86}`,
        `C${w * 0.3} ${h * 1.14} ${-w * 0.52} ${h * 1.1} ${-w * 0.86} ${h * 0.6}`,
        `C${-w * 1.02} ${h * 0.3} ${-w * 1.04} ${-h * 0.16} ${-w} ${-h * 0.5}Z`,
      ].join('')

    case 'aviator':
      return [
        `M${-w * 0.9} ${-h * 0.9}`,
        `C${-w * 0.3} ${-h * 1.04} ${w * 0.52} ${-h * 1.04} ${w * 0.98} ${-h * 0.8}`,
        `C${w * 1.1} ${-h * 0.48} ${w * 1.04} ${h * 0.24} ${w * 0.7} ${h * 0.76}`,
        `C${w * 0.34} ${h * 1.12} ${-w * 0.36} ${h * 1.1} ${-w * 0.72} ${h * 0.6}`,
        `C${-w * 0.98} ${h * 0.22} ${-w * 1.04} ${-h * 0.5} ${-w * 0.9} ${-h * 0.9}Z`,
      ].join('')
  }
}

/** Rounded lens with independent top, outer-bottom and inner-bottom radii. */
function roundedLens(w: number, h: number, rt: number, rbo: number, rbi: number): string {
  return [
    `M${-w + rt} ${-h}`,
    `Q0 ${-h - h * 0.03} ${w - rt} ${-h}`,
    `A${rt} ${rt} 0 0 1 ${w} ${-h + rt}`,
    `L${w} ${h - rbo}`,
    `A${rbo} ${rbo} 0 0 1 ${w - rbo} ${h}`,
    `Q0 ${h + h * 0.04} ${-w + rbi} ${h}`,
    `A${rbi} ${rbi} 0 0 1 ${-w} ${h - rbi}`,
    `L${-w} ${-h + rt}`,
    `A${rt} ${rt} 0 0 1 ${-w + rt} ${-h}Z`,
  ].join('')
}
