"use client";

import { useState } from "react";
import { useWorldStore } from "../store/worldStore";
import { t } from "../lib/i18n";

function AgentCard({ agent, onSelect }) {
  return (
    <div
      onClick={() => onSelect(agent)}
      className="border-matrix border-matrix-green border-opacity-20 p-3 mb-2 cursor-pointer hover:border-opacity-50 hover:bg-matrix-dark hover:bg-opacity-30 transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-matrix-green font-bold">
          {agent.name || `Agent ${agent.id}`}
        </h3>
        <span className="text-xs text-matrix-green-dim">{agent.id}</span>
      </div>
      <div className="text-xs text-matrix-green-dim space-y-1">
        <div>
          <span className="text-matrix-green">{t("agents.location")}</span>:{" "}
          {agent.location || "--"}
        </div>
        <div>
          <span className="text-matrix-green">{t("agents.role")}</span>:{" "}
          {agent.role || "--"}
        </div>
        <div>
          <span className="text-matrix-green">{t("agents.mood")}</span>:{" "}
          {agent.mood || "--"}
        </div>
      </div>
    </div>
  );
}

function AgentDetail({ agent, onClose }) {
  if (!agent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-matrix-dark border-matrix border-matrix-green border-opacity-50 p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-matrix-green text-matrix-glow">
            {agent.name || `Agent ${agent.id}`}
          </h2>
          <button
            onClick={onClose}
            className="text-matrix-green hover:text-matrix-green-bright border border-matrix-green border-opacity-30 px-4 py-2 hover:border-opacity-60 transition-all"
          >
            CLOSE
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <span className="text-matrix-green font-bold">
              {t("agents.id")}
            </span>
            : {agent.id}
          </div>
          <div>
            <span className="text-matrix-green font-bold">
              {t("agents.location")}
            </span>
            : {agent.location || "--"}
          </div>
          <div>
            <span className="text-matrix-green font-bold">
              {t("agents.role")}
            </span>
            : {agent.role || "--"}
          </div>
          <div>
            <span className="text-matrix-green font-bold">
              {t("agents.mood")}
            </span>
            : {agent.mood || "--"}
          </div>
          {agent.needs && agent.needs.length > 0 && (
            <div>
              <span className="text-matrix-green font-bold">
                {t("agents.needs")}
              </span>
              :
              <div className="mt-1 flex flex-wrap gap-1">
                {agent.needs.map((need, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 bg-yellow-500 bg-opacity-20 text-yellow-400 border border-yellow-500 border-opacity-30"
                  >
                    {need}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div>
            <span className="text-matrix-green font-bold">
              {t("agents.goal")}
            </span>
            : {agent.goal || "--"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgentsPanel() {
  const agents = useWorldStore((state) => state.agents);
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Ensure agents is always an array
  const agentsArray = Array.isArray(agents) ? agents : [];

  return (
    <>
      <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-4 h-full flex flex-col min-h-0">
        <h2 className="text-lg font-bold text-matrix-green text-matrix-glow mb-4 tracking-wider flex-shrink-0">
          {t("panels.agents")}
        </h2>

        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-matrix">
          {agentsArray.length === 0 ? (
            <div className="text-matrix-green-dim text-sm">NO AGENTS</div>
          ) : (
            <div className="pr-2">
              {agentsArray.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onSelect={setSelectedAgent}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AgentDetail
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
      />
    </>
  );
}
