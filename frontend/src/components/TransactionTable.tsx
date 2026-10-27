import React, { useState } from 'react';
import { ArrowRight, Search, FileSpreadsheet, ExternalLink, Calendar, IndianRupee } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionTableProps {
  transactions: Transaction[];
  onInvestigateRoute?: (from: string, to: string) => void;
  onSelectAccount?: (accountId: string) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onInvestigateRoute,
  onSelectAccount
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = transactions.filter((tx) => {
    const q = searchTerm.toLowerCase();
    return (
      tx.id.toLowerCase().includes(q) ||
      tx.from_account.toLowerCase().includes(q) ||
      tx.to_account.toLowerCase().includes(q) ||
      (tx.memo && tx.memo.toLowerCase().includes(q))
    );
  });

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(paise / 100);
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="bg-navy-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      {/* Table Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Transaction Ledger
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {transactions.length} Records
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Deterministic directed transfer records stored as graph edges with integer-paise amounts
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, Account, Memo..."
            className="w-full bg-navy-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-navy-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Transaction ID</th>
              <th className="py-2.5 px-3">Source (From)</th>
              <th className="py-2.5 px-3 text-center"></th>
              <th className="py-2.5 px-3">Destination (To)</th>
              <th className="py-2.5 px-3 text-right">Amount (INR)</th>
              <th className="py-2.5 px-3 text-right">Paise Units</th>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Memo</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-6 text-center text-slate-500">
                  No transaction records found matching search query.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-cyan-400">{tx.id}</td>
                  <td className="py-2.5 px-3">
                    <button
                      onClick={() => onSelectAccount?.(tx.from_account)}
                      className="hover:underline text-slate-200 hover:text-cyan-300"
                    >
                      {tx.from_account}
                    </button>
                  </td>
                  <td className="py-2.5 px-1 text-center text-slate-500">
                    <ArrowRight className="w-3 h-3 inline text-slate-600" />
                  </td>
                  <td className="py-2.5 px-3">
                    <button
                      onClick={() => onSelectAccount?.(tx.to_account)}
                      className="hover:underline text-slate-200 hover:text-teal-300"
                    >
                      {tx.to_account}
                    </button>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-100">
                    {formatCurrency(tx.amount_paise)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400 text-[11px]">
                    {tx.amount_paise.toLocaleString()} p
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                    {formatDate(tx.timestamp)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px] truncate max-w-[150px]">
                    {tx.memo || '—'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onInvestigateRoute?.(tx.from_account, tx.to_account)}
                      title="Investigate Route in Algorithm Studio"
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50 text-[10px] transition-colors"
                    >
                      Route
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
