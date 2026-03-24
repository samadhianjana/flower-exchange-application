#include "matching/order_book.hpp"

namespace flower_exchange {

void OrderBookManager::AddRestingOrder(const Order& order) {
  auto& book = books_[order.instrument];
  if (order.side == Side::Buy) {
    book.bids[order.price].push_back(order);
  } else {
    book.asks[order.price].push_back(order);
  }
}

InstrumentBook& OrderBookManager::BookFor(const std::string& instrument) {
  return books_[instrument];
}

}  // namespace flower_exchange
