# API de Red Local - Referencia para Desarrolladores

## Módulo WebRTC

### Propiedades

```javascript
WebRTC.isServer          // boolean - ¿Es servidor?
WebRTC.isConnected       // boolean - ¿Está conectado?
WebRTC.peers             // Map - Conexiones activas
WebRTC.localInfo         // object - Info del dispositivo actual
WebRTC.iceServers        // array - Servidores STUN
```

### Métodos

#### `async WebRTC.getLocalIP()`
Detecta la dirección IP local del dispositivo.

```javascript
const ip = await WebRTC.getLocalIP();
console.log(ip); // "192.168.1.50"
```

**Retorna**: `string` - IP local

**Timeout**: 3 segundos

---

#### `async WebRTC.startServer()`
Inicia el dispositivo en modo servidor.

```javascript
const serverInfo = await WebRTC.startServer();
console.log(serverInfo);
/*
{
  role: 'server',
  ip: '192.168.1.50',
  port: 8080,
  wsPort: 8081,
  peerId: 'peer_1704067200000_abc123def',
  timestamp: 1704067200000
}
*/
```

**Retorna**: `object` - Información del servidor

**Efectos**: 
- Activa `WebRTC.isServer = true`
- Activa `WebRTC.isConnected = true`
- Crea entrada en localStorage

---

#### `async WebRTC.connectToServer(serverIp, serverId)`
Conecta el dispositivo a un servidor.

```javascript
await WebRTC.connectToServer('192.168.1.50', 'peer_1704067200000_abc123def');
```

**Parámetros**:
- `serverIp` (string): IP del servidor
- `serverId` (string): ID del servidor (opcional)

**Retorna**: `Promise` - Promesa que se resuelve cuando se conecta

**Efectos**:
- Activa `WebRTC.isConnected = true`
- Envía SYNC_REQUEST automáticamente
- Escucha cambios en localStorage

---

#### `WebRTC.sendMessage(message)`
Envía un mensaje a un peer específico.

```javascript
WebRTC.sendMessage({
  type: 'SYNC_REQUEST',
  to: 'peer_target_id'
});
```

**Parámetros**:
- `message` (object):
  - `type` (string): Tipo de mensaje
  - `to` (string): ID del destinatario
  - ... otros campos según tipo

**Efectos**:
- Escribe en localStorage
- Dispara evento 'peerMessageSent'

---

#### `WebRTC.broadcastDataUpdate(type, data)`
Envía actualización a todos los clientes (solo servidor).

```javascript
WebRTC.broadcastDataUpdate('ingredient', {
  action: 'add',
  id: 'ing_123',
  data: {...}
});
```

**Parámetros**:
- `type` (string): Tipo de dato ('ingredient', 'product', 'sale')
- `data` (object): Datos a enviar

**Validación**: Solo funciona si `WebRTC.isServer = true`

---

#### `WebRTC.disconnect()`
Desconecta de la red local.

```javascript
WebRTC.disconnect();
```

**Efectos**:
- Activa `WebRTC.isConnected = false`
- Limpia localStorage
- Detiene listeners

---

#### `WebRTC.getStatus()`
Obtiene estado actual de conexión.

```javascript
const status = WebRTC.getStatus();
console.log(status);
/*
{
  isServer: true,
  isConnected: true,
  localInfo: {
    role: 'server',
    ip: '192.168.1.50',
    peerId: 'peer_...',
    ...
  }
}
*/
```

**Retorna**: `object` - Estado de conexión

---

### Manejadores de Mensajes Internos

Estos se llaman automáticamente:

#### `WebRTC.handleSyncRequest(message)`
Procesa solicitud de sincronización (servidor).

#### `WebRTC.handleSyncResponse(message)`
Procesa respuesta de sincronización (cliente).

#### `WebRTC.handleDataUpdate(message)`
Procesa actualización de datos (todos).

#### `WebRTC.handleDeleteSale(message)`
Procesa eliminación de pedido (servidor).

---

## Módulo Sync

### Propiedades

```javascript
Sync.versions                    // object - Versiones de datos
Sync.versions.ingredients        // number - Timestamp de última actualización
Sync.versions.products           // number
Sync.versions.salesHistory       // number
Sync.versions.stock              // number
```

### Métodos de Fusión

#### `Sync.mergeServerData(serverData)`
Fusiona datos del servidor con locales (cliente).

```javascript
Sync.mergeServerData({
  ingredients: [...],
  products: [...],
  salesHistory: [...],
  stock: {...}
});
```

**Parámetros**:
- `serverData` (object): Datos del servidor

