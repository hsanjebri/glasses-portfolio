'use client'

import { create } from 'zustand'

type UiState = {
  /** The hero copy (and the nav with it) has been revealed on the home page. */
  heroRevealed: boolean
  setHeroRevealed: (v: boolean) => void
  /** The preloader has finished and the aperture has opened. */
  preloaded: boolean
  setPreloaded: (v: boolean) => void
}

export const useUi = create<UiState>((set) => ({
  heroRevealed: false,
  setHeroRevealed: (heroRevealed) => set({ heroRevealed }),
  preloaded: false,
  setPreloaded: (preloaded) => set({ preloaded }),
}))
