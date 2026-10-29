import React, { useState, useMemo } from 'react';
import {
  Repeat,
  GitBranch,
  ShieldAlert,
  Search,
  Filter,
  ArrowRight,
  Eye,
  AlertTriangle,
  Info,
  Layers,
  ChevronRight,
  CheckCircle2,
  X
} from 'lucide-react';
import { RuleFinding } from '../types';

export type FindingCategory = 'ALL' | 'CYCLE' | 'INTERMEDIARY' | 'RULE';
export type SeverityFilter = 'ALL' | 'HIGH' | 'WARNING' | 'INFO';

interface InvestigationFindingsPanelProps {
  findings: RuleFinding[];
  selectedFinding: RuleFinding | null;
  onInspectEvidence: (finding: RuleFinding) => void;
  onClearEvidence?: () => void;
  onSelectAccount?: (accountId: string) => void;
}

export const categorizeFinding = (finding: RuleFinding): 'CYCLE' | 'INTERMEDIARY' | 'RULE' => {
  if (finding.rule_id === 'RULE_CIRCULAR_ROUTING' || finding.rule_id === 'RULE_SELF_LOOP') {
    return 'CYCLE';
  }
  if (finding.rule_id === 'RULE_INTERMEDIARY_MULE') {
    return 'INTERMEDIARY';
  }
  return 'RULE';
};

