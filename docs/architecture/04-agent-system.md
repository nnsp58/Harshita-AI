# 04 Agent System

## Overview
Agents are autonomous logic units that subscribe to the Universal Context Bus. They do not have their own UI.

## Agent SDK
Every agent must inherit from `AgentSDK`.
- `processIntent()`: Decodes what the user wants.
- `executeTask()`: Emits a multi-step workflow.

## Types of Agents
- Application Writer, Legal Draftsman, Math Solver, OCR Engine.
They use the `CapabilityRegistry` to fetch the optimal AI model via `AIServiceBus`.
