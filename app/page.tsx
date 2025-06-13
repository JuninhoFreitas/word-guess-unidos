'use client'

import WordGame from "@/components/word-game"
import { useGameStore } from "./store/gameStore"
import Link from "next/link"

export default function Home() {
  const { sentence, wordList } = useGameStore()

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-400 via-green-100 to-white-500 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            Encontre o Versículo do Clube Bíblico!
          </h1>
          <Link
            href="/settings"
            className="px-4 py-2 bg-white text-purple-600 rounded-md hover:bg-gray-100 transition-colors"
          >
            Configurações
          </Link>
        </div>
        <WordGame
          sentence={sentence}
          wordCount={100}
          wordList={wordList}
        />
      </div>
    </main>
  )
}
