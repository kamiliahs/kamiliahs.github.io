# Estructura del Proyecto - POS Minimalist PWA

```
kamiliahs.github.io/
│
├── 📄 index.html                    # Archivo principal HTML
├── 📄 README.md                     # Documentación principal
├── 📄 INSTALACION.md                # Guía de instalación
├── 📄 package.json                  # Metadatos del proyecto
├── 📄 .gitignore                    # Archivos ignorados por git
│
├── 📁 src/                          # Código fuente
│   ├── 📁 css/
│   │   └── 📄 main.css              # Estilos principales (tipografía, componentes)
│   │
│   └── 📁 js/
│       ├── 📄 app.js                # Orquestación principal de la app
│       │
│       └── 📁 modules/
│           ├── 📄 storage.js        # Gestión de localStorage
│           ├── 📄 data.js           # Lógica de datos y cálculos
│           ├── 📄 ui.js             # Renderizado de vistas y UI
│           └── 📄 utils.js          # Funciones auxiliares
│
├── 📁 public/                       # Archivos públicos
│   ├── 📄 manifest.json             # Configuración de PWA
│   └── 📄 sw.js                     # Service Worker (offline)
│
└── 📁 assets/                       # Recursos estáticos
    └── 📁 icons/
        └── 📄 svg-templates.svg     # Templates SVG para iconos

```

## 📊 Diagrama de Flujo de Datos

```
┌─────────────────────────────────────────────────────┐
│                      HTML (index.html)              │
│                    Estructura del DOM               │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
     ┌───────────────────────────┐
     │    APP.init() - app.js    │  ◄─ Inicialización
     └───────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
   ┌─────────┐      ┌──────────┐
   │ Storage │      │   Data   │
   │  .js    │      │   .js    │
   └─────────┘      └──────────┘
        │                │
        ▼                ▼
   localStorage     Cálculos &
                   Operaciones
        │                │
        └────────┬───────┘
                 │
                 ▼
        ┌──────────────┐
        │   UI.js      │
        │  Renderizado │
        └──────────────┘
                 │
                 ▼
        ┌──────────────┐
        │  Utils.js    │
        │ Interacción  │
        └──────────────┘
                 │
                 ▼
            DOM Actualizado

```

## 🔄 Ciclo de Vida de Eventos

```
Usuario Interactúa
        ▼
  HTML onclick="APP...."
        ▼
  Validación en APP
        ▼
  Actualizar Data
        ▼
  Guardar en Storage
        ▼
  Renderizar UI
        ▼
  Mostrar Toast (opcional)
```

## 📱 Vistas Principales

```
┌──────────────────────────────────┐
│  HEADER - Info de tienda         │
├──────────────────────────────────┤
│                                  │
│  VIEW ACTUAL (dinámico):         │
│  ├─ posView (Terminal)           │
│  ├─ inventoryView (Catálogo)     │
│  ├─ recipesView (Fichas)         │
│  └─ reportsView (Reportes)       │
│                                  │
├──────────────────────────────────┤
│  BOTTOM NAV - Navegación         │
└──────────────────────────────────┘

MODALS FLOTANTES:
├─ ingridientModal
├─ recipeModal
├─ overlay (fondo)
└─ sidebar (menú)

NOTIFICACIÓN:
└─ toast (mensaje)
```

## 🗂️ Almacenamiento de Datos

```
localStorage
├── min_pos_ing (Ingredientes)
│   └── Array de objetos:
│       ├── id: string
│       ├── name: string
│       ├── cost: number
│       └── unit: string
│
├── min_pos_prod (Productos)
│   └── Array de objetos:
│       ├── id: string
│       ├── name: string
│       ├── icon: string
│       ├── price: number
│       └── recipe: Array
│
└── min_pos_sales (Historial)
    └── Array de objetos:
        ├── name: string
        ├── price: number
        ├── cost: number
        └── timestamp: number
```

## 🔌 API de Módulos

### Storage
```javascript
Storage.getIngredients()
Storage.getProducts()
Storage.getSalesHistory()
Storage.saveIngredients(ingredients)
Storage.saveProducts(products)
Storage.saveSalesHistory(sales)
Storage.clearAll()
```

### Data
```javascript
Data.init()
Data.saveAll()
Data.addIngredient(name, cost, unit)
Data.updateIngredientCost(id, newCost)
Data.deleteIngredient(id)
Data.addProduct(name, icon, price, recipe)
Data.deleteProduct(id)
Data.calculateProductCost(productId)
Data.addToCart(productId)
Data.getCartTotal()
Data.checkout()
Data.getSalesStats()
Data.getProfitByProduct()
```

### UI
```javascript
UI.renderPOS()
UI.renderInventory()
UI.renderRecipes()
UI.renderReports()
UI.updateCartUI()
UI.renderAll()
```

### Utils
```javascript
Utils.showToast(message, duration)
Utils.switchView(viewId)
Utils.toggleMenu()
Utils.openModal(modalId)
Utils.closeAllPopups()
Utils.addIngredientRow()
Utils.isValidEmail(email)
Utils.formatCurrency(amount)
Utils.downloadDataAsJSON()
```

### APP (Interfaz Pública)
```javascript
APP.init()
APP.saveIngredient()
APP.updateIngredientCost(id, value)
APP.deleteIngredient(id)
APP.saveRecipe()
APP.deleteProduct(id)
APP.addToCart(productId)
APP.checkout()
APP.switchView(viewId)
APP.toggleMenu()
APP.openModal(modalId)
APP.closeAllPopups()
APP.addIngredientRow()
```

## 🚀 Flujo de Instalación como PWA

```
Usuario abre URL
    ▼
Service Worker se registra (sw.js)
    ▼
manifest.json se carga
    ▼
Browser detecta PWA
    ▼
Botón de instalación disponible
    ▼
Usuario instala
    ▼
App en pantalla de inicio
    ▼
Funciona offline con caché
```

## 📦 Dependencias Externas

Solo Tailwind CSS (CDN):
```html
<script src="https://cdn.tailwindcss.com"></script>
```

Todo lo demás es vanilla JavaScript.

## ⚙️ Configuración Importante

### Service Worker
- Caché: `pos-minimalist-v1`
- Estrategia: Cache first, fallback to network
- Actualización automática

### PWA Manifest
- Instalable en todos los dispositivos
- Iconos adaptativos
- Modo standalone (sin navegador visible)
- Soporte para shortcuts

### Storage
- 5-10 MB disponibles por navegador
- Persiste entre sesiones
- Se borra si limpia datos del navegador

## 🔐 Consideraciones de Seguridad

- No hay autenticación (local use only)
- No hay backend ni base de datos
- Los datos nunca dejan el dispositivo
- HTTPS no requerido para desarrollo (pero sí para PWA en producción)

---

**Última actualización:** Marzo 2026
**Versión:** 1.0.0
