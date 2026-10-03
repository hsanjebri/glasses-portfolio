'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { useLenis } from '@/components/motion/SmoothScroll'
import { BrandMark, BrandWord } from '@/components/ui/BrandWord'
import { Pill } from '@/components/ui/Pill'
import { a11y, nav } from '@/content/copy'
import { site } from '@/content/site'
import { useUi } from '@/lib/ui-store'

/**
 * The header is white and blended with `difference`, so it reads as dark over
 * the light footage and as white over the dark page without ever swapping
 * colours. The full-screen menu lives outside it, so it is never inverted.
 */
export function Nav() {
  const pathname = usePathname()
  const lenis = useLenis()
  const heroRevealed = useUi((s) => s.heroRevealed)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [focusedIn, setFocusedIn] = useState(false)
  const [origin, setOrigin] = useState({ x: 0, y: 0 })
  const toggle = useRef<HTMLButtonElement>(null)
  const firstLink = useRef<HTMLAnchorElement>(null)

  // On the home page the nav waits for the hero; everywhere else it is there.
  const shown = pathname !== '/' || heroRevealed || focusedIn || scrolled || open

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    lenis?.stop()
    document.body.style.overflow = 'hidden'
    // Everything behind the menu leaves the tab order while it is open.
    const behind = [document.getElementById('main'), document.querySelector('footer')]
    behind.forEach((el) => el?.setAttribute('inert', ''))
    firstLink.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggle.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      lenis?.start()
      document.body.style.overflow = ''
      behind.forEach((el) => el?.removeAttribute('inert'))
      window.removeEventListener('keydown', onKey)
    }
  }, [open, lenis])

  const openMenu = () => {
    const r = toggle.current?.getBoundingClientRect()
    if (r) setOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
    setOpen((v) => !v)
  }

  return (
    <>
      {/* Phones: once the page scrolls, a dark bar settles behind the header so it never sits on top of the text. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[119] h-16 border-b border-line bg-bg/85 backdrop-blur-md transition-opacity duration-500 ease-focus min-[900px]:hidden"
        style={{ opacity: scrolled && !open ? 1 : 0 }}
      />
      <header
        className="pointer-events-none fixed inset-x-0 top-0 z-[120] text-white mix-blend-difference"
        onFocus={() => setFocusedIn(true)}
      >
        <nav
          aria-label={a11y.navLabel}
          className={`shell pointer-events-auto flex h-16 items-center justify-between gap-6 md:h-20 ${shown ? 'focus-shown' : 'focus-hidden'}`}
        >
          <Link href="/" className="flex items-center gap-3" aria-label={`${site.brand.full}, accueil`} data-cursor-label="Accueil">
            <BrandMark className="h-3.5 w-7" />
            <BrandWord className="font-display text-[26px] leading-none tracking-[-0.01em]" />
          </Link>

          <ul className="hidden items-center gap-9 min-[900px]:flex">
            {nav.links.map((l) => {
              const active = !l.href.includes('#') && pathname.startsWith(l.href)
              return (
                <li key={l.href}>
                  <Link href={l.href} aria-current={active ? 'page' : undefined} className="label group relative inline-block py-2">
                    {l.label}
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-current transition-transform duration-500 ease-focus group-hover:scale-x-100 group-aria-[current=page]:scale-x-100"
                    />
                  </Link>
                </li>
              )
            })}
          </ul>

          <Link
            href={nav.cta.href}
            className="label hidden min-h-10 items-center rounded-full border border-white px-5 transition-colors duration-300 hover:bg-white hover:text-black min-[900px]:inline-flex"
          >
            {nav.cta.label}
          </Link>

          <button
            ref={toggle}
            type="button"
            className="label flex min-h-11 items-center gap-3 rounded-full px-1 min-[900px]:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={openMenu}
          >
            {open ? nav.menuClose : nav.menuOpen}
            <span aria-hidden="true" className="relative block h-2.5 w-5">
              <span
                className="absolute left-0 top-0 h-px w-full bg-current transition-transform duration-500 ease-focus"
                style={{ transform: open ? 'translateY(5px) rotate(45deg)' : 'none' }}
              />
              <span
                className="absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-500 ease-focus"
                style={{ transform: open ? 'translateY(-4px) rotate(-45deg)' : 'none' }}
              />
            </span>
          </button>
        </nav>
      </header>

      {/* Full-screen menu, opened through the lens aperture from the toggle. */}
      <div
        id="mobile-menu"
        inert={!open}
        className="on-light fixed inset-0 z-[110] flex flex-col bg-panel min-[900px]:hidden"
        style={{
          clipPath: `circle(${open ? 150 : 0}% at ${origin.x}px ${origin.y}px)`,
          transition: 'clip-path .75s var(--ease)',
        }}
      >
        <ul className="shell mt-28 flex flex-col">
          {nav.links.map((l, i) => (
            <li key={l.href} className="border-b border-line">
              <Link
                ref={i === 0 ? firstLink : undefined}
                href={l.href}
                data-no-aperture
                onClick={() => setOpen(false)}
                className={`flex items-baseline justify-between py-5 font-display text-[46px] leading-none ${open ? 'focus-shown' : 'focus-hidden'}`}
                style={{ transitionDelay: open ? `${0.25 + i * 0.07}s` : '0s' }}
              >
                {l.label}
                <span className="label text-ink-3">0{i + 1}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="shell mt-auto flex flex-col gap-6 pb-10">
          <Pill href={nav.cta.href} variant="solid" onClick={() => setOpen(false)} magnetic={false} className="self-start">
            {nav.cta.label}
          </Pill>
          <p className="label text-ink-3">
            {site.address.line1}, {site.address.city}
          </p>
        </div>
      </div>
    </>
  )
}
