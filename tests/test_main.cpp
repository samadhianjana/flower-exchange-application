#include <iostream>

void RunValidatorTests();
void RunOrderBookTests();
void RunMatchingEngineTests();
void RunAuthAndRoleTests();
void RunOrderFlowIntegrationTests();
void RunBatchFlowIntegrationTests();
void RunRealtimeEventTests();
void RunExample6AcceptanceTest();
void RunPerformanceSmokeTests();

int main() {
  RunValidatorTests();
  RunOrderBookTests();
  RunMatchingEngineTests();
  RunAuthAndRoleTests();
  RunOrderFlowIntegrationTests();
  RunBatchFlowIntegrationTests();
  RunRealtimeEventTests();
  RunExample6AcceptanceTest();
  RunPerformanceSmokeTests();
  std::cout << "All exchange_core tests passed.\n";
  return 0;
}
