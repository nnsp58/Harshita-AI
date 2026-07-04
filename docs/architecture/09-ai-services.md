# 09 AI Services

## AIServiceBus Overview
Plugins are forbidden from importing vendor SDKs (like `@google/generative-ai` or `openai`).
All AI calls must be dispatched through the `AIServiceBus`.

## Capability Routing & Cost Optimizer
The AIServiceBus uses the Capability Registry to determine the best model for a task based on Cost, Latency, and Success Rate.
- Math capability -> routes to OpenAI (highest logic success rate).
- Casual Translation -> routes to Gemini (lowest cost).

## Graceful Fallback
Gemini -> OpenAI -> Local LLM -> Error Message.
The AIServiceBus abstracts this chain completely away from the calling Agent/Plugin.
