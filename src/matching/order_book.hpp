#pragma once

#include "domain/order.hpp"

#include <deque>
#include <functional>
#include <map>
#include <string>

namespace flower_exchange {

using PriceLevel = std::deque<Order>;

struct InstrumentBook {
  std::map<double, PriceLevel, std::greater<double>> bids;
  std::map<double, PriceLevel, std::less<double>> asks;
};

class OrderBookManager {
 public:
  void AddRestingOrder(const Order& order);
  InstrumentBook& BookFor(const std::string& instrument);

 private:
  std::map<std::string, InstrumentBook> books_;
};

}  // namespace flower_exchange
