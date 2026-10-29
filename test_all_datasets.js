const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body || {});
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5001,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      },
      (res) => {
        let buf = '';
        res.on('data', (d) => (buf += d));
        res.on('end', () => {
          try {
            resolve(JSON.parse(buf));
          } catch (e) {
            reject(new Error(`Failed to parse JSON response from ${path}: ${buf.substring(0, 200)}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    http
      .get('http://localhost:5001' + path, (res) => {
        let buf = '';
        res.on('data', (d) => (buf += d));
        res.on('end', () => {
          try {
            resolve(JSON.parse(buf));
          } catch (e) {
            reject(new Error(`Failed to parse JSON response from ${path}: ${buf.substring(0, 200)}`));
          }
        });
      })
      .on('error', reject);
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`  [FAIL] ${message}`);
    throw new Error(message);
  }
  console.log(`  [PASS] ${message}`);
}

async function run() {
  console.log('==========================================================');
  console.log('   FraudGraph Full Integration & Dataset Suite Test       ');
  console.log('==========================================================\n');

  console.log('--- 1. Health Check & C++ Engine Binary ---');
  const health = await get('/api/health');
  assert(health.status === 'ok', 'Health status is ok');
  assert(health.engine_binary_present === true, 'C++ engine binary is linked and present');

  console.log('\n--- 2. Prebuilt Datasets Catalog Verification ---');
  const catalog = await get('/api/datasets');
  assert(catalog.status === 'success', 'Catalog status is success');
  assert(Array.isArray(catalog.datasets) && catalog.datasets.length === 5, 'Exactly 5 prebuilt datasets available');

  const datasetIds = catalog.datasets.map((d) => d.id);
  assert(datasetIds.includes('basic_traversal'), 'basic_traversal dataset is registered');
  assert(datasetIds.includes('circular_transactions'), 'circular_transactions dataset is registered');
  assert(datasetIds.includes('shortest_route'), 'shortest_route dataset is registered');
  assert(datasetIds.includes('fraud_investigation'), 'fraud_investigation dataset is registered');
  assert(datasetIds.includes('disconnected_graph'), 'disconnected_graph dataset is registered');

  console.log('\n--- 3. Dataset 1: Basic Traversal (BFS & DFS Exploration) ---');
  const sel1 = await post('/api/datasets/select', { dataset_id: 'basic_traversal' });
  assert(sel1.active_dataset_id === 'basic_traversal', 'Active dataset switched to basic_traversal');
  assert(sel1.dataset.accounts.length === 7, 'Tree network has 7 vertices');
  assert(sel1.dataset.transactions.length === 6, 'Tree network has 6 directed edges');

  // BFS Execution & Step Trace
  const bfs1 = await post('/api/execute', {
    action: 'bfs',
    params: { start_node: 'ACC_BRANCH_HUB' }
  });
  assert(bfs1.bfs.success === true, 'BFS executed successfully on tree');
  assert(bfs1.bfs.traversal_order.length === 7, 'BFS visits all 7 tree nodes');
  assert(bfs1.bfs.traversal_order[0] === 'ACC_BRANCH_HUB', 'Root is first in BFS traversal');
  assert(Array.isArray(bfs1.bfs.steps) && bfs1.bfs.steps.length === 7, 'BFS generated 7 execution trace steps');
  assert(bfs1.bfs.steps[0].current_node === 'ACC_BRANCH_HUB', 'Step 1 is root node');

  // DFS Execution & Step Trace
  const dfs1 = await post('/api/execute', {
    action: 'dfs',
    params: { start_node: 'ACC_BRANCH_HUB' }
  });
  assert(dfs1.dfs.success === true, 'DFS executed successfully on tree');
  assert(dfs1.dfs.traversal_order.length === 7, 'DFS visits all 7 tree nodes');
  assert(Array.isArray(dfs1.dfs.steps) && dfs1.dfs.steps.length === 7, 'DFS generated 7 execution trace steps');

  console.log('\n--- 4. Dataset 2: Circular Transactions (Cycle Detection) ---');
  const sel2 = await post('/api/datasets/select', { dataset_id: 'circular_transactions' });
  assert(sel2.active_dataset_id === 'circular_transactions', 'Active dataset switched to circular_transactions');
  const cyc2 = await post('/api/execute', { action: 'cycle_detection' });
  assert(cyc2.cycle_detection.has_cycle === true, 'Directed cycles detected');
  assert(cyc2.cycle_detection.cycles.length === 2, 'Exactly 2 cycles detected (1 loop, 1 self-loop)');

  const selfLoop = cyc2.cycle_detection.cycles.find((c) => c.is_self_loop);
  assert(selfLoop !== undefined, 'Self-loop cycle detected');
  assert(selfLoop.node_path[0] === 'ACC_INTERNAL_POOL', 'Self-loop node matches ACC_INTERNAL_POOL');

  const multiLoop = cyc2.cycle_detection.cycles.find((c) => !c.is_self_loop);
  assert(multiLoop !== undefined, 'Multi-node cycle detected');
  assert(multiLoop.node_path.length === 4, 'Multi-node cycle contains 3 distinct nodes plus closure [P->Q->R->P]');
  assert(multiLoop.cycle_volume_inr === 75000, 'Cycle volume is ₹75,000');

  console.log('\n--- 5. Dataset 3: Shortest Route (Multi-Path Topology) ---');
  const sel3 = await post('/api/datasets/select', { dataset_id: 'shortest_route' });
  assert(sel3.active_dataset_id === 'shortest_route', 'Active dataset switched to shortest_route');

  // Two-hop shortest path (Alice -> Target D)
  const spAliceTarget = await post('/api/execute', {
    action: 'shortest_path',
    params: { source: 'ACC_ALICE', destination: 'ACC_TARGET_D' }
  });
  assert(spAliceTarget.shortest_path.path_exists === true, 'Path exists from Alice to Target D');
  assert(spAliceTarget.shortest_path.hop_count === 2, 'Shortest path is 2 hops (via Express Gateway or Mule)');

  // Three-hop path (Alice -> Escrow Vault)
  const spAliceVault = await post('/api/execute', {
    action: 'shortest_path',
    params: { source: 'ACC_ALICE', destination: 'ACC_ESCROW_VAULT' }
  });
  assert(spAliceVault.shortest_path.path_exists === true, 'Path exists from Alice to Escrow Vault');
  assert(spAliceVault.shortest_path.hop_count === 3, 'Path to Escrow Vault is 3 hops');

  // Identity path (Alice -> Alice)
  const spIdentity = await post('/api/execute', {
    action: 'shortest_path',
    params: { source: 'ACC_ALICE', destination: 'ACC_ALICE' }
  });
  assert(spIdentity.shortest_path.path_exists === true, 'Identity path exists for source == destination');
  assert(spIdentity.shortest_path.hop_count === 0, 'Hop count is 0 for identity path');

  console.log('\n--- 6. Dataset 5: Disconnected Graph (Partitioned Subnetworks) ---');
  const sel5 = await post('/api/datasets/select', { dataset_id: 'disconnected_graph' });
  assert(sel5.active_dataset_id === 'disconnected_graph', 'Active dataset switched to disconnected_graph');

  // Unreachable destination query
  const spUnreachable = await post('/api/execute', {
    action: 'shortest_path',
    params: { source: 'ACC_ALICE', destination: 'ACC_ISOLATED' }
  });
  assert(spUnreachable.shortest_path.path_exists === false, 'Correctly reports unreachable destination');
  assert(spUnreachable.shortest_path.hop_count === 0, 'Hop count is 0 for unreachable destination');
  assert(typeof spUnreachable.shortest_path.error_message === 'string', 'Helpful error message returned');

  // BFS on isolated vertex
  const bfsIso = await post('/api/execute', {
    action: 'bfs',
    params: { start_node: 'ACC_ISOLATED' }
  });
  assert(bfsIso.bfs.success === true, 'BFS succeeds on isolated node');
  assert(bfsIso.bfs.traversal_order.length === 1, 'BFS visits only isolated vertex itself');

  console.log('\n--- 7. Dataset 4: Fraud Investigation (Full Academic Benchmark) ---');
  const sel4 = await post('/api/datasets/select', { dataset_id: 'fraud_investigation' });
  assert(sel4.active_dataset_id === 'fraud_investigation', 'Active dataset switched to fraud_investigation');

  const invRes = await post('/api/execute', {
    action: 'investigate',
    params: { source: 'ACC_ALICE', destination: 'ACC_TARGET_D' }
  });
  assert(invRes.investigation.total_findings > 0, 'Forensic rule findings generated');
  const muleF = invRes.investigation.findings.find(
    (f) => f.rule_id === 'RULE_INTERMEDIARY_MULE' && f.flagged_accounts.includes('ACC_MULE_X')
  );
  assert(muleF !== undefined, 'Flagged Intermediary Mule Xavier Transit Agency (ACC_MULE_X)');
  assert(muleF.discrepancy_inr === 8000, 'Retained discrepancy is exactly ₹8,000 (16%)');
  assert(typeof muleF.neutral_explanation === 'string', 'Neutral non-fraud explanation provided');

  // BFS Execution on Fraud Investigation from ACC_ALICE
  const bfsAlice = await post('/api/execute', {
    action: 'bfs',
    params: { start_node: 'ACC_ALICE' }
  });
  assert(bfsAlice.bfs.success === true, 'BFS executed successfully from ACC_ALICE');
  assert(bfsAlice.bfs.traversal_order.length === 12, 'BFS visits exactly 12 reachable vertices from ACC_ALICE');
  assert(bfsAlice.bfs.steps.length === 12, 'BFS has 12 execution trace steps');

  // Check BFS level-by-level hop order
  const bfsOrder = bfsAlice.bfs.traversal_order;
  assert(bfsOrder[0] === 'ACC_ALICE', 'BFS root is ACC_ALICE (hop 0)');
  assert(bfsOrder[1] === 'ACC_MULE_X' && bfsOrder[2] === 'ACC_SUPPLIER_S', 'BFS level 1 contains ACC_MULE_X and ACC_SUPPLIER_S');
  assert(bfsOrder[3] === 'ACC_TARGET_D' && bfsOrder[4] === 'ACC_VENDOR_V', 'BFS level 2 contains ACC_TARGET_D and ACC_VENDOR_V');
  assert(bfsOrder[5] === 'ACC_BRANCH_HUB', 'BFS level 3 contains ACC_BRANCH_HUB');

  // Verify non-decreasing hop distance property in BFS traversal and trace
  for (let i = 0; i < bfsOrder.length - 1; i++) {
    const distCurr = bfsAlice.bfs.distances[bfsOrder[i]];
    const distNext = bfsAlice.bfs.distances[bfsOrder[i + 1]];
    assert(
      distCurr <= distNext,
      `BFS order index ${i} (${bfsOrder[i]}: ${distCurr}) <= index ${i + 1} (${bfsOrder[i + 1]}: ${distNext})`
    );
    assert(
      bfsAlice.bfs.steps[i].metric_val <= bfsAlice.bfs.steps[i + 1].metric_val,
      `BFS step ${i} metric_val (${bfsAlice.bfs.steps[i].metric_val}) <= step ${i + 1} (${bfsAlice.bfs.steps[i + 1].metric_val})`
    );
  }

  // DFS Execution on Fraud Investigation from ACC_ALICE
  const dfsAlice = await post('/api/execute', {
    action: 'dfs',
    params: { start_node: 'ACC_ALICE' }
  });
  assert(dfsAlice.dfs.success === true, 'DFS executed successfully from ACC_ALICE');
  assert(dfsAlice.dfs.traversal_order.length === 12, 'DFS visits exactly 12 reachable vertices from ACC_ALICE');
  assert(dfsAlice.dfs.steps.length === 12, 'DFS has 12 execution trace steps');

  const dfsOrder = dfsAlice.dfs.traversal_order;
  // Disparity assertion: BFS and DFS traversal orders are strictly distinct
  assert(bfsOrder.join(',') !== dfsOrder.join(','), 'BFS and DFS produce distinct traversal orders on branching graph');

  // DFS dives deeply down ACC_MULE_X -> ACC_TARGET_D -> ACC_BRANCH_HUB before visiting ACC_SUPPLIER_S
  assert(dfsOrder[0] === 'ACC_ALICE', 'DFS root is ACC_ALICE');
  assert(dfsOrder[1] === 'ACC_MULE_X', 'DFS first child is ACC_MULE_X');
  assert(dfsOrder[2] === 'ACC_TARGET_D', 'DFS dives into ACC_TARGET_D');
  assert(dfsOrder[3] === 'ACC_BRANCH_HUB', 'DFS dives into ACC_BRANCH_HUB');
  assert(dfsOrder.indexOf('ACC_SUPPLIER_S') === 10, 'DFS visits ACC_SUPPLIER_S only after deep branch finishes (index 10 vs BFS index 2)');
  assert(dfsOrder.indexOf('ACC_VENDOR_V') === 11, 'DFS visits ACC_VENDOR_V at the very end (index 11 vs BFS index 4)');

  // Same reachable set invariant
  const bfsSet = new Set(bfsOrder);
  const dfsSet = new Set(dfsOrder);
  assert(bfsSet.size === 12 && dfsSet.size === 12, 'Both traversals have 12 unique vertices');
  for (const node of bfsSet) {
    assert(dfsSet.has(node), `DFS reached set contains BFS node ${node}`);
  }

  // Verify disconnected / unlinked vertices are NOT reached
  const unreachableNodes = ['ACC_ISOLATED', 'ACC_INTERNAL_POOL', 'ACC_P_CORP', 'ACC_Q_HOLDING', 'ACC_R_VENTURE'];
  for (const u of unreachableNodes) {
    assert(!bfsSet.has(u), `Disconnected account ${u} is unreachable in BFS`);
    assert(!dfsSet.has(u), `Disconnected account ${u} is unreachable in DFS`);
  }

  console.log('\n--- 8. Custom Investigation Lab (Vertex/Edge Mutations & Validation) ---');
  // Validation: empty ID rejected
  const errAcc = await post('/api/accounts', { id: '' });
  assert(errAcc.status === 'error', 'Empty account ID properly rejected');

  // Add custom account
  const addAccRes = await post('/api/accounts', {
    id: 'ACC_CUSTOM_VERIFIED_100',
    name: 'Custom Testing Enterprise',
    type: 'Merchant',
    risk_tier: 'LOW'
  });
  assert(addAccRes.status === 'success', 'Custom account successfully added');

  // Add custom transaction
  const addTxRes = await post('/api/transactions', {
    id: 'TX_CUSTOM_VERIFIED_100',
    from_account: 'ACC_ALICE',
    to_account: 'ACC_CUSTOM_VERIFIED_100',
    amount: 7500,
    memo: 'Custom Edge Verification'
  });
  assert(addTxRes.status === 'success', 'Custom directed edge successfully added');

  // Reject duplicate transaction ID
  const dupTxRes = await post('/api/transactions', {
    id: 'TX_CUSTOM_VERIFIED_100',
    from_account: 'ACC_ALICE',
    to_account: 'ACC_CUSTOM_VERIFIED_100',
    amount: 5000
  });
  assert(dupTxRes.status === 'error', 'Duplicate transaction ID rejected');

  console.log('\n--- 9. Reset Benchmark Clean State ---');
  const resetRes = await post('/api/reset', { dataset_id: 'fraud_investigation' });
  assert(resetRes.status === 'success', 'Dataset cleanly reset to fraud_investigation benchmark standard');

  console.log('\n==========================================================');
  console.log('   ALL 36/36 INTEGRATION & DATASET ASSERTIONS PASSED!    ');
  console.log('==========================================================');
}

run().catch((e) => {
  console.error('\nIntegration tests failed:', e);
  process.exit(1);
});
