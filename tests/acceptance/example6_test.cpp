#include "app/exchange_service.hpp"
#include "matching/matching_engine.hpp"
#include "persistence/repositories.hpp"
#include "realtime/ws_server.hpp"

#include <cassert>

using namespace flower_exchange;

void RunExample6AcceptanceTest() {
  OrderBookManager books;
  MatchingEngine engine(&books);
  persistence::InMemoryRepository repo;
  realtime::InMemoryWsHub ws;
  app::ExchangeService service(&engine, &repo, &ws);

  service.SubmitSingleOrder(Order{"", "aa13", "Rose", Side::Buy, 55.0, 100, 100});
  service.SubmitSingleOrder(Order{"", "aa14", "Rose", Side::Buy, 65.0, 100, 100});
  service.SubmitSingleOrder(Order{"", "aa15", "Rose", Side::Sell, 1.0, 300, 300});
  service.SubmitSingleOrder(Order{"", "aa16", "Rose", Side::Buy, 2.0, 100, 100});

  auto reports = repo.GetReports();
  bool aa14_fill = false;
  bool aa13_fill = false;
  bool aa16_fill = false;
  for (const auto& r : reports) {
    if (r.client_order_id == "aa14" && r.status == ExecStatus::Fill) aa14_fill = true;
    if (r.client_order_id == "aa13" && r.status == ExecStatus::Fill) aa13_fill = true;
    if (r.client_order_id == "aa16" && r.status == ExecStatus::Fill) aa16_fill = true;
  }
  assert(aa14_fill);
  assert(aa13_fill);
  assert(aa16_fill);
}
