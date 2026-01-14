"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { id: "overview", label: "OVERVIEW", icon: "▣", path: "/overview" },
  { id: "agents", label: "AGENTS", icon: "👤", path: "/agents" },
  { id: "events", label: "EVENTS", icon: "⚡", path: "/events" },
  { id: "causality", label: "CAUSALITY", icon: "⇄", path: "/causality" },
  { id: "emotions", label: "EMOTIONS", icon: "💭", path: "/emotions" },
  { id: "rules", label: "RULES", icon: "⚙", path: "/rules" },
  {
    id: "visualization",
    label: "WORLD STATE VISUALIZATION",
    icon: "🖼️",
    path: "/visualization",
    badge: "Gemini",
  },
  {
    id: "ascii",
    label: "MATRIX STATE 2.5D",
    icon: "▦",
    path: "/state/ascii",
    badge: "ASCII",
  },
];

export default function TabNavigation() {
  const pathname = usePathname();

  // Determine active tab from pathname
  const currentTab =
    tabs.find((tab) => {
      if (pathname === tab.path) return true;
      // Handle nested routes (e.g., /agents/[id] should highlight agents tab)
      if (pathname.startsWith(tab.path + "/")) return true;
      // Handle root path as overview
      if (pathname === "/" && tab.id === "overview") return true;
      return false;
    })?.id || "overview";

  return (
    <div className="flex items-center gap-2 border-b border-matrix-green border-opacity-30 bg-matrix-panel px-4 py-2 flex-shrink-0 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <Link
            key={tab.id}
            href={tab.path}
            className={`px-4 py-2 text-xs font-mono font-bold tracking-wider transition-all flex-shrink-0 relative ${
              isActive
                ? "text-matrix-green text-matrix-glow border-b-2 border-matrix-green"
                : "text-matrix-green-dim hover:text-matrix-green"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
            {tab.badge && (
              <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-blue-500 bg-opacity-20 text-blue-400 border border-blue-500 border-opacity-30 rounded">
                {tab.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
