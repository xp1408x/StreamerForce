Skills: Navegación y Construcción de Componentes Sistémicos
1. Filosofía de Diseño: "Precision & Density"
Siguiendo el estándar del repositorio, los componentes no deben ser solo visuales, sino funcionales y consistentes.

Consistencia de Redondez: Si el radio es rounded-md (8px), se aplica a todos los botones, inputs y cards.

Grilla de Espaciado: Utilizar múltiplos de 4px (p-1 = 4px, p-4 = 16px) para evitar valores aleatorios.

2. Sistema de Navegación (React Router + Tailwind)
La navegación debe ser intuitiva y reflejar el estado actual del usuario:

Barra de Navegación (Navbar):

Fondo: bg-white con un borde inferior sutil border-b border-gray-200 (evitar sombras pesadas).

Enlaces Activos: El enlace de la página actual debe usar el color Primario (#2563eb) y un peso de fuente font-semibold.

Efecto Hover: Cambios de opacidad suaves o un fondo ligero hover:bg-gray-100.

Breadcrumbs (Migas de Pan):

Usar para jerarquías profundas, con separadores como / o > en gris claro.

3. Patrones de Construcción de Componentes
Cada componente nuevo debe seguir este check-list de estados:

Estado Hover: Oscurecimiento sutil del fondo.

Estado Focus: Anillo de enfoque claro (ring-2 ring-primary) para accesibilidad.

Estado Disabled: Opacidad reducida y cursor not-allowed.

Estado Loading: Implementar un esqueleto (skeleton) o spinner consistente.

4. Especificaciones Técnicas (Tailwind)
Botones de Acción:

Clase base: px-4 py-2 rounded-md transition-all duration-200.

Colores: bg-[#2563eb] text-white hover:bg-[#1d4ed8].

Cards de Contenido:

Estilo: bg-white border border-gray-200 shadow-sm rounded-lg hover:shadow-md transition-shadow.

Inputs de Formulario:

Estilo: border border-gray-300 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none.

5. Estrategia de "Memoria"
Para mantener este sistema en el futuro:

Extracción de Patrones: Si creas un componente nuevo (ej. un Modal), define sus constantes de color y padding en un archivo centralizado o documentalo inmediatamente para reusarlo.

Validación: Antes de finalizar un componente, auditar que no use colores fuera de la paleta #2563eb o #3b82f6.