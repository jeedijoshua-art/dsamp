#include "../src/graph.hpp"
#include "../src/algorithms.hpp"
#include "../src/rules.hpp"
#include <iostream>
#include <cassert>
#include <string>
#include <vector>

using namespace fraudgraph;

static int tests_run = 0;
static int tests_passed = 0;

#define TEST_ASSERT(cond, msg) \
    do { \
        tests_run++; \
        if (!(cond)) { \
            std::cerr << "  [FAIL] " << msg << " (" << __FILE__ << ":" << __LINE__ << ")" << std::endl; \
        } else { \
            tests_passed++; \
            std::cout << "  [PASS] " << msg << std::endl; \
        } \
    } while (0)

void testGraphConstruction() {
    std::cout << "\n--- Testing Graph Construction & In/Out Degrees ---" << std::endl;
    DirectedGraph g;
    g.addAccount(Account("ACC_1", "Account One", "Personal"));
    g.addAccount(Account("ACC_2", "Account Two", "Merchant"));
    
    std::string err;
    bool ok1 = g.addTransaction(Transaction("TX_1", "ACC_1", "ACC_2", 150000, "2026-10-25T10:00:00Z"), &err);
    TEST_ASSERT(ok1, "Add directed transaction ACC_1 -> ACC_2");
    TEST_ASSERT(g.getAccountCount() == 2, "Account count is 2");
    TEST_ASSERT(g.getTransactionCount() == 1, "Transaction count is 1");
    TEST_ASSERT(g.getOutDegree("ACC_1") == 1, "Out-degree of ACC_1 is 1");
    TEST_ASSERT(g.getInDegree("ACC_1") == 0, "In-degree of ACC_1 is 0");
    TEST_ASSERT(g.getOutDegree("ACC_2") == 0, "Out-degree of ACC_2 is 0");
    TEST_ASSERT(g.getInDegree("ACC_2") == 1, "In-degree of ACC_2 is 1");
    TEST_ASSERT(g.getTotalVolumePaise() == 150000, "Total volume in paise is 150000");

    // Reject duplicate transaction ID
    bool ok_dup = g.addTransaction(Transaction("TX_1", "ACC_1", "ACC_2", 50000), &err);
    TEST_ASSERT(!ok_dup, "Duplicate transaction ID rejected");
}

void testEmptyGraph() {
    std::cout << "\n--- Testing Empty Graph Handling ---" << std::endl;
    DirectedGraph g;
    TEST_ASSERT(g.getAccountCount() == 0, "Empty graph has 0 accounts");
    TEST_ASSERT(g.getTransactionCount() == 0, "Empty graph has 0 transactions");
    TEST_ASSERT(g.getAllAccountIds().empty(), "Account list is empty");

    auto bfs = runBFS(g, "ANY_NODE");
    TEST_ASSERT(!bfs.success, "BFS on empty graph returns success=false");

    auto dfs = runDFS(g, "ANY_NODE");
    TEST_ASSERT(!dfs.success, "DFS on empty graph returns success=false");

    auto cyc = detectDirectedCycles(g);
    TEST_ASSERT(!cyc.has_cycle, "Empty graph has no cycles");
}

void testMissingAccounts() {
    std::cout << "\n--- Testing Missing / Nonexistent Accounts ---" << std::endl;
    DirectedGraph g;
    g.addAccount(Account("ACC_VALID", "Valid Account"));

    auto bfs = runBFS(g, "ACC_NONEXISTENT");
    TEST_ASSERT(!bfs.success, "BFS fails gracefully for nonexistent start account");

    auto dfs = runDFS(g, "ACC_NONEXISTENT");
    TEST_ASSERT(!dfs.success, "DFS fails gracefully for nonexistent start account");

    auto sp = findShortestPathBFS(g, "ACC_VALID", "ACC_NONEXISTENT");
    TEST_ASSERT(!sp.success && !sp.path_exists, "Shortest path fails gracefully for nonexistent destination");

    auto sp2 = findShortestPathBFS(g, "ACC_NONEXISTENT", "ACC_VALID");
    TEST_ASSERT(!sp2.success && !sp2.path_exists, "Shortest path fails gracefully for nonexistent source");
}

