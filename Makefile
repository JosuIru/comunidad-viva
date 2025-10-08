.PHONY: help install dev prod build test clean backup restore

help:
	@echo "Comandos disponibles:"
	@echo "  make install    - Instalar dependencias"
	@echo "  make dev        - Levantar entorno desarrollo"
	@echo "  make prod       - Levantar entorno producción"
	@echo "  make test       - Ejecutar tests"
	@echo "  make build      - Construir imágenes Docker"
	@echo "  make clean      - Limpiar contenedores y volúmenes"
	@echo "  make backup     - Crear backup de BD"
	@echo "  make restore    - Restaurar BD desde backup"
	@echo "  make seed       - Poblar BD con datos de prueba"
	@echo "  make migrate    - Ejecutar migraciones"
	@echo "  make monitor    - Levantar monitoring stack"

install:
	npm install
	cd packages/backend && npm install
	cd packages/web && npm install
	cd packages/shared && npm install

dev:
	docker-compose up -d postgres redis
	cd packages/backend && npm run dev &
	cd packages/web && npm run dev

prod:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

build:
	docker-compose build --no-cache

test:
	cd packages/backend && npm test
	cd packages/web && npm test
	cd packages/shared && npm test

clean:
	docker-compose down -v
	rm -rf packages/*/node_modules
	rm -rf packages/*/dist
	rm -rf packages/web/.next

backup:
	docker-compose run --rm backup

restore:
	@echo "Archivo de backup (ej: backup_20240101_120000.sql):"
	@read BACKUP_FILE; \
	docker exec -i comunidad-viva-db psql -U comunidad comunidad_viva < ./backups/$$BACKUP_FILE

seed:
	cd packages/backend && npm run seed

migrate:
	cd packages/backend && npx prisma migrate deploy

monitor:
	docker-compose --profile monitoring up -d

logs:
	docker-compose logs -f

stop:
	docker-compose stop

restart:
	docker-compose restart

status:
	docker-compose ps
