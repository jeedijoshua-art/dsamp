#pragma once

#include "graph.hpp"
#include "algorithms.hpp"
#include "rules.hpp"
#include <nlohmann/json.hpp>
#include <string>

namespace fraudgraph {

using json = nlohmann::json;

inline json accountToJson(const Account& acc) {
    return json{
        {"id", acc.id},
        {"name", acc.name},
        {"account_type", acc.account_type},
        {"risk_tier", acc.risk_tier},
        {"created_at", acc.created_at}
    };
}

inline json transactionToJson(const Transaction& tx) {
    return json{
        {"id", tx.id},
        {"from_account", tx.from_account},
        {"to_account", tx.to_account},
        {"amount_paise", tx.amount_paise},
        {"amount_inr", static_cast<double>(tx.amount_paise) / 100.0},
        {"timestamp", tx.timestamp},
        {"memo", tx.memo}
    };
}

inline json traversalStepToJson(const TraversalStep& s) {
    return json{
        {"step_number", s.step_number},
        {"current_node", s.current_node},
        {"metric_val", s.metric_val},
        {"action", s.action},
        {"edge_tx_id", s.edge_tx_id},
        {"visited_so_far", s.visited_so_far},
        {"active_tree_edges", s.active_tree_edges},
        {"description", s.description}
    };
}

inline json bfsResultToJson(const BFSResult& res) {
    json j = json{
        {"success", res.success},
        {"error_message", res.error_message},
        {"start_node", res.start_node},
        {"traversal_order", res.traversal_order},
        {"distances", res.distances},
        {"tree_edge_tx_ids", res.tree_edge_tx_ids},
        {"time_complexity", res.time_complexity},
        {"space_complexity", res.space_complexity}
    };
    json tree_edges_json = json::array();
    for (const auto& edge : res.tree_edges) {
        tree_edges_json.push_back({{"from", edge.first}, {"to", edge.second}});
    }
    j["tree_edges"] = tree_edges_json;

    json steps_json = json::array();
    for (const auto& step : res.steps) {
        steps_json.push_back(traversalStepToJson(step));
    }
    j["steps"] = steps_json;

    return j;
}

inline json dfsResultToJson(const DFSResult& res) {
    json j = json{
        {"success", res.success},
        {"error_message", res.error_message},
        {"start_node", res.start_node},
        {"traversal_order", res.traversal_order},
        {"discovery_times", res.discovery_times},
        {"finish_times", res.finish_times},
        {"tree_edge_tx_ids", res.tree_edge_tx_ids},
        {"time_complexity", res.time_complexity},
        {"space_complexity", res.space_complexity}
    };
    json tree_edges_json = json::array();
    for (const auto& edge : res.tree_edges) {
        tree_edges_json.push_back({{"from", edge.first}, {"to", edge.second}});
    }
    j["tree_edges"] = tree_edges_json;

    json steps_json = json::array();
    for (const auto& step : res.steps) {
        steps_json.push_back(traversalStepToJson(step));
    }
    j["steps"] = steps_json;

    return j;
}

inline json cycleResultToJson(const CycleDetectionResult& res) {
    json j = json{
        {"success", res.success},
        {"has_cycle", res.has_cycle},
        {"summary", res.summary},
        {"time_complexity", res.time_complexity},
        {"space_complexity", res.space_complexity},
        {"algorithm_name", res.algorithm_name}
    };
    json cycles_arr = json::array();
    for (const auto& c : res.cycles) {
        cycles_arr.push_back({
            {"node_path", c.node_path},
            {"transaction_ids", c.transaction_ids},
            {"cycle_volume_paise", c.cycle_volume_paise},
            {"cycle_volume_inr", static_cast<double>(c.cycle_volume_paise) / 100.0},
            {"is_self_loop", c.is_self_loop}
        });
    }
    j["cycles"] = cycles_arr;
    return j;
}

inline json shortestPathResultToJson(const ShortestPathResult& res) {
    json j = json{
        {"success", res.success},
        {"path_exists", res.path_exists},
        {"source", res.source},
        {"destination", res.destination},
        {"hop_count", res.hop_count},
        {"node_path", res.node_path},
        {"transaction_ids", res.transaction_ids},
        {"total_volume_paise", res.total_volume_paise},
        {"total_volume_inr", static_cast<double>(res.total_volume_paise) / 100.0},
        {"error_message", res.error_message},
        {"time_complexity", res.time_complexity},
        {"space_complexity", res.space_complexity},
        {"algorithm_name", res.algorithm_name}
    };
    json txs_arr = json::array();
    for (const auto& tx : res.transactions) {
        txs_arr.push_back(transactionToJson(tx));
    }
    j["transactions"] = txs_arr;
    return j;
}

inline json findingToJson(const RuleFinding& f) {
    return json{
        {"rule_id", f.rule_id},
        {"rule_name", f.rule_name},
        {"severity", f.severity},
        {"flagged_accounts", f.flagged_accounts},
        {"flagged_transactions", f.flagged_transactions},
        {"summary", f.summary},
        {"evidence_details", f.evidence_details},
        {"amount_in_paise", f.amount_in_paise},
        {"amount_in_inr", static_cast<double>(f.amount_in_paise) / 100.0},
        {"amount_out_paise", f.amount_out_paise},
        {"amount_out_inr", static_cast<double>(f.amount_out_paise) / 100.0},
        {"discrepancy_paise", f.discrepancy_paise},
        {"discrepancy_inr", static_cast<double>(f.discrepancy_paise) / 100.0},
        {"discrepancy_pct", f.discrepancy_pct},
        {"neutral_explanation", f.neutral_explanation}
    };
}

inline json reportToJson(const InvestigationReport& rep) {
    json j = json{
        {"total_findings", rep.total_findings},
        {"high_severity_count", rep.high_severity_count},
        {"warning_count", rep.warning_count},
        {"info_count", rep.info_count},
        {"analyzed_source", rep.analyzed_source},
        {"analyzed_destination", rep.analyzed_destination}
    };
    json findings_arr = json::array();
    for (const auto& f : rep.findings) {
        findings_arr.push_back(findingToJson(f));
    }
    j["findings"] = findings_arr;
    return j;
}

inline DirectedGraph buildGraphFromJson(const json& j, std::string* error_out = nullptr) {
    DirectedGraph graph;

    if (j.contains("accounts") && j["accounts"].is_array()) {
        for (const auto& item : j["accounts"]) {
            std::string id = item.value("id", "");
            std::string name = item.value("name", "Account " + id);
            std::string type = item.value("account_type", item.value("type", "Standard"));
            std::string risk = item.value("risk_tier", item.value("risk", "LOW"));
            std::string created = item.value("created_at", "");
            if (!id.empty()) {
                graph.addAccount(Account(id, name, type, risk, created));
            }
        }
    }

    if (j.contains("transactions") && j["transactions"].is_array()) {
        for (const auto& item : j["transactions"]) {
            std::string id = item.value("id", "");
            std::string from = item.value("from_account", item.value("from", ""));
            std::string to = item.value("to_account", item.value("to", ""));
            
            // Amount in paise
            AmountPaise amount = 0;
            if (item.contains("amount_paise")) {
                amount = item["amount_paise"].get<AmountPaise>();
            } else if (item.contains("amount")) {
                // If amount is given in INR, convert to paise
                double inr = item["amount"].get<double>();
                amount = static_cast<AmountPaise>(std::round(inr * 100.0));
            }

            std::string ts = item.value("timestamp", "");
            std::string memo = item.value("memo", "");

            std::string tx_err;
            if (!graph.addTransaction(Transaction(id, from, to, amount, ts, memo), &tx_err)) {
                // Duplicate transaction or error - we log it or note it
                if (error_out && error_out->empty()) {
                    *error_out = tx_err;
                }
            }
        }
    }

    return graph;
}

} // namespace fraudgraph