void testBFSBranching() {
    std::cout << "\n--- Testing BFS on Branching Tree ---" << std::endl;
    DirectedGraph g;
    // Hub -> B1, Hub -> B2
    // B1 -> C1, B1 -> C2
    // B2 -> D1, B2 -> D2
    g.addTransaction(Transaction("TX_H_B1", "Hub", "B1", 1000));
    g.addTransaction(Transaction("TX_H_B2", "Hub", "B2", 1000));
    g.addTransaction(Transaction("TX_B1_C1", "B1", "C1", 1000));
    g.addTransaction(Transaction("TX_B1_C2", "B1", "C2", 1000));
    g.addTransaction(Transaction("TX_B2_D1", "B2", "D1", 1000));
    g.addTransaction(Transaction("TX_B2_D2", "B2", "D2", 1000));

    auto bfs = runBFS(g, "Hub");
    TEST_ASSERT(bfs.success, "BFS succeeds on branching tree");
    TEST_ASSERT(bfs.traversal_order.size() == 7, "BFS visits all 7 nodes");
    TEST_ASSERT(bfs.traversal_order[0] == "Hub", "Root is first in BFS");
    // Level 1 nodes must precede Level 2 nodes
    TEST_ASSERT(bfs.distances["Hub"] == 0, "Hub distance is 0");
    TEST_ASSERT(bfs.distances["B1"] == 1 && bfs.distances["B2"] == 1, "Level 1 nodes have distance 1");
    TEST_ASSERT(bfs.distances["C1"] == 2 && bfs.distances["C2"] == 2 && 
                bfs.distances["D1"] == 2 && bfs.distances["D2"] == 2, "Level 2 nodes have distance 2");
    TEST_ASSERT(bfs.steps.size() == 7, "BFS records exactly 7 execution trace steps");
    TEST_ASSERT(bfs.steps[0].current_node == "Hub", "BFS step 1 is root node Hub");
    TEST_ASSERT(bfs.steps[0].visited_so_far.size() == 1, "BFS step 1 visited_so_far has size 1");
}

void testDFSBranching() {
    std::cout << "\n--- Testing DFS Traversal & Discovery/Finish Times ---" << std::endl;
    DirectedGraph g;
    g.addTransaction(Transaction("TX_A_B", "A", "B", 1000));
    g.addTransaction(Transaction("TX_B_C", "B", "C", 1000));

    auto dfs = runDFS(g, "A");
    TEST_ASSERT(dfs.success, "DFS succeeds on path graph");
    TEST_ASSERT(dfs.traversal_order.size() == 3, "DFS visits all 3 nodes");
    TEST_ASSERT(dfs.discovery_times["A"] < dfs.discovery_times["B"], "A discovered before B");
    TEST_ASSERT(dfs.discovery_times["B"] < dfs.discovery_times["C"], "B discovered before C");
    TEST_ASSERT(dfs.finish_times["C"] < dfs.finish_times["B"], "C finishes before B");
    TEST_ASSERT(dfs.finish_times["B"] < dfs.finish_times["A"], "B finishes before A (parenthesis theorem)");
    TEST_ASSERT(dfs.steps.size() == 3, "DFS records exactly 3 execution trace steps");
    TEST_ASSERT(dfs.steps[0].current_node == "A", "DFS step 1 is start node A");
}

void testCycleDetectionCyclic() {
    std::cout << "\n--- Testing Directed Cycle Detection (Cyclic Graph) ---" << std::endl;
    DirectedGraph g;
    // P -> Q -> R -> P
    g.addTransaction(Transaction("TX_P_Q", "P", "Q", 2500000));
    g.addTransaction(Transaction("TX_Q_R", "Q", "R", 2500000));
    g.addTransaction(Transaction("TX_R_P", "R", "P", 2500000));

    auto cyc = detectDirectedCycles(g);
    TEST_ASSERT(cyc.has_cycle, "Directed cycle successfully detected");
    TEST_ASSERT(cyc.cycles.size() >= 1, "At least 1 cycle reconstructed");
    
    const auto& c = cyc.cycles[0];
    TEST_ASSERT(c.node_path.front() == c.node_path.back(), "Cycle path starts and ends at same node");
    TEST_ASSERT(c.node_path.size() == 4, "Cycle has 3 distinct nodes plus closing node");
    TEST_ASSERT(c.cycle_volume_paise == 7500000, "Cycle volume correctly calculated (7,500,000 paise)");
}

