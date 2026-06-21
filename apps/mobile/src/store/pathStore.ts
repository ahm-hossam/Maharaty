import { create } from 'zustand'

interface PathStore {
  completed: number[]          // step numbers that are done
  completeStep: (step: number) => void
  reset: () => void
}

export const usePathStore = create<PathStore>()((set) => ({
  completed: [],

  completeStep: (step) =>
    set((s) => ({
      completed: s.completed.includes(step) ? s.completed : [...s.completed, step],
    })),

  reset: () => set({ completed: [] }),
}))
