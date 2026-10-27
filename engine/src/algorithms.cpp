#include "algorithms.hpp"
#include <queue>
#include <algorithm>
#include <sstream>

namespace fraudgraph {

// Helper to sort outgoing edges deterministically (by destination ID, then tx ID)
static std::vector<Transaction> getSortedOutgoing(const DirectedGraph& graph, const std::string& u) {
    auto edges = graph.getOutgoing(u);
    std::sort(edges.begin(), edges.end(), [](const Transaction& a, const Transaction& b) {
        if (a.to_account != b.to_account) return a.to_account < b.to_account;
        return a.id < b.id;
    });
    return edges;
}

BFSResult runBFS(const DirectedGraph& graph, const std::string& start_node) {
    BFSResult result;
    result.start_node = start_node;

    if (graph.getAccountCount() == 0) {
        result.success = false;
        result.error_message = "Graph is empty. No accounts available for BFS traversal.";
        return result;
    }

    if (!graph.hasAccount(start_node)) {
        result.success = false;
        result.error_message = "Start account '" + start_node + "' does not exist in graph.";
        return result;
    }

    result.success = true;
    std::unordered_map<std::string, bool> visited;
    std::unordered_map<std::string, std::string> reaching_tx;
    std::queue<std::string> q;

    visited[start_node] = true;
    result.distances[start_node] = 0;
    q.push(start_node);

    std::vector<std::string> current_visited;
    std::vector<std::string> current_tree_txs;
    int step_counter = 0;

    while (!q.empty()) {
        std::string u = q.front();
        q.pop();
        result.traversal_order.push_back(u);

        step_counter++;
        current_visited.push_back(u);
        std::string edge_id = reaching_tx[u];
        if (!edge_id.empty()) {
            current_tree_txs.push_back(edge_id);
        }

        TraversalStep step;
        step.step_number = step_counter;
        step.current_node = u;
        step.metric_val = result.distances[u];
        step.action = "VISIT";
        step.edge_tx_id = edge_id;
        step.visited_so_far = current_visited;
        step.active_tree_edges = current_tree_txs;
        if (u == start_node) {
            step.description = "Queue pop: Discovered root node " + u + " (Hop distance: 0)";
        } else {
            step.description = "Queue pop: Visited node " + u + " via edge " + edge_id + " (Hop distance: " + std::to_string(result.distances[u]) + ")";
        }
        result.steps.push_back(step);

        int current_dist = result.distances[u];
        auto edges = getSortedOutgoing(graph, u);

        for (const auto& tx : edges) {
            const std::string& v = tx.to_account;
            if (!visited[v]) {
                visited[v] = true;
                reaching_tx[v] = tx.id;
                result.distances[v] = current_dist + 1;
                result.tree_edges.emplace_back(u, v);
                result.tree_edge_tx_ids.push_back(tx.id);
                q.push(v);
            }
        }
    }

    return result;
}

namespace {

void dfsVisit(const DirectedGraph& graph, 
              const std::string& u, 
              const std::string& incoming_tx,
              int& timer, 
              std::unordered_map<std::string, bool>& visited,
              std::vector<std::string>& current_visited,
              std::vector<std::string>& current_tree_txs,
              DFSResult& result) {
    visited[u] = true;
    timer++;
    result.discovery_times[u] = timer;
    result.traversal_order.push_back(u);

    current_visited.push_back(u);
    if (!incoming_tx.empty()) {
        current_tree_txs.push_back(incoming_tx);
    }

    TraversalStep step;
    step.step_number = static_cast<int>(result.steps.size()) + 1;
    step.current_node = u;
    step.metric_val = timer;
    step.action = "DISCOVER";
    step.edge_tx_id = incoming_tx;
    step.visited_so_far = current_visited;
    step.active_tree_edges = current_tree_txs;
    step.description = "DFS discovery of " + u + " at discovery timestamp d[" + u + "] = " + std::to_string(timer);
    result.steps.push_back(step);

    auto edges = getSortedOutgoing(graph, u);
    for (const auto& tx : edges) {
        const std::string& v = tx.to_account;
        if (!visited[v]) {
            result.tree_edges.emplace_back(u, v);
            result.tree_edge_tx_ids.push_back(tx.id);
            dfsVisit(graph, v, tx.id, timer, visited, current_visited, current_tree_txs, result);
        }
    }

    timer++;
    result.finish_times[u] = timer;
}

} // anonymous namespace

DFSResult runDFS(const DirectedGraph& graph, const std::string& start_node) {
    DFSResult result;
    result.start_node = start_node;

    if (graph.getAccountCount() == 0) {
        result.success = false;
        result.error_message = "Graph is empty. No accounts available for DFS traversal.";
        return result;
    }

    if (!graph.hasAccount(start_node)) {
        result.success = false;
        result.error_message = "Start account '" + start_node + "' does not exist in graph.";
        return result;
    }

    result.success = true;
    std::unordered_map<std::string, bool> visited;
    std::vector<std::string> current_visited;
    std::vector<std::string> current_tree_txs;
    int timer = 0;

    dfsVisit(graph, start_node, "", timer, visited, current_visited, current_tree_txs, result);
    return result;
}

namespace {

enum class NodeColor { WHITE, GRAY, BLACK };

void dfsCycleHelper(const DirectedGraph& graph,
                    const std::string& u,
                    std::unordered_map<std::string, NodeColor>& color,
                    std::vector<std::string>& path_stack,
                    std::vector<Transaction>& edge_stack,
                    std::vector<DirectedCycle>& detected_cycles) {
    color[u] = NodeColor::GRAY;
    path_stack.push_back(u);

    auto edges = getSortedOutgoing(graph, u);
    for (const auto& tx : edges) {
        const std::string& v = tx.to_account;

        if (color[v] == NodeColor::GRAY) {
            // Directed Cycle Detected! (Back-edge discovered u -> v)
            DirectedCycle cycle;
            if (u == v) {
                // Self-loop
                cycle.is_self_loop = true;
                cycle.node_path = {u, u};
                cycle.transaction_ids = {tx.id};
                cycle.cycle_volume_paise = tx.amount_paise;
            } else {
                // Trace from v to u in path_stack
                auto it = std::find(path_stack.begin(), path_stack.end(), v);
                if (it != path_stack.end()) {
                    size_t start_idx = std::distance(path_stack.begin(), it);
                    for (size_t i = start_idx; i < path_stack.size(); ++i) {
                        cycle.node_path.push_back(path_stack[i]);
                    }
                    cycle.node_path.push_back(v); // close the cycle loop

                    // Collect transactions along cycle
                    for (size_t i = start_idx; i < edge_stack.size(); ++i) {
                        cycle.transaction_ids.push_back(edge_stack[i].id);
                        cycle.cycle_volume_paise += edge_stack[i].amount_paise;
                    }
                    // Add the closing back-edge transaction
                    cycle.transaction_ids.push_back(tx.id);
                    cycle.cycle_volume_paise += tx.amount_paise;
                }
            }

            if (!cycle.node_path.empty()) {
                // Avoid storing exact duplicate cycles
                bool duplicate = false;
                for (const auto& existing : detected_cycles) {
                    if (existing.node_path == cycle.node_path) {
                        duplicate = true;
                        break;
                    }
                }
                if (!duplicate) {
                    detected_cycles.push_back(cycle);
                }
            }
        } else if (color[v] == NodeColor::WHITE) {
            edge_stack.push_back(tx);
            dfsCycleHelper(graph, v, color, path_stack, edge_stack, detected_cycles);
            edge_stack.pop_back();
        }
    }

    path_stack.pop_back();
    color[u] = NodeColor::BLACK;
}

} // anonymous namespace

CycleDetectionResult detectDirectedCycles(const DirectedGraph& graph) {
    CycleDetectionResult result;
    result.success = true;

    if (graph.getAccountCount() == 0) {
        result.has_cycle = false;
        result.summary = "Graph is empty. No cycles detected.";
        return result;
    }

    std::unordered_map<std::string, NodeColor> color;
    auto all_accounts = graph.getAllAccountIds();
    for (const auto& acc_id : all_accounts) {
        color[acc_id] = NodeColor::WHITE;
    }

    std::vector<std::string> path_stack;
    std::vector<Transaction> edge_stack;

    // Explore every unvisited node to cover disconnected components
    for (const auto& acc_id : all_accounts) {
        if (color[acc_id] == NodeColor::WHITE) {
            dfsCycleHelper(graph, acc_id, color, path_stack, edge_stack, result.cycles);
        }
    }

    result.has_cycle = !result.cycles.empty();
    std::ostringstream ss;
    if (result.has_cycle) {
        ss << "Detected " << result.cycles.size() << " directed cycle(s) via 3-state DFS back-edge identification.";
    } else {
        ss << "Graph is a Directed Acyclic Graph (DAG). No directed circular fund flows detected.";
    }
    result.summary = ss.str();

    return result;
}

ShortestPathResult findShortestPathBFS(const DirectedGraph& graph, 
                                      const std::string& source, 
                                      const std::string& destination) {
    ShortestPathResult result;
    result.source = source;
    result.destination = destination;

    if (!graph.hasAccount(source)) {
        result.success = false;
        result.path_exists = false;
        result.error_message = "Source account '" + source + "' does not exist in graph.";
        return result;
    }

    if (!graph.hasAccount(destination)) {
        result.success = false;
        result.path_exists = false;
        result.error_message = "Destination account '" + destination + "' does not exist in graph.";
        return result;
    }

    result.success = true;

    // If source equals destination
    if (source == destination) {
        result.path_exists = true;
        result.hop_count = 0;
        result.node_path = {source};
        result.total_volume_paise = 0;
        return result;
    }

    // BFS for unweighted shortest path
    std::unordered_map<std::string, bool> visited;
    // Map node to pair of {predecessor_node, transaction_used}
    std::unordered_map<std::string, std::pair<std::string, Transaction>> pred;
    std::queue<std::string> q;

    visited[source] = true;
    q.push(source);

    bool reached = false;
    while (!q.empty()) {
        std::string u = q.front();
        q.pop();

        if (u == destination) {
            reached = true;
            break;
        }

        auto edges = getSortedOutgoing(graph, u);
        for (const auto& tx : edges) {
            const std::string& v = tx.to_account;
            if (!visited[v]) {
                visited[v] = true;
                pred[v] = {u, tx};
                q.push(v);
            }
        }
    }

    if (!reached) {
        result.path_exists = false;
        result.error_message = "No directed transmission path exists from '" + source + "' to '" + destination + "'.";
        return result;
    }

    // Backtrack from destination to source
    result.path_exists = true;
    std::string curr = destination;
    std::vector<std::string> reversed_nodes;
    std::vector<std::string> reversed_tx_ids;
    std::vector<Transaction> reversed_txs;
    AmountPaise volume_sum = 0;

    reversed_nodes.push_back(destination);
    while (curr != source) {
        auto it = pred.find(curr);
        if (it == pred.end()) break;
        reversed_tx_ids.push_back(it->second.second.id);
        reversed_txs.push_back(it->second.second);
        volume_sum += it->second.second.amount_paise;
        curr = it->second.first;
        reversed_nodes.push_back(curr);
    }

    std::reverse(reversed_nodes.begin(), reversed_nodes.end());
    std::reverse(reversed_tx_ids.begin(), reversed_tx_ids.end());
    std::reverse(reversed_txs.begin(), reversed_txs.end());

    result.node_path = std::move(reversed_nodes);
    result.transaction_ids = std::move(reversed_tx_ids);
    result.transactions = std::move(reversed_txs);
    result.hop_count = static_cast<int>(result.transaction_ids.size());
    result.total_volume_paise = volume_sum;

    return result;
}

} // namespace fraudgraph
