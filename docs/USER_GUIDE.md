# User Guide — FraudGraph

Welcome to the **FraudGraph User Guide**. This document provides a walkthrough of the FraudGraph interface, controls, dataset demonstrations, and forensic investigation workflows based on the active application source code.

---

## 1. Launching and Navigating the Application

### 1.1 Accessing the UI
1. Launch the application environment using `./run.sh` or through the individual component terminals as described in [INSTALLATION.md](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/docs/INSTALLATION.md).
2. Open your web browser and navigate to:
   ```
   http://localhost:5173
   ```

### 1.2 Top Navigation Bar (Header)
The sticky top navigation bar provides global application state, mode switching, and auxiliary tools:

| Control | Location | Description |
| :--- | :--- | :--- |
| **Brand & Subtitle** | Top Left | "FraudGraph — DSA Playground" badge with activity icon. |
| **Mode Switcher** | Center | Toggle between **Dataset Playground** (prebuilt benchmarks) and **Custom Investigation Lab** (blank canvas creation). |
| **Engine Status Indicator** | Right | Green pulsing dot indicating **"C++17 Engine Online"**. If the backend or C++ binary is offline, this turns red. |
| **Reset Button** | Right | **"Reset Dataset"** in Playground mode restores the deterministic benchmark. In Custom Lab mode, becomes **"Reset Graph"** (blank canvas). |
| **DSA Concepts Button** | Right | Opens the interactive modal explaining graph theory, algorithms, complexity proofs, and textbook references. |
| **+ Add Account / + Add Transaction** | Right | Visible only in **Custom Investigation Lab** mode for manual graph construction. |

---

## 2. Dataset Playground Mode

The Dataset Playground enables one-click loading of 5 curated academic benchmark topologies designed to isolate specific algorithmic phenomena.

### 2.1 The 5 Benchmark Datasets

```
+---------------------------------------------------------------------------------------------------+
|  [ Basic Traversal ]   [ Circular Transactions ]   [ Shortest Route ]   [ Fraud Investigation ]   [ Disconnected Graph ] |
+---------------------------------------------------------------------------------------------------+
```

#### 1. Basic Traversal (`basic_traversal`)
- **Topology:** A 7-vertex, 6-edge branching tree rooted at `ACC_BRANCH_HUB` (`Hub -> B1, B2; B1 -> C1, C2; B2 -> D1, D2`).
- **Educational Goal:** Compare level-by-level BFS queue expansion against recursive branch-deep DFS traversal order. Observe BFS distances ($0, 1, 2$) and DFS discovery/finish timestamps ($d[u]/f[u]$).

#### 2. Circular Transactions (`circular_transactions`)
- **Topology:** 5 vertices, 5 directed edges featuring a 3-node cycle (`P -> Q -> R -> P`), a self-loop (`ACC_INTERNAL_POOL -> ACC_INTERNAL_POOL`), and an audit observer.
- **Educational Goal:** Observe Three-State DFS (`WHITE`/`GRAY`/`BLACK`) detecting back-edges pointing to active ancestors on the recursion stack.

#### 3. Shortest Route (`shortest_route`)
- **Topology:** 6 vertices, 7 edges with multiple competing paths from `ACC_ALICE` to `ACC_TARGET_D` (direct 2-hop route via `ACC_MULE_X` vs alternative 2-hop route via `ACC_EXPRESS_GATEWAY` vs 3-hop route to `ACC_ESCROW_VAULT`).
- **Educational Goal:** Verify that unweighted BFS finds the path with minimum edge count (hops).

#### 4. Fraud Investigation (`fraud_investigation`)
- **Topology:** Comprehensive academic benchmark network with 14 accounts and 14 transactions. Combines layering chains, amount discrepancies, cycles, repeated transfers, and self-loops.
- **Educational Goal:** Full multidimensional forensic investigation integrating topological graph analysis with rule-based amount retention calculations.

#### 5. Disconnected Graph (`disconnected_graph`)
- **Topology:** 6 accounts and 4 transactions partitioned into isolated subgraphs: an active 2-hop payment pipeline, an isolated vendor pair, and a completely disconnected cold vault (`ACC_ISOLATED`).
- **Educational Goal:** Verify graceful degradation: BFS reports unreachable destinations with zero hop count, and traversing isolated accounts visits only the root node.

