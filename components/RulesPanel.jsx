"use client";

import { useEffect } from "react";
import { useWorldStore } from "../store/worldStore";
import { clientFetch } from "../lib/matrixApi";
import InfoPopup from "./InfoPopup";

export default function RulesPanel() {
  const rules = useWorldStore((state) => state.rules);
  const setRules = useWorldStore((state) => state.setRules);

  useEffect(() => {
    let isMounted = true;
    let interval = null;
    
    // Initial fetch
    const fetchRules = async () => {
      try {
        const data = await clientFetch("/world/rules");
        if (isMounted && data) {
          setRules(data);
        }
      } catch (error) {
        if (isMounted) console.error("Failed to fetch rules:", error);
      }
    };

    fetchRules();
    // Refresh every 10 seconds as fallback (WebSocket will update in real-time)
    interval = setInterval(fetchRules, 10000);
    
    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [setRules]);

  const rulesList = rules?.rules || [];

  const rulesInfoContent = (
    <>
      <div>
        <h3 className="text-matrix-green font-bold mb-2">RULES OVERVIEW</h3>
        <p className="mb-3">
          The Rules panel displays learned behavioral patterns and decision-making rules discovered by the simulation system. These rules represent "if-then" relationships that guide agent behavior and system responses.
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">RULE STRUCTURE</h3>
        <p className="mb-2">
          Each rule follows an "IF condition THEN effect" format:
        </p>
        <ul className="list-disc list-inside mb-3 space-y-1 ml-2">
          <li><strong>IF (Condition):</strong> The trigger or prerequisite that must be met</li>
          <li><strong>THEN (Effect):</strong> The action or outcome that follows</li>
        </ul>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">RULE METRICS</h3>
        <p className="mb-2">
          Each rule includes performance metrics:
        </p>
        <ul className="list-disc list-inside mb-3 space-y-1 ml-2">
          <li><strong>Confidence:</strong> How certain the system is about this rule (0-100%)</li>
          <li><strong>Success Rate:</strong> Percentage of times the rule worked as expected (0-100%)</li>
          <li><strong>Matches:</strong> Number of times this rule's condition was met</li>
          <li><strong>Failures:</strong> Number of times the rule didn't produce the expected effect</li>
          <li><strong>Created:</strong> Turn when the rule was first learned</li>
          <li><strong>Last Match:</strong> Most recent turn when the rule was applied</li>
        </ul>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">HOW RULES ARE LEARNED</h3>
        <p className="mb-3">
          The system learns rules by observing patterns in agent behavior and event outcomes. Rules with high confidence and success rates are more likely to be applied. Rules that consistently fail may be discarded or modified over time.
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">TOTAL RULES</h3>
        <p className="mb-3">
          The header shows the total number of rules learned by the system. This number grows as the simulation discovers new patterns and relationships.
        </p>
      </div>
    </>
  );

  return (
    <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-4 h-full flex flex-col lg:min-h-0">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-matrix-green text-matrix-glow tracking-wider">
            RULES
            {rules?.total_rules !== undefined && (
              <span className="text-sm text-matrix-green-dim ml-2">
                ({rules.total_rules} total)
              </span>
            )}
          </h2>
          <InfoPopup
            title="RULES DATA GUIDE"
            content={rulesInfoContent}
          />
        </div>
      </div>

      <div className="flex-1 lg:overflow-y-auto lg:min-h-0 scrollbar-matrix">
        {rulesList.length === 0 ? (
          <div className="text-matrix-green-dim text-sm">No rules learned yet</div>
        ) : (
          <div className="pr-2 space-y-4">
            {/* Limit displayed rules to 50 to reduce DOM nodes and improve performance */}
            {rulesList.slice(0, 50).map((rule, index) => (
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
