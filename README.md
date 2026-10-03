# Regard — maison d'optique, La Marsa

A marketing site, catalogue and frame configurator for an independent optician in La Marsa, Tunis. Everything is in French, and the content is real: eyewear houses, their models and logos, full-bleed photography, and a hero built on actual footage.

> **Regard** is a placeholder name. Brand, address, prices and photos all live in `/content` and can be swapped without touching a component. See [Before launch](#before-launch).

![Hero — the focus pulls through the lenses onto the Landolt chart](docs/screenshots/hero-desktop.jpg)

---

## Contents

- [The idea](#the-idea)
- [Screenshots](#screenshots)
- [Stack](#stack)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Editing the content](#editing-the-content)
- [How it works](#how-it-works)
- [Before launch](#before-launch)
- [Media, licences and credits](#media-licences-and-credits)
- [Quality checks](#quality-checks)
- [Deploying](#deploying)

---

## The idea

**Focus.** Everything on the site arrives the way an image sharpens when you put glasses on: blur to sharp, never bouncy, never sliding far.

- **The hero clip** is a thin metal frame on an optician's chart of Landolt rings. The focus slides off the frame and through the lenses until the chart behind sharpens. The copy waits for that moment (`REVEAL_AT = 3.6 s`) and runs its own blur-to-sharp reveal in step with the footage.
- **The giant wordmark** sits above the clip with `mix-blend-mode: darken`. The dark rim and rings pass in front of the letters, and the word reads through the clear lenses.
- **Every reveal** uses one primitive, `<Focus>`: opacity 0, `blur(14px)`, `scale(1.02)` → sharp in 1.1 s, staggered.
- **Page transitions** are a lens aperture: a `clip-path` iris closes on the click point and opens on the new page.
- **SUN MODE.** Entering the Sun category, or a sun product, crossfades the whole page over 0.8 s into a warmer black with an amber accent.

## Screenshots

| | |
|---|---|
| ![Optique / Soleil split](docs/screenshots/two-worlds.jpg) | ![Brand logo wall](docs/screenshots/brands.jpg) |
| **Deux mondes.** Hover widens a side to 62% (clip-path) and brings its photo up to full colour. | **Les maisons.** Real brand marks in a slow CSS marquee, server-rendered. |
| ![Featured frames](docs/screenshots/featured.jpg) | ![The box](docs/screenshots/box.jpg) |
| **Sélection.** Pinned horizontal scroll on desktop, native swipe carousel on phones. | **L'écrin.** A scroll-scrubbed unboxing: the gift box lifts and the contents rise into a row. |

![L'atelier — four notes and the stats band](docs/screenshots/atelier.jpg)

| | |
|---|---|
| ![Lookbook](docs/screenshots/lookbook.jpg) | ![Visit and booking](docs/screenshots/visit.jpg) |
| **Carnet.** Editorial portraits, captioned like plates. | **Nous trouver.** Sidi Bou Said photography, hours, Google Maps link and the booking form. |
| ![Catalogue](docs/screenshots/catalogue.jpg) | ![Catalogue in SUN MODE](docs/screenshots/catalogue-sun.jpg) |
| **Catalogue.** Filter by house, shape, colour, material, fit and price. Every filter lives in the URL. | **SUN MODE.** The same page, crossfaded into the warmer theme. |
| ![Product page](docs/screenshots/product.jpg) | ![Configurator](docs/screenshots/composer.jpg) |
| **Fiche produit.** Brand and reference, colourways, possible lenses, a measurement diagram, related frames. | **Composer.** Five steps with a live preview, engraved initials on the case, and a counting total. |

<p align="center">
  <img src="docs/screenshots/mobile-home.jpg" width="260" alt="Home on a phone" />
  &nbsp;
  <img src="docs/screenshots/mobile-catalogue.jpg" width="260" alt="Catalogue on a phone" />
  &nbsp;
  <img src="docs/screenshots/mobile-composer.jpg" width="260" alt="Configurator on a phone" />
</p>

## Stack

| | |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack), **React 19**, TypeScript `strict` |
| Styling | **Tailwind CSS v4**, CSS-first `@theme inline` mapped onto CSS-variable tokens |
| Motion | **GSAP + ScrollTrigger** for scroll choreography (lazy-loaded), **Lenis** smooth scroll, **Motion** for layout transitions |
| State | **Zustand** for the configurator |
| Type | Instrument Serif (display), Geist (text), Geist Mono (labels), via `next/font` |
| Images | `next/image` with a custom loader that sizes Unsplash photos on Unsplash's CDN |
| Backend | None. Orders go out as a WhatsApp deep link; bookings post to a stub route handler. |

No UI kit, no component library, no template.

## Getting started

Requires **Node 22+**.

```bash
npm install
cp .env.example .env.local   # optional — only needed for `npm run photos`
npm run dev                  # http://localhost:3000
```

| Script | |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (type-checks, prerenders 41 routes) |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run photos` | Pings Unsplash's download endpoint for every photo in use (see [licences](#media-licences-and-credits)) |

### Environment

| Variable | Needed for |
|---|---|
| `UNSPLASH_ACCESS_KEY` | `npm run photos` only. The site never calls the Unsplash API at runtime: photos are pinned in `content/photos.ts` and served from Unsplash's CDN. |

## Project structure

```
app/
  page.tsx                 home — preloader, hero and eleven sections
  catalogue/page.tsx       catalogue (rendered per request so filters are in the HTML)
  catalogue/[slug]/        product pages, statically generated
  composer/                the configurator
  credits/                 photographers and footage
  api/booking/route.ts     stub booking endpoint
  opengraph-image.tsx      share image, generated from the brand word
  icon.tsx, apple-icon.tsx favicons from the two-circle mark
  sitemap.ts, robots.ts
components/
  motion/                  Focus, SplitLines, LensCursor, RouteAperture, Magnetic,
                           SmoothScroll, ThemeProvider (SUN MODE), useScrollScene
  media/Photo.tsx          the one way a photograph is shown
  sections/                Hero, Manifesto, TwoWorlds, BrandsWall, Featured,
                           BuilderTeaser, Atelier, TheBox, Lookbook, Voices, Visit,
                           Nav, Footer, Preloader, BookingForm
  catalogue/               Catalogue, Filters, ProductCard, ProductView, SizeDiagram
  builder/                 Builder, Preview, Steps, Choices, OptionIcon, SummaryBar
  ui/                      Pill, SectionHead, BrandWord, FitWord
content/                   ← everything you edit lives here
  site.ts                  name, tagline, address, hours, phone, WhatsApp, socials, domain
  copy.ts                  every string on the site, in French
  products.ts              29 products: frames by house, plus house accessories
  builder.ts               configurator options and prices
  brands.ts                houses carried and their logos
  photos.ts                every photograph: URL, size, colour, alt text, credit
  types.ts                 the data model
lib/                       builder logic (URL codec, validation, quote), catalogue
                           filtering, motion constants, image loader, hooks
public/
  video/                   hero clip (1920 and 960 px) and posters
  brands/                  brand logo SVGs
scripts/photos.mjs         Unsplash download tracking
docs/screenshots/          the images in this README
```

## Editing the content

Nothing brand-specific is hard-coded in a component.

| To change… | Edit |
|---|---|
| The shop's name (hero word, nav, footer, metadata, share image) | `content/site.ts` → `brand` |
| Address, hours, phone, WhatsApp number, socials, domain | `content/site.ts` |
| Any sentence on the site | `content/copy.ts` |
| A product, its price, colourways, measurements | `content/products.ts` |
| Configurator options and prices | `content/builder.ts` |
| The houses on the logo wall | `content/brands.ts` (`logoWall`) |
| A photograph | `content/photos.ts`, then point a product or section at its key |
| The hero clip | replace `public/video/hero-1920.mp4` and `hero-960.mp4` (and the posters) |

### `REVEAL_AT`

```ts
// lib/motion.ts
export const REVEAL_AT = 3.6
```

This is the second of the hero clip at which the copy starts arriving. In the current clip the frame is sharp at about 2.5 s, and the focus starts pulling through the lenses at about 3.6 s. **To change it, edit that one number.** If you swap the clip, set it to the moment the footage settles. The hero reveals anyway on `ended`, on a video `error`, on a rejected `play()`, and after a 9 s timeout.

The stat-card thumbnails are cut from the clip's last frame. Their crop rectangles are `CROPS` at the top of `components/sections/Hero.tsx`.

## How it works

- **Hero.** On `loadeddata`, and again during playback until a sample lands, the clip's top-left pixel is read into a 1×1 canvas. That colour becomes the stage background and, 12% darker, the ghost colour of the word. Under reduced motion the clip jumps to its last frame and everything appears at once.
- **Scroll scenes.** `useScrollScene` loads GSAP only when a scene nears the viewport, or once the page is idle. Each scene runs in a `gsap.context` scoped to its section and is reverted on unmount, so ScrollTriggers never leak between routes. Pins are measured top to bottom.
- **Catalogue.** All state lives in the URL (`?category=sun&brand=ray-ban,persol&sort=price-asc`), written with the History API, so every view is a shareable link and Back walks through category changes. Cards animate with layout transitions and leave by blurring out.
- **Configurator.** The whole configuration is a readable query string (`/composer?shape=cat-eye&cw=noir&lens=sun&coat=polarised&case=leather&gift=1&eng=SM`). It is restored on load and mirrored to `localStorage`. Invalid combinations are declared as data in `content/builder.ts`: polarised only with sun lenses, aviators in metal only, engraving only with the gift box. They render disabled with the reason shown, and are normalised away if they arrive in a link.
- **Orders.** "Commander sur WhatsApp" opens `wa.me/<number>` with the itemised configuration, the total and a link back to it. "Prendre rendez-vous avec cette configuration" opens the booking form with the build attached.
- **Lens cursor.** On desktop, a 90 px ring trails the pointer. Over product photos it becomes a 1.6× loupe; over links it shrinks to a dot with a label. It is off on touch and under reduced motion.

## Before launch

Every value to replace is marked `// PLACEHOLDER` in `/content`.

- [ ] **Name and identity.** `site.ts`: `brand`, `tagline`, `summary`, `url`
- [ ] **Contact.** `site.ts`: `address`, `mapsUrl`, `coordinates`, `hours`, `phone`, **`whatsapp`** (digits only, country code first), `socials`
- [ ] **Brands.** `brands.ts`: confirm the shop is an authorised stockist of every house shown; remove any it doesn't carry
- [ ] **Products.** `products.ts`: prices, colourway lists, descriptions, measurements
- [ ] **Product photos.** `photos.ts`: product images are Unsplash stand-ins. Replace them with the distributors' official shots.
- [ ] **Configurator prices.** `builder.ts`: base price and every delta
- [ ] **Testimonials.** `copy.ts` → `voices`: all three are invented
- [ ] **Stats.** `copy.ts` → `hero.stats` and `atelier.stats`
- [ ] **Booking.** `app/api/booking/route.ts` validates and acknowledges but stores nothing. Wire it to email, a calendar or a CRM.
- [ ] **Unsplash.** Run `npm run photos` once with a key in `.env.local`
- [ ] **Domain.** Set `site.url` so canonical URLs, the sitemap and share links are right

## Media, licences and credits

- **Photography.** [Unsplash](https://unsplash.com/license), hot-linked from Unsplash's CDN as their API guidelines require. Every photographer is credited on `/credits`. `npm run photos` registers each use with Unsplash's download endpoint, which the guidelines also ask for.
- **Hero footage.** [Pexels, video 5995502](https://www.pexels.com/video/5995502/) under the Pexels licence (free for commercial use, no attribution required; credited on `/credits` anyway). Re-encoded to 1920 px (1.0 MB) and 960 px (238 KB), muted, faststart.
- **Brand logos.** Public-domain text marks from Wikimedia Commons, in `public/brands/`. **They remain registered trademarks.** They are shown to indicate collections carried in store, which presumes the client is an authorised stockist (see the launch checklist). The Moscot file had its yellow sign background removed so it renders as a mark.
- **Testimonials.** The quotes are text only, on purpose: stock photos of real people next to invented reviews would present strangers as customers.

## Quality checks

| Check | Result |
|---|---|
| Production build | ✅ 41 routes, TypeScript strict |
| axe-core (WCAG 2.1 A/AA + best practice) | ✅ 0 violations on home, catalogue, catalogue in SUN MODE, a frame page, an accessory page, the configurator and credits, at 1440 px and 390 px |
| Horizontal overflow at 390 px | ✅ none on any page |
| Keyboard | ✅ skip link, visible focus rings, mobile menu traps focus and closes on Escape, filter sheet traps focus |
| Reduced motion | ✅ no Lenis, no pinning, no blur; every section renders complete at rest |
| Configurator logic | ✅ scripted test: polarised gating, metal-only aviator, engraving tied to the gift box, totals, URL round-trip, `localStorage` restore, WhatsApp message |
| Lighthouse (mobile) | ⚠️ **not measured on this build.** An earlier build scored Accessibility 97–100, Best Practices 100, SEO 100 and CLS 0, but Performance 64–84, below the 90 target. The home page is constrained by design: the preloader plus a 3.6 s reveal delays its largest content. |

Animation is limited to `transform`, `opacity`, `filter` and `clip-path`. Fonts, video and images reserve their space, so the page doesn't shift.

## Deploying

The project is ready for **Vercel**: import the repository and deploy, with no configuration needed. Add `UNSPLASH_ACCESS_KEY` to the environment only if you plan to run `npm run photos` there.

---

Designed and built by [Hassan Jebri](https://hassan-jebri-portfolio.vercel.app/).
