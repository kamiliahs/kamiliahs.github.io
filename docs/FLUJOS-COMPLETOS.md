# 🎯 Resumen del Sistema de Sincronización de Red Local

## 📈 Flujo General Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                   INICIO DE LA APLICACIÓN                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                ┌─────────────────────────┐
                │  ¿Usar Red Local?       │
                └─────────────────────────┘
                    ↙                   ↘
            [SÍ]                      [NO]
            ↓                         ↓
    ┌──────────────┐         ┌────────────────┐
    │ Seleccionar  │         │ Usar local     │
    │ Rol de Red   │         │ (sin sincro)   │
    └──────────────┘         └────────────────┘
        ↙        ↘
    [Server]  [Client]
      ↓         ↓
   FLUJO-A   FLUJO-B
```

---

## 🖥️ FLUJO A: SERVIDOR

```
┌──────────────────────────────────────────────────────────┐
│ 1. INICIAR SERVIDOR                                      │
│    - Detectar IP local (WebRTC)                          │
│    - Generar ID único (timestamp + random)               │
│    - Crear datos: {ip, id, type: 'server'}              │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ 2. GENERAR CÓDIGO QR                                     │
│    - Crear canvas 200x200px                             │
│    - Procesar JSON con QRCode.js                        │
│    - Opciones: H correction, 0.95 quality              │
│    - Mostrar en modal                                   │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ 3. SERVIDOR EN ESPERA                                   │
│    ┌─────────────────────────────────────────────────┐  │
│    │ 📊 Estado del Servidor                          │  │
│    ├─────────────────────────────────────────────────┤  │
│    │ IP: 192.168.1.50                               │  │
│    │ ID: peer_1704067200000_abc123                  │  │
│    │                                                 │  │
│    │ [QR 200x200 aquí]                             │  │
│    │                                                 │  │
│    │ Clientes conectados: 0                         │  │
│    │                                                 │  │
│    │ [Detener Servidor]                            │  │
│    └─────────────────────────────────────────────────┘  │
│                                                         │
│    Esperando que clientes escaneen...                  │
└──────────────────────────────────────────────────────────┘
                         ↓
                  ¿Cliente conectado?
                    ↙          ↘
                [SÍ]          [NO]
                ↓             ↓
         FLUJO-C      (continuar esperando)
```

---

## 📱 FLUJO B: CLIENTE - OPCIÓN 1 (ESCANEAR QR)

```
┌──────────────────────────────────────────────────────────┐
│ 1. ABRIR MODAL DE CONEXIÓN                               │
│    ┌─────────────────────────────────────────────────┐  │
│    │ Conectar al Servidor                            │  │
│    │                                                 │  │
│    │ [📷 Escanear QR]    [📝 Entrada Manual]        │  │
│    └─────────────────────────────────────────────────┘  │
│                                                         │
│    Usuario toca: "Escanear QR"                          │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ 2. SOLICITAR ACCESO A CÁMARA                             │
│    [NAVEGADOR] "¿Permitir acceso a la cámara?"          │
│                                                         │
│    ┌─────────────────────────────────────────────────┐  │
│    │ ¿Permitir acceso a la cámara?                  │  │
│    │ [Cancelar]  [Permitir]                        │  │
│    └─────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                    ↙              ↘
            [Cancelar]          [Permitir]
            ↓                   ↓
    Mostrar error         FLUJO-B2
    (Ir a Entrada
     Manual)
