import React from 'react';
import {
  ShieldAlert,
  Repeat,
  GitBranch,
  ArrowRight,
  Info,
  X,
  FileText,
  DollarSign,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react';
import { RuleFinding, Account, Transaction } from '../types';

interface EvidenceDetailsPanelProps {
  finding: RuleFinding;
  accounts: Account[];
  transactions: Transaction[];
  onClose: () => void;
  onSelectAccount?: (accountId: string) => void;
}

export const EvidenceDetailsPanel: React.FC<EvidenceDetailsPanelProps> = ({
  finding,
  accounts,
  transactions,
  onClose,
  onSelectAccount
}) => {
  const formatCurrency = (paise?: number) => {
    if (paise === undefined || paise === null) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(paise / 100);
  };

  // Find supporting transactions
  const supportingTxs = transactions.filter((t) =>
    finding.flagged_transactions.includes(t.id)
  );

  // Check if finding is a directed cycle
  const isCycle =
    finding.rule_id === 'RULE_CIRCULAR_ROUTING' || finding.rule_id === 'RULE_SELF_LOOP';

  // Algorithm Name
  const getAlgorithmName = () => {
    if (finding.rule_id === 'RULE_CIRCULAR_ROUTING' || finding.rule_id === 'RULE_SELF_LOOP') {
      return 'Three-State DFS (WHITE / GRAY / BLACK) Cycle Detection';
    }
    if (finding.rule_id === 'RULE_INTERMEDIARY_MULE') {
      return 'Flow Conservation & In-Degree / Out-Degree Intermediary Analysis';
    }
    if (finding.rule_id === 'RULE_ROUTE_DISCREPANCY') {
      return 'Breadth-First Search (BFS) Transmission Route Backtracking';
    }
    if (finding.rule_id === 'RULE_REPEATED_TRANSFERS') {
      return 'Pairwise Frequency Analysis';
    }
    return 'Forensic Graph Algorithm Rule Engine';
  };

  // Classification Tag
  const getClassificationLabel = () => {
    if (finding.severity === 'HIGH') {
      return {
        badge: 'Elevated Concern',
        color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        desc: 'Identified condition with significant structural anomalies (e.g. closed cycle routing or route transmission discrepancy).'
      };
    }
    if (finding.severity === 'WARNING') {
      return {
        badge: 'Flagged for Review',
        color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        desc: 'Identified condition worth examining (e.g. intermediary account fund retention or self-loop transfer).'
      };
    }
    return {
      badge: 'Informational Signal',
      color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      desc: 'Observed graph pattern consistent with expected operational batches or pass-through routing.'
    };
  };

  const classification = getClassificationLabel();

  return (
    <div className="rounded-2xl bg-navy-950/95 border-2 border-cyan-500/50 p-5 shadow-2xl backdrop-blur-md space-y-4">
      {/* Evidence Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-100 font-mono">
                {finding.rule_name}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${classification.color}`}>
                {classification.badge}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified Evidence &amp; Graph Signal Traceability
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
          title="Close Evidence Panel and Clear Selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Signal Summary Box */}
      <div className="p-3.5 rounded-xl bg-navy-900/90 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
            Detected Condition
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Algorithm: {getAlgorithmName()}
          </span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-medium">
          {finding.summary}
        </p>
      </div>

      {/* Directed Path / Cycle Sequence Visualization */}
      {finding.flagged_accounts.length > 1 && (
        <div className="p-3.5 rounded-xl bg-navy-900/90 border border-slate-800 space-y-2">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>{isCycle ? 'Directed Cycle Sequence' : 'Transmission Path'}</span>
            <span className="text-cyan-400 font-bold">
              {finding.flagged_accounts.length} Node{finding.flagged_accounts.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
            {finding.flagged_accounts.map((accId, i) => (
              <React.Fragment key={i}>
                <button
                  onClick={() => onSelectAccount?.(accId)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-950 text-slate-200 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-colors font-bold cursor-pointer"
                >
                  {accId}
                </button>
                {i < finding.flagged_accounts.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Financial Calculation & Flow Comparison */}
      {(finding.amount_in_paise > 0 || finding.amount_out_paise > 0) && (
        <div className="p-3.5 rounded-xl bg-navy-900/90 border border-slate-800 space-y-2">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Flow Conservation &amp; Retention Calculation
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-navy-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Total Inflow</span>
              <span className="font-bold text-cyan-400 text-sm">
                {formatCurrency(finding.amount_in_paise)}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-navy-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Total Outflow</span>
              <span className="font-bold text-teal-400 text-sm">
                {formatCurrency(finding.amount_out_paise)}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-navy-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Net Retention / Diff</span>
              <span
                className={`font-bold text-sm ${
                  finding.discrepancy_paise > 0 ? 'text-amber-400' : 'text-slate-200'
                }`}
              >
                {formatCurrency(finding.discrepancy_paise)}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-navy-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Retention Ratio</span>
              <span className="font-bold text-sm text-slate-200">
                {finding.discrepancy_pct > 0
                  ? `${finding.discrepancy_pct.toFixed(1)}%`
                  : '0.0%'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Supporting Transactions Ledger */}
      {supportingTxs.length > 0 && (
        <div className="p-3.5 rounded-xl bg-navy-900/90 border border-slate-800 space-y-2">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Supporting Transaction Records</span>
            <span className="text-slate-500 font-mono text-[10px]">
              {supportingTxs.length} Record{supportingTxs.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px]">
                  <th className="py-1.5 px-2">TX ID</th>
                  <th className="py-1.5 px-2">From</th>
                  <th className="py-1.5 px-2">To</th>
                  <th className="py-1.5 px-2 text-right">Amount</th>
                  <th className="py-1.5 px-2">Memo / Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-[11px]">
                {supportingTxs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30">
                    <td className="py-1.5 px-2 font-bold text-cyan-400">{tx.id}</td>
                    <td className="py-1.5 px-2 text-slate-300">{tx.from_account}</td>
                    <td className="py-1.5 px-2 text-slate-300">{tx.to_account}</td>
                    <td className="py-1.5 px-2 text-right font-bold text-slate-100">
                      {formatCurrency(tx.amount_paise)}
                    </td>
                    <td className="py-1.5 px-2 text-slate-400 text-[10px] truncate max-w-[200px]">
                      {tx.memo || 'Direct settlement'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Neutral Non-Fraud Explanation (Section 3.G) */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-slate-200 text-[11px] font-mono uppercase block">
            Legitimate Business Context &amp; Safety of Interpretation:
          </strong>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            {finding.neutral_explanation}
          </p>
          <p className="text-[10px] text-slate-500 font-mono mt-1">
            * Note: A graph cycle or amount discrepancy is an investigation signal, not automated proof of fraudulent activity.
          </p>
        </div>
      </div>

      {/* Close Action */}
      <div className="flex justify-end pt-2 border-t border-slate-800">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
        >
          Close Evidence &amp; Clear Highlights
        </button>
      </div>
    </div>
  );
};
