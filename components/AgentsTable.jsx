"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { clientFetch } from "../lib/matrixApi";
import { useTranslation } from "../lib/useTranslation";
import InfoPopup from "./InfoPopup";

const SortableHeader = ({
  children,
  sortKey,
  currentSort,
  sortDirection,
  onSort,
}) => {
  const isActive = currentSort === sortKey;

  return (
    <th
      className="px-4 py-3 text-left text-xs font-bold text-matrix-green cursor-pointer hover:text-matrix-green-bright transition-colors select-none"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-2">
        {children}
        <span className="text-matrix-green-dim">
          {isActive ? (sortDirection === "asc" ? "↑" : "↓") : "⇅"}
        </span>
      </div>
    </th>
  );
};

export default function AgentsTable() {
  const t = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get query params from URL
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const district = searchParams.get("district") || "";
  const role = searchParams.get("role") || "";
  const aliveOnly = searchParams.get("alive_only") === "true";
  const orderBy = searchParams.get("order_by") || "id";
  const orderDir = searchParams.get("order_dir") || "asc";

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    count: 0,
    total: 0,
    limit: 50,
    offset: 0,
    has_more: false,
  });
  const [districts, setDistricts] = useState([]);
  const [roles, setRoles] = useState([]);

  const loadMoreRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Fetch districts and roles for filters
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [districtsData, agentsData] = await Promise.all([
          clientFetch("/districts"),
          clientFetch("/agents?limit=1000"), // Get all agents to extract unique roles
        ]);

        if (Array.isArray(districtsData)) {
          setDistricts(districtsData);
        }

        // Extract unique roles from agents
        if (agentsData && Array.isArray(agentsData.agents)) {
          const uniqueRoles = [
            ...new Set(
              agentsData.agents.map((a) => a.role).filter((r) => r && r !== "")
            ),
          ].sort();
          setRoles(uniqueRoles);
        }
      } catch (error) {
        console.error("Failed to fetch filter data:", error);
      }
    };

    fetchFilters();
  }, []);

  // Fetch agents with current filters and pagination
  const fetchAgents = useCallback(
    async (reset = false) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const currentOffset = reset ? 0 : offset;
      setLoadingMore(!reset);

      try {
        // Build query string
        const params = new URLSearchParams();
        params.set("limit", limit.toString());
        params.set("offset", currentOffset.toString());
        if (district) params.set("district", district);
        if (role) params.set("role", role);
        if (aliveOnly) params.set("alive_only", "true");
        if (orderBy) params.set("order_by", orderBy);
        if (orderDir) params.set("order_dir", orderDir);

        const response = await clientFetch(`/agents?${params.toString()}`);

        if (abortControllerRef.current.signal.aborted) return;

        if (response && response.agents) {
          if (reset) {
            setAgents(response.agents);
          } else {
            setAgents((prev) => [...prev, ...response.agents]);
          }
          setPagination({
            count: response.count || response.agents.length,
            total: response.total || response.agents.length,
            limit: response.limit || limit,
            offset: response.offset || currentOffset,
            has_more: response.has_more || false,
          });
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to fetch agents:", error);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [limit, offset, district, role, aliveOnly, orderBy, orderDir]
  );

  // Track previous filter values to detect changes
  const prevFiltersRef = useRef({
    district,
    role,
    aliveOnly,
    orderBy,
    orderDir,
  });
  const isInitialMount = useRef(true);

  // Initial load - fetch on mount and reset when filters or sorting change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchAgents(true);
      return;
    }

    const filtersChanged =
      prevFiltersRef.current.district !== district ||
      prevFiltersRef.current.role !== role ||
      prevFiltersRef.current.aliveOnly !== aliveOnly ||
      prevFiltersRef.current.orderBy !== orderBy ||
      prevFiltersRef.current.orderDir !== orderDir;

    if (filtersChanged) {
      prevFiltersRef.current = { district, role, aliveOnly, orderBy, orderDir };
      setLoading(true);
      setAgents([]); // Clear existing agents when filters change
      fetchAgents(true);
    }
  }, [district, role, aliveOnly, orderBy, orderDir, fetchAgents]);

  // Track previous offset to detect when it increases (infinite scroll)
  const prevOffsetRef = useRef(offset);

  // Update URL query params
  const updateQueryParams = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || value === null || value === undefined) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.push(`/agents?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  // Load more when offset increases (infinite scroll)
  useEffect(() => {
    if (
      offset > prevOffsetRef.current &&
      offset > 0 &&
      !loading &&
      agents.length > 0
    ) {
      prevOffsetRef.current = offset;
      fetchAgents(false);
    } else if (offset <= prevOffsetRef.current) {
      prevOffsetRef.current = offset;
    }
  }, [offset, loading, agents.length, fetchAgents]);

  // Infinite scroll observer
  useEffect(() => {
    if (!pagination.has_more || loadingMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          pagination.has_more &&
          !loadingMore &&
          !loading
        ) {
          // Load next page
          const newOffset = pagination.offset + pagination.limit;
          updateQueryParams({ offset: newOffset.toString() });
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [
    pagination.has_more,
    pagination.offset,
    pagination.limit,
    loadingMore,
    loading,
    updateQueryParams,
  ]);

  const handleSort = useCallback(
    (key) => {
      const newOrderDir =
        orderBy === key && orderDir === "asc" ? "desc" : "asc";
      updateQueryParams({ order_by: key, order_dir: newOrderDir, offset: "0" });
    },
    [orderBy, orderDir, updateQueryParams]
  );

  const handleFilterChange = useCallback(
    (key, value) => {
      updateQueryParams({ [key]: value, offset: "0" });
    },
    [updateQueryParams]
  );

  const agentsInfoContent = (
    <>
      <div>
        <h3 className="text-matrix-green font-bold mb-2">AGENTS TABLE</h3>
        <p className="mb-3">
          This table displays agents from the Matrix simulation with server-side
          pagination, filtering, and sorting. Use the filters above to narrow
          down results, and scroll down to load more agents automatically.
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">FILTERS</h3>
        <ul className="list-disc list-inside mb-3 space-y-1 ml-2">
          <li>
            <strong>District:</strong> Filter by district name
          </li>
          <li>
            <strong>Role:</strong> Filter by agent role
          </li>
          <li>
            <strong>Alive Only:</strong> Show only living agents
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">SORTING</h3>
        <p className="mb-3">
          Click any column header to sort by that field. Sorting is performed
          server-side. Click again to reverse the sort order. The active sort
          column is indicated by an arrow (↑ for ascending, ↓ for descending).
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">INFINITE SCROLLING</h3>
        <p className="mb-3">
          As you scroll down, more agents are automatically loaded. The table
          shows {pagination.count} of {pagination.total} total agents.
        </p>
      </div>
    </>
  );

  return (
    <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-4 h-full flex flex-col lg:min-h-0">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-matrix-green text-matrix-glow tracking-wider">
            AGENTS ({pagination.total})
          </h2>
          <InfoPopup title="AGENTS TABLE GUIDE" content={agentsInfoContent} />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <label className="text-xs text-matrix-green-dim">District:</label>
          <select
            value={district}
            onChange={(e) => handleFilterChange("district", e.target.value)}
            className="bg-matrix-dark border border-matrix-green border-opacity-30 text-matrix-green text-xs px-2 py-1 focus:outline-none focus:border-matrix-green focus:border-opacity-60"
          >
            <option value="">All Districts</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name || d.id}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-matrix-green-dim">Role:</label>
          <select
            value={role}
            onChange={(e) => handleFilterChange("role", e.target.value)}
            className="bg-matrix-dark border border-matrix-green border-opacity-30 text-matrix-green text-xs px-2 py-1 focus:outline-none focus:border-matrix-green focus:border-opacity-60"
          >
            <option value="">All Roles</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-matrix-green-dim">Alive Only:</label>
          <input
            type="checkbox"
            checked={aliveOnly}
            onChange={(e) =>
              handleFilterChange("alive_only", e.target.checked ? "true" : "")
            }
            className="w-4 h-4 accent-matrix-green"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto text-xs text-matrix-green-dim">
          Showing {pagination.count} of {pagination.total}
        </div>
      </div>

      <div className="flex-1 lg:overflow-y-auto lg:min-h-0 scrollbar-matrix">
        {loading && agents.length === 0 ? (
          <div className="text-matrix-green-dim text-sm matrix-typing-inline">
            Loading agents...
          </div>
        ) : agents.length === 0 ? (
          <div className="text-matrix-green-dim text-sm">NO AGENTS FOUND</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-matrix-dark bg-opacity-50 sticky top-0 z-10">
                <tr className="border-b border-matrix-green border-opacity-30">
                  <SortableHeader
                    sortKey="id"
                    currentSort={orderBy}
                    sortDirection={orderDir}
                    onSort={handleSort}
                  >
                    ID
                  </SortableHeader>
                  <SortableHeader
                    sortKey="name"
                    currentSort={orderBy}
                    sortDirection={orderDir}
                    onSort={handleSort}
                  >
                    NAME
                  </SortableHeader>
                  <SortableHeader
                    sortKey="is_alive"
                    currentSort={orderBy}
                    sortDirection={orderDir}
                    onSort={handleSort}
                  >
                    STATUS
                  </SortableHeader>
                  <SortableHeader
                    sortKey="district"
                    currentSort={orderBy}
                    sortDirection={orderDir}
                    onSort={handleSort}
                  >
                    DISTRICT
                  </SortableHeader>
                  <SortableHeader
                    sortKey="role"
                    currentSort={orderBy}
                    sortDirection={orderDir}
                    onSort={handleSort}
                  >
                    ROLE
                  </SortableHeader>
                  <SortableHeader
                    sortKey="age"
                    currentSort={orderBy}
                    sortDirection={orderDir}
                    onSort={handleSort}
                  >
                    AGE
                  </SortableHeader>
                  <SortableHeader
                    sortKey="mood"
                    currentSort={orderBy}
                    sortDirection={orderDir}
                    onSort={handleSort}
                  >
                    MOOD
                  </SortableHeader>
                  <th className="px-4 py-3 text-left text-xs font-bold text-matrix-green">
                    ACTION
                  </th>
                  <SortableHeader
                    sortKey="relationships_count"
                    currentSort={orderBy}
                    sortDirection={orderDir}
                    onSort={handleSort}
                  >
                    RELATIONS
                  </SortableHeader>
                  <SortableHeader
                    sortKey="beliefs_count"
                    currentSort={orderBy}
                    sortDirection={orderDir}
                    onSort={handleSort}
                  >
                    BELIEFS
                  </SortableHeader>
                  <th className="px-4 py-3 text-left text-xs font-bold text-matrix-green">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => {
                  const relationshipsCount =
                    agent.relationships &&
                    typeof agent.relationships === "object" &&
                    !Array.isArray(agent.relationships)
                      ? Object.keys(agent.relationships).length
                      : agent.relationships_count || 0;

                  const beliefsCount =
                    agent.beliefs &&
                    typeof agent.beliefs === "object" &&
                    !Array.isArray(agent.beliefs)
                      ? Object.keys(agent.beliefs).length
                      : agent.beliefs_count || 0;

                  return (
                    <tr
                      key={agent.id}
                      className="border-b border-matrix-green border-opacity-10 hover:bg-matrix-dark hover:bg-opacity-30 transition-colors"
                    >
                      <td className="px-4 py-3 text-xs text-matrix-green-dim font-mono">
                        {agent.id}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <Link
                          href={`/agents/${agent.id}`}
                          className="text-matrix-green hover:text-matrix-green-bright font-bold transition-colors"
                        >
                          {agent.name || `Agent ${agent.id}`}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {agent.is_alive !== undefined && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              agent.is_alive
                                ? "bg-matrix-green bg-opacity-20 text-matrix-green border border-matrix-green border-opacity-50"
                                : "bg-red-500 bg-opacity-20 text-red-400 border border-red-500 border-opacity-50"
                            }`}
                          >
                            {agent.is_alive ? "●" : "✕"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-matrix-green-dim">
                        {agent.district || "--"}
                      </td>
                      <td className="px-4 py-3 text-xs text-matrix-green-dim">
                        {agent.role || "--"}
                      </td>
                      <td className="px-4 py-3 text-xs text-matrix-green-dim">
                        {agent.age !== undefined
                          ? `${agent.age} / ${agent.lifespan || "?"}`
                          : "--"}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {agent.mood !== undefined ? (
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
                        ) : (
                          <span className="text-matrix-green-dim">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-matrix-green-dim max-w-xs truncate">
                        {agent.current_action || "--"}
                      </td>
                      <td className="px-4 py-3 text-xs text-center">
                        {relationshipsCount > 0 ? (
                          <span className="text-blue-400">
                            {relationshipsCount}
                          </span>
                        ) : (
                          <span className="text-matrix-green-dim">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-center">
                        {beliefsCount > 0 ? (
                          <span className="text-purple-400">
                            {beliefsCount}
                          </span>
                        ) : (
                          <span className="text-matrix-green-dim">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <Link
                          href={`/agents/${agent.id}`}
                          className="text-matrix-green hover:text-matrix-green-bright border border-matrix-green border-opacity-30 hover:border-opacity-60 transition-all px-2 py-1 inline-block text-[10px] font-mono"
                        >
                          EXAMINE →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Infinite scroll trigger */}
            {pagination.has_more && (
              <div
                ref={loadMoreRef}
                className="h-20 flex items-center justify-center"
              >
                {loadingMore && (
                  <div className="text-matrix-green-dim text-xs matrix-typing-inline">
                    Loading more agents
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
