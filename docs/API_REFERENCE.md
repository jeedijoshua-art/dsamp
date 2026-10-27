# API Reference — FraudGraph REST API Bridge

The backend service runs on port `5001` (by default) and exposes a RESTful JSON API. All routes are prefixed with `/api`.

---

## 1. System & Health Endpoints

### `GET /api/health`
Checks backend responsiveness and confirms that the compiled C++ graph engine binary is present.

- **Response `200 OK`:**
  ```json
  {
    "status": "ok",
    "service": "FraudGraph API Bridge",
    "engine_binary_present": true,
    "engine_binary_path": "/path/to/dsamp/engine/bin/fraudgraph_engine",
    "timestamp": "2026-10-27T05:08:53.174Z"
  }
  ```

---

## 2. Dataset Management Endpoints

### `GET /api/datasets`
Returns the catalog of all 5 available prebuilt academic demonstration datasets.

- **Response `200 OK`:**
  ```json
  {
    "status": "success",
    "active_dataset_id": "fraud_investigation",
    "datasets": [
      {
        "id": "basic_traversal",
        "title": "Basic Traversal",
        "subtitle": "Hierarchical Clearing Network",
        "category": "BFS & DFS Traversal",
        "description": "...",
        "learning_objective": "...",
        "node_count": 7,
        "edge_count": 6
      }
    ]
  }
  ```

### `POST /api/datasets/select`
Switches the active in-memory working dataset to one of the prebuilt datasets.

- **Request Body:**
  ```json
  {
    "dataset_id": "circular_transactions"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "status": "success",
    "message": "Active dataset switched to 'Circular Transactions'.",
    "active_dataset_id": "circular_transactions",
    "dataset": { "accounts": [...], "transactions": [...] }
  }
  ```

### `POST /api/reset`
Resets the specified dataset (or the currently active dataset) back to its original deterministic benchmark state.

- **Request Body (Optional):**
  ```json
  {
    "dataset_id": "fraud_investigation"
  }
  ```

### `GET /api/dataset`
Retrieves the current in-memory active working dataset.

- **Response `200 OK`:**
  ```json
  {
    "status": "success",
    "active_dataset_id": "fraud_investigation",
    "dataset": {
      "metadata": { ... },
      "accounts": [...],
      "transactions": [...]
    }
  }
  ```

---

## 3. Graph Mutation Endpoints (Custom Lab)

### `POST /api/accounts`
Registers a new account vertex in the active dataset.

- **Request Body:**
  ```json
  {
    "id": "ACC_MERCHANT_1",
    "name": "Global Traders Inc.",
    "type": "Corporate",
    "risk_tier": "LOW"
  }
  ```
- **Validation Rules:**
  - `id` is required, non-empty, and auto-trimmed to uppercase.
  - Rejects duplicate account IDs with `400 Bad Request`.

### `POST /api/transactions`
Inserts a directed transaction edge between two existing accounts.

- **Request Body:**
  ```json
  {
    "id": "TX_SETTLE_01",
    "from_account": "ACC_ALICE",
    "to_account": "ACC_TARGET_D",
    "amount": 15000.50,
    "memo": "Quarterly settlement"
  }
  ```
- **Validation Rules:**
  - `id`, `from_account`, `to_account` are required.
  - Amount must be positive (`amount > 0`).
  - Stored internally as integer paise (`amount * 100`).
  - Rejects missing accounts with `400 Bad Request` (no silent auto-creation).
  - Rejects duplicate transaction IDs with `400 Bad Request`.

### `DELETE /api/accounts/:id`
Deletes an account vertex and **cascades deletion** to all incident transactions (both incoming and outgoing).

- **URL Parameter:** `:id` (Account ID)
- **Response `200 OK`:**
  ```json
  {
    "status": "success",
    "message": "Account 'ACC_MULE_X' and its incident transactions removed.",
    "dataset": { ... }
  }
  ```

### `DELETE /api/transactions/:id`
Deletes a specific transaction edge without affecting connected account vertices.

---

## 4. C++17 Engine Execution Endpoint

