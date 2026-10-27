# Testing & Verification Guide — FraudGraph

This document provides a comprehensive report of the test suites, verification commands, and reproducibility checks available in **FraudGraph**.

---

## 1. Test Suite Summary Matrix

| Suite | Component | Execution Command | Scope / Assertions | Audit Result |
| :--- | :--- | :--- | :--- | :---: |
| **C++ Core Unit Tests** | Native C++17 Engine | `make -C engine test` | 92 Assertions (Data structures, BFS, DFS, cycles, SP, rules) | **92/92 PASS** |
| **End-to-End Pipeline** | Full Stack Bridge | `node test_e2e.js` | 6 Pipeline Stages (IPC, regression, cycles, mules, reset) | **PASS** |
| **Datasets Catalog Suite** | Backend & Engine | `node test_all_datasets.js` | 36 Assertions across all 5 benchmark datasets | **36/36 PASS** |
| **Custom Lab Suite** | Custom Graph Engine | `node test_custom_lab.js` | 22 Assertions (Mutations, cycles, cascading deletes, isolation)| **PASS** |
| **Frontend Production Build**| React 18 / TypeScript | `cd frontend && npm run build`| Full TypeScript type-check and Vite rollup bundling | **PASS (1.08s)** |

---

## 2. Test Suite 1: C++ Native Unit Tests

### Execution Command
```bash
make -C engine clean && make -C engine all && make -C engine test
```

### What It Tests:
- **Graph Construction:** In-degree, out-degree, integer paise volume aggregation, duplicate transaction ID rejection.
- **Empty & Non-Existent Input:** Fails safely with structured `success: false` and explanatory messages without segfaults.
- **BFS Branching Guarantees:** Strict level-order exploration ($0, 1, 2$) on a 7-node branching tree.
- **DFS Parenthesis Theorem:** Discovery timestamps $d[u]$ and finish timestamps $f[u]$ satisfying nested interval properties.
- **Three-State Directed Cycle Detection:**
  - Detects 3-node directed cycle ($P \to Q \to R \to P$) and calculates cycle volume.
  - Confirms diamond DAG has 0 false-positive cycles.
  - Identifies single-node self-loops (`ACC -> ACC`).
- **Shortest Path Regressions:**
  - Two-hop chain: `ACC_ALICE -> ACC_MULE_X -> ACC_TARGET_D`.
  - Direct one-hop: `ACC_ALICE -> ACC_MULE_X`.
  - Identity path (`source == destination`): 0 hops, 1 vertex.
  - Unreachable destination: 0 hops, informative error message.
- **Disconnected Components:** Isolated vertex BFS traversal visits only itself.
- **Repeated Transfers:** Multiple transactions between the same pair aggregated.
- **Forensic Rules:** Intermediary mule retention (₹8,000 / 16.0%) and neutral non-fraud explainability.

### Verification Output:
```
==========================================================
   Summary: 92/92 assertions passed.
==========================================================
ALL TESTS PASSED SUCCESSFULLY!
```

---

## 3. Test Suite 2: End-to-End Pipeline (`test_e2e.js`)

### Execution Command
*(Requires backend running on port 5001)*
```bash
node test_e2e.js
```

### What It Tests:
1. Health endpoint responsiveness and binary linkage.
2. Shortest-path regression across 2-hop, 1-hop, unreachable, and identity queries via HTTP POST.
3. Directed cycle detection via three-state DFS back-edge identification.
4. Heuristic rule evaluation flagging `ACC_MULE_X` with 16.0% retention and neutral explanation.
5. Dynamic transaction addition and automated graph reconciliation.
6. Clean reset back to benchmark standard.

### Verification Output:
```
==========================================================
   ALL END-TO-END PIPELINE & ALGORITHM CHECKS PASSED!     
==========================================================
```

---

## 4. Test Suite 3: Prebuilt Datasets Catalog (`test_all_datasets.js`)

### Execution Command
```bash
node test_all_datasets.js
```

### What It Tests:
Verifies that all 5 prebuilt academic datasets load, run their designated algorithms, and yield verified results:
1. **Basic Traversal:** 7 vertices, 6 edges; BFS and DFS both visit all 7 nodes.
2. **Circular Transactions:** Detects multi-node cycle ($P \to Q \to R \to P$) and self-loop pool.
3. **Shortest Route:** Reconstructs 2-hop path to Target D and 3-hop path to Escrow Vault.
4. **Disconnected Graph:** Gracefully reports unreachable target without crashing.
5. **Fraud Investigation:** Flags `ACC_MULE_X` with exact ₹8,000 net retention.

### Verification Output:
```
==========================================================
   ALL 36/36 INTEGRATION & DATASET ASSERTIONS PASSED!    
==========================================================
```

---

## 5. Test Suite 4: Custom Investigation Lab (`test_custom_lab.js`)

### Execution Command
```bash
node test_custom_lab.js
```

### What It Tests:
- **Blank Canvas State:** Zero vertices, zero edges, zero cycles on fresh custom canvas.
- **Dynamic Cycle Construction:** Dynamically adds accounts $A, B, C$ and edges $A \to B \to C \to A$, runs cycle detection, verifies reconstructed path sequence.
- **Cascading Node Deletion:** Deletes vertex $B$; confirms both $A \to B$ and $B \to C$ are pruned, breaking the cycle cleanly.
- **Dataset Isolation:** Confirms that custom lab modifications never mutate or contaminate the prebuilt dataset catalog.
- **Constraint Validation:** Rejects negative and zero transaction amounts with `400 Bad Request`. Rejects edges referencing non-existent accounts.

### Verification Output:
```
==========================================================
   ALL CUSTOM LAB ISOLATION & REGRESSION TESTS PASSED!   
==========================================================
```

---

## 6. Test Suite 5: Frontend Production Build

### Execution Command
```bash
cd frontend && npm run build
```

### What It Tests:
Executes the TypeScript compiler (`tsc`) to verify strict type safety across all components and models, followed by the Vite production rollup bundler.

### Verification Output:
```
✓ built in 1.08s
```

---

## 7. Clean-Clone Reproducibility Protocol

To prove reproducibility in an isolated environment:

```bash
# 1. Clone into temporary sandbox
git clone https://github.com/jeedijoshua-art/dsamp.git /tmp/fraudgraph-verify
cd /tmp/fraudgraph-verify

# 2. Run automated test suite
make -C engine test

# 3. Test backend integration
cd backend && npm install --silent
node src/server.js &
BACKEND_PID=$!
sleep 2

# 4. Run automated test suites
cd ..
node test_e2e.js
node test_all_datasets.js
node test_custom_lab.js

# 5. Build frontend
cd frontend && npm install --silent && npm run build

# 6. Cleanup
kill $BACKEND_PID
```
All commands execute without relying on hardcoded machine-specific paths or local uncommitted configuration.
