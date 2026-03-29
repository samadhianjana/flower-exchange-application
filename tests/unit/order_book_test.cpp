#include "matching/order_book.hpp"

#include <cassert>

using namespace flower_exchange;

void RunOrderBookTests() {
  OrderBookManager manager;

  Order b1{"O-1", "b1", "Rose", Side::Buy, 50.0, 100, 100};
  Order b2{"O-2", "b2", "Rose", Side::Buy, 55.0, 100, 100};
  Order s1{"O-3", "s1", "Rose", Side::Sell, 45.0, 100, 100};

  manager.AddRestingOrder(b1);
  manager.AddRestingOrder(b2);
  manager.AddRestingOrder(s1);

  auto& book = manager.BookFor("Rose");
  assert(book.bids.begin()->first == 55.0);
  assert(book.asks.begin()->first == 45.0);
}
