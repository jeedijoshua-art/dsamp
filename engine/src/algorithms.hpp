#pragma once

#include "graph.hpp"
#include <string>
#include <vector>
#include <unordered_map>
#include <utility>

namespace fraudgraph {

struct TraversalStep {
    int step_number{0};
    std::string current_node;
    int metric_val{0}; // distance for BFS, discovery_time for DFS
    std::string action; // "VISIT" or "DISCOVER"
    std::string edge_tx_id; // transaction id traversed to reach node (empty for root)
    std::vector<std::string> visited_so_far;
    std::vector<std::string> active_tree_edges; // tx ids discovered up to this step
    std::string description;
};

struct BFSResult {
    bool success{false};
    std::string error_message;
    std::string start_node;
    std::vector<std::string> traversal_order;
    std::unordered_map<std::string, int> distances; // Hop distance from start
    // Tree edges discovered: pairs of {from_account, to_account}
    std::vector<std::pair<std::string, std::string>> tree_edges;
    std::vector<std::string> tree_edge_tx_ids;
    std::vector<TraversalStep> steps;

    // Academic DSA metrics
    std::string time_complexity{"O(V + E)"};
    std::string space_complexity{"O(V)"};
};

struct DFSResult {
    bool success{false};
    std::string error_message;
    std::string start_node;
    std::vector<std::string> traversal_order;
    std::unordered_map<std::string, int> discovery_times;
    std::unordered_map<std::string, int> finish_times;
    std::vector<std::pair<std::string, std::string>> tree_edges;
    std::vector<std::string> tree_edge_tx_ids;
    std::vector<TraversalStep> steps;

    // Academic DSA metrics
    std::string time_complexity{"O(V + E)"};
    std::string space_complexity{"O(V)"};
};

struct DirectedCycle {
    std::vector<std::string> node_path;        // e.g. ["P", "Q", "R", "P"]
    std::vector<std::string> transaction_ids;  // Trans IDs connecting the cycle
    AmountPaise cycle_volume_paise{0};         // Sum of transaction amounts along cycle
    bool is_self_loop{false};
};

struct CycleDetectionResult {
    bool success{true};
    bool has_cycle{false};
    std::vector<DirectedCycle> cycles;
    std::string summary;
    
    // Academic DSA metrics
    std::string time_complexity{"O(V + E)"};
    std::string space_complexity{"O(V)"};
    std::string algorithm_name{"Three-State DFS (WHITE/GRAY/BLACK)"};
};

struct ShortestPathResult {
    bool success{false};
    bool path_exists{false};
    std::string source;
    std::string destination;
    int hop_count{0};
    std::vector<std::string> node_path;       // e.g. ["ACC_ALICE", "ACC_MULE_X", "ACC_TARGET_D"]
    std::vector<std::string> transaction_ids; // Ordered transaction IDs along the path
    std::vector<Transaction> transactions;    // Full transaction records along the path
    AmountPaise total_volume_paise{0};        // Cumulative volume along edges
    std::string error_message;

    // Academic DSA metrics
    std::string time_complexity{"O(V + E)"};
    std::string space_complexity{"O(V)"};
    std::string algorithm_name{"Breadth-First Search (BFS) with Predecessor Backtracking"};
};

// Algorithm entrypoints
BFSResult runBFS(const DirectedGraph& graph, const std::string& start_node);
DFSResult runDFS(const DirectedGraph& graph, const std::string& start_node);
CycleDetectionResult detectDirectedCycles(const DirectedGraph& graph);
ShortestPathResult findShortestPathBFS(const DirectedGraph& graph, 
                                      const std::string& source, 
                                      const std::string& destination);

} // namespace fraudgraph
