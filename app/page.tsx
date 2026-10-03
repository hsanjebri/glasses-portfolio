import { Suspense } from 'react'

import { Atelier } from '@/components/sections/Atelier'
import { BrandsWall } from '@/components/sections/BrandsWall'
import { BuilderTeaser } from '@/components/sections/BuilderTeaser'
import { Featured } from '@/components/sections/Featured'
import { Hero } from '@/components/sections/Hero'
import { Lookbook } from '@/components/sections/Lookbook'
import { Manifesto } from '@/components/sections/Manifesto'
import { Preloader } from '@/components/sections/Preloader'
import { TheBox } from '@/components/sections/TheBox'
import { TwoWorlds } from '@/components/sections/TwoWorlds'
import { Visit } from '@/components/sections/Visit'
import { Voices } from '@/components/sections/Voices'
import { JsonLd } from '@/components/seo/JsonLd'
import { featuredFrames } from '@/content/products'
import { opticianSchema } from '@/lib/structured-data'

export default function HomePage() {
  return (
    <>
      <JsonLd data={opticianSchema()} />
      <Preloader />
      <Hero />
      {/* Each section is its own Suspense boundary, so hydration runs in
          short slices the browser can interleave with input, not one long task. */}
      <Suspense>
        <Manifesto />
      </Suspense>
      <Suspense>
        <TwoWorlds />
      </Suspense>
      <Suspense>
        <BrandsWall />
      </Suspense>
      <Suspense>
        <Featured frames={featuredFrames()} />
      </Suspense>
      <Suspense>
        <BuilderTeaser />
      </Suspense>
      <Suspense>
        <Atelier />
      </Suspense>
      <Suspense>
        <TheBox />
      </Suspense>
      <Suspense>
        <Lookbook />
      </Suspense>
      <Suspense>
        <Voices />
      </Suspense>
      <Suspense>
        <Visit />
      </Suspense>
    </>
  )
}
