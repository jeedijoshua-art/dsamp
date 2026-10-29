# FraudGraph — Full Product User Guide & Faculty Defence Manual

> **Academic Context:** Data Structures and Algorithms (DSA) Micro-Project  
> **Target Audience:** Presenting Student (Comprehensive Guide to Operate, Explain, and Defend FraudGraph)  
> **Source Repository:** [https://github.com/jeedijoshua-art/dsamp](https://github.com/jeedijoshua-art/dsamp)  
> **Engine:** Native C++17 Core Engine with Express.js API Bridge & React 18/TypeScript Dashboard  

---

## Table of Contents
1. [FraudGraph in Plain English](#1-fraudgraph-in-plain-english)
2. [How to Start the Application](#2-how-to-start-the-application)
3. [Complete UI Tour & Control Inventory](#3-complete-ui-tour--control-inventory)
4. [Every Dataset Explained (Benchmark Dossier)](#4-every-dataset-explained-benchmark-dossier)
5. [Every Algorithm Explained Through the Product](#5-every-algorithm-explained-through-the-product)
6. [Custom Investigation Lab Tutorial](#6-custom-investigation-lab-tutorial)
7. [Understanding Every Metric and Rule Finding](#7-understanding-every-metric-and-rule-finding)
8. [Troubleshooting Guide](#8-troubleshooting-guide)
9. [Known Limitations](#9-known-limitations)
10. [Judge-Ready 3–5 Minute Demonstration Flow](#10-judge-ready-35-minute-demonstration-flow)
11. [Technical Reference](#11-technical-reference)

---

## 1. FraudGraph in Plain English

### What Problem Does FraudGraph Solve?
In modern electronic banking, financial fraud, layering schemes, and money laundering rarely occur through single, isolated transfers. Instead, illicit actors deliberately fragment funds across networks of intermediary "mule" accounts, split payments across complex multi-hop routes, and route funds in circular patterns (round-tripping) to artificially inflate transaction volumes or obfuscate the money trail.

Traditional relational database queries (SQL `JOIN`s) scale poorly as route depth increases: querying an arbitrary $k$-hop path requires $k$ self-joins, causing exponential query latency ($O(N^k)$). **FraudGraph** models financial banking entities as a **Directed Graph $G = (V, E)$**, where:
- **Vertices $V$:** Bank accounts, corporations, payment gateways, or shell holding entities.
- **Directed Edges $E$:** Individual financial transfers, each carrying an immutable integer transaction volume (in paise), a timestamp, and a transaction ID.

By representing transfers as an in-memory **Adjacency List** in native C++17, FraudGraph evaluates reachability, optimal transfer paths, circular fund movements, and intermediary flow retention in **linear time $O(|V| + |E|)$**.

### What Does the Application Accept as Input?
1. **Accounts:** Unique alphanumeric Account ID (e.g., `ACC_ALICE`), account holder name, account type (Corporate, Intermediary, Shell, Settlement, Personal), and risk tier (`LOW`, `MEDIUM`, `HIGH`).
2. **Transactions:** Directed transfer with unique Transaction ID (e.g., `TX_CHAIN_01`), sender Account ID (`from_account`), receiver Account ID (`to_account`), integer monetary amount (specified in INR or integer paise), and optional transaction memo.
3. **Investigation Parameters:** Source and destination account IDs for path exploration, or a starting root account for BFS/DFS traversal.

### What Does FraudGraph Process?
The application executes five algorithmic passes via a compiled C++17 engine:
1. **Adjacency List Ingestion & Degree Computation:** Builds incoming and outgoing incidence lists and computes in-degrees ($\text{deg}^-$), out-degrees ($\text{deg}^+$), incoming volume ($\sum \text{in}$), and outgoing volume ($\sum \text{out}$).
2. **Breadth-First Search (BFS):** Level-by-level queue exploration calculating the unweighted hop distance from any origin.
3. **Depth-First Search (DFS):** Recursive tree traversal capturing exact discovery timestamps $d[u]$ and finish timestamps $f[u]$ satisfying the Parenthesis Theorem.
4. **Shortest Path Discovery:** BFS queue traversal with predecessor map backtracking ($\text{pred}[v] = \{u, \text{tx}\}$) to identify the minimum-hop transmission route between any two accounts.
5. **Three-State Directed Cycle Detection:** Formal DFS node coloring (`WHITE` = unvisited, `GRAY` = active on stack, `BLACK` = finished) that flags back-edges $(u, v)$ where $v$ is `GRAY`, reconstructing the closed circular loops and calculating total circular volume.
6. **Rule-Based Forensic Auditing:** Analyzes flow discrepancies across intermediary mule nodes, route-level retention between origin disbursement and final settlement, and recurring transfer pairs.

### What Does It Display?
- **Interactive Visual Canvas:** An animated React Flow canvas rendering custom account nodes (color-coded by risk tier, showing in/out degree badges) and directional animated arrows indicating transaction flow.
- **KPI Summary Cards:** Six live metrics displaying Total Vertices $|V|$, Directed Edges $|E|$, Net Network Volume (in INR), Intermediary Node Count, Detected Cycles, and Forensic Findings.
- **Step-by-Step Traversal Inspector:** An interactive playback bar with Step Forward, Step Backward, and Play/Pause controls that highlights the algorithm's active queue pop, visited frontier, and discovered tree edges.
- **Explainable Findings Drawer:** Collapsible forensic dossier listing audit exceptions, exact retained rupee amounts, percentage discrepancies, and documented non-fraud explanations.
- **Transaction Ledger:** Searchable and filterable data table of all transactions.

### What Conclusions Can and Cannot Be Drawn?
- **WHAT YOU CAN CONCLUDE:**
  - The exact minimum number of intermediary accounts required to transfer funds between Account A and Account B.
  - Whether a closed directed cycle of funds exists in the network and the exact accounts participating in the loop.
  - Whether an intermediary account retained a portion of funds (inflow > outflow) or forwarded more than it received.
  - Whether an account is completely isolated (disconnected) from the rest of the financial system.
- **WHAT YOU CANNOT CONCLUDE (CRITICAL FACULTY DEFENCE POINT):**
  - **A graph cycle or retained amount DOES NOT prove criminal fraud.** Legitimate commercial activities produce identical graph topologies:
    - *Cycles* occur in corporate affiliate netting, multilateral trade settlement, and refund chargebacks.
    - *Retained funds* occur due to legitimate processing fees, statutory taxes, escrow holdbacks, or pre-existing ledger balances.
  - FraudGraph is an **investigative decision-support system** that surfaces anomalous topologies for human forensic review; it does not issue automated legal or judicial judgments.

---

## 2. How to Start the Application

### Prerequisites
- **Operating System:** macOS, Linux, or Windows (WSL / Git Bash / PowerShell).
- **C++ Compiler:** `clang++` or `g++` supporting standard C++17 (checked via `g++ --version` or `clang++ --version`).
- **Make:** GNU Make (checked via `make --version`).
- **Node.js & npm:** Node.js v18+ and npm v9+ (checked via `node -v` and `npm -v`).

### Step-by-Step Launch Instructions

#### Step 1: Open Terminal in Project Directory
```bash
cd "/Users/jeedijoshua/Documents/2nd Year/ODD SEM/DSA/MP"
```

#### Step 2: Build and Test the C++17 Engine
```bash
make -C engine clean
make -C engine all
make -C engine test
```
*Expected Output:*
```
Summary: 92/92 assertions passed.
ALL TESTS PASSED SUCCESSFULLY!
```

#### Step 3: Install Node Dependencies (if fresh clone)
```bash
cd backend && npm install
cd ../frontend && npm install
cd ..
```

#### Step 4: Start the Full-Stack Services
You can run the provided startup script:
```bash
./run.sh
```
Or start the backend and frontend in two separate terminals:
- **Terminal 1 (Backend API on Port 5001):**
  ```bash
  cd backend && node src/server.js
  ```
- **Terminal 2 (Frontend Web Server on Port 5173):**
  ```bash
  cd frontend && npm run dev -- --host 0.0.0.0 --port 5173
  ```

#### Step 5: Verify Application Health
1. Open your browser to `http://localhost:5173`.
2. Inspect the top-right header: verify the green indicator reading **"Engine Online"** and **"C++17 Core v1.0.0"**.
3. Confirm backend API health directly: `http://localhost:5001/api/health` should return:
   ```json
   {"status":"ok","service":"FraudGraph API Bridge","engine_binary_present":true}
   ```

#### Step 6: How to Stop Safely
Press `Ctrl + C` in the running terminal. If running background processes exist, clean ports with:
```bash
lsof -ti :5001 | xargs kill -9 2>/dev/null || true
lsof -ti :5173 | xargs kill -9 2>/dev/null || true
```

---

## 3. Complete UI Tour & Control Inventory

```
+---------------------------------------------------------------------------------------------------+
|  [FraudGraph DSA Playground]   [Dataset Playground | Custom Lab]   [Academic Concepts] [Reset]    |
+---------------------------------------------------------------------------------------------------+
|  [Basic Traversal] [Circular Transactions] [Shortest Route] [Fraud Investigation] [Disconnected]  |
+---------------------------------------------------------------------------------------------------+
|  Vertices |V|: 7   Edges |E|: 6   Volume: ₹27,000   Intermediaries: 2   Cycles: 0   Findings: 2   |
+-------------------------------------------------------------------+-------------------------------+
|                                                                   |  [Algorithm Controls]         |
|                                                                   |  [Path] [Cycle] [BFS] [DFS]   |
|                                                                   |  Source: [ACC_BRANCH_HUB   v] |
|                       REACT FLOW CANVAS                           |  Target: [ACC_BRANCH_D2    v] |
|             (Interactive Graph Visualization)                     |  [ Find Shortest Route ]      |
|                                                                   |                               |
|                                                                   |  [Account Inspector Panel]    |
|                                                                   |  Node: ACC_BRANCH_HUB         |
|                                                                   |  In: 0 | Out: 2 | Vol: ₹9,000 |
+-------------------------------------------------------------------+-------------------------------+
|  [v] Forensic Findings (2)       [v] Transaction Ledger (6)       [v] DSA Theory Reference        |
+---------------------------------------------------------------------------------------------------+
```

### 1. Header Navigation Bar (`Navbar.tsx`)
- **Brand Logo & Title:** Displays "FraudGraph — DSA Playground" and "Interactive Financial Transaction Graph Algorithms".
- **Mode Switcher:** 
  - **Dataset Playground:** Explores five prebuilt academic demonstration scenarios.
  - **Custom Investigation Lab:** An isolated blank sandbox where you can construct arbitrary graphs from scratch without contaminating benchmark presets.
- **Engine Status Badge:** Green dot indicating native C++ binary communication.
- **Academic Concepts Button:** Opens a modal containing formal graph theory, queue/stack invariants, and asymptotic complexity proofs for faculty examination.
- **Reset Benchmark Button:** Instantly restores the active dataset back to its pristine deterministic benchmark state.

### 2. Dataset Selector Ribbon (`DatasetSelector.tsx`)
A 5-card ribbon at the top of the playground. Each card shows:
- Scenario title and subtitle.
- Color badge indicating algorithmic category.
- Vertex count $|V|$ and edge count $|E|$.
- Recommended primary algorithm for that scenario.

### 3. Metric KPI Cards (`KPICards.tsx`)
Six live cards calculated from the C++ engine snapshot:
1. **Graph Vertices $|V|$:** Total unique accounts loaded.
2. **Directed Edges $|E|$:** Total active directed transfers.
3. **Network Volume:** Cumulative sum of all transfers formatted as INR (calculated from integer paise).
4. **Intermediary Nodes:** Number of accounts acting as pass-through entities with $\text{deg}^- \ge 1$ and $\text{deg}^+ \ge 1$. Clicking this highlights all intermediary accounts.
5. **Directed Cycles:** Number of closed loops detected via Three-State DFS. Clicking this automatically triggers cycle path highlighting on the canvas.
6. **Rule Findings:** Number of forensic audit discrepancies flagged by the rule engine.

### 4. Interactive Graph Canvas (`GraphCanvas.tsx`)
- **Custom Account Nodes (`AccountNode.tsx`):**
  - Displays Account ID, holder name, account type, and risk badge (`LOW` in emerald, `MEDIUM` in amber, `HIGH` in rose).
  - Degree indicators: Incoming badge (arrow pointing down-left) and Outgoing badge (arrow pointing up-right).
- **Directed Edges:** Curved bezier arrows showing the flow direction from payer to payee, with transaction amount labels.
- **Interactive Highlighting:**
  - *Shortest Path:* Highlights traversed route in glowing cyan, animating edge flow.
  - *Cycle Highlight:* Highlights closed circular loops in glowing rose/crimson.
  - *Step-by-Step Trace:* Highlights the currently popped queue/stack node in gold/amber.
- **Canvas Controls:** Floating zoom-in, zoom-out, fit-to-screen (`Maximize2`), and reset view buttons.

### 5. Algorithm Controls Panel (`AlgorithmControls.tsx`)
Four dedicated tabs for interactive experimentation:
- **Tab 1: Shortest Route (BFS):**
  - Source dropdown & Destination dropdown.
  - Button: "Find Shortest Route".
  - Displays: Hop count, full node sequence, ordered transaction IDs, cumulative path volume, and asymptotic complexity.
- **Tab 2: Cycle Detection (Three-State DFS):**
  - Button: "Run 3-State Cycle Detection".
  - Displays: Number of detected cycles, cycle paths (e.g., $P \rightarrow Q \rightarrow R \rightarrow P$), total circular volume, and distinction between multi-node cycles and self-loops.
- **Tab 3: BFS Level Traversal:**
  - Start node dropdown.
  - Button: "Execute BFS Traversal".
  - Step-by-Step Playback Controller: Play/Pause button, Step Forward (`ChevronRight`), Step Backward (`ChevronLeft`), and progress scrubber showing the exact FIFO queue pop order.
- **Tab 4: DFS Deep Traversal:**
  - Start node dropdown.
  - Button: "Execute DFS Traversal".
  - Displays: Discovery timestamp $d[u]$ and finish timestamp $f[u]$ for every vertex, demonstrating the Parenthesis Theorem.

### 6. Account Inspector (`AccountInspector.tsx`)
Appears on the right side when any node on the graph is clicked:
- Account ID, holder name, risk tier, and created date.
- In-degree, out-degree, total incoming volume, and total outgoing volume.
- Quick action buttons: "Set as BFS/Path Source", "Set as Path Destination".
- Incident transaction list: Separate tabs for Incoming Transfers and Outgoing Transfers.
- In Custom Lab mode: Includes a "Delete Account" button with cascading edge cleanup.

### 7. Collapsible Bottom Drawers
- **Forensic Findings Panel (`InvestigationPanel.tsx`):** Displays explainable rule findings, severity badges, retained fund discrepancies, and documented non-fraud explanations. Includes filter by severity (`ALL`, `HIGH`, `WARNING`, `INFO`).
- **Transaction Ledger (`TransactionTable.tsx`):** Tabular view of all transactions with search, sorting, and in Custom Lab mode, individual transaction deletion.

---

## 4. Every Dataset Explained (Benchmark Dossier)

| Dataset Title | Category | Vertices $|V|$ | Edges $|E|$ | Total Volume | Recommended Algorithm | Key Learning Objective |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **Basic Traversal** | Hierarchical Tree | 7 | 6 | ₹27,000 | BFS & DFS Traversal | FIFO Queue Level Expansion vs. LIFO Recursive Branch Exploration |
| **Circular Transactions** | Cycle Detection | 5 | 5 | ₹77,500 | 3-State Cycle Detection | Back-edge identification ($u \rightarrow v$ where $v$ is `GRAY`), loop reconstruction, self-loops |
| **Shortest Route** | Multi-Path Topology | 6 | 7 | ₹2,28,000 | BFS Shortest Path | Minimum-hop discovery across 1-hop, 2-hop, and 3-hop alternate routes |
| **Fraud Investigation** | Academic Benchmark | 14 | 14 | ₹2,29,500 | Forensic Investigation | Layering chain, mule retention, round-tripping, repeated invoices, and self-loops |
| **Disconnected Graph** | Connectivity | 6 | 4 | ₹1,22,000 | Shortest Path & BFS | Partitioned subnetworks, isolated accounts, graceful unreachability handling |

---

### Dataset 1: Basic Traversal
- **Scenario:** A clean 3-level hierarchical banking clearing tree.
  - Root: Central Clearing Node (`ACC_BRANCH_HUB`).
  - Level 1: Settlement Branch Alpha (`ACC_BRANCH_B1`) and Branch Beta (`ACC_BRANCH_B2`).
  - Level 2: Four sub-agencies (`ACC_BRANCH_C1`, `C2`, `D1`, `D2`).
- **Accounts (7):** `ACC_BRANCH_HUB`, `ACC_BRANCH_B1`, `ACC_BRANCH_B2`, `ACC_BRANCH_C1`, `ACC_BRANCH_C2`, `ACC_BRANCH_D1`, `ACC_BRANCH_D2`.
- **Transactions (6):** `TX_BR_01` through `TX_BR_06` (₹4,500 each).
- **Why It Exists:** To provide an unambiguous, clean baseline contrasting BFS level-by-level exploration against DFS branch-deep traversal.
- **Recommended Action:**
  1. Go to BFS tab, select `ACC_BRANCH_HUB`, click "Execute BFS Traversal".
  2. Use the Step-by-Step Playback slider to watch the FIFO queue pop nodes level-by-level.
  3. Switch to DFS tab, click "Execute DFS Traversal", and compare the discovery order and finish timestamps.
- **Expected Outcome:**
  - *BFS Order:* `HUB` (dist 0) $\rightarrow$ `B1`, `B2` (dist 1) $\rightarrow$ `C1`, `C2`, `D1`, `D2` (dist 2).
  - *DFS Order:* `HUB` $\rightarrow$ `B1` $\rightarrow$ `C1` $\rightarrow$ backtrack to `B1` $\rightarrow$ `C2` $\rightarrow$ backtrack to `HUB` $\rightarrow$ `B2` $\rightarrow$ `D1` $\rightarrow$ backtrack to `B2` $\rightarrow$ `D2`.
- **Teacher Explanation:** *"Here we prove the FIFO queue invariant of BFS: every vertex at distance 1 is dequeued and explored before any vertex at distance 2. In contrast, DFS immediately plunges to leaf C1 before ever exploring sibling B2."*

---

### Dataset 2: Circular Transactions
- **Scenario:** Round-tripping loop between three commercial entities plus an isolated self-loop sub-ledger pool.
- **Accounts (5):** `ACC_P_CORP`, `ACC_Q_HOLDING`, `ACC_R_VENTURE`, `ACC_INTERNAL_POOL`, `ACC_AUDIT_OBSERVER`.
- **Transactions (5):**
  - Loop: `ACC_P_CORP` $\rightarrow$ `ACC_Q_HOLDING` (₹25,000) $\rightarrow$ `ACC_R_VENTURE` (₹25,000) $\rightarrow$ `ACC_P_CORP` (₹25,000). Total loop volume: ₹75,000.
  - Self-loop: `ACC_INTERNAL_POOL` $\rightarrow$ `ACC_INTERNAL_POOL` (₹2,500).
  - Outflow: `ACC_P_CORP` $\rightarrow$ `ACC_AUDIT_OBSERVER` (₹5,000).
- **Why It Exists:** Demonstrates that standard boolean visited flags are insufficient for directed graphs and proves how Three-State DFS detects back-edges without false positives from tree edges or cross-edges.
- **Recommended Action:** Click "Run 3-State Cycle Detection".
- **Expected Outcome:** 
  - Cycle 1 (Self-loop): `ACC_INTERNAL_POOL` $\rightarrow$ `ACC_INTERNAL_POOL` (Volume: ₹2,500).
  - Cycle 2 (Multi-node loop): `ACC_P_CORP` $\rightarrow$ `ACC_Q_HOLDING` $\rightarrow$ `ACC_R_VENTURE` $\rightarrow$ `ACC_P_CORP` (Volume: ₹75,000).
- **Teacher Explanation:** *"This dataset proves our cycle detection implementation. When DFS is at R_VENTURE, its outgoing edge points back to P_CORP. Because P_CORP is currently marked GRAY (active on the recursion call stack), this edge is classified as a BACK-EDGE, proving a directed cycle."*

---

### Dataset 3: Shortest Route
- **Scenario:** Multi-path settlement network connecting originator Alice (`ACC_ALICE`) to Delta Offshore (`ACC_TARGET_D`) via three competing routes of varying lengths:
  - Fast 2-hop route via Express Gateway (`ACC_EXPRESS_GATEWAY`): ₹50,000 $\rightarrow$ ₹49,000.
  - Standard 2-hop route via Mule X (`ACC_MULE_X`): ₹50,000 $\rightarrow$ ₹42,000.
  - Extended 3-hop detour via Secondary Route (`ACC_SECONDARY_ROUTE`): Alice $\rightarrow$ Secondary $\rightarrow$ Mule X $\rightarrow$ Target D.
  - Further transfer: Target D $\rightarrow$ Escrow Vault (`ACC_ESCROW_VAULT`): ₹30,000.
- **Accounts (6):** `ACC_ALICE`, `ACC_EXPRESS_GATEWAY`, `ACC_MULE_X`, `ACC_SECONDARY_ROUTE`, `ACC_TARGET_D`, `ACC_ESCROW_VAULT`.
- **Transactions (7):** `TX_ALT_01`, `TX_ALT_02`, `TX_CHAIN_01`, `TX_CHAIN_02`, `TX_DETOUR_01`, `TX_DETOUR_02`, `TX_VAULT_01`.
- **Why It Exists:** To demonstrate that BFS guarantees finding the unweighted shortest path by edge count (minimum hops) regardless of alternate longer routes.
- **Recommended Action:** Run Shortest Route from `ACC_ALICE` to `ACC_TARGET_D`. Then run from `ACC_ALICE` to `ACC_ESCROW_VAULT`.
- **Expected Outcome:**
  - Alice to Target D: Exactly 2 hops (`ACC_ALICE` $\rightarrow$ `ACC_EXPRESS_GATEWAY` $\rightarrow$ `ACC_TARGET_D` or via `ACC_MULE_X`).
  - Alice to Escrow Vault: Exactly 3 hops.
- **Teacher Explanation:** *"BFS explores radially: all 1-hop neighbors are visited first, then all 2-hop neighbors. Target D is discovered during the level-2 exploration. Backtracking through the predecessor map `pred[Target D]` yields the exact minimum-hop path."*

---

### Dataset 4: Fraud Investigation (Full Academic Benchmark)
- **Scenario:** The comprehensive multi-pattern forensic benchmark graph containing:
  1. Classic Layering Chain: `ACC_ALICE` $\rightarrow$ `ACC_MULE_X` (₹50,000) $\rightarrow$ `ACC_TARGET_D` (₹42,000). The intermediary Mule retains ₹8,000 (16%).
  2. Circular Round-Tripping: Prime $\rightarrow$ Quantum $\rightarrow$ Radiant $\rightarrow$ Prime (₹75,000 volume).
  3. Branching Clearing Network: Central Hub $\rightarrow$ Branches $\rightarrow$ Sub-agencies.
  4. Repeated Vendor Invoices: Two separate ₹15,000 payments between Steel Supply (`ACC_SUPPLIER_S`) and Apex Manufacturing (`ACC_VENDOR_V`).
  5. Internal Pool Self-Loop: ₹2,500 ledger balancing transfer.
  6. Disconnected Account: Isolated Cold Vault (`ACC_ISOLATED`).
- **Accounts (14):** Complete 14-account academic testbed.
- **Transactions (14):** Complete 14-transaction testbed.
- **Why It Exists:** Combines all graph algorithms and forensic rules into a single realistic institutional banking network.
- **Recommended Action:** Click "Run Forensic Investigation" and open the "Forensic Findings" drawer.
- **Expected Outcome:** 11 total findings generated, including:
  - `RULE_INTERMEDIARY_MULE` on Xavier Transit Agency (`ACC_MULE_X`): Inflow ₹50,000, Outflow ₹42,000, Retained ₹8,000 (16%).
  - `RULE_ROUTE_DISCREPANCY` along Alice $\rightarrow$ Target D: First hop ₹50,000 vs. Last hop ₹42,000.
  - `RULE_CIRCULAR_ROUTING`: 3-node loop detected ($P \rightarrow Q \rightarrow R \rightarrow P$).
  - `RULE_SELF_LOOP`: Internal Pool balancing transfer.
  - `RULE_REPEATED_TRANSFERS`: Supplier S $\rightarrow$ Vendor V (2 transactions, ₹30,000 total).

---

### Dataset 5: Disconnected Graph
- **Scenario:** A partitioned financial network featuring three disjoint subgraphs:
  - Subgraph 1: Active payment chain (`ACC_ALICE` $\rightarrow$ `ACC_MULE_X` $\rightarrow$ `ACC_TARGET_D`).
  - Subgraph 2: Vendor payment pair (`ACC_SUPPLIER_S` $\rightarrow$ `ACC_VENDOR_V`).
  - Subgraph 3: Completely isolated account (`ACC_ISOLATED`) with 0 incoming and 0 outgoing edges.
- **Accounts (6):** `ACC_ALICE`, `ACC_MULE_X`, `ACC_TARGET_D`, `ACC_SUPPLIER_S`, `ACC_VENDOR_V`, `ACC_ISOLATED`.
- **Transactions (4):** `TX_CHAIN_01`, `TX_CHAIN_02`, `TX_REP_01`, `TX_REP_02`.
- **Why It Exists:** To test edge cases: unreachable destinations, disconnected components, and verifying that BFS/DFS terminate gracefully without infinite loops or crashes.
- **Recommended Action:**
  1. Set Source to `ACC_ALICE` and Destination to `ACC_ISOLATED`. Click "Find Shortest Route".
  2. Select `ACC_ISOLATED` and execute BFS.
- **Expected Outcome:**
  - Route Alice $\rightarrow$ Isolated: Returns `path_exists: false`, hop count 0, with message: *"No directed transmission path exists from 'ACC_ALICE' to 'ACC_ISOLATED'."*
  - BFS on Isolated: Succeeds and visits only `ACC_ISOLATED` itself (1 step, distance 0).

---

## 5. Every Algorithm Explained Through the Product

### Algorithm 1: Breadth-First Search (BFS)
- **Concept:** Traverses the directed graph radially level-by-level using a First-In-First-Out (FIFO) queue.
- **Invariants:** 
  1. A node $v$ is enqueued at most once.
  2. Nodes at distance $d$ are dequeued before any node at distance $d + 1$.
- **Source Code:** [`engine/src/algorithms.cpp:18-91`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/algorithms.cpp#L18-L91)
- **UI Execution:**
  1. Select dataset "Basic Traversal".
  2. In Algorithm Controls, click the **BFS** tab.
  3. Select Root Node `ACC_BRANCH_HUB`. Click "Execute BFS Traversal".
  4. Use the playback scrubber to step through the traversal.
- **Real Trace:**
  - *Step 1:* Dequeue `ACC_BRANCH_HUB` (distance 0). Enqueue neighbors `ACC_BRANCH_B1`, `ACC_BRANCH_B2` (distance 1).
  - *Step 2:* Dequeue `ACC_BRANCH_B1` (distance 1). Enqueue neighbors `ACC_BRANCH_C1`, `ACC_BRANCH_C2` (distance 2).
  - *Step 3:* Dequeue `ACC_BRANCH_B2` (distance 1). Enqueue neighbors `ACC_BRANCH_D1`, `ACC_BRANCH_D2` (distance 2).
  - *Steps 4–7:* Dequeue `C1`, `C2`, `D1`, `D2`. They have no outgoing edges; queue empties.
- **Time Complexity:** $O(|V| + |E|)$. Each vertex is enqueued once; each outgoing edge is examined once.
- **Space Complexity:** $O(|V|)$ for the queue, visited map, and distance map.

---

### Algorithm 2: Depth-First Search (DFS) & Parenthesis Theorem
- **Concept:** Traverses deeply down each directed branch using recursion before backtracking. Captures discovery timestamps $d[u]$ and finish timestamps $f[u]$.
- **Invariants:** **Parenthesis Theorem** (CLRS Theorem 22.7): For any two vertices $u$ and $v$, the intervals $[d[u], f[u]]$ and $[d[v], f[v]]$ are either entirely disjoint or one is completely nested within the other.
- **Source Code:** [`engine/src/algorithms.cpp:95-164`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/algorithms.cpp#L95-L164)
- **UI Execution:**
  1. In Algorithm Controls, click the **DFS** tab.
  2. Select Start Node `ACC_BRANCH_HUB`. Click "Execute DFS Traversal".
  3. Review the Discovery and Finish table on screen.
- **Real Trace (Basic Traversal):**
  - Enter `HUB` ($d=1$).
  - Enter `B1` ($d=2$).
  - Enter `C1` ($d=3$). Leaf node: finish `C1` ($f=4$).
  - Enter `C2` ($d=5$). Leaf node: finish `C2` ($f=6$).
  - Finish `B1` ($f=7$). Note that $[2, 7]$ completely encloses $[3, 4]$ and $[5, 6]$.
  - Enter `B2` ($d=8$).
  - Enter `D1` ($d=9$), finish `D1` ($f=10$).
  - Enter `D2` ($d=11$), finish `D2` ($f=12$).
  - Finish `B2` ($f=13$).
  - Finish `HUB` ($f=14$). Interval $[1, 14]$ encloses all others.
- **Time & Space Complexity:** $O(|V| + |E|)$ time, $O(|V|)$ space for recursion call stack.

---

### Algorithm 3: Directed Cycle Detection via Three-State DFS
- **Concept:** Standard boolean visited sets fail on directed graphs because reaching an already-visited node via a cross-edge does *not* prove a cycle. FraudGraph implements the formal 3-color scheme:
  - `WHITE (0)`: Node unvisited.
  - `GRAY (1)`: Node currently active on the recursion stack (ancestor).
  - `BLACK (2)`: Node and all its descendants are fully explored.
- **Cycle Theorem:** A directed graph contains a cycle if and only if DFS encounters a **BACK-EDGE**: an edge $(u, v)$ where destination $v$ is currently `GRAY`.
- **Source Code:** [`engine/src/algorithms.cpp:168-274`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/algorithms.cpp#L168-L274)
- **UI Execution:**
  1. Select dataset "Circular Transactions".
  2. Click the **Cycle** tab in Algorithm Controls. Click "Run 3-State Cycle Detection".
  3. Click the detected cycle card to trigger crimson path highlighting on the canvas.
- **Real Trace (P $\rightarrow$ Q $\rightarrow$ R $\rightarrow$ P):**
  - Visit $P$: mark `GRAY`, push to `path_stack`.
  - Follow edge $P \rightarrow Q$: visit $Q$, mark `GRAY`, push to `path_stack`.
  - Follow edge $Q \rightarrow R$: visit $R$, mark `GRAY`, push to `path_stack`.
  - From $R$, outgoing edge points to $P$. Inspect color of $P$: it is `GRAY`!
  - **Back-edge confirmed!** Trace `path_stack` from $P$ to $R$, append $P$ to close the loop: $[P, Q, R, P]$. Sum edge amounts along the loop: ₹25,000 + ₹25,000 + ₹25,000 = ₹75,000.
  - Backtrack: mark $R$ `BLACK`, mark $Q$ `BLACK`, mark $P$ `BLACK`.
- **Time & Space Complexity:** $O(|V| + |E|)$ time, $O(|V|)$ space.

---

### Algorithm 4: Shortest Path via BFS with Predecessor Backtracking
- **Concept:** Finds the route with the minimum number of directed edge transfers between any origin and destination in an unweighted graph.
- **Source Code:** [`engine/src/algorithms.cpp:277-375`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/algorithms.cpp#L277-L375)
- **Predecessor Map:** During BFS, whenever node $v$ is discovered from $u$ via transaction $tx$, the engine records:
  $$\text{pred}[v] = \{u, tx\}$$
  When destination $D$ is dequeued, the engine halts forward search and backtracks from $D$ to source $S$ by repeatedly looking up $\text{pred}[\text{curr}]$, reversing the accumulated list in $O(P)$ time.
- **Edge Cases Tested & Verified:**
  - *Identity Path ($S = D$):* Returns `hop_count = 0`, node path $[S]$, zero volume.
  - *Unreachable Destination:* Queue empties without reaching $D$; returns `path_exists: false` with informative error.
  - *Multiple Routes of Different Lengths:* In "Shortest Route", selects the 2-hop route over the 3-hop detour.
- **Time & Space Complexity:** $O(|V| + |E|)$ time, $O(|V|)$ space.

---

### Algorithm 5: Rule-Based Forensic Auditing
- **Concept:** Business logic operating on top of graph topological metrics to identify structural and financial anomalies.
- **Source Code:** [`engine/src/rules.cpp:21-232`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/rules.cpp#L21-L232)
- **Four Core Rules:**
  1. `RULE_INTERMEDIARY_MULE`: Evaluated on all accounts with $\text{deg}^- \ge 1$ and $\text{deg}^+ \ge 1$. Computes net retention: $\Delta = \sum \text{in} - \sum \text{out}$. Flags percentage retained.
  2. `RULE_ROUTE_DISCREPANCY`: Evaluated on investigated routes with $\ge 2$ hops. Compares origin disbursement amount vs. terminal receipt amount.
  3. `RULE_CIRCULAR_ROUTING`: Converts cycles detected by Three-State DFS into actionable audit findings.
  4. `RULE_REPEATED_TRANSFERS`: Flags account pairs $(u, v)$ with multiple distinct transactions.

---

## 6. Custom Investigation Lab Tutorial

The **Custom Investigation Lab** is a clean sandbox where you can build arbitrary financial transaction topologies and test algorithms live during a faculty demonstration.

### Click-by-Click Instructions to Build and Test a Cycle

#### Step 1: Switch to Custom Investigation Lab
- In the top navbar, click the **"Custom Investigation Lab"** tab.
- Verify the initial state: 0 accounts, 0 transactions, ₹0 volume, 0 cycles.

#### Step 2: Add Account A
1. Click the **"Add Account"** button in the navbar or sidebar.
2. Enter:
   - Account ID: `ACC_ALPHA`
   - Account Name: `Alpha Holdings Ltd`
   - Account Type: `Corporate`
   - Risk Tier: `LOW`
3. Click **"Register Account"**.
4. Observe: Node `ACC_ALPHA` appears on canvas; Vertices KPI updates to 1.

#### Step 3: Add Account B and Account C
1. Add `ACC_BETA`: Name `Beta Logistics`, Type `Intermediary`, Risk `MEDIUM`.
2. Add `ACC_GAMMA`: Name `Gamma Offshore`, Type `Settlement`, Risk `HIGH`.
3. Observe: Vertices KPI updates to 3.

#### Step 4: Create Directed Transactions (Cycle: Alpha $\rightarrow$ Beta $\rightarrow$ Gamma $\rightarrow$ Alpha)
1. Click **"Add Transaction"**:
   - Transaction ID: `TX_AB`
   - Source Account: `ACC_ALPHA`
   - Destination Account: `ACC_BETA`
   - Amount (INR): `10000`
   - Memo: `Invoice Batch 1`
   - Click **"Record Transaction"**.
2. Click **"Add Transaction"**:
   - Transaction ID: `TX_BC`
   - Source: `ACC_BETA`, Destination: `ACC_GAMMA`, Amount: `8500`.
3. Click **"Add Transaction"**:
   - Transaction ID: `TX_CA`
   - Source: `ACC_GAMMA`, Destination: `ACC_ALPHA`, Amount: `8500`.
4. Observe: Directed Edges KPI updates to 3. Directed arrows connect the three nodes on canvas.

#### Step 5: Execute Cycle Detection on Custom Graph
1. In Algorithm Controls, switch to the **Cycle** tab. Click **"Run 3-State Cycle Detection"**.
2. Result: Cycle detected!
   - Path: `ACC_ALPHA` $\rightarrow$ `ACC_BETA` $\rightarrow$ `ACC_GAMMA` $\rightarrow$ `ACC_ALPHA`.
   - Cycle Volume: ₹27,000 (sum of ₹10,000 + ₹8,500 + ₹8,500).
3. Click the cycle card: observe crimson edge highlighting on canvas.

#### Step 6: Test Shortest Path
1. Switch to the **Path** tab.
2. Set Source: `ACC_ALPHA`, Destination: `ACC_GAMMA`. Click **"Find Shortest Route"**.
3. Result: Exactly 2 hops (`ACC_ALPHA` $\rightarrow$ `ACC_BETA` $\rightarrow$ `ACC_GAMMA`). Cyan path highlight.

#### Step 7: Delete Account Beta and Verify Cascading Cleanup
1. Click node `ACC_BETA` on canvas. The Account Inspector opens on the right.
2. Click **"Delete Account"** and confirm.
3. Observe:
   - `ACC_BETA` is removed.
   - Both incident edges (`TX_AB` and `TX_BC`) are automatically purged!
   - Only `ACC_ALPHA`, `ACC_GAMMA`, and independent transaction `TX_CA` remain.
   - Vertices = 2, Edges = 1.
   - Cycle is broken: re-running cycle detection reports `has_cycle: false`.

#### Step 8: Reset to Blank Canvas
1. Click **"Reset Graph"** in the navbar.
2. Confirm the reset. The canvas cleanly clears back to 0 accounts and 0 edges.
3. Switch back to **Dataset Playground**: verify benchmark datasets are completely uncorrupted.

---

## 7. Understanding Every Metric and Rule Finding

### Summary Metrics Explained
1. **Vertices $|V|$:** Count of unique nodes in `accounts_` map.
2. **Directed Edges $|E|$:** Count of unique directed transfers in `transactions_by_id_` map.
3. **Network Volume:** Cumulative sum:
   $$\text{Total Volume} = \sum_{tx \in E} tx.\text{amount\_paise}$$
   Displayed in INR by dividing by 100.
4. **Intermediary Node Count:** Accounts where $\text{deg}^-(u) \ge 1$ and $\text{deg}^+(u) \ge 1$.
5. **Cycle Count:** Number of distinct simple directed cycles discovered during the 3-state DFS pass.
6. **In-Degree & Out-Degree:**
   - $\text{deg}^-(u) = |\text{rev\_adj\_}[u]|$ (number of incoming transfers).
   - $\text{deg}^+(u) = |\text{adj\_}[u]|$ (number of outgoing transfers).

### Rule Findings Explained
| Rule ID | Trigger Condition | Severity | Example from Benchmark | Neutral Non-Fraud Explanation |
| :--- | :--- | :---: | :--- | :--- |
| `RULE_INTERMEDIARY_MULE` | $\text{deg}^- \ge 1$ and $\text{deg}^+ \ge 1$ | WARNING / INFO | Xavier Transit (`ACC_MULE_X`): Inflow ₹50,000, Outflow ₹42,000, Retained ₹8,000 (16%). | Retained funds represent standard intermediary processing commissions, escrow withholdings, or statutory tax deductions. |
| `RULE_ROUTE_DISCREPANCY` | Investigated route $\ge 2$ hops with amount difference | HIGH / INFO | Route Alice $\rightarrow$ Target D: First hop ₹50,000, Last hop ₹42,000, Difference ₹8,000. | Discrepancy along a multi-hop transmission chain may reflect foreign exchange margins or multi-party service fees. |
| `RULE_CIRCULAR_ROUTING` | Multi-node directed cycle $(u \rightarrow \dots \rightarrow u)$ | HIGH | Prime $\rightarrow$ Quantum $\rightarrow$ Radiant $\rightarrow$ Prime (₹75,000 volume). | Legitimate circular routing occurs in multilateral affiliate netting, inter-company treasury rebalancing, or invoice refund adjustments. |
| `RULE_SELF_LOOP` | Transfer from account to itself $(u \rightarrow u)$ | WARNING | Internal Pool (`ACC_INTERNAL_POOL`): ₹2,500 transfer. | Internal ledger balancing, automated wallet sweeps, or account verification micro-deposits. |
| `RULE_REPEATED_TRANSFERS` | $> 1$ transfers between same $(u, v)$ pair | INFO | Supplier S $\rightarrow$ Vendor V (2 transactions of ₹15,000 each). | Split payments under daily transaction limits, progressive milestone billing, or recurring supply invoices. |

---

## 8. Troubleshooting Guide

| Symptom / Error | Root Cause | Verified Safe Fix |
| :--- | :--- | :--- |
| **"Engine Offline" / Red dot in header** | Backend cannot locate C++ binary at `engine/bin/fraudgraph_engine`. | Run `make -C engine clean && make -C engine all` to compile the binary, then restart backend with `npm start`. |
| **Port 5001 or 5173 Already in Use (`EADDRINUSE`)** | Lingering Node.js or Vite process from a previous run. | Run `lsof -ti :5001 -i :5173 \| xargs kill -9 2>/dev/null \|\| true`. |
| **"Source account does not exist in graph"** | User typed or selected an Account ID not present in active dataset. | Select the source node from the dropdown or click a node on the canvas and click "Set as Source". |
| **"Transaction amount must be greater than zero"** | User submitted ₹0 or negative amount in Add Transaction form. | Enter an integer or positive decimal amount greater than 0. |
| **Shortest path returns "No directed transmission path exists"** | Target node belongs to a disconnected component or edges point in reverse. | Expected behavior. Financial networks are directed: funds cannot flow backwards against arrow directions. |
| **Graph appears clustered or overlapping after dragging nodes** | Manual node rearrangement. | Click the "Fit View" button (`Maximize2` icon) on the graph canvas or switch datasets and back to reset layout. |

---

## 9. Known Limitations

To defend this project with academic integrity, you must be completely truthful about what FraudGraph does and does not do:

1. **Unweighted Shortest Path:** The shortest path algorithm minimizes **edge count (number of hops)** using standard BFS. It does *not* compute minimum financial cost or maximum capacity (which would require Dijkstra's or Bellman-Ford algorithm).
2. **Simple Cycles vs. All Elementary Circuits:** The 3-state DFS cycle detection finds and reconstructs directed cycles during a single DFS forest pass. It does not implement Johnson's all-cycles algorithm, which would find every exponential combinatorial cycle on dense graphs ($O((|V| + |E|)(c + 1))$).
3. **In-Memory Volatility:** The active working dataset is stored in backend RAM (`currentDataset` in `routes.js`). Changes made in the Custom Lab persist during the session but are not saved to a persistent disk database (PostgreSQL/MongoDB).
4. **Synthetic Benchmark Data:** All 17 accounts and 16 transactions in the preset catalog are deterministic synthetic fixtures created for academic evaluation; they do not represent real individuals or live banking records.
5. **No Probabilistic ML:** FraudGraph uses deterministic graph theory and explainable business rules. It does not employ black-box machine learning (GNNs, Random Forests) because explainability is a core requirement for academic evaluation.

---

## 10. Judge-Ready 3–5 Minute Demonstration Flow

When the faculty examiner says: *"Show me your project and explain the data structures and algorithms,"* execute this exact 5-step script:

### Step 1: High-Level Problem & Architecture (30 Seconds)
- **What to Say:** *"Good morning, Professors. FraudGraph is a graph-based financial transaction investigation system. Financial crimes like layering and round-tripping are inherently graph problems. Traditional SQL queries require expensive joins to trace multi-hop paths. We implemented an in-memory directed graph using an Adjacency List in native C++17, achieving linear time $O(|V| + |E|)$ traversals, paired with an interactive React Flow dashboard."*
- **What to Point at:** Top navbar: Brand title and green "Engine Online (C++17 Core v1.0.0)" badge.

### Step 2: BFS Shortest Path Demonstration (45 Seconds)
- **What to Click:** Select **"Shortest Route"** dataset. In Algorithm Controls (Path tab), select Source `ACC_ALICE` and Destination `ACC_TARGET_D`. Click **"Find Shortest Route"**.
- **What to Say:** *"Here, Alice is attempting to route funds to Delta Offshore. The network contains multiple paths: a fast route, a mule route, and a 3-hop detour. We run Breadth-First Search. Because BFS explores radially level-by-level using a FIFO queue, it is mathematically guaranteed to find the minimum-hop route. The engine backtracks through the predecessor map `pred[Target D]` and reconstructs the 2-hop route in cyan."*
- **What to Point at:** Cyan glowing path on canvas; Hop count = 2; Time complexity = $O(|V| + |E|)$.

### Step 3: Directed Cycle Detection Demonstration (45 Seconds)
- **What to Click:** Select **"Circular Transactions"** dataset. In Algorithm Controls, switch to the **Cycle** tab. Click **"Run 3-State Cycle Detection"**. Click the detected cycle card.
- **What to Say:** *"Now we demonstrate circular fund routing. In financial audits, circular flows indicate round-tripping. Standard boolean visited arrays fail on directed graphs because cross-edges cause false positives. We implemented Three-State DFS using WHITE, GRAY, and BLACK node coloring. When the search from Radiant Capital traverses back to Prime Holdings, Prime Holdings is currently GRAY—meaning it is active on the recursion stack. This proves a back-edge and identifies a directed cycle without false positives."*
- **What to Point at:** Crimson highlighted loop ($P \rightarrow Q \rightarrow R \rightarrow P$); Cycle volume = ₹75,000.

### Step 4: Forensic Discrepancy & Non-Fraud Explanation (45 Seconds)
- **What to Click:** Select **"Fraud Investigation"** dataset. Click the bottom drawer **"Forensic Findings"**.
- **What to Say:** *"In addition to pure graph theory, FraudGraph applies explainable forensic rules. Notice Account `ACC_MULE_X` (Xavier Transit Agency). Our rule engine detected that it is an intermediary with in-degree 1 and out-degree 1. It received ₹50,000 from Alice but forwarded only ₹42,000 to Target D, retaining ₹8,000 or 16%. Crucially, our system includes documented non-fraud explanations: this discrepancy could represent standard processing fees or escrow withholdings rather than criminal theft."*
- **What to Point at:** Warning card for `ACC_MULE_X`; Retained discrepancy: ₹8,000 (16%); Neutral explanation text.

### Step 5: Custom Lab Interactive Mutation (45 Seconds)
- **What to Click:** Switch to **"Custom Investigation Lab"**. Click "Add Account" $\rightarrow$ add `ACC_DEMO_A`. Click "Add Account" $\rightarrow$ add `ACC_DEMO_B`. Add a transaction between them.
- **What to Say:** *"Finally, FraudGraph provides an isolated Custom Investigation Lab where an investigator can add custom accounts and transactions in real time, delete accounts with cascading edge cleanups, and run algorithms dynamically against the C++ engine."*
- **Closing Statement:** *"Every algorithm runs in native C++ with full unit test coverage. I am happy to answer any questions regarding our data structures, complexity proofs, or implementation details."*

---

## 11. Technical Reference

### Key Codebase File Locations
| Subsystem | File Path | Primary Function / Component |
| :--- | :--- | :--- |
| **Directed Graph Representation** | [`engine/src/graph.hpp`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/graph.hpp) | `DirectedGraph` class, dual `unordered_map` adjacency lists |
| **Degree & Volume Calculations** | [`engine/src/graph.cpp`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/graph.cpp) | `getInDegree()`, `getOutDegree()`, `getTotalIncomingPaise()` |
| **BFS & Shortest Path** | [`engine/src/algorithms.cpp:18-91, 277-375`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/algorithms.cpp#L18-L91) | `runBFS()`, `findShortestPathBFS()` |
| **DFS & Parenthesis Timestamps** | [`engine/src/algorithms.cpp:95-164`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/algorithms.cpp#L95-L164) | `runDFS()`, `dfsVisit()`, discovery $d[u]$ and finish $f[u]$ |
| **Three-State Cycle Detection** | [`engine/src/algorithms.cpp:168-274`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/algorithms.cpp#L168-L274) | `detectDirectedCycles()`, `dfsCycleHelper()` |
| **Forensic Rules & Retention** | [`engine/src/rules.cpp:21-232`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/rules.cpp#L21-L232) | `runInvestigation()`, `RULE_INTERMEDIARY_MULE` |
| **C++ JSON Streaming CLI** | [`engine/src/main.cpp`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/main.cpp) | Stdin JSON parser, action dispatcher, stdout JSON emitter |
| **C++ Automated Unit Tests** | [`engine/tests/test_engine.cpp`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/tests/test_engine.cpp) | 105 unit test assertions covering all graph invariants |
| **IPC Bridge Subprocess Spawn** | [`backend/src/engineBridge.js`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/backend/src/engineBridge.js) | `spawn(ENGINE_BIN)`, stdin/stdout stream communication |
| **Express API Router** | [`backend/src/routes.js`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/backend/src/routes.js) | Endpoints: `/datasets`, `/accounts`, `/transactions`, `/execute` |
| **Deterministic Datasets** | [`backend/src/sampleData.js`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/backend/src/sampleData.js) | 5 prebuilt academic benchmark graphs |
| **React Canvas & Layout** | [`frontend/src/components/GraphCanvas.tsx`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/frontend/src/components/GraphCanvas.tsx) | React Flow canvas, node positioning, path/cycle highlights |
| **Algorithm Controls & Playback** | [`frontend/src/components/AlgorithmControls.tsx`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/frontend/src/components/AlgorithmControls.tsx) | Tabs, step playback slider, parameter bindings |
| **Academic Dossier Modal** | [`frontend/src/components/AcademicConceptsModal.tsx`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/frontend/src/components/AcademicConceptsModal.tsx) | Complexity table, pseudocode, and DSA proofs |

### REST API Reference
- `GET /api/health`: Verifies Express server and C++ engine binary presence.
- `GET /api/datasets`: Returns catalog of 5 prebuilt datasets.
- `POST /api/datasets/select`: Body: `{ dataset_id }`. Switches the active playground dataset.
- `POST /api/reset`: Body: `{ dataset_id }`. Restores dataset back to benchmark standard.
- `POST /api/accounts`: Body: `{ id, name, type, risk_tier }`. Adds an account.
- `POST /api/transactions`: Body: `{ id, from_account, to_account, amount }`. Adds a transaction.
- `DELETE /api/accounts/:id`: Cascades deletion of account and all incident transactions.
- `DELETE /api/transactions/:id`: Removes single transaction.
- `POST /api/custom/reset`: Clears custom lab graph to 0 accounts and 0 transactions.
- `POST /api/execute`: Body: `{ accounts, transactions, action, params }`. Stateless execution pass against the C++17 engine. Actions: `full_analysis`, `bfs`, `dfs`, `cycle_detection`, `shortest_path`, `investigate`.
