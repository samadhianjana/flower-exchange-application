#include "api/controllers.hpp"
#include "app/exchange_service.hpp"
#include "ingest/csv_parser.hpp"

#include <string>
#include <vector>

namespace flower_exchange::api {

std::vector<flower_exchange::ExecutionReport> SubmitSingleOrder(
    flower_exchange::app::ExchangeService* service, const flower_exchange::Order& order,
    const std::string& auth_token, bool (*is_authenticated)(const std::string&)) {
  if (!is_authenticated(auth_token)) {
    return {};
  }
  return service->SubmitSingleOrder(order);
}

std::vector<flower_exchange::ExecutionReport> SubmitBatchOrders(
    flower_exchange::app::ExchangeService* service, const std::string& batch_csv,
    const std::string& batch_id, const std::string& auth_token,
    bool (*is_authenticated)(const std::string&)) {
  if (!is_authenticated(auth_token)) {
    return {};
  }
  auto orders = flower_exchange::ingest::ParseOrdersCsv(batch_csv);
  return service->SubmitBatchOrders(orders, batch_id);
}

}  // namespace flower_exchange::api
