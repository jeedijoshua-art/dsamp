import React from 'react';
import {
  Users,
  ArrowRightLeft,
  Repeat,
  ShieldAlert,
  AlertTriangle,
  FileCheck2,
  Sparkles,
  Info
} from 'lucide-react';
import { InvestigationReport, CycleDetectionResult, GraphSummary } from '../types';

interface InvestigationSummaryCardsProps {
  hasRun: boolean;
  isInvestigating: boolean;
  summary?: GraphSummary;
  investigation?: InvestigationReport;
  cycleDetection?: CycleDetectionResult;
  onRunInvestigation?: () => void;
}

export const InvestigationSummaryCards: React.FC<InvestigationSummaryCardsProps> = ({
  hasRun,
  isInvestigating,
  summary,
  investigation,
  cycleDetection,
  onRunInvestigation
}) => {
  if (!hasRun) {
    return (
      <div className="w-full p-4 rounded-xl bg-navy-950/80 border border-slate-800 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-200 text-sm block">
              Ready for Investigation Analysis
            </span>
            <p className="text-slate-400 text-xs mt-0.5">
              Click &quot;Run Investigation&quot; to execute real C++17 forensic analysis, evaluate flow conservation, detect directed cycles, and inspect supporting evidence.
            </p>
          </div>
        </div>

        {onRunInvestigation && (
          <button
            onClick={onRunInvestigation}
            disabled={isInvestigating}
            className="shrink-0 px-4 py-2 rounded-lg font-bold text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-colors cursor-pointer disabled:opacity-50"
          >
            Run Investigation Now
          </button>
        )}
      </div>
    );
  }

  // Calculate unique flagged accounts and elevated-concern accounts
  const findings = investigation?.findings || [];
  const uniqueFlaggedAccounts = new Set<string>();
  const uniqueElevatedAccounts = new Set<string>();

  findings.forEach((f) => {
    f.flagged_accounts.forEach((acc) => {
      uniqueFlaggedAccounts.add(acc);
      if (f.severity === 'HIGH') {
        uniqueElevatedAccounts.add(acc);
      }
    });
  });

  const accountsAnalyzed = summary?.account_count ?? 0;
  const transactionsAnalyzed = summary?.transaction_count ?? 0;
  const cyclesCount = cycleDetection?.cycles?.length ?? 0;
  const totalFindings = investigation?.total_findings ?? findings.length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Accounts Analyzed */}
      <div className="p-3.5 rounded-xl bg-navy-900/90 border border-slate-800 shadow-md flex flex-col justify-between" title="Total unique account vertices in this scenario network">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Accounts
            </span>
            <Users className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-100 font-mono">
            {accountsAnalyzed}
          </div>
        </div>
        <div className="text-[10px] text-slate-400 mt-1 truncate border-t border-slate-800/60 pt-1 font-mono">
          Unique Vertices
        </div>
      </div>

      {/* 2. Transactions Analyzed */}
      <div className="p-3.5 rounded-xl bg-navy-900/90 border border-slate-800 shadow-md flex flex-col justify-between" title="Total directed payment edges evaluated by C++ engine">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Transactions
            </span>
            <ArrowRightLeft className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-100 font-mono">
            {transactionsAnalyzed}
          </div>
        </div>
        <div className="text-[10px] text-slate-400 mt-1 truncate border-t border-slate-800/60 pt-1 font-mono">
          Directed Edges
        </div>
      </div>

      {/* 3. Directed Cycles Detected */}
      <div className="p-3.5 rounded-xl bg-navy-900/90 border border-slate-800 shadow-md flex flex-col justify-between" title="Directed cycles and self-loops identified by three-state DFS back-edges">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Cycles Detected
            </span>
            <Repeat className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div
            className={`text-xl font-extrabold font-mono ${
              cyclesCount > 0 ? 'text-rose-400' : 'text-slate-100'
            }`}
          >
            {cyclesCount}
          </div>
        </div>
        <div className="text-[10px] text-slate-400 mt-1 truncate border-t border-slate-800/60 pt-1 font-mono">
          {cyclesCount === 1 ? '1 Closed Loop' : `${cyclesCount} DFS Loops`}
        </div>
      </div>

      {/* 4. Accounts Flagged for Review (Unique) */}
      <div className="p-3.5 rounded-xl bg-navy-900/90 border border-slate-800 shadow-md flex flex-col justify-between" title="Unique accounts meeting review criteria across all triggered rules">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Flagged Review
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div
            className={`text-xl font-extrabold font-mono ${
              uniqueFlaggedAccounts.size > 0 ? 'text-amber-400' : 'text-slate-100'
            }`}
          >
            {uniqueFlaggedAccounts.size}
          </div>
        </div>
        <div className="text-[10px] text-slate-400 mt-1 truncate border-t border-slate-800/60 pt-1 font-mono">
          Unique Accounts
        </div>
      </div>

      {/* 5. Elevated-Concern Accounts (Unique) */}
      <div className="p-3.5 rounded-xl bg-navy-900/90 border border-slate-800 shadow-md flex flex-col justify-between" title="Unique accounts involved in HIGH severity checks (e.g. circular flow)">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Elevated Concern
            </span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div
            className={`text-xl font-extrabold font-mono ${
              uniqueElevatedAccounts.size > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {uniqueElevatedAccounts.size}
          </div>
        </div>
        <div className="text-[10px] text-slate-400 mt-1 truncate border-t border-slate-800/60 pt-1 font-mono">
          High-Severity Accounts
        </div>
      </div>

      {/* 6. Total Rule Findings */}
      <div className="p-3.5 rounded-xl bg-navy-900/90 border border-slate-800 shadow-md flex flex-col justify-between" title="Total discrete forensic signals emitted by C++ rule engine">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Rule Findings
            </span>
            <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-100 font-mono">
            {totalFindings}
          </div>
        </div>
        <div className="text-[10px] text-slate-400 mt-1 truncate border-t border-slate-800/60 pt-1 font-mono">
          Discrete Signals
        </div>
      </div>
    </div>
  );
};
