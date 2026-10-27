/**
 * FraudGraph - Deterministic Synthetic Demonstration Dataset
 * Labeled explicitly as synthetic data for academic evaluation.
 */

const SAMPLE_ACCOUNTS = [
  // Intermediary Chain Scenario: Alice -> Mule X -> Target D
  {
    id: "ACC_ALICE",
    name: "Alice Exporters Ltd.",
    type: "Originator / Corporate",
    risk_tier: "LOW",
    created_at: "2026-01-15T08:00:00Z"
  },
  {
    id: "ACC_MULE_X",
    name: "Xavier Transit Agency",
    type: "Intermediary / Layering",
    risk_tier: "HIGH",
    created_at: "2026-03-10T11:30:00Z"
  },
  {
    id: "ACC_TARGET_D",
    name: "Delta Offshore Holding",
    type: "Destination / Shell",
    risk_tier: "MEDIUM",
    created_at: "2026-02-20T14:15:00Z"
  },

  // Directed Circular Routing (Cycle) Scenario: P -> Q -> R -> P
  {
    id: "ACC_P_CORP",
    name: "Prime Holdings Co.",
    type: "Commercial Entity",
    risk_tier: "MEDIUM",
    created_at: "2026-04-01T09:00:00Z"
  },
  {
    id: "ACC_Q_HOLDING",
    name: "Quantum Logistics",
    type: "Intermediary Partner",
    risk_tier: "MEDIUM",
    created_at: "2026-04-05T10:45:00Z"
  },
  {
    id: "ACC_R_VENTURE",
    name: "Radiant Capital Trust",
    type: "Investment Pool",
    risk_tier: "MEDIUM",
    created_at: "2026-04-10T16:20:00Z"
  },

  // Branching Graph Scenario: Demonstrates BFS vs DFS Traversal Disparity
  {
    id: "ACC_BRANCH_HUB",
    name: "Central Clearing Node",
    type: "Regional Hub",
    risk_tier: "LOW",
    created_at: "2026-05-01T08:00:00Z"
  },
  {
    id: "ACC_BRANCH_B1",
    name: "Branch Alpha",
    type: "Settlement Branch",
    risk_tier: "LOW",
    created_at: "2026-05-02T09:00:00Z"
  },
  {
    id: "ACC_BRANCH_B2",
    name: "Branch Beta",
    type: "Settlement Branch",
    risk_tier: "LOW",
    created_at: "2026-05-02T09:30:00Z"
  },
  {
    id: "ACC_BRANCH_C1",
    name: "Sub-Agency C1",
    type: "Terminal Node",
    risk_tier: "LOW",
    created_at: "2026-05-03T10:00:00Z"
  },
  {
    id: "ACC_BRANCH_C2",
    name: "Sub-Agency C2",
    type: "Terminal Node",
    risk_tier: "LOW",
    created_at: "2026-05-03T10:30:00Z"
  },
  {
    id: "ACC_BRANCH_D1",
    name: "Sub-Agency D1",
    type: "Terminal Node",
    risk_tier: "LOW",
    created_at: "2026-05-04T11:00:00Z"
  },
  {
    id: "ACC_BRANCH_D2",
    name: "Sub-Agency D2",
    type: "Terminal Node",
    risk_tier: "LOW",
    created_at: "2026-05-04T11:30:00Z"
  },

  // Repeated Transfers Scenario
  {
    id: "ACC_SUPPLIER_S",
    name: "Steel Supply Direct",
    type: "Vendor",
    risk_tier: "LOW",
    created_at: "2026-06-01T08:00:00Z"
  },
  {
    id: "ACC_VENDOR_V",
    name: "Apex Manufacturing",
    type: "Manufacturer",
    risk_tier: "LOW",
    created_at: "2026-06-05T09:00:00Z"
  },

  // Disconnected / Isolated Account
  {
    id: "ACC_ISOLATED",
    name: "Cold Vault Reserve",
    type: "Dormant / Isolated",
    risk_tier: "LOW",
    created_at: "2026-01-01T00:00:00Z"
  },

  // Self-Loop Transfer Account
  {
    id: "ACC_INTERNAL_POOL",
    name: "Treasury Rebalance Pool",
    type: "Internal Pool",
    risk_tier: "LOW",
    created_at: "2026-07-01T08:00:00Z"
  },
  // Extra accounts for dedicated academic dataset scenarios
  {
    id: "ACC_EXPRESS_GATEWAY",
    name: "Express Clearing Gateway",
    type: "Alternate Direct Route",
    risk_tier: "LOW",
    created_at: "2026-02-01T08:00:00Z"
  },
  {
    id: "ACC_SECONDARY_ROUTE",
    name: "Secondary Routing Node",
    type: "Detour Transit",
    risk_tier: "LOW",
    created_at: "2026-02-05T09:00:00Z"
  },
  {
    id: "ACC_ESCROW_VAULT",
    name: "Escrow Vault Depot",
    type: "Multi-hop Endpoint",
    risk_tier: "LOW",
    created_at: "2026-02-10T10:00:00Z"
  },
  {
    id: "ACC_AUDIT_OBSERVER",
    name: "Settlement Auditor",
    type: "Terminal Observer",
    risk_tier: "LOW",
    created_at: "2026-04-12T11:00:00Z"
  }
];

