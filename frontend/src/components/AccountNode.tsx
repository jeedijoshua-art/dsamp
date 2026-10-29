import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  Repeat,
  Radio,
  Compass
} from 'lucide-react';
import { Account } from '../types';

export interface AccountNodeData {
  account: Account;
  isSelected?: boolean;
  isHighlighted?: boolean;
  highlightType?: 'cycle' | 'path' | 'bfs' | 'dfs' | 'finding' | null;
  hopIndex?: number;
  totalPathHops?: number;
  isCycleParticipant?: boolean;
  isFlagged?: boolean;
  isElevated?: boolean;
  isDimmed?: boolean;
  onSetSource?: (id: string) => void;
  onSetDest?: (id: string) => void;
}

export const AccountNode: React.FC<NodeProps<AccountNodeData>> = memo(({ data }) => {
  const {
    account,
    isSelected,
    isHighlighted,
    isDimmed,
    highlightType,
    hopIndex,
    totalPathHops,
    isCycleParticipant,
    isFlagged,
    isElevated,
    onSetSource,
    onSetDest
  } = data;

  const getBorderColor = () => {
    if (isHighlighted) {
      if (highlightType === 'cycle') {
        return 'border-rose-500 ring-4 ring-rose-500/30 shadow-[0_0_25px_rgba(244,63,94,0.5)]';
      }
      if (highlightType === 'path') {
        return 'border-cyan-400 ring-4 ring-cyan-400/30 shadow-[0_0_25px_rgba(6,182,212,0.5)]';
      }
      if (highlightType === 'finding') {
        return isElevated
          ? 'border-rose-500 ring-4 ring-rose-500/40 shadow-[0_0_25px_rgba(244,63,94,0.6)] animate-pulse'
          : 'border-amber-400 ring-4 ring-amber-400/40 shadow-[0_0_25px_rgba(245,158,11,0.6)] animate-pulse';
      }
      if (highlightType === 'bfs') {
        return 'border-emerald-400 ring-4 ring-emerald-400/30 shadow-[0_0_20px_rgba(16,185,129,0.4)]';
      }
      if (highlightType === 'dfs') {
        return 'border-purple-400 ring-4 ring-purple-400/30 shadow-[0_0_20px_rgba(168,85,247,0.4)]';
      }
    }
    if (isSelected) {
      return 'border-cyan-400 ring-2 ring-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]';
    }
    if (isElevated) {
      return 'border-rose-500/80 ring-1 ring-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]';
    }
    if (isFlagged) {
      return 'border-amber-500/80 ring-1 ring-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]';
    }
    if (account.risk_tier === 'HIGH') {
      return 'border-rose-500/60 hover:border-rose-400 hover:shadow-rose-950/40';
    }
    if (account.risk_tier === 'MEDIUM') {
      return 'border-amber-500/60 hover:border-amber-400 hover:shadow-amber-950/40';
    }
    return 'border-slate-700/80 hover:border-slate-500';
  };

  const getRiskBadge = () => {
    if (isElevated) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full">
          <AlertOctagon className="w-2.5 h-2.5 text-rose-400" />
          ELEVATED
        </span>
      );
    }
    if (isFlagged) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
          <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
          REVIEW
        </span>
      );
    }
    if (account.risk_tier === 'HIGH') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
          <AlertOctagon className="w-3 h-3 text-rose-400" />
          HIGH RISK
        </span>
      );
    }
    if (account.risk_tier === 'MEDIUM') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          MED RISK
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        STANDARD
      </span>
    );
  };

  const formatCurrency = (paise?: number) => {
    if (!paise) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(paise / 100);
  };

  return (
    <div
      className={`relative min-w-[250px] max-w-[280px] rounded-2xl bg-navy-900/95 backdrop-blur-md p-4 border transition-all duration-200 cursor-pointer shadow-xl ${
        isDimmed ? 'opacity-35 hover:opacity-100 hover:scale-[1.01]' : 'opacity-100'
      } ${getBorderColor()}`}
    >
      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-navy-950 transition-transform hover:scale-125 shadow-[0_0_8px_#06b6d4]"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-teal-400 !border-2 !border-navy-950 transition-transform hover:scale-125 shadow-[0_0_8px_#14b8a6]"
      />
      <Handle
        type="target"
        id="left"
        position={Position.Left}
        className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-navy-950 transition-transform hover:scale-125"
      />
      <Handle
        type="source"
        id="right"
        position={Position.Right}
        className="!w-3 !h-3 !bg-teal-400 !border-2 !border-navy-950 transition-transform hover:scale-125"
      />

      {/* Path Sequence Badge if active */}
      {isHighlighted && highlightType === 'path' && hopIndex !== undefined && (
        <div className="absolute -top-3 left-4 px-2 py-0.5 rounded-full bg-cyan-500 text-navy-950 text-[10px] font-bold font-mono shadow-md flex items-center gap-1 border border-cyan-300">
          <Compass className="w-3 h-3" />
          {hopIndex === 0
            ? 'PATH ORIGIN'
            : hopIndex === totalPathHops
            ? 'PATH TARGET'
            : `INTERMEDIARY (HOP ${hopIndex})`}
        </div>
      )}

      {/* Cycle Participant Badge */}
      {isHighlighted && highlightType === 'cycle' && (
        <div className="absolute -top-3 left-4 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold font-mono shadow-md flex items-center gap-1 border border-rose-300 animate-pulse">
          <Repeat className="w-3 h-3" />
          CYCLE NODE
        </div>
      )}

      {/* Investigation Finding Highlight Badge */}
      {isHighlighted && highlightType === 'finding' && (
        <div className={`absolute -top-3 left-4 px-2.5 py-0.5 rounded-full text-white text-[10px] font-bold font-mono shadow-md flex items-center gap-1 border animate-pulse ${
          isElevated ? 'bg-rose-500 border-rose-300' : 'bg-amber-500 border-amber-300'
        }`}>
          <AlertTriangle className="w-3 h-3" />
          INSPECTING EVIDENCE
        </div>
      )}

      {/* Header: ID and Risk Badge */}
      <div className="flex items-center justify-between gap-2 mb-2 mt-0.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_8px_#06b6d4]" />
          <span className="text-sm font-mono font-extrabold text-slate-100 tracking-tight truncate">
            {account.id}
          </span>
        </div>
        {getRiskBadge()}
      </div>

      {/* Account Full Name */}
      <div className="text-xs text-slate-200 font-semibold truncate mb-1">
        {account.name}
      </div>

      {/* Account Type Sublabel */}
      <div className="text-[11px] text-slate-400 mb-3 truncate flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
        <span>{account.type || account.account_type || 'Standard Entity'}</span>
      </div>

      {/* Degree & Volume Statistics Bar */}
      <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800/90 font-mono">
        <div className="flex items-center gap-1.5 text-slate-300">
          <ArrowDownLeft className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>In: <strong>{account.in_degree ?? 0}</strong></span>
          <span className="text-[10px] text-slate-500">({formatCurrency(account.total_incoming_paise)})</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300 justify-end">
          <ArrowUpRight className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>Out: <strong>{account.out_degree ?? 0}</strong></span>
          <span className="text-[10px] text-slate-500">({formatCurrency(account.total_outgoing_paise)})</span>
        </div>
      </div>

      {/* Quick Endpoint Selection Buttons on Hover / Selected */}
      {isSelected && (
        <div className="mt-3 pt-2 border-t border-cyan-500/20 flex items-center justify-between gap-2 text-[10px] font-mono">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSetSource?.(account.id);
            }}
            className="flex-1 py-1 px-2 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold text-center transition-colors"
          >
            Set Source
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSetDest?.(account.id);
            }}
            className="flex-1 py-1 px-2 rounded bg-teal-950 hover:bg-teal-900 border border-teal-500/40 text-teal-300 font-bold text-center transition-colors"
          >
            Set Target
          </button>
        </div>
      )}
    </div>
  );
});

AccountNode.displayName = 'AccountNode';
