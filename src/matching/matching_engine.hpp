#pragma once

#include "domain/order.hpp"
#include "matching/order_book.hpp"
#include "validation/validator.hpp"

#include <vector>

namespace flower_exchange {

class MatchingEngine {
 public:
  explicit MatchingEngine(OrderBookManager* book_manager);
  std::vector<ExecutionReport> ProcessOrder(Order order);
  static std::string TimestampNow();

 private:
  bool IsCrossable(const Order& incoming, double best_opposite_price) const;

  int next_order_id_ = 1;
  OrderBookManager* book_manager_;
  Validator validator_;
};

}  // namespace flower_exchange
