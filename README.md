# POS Minimalist - Sistema de Gestión de Puntos de Venta

Una aplicación web progresiva (PWA) minimalista y moderna para gestión de puntos de venta, compatible con diseño editorial de vanguardia.

## 🚀 Características

- ✅ **PWA Instalable** - Funciona como aplicación nativa en dispositivos
- 📱 **Responsive Design** - Optimizada para móviles, tablets y escritorio
- 🌐 **Funciona Offline** - Acceso a datos sin conexión a internet
- 💾 **Sincronización Automática** - Los datos se guardan automáticamente en localStorage
- 🎨 **Diseño Editorial Minimalista** - Tipografía y UI de alto contraste
- 🔧 **Modular** - Código organizado en módulos reutilizables
- ⚡ **Ligero** - Sin dependencias externas (solo Tailwind CSS)
- 📊 **Reportes en Tiempo Real** - Estadísticas de ventas y márgenes
- 🌐 **Red Local P2P** - Sincronización entre múltiples dispositivos en la misma red WiFi
- 📱 **Modo Servidor/Cliente** - Configura un dispositivo como central de datos
- 🔄 **Sincronización Bidireccional** - Los cambios se reflejan en tiempo real

## 🆕 Red Local (Novedad)

POS Minimalist ahora permite conectar múltiples dispositivos para trabajar colaborativamente:

### Modos de Operación
- **Servidor**: Dispositivo central que gestiona datos maestros
- **Cliente**: Terminales conectadas que sincronizan datos

### Características de Red
- ✓ Detección automática de IP local
- ✓ Conexión mediante código QR
- ✓ Sincronización de insumos, recetas y pedidos
- ✓ Respaldo automático en cada dispositivo
- ✓ Control centralizado de eliminación de pedidos
- ✓ Funciona en redes WiFi locales (192.168.x.x, 10.x.x.x)

**Ver [GUIA_RED_LOCAL.md](docs/GUIA_RED_LOCAL.md) para instrucciones completas.**

## 📋 Funcionalidades

### 📦 Gestión de Insumos
- Crear y editar insumos con costos unitarios
- Especificar unidades de medida (gramos, mililitros, piezas)
- Actualizar costos en tiempo real

### 🍽️ Gestión de Recetas
- Crear fichas de productos con ingredientes
- Asociar múltiples insumos a cada producto
- Calcular costos de producción automáticamente
- Visualizar márgenes de ganancia

### 💰 Terminal de Ventas
- Interfaz rápida y touch-friendly para punto de venta
- Agregar productos al carrito
- Procesar pagos

### 📈 Reportes
- Balance general de ventas
- Análisis de márgenes por producto
- Historial de transacciones
- Estadísticas de rentabilidad

## 📁 Estructura del Proyecto

```
kamiliahs.github.io/
├── index.html                 # HTML principal
├── src/
│   ├── css/
│   │   └── main.css          # Estilos principales
│   └── js/
│       ├── app.js            # Lógica principal de la app
│       └── modules/
│           ├── storage.js    # Gestión de localStorage
│           ├── data.js       # Lógica de datos
│           ├── ui.js         # Renderizado de vistas
│           └── utils.js      # Funciones auxiliares
├── public/
│   ├── manifest.json         # Configuración PWA
│   └── sw.js                 # Service Worker
├── assets/
│   └── icons/                # Iconos y activos
├── README.md                 # Este archivo
└── .gitignore               # Archivos ignorados por git
```

## 🚀 Instalación y Uso

### En el Navegador

1. Abrir `https://yourusername.github.io` en un navegador moderno
2. La aplicación cargará automáticamente

### Instalar como Aplicación

#### En Android:
1. Abrir la página en Chrome
2. Tocar el menú (⋮) → "Instalar aplicación"
3. Confirmar instalación

#### En iPhone/iPad:
1. Abrir la página en Safari
2. Tocar Compartir → "Agregar a la pantalla de inicio"
3. Confirmar instalación

#### En Windows/Mac:
1. Abrir la página en Chrome/Edge
2. Hacer clic en el icono de instalación en la barra de direcciones
3. Confirmar instalación

## 🔧 Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos con variables CSS
- **JavaScript Vanilla** - Sin frameworks, máxima compatibilidad
- **Tailwind CSS** - Framework de utilidades CSS
- **Service Workers** - Para funcionalidad offline
- **localStorage** - Para persistencia de datos
- **Web Manifest** - Para instalación como PWA

## 💾 Almacenamiento de Datos

Los datos se guardan en **localStorage** del navegador:
- `min_pos_ing` - Insumos
- `min_pos_prod` - Productos/Recetas
- `min_pos_sales` - Historial de ventas
- `min_pos_stock` - Inventario de stock

> 💡 **Nuevo**: Con el sistema de red local, los datos se sincronizan entre dispositivos conectados.

