# Contributing to FraudGraph

Thank you for your interest in contributing to **FraudGraph**! This is an academic Data Structures and Algorithms micro-project designed for deterministic graph analysis and forensic visualization.

---

## 1. Development Workflow

1. **Fork or Clone the Repository:**
   ```bash
   git clone https://github.com/jeedijoshua-art/dsamp.git
   cd dsamp
   ```
2. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/my-algorithm-improvement
   ```
3. **Verify the Environment:**
   Run the test suites locally to ensure your baseline is green before making changes:
   ```bash
   make -C engine test
   cd frontend && npm run build
   ```

---

## 2. Coding Standards

### C++17 Core Engine (`engine/`)
- Adhere to the **ISO C++17** standard.
- Use 4 spaces for indentation.
- Keep algorithms decoupled from presentation logic.
- Avoid raw pointers where smart pointers or value semantics are cleaner.
- Always use `AmountPaise` (`int64_t`) for monetary amounts—**never use floating-point types (`float`, `double`) for internal currency storage**.
- When adding new graph traversal logic, preserve deterministic edge iteration (e.g. sort neighbor IDs).

### Backend Bridge (`backend/`)
- Express.js and Node.js v18+.
- Use 2 spaces for indentation.
- Stream JSON via `stdin`/`stdout` without shell interpolation.
- Enforce strict input validation on all REST endpoints.

### Frontend Dashboard (`frontend/`)
- React 18, TypeScript, and Tailwind CSS.
- Ensure all components pass strict `tsc` compilation with zero errors or warnings.
- Keep styling aligned with the dark fintech theme (`bg-navy-950`, `text-cyan-400`, `text-teal-400`).

---

## 3. Pull Request Guidelines

Before submitting a Pull Request:
1. Ensure the C++ test suite passes: `make -C engine test`.
2. Ensure the frontend builds cleanly: `cd frontend && npm run build`.
3. If you introduce a new feature or fix, add a test case to `engine/tests/test_engine.cpp` or one of the integration test scripts.
4. Fill out the pull request template completely.
