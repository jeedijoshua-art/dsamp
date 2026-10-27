import React from 'react';
import { Users, ArrowRightLeft, IndianRupee, Repeat, Layers, AlertCircle } from 'lucide-react';
import { GraphSummary, InvestigationReport, CycleDetectionResult } from '../types';

interface KPICardsProps {
  summary?: GraphSummary;
  investigation?: InvestigationReport;
  cycleDetection?: CycleDetectionResult;
  onSelectIntermediaries?: () => void;
  onSelectCycles?: () => void;
}

export const KPICards: React.FC<KPICardsProps> = ({
  summary,
  investigation,
  cycleDetection,
  onSelectIntermediaries,
  onSelectCycles
}) => {
  const accountCount = summary?.account_count ?? 0;
  const transactionCount = summary?.transaction_count ?? 0;
  const totalVolumeInr = summary?.total_volume_inr ?? 0;
  
  // Count accounts with in_degree >= 1 and out_degree >= 1
  const intermediaryCount = summary?.accounts.filter(
    (a) => (a.in_degree ?? 0) >= 1 && (a.out_degree ?? 0) >= 1
  ).length ?? 0;

  const cycleCount = cycleDetection?.cycles.length ?? 0;
  const findingsCount = investigation?.total_findings ?? 0;
  const highSeverityCount = investigation?.high_severity_count ?? 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const cards = [
    {
      title: 'Graph Vertices |V|',
      subtitle: 'Registered Accounts',
      value: accountCount.toString(),
      icon: Users,
      color: 'text-cyan-400',
      bgGlow: 'bg-cyan-500/10 border-cyan-500/20'
    },
    {
      title: 'Directed Edges |E|',
      subtitle: 'Active Transactions',
      value: transactionCount.toString(),
      icon: ArrowRightLeft,
      color: 'text-teal-400',
      bgGlow: 'bg-teal-500/10 border-teal-500/20'
    },
    {
      title: 'Network Volume',
      subtitle: 'Integer-Paise Flow',
      value: formatCurrency(totalVolumeInr),
      icon: IndianRupee,
      color: 'text-emerald-400',
      bgGlow: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'Intermediary Nodes',
      subtitle: 'In-Deg ≥ 1 & Out-Deg ≥ 1',
      value: intermediaryCount.toString(),
      icon: Layers,
      color: 'text-amber-400',
      bgGlow: 'bg-amber-500/10 border-amber-500/20',
      clickable: true,
      onClick: onSelectIntermediaries
    },
    {
      title: 'Directed Cycles',
      subtitle: '3-State DFS Back-Edges',
      value: cycleCount.toString(),
      icon: Repeat,
      color: cycleCount > 0 ? 'text-rose-400' : 'text-slate-400',
      bgGlow: cycleCount > 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-slate-800/40 border-slate-700/30',
      clickable: true,
      onClick: onSelectCycles
    },
    {
      title: 'Rule Findings',
      subtitle: highSeverityCount > 0 ? `${highSeverityCount} High Severity` : 'Audit Exceptions',
      value: findingsCount.toString(),
      icon: AlertCircle,
      color: highSeverityCount > 0 ? 'text-rose-400' : 'text-amber-400',
      bgGlow: 'bg-amber-500/10 border-amber-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            onClick={card.onClick}
            className={`p-3.5 rounded-xl border backdrop-blur-md bg-navy-900/80 transition-all duration-200 shadow-md ${
              card.clickable ? 'cursor-pointer hover:border-cyan-500/50 hover:scale-[1.02]' : ''
            } ${card.bgGlow}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <IconComponent className={`w-4 h-4 ${card.color}`} />
            </div>
            <div className="text-xl font-bold font-mono text-slate-100 truncate mb-0.5">
              {card.value}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {card.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
};