```

### 📸 FLUJO B2: ESCANEO ACTIVO

```
┌──────────────────────────────────────────────────────────┐
│ 3. INICIAR ESCANEO                                       │
│    ┌─────────────────────────────────────────────────┐  │
│    │ Escanear Código QR                              │  │
│    ├─────────────────────────────────────────────────┤  │
│    │  ┌────────────────────────────────────────┐   │  │
│    │  │ [VIDEO EN VIVO]                        │   │  │
│    │  │                                        │   │  │
│    │  │ ╔══════════════════════════╗         │   │  │
│    │  │ ║  [Apunta al QR aquí]    ║         │   │  │
│    │  │ ║  ╔══╗          ╔══╗      ║         │   │  │
│    │  │ ║  ║  ║    ────  ║  ║      ║         │   │  │
│    │  │ ║  ╚══╝          ╚══╝      ║         │   │  │
│    │  │ ╚══════════════════════════╝         │   │  │
│    │  │                                        │   │  │
│    │  │  "Centra el código QR"                 │   │  │
│    │  │                                        │   │  │
│    │  └────────────────────────────────────────┘   │  │
│    │                                                │  │
│    │ [📷 Iniciando...]  [⊗ Detener]               │  │
│    └─────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                         ↓
            Analizando frames cada 300ms...
                         ↓
                  ¿QR Detectado?
                    ↙          ↘
                [SÍ]          [NO]
                ↓             ↓
         (Validar)    (Seguir escaneando)
                         ↑
                    (loop continuo)
```

---

## ✅ FLUJO B3: VALIDACIÓN Y CONEXIÓN

```
┌──────────────────────────────────────────────────────────┐
│ 4. QR DETECTADO Y VALIDADO                               │
│                                                         │
│    Datos extraídos:                                     │
│    ├─ ip: "192.168.1.50"  ✅                           │
│    ├─ id: "peer_17040..." ✅                           │
│    ├─ type: "server"      ✅                           │
│    └─ version: "1.0"      ✅                           │
│                                                         │
│    Toast: "✅ Código QR válido escaneado"             │
│                                                         │
│    Campos rellenados automáticamente:                   │
│    IP: 192.168.1.50                                    │
│    ID: peer_1704067200000_abc123                       │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ 5. CONFIRMAR CONEXIÓN                                   │
│    ┌─────────────────────────────────────────────────┐  │
│    │ ✅ Código QR Escaneado                          │  │
│    │                                                 │  │
│    │ IP: 192.168.1.50                               │  │
│    │ ID: peer_1704067200000_abc123                  │  │
│    │                                                 │  │
│    │ [Conectar]  [Cancelar]                         │  │
│    └─────────────────────────────────────────────────┘  │
│                                                         │
│    Usuario toca: "Conectar"                             │
└──────────────────────────────────────────────────────────┘
                         ↓
                    FLUJO-C
```

---

## 📱 FLUJO-B Alternativo: ENTRADA MANUAL

```
┌──────────────────────────────────────────────────────────┐
│ 1. ABRIR MODAL DE ENTRADA MANUAL                         │
│    ┌─────────────────────────────────────────────────┐  │
│    │ Conectar Manualmente                            │  │
│    │                                                 │  │
│    │ 📍 IP del Servidor:                            │  │
│    │ [                        ]                     │  │
│    │ (Ej: 192.168.1.50)                            │  │
│    │                                                 │  │
│    │ 🔑 ID del Servidor:                            │  │
│    │ [                        ]                     │  │
│    │ (Ej: peer_170406...)                          │  │
│    │                                                 │  │
│    │ [Conectar]  [Cancelar]                         │  │
│    └─────────────────────────────────────────────────┘  │
│                                                         │
│    Usuario ingresa datos manualmente                    │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ 2. VALIDAR Y CONECTAR                                   │
│    ├─ ¿IP válida (formato)?                             │
│    ├─ ¿IP privada (192.168.x.x)?                       │
│    └─ ¿ID no vacío?                                    │
│                                                         │
│    Si todo OK → FLUJO-C                                │
│    Si error → Mostrar error y volver a pedir           │
└──────────────────────────────────────────────────────────┘
```

---

## 🔌 FLUJO C: CONEXIÓN Y SINCRONIZACIÓN

```
┌──────────────────────────────────────────────────────────┐
│ 1. ESTABLECER CONEXIÓN                                   │
│                                                         │
│    [Cliente] ←→ [Servidor]                             │
│    192.168.1.100    192.168.1.50                        │
│                                                         │
│    Comunicación: localStorage + WebRTC                  │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ 2. INTERCAMBIAR IDENTIDADES                              │
│                                                         │
│    [Cliente] → Envía: {tipo: 'client', id: '...'}     │
│    [Servidor] ← Recibe: Registra nuevo cliente         │
│    [Servidor] → Envía: {tipo: 'server', estado: 'ok'} │
│    [Cliente] ← Recibe: Confirma conexión               │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ 3. SINCRONIZAR DATOS INICIALES                           │
│                                                         │
│    [Servidor] → Envía:                                  │
│    {                                                    │
│        ingredientes: [...],                             │
│        productos: [...],                                │
│        ventas: [...],                                  │
│        stock: {...}                                    │
│    }                                                    │
│                                                         │
│    [Cliente] ← Recibe y actualiza:                      │
│    localStorage + Renderiza UI                          │
│                                                         │
│    Toast: "✅ Sincronización completada"               │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ 4. ESTADO CONECTADO                                     │
│    ┌─────────────────────────────────────────────────┐  │
│    │ 📡 Estado de Red                                │  │
│    │                                                 │  │
│    │ Conexión: ✅ Conectado                         │  │
│    │ IP del Servidor: 192.168.1.50                 │  │
│    │ ID del Servidor: peer_1704...                 │  │
│    │                                                 │  │
│    │ Dispositivos en red: 2                         │  │
│    │ ✓ Servidor (192.168.1.50)                     │  │
│    │ ✓ Este cliente (192.168.1.100)                │  │
│    │                                                 │  │
│    │ [Desconectar]                                 │  │
│    │ [Sincronizar Ahora]                           │  │
│    └─────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUJO D: SINCRONIZACIÓN CONTINUA

