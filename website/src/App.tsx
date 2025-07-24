import { useState } from "react";
import "./App.css"
import { getRandomQuestion } from "./utils/question";
import type { Question } from "./utils/question";
import { useEffect } from 'react';

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [hasAudioQuestion, setHasAudioQuestion] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInSuspense, setIsInSuspense] = useState(false);
  const [flashingButton, setFlashingButton] = useState<string | null>(null);
  const [hasWon, setHasWon] = useState(false);
  const [winAudioContext, setWinAudioContext] = useState<AudioContext | null>(null);
  const [fiftyUsed, setFiftyUsed] = useState(false);
  const [fiftyDisabledAnswers, setFiftyDisabledAnswers] = useState<string[]>([]);
  const [audienceUsed, setAudienceUsed] = useState(false);
  const [phoneUsed, setPhoneUsed] = useState(false);
  const [audienceDistribution, setAudienceDistribution] = useState<Record<string, number> | null>(null);
  const [phoneDistribution, setPhoneDistribution] = useState<Record<string, number> | null>(null);
  const [isPhoneThinking, setIsPhoneThinking] = useState(false);
  const [doubleAnswerUsed, setDoubleAnswerUsed] = useState(false);
  const [doubleAnswerActive, setDoubleAnswerActive] = useState(false);
  const [doubleAnswerFirstTried, setDoubleAnswerFirstTried] = useState<string | null>(null);

  // Sound effects using Web Audio API
  const createAudioContext = () => {
    return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  };

  const playTensionSound = () => {
    try {
      const audioContext = createAudioContext();
      
      // Create an extremely dramatic tension sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Use sawtooth for maximum intensity
      oscillator.type = 'sawtooth';
      
      // Extreme frequency building - start very low, build dramatically
      oscillator.frequency.setValueAtTime(20, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.8);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 1.5);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 2.2);
      oscillator.frequency.exponentialRampToValueAtTime(350, audioContext.currentTime + 3.0);
      oscillator.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 3.8);
      oscillator.frequency.exponentialRampToValueAtTime(700, audioContext.currentTime + 4.5);
      
      // Add a second oscillator for more power
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();
      const filter2 = audioContext.createBiquadFilter();
      
      oscillator2.connect(filter2);
      filter2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      
      oscillator2.type = 'square';
      oscillator2.frequency.setValueAtTime(10, audioContext.currentTime);
      oscillator2.frequency.exponentialRampToValueAtTime(25, audioContext.currentTime + 0.8);
      oscillator2.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 1.5);
      oscillator2.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 2.2);
      oscillator2.frequency.exponentialRampToValueAtTime(175, audioContext.currentTime + 3.0);
      oscillator2.frequency.exponentialRampToValueAtTime(250, audioContext.currentTime + 3.8);
      oscillator2.frequency.exponentialRampToValueAtTime(350, audioContext.currentTime + 4.5);
      
      // Add a third oscillator for maximum intensity
      const oscillator3 = audioContext.createOscillator();
      const gainNode3 = audioContext.createGain();
      const filter3 = audioContext.createBiquadFilter();
      
      oscillator3.connect(filter3);
      filter3.connect(gainNode3);
      gainNode3.connect(audioContext.destination);
      
      oscillator3.type = 'sawtooth';
      oscillator3.frequency.setValueAtTime(30, audioContext.currentTime);
      oscillator3.frequency.exponentialRampToValueAtTime(75, audioContext.currentTime + 0.8);
      oscillator3.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 1.5);
      oscillator3.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 2.2);
      oscillator3.frequency.exponentialRampToValueAtTime(525, audioContext.currentTime + 3.0);
      oscillator3.frequency.exponentialRampToValueAtTime(750, audioContext.currentTime + 3.8);
      oscillator3.frequency.exponentialRampToValueAtTime(1050, audioContext.currentTime + 4.5);
      
      // Add a fourth oscillator for ultimate drama
      const oscillator4 = audioContext.createOscillator();
      const gainNode4 = audioContext.createGain();
      const filter4 = audioContext.createBiquadFilter();
      
      oscillator4.connect(filter4);
      filter4.connect(gainNode4);
      gainNode4.connect(audioContext.destination);
      
      oscillator4.type = 'triangle';
      oscillator4.frequency.setValueAtTime(40, audioContext.currentTime);
      oscillator4.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.8);
      oscillator4.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 1.5);
      oscillator4.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 2.2);
      oscillator4.frequency.exponentialRampToValueAtTime(700, audioContext.currentTime + 3.0);
      oscillator4.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 3.8);
      oscillator4.frequency.exponentialRampToValueAtTime(1400, audioContext.currentTime + 4.5);
      
      // Dramatic low-pass filters that open up intensely
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(80, audioContext.currentTime);
      filter.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.8);
      filter.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 1.5);
      filter.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 2.2);
      filter.frequency.exponentialRampToValueAtTime(2000, audioContext.currentTime + 3.0);
      filter.frequency.exponentialRampToValueAtTime(3000, audioContext.currentTime + 3.8);
      filter.frequency.exponentialRampToValueAtTime(4000, audioContext.currentTime + 4.5);
      
      filter2.type = 'lowpass';
      filter2.frequency.setValueAtTime(40, audioContext.currentTime);
      filter2.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.8);
      filter2.frequency.exponentialRampToValueAtTime(250, audioContext.currentTime + 1.5);
      filter2.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 2.2);
      filter2.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 3.0);
      filter2.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 3.8);
      filter2.frequency.exponentialRampToValueAtTime(2000, audioContext.currentTime + 4.5);
      
      filter3.type = 'lowpass';
      filter3.frequency.setValueAtTime(120, audioContext.currentTime);
      filter3.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.8);
      filter3.frequency.exponentialRampToValueAtTime(750, audioContext.currentTime + 1.5);
      filter3.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 2.2);
      filter3.frequency.exponentialRampToValueAtTime(3000, audioContext.currentTime + 3.0);
      filter3.frequency.exponentialRampToValueAtTime(4500, audioContext.currentTime + 3.8);
      filter3.frequency.exponentialRampToValueAtTime(6000, audioContext.currentTime + 4.5);
      
      filter4.type = 'lowpass';
      filter4.frequency.setValueAtTime(160, audioContext.currentTime);
      filter4.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.8);
      filter4.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 1.5);
      filter4.frequency.exponentialRampToValueAtTime(2000, audioContext.currentTime + 2.2);
      filter4.frequency.exponentialRampToValueAtTime(4000, audioContext.currentTime + 3.0);
      filter4.frequency.exponentialRampToValueAtTime(6000, audioContext.currentTime + 3.8);
      filter4.frequency.exponentialRampToValueAtTime(8000, audioContext.currentTime + 4.5);
      
      // Quieter volume building with maximum drama
      gainNode.gain.setValueAtTime(0.001, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.005, audioContext.currentTime + 0.3);
      gainNode.gain.linearRampToValueAtTime(0.015, audioContext.currentTime + 0.6);
      gainNode.gain.linearRampToValueAtTime(0.04, audioContext.currentTime + 0.9);
      gainNode.gain.linearRampToValueAtTime(0.075, audioContext.currentTime + 1.2);
      gainNode.gain.linearRampToValueAtTime(0.125, audioContext.currentTime + 1.5);
      gainNode.gain.linearRampToValueAtTime(0.20, audioContext.currentTime + 1.8);
      gainNode.gain.linearRampToValueAtTime(0.30, audioContext.currentTime + 2.1);
      gainNode.gain.linearRampToValueAtTime(0.40, audioContext.currentTime + 2.4);
      gainNode.gain.linearRampToValueAtTime(0.475, audioContext.currentTime + 2.7);
      gainNode.gain.linearRampToValueAtTime(0.50, audioContext.currentTime + 3.0);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 5.0);
      
      gainNode2.gain.setValueAtTime(0.0005, audioContext.currentTime);
      gainNode2.gain.linearRampToValueAtTime(0.004, audioContext.currentTime + 0.3);
      gainNode2.gain.linearRampToValueAtTime(0.0125, audioContext.currentTime + 0.6);
      gainNode2.gain.linearRampToValueAtTime(0.03, audioContext.currentTime + 0.9);
      gainNode2.gain.linearRampToValueAtTime(0.06, audioContext.currentTime + 1.2);
      gainNode2.gain.linearRampToValueAtTime(0.11, audioContext.currentTime + 1.5);
      gainNode2.gain.linearRampToValueAtTime(0.175, audioContext.currentTime + 1.8);
      gainNode2.gain.linearRampToValueAtTime(0.275, audioContext.currentTime + 2.1);
      gainNode2.gain.linearRampToValueAtTime(0.375, audioContext.currentTime + 2.4);
      gainNode2.gain.linearRampToValueAtTime(0.45, audioContext.currentTime + 2.7);
      gainNode2.gain.linearRampToValueAtTime(0.475, audioContext.currentTime + 3.0);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 5.0);
      
      gainNode3.gain.setValueAtTime(0.00075, audioContext.currentTime);
      gainNode3.gain.linearRampToValueAtTime(0.006, audioContext.currentTime + 0.3);
      gainNode3.gain.linearRampToValueAtTime(0.0175, audioContext.currentTime + 0.6);
      gainNode3.gain.linearRampToValueAtTime(0.04, audioContext.currentTime + 0.9);
      gainNode3.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 1.2);
      gainNode3.gain.linearRampToValueAtTime(0.14, audioContext.currentTime + 1.5);
      gainNode3.gain.linearRampToValueAtTime(0.225, audioContext.currentTime + 1.8);
      gainNode3.gain.linearRampToValueAtTime(0.325, audioContext.currentTime + 2.1);
      gainNode3.gain.linearRampToValueAtTime(0.425, audioContext.currentTime + 2.4);
      gainNode3.gain.linearRampToValueAtTime(0.485, audioContext.currentTime + 2.7);
      gainNode3.gain.linearRampToValueAtTime(0.50, audioContext.currentTime + 3.0);
      gainNode3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 5.0);
      
      gainNode4.gain.setValueAtTime(0.001, audioContext.currentTime);
      gainNode4.gain.linearRampToValueAtTime(0.0075, audioContext.currentTime + 0.3);
      gainNode4.gain.linearRampToValueAtTime(0.02, audioContext.currentTime + 0.6);
      gainNode4.gain.linearRampToValueAtTime(0.045, audioContext.currentTime + 0.9);
      gainNode4.gain.linearRampToValueAtTime(0.09, audioContext.currentTime + 1.2);
      gainNode4.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 1.5);
      gainNode4.gain.linearRampToValueAtTime(0.24, audioContext.currentTime + 1.8);
      gainNode4.gain.linearRampToValueAtTime(0.34, audioContext.currentTime + 2.1);
      gainNode4.gain.linearRampToValueAtTime(0.44, audioContext.currentTime + 2.4);
      gainNode4.gain.linearRampToValueAtTime(0.49, audioContext.currentTime + 2.7);
      gainNode4.gain.linearRampToValueAtTime(0.50, audioContext.currentTime + 3.0);
      gainNode4.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 5.0);
      
      // Start all oscillators
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 5.0);
      
      oscillator2.start(audioContext.currentTime);
      oscillator2.stop(audioContext.currentTime + 5.0);
      
      oscillator3.start(audioContext.currentTime);
      oscillator3.stop(audioContext.currentTime + 5.0);
      
      oscillator4.start(audioContext.currentTime);
      oscillator4.stop(audioContext.currentTime + 5.0);
      
      // Return the audio context for potential stopping
      return audioContext;
      
    } catch {
      console.log('Audio not supported');
      return null;
    }
  };

  const playCorrectSound = () => {
    try {
      const audioContext = createAudioContext();
      
      // Create a hype, exciting correct sound with multiple oscillators
      const oscillator1 = audioContext.createOscillator();
      const gainNode1 = audioContext.createGain();
      
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();
      
      const oscillator3 = audioContext.createOscillator();
      const gainNode3 = audioContext.createGain();
      
      oscillator1.connect(gainNode1);
      oscillator2.connect(gainNode2);
      oscillator3.connect(gainNode3);
      
      gainNode1.connect(audioContext.destination);
      gainNode2.connect(audioContext.destination);
      gainNode3.connect(audioContext.destination);
      
      // Use different wave types for richness
      oscillator1.type = 'sine';
      oscillator2.type = 'square';
      oscillator3.type = 'triangle';
      
      // Create an exciting ascending chord progression
      oscillator1.frequency.setValueAtTime(523, audioContext.currentTime); // C
      oscillator1.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E
      oscillator1.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G
      oscillator1.frequency.setValueAtTime(1047, audioContext.currentTime + 0.3); // C (higher)
      
      oscillator2.frequency.setValueAtTime(659, audioContext.currentTime); // E
      oscillator2.frequency.setValueAtTime(784, audioContext.currentTime + 0.1); // G
      oscillator2.frequency.setValueAtTime(1047, audioContext.currentTime + 0.2); // C (higher)
      oscillator2.frequency.setValueAtTime(1319, audioContext.currentTime + 0.3); // E (higher)
      
      oscillator3.frequency.setValueAtTime(784, audioContext.currentTime); // G
      oscillator3.frequency.setValueAtTime(1047, audioContext.currentTime + 0.1); // C (higher)
      oscillator3.frequency.setValueAtTime(1319, audioContext.currentTime + 0.2); // E (higher)
      oscillator3.frequency.setValueAtTime(1568, audioContext.currentTime + 0.3); // G (higher)
      
      // Exciting volume envelope with punch
      gainNode1.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode1.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
      gainNode1.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
      gainNode1.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.15);
      gainNode1.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.2);
      gainNode1.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.25);
      gainNode1.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.3);
      gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode2.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.05);
      gainNode2.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.1);
      gainNode2.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.15);
      gainNode2.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.2);
      gainNode2.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.25);
      gainNode2.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.3);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      gainNode3.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode3.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
      gainNode3.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
      gainNode3.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.15);
      gainNode3.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.2);
      gainNode3.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.25);
      gainNode3.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.3);
      gainNode3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      // Start all oscillators
      oscillator1.start(audioContext.currentTime);
      oscillator1.stop(audioContext.currentTime + 0.4);
      
      oscillator2.start(audioContext.currentTime);
      oscillator2.stop(audioContext.currentTime + 0.4);
      
      oscillator3.start(audioContext.currentTime);
      oscillator3.stop(audioContext.currentTime + 0.4);
      
    } catch {
      console.log('Audio not supported');
    }
  };

  const playIncorrectSound = () => {
    try {
      const audioContext = createAudioContext();
      
      // Create a classic "bad buzzer beep" sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Use square wave for that classic buzzer sound
      oscillator.type = 'square';
      
      // Classic buzzer beep - starts at a harsh frequency
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.15);
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.25);
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.3);
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.4);
      
      // Sharp attack, sustained beep, quick decay
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + 0.25);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
      
    } catch {
      console.log('Audio not supported');
    }
  };

  const playWinSound = () => {
    try {
      const audioContext = createAudioContext();
      
      // Create a celebratory victory fanfare
      const oscillator1 = audioContext.createOscillator();
      const gainNode1 = audioContext.createGain();
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();
      const oscillator3 = audioContext.createOscillator();
      const gainNode3 = audioContext.createGain();
      
      oscillator1.connect(gainNode1);
      oscillator2.connect(gainNode2);
      oscillator3.connect(gainNode3);
      
      gainNode1.connect(audioContext.destination);
      gainNode2.connect(audioContext.destination);
      gainNode3.connect(audioContext.destination);
      
      // Use different wave types for richness
      oscillator1.type = 'sine';
      oscillator2.type = 'square';
      oscillator3.type = 'triangle';
      
      // Celebratory chord progression - C major to G major to C major
      const chord1 = [523, 659, 784]; // C major (C, E, G)
      const chord2 = [784, 988, 1175]; // G major (G, B, D)
      const chord3 = [1047, 1319, 1568]; // C major higher octave (C, E, G)
      const chord4 = [1568, 1976, 2349]; // G major higher octave (G, B, D)
      const chord5 = [2093, 2637, 3136]; // C major highest octave (C, E, G)
      
      // Play chord 1
      chord1.forEach((freq, index) => {
        oscillator1.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.1);
        gainNode1.gain.setValueAtTime(0, audioContext.currentTime + index * 0.1);
        gainNode1.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + index * 0.1 + 0.05);
        gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.1 + 0.3);
      });
      
      // Play chord 2
      chord2.forEach((freq, index) => {
        oscillator2.frequency.setValueAtTime(freq, audioContext.currentTime + 0.5 + index * 0.1);
        gainNode2.gain.setValueAtTime(0, audioContext.currentTime + 0.5 + index * 0.1);
        gainNode2.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.5 + index * 0.1 + 0.05);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5 + index * 0.1 + 0.3);
      });
      
      // Play chord 3
      chord3.forEach((freq, index) => {
        oscillator3.frequency.setValueAtTime(freq, audioContext.currentTime + 1.0 + index * 0.1);
        gainNode3.gain.setValueAtTime(0, audioContext.currentTime + 1.0 + index * 0.1);
        gainNode3.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 1.0 + index * 0.1 + 0.05);
        gainNode3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.0 + index * 0.1 + 0.3);
      });
      
      // Play chord 4 (higher)
      chord4.forEach((freq, index) => {
        oscillator1.frequency.setValueAtTime(freq, audioContext.currentTime + 1.5 + index * 0.1);
        gainNode1.gain.setValueAtTime(0, audioContext.currentTime + 1.5 + index * 0.1);
        gainNode1.gain.linearRampToValueAtTime(0.35, audioContext.currentTime + 1.5 + index * 0.1 + 0.05);
        gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5 + index * 0.1 + 0.3);
      });
      
      // Play chord 5 (highest)
      chord5.forEach((freq, index) => {
        oscillator2.frequency.setValueAtTime(freq, audioContext.currentTime + 2.0 + index * 0.1);
        gainNode2.gain.setValueAtTime(0, audioContext.currentTime + 2.0 + index * 0.1);
        gainNode2.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 2.0 + index * 0.1 + 0.05);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2.0 + index * 0.1 + 0.3);
      });
      
      // Start all oscillators
      oscillator1.start(audioContext.currentTime);
      oscillator1.stop(audioContext.currentTime + 2.5);
      
      oscillator2.start(audioContext.currentTime);
      oscillator2.stop(audioContext.currentTime + 2.5);
      
      oscillator3.start(audioContext.currentTime);
      oscillator3.stop(audioContext.currentTime + 2.5);
      
      // Return the audio context for potential stopping
      return audioContext;
      
    } catch {
      console.log('Audio not supported');
      return null;
    }
  };

  // DEV TEST MODE: Set to true to auto-answer all questions correctly with random joker uses
  const DEV_TEST_MODE = false;
  let devTestRunning = false;

  const startGame = async () => {
    try {
      // Stop win sound if it's playing
      if (winAudioContext) {
        winAudioContext.close();
        setWinAudioContext(null);
      }
      // 1. soruda nth=1
      const question = await getRandomQuestion({nth: 1});
      setCurrentQuestion(question);
      setGameStarted(true);
      setSelectedAnswer(null);
      setShowResult(false);
      setCurrentQuestionNumber(1);
      setHasAudioQuestion(false);
      setHasWon(false);
      setFiftyUsed(false);
      setFiftyDisabledAnswers([]);
      setAudienceUsed(false);
      setPhoneUsed(false);
      setAudienceDistribution(null);
      setPhoneDistribution(null);
      setDoubleAnswerUsed(false);
      setDoubleAnswerActive(false);
      setDoubleAnswerFirstTried(null);

      if (DEV_TEST_MODE) {
        console.log("DEV TEST MODE: Running dev test.");
        // setTimeout(runDevTest, 800); // This line is removed as per the edit hint
      }
    } catch {
      console.error('Failed to fetch question');
    }
  };

  // DEV TEST: Auto-play logic
  const runDevTest = async () => {
    if (!currentQuestion || hasWon || devTestRunning) return;
    devTestRunning = true;
    // Randomly use jokers if available
    const jokers = [];
    if (!audienceUsed) jokers.push('audience');
    if (!phoneUsed) jokers.push('phone');
    if (!fiftyUsed) jokers.push('fifty');
    if (!doubleAnswerUsed && currentQuestionNumber >= 8) jokers.push('double');
    // Randomly use 0-2 jokers per question
    const useCount = Math.floor(Math.random() * 3);
    const shuffled = jokers.sort(() => Math.random() - 0.5);
    for (let i = 0; i < useCount; i++) {
      if (shuffled[i] === 'audience') handleAudience();
      if (shuffled[i] === 'phone') handlePhone();
      if (shuffled[i] === 'fifty') handleFiftyFifty();
      if (shuffled[i] === 'double') handleDoubleAnswer();
    }
    // Wait a bit for joker effects
    await new Promise(res => setTimeout(res, 500));
    // Find the correct answer key
    const correctKey = Object.keys(currentQuestion.choices).find(
      k => k.toUpperCase() === currentQuestion.answer.toUpperCase()
    );
    if (!correctKey) { devTestRunning = false; return; }
    // If double answer is active, answer incorrectly first half the time
    if (doubleAnswerActive && Math.random() < 0.5) {
      const wrongKey = Object.keys(currentQuestion.choices).find(
        k => k.toUpperCase() !== currentQuestion.answer.toUpperCase() &&
        (!fiftyUsed || !fiftyDisabledAnswers.includes(k.toUpperCase()))
      );
      if (wrongKey) {
        await handleAnswerSelect(currentQuestion.choices[wrongKey], wrongKey);
        await new Promise(res => setTimeout(res, 500));
      }
    }
    // Always answer correctly
    await handleAnswerSelect(currentQuestion.choices[correctKey], correctKey);
    await new Promise(res => setTimeout(res, 1000));
    // If not finished, go to next question
    if (!hasWon && currentQuestionNumber < 13) {
      await getNextQuestion();
    }
    devTestRunning = false;
  };

  // DEV TEST: useEffect to trigger automation on question change
  useEffect(() => {
    if (DEV_TEST_MODE && currentQuestion && !hasWon) {
      runDevTest();
    }
    // eslint-disable-next-line
  }, [currentQuestionNumber, currentQuestion, hasWon]);

  const getNextQuestion = async () => {
    try {
      setIsLoading(true);
      const nextNumber = currentQuestionNumber + 1;
      let nth;
      if (nextNumber === 11) nth = 10;
      else if (nextNumber === 12) nth = 11;
      else if (nextNumber === 13) nth = 12;
      else nth = nextNumber;
      let question;
      // If we already had an audio question, exclude audio questions
      if (hasAudioQuestion) {
        question = await getRandomQuestion({nth, audio: false});
      }
      // If we're at question 7 and haven't had an audio question yet, force one
      else if (nextNumber === 7) {
        question = await getRandomQuestion({nth, audio: true});
        setHasAudioQuestion(true);
      }
      // Otherwise, allow random chance for audio question (but not guaranteed)
      else {
        question = await getRandomQuestion({nth});
        // Check if this question has audio and mark it
        if (question.audio) {
          setHasAudioQuestion(true);
        }
      }
      setCurrentQuestion(question);
      setCurrentQuestionNumber(nextNumber);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsLoading(false);
      setFiftyDisabledAnswers([]);
      setAudienceDistribution(null);
      setPhoneDistribution(null);
      setDoubleAnswerActive(false);
      setDoubleAnswerFirstTried(null);
    } catch {
      console.error('Failed to fetch next question');
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = async (_answer: string, answerKey: string) => {
    // Çift cevap jokeri aktifse ve ilk deneme ise
    if (doubleAnswerActive && !doubleAnswerFirstTried && !showResult) {
      setDoubleAnswerFirstTried(answerKey.toUpperCase());
      setSelectedAnswer(answerKey.toUpperCase());
      setIsInSuspense(true);
      const audioContext = playTensionSound();
      const getSuspenseDelay = (questionNumber: number): number => {
        if (questionNumber <= 8) {
          return Math.min(questionNumber, 6);
        }
        return 6;
      };
      const delay = getSuspenseDelay(currentQuestionNumber);
      const flashPattern = ['A', 'B', 'C', 'D', 'C', 'B', 'A', 'B', 'C', 'D'];
      let flashIndex = 0;
      const flashInterval = setInterval(() => {
        setFlashingButton(flashPattern[flashIndex]);
        flashIndex = (flashIndex + 1) % flashPattern.length;
      }, 275);
      await new Promise(resolve => setTimeout(resolve, delay * 1000));
      if (audioContext) audioContext.close();
      clearInterval(flashInterval);
      setFlashingButton(null);
      setIsInSuspense(false);
      // Eğer doğruysa normal akış
      const isCorrect = answerKey.toUpperCase() === currentQuestion?.answer.toUpperCase();
      if (isCorrect) {
        setShowResult(true);
        playCorrectSound();
        setDoubleAnswerActive(false);
        setDoubleAnswerFirstTried(null);
        // Win check
        if (currentQuestionNumber === 13) {
          setHasWon(true);
          const winAudio = playWinSound();
          setWinAudioContext(winAudio);
        }
      } else {
        // Yanlışsa ikinci hak ver
        setSelectedAnswer(null);
        playSoftIncorrectSound();
        // UI'da "Bir hakkın daha var" gösterebiliriz
      }
      return;
    }
    // Çift cevap jokeri aktifse ve ikinci deneme ise
    if (doubleAnswerActive && doubleAnswerFirstTried && !showResult) {
      // Aynı cevabı tekrar seçemez
      if (answerKey.toUpperCase() === doubleAnswerFirstTried) return;
      setSelectedAnswer(answerKey.toUpperCase());
      setIsInSuspense(true);
      const audioContext = playTensionSound();
      const getSuspenseDelay = (questionNumber: number): number => {
        if (questionNumber <= 8) {
          return Math.min(questionNumber, 6);
        }
        return 6;
      };
      const delay = getSuspenseDelay(currentQuestionNumber);
      const flashPattern = ['A', 'B', 'C', 'D', 'C', 'B', 'A', 'B', 'C', 'D'];
      let flashIndex = 0;
      const flashInterval = setInterval(() => {
        setFlashingButton(flashPattern[flashIndex]);
        flashIndex = (flashIndex + 1) % flashPattern.length;
      }, 275);
      await new Promise(resolve => setTimeout(resolve, delay * 1000));
      if (audioContext) audioContext.close();
      clearInterval(flashInterval);
      setFlashingButton(null);
      setIsInSuspense(false);
      setShowResult(true);
      // Doğruysa veya yanlışsa normal akış
      const isCorrect = answerKey.toUpperCase() === currentQuestion?.answer.toUpperCase();
      if (isCorrect) {
        playCorrectSound();
        // Win check
        if (currentQuestionNumber === 13) {
          setHasWon(true);
          const winAudio = playWinSound();
          setWinAudioContext(winAudio);
        }
      } else {
        playIncorrectSound();
      }
      setDoubleAnswerActive(false);
      setDoubleAnswerFirstTried(null);
      return;
    }
    // Normal akış (joker yoksa)
    setSelectedAnswer(answerKey.toUpperCase());
    setIsInSuspense(true);
    const audioContext = playTensionSound();
    const getSuspenseDelay = (questionNumber: number): number => {
      if (questionNumber <= 8) {
        return Math.min(questionNumber, 6);
      }
      return 6;
    };
    const delay = getSuspenseDelay(currentQuestionNumber);
    const flashPattern = ['A', 'B', 'C', 'D', 'C', 'B', 'A', 'B', 'C', 'D'];
    let flashIndex = 0;
    const flashInterval = setInterval(() => {
      setFlashingButton(flashPattern[flashIndex]);
      flashIndex = (flashIndex + 1) % flashPattern.length;
    }, 275);
    await new Promise(resolve => setTimeout(resolve, delay * 1000));
    if (audioContext) audioContext.close();
    clearInterval(flashInterval);
    setFlashingButton(null);
    setIsInSuspense(false);
    setShowResult(true);
    // Play appropriate sound based on result
    const isCorrect = answerKey.toUpperCase() === currentQuestion?.answer.toUpperCase();
    if (isCorrect) {
      playCorrectSound();
    } else {
      playIncorrectSound();
    }
    // Check if this is a win (13th question correct)
    if (currentQuestionNumber === 13 && isCorrect) {
      setHasWon(true);
      const winAudio = playWinSound();
      setWinAudioContext(winAudio);
    }
  };

  const getAnswerClass = (_answer: string, answerKey: string) => {
    if (fiftyDisabledAnswers.includes(answerKey.toUpperCase())) {
      return 'answer-btn answer-btn-fifty-disabled';
    }
    if (isInSuspense && flashingButton === answerKey.toUpperCase()) {
      return 'answer-btn flashing';
    }
    if (!showResult) {
      // Çift cevap jokeri aktifse ve ilk yanlış cevap verildiyse, o cevabı greyed out yap
      if (doubleAnswerActive && doubleAnswerFirstTried && selectedAnswer === null && answerKey.toUpperCase() === doubleAnswerFirstTried) {
        return 'answer-btn answer-btn-greyed';
      }
      return 'answer-btn';
    }
    if (answerKey.toUpperCase() === currentQuestion?.answer.toUpperCase()) return 'answer-btn correct';
    if (answerKey.toUpperCase() === selectedAnswer?.toUpperCase() && answerKey.toUpperCase() !== currentQuestion?.answer.toUpperCase()) return 'answer-btn incorrect';
    return 'answer-btn';
  };

  const getAnswerLabel = (key: string) => {
    return key.toUpperCase();
  };

  // Turkish "Kim Milyoner Olmak İster?" prize structure
  const getPrizeForQuestion = (questionNumber: number): string => {
    const prizes: Record<number, string> = {
      1: "2.000 ₺",
      2: "5.000 ₺", 
      3: "7.500 ₺",
      4: "10.000 ₺",
      5: "20.000 ₺",
      6: "30.000 ₺",
      7: "50.000 ₺",
      8: "100.000 ₺",
      9: "200.000 ₺",
      10: "300.000 ₺",
      11: "500.000 ₺",
      12: "1.000.000 ₺",
      13: "5.000.000 ₺"
    };
    return prizes[questionNumber] || `${questionNumber * 1000} ₺`;
  };

  // Joker handlers
  const handleAudience = () => {
    if (!audienceUsed && !jokersDisabled && currentQuestion) {
      setAudienceUsed(true);
      // Determine if this is a 'good' (95%) or 'bad' (5%) audience help
      const isGood = Math.random() < 0.95;
      const correctKey = currentQuestion.answer.toUpperCase();
      // If 50:50 is used, only use remaining enabled answers
      const allKeys = fiftyUsed
        ? Object.keys(currentQuestion.choices).map(k => k.toUpperCase()).filter(k => !fiftyDisabledAnswers.includes(k))
        : Object.keys(currentQuestion.choices).map(k => k.toUpperCase());
      const wrongKeys = allKeys.filter(k => k !== correctKey);
      let correctPercent = 0;
      if (isGood) {
        correctPercent = Math.floor(Math.random() * 20) + 66; // 66-85%
      } else {
        correctPercent = Math.floor(Math.random() * 21) + 35; // 35-55%
      }
      let remaining = 100 - correctPercent;
      // Distribute remaining among wrong answers
      const wrongPercents: number[] = [];
      for (let i = 0; i < wrongKeys.length; i++) {
        if (i === wrongKeys.length - 1) {
          wrongPercents.push(remaining);
        } else {
          const max = remaining - (wrongKeys.length - i - 1);
          const val = Math.floor(Math.random() * (max + 1));
          wrongPercents.push(val);
          remaining -= val;
        }
      }
      // Shuffle wrongPercents to randomize which wrong gets which
      for (let i = wrongPercents.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [wrongPercents[i], wrongPercents[j]] = [wrongPercents[j], wrongPercents[i]];
      }
      // Build distribution object
      const distribution: Record<string, number> = {};
      distribution[correctKey] = correctPercent;
      wrongKeys.forEach((k, i) => {
        distribution[k] = wrongPercents[i];
      });
      setAudienceDistribution(distribution);
    }
  };
  const handlePhone = () => {
    if (!phoneUsed && !jokersDisabled && currentQuestion) {
      setPhoneUsed(true);
      setIsPhoneThinking(true);
      setPhoneDistribution(null);
      // 90% good, 10% bad
      const isGood = Math.random() < 0.9;
      const correctKey = currentQuestion.answer.toUpperCase();
      // If 50:50 is used, only use remaining enabled answers
      const allKeys = fiftyUsed
        ? Object.keys(currentQuestion.choices).map(k => k.toUpperCase()).filter(k => !fiftyDisabledAnswers.includes(k))
        : Object.keys(currentQuestion.choices).map(k => k.toUpperCase());
      const wrongKeys = allKeys.filter(k => k !== correctKey);
      let correctPercent = 0;
      if (isGood) {
        correctPercent = Math.floor(Math.random() * 20) + 66; // 66-85%
      } else {
        correctPercent = Math.floor(Math.random() * 21) + 35; // 35-55%
      }
      let remaining = 100 - correctPercent;
      // Distribute remaining among wrong answers
      const wrongPercents: number[] = [];
      for (let i = 0; i < wrongKeys.length; i++) {
        if (i === wrongKeys.length - 1) {
          wrongPercents.push(remaining);
        } else {
          const max = remaining - (wrongKeys.length - i - 1);
          const val = Math.floor(Math.random() * (max + 1));
          wrongPercents.push(val);
          remaining -= val;
        }
      }
      // Shuffle wrongPercents
      for (let i = wrongPercents.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [wrongPercents[i], wrongPercents[j]] = [wrongPercents[j], wrongPercents[i]];
      }
      const distribution: Record<string, number> = {};
      distribution[correctKey] = correctPercent;
      wrongKeys.forEach((k, i) => {
        distribution[k] = wrongPercents[i];
      });
      setPhoneDistribution(distribution);
      setIsPhoneThinking(false);
    }
  };

  // Çift Cevap Jokeri handler
  const handleDoubleAnswer = () => {
    if (!doubleAnswerUsed && currentQuestionNumber >= 8 && !doubleAnswerActive && !jokersDisabled) {
      setDoubleAnswerActive(true);
      setDoubleAnswerUsed(true);
      setDoubleAnswerFirstTried(null);
    }
  };

  // Play a softer version of the incorrect sound
  const playSoftIncorrectSound = () => {
    try {
      const audioContext = createAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.005, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch {
      // ignore
    }
  };

  if (!gameStarted) {
    return (
      <main className="text-center flex flex-column flex-center">
        <div className="title-sequence">
          <h1 className="title">Kim Milyoner Olmak İster?</h1>
          <hr />
        </div>
        <button className="btn btn-primary btn-lg" onClick={startGame}>
          Başla
        </button>
        <p className="subtitle">Yarışmada sorulmuş gerçek 17.000 soru.</p>
      </main>
    );
  }

  const jokersDisabled = showResult || isInSuspense;

  // 50:50 joker handler
  const handleFiftyFifty = () => {
    if (!currentQuestion || fiftyUsed) return;
    const correctKey = currentQuestion.answer.toUpperCase();
    const allKeys = Object.keys(currentQuestion.choices).map(k => k.toUpperCase());
    const wrongKeys = allKeys.filter(k => k !== correctKey);
    // Pick two random wrong answers
    const shuffled = wrongKeys.sort(() => Math.random() - 0.5);
    setFiftyDisabledAnswers(shuffled.slice(0, 2));
    setFiftyUsed(true);
  };

  return (
    <main className="text-center flex flex-column flex-center">
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2 className="loading-text">Soru Yükleniyor...</h2>
        </div>
      ) : (
        <div className="game-container">
          <div className="game-info">
            <span className="question-info">
              {currentQuestionNumber}. Soru
            </span>
            <span className="prize-info">
              {getPrizeForQuestion(currentQuestionNumber)}
            </span>
          </div>
          
          <div className="question-container">
            <h2 className="question-text">{currentQuestion?.question}</h2>
            {currentQuestion?.audio && (
              <div className="audio-container">
                <audio controls className="audio-player">
                  <source src={currentQuestion.audio} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>
        
        <div className="answers-container">
          {currentQuestion && Object.entries(currentQuestion.choices).map(([key, answer]) => (
            <button
              key={key}
              className={getAnswerClass(answer, key)}
              onClick={() => handleAnswerSelect(answer, key)}
              disabled={showResult || isInSuspense || fiftyDisabledAnswers.includes(key.toUpperCase()) || (doubleAnswerActive && doubleAnswerFirstTried === key.toUpperCase())}
            >
              <span className="answer-label">{getAnswerLabel(key)}</span>
              <span className="answer-text">{answer}</span>
              {/* Audience distribution bar/percent */}
              {audienceDistribution && audienceDistribution[key.toUpperCase()] !== undefined && (
                <span className="audience-bar" style={{display: 'block', marginTop: 4}}>
                  <span style={{display: 'inline-block', background: '#1A3A6B', color: '#fff', borderRadius: 4, padding: '0 6px', fontSize: 13, minWidth: 32}}>
                    {audienceDistribution[key.toUpperCase()]}%
                  </span>
                </span>
              )}
              {/* Phone distribution bar/percent */}
              {phoneDistribution && phoneDistribution[key.toUpperCase()] !== undefined && (
                <span className="phone-bar" style={{display: 'block', marginTop: 4}}>
                  <span style={{display: 'inline-block', background: '#1A3A6B', color: '#fff', borderRadius: 4, padding: '0 6px', fontSize: 13, minWidth: 32}}>
                    {phoneDistribution[key.toUpperCase()]}%
                  </span>
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="joker-bar">
          <button className="joker-btn" title="Seyirciye Sorma -> %95 ihtimalle doğru sonuca ulaştırır." disabled={jokersDisabled || audienceUsed} onClick={handleAudience} aria-label="Seyirciye sorup, %95 ihtimalle doğru cevaba ulaşmanı sağlar.">
            {/* Seyirciye Sorma SVG - 3 people, clearer */}
            <svg width="48" height="38" viewBox="0 0 48 38" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="24" cy="19" rx="24" ry="19" fill="#1A3A6B"/>
              <g stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
                <circle cx="14" cy="18" r="4"/>
                <circle cx="24" cy="13" r="5"/>
                <circle cx="34" cy="18" r="4"/>
                <path d="M8 29c0-4 4-7 9-7s9 3 9 7"/>
                <path d="M24 18c5 0 9 3 9 7"/>
              </g>
            </svg>
          </button>
          <button className="joker-btn" title="Telefonla Arama -> %90 ihtimalle doğru sonuca ulaştırır." disabled={jokersDisabled || phoneUsed || isPhoneThinking} onClick={handlePhone}>
            {/* Telefonla Arama SVG - fixed for React/JSX */}
            <svg  width="56" height="44" viewBox="0 0 56 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display: 'block', margin: '0 auto'}}>
              <ellipse cx="28" cy="22" rx="24" ry="19" fill="#1A3A6B"/>
              <g>
                <path
                  transform="translate(10, 6) scale(1.4)"
                  id="primary"
                  d="M21,15v3.93a2,2,0,0,1-2.29,2A18,18,0,0,1,3.14,5.29,2,2,0,0,1,5.13,3H9a1,1,0,0,1,1,.89,10.74,10.74,0,0,0,1,3.78,1,1,0,0,1-.42,1.26l-.86.49a1,1,0,0,0-.33,1.46,14.08,14.08,0,0,0,3.69,3.69,1,1,0,0,0,1.46-.33l.49-.86A1,1,0,0,1,16.33,13a10.74,10.74,0,0,0,3.78,1A1,1,0,0,1,21,15Z"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
          </button>
          <button className="joker-btn" title="50:50 -> Yanlış 2 şıkkı eler." disabled={jokersDisabled || fiftyUsed} onClick={handleFiftyFifty}>
            {/* 50:50 SVG */}
            <svg width="48" height="38" viewBox="0 0 48 38" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="24" cy="19" rx="24" ry="19" fill="#1A3A6B"/>
              <text x="24" y="25" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontWeight="bold" fontSize="16" fill="#fff">50:50</text>
            </svg>
          </button>
          <button className="joker-btn" title="Çift Cevap Jokeri: Bu soruda iki farklı cevap hakkı verir. Sadece 7. sorudan sonra kullanılabilir." disabled={jokersDisabled || doubleAnswerUsed || doubleAnswerActive || currentQuestionNumber < 8} onClick={handleDoubleAnswer}>
            {/* Çift Cevap Jokeri SVG */}
            <svg width="48" height="38" viewBox="0 0 48 38" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="24" cy="19" rx="24" ry="19" fill="#1A3A6B"/>
              <text x="24" y="25" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontWeight="bold" fontSize="16" fill="#fff">2X</text>
            </svg>
          </button>
        </div>

        {showResult && (
          <div className="result-container">
            {hasWon ? (
              <div className="celebration-container">
                <div className="confetti-container">
                  {[...Array(50)].map((_, i) => (
                    <div key={i} className="confetti" style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 3}s`,
                      animationDuration: `${2 + Math.random() * 2}s`
                    }}></div>
                  ))}
                </div>
                <div className="win-message">
                  <h1 className="win-title">Büyük ödülü kazandınız!</h1>
                  <p className="win-subtitle">5.000.000 ₺</p>
                </div>
                <button className="btn btn-primary btn-lg" onClick={startGame}>
                  Baştan Başla
                </button>
              </div>
            ) : (
              <>
                <div className={`result-message ${selectedAnswer?.toUpperCase() === currentQuestion?.answer.toUpperCase() ? 'correct' : 'incorrect'}`}>
                  {selectedAnswer?.toUpperCase() === currentQuestion?.answer.toUpperCase() ? 'Doğru Cevap!' : 'Yanlış Cevap!'}
                </div>
                
                <div className="contestant-result">
                  <p className="contestant-name">
                    <strong>{currentQuestion?.contestant.name}</strong>
                    &nbsp;yarışmada bu soru
                    {!currentQuestion?.contestant.answer ? 
                      'da çekilerek elendi.' : 
                      currentQuestion?.contestant.correct ? 
                        'ya doğru cevap verdi.' : 
                        `ya ${currentQuestion?.contestant.answer?.toUpperCase()} diyerek yanlış cevap verdi.`
                    } 
                  </p>
                </div>
                
                <button className="btn btn-primary" onClick={selectedAnswer?.toUpperCase() === currentQuestion?.answer.toUpperCase() ? getNextQuestion : startGame}>
                  {selectedAnswer?.toUpperCase() === currentQuestion?.answer.toUpperCase() ? 'Sıradaki Soru' : 'Tekrar Dene'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
      )}
    </main>
  );
}

export default App;