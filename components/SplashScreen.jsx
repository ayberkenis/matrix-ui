"use client";

import { useEffect, useState } from "react";
import { useWorldStore } from "../store/worldStore";

export default function SplashScreen() {
  const wsStatus = useWorldStore((state) => state.wsStatus);
  const state = useWorldStore((state) => state.state);
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [minDisplayTime, setMinDisplayTime] = useState(false);
  const [codeRainColumns, setCodeRainColumns] = useState([]);

  const wakeUpSequence = [
    "Wake up, Neo...",
    "The Matrix has you...",
    "Follow the white rabbit.",
    "Knock, knock, Neo.",
  ];

  // Generate code rain columns on client only to avoid hydration mismatch
  useEffect(() => {
    const chars =
      "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

    const columns = Array.from({ length: 60 }).map((_, i) => {
      const delay = Math.random() * 2;
      const duration = 2 + Math.random() * 3;
      const left = `${(i / 60) * 100}%`;
      const columnChars = Array.from({ length: 40 }).map(
        () => chars[Math.floor(Math.random() * chars.length)]
      );

      return {
        i,
        left,
        delay,
        duration,
        chars: columnChars,
      };
    });

    setCodeRainColumns(columns);
  }, []);

  useEffect(() => {
    // Mark as initialized once we have state data (API connected)
    if (state && !hasInitialized) {
      setHasInitialized(true);
    }
  }, [state, hasInitialized]);

  // Ensure we show at least "The Matrix has you" (index 1)
  useEffect(() => {
    if (currentLineIndex >= 1 && !minDisplayTime) {
      // Start minimum display timer once we've shown "The Matrix has you"
      const timer = setTimeout(() => {
        setMinDisplayTime(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentLineIndex, minDisplayTime]);

  useEffect(() => {
    // Hide splash only after:
    // 1. We've shown at least "The Matrix has you" (index 1)
    // 2. Minimum display time has passed
    // 3. Connection is ready OR timeout
    const timeout = setTimeout(() => {
      if (showSplash && minDisplayTime) {
        setFadeOut(true);
        setTimeout(() => {
          setShowSplash(false);
        }, 1500);
      }
    }, 20000); // 20 second max fallback

    const shouldHide =
      minDisplayTime &&
      ((wsStatus === "connected" && hasInitialized) ||
        (hasInitialized && wsStatus === "disconnected"));

    if (shouldHide) {
      // Wait a bit more for code rain effect, then fade out
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setShowSplash(false);
          clearTimeout(timeout);
        }, 1500);
      }, 2000);
    }

    return () => clearTimeout(timeout);
  }, [wsStatus, hasInitialized, showSplash, minDisplayTime]);

  // Typewriter effect
  useEffect(() => {
    if (!showSplash || currentLineIndex >= wakeUpSequence.length) return;

    const targetText = wakeUpSequence[currentLineIndex];
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (charIndex < targetText.length) {
        setCurrentText(targetText.substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        // Wait before moving to next line
        setTimeout(() => {
          if (currentLineIndex < wakeUpSequence.length - 1) {
            setCurrentLineIndex((prev) => prev + 1);
            setCurrentText("");
          }
        }, 2000);
      }
    }, 100); // Typing speed

    return () => clearInterval(typeInterval);
  }, [showSplash, currentLineIndex]);

  // Blinking cursor
  useEffect(() => {
    if (!showSplash) return;
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, [showSplash]);

  if (!showSplash) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-black transition-opacity duration-1500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Code rain effect - starts immediately, fades with splash */}
      {codeRainColumns.length > 0 && (
        <div
          className={`absolute inset-0 overflow-hidden transition-opacity duration-1500 ${
            fadeOut ? "opacity-0" : "opacity-30"
          }`}
        >
          {codeRainColumns.map((col) => (
            <div
              key={col.i}
              className="absolute top-0 text-matrix-green text-xs font-mono whitespace-nowrap matrix-rain-char"
              style={{
                left: col.left,
                animation: `matrix-rain ${col.duration}s linear ${col.delay}s infinite`,
              }}
            >
              {col.chars.map((char, j) => (
                <div key={j} className="opacity-80">
                  {char}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Centered text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-matrix-green font-mono text-xl sm:text-2xl md:text-3xl lg:text-4xl text-center">
          <span
            className="text-matrix-green"
            style={{
              textShadow:
                "0 0 10px rgba(0, 255, 65, 0.8), 0 0 20px rgba(0, 255, 65, 0.5)",
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            }}
          >
            {currentText}
          </span>
          {showCursor && (
            <span
              className="inline-block w-4 h-8 bg-matrix-green ml-2 align-bottom"
              style={{
                boxShadow: "0 0 10px rgba(0, 255, 65, 0.8)",
                animation: "blink 1s step-end infinite",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
