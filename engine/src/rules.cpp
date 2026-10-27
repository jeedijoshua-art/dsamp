#include "rules.hpp"
#include <sstream>
#include <iomanip>
#include <map>

namespace fraudgraph {

static std::string formatINR(AmountPaise paise) {
    std::ostringstream ss;
    bool negative = paise < 0;
    if (negative) paise = -paise;
    
    int64_t rupees = paise / 100;
    int64_t remainder_paise = paise % 100;

    if (negative) ss << "-";
    ss << "INR " << rupees << "." << std::setw(2) << std::setfill('0') << remainder_paise;
    return ss.str();
}

InvestigationReport runInvestigation(const DirectedGraph& graph, 
                                     const std::string& source, 
                                     const std::string& destination) {
    InvestigationReport report;
    report.analyzed_source = source;
    report.analyzed_destination = destination;

    auto all_accounts = graph.getAllAccountIds();

    // 1. RULE_INTERMEDIARY_MULE: Account with in-degree >= 1 and out-degree >= 1
    for (const auto& acc_id : all_accounts) {
        int in_deg = graph.getInDegree(acc_id);
        int out_deg = graph.getOutDegree(acc_id);

        if (in_deg >= 1 && out_deg >= 1) {
            AmountPaise total_in = graph.getTotalIncomingPaise(acc_id);
            AmountPaise total_out = graph.getTotalOutgoingPaise(acc_id);
            AmountPaise diff = total_in - total_out;

            RuleFinding finding;
            finding.rule_id = "RULE_INTERMEDIARY_MULE";
            finding.rule_name = "Intermediary Account Flow Analysis";
            finding.flagged_accounts = {acc_id};
            finding.amount_in_paise = total_in;
            finding.amount_out_paise = total_out;
            finding.discrepancy_paise = diff;

            if (total_in > 0) {
                finding.discrepancy_pct = (static_cast<double>(diff) * 100.0) / static_cast<double>(total_in);
            }

            for (const auto& tx : graph.getIncoming(acc_id)) {
                finding.flagged_transactions.push_back(tx.id);
            }
            for (const auto& tx : graph.getOutgoing(acc_id)) {
                finding.flagged_transactions.push_back(tx.id);
            }

            std::ostringstream ss_ev;
            ss_ev << "Account '" << acc_id << "' acts as an intermediary node. "
                  << "Incoming transactions: " << in_deg << " (" << formatINR(total_in) << "). "
                  << "Outgoing transactions: " << out_deg << " (" << formatINR(total_out) << "). ";

            if (diff > 0) {
                finding.severity = "WARNING";
                ss_ev << "Retained funds detected: " << formatINR(diff) 
                      << " (" << std::fixed << std::setprecision(1) << finding.discrepancy_pct << "%).";
                finding.summary = "Account '" + acc_id + "' forwarded funds with a " + 
                                  formatINR(diff) + " net retention.";
            } else if (diff < 0) {
                finding.severity = "INFO";
                ss_ev << "Outgoing volume exceeds incoming by " << formatINR(-diff) 
                      << ", indicating pre-existing balances or secondary funding sources.";
                finding.summary = "Account '" + acc_id + "' has outgoing volume exceeding incoming transfers.";
            } else {
                finding.severity = "INFO";
                ss_ev << "Zero net discrepancy: exactly 100% of received funds were forwarded.";
                finding.summary = "Account '" + acc_id + "' operates as a pass-through node with 100% flow matching.";
            }

            finding.evidence_details = ss_ev.str();
            finding.neutral_explanation = 
                "A difference between incoming and outgoing amounts does not imply fraud. "
                "The account holder may have retained standard intermediary processing fees, "
                "deducted applicable statutory taxes, maintained an existing ledger balance, "
                "or transferred a portion in another settlement window.";

            report.findings.push_back(finding);
        }
    }

    // 2. Intended Receiver Route Investigation (if source and destination provided)
    if (!source.empty() && !destination.empty() && graph.hasAccount(source) && graph.hasAccount(destination)) {
        report.route_result = findShortestPathBFS(graph, source, destination);
        if (report.route_result.path_exists && report.route_result.hop_count >= 2) {
            RuleFinding route_finding;
            route_finding.rule_id = "RULE_ROUTE_DISCREPANCY";
            route_finding.rule_name = "End-to-End Route Transmission & Discrepancy";
            route_finding.flagged_accounts = report.route_result.node_path;
            route_finding.flagged_transactions = report.route_result.transaction_ids;

            // First hop amount vs Last hop amount
            const auto& first_tx = report.route_result.transactions.front();
            const auto& last_tx = report.route_result.transactions.back();

            route_finding.amount_in_paise = first_tx.amount_paise;
            route_finding.amount_out_paise = last_tx.amount_paise;
            AmountPaise route_diff = first_tx.amount_paise - last_tx.amount_paise;
            route_finding.discrepancy_paise = route_diff;

            if (first_tx.amount_paise > 0) {
                route_finding.discrepancy_pct = (static_cast<double>(route_diff) * 100.0) / 
                                                static_cast<double>(first_tx.amount_paise);
            }

            std::ostringstream ss_route;
            ss_route << "Investigated route from '" << source << "' to '" << destination 
                     << "' spans " << report.route_result.hop_count << " hops. "
                     << "Origin transfer (" << first_tx.id << "): " << formatINR(first_tx.amount_paise) << ". "
                     << "Terminal receipt (" << last_tx.id << "): " << formatINR(last_tx.amount_paise) << ". ";

            if (route_diff != 0) {
                route_finding.severity = "HIGH";
                ss_route << "Amount discrepancy along path: " << formatINR(route_diff) 
                         << " (" << std::fixed << std::setprecision(1) << route_finding.discrepancy_pct << "%).";
                route_finding.summary = "Route discrepancy of " + formatINR(route_diff) + 
                                       " between origin '" + source + "' and target '" + destination + "'.";
            } else {
                route_finding.severity = "INFO";
                ss_route << "Amount matched end-to-end with no discrepancy.";
                route_finding.summary = "Route transfer amount fully preserved between '" + source + "' and '" + destination + "'.";
            }

            route_finding.evidence_details = ss_route.str();
            route_finding.neutral_explanation = 
                "The discrepancy between origin disbursement and final receiver receipt along this transmission "
                "chain may represent a contractual commission, escrow holdback, or foreign exchange fee, "
                "rather than unauthorized diversion.";

            report.findings.push_back(route_finding);
        }
    }

    // 3. RULE_CIRCULAR_ROUTING: Cycle detection
    report.cycle_result = detectDirectedCycles(graph);
    for (size_t i = 0; i < report.cycle_result.cycles.size(); ++i) {
        const auto& cyc = report.cycle_result.cycles[i];
        RuleFinding cyc_finding;
        cyc_finding.rule_id = cyc.is_self_loop ? "RULE_SELF_LOOP" : "RULE_CIRCULAR_ROUTING";
        cyc_finding.rule_name = cyc.is_self_loop ? "Self-Loop Transfer Detected" : "Directed Circular Fund Pattern (Cycle)";
        cyc_finding.severity = cyc.is_self_loop ? "WARNING" : "HIGH";
        cyc_finding.flagged_accounts = cyc.node_path;
        cyc_finding.flagged_transactions = cyc.transaction_ids;
        cyc_finding.amount_in_paise = cyc.cycle_volume_paise;
        cyc_finding.amount_out_paise = cyc.cycle_volume_paise;
        cyc_finding.discrepancy_paise = 0;

        std::ostringstream ss_cyc;
        if (cyc.is_self_loop) {
            ss_cyc << "Account '" << cyc.node_path[0] << "' executed a self-transfer to itself for " 
                   << formatINR(cyc.cycle_volume_paise) << " via transaction " << cyc.transaction_ids[0] << ".";
            cyc_finding.summary = "Self-loop transfer detected on account '" + cyc.node_path[0] + "'.";
            cyc_finding.neutral_explanation = 
                "Internal self-transfers commonly occur during ledger reclassification, account validation tests, "
                "or balance transfers between sub-wallets under the same master account.";
        } else {
            ss_cyc << "Closed directed loop detected: ";
            for (size_t n = 0; n < cyc.node_path.size(); ++n) {
                ss_cyc << cyc.node_path[n] << (n + 1 < cyc.node_path.size() ? " -> " : "");
            }
            ss_cyc << ". Total circular transaction volume: " << formatINR(cyc.cycle_volume_paise) << ".";
            cyc_finding.summary = "Directed cycle detected across " + std::to_string(cyc.node_path.size() - 1) + 
                                  " accounts (" + formatINR(cyc.cycle_volume_paise) + " volume).";
            cyc_finding.neutral_explanation = 
                "Directed cycles reflect circular routing of funds. While circular patterns are monitored for "
                "round-tripping or artificial volume inflation, legitimate commercial causes include multilateral "
                "netting between corporate affiliates, refund reconciliations, and liquidity rebalancing.";
        }

        cyc_finding.evidence_details = ss_cyc.str();
        report.findings.push_back(cyc_finding);
    }

    // 4. RULE_REPEATED_TRANSFERS: Multiple transfers between same pair
    std::map<std::pair<std::string, std::string>, std::vector<Transaction>> pair_map;
    for (const auto& tx : graph.getAllTransactions()) {
        pair_map[{tx.from_account, tx.to_account}].push_back(tx);
    }

    for (const auto& kv : pair_map) {
        if (kv.second.size() > 1 && kv.first.first != kv.first.second) {
            RuleFinding rep_finding;
            rep_finding.rule_id = "RULE_REPEATED_TRANSFERS";
            rep_finding.rule_name = "Repeated Transfers Between Account Pair";
            rep_finding.severity = "INFO";
            rep_finding.flagged_accounts = {kv.first.first, kv.first.second};

            AmountPaise total_rep_vol = 0;
            std::ostringstream ss_rep;
            ss_rep << kv.second.size() << " separate transfers between '" 
                   << kv.first.first << "' and '" << kv.first.second << "': ";

            for (size_t i = 0; i < kv.second.size(); ++i) {
                rep_finding.flagged_transactions.push_back(kv.second[i].id);
                total_rep_vol += kv.second[i].amount_paise;
                ss_rep << kv.second[i].id << " (" << formatINR(kv.second[i].amount_paise) << ")"
                       << (i + 1 < kv.second.size() ? ", " : ".");
            }

            rep_finding.amount_in_paise = total_rep_vol;
            rep_finding.amount_out_paise = total_rep_vol;
            rep_finding.summary = std::to_string(kv.second.size()) + " repeated transactions between '" + 
                                  kv.first.first + "' and '" + kv.first.second + "'.";
            rep_finding.evidence_details = ss_rep.str();
            rep_finding.neutral_explanation = 
                "Multiple transfers between the same sender and receiver within a short period may correspond to "
                "legitimate recurring invoices, split milestone payments, or operational batch transfers.";

            report.findings.push_back(rep_finding);
        }
    }

    // Calculate report summary counts
    report.total_findings = static_cast<int>(report.findings.size());
    for (const auto& f : report.findings) {
        if (f.severity == "HIGH") report.high_severity_count++;
        else if (f.severity == "WARNING") report.warning_count++;
        else report.info_count++;
    }

    return report;
}

} // namespace fraudgraph
