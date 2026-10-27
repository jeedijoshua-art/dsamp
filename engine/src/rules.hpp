#pragma once

#include "graph.hpp"
#include "algorithms.hpp"
#include <string>
#include <vector>

namespace fraudgraph {

struct RuleFinding {
    std::string rule_id;
    std::string rule_name;
    std::string severity; // "HIGH", "WARNING", "INFO"
    std::vector<std::string> flagged_accounts;
    std::vector<std::string> flagged_transactions;
    std::string summary;
    std::string evidence_details;
    AmountPaise amount_in_paise{0};
    AmountPaise amount_out_paise{0};
    AmountPaise discrepancy_paise{0};
    double discrepancy_pct{0.0};
    std::string neutral_explanation;
};

struct InvestigationReport {
    std::vector<RuleFinding> findings;
    int total_findings{0};
    int high_severity_count{0};
    int warning_count{0};
    int info_count{0};
    std::string analyzed_source;
    std::string analyzed_destination;
    ShortestPathResult route_result;
    CycleDetectionResult cycle_result;
};

// Full rule evaluation
InvestigationReport runInvestigation(const DirectedGraph& graph, 
                                     const std::string& source = "", 
                                     const std::string& destination = "");

} // namespace fraudgraph
