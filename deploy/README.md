# TrackrApp Deployment Guide

This guide covers deploying TrackrApp to a single VPS using Docker Compose and Traefik.

## Architecture

```
Internet → Traefik (ports 80/443, auto Let's Encrypt TLS)
             ├─ staging.trackrapp.xyz      → web:3000
             ├─ trackrapp.xyz              → web:3000
             ├─ logs.trackrapp.xyz         → Dozzle (prod)
             ├─ logs-staging.trackrapp.xyz → Dozzle (staging)
             └─ mail-staging.trackrapp.xyz → Mailpit (staging only)

VPS: /opt/trackrapp/
  ├── traefik/           # Shared Traefik instance
  ├── staging/           # Staging environment
  ├── production/        # Production environment
  └── backups/           # Database backups
```

---

## 1. VPS Provisioning

Tested on Ubuntu 24.04 LTS (2 vCPU, 4 GB RAM recommended).

### Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in
```

### Install Docker Compose plugin

```bash
sudo apt-get install -y docker-compose-plugin
docker compose version   # should show v2.x
```

### Configure UFW firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Create directory structure

```bash
sudo mkdir -p /opt/trackrapp/{traefik,staging,production,backups}
sudo chown -R $USER:$USER /opt/trackrapp
```

---

## 2. DNS Configuration

Create A records pointing to your VPS IP:

| Record                       | Type | Value      |
| ---------------------------- | ---- | ---------- |
| `trackrapp.xyz`              | A    | `<VPS_IP>` |
| `www.trackrapp.xyz`          | A    | `<VPS_IP>` |
| `staging.trackrapp.xyz`      | A    | `<VPS_IP>` |
| `mail-staging.trackrapp.xyz` | A    | `<VPS_IP>` |
| `logs.trackrapp.xyz`         | A    | `<VPS_IP>` |
| `logs-staging.trackrapp.xyz` | A    | `<VPS_IP>` |

Wait for DNS propagation before starting Traefik (Let's Encrypt will fail on cert issuance otherwise).

---

## 3. GitHub Repository Secrets

Add these secrets in **Settings → Secrets and variables → Actions**:

| Secret        | Value                                             |
| ------------- | ------------------------------------------------- |
| `VPS_HOST`    | VPS IP or hostname                                |
| `VPS_USER`    | SSH username (e.g. `ubuntu`)                      |
| `VPS_SSH_KEY` | Private SSH key (contents of `~/.ssh/id_ed25519`) |

Create GitHub Environments:

- `staging` — no required reviewers (auto-deploys on push to `main`)
- `production` — add required reviewers for manual approval gate

---

## 4. First Deployment

### 4.1 Start Traefik (shared, runs once)

```bash
cd /opt/trackrapp/traefik
# Copy docker-compose.traefik.yml here
cp /path/to/repo/deploy/docker-compose.traefik.yml .

# Create the shared network
docker network create traefik-public

# Create .env with ACME_EMAIL
echo "ACME_EMAIL=admin@trackrapp.xyz" > .env

docker compose -f docker-compose.traefik.yml up -d
```

### 4.2 Set up Staging

```bash
cd /opt/trackrapp/staging

# Copy compose file
cp /path/to/repo/deploy/docker-compose.staging.yml .
cp /path/to/repo/deploy/scripts/backup.sh scripts/

# Create environment file from template
cp /path/to/repo/deploy/.env.example .env.staging
# Edit .env.staging and fill in all values
nano .env.staging

# Pull latest images (first time)
docker compose -f docker-compose.staging.yml --env-file .env.staging pull

# Start staging
docker compose -f docker-compose.staging.yml --env-file .env.staging up -d

# Check logs
docker compose -f docker-compose.staging.yml --env-file .env.staging logs -f
```

### 4.3 Set up Production

```bash
cd /opt/trackrapp/production

# Copy compose file
cp /path/to/repo/deploy/docker-compose.prod.yml .
mkdir -p scripts
cp /path/to/repo/deploy/scripts/backup.sh scripts/

# Create environment file
cp /path/to/repo/deploy/.env.example .env.prod
nano .env.prod  # Fill in production values

# Pull and start
docker compose -f docker-compose.prod.yml --env-file .env.prod pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

### 4.4 Verify deployment

```bash
# Web health check
curl https://trackrapp.xyz/api/health
# → {"status":"ok","timestamp":"..."}

# Worker health check (internal — from staging host)
docker exec $(docker ps -qf name=worker) wget -qO- http://localhost:3001/health
# → {"status":"ok","uptime":...}

# Check all containers are healthy
docker compose -f docker-compose.prod.yml ps
```

---

## 5. Ongoing Deployments (CI/CD)

Push to `main` automatically:

1. Runs all tests
2. Builds and pushes Docker images to GHCR (`ghcr.io/<repo>/web:latest` + `:<sha>`)
3. Deploys to staging automatically
4. Waits for production approval in GitHub Actions

To approve production deployment: go to the Actions run → Review deployments → Approve.

---

## 6. Rollback Procedure

If production has an issue, rollback to a previous image by SHA:

```bash
cd /opt/trackrapp/production

# Find previous SHA in GitHub Actions (or GHCR tags)
PREV_SHA=abc1234...

# Pull and deploy previous image
IMAGE_TAG="$PREV_SHA" docker compose -f docker-compose.prod.yml pull
IMAGE_TAG="$PREV_SHA" docker compose -f docker-compose.prod.yml up -d
```

---

## 7. Backup and Restoration

### Manual backup

```bash
cd /opt/trackrapp/production
docker compose -f docker-compose.prod.yml exec -T backup /backup.sh
# Backup written to /opt/trackrapp/backups/trackrapp-YYYYMMDD-HHMMSS.sql
```

### Restore from backup

```bash
cd /opt/trackrapp/production

# Stop web and worker (keep postgres running)
docker compose -f docker-compose.prod.yml stop web worker

# Restore
BACKUP_FILE=/opt/trackrapp/backups/trackrapp-20260101-020000.sql
docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U trackrapp -d trackrapp < "$BACKUP_FILE"

# Restart
docker compose -f docker-compose.prod.yml start web worker
```

---

## 8. Monitoring

- **Logs**: Visit `https://logs.trackrapp.xyz` (BasicAuth protected — see `DOZZLE_BASIC_AUTH` in `.env.prod`)
- **Staging logs**: `https://logs-staging.trackrapp.xyz`
- **Staging email**: `https://mail-staging.trackrapp.xyz` — all outgoing email is caught here

### View live logs via CLI

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Single service
docker compose -f docker-compose.prod.yml logs -f web
docker compose -f docker-compose.prod.yml logs -f worker
```

---

## 9. GitHub Actions Required Secrets Summary

```
VPS_HOST          — VPS IP or hostname
VPS_USER          — SSH user on VPS
VPS_SSH_KEY       — SSH private key (PEM format)
```

The VPS should have the corresponding public key in `~/.ssh/authorized_keys`.

Generate a dedicated deploy key:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/trackrapp-deploy
# Add ~/.ssh/trackrapp-deploy.pub to VPS authorized_keys
# Add contents of ~/.ssh/trackrapp-deploy to GitHub secret VPS_SSH_KEY
```
