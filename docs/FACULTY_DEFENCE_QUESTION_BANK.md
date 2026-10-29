# FraudGraph — Faculty Defence Question Bank & Viva Examiner Dossier

> **Academic Project:** FraudGraph — Graph-Based Financial Transaction Investigation System  
> **Course:** Data Structures and Algorithms (DSA)  
> **Author & Presenter:** Jeedi Joshua  
> **Examiner Target:** University CSE Faculty, Project Examiners, DSA Lab Evaluators  

---

## Guide for the Student
In an academic project viva or capstone presentation, faculty examiners typically evaluate three levels of proficiency:
1. **Conceptual Understanding (Easy):** Do you know what a graph, queue, stack, and cycle are?
2. **Implementation Mastery (Medium):** Did you personally implement this, or did you use an off-the-shelf library? Can you point to the exact function in the source code?
3. **Algorithmic Edge Cases & Invariants (Difficult):** What are the mathematical proofs, trade-offs, and failure modes? What happens on empty graphs, disconnected components, self-loops, and scale?

Every question in this bank includes:
- **15–30 Second Spoken Answer:** Exactly what you should say aloud with confidence.
- **Deep Technical Explanation:** The mathematical and algorithmic reasoning behind it.
- **Source Code Anchor:** The exact file path and line numbers in your repository.
- **Teacher's Likely Follow-Up:** The immediate second question the examiner will ask to probe deeper.
- **Critical Caveat:** Pitfalls or misconceptions you must never state.

---

## Category 1: Project Objective, Graph Theory & Representation

### Q1 [Easy]: What is FraudGraph, and why is a graph data structure used instead of a relational table?
- **15–30 Second Spoken Answer:**
  > *"FraudGraph is an investigative system that detects financial money-laundering patterns like intermediary layering chains and circular round-tripping. We model accounts as vertices and directed transfers as edges. We use a graph because tracking multi-hop paths in relational databases requires expensive recursive self-joins ($O(N^k)$), whereas our in-memory adjacency list allows reachability and shortest paths to be computed in linear time $O(|V| + |E|)$."*
- **Deep Technical Explanation:**
  In a relational database (RDBMS), transactions are stored as flat rows in a table `transactions(id, from_id, to_id, amount)`. Finding a path from Account $A$ to Account $Z$ across $k$ hops requires joining the table with itself $k$ times:
  ```sql
  SELECT * FROM transactions t1 
  JOIN transactions t2 ON t1.to_id = t2.from_id 
  JOIN transactions t3 ON t2.to_id = t3.from_id ...
  ```
  This creates an exponential combinatorial expansion ($O(N^k)$). In contrast, representing the topology as an Adjacency List enables direct pointer/hash lookups in $O(1)$ time per outgoing neighbor, yielding overall traversal in $O(|V| + |E|)$.