const SAMPLE_TRANSACTIONS = [
  // 1. Intermediary Chain (Discrepancy: ₹50,000 sent, ₹42,000 forwarded -> ₹8,000 / 16% retained by Mule X)
  {
    id: "TX_CHAIN_01",
    from_account: "ACC_ALICE",
    to_account: "ACC_MULE_X",
    amount_paise: 5000000, // ₹50,000.00
    timestamp: "2026-10-25T10:00:00Z",
    memo: "Consulting Advance Disbursement"
  },
  {
    id: "TX_CHAIN_02",
    from_account: "ACC_MULE_X",
    to_account: "ACC_TARGET_D",
    amount_paise: 4200000, // ₹42,000.00
    timestamp: "2026-10-25T11:30:00Z",
    memo: "Offshore Project Allocation"
  },

  // 2. Directed Cycle (Round-tripping loop of ₹25,000: P -> Q -> R -> P)
  {
    id: "TX_CYCLE_01",
    from_account: "ACC_P_CORP",
    to_account: "ACC_Q_HOLDING",
    amount_paise: 2500000, // ₹25,000.00
    timestamp: "2026-10-25T12:00:00Z",
    memo: "Inter-company Liquidity Transfer"
  },
  {
    id: "TX_CYCLE_02",
    from_account: "ACC_Q_HOLDING",
    to_account: "ACC_R_VENTURE",
    amount_paise: 2500000, // ₹25,000.00
    timestamp: "2026-10-25T12:45:00Z",
    memo: "Short-term Escrow Funding"
  },
  {
    id: "TX_CYCLE_03",
    from_account: "ACC_R_VENTURE",
    to_account: "ACC_P_CORP",
    amount_paise: 2500000, // ₹25,000.00
    timestamp: "2026-10-25T13:30:00Z",
    memo: "Repatriation of Escrow Balance"
  },

  // 3. Branching Graph (Demonstrating BFS Level-by-Level vs DFS Depth-First)
  {
    id: "TX_BR_01",
    from_account: "ACC_BRANCH_HUB",
    to_account: "ACC_BRANCH_B1",
    amount_paise: 1000000, // ₹10,000.00
    timestamp: "2026-10-25T14:00:00Z",
    memo: "Sub-division Allocation Alpha"
  },
  {
    id: "TX_BR_02",
    from_account: "ACC_BRANCH_HUB",
    to_account: "ACC_BRANCH_B2",
    amount_paise: 1000000, // ₹10,000.00
    timestamp: "2026-10-25T14:05:00Z",
    memo: "Sub-division Allocation Beta"
  },
  {
    id: "TX_BR_03",
    from_account: "ACC_BRANCH_B1",
    to_account: "ACC_BRANCH_C1",
    amount_paise: 450000, // ₹4,500.00
    timestamp: "2026-10-25T14:15:00Z",
    memo: "Local Clearing 01"
  },
  {
    id: "TX_BR_04",
    from_account: "ACC_BRANCH_B1",
    to_account: "ACC_BRANCH_C2",
    amount_paise: 450000, // ₹4,500.00
    timestamp: "2026-10-25T14:20:00Z",
    memo: "Local Clearing 02"
  },
  {
    id: "TX_BR_05",
    from_account: "ACC_BRANCH_B2",
    to_account: "ACC_BRANCH_D1",
    amount_paise: 450000, // ₹4,500.00
    timestamp: "2026-10-25T14:25:00Z",
    memo: "Regional Distribution 01"
  },
  {
    id: "TX_BR_06",
    from_account: "ACC_BRANCH_B2",
    to_account: "ACC_BRANCH_D2",
    amount_paise: 450000, // ₹4,500.00
    timestamp: "2026-10-25T14:30:00Z",
    memo: "Regional Distribution 02"
  },

  // 4. Repeated Transfers (Between same source and destination: 2 distinct payments)
  {
    id: "TX_REP_01",
    from_account: "ACC_SUPPLIER_S",
    to_account: "ACC_VENDOR_V",
    amount_paise: 1500000, // ₹15,000.00
    timestamp: "2026-10-25T15:00:00Z",
    memo: "Invoice INV-2026-881 (Batch A)"
  },
  {
    id: "TX_REP_02",
    from_account: "ACC_SUPPLIER_S",
    to_account: "ACC_VENDOR_V",
    amount_paise: 1500000, // ₹15,000.00
    timestamp: "2026-10-25T15:30:00Z",
    memo: "Invoice INV-2026-882 (Batch B)"
  },

  // 5. Self-Loop Transfer
  {
    id: "TX_SELF_01",
    from_account: "ACC_INTERNAL_POOL",
    to_account: "ACC_INTERNAL_POOL",
    amount_paise: 250000, // ₹2,500.00
    timestamp: "2026-10-25T16:00:00Z",
    memo: "Automated Sub-ledger Pool Balancing"
  },

  // Additional transactions for Shortest Route and Cycle scenarios
  {
    id: "TX_ALT_01",
    from_account: "ACC_ALICE",
    to_account: "ACC_EXPRESS_GATEWAY",
    amount_paise: 5000000, // ₹50,000.00
    timestamp: "2026-10-25T16:15:00Z",
    memo: "Express Clearing Priority Inflow"
  },
  {
    id: "TX_ALT_02",
    from_account: "ACC_EXPRESS_GATEWAY",
    to_account: "ACC_TARGET_D",
    amount_paise: 4900000, // ₹49,000.00
    timestamp: "2026-10-25T16:30:00Z",
    memo: "Direct Settlement Outflow"
  },
  {
    id: "TX_DETOUR_01",
    from_account: "ACC_ALICE",
    to_account: "ACC_SECONDARY_ROUTE",
    amount_paise: 1500000, // ₹15,000.00
    timestamp: "2026-10-25T16:45:00Z",
    memo: "Secondary Routing Channel Batch 1"
  },
  {
    id: "TX_DETOUR_02",
    from_account: "ACC_SECONDARY_ROUTE",
    to_account: "ACC_MULE_X",
    amount_paise: 1500000, // ₹15,000.00
    timestamp: "2026-10-25T17:00:00Z",
    memo: "Secondary Routing Channel Batch 2"
  },
  {
    id: "TX_VAULT_01",
    from_account: "ACC_TARGET_D",
    to_account: "ACC_ESCROW_VAULT",
    amount_paise: 3000000, // ₹30,000.00
    timestamp: "2026-10-25T17:15:00Z",
    memo: "Cold Escrow Multi-hop Depot Allocation"
  },
  {
    id: "TX_OBS_01",
    from_account: "ACC_P_CORP",
    to_account: "ACC_AUDIT_OBSERVER",
    amount_paise: 500000, // ₹5,000.00
    timestamp: "2026-10-25T17:30:00Z",
    memo: "Supervisory Fee Disbursement"
  }
];

