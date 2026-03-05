# ⚡ REFERENCIA RÁPIDA - Cheat Sheet

## 📱 Setup en 30 Segundos

```bash
# SERVIDOR
1. App → "Usar Red Local" → SÍ → SERVIDOR
2. QR generado automáticamente ✅

# CLIENTE
1. App → "Usar Red Local" → SÍ → CLIENTE
2. Escanear QR o ingresar IP
3. ¡Sincronizado! ✅
```

---

## 🎮 Controles Principales

```
┌──────────────────────────────────────┐
│  MODAL DE ROLES                      │
├──────────────────────────────────────┤
│  [🖥️  SERVIDOR]    [📱 CLIENTE]      │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  CLIENTE - CONEXIÓN                  │
├──────────────────────────────────────┤
│  [📷 ESCANEAR QR]  [📝 ENTRADA MANUAL]│
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  SCANNER QR                          │
├──────────────────────────────────────┤
│  [📷 INICIAR]  [⊗ DETENER]           │
│  [← VOLVER]                          │
└──────────────────────────────────────┘
```

---

## 🔌 Métodos Principales

### Servidor
```javascript
APP.selectServerRole('server')           // Iniciar servidor
APP.generateServerQR({...})              // Generar QR
APP.disconnectNetwork()                  // Apagar
```

### Cliente
```javascript
APP.selectServerRole('client')           // Iniciar cliente
APP.startQRScanner()                     // Escanear
APP.connectToServer({ip, id})            // Conectar manual
APP.stopQRScanner()                      // Parar scanner
APP.disconnectNetwork()                  // Desconectar
```

### Sincronización
```javascript
SYNC.manualSync()                        // Forzar sync
WEBRTC.detectLocalIP()                   // Obtener IP
```

---

## 🐛 Errores Comunes

| Error | Cause | Solución |
|-------|-------|----------|
| `NotAllowedError` | Permiso denegado | Habilitar en navegador |
| `NotFoundError` | Sin cámara | Usar entrada manual |
| `NotReadableError` | Cámara en uso | Cerrar otra app |
| QR no detecta | Mala iluminación | Más luz |
| Conexión fallida | Red diferente | Verificar WiFi |
| Datos no sincronizan | Servidor apagado | Iniciar servidor |

---

## 📊 Estructura de Datos QR

```json
{
  "ip": "192.168.1.50",
  "id": "peer_1704067200000_abc123",
  "type": "server",
  "version": "1.0"
}
```

---

## 🧪 Test Rápido

```javascript
// En consola del navegador:

// 1. Verificar librerías
console.log(typeof QRCode, typeof jsQR);
// Resultado: function function ✅

// 2. Verificar métodos
console.log(typeof APP.generateServerQR);
// Resultado: function ✅

// 3. Detectar IP
WEBRTC.detectLocalIP().then(ip => console.log(ip));
// Resultado: 192.168.x.x ✅

// 4. Generar QR
APP.generateServerQR({
  ip: '192.168.1.1',
  id: 'test',
  type: 'server'
});
// Resultado: QR visible en canvas ✅
```

---

## 📚 Documentación Rápida

| Necesito... | Lee... |
|-----------|--------|
| Empezar rápido | GUIA-RAPIDA-QR.md |
| Entender todo | ARQUITECTURA.md |
| Ver flujos | FLUJOS-COMPLETOS.md |
| Código real | EJEMPLOS-PRACTICOS.md |
| Testear | VERIFICACION-SISTEMA.md |
| QR específicamente | QR-SCANNING.md |
| Índice completo | INDICE.md |

---

## ⌚ Tiempos Típicos

```
Generación QR:      < 1 segundo
Escaneo QR:         < 3 segundos
Conexión:           < 2 segundos
Sincronización:     < 1 segundo
Latencia continua:  < 100ms
```

---

## 🔒 Seguridad

- ✅ Sin servidores externos
- ✅ Datos locales solamente
- ✅ P2P en la misma red
- ✅ QR válido solo esa sesión
- ✅ ID generado aleatoriamente

---

## 📱 Compatibilidad

```
✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ Mobile Chrome/Firefox
✅ iOS Safari 14+
```

---

## 🎯 Casos de Uso

```
├─ Restaurante
│  └─ Tablet (servidor) ↔ Teléfono (cliente)
│
├─ Evento
│  └─ Central (servidor) ↔ Múltiples puestos (clientes)
│
├─ Tienda
│  └─ Mostrador (servidor) ↔ Caja/Almacén (clientes)
│
└─ Cualquier lugar
   └─ 1 dispositivo central ↔ N dispositivos secundarios
```

