'use client'

import { useGameStore } from '../store/gameStore'
import { useState } from 'react'
import Link from 'next/link'
import { Slider } from "@/components/ui/slider"

export default function Settings() {
  const { sentence, wordList, sentenceWordProbability, setSentence, setWordList, setSentenceWordProbability } = useGameStore()
  const [tempSentence, setTempSentence] = useState(sentence)
  const [tempWordList, setTempWordList] = useState(wordList.join('\n'))
  const [tempProbability, setTempProbability] = useState(sentenceWordProbability)

  const handleSave = () => {
    setSentence(tempSentence)
    setWordList(tempWordList.split('\n').filter(word => word.trim() !== ''))
    setSentenceWordProbability(tempProbability)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-400 via-green-100 to-white-500 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-8 drop-shadow-lg">
          Configurações
        </h1>
        
        <div className="bg-white rounded-lg shadow-xl p-6 space-y-6">
          <div>
            <label htmlFor="sentence" className="block text-lg font-medium text-gray-700 mb-2">
              Versículo
            </label>
            <textarea
              id="sentence"
              value={tempSentence}
              onChange={(e) => setTempSentence(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="wordList" className="block text-lg font-medium text-gray-700 mb-2">
              Lista de Palavras (uma palavra por linha)
            </label>
            <textarea
              id="wordList"
              value={tempWordList}
              onChange={(e) => setTempWordList(e.target.value)}
              className="w-full h-64 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Probabilidade de palavras do versículo: {(tempProbability * 100).toFixed(0)}%
            </label>
            <div className="flex items-center gap-4">
              <span className="text-lg">🎲</span>
              <Slider
                value={[tempProbability * 100]}
                max={100}
                step={1}
                onValueChange={(value) => setTempProbability(value[0] / 100)}
                className="flex-1"
              />
              <span className="text-lg">📖</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Ajuste a probabilidade de aparecerem palavras do versículo versus palavras aleatórias
            </p>
          </div>

          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Voltar para o Jogo
            </Link>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    </main>
  )
} 