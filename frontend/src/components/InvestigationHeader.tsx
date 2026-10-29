import React from 'react';
import {
  ShieldAlert,
  Play,
  RotateCcw,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

interface InvestigationHeaderProps {
  scenarioName: string;
  accountCount: number;
  transactionCount: number;
  isInvestigating: boolean;
  hasRun: boolean;
  onRunInvestigation: () => void;
  onResetScenario: () => void;
  error?: string | null;
}

export const InvestigationHeader: React.FC<InvestigationHeaderProps> = ({
  scenarioName,
  accountCount,
  transactionCount,
  isInvestigating,
  hasRun,
  onRunInvestigation,
  onResetScenario,
  error
}) => {
  return (
    <div className="w-full rounded-2xl bg-gradient-to-r from-navy-950/95 via-navy-900/95 to-slate-900/95 border border-cyan-500/30 p-5 shadow-2xl backdrop-blur-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title, Description & Metadata */}
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <ShieldAlert className="w-4 h-4 text-navy-950 font-bold" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">
              Fraud Investigation
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 shadow-sm">
              Scenario: {scenarioName}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-slate-300 bg-slate-800/80 border border-slate-700">
              {accountCount} Accounts • {transactionCount} Transactions
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Analyze transaction networks, detect suspicious patterns, and inspect supporting evidence.
          </p>
        </div>

        {/* Primary and Secondary Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Secondary Action: Reset or Rerun */}
          <button
            onClick={onResetScenario}
            disabled={isInvestigating}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 hover:shadow-md"
            title="Reset scenario graph to deterministic standard"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Scenario</span>
          </button>

          {/* Primary Action: Run Investigation */}
          <button
            onClick={onRunInvestigation}
            disabled={isInvestigating}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all cursor-pointer shadow-lg disabled:opacity-60 disabled:cursor-not-allowed ${
              hasRun
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-navy-950 shadow-[0_0_20px_rgba(20,184,166,0.35)]'
                : 'bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-navy-950 shadow-[0_0_25px_rgba(6,182,212,0.45)] ring-2 ring-cyan-400/50'
            }`}
          >
            {isInvestigating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-navy-950" />
                <span>Running C++ Engine...</span>
              </>
            ) : hasRun ? (
              <>
                <RefreshCw className="w-4 h-4 text-navy-950" />
                <span>Rerun Investigation</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-navy-950" />
                <span>Run Investigation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