---

## 🔧 Configuración

```javascript
// DEBUG MODE
localStorage.setItem('DEBUG', 'true');
location.reload();

// CLEAR DATA
localStorage.clear();

// CHECK CONNECTION
console.log(localStorage.getItem('networkConnected'));

// CHECK SYNC LOG
console.table(JSON.parse(localStorage.getItem('syncLog')));
```

---

## 💾 Datos Guardados

```javascript
// En localStorage
localStorage.ingredients          // Ingredientes
localStorage.products             // Productos
localStorage.sales               // Ventas
localStorage.stock               // Stock
localStorage.networkConnected    // Estado conexión
localStorage.networkRole         // Servidor/Cliente
localStorage.syncLog             // Historial
```

---

## 🚨 Troubleshooting Rápido

```javascript
// ¿Cámara no funciona?
navigator.mediaDevices.getUserMedia({video: true})
  .then(() => console.log('Cámara OK'))
  .catch(err => console.log('Error:', err.name));

// ¿QRCode cargó?
console.log('QRCode:', typeof QRCode);

// ¿jsQR cargó?
console.log('jsQR:', typeof jsQR);

// ¿Datos guardados?
console.log('Ventas:', JSON.parse(localStorage.getItem('sales')).length);

// ¿Sincronizado?
console.log('Conectado:', localStorage.getItem('networkConnected'));
```

---

## 📞 Ayuda Rápida

**P: No aparece el QR**  
A: `APP.generateServerQR({ip: '192.168.1.50', id: 'test', type: 'server'})`

**P: No escanea**  
A: Verifica iluminación y distancia (15-30cm)

**P: Permiso denegado**  
A: Configuración → Cámara → Permitir

**P: No conecta**  
A: Verifica mismo WiFi e ingresa IP manual

**P: No sincroniza**  
A: Verifica servidor activo y recarga cliente

---

## 🎨 Interfaz Visual

```
┌─────────────────────────┐
│  Servidor Iniciado      │
├─────────────────────────┤
│   [QR]                  │  ← Canvas 200x200
│   ▓▓▓▓▓                │
│   ▓   ▓   ▓   ▓        │
│   ▓ ▓ ▓ ▓ ▓           │
│   ▓▓▓▓▓▓▓▓▓▓         │
│                         │
│  Conectados: 2          │
├─────────────────────────┤
│  [Detener]              │
└─────────────────────────┘

┌─────────────────────────┐
│  Escanear QR            │
├─────────────────────────┤
│ ╔═════════════════════╗ │
│ ║  [VIDEO]            ║ │  ← Camera Preview
│ ║  ╔══╗    ╔══╗       ║ │  ← Overlay (verde)
│ ║  ║  ║ ── ║  ║       ║ │  ← Cross (blanca)
│ ║  ╚══╝    ╚══╝       ║ │
│ ╚═════════════════════╝ │
│                         │
│  [Iniciar] [Detener]   │
└─────────────────────────┘
```

---

## 📈 Performance

```
Generación QR:      ~500ms
Detección por frame:  ~10ms
Latencia P2P:        ~50ms
Sincronización:     ~300ms
CPU (scanner):       ~5-10%
RAM (app):          ~15-20MB
```

---

## ✅ Checklist Final

- [ ] QRCode.js cargó (typeof QRCode)
- [ ] jsQR.js cargó (typeof jsQR)
- [ ] Métodos disponibles (APP.generateServerQR, etc.)
- [ ] WebRTC detecta IP
- [ ] Canvas renderiza QR
- [ ] Cámara accesible
- [ ] localStorage funciona
- [ ] Sincronización funciona

---

## 📚 Documentos Clave

1. **Empezar**: `GUIA-RAPIDA-QR.md`
2. **Entender**: `ARQUITECTURA.md`
3. **Código**: `EJEMPLOS-PRACTICOS.md`
4. **Flujos**: `FLUJOS-COMPLETOS.md`
5. **Testing**: `VERIFICACION-SISTEMA.md`
6. **Índice**: `INDICE.md`

---

## 🎯 Próximas Acciones

1. **Nuevo usuario**: Lee `GUIA-RAPIDA-QR.md`
2. **Problemas**: Revisa `GUIA-RAPIDA-QR.md` → Troubleshooting
3. **Desarrollador**: Lee `ARQUITECTURA.md` + `EJEMPLOS-PRACTICOS.md`
4. **Testing**: Usa `VERIFICACION-SISTEMA.md`

---

**Versión:** 1.0  
**Última actualización:** 2024-01-01  
**Estado:** ✅ Completado
