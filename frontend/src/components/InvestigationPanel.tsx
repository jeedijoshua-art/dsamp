import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  HelpCircle,
  FileText,
  Filter,
  Layers,
  ArrowRight
} from 'lucide-react';
import { RuleFinding, InvestigationReport } from '../types';

interface InvestigationPanelProps {
  report?: InvestigationReport;
  onSelectAccount?: (accountId: string) => void;
  onSelectTransaction?: (txId: string) => void;
}

export const InvestigationPanel: React.FC<InvestigationPanelProps> = ({
  report,
  onSelectAccount,
  onSelectTransaction
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'HIGH' | 'WARNING' | 'INFO'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const findings = report?.findings || [];

  const filteredFindings = findings.filter((f) => {
    const matchesSeverity = filterSeverity === 'ALL' || f.severity === filterSeverity;
    const matchesSearch =
      searchTerm.trim() === '' ||
      f.rule_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.flagged_accounts.some((a) => a.toLowerCase().includes(searchTerm.toLowerCase())) ||
      f.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(paise / 100);
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            HIGH SEVERITY
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            WARNING
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            INFORMATIONAL
          </span>
        );
    }
  };

  return (
    <div className="bg-navy-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Explainable Rule Findings
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {findings.length} Flagged
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Rule-based evidence verification with documented non-fraud alternate interpretations
            </p>
          </div>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-navy-950/80 border border-slate-800 rounded-lg">
          {(['ALL', 'HIGH', 'WARNING', 'INFO'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                filterSeverity === sev
                  ? 'bg-slate-700 text-slate-100 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
        {filteredFindings.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs bg-navy-950/50 rounded-xl border border-slate-800">
            No rule findings match the selected filters.
          </div>
        ) : (
          filteredFindings.map((finding, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-navy-950/80 border border-slate-800/90 hover:border-slate-700 transition-all shadow-md"
            >
              {/* Finding Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {finding.rule_name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    [{finding.rule_id}]
                  </span>
                </div>
                {getSeverityBadge(finding.severity)}
              </div>

              {/* Summary Statement */}
              <div className="text-xs text-slate-300 font-medium mb-3">
                {finding.summary}
              </div>

              {/* Amount Breakdown if applicable */}
              {(finding.amount_in_paise > 0 || finding.amount_out_paise > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs font-mono">
                  <div className="p-2 rounded bg-navy-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Total Inflow</div>
                    <div className="font-bold text-cyan-400">
                      {formatCurrency(finding.amount_in_paise)}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-navy-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Total Outflow</div>
                    <div className="font-bold text-teal-400">
                      {formatCurrency(finding.amount_out_paise)}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-navy-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Net Discrepancy</div>
                    <div
                      className={`font-bold ${
                        finding.discrepancy_paise > 0 ? 'text-rose-400' : 'text-slate-200'
                      }`}
                    >
                      {formatCurrency(finding.discrepancy_paise)}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-navy-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Retention Ratio</div>
                    <div className="font-bold text-amber-400">
                      {finding.discrepancy_pct.toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}

              {/* Participating Accounts & Transactions */}
              <div className="flex flex-wrap items-center gap-3 text-xs mb-3 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Accounts:</span>
                  {finding.flagged_accounts.map((acc, aIdx) => (
                    <button
                      key={aIdx}
                      onClick={() => onSelectAccount?.(acc)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 border border-slate-700 hover:border-cyan-500/50 transition-colors text-[11px]"
                    >
                      {acc}
                    </button>
                  ))}
                </div>

                {finding.flagged_transactions.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">Transactions:</span>
                    <span className="text-slate-300 text-[11px]">
                      {finding.flagged_transactions.slice(0, 4).join(', ')}
                      {finding.flagged_transactions.length > 4 && ` (+${finding.flagged_transactions.length - 4} more)`}
                    </span>
                  </div>
                )}
              </div>

              {/* Evidence Details */}
              <div className="p-2.5 rounded-lg bg-navy-900/60 border border-slate-800 text-[11px] text-slate-300 leading-relaxed mb-3">
                <strong className="text-slate-400 uppercase text-[10px] block mb-1">
                  Evidence Records:
                </strong>
                {finding.evidence_details}
              </div>

              {/* Mandatory Neutral Non-Fraud Explanation */}
              <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-300 text-[10px] uppercase block mb-0.5">
                    Legitimate Business Context (Non-Accusatory Assessment):
                  </strong>
                  {finding.neutral_explanation}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
