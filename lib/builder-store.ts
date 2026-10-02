'use client'

import { create } from 'zustand'

import { defaultConfig } from '@/content/builder'
import type { AddOnId, BuilderConfig, BuilderStepId, CoatingId } from '@/content/types'

import { decodeConfig, encodeConfig, hasConfig, normalize } from './builder'

const STORAGE_KEY = 'regard:build'

type BuilderState = {
  config: BuilderConfig
  open: BuilderStepId
  visited: BuilderStepId[]
  /** False until the URL / localStorage have been read on the client. */
  ready: boolean
  hydrate: () => void
  set: (patch: Partial<BuilderConfig>) => void
  toggleCoating: (id: CoatingId) => void
  setAddOn: (id: AddOnId, qty: number) => void
  openStep: (id: BuilderStepId) => void
  reset: () => void
}

/** Mirrors every change into the URL (replaceState, so history stays clean) and localStorage. */
function persist(config: BuilderConfig) {
  const qs = encodeConfig(config)
  window.history.replaceState(window.history.state, '', `${window.location.pathname}?${qs}`)
  try {
    localStorage.setItem(STORAGE_KEY, qs)
  } catch {}
}

export const useBuilder = create<BuilderState>((set, get) => {
  const commit = (config: BuilderConfig) => {
    const next = normalize(config)
    set({ config: next })
    persist(next)
  }

  return {
    config: defaultConfig,
    open: 'frame',
    visited: ['frame'],
    ready: false,

    /**
     * Restore order: a configuration in the URL wins (it is a shared link),
     * then the last build in localStorage, then the defaults.
     */
    hydrate: () => {
      const url = new URLSearchParams(window.location.search)
      let config = defaultConfig
      if (hasConfig(url)) {
        config = decodeConfig(url)
      } else {
        try {
          const saved = localStorage.getItem(STORAGE_KEY)
          if (saved) config = decodeConfig(new URLSearchParams(saved))
        } catch {}
      }
      set({ config, ready: true })
      persist(config)
    },

    set: (patch) => commit({ ...get().config, ...patch }),

    toggleCoating: (id) => {
      const { coatings } = get().config
      commit({ ...get().config, coatings: coatings.includes(id) ? coatings.filter((c) => c !== id) : [...coatings, id] })
    },

    setAddOn: (id, qty) => commit({ ...get().config, addOns: { ...get().config.addOns, [id]: qty } }),

    openStep: (id) => set((s) => ({ open: id, visited: s.visited.includes(id) ? s.visited : [...s.visited, id] })),

    reset: () => {
      commit(defaultConfig)
      set({ open: 'frame', visited: ['frame'] })
    },
  }
})
