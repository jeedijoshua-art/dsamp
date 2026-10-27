#pragma once

#include <string>
#include <vector>
#include <unordered_map>
#include <set>
#include <algorithm>
#include <cstdint>

namespace fraudgraph {

// Integer monetary representation: 1 INR = 100 paise (avoids floating point rounding errors)
using AmountPaise = int64_t;

struct Account {
    std::string id;
    std::string name;
    std::string account_type; // e.g., "Personal", "Corporate", "Suspicious", "Settlement"
    std::string risk_tier;    // "LOW", "MEDIUM", "HIGH"
    std::string created_at;

    Account() = default;
    Account(std::string id, std::string name, std::string type = "Standard", 
            std::string risk = "LOW", std::string created = "")
        : id(std::move(id)), name(std::move(name)), account_type(std::move(type)),
          risk_tier(std::move(risk)), created_at(std::move(created)) {}
};

struct Transaction {
    std::string id;
    std::string from_account;
    std::string to_account;
    AmountPaise amount_paise{0};
    std::string timestamp;
    std::string memo;

    Transaction() = default;
    Transaction(std::string id, std::string from, std::string to, AmountPaise amount, 
                std::string ts = "", std::string memo = "")
        : id(std::move(id)), from_account(std::move(from)), to_account(std::move(to)),
          amount_paise(amount), timestamp(std::move(ts)), memo(std::move(memo)) {}
};

class DirectedGraph {
private:
    std::unordered_map<std::string, Account> accounts_;
    // Outgoing adjacency list: from_account -> list of outgoing transactions
    std::unordered_map<std::string, std::vector<Transaction>> adj_;
    // Incoming reverse adjacency list: to_account -> list of incoming transactions
    std::unordered_map<std::string, std::vector<Transaction>> rev_adj_;
    // Fast lookup for duplicate transaction IDs
    std::unordered_map<std::string, Transaction> transactions_by_id_;

public:
    DirectedGraph() = default;

    bool addAccount(const Account& acc);
    bool hasAccount(const std::string& id) const;
    const Account* getAccount(const std::string& id) const;

    // Directed transaction insertion
    bool addTransaction(const Transaction& tx, std::string* error_out = nullptr);
    bool hasTransaction(const std::string& id) const;
    const Transaction* getTransaction(const std::string& id) const;

    // Accessors
    std::vector<std::string> getAllAccountIds() const; // Sorted alphabetically for determinism
    const std::vector<Transaction>& getOutgoing(const std::string& account_id) const;
    const std::vector<Transaction>& getIncoming(const std::string& account_id) const;
    std::vector<Transaction> getAllTransactions() const;

    size_t getAccountCount() const { return accounts_.size(); }
    size_t getTransactionCount() const { return transactions_by_id_.size(); }
    AmountPaise getTotalVolumePaise() const;

    int getInDegree(const std::string& account_id) const;
    int getOutDegree(const std::string& account_id) const;
    AmountPaise getTotalIncomingPaise(const std::string& account_id) const;
    AmountPaise getTotalOutgoingPaise(const std::string& account_id) const;

    bool isDisconnected(const std::string& account_id) const;
    void clear();
};

} // namespace fraudgraph
