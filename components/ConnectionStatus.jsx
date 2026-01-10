"use client";

import { useWorldStore } from "../store/worldStore";
import { t } from "../lib/i18n";

export default function ConnectionStatus() {
  const wsStatus = useWorldStore((state) => state.wsStatus);

  const statusColors = {
    connected: "text-matrix-green",
    disconnected: "text-red-500",
    reconnecting: "text-yellow-500",
  };

  const statusText = {
    connected: t("connection.connected"),
    disconnected: t("connection.disconnected"),
    reconnecting: t("connection.reconnecting"),
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${
          wsStatus === "connected"
            ? "bg-matrix-green animate-pulse"
            : wsStatus === "reconnecting"
            ? "bg-yellow-500 animate-pulse"
            : "bg-red-500"
        }`}
      />
      <span className={`text-sm font-mono ${statusColors[wsStatus]}`}>
        {statusText[wsStatus]}
      </span>
    </div>
  );
}
