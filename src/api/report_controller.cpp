#include "api/controllers.hpp"
#include "api/auth.hpp"
#include "persistence/repositories.hpp"

#include <string>
#include <vector>

namespace flower_exchange::api {

std::vector<flower_exchange::ExecutionReport> GetReports(
    const flower_exchange::persistence::InMemoryRepository* repo, const std::string& auth_token,
    const std::string& client_order_id) {
  if (!IsAuthenticated(auth_token)) {
    return {};
  }
  if (client_order_id.empty()) {
    return repo->GetReports();
  }
  return repo->GetReportsByClientOrderId(client_order_id);
}

std::string DownloadReportCsv(const flower_exchange::persistence::InMemoryRepository* repo,
                              const std::string& auth_token) {
  if (!IsAuthenticated(auth_token)) {
    return "";
  }
  return repo->ExportReportsCsv();
}

}  // namespace flower_exchange::api