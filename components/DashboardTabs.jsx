"use client";

import { useState } from "react";
import DistrictsPanel from "./DistrictsPanel";
import EventsPanel from "./EventsPanel";
import AgentsPanel from "./AgentsPanel";
import WorldSummary from "./WorldSummary";
import CausalityPanel from "./CausalityPanel";
import EmotionsPanel from "./EmotionsPanel";

import RulesPanel from "./RulesPanel";

const tabs = [
  { id: "overview", label: "OVERVIEW", icon: "▣" },
  { id: "events", label: "EVENTS", icon: "⚡" },
  { id: "causality", label: "CAUSALITY", icon: "⇄" },
  { id: "emotions", label: "EMOTIONS", icon: "💭" },
  { id: "rules", label: "RULES", icon: "⚙" },
];

export default function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="h-full lg:h-full flex flex-col lg:min-h-0">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-matrix-green border-opacity-30 bg-matrix-panel px-4 py-2 flex-shrink-0 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-mono font-bold tracking-wider transition-all flex-shrink-0 ${
              activeTab === tab.id
                ? "text-matrix-green text-matrix-glow border-b-2 border-matrix-green"
                : "text-matrix-green-dim hover:text-matrix-green"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 lg:min-h-0 lg:overflow-hidden">
        {activeTab === "overview" && (
          <div className="h-full grid grid-cols-12 gap-4 p-4">
            <div className="col-span-12 lg:col-span-4 lg:h-full lg:min-h-0 lg:overflow-hidden">
              <DistrictsPanel />
            </div>
            <div className="col-span-12 lg:col-span-4 lg:h-full lg:min-h-0 lg:overflow-hidden">
              <WorldSummary />
            </div>
            <div className="col-span-12 lg:col-span-4 lg:h-full lg:min-h-0 lg:overflow-hidden">
              <AgentsPanel />
            </div>
          </div>
        )}

        {activeTab === "events" && (
          <div className="h-full p-4 lg:min-h-0 lg:overflow-hidden">
            <div className="h-full">
              <EventsPanel />
            </div>
          </div>
        )}

        {activeTab === "causality" && (
          <div className="h-full p-4 lg:min-h-0 lg:overflow-hidden">
            <div className="h-full">
              <CausalityPanel />
            </div>
          </div>
        )}

        {activeTab === "emotions" && (
          <div className="h-full p-4 lg:min-h-0 lg:overflow-hidden">
            <div className="h-full">
              <EmotionsPanel />
            </div>
          </div>
        )}

        {activeTab === "rules" && (
          <div className="h-full p-4 lg:min-h-0 lg:overflow-hidden">
            <div className="h-full">
              <RulesPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