// Helper to filter accounts by IDs
function selectAccounts(ids) {
  const set = new Set(ids);
  return SAMPLE_ACCOUNTS.filter(a => set.has(a.id)).map(a => ({ ...a }));
}

// Helper to filter transactions by IDs
function selectTransactions(ids) {
  const set = new Set(ids);
  return SAMPLE_TRANSACTIONS.filter(t => set.has(t.id)).map(t => ({ ...t }));
}

/**
 * Catalog of 5 Prebuilt Academic Demonstration Datasets
 */
const PREBUILT_DATASETS = [
  {
    id: "basic_traversal",
    title: "Basic Traversal",
    subtitle: "Hierarchical Clearing Network",
    category: "BFS & DFS Traversal",
    description: "A clean branching tree graph designed to contrast Breadth-First Search level-by-level exploration against Depth-First Search branch-deep traversal.",
    learning_objective: "Observe FIFO queue frontier expansion in BFS versus LIFO recursion in DFS, comparing discovery/finish timestamps and hop distances from root.",
    node_count: 7,
    edge_count: 6,
    default_algorithm: "bfs",
    default_source: "ACC_BRANCH_HUB",
    default_destination: "ACC_BRANCH_D2",
    default_bfs_start: "ACC_BRANCH_HUB",
    default_dfs_start: "ACC_BRANCH_HUB",
    accounts: selectAccounts([
      "ACC_BRANCH_HUB",
      "ACC_BRANCH_B1",
      "ACC_BRANCH_B2",
      "ACC_BRANCH_C1",
      "ACC_BRANCH_C2",
      "ACC_BRANCH_D1",
      "ACC_BRANCH_D2"
    ]),
    transactions: selectTransactions([
      "TX_BR_01",
      "TX_BR_02",
      "TX_BR_03",
      "TX_BR_04",
      "TX_BR_05",
      "TX_BR_06"
    ])
  },
  {
    id: "circular_transactions",
    title: "Circular Transactions",
    subtitle: "Round-Tripping Loop & Self-Loops",
    category: "Cycle Detection",
    description: "Directed cycles designed to demonstrate Three-State DFS (WHITE/GRAY/BLACK) back-edge detection, cycle path reconstruction, and distinguishing multi-node cycles from self-loops.",
    learning_objective: "Understand cycle detection using three-state node coloring, identifying back-edges (pointing to a GRAY ancestor), and reconstructing the directed loop.",
    node_count: 5,
    edge_count: 5,
    default_algorithm: "cycle_detection",
    default_source: "ACC_P_CORP",
    default_destination: "ACC_R_VENTURE",
    default_bfs_start: "ACC_P_CORP",
    default_dfs_start: "ACC_P_CORP",
    accounts: selectAccounts([
      "ACC_P_CORP",
      "ACC_Q_HOLDING",
      "ACC_R_VENTURE",
      "ACC_INTERNAL_POOL",
      "ACC_AUDIT_OBSERVER"
    ]),
    transactions: selectTransactions([
      "TX_CYCLE_01",
      "TX_CYCLE_02",
      "TX_CYCLE_03",
      "TX_SELF_01",
      "TX_OBS_01"
    ])
  },
  {
    id: "shortest_route",
    title: "Shortest Route",
    subtitle: "Multi-Path Settlement Topology",
    category: "Shortest Path BFS",
    description: "A multi-path topology featuring direct 1-hop, fast 2-hop, and extended 3-hop routes between origin and settlement targets, plus alternate branches.",
    learning_objective: "Verify that BFS finds the unweighted shortest path by edge count (minimum hops) via level-by-level queue traversal and predecessor backtracking.",
    node_count: 6,
    edge_count: 7,
    default_algorithm: "shortest_path",
    default_source: "ACC_ALICE",
    default_destination: "ACC_TARGET_D",
    default_bfs_start: "ACC_ALICE",
    default_dfs_start: "ACC_ALICE",
    accounts: selectAccounts([
      "ACC_ALICE",
      "ACC_MULE_X",
      "ACC_TARGET_D",
      "ACC_EXPRESS_GATEWAY",
      "ACC_SECONDARY_ROUTE",
      "ACC_ESCROW_VAULT"
    ]),
    transactions: selectTransactions([
      "TX_CHAIN_01",
      "TX_CHAIN_02",
      "TX_ALT_01",
      "TX_ALT_02",
      "TX_DETOUR_01",
      "TX_DETOUR_02",
      "TX_VAULT_01"
    ])
  },
  {
    id: "fraud_investigation",
    title: "Fraud Investigation",
    subtitle: "Academic Standard Benchmark",
    category: "Forensic Investigation",
    description: "The comprehensive academic benchmark graph featuring the Alice → Mule X → Target D layering chain, circular round-tripping, branching clearing network, repeated vendor invoices, and self-loop pool.",
    learning_objective: "Examine multidimensional graph analysis combining topological path tracing, cycle detection, and rule-based amount retention discrepancies.",
    node_count: 14,
    edge_count: 14,
    default_algorithm: "investigate",
    default_source: "ACC_ALICE",
    default_destination: "ACC_TARGET_D",
    default_bfs_start: "ACC_ALICE",
    default_dfs_start: "ACC_ALICE",
    // Uses the exact 14 benchmark accounts and 14 transactions from original suite
    accounts: selectAccounts([
      "ACC_ALICE", "ACC_MULE_X", "ACC_TARGET_D",
      "ACC_P_CORP", "ACC_Q_HOLDING", "ACC_R_VENTURE",
      "ACC_BRANCH_HUB", "ACC_BRANCH_B1", "ACC_BRANCH_B2",
      "ACC_BRANCH_C1", "ACC_BRANCH_C2", "ACC_BRANCH_D1", "ACC_BRANCH_D2",
      "ACC_SUPPLIER_S", "ACC_VENDOR_V", "ACC_ISOLATED", "ACC_INTERNAL_POOL"
    ]).filter(a => a.id !== "ACC_EXPRESS_GATEWAY" && a.id !== "ACC_SECONDARY_ROUTE" && a.id !== "ACC_ESCROW_VAULT" && a.id !== "ACC_AUDIT_OBSERVER"),
    transactions: selectTransactions([
      "TX_CHAIN_01", "TX_CHAIN_02",
      "TX_CYCLE_01", "TX_CYCLE_02", "TX_CYCLE_03",
      "TX_BR_01", "TX_BR_02", "TX_BR_03", "TX_BR_04", "TX_BR_05", "TX_BR_06",
      "TX_REP_01", "TX_REP_02",
      "TX_SELF_01"
    ])
  },
  {
    id: "disconnected_graph",
    title: "Disconnected Graph",
    subtitle: "Partitioned Subnetworks & Unreachability",
    category: "Graph Connectivity",
    description: "A network with multiple disconnected components: an active payment pipeline, a separate isolated vendor cluster, and a completely isolated cold vault.",
    learning_objective: "Demonstrate traversal behavior across disconnected graph components, graceful failure for unreachable destinations, and single-vertex traversals on isolated nodes.",
    node_count: 6,
    edge_count: 4,
    default_algorithm: "shortest_path",
    default_source: "ACC_ALICE",
    default_destination: "ACC_ISOLATED",
    default_bfs_start: "ACC_ISOLATED",
    default_dfs_start: "ACC_ISOLATED",
    accounts: selectAccounts([
      "ACC_ALICE",
      "ACC_MULE_X",
      "ACC_TARGET_D",
      "ACC_SUPPLIER_S",
      "ACC_VENDOR_V",
      "ACC_ISOLATED"
    ]),
    transactions: selectTransactions([
      "TX_CHAIN_01",
      "TX_CHAIN_02",
      "TX_REP_01",
      "TX_REP_02"
    ])
  }
];

function getPrebuiltDatasets() {
  return JSON.parse(JSON.stringify(PREBUILT_DATASETS));
}

function getDatasetById(id) {
  const ds = PREBUILT_DATASETS.find(d => d.id === id);
  if (!ds) {
    return PREBUILT_DATASETS.find(d => d.id === "fraud_investigation");
  }
  return JSON.parse(JSON.stringify(ds));
}

function getSampleDataset() {
  const base = getDatasetById("fraud_investigation");
  return {
    metadata: {
      dataset_label: "FraudGraph Academic Standard Benchmark [SYNTHETIC]",
      description: "Deterministic financial graph demonstrating Intermediary Mules, Amount Discrepancies, Directed Cycles, BFS vs DFS Branching Orders, Repeated Transfers, Self-Loops, and Disconnected Accounts.",
      currency: "INR (Indian Rupee)",
      unit: "Paise (1 INR = 100 Paise)"
    },
    accounts: base.accounts,
    transactions: base.transactions
  };
}

module.exports = {
  SAMPLE_ACCOUNTS,
  SAMPLE_TRANSACTIONS,
  PREBUILT_DATASETS,
  getPrebuiltDatasets,
  getDatasetById,
  getSampleDataset
};
