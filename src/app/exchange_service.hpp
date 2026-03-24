#pragma once

#include "domain/order.hpp"
#include "matching/matching_engine.hpp"
#include "persistence/repositories.hpp"
#include "realtime/ws_server.hpp"

namespace flower_exchange::app {

class ExchangeService {
 public:
  ExchangeService(flower_exchange::MatchingEngine* engine,
                  flower_exchange::persistence::InMemoryRepository* repo,
                  flower_exchange::realtime::InMemoryWsHub* ws_hub);

  std::vector<flower_exchange::ExecutionReport> SubmitSingleOrder(flower_exchange::Order order);
  std::vector<flower_exchange::ExecutionReport> SubmitBatchOrders(
      const std::vector<flower_exchange::Order>& orders, const std::string& batch_id);

 private:
  flower_exchange::MatchingEngine* engine_;
  flower_exchange::persistence::InMemoryRepository* repo_;
  flower_exchange::realtime::InMemoryWsHub* ws_hub_;
};

}  // namespace flower_exchange::app
