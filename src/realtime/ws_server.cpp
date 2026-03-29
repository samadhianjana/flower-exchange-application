#include "realtime/ws_server.hpp"

namespace flower_exchange::realtime {

void InMemoryWsHub::BroadcastExecutionUpdate(const flower_exchange::ExecutionReport& report) {
  std::lock_guard<std::mutex> lock(mu_);
  events_.push_back(WsEvent{"execution_report", "v1", report});
}

std::vector<WsEvent> InMemoryWsHub::DrainEvents() {
  std::lock_guard<std::mutex> lock(mu_);
  auto copy = events_;
  events_.clear();
  return copy;
}

}  // namespace flower_exchange::realtime
