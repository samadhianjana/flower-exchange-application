#include "api/auth.hpp"

#include <cassert>

using namespace flower_exchange::api;

void RunAuthAndRoleTests() {
  auto invalid = Login("trader", "");
  assert(!invalid.has_value());

  auto trader = Login("trader", "pw");
  assert(trader.has_value());
  assert(IsAuthenticated(trader->token));
  assert(!IsAdmin(trader->token));

  auto admin = Login("admin", "pw");
  assert(admin.has_value());
  assert(IsAuthenticated(admin->token));
  assert(IsAdmin(admin->token));
}
