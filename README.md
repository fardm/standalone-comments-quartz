# Cloudflare Comments

A lightweight, serverless commenting system designed for static sites. It has been entirely rebuilt to run on **Cloudflare Workers** and **Cloudflare D1** (SQLite) to be fast, free, and easy to host. The admin panel is an SPA hosted on **Cloudflare Pages**.

## Features

- 🌍 Multilingual support (English & Persian)
- 😀 Reactions for both posts and comments
- 👤 Gravatar integration with fallback avatars
- 💬 Latest comments widget
- 🛠️ Modern Admin Panel to view and moderate comments
- 🛡️ Spam protection, rate limiting, and honeypot
- ☁️ 100% Serverless on Cloudflare (no PHP or VPS required)

---

## 1. Requirements & Installation

1. A Cloudflare account
2. Node.js (v18+) and npm installed
3. `wrangler` CLI installed (`npm install -g wrangler`)
4. Log into wrangler: `npx wrangler login`

Clone the repository and install dependencies:
```bash
git clone https://github.com/your-username/cloudflare-comments.git
cd cloudflare-comments
npm install
```

## 2. Database Setup (Cloudflare D1)

1. Create a D1 database on Cloudflare:
```bash
npx wrangler d1 create comments-db
```
2. Wrangler will output a block of configuration (specifically `database_id`). Open `worker/wrangler.toml` and paste the `database_id` value.
3. Initialize the database schema:
```bash
cd worker
npx wrangler d1 execute comments-db --remote --file=schema.sql
```

## 3. Local Configuration & Secrets

### Admin Password Setup
For security, the admin password is provided as a secret, so it's not checked into source control. Create a `.dev.vars` file in the `worker/` directory for local development:
```bash
echo "ADMIN_PASSWORD_HASH=mypassword" > worker/.dev.vars
```

### Wrangler Configuration
Open `worker/wrangler.toml` and update the `[vars]` block:
```toml
[vars]
ALLOWED_ORIGINS = "*" # Or specify exact domains separated by commas (e.g. "https://myblog.com, http://localhost:8787")
APP_URL = "http://localhost:8787" # The URL of the worker API
```

## 4. Running Locally

### Worker (API)
Start the worker API locally:
```bash
cd worker
npx wrangler dev
```
It will run on `http://localhost:8787`.

### Admin Dashboard (Pages)
The Admin panel is a static SPA. Serve it locally using `npx serve` or any static HTTP server:
```bash
cd admin
npx serve -p 3000
```
Open `http://localhost:3000/index.html`.
*Note:* The admin panel tries to connect to `/api.php` by default. To point it to the local worker, inject `COMMENTS_CONFIG`:
```html
<script>
window.COMMENTS_CONFIG = { apiUrl: 'http://localhost:8787/api.php' };
</script>
```
*(Add this script block right before `<script src="assets/admin-common.js"></script>` in `admin/index.html` during local development)*

## 5. Worker Deployment

Set the remote secret for your production admin password:
```bash
cd worker
npx wrangler secret put ADMIN_PASSWORD_HASH
# Enter your secure password when prompted
```

Deploy the worker:
```bash
npx wrangler deploy
```
Take note of the deployed Worker URL (e.g., `https://comments-server.your-username.workers.dev`).

## 6. Admin Pages Deployment

Deploy the `admin` folder to Cloudflare Pages:
```bash
npx wrangler pages deploy admin --project-name comments-admin
```
Take note of the deployed Pages URL (e.g., `https://comments-admin.pages.dev`).

## 7. Production Configuration

After deployment, update your `worker/wrangler.toml` with the production values and run `npx wrangler deploy` again:

```toml
[vars]
# Ensure you include both your frontend site URL and your Admin Pages URL
ALLOWED_ORIGINS = "https://your-blog.com, https://comments-admin.pages.dev"
APP_URL = "https://comments-server.your-username.workers.dev"
```

Also, update `admin/index.html` before deploying the Pages project to point to your remote Worker URL:
```html
<script>
window.COMMENTS_CONFIG = { apiUrl: 'https://comments-server.your-username.workers.dev/api.php' };
</script>
```

## 8. Frontend Comments Integration

In your static site's HTML template, include the comment widget container and inject the necessary configuration scripts.

You must separate `apiUrl` (the Worker backend) from `assetUrl` (the location of `comments.js` and `lang/*.js`).

```html
<!-- Container where comments will load -->
<div id="comments-container"></div>

<script>
window.COMMENTS_CONFIG = {
    apiUrl: 'https://comments-server.your-username.workers.dev/api.php',
    assetUrl: 'https://your-blog.com/comments-assets' // Path where you host comments.js, lang/, etc.
};
</script>
<script src="/comments-assets/comments.js"></script>
```

## Troubleshooting

- **CORS Errors:** Verify that the domain you are visiting is exactly listed in the `ALLOWED_ORIGINS` variable in `wrangler.toml` (or use `*` for testing). Since credentials are included, the origin must match exactly.
- **CSRF / JSON Errors:** Ensure the `APP_URL` variable perfectly matches the deployed Worker API URL, including `https://` and excluding trailing slashes.
- **Admin Password issues:** Ensure you ran `npx wrangler secret put ADMIN_PASSWORD_HASH` for production or correctly created `.dev.vars` for local development.
- **404 Assets:** Ensure `assetUrl` in `window.COMMENTS_CONFIG` is defined in the frontend integration so `comments.js` knows where to load language and CSS files from.
