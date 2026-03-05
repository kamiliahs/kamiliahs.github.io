# Arquitectura de Sincronización en Red Local

## Resumen Técnico

Se implementó un sistema completo de sincronización P2P para POS Minimalist que permite:
- Modo Servidor: Central de datos y control
- Modo Cliente: Punto de venta descentralizado con sincronización
- Sincronización bidireccional de insumos, recetas, pedidos y stock

## Módulos Implementados

### 1. **webrtc.js** - Comunicación Peer-to-Peer
**Responsabilidades:**
- Detección de IP local del dispositivo
- Inicialización como servidor o cliente
- Gestión de conexiones WebSocket simuladas
- Manejo de mensajes entre peers
- Broadcast de cambios

**Métodos Principales:**
```javascript
// Servidor
WebRTC.startServer() → {ip, peerId, wsPort}

// Cliente
WebRTC.connectToServer(ip, serverId) → Promise

// Comunicación
WebRTC.sendMessage(message) // Envía a peer específico
WebRTC.broadcastDataUpdate(type, data) // Broadcast a todos
```

**Almacenamiento:**
- localStorage como canal de comunicación (en navegador)
- Claves: `wsServer`, `peerMessage_*`, `peerBroadcast_*`

### 2. **sync.js** - Sincronización de Datos
**Responsabilidades:**
- Fusión de datos del servidor con locales
- Detección y aplicación de cambios remotos
- Rastreo de versiones para conflictos
- Métodos de sincronización específicos por entidad

**Métodos de Sincronización:**
```javascript
// Sincronización de insumos
Sync.syncAddIngredient(ingredient)
Sync.syncUpdateIngredient(id, ingredient)
Sync.syncDeleteIngredient(id)

// Sincronización de productos
Sync.syncAddProduct(product)
Sync.syncUpdateProduct(id, product)
Sync.syncDeleteProduct(id)

// Sincronización de pedidos
Sync.syncNewSale(sale)
Sync.syncUpdateSale(id, sale)

// Stock
Sync.syncStockUpdate(ingredientId, quantity)
```

**Estrategia de Fusión:**
- **Ingredientes/Productos**: Servidor es fuente de verdad
- **Pedidos**: Merge sin duplicar
- **Stock**: Actualización en tiempo real

## Flujo de Datos

### 1. Inicio del Servidor
```
Usuario abre app → RED → Iniciar Servidor
    ↓
WebRTC.startServer()
    ↓
Obtiene IP local
Genera peerId único
Crea entrada en localStorage como "wsServer"
    ↓
Genera QR con: {ip, peerId}
    ↓
Modo servidor activo ✓
```

### 2. Conexión de Cliente
```
Usuario abre app → RED → Conectar a Servidor
    ↓
Ingresa IP del servidor
    ↓
WebRTC.connectToServer(ip, serverId)
    ↓
Crea entrada cliente en localStorage
    ↓
Envía SYNC_REQUEST al servidor
    ↓
Servidor responde con SYNC_RESPONSE
    ↓
Sync.mergeServerData()
    ↓
Datos sincronizados ✓
```

### 3. Cambio en Cliente Conectado
```
Usuario agrega insumo
    ↓
Data.addIngredient()
    ↓
Sync.syncAddIngredient() → WebRTC.broadcastDataUpdate()
    ↓
localStorage: peerBroadcast_timestamp
    ↓
Servidor lo recibe y propaga a otros clientes
    ↓
Cambio reflejado en todos ✓
```

### 4. Eliminación de Pedido (Servidor)
```
Usuario (en servidor) elimina pedido
    ↓
Data.deleteSale(saleId)
    ↓
localStorage: peerMessage (sin broadcast)
    ↓
Solo servidor puede eliminar
    ↓
Cambio no se propaga a clientes ✓
```

## Formato de Mensajes

### SYNC_REQUEST
```javascript
{
    type: 'SYNC_REQUEST',
    from: 'peer_xxx',
    to: 'peer_yyy',
    timestamp: 1234567890
}
```

### SYNC_RESPONSE
```javascript
{
    type: 'SYNC_RESPONSE',
    to: 'peer_xxx',
    data: {
        ingredients: [...],
        products: [...],
        salesHistory: [...],
        stock: {...}
    },
    timestamp: 1234567890
}
```

### DATA_UPDATE
```javascript
{
    type: 'DATA_UPDATE',
    dataType: 'ingredient',
    data: {
        action: 'add|update|delete',
        id: 'ing_xxx',
        data: {...}
    },
    timestamp: 1234567890
}
```

### DELETE_SALE (Solo Servidor)
```javascript
{
    type: 'DELETE_SALE',
    saleId: 'sale_xxx',
    to: undefined,  // No se envía a nadie
    timestamp: 1234567890
}
```

## Integración con Módulos Existentes

### Data.js
Cada operación CRUD ahora llamada a Sync:
```javascript
addIngredient() → Sync.syncAddIngredient()
updateIngredient() → Sync.syncUpdateIngredient()
deleteIngredient() → Sync.syncDeleteIngredient()
addProduct() → Sync.syncAddProduct()
// ... etc
```

### UI.js
Nueva vista de red:
```javascript
renderNetworkStatus() {
    // Muestra estado de conexión
    // IP local, modo (servidor/cliente)
    // Último sync
}
```

### Utils.js
Actualizado para mapear nueva vista:
```javascript
switchView('network') → renderNetworkStatus()
```

### App.js
Nuevos handlers de red:
```javascript
selectServerRole()
connectToServer()
startQRScanner()
stopQRScanner()
manualSync()
disconnectNetwork()
copyServerInfo()
```

## Características de Seguridad Implementadas

1. **IDs Únicos**: Cada peer tiene ID único basado en timestamp
2. **Validación de Fuente**: Mensajes incluyen sender ID
3. **Solo Servidor Elimina**: Pedidos solo pueden eliminarse desde servidor
4. **Respaldo Local**: Todos los datos se guardan en localStorage
5. **Red Privada**: Solo funciona en redes locales (192.168.x.x, 10.x.x.x)

## Limitaciones Actuales

1. **No cifrado**: Usa localStorage sin encriptación (uso local solo)
2. **Simulado**: WebSocket simulado con localStorage (no es un WebSocket real)
3. **No autenticación**: Cualquiera en la red puede conectarse
4. **No persistencia remota**: Servidor no mantiene BD central (usa localStorage también)

## Mejoras Futuras Recomendadas

1. **Servidor Node.js Real**: Reemplazar localStorage con servidor real
2. **Encriptación TLS**: Para comunicaciones seguras
3. **Autenticación**: Contraseña o PIN para conectarse
4. **Sincronización Selectiva**: Solo cambios, no todos los datos
5. **Offline Queue**: Encolar cambios cuando está offline
6. **Conflictos Avanzados**: Resolución sofisticada de conflictos con timestamps
7. **Cloud Backup**: Opción de respaldo en nube

## Pruebas Recomendadas

```bash
# Probar en múltiples pestañas del mismo navegador
# Probar en múltiples dispositivos en la misma WiFi
# Probar reconexión después de desconexión
# Probar cambios simultáneos desde múltiples clientes
# Probar eliminación de pedidos desde servidor
```

## URLs de Referencia

- [WebRTC Spec](https://www.w3.org/TR/webrtc/)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## Notas de Implementación

- La detección de IP usa RTCPeerConnection (método estándar)
- localStorage se usa como transporte temporal entre pestañas
- En producción, usar WebSocket real o Socket.io
- Máximo 5-50MB por dominio en localStorage
- Cada cambio dispara saveAll() para garantizar persistencia
