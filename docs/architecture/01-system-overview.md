# 01 System Overview

## Purpose
Harshita AI is an AI Operating System, not a single monolithic application. The primary goal is to provide a framework-agnostic platform where Agents, Workspaces, and Media Generators act as modular plugins running within a robust AI Kernel.

## Core Pillars
1. **The Kernel**: The OS core responsible for events, context, background tasks, and session management.
2. **Plugin Architecture**: All features are decoupled. Workspaces and Agents are registered dynamically.
3. **Multi-Client Strategy**: The same Kernel powers the Web UI, Mobile Apps (React Native), Desktop (Electron), and Headless APIs.
4. **Abstracted Services**: Business logic never imports external SDKs (like Gemini/OpenAI) directly. Instead, they interact with the `AIServiceBus`.

## Flow of Execution
User Request -> Command Center -> Intent Engine -> Capability Registry -> Best Model Routing -> AI Workflow Engine -> Active Workspace (Plugin) -> Event Bus -> Analytics & Persistence.
