#include "api/controllers.hpp"
#include "api/auth.hpp"
#include "matching/order_book.hpp"

#include <sstream>
#include <string>

namespace flower_exchange::api {

std::string GetOrderBookSnapshot(const flower_exchange::OrderBookManager* manager,
                                 const std::string& instrument, const std::string& auth_token) {
  if (!IsAuthenticated(auth_token)) {
    return "{}";
  }
  const auto& book = const_cast<flower_exchange::OrderBookManager*>(manager)->BookFor(instrument);
  std::ostringstream out;
  out << "{ \"instrument\": \"" << instrument << "\", \"bids\": [";
  bool first = true;
  for (const auto& [price, queue] : book.bids) {
    if (!first) out << ",";
    out << "{ \"price\": " << price << ", \"size\": " << queue.size() << "}";
    first = false;
  }
  out << "], \"asks\": [";
  first = true;
  for (const auto& [price, queue] : book.asks) {
    if (!first) out << ",";
    out << "{ \"price\": " << price << ", \"size\": " << queue.size() << "}";
    first = false;
  }
  out << "] }";
  return out.str();
}

}  // namespace flower_exchange::api