```
Durante la operación normal:

[Usuario realiza acción en Cliente]
        ↓
[Guarda en localStorage local]
        ↓
[Envía mensaje a Servidor]
        ↓
[Servidor actualiza su localStorage]
        ↓
[Servidor retransmite a otros Clientes]
        ↓
[Otros Clientes actualizan su localStorage]
        ↓
[Todos los dispositivos sincronizados ✅]

Ejemplos de acciones sincronizadas:
├─ Agregar ingrediente
├─ Crear producto
├─ Realizar venta
├─ Actualizar stock
├─ Editar receta
├─ Eliminar registro
└─ Cambios en reportes
```

---

## 🏗️ ARQUITECTURA TÉCNICA

```
┌──────────────────────────────────────────────────────────┐
│                    UI LAYER                              │
│  (index.html + utils.js - Modals y Vistas)              │
└──────────────────────────────────────────────────────────┘
                         ↑↓
┌──────────────────────────────────────────────────────────┐
│                  APP LAYER                               │
│    (app.js - Orquestación y Eventos)                    │
│    - selectServerRole()                                 │
│    - generateServerQR()                                 │
│    - startQRScanner()                                   │
│    - connectToServer()                                  │
│    - manualSync()                                       │
│    - disconnectNetwork()                                │
└──────────────────────────────────────────────────────────┘
                         ↑↓
┌──────────────────────────────────────────────────────────┐
│                  SYNC LAYER                              │
│    (sync.js - Sincronización de Datos)                  │
│    - mergeServerData()                                  │
│    - applyRemoteChanges()                               │
│    - syncAddIngredient/Product/Sale()                   │
└──────────────────────────────────────────────────────────┘
                         ↑↓
┌──────────────────────────────────────────────────────────┐
│                NETWORK LAYER                             │
│    (webrtc.js - Comunicación P2P)                       │
│    - startServer()                                      │
│    - connectToServer()                                  │
│    - sendMessage()                                      │
│    - broadcastDataUpdate()                              │
│    - detectLocalIP()                                    │
└──────────────────────────────────────────────────────────┘
                         ↑↓
┌──────────────────────────────────────────────────────────┐
│                  DATA LAYER                              │
│    (data.js + storage.js - Persistencia)                │
│    - CRUD Ingredientes/Productos/Ventas/Stock          │
│    - localStorage abstraction                           │
└──────────────────────────────────────────────────────────┘
```

---

## 📊 MATRIZ DE COMUNICACIÓN

