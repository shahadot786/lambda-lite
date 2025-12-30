# Lambda Lite: The Complete Docker Reference 📖

This document provides a line-by-line, command-by-command explanation of every Docker-related file in the project. It is intended for those who want to know **everything** about how the system is built and run.

---

## 1. apps/backend/Dockerfile
*The recipe for the REST API.*

| Line # | Instruction | Detailed Explanation |
|:---:|:---|:---|
| 1 | `# Build stage` | A comment for humans. |
| 2 | `FROM node:20-alpine AS builder` | Starts from Node.js 20 on a tiny Linux (Alpine). `AS builder` creates a named temporary stage for building. |
| 4 | `WORKDIR /app` | Creates and enters the `/app` folder inside the image. |
| 7 | `COPY shared /shared` | Copies the local `shared` folder to `/shared` in the image. |
| 8 | `WORKDIR /shared` | Switches focus to the shared folder. |
| 9 | `COPY shared/package*.json...` | Copies only the library metadata to cache dependencies. |
| 10 | `RUN yarn install` | Installs the libraries needed for the shared package. |
| 13 | `WORKDIR /app` | Switches back to the main app folder. |
| 14 | `COPY apps/backend/package*...` | Copies the backend's metadata. |
| 15 | `COPY apps/backend/tsconfig.json ./` | Copies the TypeScript config (needed for the build). |
| 18 | `RUN yarn install` | Installs backend libraries (including dev-dependencies like TypeScript). |
| 21 | `COPY apps/backend .` | Copies the actual source code (`src`, `server.ts`). |
| 24 | `RUN yarn build` | Runs the `tsc` compiler to turn `.ts` files into `.js` in the `dist/` folder. |
| 27 | `RUN yarn install --production...` | **Crucial**: Deletes the large compilers and dev tools, leaving only what's needed to run. |
| 30 | `FROM node:20-alpine` | Starts a **fresh** second stage. This is why the final image is small! |
| 32 | `WORKDIR /app` | Professional standard workspace. |
| 35 | `COPY --from=builder /shared /shared` | Takes the built shared package from the first stage. |
| 38 | `COPY apps/backend/package*.json ./` | Needed for Node.js to recognize the app. |
| 39 | `COPY --from=builder /app/node_modules ./node_modules` | Takes the "pruned" libraries from the first stage. |
| 42 | `COPY --from=builder /app/dist ./dist` | Takes the finished JavaScript code. |
| 45 | `EXPOSE 8000` | Documentation hint that the app listens on port 8000. |
| 48 | `CMD ["node", "dist/server.js"]` | The command that starts the app when the container begins. |

---

## 2. apps/worker/Dockerfile
*The recipe for the job consumer.*

This file is nearly identical to the backend, except for one critical addition:

| Line # | Instruction | Detailed Explanation |
|:---:|:---|:---|
| 35 | `RUN apk add --no-cache docker-cli` | **Vital**: Installs the Docker tool *inside* the container. This allows the Worker to send "start" commands to the sandbox. |
| 48 | `CMD ["node", "dist/index.js"]` | Starts the worker process instead of the API. |

---

## 3. apps/frontend/Dockerfile
*The recipe for the UI (React + Nginx).*

| Line # | Instruction | Detailed Explanation |
|:---:|:---|:---|
| 2 | `FROM node:20-alpine AS builder` | Builder stage to compile React. |
| 10 | `RUN yarn install` | Downloads Vite, React, etc. |
| 16 | `RUN yarn build` | Vite bundles the React code into static HTML/JS inside the `dist/` folder. |
| 19 | `FROM nginx:alpine` | Switches to a web server (Nginx). We don't need Node.js anymore! |
| 22 | `COPY --from=builder /app/dist /usr/share/nginx/html` | Moves the React website to Nginx's public folder. |
| 25 | `COPY apps/frontend/nginx.conf...` | Overwrites Nginx default settings with our custom SPA and Proxy settings. |
| 29 | `CMD ["nginx", "-g", "daemon off;"]` | Starts Nginx in the foreground so the container stays alive. |

---

## 4. docker/sandbox/Dockerfile
*The isolated room where user code runs.*

| Line # | Instruction | Detailed Explanation |
|:---:|:---|:---|
| 6 | `RUN apk add --no-cache tini` | Installs a tiny process manager. This is important because Node.js doesn't handle Linux signals (like "Stop") well on its own. |
| 9 | `COPY runner.js /app/runner.js` | Copies the script that actually runs the user code. |
| 12 | `ENTRYPOINT ["/sbin/tini", "--"]` | Ensures all processes are stopped correctly when the container ends. |
| 15 | `CMD ["node", "/app/runner.js"]` | The sandbox's only purpose: Run that script and exit. |

---

## 5. infra/docker-compose.yml
*The "Director" of the orchestra.*

Every service has a block. Here is a breakdown of the common commands:

- **`image`**: Download a pre-made image from the internet (e.g., `mongo:7`).
- **`build`**: Don't download; instead, use our Dockerfile to build a custom image.
- **`context: ..`**: Tells Docker to look one folder up to find the files (since the compose file is in `infra/`).
- **`environment`**: Sets variables (API keys, ports) that the code can read at runtime.
- **`ports: "A:B"`**: Map port A on your laptop to port B inside the container.
- **`volumes`**:
  - `mongodb_data:/data/db`: Save database data forever.
  - `/var/run/docker.sock...`: Give the container permission to control Docker on your laptop (used by the worker).
- **`depends_on`**: Don't start this service until the database is ready.
- **`networks`**: Bridges all containers into a private virtual network so they can talk to each other.

---

## 6. Command Guide
*The verbs we used in this chat.*

| Command | Deep Dive Explanation |
|:---|:---|
| `docker compose build` | Looks at all the `build:` lines in your YAML and runs every Dockerfile. |
| `docker compose up -d` | Starts all services in the background (`-d` means "detached"). |
| `docker compose down` | Stops everything and deletes the temporary network. |
| `yarn install --production` | Analyzes `package.json` and deletes any library that isn't absolutely required for the app to run (saves weight). |
| `--ignore-scripts` | Prevents libraries from running complex installation scripts (improves security and speed). |
| `--prefer-offline` | Uses the cache if possible instead of downloading from the internet again. |

---

**Summary**: This architecture uses **Containerization** to ensure that "it works on my machine" means "it works on EVERY machine".
