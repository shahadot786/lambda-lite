# Lambda Lite: Troubleshooting & Debug Log

This document chronicles the major technical hurdles encountered during the project modernization and Docker deployment phase, and the solutions implemented to resolve them.

## 1. Port Conflicts (Infrastructure)

### Problem
- **MongoDB**: Failed to start because port `27017` was already in use by a local MongoDB instance.
- **Prometheus**: Failed to start because port `9090` was occupied by a local process (`antigravi`).

### Solution
- **Action**: Identified and terminated conflicting processes using `sudo lsof -t -i:<port> | xargs sudo kill -9`.
- **Optimization**: Updated `docker-compose.yml` to explicitly map ports and ensured clean container restarts using `docker compose down` before rebuilding.

## 2. TypeScript & ESM Runtime Crashes

### Problem
- The project used `module: ESNext` and `moduleResolution: bundler`.
- **Docker Error**: `ERR_MODULE_NOT_FOUND` when importing internal files (e.g., `logger/jobLogger`).
- **Cause**: Node.js ESM requires explicit `.js` extensions for relative imports at runtime. The codebase used extensionless imports, which work in dev (with `tsx`) but fail in production `node` environments.

### Solution
- **Action**: Reverted `tsconfig.json` output to `module: CommonJS` and `moduleResolution: node`.
- **Rationale**: CommonJS allows extensionless imports at runtime without requiring a custom loader or refactoring hundreds of import statements.
- **Dev Compatibility**: Kept `tsx` for local development to maintain high speed.

## 3. Missing Entrypoints in Compilation

### Problem
- **Docker Error**: `Error: Cannot find module '/app/dist/server.js'`.
- **Cause**: The root entrypoint files (`apps/backend/server.ts` and `apps/worker/index.ts`) were located outside the `src` folder. `tsconfig.json` was configured with `"include": ["src/**/*"]`, so the entrypoints were never compiled into `dist/`.

### Solution
- **Action**: Updated `tsconfig.json` `include` arrays to `["src/**/*", "server.ts"]` (for backend) and `["src/**/*", "index.ts"]` (for worker).

## 4. Shared Package Linking in Docker

### Problem
- **Docker Error**: `ERR_MODULE_NOT_FOUND` for `@lambda-lite/shared`.
- **Cause**:
    1. The build context was set to `apps/backend`, so the `shared` folder was inaccessible to Docker.
    2. `shared/package.json` entrypoints (`main`, `types`) pointed to `.ts` files instead of compiled `.js` files in `dist`.

### Solution
- **Action**: 
    1. Set the Docker build context to the project root (`..`).
    2. Explicitly copied the `shared` folder in Dockerfiles *before* the application code.
    3. Updated `shared/package.json` to point to `dist/index.js`.
    4. Added a `yarn build` step for the shared package in the Docker builder stage.

## 5. Transient DNS Issues in Docker Build

### Problem
- **Docker Error**: `EAI_AGAIN registry.yarnpkg.com` during `yarn install --production` in the final image stage.
- **Cause**: Intermittent network/DNS failures within the Docker build environment.

### Solution
- **Action**: Refactored Dockerfiles to use a multi-stage build strategy where *all* dependencies (including production-only ones) are prepared in the **builder** stage.
- **Implementation**: Used `yarn install --production --ignore-scripts --prefer-offline` in the builder stage and copied the resulting `node_modules` to the final production image. This removed the need for network access in the final stage.

## 6. Disconnected Service Communication

### Problem
- Real-time updates were not working in Docker.
- **Cause**: 
    1. Workers were trying to connect to `BACKEND_URL=http://localhost:8000`. Inside Docker, `localhost` refers to the container itself, not the backend service.
    2. Nginx was configured to proxy to port `3000` instead of the new `8000`.

### Solution
- **Action**:
    1. Updated `docker-compose.yml` to set `BACKEND_URL: http://backend:8000`.
    2. Updated `nginx.conf` and `VITE_API_URL` to route all traffic through the relative `/api` path, allowing Nginx to handle service discovery.
    3. Enabled WebSocket proxying in Nginx with `Upgrade` and `Connection` headers.

---

**Built with ❤️ for a stable, scalable, and fully Dockerized Lambda Lite.**
