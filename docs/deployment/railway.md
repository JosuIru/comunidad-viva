# 🚀 Deploy Rápido en Railway

## Paso 1: Preparar el proyecto

1. Asegúrate de que tu código esté en GitHub
2. Si no lo has hecho, crea un repositorio:

```bash
git remote add origin https://github.com/TU_USUARIO/comunidad-viva.git
git push -u origin main
```

## Paso 2: Deploy en Railway

### Backend + Base de Datos

1. Ve a https://railway.app y crea cuenta (puedes usar GitHub)
2. Click en "New Project"
3. Click en "Deploy from GitHub repo"
4. Selecciona tu repositorio `comunidad-viva`
5. Railway detectará el monorepo

6. **Configurar Backend:**
   - Root Directory: `packages/backend`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npx prisma migrate deploy && node dist/main.js`

7. **Añadir PostgreSQL:**
   - Click en "+ New"
   - Selecciona "Database" → "Add PostgreSQL"
   - Railway creará automáticamente la variable `DATABASE_URL`

8. **Variables de entorno del Backend:**
   ```bash
   NODE_ENV=production
   JWT_SECRET=tu-secreto-super-seguro-aqui
   JWT_EXPIRES_IN=7d
   PORT=4000
   # DATABASE_URL se crea automáticamente
   ```

9. **Obtener URL del backend:**
   - Click en tu servicio backend
   - Tab "Settings" → "Generate Domain"
   - Copia la URL (ej: `comunidad-viva-backend.up.railway.app`)

### Frontend

1. En el mismo proyecto, click "+ New" → "GitHub Repo"
2. Selecciona el mismo repo
3. **Configurar Frontend:**
   - Root Directory: `packages/web`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

4. **Variables de entorno del Frontend:**
   ```bash
   NEXT_PUBLIC_API_URL=https://tu-backend-url.up.railway.app
   NODE_ENV=production
   ```

5. **Generar dominio:**
   - Settings → Generate Domain
   - Tu app estará en `tu-app.up.railway.app`

## Paso 3: Verificar

1. Abre la URL del frontend
2. Verifica que cargue correctamente
3. Intenta registrarte/iniciar sesión

## 🎯 Costos Railway

- **Gratis:** $5 de crédito mensual (suficiente para proyectos pequeños)
- **Hobby Plan:** $5/mes por servicio activo
- **Pro Plan:** $20/mes ilimitado

## 🔄 Actualizaciones automáticas

Cada vez que hagas `git push`, Railway desplegará automáticamente los cambios.

## 🐛 Solución de problemas

### Backend no inicia
```bash
# Ver logs en Railway Dashboard → Logs
# Verifica que DATABASE_URL esté configurado
```

### Frontend no conecta con Backend
```bash
# Verifica que NEXT_PUBLIC_API_URL tenga la URL correcta del backend
# Debe ser https://tu-backend.up.railway.app
```

### Error de migraciones
```bash
# En Railway, ejecuta comando manual:
npx prisma migrate deploy
```

## ✅ Checklist

- [ ] Código en GitHub
- [ ] Backend desplegado en Railway
- [ ] PostgreSQL añadida
- [ ] Variables de entorno configuradas
- [ ] Frontend desplegado
- [ ] URLs funcionando
- [ ] Puedes registrarte/login

¡Listo! Tu app está en producción 🎉
