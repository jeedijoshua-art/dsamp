import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  GitBranch,
  Repeat,
  Compass,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  Zap
} from 'lucide-react';
import {
  Account,
  BFSResult,
  DFSResult,
  CycleDetectionResult,
  ShortestPathResult,
  DirectedCycle,
  TraversalStep
} from '../types';

interface AlgorithmControlsProps {
  accounts: Account[];
  activeDatasetId: string;
  source: string;
  destination: string;
  onSourceChange: (src: string) => void;
  onDestChange: (dest: string) => void;
  bfsStartNode: string;
  onBfsStartChange: (node: string) => void;
  dfsStartNode: string;
  onDfsStartChange: (node: string) => void;
  onRunBFS: (startNode: string) => void;
  onRunDFS: (startNode: string) => void;
  onRunCycleDetection: () => void;
  onRunShortestPath: (source: string, destination: string) => void;
  onHighlight: (type: 'none' | 'path' | 'cycle' | 'bfs' | 'dfs', cycle?: DirectedCycle) => void;
  onStepHighlight?: (type: 'bfs' | 'dfs', step: TraversalStep | null) => void;
  bfsResult?: BFSResult | null;
  dfsResult?: DFSResult | null;
  cycleResult?: CycleDetectionResult | null;
  shortestPathResult?: ShortestPathResult | null;
  activeHighlight: string;
  loading: boolean;
}

