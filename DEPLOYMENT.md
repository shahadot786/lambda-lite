# Lambda Lite: Free Deployment Guide 🚀

Deploying a multi-service project like Lambda Lite (Backend, Workers, Redis, MongoDB) for free is challenging but entirely possible. This guide shows you how to do it using "Free Tier" services.

---

## 🏗️ The Deployment Strategy

Because we have many parts, we won't put everything on one server. Instead, we use "Best-in-Class" free tiers:

1.  **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free 512MB Cluster)
2.  **Queue**: [Upstash Redis](https://upstash.com/) (Free 10k requests/day)
3.  **App & Workers**: [Railway](https://railway.app/) or [Render](https://render.com/) (Docker Support) or [Koyeb](https://www.koyeb.com/)
4.  **Frontend**: [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/) (Static deployment)

---

## 🛠️ Step 1: Externalizing Databases

Don't run MongoDB or Redis in Docker when deploying for free; it consumes too much RAM. Use these instead:

### MongoDB (Atlas)
1.  Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a "Shared" cluster (Free).
3.  In "Network Access", allow `0.0.0.0/0` (for now).
4.  Get your Connection String: `mongodb+srv://user:pass@cluster.mongodb.net/...`

### Redis (Upstash)
1.  Create a free account at [Upstash](https://upstash.com/).
2.  Create a Redis database.
3.  Get your Host and Port.

---

## 🚀 Step 2: Deploying to Railway (Recommended)

Railway is excellent for Docker-based projects. They offer a $5/month trial or a "Developer" plan with usage-based billing (very cheap/free for small apps).

1.  **Connect GitHub**: Push your code to a private GitHub repo.
2.  **Add Service**:
    - Select your repo and the `apps/backend` folder.
    - Railway will automatically see the `Dockerfile`.
3.  **Set Environment Variables**:
    - `MONGODB_URI`: (Your Atlas URL)
    - `REDIS_HOST`: (Your Upstash Host)
    - `REDIS_PORT`: (Your Upstash Port)
    - `PORT`: `8000`
4.  **Repeat for Worker**: Add another service for the `apps/worker` folder.

---

## 🏎️ Step 3: Deploying to Render (Alternative)

Render has a generous free tier for Web Services and Workers.

1.  **New Web Service**: Connect your GitHub repo.
2.  **Root Directory**: `apps/backend`.
3.  **Environment**: `Docker`.
4.  **Free Instance**: Select the "Free" plan.
5.  **Environment Variables**: Same as Railway.
6.  **Background Worker**: Deploy the `apps/worker` folder as a "Background Worker" (Render allows 1 free worker).

---

## 🎨 Step 4: Frontend (Vercel/Netlify)

Since our frontend is built with Vite, it's just static files.

1.  Push the project to GitHub.
2.  Import to Vercel.
3.  **Root Directory**: `apps/frontend`.
4.  **Build Command**: `yarn build`.
5.  **Output Directory**: `dist`.
6.  **Environment Variable**: `VITE_API_URL` = (Your Backend URL from Railway/Render).

---

## ⚠️ Important Free Tier Limitations

- **Spin-down**: Free services on Render/Railway might "go to sleep" after 15 minutes of inactivity. The first request after a long time might be slow (20-30 seconds).
- **RAM**: Free tiers usually provide 512MB RAM. Our multi-stage Docker builds are essential here to keep memory low!
- **Sandboxing**: **CAUTION**: Running Docker-in-Docker (the sandbox) requires "Privileged" access which most free hostings (like Render) **do not allow** for security reasons.

### How to solve the Sandbox problem on Free Hosting?
If your hosting doesn't allow Docker-in-Docker:
- Use a **VPS** (Oracle Cloud "Always Free" or Google Cloud "Free Tier").
- Or, modify the worker to run code locally using the `vm` module instead of spawning a container (less secure, but works everywhere).

---

## 🏆 The Ultimate Free Option: Oracle Cloud

If you can get through their registration, Oracle Cloud's "Always Free" tier is the best in the world:
- 4 ARM CPU Cores.
- 24 GB of RAM.
- **You can run your entire Docker Compose stack there for free forever!**

Steps:
1. Create an Ubuntu VM on Oracle Cloud.
2. Install Docker and Docker Compose.
3. `git clone` your repo.
4. `docker compose up -d`.

---

**Good luck with your deployment!** If you choose a platform and get stuck, I can help you with the specific config files for it.
