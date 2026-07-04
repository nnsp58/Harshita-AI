# 14 Testing Strategy

## Mandatory Test Layers
Unit testing UI components is insufficient for an Operating System.

## Architecture Tests
- Verify that `AIServiceBus` gracefully degrades to local fallback.
- Verify that the `EventBus` prevents direct circular dependencies.

## Plugin SDK Tests
- Plugin Isolation: Ensure a crash in `CanvasWorkspace` triggers `SessionManager.recover()` without halting `Kernel`.
- Memory Leak Tests: Ensure `destroy()` correctly clears EventBus subscriptions.

## Workflow Tests
- End-to-end execution of a multi-step intent through the `WorkflowEngine` (Scheduler -> Queue -> Dead Letter validation).
