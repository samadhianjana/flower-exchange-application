#include "app/exchange_service.hpp"

namespace flower_exchange::app {

ExchangeService::ExchangeService(flower_exchange::MatchingEngine* engine,
                                 flower_exchange::persistence::InMemoryRepository* repo,
                                 flower_exchange::realtime::InMemoryWsHub* ws_hub)
    : engine_(engine), repo_(repo), ws_hub_(ws_hub) {}

std::vector<flower_exchange::ExecutionReport> ExchangeService::SubmitSingleOrder(
    flower_exchange::Order order) {
  auto reports = engine_->ProcessOrder(order);
  repo_->SaveReports(reports);
  for (const auto& report : reports) {
    ws_hub_->BroadcastExecutionUpdate(report);
  }
  return reports;
}

std::vector<flower_exchange::ExecutionReport> ExchangeService::SubmitBatchOrders(
    const std::vector<flower_exchange::Order>& orders, const std::string& batch_id) {
  std::vector<flower_exchange::ExecutionReport> all_reports;
  int accepted = 0;
  int rejected = 0;
  for (const auto& order : orders) {
    auto reports = SubmitSingleOrder(order);
    for (const auto& report : reports) {
      if (report.status == flower_exchange::ExecStatus::Rejected) {
        ++rejected;
      } else {
        ++accepted;
      }
    }
    all_reports.insert(all_reports.end(), reports.begin(), reports.end());
  }

  repo_->SaveBatchSummary({batch_id, static_cast<int>(orders.size()), accepted, rejected});
  return all_reports;
}

}  // namespace flower_exchange::app
