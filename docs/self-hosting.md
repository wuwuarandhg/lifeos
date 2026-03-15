# Self-Hosting Guide

lifeOS is designed to run on your own hardware. This guide covers everything from a Raspberry Pi to a cloud VM.

## Requirements

- **Docker** (recommended) or **Node.js 20+**
- **512 MB RAM** minimum (1 GB recommended)
- **100 MB disk** for the app + whatever your data grows to
- Works on: Linux (x64, ARM64), macOS, Windows (via WSL2/Docker)

## Quick Start with Docker

```bash
# 1. Clone the repository
git clone https://github.com/eklavyagoyal/lifeos.git
cd lifeos

# 2. Configure environment
cp .env.example .env
```

Edit `.env` and **set a strong passphrase**:

```dotenv
AUTH_SECRET=your-strong-passphrase-here
```

Optionally generate a bcrypt hash for extra security:

```bash
node -e "console.log(require('bcryptjs').hashSync('your-passphrase', 10))"
```

Then paste the hash as `AUTH_SECRET`.

```bash
# 3. Start lifeOS
docker compose up -d

# 4. Open in your browser
open http://localhost:3000
```

### Updating

```bash
cd lifeos
git pull
docker compose up -d --build
```

Your data is stored in a Docker volume (`lifeos-data`) and persists across rebuilds.

## Quick Start without Docker

```bash
# 1. Clone and install
git clone https://github.com/eklavyagoyal/lifeos.git
cd lifeos
cp .env.example .env
# Edit .env — set AUTH_SECRET!

pnpm install
pnpm db:generate
pnpm db:migrate

# 2. Build and run
pnpm build
pnpm start
```

The database is created at `./data/lifeos.db` (configurable via `DATABASE_PATH`).

## Raspberry Pi

lifeOS runs well on a Raspberry Pi 4 (2 GB+) or Pi 5.

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in

# Clone and start
git clone https://github.com/eklavyagoyal/lifeos.git
cd lifeos
cp .env.example .env
# Edit .env — set AUTH_SECRET!

docker compose up -d
```

> **Tip:** The first build takes ~5 minutes on a Pi 4. Subsequent starts are instant.

## Remote Access

lifeOS is designed to run on your local network. To access it from outside your home:

### Tailscale (Recommended)

[Tailscale](https://tailscale.com) creates a private WireGuard VPN mesh. Free for personal use.

1. Install Tailscale on your server and your devices
2. Access lifeOS at `http://<tailscale-ip>:3000`
3. No port forwarding, no exposed ports, encrypted by default

### Cloudflare Tunnel

[Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) exposes your app via a custom domain with HTTPS. Free tier available.

```bash
# Install cloudflared
brew install cloudflared  # or apt, etc.

# Authenticate
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create lifeos

# Route to your domain
cloudflared tunnel route dns lifeos lifeos.yourdomain.com

# Run
cloudflared tunnel run --url http://localhost:3000 lifeos
```

### Reverse Proxy (Nginx/Caddy)

If you prefer a traditional reverse proxy with Let's Encrypt:

**Caddy** (automatic HTTPS):

```
lifeos.yourdomain.com {
    reverse_proxy localhost:3000
}
```

**Nginx**:

```nginx
server {
    listen 443 ssl;
    server_name lifeos.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/lifeos.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lifeos.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Backup & Restore

### Automated Backups

Your entire lifeOS is a single SQLite file. Back it up however you back up files:

```bash
# Simple copy (stop the app first, or use SQLite's backup API)
cp data/lifeos.db data/lifeos-backup-$(date +%Y%m%d).db

# Using SQLite's online backup (safe while app is running)
sqlite3 data/lifeos.db ".backup 'data/lifeos-backup.db'"
```

### Docker Volume Backup

```bash
# Create a backup archive
docker run --rm \
  -v lifeos-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/lifeos-backup-$(date +%Y%m%d).tar.gz -C /data .
```

### Restore from Backup

```bash
# Stop the app
docker compose down

# Restore the database
cp lifeos-backup.db data/lifeos.db

# Restart
docker compose up -d
```

### JSON Export

From the app: **Settings → Export & Backup → Export JSON**

This exports all your data as structured JSON files — useful for migration or analysis.

### Database Download

From the app: **Settings → Export & Backup → Download Database**

Downloads the raw SQLite file directly.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AUTH_SECRET` | `changeme-to-a-strong-passphrase` | Passphrase to unlock the app. **Change this!** |
| `DATABASE_PATH` | `./data/lifeos.db` | Path to SQLite database file |
| `ATTACHMENTS_PATH` | `./data/attachments` | Path to attachment storage (future) |
| `PORT` | `3000` | HTTP port |
| `NODE_ENV` | `development` | Set to `production` for Docker/deployment |

## Troubleshooting

### "Database is locked"

SQLite doesn't support multiple writers. Ensure only one instance of lifeOS is running.

### Build fails on ARM (Raspberry Pi)

Make sure you're using `node:20-alpine` which supports ARM64. The Dockerfile handles this automatically.

### Port already in use

Change the port in `.env` or `docker-compose.yml`:

```dotenv
PORT=3001
```

### Forgot your passphrase

Delete the session cookie in your browser and enter the passphrase from your `.env` file. If you've lost the `.env` file, you'll need to set a new `AUTH_SECRET` — your data is unaffected.
