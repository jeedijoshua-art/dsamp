import React, { useState, useEffect } from 'react';
import { X, UserPlus, Shield } from 'lucide-react';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingAccountIds?: string[];
  onAddAccount: (acc: {
    id: string;
    name?: string;
    type?: string;
    risk_tier?: string;
  }) => Promise<void>;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  existingAccountIds = [],
  onAddAccount
}) => {
  const [accId, setAccId] = useState(`ACC_USER_${Math.floor(100 + Math.random() * 900)}`);
  const [name, setName] = useState('New Commercial Entity');
  const [type, setType] = useState('Standard');
  const [riskTier, setRiskTier] = useState('LOW');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAccId(`ACC_USER_${Math.floor(100 + Math.random() * 900)}`);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanId = accId.trim().toUpperCase();
    if (!cleanId) {
      setError('Account ID cannot be empty.');
      return;
    }

    if (existingAccountIds.includes(cleanId)) {
      setError(`Account ID '${cleanId}' already exists in the graph.`);
      return;
    }

    try {
      setLoading(true);
      await onAddAccount({
        id: cleanId,
        name: name.trim(),
        type,
        risk_tier: riskTier
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-navy-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Add Account Vertex</h3>
            <p className="text-xs text-slate-400">
              Register a new vertex in the graph adjacency list
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Account ID</label>
            <input
              type="text"
              value={accId}
              onChange={(e) => setAccId(e.target.value)}
              className="w-full bg-navy-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-400 uppercase"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Account Name / Entity</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-navy-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Account Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-navy-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
              >
                <option value="Standard">Standard</option>
                <option value="Personal">Personal</option>
                <option value="Corporate">Corporate</option>
                <option value="Merchant">Merchant</option>
                <option value="Intermediary">Intermediary</option>
                <option value="Settlement">Settlement</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Initial Risk Tier</label>
              <select
                value={riskTier}
                onChange={(e) => setRiskTier(e.target.value)}
                className="w-full bg-navy-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-navy-950 text-xs font-bold rounded-lg shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Register Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
