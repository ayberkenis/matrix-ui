"use client";

import { useEffect, useState, useRef } from "react";
import { useWorldStore } from "../store/worldStore";
import { getStateImageUrl, getStateImageInfo } from "../lib/matrixApi";
import InfoPopup from "./InfoPopup";

export default function StateVisualizationPanel() {
  const worldState = useWorldStore((state) => state.state);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [workerStatus, setWorkerStatus] = useState(null);
  const imageUrlRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const imageContainerRef = useRef(null);
  const isLoadingRef = useRef(false);
  const lastStateHashRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const checkWorkerStatus = async () => {
      try {
        const info = await getStateImageInfo();
        if (!isMounted) return;

        setWorkerStatus(info);

        // Set metadata from info if available (use latest_image data)
        if (info.latest_image) {
          const latestImage = info.latest_image;
          const infoMetadata = {
            "X-Simulation-Day": String(latestImage.generated_at_day),
            "X-Simulation-Hour": String(latestImage.generated_at_hour),
            "X-Simulation-Turn": String(latestImage.generated_at_turn),
            "X-State-Hash": latestImage.state_hash,
            "X-Prompt-Hash": latestImage.prompt_hash,
            "X-Generated-At": latestImage.generated_at_timestamp,
            "X-Generation-Time-Ms": String(latestImage.generation_time_ms),
          };
          setMetadata(infoMetadata);

          // Set up countdown from info if available
          if (
            info.next_generation_in_seconds !== undefined &&
            info.next_generation_in_seconds > 0
          ) {
            const nextGenerationTime =
              Date.now() + info.next_generation_in_seconds * 1000;

            const updateCountdown = () => {
              if (!isMounted) return;

              const now = Date.now();
              const remaining = Math.max(0, nextGenerationTime - now);
              const minutes = Math.floor(remaining / 60000);
              const seconds = Math.floor((remaining % 60000) / 1000);
              setCountdown({ minutes, seconds, total: remaining });

              if (remaining <= 0) {
                // Countdown finished, check status again
                if (countdownIntervalRef.current) {
                  clearInterval(countdownIntervalRef.current);
                  countdownIntervalRef.current = null;
                }
                checkWorkerStatus();
              }
            };

            // Clear existing interval
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }

            // Update immediately
            updateCountdown();

            // Update every second
            countdownIntervalRef.current = setInterval(updateCountdown, 1000);
          }
        }

        // If worker is not running, don't try to load image
        if (!info.worker_running) {
          setIsLoading(false);
          setImageError(false);
          return;
        }

        // Worker is running, proceed to load image
        loadImage(info);
      } catch (error) {
        console.error("Failed to check worker status:", error);
        if (isMounted) {
          setIsLoading(false);
          setImageError(true);
        }
      }
    };

    const loadImage = async (info = null) => {
      // Prevent multiple simultaneous requests
      if (isLoadingRef.current) {
        return;
      }

      try {
        isLoadingRef.current = true;
        setIsLoading(true);
        setImageError(false);

        // Cleanup previous image URL
        if (imageUrlRef.current) {
          URL.revokeObjectURL(imageUrlRef.current);
          imageUrlRef.current = null;
        }

        const baseUrl = getStateImageUrl();
        // Use a stable cache-busting parameter - only change when we actually want a new image
        const url = `${baseUrl}?t=${Date.now()}`;

        // Fetch image with headers to get metadata
        // Note: CORS must expose these headers on the server side
        const response = await fetch(url, {
          method: "GET",
          cache: "no-cache",
          credentials: "include", // Include credentials for CORS
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        // Helper function to get header case-insensitively
        // Build a map of all headers in lowercase for case-insensitive lookup
        const headerMap = {};
        response.headers.forEach((val, key) => {
          headerMap[key.toLowerCase()] = val;
        });

        // Debug: log all headers
        console.log("All headers:", headerMap);

        // Check if custom headers are accessible (CORS issue if not)
        const exposedHeaders = response.headers.get(
          "access-control-expose-headers"
        );
        if (exposedHeaders) {
          console.log("Exposed headers:", exposedHeaders);
        } else {
          console.warn(
            "No Access-Control-Expose-Headers found. Custom headers may not be accessible."
          );
          console.warn(
            "Server needs to add: Access-Control-Expose-Headers: x-simulation-day, x-simulation-hour, x-simulation-turn, x-state-hash, x-prompt-hash, x-generated-at, x-generation-time-ms"
          );
        }

        // Helper to get header by name (case-insensitive)
        const getHeader = (name) => {
          return headerMap[name.toLowerCase()] || null;
        };

        // Extract metadata from headers (case-insensitive lookup)
        // Note: These will be null if server doesn't expose them via CORS
        const headers = {
          "X-Simulation-Day": getHeader("x-simulation-day"),
          "X-Simulation-Hour": getHeader("x-simulation-hour"),
          "X-Simulation-Turn": getHeader("x-simulation-turn"),
          "X-State-Hash": getHeader("x-state-hash"),
          "X-Prompt-Hash": getHeader("x-prompt-hash"),
          "X-Generated-At": getHeader("x-generated-at"),
          "X-Generation-Time-Ms": getHeader("x-generation-time-ms"),
        };

        if (!isMounted) {
          isLoadingRef.current = false;
          return;
        }

        // Check if this is the same image (same state hash) - don't reload if it is
        const currentStateHash = headers["X-State-Hash"];
        if (currentStateHash && lastStateHashRef.current === currentStateHash) {
          // Same image, don't update
          isLoadingRef.current = false;
          setIsLoading(false);
          return;
        }

        // Update state hash reference
        lastStateHashRef.current = currentStateHash;

        setMetadata(headers);

        // Calculate next generation time
        // Use info.next_generation_in_seconds if available, otherwise calculate from generated_at
        let nextGenerationTime = null;
        if (info && info.next_generation_in_seconds !== undefined) {
          nextGenerationTime =
            Date.now() + info.next_generation_in_seconds * 1000;
        } else if (headers["X-Generated-At"]) {
          const generatedAt = new Date(headers["X-Generated-At"]).getTime();
          nextGenerationTime = generatedAt + 12 * 60 * 60 * 1000; // 12 hours fallback
        }

        if (nextGenerationTime) {
          const updateCountdown = () => {
            if (!isMounted) return;

            const now = Date.now();
            const remaining = Math.max(0, nextGenerationTime - now);
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            setCountdown({ minutes, seconds, total: remaining });

            if (remaining <= 0) {
              // Countdown finished, reload image
              if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
              }
              // Reset state hash to allow reload
              lastStateHashRef.current = null;
              // Check worker status again and reload
              checkWorkerStatus();
            }
          };

          // Clear existing interval
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }

          // Update immediately
          updateCountdown();

          // Update every second
          countdownIntervalRef.current = setInterval(updateCountdown, 1000);
        }

        // Create object URL from blob
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        imageUrlRef.current = objectUrl;
        setImageUrl(objectUrl);
        setIsLoading(false);
        isLoadingRef.current = false;
      } catch (error) {
        console.error("Failed to load state image:", error);
        if (isMounted) {
          setImageError(true);
          setIsLoading(false);
        }
        isLoadingRef.current = false;
      }
    };

    // Check worker status first, then load image if worker is running
    checkWorkerStatus();

    // Periodically check worker status (every 30 seconds)
    const statusCheckInterval = setInterval(() => {
      if (isMounted) {
        checkWorkerStatus();
      }
    }, 30000);

    // Cleanup object URL and countdown interval on unmount
    return () => {
      isMounted = false;
      isLoadingRef.current = false;
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
        imageUrlRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, []); // Only run on mount, not when timestamp changes

  // Handle fullscreen - only fullscreen the image container
  const toggleFullscreen = async () => {
    if (!imageContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await imageContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, []);

  const visualizationInfoContent = (
    <>
      <div>
        <h3 className="text-matrix-green font-bold mb-2">
          WORLD STATE VISUALIZATION OVERVIEW
        </h3>
        <p className="mb-3">
          This panel displays a visual representation of the current Matrix
          simulation state, generated by Gemini AI. The image is automatically
          regenerated every 12 hours to reflect the latest state of the world.
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">IMAGE GENERATION</h3>
        <p className="mb-2">The visualization image is created using:</p>
        <ul className="list-disc list-inside mb-3 space-y-1 ml-2">
          <li>
            <strong>Gemini AI:</strong> Google's Gemini model generates the
            image based on current simulation state
          </li>
          <li>
            <strong>Auto-refresh:</strong> New images are generated every 12
            hours
          </li>
          <li>
            <strong>Countdown Timer:</strong> Shows time remaining until next
            generation
          </li>
          <li>
            <strong>Cache:</strong> Images are cached for 1 hour to improve
            performance
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">METADATA</h3>
        <p className="mb-2">
          The sidebar displays metadata extracted from the image response
          headers:
        </p>
        <ul className="list-disc list-inside mb-3 space-y-1 ml-2">
          <li>
            <strong>Day:</strong> Current simulation day
          </li>
          <li>
            <strong>Hour:</strong> Current simulation hour
          </li>
          <li>
            <strong>Turn:</strong> Current simulation turn number
          </li>
          <li>
            <strong>State Hash:</strong> Unique hash of the simulation state
            used to generate the image
          </li>
          <li>
            <strong>Prompt Hash:</strong> Hash of the prompt sent to Gemini
          </li>
          <li>
            <strong>Generated At:</strong> Timestamp when the image was created
          </li>
          <li>
            <strong>Generation Time:</strong> How long it took to generate the
            image (in milliseconds)
          </li>
        </ul>
        <p className="mb-3">
          Note: Metadata requires proper CORS configuration on the server to be
          accessible.
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">FULLSCREEN MODE</h3>
        <p className="mb-3">
          Click the "FULLSCREEN" button in the top-right corner of the image to
          view it in fullscreen mode. This is useful for examining details in
          high-resolution (4K) images. Press ESC or click "EXIT" to return to
          normal view.
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">IMAGE DISPLAY</h3>
        <p className="mb-3">
          The image is automatically scaled to fit the available space while
          maintaining its aspect ratio. Large images (including 4K) are handled
          without causing scrolling issues. The image container uses
          object-contain to ensure the entire image is visible.
        </p>
      </div>
    </>
  );

  return (
    <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-4 h-full flex flex-col lg:min-h-0 ">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-matrix-green text-matrix-glow tracking-wider">
            WORLD STATE VISUALIZATION
          </h2>
          <InfoPopup
            title="WORLD STATE VISUALIZATION GUIDE"
            content={visualizationInfoContent}
          />
        </div>
      </div>

      {/* Main Content: 90% Image, 10% Metadata */}
      <div className="flex-1 lg:min-h-0  grid grid-cols-10 gap-4">
        {/* Image Container - 90% width */}
        <div className="col-span-10 lg:col-span-9 h-full relative overflow-hidden">
          <div
            ref={imageContainerRef}
            className="relative bg-matrix-dark border border-matrix-green border-opacity-20 h-full w-full flex items-center justify-center overflow-hidden"
          >
            {/* Fullscreen Button - positioned absolutely in top right */}
            <button
              onClick={toggleFullscreen}
              className="absolute top-2 right-2 z-10 text-matrix-green hover:text-matrix-green-bright border border-matrix-green border-opacity-30 hover:border-opacity-60 transition-all px-3 py-1.5 text-md font-mono bg-matrix-dark bg-opacity-80"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? "⤓ EXIT" : "⤢ FULLSCREEN"}
            </button>

            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-matrix-green-dim text-sm matrix-typing-inline">
                  Loading visualization
                </div>
              </div>
            ) : !workerStatus?.worker_running ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-yellow-400 text-sm text-center px-4">
                  <div className="mb-2">⚠️ Worker not running</div>
                  <div className="text-xs text-matrix-green-dim">
                    Image generation is currently unavailable
                  </div>
                </div>
              </div>
            ) : imageError ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-red-400 text-sm">
                  Failed to load visualization
                </div>
              </div>
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt="Matrix State Visualization"
                className="max-w-full max-h-full w-full h-full object-contain"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  width: "auto",
                  height: "auto",
                }}
              />
            ) : null}
          </div>
        </div>

        {/* Metadata Sidebar - 10% width */}
        <div className="col-span-10 lg:col-span-1 h-full overflow-y-auto min-h-0 scrollbar-matrix">
          <div className="space-y-3">
            {/* Countdown Timer */}
            {countdown && (
              <div className="bg-matrix-dark border border-matrix-green border-opacity-30 p-3">
                <div className="text-matrix-green-dim text-md mb-2">
                  Next Generation:
                </div>
                <div className="text-matrix-green font-mono font-bold text-lg text-center">
                  {String(countdown.minutes).padStart(2, "0")}:
                  {String(countdown.seconds).padStart(2, "0")}
                </div>
              </div>
            )}

            {/* Metadata */}
            {metadata && (
              <div className="space-y-2 text-md">
                {metadata["X-Simulation-Day"] !== null &&
                  metadata["X-Simulation-Day"] !== undefined && (
                    <div className="border border-matrix-green border-opacity-20 p-2 bg-matrix-dark bg-opacity-30">
                      <div className="text-matrix-green-dim mb-1 text-[18px]">
                        Day
                      </div>
                      <div className="text-matrix-green font-bold text-sm">
                        {metadata["X-Simulation-Day"]}
                      </div>
                    </div>
                  )}
                {metadata["X-Simulation-Hour"] !== null &&
                  metadata["X-Simulation-Hour"] !== undefined && (
                    <div className="border border-matrix-green border-opacity-20 p-2 bg-matrix-dark bg-opacity-30">
                      <div className="text-matrix-green-dim mb-1 text-[18px]">
                        Hour
                      </div>
                      <div className="text-matrix-green font-bold text-sm">
                        {metadata["X-Simulation-Hour"]}
                      </div>
                    </div>
                  )}
                {metadata["X-Simulation-Turn"] !== null &&
                  metadata["X-Simulation-Turn"] !== undefined && (
                    <div className="border border-matrix-green border-opacity-20 p-2 bg-matrix-dark bg-opacity-30">
                      <div className="text-matrix-green-dim mb-1 text-[18px]">
                        Turn
                      </div>
                      <div className="text-matrix-green font-bold text-sm">
                        {metadata["X-Simulation-Turn"]}
                      </div>
                    </div>
                  )}
                {metadata["X-State-Hash"] && (
                  <div className="border border-matrix-green border-opacity-20 p-2 bg-matrix-dark bg-opacity-30">
                    <div className="text-matrix-green-dim mb-1 text-[18px]">
                      State Hash
                    </div>
                    <div className="text-matrix-green font-mono text-[16px] break-all">
                      {metadata["X-State-Hash"]}
                    </div>
                  </div>
                )}
                {metadata["X-Prompt-Hash"] && (
                  <div className="border border-matrix-green border-opacity-20 p-2 bg-matrix-dark bg-opacity-30">
                    <div className="text-matrix-green-dim mb-1 text-[18px]">
                      Prompt Hash
                    </div>
                    <div className="text-matrix-green font-mono text-[16px] break-all">
                      {metadata["X-Prompt-Hash"]}
                    </div>
                  </div>
                )}
                {metadata["X-Generated-At"] && (
                  <div className="border border-matrix-green border-opacity-20 p-2 bg-matrix-dark bg-opacity-30">
                    <div className="text-matrix-green-dim mb-1 text-[18px]">
                      Generated
                    </div>
                    <div className="text-matrix-green text-[16px]">
                      {new Date(
                        metadata["X-Generated-At"]
                      ).toLocaleTimeString()}
                    </div>
                  </div>
                )}
                {metadata["X-Generation-Time-Ms"] && (
                  <div className="border border-matrix-green border-opacity-20 p-2 bg-matrix-dark bg-opacity-30">
                    <div className="text-matrix-green-dim mb-1 text-[18px]">
                      Gen Time
                    </div>
                    <div className="text-matrix-green font-bold text-sm">
                      {metadata["X-Generation-Time-Ms"]}ms
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