## 🌐 Red Local (WebRTC)

El sistema ahora incluye sincronización P2P para múltiples dispositivos:

### Módulos de Red
- **webrtc.js** - Conexión P2P y gestión de red
- **sync.js** - Sincronización bidireccional de datos

### Funcionalidades
- ✓ Modo Servidor (dispositivo central)
- ✓ Modo Cliente (terminales conectadas)
- ✓ Generación y escaneo de código QR
- ✓ Sincronización de insumos, recetas y pedidos
- ✓ Solo servidor puede eliminar pedidos confirmados
- ✓ Respaldo automático en cada dispositivo

**Ver [docs/GUIA_RED_LOCAL.md](docs/GUIA_RED_LOCAL.md) para más detalles.**

## 📱 Compatibilidad

- ✅ Chrome/Edge (v90+)
- ✅ Firefox (v88+)
- ✅ Safari (v14+)
- ✅ Android Browser
- ✅ iOS Safari

## 🛠️ Desarrollo

### Estructura Modular

**storage.js** - Gestiona lectura/escritura en localStorage
```javascript
Storage.getIngredients()
Storage.saveProducts(products)
```

**data.js** - Lógica de datos y cálculos
```javascript
Data.addIngredient(name, cost, unit)
Data.calculateProductCost(productId)
Data.checkout()
```

**ui.js** - Renderizado de vistas
```javascript
UI.renderPOS()
UI.renderInventory()
UI.renderReports()
```

**utils.js** - Funciones auxiliares
```javascript
Utils.switchView(viewId)
Utils.showToast(message)
Utils.toggleMenu()
```

**app.js** - Orquestación y event listeners
```javascript
APP.init()
APP.saveIngredient()
APP.checkout()
```

### Agregar Nuevas Funciones

1. Agregar método en `data.js` para la lógica
2. Agregar render en `ui.js` si es visual
3. Agregar acción en `app.js` para conectar con UI
4. Llamar desde HTML con `onclick="APP.nombreFuncion()"`

## 📦 Empaquetado para GitHub Pages

El proyecto está listo para ser publicado en GitHub Pages:

1. Hacer push a la rama `main` o `gh-pages`
2. Habilitar GitHub Pages en Settings del repositorio
3. La aplicación estará disponible en `https://yourusername.github.io`

## 🔐 Seguridad

- ✅ No requiere autenticación (uso local)
- ✅ No envía datos a servidores
- ✅ Funciona completamente offline
- ✅ Red local cifrada internamente
- ⚠️ Los datos son locales al dispositivo/navegador
- ⚠️ Red local no es segura para internet público (solo LAN)

## 📚 Documentación Adicional

### Guías de Red Local
- [GUIA_RED_LOCAL.md](docs/GUIA_RED_LOCAL.md) - Guía de usuario paso a paso
- [ARQUITECTURA_RED.md](docs/ARQUITECTURA_RED.md) - Diseño técnico
- [EJEMPLO_PRACTICO_RED.md](docs/EJEMPLO_PRACTICO_RED.md) - Caso de uso: Pizzería
- [API_RED_REFERENCIA.md](docs/API_RED_REFERENCIA.md) - Referencia API para desarrolladores
- [DIAGRAMA_ARQUITECTURA.md](DIAGRAMA_ARQUITECTURA.md) - Diagramas visuales
- [IMPLEMENTACION_RED_LOCAL.md](IMPLEMENTACION_RED_LOCAL.md) - Resumen de implementación

### Guías Generales
- [docs/GUIA_USUARIO.md](docs/GUIA_USUARIO.md) - Manual de usuario
- [docs/MANUAL_INSTALACION.md](docs/MANUAL_INSTALACION.md) - Instalación
- Más guías en carpeta `docs/`

## 🎨 Personalización

### Cambiar Colores
Editar variables CSS en `src/css/main.css`:
```css
:root {
    --bg: #ffffff;
    --text-main: #000000;
    --text-muted: #888888;
    --border: #eeeeee;
    --accent: #000000;
}
```

### Cambiar Datos Iniciales
Editar `src/js/modules/storage.js`:
```javascript
getIngredients() {
    return JSON.parse(...) || [
        { id: 'ing1', name: 'TU INSUMO', cost: 0.00, unit: 'gr' }
    ];
}
```

### Cambiar Nombre de la App
Editar `public/manifest.json`:
```json
{
    "name": "Tu Nombre de App",
    "short_name": "Nombre Corto"
}
```

## 📞 Soporte

Para problemas o sugerencias, crear un issue en el repositorio.

## 📄 Licencia

Este proyecto es de código abierto y puede ser usado libremente.

## 🙏 Agradecimientos

Diseño inspirado en principios editoriales minimalistas y moderno UX/UI.

---

**Última actualización:** Marzo 2026
**Versión:** 1.0.0
