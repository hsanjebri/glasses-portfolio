'use client'

import { useEffect, useRef, useState } from 'react'

import { CURSOR } from '@/lib/motion'
import { useFinePointer, useReducedMotion } from '@/lib/hooks'

type Mode = 'ring' | 'magnify' | 'dot'

const INTERACTIVE = 'a, button, [role="button"], label, select, summary, input[type="checkbox"], input[type="radio"]'

/**
 * The lens cursor. A 90px ring that trails the pointer; over anything marked
 * data-cursor="magnify" it becomes a loupe showing that element at 1.6×; over
 * links and buttons it shrinks to a dot with an optional mono label taken
 * from data-cursor-label. Fine pointers only, and off under reduced motion.
 */
export function LensCursor() {
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  const enabled = fine && !reduced

  const root = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<Mode>('ring')
  const [label, setLabel] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const html = document.documentElement
    html.dataset.lensCursor = 'on'

    const target = { x: innerWidth / 2, y: innerHeight / 2 }
    const pos = { ...target }
    let magnified: HTMLElement | null = null
    let raf = 0

    const placeLoupe = () => {
      if (!magnified || !stage.current) return
      const r = magnified.getBoundingClientRect()
      const s = CURSOR.magnify
      const half = CURSOR.size / 2
      // Map the point under the pointer to the loupe's centre at 1.6×.
      const tx = half - (target.x - r.left) * s
      const ty = half - (target.y - r.top) * s
      stage.current.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${s})`
    }

    const tick = () => {
      pos.x += (target.x - pos.x) * CURSOR.ease
      pos.y += (target.y - pos.y) * CURSOR.ease
      if (root.current) root.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      placeLoupe()
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const enterMagnify = (el: HTMLElement) => {
      if (magnified === el || !stage.current) return
      magnified = el
      const r = el.getBoundingClientRect()
      const clone = el.cloneNode(true) as HTMLElement
      clone.removeAttribute('data-cursor')
      clone.setAttribute('aria-hidden', 'true')
      clone.style.width = `${r.width}px`
      clone.style.height = `${r.height}px`
      clone.style.margin = '0'
      stage.current.replaceChildren(clone)
      stage.current.style.width = `${r.width}px`
      stage.current.style.height = `${r.height}px`
      setMode('magnify')
      setLabel('')
    }

    const leaveMagnify = () => {
      magnified = null
      stage.current?.replaceChildren()
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      target.x = e.clientX
      target.y = e.clientY
      setVisible(true)

      const el = e.target as Element | null
      // Product art wins even under a stretched card link, so look through the stack.
      const mag = document
        .elementsFromPoint(e.clientX, e.clientY)
        .slice(0, 8)
        .map((n) => n.closest<HTMLElement>('[data-cursor="magnify"]'))
        .find(Boolean)
      const link = el?.closest<HTMLElement>(INTERACTIVE)

      if (mag) {
        enterMagnify(mag)
      } else if (link && !link.matches(':disabled')) {
        if (magnified) leaveMagnify()
        setMode('dot')
        setLabel(link.dataset.cursorLabel ?? '')
      } else {
        if (magnified) leaveMagnify()
        setMode('ring')
        setLabel('')
      }
    }

    const onLeave = () => setVisible(false)
    const onDown = () => ring.current?.animate([{ transform: 'scale(0.86)' }, { transform: 'scale(1)' }], {
      duration: 420,
      easing: 'cubic-bezier(.2,.7,.1,1)',
    })

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    document.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointerleave', onLeave)
      delete html.dataset.lensCursor
    }
  }, [enabled])

  if (!enabled) return null

  const ringScale = mode === 'dot' ? CURSOR.dot / CURSOR.size : 1

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[180]"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity .4s var(--ease)' }}
    >
      <div
        className="absolute overflow-hidden rounded-full bg-paper shadow-card"
        style={{
          width: CURSOR.size,
          height: CURSOR.size,
          left: -CURSOR.size / 2,
          top: -CURSOR.size / 2,
          opacity: mode === 'magnify' ? 1 : 0,
          transform: `scale(${mode === 'magnify' ? 1 : 0.6})`,
          transition: 'opacity .4s var(--ease), transform .5s var(--ease)',
        }}
      >
        <div ref={stage} className="absolute left-0 top-0 origin-top-left" />
      </div>

      <div
        ref={ring}
        className="absolute rounded-full border-[1.5px] border-white mix-blend-difference"
        style={{
          width: CURSOR.size,
          height: CURSOR.size,
          left: -CURSOR.size / 2,
          top: -CURSOR.size / 2,
          transform: `scale(${ringScale})`,
          backgroundColor: mode === 'dot' ? '#fff' : 'transparent',
          transition: 'transform .5s var(--ease), background-color .3s var(--ease)',
        }}
      />

      <span
        className="label absolute left-3 top-3 whitespace-nowrap text-white mix-blend-difference"
        style={{
          opacity: mode === 'dot' && label ? 1 : 0,
          transform: `translateX(${mode === 'dot' && label ? 0 : -4}px)`,
          transition: 'opacity .3s var(--ease), transform .4s var(--ease)',
        }}
      >
        {label}
      </span>
    </div>
  )
}