export const AlgorithmControls: React.FC<AlgorithmControlsProps> = ({
  accounts,
  activeDatasetId,
  source,
  destination,
  onSourceChange,
  onDestChange,
  bfsStartNode,
  onBfsStartChange,
  dfsStartNode,
  onDfsStartChange,
  onRunBFS,
  onRunDFS,
  onRunCycleDetection,
  onRunShortestPath,
  onHighlight,
  onStepHighlight,
  bfsResult,
  dfsResult,
  cycleResult,
  shortestPathResult,
  activeHighlight,
  loading
}) => {
  const [activeTab, setActiveTab] = useState<'path' | 'cycle' | 'bfs' | 'dfs'>('path');

  // Step-by-Step Playback State for BFS
  const [bfsStepIdx, setBfsStepIdx] = useState<number>(-1);
  const [isBfsPlaying, setIsBfsPlaying] = useState<boolean>(false);
  const bfsTimerRef = useRef<any>(null);

  // Step-by-Step Playback State for DFS
  const [dfsStepIdx, setDfsStepIdx] = useState<number>(-1);
  const [isDfsPlaying, setIsDfsPlaying] = useState<boolean>(false);
  const dfsTimerRef = useRef<any>(null);

  // Reset steps when results or dataset changes
  useEffect(() => {
    setBfsStepIdx(-1);
    setIsBfsPlaying(false);
    if (bfsTimerRef.current) clearInterval(bfsTimerRef.current);
  }, [bfsResult, activeDatasetId]);

  useEffect(() => {
    setDfsStepIdx(-1);
    setIsDfsPlaying(false);
    if (dfsTimerRef.current) clearInterval(dfsTimerRef.current);
  }, [dfsResult, activeDatasetId]);

  // Handle BFS Play Timer
  useEffect(() => {
    if (isBfsPlaying && bfsResult?.steps && bfsResult.steps.length > 0) {
      bfsTimerRef.current = setInterval(() => {
        setBfsStepIdx((prev) => {
          const next = prev + 1;
          if (next >= bfsResult.steps!.length) {
            setIsBfsPlaying(false);
            return prev;
          }
          onStepHighlight?.('bfs', bfsResult.steps![next]);
          return next;
        });
      }, 900);
    } else {
      if (bfsTimerRef.current) clearInterval(bfsTimerRef.current);
    }
    return () => {
      if (bfsTimerRef.current) clearInterval(bfsTimerRef.current);
    };
  }, [isBfsPlaying, bfsResult, onStepHighlight]);

  // Handle DFS Play Timer
  useEffect(() => {
    if (isDfsPlaying && dfsResult?.steps && dfsResult.steps.length > 0) {
      dfsTimerRef.current = setInterval(() => {
        setDfsStepIdx((prev) => {
          const next = prev + 1;
          if (next >= dfsResult.steps!.length) {
            setIsDfsPlaying(false);
            return prev;
          }
          onStepHighlight?.('dfs', dfsResult.steps![next]);
          return next;
        });
      }, 900);
    } else {
      if (dfsTimerRef.current) clearInterval(dfsTimerRef.current);
    }
    return () => {
      if (dfsTimerRef.current) clearInterval(dfsTimerRef.current);
    };
  }, [isDfsPlaying, dfsResult, onStepHighlight]);

  const handleBfsStepNext = () => {
    if (!bfsResult?.steps) return;
    const nextIdx = Math.min(bfsStepIdx + 1, bfsResult.steps.length - 1);
    setBfsStepIdx(nextIdx);
    onStepHighlight?.('bfs', bfsResult.steps[nextIdx]);
  };

  const handleBfsStepPrev = () => {
    if (!bfsResult?.steps) return;
    const prevIdx = Math.max(bfsStepIdx - 1, 0);
    setBfsStepIdx(prevIdx);
    onStepHighlight?.('bfs', bfsResult.steps[prevIdx]);
  };

  const handleBfsStepReset = () => {
    setBfsStepIdx(-1);
    setIsBfsPlaying(false);
    onStepHighlight?.('bfs', null);
  };

  const handleDfsStepNext = () => {
    if (!dfsResult?.steps) return;
    const nextIdx = Math.min(dfsStepIdx + 1, dfsResult.steps.length - 1);
    setDfsStepIdx(nextIdx);
    onStepHighlight?.('dfs', dfsResult.steps[nextIdx]);
  };

  const handleDfsStepPrev = () => {
    if (!dfsResult?.steps) return;
    const prevIdx = Math.max(dfsStepIdx - 1, 0);
    setDfsStepIdx(prevIdx);
    onStepHighlight?.('dfs', dfsResult.steps[prevIdx]);
  };

  const handleDfsStepReset = () => {
    setDfsStepIdx(-1);
    setIsDfsPlaying(false);
    onStepHighlight?.('dfs', null);
  };

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(paise / 100);
  };

  // Check if shortest path result strictly matches the current controls
  const isPathResultStale =
    shortestPathResult &&
    (shortestPathResult.source !== source || shortestPathResult.destination !== destination);

  return (
    <div className="bg-navy-900/95 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
      {/* Workbench Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Algorithm Workbench
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
                C++17 Engine
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Interactive execution of graph algorithms on active dataset
            </p>
          </div>
        </div>

        {/* Clear Highlight Button */}
        {activeHighlight !== 'none' && (
          <button
            onClick={() => {
              onHighlight('none');
              onStepHighlight?.('bfs', null);
              setBfsStepIdx(-1);
              setDfsStepIdx(-1);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear Highlight
          </button>
        )}
      </div>

      {/* Algorithm Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-5 p-1 bg-navy-950/80 border border-slate-800/80 rounded-xl">
        <button
          onClick={() => setActiveTab('path')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'path'
              ? 'bg-cyan-500 text-navy-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Shortest Path</span>
        </button>
        <button
          onClick={() => setActiveTab('cycle')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'cycle'
              ? 'bg-rose-500 text-white shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>Cycle Detection</span>
        </button>
        <button
          onClick={() => setActiveTab('bfs')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'bfs'
              ? 'bg-emerald-500 text-navy-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>BFS Traversal</span>
        </button>
        <button
          onClick={() => setActiveTab('dfs')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'dfs'
              ? 'bg-purple-500 text-white shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>DFS Traversal</span>
        </button>
      </div>

      {/* TAB 1: SHORTEST PATH (BFS) */}
      {activeTab === 'path' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Source Account (Origin)
              </label>
              <select
                value={source}
                onChange={(e) => onSourceChange(e.target.value)}
                className="w-full bg-navy-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} — {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Destination Account (Target)
              </label>
              <select
                value={destination}
                onChange={(e) => onDestChange(e.target.value)}
                className="w-full bg-navy-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} — {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onRunShortestPath(source, destination)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-navy-950 font-bold text-xs rounded-lg transition-all shadow-md disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {loading ? 'Computing in C++...' : 'Reconstruct Shortest Path'}
            </button>

            {/* Swap Button */}
            <button
              type="button"
              onClick={() => {
                const s = source;
                const d = destination;
                onSourceChange(d);
                onDestChange(s);
              }}
              className="px-3 py-2 rounded-lg bg-navy-950 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              title="Reverse Source and Destination"
            >
              Swap Endpoints
            </button>

            {shortestPathResult?.path_exists && !isPathResultStale && (
              <button
                onClick={() => onHighlight('path')}
                className="flex items-center gap-1.5 px-3 py-2 bg-cyan-950 border border-cyan-500/50 hover:bg-cyan-900/50 text-cyan-300 text-xs font-medium rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Highlight on Canvas
              </button>
            )}
          </div>

          {/* Stale Parameters Notice */}
          {isPathResultStale && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  Query parameters changed to <strong>{source}</strong> → <strong>{destination}</strong>. Previous result invalidated.
                </span>
              </div>
              <button
                onClick={() => onRunShortestPath(source, destination)}
                className="px-2.5 py-1 bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-200 rounded font-bold text-[11px]"
              >
                Compute
              </button>
            </div>
          )}

          {/* Results Display */}
          {shortestPathResult && !isPathResultStale && (
            <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      shortestPathResult.path_exists ? 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]' : 'bg-rose-400'
                    }`}
                  />
                  {shortestPathResult.path_exists ? (
                    <span>
                      Shortest Path: <strong className="text-cyan-300">{shortestPathResult.source}</strong> →{' '}
                      <strong className="text-cyan-300">{shortestPathResult.destination}</strong>
                    </span>
                  ) : (
                    <span className="text-rose-300">Unreachable Destination: {shortestPathResult.source} → {shortestPathResult.destination}</span>
                  )}
                </span>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-800">
                    Time: {shortestPathResult.time_complexity}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800">
                    Space: {shortestPathResult.space_complexity}
                  </span>
                </div>
              </div>

              {shortestPathResult.path_exists ? (
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {shortestPathResult.node_path.map((nodeId, idx) => (
                      <React.Fragment key={idx}>
                        <div className="flex flex-col items-center min-w-0">
                          <span
                            className="px-3 py-1.5 bg-cyan-950/90 border border-cyan-400/50 text-cyan-200 rounded-lg font-mono text-xs font-bold shadow-sm max-w-[200px] truncate"
                            title={nodeId}
                          >
                            {nodeId}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                            {idx === 0
                              ? 'Origin'
                              : idx === shortestPathResult.node_path.length - 1
                              ? 'Target'
                              : `Hop ${idx}`}
                          </span>
                        </div>
                        {idx < shortestPathResult.node_path.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0 self-center" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-navy-900 border border-slate-800 min-w-0">
                      <div className="text-[10px] text-slate-400">Minimum Hop Count</div>
                      <div className="font-mono font-extrabold text-cyan-300 text-sm">
                        {shortestPathResult.hop_count} {shortestPathResult.hop_count === 1 ? 'hop' : 'hops'}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-navy-900 border border-slate-800 min-w-0">
                      <div className="text-[10px] text-slate-400">Cumulative Path Volume</div>
                      <div className="font-mono font-extrabold text-emerald-400 text-sm truncate" title={formatCurrency(shortestPathResult.total_volume_paise)}>
                        {formatCurrency(shortestPathResult.total_volume_paise)}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-navy-900 border border-slate-800 col-span-2 sm:col-span-1 min-w-0">
                      <div className="text-[10px] text-slate-400">Traversed Edge IDs</div>
                      <div
                        className="font-mono font-bold text-slate-200 truncate"
                        title={shortestPathResult.transaction_ids.join(', ') || 'None (Identity Path)'}
                      >
                        {shortestPathResult.transaction_ids.join(', ') || 'None (Identity Path)'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-rose-300 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                  {shortestPathResult.error_message || 'No directed route exists connecting these accounts in the active graph.'}
                </div>
              )}
            </div>
          )}

          {/* DSA Concept Card */}
          <div className="p-3.5 rounded-xl bg-navy-950/50 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs">
              <Info className="w-3.5 h-3.5" />
              DSA Concept: Breadth-First Search (BFS) Shortest Path
            </div>
            <p>
              In unweighted directed graphs, BFS computes the <strong>minimum-edge (hop) path</strong> in <strong>O(V + E)</strong> time using predecessor backtracking.
            </p>
            <div className="p-2 bg-navy-900/80 rounded border border-slate-800 text-slate-300 text-[10px]">
              <strong className="text-amber-300">Important Limitation:</strong> BFS shortest path minimizes transaction transfer hops, not cumulative rupee cost. For weighted financial fee minimization, Dijkstra's algorithm would be required.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIRECTED CYCLE DETECTION */}
      {activeTab === 'cycle' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-300 leading-relaxed">
              Detects circular directed fund routes using Three-State DFS node coloring (<span className="text-cyan-300 font-mono font-bold">WHITE</span> unvisited, <span className="text-amber-300 font-mono font-bold">GRAY</span> recursion stack, <span className="text-slate-400 font-mono font-bold">BLACK</span> completed).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRunCycleDetection}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-bold text-xs rounded-lg transition-all shadow-md disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {loading ? 'Evaluating in C++...' : 'Detect Directed Cycles'}
            </button>
          </div>

          {cycleResult && (
            <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      cycleResult.has_cycle ? 'bg-rose-400 shadow-[0_0_8px_#f43f5e]' : 'bg-emerald-400'
                    }`}
                  />
                  {cycleResult.has_cycle
                    ? `${cycleResult.cycles.length} Directed Cycle(s) Identified`
                    : 'Directed Acyclic Graph (DAG) — No Cycles'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  Time: {cycleResult.time_complexity}
                </span>
              </div>

              <div className="text-xs text-slate-400">{cycleResult.summary}</div>

              {cycleResult.cycles.map((c, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-navy-900 border border-rose-500/30 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-300 font-mono flex items-center gap-1.5">
                      Cycle #{idx + 1}
                      {c.is_self_loop ? (
                        <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                          Self-Loop (Same Vertex)
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.2 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded">
                          Multi-Node Round-Trip ({c.node_path.length - 1} vertices)
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => onHighlight('cycle', c)}
                      className="px-2.5 py-1 text-[11px] font-medium bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded hover:bg-rose-500/30 transition-colors"
                    >
                      Highlight Cycle
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {c.node_path.map((nodeId, nIdx) => (
                      <React.Fragment key={nIdx}>
                        <span
                          className="px-2.5 py-1 bg-rose-950 border border-rose-800 text-rose-200 rounded font-mono text-xs font-semibold max-w-[180px] truncate"
                          title={nodeId}
                        >
                          {nodeId}
                        </span>
                        {nIdx < c.node_path.length - 1 && (
                          <ArrowRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1.5 border-t border-slate-800 font-mono">
                    <span>
                      Cycle Volume: <strong className="text-slate-200">{formatCurrency(c.cycle_volume_paise)}</strong>
                    </span>
                    <span className="truncate max-w-[240px]" title={c.transaction_ids.join(', ')}>
                      Edges: {c.transaction_ids.join(', ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DSA Concept Card */}
          <div className="p-3.5 rounded-xl bg-navy-950/50 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-rose-300 font-bold text-xs">
              <Info className="w-3.5 h-3.5" />
              DSA Concept: Three-State DFS & Back-Edge Detection
            </div>
            <p>
              In directed graphs, simple two-state visited booleans cannot detect directed cycles correctly without confusing cross-edges in DAGs. The <strong>WHITE/GRAY/BLACK</strong> algorithm marks nodes currently on the call stack as <strong>GRAY</strong>. Any directed edge pointing back to a GRAY ancestor is an authentic back-edge.
            </p>
            <div className="p-2 bg-navy-900/80 rounded border border-slate-800 text-slate-300 text-[10px]">
              <strong className="text-amber-300">Forensic Context:</strong> A directed cycle indicates circular fund routing. It represents an informational review signal, not proof of financial wrongdoing.
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BFS TRAVERSAL */}
      {activeTab === 'bfs' && (
        <div className="space-y-4">
          <div className="max-w-xs">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Starting Account for BFS
            </label>
            <select
              value={bfsStartNode}
              onChange={(e) => onBfsStartChange(e.target.value)}
              className="w-full bg-navy-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-400"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} — {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onRunBFS(bfsStartNode)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-navy-950 font-bold text-xs rounded-lg transition-all shadow-md disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {loading ? 'Running in C++...' : 'Execute BFS (Queue)'}
            </button>

            {bfsResult?.success && (
              <button
                onClick={() => onHighlight('bfs')}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-950 border border-emerald-500/50 hover:bg-emerald-900/50 text-emerald-300 text-xs font-medium rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Highlight Full BFS Tree
              </button>
            )}
          </div>

          {/* Genuine Step-by-Step Playback Controls */}
          {bfsResult?.steps && bfsResult.steps.length > 0 && (
            <div className="p-3.5 rounded-xl bg-navy-950/90 border border-emerald-500/30 space-y-2.5 shadow-md">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  Step-by-Step Execution Trace
                </span>
                <span className="font-mono text-[11px] text-slate-300">
                  Step {bfsStepIdx >= 0 ? bfsStepIdx + 1 : 0} of {bfsResult.steps.length}
                </span>
              </div>

              {/* Step Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBfsStepPrev}
                  disabled={bfsStepIdx <= 0}
                  className="p-1.5 rounded-lg bg-navy-900 hover:bg-slate-800 border border-slate-700 text-slate-200 disabled:opacity-40 transition-colors"
                  title="Previous Step"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsBfsPlaying(!isBfsPlaying)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isBfsPlaying
                      ? 'bg-amber-500 text-navy-950'
                      : 'bg-emerald-500 text-navy-950 hover:bg-emerald-400'
                  }`}
                >
                  {isBfsPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" /> Auto Play
                    </>
                  )}
                </button>

                <button
                  onClick={handleBfsStepNext}
                  disabled={bfsStepIdx >= bfsResult.steps.length - 1}
                  className="p-1.5 rounded-lg bg-navy-900 hover:bg-slate-800 border border-slate-700 text-slate-200 disabled:opacity-40 transition-colors"
                  title="Next Step"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleBfsStepReset}
                  className="p-1.5 rounded-lg bg-navy-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors ml-auto"
                  title="Reset Step Trace"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Active Step Description */}
              {bfsStepIdx >= 0 && bfsResult.steps[bfsStepIdx] && (
                <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-500/20 text-[11px] font-mono text-emerald-200">
                  {bfsResult.steps[bfsStepIdx].description}
                </div>
              )}
            </div>
          )}

          {/* Results Summary */}
          {bfsResult && (
            <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  BFS Traversal Order from {bfsResult.start_node} ({bfsResult.traversal_order.length} vertices)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  Queue FIFO | Time: {bfsResult.time_complexity}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {bfsResult.traversal_order.map((nodeId, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono min-w-0 ${
                      bfsStepIdx >= 0 && bfsResult.steps && bfsResult.steps[bfsStepIdx]?.current_node === nodeId
                        ? 'bg-emerald-500 text-navy-950 font-bold border-emerald-300 shadow-[0_0_10px_#10b981]'
                        : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                    }`}
                  >
                    <span className="text-[10px] opacity-75 shrink-0">#{idx + 1}</span>
                    <span className="truncate max-w-[160px]" title={nodeId}>{nodeId}</span>
                    <span className="text-[9px] px-1 bg-emerald-900/60 rounded font-bold shrink-0">
                      dist={bfsResult.distances[nodeId]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DSA Concept Card */}
          <div className="p-3.5 rounded-xl bg-navy-950/50 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs">
              <Info className="w-3.5 h-3.5" />
              DSA Concept: Breadth-First Search (Queue Frontier Expansion)
            </div>
            <p>
              BFS explores vertices in concentric level-by-level frontiers using a FIFO queue. It runs in <strong>O(V + E)</strong> time and guarantees the shortest path in unweighted graphs.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: DFS TRAVERSAL */}
      {activeTab === 'dfs' && (
        <div className="space-y-4">
          <div className="max-w-xs">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Starting Account for DFS
            </label>
            <select
              value={dfsStartNode}
              onChange={(e) => onDfsStartChange(e.target.value)}
              className="w-full bg-navy-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-400"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} — {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onRunDFS(dfsStartNode)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs rounded-lg transition-all shadow-md disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {loading ? 'Running in C++...' : 'Execute DFS (Recursion / Stack)'}
            </button>

            {dfsResult?.success && (
              <button
                onClick={() => onHighlight('dfs')}
                className="flex items-center gap-1.5 px-3 py-2 bg-purple-950 border border-purple-500/50 hover:bg-purple-900/50 text-purple-300 text-xs font-medium rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Highlight Full DFS Tree
              </button>
            )}
          </div>

          {/* Genuine Step-by-Step Playback Controls */}
          {dfsResult?.steps && dfsResult.steps.length > 0 && (
            <div className="p-3.5 rounded-xl bg-navy-950/90 border border-purple-500/30 space-y-2.5 shadow-md">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-purple-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                  DFS Discovery Step-by-Step Trace
                </span>
                <span className="font-mono text-[11px] text-slate-300">
                  Step {dfsStepIdx >= 0 ? dfsStepIdx + 1 : 0} of {dfsResult.steps.length}
                </span>
              </div>

              {/* Step Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDfsStepPrev}
                  disabled={dfsStepIdx <= 0}
                  className="p-1.5 rounded-lg bg-navy-900 hover:bg-slate-800 border border-slate-700 text-slate-200 disabled:opacity-40 transition-colors"
                  title="Previous Step"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsDfsPlaying(!isDfsPlaying)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isDfsPlaying
                      ? 'bg-amber-500 text-navy-950'
                      : 'bg-purple-500 text-white hover:bg-purple-400'
                  }`}
                >
                  {isDfsPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" /> Auto Play
                    </>
                  )}
                </button>

                <button
                  onClick={handleDfsStepNext}
                  disabled={dfsStepIdx >= dfsResult.steps.length - 1}
                  className="p-1.5 rounded-lg bg-navy-900 hover:bg-slate-800 border border-slate-700 text-slate-200 disabled:opacity-40 transition-colors"
                  title="Next Step"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleDfsStepReset}
                  className="p-1.5 rounded-lg bg-navy-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors ml-auto"
                  title="Reset Step Trace"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Active Step Description */}
              {dfsStepIdx >= 0 && dfsResult.steps[dfsStepIdx] && (
                <div className="p-2.5 rounded-lg bg-purple-950/50 border border-purple-500/20 text-[11px] font-mono text-purple-200">
                  {dfsResult.steps[dfsStepIdx].description}
                </div>
              )}
            </div>
          )}

          {/* Results Summary */}
          {dfsResult && (
            <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  DFS Traversal &amp; Timestamps from {dfsResult.start_node} ({dfsResult.traversal_order.length} visited)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  Recursion LIFO | Time: {dfsResult.time_complexity}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {dfsResult.traversal_order.map((nodeId, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-navy-900 border border-purple-500/30 text-xs font-mono min-w-0"
                  >
                    <div className="font-bold text-purple-300 truncate" title={nodeId}>{nodeId}</div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
                      <span>d={dfsResult.discovery_times[nodeId]}</span>
                      <span>f={dfsResult.finish_times[nodeId]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DSA Concept Card */}
          <div className="p-3.5 rounded-xl bg-navy-950/50 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs">
              <Info className="w-3.5 h-3.5" />
              DSA Concept: Depth-First Search & Parenthesis Theorem
            </div>
            <p>
              DFS explores as deep as possible along each branch before backtracking. Discovery time $d[u]$ and finish time $f[u]$ satisfy the <strong>Parenthesis Theorem</strong>: vertex $v$ is a descendant of $u$ if and only if $[d[v], f[v]] \subset [d[u], f[u]]$.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