- **Source Code Anchor:** [`engine/src/graph.hpp:44-53`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/graph.hpp#L44-L53)
- **Teacher's Likely Follow-Up:** *"Why not use an Adjacency Matrix instead?"*
- **Critical Caveat:** Do not say graphs replace all SQL databases. Graphs are optimal for associative connectivity and multi-hop traversal; relational databases remain standard for ACID storage and tabular reporting.

---

### Q2 [Medium]: How is the graph represented in your C++ engine? What data structures did you select and why?
- **15–30 Second Spoken Answer:**
  > *"We represent our directed graph using an Adjacency List backed by dual hash maps: `std::unordered_map<std::string, std::vector<Transaction>> adj_` for outgoing edges and `rev_adj_` for incoming edges. We selected an Adjacency List because financial networks are sparse graphs where $|E| \ll |V|^2$. This achieves $O(|V| + |E|)$ space complexity and allows instant calculation of in-degrees and out-degrees in $O(1)$ lookup time."*
- **Deep Technical Explanation:**
  The `DirectedGraph` class in `engine/src/graph.hpp` maintains:
  1. `accounts_`: Hash map mapping Account ID $\rightarrow$ `Account` struct ($O(1)$ average lookup).
  2. `adj_`: Outgoing incidence list mapping `from_account` $\rightarrow$ `std::vector<Transaction>`.
  3. `rev_adj_`: Incoming incidence list mapping `to_account` $\rightarrow$ `std::vector<Transaction>`.
  4. `transactions_by_id_`: Fast index to reject duplicate transaction IDs in $O(1)$ time.
  An Adjacency Matrix requires an $|V| \times |V|$ array consuming $O(|V|^2)$ memory. In our 17-account benchmark, an Adjacency Matrix would allocate 289 cells for only 16 transactions—over 94% wasted empty memory.
- **Source Code Anchor:** [`engine/src/graph.hpp:46-52`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/graph.hpp#L46-L52) and [`engine/src/graph.cpp:76-79`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/graph.cpp#L76-L79)
- **Teacher's Likely Follow-Up:** *"Why did you store a separate `rev_adj_` list instead of just searching `adj_`?"*
  - *Answer:* *"Without `rev_adj_`, computing an account's in-degree would require iterating through every single outgoing edge in the entire graph ($O(|E|)$). With `rev_adj_`, in-degree is computed in $O(1)$ time by returning `rev_adj_[account_id].size()`."*
- **Critical Caveat:** Never say `std::unordered_map` has $O(1)$ worst-case time. In rare hash-collision cases it degrades to $O(N)$, but its average case is strictly $O(1)$.

---

### Q3 [Difficult]: Why do you store monetary values in integer paise (`int64_t amount_paise`) instead of `double` or `float`?
- **15–30 Second Spoken Answer:**
  > *"We store all monetary amounts as 64-bit signed integers in paise ($1\text{ INR} = 100\text{ paise}$) to eliminate IEEE-754 binary floating-point rounding drift. In floating-point arithmetic, fractions like $0.1$ cannot be represented exactly in binary, causing calculations like $0.1 + 0.2 = 0.30000000000000004$. In financial audit reconciliation, rounding errors violate ledger balance proofs. Integer arithmetic guarantees 100% exact additions, subtractions, and net discrepancy checks."*
- **Deep Technical Explanation:**
  IEEE-754 double-precision floats represent numbers using a 53-bit mantissa and an 11-bit base-2 exponent. Base-10 decimals whose denominators are not powers of two (such as $0.10 = \frac{1}{10}$) become non-terminating repeating binary fractions ($0.0001100110011..._2$).
  Accumulating floating-point transaction amounts over thousands of graph hops introduces cumulative drift, causing zero-sum multilateral netting checks to fail. By defining `using AmountPaise = int64_t;`, an amount of ₹50,000.00 is stored as `5000000LL`. Max value of `int64_t` is $\approx 9.22 \times 10^{18}$ paise, accommodating transaction volumes up to ₹92,233,720,368,547,758.07 without overflow.
- **Source Code Anchor:** [`engine/src/graph.hpp:12-13`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/graph.hpp#L12-L13)
- **Teacher's Likely Follow-Up:** *"Where does the conversion back to decimal Rupees happen?"*
  - *Answer:* *"Solely at the presentation boundary in the C++ JSON formatter (`rules.cpp:formatINR`) and the React UI frontend (`formatCurrency()`). The graph algorithm core never performs floating-point operations."*
- **Critical Caveat:** Do not say integer paise prevents division errors. Division (e.g., percentage calculation) still requires explicit casting to `double`.

---

## Category 2: Breadth-First Search (BFS) & Shortest Path

### Q4 [Easy]: What is the primary role of BFS in FraudGraph, and what data structure enables it?
- **15–30 Second Spoken Answer:**
  > *"BFS performs radial, level-by-level exploration of the financial network starting from an origin account. It is enabled by a First-In-First-Out (FIFO) queue (`std::queue<std::string>`). It guarantees finding the shortest transmission path by edge count (minimum hops) to all reachable accounts in $O(|V| + |E|)$ time."*
- **Deep Technical Explanation:**
  BFS maintains two core invariants:
  1. **FIFO Invariant:** Vertices at distance $d$ from the source are dequeued and processed strictly before any vertex at distance $d + 1$.
  2. **Single-Visit Invariant:** A boolean hash map `visited[u]` marks each node upon initial enqueueing, ensuring no vertex is processed more than once.
- **Source Code Anchor:** [`engine/src/algorithms.cpp:18-42`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/algorithms.cpp#L18-L42)
- **Teacher's Likely Follow-Up:** *"Why is a vertex marked visited when pushed to the queue, rather than when popped?"*
- **Critical Caveat:** If you mark a vertex visited upon *pop* instead of *push*, the same vertex can be enqueued multiple times by different incoming neighbors, degrading space and time complexity to exponential $O(2^{|V|})$. In FraudGraph, line 39 and line 80 explicitly set `visited[v] = true` *before* calling `q.push(v)`.

---

### Q5 [Medium]: How does your engine reconstruct the shortest path between a source and destination?
- **15–30 Second Spoken Answer:**
  > *"During BFS forward traversal, whenever an unvisited vertex $v$ is reached from vertex $u$ via transaction $tx$, we store a predecessor mapping: `pred[v] = {u, tx}`. When the destination vertex is dequeued, we halt the forward search and backtrack from the destination to the source by following `pred[curr].first`, recording the ordered transaction IDs and node sequences. Reversing that backtracked list yields the exact shortest route in $O(P)$ time, where $P$ is the path length."*
- **Deep Technical Explanation:**
  In `findShortestPathBFS()`:
  ```cpp
  std::unordered_map<std::string, std::pair<std::string, Transaction>> pred;
  ```
  When destination $D$ is dequeued, forward exploration terminates immediately. Backtracking starts at $curr = D$:
  ```cpp
  while (curr != source) {
      reversed_tx_ids.push_back(pred[curr].second.id);
      curr = pred[curr].first;
      reversed_nodes.push_back(curr);
  }
  std::reverse(reversed_nodes.begin(), reversed_nodes.end());
  ```
  Because BFS guarantees that the first time $D$ is enqueued it was reached via the minimum number of hops, the predecessor tree guarantees an optimal minimum-hop route.
- **Source Code Anchor:** [`engine/src/algorithms.cpp:310-373`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/algorithms.cpp#L310-L373)
- **Teacher's Likely Follow-Up:** *"What if there are multiple shortest paths with the same hop count?"*
  - *Answer:* *"Our engine sorts outgoing edges deterministically by destination ID and transaction ID (`getSortedOutgoing()`), ensuring the traversal always selects the lexicographically first deterministic path."*
- **Critical Caveat:** Do not claim your shortest path finds the path with lowest financial amount. It finds the path with **minimum hops (edge count)**. Finding lowest amount would require Dijkstra's algorithm.

---

### Q6 [Difficult]: What happens in BFS if the destination is unreachable, or if source equals destination?
- **15–30 Second Spoken Answer:**
  > *"Both are verified edge cases in our regression test suite. If source equals destination, the engine immediately returns `path_exists: true`, `hop_count: 0`, a single-element path `[source]`, and zero volume without pushing anything to the queue. If the destination is unreachable, the BFS queue empties naturally, `reached` remains `false`, and the engine returns `path_exists: false`, `hop_count: 0`, and a descriptive error message without crashing."*
- **Deep Technical Explanation:**
  - *Identity Path Guard (`engine/src/algorithms.cpp:300-307`):*
    ```cpp
    if (source == destination) {
        result.path_exists = true;
        result.hop_count = 0;
        result.node_path = {source};
        return result;
    }
    ```
  - *Unreachability Guard (`engine/src/algorithms.cpp:339-343`):*
    When the while loop terminates because `q.empty()` is true and `reached == false`, the engine constructs:
    ```cpp
    result.path_exists = false;
    result.error_message = "No directed transmission path exists from '" + source + "' to '" + destination + "'.";
    ```
  This is proven in our automated C++ test suite `test_engine.cpp:189-216` where both cases are validated with passing assertions.
- **Source Code Anchor:** [`engine/src/algorithms.cpp:300-343`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/algorithms.cpp#L300-L343)
- **Teacher's Likely Follow-Up:** *"Can you show me this in the UI right now?"*
  - *Action:* Switch to dataset **"Disconnected Graph"**. Select Source `ACC_ALICE` and Destination `ACC_ISOLATED`. Click "Find Shortest Route". Point to the error message on screen: *"No directed transmission path exists from 'ACC_ALICE' to 'ACC_ISOLATED'."*
- **Critical Caveat:** Never let the application throw an unhandled exception or return null on unreachable nodes. It must return a valid structured result with `path_exists: false`.

---

## Category 3: Depth-First Search (DFS) & Directed Cycle Detection

### Q7 [Easy]: Why does DFS record discovery and finish timestamps?
- **15–30 Second Spoken Answer:**
  > *"DFS records discovery timestamps $d[u]$ when a node is first entered and finish timestamps $f[u]$ when all its outgoing branches have been completely explored. These timestamps satisfy the Parenthesis Theorem from CLRS: they prove ancestor-descendant relationships and allow topological sorting and classification of tree edges, back-edges, and cross-edges."*
- **Deep Technical Explanation:**
  A global integer `timer` increments at each event. For vertex $u$:
  1. When entered: `timer++`; `result.discovery_times[u] = timer;`
  2. After exploring all neighbors of $u$: `timer++`; `result.finish_times[u] = timer;`
  **Parenthesis Theorem (CLRS Theorem 22.7):**
  For any two vertices $u$ and $v$, the intervals $[d[u], f[u]]$ and $[d[v], f[v]]$ are either completely disjoint or one is completely nested within the other. If $[d[v], f[v]] \subset [d[u], f[u]]$, vertex $v$ is a descendant of $u$ in the DFS tree.
- **Source Code Anchor:** [`engine/src/algorithms.cpp:95-136`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/algorithms.cpp#L95-L136)
- **Teacher's Likely Follow-Up:** *"How does this help in cycle detection?"*
- **Critical Caveat:** The timers are logical discrete event counters, not physical wall-clock times (milliseconds).

---

### Q8 [Medium]: How does your engine detect directed cycles? Why does standard boolean visited tracking fail?
- **15–30 Second Spoken Answer:**
  > *"Standard boolean visited tracking fails in directed graphs because reaching an already-visited vertex via a cross-edge or forward-edge does not mean there is a cycle. For example, in a diamond graph $A \rightarrow B \rightarrow D$ and $A \rightarrow C \rightarrow D$, node $D$ is visited twice, but the graph is completely acyclic. We implement Three-State DFS using `WHITE`, `GRAY`, and `BLACK` node coloring. A directed cycle exists if and only if an edge points to a vertex that is currently `GRAY`—meaning it is active on the recursion call stack."*
- **Deep Technical Explanation:**
  In `engine/src/algorithms.cpp:168-235`:
  - `NodeColor::WHITE`: Unvisited vertex.
  - `NodeColor::GRAY`: Vertex discovered, currently being explored (active on the recursion call stack).
  - `NodeColor::BLACK`: Vertex and all outgoing paths fully explored.
  
  During DFS, for edge $(u, v)$:
  - If `color[v] == NodeColor::WHITE`: Tree edge. Recurse into $v$.
  - If `color[v] == NodeColor::BLACK`: Cross-edge or forward-edge. Safe! No cycle.
  - If `color[v] == NodeColor::GRAY`: **BACK-EDGE DETECTED!** Vertex $v$ is an active ancestor of $u$ on the call stack. Following this edge returns to an ancestor, completing a directed cycle.
- **Source Code Anchor:** [`engine/src/algorithms.cpp:168-235`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/algorithms.cpp#L168-L235)
- **Teacher's Likely Follow-Up:** *"How do you extract the actual nodes participating in the cycle?"*
  - *Answer:* *"We maintain a `path_stack` vector. When a back-edge to $v$ is found, we search `path_stack` for $v$, slice all elements from $v$ to $u$, and append $v$ to close the loop (e.g., $[P, Q, R, P]$)."*
- **Critical Caveat:** Do not say cycle detection proves fraud. Always state it flags potential round-tripping for investigative verification.

---

### Q9 [Difficult]: How does your cycle detection algorithm handle self-loops and disconnected components?
- **15–30 Second Spoken Answer:**
  > *"For disconnected components, our top-level loop iterates over all vertices in the graph; if any node remains `WHITE`, it initiates a new DFS traversal, ensuring no isolated sub-network is missed. For self-loops where an account sends funds to itself ($u \rightarrow u$), the engine detects $u == v$ while $u$ is `GRAY`, immediately flags it as a special single-node cycle with `is_self_loop = true`, records the single transaction, and avoids corrupting the multi-node `path_stack`."*
- **Deep Technical Explanation:**
  1. **Disconnected Forest Exploration (`algorithms.cpp:259-263`):**
     ```cpp
     for (const auto& acc_id : all_accounts) {
         if (color[acc_id] == NodeColor::WHITE) {
             dfsCycleHelper(graph, acc_id, color, path_stack, edge_stack, result.cycles);
         }
     }
     ```
     This guarantees $O(|V| + |E|)$ coverage of all weakly connected components.
  2. **Self-Loop Handling (`algorithms.cpp:186-192`):**
     ```cpp
     if (u == v) {
         cycle.is_self_loop = true;
         cycle.node_path = {u, u};
         cycle.transaction_ids = {tx.id};
         cycle.cycle_volume_paise = tx.amount_paise;
     }
     ```
     This prevents index-searching bugs on `path_stack` and accurately reports internal ledger transfers (such as `TX_SELF_01` on `ACC_INTERNAL_POOL`).
- **Source Code Anchor:** [`engine/src/algorithms.cpp:186-192, 259-263`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/algorithms.cpp#L186-L192)
- **Teacher's Likely Follow-Up:** *"Can a self-loop be part of a larger multi-node cycle?"*
  - *Answer:* *"A vertex can have both a self-loop and outgoing edges to other nodes. Our implementation separates the self-loop edge from tree edges, preventing the self-loop from terminating exploration of multi-node cycles."*
- **Critical Caveat:** Make sure to explain that self-loops trigger a `WARNING` severity finding rather than `HIGH`, because internal pool reclassifications are common in core banking systems.

---

## Category 4: Forensic Rules & Financial Logic

### Q10 [Easy]: What is an Intermediary Mule Node, and how is it detected in your code?
- **15–30 Second Spoken Answer:**
  > *"An intermediary mule node is an account that receives funds from one entity and forwards them to another, acting as a transit bridge in a layering scheme. In our C++ engine, it is detected in $O(1)$ time per vertex by checking if both in-degree $\ge 1$ and out-degree $\ge 1$. We then calculate the net retained funds: $\Delta = \sum \text{in} - \sum \text{out}$."*
- **Deep Technical Explanation:**
  In `engine/src/rules.cpp:30-89`, `runInvestigation()` iterates over all registered accounts:
  ```cpp
  int in_deg = graph.getInDegree(acc_id);
  int out_deg = graph.getOutDegree(acc_id);
  if (in_deg >= 1 && out_deg >= 1) {
      AmountPaise total_in = graph.getTotalIncomingPaise(acc_id);
      AmountPaise total_out = graph.getTotalOutgoingPaise(acc_id);
      AmountPaise diff = total_in - total_out;
      ...
  }
  ```
  If $\Delta > 0$, the mule retained a portion of funds (flagged as `WARNING` with exact rupee amount and percentage). If $\Delta == 0$, it is a 100% pass-through node.
- **Source Code Anchor:** [`engine/src/rules.cpp:30-89`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/rules.cpp#L30-L89)
- **Teacher's Likely Follow-Up:** *"Show me the intermediary mule in your benchmark dataset."*
  - *Action:* Select **"Fraud Investigation"** dataset. Point to `ACC_MULE_X` (Xavier Transit Agency). Explain: *"Alice sent ₹50,000 to Mule X; Mule X forwarded ₹42,000 to Target D, retaining exactly ₹8,000 or 16.0%."*
- **Critical Caveat:** Always clarify that retained funds can be legitimate processing fees or taxes; it is an investigative signal, not proof of guilt.

---

### Q11 [Medium]: How does the Route Discrepancy rule work?
- **15–30 Second Spoken Answer:**
  > *"The Route Discrepancy rule evaluates multi-hop paths of $\ge 2$ hops discovered by BFS. It compares the monetary amount disbursed in the very first transaction against the amount received in the final settlement transaction. If there is a difference, it calculates the net leakage along the entire chain and flags it as a `HIGH` severity finding."*
- **Deep Technical Explanation:**
  In `engine/src/rules.cpp:92-142`:
  When a source and destination are investigated and BFS finds a valid path with `hop_count >= 2`:
  ```cpp
  const auto& first_tx = report.route_result.transactions.front();
  const auto& last_tx = report.route_result.transactions.back();
  AmountPaise route_diff = first_tx.amount_paise - last_tx.amount_paise;
  ```
  In our benchmark, Alice originates transfer `TX_CHAIN_01` for ₹50,000. Target D receives `TX_CHAIN_02` for ₹42,000. The route discrepancy is ₹8,000 (16.0%).
- **Source Code Anchor:** [`engine/src/rules.cpp:92-142`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/rules.cpp#L92-L142)
- **Teacher's Likely Follow-Up:** *"What if the path has 4 hops with multiple mules retaining small amounts?"*
  - *Answer:* *"The Route Discrepancy rule captures the net macro-leakage end-to-end between origin and target, while the Intermediary Mule rule flags the individual micro-retentions at each intermediate node."*
- **Critical Caveat:** If the path has only 1 hop (direct transfer), this rule is skipped because there are no intermediate hops to introduce discrepancies.

---

### Q12 [Difficult]: Why is it critical to provide a 'Neutral / Non-Fraud Explanation' for every flagged rule?
- **15–30 Second Spoken Answer:**
  > *"In real-world financial compliance and academic software design, false positives are a major risk. Flagging an account as 'definitely fraudulent' simply because it retained funds or participated in a cycle exposes banks to legal liability and customer harm. Legitimate transactions regularly display these exact patterns: processing fees, tax withholdings, affiliate trade netting, and corporate sweeps. Providing neutral alternative hypotheses ensures the system acts as an objective decision-support tool rather than an automated accuser."*
- **Deep Technical Explanation:**
  Every `RuleFinding` struct in `engine/src/rules.hpp:22` includes:
  ```cpp
  std::string neutral_explanation;
  ```
  For example, for `RULE_CIRCULAR_ROUTING`:
  > *"Directed cycles reflect circular routing of funds. While circular patterns are monitored for round-tripping or artificial volume inflation, legitimate commercial causes include multilateral netting between corporate affiliates, refund reconciliations, and liquidity rebalancing."*
  This is rendered prominently in the UI findings drawer inside a dedicated informational card.
- **Source Code Anchor:** [`engine/src/rules.cpp:82-87, 135-139, 174-178`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/src/rules.cpp#L82-L87)
- **Teacher's Likely Follow-Up:** *"Could you train an AI model to classify whether a cycle is fraud or not?"*
  - *Answer:* *"Yes, using a Graph Neural Network (GNN) trained on labeled historic SAR (Suspicious Activity Report) data. However, for this core DSA project, our goal was deterministic algorithmic transparency and explainability rather than black-box statistical inference."*
- **Critical Caveat:** Never tell an examiner that your software 'proves' fraud. Always say it 'surfaces structural anomalies with supporting evidence'.

---

## Category 5: Architecture, Integration & Testing

### Q13 [Easy]: How does the frontend communicate with the C++ engine?
- **15–30 Second Spoken Answer:**
  > *"The frontend communicates with an Express.js Node backend via REST API calls over HTTP. When an algorithm is requested, the backend spawns the compiled C++17 binary as a child process using `child_process.spawn()`, streams the current graph as JSON into the engine's `stdin`, and reads the resulting JSON analysis from `stdout`. This keeps the C++ core stateless, fast, and completely decoupled from the web layer."*
- **Deep Technical Explanation:**
  In `backend/src/engineBridge.js:57-115`:
  ```javascript
  const child = spawn(ENGINE_BIN, [], { cwd: ENGINE_DIR, stdio: ['pipe', 'pipe', 'pipe'] });
  child.stdin.write(JSON.stringify(payload));
  child.stdin.end();
  child.stdout.on('data', (chunk) => { stdoutData += chunk; });
  ```
  Security protections implemented:
  1. **Zero Shell Interpolation:** Uses `spawn()` with direct arguments array rather than `exec()`, eliminating command injection vulnerabilities.
  2. **Execution Timeout:** An 8,000ms safety timer kills the child process if an algorithm hangs.
  3. **Streaming JSON:** Avoids temporary disk files; data is transferred entirely through memory pipes.
- **Source Code Anchor:** [`backend/src/engineBridge.js:57-115`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/backend/src/engineBridge.js#L57-L115)
- **Teacher's Likely Follow-Up:** *"Why didn't you use WebAssembly or C++ Node N-API addons?"*
  - *Answer:* *"A native standalone CLI engine allowed us to write comprehensive C++ unit test suites using standard Makefiles (`make test`) without requiring Node.js. It also demonstrates operating system process management, standard I/O streams, and inter-process communication (IPC)."*
- **Critical Caveat:** Do not say the frontend talks directly to C++. It talks to Express, which bridges to C++.

---

### Q14 [Medium]: What happens when an account is deleted in the Custom Lab? How are edges handled?
- **15–30 Second Spoken Answer:**
  > *"When an account is deleted, the backend performs a cascading cleanup: it removes the account from the account array and immediately purges all incident transactions where that account was either the sender (`from_account`) or the receiver (`to_account`). This guarantees graph referential integrity, preventing dangling edges and orphan references."*
- **Deep Technical Explanation:**
  In `backend/src/routes.js:202-225`:
  ```javascript
  // Remove account
  currentDataset.accounts = currentDataset.accounts.filter(a => a.id !== accountId);

  // Cascade delete incident transactions
  currentDataset.transactions = currentDataset.transactions.filter(
    t => t.from_account !== accountId && t.to_account !== accountId
  );
  ```
  In graph theory, deleting a vertex $v \in V$ must remove all edges $e = (u, v)$ or $e = (v, w)$ incident to $v$. If incident edges were retained, subsequent traversals would attempt to access non-existent nodes, causing null pointer exceptions or broken paths.
- **Source Code Anchor:** [`backend/src/routes.js:216-218`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/backend/src/routes.js#L216-L218)
- **Teacher's Likely Follow-Up:** *"Can you demonstrate deleting an account live?"*
  - *Action:* In **Custom Lab**, select node `ACC_BETA` and click "Delete Account". Point to the canvas: `ACC_BETA` disappears, both incident transactions disappear, and any active cycle is broken.
- **Critical Caveat:** Verify you explain that predefined benchmark datasets cannot be permanently corrupted by deletions—the "Reset" button always restores them cleanly.

---

### Q15 [Difficult]: What automated test suites exist in the repository, and how do they prove correctness?
- **15–30 Second Spoken Answer:**
  > *"Our repository features a four-tier automated testing pyramid with 100% pass rates:
  > 1. Native C++ Unit Suite (`test_engine.cpp`): 92 assertions verifying graph construction, degree invariants, empty graphs, BFS queues, DFS timestamps, cycle detection, and self-loops.
  > 2. API & Algorithm Regression Suite (`test_e2e.js`): Validates shortest path, cycles, and mule findings over HTTP.
  > 3. Dataset Integration Suite (`test_all_datasets.js`): 36 assertions testing all 5 prebuilt datasets.
  > 4. Custom Lab Mutation Suite (`test_custom_lab.js`): Validates blank canvas isolation, dynamic cycle creation, and cascading edge deletions."*
- **Deep Technical Explanation:**
  All four suites can be executed deterministically in seconds:
  ```bash
  make -C engine test       # 92/92 assertions passed
  node test_e2e.js          # All pipeline checks passed
  node test_all_datasets.js # 36/36 assertions passed
  node test_custom_lab.js   # All custom lab assertions passed
  ```
  These tests verify formal invariants:
  - Empty graph handling (does not segfault).
  - Parenthesis theorem nesting ($[d[v], f[v]] \subset [d[u], f[u]]$).
  - Unweighted shortest-path hop counts.
  - Multi-path resolution and unreachable destination error handling.
- **Source Code Anchor:** [`engine/tests/test_engine.cpp`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/engine/tests/test_engine.cpp), [`test_e2e.js`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/test_e2e.js), [`test_all_datasets.js`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/test_all_datasets.js), [`test_custom_lab.js`](file:///Users/jeedijoshua/Documents/2nd%20Year/ODD%20SEM/DSA/MP/test_custom_lab.js)
- **Teacher's Likely Follow-Up:** *"Run the C++ unit test suite in front of me right now."*
  - *Action:* Open terminal, run `make -C engine test`, and show the output: `Summary: 92/92 assertions passed. ALL TESTS PASSED SUCCESSFULLY!`.
- **Critical Caveat:** Never claim a test passed unless you can run it live in the terminal and show the green output.

---

## Category 6: 20 Quick-Fire Viva Exam Questions

| # | Examiner Question | Recommended Quick Answer | Key DSA Concept |
| :---: | :--- | :--- | :--- |
| **1** | *"What is the time complexity of BFS?"* | "$O(\|V\| + \|E\|)$ time because every vertex is enqueued at most once and every directed edge is traversed once." | Linear Graph Traversal |
| **2** | *"What is the space complexity of BFS?"* | "$O(\|V\|)$ space to store the FIFO queue, visited boolean map, and distance map." | Auxiliary Memory |
| **3** | *"Can BFS find shortest paths in weighted graphs?"* | "No. BFS only finds shortest paths in unweighted graphs. For weighted graphs, we must use Dijkstra's or Bellman-Ford algorithm." | Edge Weights |
| **4** | *"What data structure does DFS use?"* | "An implicit recursion call stack (or an explicit `std::stack`), operating in LIFO order." | Call Stack / LIFO |
| **5** | *"What is the difference between a back-edge and a cross-edge?"* | "A back-edge points to an active ancestor currently on the recursion stack (`GRAY`), indicating a cycle. A cross-edge points to an already-completed vertex (`BLACK`) with no ancestor relation." | Edge Classification |
| **6** | *"What is the in-degree of an isolated vertex?"* | "0 in-degree and 0 out-degree." | Degree Invariants |
| **7** | *"What is a DAG?"* | "A Directed Acyclic Graph—a directed graph containing zero directed cycles." | Graph Classification |
| **8** | *"How do you test if a graph is a DAG?"* | "Run Three-State DFS. If zero back-edges are found, the graph is a DAG. It can also be verified using Kahn's topological sort." | Topological Sorting |
| **9** | *"What happens if an account transfers money to itself?"* | "It forms a self-loop. Our engine flags it as a 1-node cycle with `is_self_loop = true`." | Graph Self-Loops |
| **10** | *"Why is the Adjacency List sorted in your C++ code?"* | "To ensure deterministic, reproducible traversal orders across different platforms and runs." | Algorithmic Determinism |
| **11** | *"What is the time complexity of cycle detection?"* | "$O(\|V\| + \|E\|)$ time using Three-State DFS." | Linear Time Complexity |
| **12** | *"What is the Parenthesis Theorem?"* | "In DFS, discovery and finish intervals $[d[u], f[u]]$ and $[d[v], f[v]]$ are either completely disjoint or strictly nested, proving ancestry." | CLRS Theorem 22.7 |
| **13** | *"What is the space complexity of an Adjacency Matrix?"* | "$O(\|V\|^2)$, which is wasteful for sparse financial graphs." | Memory Allocation |
| **14** | *"How does FraudGraph handle disconnected graphs?"* | "The top-level loop iterates over all vertices, launching fresh traversals for unvisited nodes, covering all components." | Forest Traversal |
| **15** | *"Can a disconnected node be reached by BFS?"* | "No. BFS terminates when the component's queue empties, reporting `path_exists: false`." | Reachability |
| **16** | *"Why are amounts stored in integer paise?"* | "To prevent IEEE-754 floating-point rounding drift and ensure exact financial reconciliation." | Financial Precision |
| **17** | *"What is the time complexity of deleting an account?"* | "$O(\|V\| + \|E\|)$ to filter the account array and remove incident transactions." | Dynamic Graph Mutation |
| **18** | *"What is an intermediary node?"* | "A node with $\text{deg}^- \ge 1$ and $\text{deg}^+ \ge 1$, acting as a transit bridge." | Topological Roles |
| **19** | *"Does cycle detection prove criminal fraud?"* | "No. It flags circular fund routing. Legitimate causes include multilateral affiliate netting and liquidity sweeps." | Forensic Ethics & Truth |
| **20** | *"How does the C++ engine exchange data with Node.js?"* | "Via standard I/O streams: JSON payload over `stdin`, and result JSON over `stdout` using `child_process.spawn()`." | IPC / Stream Processing |
