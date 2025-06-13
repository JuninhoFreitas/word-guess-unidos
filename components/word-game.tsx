"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { animate } from "animejs";
import { useSound } from "use-sound";
import confetti from "canvas-confetti";
import { useGameStore } from "@/app/store/gameStore";

interface WordGameProps {
  sentence: string;
  wordCount: number;
  wordList: string[];
}

export default function WordGame({
  sentence,
  wordCount,
  wordList,
}: WordGameProps) {
  const { sentenceWordProbability } = useGameStore();
  const [gameWords, setGameWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(true);
  const [result, setResult] = useState<"correct" | "incorrect" | "victory" | null>(null);
  const [intervalSpeed, setIntervalSpeed] = useState(1000); // 1 second default
  const [correctlyGuessedWords, setCorrectlyGuessedWords] = useState<Set<string>>(new Set());
  const wordBlockRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sound effects
  const [playTick] = useSound("/sounds/tick.mp3", { volume: 0.5 });
  const [playCorrect] = useSound("/sounds/correct.mp3", { volume: 0.7 });
  const [playIncorrect] = useSound("/sounds/incorrect.mp3", { volume: 0.7 });
  const [playButton] = useSound("/sounds/button-click.mp3", { volume: 0.5 });

  // Generate game words
  useEffect(() => {
    // Create a mix of words from the sentence and the provided word list
    const sentenceWords = sentence
      .toLowerCase()
      .replace(/[.,!?;:]/g, "")
      .split(" ");
    const uniqueSentenceWords = [...new Set(sentenceWords)];

    // Ensure we have enough words
    const allAvailableWords = [...wordList];

    // Generate the game words
    const generatedWords: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      // Use the probability from settings to pick a word from the sentence
      if (Math.random() < sentenceWordProbability && uniqueSentenceWords.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * uniqueSentenceWords.length
        );
        generatedWords.push(uniqueSentenceWords[randomIndex]);
      } else {
        const randomIndex = Math.floor(
          Math.random() * allAvailableWords.length
        );
        generatedWords.push(allAvailableWords[randomIndex]);
      }
    }

    setGameWords(generatedWords);
  }, [sentence, wordCount, wordList, sentenceWordProbability]);

  // Word rotation logic
  useEffect(() => {
    if (isRotating && gameWords.length > 0 && result !== "victory") {
      intervalRef.current = setInterval(() => {
        setCurrentWordIndex((prevIndex) => {
          // Safety check to ensure we don't go out of bounds
          if (gameWords.length === 0) return 0;
          const nextIndex = (prevIndex + 1) % gameWords.length;
          playTick();
          animateWordChange();
          return nextIndex;
        });
      }, intervalSpeed);
    }
    else {
      checkForVictory();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRotating, gameWords, intervalSpeed, playTick, result]);

  //every 1s check for the victory
  useEffect(() => {
    if (isRotating) {
      checkForVictory();
    }
  }, [isRotating]);

  // Animation for word change
  const animateWordChange = () => {
    if (wordBlockRef.current) {
      animate(wordBlockRef.current, {
        scale: [1, 1.1, 1],
        rotate: [0, 2, -2, 0],
        duration: intervalSpeed * 0.5,
        easing: "easeInOutQuad",
      });
    }
  };

  // Check if all words from the sentence have been found
  const checkForVictory = () => {
    const sentenceWords = sentence
      .toLowerCase()
      .replace(/[.,!?;:]/g, "")
      .split(" ");
    const uniqueSentenceWords = new Set(sentenceWords);
    
    // Check if all words from the sentence are in the correctly guessed set
    const allWordsFound = Array.from(uniqueSentenceWords).every(word => 
      correctlyGuessedWords.has(word)
    );

    if (allWordsFound) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setResult("victory");
      setIsRotating(false);
      // Extra celebration for victory
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
      });
      return true;
    }
    return false;
  };

  // Check if the word is in the sentence
  const checkWord = () => {
    playButton();
    setIsRotating(false);

    // Safety check for gameWords and currentWordIndex
    if (!gameWords.length || currentWordIndex >= gameWords.length) {
      return;
    }

    const currentWord = gameWords[currentWordIndex];
    if (!currentWord) {
      return;
    }

    const isInSentence = sentence
      .toLowerCase()
      .includes(currentWord.toLowerCase());

    setResult(isInSentence ? "correct" : "incorrect");

    if (isInSentence) {
      playCorrect();
      // Add word to correctly guessed set
      setCorrectlyGuessedWords(prev => new Set([...prev, currentWord.toLowerCase()]));
      
      // Remove the correctly guessed word from the rotation
      setGameWords(prevWords => prevWords.filter(word => word.toLowerCase() !== currentWord.toLowerCase()));
      
      // Adjust current index if needed
      setCurrentWordIndex(prevIndex => Math.min(prevIndex, gameWords.length - 2));

      // Celebration animation
      if (wordBlockRef.current) {
        animate(wordBlockRef.current, {
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0],
          backgroundColor: ["#4ade80", "#22c55e", "#4ade80"],
          duration: 1000,
          easing: "easeInOutQuad",
        });
      }

      // Launch confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Check for victory and only continue if not victorious
      if (!checkForVictory()) {
        setTimeout(() => {
          setIsRotating(true);
          setResult(null);
          // Reset block color to yellow
          if (wordBlockRef.current) {
            animate(wordBlockRef.current, {
              backgroundColor: ["#facc15", "#facc15"],
              duration: 0,
            });
          }
        }, 2000);
      }
    } else {
      playIncorrect();
      // Incorrect animation
      if (wordBlockRef.current) {
        animate(wordBlockRef.current, {
          translateX: [0, -10, 10, -10, 10, 0],
          backgroundColor: ["#f87171", "#ef4444", "#f87171"],
          duration: 500,
          easing: "easeInOutQuad",
        });
      }
      // Continue rotation after a short delay
      setTimeout(() => {
        setIsRotating(true);
        setResult(null);
        // Reset block color to yellow
        if (wordBlockRef.current) {
          animate(wordBlockRef.current, {
            backgroundColor: ["#facc15", "#facc15"],
            duration: 0,
          });
        }
      }, 1500);
    }
  };

  // Reset the game
  const resetGame = () => {
    playButton();
    setIsRotating(true);
    setResult(null);
    setCorrectlyGuessedWords(new Set());
    // Shuffle the words for more variety
    setGameWords((prevWords) => [...prevWords].sort(() => Math.random() - 0.5));
  };

  // Handle interval speed change
  const handleSpeedChange = (value: number[]) => {
    // Convert to milliseconds (500ms to 2000ms range)
    const newSpeed = 2500 - value[0] * 20;
    setIntervalSpeed(newSpeed);

    // Restart interval with new speed
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (isRotating) {
      intervalRef.current = setInterval(() => {
        setCurrentWordIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % gameWords.length;
          playTick();
          animateWordChange();
          return nextIndex;
        });
      }, newSpeed);
    }
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault(); // Prevent page scroll
        // Find and click the currently visible button
        const button = document.querySelector('button');
        if (button) {
          button.click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []); // No dependencies needed since we're just clicking the button

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      {/* <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">
          Find words from the sentence:
        </h2>
        <p className="text-lg bg-purple-100 p-4 rounded-lg border-2 border-purple-300">
          {sentence}
        </p>
      </div> */}

      <div className="flex flex-col items-center justify-center space-y-8">
        {/* Word display block */}
        <div
          ref={wordBlockRef}
          className={`w-64 h-64 flex items-center justify-center rounded-2xl text-4xl font-bold shadow-lg transition-all ${
            result === "correct"
              ? "bg-green-400 text-white"
              : result === "incorrect"
              ? "bg-red-400 text-white"
              : result === "victory"
              ? "bg-yellow-400 text-white"
              : "bg-yellow-300 text-purple-800"
          }`}
        >
          {gameWords.length > 0 ? gameWords[currentWordIndex] : "Loading..."}
        </div>

        {/* Result display */}
        {result && (
          <div
            className={`text-2xl font-bold ${
              result === "correct" 
                ? "text-green-600" 
                : result === "incorrect"
                ? "text-red-600"
                : "text-yellow-600"
            }`}
          >
            {result === "correct" 
              ? "Correto! 🎉" 
              : result === "incorrect"
              ? "Incorreto! 🤔"
              : "Você encontrou todas as palavras! 🎊"}
          </div>
        )}

        {/* Game controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center w-full">
          {isRotating ? (
            <Button
              onClick={checkWord}
              className="bg-red-500 hover:bg-red-600 text-white text-2xl py-8 px-12 rounded-full shadow-lg transform transition hover:scale-105"
            >
              Parar (Espaço)
            </Button>
          ) : result === "victory" ? (
            <Button
              onClick={resetGame}
              className="bg-yellow-500 hover:bg-yellow-600 text-white text-xl py-6 px-10 rounded-full shadow-lg transform transition hover:scale-105"
            >
              Jogar novamente (Espaço)
            </Button>
          ) : (
            <Button
              onClick={() => setIsRotating(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white text-xl py-6 px-10 rounded-full shadow-lg transform transition hover:scale-105"
            >
              Continuar (Espaço)
            </Button>
          )}
        </div>

        {/* Speed control */}
        <div className="w-full max-w-md">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Rápido</span>
            <span className="text-sm font-medium">Lento</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg">🐇</span>
            <Slider
              defaultValue={[75]}
              max={100}
              step={1}
              onValueChange={handleSpeedChange}
              className="flex-1"
            />
            <span className="text-lg">🐢</span>
          </div>
          <p className="text-center text-sm mt-2">
            A palavra muda a cada {(intervalSpeed / 1000).toFixed(1)} segundos
          </p>
        </div>

        {/* Progress display */}
        <div className="w-full max-w-md">
          <div className="text-center text-lg font-medium text-purple-700 mb-2">
            Palavras encontradas: {correctlyGuessedWords.size}
          </div>
          {correctlyGuessedWords.size > 0 && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="text-sm font-medium text-purple-700 mb-2">Palavras encontradas:</h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(correctlyGuessedWords).map((word, index) => (
                  <span
                    key={index}
                    className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