export const InvestigationFindingsPanel: React.FC<InvestigationFindingsPanelProps> = ({
  findings,
  selectedFinding,
  onInspectEvidence,
  onClearEvidence,
  onSelectAccount
}) => {
  const [categoryFilter, setCategoryFilter] = useState<FindingCategory>('ALL');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Deduplicate and filter findings
  const filteredFindings = useMemo(() => {
    const seen = new Set<string>();
    const uniqueFindings: RuleFinding[] = [];

    findings.forEach((f) => {
      const key = `${f.rule_id}:${[...f.flagged_accounts].sort().join(',')}:${[...f.flagged_transactions].sort().join(',')}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueFindings.push(f);
      }
    });

    return uniqueFindings.filter((f) => {
      const cat = categorizeFinding(f);
      if (categoryFilter !== 'ALL' && cat !== categoryFilter) return false;
      if (severityFilter !== 'ALL' && f.severity !== severityFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = f.rule_name.toLowerCase().includes(q);
        const matchesSummary = f.summary.toLowerCase().includes(q);
        const matchesAccounts = f.flagged_accounts.some((a) => a.toLowerCase().includes(q));
        const matchesTxs = f.flagged_transactions.some((tx) => tx.toLowerCase().includes(q));
        if (!matchesName && !matchesSummary && !matchesAccounts && !matchesTxs) {
          return false;
        }
      }

      return true;
    });
  }, [findings, categoryFilter, severityFilter, searchQuery]);

  // Counts for category badges
  const cycleCount = findings.filter((f) => categorizeFinding(f) === 'CYCLE').length;
  const intermediaryCount = findings.filter((f) => categorizeFinding(f) === 'INTERMEDIARY').length;
  const ruleCount = findings.filter((f) => categorizeFinding(f) === 'RULE').length;

  const formatCurrency = (paise?: number) => {
    if (paise === undefined || paise === null) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(paise / 100);
  };

  const getObservedEvidence = (finding: RuleFinding): string => {
    const cat = categorizeFinding(finding);
    const accCount = finding.flagged_accounts.length;
    const txCount = finding.flagged_transactions.length;

    if (cat === 'CYCLE') {
      const cycleSeq =
        finding.flagged_accounts.length > 1
          ? `${finding.flagged_accounts.join(' → ')} → ${finding.flagged_accounts[0]}`
          : finding.flagged_accounts[0] || 'Unknown';
      const amountStr =
        finding.amount_in_paise > 0
          ? ` Value transferred: ${formatCurrency(finding.amount_in_paise)} across ${txCount} directed edge${txCount === 1 ? '' : 's'}.`
          : ` Evaluated across ${txCount} directed edge${txCount === 1 ? '' : 's'}.`;
      return `Closed transaction loop detected across ${accCount} account${accCount === 1 ? '' : 's'} (${cycleSeq}).${amountStr}`;
    }

    if (cat === 'INTERMEDIARY') {
      const acc = finding.flagged_accounts[0] || 'Account';
      const inStr = formatCurrency(finding.amount_in_paise);
      const outStr = formatCurrency(finding.amount_out_paise);
      const diffStr = formatCurrency(Math.abs(finding.discrepancy_paise));
      const pctStr = `${Math.abs(finding.discrepancy_pct).toFixed(1)}%`;

      if (finding.discrepancy_paise > 0) {
        return `Account ${acc} received ${inStr} and transferred ${outStr} in the evaluated transaction set, leaving a ${diffStr} net retention (${pctStr} of inflow) across ${txCount} transaction record${txCount === 1 ? '' : 's'}.`;
      } else if (finding.discrepancy_paise < 0) {
        return `Account ${acc} received ${inStr} and transferred ${outStr} in the evaluated transaction set, exhibiting a ${diffStr} net outflow surplus across ${txCount} transaction record${txCount === 1 ? '' : 's'}.`;
      } else {
        return `Account ${acc} achieved exact flow balance: received ${inStr} and transferred ${outStr} across ${txCount} transaction record${txCount === 1 ? '' : 's'}.`;
      }
    }

    if (finding.rule_id === 'RULE_ROUTE_DISCREPANCY') {
      const fromAcc = finding.flagged_accounts[0] || 'Origin';
      const toAcc = finding.flagged_accounts[finding.flagged_accounts.length - 1] || 'Destination';
      const inStr = formatCurrency(finding.amount_in_paise);
      const outStr = formatCurrency(finding.amount_out_paise);
      const diffStr = formatCurrency(finding.discrepancy_paise);
      const pctStr = `${finding.discrepancy_pct.toFixed(1)}%`;
      return `Transmission route from ${fromAcc} to ${toAcc} dispatched ${inStr} but destination received ${outStr}, resulting in a ${diffStr} delta (${pctStr} difference) across ${txCount} edge${txCount === 1 ? '' : 's'}.`;
    }

    if (finding.rule_id === 'RULE_REPEATED_TRANSFERS') {
      return `High-frequency pairwise transfers observed between counterparties [${finding.flagged_accounts.join(', ')}] across ${txCount} transaction records totalling ${formatCurrency(finding.amount_in_paise || finding.amount_out_paise)}.`;
    }

    return `Evaluated graph condition: ${accCount} account${accCount === 1 ? '' : 's'} and ${txCount} transaction edge${txCount === 1 ? '' : 's'} matching structural rule criteria.`;
  };

  const getRuleInterpretation = (finding: RuleFinding): string => {
    const cat = categorizeFinding(finding);
    if (cat === 'CYCLE') {
      return 'Configured condition: Three-state DFS detected a back-edge into active recursion stack (GRAY ancestor), verifying that money routes back to the originating vertex without terminating at a genuine external settlement.';
    }
    if (cat === 'INTERMEDIARY') {
      if (finding.discrepancy_paise > 0) {
        return `Configured condition: Pass-through intermediary account retained funds exceeding configured tolerance threshold (${finding.discrepancy_pct.toFixed(1)}% retained balance vs threshold).`;
      } else if (finding.discrepancy_paise < 0) {
        return 'Configured condition: Account outgoing volume exceeded evaluated incoming transfers within the observed transaction subset.';
      } else {
        return 'Configured condition: Balanced intermediary pass-through flow evaluated with 0% net retention.';
      }
    }
    if (finding.rule_id === 'RULE_ROUTE_DISCREPANCY') {
      return 'Configured condition: Breadth-First Search (BFS) route backtracking identified variance between upstream dispatch and downstream settlement beyond allowable tolerance.';
    }
    if (finding.rule_id === 'RULE_REPEATED_TRANSFERS') {
      return 'Configured condition: Pairwise transaction frequency between accounts exceeded burst-rate limits within the evaluated window.';
    }
    return `Configured condition: Graph structural properties satisfied the preconditions defined for ${finding.rule_name}.`;
  };

  const getRecommendedAction = (finding: RuleFinding): string => {
    const cat = categorizeFinding(finding);
    if (cat === 'CYCLE') {
      return 'Review transaction memos, invoice contracts, and corporate registrations to determine whether circular pattern represents legitimate trade financing, merchant settlement loops, or corporate treasury sweeps.';
    }
    if (cat === 'INTERMEDIARY') {
      if (finding.discrepancy_paise > 0) {
        return 'Review related transaction records and corporate business context to determine whether retained balance corresponds to an authorized escrow reserve, service commission, or delayed batch disbursement.';
      }
      return 'Review transaction records and settlement agreements to verify funding sources and counterparty operational schedules.';
    }
    if (finding.rule_id === 'RULE_ROUTE_DISCREPANCY') {
      return 'Audit intermediary route nodes to determine whether discrepancy represents intermediate gateway fees, tax withholding, or currency conversion charges.';
    }
    if (finding.rule_id === 'RULE_REPEATED_TRANSFERS') {
      return 'Verify customer relationship and transaction purpose to determine whether repeated payments are scheduled installments or split invoice settlements.';
    }
    return 'Review the involved account profiles and transaction documents in line with compliance risk-scoring guidelines.';
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
            ELEVATED CONCERN
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
            FLAGGED FOR REVIEW
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
            INFORMATIONAL
          </span>
        );
    }
  };

  const getCategoryIcon = (cat: 'CYCLE' | 'INTERMEDIARY' | 'RULE') => {
    switch (cat) {
      case 'CYCLE':
        return <Repeat className="w-3.5 h-3.5 text-rose-400" />;
      case 'INTERMEDIARY':
        return <GitBranch className="w-3.5 h-3.5 text-amber-400" />;
      case 'RULE':
        return <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="rounded-2xl bg-navy-900/90 border border-slate-800 p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Panel Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Investigation Findings</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {filteredFindings.length} of {findings.length} Signals
            </span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Traceable graph patterns and rule conditions verified by the C++ engine.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search account, tx, rule..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-navy-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Finding Type Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-navy-950 border border-slate-800/80">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
              categoryFilter === 'ALL'
                ? 'bg-slate-700 text-slate-100 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Types ({findings.length})
          </button>
          <button
            onClick={() => setCategoryFilter('CYCLE')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
              categoryFilter === 'CYCLE'
                ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Repeat className="w-3 h-3" />
            <span>Cycles ({cycleCount})</span>
          </button>
          <button
            onClick={() => setCategoryFilter('INTERMEDIARY')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
              categoryFilter === 'INTERMEDIARY'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3 h-3" />
            <span>Intermediaries ({intermediaryCount})</span>
          </button>
          <button
            onClick={() => setCategoryFilter('RULE')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
              categoryFilter === 'RULE'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            <span>Rules ({ruleCount})</span>
          </button>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-navy-950 border border-slate-800/80">
          {(['ALL', 'HIGH', 'WARNING', 'INFO'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                severityFilter === sev
                  ? 'bg-slate-700 text-slate-100 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev === 'ALL'
                ? 'All Severity'
                : sev === 'HIGH'
                ? 'High'
                : sev === 'WARNING'
                ? 'Warning'
                : 'Info'}
            </button>
          ))}
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
        {filteredFindings.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-xl bg-navy-950/60 border border-slate-800 text-slate-400 text-xs">
            <CheckCircle2 className="w-6 h-6 text-slate-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-300">No findings match the selected filters.</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Try adjusting the finding category, severity, or search query.
            </p>
          </div>
        ) : (
          filteredFindings.map((finding, idx) => {
            const cat = categorizeFinding(finding);
            const isSelected =
              selectedFinding &&
              selectedFinding.rule_id === finding.rule_id &&
              selectedFinding.summary === finding.summary;

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all duration-150 space-y-3 ${
                  isSelected
                    ? 'bg-navy-950/95 border-cyan-500/70 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50'
                    : 'bg-navy-950/80 border-slate-800/90 hover:border-slate-700 hover:bg-navy-900/50'
                }`}
              >
                {/* Header: Category Icon, Rule Name, ID, Severity */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded-lg bg-navy-900 border border-slate-800">
                      {getCategoryIcon(cat)}
                    </div>
                    <span className="text-xs font-bold font-mono text-slate-100 truncate">
                      {finding.rule_name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                      [{finding.rule_id}]
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getSeverityBadge(finding.severity)}
                  </div>
                </div>

                {/* Primary Summary Statement */}
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {finding.summary}
                </p>

                {/* Three-Tier Evidence Breakdown (Requirement 4) */}
                <div className="space-y-2 text-xs">
                  {/* Observed Evidence */}
                  <div className="p-2.5 rounded-lg bg-navy-900/90 border border-slate-800/80">
                    <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>Observed Evidence</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed text-[11px]">
                      {getObservedEvidence(finding)}
                    </p>
                  </div>

                  {/* Rule Interpretation */}
                  <div className="p-2.5 rounded-lg bg-navy-900/90 border border-slate-800/80">
                    <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>Rule Interpretation</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {getRuleInterpretation(finding)}
                    </p>
                  </div>

                  {/* Recommended Action */}
                  <div className="p-2.5 rounded-lg bg-navy-900/90 border border-slate-800/80">
                    <div className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      <span>Recommended Action</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      {getRecommendedAction(finding)}
                    </p>
                  </div>
                </div>

                {/* Financial Amounts / Discrepancy Bar & Formula */}
                {(finding.amount_in_paise > 0 || finding.amount_out_paise > 0) && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                      <div className="p-2 rounded-lg bg-navy-900/90 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Total Inflow</div>
                        <div className="font-bold text-cyan-400">
                          {formatCurrency(finding.amount_in_paise)}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-navy-900/90 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Total Outflow</div>
                        <div className="font-bold text-teal-400">
                          {formatCurrency(finding.amount_out_paise)}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-navy-900/90 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Net Flow Delta</div>
                        <div
                          className={`font-bold ${
                            finding.discrepancy_paise > 0 ? 'text-amber-400' : 'text-slate-300'
                          }`}
                        >
                          {formatCurrency(finding.discrepancy_paise)}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-navy-900/90 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Retention Ratio</div>
                        <div className="font-bold text-slate-200">
                          {finding.discrepancy_pct > 0
                            ? `${finding.discrepancy_pct.toFixed(1)}%`
                            : '0.0%'}
                        </div>
                      </div>
                    </div>

                    {/* Discrepancy Formula Display */}
                    {finding.discrepancy_paise > 0 && (
                      <div className="p-2 rounded-lg bg-navy-950/80 border border-slate-800 text-[11px] font-mono text-slate-300">
                        <span className="text-[10px] text-slate-500 uppercase block font-bold">
                          Calculation Invariant:
                        </span>
                        <span>
                          Δ = Inflow ({formatCurrency(finding.amount_in_paise)}) − Outflow ({formatCurrency(finding.amount_out_paise)}) = <strong className="text-amber-400 font-bold">{formatCurrency(finding.discrepancy_paise)}</strong> ({finding.discrepancy_pct.toFixed(1)}% retention)
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Accounts & Transactions Badges + Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-slate-800/80">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                    <span className="text-[10px] text-slate-500 uppercase">Accounts:</span>
                    {finding.flagged_accounts.map((acc, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => onSelectAccount?.(acc)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 border border-slate-700 hover:border-cyan-500/50 transition-colors text-[10px] cursor-pointer"
                        title="Focus Account on Graph"
                      >
                        {acc}
                      </button>
                    ))}

                    {finding.flagged_transactions.length > 0 && (
                      <div className="flex items-center gap-1 ml-1">
                        <span className="text-[10px] text-slate-500 uppercase">Tx:</span>
                        {finding.flagged_transactions.slice(0, 3).map((txId, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px]"
                          >
                            {txId}
                          </span>
                        ))}
                        {finding.flagged_transactions.length > 3 && (
                          <span className="text-[10px] text-slate-500">
                            +{finding.flagged_transactions.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {isSelected ? (
                    <button
                      onClick={onClearEvidence}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow"
                      title="Clear Selection and restore normal graph"
                    >
                      <X className="w-3.5 h-3.5 text-slate-300" />
                      <span>Clear Highlight</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onInspectEvidence(finding)}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow"
                      title="Highlight finding on Graph"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Inspect Evidence</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

