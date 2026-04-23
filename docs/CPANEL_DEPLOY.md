# finwy-web on cPanel — recommended setup

## `standalone` vs static (`output: "export"`)

| Mode | Typical use |
|------|--------------|
| **`output: "standalone"`** | **Node server** — runs `server.js`, supports **Route Handlers** (`app/api/**`). Needed for this project’s **same-origin** `/api/auth/*` (cookies, refresh). |
| **`output: "export"`** | **Static files only** (Apache `public_html`). **No** server-side API routes — build fails unless you remove all `app/api/**` and redesign auth to talk to the backend **only** from the browser (different cookies/CORS tradeoffs). |

**Conclusion:** For **Finwy’s current code**, deploying on cPanel means using cPanel’s **Node.js Application** feature (Passenger / Node selector), **not** “upload HTML only.”

---

## Recommended: Node.js app on cPanel + standalone bundle

### 1) Build on your PC (Linux/WSL preferred for native deps)

```bash
cd finwy-web
export NEXT_PUBLIC_API_URL=https://your-backend-url/api/v1
export NEXT_PUBLIC_BASE_URL=https://your-frontend-url
npm ci
npm run build
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
```

### 2) Zip the **contents** of `.next/standalone/`

Upload and extract under your Node app root (e.g. `/home/user/nodeapps/finwy-web/`).

### 3) In cPanel → **Setup Node.js Application**

| Field | Example |
|-------|---------|
| **Application root** | Folder containing **`server.js`** after extract |
| **Application URL** | Your site or subdomain |
| **Application startup file** | **`server.js`** |
| **Application mode** | **Production** |

If the UI only allows `app.js`, use **SSH** into that folder — many hosts still start **`server.js`** when configured in **package.json** `"start": "next start"` or when **startup file** is set to `server.js`.

Set env in the panel if offered: **`HOSTNAME=0.0.0.0`**, **`PORT`** as assigned by the host.

### 4) Restart the app after each deploy

Use cPanel **Restart**, or SSH: touch/restart via the host’s documented command.

---

## Static hosting only (“no Node on my plan”)?

Possible only after **engineering work**:

- Remove or bypass **all** `src/app/api/**` routes.
- Point `api-client` **only** at **`NEXT_PUBLIC_API_URL`** (backend), handle refresh/access tokens **without** same-origin cookie BFF (security and CORS changes on the backend).

That is **not** a config flip — it’s a deliberate auth refactor.

---

## Summary

**Best practical solution on cPanel:** enable **Node.js**, deploy the **standalone** artifact, **startup `server.js`**.  
Keep **`output: "standalone"`** in `next.config.ts` — do **not** switch to **`export`** unless you fully migrate off Route Handlers.
