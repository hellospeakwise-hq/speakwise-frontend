"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

  const words = useMemo(() => animatedWords, [animatedWords]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (wordIndex === words.length - 1) {
        setWordIndex(0);
      } else {
        setWordIndex(wordIndex + 1);
      }
    }, interval);
    return () => clearTimeout(timeoutId);
  }, [wordIndex, words, interval]);

  return (
    <h1
      className={`font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight ${className}`}
    >
      <span className="block sm:inline">{staticText}</span>
      <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1 min-h-[1.4em]">
        &nbsp;
        <AnimatePresence mode="popLayout">
          {words.map((word, index) =>
            wordIndex === index ? (
              <motion.span
                key={word}
                className="absolute font-bold text-foreground whitespace-nowrap"
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  y: -50,
                  opacity: 0,
                  scale: 0.8,
                }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                }}
              >
                {word}
              </motion.span>
            ) : null
          )}
        </AnimatePresence>
      </span>
    </h1>
  );
}

export { AnimatedText };
