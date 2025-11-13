# 🚀 Instalación en 2 Pasos

## Para instalar Truk en tu servidor:

### 1️⃣ Descarga el proyecto
```bash
git clone https://github.com/tu-usuario/truk.git
cd truk
```

### 2️⃣ Ejecuta el instalador
```bash
./install.sh
```

**¡Eso es todo!** 🎉

El instalador:
- ✅ Instala Docker automáticamente
- ✅ Configura la base de datos
- ✅ Genera secretos seguros
- ✅ Arranca todos los servicios

---

## 📱 Acceso

Después de la instalación, accede a:

- **API:** http://localhost:3000
- **Documentación:** http://localhost:3000/api

---

## 🔧 Comandos Básicos

```bash
# Ver logs
docker-compose logs -f

# Reiniciar
docker-compose restart

# Detener
docker-compose down

# Estado
docker-compose ps
```

---

## 📚 Documentación Completa

Para configuración avanzada, SSL, dominios personalizados, etc:

👉 **[INSTALL.md](./INSTALL.md)**

---

## 🆘 ¿Problemas?

1. Verifica que Docker está instalado: `docker --version`
2. Revisa los logs: `docker-compose logs backend`
3. Consulta [INSTALL.md](./INSTALL.md) sección "Solución de Problemas"

---

## 📋 Requisitos Mínimos

- Linux (Ubuntu/Debian/CentOS)
- 2 GB RAM
- 10 GB disco
- Acceso root/sudo

---

¡Bienvenido a la economía colaborativa local! 🌱
