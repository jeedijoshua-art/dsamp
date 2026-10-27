import React from 'react';
import {
  GitBranch,
  Repeat,
  Compass,
  ShieldAlert,
  Unlink,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import { PrebuiltDataset } from '../types';

interface DatasetSelectorProps {
  datasets: PrebuiltDataset[];
  activeDatasetId: string;
  onSelectDataset: (id: string) => void;
  loading: boolean;
}

const getDatasetIcon = (id: string) => {
  switch (id) {
    case 'basic_traversal':
      return GitBranch;
    case 'circular_transactions':
      return Repeat;
    case 'shortest_route':
      return Compass;
    case 'fraud_investigation':
      return ShieldAlert;
    case 'disconnected_graph':
      return Unlink;
    default:
      return Sparkles;
  }
};

const getDatasetColor = (id: string, isSelected: boolean) => {
  if (!isSelected) return 'text-slate-400 border-slate-800 bg-navy-950/70 hover:border-slate-700 hover:bg-navy-900/60';
  switch (id) {
    case 'basic_traversal':
      return 'text-emerald-300 border-emerald-500/60 bg-emerald-950/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50';
    case 'circular_transactions':
      return 'text-rose-300 border-rose-500/60 bg-rose-950/30 shadow-[0_0_20px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/50';
    case 'shortest_route':
      return 'text-cyan-300 border-cyan-500/60 bg-cyan-950/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50';
    case 'fraud_investigation':
      return 'text-amber-300 border-amber-500/60 bg-amber-950/30 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/50';
    case 'disconnected_graph':
      return 'text-purple-300 border-purple-500/60 bg-purple-950/30 shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/50';
    default:
      return 'text-cyan-300 border-cyan-500/60 bg-cyan-950/30';
  }
};

export const DatasetSelector: React.FC<DatasetSelectorProps> = ({
  datasets,
  activeDatasetId,
  onSelectDataset,
  loading
}) => {
  const activeDataset = datasets.find((d) => d.id === activeDatasetId) || datasets[0];

  return (
    <div className="w-full space-y-3 mb-4">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {datasets.map((dataset) => {
          const isSelected = dataset.id === activeDatasetId;
          const IconComponent = getDatasetIcon(dataset.id);
          const colorClass = getDatasetColor(dataset.id, isSelected);

          return (
            <button
              key={dataset.id}
              onClick={() => onSelectDataset(dataset.id)}
              disabled={loading}
              className={`flex flex-col justify-between p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${colorClass} disabled:opacity-50`}
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span className="font-bold text-xs truncate text-slate-100">
                      {dataset.title}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                      Active
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 line-clamp-1 mb-2 font-medium">
                  {dataset.subtitle}
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-slate-800/80 text-slate-400">
                <span>{dataset.node_count} Vertices</span>
                <span>•</span>
                <span>{dataset.edge_count} Edges</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Narrative & Learning Objective Banner */}
      {activeDataset && (
        <div className="p-3.5 rounded-xl bg-navy-900/80 border border-slate-800/90 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                {activeDataset.title}
                <span className="text-[10px] font-normal text-slate-400 font-mono">
                  ({activeDataset.subtitle})
                </span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {activeDataset.category}
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {activeDataset.description}
            </p>
          </div>

          <div className="shrink-0 flex items-start md:items-center gap-2 px-3 py-2 rounded-lg bg-navy-950/80 border border-cyan-500/30 text-cyan-200 text-[11px] font-mono max-w-md">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 md:mt-0" />
            <div>
              <span className="text-cyan-400 font-bold">Learning Objective: </span>
              {activeDataset.learning_objective}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
