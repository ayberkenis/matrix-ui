"use client";

import { useState, useEffect } from "react";

export default function MatrixRainBackground() {
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    // Only generate random values on client side to avoid hydration mismatch
    // Reduced columns and chars per column for better performance
    const chars =
      "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
    // Reduced from 30 to 20 columns and from 20 to 15 chars per column
    const columnCount = 20;
    const charsPerColumn = 15;
    const newColumns = Array.from({ length: columnCount }).map((_, i) => {
      const delay = Math.random() * 5;
      const duration = 3 + Math.random() * 4;
      const left = `${(i / columnCount) * 100}%`;
      const columnChars = Array.from({ length: charsPerColumn }).map(
        () => chars[Math.floor(Math.random() * chars.length)]
      );
      return { i, delay, duration, left, chars: columnChars };
    });
    setColumns(newColumns);
  }, []);

  if (columns.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
      <div className="absolute inset-0 overflow-hidden">
        {columns.map((col) => (
          <div
            key={col.i}
            className="matrix-rain-char absolute top-0 whitespace-nowrap"
            style={{
              left: col.left,
              animationDelay: `${col.delay}s`,
              animationDuration: `${col.duration}s`,
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
    </div>
  );
}
