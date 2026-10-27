import React from 'react';
import {
  Activity,
  BookOpen,
  RotateCcw,
  Plus,
  PlaySquare,
  FlaskConical,
  Database
} from 'lucide-react';

export type AppMode = 'dataset_playground' | 'custom_lab';

interface NavbarProps {
  currentMode: AppMode;
  onChangeMode: (mode: AppMode) => void;
  activeDatasetTitle?: string;
  engineOnline: boolean;
  onResetData: () => void;
  onOpenAddTx: () => void;
  onOpenAddAcc: () => void;
  onOpenAcademicModal: () => void;
  loading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onChangeMode,
  activeDatasetTitle,
  engineOnline,
  onResetData,
  onOpenAddTx,
  onOpenAddAcc,
  onOpenAcademicModal,
  loading
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-navy-950/95 backdrop-blur-md px-4 py-2.5">
      <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Activity className="w-4 h-4 text-navy-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-slate-100 flex items-center gap-1.5">
                FraudGraph
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  DSA Playground
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Interactive Financial Transaction Graph Algorithms
            </p>
          </div>
        </div>

        {/* Primary Two-Mode Navigation Switcher */}
        <div className="flex items-center p-1 bg-navy-900 border border-slate-800 rounded-xl shadow-inner text-xs">
          <button
            onClick={() => onChangeMode('dataset_playground')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              currentMode === 'dataset_playground'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-navy-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Dataset Playground</span>
          </button>

          <button
            onClick={() => onChangeMode('custom_lab')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              currentMode === 'custom_lab'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-navy-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Custom Investigation Lab</span>
          </button>
        </div>

        {/* Engine Status & Actions */}
        <div className="flex items-center gap-2">
          {/* Active Dataset Pill (Playground mode) */}
          {currentMode === 'dataset_playground' && activeDatasetTitle && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-navy-900 border border-slate-800 text-[11px] font-mono text-cyan-300">
              <span className="text-slate-500">Active:</span>
              <span className="font-bold truncate max-w-[140px]">{activeDatasetTitle}</span>
            </div>
          )}

          {/* Engine Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-navy-900 border border-slate-800 font-mono text-[11px]">
            <span
              className={`w-2 h-2 rounded-full ${
                engineOnline ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-rose-500'
              }`}
            />
            <span className="text-slate-300 hidden md:inline">
              {engineOnline ? 'C++17 Engine Online' : 'Engine Offline'}
            </span>
          </div>

          {/* Reset Action */}
          <button
            onClick={onResetData}
            disabled={loading}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors disabled:opacity-50 ${
              currentMode === 'custom_lab'
                ? 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-500/40 text-rose-300'
                : 'bg-navy-900 hover:bg-slate-800 text-slate-300 border-slate-700/80'
            }`}
            title={currentMode === 'custom_lab' ? 'Reset custom graph to blank canvas' : 'Reset active dataset to deterministic standard'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{currentMode === 'custom_lab' ? 'Reset Graph' : 'Reset Dataset'}</span>
          </button>

          {/* DSA Academic Dossier */}
          <button
            onClick={onOpenAcademicModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold transition-colors shadow-sm"
            title="Open Academic DSA Concepts & Complexity Reference"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">DSA Concepts</span>
          </button>

          {/* Add Account & Tx (Shown in Custom Lab Mode) */}
          {currentMode === 'custom_lab' && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenAddAcc}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-colors"
                title="Create Account Vertex"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Account</span>
              </button>
              <button
                onClick={onOpenAddTx}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-500/40 text-xs font-bold transition-colors"
                title="Create Directed Transaction Edge"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Transaction</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
