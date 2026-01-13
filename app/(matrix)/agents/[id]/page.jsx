"use client";

import { useParams } from "next/navigation";
import { useWorldStore } from "../../../../store/worldStore";
import { useTranslation } from "../../../../lib/useTranslation";
import Link from "next/link";

export default function AgentDetailPage() {
  const params = useParams();
  const agentId = params.id;
  const t = useTranslation();
  const agents = useWorldStore((state) => state.agents);

  const agent = Array.isArray(agents)
    ? agents.find((a) => a.id === agentId)
    : null;

  if (!agent) {
    return (
      <div className="h-full p-8">
        <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-6">
          <h1 className="text-xl font-bold text-matrix-green mb-4">
            Agent Not Found
          </h1>
          <p className="text-matrix-green-dim mb-4">
            The agent with ID "{agentId}" could not be found.
          </p>
          <Link
            href="/agents"
            className="text-matrix-green hover:text-matrix-green-bright border border-matrix-green border-opacity-30 px-4 py-2 hover:border-opacity-60 transition-all inline-block"
          >
            ← Back to Agents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-4 lg:p-8 lg:overflow-y-auto">
      <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-matrix-green text-matrix-glow mb-2">
                {agent.name || `Agent ${agent.id}`}
              </h1>
              <p className="text-matrix-green-dim text-sm">ID: {agent.id}</p>
            </div>
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
          <Link
            href="/agents"
            className="text-matrix-green hover:text-matrix-green-bright border border-matrix-green border-opacity-30 px-4 py-2 hover:border-opacity-60 transition-all"
          >
            ← Back to Agents
          </Link>
        </div>

        <div className="space-y-6 text-sm">
          {/* Basic Info */}
          <div>
            <h2 className="text-lg font-bold text-matrix-green mb-3">
              BASIC INFORMATION
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-matrix-green-dim">District:</span>{" "}
                <span className="text-matrix-green">
                  {agent.district || "--"}
                </span>
              </div>
              <div>
                <span className="text-matrix-green-dim">Location:</span>{" "}
                <span className="text-matrix-green">
                  {agent.location || "--"}
                </span>
              </div>
              <div>
                <span className="text-matrix-green-dim">
                  {t("agents.role")}:
                </span>{" "}
                <span className="text-matrix-green">{agent.role || "--"}</span>
              </div>
              {agent.age !== undefined && (
                <div>
                  <span className="text-matrix-green-dim">Age:</span>{" "}
                  <span className="text-matrix-green">
                    {agent.age} / {agent.lifespan || "?"} turns
                  </span>
                </div>
              )}
              {agent.current_action && (
                <div className="col-span-2">
                  <span className="text-matrix-green-dim">Current Action:</span>{" "}
                  <span className="text-matrix-green">
                    {agent.current_action}
                  </span>
                </div>
              )}
              {agent.mood !== undefined && (
                <div>
                  <span className="text-matrix-green-dim">
                    {t("agents.mood")}:
                  </span>{" "}
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
            </div>
          </div>

          {/* Needs */}
          {agent.needs &&
            typeof agent.needs === "object" &&
            !Array.isArray(agent.needs) && (
              <div>
                <h2 className="text-lg font-bold text-matrix-green mb-3">
                  NEEDS
                </h2>
                <div className="space-y-2">
                  {Object.entries(agent.needs).map(([need, value]) => (
                    <div
                      key={need}
                      className="flex items-center justify-between text-sm"
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
                <h2 className="text-lg font-bold text-matrix-green mb-3">
                  GOALS
                </h2>
                <div className="flex flex-wrap gap-2">
                  {agent.goals.map((goal, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-3 py-1 bg-blue-500 bg-opacity-20 text-blue-400 border border-blue-500 border-opacity-30"
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
              <h2 className="text-lg font-bold text-matrix-green mb-3">
                INVENTORY
              </h2>
              <div className="grid grid-cols-3 gap-4 text-sm">
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

          {/* Intent */}
          {agent.intent && typeof agent.intent === "object" && (
            <div>
              <h2 className="text-lg font-bold text-matrix-green mb-3">
                INTENT
              </h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(agent.intent).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
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

          {/* Relationships */}
          {agent.relationships &&
            typeof agent.relationships === "object" &&
            !Array.isArray(agent.relationships) &&
            Object.keys(agent.relationships).length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-matrix-green mb-3">
                  RELATIONSHIPS ({Object.keys(agent.relationships).length})
                </h2>
                <div className="space-y-3">
                  {Object.entries(agent.relationships).map(
                    ([targetId, rel]) => (
                      <div
                        key={targetId}
                        className="border border-matrix-green border-opacity-20 p-3 bg-matrix-dark bg-opacity-30"
                      >
                        <div className="text-matrix-green font-bold mb-2">
                          {targetId}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
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
                              <span className="text-matrix-green-dim">
                                Trust:
                              </span>{" "}
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
                    )
                  )}
                </div>
              </div>
            )}

          {/* Beliefs */}
          {agent.beliefs &&
            typeof agent.beliefs === "object" &&
            !Array.isArray(agent.beliefs) &&
            Object.keys(agent.beliefs).length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-matrix-green mb-3">
                  BELIEFS ({Object.keys(agent.beliefs).length})
                </h2>
                <div className="space-y-3">
                  {Object.entries(agent.beliefs).map(([topic, belief]) => (
                    <div
                      key={topic}
                      className="border border-matrix-green border-opacity-20 p-3"
                    >
                      <div className="text-matrix-green font-bold mb-2 text-sm">
                        {belief.topic || topic}
                      </div>
                      <div className="space-y-1 text-xs">
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

          {/* Family */}
          {(agent.children_ids ||
            agent.parents_ids ||
            (Array.isArray(agent.children_ids) &&
              agent.children_ids.length > 0) ||
            (Array.isArray(agent.parents_ids) &&
              agent.parents_ids.length > 0)) && (
            <div>
              <h2 className="text-lg font-bold text-matrix-green mb-3">
                FAMILY
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {agent.children_ids &&
                  Array.isArray(agent.children_ids) &&
                  agent.children_ids.length > 0 && (
                    <div>
                      <span className="text-matrix-green-dim">Children:</span>{" "}
                      <span className="text-matrix-green">
                        {agent.children_ids.join(", ")}
                      </span>
                    </div>
                  )}
                {agent.parents_ids &&
                  Array.isArray(agent.parents_ids) &&
                  agent.parents_ids.length > 0 && (
                    <div>
                      <span className="text-matrix-green-dim">Parents:</span>{" "}
                      <span className="text-matrix-green">
                        {agent.parents_ids.join(", ")}
                      </span>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
