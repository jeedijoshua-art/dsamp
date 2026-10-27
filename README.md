# FraudGraph — Graph-Based Financial Transaction Investigation System

> **Academic Data Structures and Algorithms Micro-Project (DSA)**  
> **Course:** Data Structures and Algorithms  
> **Core Engine:** Native C++17 Executable (`std::unordered_map` Adjacency List, BFS, DFS, Three-State Cycle Detection)  
> **API Bridge:** Node.js & Express (Child Process IPC via `stdin`/`stdout` JSON Streaming)  
> **Frontend Dashboard:** React 18, TypeScript, Vite, Tailwind CSS, React Flow  
> **Repository:** [https://github.com/jeedijoshua-art/dsamp](https://github.com/jeedijoshua-art/dsamp)  

---

## 1. Project Overview & Motivation

In modern financial systems, forensic transaction audits require analyzing complex networks of directed payment flows to uncover indirect transmission paths, intermediary entities, and circular routing. Traditional tabular accounting ledgers obscure relational patterns across multiple intermediary hops.

**FraudGraph** models financial ledgers as **directed graphs** $G = (V, E)$, pairing a high-performance native **C++17 algorithmic core** with a reactive **React 18 / React Flow visualization dashboard**. The system demonstrates deterministic graph algorithms to investigate:
- **Intermediary Mules & Layering Entities:** Accounts with high in-degree and out-degree functioning as fund-forwarding transit nodes.
- **Explainable Amount Discrepancies:** Flow retention margins along multi-hop payment chains (e.g. Origin dispatches ₹50,000, intermediary forwards ₹42,000; net discrepancy = ₹8,000 / 16.0%).
- **Directed Circular Routing (Cycles):** Three-State DFS (`WHITE`, `GRAY`, `BLACK`) back-edge identification that detects and reconstructs closed fund-circulation loops (e.g. $P \to Q \to R \to P$).
- **Unweighted Shortest Transmission Paths:** Breadth-First Search (BFS) with predecessor backtracking to identify minimum-hop transmission routes between accounts.
- **Branching Traversal Disparity:** Visualizing level-by-level BFS queue exploration against recursive branch-deep DFS traversal with discovery and finish timestamps.
- **Robust Graph Edge Cases:** Disconnected components, self-loops ($u \to u$), repeated transfers, and isolated accounts.

> [!IMPORTANT]
> **Forensic Ethics & Neutral Explainability:**  
> FraudGraph strictly adheres to ethical forensic audit principles: graph cycles, transit intermediaries, and amount differences **do not constitute legal proof of fraud or illicit activity**. The platform pairs every flagged pattern with documented neutral commercial interpretations (such as standard intermediary processing fees, statutory tax deductions, escrow holdbacks, batch settlement windows, or multilateral corporate netting).

---

## 2. Documentation Directory (`docs/`)

Comprehensive modular documentation is organized under [`docs/`](docs/):

| Document | Purpose |
| :--- | :--- |
| **[REPOSITORY_AUDIT.md](docs/REPOSITORY_AUDIT.md)** | Technical audit of the codebase, verified features, test logs, and improvement records. |
| **[INSTALLATION.md](docs/INSTALLATION.md)** | Step-by-step setup guide for macOS, Linux, and Windows (WSL2) with prerequisite commands. |
| **[USER_GUIDE.md](docs/USER_GUIDE.md)** | Walkthrough of the dashboard UI, dataset selector, algorithm controls, and Custom Lab. |
| **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** | Deep architectural dive into IPC streaming, data flows, and component responsibilities. |
| **[DSA_CONCEPTS.md](docs/DSA_CONCEPTS.md)** | Formal academic graph theory, algorithm proofs, and asymptotic complexity analyses. |
| **[API_REFERENCE.md](docs/API_REFERENCE.md)** | Complete REST API endpoint reference and JSON payload contracts. |
| **[TESTING.md](docs/TESTING.md)** | Verification guide, test suite details, and clean-clone reproduction instructions. |
| **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** | Common runtime errors (port conflicts, compiler issues) and verified fixes. |
| **[images/README.md](docs/images/README.md)** | Visual screenshot capture guide and demonstration checklist. |

---

## 3. System Architecture

```mermaid
graph TD
    UI[Frontend Dashboard<br/>React 18 + TS + Vite + Tailwind] -->|JSON Requests via Proxy :5173| API[Backend Bridge<br/>Node.js + Express :5001]
    API -->|stdin JSON stream<br/>Safe spawn / IPC| CPP[C++17 Graph Engine<br/>bin/fraudgraph_engine]
    CPP -->|stdout JSON stream<br/>O(V+E) Algorithm Results| API
    API -->|Aggregated State & Highlights| UI
    
    subgraph "Native C++17 Core Engine (engine/)"
        G[DirectedGraph<br/>Dual std::unordered_map Adjacency List]
        BFS[BFS Traversal & Shortest Path<br/>std::queue + Predecessor Backtracking]
        DFS[DFS Traversal<br/>Discovery & Finish Timers]
        CYC[Three-State DFS Cycle Detection<br/>WHITE / GRAY / BLACK]
        RULES[Explainable Heuristic Rules<br/>Integer-Paise Flow Reconciliation]
        G --> BFS
        G --> DFS
        G --> CYC
        G --> RULES
    end
```

### Technology Stack
- **Graph Algorithm Engine:** C++17 (`clang++` / `g++`), compiled with `-std=c++17 -O2 -Wall -Wextra`, zero runtime dependencies beyond standard library and single-header `nlohmann/json.hpp`.
- **Backend API Bridge:** Node.js (v18+) with Express and CORS. Spawns C++ binary using unbuffered streams without shell interpolation.
- **Frontend Dashboard:** React 18, TypeScript, Vite, Tailwind CSS with dark fintech styling (`#070b14` navy charcoal, `#06b6d4` cyan, `#14b8a6` teal, `#f43f5e` crimson).
- **Interactive Network Visualization:** React Flow (`reactflow`) with custom SVG animated path highlights, degree pill badges, and zoom/pan/minimap controls.

---

## 4. Repository Directory Structure

```
dsamp/
├── README.md                 # Primary project overview and documentation hub
├── LICENSE                   # MIT Open-Source License
├── CONTRIBUTING.md            # Development setup and pull request expectations
├── SECURITY.md               # Responsible vulnerability reporting policy
├── CHANGELOG.md              # Chronological record of features and improvements
├── .gitignore                # Protects against committing build artifacts & logs
├── .editorconfig             # Cross-editor formatting and indentation rules
├── .env.example              # Environment variable configuration template
├── run.sh                    # Automated single-command build, test, and launch script
├── test_e2e.js               # End-to-end API and engine regression test suite
├── test_all_datasets.js      # Integration test verifying all 5 prebuilt datasets
├── test_custom_lab.js        # Regression suite for Custom Lab mutations and isolation
├── docs/                     # Technical documentation dossier
│   ├── REPOSITORY_AUDIT.md   # Architectural audit and verified feature matrix
│   ├── INSTALLATION.md       # Comprehensive platform setup instructions
│   ├── USER_GUIDE.md         # UI user manual with exact button labels and controls
│   ├── ARCHITECTURE.md       # Deep architectural dive into IPC and data flow
│   ├── DSA_CONCEPTS.md       # Theoretical graph theory and complexity reference
│   ├── API_REFERENCE.md      # REST API contracts and endpoint documentation
│   ├── TESTING.md            # Test suite execution and clean-clone verification
│   ├── TROUBLESHOOTING.md    # Common errors (ports, compilers) and solutions
│   └── images/               # Screenshot guides and demo assets
├── .github/
│   ├── workflows/
│   │   └── ci.yml            # Multi-job GitHub Actions CI pipeline
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md     # Standardized bug reporting template
│   │   └── feature_request.md# Standardized feature request template
│   └── pull_request_template.md # PR review checklist
├── engine/                   # Native C++17 Graph Algorithm Engine
│   ├── Makefile              # Targets: all, test, clean
│   ├── bin/                  # Target output directory (fraudgraph_engine, test_engine)
│   ├── include/nlohmann/     # Single-header JSON parsing library (v3.11.3)
│   ├── src/
│   │   ├── graph.hpp / .cpp         # DirectedGraph dual adjacency list
│   │   ├── algorithms.hpp / .cpp    # BFS, DFS, Shortest Path, 3-State Cycle Detection
│   │   ├── rules.hpp / .cpp         # Intermediary flow, discrepancy, and cycle audits
│   │   ├── json_io.hpp              # Stream JSON serialization/deserialization
│   │   └── main.cpp                 # Stdin/stdout CLI IPC entrypoint
│   └── tests/
│       └── test_engine.cpp          # 92-assertion unit test suite
├── backend/                  # Node.js + Express API Bridge
│   ├── package.json          # Dependencies: express, cors
│   └── src/
│       ├── server.js         # HTTP server listener on port 5001
│       ├── routes.js         # REST endpoints for datasets, accounts, txs, engine
│       ├── engineBridge.js   # Safe child_process spawn execution
│       └── sampleData.js     # 5 prebuilt academic benchmark datasets
└── frontend/                 # React 18 + TypeScript + Vite Dashboard
    ├── package.json          # Dependencies: react, reactflow, lucide-react, tailwindcss
    ├── vite.config.ts        # Reverse proxy forwarding /api to port 5001
    └── src/
        ├── App.tsx           # Master layout, reactive state synchronization
        ├── main.tsx          # Application mount entrypoint
        ├── index.css         # Custom animations and glow utilities
        ├── types/index.ts    # TypeScript interfaces
        ├── api/client.ts     # Typed fetch client
        └── components/       # Modular UI components
```

---

## 5. Quick Start (Single-Command Launch)

### Prerequisites
- **macOS** (with Xcode Command Line Tools) or **Linux** (with `build-essential`) or **Windows WSL2**
- **C++17 Compiler:** Apple Clang 14+ or GCC 9+
- **Node.js:** v18.0.0 or higher (tested on v24)
- **GNU Make:** 3.81 or higher

### Launch Command
From the repository root:
```bash
chmod +x run.sh
./run.sh
```

### What `run.sh` Performs Automatically:
1. Compiles the C++17 engine binaries (`engine/bin/fraudgraph_engine` and `engine/bin/test_engine`).
2. Runs the 92-assertion C++ test suite and verifies 100% pass rate.
3. Automatically installs Node.js backend and frontend dependencies if `node_modules/` is missing.
4. Frees lingering background processes on ports `5001` and `5173`.
5. Starts the Express backend on `http://localhost:5001` and Vite frontend on `http://localhost:5173`.
6. Traps `SIGINT` (`Ctrl+C`) to cleanly terminate all processes upon exit.

**Access the Web Interface:** Open **`http://localhost:5173`** in your browser.

---

## 6. Manual Component Execution

If you prefer to start components in separate terminal windows:

### Terminal 1: Build & Verify C++ Engine
```bash
cd engine
make clean
make test   # Executes 92-assertion test suite
make all    # Produces bin/fraudgraph_engine
```

### Terminal 2: Start Express Backend API
```bash
cd backend
npm install # First-time setup
npm start   # Starts server on http://localhost:5001
```

Verify backend health:
```bash
curl -s http://localhost:5001/api/health
```

### Terminal 3: Start Vite Frontend Dashboard
```bash
cd frontend
npm install # First-time setup
npm run dev # Starts Vite server on http://localhost:5173
```

---

## 7. Core Graph Algorithms & Asymptotic Complexity

| Algorithm / Operation | Time Complexity | Auxiliary Space | Implementation File & Function | Key Data Structure |
| :--- | :---: | :---: | :--- | :--- |
| **Adjacency List Construction** | $O(\|V\| + \|E\|)$ | $O(\|V\| + \|E\|)$ | [`graph.cpp:addTransaction`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/graph.cpp#L40) | Dual `std::unordered_map` |
| **Breadth-First Search (BFS)** | $O(\|V\| + \|E\|)$ | $O(\|V\|)$ | [`algorithms.cpp:runBFS`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/algorithms.cpp#L18) | FIFO `std::queue<std::string>` |
| **Depth-First Search (DFS)** | $O(\|V\| + \|E\|)$ | $O(\|V\|)$ | [`algorithms.cpp:runDFS`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/algorithms.cpp#L140) | Recursion Call Stack, Timers |
| **Shortest Path (Minimum Hops)**| $O(\|V\| + \|E\|)$ | $O(\|V\|)$ | [`algorithms.cpp:findShortestPathBFS`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/algorithms.cpp#L277) | Predecessor Backtracking Map |
| **Three-State Cycle Detection** | $O(\|V\| + \|E\|)$ | $O(\|V\|)$ | [`algorithms.cpp:detectDirectedCycles`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/algorithms.cpp#L239) | `WHITE`/`GRAY`/`BLACK` State Map |
| **Forensic Heuristic Rules** | $O(\|V\| + \|E\|)$ | $O(\|V\|)$ | [`rules.cpp:runInvestigation`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/rules.cpp#L21) | Integer Paise Flow Reconciliation |

*Lookup Complexity Qualification:* The time complexity figures assume average-case $O(1)$ lookups in `std::unordered_map`. Worst-case hash collision complexity is $O(|V|)$. All neighbor sequences are sorted deterministically prior to exploration.

---

## 8. Prebuilt Academic Datasets

FraudGraph includes 5 prebuilt datasets switchable in the UI via the **Dataset Playground**:

1. **Basic Traversal (`basic_traversal`):** 7 vertices, 6 edges. A clean hierarchical tree to contrast BFS level-order frontier expansion against DFS branch-deep exploration and timestamps.
2. **Circular Transactions (`circular_transactions`):** 5 vertices, 5 edges. Contains a 3-node cycle ($P \to Q \to R \to P$), a self-loop pool, and an observer, demonstrating Three-State DFS back-edge detection.
3. **Shortest Route (`shortest_route`):** 6 vertices, 7 edges. Features competing 1-hop, 2-hop, and 3-hop routes from Alice to settlement targets, demonstrating unweighted BFS hop minimization.
4. **Fraud Investigation (`fraud_investigation`):** 14 vertices, 14 edges. Full academic standard benchmark featuring the Alice $\to$ Mule X $\to$ Target D layering chain, circular routing, repeated transfers, and self-loops.
5. **Disconnected Graph (`disconnected_graph`):** 6 vertices, 4 edges. Multiple disconnected components proving safe handling of unreachable destinations and isolated vertex traversals.

---

## 9. Testing & Quality Verification

Run all automated test suites to verify reproducibility:

```bash
# 1. C++ Engine Unit Test Suite (92/92 Passing)
make -C engine test

# 2. End-to-End API Integration Suite (All Stages Passing)
node test_e2e.js

# 3. All 5 Datasets Catalog Test (36/36 Passing)
node test_all_datasets.js

# 4. Custom Investigation Lab Regression Suite (All Assertions Passing)
node test_custom_lab.js

# 5. Frontend Production Build Check (TypeScript + Vite Rollup)
cd frontend && npm run build
```

See [docs/TESTING.md](docs/TESTING.md) for full execution logs and clean-clone verification instructions.

---

## 10. Project Limitations & Future Scope

### Current Architectural Boundaries:
- **Unweighted BFS for Shortest Path:** The shortest path algorithm minimizes **hop count (edge count)**, which is optimal for tracing transmission distance. It does not compute minimum-cost paths; Dijkstra's or Bellman-Ford algorithms could be integrated for fee-weighted pathfinding.
- **In-Memory Graph Representation:** Suitable for micro-project scales ($10^4$ to $10^5$ edges). Industrial billion-node financial graphs require distributed graph databases (e.g. Neo4j, Apache HugeGraph).
- **Synchronous Process Execution:** Engine execution runs on demand via child-process streaming; persistent worker threads or shared memory could be added for microsecond-latency batch streams.

---

## 11. License & Academic Integrity

This project is distributed under the **[MIT License](LICENSE)**.

**Academic Disclaimer:** Developed as a Data Structures and Algorithms (DSA) micro-project. All datasets distributed with this repository are **100% synthetic** and designed specifically to illustrate graph-theoretic properties. No real financial institutions, accounts, or personal data are represented.
