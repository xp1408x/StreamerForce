Skills: Integración de Agentes y Capacidades Funcionales
1. Arquitectura de "Skills" (Herramientas)
Los componentes deben diseñarse pensando en que un agente de IA pueda invocarlos como funciones.

Atomicidad: Cada componente/función debe realizar una sola tarea clara (ej. list_files, edit_code).

Esquema de Entrada (Input Schema): Definir claramente qué parámetros necesita el componente para renderizarse o actuar.

Manejo de Salida (Output): El componente debe ser capaz de devolver un estado de "éxito" o "error" que el sistema pueda leer.

2. Visualización de Procesos (Agent Logs)
Dado que el agente realiza acciones en segundo plano, la interfaz debe comunicar este progreso:

Terminal/Consola: Implementar una vista de consola con fondo #1f2937 y texto monoespaciado para mostrar la ejecución de scripts.

Indicadores de Acción: Usar badges o etiquetas pequeñas que indiquen qué "skill" está usando el agente en ese momento (ej. "Reading filesystem...", "Calling API...").

Streaming de Datos: La interfaz debe soportar la actualización en tiempo real de la información conforme el agente genera respuestas.

3. Interacción con el Sistema de Archivos
Si el proyecto requiere gestión de archivos (como en agent-skills):

File Explorer: Crear un componente lateral con estructura de árbol, utilizando iconos consistentes para carpetas y tipos de archivos.

Modo Lectura/Escritura: Diferenciar visualmente cuándo un archivo está en modo "solo lectura" y cuándo el agente tiene permiso para editarlo.

4. Feedback y Control Humano (Human-in-the-loop)
El sistema debe permitir que el usuario supervise al agente:

Botones de Interrupción: Botón de "Stop" o "Cancel" con color de acento rojo para detener procesos del agente inmediatamente.

Confirmación de Acción: Modales de validación antes de que el agente realice acciones críticas (como borrar archivos o hacer deploy).

5. Estándares de Código para la IA
Para que yo pueda generar código que sea fácil de mantener y escalar según este repositorio:

Typescript: Uso obligatorio de interfaces para definir los "props" de cada skill.

Modularidad: Separar la lógica de la "herramienta" (la función que hace el trabajo) de la "vista" (el componente React que lo muestra).