void testCycleDetectionAcyclic() {
    std::cout << "\n--- Testing Directed Cycle Detection (Acyclic DAG) ---" << std::endl;
    DirectedGraph g;
    // Diamond DAG: S -> A, S -> B, A -> T, B -> T
    g.addTransaction(Transaction("TX_S_A", "S", "A", 1000));
    g.addTransaction(Transaction("TX_S_B", "S", "B", 1000));
    g.addTransaction(Transaction("TX_A_T", "A", "T", 1000));
    g.addTransaction(Transaction("TX_B_T", "B", "T", 1000));

    auto cyc = detectDirectedCycles(g);
    TEST_ASSERT(!cyc.has_cycle, "Diamond DAG correctly reported with NO cycles");
    TEST_ASSERT(cyc.cycles.empty(), "Zero cycles reconstructed on DAG");
}

void testSelfLoop() {
    std::cout << "\n--- Testing Self-Loop Handling ---" << std::endl;
    DirectedGraph g;
    g.addTransaction(Transaction("TX_SELF", "ACC_LOOP", "ACC_LOOP", 50000));

    auto cyc = detectDirectedCycles(g);
    TEST_ASSERT(cyc.has_cycle, "Self-loop detected as a cycle");
    TEST_ASSERT(cyc.cycles.size() == 1, "Exactly 1 cycle found");
    TEST_ASSERT(cyc.cycles[0].is_self_loop, "Cycle marked as is_self_loop");
    TEST_ASSERT(cyc.cycles[0].node_path.size() == 2, "Self loop node path has size 2 [ACC_LOOP, ACC_LOOP]");
}

void testShortestPathTwoHop() {
    std::cout << "\n--- Regression Test: Two-Hop Shortest Path (ACC_ALICE -> ACC_MULE_X -> ACC_TARGET_D) ---" << std::endl;
    DirectedGraph g;
    g.addTransaction(Transaction("TX_CHAIN_01", "ACC_ALICE", "ACC_MULE_X", 5000000));
    g.addTransaction(Transaction("TX_CHAIN_02", "ACC_MULE_X", "ACC_TARGET_D", 4200000));

    auto sp = findShortestPathBFS(g, "ACC_ALICE", "ACC_TARGET_D");
    TEST_ASSERT(sp.success, "Two-hop BFS query succeeded");
    TEST_ASSERT(sp.path_exists, "Path exists between ACC_ALICE and ACC_TARGET_D");
    TEST_ASSERT(sp.source == "ACC_ALICE", "Source matches ACC_ALICE");
    TEST_ASSERT(sp.destination == "ACC_TARGET_D", "Destination matches ACC_TARGET_D");
    TEST_ASSERT(sp.hop_count == 2, "Hop count is exactly 2");
    
    std::vector<std::string> expected_nodes = {"ACC_ALICE", "ACC_MULE_X", "ACC_TARGET_D"};
    TEST_ASSERT(sp.node_path == expected_nodes, "Reconstructed path is ACC_ALICE -> ACC_MULE_X -> ACC_TARGET_D");
    
    std::vector<std::string> expected_txs = {"TX_CHAIN_01", "TX_CHAIN_02"};
    TEST_ASSERT(sp.transaction_ids == expected_txs, "Transaction IDs match TX_CHAIN_01 and TX_CHAIN_02");
    TEST_ASSERT(sp.total_volume_paise == 9200000, "Total volume along 2-hop path is 9,200,000 paise (₹92,000)");
}

void testShortestPathOneHop() {
    std::cout << "\n--- Regression Test: Direct One-Hop Shortest Path (ACC_ALICE -> ACC_MULE_X) ---" << std::endl;
    DirectedGraph g;
    g.addTransaction(Transaction("TX_CHAIN_01", "ACC_ALICE", "ACC_MULE_X", 5000000));
    g.addTransaction(Transaction("TX_CHAIN_02", "ACC_MULE_X", "ACC_TARGET_D", 4200000));

    auto sp = findShortestPathBFS(g, "ACC_ALICE", "ACC_MULE_X");
    TEST_ASSERT(sp.success, "Direct one-hop query succeeded");
    TEST_ASSERT(sp.path_exists, "Direct path exists");
    TEST_ASSERT(sp.source == "ACC_ALICE", "Source matches ACC_ALICE");
    TEST_ASSERT(sp.destination == "ACC_MULE_X", "Destination matches ACC_MULE_X");
    TEST_ASSERT(sp.hop_count == 1, "Hop count is exactly 1");
    
    std::vector<std::string> expected_nodes = {"ACC_ALICE", "ACC_MULE_X"};
    TEST_ASSERT(sp.node_path == expected_nodes, "Reconstructed path is ACC_ALICE -> ACC_MULE_X");
    
    std::vector<std::string> expected_txs = {"TX_CHAIN_01"};
    TEST_ASSERT(sp.transaction_ids == expected_txs, "Transaction ID is TX_CHAIN_01");
}

