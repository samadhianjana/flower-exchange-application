#pragma once

#include "app/exchange_service.hpp"
#include "domain/order.hpp"
#include "persistence/repositories.hpp"
#include "matching/order_book.hpp"

#include <string>
#include <vector>

namespace flower_exchange::api {

std::vector<flower_exchange::ExecutionReport> SubmitSingleOrder(
    flower_exchange::app::ExchangeService* service, const flower_exchange::Order& order,
    const std::string& auth_token, bool (*is_authenticated)(const std::string&));

std::vector<flower_exchange::ExecutionReport> SubmitBatchOrders(
    flower_exchange::app::ExchangeService* service, const std::string& batch_csv,
    const std::string& batch_id, const std::string& auth_token,
    bool (*is_authenticated)(const std::string&));

std::vector<flower_exchange::ExecutionReport> GetReports(
    const flower_exchange::persistence::InMemoryRepository* repo, const std::string& auth_token,
    const std::string& client_order_id);

std::string DownloadReportCsv(const flower_exchange::persistence::InMemoryRepository* repo,
                              const std::string& auth_token);

std::string GetOrderBookSnapshot(const flower_exchange::OrderBookManager* manager,
                                 const std::string& instrument, const std::string& auth_token);

}  // namespace flower_exchange::api