### `POST /api/execute`
The universal entrypoint for executing graph algorithms against a stateless snapshot of accounts and transactions.

- **Request Body Schema:**
  ```json
  {
    "accounts": [...],
    "transactions": [...],
    "action": "shortest_path",
    "params": {
      "source": "ACC_ALICE",
      "destination": "ACC_TARGET_D"
    }
  }
  ```

### Supported Actions & Output Formats:

#### 1. `"shortest_path"`
- **Params:** `source` (string), `destination` (string).
- **Response Fragment:**
  ```json
  "shortest_path": {
    "success": true,
    "path_exists": true,
    "source": "ACC_ALICE",
    "destination": "ACC_TARGET_D",
    "hop_count": 2,
    "node_path": ["ACC_ALICE", "ACC_MULE_X", "ACC_TARGET_D"],
    "transaction_ids": ["TX_CHAIN_01", "TX_CHAIN_02"],
    "total_volume_paise": 9200000,
    "total_volume_inr": 92000.0,
    "time_complexity": "O(V + E)",
    "space_complexity": "O(V)"
  }
  ```

#### 2. `"cycle_detection"`
- **Response Fragment:**
  ```json
  "cycle_detection": {
    "success": true,
    "has_cycle": true,
    "cycles": [
      {
        "node_path": ["ACC_P_CORP", "ACC_Q_HOLDING", "ACC_R_VENTURE", "ACC_P_CORP"],
        "transaction_ids": ["TX_CYCLE_01", "TX_CYCLE_02", "TX_CYCLE_03"],
        "cycle_volume_paise": 7500000,
        "cycle_volume_inr": 75000.0,
        "is_self_loop": false
      }
    ],
    "time_complexity": "O(V + E)",
    "algorithm_name": "Three-State DFS (WHITE/GRAY/BLACK)"
  }
  ```

#### 3. `"bfs"`
- **Params:** `start_node` (string).
- **Response Fragment:**
  ```json
  "bfs": {
    "success": true,
    "start_node": "ACC_BRANCH_HUB",
    "traversal_order": ["ACC_BRANCH_HUB", "ACC_BRANCH_B1", "ACC_BRANCH_B2", "..."],
    "distances": { "ACC_BRANCH_HUB": 0, "ACC_BRANCH_B1": 1, "...": 2 },
    "steps": [
      {
        "step_number": 1,
        "current_node": "ACC_BRANCH_HUB",
        "metric_val": 0,
        "action": "VISIT",
        "description": "Queue pop: Discovered root node ACC_BRANCH_HUB"
      }
    ]
  }
  ```

#### 4. `"dfs"`
- **Params:** `start_node` (string).
- **Response Fragment:**
  ```json
  "dfs": {
    "success": true,
    "start_node": "ACC_BRANCH_HUB",
    "discovery_times": { "ACC_BRANCH_HUB": 1, "ACC_BRANCH_B1": 2 },
    "finish_times": { "ACC_BRANCH_HUB": 14, "ACC_BRANCH_B1": 7 },
    "steps": [...]
  }
  ```

#### 5. `"investigate"`
- **Params (Optional):** `source`, `destination`.
- **Response Fragment:**
  ```json
  "investigation": {
    "total_findings": 11,
    "high_severity_count": 2,
    "warning_count": 3,
    "info_count": 6,
    "findings": [
      {
        "rule_id": "RULE_INTERMEDIARY_MULE",
        "rule_name": "Intermediary Account Flow Analysis",
        "severity": "WARNING",
        "flagged_accounts": ["ACC_MULE_X"],
        "amount_in_paise": 5000000,
        "amount_out_paise": 4200000,
        "discrepancy_paise": 800000,
        "discrepancy_pct": 16.0,
        "summary": "Account 'ACC_MULE_X' forwarded funds with a INR 8000.00 net retention.",
        "neutral_explanation": "A difference between incoming and outgoing amounts does not imply fraud..."
      }
    ]
  }
  ```

#### 6. `"full_analysis"`
Executes BFS, DFS, Cycle Detection, Shortest Path, and Forensic Rules in a single unified C++ pass.
