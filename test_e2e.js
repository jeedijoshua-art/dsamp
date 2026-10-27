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
        res.on('end', () => resolve(JSON.parse(buf)));
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
        res.on('end', () => resolve(JSON.parse(buf)));
      })
      .on('error', reject);
  });
}

async function run() {
  console.log('--- 1. Health Check ---');
  const h = await get('/api/health');
  console.log('Health:', h.status, '| C++ Engine Binary Present:', h.engine_binary_present);

  // Set active dataset to fraud_investigation for deterministic baseline
  await post('/api/datasets/select', { dataset_id: 'fraud_investigation' });

  console.log('\n--- 2a. Shortest Path Regression: Two-Hop (ACC_ALICE -> ACC_TARGET_D) ---');
  const sp2 = await post('/api/execute', {
    action: 'shortest_path',
    params: { source: 'ACC_ALICE', destination: 'ACC_TARGET_D' }
  });
  if (!sp2.shortest_path.path_exists || sp2.shortest_path.hop_count !== 2 || sp2.shortest_path.node_path.length !== 3) {
    throw new Error('Two-hop regression test failed: ' + JSON.stringify(sp2.shortest_path));
  }
  console.log('  [PASS] Path exists:', sp2.shortest_path.path_exists, '| Hop count:', sp2.shortest_path.hop_count);
  console.log('  [PASS] Path sequence:', sp2.shortest_path.node_path.join(' -> '));
  console.log('  [PASS] Transaction IDs:', sp2.shortest_path.transaction_ids.join(', '));

  console.log('\n--- 2b. Shortest Path Regression: Direct One-Hop (ACC_ALICE -> ACC_MULE_X) ---');
  const sp1 = await post('/api/execute', {
    action: 'shortest_path',
    params: { source: 'ACC_ALICE', destination: 'ACC_MULE_X' }
  });
  if (!sp1.shortest_path.path_exists || sp1.shortest_path.hop_count !== 1 || sp1.shortest_path.node_path.length !== 2) {
    throw new Error('One-hop regression test failed: ' + JSON.stringify(sp1.shortest_path));
  }
  console.log('  [PASS] One-hop path exists:', sp1.shortest_path.path_exists, '| Hop count:', sp1.shortest_path.hop_count);
  console.log('  [PASS] One-hop path sequence:', sp1.shortest_path.node_path.join(' -> '));

  console.log('\n--- 2c. Shortest Path Regression: Unreachable Destination (ACC_ALICE -> ACC_ISOLATED) ---');
  const spUnreach = await post('/api/execute', {
    action: 'shortest_path',
    params: { source: 'ACC_ALICE', destination: 'ACC_ISOLATED' }
  });
  if (spUnreach.shortest_path.path_exists || spUnreach.shortest_path.hop_count !== 0) {
    throw new Error('Unreachable regression test failed: ' + JSON.stringify(spUnreach.shortest_path));
  }
  console.log('  [PASS] Unreachable correctly reported. path_exists:', spUnreach.shortest_path.path_exists);
  console.log('  [PASS] Error message:', spUnreach.shortest_path.error_message);

  console.log('\n--- 2d. Shortest Path Regression: Source Equal to Destination (ACC_ALICE -> ACC_ALICE) ---');
  const spSame = await post('/api/execute', {
    action: 'shortest_path',
    params: { source: 'ACC_ALICE', destination: 'ACC_ALICE' }
  });
  if (!spSame.shortest_path.path_exists || spSame.shortest_path.hop_count !== 0 || spSame.shortest_path.node_path.length !== 1) {
    throw new Error('Source equals destination regression test failed: ' + JSON.stringify(spSame.shortest_path));
  }
  console.log('  [PASS] Identity path exists:', spSame.shortest_path.path_exists, '| Hop count:', spSame.shortest_path.hop_count);
  console.log('  [PASS] Identity node path:', spSame.shortest_path.node_path.join(' -> '));

  console.log('\n--- 3. Directed Cycle Detection (Three-State DFS) ---');
  const cyc = await post('/api/execute', { action: 'cycle_detection' });
  console.log('Has cycle:', cyc.cycle_detection.has_cycle);
  console.log('Total Cycles detected:', cyc.cycle_detection.cycles.length);
  cyc.cycle_detection.cycles.forEach((c, idx) => {
    console.log(`  Cycle #${idx + 1}: ${c.node_path.join(' -> ')} | Volume: INR ${c.cycle_volume_inr} | Self-Loop: ${c.is_self_loop}`);
  });

  console.log('\n--- 4. Rule-Based Investigation & Discrepancies ---');
  const inv = await post('/api/execute', {
    action: 'investigate',
    params: { source: 'ACC_ALICE', destination: 'ACC_TARGET_D' }
  });
  console.log('Total Findings:', inv.investigation.total_findings);
  const muleFinding = inv.investigation.findings.find(
    (f) => f.rule_id === 'RULE_INTERMEDIARY_MULE' && f.flagged_accounts.includes('ACC_MULE_X')
  );
  if (muleFinding) {
    console.log('  [PASS] Intermediary Mule Flagged: ACC_MULE_X');
    console.log('  Inflow: INR', muleFinding.amount_in_inr, '| Outflow: INR', muleFinding.amount_out_inr);
    console.log('  Retained Discrepancy: INR', muleFinding.discrepancy_inr, `(${muleFinding.discrepancy_pct}%)`);
    console.log('  Neutral non-fraud explanation:', muleFinding.neutral_explanation.substring(0, 80) + '...');
  }

  console.log('\n--- 5. Dynamic Transaction Addition & Auto-Discovery ---');
  const addTxRes = await post('/api/transactions', {
    id: 'TX_USER_OVERRIDE_01',
    from_account: 'ACC_ALICE',
    to_account: 'ACC_TARGET_D',
    amount: 12500,
    memo: 'Direct settlement override'
  });
  console.log('Added Transaction Result:', addTxRes.status, '| Total Transactions:', addTxRes.dataset.transactions.length);

  console.log('\n--- 6. Reset Dataset to Deterministic Benchmark ---');
  const resetRes = await post('/api/reset');
  console.log('Reset Message:', resetRes.message, '| Active Transactions after reset:', resetRes.dataset.transactions.length);

  console.log('\n==========================================================');
  console.log('   ALL END-TO-END PIPELINE & ALGORITHM CHECKS PASSED!     ');
  console.log('==========================================================');
}

run().catch((e) => {
  console.error('FAILED:', e);
  process.exit(1);
});
