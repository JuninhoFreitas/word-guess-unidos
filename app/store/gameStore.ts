import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GameState {
  sentence: string
  wordList: string[]
  sentenceWordProbability: number
  setSentence: (sentence: string) => void
  setWordList: (wordList: string[]) => void
  setSentenceWordProbability: (probability: number) => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      sentence: "But to the one who does not work but believes in him who justifies the ungodly, his faith is counted as righteousness.",
      wordList: [
        "work",
        "believes",
        "him",
        "justifies",
        "ungodly",
        "faith",
        "righteousness",
        "apple",
        "banana",
        "cat",
        "dog",
        "elephant",
        "frog",
        "giraffe",
        "happy",
        "ice",
        "jump",
        "kite",
        "love",
        "moon",
        "nest",
        "orange",
        "purple",
        "queen",
        "rainbow",
        "star",
        "tree",
        "umbrella",
      ],
      sentenceWordProbability: 0.4, // 40% chance to pick from sentence
      setSentence: (sentence) => set({ sentence }),
      setWordList: (wordList) => set({ wordList }),
      setSentenceWordProbability: (probability) => set({ sentenceWordProbability: probability }),
    }),
    {
      name: 'game-storage',
    }
  )
) 