void testShortestPathUnreachable() {
    std::cout << "\n--- Regression Test: Unreachable Destination (ACC_ALICE -> ACC_ISOLATED) ---" << std::endl;
    DirectedGraph g;
    g.addAccount(Account("ACC_ALICE", "Alice Corp"));
    g.addAccount(Account("ACC_ISOLATED", "Isolated Reserve"));

    auto sp = findShortestPathBFS(g, "ACC_ALICE", "ACC_ISOLATED");
    TEST_ASSERT(sp.success, "Query completed without crash");
    TEST_ASSERT(!sp.path_exists, "Path exists is false for unreachable node");
    TEST_ASSERT(sp.hop_count == 0, "Hop count is 0 when unreachable");
    TEST_ASSERT(sp.node_path.empty(), "Node path is empty when unreachable");
    TEST_ASSERT(!sp.error_message.empty(), "Informative error message returned for unreachable destination");
}

void testShortestPathSourceEqualsDestination() {
    std::cout << "\n--- Regression Test: Source Equal to Destination (ACC_ALICE -> ACC_ALICE) ---" << std::endl;
    DirectedGraph g;
    g.addAccount(Account("ACC_ALICE", "Alice Corp"));

    auto sp = findShortestPathBFS(g, "ACC_ALICE", "ACC_ALICE");
    TEST_ASSERT(sp.success, "Self-query completed successfully");
    TEST_ASSERT(sp.path_exists, "Path exists is true for source == destination");
    TEST_ASSERT(sp.hop_count == 0, "Hop count is 0 for identity path");
    std::vector<std::string> expected_nodes = {"ACC_ALICE"};
    TEST_ASSERT(sp.node_path == expected_nodes, "Node path contains single vertex [ACC_ALICE]");
    TEST_ASSERT(sp.transaction_ids.empty(), "Zero transaction edges traversed");
    TEST_ASSERT(sp.total_volume_paise == 0, "Zero volume traversed for identity path");
}


void testDisconnectedAccount() {
    std::cout << "\n--- Testing Disconnected Account ---" << std::endl;
    DirectedGraph g;
    g.addAccount(Account("CONNECTED_1", "Conn 1"));
    g.addAccount(Account("CONNECTED_2", "Conn 2"));
    g.addAccount(Account("DISCONNECTED", "Isolated Node"));
    g.addTransaction(Transaction("TX_1", "CONNECTED_1", "CONNECTED_2", 10000));

    TEST_ASSERT(g.isDisconnected("DISCONNECTED"), "Account identified as disconnected");
    TEST_ASSERT(!g.isDisconnected("CONNECTED_1"), "CONNECTED_1 is not disconnected");

    auto bfs = runBFS(g, "DISCONNECTED");
    TEST_ASSERT(bfs.success, "BFS on disconnected account succeeds");
    TEST_ASSERT(bfs.traversal_order.size() == 1, "BFS on disconnected account only visits itself");
    TEST_ASSERT(bfs.traversal_order[0] == "DISCONNECTED", "Visited node is DISCONNECTED");
}

void testRepeatedTransfers() {
    std::cout << "\n--- Testing Repeated Transfers Between Same Pair ---" << std::endl;
    DirectedGraph g;
    g.addTransaction(Transaction("TX_REP_1", "Sender", "Receiver", 1500000));
    g.addTransaction(Transaction("TX_REP_2", "Sender", "Receiver", 1500000));

    TEST_ASSERT(g.getTransactionCount() == 2, "Both transactions registered");
    TEST_ASSERT(g.getOutDegree("Sender") == 2, "Sender out-degree is 2");
    TEST_ASSERT(g.getInDegree("Receiver") == 2, "Receiver in-degree is 2");
    TEST_ASSERT(g.getTotalVolumePaise() == 3000000, "Volume reflects both transfers (3,000,000 paise)");
}

