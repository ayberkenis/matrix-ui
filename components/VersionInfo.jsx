"use client";

import { useEffect } from "react";
import { useWorldStore } from "../store/worldStore";
import { clientFetch } from "../lib/matrixApi";

export default function VersionInfo() {
  const version = useWorldStore((state) => state.version);

  useEffect(() => {
    // Fetch version info
    const fetchVersion = async () => {
      try {
        const versionData = await clientFetch("/version");
        if (versionData) {
          useWorldStore.getState().setVersion(versionData);
        }
      } catch (error) {
        console.error("Failed to fetch version:", error);
      }
    };

    fetchVersion();
  }, []);

  if (!version) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="text-xs text-matrix-green-dim font-mono">
      <span className="text-matrix-green">v{version.matrix_version}</span>
      {version.reset_count !== undefined && (
        <span className="ml-2">
          | Resets: {version.reset_count}/5
        </span>
      )}
    </div>
  );
}
