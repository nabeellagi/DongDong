import { create } from "zustand";

export const useGame = create((set, get) => ({
    gravity : 300,
    ballCount : 1,

    powerUps : [],

    // methods
    setGravity : (g) => set({ gravity : g }),

}))

/**

*/