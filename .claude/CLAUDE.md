# Instrucciones para Claude Code

## Directrices de proyecto

### Estructura y limpieza
- Mantener estructura de archivos mínima y organizada
- No crear documentación extra (README, CHANGELOG, docs/) salvo petición expresa
- Eliminar archivos temporales, de prueba o obsoletos cuando ya no sean necesarios

### Tests
- Crear tests cuando sean necesarios para validar funcionalidad crítica
- Eliminar tests que ya no apliquen tras refactorizaciones
- No acumular tests redundantes o para código trivial

### Código
- Preferir modificar archivos existentes antes que crear nuevos
- Comentarios solo cuando el código no sea autoexplicativo
- Al finalizar una tarea, revisar si hay archivos que se puedan eliminar
