"use client";

import { useState } from "react";
import { useWorldStore } from "../store/worldStore";
import { useTranslation } from "../lib/useTranslation";

function AgentCard({ agent, onSelect }) {
  const t = useTranslation();
  const relationshipsCount =
    agent.relationships &&
    typeof agent.relationships === "object" &&
    !Array.isArray(agent.relationships)
      ? Object.keys(agent.relationships).length
      : 0;
  const beliefsCount =
    agent.beliefs &&
    typeof agent.beliefs === "object" &&
    !Array.isArray(agent.beliefs)
      ? Object.keys(agent.beliefs).length
      : 0;

  return (
    <div
      onClick={() => onSelect(agent)}
      className="border-matrix border-matrix-green border-opacity-20 p-3 mb-2 cursor-pointer hover:border-opacity-50 hover:bg-matrix-dark hover:bg-opacity-30 transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-matrix-green font-bold">
            {agent.name || `Agent ${agent.id}`}
          </h3>
          {agent.is_alive !== undefined && (
            <span
              className={`text-xs px-1.5 py-0.5 rounded ${
                agent.is_alive
                  ? "bg-matrix-green bg-opacity-20 text-matrix-green border border-matrix-green border-opacity-50"
                  : "bg-red-500 bg-opacity-20 text-red-400 border border-red-500 border-opacity-50"
              }`}
            >
              {agent.is_alive ? "●" : "✕"}
            </span>
          )}
        </div>
        <span className="text-xs text-matrix-green-dim">{agent.id}</span>
      </div>
      <div className="text-xs text-matrix-green-dim space-y-1">
        <div>
          <span className="text-matrix-green">District</span>:{" "}
          {agent.district || "--"}
        </div>
        <div>
          <span className="text-matrix-green">{t("agents.role")}</span>:{" "}
          {agent.role || "--"}
        </div>
        {agent.age !== undefined && (
          <div>
            <span className="text-matrix-green">Age</span>: {agent.age} /{" "}
            {agent.lifespan || "?"} turns
          </div>
        )}
        <div>
          <span className="text-matrix-green">Action</span>:{" "}
          {agent.current_action || "--"}
        </div>
        {agent.mood !== undefined && (
          <div>
            <span className="text-matrix-green">{t("agents.mood")}</span>:{" "}
            <span
              className={
                agent.mood > 0.3
                  ? "text-green-400"
                  : agent.mood < -0.3
                  ? "text-red-400"
                  : "text-yellow-400"
              }
            >
              {(agent.mood * 100).toFixed(0)}%
            </span>
          </div>
        )}
        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-matrix-green border-opacity-10">
          {relationshipsCount > 0 && (
            <div className="text-xs">
              <span className="text-matrix-green-dim">Relations:</span>{" "}
              <span className="text-blue-400">{relationshipsCount}</span>
            </div>
          )}
          {beliefsCount > 0 && (
            <div className="text-xs">
              <span className="text-matrix-green-dim">Beliefs:</span>{" "}
              <span className="text-purple-400">{beliefsCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AgentDetail({ agent, onClose }) {
  const t = useTranslation();
  if (!agent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-matrix-dark border-matrix border-matrix-green border-opacity-50 p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto scrollbar-matrix">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-matrix-green text-matrix-glow">
              {agent.name || `Agent ${agent.id}`}
            </h2>
            {agent.is_alive !== undefined && (
              <div
                className={`px-3 py-1 rounded text-xs font-bold ${
                  agent.is_alive
                    ? "bg-matrix-green bg-opacity-20 text-matrix-green border border-matrix-green border-opacity-50"
                    : "bg-red-500 bg-opacity-20 text-red-400 border border-red-500 border-opacity-50"
                }`}
              >
                {agent.is_alive ? "● ALIVE" : "✕ DECEASED"}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-matrix-green hover:text-matrix-green-bright border border-matrix-green border-opacity-30 px-4 py-2 hover:border-opacity-60 transition-all"
          >
            CLOSE
          </button>
        </div>

        <div className="space-y-4 text-sm text-matrix-green-dim">
          <div>
            <span className="text-matrix-green font-bold">
              {t("agents.id")}
            </span>
            : {agent.id}
          </div>
          <div>
            <span className="text-matrix-green font-bold">District</span>:{" "}
            {agent.district || "--"}
          </div>
          <div>
            <span className="text-matrix-green font-bold">Location</span>:{" "}
            {agent.location || "--"}
          </div>
          <div>
            <span className="text-matrix-green font-bold">
              {t("agents.role")}
            </span>
            : {agent.role || "--"}
          </div>
          {agent.mood !== undefined && (
            <div>
              <span className="text-matrix-green font-bold">
                {t("agents.mood")}
              </span>
              : {(agent.mood * 100).toFixed(0)}%
            </div>
          )}
          {agent.current_action && (
            <div>
              <span className="text-matrix-green font-bold">
                Current Action
              </span>
              : {agent.current_action}
            </div>
          )}
          {agent.age !== undefined && (
            <div>
              <span className="text-matrix-green font-bold">Age</span>:{" "}
              {agent.age} / {agent.lifespan || "?"} turns
            </div>
          )}
          {agent.is_alive !== undefined && (
            <div>
              <span className="text-matrix-green font-bold">Status</span>:{" "}
              <span
                className={
                  agent.is_alive ? "text-matrix-green" : "text-red-400"
                }
              >
                {agent.is_alive ? "ALIVE" : "DECEASED"}
              </span>
            </div>
          )}
          {agent.children_ids &&
            Array.isArray(agent.children_ids) &&
            agent.children_ids.length > 0 && (
              <div>
                <span className="text-matrix-green font-bold">Children</span>:{" "}
                {agent.children_ids.join(", ")}
              </div>
            )}
          {agent.parents_ids &&
            Array.isArray(agent.parents_ids) &&
            agent.parents_ids.length > 0 && (
              <div>
                <span className="text-matrix-green font-bold">Parents</span>:{" "}
                {agent.parents_ids.join(", ")}
              </div>
            )}

          {/* Needs - now an object with numeric values */}
          {agent.needs &&
            typeof agent.needs === "object" &&
            !Array.isArray(agent.needs) && (
              <div>
                <span className="text-matrix-green font-bold">NEEDS:</span>
                <div className="mt-2 space-y-1">
                  {Object.entries(agent.needs).map(([need, value]) => (
                    <div
                      key={need}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-matrix-green-dim capitalize">
                        {need}:
                      </span>
                      <div className="flex items-center gap-2 flex-1 max-w-xs ml-2">
                        <div className="flex-1 bg-matrix-dark h-2 border border-matrix-green border-opacity-20">
                          <div
                            className={`h-full ${
                              value > 80
                                ? "bg-red-500"
                                : value > 50
                                ? "bg-yellow-500"
                                : "bg-matrix-green"
                            }`}
                            style={{
                              width: `${Math.min(value, 100)}%`,
                              opacity: 0.6,
                            }}
                          />
                        </div>
                        <span className="text-matrix-green-dim font-mono w-12 text-right">
                          {Math.round(value)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Goals */}
          {agent.goals &&
            Array.isArray(agent.goals) &&
            agent.goals.length > 0 && (
              <div>
                <span className="text-matrix-green font-bold">GOALS:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {agent.goals.map((goal, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-blue-500 bg-opacity-20 text-blue-400 border border-blue-500 border-opacity-30"
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {/* Inventory */}
          {agent.inventory && (
            <div>
              <span className="text-matrix-green font-bold">INVENTORY:</span>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-matrix-green-dim">Food:</span>{" "}
                  <span className="text-matrix-green">
                    {agent.inventory.food || 0}
                  </span>
                </div>
                <div>
                  <span className="text-matrix-green-dim">Credits:</span>{" "}
                  <span className="text-matrix-green">
                    {agent.inventory.credits || 0}
                  </span>
                </div>
                <div>
                  <span className="text-matrix-green-dim">Tools:</span>{" "}
                  <span className="text-matrix-green">
                    {agent.inventory.tools || 0}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Intent (from WebSocket, may be null) */}
          {agent.intent && typeof agent.intent === "object" && (
            <div>
              <span className="text-matrix-green font-bold">INTENT:</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {Object.entries(agent.intent).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-matrix-green-dim capitalize">
                      {key}:
                    </span>
                    <span className="text-matrix-green">
                      {(value * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Relationships - new structure: object with agent IDs as keys */}
          {agent.relationships &&
          typeof agent.relationships === "object" &&
          !Array.isArray(agent.relationships) &&
          Object.keys(agent.relationships).length > 0 ? (
            <div>
              <span className="text-matrix-green font-bold">
                RELATIONSHIPS ({Object.keys(agent.relationships).length}):
              </span>
              <div className="mt-2 space-y-2">
                {Object.entries(agent.relationships).map(([targetId, rel]) => (
                  <div
                    key={targetId}
                    className="text-xs border border-matrix-green border-opacity-20 p-2 bg-matrix-dark bg-opacity-30"
                  >
                    <div className="text-matrix-green font-bold mb-1">
                      {targetId}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {rel.affection !== undefined && (
                        <div>
                          <span className="text-matrix-green-dim">
                            Affection:
                          </span>{" "}
                          <span className="text-blue-400">
                            {(rel.affection * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                      {rel.trust !== undefined && (
                        <div>
                          <span className="text-matrix-green-dim">Trust:</span>{" "}
                          <span className="text-matrix-green">
                            {(rel.trust * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                      {rel.familiarity !== undefined && (
                        <div>
                          <span className="text-matrix-green-dim">
                            Familiarity:
                          </span>{" "}
                          <span className="text-yellow-400">
                            {(rel.familiarity * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                      {rel.last_interaction !== undefined && (
                        <div>
                          <span className="text-matrix-green-dim">
                            Last interaction:
                          </span>{" "}
                          <span className="text-matrix-green-dim">
                            Turn {rel.last_interaction}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <span className="text-matrix-green font-bold">
                RELATIONSHIPS:
              </span>
              <div className="mt-2 text-xs text-matrix-green-dim">
                No relationships
              </div>
            </div>
          )}

          {/* Beliefs */}
          {agent.beliefs &&
            typeof agent.beliefs === "object" &&
            !Array.isArray(agent.beliefs) &&
            Object.keys(agent.beliefs).length > 0 && (
              <div>
                <span className="text-matrix-green font-bold">BELIEFS:</span>
                <div className="mt-2 space-y-2">
                  {Object.entries(agent.beliefs).map(([topic, belief]) => (
                    <div
                      key={topic}
                      className="text-xs border border-matrix-green border-opacity-20 p-2"
                    >
                      <div className="text-matrix-green font-bold mb-1">
                        {belief.topic || topic}
                      </div>
                      <div className="space-y-1">
                        <div>
                          <span className="text-matrix-green-dim">
                            Polarity:
                          </span>{" "}
                          <span
                            className={
                              belief.polarity > 0
                                ? "text-green-400"
                                : belief.polarity < 0
                                ? "text-red-400"
                                : "text-matrix-green-dim"
                            }
                          >
                            {(belief.polarity * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-matrix-green-dim">
                            Confidence:
                          </span>{" "}
                          <span className="text-matrix-green">
                            {(belief.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-matrix-green-dim">Source:</span>{" "}
                          <span className="text-matrix-green-dim capitalize">
                            {belief.source || "unknown"}
                          </span>
                        </div>
                        {belief.last_updated_turn !== undefined && (
                          <div>
                            <span className="text-matrix-green-dim">
                              Updated:
                            </span>{" "}
                            <span className="text-matrix-green-dim">
                              Turn {belief.last_updated_turn}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default function AgentsPanel() {
  const t = useTranslation();
  const agents = useWorldStore((state) => state.agents);
  const [selectedAgentId, setSelectedAgentId] = useState(null);

  // Ensure agents is always an array
  const agentsArray = Array.isArray(agents) ? agents : [];

  // Find the current agent from the store based on selectedAgentId
  // This ensures the detail modal always shows the latest data from WebSocket
  const selectedAgent = selectedAgentId
    ? agentsArray.find((agent) => agent.id === selectedAgentId)
    : null;

  return (
    <>
      <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-4 h-full flex flex-col lg:min-h-0">
        <h2 className="text-lg font-bold text-matrix-green text-matrix-glow mb-4 tracking-wider flex-shrink-0">
          {t("panels.agents")}
        </h2>

        <div className="flex-1 lg:overflow-y-auto lg:min-h-0 scrollbar-matrix">
          {agentsArray.length === 0 ? (
            <div className="text-matrix-green-dim text-sm">NO AGENTS</div>
          ) : (
            <div className="pr-2">
              {agentsArray.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onSelect={(agent) => setSelectedAgentId(agent.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AgentDetail
        agent={selectedAgent}
        onClose={() => setSelectedAgentId(null)}
      />
    </>
  );
}
