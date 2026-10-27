#include "graph.hpp"
#include <algorithm>

namespace fraudgraph {

static const std::vector<Transaction> EMPTY_TX_LIST;

bool DirectedGraph::addAccount(const Account& acc) {
    if (acc.id.empty()) {
        return false;
    }
    // Insert or update existing account
    accounts_[acc.id] = acc;
    // Ensure adjacency lists exist
    adj_[acc.id];
    rev_adj_[acc.id];
    return true;
}

bool DirectedGraph::hasAccount(const std::string& id) const {
    return accounts_.find(id) != accounts_.end();
}

const Account* DirectedGraph::getAccount(const std::string& id) const {
    auto it = accounts_.find(id);
    if (it != accounts_.end()) {
        return &it->second;
    }
    return nullptr;
}

bool DirectedGraph::hasTransaction(const std::string& id) const {
    return transactions_by_id_.find(id) != transactions_by_id_.end();
}

const Transaction* DirectedGraph::getTransaction(const std::string& id) const {
    auto it = transactions_by_id_.find(id);
    if (it != transactions_by_id_.end()) {
        return &it->second;
    }
    return nullptr;
}

bool DirectedGraph::addTransaction(const Transaction& tx, std::string* error_out) {
    if (tx.id.empty()) {
        if (error_out) *error_out = "Transaction ID cannot be empty";
        return false;
    }
    if (tx.from_account.empty() || tx.to_account.empty()) {
        if (error_out) *error_out = "Source and destination account IDs cannot be empty";
        return false;
    }
    if (hasTransaction(tx.id)) {
        if (error_out) *error_out = "Duplicate transaction record ID: " + tx.id;
        return false;
    }
    if (tx.amount_paise < 0) {
        if (error_out) *error_out = "Transaction amount cannot be negative";
        return false;
    }

    // Auto-register accounts if they don't exist yet, with default metadata
    if (!hasAccount(tx.from_account)) {
        addAccount(Account(tx.from_account, "Account " + tx.from_account, "AutoCreated"));
    }
    if (!hasAccount(tx.to_account)) {
        addAccount(Account(tx.to_account, "Account " + tx.to_account, "AutoCreated"));
    }

    // Add to adjacency list (directed edge from_account -> to_account)
    adj_[tx.from_account].push_back(tx);
    // Add to reverse adjacency list (incoming edge to_account <- from_account)
    rev_adj_[tx.to_account].push_back(tx);

    transactions_by_id_[tx.id] = tx;
    return true;
}

std::vector<std::string> DirectedGraph::getAllAccountIds() const {
    std::vector<std::string> ids;
    ids.reserve(accounts_.size());
    for (const auto& kv : accounts_) {
        ids.push_back(kv.first);
    }
    // Deterministic alphabetical sort so traversals and UI are fully reproducible
    std::sort(ids.begin(), ids.end());
    return ids;
}

const std::vector<Transaction>& DirectedGraph::getOutgoing(const std::string& account_id) const {
    auto it = adj_.find(account_id);
    if (it != adj_.end()) {
        return it->second;
    }
    return EMPTY_TX_LIST;
}

const std::vector<Transaction>& DirectedGraph::getIncoming(const std::string& account_id) const {
    auto it = rev_adj_.find(account_id);
    if (it != rev_adj_.end()) {
        return it->second;
    }
    return EMPTY_TX_LIST;
}

std::vector<Transaction> DirectedGraph::getAllTransactions() const {
    std::vector<Transaction> txs;
    txs.reserve(transactions_by_id_.size());
    for (const auto& kv : transactions_by_id_) {
        txs.push_back(kv.second);
    }
    // Sort deterministically by timestamp, then transaction ID
    std::sort(txs.begin(), txs.end(), [](const Transaction& a, const Transaction& b) {
        if (a.timestamp != b.timestamp) return a.timestamp < b.timestamp;
        return a.id < b.id;
    });
    return txs;
}

AmountPaise DirectedGraph::getTotalVolumePaise() const {
    AmountPaise total = 0;
    for (const auto& kv : transactions_by_id_) {
        total += kv.second.amount_paise;
    }
    return total;
}

int DirectedGraph::getInDegree(const std::string& account_id) const {
    auto it = rev_adj_.find(account_id);
    if (it != rev_adj_.end()) {
        return static_cast<int>(it->second.size());
    }
    return 0;
}

int DirectedGraph::getOutDegree(const std::string& account_id) const {
    auto it = adj_.find(account_id);
    if (it != adj_.end()) {
        return static_cast<int>(it->second.size());
    }
    return 0;
}

AmountPaise DirectedGraph::getTotalIncomingPaise(const std::string& account_id) const {
    AmountPaise sum = 0;
    for (const auto& tx : getIncoming(account_id)) {
        sum += tx.amount_paise;
    }
    return sum;
}

AmountPaise DirectedGraph::getTotalOutgoingPaise(const std::string& account_id) const {
    AmountPaise sum = 0;
    for (const auto& tx : getOutgoing(account_id)) {
        sum += tx.amount_paise;
    }
    return sum;
}

bool DirectedGraph::isDisconnected(const std::string& account_id) const {
    return getInDegree(account_id) == 0 && getOutDegree(account_id) == 0;
}

void DirectedGraph::clear() {
    accounts_.clear();
    adj_.clear();
    rev_adj_.clear();
    transactions_by_id_.clear();
}

} // namespace fraudgraph
