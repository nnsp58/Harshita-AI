# 02 AI Kernel Architecture

## Definition
The AI Kernel is the foundational runtime environment for Harshita AI. It operates completely independently of the UI framework (React, Vue, CLI).

## Components
- **Kernel Bootstrapper**: Initializes all buses and registries.
- **Session Manager**: Handles cross-session data restoration and crash recovery.
- **Job Manager**: Orchestrates long-running tasks via Queues (Execution -> Retry -> Dead Letter).
- **Resource Monitor**: Tracks CPU, memory, active plugins, and manages auto-restarts via `HealthMonitor`.

## Rule
No application module (Web/Desktop) is allowed to modify the internal state of the Kernel directly. Communication is exclusively through SDK-provided bridges.
