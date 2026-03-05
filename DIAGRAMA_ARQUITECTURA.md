# Diagrama de Arquitectura - Sistema de Red Local

## 1. ARQUITECTURA DE MÓDULOS

```
┌─────────────────────────────────────────────────────────┐
│                  APLICACIÓN POS MINIMALIST              │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │               APP.js (Orquestador)               │   │
│  │  - Controladores de eventos                      │   │
│  │  - Handlers de UI                                │   │
│  │  - Navegación                                    │   │
│  └──────────────────────────────────────────────────┘   │
│                    ▲ ▼ ▲ ▼                               │
│         ┌──────────┘ └──┴──────┬──────────────┐          │
│         │                      │              │          │
│  ┌──────▼────────┐  ┌──────────▼──┐  ┌───────▼──────┐  │
│  │   DATA.js     │  │   UI.js     │  │  UTILS.js    │  │
│  │               │  │             │  │              │  │
│  │ - Lógica      │  │ - Vistas    │  │ - Helpers    │  │
│  │ - CRUD        │  │ - Templates │  │ - DOM utils  │  │
│  │ - Cálculos    │  │ - Renderado │  │ - Animations │  │
│  └──────┬────────┘  └─────┬──────┘  └──────┬───────┘  │
│         │                 │                │          │
│         │    SINCRONIZACIÓN RED LOCAL      │          │
│         │    ╔════════════════════════╗    │          │
│         │    ║    ✨ NUEVOS MÓDULOS  ║    │          │
│         │    ║   WEBRTC.js + SYNC.js ║    │          │
│         │    ╚════════════════════════╝    │          │
│         │                 │                │          │
│  ┌──────▼────────┐        │       ┌────────▼──────┐  │
│  │ STORAGE.js    │        │       │  WEBRTC.js    │  │
│  │               │        │       │               │  │
│  │ - localStorage│        │       │ - Conexión P2P│  │
│  │ - Persistencia│        │       │ - IP local    │  │
│  │ - CRUD datos  │        │       │ - Mensajería  │  │
│  └───────────────┘        │       │ - Servidor    │  │
│                           │       └─────┬──────────┘  │
│                    ┌──────▼──────┐      │             │
│                    │  SYNC.js    │      │             │
│                    │             │      │             │
│                    │ - Fusión    │◄─────┘             │
│                    │ - Cambios   │                    │
│                    │ - Versiones │                    │
│                    └─────────────┘                    │
│                                                       │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │  localStorage    │
                  │                  │
                  │ - min_pos_ing    │
                  │ - min_pos_prod   │
                  │ - min_pos_sales  │
                  │ - min_pos_stock  │
                  │ - peerMessage_*  │
                  │ - peerBroadcast_ │
                  │ - wsServer       │
                  └──────────────────┘
```

---

## 2. FLUJO DE DATOS P2P

