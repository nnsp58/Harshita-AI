# 07 Event Bus

## Purpose
The Event Bus guarantees loose coupling across the OS. Components never communicate via direct function calls or React context wrappers.

## Pub/Sub Mechanism
- `subscribe(eventName, callback)`
- `emit(eventName, payload)`

## Use Case
A Workspace Plugin finishes rendering a video.
It calls: `EventBus.emit('JOB_COMPLETED', { type: 'video', url: '...' })`.
The File Manager listens to `JOB_COMPLETED` and saves it. The Notification Manager listens to it and alerts the user. Neither knows about the Workspace Plugin directly.