```
                    localStorage
                    (P2P Messaging)
                    ↑            ↓
        ┌───────────┴────────────┴──────────┐
        ↓                                    ↓
    [Servidor]  ←──────WebRTC──────→  [Cliente]
    192.168.1.50   (IP Detection)    192.168.1.100
    
    Mensajes:
    ├─ Servidor → Cliente: Datos actualizados
    ├─ Cliente → Servidor: Cambios locales
    ├─ Servidor → Clientes: Cambios de otros clientes
    └─ Bidireccional: Confirmaciones de sync
```

---

## 🎬 CASO PRÁCTICO COMPLETO

### Escenario: Usuario en Tablet (Servidor) vende un producto

```
1️⃣ TABLET (SERVIDOR)
   └─ Usuario selecciona producto "Café" y cantidad 2
   └─ Presiona "Vender"
   └─ Data.checkout({...})
   └─ Guarda en localStorage
   └─ Envía mensaje a WebRTC

2️⃣ TELÉFONO 1 (CLIENTE)
   └─ Recibe mensaje vía localStorage
   └─ Sync.mergeServerData()
   └─ Actualiza ingredientes (menos café)
   └─ Renderiza inventario actualizado
   └─ Toast: "Sincronización completada"

3️⃣ TELÉFONO 2 (CLIENTE)
   └─ Recibe mensaje vía localStorage
   └─ Mismo proceso que Teléfono 1

4️⃣ TABLET (SERVIDOR)
   └─ Recibe confirmación de ambos clientes
   └─ Registra ambos como "conectados"
   └─ Vista de red muestra 3 dispositivos
```

---

## 🔐 INTEGRIDAD DE DATOS

```
Servidor              Cliente
├─ ingredientes       ├─ ingredientes (copia)
├─ productos          ├─ productos (copia)
├─ ventas             ├─ ventas (copia)
└─ stock              └─ stock (copia)

Cuando cliente hace cambio:
   ├─ Cambio local inmediato (UX fluida)
   ├─ Envía a servidor
   ├─ Servidor valida y aplica
   ├─ Servidor notifica a otros clientes
   └─ Todos convergen al mismo estado

En caso de conflicto:
   ├─ Version timestamps
   ├─ El más reciente gana
   └─ Se registra en console (debug)
```

---

## 📡 ESTADOS DE LA RED

```
Estado 1: DESCONECTADO
├─ No hay servidor
├─ No hay WebRTC
├─ App funciona en modo local
└─ localStorage solo local

Estado 2: SERVIDOR ACTIVO
├─ Un dispositivo es servidor
├─ Escucha conexiones P2P
├─ Mantiene estado maestro
└─ QR disponible para clientes

Estado 3: CLIENTE SINCRONIZADO
├─ Conectado al servidor
├─ Recibe actualizaciones en tiempo real
├─ Puede operar offline (datos caché)
└─ Sincroniza cuando vuelva en línea

Estado 4: RED FRAGMENTADA
├─ Múltiples servidores o desconexiones
├─ Cada uno mantiene su copia
├─ Merge de datos cuando reconecta
└─ Conflict resolution por timestamp
```

---

## 🚀 FLUJO RESUMIDO EN 5 PASOS

```
┌─────────────────────────────────────────────────┐
│ PASO 1: Seleccionar Rol                        │
│ Usuario elige: Servidor o Cliente              │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ PASO 2: Generar/Escanear QR                    │
│ Servidor: Genera QR con su IP/ID               │
│ Cliente: Escanea QR del servidor                │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ PASO 3: Conectar                               │
│ Cliente → Servidor (vía WebRTC)                │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ PASO 4: Sincronizar Datos                      │
│ Servidor envía estado actual                   │
│ Cliente actualiza su localStorage              │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ PASO 5: Usar la App                            │
│ Todos los cambios se sincronizan en tiempo real│
└─────────────────────────────────────────────────┘
```

---

**Estado:** ✅ Sistema Completo  
**Última actualización:** 2024  
**Versión:** 1.0
