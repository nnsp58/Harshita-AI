# 06 Memory Engine

## Purpose
The AI Memory Engine acts as the contextual brain for the session and long-term user history.

## Mechanisms
- **Short-term Memory**: Powered by the Context Bus (Current task, intent, active workspace).
- **Long-term Memory**: Stored via the Storage Provider (Preferred templates, past routing failures, frequently used tools).

## Integration
When an Agent executes, it queries the Memory Engine:
`MemoryEngine.getPreferences('resume_template') -> returns ID`.
This ensures personalized and context-aware responses.
