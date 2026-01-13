"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function InfoPopup({ title, content }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const modalContent = isOpen ? (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999]"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="bg-matrix-dark border-matrix border-matrix-green border-opacity-50 p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto scrollbar-matrix"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-matrix-green text-matrix-glow">
            {title}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-matrix-green hover:text-matrix-green-bright border border-matrix-green border-opacity-30 px-4 py-2 hover:border-opacity-60 transition-all"
          >
            CLOSE
          </button>
        </div>
        <div className="text-sm text-matrix-green-dim space-y-4">{content}</div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-matrix-green-dim hover:text-matrix-green transition-colors"
        aria-label="Show information"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
