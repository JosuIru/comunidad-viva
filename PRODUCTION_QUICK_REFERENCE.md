# Comunidad Viva - Production Quick Reference

## Quick Health Check

```bash
# Backend health
curl https://api.your-domain.com/health

# Detailed status
curl https://api.your-domain.com/health/status
```

## Common Operations

### View Logs

```bash
# PM2
pm2 logs comunidad-backend

# Docker
docker logs -f comunidad-backend --tail 100

# Filter errors only
pm2 logs comunidad-backend --err
```

### Restart Services

```bash
# PM2
pm2 restart comunidad-backend

# Docker
docker-compose restart backend

# Systemd
sudo systemctl restart comunidad-backend
```

### Database Backup

```bash
# Manual backup
make backup

# Or directly
pg_dump -U comunidad -Fc comunidad_viva > backup_$(date +%Y%m%d).dump
```

### Check Application Status

```bash
# Via health endpoint
curl https://api.your-domain.com/health/status | jq

# PM2 status
pm2 status

# Docker status
docker-compose ps
```

## Configuration Quick Reference

### Required Environment Variables

```bash
# Backend
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=<64-char-random-string>
NODE_ENV=production

# Frontend
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

### Optional But Recommended

```bash
SENTRY_DSN=https://your-sentry-dsn
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Troubleshooting

### Backend Won't Start

```bash
# 1. Check logs
pm2 logs comunidad-backend --lines 50

# 2. Verify database connection
psql -U comunidad -h localhost -d comunidad_viva

# 3. Check environment variables
pm2 env 0

# 4. Validate configuration
node -e "require('./dist/main')"
```

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL

# Check Prisma schema
cd packages/backend
npx prisma validate

# Re-run migrations
npx prisma migrate deploy
```

### High Memory Usage

```bash
# Check memory
pm2 status

# Restart with memory limit
pm2 restart comunidad-backend --max-memory-restart 1G

# View memory usage over time
pm2 monit
```

### Rate Limiting Triggered

```bash
# Check rate limit logs
pm2 logs comunidad-backend | grep "Rate limit exceeded"

# Find offending IPs
pm2 logs comunidad-backend | grep "Rate limit" | awk '{print $NF}' | sort | uniq -c | sort -nr
```

## Monitoring

### Key Metrics

```bash
# Response times
curl -w "@curl-format.txt" -o /dev/null -s https://api.your-domain.com/health

# Error rates
pm2 logs --err --lines 100 | wc -l

# Database connections
psql -U comunidad -d comunidad_viva -c "SELECT count(*) FROM pg_stat_activity;"
```

### Alerts to Configure

1. **Health check fails** - Alert if /health returns non-200
2. **High error rate** - Alert if errors > 5% of requests
3. **Database connectivity** - Alert if database check fails
4. **Memory usage** - Alert if memory > 80%
5. **Response time** - Alert if p95 latency > 1s

## Security Checklist

- [ ] JWT_SECRET is randomly generated and ≥32 chars
- [ ] Database password is strong and unique
- [ ] CORS origins are explicitly set (no wildcards)
- [ ] SSL certificates are valid
- [ ] Swagger is disabled (NODE_ENV=production)
- [ ] Secrets are in environment variables, not code
- [ ] Regular backups are configured
- [ ] Monitoring and alerting are active

## Performance Tuning

### Database

```sql
-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Vacuum database
VACUUM ANALYZE;
```

### Backend

```javascript
// Increase PM2 instances for better performance
pm2 scale comunidad-backend 4

// Enable cluster mode
pm2 start dist/main.js -i max --name comunidad-backend
```

## Deployment Checklist

### Pre-Deploy

- [ ] Run tests: `npm run test`
- [ ] Run smoke tests: `npm run test:e2e`
- [ ] Build succeeds: `npm run build`
- [ ] Environment variables set
- [ ] Database migrations ready

### Deploy

- [ ] Tag release in git
- [ ] Backup database
- [ ] Deploy backend
- [ ] Run migrations
- [ ] Deploy frontend
- [ ] Verify health checks
- [ ] Run smoke tests in production

### Post-Deploy

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify key features work
- [ ] Monitor for 1 hour
- [ ] Announce deployment

## Rollback Procedure

```bash
# 1. Restore previous Docker image
docker pull comunidad-viva-backend:previous
docker-compose up -d backend

# 2. Or with PM2, deploy previous version
git checkout previous-tag
npm run build
pm2 restart comunidad-backend

# 3. Restore database if needed
pg_restore -U comunidad -d comunidad_viva backup.dump

# 4. Verify rollback
curl https://api.your-domain.com/health
```

## Useful Commands

```bash
# View all environment variables
pm2 env 0

# Reload without downtime
pm2 reload comunidad-backend

# View real-time logs
pm2 logs --raw

# Generate PM2 startup script
pm2 startup
pm2 save

# Database console
psql $DATABASE_URL

# Prisma Studio (dev only)
cd packages/backend && npx prisma studio
```

## Support Contacts

- **Deployment Issues:** Check deployment guide
- **Database Issues:** Check health/status endpoint
- **Security Issues:** Review logs and Sentry
- **Performance Issues:** Check monitoring dashboards

## Quick Links

- Health Check: https://api.your-domain.com/health
- API Docs (dev): http://localhost:4000/api/docs
- Deployment Guide: `./PRODUCTION_DEPLOYMENT.md`
- Improvements Report: `./PRODUCTION_IMPROVEMENTS_REPORT.md`
- Readiness Report: `./PRODUCTION_READINESS_REPORT.md`
