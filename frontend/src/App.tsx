import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar, AppMode } from './components/Navbar';
import { DatasetSelector } from './components/DatasetSelector';
import { KPICards } from './components/KPICards';
import { GraphCanvas } from './components/GraphCanvas';
import { AlgorithmControls } from './components/AlgorithmControls';
import { AccountInspector } from './components/AccountInspector';
import { InvestigationPanel } from './components/InvestigationPanel';
import { TransactionTable } from './components/TransactionTable';
import { AddTransactionModal } from './components/AddTransactionModal';
import { AddAccountModal } from './components/AddAccountModal';
import { AcademicConceptsModal } from './components/AcademicConceptsModal';
import { InvestigationHeader } from './components/InvestigationHeader';
import { InvestigationScenarioSelector } from './components/InvestigationScenarioSelector';
import { InvestigationSummaryCards } from './components/InvestigationSummaryCards';
import { InvestigationFindingsPanel } from './components/InvestigationFindingsPanel';
import { EvidenceDetailsPanel } from './components/EvidenceDetailsPanel';
import {
  fetchHealth,
  fetchDatasets,
  fetchScenarios,
  selectDataset,
  selectScenario,
  resetDataset,
  addAccount,
  addTransaction,
  executeEngine,
  deleteAccount,
  deleteTransaction,
  resetCustomGraph
} from './api/client';
import {
  Account,
  Transaction,
  GraphSummary,
  InvestigationReport,
  CycleDetectionResult,
  ShortestPathResult,
  BFSResult,
  DFSResult,
  DirectedCycle,
  PrebuiltDataset,
  TraversalStep,
  InvestigationScenario,
  RuleFinding
} from './types';
import {
  AlertCircle,
  RefreshCw,
  Sparkles,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  ShieldAlert,
  GraduationCap,
  FlaskConical,
  Plus,
  RotateCcw,
  Info
} from 'lucide-react';

