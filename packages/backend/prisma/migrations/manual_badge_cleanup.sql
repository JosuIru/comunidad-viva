-- Eliminar todos los badges existentes para permitir migración
DELETE FROM "UserBadge";

-- Ahora Prisma podrá recrear el enum BadgeType sin conflictos
