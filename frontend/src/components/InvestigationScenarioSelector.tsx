import React from 'react';
import {
  Repeat,
  GitBranch,
  ShieldAlert,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { InvestigationScenario } from '../types';

interface InvestigationScenarioSelectorProps {
  scenarios: InvestigationScenario[];
  activeScenarioId: string;
  onSelectScenario: (scenarioId: string) => void;
  disabled?: boolean;
}

const getScenarioIcon = (id: string) => {
  switch (id) {
    case 'circular_flow':
      return Repeat;
    case 'intermediary_account':
      return GitBranch;
    case 'multiple_signals':
      return ShieldAlert;
    default:
      return Sparkles;
  }
};

const getScenarioColors = (id: string, isSelected: boolean) => {
  if (!isSelected) {
    return 'border-slate-800/90 bg-navy-950/70 hover:border-slate-700 hover:bg-navy-900/60 text-slate-300';
  }
  switch (id) {
    case 'circular_flow':
      return 'border-rose-500/70 bg-gradient-to-br from-rose-950/40 to-navy-950/90 ring-1 ring-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)] text-rose-200';
    case 'intermediary_account':
      return 'border-amber-500/70 bg-gradient-to-br from-amber-950/40 to-navy-950/90 ring-1 ring-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)] text-amber-200';
    case 'multiple_signals':
      return 'border-cyan-500/70 bg-gradient-to-br from-cyan-950/40 to-navy-950/90 ring-1 ring-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] text-cyan-200';
    default:
      return 'border-cyan-500/70 bg-cyan-950/30 text-cyan-200';
  }
};

export const InvestigationScenarioSelector: React.FC<InvestigationScenarioSelectorProps> = ({
  scenarios,
  activeScenarioId,
  onSelectScenario,
  disabled
}) => {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
        <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold text-slate-300">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          Select Investigation Scenario
        </span>
        <span className="text-[11px] text-slate-500 font-mono">
          3 Scenarios Available
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scenarios.map((scenario) => {
          const isSelected = scenario.id === activeScenarioId;
          const Icon = getScenarioIcon(scenario.id);
          const colorClass = getScenarioColors(scenario.id, isSelected);

          return (
            <button
              key={scenario.id}
              onClick={() => onSelectScenario(scenario.id)}
              disabled={disabled}
              className={`p-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between gap-3 cursor-pointer disabled:opacity-50 ${colorClass}`}
            >
              <div>
                {/* Header: Icon, Name & Active Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected
                          ? 'bg-slate-800 text-cyan-300'
                          : 'bg-navy-900 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                    </div>
                    <span className="font-bold text-sm text-slate-100 truncate">
                      {scenario.name}
                    </span>
                  </div>

                  {isSelected ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">Select</span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {scenario.description}
                </p>
              </div>

              {/* Graph Concept & Counts Bar */}
              <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
                <span className="font-mono text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800 truncate">
                  {scenario.graph_concept}
                </span>
                <span className="font-mono font-bold text-slate-300 shrink-0">
                  {scenario.node_count}V • {scenario.edge_count}E
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
