#include "ingest/csv_parser.hpp"

#include <algorithm>
#include <cctype>
#include <sstream>
#include <string>
#include <unordered_map>
#include <vector>

namespace flower_exchange::ingest {

namespace {

std::string Trim(std::string value) {
  while (!value.empty() && std::isspace(static_cast<unsigned char>(value.front()))) {
    value.erase(value.begin());
  }
  while (!value.empty() && std::isspace(static_cast<unsigned char>(value.back()))) {
    value.pop_back();
  }
  return value;
}

std::string NormalizeHeader(const std::string& value) {
  std::string normalized;
  normalized.reserve(value.size());
  for (unsigned char ch : value) {
    if (std::isalnum(ch)) {
      normalized.push_back(static_cast<char>(std::tolower(ch)));
    }
  }
  return normalized;
}

std::vector<std::string> SplitCsvRow(const std::string& line) {
  std::vector<std::string> out;
  std::istringstream row(line);
  std::string part;
  while (std::getline(row, part, ',')) {
    out.push_back(Trim(part));
  }
  return out;
}

}  // namespace

std::vector<flower_exchange::Order> ParseOrdersCsv(const std::string& csv) {
  std::vector<flower_exchange::Order> orders;
  std::istringstream input(csv);
  std::string line;
  bool first_line = true;
  int client_order_id_index = 0;
  int instrument_index = 1;
  int side_index = 2;
  int price_index = 3;
  int qty_index = 4;

  while (std::getline(input, line)) {
    if (line.empty()) {
      continue;
    }
    if (first_line) {
      first_line = false;
      const auto headers = SplitCsvRow(line);
      std::unordered_map<std::string, int> index_by_name;
      for (int i = 0; i < static_cast<int>(headers.size()); ++i) {
        index_by_name[NormalizeHeader(headers[i])] = i;
      }

      const bool has_header = index_by_name.find("clordid") != index_by_name.end() ||
                              index_by_name.find("clientorderid") != index_by_name.end();

      if (has_header) {
        if (index_by_name.find("clordid") != index_by_name.end()) {
          client_order_id_index = index_by_name["clordid"];
        } else if (index_by_name.find("clientorderid") != index_by_name.end()) {
          client_order_id_index = index_by_name["clientorderid"];
        }
        if (index_by_name.find("instrument") != index_by_name.end()) {
          instrument_index = index_by_name["instrument"];
        }
        if (index_by_name.find("side") != index_by_name.end()) {
          side_index = index_by_name["side"];
        }
        if (index_by_name.find("price") != index_by_name.end()) {
          price_index = index_by_name["price"];
        }
        if (index_by_name.find("quantity") != index_by_name.end()) {
          qty_index = index_by_name["quantity"];
        }
        continue;
      }
    }

    const auto columns = SplitCsvRow(line);
    const int required_max_index =
        std::max({client_order_id_index, instrument_index, side_index, price_index, qty_index});
    if (static_cast<int>(columns.size()) <= required_max_index) {
      continue;
    }

    flower_exchange::Order o;
    o.client_order_id = columns[client_order_id_index];
    o.instrument = columns[instrument_index];
    try {
      const int parsed_side = std::stoi(columns[side_index]);
      o.side = static_cast<flower_exchange::Side>(parsed_side);
      o.price = std::stod(columns[price_index]);
      o.original_qty = std::stoi(columns[qty_index]);
    } catch (...) {
      continue;
    }
    o.remaining_qty = o.original_qty;
    orders.push_back(o);
  }

  return orders;
}

}  // namespace flower_exchange::ingest
