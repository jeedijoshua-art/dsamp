import { Account, Transaction, EngineResponse } from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<{ status: string; engine_binary_present: boolean; engine_binary_path: string; timestamp: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchDataset(): Promise<{ status: string; dataset: { accounts: Account[]; transactions: Transaction[] } }> {
  const res = await fetch(`${API_BASE}/dataset`);
  if (!res.ok) throw new Error(`Failed to fetch dataset: ${res.statusText}`);
  return res.json();
}

export async function fetchDatasets(): Promise<{ status: string; active_dataset_id: string; datasets: import('../types').PrebuiltDataset[] }> {
  const res = await fetch(`${API_BASE}/datasets`);
  if (!res.ok) throw new Error(`Failed to fetch datasets catalog: ${res.statusText}`);
  return res.json();
}

export async function selectDataset(datasetId: string): Promise<{ status: string; message: string; active_dataset_id: string; dataset: any }> {
  const res = await fetch(`${API_BASE}/datasets/select`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataset_id: datasetId })
  });
  const data = await res.json();
  if (!res.ok || data.status === 'error') {
    throw new Error(data.error || 'Failed to switch dataset');
  }
  return data;
}

export async function resetDataset(datasetId?: string): Promise<{ status: string; message: string; dataset: { accounts: Account[]; transactions: Transaction[] } }> {
  const res = await fetch(`${API_BASE}/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datasetId ? { dataset_id: datasetId } : {})
  });
  if (!res.ok) throw new Error(`Failed to reset dataset: ${res.statusText}`);
  return res.json();
}

export async function addAccount(account: { id: string; name?: string; type?: string; risk_tier?: string }) {
  const res = await fetch(`${API_BASE}/accounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(account)
  });
  const data = await res.json();
  if (!res.ok || data.status === 'error') {
    throw new Error(data.error || 'Failed to add account');
  }
  return data;
}

export async function addTransaction(transaction: { id: string; from_account: string; to_account: string; amount?: number; amount_paise?: number; memo?: string }) {
  const res = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction)
  });
  const data = await res.json();
  if (!res.ok || data.status === 'error') {
    throw new Error(data.error || 'Failed to add transaction');
  }
  return data;
}

export async function deleteAccount(id: string) {
  const res = await fetch(`${API_BASE}/accounts/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!res.ok || data.status === 'error') {
    throw new Error(data.error || 'Failed to delete account');
  }
  return data;
}

export async function deleteTransaction(id: string) {
  const res = await fetch(`${API_BASE}/transactions/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!res.ok || data.status === 'error') {
    throw new Error(data.error || 'Failed to delete transaction');
  }
  return data;
}

export async function resetCustomGraph() {
  const res = await fetch(`${API_BASE}/custom/reset`, {
    method: 'POST'
  });
  const data = await res.json();
  if (!res.ok || data.status === 'error') {
    throw new Error(data.error || 'Failed to reset custom graph');
  }
  return data;
}

export async function executeEngine(payload: {
  accounts?: Account[];
  transactions?: Transaction[];
  action?: 'full_analysis' | 'bfs' | 'dfs' | 'cycle_detection' | 'shortest_path' | 'investigate' | 'graph_summary';
  params?: {
    start_node?: string;
    source?: string;
    destination?: string;
  };
}): Promise<EngineResponse> {
  const res = await fetch(`${API_BASE}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || data.status === 'error') {
    throw new Error(data.error || 'Engine execution failed');
  }
  return data;
}
