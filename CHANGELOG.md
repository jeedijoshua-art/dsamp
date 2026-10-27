# Changelog — FraudGraph

All notable changes to the **FraudGraph** repository are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-27

### Added
- **Native C++17 Core Engine:**
  - Dual adjacency-list representation (`adj_` and `rev_adj_`) with deterministic edge sorting.
  - Queue-based Breadth-First Search (BFS) with step-by-step trace generation.
  - Unweighted Shortest Path discovery via BFS with predecessor map backtracking.
  - Recursive Depth-First Search (DFS) with discovery ($d[u]$) and finish ($f[u]$) timestamp tracking satisfying the Parenthesis Theorem.
  - Three-State DFS (`WHITE`, `GRAY`, `BLACK`) directed cycle detection and loop path reconstruction.
  - Integer-paise financial arithmetic (`int64_t`) eliminating floating-point rounding hazards.
  - Forensic rule engine (`RULE_INTERMEDIARY_MULE`, `RULE_ROUTE_DISCREPANCY`, `RULE_CIRCULAR_ROUTING`, `RULE_REPEATED_TRANSFERS`, `RULE_SELF_LOOP`) with neutral non-fraud explainability.
  - 92-assertion automated C++ unit test suite (`engine/tests/test_engine.cpp`).
- **Backend API Bridge (Express.js):**
  - Safe child-process IPC streaming JSON via `stdin`/`stdout` without shell interpolation.
  - 5 prebuilt academic benchmark datasets catalog (`basic_traversal`, `circular_transactions`, `shortest_route`, `fraud_investigation`, `disconnected_graph`).
  - Graph mutation endpoints for Custom Investigation Lab with cascading edge deletion.
- **Frontend Dashboard (React 18 + TypeScript + Vite + React Flow):**
  - Interactive directed graph canvas with animated edge flow, degree pill badges, and zoom/pan/minimap.
  - Traversal step playback controls (play/pause, step forward/backward).
  - KPI summary metrics cards (Vertices, Edges, Volume, Intermediaries, Cycles, Findings).
  - Two-mode application switcher (Dataset Playground vs. Custom Investigation Lab).
  - Academic DSA Concepts modal with pseudocode and asymptotic complexity references.
- **Documentation & DevOps:**
  - `docs/REPOSITORY_AUDIT.md`: Codebase inspection, verified features, and audit report.
  - `docs/INSTALLATION.md`: Step-by-step setup guide for macOS, Linux, and Windows WSL2.
  - `docs/USER_GUIDE.md`: Comprehensive walkthrough with exact UI button labels.
  - `docs/ARCHITECTURE.md`: Deep architectural dive into IPC, data flows, and layer design.
  - `docs/DSA_CONCEPTS.md`: Formal theoretical graph reference and algorithm proofs.
  - `docs/API_REFERENCE.md`: Complete REST API endpoints and JSON contract reference.
  - `docs/TESTING.md`: Reproducibility protocol and test execution commands.
  - `docs/TROUBLESHOOTING.md`: Common runtime failure modes and solutions.
  - `.github/workflows/ci.yml`: Automated CI pipeline for C++ engine, backend tests, and frontend build.
  - `.editorconfig`, `.gitignore`, `.env.example`, `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`.
