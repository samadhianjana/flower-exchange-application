#include "api/auth.hpp"
#include "api/controllers.hpp"
#include "app/exchange_service.hpp"
#include "matching/matching_engine.hpp"
#include "persistence/repositories.hpp"
#include "realtime/ws_server.hpp"

#include <cassert>

using namespace flower_exchange;

void RunBatchFlowIntegrationTests() {
  OrderBookManager books;
  MatchingEngine engine(&books);
  persistence::InMemoryRepository repo;
  realtime::InMemoryWsHub ws;
  app::ExchangeService service(&engine, &repo, &ws);

  auto login = api::Login("trader", "pw");
  assert(login.has_value());

  const std::string csv =
      "ClientOrderID,Instrument,Side,Price,Quantity\n"
      "aa11,Rose,1,45,100\n"
      "aa12,Rose,2,0,100\n"
      "aa13,Tulip,2,40,100\n";

  auto reports =
      api::SubmitBatchOrders(&service, csv, "batch-001", login->token, api::IsAuthenticated);
  assert(!reports.empty());
}
