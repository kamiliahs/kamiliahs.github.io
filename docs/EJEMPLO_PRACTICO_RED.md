# Ejemplo Práctico: Setup Red Local para Restaurante

## Escenario: Pizzería con 2 Terminales

**Hardware:**
- Terminal 1: Tablet Samsung (Servidor) - IP: 192.168.1.50
- Terminal 2: iPad (Cliente) - IP: 192.168.1.51
- Red: "PizzaWiFi"

---

## Paso 1: Iniciar Servidor (Tablet)

### Acción:
```
1. Abre POS Minimalist en tablet
2. Navega a: RED → ⚙️ Configurar Conexión
3. Click en: Iniciar Servidor
```

### Resultado:
```
✓ Servidor Iniciado
  IP Local: 192.168.1.50
  ID del Servidor: peer_1704067200000_abc123def
  
  [Código QR generado]
  
  "Escanea este código desde otra aplicación"
```

### Lo que pasó internamente:
- WebRTC.startServer() → obtuvo IP local
- Generó peerId único
- localStorage["wsServer"] = {active: true, peerId: ...}
- Generó QR con la información

---

## Paso 2: Conectar Cliente (iPad)

### Acción A - Opción QR (Recomendado):
```
1. Abre POS Minimalist en iPad
2. Navega a: RED → ⚙️ Configurar Conexión
3. Click en: Conectar a Servidor
4. Click en: 📱 Escanear QR
5. Apunta cámara al código QR de la tablet
```

### Acción B - Opción Manual:
```
1. Abre POS Minimalist en iPad
2. Navega a: RED → ⚙️ Configurar Conexión
3. Ingresa:
   - IP del Servidor: 192.168.1.50
   - ID del Servidor: peer_1704067200000_abc123def
4. Click en: Conectar
```

### Resultado (cualquier opción):
```
● Conectado (Cliente)
  Mi IP: 192.168.1.51
  Server: 192.168.1.50
  Modo: Cliente

Información
  Último Sync: 2024-01-01 14:30:45
```

### Lo que pasó internamente:
- WebRTC.connectToServer() estableció conexión
- Envió SYNC_REQUEST al servidor
- Servidor respondió con SYNC_RESPONSE
- Sync.mergeServerData() fusionó datos
- Data.saveAll() respaldó localmente

---

## Paso 3: Datos Sincronizados

### En la Tablet (Servidor):
```
Insumos:
✓ MASA ARTESANAL (15 SRD/pza)
✓ MOZZARELLA (0.12 SRD/gr)
✓ TOMATE SAN MARZANO (0.05 SRD/ml)

Recetas:
✓ MARGHERITA CLASSIC (120 SRD)
```

### En el iPad (Cliente):
```
Se sincronizaron automáticamente ↓

Insumos:
✓ MASA ARTESANAL (15 SRD/pza)
✓ MOZZARELLA (0.12 SRD/gr)
✓ TOMATE SAN MARZANO (0.05 SRD/ml)

Recetas:
✓ MARGHERITA CLASSIC (120 SRD)
```

---

## Paso 4: Agregar Nuevo Insumo (En Cliente)

### Acción (iPad):
```
1. Navega a: INSUMOS → + Nuevo
2. Nombre: ORÉGANO FRESCO
3. Costo: 0.30 SRD/gr
4. Click: GUARDAR
```

### Lo que pasa:
```
iPad (Cliente):
  Data.addIngredient()
    ↓
  Sync.syncAddIngredient()
    ↓
  WebRTC.broadcastDataUpdate()
    ↓
  localStorage["peerBroadcast_1704067389234"] = {
    type: 'DATA_UPDATE',
    dataType: 'ingredient',
    data: {
      action: 'add',
      id: 'ing_1704067389234',
      data: {
        id: 'ing_1704067389234',
        name: 'ORÉGANO FRESCO',
        cost: 0.30,
        unit: 'gr'
      }
    }
  }
    ↓
  Tablet (Servidor) detecta cambio
    ↓
  Sync.applyRemoteChanges()
    ↓
  El insumo aparece en la Tablet automáticamente
```

### Resultado:
```
✓ En iPad: ORÉGANO FRESCO aparece en INSUMOS
✓ En Tablet: ORÉGANO FRESCO aparece en INSUMOS
✓ Ambas sincronizadas
```

---

## Paso 5: Crear Pedido en Cliente

### Acción (iPad):
```
1. Navega a: VENTAS (POS)
2. Click en: 🍕 MARGHERITA CLASSIC (120 SRD)
3. Click en: 🍕 MARGHERITA CLASSIC (120 SRD) de nuevo
4. Carrito muestra: 240 SRD (2 unidades)
5. Click en: COBRAR
6. Confirma: ¿Confirmar venta de 2 artículo(s)?
7. Click: Sí
```

