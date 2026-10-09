"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface AnimatedTextProps {
  staticText?: string;
  animatedWords?: string[];
  className?: string;
  interval?: number;
}

function AnimatedText({
  staticText = "Turn Speaking Into",
  animatedWords = [
    "Measurable Growth",
    "Real Impact",
    "Proven Success",
    "Data-Driven Results",
    "Career Momentum",
  ],
  className = "",
  interval = 2500,
}: AnimatedTextProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const words = useMemo(() => animatedWords, [animatedWords]);

  useEffect(() => {
    if (prefersReducedMotion !== false) return;

    const timeoutId = setTimeout(() => {
      if (wordIndex === words.length - 1) {
        setWordIndex(0);
      } else {
        setWordIndex(wordIndex + 1);
      }
    }, interval);
    return () => clearTimeout(timeoutId);
  }, [wordIndex, words, interval, prefersReducedMotion]);

  return (
    <h1
      className={`font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight ${className}`}
    >
      <span className="block sm:inline">{staticText}</span>
      <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1 min-h-[1.4em]">
        &nbsp;
        {prefersReducedMotion ? (
          <span className="absolute font-bold whitespace-nowrap">{words[0]}</span>
        ) : (
          <AnimatePresence mode="popLayout">
            {words.map((word, index) =>
              wordIndex === index ? (
                <motion.span
                  key={word}
                  className="absolute font-bold whitespace-nowrap"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  {word}
                </motion.span>
              ) : null
            )}
          </AnimatePresence>
        )}
      </span>
    </h1>
  );
}

export { AnimatedText };
