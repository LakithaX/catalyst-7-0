"use client";

import { memo, useId, useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

type TextMorphProps = {
  words: string[];
  interval?: number;
  className?: string;
};

export function TextMorph({
  words,
  interval = 2000,
  className,
}: TextMorphProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!words.length) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);

    return () => clearInterval(timer);
  }, [words, interval]);

  const chars = useMemo(() => {
    return Array.from(words[index] ?? "");
  }, [index, words]);

  if (!words.length) return null;

  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={index}
        className={cn("flex gap-0.25 overflow-hidden", className)}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.4 }}
      >
        {chars.map((char, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ opacity: 0, y: 5, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -5, filter: "blur(5px)" }}
            transition={{
              delay: i * 0.03,
              duration: 0.3,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.span>
    </AnimatePresence>
  );
}

interface LiquidWaveSpinnerProps extends HTMLMotionProps<"div"> {
  size?: "sm" | "md" | "lg";
  hideText?: boolean;
}

const sizeConfig = {
  sm: {
    container: "w-full gap-4",
    svgWidth: 48,
    svgHeight: 48,
    fontSize: "text-xs",
  },
  md: {
    container: "w-full gap-5",
    svgWidth: 60,
    svgHeight: 60,
    fontSize: "text-sm",
  },
  lg: {
    container: "w-full gap-6",
    svgWidth: 80,
    svgHeight: 80,
    fontSize: "text-base",
  },
} as const;

const WAVE_PATH =
  "M 0 36.5 " +
  "C 67.43 36.5, 99.09 15.5, 160.53 15.5 C 221.98 15.5, 250.54 36.5, 300 36.5 " +
  "C 348.56 36.5, 397.30 7, 457.63 7 C 517.96 7, 539.66 36.5, 600 36.5 " +
  "C 667.43 36.5, 699.09 15.5, 760.53 15.5 C 821.98 15.5, 850.54 36.5, 900 36.5 " +
  "C 948.56 36.5, 997.30 7, 1057.63 7 C 1117.96 7, 1139.66 36.5, 1200 36.5 " +
  "L 1200 800 L 0 800 Z";

const LiquidWaveSpinner = memo(
  ({ size = "md", hideText, className, ...props }: LiquidWaveSpinnerProps) => {
    const config = sizeConfig[size] || sizeConfig.md;
    const containerRef = useRef<HTMLDivElement>(null);
    const clipId = useId();
    const randomYDuration = useMemo(() => 2.4 + Math.random() * 0.4, []);
    const randomXDurationBg = useMemo(() => 3.0 + Math.random() * 0.6, []);
    const randomXDurationFg = useMemo(() => 2.2 + Math.random() * 0.5, []);
    const randomDelay = useMemo(() => 0.1, []);

    return (
      <motion.div
        ref={containerRef}
        className={cn(
          "w-full flex flex-col items-center justify-center bg-transparent select-none",
          config.container,
          className,
        )}
        {...props}
      >
        <svg
          viewBox="0 0 500 500"
          width={config.svgWidth}
          height={config.svgHeight}
          aria-hidden="true"
          className="overflow-visible"
        >
          <defs>
            <clipPath id={clipId}>
              <circle cx="250" cy="250" r="107.5" />
            </clipPath>
          </defs>

          {/* Muted background circle */}
          <circle cx="250" cy="250" r="107.5" fill="#e5e7eb" />

          <g clipPath={`url(#${clipId})`}>
            {/* Background wave layer (semi-transparent dark) */}
            <motion.g
              initial={{ y: 340 }}
              animate={{ y: 195 }}
              transition={{
                duration: randomYDuration,
                delay: randomDelay,
                ease: "easeOut",
              }}
            >
              <motion.g
                initial={{ x: -600 }}
                animate={{ x: 0 }}
                transition={{
                  duration: randomXDurationBg,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <path
                  d={WAVE_PATH}
                  fill="#71717a"
                  style={{ opacity: 0.35 }}
                />
              </motion.g>
            </motion.g>

            {/* Foreground wave layer (deep black liquid) */}
            <motion.g
              initial={{ y: 340 }}
              animate={{ y: 205 }}
              transition={{
                duration: randomYDuration,
                delay: randomDelay,
                ease: "easeOut",
              }}
            >
              <motion.g
                initial={{ x: 0 }}
                animate={{ x: -600 }}
                transition={{
                  duration: randomXDurationFg,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <path
                  d={WAVE_PATH}
                  fill="#09090b"
                />
              </motion.g>
            </motion.g>
          </g>
        </svg>

        <div className="flex items-center justify-center text-[#71717a] select-none font-sans">
          {!hideText && (
            <TextMorph
              words={[
                "Preparing animation ...",
                "Loading assets ...",
                "Loading up preview ...",
              ]}
              interval={2200}
              className={cn("font-medium text-[#71717a]", config.fontSize)}
            />
          )}
        </div>
      </motion.div>
    );
  },
);

LiquidWaveSpinner.displayName = "LiquidWaveSpinner";

export default LiquidWaveSpinner;
