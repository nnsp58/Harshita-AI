# 08 Context Bus

## Purpose
While the Event Bus is for ephemeral events, the Context Bus maintains synchronized global state across the entire session.

## Data Maintained
- `currentIntent`
- `activePlugin`
- `activeWorkspace`
- `cursorPosition`
- `clipboard`

## Workflow
If the user switches from the Desktop UI to a Voice Command, the Voice Agent reads the Context Bus to know what the user is currently looking at (e.g., "Make this text bolder"). The Context Bus makes multi-modal interaction seamless.
