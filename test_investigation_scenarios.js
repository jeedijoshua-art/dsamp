const assert = require('assert');

const BASE_URL = 'http://localhost:5001/api';

async function get(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.statusText}`);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.statusText}`);
  return res.json();
}

async function runScenarioTests() {
  console.log('==========================================================');
  console.log('   FraudGraph Investigation Scenarios Automated Test     ');
  console.log('==========================================================\n');

  // 1. Check scenarios endpoint
  console.log('--- 1. Scenarios Catalog Endpoint ---');
  const scenariosData = await get('/scenarios');
  assert.strictEqual(scenariosData.status, 'success', 'Scenarios endpoint status should be success');
  assert.strictEqual(scenariosData.scenarios.length, 3, 'Should provide exactly 3 investigation scenarios');
  console.log('  [PASS] Exactly 3 scenarios available');

  const scenarioIds = scenariosData.scenarios.map(s => s.id);
  assert(scenarioIds.includes('circular_flow'), 'Scenario circular_flow must exist');
  assert(scenarioIds.includes('intermediary_account'), 'Scenario intermediary_account must exist');
  assert(scenarioIds.includes('multiple_signals'), 'Scenario multiple_signals must exist');
  console.log('  [PASS] All 3 expected scenario IDs present');

  // 2. Test Scenario 1: Circular Money Flow
  console.log('\n--- 2. Scenario 1: Circular Money Flow ---');
  const select1 = await post('/scenarios/select', { scenario_id: 'circular_flow' });
  assert.strictEqual(select1.status, 'success');
  assert.strictEqual(select1.active_scenario_id, 'circular_flow');
  assert.strictEqual(select1.dataset.accounts.length, 5, 'Circular flow has 5 accounts');
  assert.strictEqual(select1.dataset.transactions.length, 5, 'Circular flow has 5 transactions');
  console.log('  [PASS] Switched to circular_flow (5 vertices, 5 edges)');

  // Run C++ engine on circular_flow
  const engine1 = await post('/execute', {
    accounts: select1.dataset.accounts,
    transactions: select1.dataset.transactions,
    action: 'full_analysis'
  });
  assert.strictEqual(engine1.status, 'success');
  assert.strictEqual(engine1.cycle_detection.has_cycle, true, 'Circular flow must have a directed cycle');
  assert(engine1.cycle_detection.cycles.length >= 1, 'At least 1 cycle detected');
  const cycle = engine1.cycle_detection.cycles[0];
  console.log(`    Detected cycle path: ${cycle.node_path.join(' -> ')}`);
  assert.strictEqual(cycle.node_path[0], cycle.node_path[cycle.node_path.length - 1], 'Cycle must close');
  assert(cycle.node_path.includes('ACC_P_CORP'), 'Cycle contains ACC_P_CORP');
  assert(cycle.node_path.includes('ACC_Q_HOLDING'), 'Cycle contains ACC_Q_HOLDING');
  assert(cycle.node_path.includes('ACC_R_VENTURE'), 'Cycle contains ACC_R_VENTURE');
  console.log('  [PASS] Circular flow cycle detected via C++ three-state DFS');

  // 3. Test Scenario 2: Intermediary Account
  console.log('\n--- 3. Scenario 2: Intermediary Account ---');
  const select2 = await post('/scenarios/select', { scenario_id: 'intermediary_account' });
  assert.strictEqual(select2.status, 'success');
  assert.strictEqual(select2.active_scenario_id, 'intermediary_account');
  assert.strictEqual(select2.dataset.accounts.length, 6, 'Intermediary account scenario has 6 accounts');
  assert.strictEqual(select2.dataset.transactions.length, 4, 'Intermediary account scenario has 4 transactions');
  console.log('  [PASS] Switched to intermediary_account (6 vertices, 4 edges)');

  // Run C++ engine on intermediary_account
  const engine2 = await post('/execute', {
    accounts: select2.dataset.accounts,
    transactions: select2.dataset.transactions,
    action: 'full_analysis',
    params: {
      source: 'ACC_ALICE',
      destination: 'ACC_TARGET_D'
    }
  });
  assert.strictEqual(engine2.status, 'success');
  // Check intermediary mule finding
  const muleFinding = engine2.investigation.findings.find(f => f.rule_id === 'RULE_INTERMEDIARY_MULE' && f.flagged_accounts.includes('ACC_MULE_X'));
  assert(muleFinding, 'ACC_MULE_X must trigger intermediary mule rule');
  assert.strictEqual(muleFinding.amount_in_paise, 5000000, 'Inflow must be ₹50,000');
  assert.strictEqual(muleFinding.amount_out_paise, 4200000, 'Outflow must be ₹42,000');
  assert.strictEqual(muleFinding.discrepancy_paise, 800000, 'Discrepancy must be ₹8,000 (16%)');
  console.log(`    Intermediary finding: ${muleFinding.summary} (Discrepancy: ₹${muleFinding.discrepancy_inr})`);
  console.log('  [PASS] Intermediary discrepancy calculated correctly by C++ engine');

  // Check multi-hop shortest path from origin to destination
  assert.strictEqual(engine2.shortest_path.path_exists, true);
  assert.strictEqual(engine2.shortest_path.hop_count, 2, 'Two hops via ACC_MULE_X');
  assert.deepStrictEqual(engine2.shortest_path.node_path, ['ACC_ALICE', 'ACC_MULE_X', 'ACC_TARGET_D']);
  console.log('  [PASS] Multi-hop transmission chain verified');

  // 4. Test Scenario 3: Multiple Warning Signals
  console.log('\n--- 4. Scenario 3: Multiple Warning Signals ---');
  const select3 = await post('/scenarios/select', { scenario_id: 'multiple_signals' });
  assert.strictEqual(select3.status, 'success');
  assert.strictEqual(select3.active_scenario_id, 'multiple_signals');
  assert.strictEqual(select3.dataset.accounts.length, 17, 'Multiple warning signals has 17 accounts');
  assert.strictEqual(select3.dataset.transactions.length, 16, 'Multiple warning signals has 16 transactions');
  console.log('  [PASS] Switched to multiple_signals (17 vertices, 16 edges)');

  const engine3 = await post('/execute', {
    accounts: select3.dataset.accounts,
    transactions: select3.dataset.transactions,
    action: 'full_analysis'
  });
  assert.strictEqual(engine3.status, 'success');
  assert.strictEqual(engine3.cycle_detection.has_cycle, true);
  assert(engine3.cycle_detection.cycles.length >= 2, 'Should detect self-loop and multi-node cycle');
  assert(engine3.investigation.findings.length > 0, 'Should have multiple rule findings');
  console.log(`    Detected ${engine3.cycle_detection.cycles.length} cycles and ${engine3.investigation.total_findings} rule findings`);
  console.log('  [PASS] Multiple warning signals fully analyzed by C++ engine');

  // 5. Test Dataset Reset
  console.log('\n--- 5. Reset Dataset ---');
  const resetRes = await post('/reset', { dataset_id: 'fraud_investigation' });
  assert.strictEqual(resetRes.status, 'success');
  assert.strictEqual(resetRes.dataset.accounts.length, 17);
  console.log('  [PASS] Reset cleanly restores default scenario state');

  console.log('\n==========================================================');
  console.log('   ALL INVESTIGATION SCENARIO ASSERTIONS PASSED!         ');
  console.log('==========================================================\n');
}

runScenarioTests().catch(err => {
  console.error('\n[TEST FAILURE]', err);
  process.exit(1);
});
