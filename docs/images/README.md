# Visual Demo & Screenshot Guide — FraudGraph

This directory is designated for high-resolution screenshots of **FraudGraph** for submission reports, slide decks, and project presentations.

---

## Recommended Screenshots to Capture

When running `./run.sh` and opening `http://localhost:5173`, capture the following 4 views:

### 1. Main Dashboard Overview (`dashboard_overview.png`)
- **How to Capture:**
  1. Open `http://localhost:5173`.
  2. Select the default **Fraud Investigation** dataset.
  3. Capture the full browser window showing the 6 KPI metric cards, the React Flow canvas with 14 account vertices, and the forensic findings panel in the sidebar.

### 2. Shortest Transmission Route (`shortest_route.png`)
- **How to Capture:**
  1. Select the **Shortest Route** dataset card.
  2. In the algorithm panel, select `ACC_ALICE` as Source and `ACC_TARGET_D` as Destination.
  3. Click **"Find Shortest Route"**.
  4. Capture the highlighted cyan transmission path (`ACC_ALICE -> ACC_MULE_X -> ACC_TARGET_D`) with hop metrics.

### 3. Directed Cycle Detection (`cycle_detection.png`)
- **How to Capture:**
  1. Select the **Circular Transactions** dataset card.
  2. Switch to the **Cycle Detection** tab and click **"Run Cycle Detection"**.
  3. Capture the glowing crimson back-edge highlighting the 3-node loop (`ACC_P_CORP -> ACC_Q_HOLDING -> ACC_R_VENTURE -> ACC_P_CORP`) and the self-loop.

### 4. Custom Investigation Lab (`custom_lab.png`)
- **How to Capture:**
  1. Toggle the header switcher to **Custom Investigation Lab**.
  2. Click **"+ Add Account"** to create a custom node.
  3. Click **"+ Add Transaction"** to link directed edges.
  4. Capture the blank/custom canvas showing investigator-created nodes.
