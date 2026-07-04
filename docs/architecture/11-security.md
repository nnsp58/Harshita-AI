# 11 Security

## Secret Management
**Absolute Rule**: No API keys (OpenAI, Gemini, Stripe) shall ever be embedded, imported, or stored in the frontend or plugin source code.

## Execution Flow
Plugins use the `AIServiceBus` -> The Service Bus dispatches to the `Backend Proxy` -> The Proxy attaches the encrypted environment secrets -> Request is sent to LLM provider.

## Plugin Permissions
Plugins must request capabilities in their `manifest.json`. The Kernel blocks network or storage access if not explicitly permitted.
