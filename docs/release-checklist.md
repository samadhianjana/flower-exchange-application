# Release Checklist

## Documentation
- [ ] API contract reviewed against frontend usage.
- [x] Setup instructions validated on clean environment.
- [ ] Known limitations documented for Phase 1 scope.

## Quality and Testing
- [x] Unit tests pass for validation, order book, and matching.
- [x] Integration tests pass for auth, order flow, batch flow, and realtime events.
- [x] Acceptance test for Example 6 passes.
- [x] Performance smoke test is executed and recorded.

## Operations
- [ ] Rollback plan documented.
- [ ] Basic monitoring and logs verified.
- [ ] Final sign-off by product and engineering.

## Rollback Plan
1. Revert to previous release tag.
2. Disable websocket update stream if unstable.
3. Restore previous report persistence snapshot.
