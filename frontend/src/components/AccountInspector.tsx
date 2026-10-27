import React, { useState } from 'react';
import {
  X,
  User,
  ArrowDownLeft,
  ArrowUpRight,
  Shield,
  Layers,
  Calendar,
  Compass,
  GitBranch,
  Repeat,
  Trash2
} from 'lucide-react';
import { Account, Transaction } from '../types';

interface AccountInspectorProps {
  account: Account | null;
  transactions: Transaction[];
  onClose: () => void;
  onSetSource?: (id: string) => void;
  onSetDest?: (id: string) => void;
  onStartBfs?: (id: string) => void;
  onStartDfs?: (id: string) => void;
  onDeleteAccount?: (id: string) => void;
  onDeleteTransaction?: (txId: string) => void;
  isCustomMode?: boolean;
}

export const AccountInspector: React.FC<AccountInspectorProps> = ({
  account,
  transactions,
  onClose,
  onSetSource,
  onSetDest,
  onStartBfs,
  onStartDfs,
  onDeleteAccount,
  onDeleteTransaction,
  isCustomMode
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!account) return null;

  const formatCurrency = (paise?: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format((paise || 0) / 100);
  };

  const incomingTxs = transactions.filter((t) => t.to_account === account.id);
  const outgoingTxs = transactions.filter((t) => t.from_account === account.id);

  return (
    <div className="p-4 rounded-2xl bg-navy-900/95 border border-cyan-500/30 shadow-2xl backdrop-blur-md animate-fadeIn text-xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-slate-100 text-sm">{account.id}</span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  account.risk_tier === 'HIGH'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : account.risk_tier === 'MEDIUM'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {account.risk_tier || 'STANDARD'}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 font-medium truncate">{account.name}</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
        <div className="p-2 rounded-lg bg-navy-950 border border-slate-800">
          <div className="text-slate-400 text-[10px] flex items-center gap-1">
            <ArrowDownLeft className="w-3 h-3 text-cyan-400" />
            In-Degree (Inflow)
          </div>
          <div className="font-bold text-slate-200 text-xs mt-0.5">
            {account.in_degree ?? incomingTxs.length} transfers
          </div>
          <div className="text-[10px] text-cyan-400 font-bold">
            {formatCurrency(account.total_incoming_paise)}
          </div>
        </div>

        <div className="p-2 rounded-lg bg-navy-950 border border-slate-800">
          <div className="text-slate-400 text-[10px] flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-teal-400" />
            Out-Degree (Outflow)
          </div>
          <div className="font-bold text-slate-200 text-xs mt-0.5">
            {account.out_degree ?? outgoingTxs.length} transfers
          </div>
          <div className="text-[10px] text-teal-400 font-bold">
            {formatCurrency(account.total_outgoing_paise)}
          </div>
        </div>
      </div>

      {/* Connected Edge Transactions */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
          Incident Transactions ({incomingTxs.length + outgoingTxs.length})
        </div>
        <div className="max-h-28 overflow-y-auto space-y-1 pr-1 font-mono text-[10px]">
          {incomingTxs.map((tx) => (
            <div
              key={tx.id}
              title={`Inflow from ${tx.from_account} to ${account.id} | Amount: ${formatCurrency(tx.amount_paise)} | Tx ID: ${tx.id}${tx.memo ? ` | Memo: ${tx.memo}` : ''}`}
              className="p-1.5 rounded bg-navy-950/80 border border-slate-800/80 flex items-center justify-between text-slate-300 gap-1 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-1.5 truncate min-w-0">
                <span className="text-cyan-400 font-bold shrink-0">← {tx.from_account}</span>
                <span className="text-slate-400 font-semibold shrink-0">{formatCurrency(tx.amount_paise)}</span>
                <span className="text-slate-500 text-[9px] truncate">({tx.id})</span>
              </div>
              {isCustomMode && onDeleteTransaction && (
                <button
                  onClick={() => onDeleteTransaction(tx.id)}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/60 transition-colors shrink-0"
                  title={`Delete transaction ${tx.id}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          {outgoingTxs.map((tx) => (
            <div
              key={tx.id}
              title={`Outflow from ${account.id} to ${tx.to_account} | Amount: ${formatCurrency(tx.amount_paise)} | Tx ID: ${tx.id}${tx.memo ? ` | Memo: ${tx.memo}` : ''}`}
              className="p-1.5 rounded bg-navy-950/80 border border-slate-800/80 flex items-center justify-between text-slate-300 gap-1 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-1.5 truncate min-w-0">
                <span className="text-teal-400 font-bold shrink-0">→ {tx.to_account}</span>
                <span className="text-slate-400 font-semibold shrink-0">{formatCurrency(tx.amount_paise)}</span>
                <span className="text-slate-500 text-[9px] truncate">({tx.id})</span>
              </div>
              {isCustomMode && onDeleteTransaction && (
                <button
                  onClick={() => onDeleteTransaction(tx.id)}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/60 transition-colors shrink-0"
                  title={`Delete transaction ${tx.id}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          {incomingTxs.length === 0 && outgoingTxs.length === 0 && (
            <div className="text-slate-500 italic p-1 text-center">
              Isolated account with no active edges.
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-1.5 text-[10px] font-mono">
        <button
          onClick={() => onSetSource?.(account.id)}
          className="px-2 py-1.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold text-center transition-colors"
        >
          Set as Source
        </button>
        <button
          onClick={() => onSetDest?.(account.id)}
          className="px-2 py-1.5 rounded bg-teal-950 hover:bg-teal-900 border border-teal-500/40 text-teal-300 font-bold text-center transition-colors"
        >
          Set as Target
        </button>
        <button
          onClick={() => onStartBfs?.(account.id)}
          className="px-2 py-1.5 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold text-center transition-colors"
        >
          Start BFS Here
        </button>
        <button
          onClick={() => onStartDfs?.(account.id)}
          className="px-2 py-1.5 rounded bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-purple-300 font-bold text-center transition-colors"
        >
          Start DFS Here
        </button>

        {/* Custom Account Deletion Control */}
        {isCustomMode && onDeleteAccount && (
          <div className="col-span-2 pt-1">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full px-2 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 font-bold text-center transition-colors flex items-center justify-center gap-1.5"
                title="Delete this custom account vertex and all incident edges"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete Account Vertex</span>
              </button>
            ) : (
              <div className="p-2 rounded-lg bg-rose-950 border border-rose-500 flex items-center justify-between gap-2 animate-fadeIn">
                <span className="text-[10px] text-rose-200 font-semibold">
                  Delete {account.id} &amp; all {incomingTxs.length + outgoingTxs.length} incident edges?
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      onDeleteAccount(account.id);
                      onClose();
                    }}
                    className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold text-[10px] transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
