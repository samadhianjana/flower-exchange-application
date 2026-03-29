cmake_minimum_required(VERSION 3.16)
project(flower_exchange_application LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_library(exchange_core
    src/domain/order.cpp
    src/validation/validator.cpp
    src/matching/order_book.cpp
    src/matching/matching_engine.cpp
    src/ingest/csv_parser.cpp
)

target_include_directories(exchange_core PUBLIC src)

enable_testing()

add_executable(exchange_core_tests
    tests/unit/validator_test.cpp
    tests/unit/order_book_test.cpp
    tests/unit/matching_engine_test.cpp
    tests/integration/auth_and_role_test.cpp
    tests/integration/order_flow_test.cpp
    tests/integration/batch_flow_test.cpp
    tests/integration/realtime_event_test.cpp
    tests/acceptance/example6_test.cpp
    tests/performance/perf_smoke_test.cpp
    tests/test_main.cpp
    src/api/auth.cpp
    src/api/order_controller.cpp
    src/api/report_controller.cpp
    src/api/orderbook_controller.cpp
    src/app/exchange_service.cpp
    src/persistence/repositories.cpp
    src/realtime/ws_server.cpp
)

target_link_libraries(exchange_core_tests PRIVATE exchange_core)

add_test(NAME exchange_core_tests COMMAND exchange_core_tests)
