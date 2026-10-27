import React from 'react';
import {
  Network,
  Compass,
  ShieldAlert,
  FileSpreadsheet,
  BookOpen,
  ChevronRight
} from 'lucide-react';

export type TabType = 'canvas' | 'algorithms' | 'investigation' | 'ledger' | 'academic';

interface SidebarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  findingsCount: number;
  cyclesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onChangeTab,
  findingsCount,
  cyclesCount
}) => {
  const navItems = [
    {
      id: 'canvas' as TabType,
      label: 'Network Graph',
      sublabel: 'Interactive React Flow Canvas',
      icon: Network,
      color: 'text-cyan-400'
    },
    {
      id: 'algorithms' as TabType,
      label: 'Algorithm Studio',
      sublabel: 'BFS, DFS, Cycles & Shortest Path',
      icon: Compass,
      color: 'text-teal-400',
      badge: cyclesCount > 0 ? `${cyclesCount} Cycle(s)` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    {
      id: 'investigation' as TabType,
      label: 'Investigation Rules',
      sublabel: 'Mules, Discrepancies & Evidence',
      icon: ShieldAlert,
      color: 'text-amber-400',
      badge: findingsCount > 0 ? `${findingsCount}` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      id: 'ledger' as TabType,
      label: 'Transaction Ledger',
      sublabel: 'Searchable Directed Edges',
      icon: FileSpreadsheet,
      color: 'text-emerald-400'
    },
    {
      id: 'academic' as TabType,
      label: 'Academic Dossier',
      sublabel: 'Data Structures & Complexity',
      icon: BookOpen,
      color: 'text-purple-400'
    }
  ];

  return (
    <aside className="w-full md:w-64 shrink-0 space-y-1.5">
      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1 font-semibold">
        Investigation Modules
      </div>
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChangeTab(item.id)}
            className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
              isActive
                ? 'bg-navy-900 border-cyan-500/40 shadow-lg shadow-cyan-950/40 text-slate-100'
                : 'bg-navy-950/60 border-slate-800/80 hover:bg-navy-900/60 hover:border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`p-2 rounded-lg border ${
                  isActive
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate flex items-center gap-1.5">
                  {item.label}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {item.sublabel}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform ${
                  isActive ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600'
                }`}
              />
            </div>
          </button>
        );
      })}
    </aside>
  );
};