### 2.2 KPI Metric Cards
Immediately below the dataset selector, 6 KPI cards summarize the active graph:
1. **Graph Vertices $|V|$:** Count of active registered accounts.
2. **Directed Edges $|E|$:** Count of directed fund transactions.
3. **Network Volume:** Cumulative sum of all transaction amounts, rendered in Indian Rupees (INR) calculated from integer paise.
4. **Intermediary Nodes:** Number of accounts acting as transit nodes (In-Degree $\ge 1$ and Out-Degree $\ge 1$). Clicking filters intermediary findings.
5. **Directed Cycles:** Total closed loops identified by Three-State DFS. Clicking highlights circular back-edges.
6. **Rule Findings:** Number of forensic exceptions flagged by heuristic audit rules, showing high-severity counts.

---

## 3. Interactive Graph Visualization (Canvas)

The main visualization area is powered by **React Flow** with dark fintech styling:

### 3.1 Account Vertices
- **Visual Styling:** Rounded cards displaying Account ID (e.g., `ACC_MULE_X`), account name, and risk tier pill badge (`LOW` green, `MEDIUM` yellow, `HIGH` red).
- **Degree Indicators:** Left pill displays **In-Degree** (number of incoming transfers); right pill displays **Out-Degree** (number of outgoing transfers).
- **Interactions:**
  - **Left Click:** Selects the account and opens the **Account Inspector** in the right sidebar.
  - **Drag:** Repositions the node manually.
  - **Auto Layout:** The graph canvas automatically applies hierarchical Sugiyama/Dagre layout to minimize edge crossings.

### 3.2 Directed Transaction Edges
- **Direction:** Solid animated lines with directional arrowheads showing exact fund flow from sender to recipient.
- **Edge Label:** Displays Transaction ID (e.g., `TX_CHAIN_01`) and formatted monetary amount (e.g., `₹50,000`).
- **Color Highlighting:**
  - **Default:** Slate gray (`#334155`).
  - **Shortest Route Highlight:** Vibrant cyan/teal with animated glow (`#06b6d4`).
  - **Cycle Highlight:** Glowing crimson with directional pulse (`#f43f5e`).
  - **BFS / DFS Active Step:** Emerald green (`#10b981`).

---

## 4. Algorithm Demonstrations & Step-by-Step Playback

The bottom left control panel features 4 tabs for executing algorithms via the C++ engine:

### Tab 1: Shortest Route (BFS)
- **Problem Solved:** Finds the minimum-hop directed transmission path between two selected accounts.
- **Controls:**
  - Select **Source Account** from dropdown.
  - Select **Destination Account** from dropdown.
  - Click **"Find Shortest Route"**.
- **Results Displayed:**
  - Hop count (e.g., `2 Hops`).
  - Complete path sequence: `ACC_ALICE → ACC_MULE_X → ACC_TARGET_D`.
  - Transaction IDs along the path.
  - Time Complexity: $O(V + E)$ | Auxiliary Space: $O(V)$.
  - Canvas highlights the exact path edges in cyan.

### Tab 2: Cycle Detection (Three-State DFS)
- **Problem Solved:** Identifies closed directed loops where money recirculates to an ancestor.
- **Controls:**
  - Click **"Run Cycle Detection"**.
- **Results Displayed:**
  - Number of detected cycles.
  - Cycle path sequence (e.g., `ACC_P_CORP → ACC_Q_HOLDING → ACC_R_VENTURE → ACC_P_CORP`).
  - Cycle transaction volume (sum of loop edges).
  - Self-loop flag (`is_self_loop: true/false`).
  - Canvas renders circular back-edges in pulsing crimson.

### Tab 3: BFS Traversal (FIFO Queue)
- **Problem Solved:** Explores the network level-by-level using a FIFO queue.
- **Controls:**
  - Select **Start Account** from dropdown.
  - Click **"Run BFS Traversal"**.
  - Use the **Playback Controls** (Play/Pause, Step Forward, Step Back, Reset).
- **Interactive Step Inspector:**
  - Shows current step number and active queue pop node.
  - Displays hop distance from root ($0, 1, 2$).
  - Lists all vertices discovered so far in the FIFO queue order.
  - Canvas highlights newly visited nodes and tree edges in emerald green.

### Tab 4: DFS Traversal (Recursion & Timers)
- **Problem Solved:** Explores deep along each directed branch before backtracking.
- **Controls:**
  - Select **Start Account** from dropdown.
  - Click **"Run DFS Traversal"**.
  - Step through using the playback slider.
- **Interactive Step Inspector:**
  - Displays discovery timestamp $d[u]$ and finish timestamp $f[u]$ for every vertex.
  - Demonstrates the **Parenthesis Theorem**: nested discovery intervals prove ancestor-descendant relationships in the DFS tree.

