#include "graph.hpp"
#include "algorithms.hpp"
#include "rules.hpp"
#include "json_io.hpp"
#include <iostream>
#include <sstream>
#include <fstream>
#include <string>

using namespace fraudgraph;

int main(int argc, char* argv[]) {
    // Fast I/O
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(nullptr);

    std::string action_arg = "";
    std::string start_arg = "";
    std::string source_arg = "";
    std::string dest_arg = "";
    std::string file_arg = "";

    // Parse command line arguments if passed
    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "--action" && i + 1 < argc) action_arg = argv[++i];
        else if (arg == "--start" && i + 1 < argc) start_arg = argv[++i];
        else if (arg == "--source" && i + 1 < argc) source_arg = argv[++i];
        else if (arg == "--dest" && i + 1 < argc) dest_arg = argv[++i];
        else if (arg == "--destination" && i + 1 < argc) dest_arg = argv[++i];
        else if (arg == "--file" && i + 1 < argc) file_arg = argv[++i];
    }

    std::string input_content;
    if (!file_arg.empty()) {
        std::ifstream fin(file_arg);
        if (!fin.is_open()) {
            json err_resp = {
                {"status", "error"},
                {"error", "Could not open input file: " + file_arg}
            };
            std::cout << err_resp.dump(2) << std::endl;
            return 1;
        }
        std::stringstream buffer;
        buffer << fin.rdbuf();
        input_content = buffer.str();
    } else {
        // Read from stdin
        std::stringstream buffer;
        buffer << std::cin.rdbuf();
        input_content = buffer.str();
    }

    if (input_content.empty()) {
        json err_resp = {
            {"status", "error"},
            {"error", "Empty input received via stdin"}
        };
        std::cout << err_resp.dump(2) << std::endl;
        return 0;
    }

    json root_json;
    try {
        root_json = json::parse(input_content);
    } catch (const std::exception& e) {
        json err_resp = {
            {"status", "error"},
            {"error", std::string("JSON parsing error: ") + e.what()}
        };
        std::cout << err_resp.dump(2) << std::endl;
        return 0;
    }

    // Determine action from argument or JSON payload
    std::string action = action_arg;
    if (action.empty() && root_json.contains("action")) {
        action = root_json["action"].get<std::string>();
    }
    if (action.empty()) {
        action = "full_analysis"; // Default to complete analysis
    }

    // Parameters
    json params = root_json.value("params", json::object());
    std::string start_node = start_arg.empty() ? params.value("start_node", "") : start_arg;
    std::string source = source_arg.empty() ? params.value("source", "") : source_arg;
    std::string destination = dest_arg.empty() ? params.value("destination", params.value("dest", "")) : dest_arg;

    // Build DirectedGraph from JSON
    std::string graph_build_warning;
    DirectedGraph graph = buildGraphFromJson(root_json, &graph_build_warning);

    json response = {
        {"status", "success"},
        {"action", action},
        {"engine_version", "FraudGraph C++17 Core v1.0.0"}
    };

    if (!graph_build_warning.empty()) {
        response["build_warning"] = graph_build_warning;
    }

    // Construct graph metadata summary
    json graph_meta = {
        {"account_count", graph.getAccountCount()},
        {"transaction_count", graph.getTransactionCount()},
        {"total_volume_paise", graph.getTotalVolumePaise()},
        {"total_volume_inr", static_cast<double>(graph.getTotalVolumePaise()) / 100.0}
    };

    json accounts_detail = json::array();
    for (const auto& acc_id : graph.getAllAccountIds()) {
        const auto* acc = graph.getAccount(acc_id);
        json acc_j;
        if (acc) {
            acc_j = accountToJson(*acc);
        } else {
            acc_j = {{"id", acc_id}, {"name", "Account " + acc_id}};
        }
        acc_j["in_degree"] = graph.getInDegree(acc_id);
        acc_j["out_degree"] = graph.getOutDegree(acc_id);
        acc_j["total_incoming_paise"] = graph.getTotalIncomingPaise(acc_id);
        acc_j["total_incoming_inr"] = static_cast<double>(graph.getTotalIncomingPaise(acc_id)) / 100.0;
        acc_j["total_outgoing_paise"] = graph.getTotalOutgoingPaise(acc_id);
        acc_j["total_outgoing_inr"] = static_cast<double>(graph.getTotalOutgoingPaise(acc_id)) / 100.0;
        acc_j["is_disconnected"] = graph.isDisconnected(acc_id);
        accounts_detail.push_back(acc_j);
    }
    graph_meta["accounts"] = accounts_detail;

    json txs_detail = json::array();
    for (const auto& tx : graph.getAllTransactions()) {
        txs_detail.push_back(transactionToJson(tx));
    }
    graph_meta["transactions"] = txs_detail;

    response["graph_summary"] = graph_meta;

    if (action == "graph_summary") {
        // Only summary needed
        std::cout << response.dump(2) << std::endl;
        return 0;
    }

    if (action == "bfs") {
        if (start_node.empty()) {
            start_node = graph.getAllAccountIds().empty() ? "" : graph.getAllAccountIds().front();
        }
        BFSResult bfs_res = runBFS(graph, start_node);
        response["bfs"] = bfsResultToJson(bfs_res);
    } else if (action == "dfs") {
        if (start_node.empty()) {
            start_node = graph.getAllAccountIds().empty() ? "" : graph.getAllAccountIds().front();
        }
        DFSResult dfs_res = runDFS(graph, start_node);
        response["dfs"] = dfsResultToJson(dfs_res);
    } else if (action == "cycle_detection") {
        CycleDetectionResult cycle_res = detectDirectedCycles(graph);
        response["cycle_detection"] = cycleResultToJson(cycle_res);
    } else if (action == "shortest_path") {
        ShortestPathResult sp_res = findShortestPathBFS(graph, source, destination);
        response["shortest_path"] = shortestPathResultToJson(sp_res);
    } else if (action == "investigate") {
        InvestigationReport report = runInvestigation(graph, source, destination);
        response["investigation"] = reportToJson(report);
        if (report.route_result.path_exists) {
            response["shortest_path"] = shortestPathResultToJson(report.route_result);
        }
        response["cycle_detection"] = cycleResultToJson(report.cycle_result);
    } else if (action == "full_analysis") {
        // Run all algorithms in a unified pass
        if (start_node.empty() && !graph.getAllAccountIds().empty()) {
            start_node = graph.getAllAccountIds().front();
        }

        if (!start_node.empty()) {
            BFSResult bfs_res = runBFS(graph, start_node);
            response["bfs"] = bfsResultToJson(bfs_res);

            DFSResult dfs_res = runDFS(graph, start_node);
            response["dfs"] = dfsResultToJson(dfs_res);
        }

        CycleDetectionResult cycle_res = detectDirectedCycles(graph);
        response["cycle_detection"] = cycleResultToJson(cycle_res);

        if (!source.empty() && !destination.empty()) {
            ShortestPathResult sp_res = findShortestPathBFS(graph, source, destination);
            response["shortest_path"] = shortestPathResultToJson(sp_res);
        }

        InvestigationReport report = runInvestigation(graph, source, destination);
        response["investigation"] = reportToJson(report);
    } else {
        response["status"] = "error";
        response["error"] = "Unknown action requested: " + action;
    }

    std::cout << response.dump(2) << std::endl;
    return 0;
}
