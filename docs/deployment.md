# Guide de déploiement AHOUZI

## Prérequis serveur

- Ubuntu 22.04 LTS
- 4 vCPU minimum
- 8 Go RAM minimum
- 100 Go SSD
- Docker & Docker Compose
- Nginx
- Certificat SSL (Let's Encrypt)

## Variables d'environnement de production

Créez un fichier `.env.production` :

```bash
NODE_ENV=production
DATABASE_URL=postgresql://ahouzi:STRONG_PASSWORD@localhost:5432/ahouzi_prod
REDIS_URL=redis://localhost:6379
JWT_SECRET=CHANGEZ_MOI_EN_PRODUCTION_32_CHARS_MIN
JWT_REFRESH_SECRET=CHANGEZ_MOI_EN_PRODUCTION_32_CHARS_MIN
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
NEXT_PUBLIC_API_URL=https://api.ahouzi.ci/api/v1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=ahouzi-prod
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=VOTRE_CLE_SENDGRID
CINETPAY_API_KEY=...
CINETPAY_SITE_ID=...
```

## Déploiement avec Docker Compose

```bash
# Production
docker-compose -f docker-compose.prod.yml up -d

# Migrations
docker-compose exec api npx prisma migrate deploy

# Seed initial (première fois uniquement)
docker-compose exec api node dist/database/seed
```

## Configuration Nginx

```nginx
server {
    listen 80;
    server_name ahouzi.ci www.ahouzi.ci;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name ahouzi.ci www.ahouzi.ci;

    ssl_certificate /etc/letsencrypt/live/ahouzi.ci/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ahouzi.ci/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 443 ssl;
    server_name api.ahouzi.ci;

    ssl_certificate /etc/letsencrypt/live/api.ahouzi.ci/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.ahouzi.ci/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Sauvegardes automatiques

```bash
#!/bin/bash
# /etc/cron.daily/ahouzi-backup
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U ahouzi ahouzi_prod > /backups/db_$DATE.sql
gzip /backups/db_$DATE.sql
# Conserver 30 jours
find /backups -name "*.sql.gz" -mtime +30 -delete
```

## Monitoring

- Logs : `docker-compose logs -f`
- Métriques : Prometheus + Grafana (recommandé)
- Alertes : Configuration SMTP pour alertes système
