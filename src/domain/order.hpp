#pragma once

#include <optional>
#include <string>

namespace flower_exchange {

enum class Side { Buy = 1, Sell = 2 };
enum class ExecStatus { New = 0, Rejected = 1, Fill = 2, PFill = 3 };

struct Order {
  std::string order_id;
  std::string client_order_id;
  std::string instrument;
  Side side = Side::Buy;
  double price = 0.0;
  int original_qty = 0;
  int remaining_qty = 0;
};

struct ValidationError {
  std::string reason;
};

struct ExecutionReport {
  std::string client_order_id;
  std::string order_id;
  std::string instrument;
  Side side = Side::Buy;
  double price = 0.0;
  int quantity = 0;
  ExecStatus status = ExecStatus::New;
  std::optional<std::string> reason;
  std::string transaction_time;
};

}  // namespace flower_exchange
