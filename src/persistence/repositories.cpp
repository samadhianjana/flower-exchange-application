#include "persistence/repositories.hpp"

#include <sstream>

namespace flower_exchange::persistence {

void InMemoryRepository::SaveReports(const std::vector<flower_exchange::ExecutionReport>& reports) {
  std::lock_guard<std::mutex> lock(mu_);
  reports_.insert(reports_.end(), reports.begin(), reports.end());
}

void InMemoryRepository::SaveBatchSummary(const BatchSummary& summary) {
  std::lock_guard<std::mutex> lock(mu_);
  batches_.push_back(summary);
}

std::vector<flower_exchange::ExecutionReport> InMemoryRepository::GetReports() const {
  std::lock_guard<std::mutex> lock(mu_);
  return reports_;
}

std::vector<flower_exchange::ExecutionReport> InMemoryRepository::GetReportsByClientOrderId(
    const std::string& client_order_id) const {
  std::lock_guard<std::mutex> lock(mu_);
  std::vector<flower_exchange::ExecutionReport> filtered;
  for (const auto& report : reports_) {
    if (report.client_order_id == client_order_id) {
      filtered.push_back(report);
    }
  }
  return filtered;
}

std::string InMemoryRepository::ExportReportsCsv() const {
  std::lock_guard<std::mutex> lock(mu_);
  std::ostringstream oss;
  oss << "ClientOrderID,OrderID,Instrument,Side,Price,Quantity,Status,Reason,TransactionTime\n";
  for (const auto& r : reports_) {
    oss << r.client_order_id << "," << r.order_id << "," << r.instrument << ","
        << static_cast<int>(r.side) << "," << r.price << "," << r.quantity << ","
        << static_cast<int>(r.status) << "," << (r.reason.has_value() ? *r.reason : "") << ","
        << r.transaction_time << "\n";
  }
  return oss.str();
}

std::vector<BatchSummary> InMemoryRepository::GetBatches() const {
  std::lock_guard<std::mutex> lock(mu_);
  return batches_;
}

}  // namespace flower_exchange::persistence