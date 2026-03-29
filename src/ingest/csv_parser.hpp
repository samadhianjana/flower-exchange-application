#pragma once

#include "domain/order.hpp"

#include <string>
#include <vector>

namespace flower_exchange::ingest {

std::vector<flower_exchange::Order> ParseOrdersCsv(const std::string& csv);

}  // namespace flower_exchange::ingest
