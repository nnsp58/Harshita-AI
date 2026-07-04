# 13 Deployment

## Monorepo Build Process
Harshita AI is deployed as a suite of decoupled applications powered by a single Kernel.

## CI/CD Pipeline
1. `kernel`, `sdk`, and `shared` packages are built and verified.
2. `apps/web` (React Vite) bundles the Kernel SDK for web deployment.
3. `apps/desktop` (Electron) bundles the Kernel SDK for native deployment.

## Future Marketplace
Plugins will be decoupled from the core build. 
A future `Plugin Marketplace` will allow dynamic fetching and installation of plugins into the Kernel at runtime using module federation.