void testRuleInvestigation() {
    std::cout << "\n--- Testing Rule-Based Investigation & Amount Discrepancy ---" << std::endl;
    DirectedGraph g;
    // Alice -> Mule (50,000 INR = 5,000,000 paise)
    // Mule -> Target (42,000 INR = 4,200,000 paise) -> 8,000 INR discrepancy
    g.addTransaction(Transaction("TX_A_M", "Alice", "Mule", 5000000));
    g.addTransaction(Transaction("TX_M_T", "Mule", "Target", 4200000));

    auto rep = runInvestigation(g, "Alice", "Target");
    TEST_ASSERT(rep.total_findings >= 1, "Findings generated");

    bool found_intermediary = false;
    bool found_route_discrepancy = false;

    for (const auto& f : rep.findings) {
        if (f.rule_id == "RULE_INTERMEDIARY_MULE" && f.flagged_accounts[0] == "Mule") {
            found_intermediary = true;
            TEST_ASSERT(f.amount_in_paise == 5000000, "Intermediary incoming paise is 5,000,000");
            TEST_ASSERT(f.amount_out_paise == 4200000, "Intermediary outgoing paise is 4,200,000");
            TEST_ASSERT(f.discrepancy_paise == 800000, "Intermediary discrepancy is exactly 800,000 paise (₹8,000)");
            TEST_ASSERT(f.discrepancy_pct > 15.9 && f.discrepancy_pct < 16.1, "Retention percentage is ~16.0%");
            TEST_ASSERT(!f.neutral_explanation.empty(), "Neutral non-fraud explanation is provided");
        }
        if (f.rule_id == "RULE_ROUTE_DISCREPANCY") {
            found_route_discrepancy = true;
            TEST_ASSERT(f.discrepancy_paise == 800000, "Route discrepancy is 800,000 paise");
            TEST_ASSERT(f.severity == "HIGH", "Route discrepancy has HIGH severity");
        }
    }

    TEST_ASSERT(found_intermediary, "RULE_INTERMEDIARY_MULE triggered for Mule account");
    TEST_ASSERT(found_route_discrepancy, "RULE_ROUTE_DISCREPANCY triggered for Alice -> Target route");
}

