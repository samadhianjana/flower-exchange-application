#include "api/auth.hpp"

#include <map>

namespace flower_exchange::api {

namespace {
std::map<std::string, Role> kTokenStore;
}

std::optional<Session> Login(const std::string& username, const std::string& password) {
  if (password.empty()) {
    return std::nullopt;
  }
  Role role = (username == "admin") ? Role::Admin : Role::Trader;
  std::string token = "token_" + username;
  kTokenStore[token] = role;
  return Session{token, role};
}

bool IsAuthenticated(const std::string& token) { return kTokenStore.find(token) != kTokenStore.end(); }

bool IsAdmin(const std::string& token) {
  auto it = kTokenStore.find(token);
  return it != kTokenStore.end() && it->second == Role::Admin;
}

}  // namespace flower_exchange::api
