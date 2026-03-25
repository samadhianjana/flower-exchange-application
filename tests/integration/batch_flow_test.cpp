#include "api/auth.hpp"
#include "api/controllers.hpp"
#include "app/exchange_service.hpp"
#include "matching/matching_engine.hpp"
#include "persistence/repositories.hpp"
#include "realtime/ws_server.hpp"

#include <cassert>
#include <cstdlib>
#include <filesystem>
#include <fstream>
#include <sstream>
#include <string>

using namespace flower_exchange;

void RunBatchFlowIntegrationTests() {
  OrderBookManager books;
  MatchingEngine engine(&books);
  persistence::InMemoryRepository repo;
  realtime::InMemoryWsHub ws;
  app::ExchangeService service(&engine, &repo, &ws);

  auto login = api::Login("trader", "pw");
  assert(login.has_value());

  std::string csv;
  if (const char* csv_path = std::getenv("FLOWER_EXCHANGE_BATCH_CSV_PATH")) {
    std::ifstream input(csv_path);
    if (input) {
      std::ostringstream buffer;
      buffer << input.rdbuf();
      csv = buffer.str();
    }
  }

  auto reports =
      api::SubmitBatchOrders(&service, csv, "batch-001", login->token, api::IsAuthenticated);
  assert(!reports.empty());

  std::string report_output_path = "execution_report.csv";
  if (const char* explicit_output = std::getenv("FLOWER_EXCHANGE_REPORT_OUTPUT_PATH");
      explicit_output != nullptr && *explicit_output != '\0') {
    report_output_path = explicit_output;
  } else if (const char* csv_path = std::getenv("FLOWER_EXCHANGE_BATCH_CSV_PATH");
             csv_path != nullptr && *csv_path != '\0') {
    std::filesystem::path input_path(csv_path);
    const auto output_name = input_path.stem().string() + "_execution_report.csv";
    report_output_path = (input_path.parent_path() / output_name).string();
  }

  std::ofstream output(report_output_path, std::ios::trunc);
  assert(output.good());
  output << repo.ExportReportsCsv();
}
