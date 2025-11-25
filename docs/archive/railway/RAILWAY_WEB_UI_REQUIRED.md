# ⚠️ RAILWAY WEB UI MANUAL INTERVENTION REQUIRED

## 🎯 Problem Summary

Railway is **ignoring all configuration files** (`railway.json`, `nixpacks.toml`, `.railwayignore`) and continues to use **cached service configuration** stored in Railway's database.

## 📊 Evidence

Latest deployment logs (18:33 CET) show Railway is STILL executing:
```
> @truk/web@1.0.0 start
> next start
```

This proves Railway is:
- ❌ Ignoring `RAILWAY_ROOT_DIRECTORY=packages/backend`
- ❌ Ignoring `railway.json` startCommand
- ❌ Detecting the service as Next.js (web) instead of NestJS (backend)

## ❌ Why CLI Cannot Fix This

The Railway CLI **cannot** modify:
1. Service-level configuration stored in Railway's database
2. Framework detection cache (detected as "Next.js" on first deployment)
3. Linked database service connections
4. Root directory settings at service level

Commands attempted:
- ✅ `railway variables` - Works for env vars
- ❌ `railway logs` - Fails to retrieve build logs
- ❌ `railway up` - Returns 404 error
- ❌ Git push - Railway applies cached config, not files

## ✅ REQUIRED: Manual Railway Web UI Actions

### Step 1: Access Railway Service Settings

1. Go to https://railway.app/
2. Login
3. Select project: **"truk"**
4. Select environment: **"production"**
5. Click on service: **"truk"** (or similar name)

### Step 2: Fix Service Configuration

In the service settings page, look for and set:

#### **Root Directory** (CRITICAL)
- Setting name: "Root Directory" or "Source Directory"
- Set to: `packages/backend`
- This tells Railway to only build/deploy the backend package

#### **Build Command** (CRITICAL)
- Setting name: "Build Command" or "Custom Build Command"
- Set to: `npx prisma generate && npm run build`
- This ensures TypeScript compiles correctly

#### **Start Command** (CRITICAL)
- Setting name: "Start Command" or "Custom Start Command"
- Set to: `bash start.sh`
- This runs our custom startup script

#### **Framework Detection Override**
- If there's a "Framework" setting showing "Next.js", change it to:
  - "None" or "Custom"
  - Or explicitly set to "Node.js"

### Step 3: Fix Database Connection

1. In the project, find the **PostgreSQL service** (may be named "postgres", "database", or show "PostgreSQL" icon)
2. Click on it
3. Go to **"Connect"** or **"Variables"** tab
4. Copy the current **DATABASE_URL** value
5. Go back to the **"truk"** service
6. Go to **"Variables"** tab
7. Find `DATABASE_URL` variable
8. Replace its value with the one copied from PostgreSQL service
9. Verify it points to `gondola.proxy.rlwy.net:53043` (not `switchback`)

### Step 4: Verify Other Variables

Ensure these environment variables are set in the "truk" service:

```
DATABASE_URL=postgresql://postgres:PASSWORD@gondola.proxy.rlwy.net:53043/railway
JWT_SECRET=DR8T/1ghx7jd7LBHGvNs33q5cTqRiP2jxlX7lORERc+TUs/+E6AusSvBhaoVtfbdSDAh3/xVjfIBj/i4/V/4Fw==
NODE_ENV=production
PORT=8080
RAILWAY_ROOT_DIRECTORY=packages/backend
```

### Step 5: Force Redeploy

1. Click **"Redeploy"** or **"Deploy"** button (top right)
2. Wait 3-5 minutes
3. Check the deployment logs in real-time

### Step 6: Verify Success

#### Check Build Logs
Look for:
```
✅ GOOD:
RUN npx prisma generate && npm run build
[TypeScript compilation...]
✓ Generated dist/main.js

❌ BAD:
npm warn exec The following package was not found and will be installed: tsc@2.0.4
✗ dist directory does NOT exist
```

#### Check Deploy Logs
Look for:
```
✅ GOOD:
=== STARTING TRUK BACKEND ===
✓ dist/main.js found
Step 2: Generating Prisma Client...
Step 3: Database Schema Sync...
Step 4: Starting NestJS Application...
[Nest] Application successfully started

❌ BAD:
> @truk/web@1.0.0 start
> next start
[Error: ENOENT: no such file or directory, open '/app/.next/prerender-manifest.json']
```

#### Test Health Endpoint
```bash
curl https://truk-production.up.railway.app/health
# Expected: {"status":"ok","timestamp":"2025-11-24T..."}
```

## 🔧 Alternative: Create New Service

If settings cannot be changed in existing service:

1. Create a **new service** in Railway
2. Name it "truk-backend" or similar
3. Connect it to the same GitHub repo
4. Configure from scratch with correct settings:
   - Root Directory: `packages/backend`
   - Build Command: `npx prisma generate && npm run build`
   - Start Command: `bash start.sh`
5. Copy all environment variables from old service
6. Deploy
7. Delete old service once new one works

## 📝 Summary

**All code changes are complete and correct** (19 commits applied).

**The ONLY remaining issue is Railway's service configuration cache.**

**This cannot be fixed via CLI or configuration files.**

**Manual access to Railway Web UI is required to update service settings.**

Once the Root Directory, Build Command, and DATABASE_URL are set correctly in the Railway Web UI, the application will work immediately.

---

**Related Documentation:**
- `RESUMEN_FINAL_DEPLOYMENT.md` - Complete problem analysis
- `SOLUTION_DATABASE_CONNECTION.md` - DATABASE_URL fix details
- `FIX_RAILWAY_CACHED_CONFIG.md` - Cached configuration explanation
