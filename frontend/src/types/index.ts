export interface Account {
  id: string;
  name: string;
  type?: string;
  account_type?: string;
  risk_tier?: 'LOW' | 'MEDIUM' | 'HIGH';
  created_at?: string;
  in_degree?: number;
  out_degree?: number;
  total_incoming_paise?: number;
  total_incoming_inr?: number;
  total_outgoing_paise?: number;
  total_outgoing_inr?: number;
  is_disconnected?: boolean;
}

export interface Transaction {
  id: string;
  from_account: string;
  to_account: string;
  amount_paise: number;
  amount_inr?: number;
  timestamp?: string;
  memo?: string;
}

export interface TraversalStep {
  step_number: number;
  current_node: string;
  metric_val: number;
  action: string;
  edge_tx_id: string;
  visited_so_far: string[];
  active_tree_edges: string[];
  description: string;
}

export interface BFSResult {
  success: boolean;
  error_message?: string;
  start_node: string;
  traversal_order: string[];
  distances: Record<string, number>;
  tree_edges: Array<{ from: string; to: string }>;
  tree_edge_tx_ids: string[];
  steps?: TraversalStep[];
  time_complexity: string;
  space_complexity: string;
}

export interface DFSResult {
  success: boolean;
  error_message?: string;
  start_node: string;
  traversal_order: string[];
  discovery_times: Record<string, number>;
  finish_times: Record<string, number>;
  tree_edges: Array<{ from: string; to: string }>;
  tree_edge_tx_ids: string[];
  steps?: TraversalStep[];
  time_complexity: string;
  space_complexity: string;
}

export interface InvestigationScenario {
  id: string;
  name: string;
  description: string;
  graph_concept: string;
  node_count: number;
  edge_count: number;
  default_source: string;
  default_destination: string;
  accounts: Account[];
  transactions: Transaction[];
}

export interface PrebuiltDataset {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  learning_objective: string;
  node_count: number;
  edge_count: number;
  default_algorithm: 'bfs' | 'dfs' | 'cycle_detection' | 'shortest_path' | 'investigate';
  default_source: string;
  default_destination: string;
  default_bfs_start: string;
  default_dfs_start: string;
  scenarios?: InvestigationScenario[];
  default_scenario_id?: string;
  accounts: Account[];
  transactions: Transaction[];
}

export interface DirectedCycle {
  node_path: string[];
  transaction_ids: string[];
  cycle_volume_paise: number;
  cycle_volume_inr: number;
  is_self_loop: boolean;
}

export interface CycleDetectionResult {
  success: boolean;
  has_cycle: boolean;
  summary: string;
  cycles: DirectedCycle[];
  time_complexity: string;
  space_complexity: string;
  algorithm_name: string;
}

export interface ShortestPathResult {
  success: boolean;
  path_exists: boolean;
  source: string;
  destination: string;
  hop_count: number;
  node_path: string[];
  transaction_ids: string[];
  transactions: Transaction[];
  total_volume_paise: number;
  total_volume_inr: number;
  error_message?: string;
  time_complexity: string;
  space_complexity: string;
  algorithm_name: string;
}

export interface RuleFinding {
  rule_id: string;
  rule_name: string;
  severity: 'HIGH' | 'WARNING' | 'INFO';
  flagged_accounts: string[];
  flagged_transactions: string[];
  summary: string;
  evidence_details: string;
  amount_in_paise: number;
  amount_in_inr: number;
  amount_out_paise: number;
  amount_out_inr: number;
  discrepancy_paise: number;
  discrepancy_inr: number;
  discrepancy_pct: number;
  neutral_explanation: string;
}

export interface InvestigationReport {
  total_findings: number;
  high_severity_count: number;
  warning_count: number;
  info_count: number;
  analyzed_source: string;
  analyzed_destination: string;
  findings: RuleFinding[];
}

export interface GraphSummary {
  account_count: number;
  transaction_count: number;
  total_volume_paise: number;
  total_volume_inr: number;
  accounts: Account[];
  transactions: Transaction[];
}

export interface EngineResponse {
  status: 'success' | 'error';
  error?: string;
  action: string;
  engine_version: string;
  build_warning?: string;
  graph_summary: GraphSummary;
  bfs?: BFSResult;
  dfs?: DFSResult;
  cycle_detection: CycleDetectionResult;
  shortest_path?: ShortestPathResult;
  investigation: InvestigationReport;
}