**Reglas**:
- Servidor es fuente de verdad
- Nuevos datos del servidor se agregan
- Datos existentes se actualizan
- Se respaldacompleto

---

#### `Sync.applyRemoteChanges(remoteData)`
Aplica cambios recibidos de otro peer.

```javascript
Sync.applyRemoteChanges({
  ingredients: [{
    action: 'add',
    id: 'ing_123',
    data: {...}
  }],
  products: [{
    action: 'update',
    id: 'p_456',
    data: {...}
  }]
});
```

**Parámetros**:
- `remoteData` (object): Cambios a aplicar

**Acciones soportadas**: 'add', 'update', 'delete'

---

### Métodos de Sincronización de Insumos

#### `Sync.syncAddIngredient(ingredient)`
```javascript
Sync.syncAddIngredient({
  id: 'ing_123',
  name: 'ORÉGANO',
  cost: 0.30,
  unit: 'gr'
});
```

#### `Sync.syncUpdateIngredient(id, ingredient)`
```javascript
Sync.syncUpdateIngredient('ing_123', {...});
```

#### `Sync.syncDeleteIngredient(id)`
```javascript
Sync.syncDeleteIngredient('ing_123');
```

---

### Métodos de Sincronización de Productos

#### `Sync.syncAddProduct(product)`
```javascript
Sync.syncAddProduct({
  id: 'p_456',
  name: 'MARGHERITA',
  icon: '🍕',
  price: 120,
  recipe: [...]
});
```

#### `Sync.syncUpdateProduct(id, product)`
```javascript
Sync.syncUpdateProduct('p_456', {...});
```

#### `Sync.syncDeleteProduct(id)`
```javascript
Sync.syncDeleteProduct('p_456');
```

---

### Métodos de Sincronización de Pedidos

#### `Sync.syncNewSale(sale)`
```javascript
Sync.syncNewSale({
  id: 'sale_789',
  total: 240.00,
  items: [...],
  timestamp: Date.now()
});
```

#### `Sync.syncUpdateSale(id, sale)`
```javascript
Sync.syncUpdateSale('sale_789', {...});
```

#### `Sync.requestDeleteSale(saleId)`
Solicita eliminación al servidor.

```javascript
Sync.requestDeleteSale('sale_789');
```

**Nota**: Solo el servidor ejecutará realmente la eliminación.

---

### Métodos de Stock

#### `Sync.syncStockUpdate(ingredientId, quantity)`
```javascript
Sync.syncStockUpdate('ing_123', 50);
```

---

### Utilidades

#### `Sync.getLastSync()`
Obtiene marca de tiempo del último sincronización.

```javascript
const lastSync = Sync.getLastSync();
console.log(new Date(lastSync)); // "2024-01-01T14:30:45.000Z"
```

**Retorna**: `string` - ISO string o null

---

#### `Sync.setLastSync()`
Marca el timestamp actual como último sync.

```javascript
Sync.setLastSync();
```

---

## Tipos de Mensajes

### SYNC_REQUEST
```javascript
{
  type: 'SYNC_REQUEST',
  from: 'peer_client_123',
  to: 'peer_server_456',
  timestamp: 1704067200000
}
```

**Respuesta esperada**: SYNC_RESPONSE

---

### SYNC_RESPONSE
```javascript
{
  type: 'SYNC_RESPONSE',
  to: 'peer_client_123',
  data: {
    ingredients: [...],
    products: [...],
    salesHistory: [...],
    stock: {...}
  },
  timestamp: 1704067200000
}
```

---

### DATA_UPDATE
```javascript
{
  type: 'DATA_UPDATE',
  dataType: 'ingredient|product|sale|stock',
  data: {
    action: 'add|update|delete',
    id: 'resource_id',
    data: {...}
  },
  timestamp: 1704067200000
}
```

---

### DELETE_SALE
```javascript
{
  type: 'DELETE_SALE',
  saleId: 'sale_123',
  timestamp: 1704067200000
}
```

**Solo servidor puede procesar**

---

## Integración con Data.js

Todos los métodos CRUD ahora llaman a Sync:

```javascript
// Ingredient CRUD
Data.addIngredient()     → Sync.syncAddIngredient()
Data.updateIngredient()  → Sync.syncUpdateIngredient()
Data.deleteIngredient()  → Sync.syncDeleteIngredient()

// Product CRUD
Data.addProduct()        → Sync.syncAddProduct()
Data.updateProduct()     → Sync.syncUpdateProduct()
Data.deleteProduct()     → Sync.syncDeleteProduct()

// Sale CRUD
Data.checkout()          → Sync.syncNewSale()
Data.updateSale()        → Sync.syncUpdateSale()
Data.deleteSale()        → NO sincroniza (solo servidor)

// Stock
Data.updateStock()       → Sync.syncStockUpdate()
```

