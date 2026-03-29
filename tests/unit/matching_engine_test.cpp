#include "matching/matching_engine.hpp"

#include <cassert>

using namespace flower_exchange;

void RunMatchingEngineTests() {
  OrderBookManager manager;
  MatchingEngine engine(&manager);

  Order sell{"", "aa14", "Rose", Side::Sell, 45.0, 100, 100};
  Order buy{"", "aa15", "Rose", Side::Buy, 45.0, 200, 200};

  auto r1 = engine.ProcessOrder(sell);
  assert(!r1.empty());
  assert(r1[0].status == ExecStatus::New);

  auto r2 = engine.ProcessOrder(buy);
  assert(!r2.empty());

  bool saw_fill = false;
  bool saw_pfill = false;
  for (const auto& rep : r2) {
    if (rep.status == ExecStatus::Fill) {
      saw_fill = true;
    }
    if (rep.status == ExecStatus::PFill) {
      saw_pfill = true;
    }
  }
  assert(saw_fill);
  assert(saw_pfill);
}
