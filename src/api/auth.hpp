#pragma once

#include <optional>
#include <string>

namespace flower_exchange::api {

enum class Role { Trader, Admin };

struct Session {
  std::string token;
  Role role = Role::Trader;
};

std::optional<Session> Login(const std::string& username, const std::string& password);
bool IsAuthenticated(const std::string& token);
bool IsAdmin(const std::string& token);

}  // namespace flower_exchange::api