```
DISPOSITIVO A (SERVIDOR)              DISPOSITIVO B (CLIENTE)
═════════════════════════════════════════════════════════════

┌──────────────────────────┐          ┌──────────────────────────┐
│    Abre Aplicación       │          │    Abre Aplicación       │
│         │                │          │         │                │
│         ▼                │          │         ▼                │
│    RED → Servidor        │          │    RED → Conectar        │
│         │                │          │         │                │
│         ▼                │          │         ▼                │
│  WebRTC.startServer()    │          │  WebRTC.connectToServer()│
│         │                │          │         │                │
│         ▼                │          │         ▼                │
│  getLocalIP()  ◄─────────┼──────────┼─────────┼────────────┐  │
│     192.168.1.50         │          │         │            │  │
│         │                │          │         ▼            │  │
│         ▼                │          │  Ingresa IP          │  │
│  Genera peerId           │          │  192.168.1.50        │  │
│  Crea QR                 │          │    (o escanea QR)    │  │
│         │                │          │         │            │  │
│  ┌──────▼──────┐         │          │         ▼            │  │
│  │  QR Mostrado│         │          │  Envía SYNC_REQUEST  │  │
│  │ [█████████] │         │          │         │            │  │
│  └──────┬──────┘         │          │         ▼            │  │
│         │                │          │  localStorage        │  │
│         │                │          │  ['peerMessage_...'] │  │
│         │                │          │         │            │  │
│         │                │          │         │  Detectado │  │
│         │                │          │         ◄────────────┘  │
│         ▼                │          │                         │
│  localStorage            │          │                         │
│  ['wsServer'] = active   │          │                         │
│         │                │          │                         │
│         ▼ (detectado)     │          │                         │
│  handleSyncRequest()     │          │                         │
│         │                │          │                         │
│         ▼                │          │                         │
│  prepara SYNC_RESPONSE   │          │                         │
│  con todos los datos:    │          │                         │
│  - ingredients[]         │          │                         │
│  - products[]            │          │                         │
│  - salesHistory[]        │          │                         │
│  - stock{}               │          │                         │
│         │                │          │                         │
│         ▼                │          │                         │
│  localStorage            │          │                         │
│  ['peerMessage_ClientID']│          │                         │
│         │                │          │                         │
│         │  Detectado     │          ▼                         │
│         └────────────────┼─────────►handleSyncResponse()      │
│                          │                 │                  │
│                          │                 ▼                  │
│                          │          Sync.mergeServerData()    │
│                          │                 │                  │
│                          │                 ▼                  │
│                          │          Data.saveAll()            │
│                          │                 │                  │
│                          │                 ▼                  │
│                          │          UI.renderAll()            │
│                          │                 │                  │
│                          │                 ▼                  │
│                          │          ✓ SINCRONIZADO            │
│                          │                                    │
│                          │                                    │
│  Servidor en espera      │         Cliente listo             │
│  de cambios              │         para operar               │
│                          │                                    │
└──────────────────────────┘          └──────────────────────────┘
```

---

## 3. CICLO DE CAMBIO Y SINCRONIZACIÓN

```
CLIENTE CREA/MODIFICA DATO
║
║  Data.addIngredient('ORÉGANO', 0.30, 'gr')
║       │
║       ▼
║  ingredients.push(ingredient)
║       │
║       ▼
║  Data.saveAll()
║       │
║       ▼
║  Storage.saveIngredients()
║       │
║       ▼
║  localStorage['min_pos_ing'] = JSON.stringify(...)
║       │
║       ▼
║  Sync.syncAddIngredient(ingredient)
║       │
║       ▼
║  ¿Es servidor? 
║  ├─ Sí → WebRTC.broadcastDataUpdate()
║  │        │
║  │        ▼
║  │   localStorage['peerBroadcast_*'] = {...}
║  │        │
║  │        ▼
║  │   Otros clientes detectan
║  │        │
║  │        ▼
║  │   Sync.applyRemoteChanges()
║  │        │
║  │        ▼
║  │   Data.ingredients.push()
║  │        │
║  │        ▼
║  │   Data.saveAll()
║  │        │
║  │        ▼
║  │   UI.renderAll()
║  │
║  └─ No → Solo respaldado localmente
║
╚─► ✓ COMPLETADO
```

---

## 4. ESTRUCTURA DE MENSAJES

```
┌─────────────────────────────────────────┐
│  SYNC_REQUEST (Cliente solicita datos)  │
├─────────────────────────────────────────┤
│  {                                      │
│    type: 'SYNC_REQUEST',               │
│    from: 'peer_client_123',            │
│    to: 'peer_server_456',              │
│    timestamp: 1704067200000            │
│  }                                      │
└─────────────────────────────────────────┘
                    │
                    │ localStorage
                    ▼
┌─────────────────────────────────────────┐
│ SYNC_RESPONSE (Servidor envia datos)    │
├─────────────────────────────────────────┤
│  {                                      │
│    type: 'SYNC_RESPONSE',              │
│    to: 'peer_client_123',              │
│    data: {                              │
│      ingredients: [...],                │
│      products: [...],                   │
│      salesHistory: [...],               │
│      stock: {...}                       │
│    },                                   │
│    timestamp: 1704067200000            │
│  }                                      │
└─────────────────────────────────────────┘
                    │
                    │ localStorage
                    ▼
┌─────────────────────────────────────────┐
│   DATA_UPDATE (Cambio propagado)        │
├─────────────────────────────────────────┤
│  {                                      │
│    type: 'DATA_UPDATE',                │
│    dataType: 'ingredient',             │
│    data: {                              │
│      action: 'add',                     │
│      id: 'ing_123',                     │
│      data: {name, cost, unit}          │
│    },                                   │
│    timestamp: 1704067200000            │
│  }                                      │
└─────────────────────────────────────────┘
                    │
                    │ localStorage
                    ▼
┌─────────────────────────────────────────┐
│ DELETE_SALE (Solo servidor elimina)     │
├─────────────────────────────────────────┤
│  {                                      │
│    type: 'DELETE_SALE',                │
│    saleId: 'sale_789',                 │
│    timestamp: 1704067200000            │
│  }                                      │
└─────────────────────────────────────────┘
```

