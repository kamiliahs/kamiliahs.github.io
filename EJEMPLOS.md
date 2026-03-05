# 📚 Ejemplos de Uso - POS Minimalist

## Ejemplo 1: Crear un Insumo

### Desde la UI
1. Abre la app
2. Toca "STOCK" en la navegación inferior
3. Toca "+ Nuevo"
4. Completa:
   - Nombre: "HARINA DE TRIGO"
   - Costo: "2.50"
   - Unidad: "GR"
5. Toca "GUARDAR"

### Desde código
```javascript
// Agregar insumo programáticamente
Data.addIngredient('HARINA DE TRIGO', 2.50, 'gr');
UI.renderInventory();
Utils.showToast('INSUMO GUARDADO');
```

## Ejemplo 2: Crear una Receta

### Paso a paso desde UI
1. Abre la app
2. Toca "STOCK" → "FICHAS"
3. Toca "+ Nueva"
4. Completa:
   - Nombre: "PAN INTEGRAL"
   - Emoji: "🍞"
   - Precio: "25.00"
5. Toca "+ Añadir Insumo" (3 veces)
6. Selecciona:
   - Insumo 1: "HARINA DE TRIGO" - Cantidad: "300"
   - Insumo 2: "LEVADURA" - Cantidad: "5"
   - Insumo 3: "AGUA" - Cantidad: "200"
7. Toca "CREAR"

### Costo automático
- El sistema calcula automáticamente:
  - Costo producción: 300gr × $2.50 + 5gr × ... = $X
  - Margen: ((25 - X) / 25) × 100 = Y%

## Ejemplo 3: Procesar Venta

### Flujo en POS
1. Abre la app (muestra vista "VENTAS" por defecto)
2. Toca el producto "PAN INTEGRAL"
3. Se agrega al carrito (barra negra inferior)
4. Puedes tocar más productos
5. Carrito muestra total: "SRD 50.00"
6. Toca "COBRAR"
7. Confirma venta
8. Verás notificación "TRANSACCIÓN COMPLETADA"

### En código
```javascript
// Agregar varios items al carrito
APP.addToCart('p1'); // PAN INTEGRAL
APP.addToCart('p2'); // OTRA RECETA

// Procesar venta
APP.checkout();

// Total actualizado automáticamente
const total = Data.getCartTotal(); // 50.00
```

## Ejemplo 4: Ver Reportes

### Estadísticas
1. Abre la app
2. Toca "STATS" en la navegación
3. Verás:
   - **Balance General**: SRD XXX.XX
   - **Margen**: X.X%
   - **Ventas**: Total de dinero recibido
   - **Costos**: Total de insumos usados
   - **Rendimiento**: Desglose por producto

### Datos específicos
```javascript
// Obtener estadísticas
const stats = Data.getSalesStats();
console.log(stats.totalSales);    // 500.00
console.log(stats.totalCosts);    // 150.00
console.log(stats.netProfit);     // 350.00
console.log(stats.marginPercentage); // 70.0%

// Ganancia por producto
const byProduct = Data.getProfitByProduct();
byProduct.forEach(item => {
  console.log(`${item.name}: ${item.profit} SRD (${item.margin}%)`);
});
```

## Ejemplo 5: Editar Costos

### Actualizar precio de insumo
1. Abre "STOCK" → "CATÁLOGO"
2. Busca el insumo
3. Toca el campo de costo
4. Cambia el valor: "2.50" → "3.00"
5. Los márgenes se recalculan automáticamente

### En código
```javascript
// Actualizar costo
APP.updateIngredientCost('ing1', 3.00);

// Verificar
const ing = Data.ingredients.find(i => i.id === 'ing1');
console.log(ing.cost); // 3.00

// Los precios de productos se recalculan automáticamente
const newCost = Data.calculateProductCost('p1');
console.log(newCost); // Costo actualizado
```

## Ejemplo 6: Exportar Datos

### Backup manual
```javascript
// Descargar datos como JSON
Utils.downloadDataAsJSON();

// Se descarga: pos-backup-[timestamp].json
// Contiene: ingredientes, productos, historial de ventas
```

### Formato de backup
```json
{
  "ingredients": [
    {
      "id": "ing1",
      "name": "HARINA",
      "cost": 2.50,
      "unit": "gr"
    }
  ],
  "products": [
    {
      "id": "p1",
      "name": "PAN",
      "icon": "🍞",
      "price": 25.00,
      "recipe": [
        {"id": "ing1", "qty": 300}
      ]
    }
  ],
  "salesHistory": [
    {
      "name": "PAN",
      "price": 25.00,
      "cost": 7.50,
      "timestamp": 1614567890000
    }
  ],
  "exportDate": "2026-03-04T10:30:00.000Z"
}
```