---

## 5. Custom Investigation Lab Mode

Switch to **Custom Investigation Lab** via the header toggle to construct and test custom graph scenarios from scratch.

### 5.1 Creating Account Vertices
1. Click **"+ Add Account"** in the top navigation bar.
2. Enter:
   - **Account ID:** Unique identifier (e.g., `ACC_NEW_1`). Automatically converted to uppercase.
   - **Account Name:** Descriptive label (e.g., `Apex Trading Co.`).
   - **Account Type:** e.g., `Corporate`, `Personal`, `Escrow`, `Intermediary`.
   - **Risk Tier:** Select `LOW`, `MEDIUM`, or `HIGH`.
3. Click **"Create Account"**. The new vertex appears on the canvas.

### 5.2 Creating Directed Transaction Edges
1. Click **"+ Add Transaction"** in the top navigation bar.
2. Enter:
   - **Transaction ID:** Unique ID (e.g., `TX_NEW_01`).
   - **Source Account:** Select sender from dropdown (must exist).
   - **Destination Account:** Select receiver from dropdown (must exist).
   - **Amount (INR):** Positive monetary value (e.g., `25000.50`). Stored as exact integer paise ($2,500,050$).
   - **Memo:** Optional description (e.g., `Consulting invoice #104`).
3. Click **"Record Transaction"**. The directed edge renders on the canvas.

### 5.3 Deleting Vertices & Cascading Edges
1. Click on an account node on the canvas to open the **Account Inspector**.
2. Click the red **"Delete Account"** button.
3. **Cascading Invariant:** Deleting an account automatically removes all incoming and outgoing transaction edges attached to that account, preventing dangling edges and maintaining graph integrity.

### 5.4 Hands-On Exercise: Building a 3-Node Cycle
To demonstrate Three-State DFS to an evaluator:
1. Switch to **Custom Investigation Lab** and click **"Reset Graph"** for a blank canvas.
2. Add three accounts: `ACC_A`, `ACC_B`, and `ACC_C`.
3. Add three transactions:
   - `TX_1`: `ACC_A → ACC_B` (Amount: ₹2,000)
   - `TX_2`: `ACC_B → ACC_C` (Amount: ₹2,000)
   - `TX_3`: `ACC_C → ACC_A` (Amount: ₹2,000)
4. Go to the **Cycle Detection** tab and click **"Run Cycle Detection"**.
5. Observe:
   - Cycle detected: `ACC_A → ACC_B → ACC_C → ACC_A`.
   - Cycle volume: ₹6,000.
   - Back-edge `ACC_C → ACC_A` turns crimson on the canvas.
6. Now delete `ACC_B`:
   - `TX_1` and `TX_2` are automatically pruned.
   - Run cycle detection again: the cycle is broken (`has_cycle: false`).

---

## 6. Forensic Rule Engine & Neutral Explainability

FraudGraph couples algorithmic graph analysis with rule-based financial flow reconciliation:

### Rule 1: Intermediary Account Flow Analysis (`RULE_INTERMEDIARY_MULE`)
- **Trigger:** Any account with In-Degree $\ge 1$ and Out-Degree $\ge 1$.
- **Calculation:** Compares total incoming paise against total outgoing paise.
- **Discrepancy:** If incoming exceeds outgoing, net retained funds are flagged with percentage.
- **Neutral Explanation:** Retained funds do not indicate theft or fraud; they often represent contractual processing commissions, statutory tax deductions, or split settlement tranches.

### Rule 2: End-to-End Route Transmission & Discrepancy (`RULE_ROUTE_DISCREPANCY`)
- **Trigger:** Multi-hop path ($\ge 2$ hops) investigated between origin and final target.
- **Calculation:** Compares the amount dispatched on the first hop against the amount received on the terminal hop.
- **Discrepancy:** Flagged if the amounts do not match.
- **Neutral Explanation:** Multi-hop discrepancies can result from foreign exchange spreads, escrow withholding, or multi-party syndicate splits.

### Rule 3: Circular Fund Pattern (`RULE_CIRCULAR_ROUTING`)
- **Trigger:** Reconstructed directed cycle from Three-State DFS.
- **Neutral Explanation:** While circular transfers can indicate artificial volume inflation or round-tripping, legitimate commercial causes include multilateral netting between corporate subsidiaries, vendor refund reconciliations, and liquidity rebalancing.
