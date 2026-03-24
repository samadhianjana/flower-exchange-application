#pragma once

#include "domain/order.hpp"

#include <set>
#include <string>

namespace flower_exchange {

class Validator {
 public:
  Validator();
  std::optional<ValidationError> Validate(const Order& order) const;

 private:
  std::set<std::string> allowed_instruments_;
};

}  // namespace flower_exchange
