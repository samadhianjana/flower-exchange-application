#pragma once

#include "domain/order.hpp"

#include <mutex>
#include <string>
#include <vector>

namespace flower_exchange::persistence {

struct BatchSummary {
  std::string batch_id;
  int total_rows = 0;
  int accepted_rows = 0;
  int rejected_rows = 0;
};

class InMemoryRepository {
 public:
  void SaveReports(const std::vector<flower_exchange::ExecutionReport>& reports);
  void SaveBatchSummary(const BatchSummary& summary);

  std::vector<flower_exchange::ExecutionReport> GetReports() const;
  std::vector<flower_exchange::ExecutionReport> GetReportsByClientOrderId(
      const std::string& client_order_id) const;
  std::string ExportReportsCsv() const;
  std::vector<BatchSummary> GetBatches() const;

 private:
  mutable std::mutex mu_;
  std::vector<flower_exchange::ExecutionReport> reports_;
  std::vector<BatchSummary> batches_;
};

}  // namespace flower_exchange::persistence
