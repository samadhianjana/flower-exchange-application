#include "ingest/csv_parser.hpp"

#include <sstream>
#include <string>
#include <vector>

namespace flower_exchange::ingest {

std::vector<flower_exchange::Order> ParseOrdersCsv(const std::string& csv) {
  std::vector<flower_exchange::Order> orders;
  std::istringstream input(csv);
  std::string line;
  bool first_line = true;

  while (std::getline(input, line)) {
    if (line.empty()) {
      continue;
    }
    if (first_line) {
      first_line = false;
      if (line.find("ClientOrderID") != std::string::npos) {
        continue;
      }
    }

    std::istringstream row(line);
    std::string client_order_id;
    std::string instrument;
    std::string side_str;
    std::string price_str;
    std::string qty_str;

    if (!std::getline(row, client_order_id, ',')) continue;
    if (!std::getline(row, instrument, ',')) continue;
    if (!std::getline(row, side_str, ',')) continue;
    if (!std::getline(row, price_str, ',')) continue;
    if (!std::getline(row, qty_str, ',')) continue;

    flower_exchange::Order o;
    o.client_order_id = client_order_id;
    o.instrument = instrument;
    o.side = (std::stoi(side_str) == 1) ? flower_exchange::Side::Buy : flower_exchange::Side::Sell;
    o.price = std::stod(price_str);
    o.original_qty = std::stoi(qty_str);
    o.remaining_qty = o.original_qty;
    orders.push_back(o);
  }

  return orders;
}

}  // namespace flower_exchange::ingest
