#include "api/auth.hpp"
#include "api/controllers.hpp"
#include "app/exchange_service.hpp"
#include "matching/matching_engine.hpp"
#include "persistence/repositories.hpp"
#include "realtime/ws_server.hpp"

#include <cassert>

using namespace flower_exchange;

void RunOrderFlowIntegrationTests() {
  OrderBookManager books;
  MatchingEngine engine(&books);
  persistence::InMemoryRepository repo;
  realtime::InMemoryWsHub ws;
  app::ExchangeService service(&engine, &repo, &ws);

  auto login = api::Login("trader", "pw");
  assert(login.has_value());

  Order o{"", "ord101", "Rose", Side::Buy, 50.0, 100, 100};
  auto reports = api::SubmitSingleOrder(&service, o, login->token, api::IsAuthenticated);
  assert(!reports.empty());
}
