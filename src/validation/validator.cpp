#include "validation/validator.hpp"

namespace flower_exchange {

Validator::Validator()
    : allowed_instruments_({"Rose", "Lavender", "Lotus", "Tulip", "Orchid"}) {}

std::optional<ValidationError> Validator::Validate(const Order& order) const {
  if (order.client_order_id.empty() || order.client_order_id.size() > 7) {
    return ValidationError{"Missing required field"};
  }
  if (allowed_instruments_.find(order.instrument) == allowed_instruments_.end()) {
    return ValidationError{"Invalid instrument"};
  }
  if (order.side != Side::Buy && order.side != Side::Sell) {
    return ValidationError{"Invalid side"};
  }
  if (order.price <= 0.0) {
    return ValidationError{"Invalid price"};
  }
  if (order.original_qty < 10 || order.original_qty > 1000) {
    return ValidationError{"Quantity out of range"};
  }
  if ((order.original_qty % 10) != 0) {
    return ValidationError{"Invalid quantity increment"};
  }
  return std::nullopt;
}

}  // namespace flower_exchange