---

## Ejemplo Completo: Agregar Insumo con Sincronización

```javascript
// En Data.js
Data.addIngredient('Sal Marina', 2.50, 'gr');

// Internamente ejecuta:
// 1. Crea ingrediente con ID único
// 2. Agrega a Data.ingredients[]
// 3. Llama this.saveAll()
// 4. Llama Sync.syncAddIngredient(ingredient)

// En Sync.js
Sync.syncAddIngredient(ingredient) {
  if (!WebRTC.isServer) return; // Solo servidor
  
  WebRTC.broadcastDataUpdate('ingredient', {
    action: 'add',
    id: ingredient.id,
    data: ingredient
  });
}

// En WebRTC.js
WebRTC.broadcastDataUpdate(type, data) {
  const message = {
    type: 'DATA_UPDATE',
    dataType: type,
    data: data,
    timestamp: Date.now()
  };
  
  // Escribe en localStorage para otros procesos
  localStorage.setItem(
    'peerBroadcast_' + Date.now(),
    JSON.stringify(message)
  );
}

// Otros clientes detectan y aplican:
// window.addEventListener('storage', ...)
// → Sync.applyRemoteChanges()
// → Data.ingredients.push(nueva)
// → UI.renderInventory()
```

---

## Mejores Prácticas

### ✓ Hacer
```javascript
// Validar estado de conexión
if (WebRTC.isConnected) {
  // Proceder
}

// Esperar resolución de promesas
await WebRTC.connectToServer(ip, id);

// Manejar errores
try {
  await WebRTC.connectToServer(ip, id);
} catch (err) {
  console.error('Connection failed:', err);
}

// Respetar decisiones de servidor
if (WebRTC.isServer) {
  // Eliminar pedidos
} else {
  // No eliminar pedidos
}
```

### ✗ Evitar
```javascript
// No ignorar estado
Data.deleteSale(id); // Sin verificar si es servidor

// No confiar en conexión
// Sin verificar WebRTC.isConnected

// No hacer cambios simultáneos
// Sin manejar conflictos

// No ignorar respaldo
// Asumir que la red siempre funciona
```

---

## Eventos Personalizados

```javascript
// Cuando se envía un mensaje
window.addEventListener('peerMessageSent', (e) => {
  const envelope = e.detail;
  console.log('Message sent to:', envelope.to);
});

// Cuando cambia estado de storage
window.addEventListener('storage', (e) => {
  if (e.key.startsWith('peerMessage_')) {
    // Nuevo mensaje recibido
  }
});
```

---

## Debugging

### Verificar estado
```javascript
console.log(WebRTC.getStatus());
console.log(Sync.versions);
console.log(localStorage);
```

### Monitorear mensajes
```javascript
// En consola
localStorage.setItem('DEBUG', 'true');

// En webrtc.js se puede agregar
if (localStorage.getItem('DEBUG')) {
  console.log('Message received:', message);
}
```

### Simular desconexión
```javascript
WebRTC.disconnect();
// Cambios no se sincronizarán
```

### Resincronizar forzadamente
```javascript
Sync.setLastSync();
WebRTC.sendMessage({
  type: 'SYNC_REQUEST',
  to: WebRTC.localInfo.serverId
});
```

---

## Troubleshooting de API

**Error: "Cannot read property 'ip' of null"**
```
Causa: WebRTC.localInfo no existe
Solución: Esperar a que startServer() o connectToServer() finalice
```

**Error: "Sync is not defined"**
```
Causa: sync.js no se cargó
Solución: Verificar orden en <script> tags en HTML
```

**Error: "localStorage quota exceeded"**
```
Causa: Demasiados datos
Solución: Limpiar localStorage o fragmentar datos
```

**Los cambios no se sincronizan**
```
Causas:
1. WebRTC.isConnected es false
2. Está en cliente pero no hay servidor activo
3. IPs en redes diferentes
Solución: Verificar WebRTC.getStatus()
```

---

## Rendimiento

### Latencia esperada
- Sincronización inicial: < 500ms
- Actualización de dato: < 100ms
- Broadcast a múltiples clientes: < 200ms

### Optimizaciones implementadas
- localStorage en lugar de HTTP (más rápido)
- Broadcast solo de cambios, no datos completos
- Caching de datos locales
- Timestamps para evitar duplicados

### Mejoras futuras
- Delta sync (solo cambios)
- Compresión de datos
- Web Worker para procesamiento async
- IndexedDB para más capacidad
