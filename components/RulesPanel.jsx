"use client";

import { useEffect } from "react";
import { useWorldStore } from "../store/worldStore";
import { clientFetch } from "../lib/matrixApi";

export default function RulesPanel() {
  const rules = useWorldStore((state) => state.rules);
  const setRules = useWorldStore((state) => state.setRules);

  useEffect(() => {
    // Initial fetch
    const fetchRules = async () => {
      try {
        const data = await clientFetch("/world/rules");
        if (data) {
          setRules(data);
        }
      } catch (error) {
        console.error("Failed to fetch rules:", error);
      }
    };

    fetchRules();
    // Refresh every 10 seconds as fallback (WebSocket will update in real-time)
    const interval = setInterval(fetchRules, 10000);
    return () => clearInterval(interval);
  }, [setRules]);

  const rulesList = rules?.rules || [];

  return (
    <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-4 h-full flex flex-col lg:min-h-0">
      <h2 className="text-lg font-bold text-matrix-green text-matrix-glow mb-4 tracking-wider flex-shrink-0">
        RULES
        {rules?.total_rules !== undefined && (
          <span className="text-sm text-matrix-green-dim ml-2">
            ({rules.total_rules} total)
          </span>
        )}
      </h2>

      <div className="flex-1 lg:overflow-y-auto lg:min-h-0 scrollbar-matrix">
        {rulesList.length === 0 ? (
          <div className="text-matrix-green-dim text-sm">No rules learned yet</div>
        ) : (
          <div className="pr-2 space-y-4">
            {rulesList.map((rule, index) => (
              <div
                key={`rule-${rule.turn_created || index}`}
                className="border-b border-matrix-green border-opacity-10 pb-3 last:border-0"
              >
                <div className="mb-2">
                  <div className="text-xs text-matrix-green font-mono mb-1">
                    IF: {rule.condition}
                  </div>
                  <div className="text-xs text-matrix-green-dim font-mono">
                    THEN: {rule.effect}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-matrix-green-dim flex-wrap">
                  <span>Confidence: {(rule.confidence * 100).toFixed(1)}%</span>
                  <span>Success: {(rule.success_rate * 100).toFixed(1)}%</span>
                  <span>Matches: {rule.matches || 0}</span>
                  {rule.failures !== undefined && (
                    <span>Failures: {rule.failures}</span>
                  )}
                  {rule.turn_created && (
                    <span>Created: Turn {rule.turn_created}</span>
                  )}
                  {rule.last_matched && (
                    <span>Last Match: Turn {rule.last_matched}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
