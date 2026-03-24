#include "matching/matching_engine.hpp"

#include <chrono>
#include <iomanip>
#include <sstream>

namespace flower_exchange {

namespace {
ExecutionReport MakeReport(const Order& order, ExecStatus status, int qty,
                           std::optional<std::string> reason = std::nullopt) {
  return ExecutionReport{order.client_order_id, order.order_id, order.instrument, order.side,
                         order.price, qty, status, std::move(reason),
                         MatchingEngine::TimestampNow()};
}
}  // namespace

MatchingEngine::MatchingEngine(OrderBookManager* book_manager) : book_manager_(book_manager) {}

std::vector<ExecutionReport> MatchingEngine::ProcessOrder(Order incoming) {
  std::vector<ExecutionReport> reports;

  auto maybe_error = validator_.Validate(incoming);
  if (maybe_error.has_value()) {
    incoming.order_id = "R-" + std::to_string(next_order_id_++);
    reports.push_back(
        MakeReport(incoming, ExecStatus::Rejected, incoming.original_qty, maybe_error->reason));
    return reports;
  }

  incoming.order_id = "O-" + std::to_string(next_order_id_++);
  incoming.remaining_qty = incoming.original_qty;

  auto& instrument_book = book_manager_->BookFor(incoming.instrument);
  bool matched_any = false;

  auto match_side = [&]() {
    if (incoming.side == Side::Buy) {
      while (incoming.remaining_qty > 0 && !instrument_book.asks.empty()) {
        auto best_it = instrument_book.asks.begin();
        if (!IsCrossable(incoming, best_it->first)) {
          break;
        }
        auto& queue = best_it->second;
        while (incoming.remaining_qty > 0 && !queue.empty()) {
          auto& resting = queue.front();
          const int trade_qty = std::min(incoming.remaining_qty, resting.remaining_qty);
          incoming.remaining_qty -= trade_qty;
          resting.remaining_qty -= trade_qty;
          matched_any = true;

          reports.push_back(MakeReport(incoming,
                                       incoming.remaining_qty == 0 ? ExecStatus::Fill
                                                                   : ExecStatus::PFill,
                                       trade_qty));
          reports.push_back(MakeReport(resting,
                                       resting.remaining_qty == 0 ? ExecStatus::Fill
                                                                  : ExecStatus::PFill,
                                       trade_qty));

          if (resting.remaining_qty == 0) {
            queue.pop_front();
          }
        }
        if (queue.empty()) {
          instrument_book.asks.erase(best_it);
        }
      }
    } else {
      while (incoming.remaining_qty > 0 && !instrument_book.bids.empty()) {
        auto best_it = instrument_book.bids.begin();
        if (!IsCrossable(incoming, best_it->first)) {
          break;
        }
        auto& queue = best_it->second;
        while (incoming.remaining_qty > 0 && !queue.empty()) {
          auto& resting = queue.front();
          const int trade_qty = std::min(incoming.remaining_qty, resting.remaining_qty);
          incoming.remaining_qty -= trade_qty;
          resting.remaining_qty -= trade_qty;
          matched_any = true;

          reports.push_back(MakeReport(incoming,
                                       incoming.remaining_qty == 0 ? ExecStatus::Fill
                                                                   : ExecStatus::PFill,
                                       trade_qty));
          reports.push_back(MakeReport(resting,
                                       resting.remaining_qty == 0 ? ExecStatus::Fill
                                                                  : ExecStatus::PFill,
                                       trade_qty));

          if (resting.remaining_qty == 0) {
            queue.pop_front();
          }
        }
        if (queue.empty()) {
          instrument_book.bids.erase(best_it);
        }
      }
    }
  };

  match_side();

  if (incoming.remaining_qty > 0) {
    if (!matched_any) {
      reports.push_back(MakeReport(incoming, ExecStatus::New, incoming.remaining_qty));
    }
    book_manager_->AddRestingOrder(incoming);
  }

  return reports;
}

bool MatchingEngine::IsCrossable(const Order& incoming, double best_opposite_price) const {
  if (incoming.side == Side::Buy) {
    return best_opposite_price <= incoming.price;
  }
  return best_opposite_price >= incoming.price;
}

std::string MatchingEngine::TimestampNow() {
  const auto now = std::chrono::system_clock::now();
  const auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(now.time_since_epoch()) %
                  std::chrono::seconds(1);
  const std::time_t t = std::chrono::system_clock::to_time_t(now);
  std::tm tm = *std::localtime(&t);

  std::ostringstream oss;
  oss << std::put_time(&tm, "%Y%m%d-%H%M%S") << "." << std::setw(3) << std::setfill('0')
      << ms.count();
  return oss.str();
}

}  // namespace flower_exchange