---

## 5. MODOS DE OPERACIÓN

### Modo Servidor
```
┌─────────────────────────────────────┐
│  SERVIDOR (Tablet Principal)        │
├─────────────────────────────────────┤
│                                     │
│  ✓ Gestiona datos master           │
│  ✓ Responde solicitudes de sync     │
│  ✓ Propaga cambios a clientes      │
│  ✓ Puede eliminar pedidos          │
│  ✓ Punto central de sincronización  │
│                                     │
│  Estado en localStorage:            │
│  wsServer = {                       │
│    active: true,                    │
│    peerId: 'peer_xxx',             │
│    ip: '192.168.1.50',             │
│    role: 'server'                  │
│  }                                  │
│                                     │
│  WebRTC.isServer = true            │
│  WebRTC.isConnected = true          │
│                                     │
└─────────────────────────────────────┘
```

### Modo Cliente
```
┌──────────────────────────────────┐
│  CLIENTE (iPad Secundaria)       │
├──────────────────────────────────┤
│                                  │
│  ✓ Se sincroniza con servidor   │
│  ✓ Respaldo local automático    │
│  ✓ Puede crear/modificar datos  │
│  ✓ NO puede eliminar pedidos    │
│  ✓ Funciona offline             │
│                                  │
│  Estado en localStorage:         │
│  peerClient_peer_xxx = {        │
│    peerId: 'peer_yyy',         │
│    role: 'client',             │
│    serverIp: '192.168.1.50',   │
│    ip: '192.168.1.51'          │
│  }                              │
│                                  │
│  WebRTC.isServer = false         │
│  WebRTC.isConnected = true       │
│                                  │
└──────────────────────────────────┘
```

---

## 6. VISTA DE INTERFAZ

```
┌─ INTERFAZ POS MINIMALIST ─────────────────┐
│                                           │
│  HEADER                                   │
│  ├─ Título: RED LOCAL                    │
│  └─ Status: ● Conectado (Servidor)       │
│                                           │
│  CONTENIDO                                │
│  ├─ ⚙️ Configurar Conexión               │
│  ├─ Información                          │
│  │  ├─ IP: 192.168.1.50                 │
│  │  ├─ ID: peer_xxx                     │
│  │  └─ Modo: Servidor                   │
│  │                                       │
│  ├─ Último Sync: 2024-01-01 14:30:45    │
│  │                                       │
│  ├─ 🔄 Sincronizar Ahora                │
│  ├─ ✕ Desconectar                       │
│  │                                       │
│  └─ Documentación                        │
│     └─ [Guías de uso...]                │
│                                           │
│  NAVIGATION                               │
│  ├─ Ventas │ Stock │ Stats │ Pedidos │ Red │
│  └─ Menu                                 │
│                                           │
└─────────────────────────────────────────┘
```

---

## 7. INTEGRACIONES EXTERNAS

```
                    ┌──────────────────┐
                    │ QRCode.js (CDN)  │
                    │                  │
                    │ - Generar QR     │
                    │ - Canvas output  │
                    └────────┬─────────┘
                             │
                             ▼
    ┌────────────────────────────────────────┐
    │                                        │
    │     POS Minimalist (webrtc.js)         │
    │     - Genera peerId, IP, puerto       │
    │     - Crea código QR con info         │
    │     - Muestra al usuario              │
    │                                        │
    └────────────────────────────────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  jsQR.js (CDN)   │
                    │                  │
                    │ - Escanear QR    │
                    │ - Video input    │
                    └─────────────────┘
```

---

