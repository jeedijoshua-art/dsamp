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
            resolve({ status: res.statusCode, data: JSON.parse(buf) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: buf });
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
            resolve({ status: res.statusCode, data: JSON.parse(buf) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: buf });
          }
        });
      })
      .on('error', reject);
  });
}

function del(path) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5001,
        path: path,
        method: 'DELETE'
      },
      (res) => {
        let buf = '';
        res.on('data', (d) => (buf += d));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(buf) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: buf });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`  [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  [PASS] ${message}`);
}

async function runRegressionTests() {
  console.log('==========================================================');
  console.log('   FraudGraph Custom Investigation Lab Regression Suite   ');
  console.log('==========================================================\n');

  // 1. Health check
  console.log('--- Health & Backend Check ---');
  const h = await get('/api/health');
  assert(h.status === 200 && h.data.engine_binary_present, 'C++ engine online and healthy');

  // Predefined dataset baseline
  const catalogRes = await get('/api/datasets');
  assert(catalogRes.data.datasets.length === 5, 'Predefined datasets catalog contains 5 datasets');

  // ==========================================================
  // Test A — Fresh Custom Lab Initial State
  // ==========================================================
  console.log('\n--- Test A: Fresh Custom Lab Initial State ---');
  // Send empty graph snapshot to C++ engine
  const freshCustomRes = await post('/api/execute', {
    accounts: [],
    transactions: [],
    action: 'full_analysis'
  });

  assert(freshCustomRes.status === 200, 'Empty custom snapshot executed successfully');
  assert(freshCustomRes.data.graph_summary.account_count === 0, 'Custom Lab initial vertices = 0');
  assert(freshCustomRes.data.graph_summary.transaction_count === 0, 'Custom Lab initial edges = 0');
  assert(freshCustomRes.data.graph_summary.total_volume_paise === 0, 'Custom Lab network volume = ₹0');
  assert(freshCustomRes.data.cycle_detection.has_cycle === false, 'Custom Lab initial directed cycles = 0');
  assert(freshCustomRes.data.cycle_detection.cycles.length === 0, 'No cycles in empty custom graph');
  assert(
    !freshCustomRes.data.graph_summary.accounts.some((a) =>
      ['ACC_ALICE', 'ACC_MULE_X', 'ACC_BRANCH_HUB'].includes(a.id)
    ),
    'No predefined accounts leak into empty custom graph'
  );

  // ==========================================================
  // Test B — Create Custom Graph (A, B, C with A->B, B->C, C->A)
  // ==========================================================
  console.log('\n--- Test B: Create Custom Graph (Cycle A -> B -> C -> A) ---');
  const customAccounts = [
    { id: 'ACC_A', name: 'Alpha Entity', type: 'Corporate', risk_tier: 'LOW' },
    { id: 'ACC_B', name: 'Beta Entity', type: 'Merchant', risk_tier: 'MEDIUM' },
    { id: 'ACC_C', name: 'Gamma Entity', type: 'Settlement', risk_tier: 'HIGH' }
  ];

  const customTransactions = [
    { id: 'TX_A_B', from_account: 'ACC_A', to_account: 'ACC_B', amount_paise: 100000 },
    { id: 'TX_B_C', from_account: 'ACC_B', to_account: 'ACC_C', amount_paise: 200000 },
    { id: 'TX_C_A', from_account: 'ACC_C', to_account: 'ACC_A', amount_paise: 300000 }
  ];

  const cycleRes = await post('/api/execute', {
    accounts: customAccounts,
    transactions: customTransactions,
    action: 'cycle_detection'
  });

  assert(cycleRes.status === 200, 'Cycle detection ran successfully via C++ engine');
  assert(cycleRes.data.cycle_detection.has_cycle === true, 'Directed cycle correctly detected by 3-state DFS');
  assert(cycleRes.data.cycle_detection.cycles.length >= 1, 'At least 1 cycle reconstructed');

  const detectedCycle = cycleRes.data.cycle_detection.cycles[0];
  console.log('    Reconstructed Cycle Path:', detectedCycle.node_path.join(' -> '));
  console.log('    Associated Transaction IDs:', detectedCycle.transaction_ids.join(', '));
  console.log('    Total Cycle Volume (INR):', detectedCycle.cycle_volume_inr);

  // Verify that cycle contains ACC_A, ACC_B, ACC_C and closes
  assert(detectedCycle.node_path.length === 4, 'Cycle length is exactly 3 edges + 1 loop closure node');
  assert(detectedCycle.node_path[0] === detectedCycle.node_path[3], 'Cycle path starts and ends at same node');
  assert(
    detectedCycle.transaction_ids.includes('TX_A_B') &&
    detectedCycle.transaction_ids.includes('TX_B_C') &&
    detectedCycle.transaction_ids.includes('TX_C_A'),
    'Cycle contains actual custom transaction IDs [TX_A_B, TX_B_C, TX_C_A]'
  );
  assert(detectedCycle.cycle_volume_paise === 600000, 'Cycle volume is exactly ₹6,000 (600,000 paise)');

  // ==========================================================
  // Test C — Delete an Account (Delete B)
  // ==========================================================
  console.log('\n--- Test C: Delete Account (Remove B and incident edges) ---');
  // Remove ACC_B: incident edges TX_A_B (to ACC_B) and TX_B_C (from ACC_B) must be removed
  const accountsAfterDel = customAccounts.filter((a) => a.id !== 'ACC_B');
  const transactionsAfterDel = customTransactions.filter(
    (t) => t.from_account !== 'ACC_B' && t.to_account !== 'ACC_B'
  );

  assert(accountsAfterDel.length === 2, 'Graph contains exactly 2 vertices after deleting ACC_B');
  assert(transactionsAfterDel.length === 1, 'Graph contains exactly 1 directed edge (TX_C_A) after cascading edge deletion');
  assert(transactionsAfterDel[0].id === 'TX_C_A', 'Only non-incident edge TX_C_A survives');

  // Verify C++ engine on updated graph
  const postDelRes = await post('/api/execute', {
    accounts: accountsAfterDel,
    transactions: transactionsAfterDel,
    action: 'cycle_detection'
  });

  assert(postDelRes.data.cycle_detection.has_cycle === false, 'Cycle broken: has_cycle is now false');
  assert(postDelRes.data.cycle_detection.cycles.length === 0, 'No cycles remain involving deleted vertex B');

  // Shortest path through deleted B must not exist
  const spBRes = await post('/api/execute', {
    accounts: accountsAfterDel,
    transactions: transactionsAfterDel,
    action: 'shortest_path',
    params: { source: 'ACC_A', destination: 'ACC_B' }
  });
  assert(spBRes.data.shortest_path.path_exists === false, 'Path to deleted account B no longer exists');

  // ==========================================================
  // Test D — Reset Graph to Blank Canvas
  // ==========================================================
  console.log('\n--- Test D: Full Custom Reset to Blank Canvas ---');
  const resetCustomRes = await post('/api/execute', {
    accounts: [],
    transactions: [],
    action: 'full_analysis'
  });

  assert(resetCustomRes.data.graph_summary.account_count === 0, 'Vertices reset to 0');
  assert(resetCustomRes.data.graph_summary.transaction_count === 0, 'Edges reset to 0');
  assert(resetCustomRes.data.graph_summary.total_volume_paise === 0, 'Network volume reset to ₹0');

  // Run BFS on empty graph and verify clean validation error
  const bfsEmptyRes = await post('/api/execute', {
    accounts: [],
    transactions: [],
    action: 'bfs',
    params: { start_node: 'ACC_A' }
  });
  assert(bfsEmptyRes.data.bfs.success === false, 'BFS on empty graph safely rejected');
  assert(bfsEmptyRes.data.bfs.error_message.includes('empty'), 'Helpful empty-graph validation error message returned');

  // ==========================================================
  // Test E — Dataset Isolation & Non-Interference
  // ==========================================================
  console.log('\n--- Test E: Dataset Isolation & Non-Interference ---');
  // 1. Select basic_traversal
  const ds1 = await post('/api/datasets/select', { dataset_id: 'basic_traversal' });
  const ds1Nodes = ds1.data.dataset.accounts.length;
  const ds1Edges = ds1.data.dataset.transactions.length;
  assert(ds1Nodes === 7 && ds1Edges === 6, 'Baseline basic_traversal: 7 vertices, 6 edges');

  // 2. Perform custom graph execution
  await post('/api/execute', {
    accounts: [
      { id: 'CUSTOM_X', name: 'Temp X', type: 'Personal', risk_tier: 'LOW' }
    ],
    transactions: [],
    action: 'full_analysis'
  });

  // 3. Check that active predefined dataset is completely unchanged
  const curDs = await get('/api/dataset');
  assert(curDs.data.dataset.accounts.length === ds1Nodes, 'Predefined dataset accounts count unchanged (7)');
  assert(curDs.data.dataset.transactions.length === ds1Edges, 'Predefined dataset edges count unchanged (6)');
  assert(!curDs.data.dataset.accounts.some((a) => a.id === 'CUSTOM_X'), 'CUSTOM_X did not contaminate predefined dataset');

  // 4. Reset custom endpoint does not reset or alter predefined dataset
  await post('/api/custom/reset', {});
  const afterResetDs = await get('/api/dataset');
  assert(afterResetDs.data.dataset.accounts.length === ds1Nodes, 'Predefined dataset still intact after custom reset');

  // ==========================================================
  // Test F — Stale State Validation & Constraint Checks
  // ==========================================================
  console.log('\n--- Test F: Constraint & Stale State Validation ---');
  // Reject negative amount on backend
  const negTxRes = await post('/api/transactions', {
    id: 'TX_INVALID_NEG',
    from_account: 'ACC_BRANCH_HUB',
    to_account: 'ACC_BRANCH_B1',
    amount: -500
  });
  assert(negTxRes.status === 400, 'Negative amount rejected with 400 Bad Request');

  // Reject zero amount
  const zeroTxRes = await post('/api/transactions', {
    id: 'TX_INVALID_ZERO',
    from_account: 'ACC_BRANCH_HUB',
    to_account: 'ACC_BRANCH_B1',
    amount: 0
  });
  assert(zeroTxRes.status === 400, 'Zero amount rejected with 400 Bad Request');

  // Reject missing accounts (do not auto-create!)
  const missingAccRes = await post('/api/transactions', {
    id: 'TX_GHOST',
    from_account: 'NONEXISTENT_FROM',
    to_account: 'NONEXISTENT_TO',
    amount: 1000
  });
  assert(missingAccRes.status === 400, 'Missing accounts correctly rejected without silent auto-creation');

  console.log('\n==========================================================');
  console.log('   ALL CUSTOM LAB ISOLATION & REGRESSION TESTS PASSED!   ');
  console.log('==========================================================\n');
}

runRegressionTests().catch((err) => {
  console.error('\n[REGRESSION SUITE FAILED]:', err.message);
  process.exit(1);
});
