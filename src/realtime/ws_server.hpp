#pragma once

#include "domain/order.hpp"

#include <mutex>
#include <string>
#include <vector>

namespace flower_exchange::realtime {

struct WsEvent {
  std::string type;
  std::string version;
  flower_exchange::ExecutionReport payload;
};

class InMemoryWsHub {
 public:
  void BroadcastExecutionUpdate(const flower_exchange::ExecutionReport& report);
  std::vector<WsEvent> DrainEvents();

 private:
  std::mutex mu_;
  std::vector<WsEvent> events_;
};

}  // namespace flower_exchange::realtime
