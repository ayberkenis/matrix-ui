"use client";

import { useEffect, useState } from "react";
import { useWorldStore } from "../../../../store/worldStore";
import { getStateImageUrl } from "../../../../lib/matrixApi";
import Link from "next/link";

export default function StateVisualizationPage() {
  const worldState = useWorldStore((state) => state.state);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true);
        setImageError(false);

        const baseUrl = getStateImageUrl();
        const timestamp = worldState?.timestamp || Date.now();
        const url = `${baseUrl}?t=${timestamp}`;

        // Fetch image with headers to get metadata
        const response = await fetch(url, {
          method: "GET",
          cache: "no-cache",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        // Extract metadata from headers
        const headers = {
          "X-Simulation-Day": response.headers.get("X-Simulation-Day"),
          "X-Simulation-Hour": response.headers.get("X-Simulation-Hour"),
          "X-Simulation-Turn": response.headers.get("X-Simulation-Turn"),
          "X-State-Hash": response.headers.get("X-State-Hash"),
          "X-Prompt-Hash": response.headers.get("X-Prompt-Hash"),
          "X-Generated-At": response.headers.get("X-Generated-At"),
          "X-Generation-Time-Ms": response.headers.get("X-Generation-Time-Ms"),
        };

        setMetadata(headers);

        // Create object URL from blob
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load state image:", error);
        setImageError(true);
        setIsLoading(false);
      }
    };

    loadImage();

    // Cleanup object URL on unmount
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [worldState?.timestamp]);

  // Refresh image when state updates
  useEffect(() => {
    if (worldState?.timestamp && imageUrl) {
      // Revoke old URL and reload
      URL.revokeObjectURL(imageUrl);
      setImageUrl(null);
      setIsLoading(true);
    }
  }, [worldState?.timestamp]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Metadata Bar */}
      {metadata && (
        <div className="bg-matrix-panel border-b border-matrix-green border-opacity-30 px-6 py-3 flex-shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-xs">
              {metadata["X-Simulation-Day"] && (
                <div>
                  <span className="text-matrix-green-dim">Day:</span>{" "}
                  <span className="text-matrix-green font-bold">
                    {metadata["X-Simulation-Day"]}
                  </span>
                </div>
              )}
              {metadata["X-Simulation-Hour"] && (
                <div>
                  <span className="text-matrix-green-dim">Hour:</span>{" "}
                  <span className="text-matrix-green font-bold">
                    {metadata["X-Simulation-Hour"]}
                  </span>
                </div>
              )}
              {metadata["X-Simulation-Turn"] && (
                <div>
                  <span className="text-matrix-green-dim">Turn:</span>{" "}
                  <span className="text-matrix-green font-bold">
                    {metadata["X-Simulation-Turn"]}
                  </span>
                </div>
              )}
              {metadata["X-State-Hash"] && (
                <div>
                  <span className="text-matrix-green-dim">State Hash:</span>{" "}
                  <span className="text-matrix-green font-mono text-[10px]">
                    {metadata["X-State-Hash"].substring(0, 8)}...
                  </span>
                </div>
              )}
              {metadata["X-Prompt-Hash"] && (
                <div>
                  <span className="text-matrix-green-dim">Prompt Hash:</span>{" "}
                  <span className="text-matrix-green font-mono text-[10px]">
                    {metadata["X-Prompt-Hash"].substring(0, 8)}...
                  </span>
                </div>
              )}
              {metadata["X-Generated-At"] && (
                <div>
                  <span className="text-matrix-green-dim">Generated:</span>{" "}
                  <span className="text-matrix-green text-[10px]">
                    {new Date(metadata["X-Generated-At"]).toLocaleTimeString()}
                  </span>
                </div>
              )}
              {metadata["X-Generation-Time-Ms"] && (
                <div>
                  <span className="text-matrix-green-dim">Gen Time:</span>{" "}
                  <span className="text-matrix-green font-bold">
                    {metadata["X-Generation-Time-Ms"]}ms
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Container - Full Screen */}
      <div className="flex-1 relative bg-matrix-dark overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-matrix-green-dim text-lg matrix-typing-inline">
              Loading visualization
            </div>
          </div>
        ) : imageError ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-red-400 text-lg">
              Failed to load visualization
            </div>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Matrix State Visualization"
            className="w-full h-full object-contain"
          />
        ) : null}
      </div>

      {/* Back Button */}
      <div className="bg-matrix-panel border-t border-matrix-green border-opacity-30 px-6 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-block text-matrix-green hover:text-matrix-green-bright border border-matrix-green border-opacity-30 px-4 py-2 hover:border-opacity-60 transition-all"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
