#include "realtime/ws_server.hpp"

#include <cassert>

using namespace flower_exchange;

void RunRealtimeEventTests() {
  realtime::InMemoryWsHub hub;
  ExecutionReport r{"aa1", "O-1", "Rose", Side::Buy, 45.0, 100, ExecStatus::New, std::nullopt,
                    "20260324-120000.000"};
  hub.BroadcastExecutionUpdate(r);
  hub.BroadcastExecutionUpdate(r);

  auto events = hub.DrainEvents();
  assert(events.size() == 2);
  auto second_read = hub.DrainEvents();
  assert(second_read.empty());
}