## Ejemplo 7: Modificar desde Consola (Dev Tools)

### Acceder a datos
```javascript
// F12 para abrir Developer Tools
// Ir a Console

// Ver todos los ingredientes
console.log(Data.ingredients);

// Ver todos los productos
console.log(Data.products);

// Ver historial de ventas
console.log(Data.salesHistory);
```

### Manipular datos (sin guardar interfaz)
```javascript
// Agregar manualmente
Data.ingredients.push({
  id: 'ing_test',
  name: 'TEST',
  cost: 10,
  unit: 'gr'
});

// Guardar
Data.saveAll();

// Renderizar cambios
UI.renderAll();
```

## Ejemplo 8: Cambiar Tema/Colores

### Modificar CSS
Edita `src/css/main.css`:

```css
:root {
    --bg: #f5f5f5;          /* Cambiar de blanco a gris */
    --text-main: #222222;   /* Cambiar de negro puro */
    --text-muted: #999999;  /* Cambiar gris */
    --border: #dddddd;      /* Cambiar bordes */
    --accent: #0066cc;      /* Cambiar color principal */
}
```

### Tema oscuro
```css
@media (prefers-color-scheme: dark) {
    :root {
        --bg: #1a1a1a;
        --text-main: #ffffff;
        --text-muted: #aaaaaa;
        --border: #333333;
    }
}
```

## Ejemplo 9: Agregar Nueva Vista

### 1. Agregar HTML en index.html
```html
<div id="menuView" class="view-container hidden-view p-6">
    <h3 class="heading-lg">MI MENÚ ESPECIAL</h3>
    <div id="menuBody"></div>
</div>
```

### 2. Agregar render en ui.js
```javascript
UI.renderMenu = function() {
    const body = document.getElementById('menuBody');
    body.innerHTML = Data.products.map(p => `
        <div class="p-4 bg-blue-50">
            <h4>${p.name}</h4>
            <p>Precio: ${p.price}</p>
        </div>
    `).join('');
}
```

### 3. Agregar navegación en app.js
```javascript
APP.switchView = function(viewId) {
    // ... código existente ...
    if (viewId === 'menu') {
        UI.renderMenu();
    }
}
```

### 4. Agregar botón de nav
```html
<div onclick="APP.switchView('menu')" class="nav-item">Menú</div>
```

## Ejemplo 10: Usar la App Sin Internet

### Primer uso
1. Abre la app con conexión a internet
2. El Service Worker descargará todos los archivos
3. Verás un mensaje de instalación (opcional)
4. Instala si quieres como app nativa

### Uso offline
1. Desconecta internet
2. Abre la app (desde ícono en pantalla de inicio o historial)
3. Puedes:
   - Ver productos guardados
   - Crear nuevas ventas
   - Ver reportes
   - Acceder a todo lo guardado

### Datos se sincronizan cuando
1. Vuelves a conectarte
2. Abres la app nuevamente
3. Service Worker se actualiza silenciosamente

## Caso de Uso Real: Una Panadería

### Setup inicial (5 min)
```
1. Crear insumos:
   - HARINA: $2/kg
   - LEVADURA: $50/kg
   - SAL: $1/kg
   - MANTEQUILLA: $20/kg

2. Crear recetas:
   - PAN BLANCO 500g: $8
   - PAN INTEGRAL 500g: $9
   - MEDILUNAS: $2 c/u
   - FACTURAS: $1.50 c/u
```

### Durante el día
```
Mañana:
- Ventas: 50 × Pan Blanco = $400
- Ventas: 30 × Pan Integral = $270
- Total mañana: $670

Tarde:
- Ventas: 100 × Medialunas = $200
- Ventas: 80 × Facturas = $120
- Total tarde: $320

Total día: $990 en ventas
```

### Análisis al cierre (2 min)
```
STATS:
- Ventas: $990
- Costos: $310
- Ganancia: $680
- Margen: 68.7%

Mejor producto: Pan Blanco (73% margen)
Peor producto: Facturas (62% margen)

Acción: Aumentar precio de facturas a $1.70
```

---

¿Tienes más preguntas? Revisa el [README.md](README.md) o [ESTRUCTURA.md](ESTRUCTURA.md)
