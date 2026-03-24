#include "validation/validator.hpp"

#include <cassert>

using namespace flower_exchange;

void RunValidatorTests() {
  Validator validator;

  Order good{"", "aa123", "Rose", Side::Buy, 45.0, 100, 100};
  assert(!validator.Validate(good).has_value());

  Order bad_instrument{"", "aa123", "Jasmine", Side::Buy, 45.0, 100, 100};
  assert(validator.Validate(bad_instrument).has_value());

  Order bad_price{"", "aa123", "Rose", Side::Buy, 0.0, 100, 100};
  assert(validator.Validate(bad_price).has_value());

  Order bad_qty{"", "aa123", "Rose", Side::Buy, 45.0, 15, 15};
  assert(validator.Validate(bad_qty).has_value());
}
