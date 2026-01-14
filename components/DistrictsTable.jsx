"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { clientFetch, getDistrictDynamics } from "../lib/matrixApi";
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

export default function DistrictsTable() {
  const t = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get query params from URL
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const stateFilter = searchParams.get("state") || "";
  const orderBy = searchParams.get("order_by") || "id";
  const orderDir = searchParams.get("order_dir") || "asc";

  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    count: 0,
    total: 0,
    limit: 50,
    offset: 0,
    has_more: false,
  });
  const [districtDynamics, setDistrictDynamics] = useState({});
  const [dynamicsLoading, setDynamicsLoading] = useState({});

  const loadMoreRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Fetch districts
  const fetchDistricts = useCallback(
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
        if (stateFilter) params.set("state", stateFilter);
        if (orderBy) params.set("order_by", orderBy);
        if (orderDir) params.set("order_dir", orderDir);

        const response = await clientFetch(`/districts?${params.toString()}`);

        if (abortControllerRef.current.signal.aborted) return;

        if (Array.isArray(response)) {
          if (reset) {
            setDistricts(response);
          } else {
            setDistricts((prev) => [...prev, ...response]);
          }
          setPagination({
            count: response.length,
            total: response.length,
            limit: limit,
            offset: currentOffset,
            has_more: response.length === limit,
          });
        } else if (response && response.districts) {
          const districtsList = response.districts;
          if (reset) {
            setDistricts(districtsList);
          } else {
            setDistricts((prev) => [...prev, ...districtsList]);
          }
          setPagination({
            count: response.count || districtsList.length,
            total: response.total || districtsList.length,
            limit: response.limit || limit,
            offset: response.offset || currentOffset,
            has_more: response.has_more || false,
          });
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to fetch districts:", error);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [limit, offset, stateFilter, orderBy, orderDir]
  );

  // Track previous filter values to detect changes
  const prevFiltersRef = useRef({
    stateFilter,
    orderBy,
    orderDir,
  });
  const isInitialMount = useRef(true);

  // Initial load - fetch on mount and reset when filters or sorting change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchDistricts(true);
      return;
    }

    const filtersChanged =
      prevFiltersRef.current.stateFilter !== stateFilter ||
      prevFiltersRef.current.orderBy !== orderBy ||
      prevFiltersRef.current.orderDir !== orderDir;

    if (filtersChanged) {
      prevFiltersRef.current = { stateFilter, orderBy, orderDir };
      setLoading(true);
      setDistricts([]); // Clear existing districts when filters change
      fetchDistricts(true);
    }
  }, [stateFilter, orderBy, orderDir, fetchDistricts]);

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
      router.push(`/districts?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  // Load more when offset increases (infinite scroll)
  useEffect(() => {
    if (
      offset > prevOffsetRef.current &&
      offset > 0 &&
      !loading &&
      districts.length > 0
    ) {
      prevOffsetRef.current = offset;
      fetchDistricts(false);
    } else if (offset <= prevOffsetRef.current) {
      prevOffsetRef.current = offset;
    }
  }, [offset, loading, districts.length, fetchDistricts]);

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

  // Load district dynamics when district is visible
  const loadDistrictDynamics = useCallback(async (districtId) => {
    if (districtDynamics[districtId] || dynamicsLoading[districtId]) return;

    setDynamicsLoading((prev) => ({ ...prev, [districtId]: true }));
    try {
      const dynamics = await getDistrictDynamics(districtId);
      setDistrictDynamics((prev) => ({ ...prev, [districtId]: dynamics }));
    } catch (error) {
      console.error(`Failed to fetch dynamics for ${districtId}:`, error);
    } finally {
      setDynamicsLoading((prev) => ({ ...prev, [districtId]: false }));
    }
  }, [districtDynamics, dynamicsLoading]);

  const districtsInfoContent = (
    <>
      <div>
        <h3 className="text-matrix-green font-bold mb-2">DISTRICTS TABLE</h3>
        <p className="mb-3">
          This table displays districts from the Matrix simulation with
          server-side pagination, filtering, and sorting. Use the filters above
          to narrow down results, and scroll down to load more districts
          automatically.
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">FILTERS</h3>
        <ul className="list-disc list-inside mb-3 space-y-1 ml-2">
          <li>
            <strong>State:</strong> Filter by district state (active, struggling,
            collapsed, at_war)
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
          As you scroll down, more districts are automatically loaded. The table
          shows {pagination.count} of {pagination.total} total districts.
        </p>
      </div>
    </>
  );

  return (
    <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-4 h-full flex flex-col lg:min-h-0">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-matrix-green text-matrix-glow tracking-wider">
            DISTRICTS ({pagination.total})
          </h2>
          <InfoPopup
            title="DISTRICTS TABLE GUIDE"
            content={districtsInfoContent}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <label className="text-xs text-matrix-green-dim">State:</label>
          <select
            value={stateFilter}
            onChange={(e) => handleFilterChange("state", e.target.value)}
            className="bg-matrix-dark border border-matrix-green border-opacity-30 text-matrix-green text-xs px-2 py-1 focus:outline-none focus:border-matrix-green focus:border-opacity-60"
          >
            <option value="">All States</option>
            <option value="active">Active</option>
            <option value="struggling">Struggling</option>
            <option value="collapsed">Collapsed</option>
            <option value="at_war">At War</option>
          </select>
        </div>

        <div className="flex items-center gap-2 ml-auto text-xs text-matrix-green-dim">
          Showing {pagination.count} of {pagination.total}
        </div>
      </div>

      <div className="flex-1 lg:overflow-y-auto lg:min-h-0 scrollbar-matrix">
        {loading && districts.length === 0 ? (
          <div className="text-matrix-green-dim text-sm matrix-typing-inline">
            Loading districts...
          </div>
        ) : districts.length === 0 ? (
          <div className="text-matrix-green-dim text-sm">NO DISTRICTS FOUND</div>
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
                  <th className="px-4 py-3 text-left text-xs font-bold text-matrix-green">
                    STATE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-matrix-green">
                    TENSION
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-matrix-green">
                    FOOD STOCK
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-matrix-green">
                    JOBS
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-matrix-green">
                    WAR WEARINESS
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-matrix-green">
                    DEFENSIVE STRENGTH
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-matrix-green">
                    OFFENSIVE STRENGTH
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-matrix-green">
                    ALLIES
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-matrix-green">
                    ENEMIES
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-matrix-green">
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {districts.map((district) => {
                  const dynamics = districtDynamics[district.id];
                  const state = dynamics?.state || district.state || "--";
                  const warWeariness = dynamics?.war_weariness
                    ? (dynamics.war_weariness * 100).toFixed(1) + "%"
                    : "--";
                  const defensiveStrength = dynamics?.defensive_strength
                    ? (dynamics.defensive_strength * 100).toFixed(1) + "%"
                    : "--";
                  const offensiveStrength = dynamics?.offensive_strength
                    ? (dynamics.offensive_strength * 100).toFixed(1) + "%"
                    : "--";
                  const allies = dynamics?.allies || [];
                  const enemies = dynamics?.enemies || [];
                  const currentWar = dynamics?.current_war;

                  // Load dynamics if not loaded yet
                  if (!dynamics && !dynamicsLoading[district.id]) {
                    loadDistrictDynamics(district.id);
                  }

                  const tensionValue =
                    district.tension !== undefined
                      ? district.tension > 1
                        ? district.tension
                        : district.tension * 100
                      : null;

                  return (
                    <tr
                      key={district.id}
                      className="border-b border-matrix-green border-opacity-10 hover:bg-matrix-dark hover:bg-opacity-30 transition-colors"
                    >
                      <td className="px-4 py-3 text-xs text-matrix-green-dim font-mono">
                        {district.id}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <Link
                          href={`/districts/${district.id}`}
                          className="text-matrix-green hover:text-matrix-green-bright font-bold transition-colors"
                        >
                          {district.name || district.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            state === "active"
                              ? "bg-green-500 bg-opacity-20 text-green-400 border border-green-500 border-opacity-50"
                              : state === "struggling"
                              ? "bg-yellow-500 bg-opacity-20 text-yellow-400 border border-yellow-500 border-opacity-50"
                              : state === "collapsed"
                              ? "bg-red-500 bg-opacity-20 text-red-400 border border-red-500 border-opacity-50"
                              : state === "at_war"
                              ? "bg-orange-500 bg-opacity-20 text-orange-400 border border-orange-500 border-opacity-50"
                              : "bg-matrix-green bg-opacity-20 text-matrix-green border border-matrix-green border-opacity-50"
                          }`}
                        >
                          {state.toUpperCase()}
                        </span>
                        {currentWar && (
                          <span className="ml-2 text-xs text-red-400">
                            ⚔️ WAR
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {tensionValue !== null ? (
                          <span
                            className={
                              tensionValue > 80
                                ? "text-red-400"
                                : tensionValue > 50
                                ? "text-yellow-400"
                                : "text-matrix-green"
                            }
                          >
                            {Math.round(tensionValue)}%
                          </span>
                        ) : (
                          <span className="text-matrix-green-dim">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-matrix-green-dim">
                        {district.food_stock !== undefined
                          ? district.food_stock
                          : "--"}
                      </td>
                      <td className="px-4 py-3 text-xs text-matrix-green-dim">
                        {district.jobs_available !== undefined
                          ? district.jobs_available
                          : "--"}
                      </td>
                      <td className="px-4 py-3 text-xs text-center">
                        {warWeariness !== "--" ? (
                          <span className="text-orange-400">{warWeariness}</span>
                        ) : (
                          <span className="text-matrix-green-dim">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-center">
                        {defensiveStrength !== "--" ? (
                          <span className="text-blue-400">
                            {defensiveStrength}
                          </span>
                        ) : (
                          <span className="text-matrix-green-dim">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-center">
                        {offensiveStrength !== "--" ? (
                          <span className="text-red-400">
                            {offensiveStrength}
                          </span>
                        ) : (
                          <span className="text-matrix-green-dim">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-center">
                        {allies.length > 0 ? (
                          <span className="text-green-400">{allies.length}</span>
                        ) : (
                          <span className="text-matrix-green-dim">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-center">
                        {enemies.length > 0 ? (
                          <span className="text-red-400">{enemies.length}</span>
                        ) : (
                          <span className="text-matrix-green-dim">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <Link
                          href={`/districts/${district.id}`}
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
                    Loading more districts
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