### Lo que pasa:
```
iPad (Cliente):
  Data.checkout()
    ↓
  Crea sale con ID único: sale_1704067450123_xyz789
  {
    id: 'sale_1704067450123_xyz789',
    total: 240.00,
    items: [
      {name: 'MARGHERITA CLASSIC', price: 120},
      {name: 'MARGHERITA CLASSIC', price: 120}
    ],
    timestamp: 1704067450123
  }
    ↓
  Sync.syncNewSale()
    ↓
  WebRTC.broadcastDataUpdate()
    ↓
  localStorage["peerBroadcast_1704067450124"] = {...}
    ↓
  Tablet (Servidor) recibe cambio
    ↓
  Data.salesHistory se actualiza
    ↓
  Pedido visible en PEDIDOS en Tablet
```

### Resultado:
```
✓ iPad: Carrito se vacía, toast "TRANSACCIÓN COMPLETADA"
✓ Tablet: El pedido aparece en PEDIDOS
✓ Tablet: Stats se actualizan (+240 SRD en ventas)
```

---

## Paso 6: Eliminar Pedido Confirmado (Servidor)

### Acción (Tablet):
```
1. Navega a: PEDIDOS
2. Click en pedido "sale_1704067450123_xyz789"
3. Se abre modal con detalles
4. Click en: ELIMINAR
5. Confirma: ¿Eliminar este pedido?
6. Click: Sí
```

### Lo que pasa:
```
Tablet (Servidor):
  Data.deleteSale(saleId)
    ↓
  salesHistory.splice(index, 1)
    ↓
  Data.saveAll()
    ↓
  localStorage se actualiza
    ↓
  UI.renderAll() refresca vistas
    ↓
  Stats se recalculan (-240 SRD en ventas)
```

### IMPORTANTE:
```
⚠️ El cliente (iPad) NO recibe este cambio
   porque Data.deleteSale() NO llama a Sync.

Razón:
- Solo el servidor puede eliminar pedidos
- Es intencional por seguridad
- Evita que clientes calienten pedidos

Nota:
- En Tablet: Pedido eliminado ✓
- En iPad: Pedido sigue visible en historial
         (pero no se sincroniza)
```

---

## Paso 7: Sincronización Manual

### Acción (iPad):
```
1. Navega a: RED
2. Click en: 🔄 Sincronizar Ahora
```

### Resultado:
```
✓ Envía SYNC_REQUEST
✓ Servidor responde con datos actuales
✓ Toast: "Sincronizando..."
✓ Datos se fusionan
✓ UI se actualiza
✓ Toast: "SINCRONIZADO"
```

---

## Paso 8: Desconectar

### Acción (iPad):
```
1. Navega a: RED
2. Click en: ✕ Desconectar
3. Confirma: ¿Desconectar de la red?
4. Click: Sí
```

### Resultado:
```
● Desconectado

iPad sigue funcionando:
  - Datos locales intactos
  - Puede crear pedidos
  - Cambios NO se sincronizan
  - Cuando se reconecte, se sincroniza

localStorage["peerClient_peer_xxx"] se elimina
```

---

## Datos que Permanecen Respaldados

### En Tablet (Servidor):
```
localStorage:
  min_pos_ing       → 3 insumos
  min_pos_prod      → 1 receta
  min_pos_sales     → 1 pedido
  min_pos_stock     → {} vacío
  wsServer          → {active: true}
  lastSync          → "2024-01-01T14:30:45"
```

### En iPad (Cliente):
```
localStorage:
  min_pos_ing       → 4 insumos (incluye ORÉGANO)
  min_pos_prod      → 1 receta
  min_pos_sales     → 1 pedido
  min_pos_stock     → {} vacío
  lastSync          → "2024-01-01T14:35:20"
```

---

## Ventajas de Este Setup

✓ **Centralización**: Todo sincronizado desde un dispositivo
✓ **Redundancia**: Cada dispositivo tiene copia local
✓ **Control**: Solo servidor elimina pedidos confirmados
✓ **Escalabilidad**: Añadir más clientes es simple
✓ **Offline**: Funciona sin internet (solo LAN)
✓ **Rápido**: Sincronización en < 100ms

---

## Troubleshooting Rápido

**Problema: iPad no se conecta**
```
1. ¿Ambos en mismo WiFi? (PIZZAWIFI)
2. ¿IP correcta? (192.168.1.50)
3. ¿Tablet aún con servidor activo?
4. ¿Firewall bloqueando puertos?
→ Reinicia WiFi en ambos
```

**Problema: Datos no sincronizan**
```
1. Click en RED → 🔄 Sincronizar Ahora
2. Espera 2-3 segundos
3. ¿Sale error? → Reconecta
→ Recarga app (F5)
```

**Problema: Código QR no se genera**
```
1. ¿Servidor iniciado correctamente?
2. ¿IP visible en la pantalla?
3. ¿Cámara funciona?
→ Intenta conectar manualmente por IP
```

---

## Resumen

```
Tablet (192.168.1.50) → SERVIDOR
         ↕ (Sincronización en tiempo real)
iPad (192.168.1.51) → CLIENTE

Datos fluyen bidireccional
Servidor es fuente de verdad
Clientes pueden sincronizar
Todos respaldados localmente
```

¡Sistema listo para uso en producción! 🚀