void testBfsVsDfsDisparity() {
    std::cout << "\n--- Testing BFS vs DFS Traversal Disparity on Branching Graph ---" << std::endl;
    DirectedGraph g;
    // Root S with two branches:
    // Branch 1 (Deep): S -> M -> T -> H -> B
    // Branch 2 (Shallow): S -> V
    // Disconnected: ISO
    g.addAccount(Account("S", "Source Root"));
    g.addAccount(Account("M", "Mule Node"));
    g.addAccount(Account("T", "Target Node"));
    g.addAccount(Account("H", "Hub Node"));
    g.addAccount(Account("B", "Branch Node"));
    g.addAccount(Account("V", "Vendor Node"));
    g.addAccount(Account("ISO", "Isolated Node"));

    // Lexicographical neighbor order from S: 'M' < 'V'
    g.addTransaction(Transaction("TX_SM", "S", "M", 5000));
    g.addTransaction(Transaction("TX_SV", "S", "V", 3000));
    g.addTransaction(Transaction("TX_MT", "M", "T", 4200));
    g.addTransaction(Transaction("TX_TH", "T", "H", 3500));
    g.addTransaction(Transaction("TX_HB", "H", "B", 2000));

    auto bfs = runBFS(g, "S");
    auto dfs = runDFS(g, "S");

    TEST_ASSERT(bfs.success, "BFS succeeded on branching graph");
    TEST_ASSERT(dfs.success, "DFS succeeded on branching graph");

    // 1. Visited counts match (6 reachable nodes)
    TEST_ASSERT(bfs.traversal_order.size() == 6, "BFS visits exactly 6 reachable nodes");
    TEST_ASSERT(dfs.traversal_order.size() == 6, "DFS visits exactly 6 reachable nodes");

    // 2. Traversal orders must differ
    TEST_ASSERT(bfs.traversal_order != dfs.traversal_order, "BFS and DFS traversal orders differ on branching graph");

    // 3. BFS visits in strictly non-decreasing hop distance
    bool non_decreasing_hops = true;
    for (size_t i = 1; i < bfs.traversal_order.size(); ++i) {
        int d_prev = bfs.distances[bfs.traversal_order[i - 1]];
        int d_curr = bfs.distances[bfs.traversal_order[i]];
        if (d_curr < d_prev) {
            non_decreasing_hops = false;
            break;
        }
    }
    TEST_ASSERT(non_decreasing_hops, "BFS visits vertices in strictly non-decreasing hop distance");

    // 4. BFS visits shallow neighbor V at distance 1 before deeper nodes T (dist 2), H (dist 3), B (dist 4)
    auto it_bfs_v = std::find(bfs.traversal_order.begin(), bfs.traversal_order.end(), "V");
    auto it_bfs_t = std::find(bfs.traversal_order.begin(), bfs.traversal_order.end(), "T");
    auto it_bfs_b = std::find(bfs.traversal_order.begin(), bfs.traversal_order.end(), "B");
    TEST_ASSERT(it_bfs_v < it_bfs_t, "BFS visits V (dist 1) before T (dist 2)");
    TEST_ASSERT(it_bfs_t < it_bfs_b, "BFS visits T (dist 2) before B (dist 4)");

    // 5. DFS follows branch deeply (S -> M -> T -> H -> B) before backtracking to V
    auto it_dfs_b = std::find(dfs.traversal_order.begin(), dfs.traversal_order.end(), "B");
    auto it_dfs_v = std::find(dfs.traversal_order.begin(), dfs.traversal_order.end(), "V");
    TEST_ASSERT(it_dfs_b < it_dfs_v, "DFS visits deep leaf B before backtracking to shallow branch V");

    // 6. DFS Parenthesis Theorem verification: B is descendant of M -> [d[B], f[B]] inside [d[M], f[M]]
    int d_m = dfs.discovery_times["M"];
    int f_m = dfs.finish_times["M"];
    int d_b = dfs.discovery_times["B"];
    int f_b = dfs.finish_times["B"];
    TEST_ASSERT(d_m < d_b && f_b < f_m, "DFS Parenthesis Theorem verified: [d[B], f[B]] is strictly nested within [d[M], f[M]]");

    // 7. BFS and DFS return the exact same reachable vertex set
    std::set<std::string> bfs_set(bfs.traversal_order.begin(), bfs.traversal_order.end());
    std::set<std::string> dfs_set(dfs.traversal_order.begin(), dfs.traversal_order.end());
    TEST_ASSERT(bfs_set == dfs_set, "BFS and DFS return the exact same reachable vertex set");

    // 8. Disconnected node ISO is never reached
    TEST_ASSERT(bfs_set.find("ISO") == bfs_set.end(), "Disconnected node ISO not reached by BFS");
    TEST_ASSERT(dfs_set.find("ISO") == dfs_set.end(), "Disconnected node ISO not reached by DFS");
}

int main() {
    std::cout << "==========================================================" << std::endl;
    std::cout << "   FraudGraph C++17 Core Engine - Automated Test Suite    " << std::endl;
    std::cout << "==========================================================" << std::endl;

    testGraphConstruction();
    testEmptyGraph();
    testMissingAccounts();
    testBFSBranching();
    testDFSBranching();
    testBfsVsDfsDisparity();
    testCycleDetectionCyclic();
    testCycleDetectionAcyclic();
    testSelfLoop();
    testShortestPathTwoHop();
    testShortestPathOneHop();
    testShortestPathUnreachable();
    testShortestPathSourceEqualsDestination();
    testDisconnectedAccount();
    testRepeatedTransfers();
    testRuleInvestigation();

    std::cout << "\n==========================================================" << std::endl;
    std::cout << "   Summary: " << tests_passed << "/" << tests_run << " assertions passed." << std::endl;
    std::cout << "==========================================================" << std::endl;

    if (tests_passed == tests_run) {
        std::cout << "ALL TESTS PASSED SUCCESSFULLY!" << std::endl;
        return 0;
    } else {
        std::cerr << "SOME TESTS FAILED!" << std::endl;
        return 1;
    }
}
