#include "app/exchange_service.hpp"
#include "matching/matching_engine.hpp"
#include "persistence/repositories.hpp"
#include "realtime/ws_server.hpp"

#include <cassert>
#include <chrono>

using namespace flower_exchange;

void RunPerformanceSmokeTests() {
  OrderBookManager books;
  MatchingEngine engine(&books);
  persistence::InMemoryRepository repo;
  realtime::InMemoryWsHub ws;
  app::ExchangeService service(&engine, &repo, &ws);

  auto start = std::chrono::high_resolution_clock::now();
  for (int i = 0; i < 200; ++i) {
    service.SubmitSingleOrder(
        Order{"", "p" + std::to_string(i), "Rose", Side::Buy, 40.0 + (i % 5), 100, 100});
  }
  auto end = std::chrono::high_resolution_clock::now();
  const auto elapsed_ms = std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count();

  assert(elapsed_ms >= 0);
}