export const App: React.FC = () => {
  // Navigation & Primary Modes
  const [currentMode, setCurrentMode] = useState<AppMode>('dataset_playground');
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isAddAccOpen, setIsAddAccOpen] = useState(false);
  const [isAcademicModalOpen, setIsAcademicModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Collapsible Bottom Panels
  const [isFindingsOpen, setIsFindingsOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [isDsaRefOpen, setIsDsaRefOpen] = useState(false);

  // System & Engine Status
  const [engineOnline, setEngineOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prebuilt Datasets Catalog
  const [datasets, setDatasets] = useState<PrebuiltDataset[]>([]);
  const [activeDatasetId, setActiveDatasetId] = useState<string>('basic_traversal');

  // ==========================================
  // MODE A: DATASET PLAYGROUND STATE
  // ==========================================
  const [datasetAccounts, setDatasetAccounts] = useState<Account[]>([]);
  const [datasetTransactions, setDatasetTransactions] = useState<Transaction[]>([]);
  const [datasetSummary, setDatasetSummary] = useState<GraphSummary | undefined>();
  const [datasetInvestigation, setDatasetInvestigation] = useState<InvestigationReport | undefined>();
  const [datasetCycleDetection, setDatasetCycleDetection] = useState<CycleDetectionResult | undefined>();
  const [datasetShortestPathResult, setDatasetShortestPathResult] = useState<ShortestPathResult | null>(null);
  const [datasetBfsResult, setDatasetBfsResult] = useState<BFSResult | null>(null);
  const [datasetDfsResult, setDatasetDfsResult] = useState<DFSResult | null>(null);
  const [datasetShortestPathSource, setDatasetShortestPathSource] = useState<string>('ACC_BRANCH_HUB');
  const [datasetShortestPathDest, setDatasetShortestPathDest] = useState<string>('ACC_BRANCH_D2');
  const [datasetBfsStartNode, setDatasetBfsStartNode] = useState<string>('ACC_BRANCH_HUB');
  const [datasetDfsStartNode, setDatasetDfsStartNode] = useState<string>('ACC_BRANCH_HUB');

  // ==========================================
  // MODE B: CUSTOM INVESTIGATION LAB ISOLATED STATE
  // Genuinely empty initial state: 0 vertices, 0 edges, ₹0 volume, 0 cycles, no stale results
  // ==========================================
  const [customAccounts, setCustomAccounts] = useState<Account[]>([]);
  const [customTransactions, setCustomTransactions] = useState<Transaction[]>([]);
  const [customSummary, setCustomSummary] = useState<GraphSummary | undefined>({
    account_count: 0,
    transaction_count: 0,
    total_volume_paise: 0,
    total_volume_inr: 0,
    accounts: [],
    transactions: []
  });
  const [customInvestigation, setCustomInvestigation] = useState<InvestigationReport | undefined>();
  const [customCycleDetection, setCustomCycleDetection] = useState<CycleDetectionResult | undefined>({
    success: true,
    has_cycle: false,
    summary: 'No directed cycles detected.',
    cycles: [],
    time_complexity: 'O(V + E)',
    space_complexity: 'O(V)',
    algorithm_name: 'Three-State DFS'
  });
  const [customShortestPathResult, setCustomShortestPathResult] = useState<ShortestPathResult | null>(null);
  const [customBfsResult, setCustomBfsResult] = useState<BFSResult | null>(null);
  const [customDfsResult, setCustomDfsResult] = useState<DFSResult | null>(null);
  const [customShortestPathSource, setCustomShortestPathSource] = useState<string>('');
  const [customShortestPathDest, setCustomShortestPathDest] = useState<string>('');
  const [customBfsStartNode, setCustomBfsStartNode] = useState<string>('');
  const [customDfsStartNode, setCustomDfsStartNode] = useState<string>('');

  // Selected Elements & Highlights
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [activeHighlight, setActiveHighlight] = useState<'none' | 'path' | 'cycle' | 'bfs' | 'dfs' | 'finding'>('none');
  const [activeCycle, setActiveCycle] = useState<DirectedCycle | null>(null);

  // Investigation Scenarios & Workflow State (for fraud_investigation)
  const [scenarios, setScenarios] = useState<InvestigationScenario[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('multiple_signals');
  const [hasInvestigated, setHasInvestigated] = useState<boolean>(false);
  const [isInvestigating, setIsInvestigating] = useState<boolean>(false);
  const [selectedFinding, setSelectedFinding] = useState<RuleFinding | null>(null);

  // Step-by-Step Traversal Trace Highlights
  const [stepVisitedNodes, setStepVisitedNodes] = useState<string[]>([]);
  const [stepTreeEdges, setStepTreeEdges] = useState<string[]>([]);
  const [currentStepNode, setCurrentStepNode] = useState<string | undefined>();

  // ==========================================
  // DERIVED ACTIVE GRAPH DATA (Strict Isolation)
  // ==========================================
  const isCustom = currentMode === 'custom_lab';
  const accounts = isCustom ? customAccounts : datasetAccounts;
  const transactions = isCustom ? customTransactions : datasetTransactions;
  const summary = isCustom ? customSummary : datasetSummary;
  const investigation = isCustom ? customInvestigation : datasetInvestigation;
  const cycleDetection = isCustom ? customCycleDetection : datasetCycleDetection;
  const shortestPathResult = isCustom ? customShortestPathResult : datasetShortestPathResult;
  const bfsResult = isCustom ? customBfsResult : datasetBfsResult;
  const dfsResult = isCustom ? customDfsResult : datasetDfsResult;
  const shortestPathSource = isCustom ? customShortestPathSource : datasetShortestPathSource;
  const shortestPathDest = isCustom ? customShortestPathDest : datasetShortestPathDest;
  const bfsStartNode = isCustom ? customBfsStartNode : datasetBfsStartNode;
  const dfsStartNode = isCustom ? customDfsStartNode : datasetDfsStartNode;

  // Mode Switch Handler: Clears transient selections, traces, and visual highlights
  const handleModeChange = (newMode: AppMode) => {
    setCurrentMode(newMode);
    setSelectedAccountId(null);
    setSelectedEdgeId(null);
    setActiveHighlight('none');
    setActiveCycle(null);
    setSelectedFinding(null);
    setHasInvestigated(false);
    setStepVisitedNodes([]);
    setStepTreeEdges([]);
    setCurrentStepNode(undefined);
    setError(null);
  };

  // Synchronize Dataset Playground with C++ Native Engine
  const syncDatasetWithEngine = useCallback(
    async (
      accs: Account[],
      txs: Transaction[],
      source?: string,
      dest?: string,
      bfsStart?: string
    ) => {
      try {
        setLoading(true);
        setError(null);

        const src = source || datasetShortestPathSource;
        const target = dest || datasetShortestPathDest;
        const bStart = bfsStart || datasetBfsStartNode;

        const resp = await executeEngine({
          accounts: accs,
          transactions: txs,
          action: 'full_analysis',
          params: {
            start_node: bStart,
            source: src,
            destination: target
          }
        });

        if (resp.status === 'success') {
          setEngineOnline(true);
          setDatasetSummary(resp.graph_summary);
          setDatasetAccounts(resp.graph_summary.accounts);
          setDatasetTransactions(resp.graph_summary.transactions);
          setDatasetInvestigation(resp.investigation);
          setDatasetCycleDetection(resp.cycle_detection);
          if (resp.shortest_path) {
            setDatasetShortestPathResult(resp.shortest_path);
          }
          if (resp.bfs) setDatasetBfsResult(resp.bfs);
          if (resp.dfs) setDatasetDfsResult(resp.dfs);
        } else {
          setError(resp.error || 'C++ engine returned an error');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to communicate with C++ backend engine');
        setEngineOnline(false);
      } finally {
        setLoading(false);
      }
    },
    [datasetShortestPathSource, datasetShortestPathDest, datasetBfsStartNode]
  );

  // Synchronize Custom Lab with C++ Native Engine
  const syncCustomWithEngine = useCallback(
    async (
      accs: Account[],
      txs: Transaction[],
      source?: string,
      dest?: string,
      bfsStart?: string
    ) => {
      try {
        setLoading(true);
        setError(null);

        if (accs.length === 0) {
          // Zero vertices: cleanly reset custom metrics and findings
          setCustomSummary({
            account_count: 0,
            transaction_count: 0,
            total_volume_paise: 0,
            total_volume_inr: 0,
            accounts: [],
            transactions: []
          });
          setCustomInvestigation(undefined);
          setCustomCycleDetection({
            success: true,
            has_cycle: false,
            summary: 'No directed cycles detected.',
            cycles: [],
            time_complexity: 'O(V + E)',
            space_complexity: 'O(V)',
            algorithm_name: 'Three-State DFS'
          });
          setCustomShortestPathResult(null);
          setCustomBfsResult(null);
          setCustomDfsResult(null);
          return;
        }

        const src = source !== undefined ? source : customShortestPathSource;
        const target = dest !== undefined ? dest : customShortestPathDest;
        const bStart = bfsStart !== undefined ? bfsStart : customBfsStartNode;

        const resp = await executeEngine({
          accounts: accs,
          transactions: txs,
          action: 'full_analysis',
          params: {
            start_node: bStart,
            source: src,
            destination: target
          }
        });

        if (resp.status === 'success') {
          setEngineOnline(true);
          setCustomSummary(resp.graph_summary);
          setCustomAccounts(resp.graph_summary.accounts);
          setCustomTransactions(resp.graph_summary.transactions);
          setCustomInvestigation(resp.investigation);
          setCustomCycleDetection(resp.cycle_detection);
          if (resp.shortest_path) {
            setCustomShortestPathResult(resp.shortest_path);
          } else {
            setCustomShortestPathResult(null);
          }
          if (resp.bfs) setCustomBfsResult(resp.bfs);
          if (resp.dfs) setCustomDfsResult(resp.dfs);
        } else {
          setError(resp.error || 'C++ engine returned an error');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to communicate with C++ backend engine');
        setEngineOnline(false);
      } finally {
        setLoading(false);
      }
    },
    [customShortestPathSource, customShortestPathDest, customBfsStartNode]
  );

  // Initial Load: Catalog & Prebuilt Datasets Initialization
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const health = await fetchHealth();
        setEngineOnline(health.engine_binary_present);

        const catalogRes = await fetchDatasets();
        if (catalogRes.datasets && catalogRes.datasets.length > 0) {
          setDatasets(catalogRes.datasets);
          const firstDs = catalogRes.datasets[0];
          setActiveDatasetId(firstDs.id);
          setDatasetAccounts(firstDs.accounts);
          setDatasetTransactions(firstDs.transactions);
          setDatasetShortestPathSource(firstDs.default_source);
          setDatasetShortestPathDest(firstDs.default_destination);
          setDatasetBfsStartNode(firstDs.default_bfs_start);
          setDatasetDfsStartNode(firstDs.default_dfs_start);

          // Fetch investigation scenarios
          try {
            const scenarioRes = await fetchScenarios();
            if (scenarioRes && scenarioRes.scenarios) {
              setScenarios(scenarioRes.scenarios);
              if (scenarioRes.active_scenario_id) {
                setActiveScenarioId(scenarioRes.active_scenario_id);
              }
            }
          } catch (scErr) {
            console.warn('Scenarios fetch non-critical warning:', scErr);
          }

          await syncDatasetWithEngine(
            firstDs.accounts,
            firstDs.transactions,
            firstDs.default_source,
            firstDs.default_destination,
            firstDs.default_bfs_start
          );
        }
      } catch (err: any) {
        setError(err.message || 'Initialization failed');
        setEngineOnline(false);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Predefined Dataset Selection Handler (Mode A: Dataset Playground)
  const handleSelectDataset = async (datasetId: string) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedAccountId(null);
      setSelectedEdgeId(null);
      setActiveHighlight('none');
      setActiveCycle(null);
      setSelectedFinding(null);
      setHasInvestigated(false);
      setStepVisitedNodes([]);
      setStepTreeEdges([]);
      setCurrentStepNode(undefined);

      // Invalidate old results
      setDatasetShortestPathResult(null);
      setDatasetBfsResult(null);
      setDatasetDfsResult(null);

      const res = await selectDataset(datasetId);
      setActiveDatasetId(datasetId);

      const targetDs = datasets.find((d) => d.id === datasetId);
      if (targetDs) {
        setDatasetAccounts(res.dataset.accounts);
        setDatasetTransactions(res.dataset.transactions);
        setDatasetShortestPathSource(targetDs.default_source);
        setDatasetShortestPathDest(targetDs.default_destination);
        setDatasetBfsStartNode(targetDs.default_bfs_start);
        setDatasetDfsStartNode(targetDs.default_dfs_start);

        await syncDatasetWithEngine(
          res.dataset.accounts,
          res.dataset.transactions,
          targetDs.default_source,
          targetDs.default_destination,
          targetDs.default_bfs_start
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to switch dataset');
    } finally {
      setLoading(false);
    }
  };

  // Reset Dataset Playground to Deterministic Standard
  const handleResetDataset = async () => {
    try {
      setLoading(true);
      setSelectedAccountId(null);
      setSelectedEdgeId(null);
      setActiveHighlight('none');
      setActiveCycle(null);
      setStepVisitedNodes([]);
      setStepTreeEdges([]);
      setCurrentStepNode(undefined);

      const res = await resetDataset(activeDatasetId);
      setDatasetAccounts(res.dataset.accounts);
      setDatasetTransactions(res.dataset.transactions);

      const targetDs = datasets.find((d) => d.id === activeDatasetId);
      const src = targetDs?.default_source || res.dataset.accounts[0]?.id || '';
      const dest = targetDs?.default_destination || res.dataset.accounts[res.dataset.accounts.length - 1]?.id || '';

      await syncDatasetWithEngine(res.dataset.accounts, res.dataset.transactions, src, dest);
    } catch (err: any) {
      setError(err.message || 'Failed to reset dataset');
    } finally {
      setLoading(false);
    }
  };

  // Reset Dispatcher (Opens confirmation for Custom Lab, resets dataset for Playground)
  const handleReset = () => {
    if (isCustom) {
      setIsResetConfirmOpen(true);
    } else {
      handleResetDataset();
    }
  };

  // Full Custom Graph Reset Handler (Section 5)
  const handleConfirmResetCustom = async () => {
    try {
      setLoading(true);
      setIsResetConfirmOpen(false);
      setSelectedAccountId(null);
      setSelectedEdgeId(null);
      setActiveHighlight('none');
      setActiveCycle(null);
      setStepVisitedNodes([]);
      setStepTreeEdges([]);
      setCurrentStepNode(undefined);
      setError(null);

      // 1. Reset all custom graph state to empty
      setCustomAccounts([]);
      setCustomTransactions([]);
      setCustomSummary({
        account_count: 0,
        transaction_count: 0,
        total_volume_paise: 0,
        total_volume_inr: 0,
        accounts: [],
        transactions: []
      });
      setCustomInvestigation(undefined);
      setCustomCycleDetection({
        success: true,
        has_cycle: false,
        summary: 'No directed cycles detected.',
        cycles: [],
        time_complexity: 'O(V + E)',
        space_complexity: 'O(V)',
        algorithm_name: 'Three-State DFS'
      });
      setCustomShortestPathResult(null);
      setCustomBfsResult(null);
      setCustomDfsResult(null);
      setCustomShortestPathSource('');
      setCustomShortestPathDest('');
      setCustomBfsStartNode('');
      setCustomDfsStartNode('');

      // 2. Synchronize C++ engine with empty graph snapshot
      await executeEngine({
        accounts: [],
        transactions: [],
        action: 'full_analysis'
      });
    } catch (err: any) {
      setError(err.message || 'Failed to reset custom graph');
    } finally {
      setLoading(false);
    }
  };

  // Add Account Vertex
  const handleAddAccount = async (accData: { id: string; name?: string; type?: string; risk_tier?: string }) => {
    try {
      setError(null);
      const cleanId = accData.id.trim().toUpperCase();

      if (isCustom) {
        if (!cleanId) throw new Error('Account ID cannot be empty');
        if (customAccounts.some((a) => a.id === cleanId)) {
          throw new Error(`Account ID '${cleanId}' already exists in graph.`);
        }

        const newAcc: Account = {
          id: cleanId,
          name: accData.name?.trim() || `Account ${cleanId}`,
          type: accData.type || 'Standard',
          risk_tier: (accData.risk_tier as any) || 'LOW',
          created_at: new Date().toISOString(),
          in_degree: 0,
          out_degree: 0,
          total_incoming_paise: 0,
          total_outgoing_paise: 0
        };

        const updated = [...customAccounts, newAcc];
        setCustomAccounts(updated);

        const newSrc = customShortestPathSource || cleanId;
        const newDest = customShortestPathDest || cleanId;
        const newBfs = customBfsStartNode || cleanId;
        const newDfs = customDfsStartNode || cleanId;
        setCustomShortestPathSource(newSrc);
        setCustomShortestPathDest(newDest);
        setCustomBfsStartNode(newBfs);
        setCustomDfsStartNode(newDfs);

        await syncCustomWithEngine(updated, customTransactions, newSrc, newDest, newBfs);
      } else {
        const res = await addAccount(accData);
        setDatasetAccounts(res.dataset.accounts);
        await syncDatasetWithEngine(res.dataset.accounts, datasetTransactions);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add account vertex');
      throw err;
    }
  };

  // Add Directed Transaction Edge
  const handleAddTransaction = async (txData: {
    id: string;
    from_account: string;
    to_account: string;
    amount: number;
    memo?: string;
  }) => {
    try {
      setError(null);
      const cleanId = txData.id.trim().toUpperCase();
      const cleanFrom = txData.from_account.trim().toUpperCase();
      const cleanTo = txData.to_account.trim().toUpperCase();

      if (isCustom) {
        if (!cleanId) throw new Error('Transaction ID is required');
        if (customTransactions.some((t) => t.id === cleanId)) {
          throw new Error(`Transaction ID '${cleanId}' already exists`);
        }
        if (!customAccounts.some((a) => a.id === cleanFrom)) {
          throw new Error(`Source account '${cleanFrom}' does not exist`);
        }
        if (!customAccounts.some((a) => a.id === cleanTo)) {
          throw new Error(`Destination account '${cleanTo}' does not exist`);
        }
        if (isNaN(txData.amount) || txData.amount <= 0) {
          throw new Error('Transaction amount must be greater than zero');
        }

        const paise = Math.round(txData.amount * 100);
        const newTx: Transaction = {
          id: cleanId,
          from_account: cleanFrom,
          to_account: cleanTo,
          amount_paise: paise,
          timestamp: new Date().toISOString(),
          memo: txData.memo?.trim() || ''
        };

        const updated = [...customTransactions, newTx];
        setCustomTransactions(updated);

        await syncCustomWithEngine(
          customAccounts,
          updated,
          customShortestPathSource,
          customShortestPathDest,
          customBfsStartNode
        );
      } else {
        const res = await addTransaction(txData);
        setDatasetAccounts(res.dataset.accounts);
        setDatasetTransactions(res.dataset.transactions);
        await syncDatasetWithEngine(res.dataset.accounts, res.dataset.transactions);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to record transaction edge');
      throw err;
    }
  };

  // Individual Deletion: Delete Account and incident edges (Section 4)
  const handleDeleteAccount = async (accountId: string) => {
    try {
      setError(null);
      if (isCustom) {
        const cleanId = accountId.trim().toUpperCase();
        const updatedAccounts = customAccounts.filter((a) => a.id !== cleanId);
        const updatedTxs = customTransactions.filter(
          (t) => t.from_account !== cleanId && t.to_account !== cleanId
        );

        setCustomAccounts(updatedAccounts);
        setCustomTransactions(updatedTxs);

        if (selectedAccountId === cleanId) setSelectedAccountId(null);
        if (selectedEdgeId && !updatedTxs.some((t) => t.id === selectedEdgeId)) {
          setSelectedEdgeId(null);
        }

        // Adjust parameters if deleted account was active
        const newSrc = customShortestPathSource === cleanId ? (updatedAccounts[0]?.id || '') : customShortestPathSource;
        const newDest = customShortestPathDest === cleanId ? (updatedAccounts[updatedAccounts.length - 1]?.id || '') : customShortestPathDest;
        const newBfs = customBfsStartNode === cleanId ? (updatedAccounts[0]?.id || '') : customBfsStartNode;
        const newDfs = customDfsStartNode === cleanId ? (updatedAccounts[0]?.id || '') : customDfsStartNode;

        setCustomShortestPathSource(newSrc);
        setCustomShortestPathDest(newDest);
        setCustomBfsStartNode(newBfs);
        setCustomDfsStartNode(newDfs);

        // Invalidate stale algorithm results and highlights
        setActiveHighlight('none');
        setActiveCycle(null);
        setStepVisitedNodes([]);
        setStepTreeEdges([]);
        setCurrentStepNode(undefined);

        await syncCustomWithEngine(updatedAccounts, updatedTxs, newSrc, newDest, newBfs);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
    }
  };

  // Individual Deletion: Delete Directed Transaction Edge (Section 4)
  const handleDeleteTransaction = async (txId: string) => {
    try {
      setError(null);
      if (isCustom) {
        const cleanId = txId.trim().toUpperCase();
        const updatedTxs = customTransactions.filter((t) => t.id !== cleanId);
        setCustomTransactions(updatedTxs);

        if (selectedEdgeId === cleanId) setSelectedEdgeId(null);

        // Invalidate dependent algorithm highlights if the deleted edge was part of them
        if (activeCycle && activeCycle.transaction_ids.includes(cleanId)) {
          setActiveHighlight('none');
          setActiveCycle(null);
        }
        if (shortestPathResult && shortestPathResult.transaction_ids.includes(cleanId)) {
          setActiveHighlight('none');
        }

        await syncCustomWithEngine(
          customAccounts,
          updatedTxs,
          customShortestPathSource,
          customShortestPathDest,
          customBfsStartNode
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete transaction');
    }
  };

  // Run BFS
  const handleRunBFS = async (startNode: string) => {
    try {
      setLoading(true);
      setError(null);
      if (isCustom) setCustomBfsStartNode(startNode);
      else setDatasetBfsStartNode(startNode);

      const resp = await executeEngine({
        accounts,
        transactions,
        action: 'bfs',
        params: { start_node: startNode }
      });
      if (resp.bfs) {
        if (isCustom) setCustomBfsResult(resp.bfs);
        else setDatasetBfsResult(resp.bfs);

        if (resp.bfs.success) {
          setActiveHighlight('bfs');
        } else {
          setActiveHighlight('none');
          if (resp.bfs.error_message) {
            setError(resp.bfs.error_message);
          }
        }
        setStepVisitedNodes([]);
        setStepTreeEdges([]);
        setCurrentStepNode(undefined);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to execute BFS in C++');
    } finally {
      setLoading(false);
    }
  };

  // Run DFS
  const handleRunDFS = async (startNode: string) => {
    try {
      setLoading(true);
      setError(null);
      if (isCustom) setCustomDfsStartNode(startNode);
      else setDatasetDfsStartNode(startNode);

      const resp = await executeEngine({
        accounts,
        transactions,
        action: 'dfs',
        params: { start_node: startNode }
      });
      if (resp.dfs) {
        if (isCustom) setCustomDfsResult(resp.dfs);
        else setDatasetDfsResult(resp.dfs);

        if (resp.dfs.success) {
          setActiveHighlight('dfs');
        } else {
          setActiveHighlight('none');
          if (resp.dfs.error_message) {
            setError(resp.dfs.error_message);
          }
        }
        setStepVisitedNodes([]);
        setStepTreeEdges([]);
        setCurrentStepNode(undefined);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to execute DFS in C++');
    } finally {
      setLoading(false);
    }
  };

  // Run Cycle Detection
  const handleRunCycleDetection = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await executeEngine({
        accounts,
        transactions,
        action: 'cycle_detection'
      });
      if (resp.cycle_detection) {
        if (isCustom) setCustomCycleDetection(resp.cycle_detection);
        else setDatasetCycleDetection(resp.cycle_detection);

        if (resp.cycle_detection.cycles.length > 0) {
          setActiveCycle(resp.cycle_detection.cycles[0]);
          setActiveHighlight('cycle');
        } else {
          setActiveHighlight('none');
          setActiveCycle(null);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to evaluate cycle detection in C++');
    } finally {
      setLoading(false);
    }
  };

  // Run Shortest Path
  const handleRunShortestPath = async (source: string, destination: string) => {
    try {
      setLoading(true);
      setError(null);
      if (isCustom) {
        setCustomShortestPathSource(source);
        setCustomShortestPathDest(destination);
      } else {
        setDatasetShortestPathSource(source);
        setDatasetShortestPathDest(destination);
      }

      const resp = await executeEngine({
        accounts,
        transactions,
        action: 'shortest_path',
        params: { source, destination }
      });
      if (resp.shortest_path) {
        if (isCustom) setCustomShortestPathResult(resp.shortest_path);
        else setDatasetShortestPathResult(resp.shortest_path);

        if (resp.shortest_path.path_exists) {
          setActiveHighlight('path');
        } else {
          setActiveHighlight('none');
          if (resp.shortest_path.error_message) {
            setError(resp.shortest_path.error_message);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to calculate shortest path');
    } finally {
      setLoading(false);
    }
  };

  // Highlight Selection
  const handleHighlight = (type: 'none' | 'path' | 'cycle' | 'bfs' | 'dfs', cycle?: DirectedCycle) => {
    setActiveHighlight(type);
    setStepVisitedNodes([]);
    setStepTreeEdges([]);
    setCurrentStepNode(undefined);

    if (type === 'cycle' && cycle) {
      setActiveCycle(cycle);
    } else if (type === 'none') {
      setActiveCycle(null);
    }
  };

  // Step-by-Step Traversal Highlight Synchronization
  const handleStepHighlight = (type: 'bfs' | 'dfs', step: TraversalStep | null) => {
    if (step) {
      setActiveHighlight(type);
      setStepVisitedNodes(step.visited_so_far);
      setStepTreeEdges(step.active_tree_edges);
      setCurrentStepNode(step.current_node);
    } else {
      setStepVisitedNodes([]);
      setStepTreeEdges([]);
      setCurrentStepNode(undefined);
    }
  };  // Handler for Selecting Scenario (Mode A: Fraud Investigation)
  const handleSelectScenario = async (scenarioId: string) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedAccountId(null);
      setSelectedEdgeId(null);
      setActiveHighlight('none');
      setActiveCycle(null);
      setSelectedFinding(null);
      setHasInvestigated(false);
      setStepVisitedNodes([]);
      setStepTreeEdges([]);
      setCurrentStepNode(undefined);

      const res = await selectScenario(scenarioId);
      setActiveScenarioId(scenarioId);

      if (res.dataset) {
        setDatasetAccounts(res.dataset.accounts);
        setDatasetTransactions(res.dataset.transactions);
        const src = res.dataset.accounts[0]?.id || '';
        const dest = res.dataset.accounts[res.dataset.accounts.length - 1]?.id || '';
        await syncDatasetWithEngine(res.dataset.accounts, res.dataset.transactions, src, dest);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to select investigation scenario');
    } finally {
      setLoading(false);
    }
  };

  // Handler for Executing Fraud Investigation
  const handleRunInvestigation = async () => {
    try {
      setIsInvestigating(true);
      setError(null);
      setSelectedFinding(null);
      setActiveHighlight('none');

      if (accounts.length === 0) {
        throw new Error('Graph is empty: no accounts found to analyze.');
      }

      const resp = await executeEngine({
        accounts,
        transactions,
        action: 'full_analysis',
        params: {
          start_node: bfsStartNode,
          source: shortestPathSource,
          destination: shortestPathDest
        }
      });

      if (resp.status === 'success') {
        if (isCustom) {
          setCustomSummary(resp.graph_summary);
          setCustomInvestigation(resp.investigation);
          setCustomCycleDetection(resp.cycle_detection);
        } else {
          setDatasetSummary(resp.graph_summary);
          setDatasetInvestigation(resp.investigation);
          setDatasetCycleDetection(resp.cycle_detection);
        }
        setHasInvestigated(true);
      } else {
        setError(resp.error || 'Investigation engine failed to analyze graph');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to execute fraud investigation');
    } finally {
      setIsInvestigating(false);
    }
  };

  // Handler to Reset Scenario
  const handleResetScenario = async () => {
    setSelectedFinding(null);
    setHasInvestigated(false);
    setActiveHighlight('none');
    setSelectedAccountId(null);
    setSelectedEdgeId(null);
    await handleSelectScenario(activeScenarioId);
  };

  // Inspect Finding Evidence
  const handleInspectEvidence = (finding: RuleFinding) => {
    setSelectedFinding(finding);
    setActiveHighlight('finding');
    if (finding.flagged_accounts.length > 0) {
      setSelectedAccountId(finding.flagged_accounts[0]);
    }
    setSelectedEdgeId(null);
  };

  // Close Evidence Panel
  const handleCloseEvidence = () => {
    setSelectedFinding(null);
    setSelectedAccountId(null);
    setSelectedEdgeId(null);
    setActiveHighlight('none');
  };

  const findingAccountsSet = useMemo(() => {
    if (!selectedFinding) return new Set<string>();
    return new Set(selectedFinding.flagged_accounts);
  }, [selectedFinding]);

  const findingEdgesSet = useMemo(() => {
    if (!selectedFinding) return new Set<string>();
    return new Set(selectedFinding.flagged_transactions);
  }, [selectedFinding]);

  const { flaggedAccountIds, elevatedAccountIds } = useMemo(() => {
    const flagged = new Set<string>();
    const elevated = new Set<string>();
    if (hasInvestigated && investigation?.findings) {
      investigation.findings.forEach((f) => {
        f.flagged_accounts.forEach((acc) => {
          flagged.add(acc);
          if (f.severity === 'HIGH') {
            elevated.add(acc);
          }
        });
      });
    }
    return { flaggedAccountIds: flagged, elevatedAccountIds: elevated };
  }, [hasInvestigated, investigation]);

  const isFraudInvestigation = currentMode === 'dataset_playground' && activeDatasetId === 'fraud_investigation';

  const activeDatasetObj = datasets.find((d) => d.id === activeDatasetId);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentMode={currentMode}
        onChangeMode={handleModeChange}
        activeDatasetTitle={activeDatasetObj?.title}
        engineOnline={engineOnline}
        onResetData={handleReset}
        onOpenAddTx={() => setIsAddTxOpen(true)}
        onOpenAddAcc={() => setIsAddAccOpen(true)}
        onOpenAcademicModal={() => setIsAcademicModalOpen(true)}
        loading={loading}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-4 flex flex-col gap-5">
        {/* Global Error Banner */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => {
                if (isCustom) syncCustomWithEngine(customAccounts, customTransactions);
                else syncDatasetWithEngine(datasetAccounts, datasetTransactions);
              }}
              className="px-2.5 py-1 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-200 rounded font-medium text-[11px] flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}

        {/* MODE A: DATASET PLAYGROUND CONTROLS */}
        {currentMode === 'dataset_playground' && (
          <DatasetSelector
            datasets={datasets}
            activeDatasetId={activeDatasetId}
            onSelectDataset={handleSelectDataset}
            loading={loading}
          />
        )}

        {/* MODE B: CUSTOM INVESTIGATION LAB ACTION BAR */}
        {currentMode === 'custom_lab' && (
          <div className="p-4 rounded-xl bg-navy-900/90 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs mb-1">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-cyan-400" />
                  Custom Graph Investigation Lab
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-bold">
                  Active Sandbox
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Create custom vertices and directed transaction edges to test specific graph topologies against the C++17 engine.
              </p>
            </div>

            {/* Clear Primary Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsAddAccOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Account</span>
              </button>
              <button
                onClick={() => setIsAddTxOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-500/40 text-xs font-bold transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Transaction</span>
              </button>
              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-500/40 text-xs font-bold transition-colors shadow-sm"
                title="Reset custom graph to blank canvas"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>Reset Graph</span>
              </button>
            </div>
          </div>
        )}

        {/* TOP SUMMARY / WORKFLOW HEADER */}
        {isFraudInvestigation ? (
          <div className="space-y-4">
            <InvestigationHeader
              scenarioName={scenarios.find((s) => s.id === activeScenarioId)?.name || 'Multiple Warning Signals'}
              accountCount={accounts.length}
              transactionCount={transactions.length}
              onRunInvestigation={handleRunInvestigation}
              onResetScenario={handleResetScenario}
              isInvestigating={isInvestigating}
              hasRun={hasInvestigated}
            />

            <InvestigationScenarioSelector
              scenarios={scenarios}
              activeScenarioId={activeScenarioId}
              onSelectScenario={handleSelectScenario}
              disabled={loading || isInvestigating}
            />

            <InvestigationSummaryCards
              summary={summary}
              investigation={investigation}
              cycleDetection={cycleDetection}
              hasRun={hasInvestigated}
              isInvestigating={isInvestigating}
              onRunInvestigation={handleRunInvestigation}
            />
          </div>
        ) : (
          <KPICards
            summary={summary}
            investigation={investigation}
            cycleDetection={cycleDetection}
            onSelectIntermediaries={() => setIsFindingsOpen(true)}
            onSelectCycles={() => {
              handleRunCycleDetection();
            }}
          />
        )}

        {/* CENTRAL WORKSPACE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT: LARGE CENTRAL GRAPH WORKSPACE (7 of 12 cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <GraphCanvas
              accounts={accounts}
              transactions={transactions}
              datasetId={isCustom ? 'custom_lab' : activeDatasetId}
              scenarioId={isFraudInvestigation ? activeScenarioId : undefined}
              selectedAccountId={selectedAccountId}
              onSelectAccount={(id) => {
                setSelectedAccountId(id || null);
                if (id) setSelectedEdgeId(null);
              }}
              selectedEdgeId={selectedEdgeId}
              onSelectEdge={(id) => {
                setSelectedEdgeId(id);
                if (id) setSelectedAccountId(null);
              }}
              activeHighlight={activeHighlight}
              bfsResult={bfsResult}
              dfsResult={dfsResult}
              activeCycle={activeCycle}
              shortestPathResult={shortestPathResult}
              findingAccounts={findingAccountsSet}
              findingEdges={findingEdgesSet}
              findingSeverity={selectedFinding?.severity}
              flaggedAccountIds={flaggedAccountIds}
              elevatedAccountIds={elevatedAccountIds}
              stepVisitedNodes={stepVisitedNodes}
              stepTreeEdges={stepTreeEdges}
              currentStepNode={currentStepNode}
              onSetSource={(id) => {
                if (isCustom) setCustomShortestPathSource(id);
                else setDatasetShortestPathSource(id);
                handleRunShortestPath(id, shortestPathDest);
              }}
              onSetDest={(id) => {
                if (isCustom) setCustomShortestPathDest(id);
                else setDatasetShortestPathDest(id);
                handleRunShortestPath(shortestPathSource, id);
              }}
              onOpenAddAccount={() => setIsAddAccOpen(true)}
              onDeleteTransaction={handleDeleteTransaction}
              onClearFindingHighlight={handleCloseEvidence}
              isCustomMode={isCustom}
            />
          </div>

          {/* RIGHT: ALGORITHM WORKBENCH OR INVESTIGATION FINDINGS & EVIDENCE (5 of 12 cols on desktop) */}
          <div className="lg:col-span-5 flex flex-col gap-4 lg:max-h-[750px] lg:overflow-y-auto pr-1">
            {isFraudInvestigation ? (
              <>
                {/* 1. Evidence Inspection Panel (Primary Focus when finding is clicked) */}
                {selectedFinding && (
                  <EvidenceDetailsPanel
                    finding={selectedFinding}
                    accounts={accounts}
                    transactions={transactions}
                    onClose={handleCloseEvidence}
                    onSelectAccount={(id) => setSelectedAccountId(id)}
                  />
                )}

                {/* 2. Account Inspector (if an account is clicked and no finding is selected) */}
                {selectedAccountId && !selectedFinding && (
                  <AccountInspector
                    account={accounts.find((a) => a.id === selectedAccountId) || null}
                    transactions={transactions}
                    onClose={() => setSelectedAccountId(null)}
                    onSetSource={(id) => {
                      if (isCustom) setCustomShortestPathSource(id);
                      else setDatasetShortestPathSource(id);
                      handleRunShortestPath(id, shortestPathDest);
                    }}
                    onSetDest={(id) => {
                      if (isCustom) setCustomShortestPathDest(id);
                      else setDatasetShortestPathDest(id);
                      handleRunShortestPath(shortestPathSource, id);
                    }}
                    onStartBfs={(id) => {
                      if (isCustom) setCustomBfsStartNode(id);
                      else setDatasetBfsStartNode(id);
                      handleRunBFS(id);
                    }}
                    onStartDfs={(id) => {
                      if (isCustom) setCustomDfsStartNode(id);
                      else setDatasetDfsStartNode(id);
                      handleRunDFS(id);
                    }}
                    onDeleteAccount={handleDeleteAccount}
                    onDeleteTransaction={handleDeleteTransaction}
                    isCustomMode={isCustom}
                  />
                )}

                {/* 3. Findings Panel */}
                <InvestigationFindingsPanel
                  findings={hasInvestigated ? (investigation?.findings || []) : []}
                  selectedFinding={selectedFinding}
                  onInspectEvidence={handleInspectEvidence}
                  onClearEvidence={handleCloseEvidence}
                  onSelectAccount={(id) => setSelectedAccountId(id)}
                />
              </>
            ) : (
              <>
                {/* Standard Algorithm Studio / Workbench */}
                <AlgorithmControls
                  accounts={accounts}
                  activeDatasetId={isCustom ? 'custom_lab' : activeDatasetId}
                  source={shortestPathSource}
                  destination={shortestPathDest}
                  onSourceChange={(src) => {
                    if (isCustom) setCustomShortestPathSource(src);
                    else setDatasetShortestPathSource(src);
                  }}
                  onDestChange={(dest) => {
                    if (isCustom) setCustomShortestPathDest(dest);
                    else setDatasetShortestPathDest(dest);
                  }}
                  bfsStartNode={bfsStartNode}
                  onBfsStartChange={(node) => {
                    if (isCustom) setCustomBfsStartNode(node);
                    else setDatasetBfsStartNode(node);
                  }}
                  dfsStartNode={dfsStartNode}
                  onDfsStartChange={(node) => {
                    if (isCustom) setCustomDfsStartNode(node);
                    else setDatasetDfsStartNode(node);
                  }}
                  onRunBFS={handleRunBFS}
                  onRunDFS={handleRunDFS}
                  onRunCycleDetection={handleRunCycleDetection}
                  onRunShortestPath={handleRunShortestPath}
                  onHighlight={handleHighlight}
                  onStepHighlight={handleStepHighlight}
                  bfsResult={bfsResult}
                  dfsResult={dfsResult}
                  cycleResult={cycleDetection}
                  shortestPathResult={shortestPathResult}
                  activeHighlight={activeHighlight}
                  loading={loading}
                />

                {/* Account Inspector (appears when user clicks an account node) */}
                {selectedAccountId && (
                  <AccountInspector
                    account={accounts.find((a) => a.id === selectedAccountId) || null}
                    transactions={transactions}
                    onClose={() => setSelectedAccountId(null)}
                    onSetSource={(id) => {
                      if (isCustom) setCustomShortestPathSource(id);
                      else setDatasetShortestPathSource(id);
                      handleRunShortestPath(id, shortestPathDest);
                    }}
                    onSetDest={(id) => {
                      if (isCustom) setCustomShortestPathDest(id);
                      else setDatasetShortestPathDest(id);
                      handleRunShortestPath(shortestPathSource, id);
                    }}
                    onStartBfs={(id) => {
                      if (isCustom) setCustomBfsStartNode(id);
                      else setDatasetBfsStartNode(id);
                      handleRunBFS(id);
                    }}
                    onStartDfs={(id) => {
                      if (isCustom) setCustomDfsStartNode(id);
                      else setDatasetDfsStartNode(id);
                      handleRunDFS(id);
                    }}
                    onDeleteAccount={handleDeleteAccount}
                    onDeleteTransaction={handleDeleteTransaction}
                    isCustomMode={isCustom}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* BOTTOM COLLAPSIBLE EVIDENCE & EXPLORATION DRAWERS */}
        <div className="space-y-3 pt-2">
          {/* Drawer 1: Rule-Based Investigation Findings & Discrepancies (Mode A non-fraud and Custom Lab) */}
          {!isFraudInvestigation && (
            <div className="rounded-2xl bg-navy-900/90 border border-slate-800 overflow-hidden shadow-xl">
              <button
                onClick={() => setIsFindingsOpen(!isFindingsOpen)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      Rule Investigation &amp; Retained Discrepancies
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 border border-amber-800 text-amber-300 font-mono font-bold">
                        {investigation?.total_findings || 0} Review Signals
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Rule-based anomaly detection: Intermediary Mules, Retention Percentages, and Neutral Explanations
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-xs font-mono">{isFindingsOpen ? 'Collapse' : 'Expand'}</span>
                  {isFindingsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isFindingsOpen && (
                <div className="p-4 border-t border-slate-800/80 bg-navy-950/60">
                  <InvestigationPanel
                    report={investigation}
                    onSelectAccount={(id) => setSelectedAccountId(id)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Drawer 2: Directed Transaction Ledger */}
          <div className="rounded-2xl bg-navy-900/90 border border-slate-800 overflow-hidden shadow-xl">
            <button
              onClick={() => setIsLedgerOpen(!isLedgerOpen)}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    Directed Transaction Ledger
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950 border border-teal-800 text-teal-300 font-mono font-bold">
                      {transactions.length} Active Edges
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Searchable ledger of all directed edges, integer paise values, timestamps, and memos
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-xs font-mono">{isLedgerOpen ? 'Collapse' : 'Expand'}</span>
                {isLedgerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {isLedgerOpen && (
              <div className="p-4 border-t border-slate-800/80 bg-navy-950/60">
                <TransactionTable
                  transactions={transactions}
                  onSelectAccount={(id) => setSelectedAccountId(id)}
                  onInvestigateRoute={(from, to) => {
                    if (isCustom) {
                      setCustomShortestPathSource(from);
                      setCustomShortestPathDest(to);
                    } else {
                      setDatasetShortestPathSource(from);
                      setDatasetShortestPathDest(to);
                    }
                    handleRunShortestPath(from, to);
                  }}
                />
              </div>
            )}
          </div>

          {/* Drawer 3: Academic DSA Concepts & Invariant Reference */}
          <div className="rounded-2xl bg-navy-900/90 border border-slate-800 overflow-hidden shadow-xl">
            <button
              onClick={() => setIsDsaRefOpen(!isDsaRefOpen)}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    Academic Data Structures &amp; Complexity Reference
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 border border-purple-800 text-purple-300 font-mono font-bold">
                      DSA Proofs
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Adjacency list representation, O(V + E) complexity invariants, and algorithm constraints
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-xs font-mono">{isDsaRefOpen ? 'Collapse' : 'Expand'}</span>
                {isDsaRefOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {isDsaRefOpen && (
              <div className="p-4 border-t border-slate-800/80 bg-navy-950/60 text-xs text-slate-300 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-navy-900 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-cyan-400 text-sm">Adjacency List vs Adjacency Matrix</h4>
                    <p className="text-slate-400 leading-relaxed">
                      Financial graphs have high vertex counts but sparse transaction connectivity ($|E| \ll |V|^2$). FraudGraph uses an Adjacency List:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono text-[11px]">
                      <li>Space Complexity: <strong>O(V + E)</strong> (vs O(V²) for matrices)</li>
                      <li>Outgoing Edge Iteration: <strong>O(deg⁺(u))</strong></li>
                      <li>Deterministic Sorting: Outgoing edges ordered by destination and transaction ID</li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-navy-900 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-teal-400 text-sm">BFS vs Dijkstra Shortest Path</h4>
                    <p className="text-slate-400 leading-relaxed">
                      BFS is mathematically optimal for <strong>unweighted</strong> graphs, finding paths with the minimum edge count (hops) in <strong>O(V + E)</strong> time.
                    </p>
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                      <strong>Limitation:</strong> Unweighted BFS ignores monetary edge weights. For fee or dollar minimization, Dijkstra's algorithm would be required.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-navy-900 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-rose-400 text-sm">3-State DFS Cycle Detection</h4>
                    <p className="text-slate-400 leading-relaxed">
                      To detect circular routing without false positives from cross-edges in DAGs, nodes are assigned 3 states:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono text-[11px]">
                      <li><strong className="text-cyan-300">WHITE:</strong> Unvisited vertex</li>
                      <li><strong className="text-amber-300">GRAY:</strong> Currently on active recursion call stack</li>
                      <li><strong className="text-slate-400">BLACK:</strong> Subtree exploration completely finished</li>
                      <li>A back-edge to a <strong>GRAY</strong> node indicates a directed cycle.</li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-navy-900 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-purple-400 text-sm">Legal &amp; Forensic Review Disclaimer</h4>
                    <p className="text-slate-400 leading-relaxed">
                      In graph theory, circular cycles, intermediary hops, and degree hubs are topological features. In financial contexts, they represent <strong>review signals</strong> for compliance analysts, not legal proof of fraud or financial wrongdoing.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Reset Confirmation Dialog (Section 5) */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-navy-900 border border-rose-500/40 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Reset Custom Graph?</h3>
                <p className="text-xs text-rose-300 font-medium">This action permanently clears the current custom graph.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              All custom vertices, directed edges, transaction records, and investigation findings will be permanently cleared. The canvas will return to an empty state. Predefined datasets will remain completely untouched.
            </p>

            <div className="flex items-center justify-end gap-3 text-xs font-semibold">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResetCustom}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors shadow-lg shadow-rose-600/30"
              >
                Confirm Reset Graph
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddAccountModal
        isOpen={isAddAccOpen}
        onClose={() => setIsAddAccOpen(false)}
        existingAccountIds={accounts.map((a) => a.id)}
        onAddAccount={handleAddAccount}
      />

      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        accounts={accounts}
        onAddTransaction={handleAddTransaction}
      />

      <AcademicConceptsModal
        isOpen={isAcademicModalOpen}
        onClose={() => setIsAcademicModalOpen(false)}
      />
    </div>
  );
};
