# 03 Plugin System

## Concept
Every application feature is a Plugin. A Plugin can be a Workspace (UI), an Agent (Logic), or a Tool (Utility).

## Plugin Manifest (`manifest.json`)
Every plugin must define:
```json
{
  "id": "plugin-id",
  "name": "Plugin Name",
  "version": "1.0.0",
  "author": "Harshita Core",
  "capabilities": ["ocr", "translation"],
  "permissions": ["storage:read", "network"],
  "minimumKernelVersion": "1.0.0"
}
```

## Lifecycle API
All plugins must implement the `AIPlugin` interface:
`register()`, `initialize()`, `healthCheck()`, `execute()`, `pause()`, `resume()`, `save()`, `restore()`, `destroy()`.