## 8. FLUJO COMPLETO: DE CERO A FUNCIONANDO

```
PASO 1: Usuario abre app
        │
        ▼
        APP.init()
        │
        ├─ Data.init() [carga localStorage]
        ├─ UI.renderAll() [dibuja vistas]
        └─ Escucha eventos
        
PASO 2: Usuario navega a RED
        │
        ▼
        switchView('network')
        │
        └─ UI.renderNetworkStatus()
           │
           └─ Muestra "Desconectado"

PASO 3A: SERVIDOR - Click "Iniciar Servidor"
        │
        ▼
        APP.selectServerRole()
        │
        ├─ WebRTC.startServer()
        │  ├─ getLocalIP() → "192.168.1.50"
        │  ├─ generatePeerId() → "peer_xxx"
        │  └─ localStorage['wsServer'] = active
        │
        ├─ APP.generateServerQR()
        │  └─ QRCode.toCanvas() con {ip, id}
        │
        └─ openModal('serverStartedModal')
           └─ Muestra QR y IP

PASO 3B: CLIENTE - Click "Conectar" + Escanear QR
        │
        ├─ APP.startQRScanner()
        │  └─ navigator.mediaDevices.getUserMedia()
        │
        ├─ jsQR() detecta código
        │  └─ Parsea JSON con {ip, id}
        │
        ├─ APP.connectToServer(ip, id)
        │  └─ WebRTC.connectToServer()
        │     ├─ getLocalIP() → "192.168.1.51"
        │     ├─ generatePeerId() → "peer_yyy"
        │     └─ connectWebSocket()
        │        └─ Envía SYNC_REQUEST
        │
        └─ Espera SYNC_RESPONSE

PASO 4: SERVIDOR recibe SYNC_REQUEST
        │
        ├─ WebRTC.handleSyncRequest()
        │  └─ Prepara todos los datos
        │
        └─ Envía SYNC_RESPONSE con
           ├─ ingredients
           ├─ products
           ├─ salesHistory
           └─ stock

PASO 5: CLIENTE recibe SYNC_RESPONSE
        │
        ├─ WebRTC.handleSyncResponse()
        │  └─ Sync.mergeServerData()
        │     ├─ Fusiona ingredientes
        │     ├─ Fusiona productos
        │     ├─ Fusiona pedidos
        │     └─ Fusiona stock
        │
        ├─ Data.saveAll()
        │  └─ localStorage actualizado
        │
        ├─ UI.renderAll()
        │  └─ Vistas refrescadas
        │
        └─ ✓ SINCRONIZADO

PASO 6: Operación normal
        │
        ├─ Usuario crea insumo
        ├─ Data.addIngredient()
        ├─ Sync.syncAddIngredient()
        ├─ WebRTC.broadcastDataUpdate()
        │
        ├─ Otros clientes detectan cambio
        ├─ Sync.applyRemoteChanges()
        ├─ UI.renderAll()
        │
        └─ ✓ TODOS ACTUALIZADOS
```

---

## 9. DEPENDENCIAS Y LIBRERÍAS

```
INTERNAS (Creadas)
├─ webrtc.js (340 líneas)
├─ sync.js (240 líneas)
└─ Módulos existentes (actualizado)

EXTERNAS (CDN)
├─ QRCode.js (Generar QR)
├─ jsQR.js (Escanear QR)
└─ Tailwind CSS (Estilos)

NATIVAS DEL NAVEGADOR
├─ localStorage API
├─ WebRTC (RTCPeerConnection)
├─ MediaDevices API (Cámara)
├─ CustomEvents
└─ Fetch API (preparación futura)
```

---

## 10. MATRIZ DE CARACTERÍSTICAS

```
                    SERVIDOR    CLIENTE
────────────────────────────────────────
Obtiene IP              ✓         ✓
Genera QR               ✓         -
Escanea QR              -         ✓
Recibe cambios          ✓         ✓
Envia cambios           ✓         ✓
Elimina pedidos         ✓         -
Propaga a otros         ✓         -
Sincroniza local        ✓         ✓
Funciona offline        ✓         ✓
Respaldo automático     ✓         ✓
────────────────────────────────────────
```

---

**Diagrama Completo de Arquitectura - Sistema de Red Local POS Minimalist**
