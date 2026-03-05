# 📱 Sistema de Códigos QR - Guía Completa

## Descripción General

Sistema de escaneo y generación de códigos QR para sincronizar dispositivos en red local. El servidor genera un QR con sus datos de conexión, y los clientes escanean este código para conectarse automáticamente.

---

## 🔧 Arquitectura Técnica

### Librerías Utilizadas

```html
<!-- Generación de QR -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode.js/1.5.3/qrcode.min.js"></script>

<!-- Lectura de QR -->
<script src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js"></script>
```

### Estructura de Datos QR

El código QR generado contiene un JSON con:

```json
{
  "ip": "192.168.1.50",
  "id": "peer_1704067200000_abc123",
  "type": "server",
  "version": "1.0"
}
```

**Campos:**
- `ip`: Dirección IP del servidor en la red local
- `id`: Identificador único del peer (timestamp + random)
- `type`: Tipo de peer ("server" siempre para el QR)
- `version`: Versión del protocolo de sincronización

---

## 🖥️ Flujo del Servidor

### 1. Iniciar Servidor

```javascript
APP.selectServerRole(); // Abre modal para confirmar rol
```

**Pasos:**
1. Usuario selecciona "Servidor" en la modal de rol de red
2. Se detecta la IP local del dispositivo (via WebRTC)
3. Se genera un identificador único
4. Se crea el código QR

### 2. Generación del QR

```javascript
APP.generateServerQR();
```

**Proceso interno:**

```javascript
const qrData = JSON.stringify({
    ip,      // Detectada via WebRTC
    id,      // Generada al iniciar
    type: 'server',
    version: '1.0'
});

QRCode.toCanvas(qrCanvas, qrData, {
    errorCorrectionLevel: 'H',  // Máxima tolerancia a daño
    type: 'image/png',
    quality: 0.95,
    margin: 1,
    width: 200,
    color: {dark: '#000000', light: '#FFFFFF'}
}, callback);
```

**Opciones del QRCode:**
- `errorCorrectionLevel: 'H'`: Puede leer con 30% de daño
- `quality: 0.95`: Máxima claridad
- `width: 200`: Dimensión (píxeles)
- `margin: 1`: Espaciado mínimo

**Manejo de Errores:**
```
❌ Librería no disponible
   → Toast de error
   
❌ Canvas no existe
   → Mensaje en consola
   
✅ QR generado exitosamente
   → Se muestra en la modal
```

### 3. Interfaz del Servidor

**Modal `serverStartedModal`:**
```
┌─────────────────────────┐
│  Servidor Iniciado      │
├─────────────────────────┤
│  [Código QR 200x200]    │
│                         │
│  Clientes conectados: N │
├─────────────────────────┤
│  [Detener Servidor]     │
└─────────────────────────┘
```

---

## 📱 Flujo del Cliente

### 1. Conectar a Servidor

```javascript
APP.selectServerRole(); // Abre modal de rol
// Usuario selecciona "Cliente"
```

**Pasos:**
1. Usuario selecciona "Cliente"
2. Se abre modal con 2 opciones:
   - Escanear QR (cámara)
   - Ingresar IP manualmente

### 2. Escaneo de QR

```javascript
APP.startQRScanner();
```

**Flujo de ejecución:**

```
1. Solicitar acceso a cámara
   ├─ ✅ Permiso otorgado
   │  ├─ Obtener stream de video
   │  ├─ Esperar a que video esté listo (onloadedmetadata)
   │  ├─ Ajustar canvas a dimensiones de video
   │  └─ Iniciar detección (cada 300ms)
   │
   └─ ❌ Permiso denegado
      ├─ Mostrar error específico
      └─ Ofrecer entrada manual

2. Detección de QR (loop cada 300ms)
   ├─ Dibujar frame de video en canvas
   ├─ Procesar con jsQR
   ├─ Si QR detectado:
   │  ├─ Extraer datos JSON
   │  ├─ Validar campos (ip, id, type)
   │  ├─ Si válido:
   │  │  ├─ Llenar inputs con ip e id
   │  │  ├─ Detener scanner
   │  │  ├─ Toast de éxito
   │  │  └─ Ofrecer conectar
   │  └─ Si inválido:
   │     └─ Continuar escaneando
   └─ Si no detectado:
      └─ Continuar escaneando

3. Limpieza (stopQRScanner)
   ├─ Detener stream de video
   ├─ Limpiar canvas
   ├─ Cancelar loop de detección
   └─ Liberar recursos
```

**Errores Manejados:**

| Error | Causa | Solución |
|-------|-------|----------|
| `NotAllowedError` | Permiso denegado | Habilitar en configuración |
| `NotFoundError` | No hay cámara | Usar entrada manual |
| `NotReadableError` | Cámara en uso | Cerrar otras apps |
| `PermissionDenied` | Sistema operativo | Reiniciar navegador |

### 3. Interfaz de Escaneo

**Modal `qrScannerModal`:**
```
┌────────────────────────────┐
│  Escanear Código QR        │
├────────────────────────────┤
│  ┌────────────────────┐    │
│  │ [VIDEO PREVIEW]    │    │
│  │ ╔══╗        ╔══╗   │    │
│  │ ║  ║  ────  ║  ║   │    │
│  │ ╚══╝        ╚══╝   │    │
│  │   ↑ Centra aquí     │    │
│  └────────────────────┘    │
│                            │
│  [📷 Iniciar] [⊗ Detener]  │
├────────────────────────────┤
│  💡 Consejos:              │
│  • Código visible          │
│  • Bien iluminado          │
│  • Mantén quieto           │
│  • Acércate si es pequeño  │
├────────────────────────────┤
│  [← Volver a Manual]       │
└────────────────────────────┘
```

**Indicadores Visuales:**
- Esquinas verdes: Área de detección
- Cruz blanca: Centro para alineación
- Toast: Mensajes de estado

### 4. Entrada Manual (Fallback)

```javascript
// Si escaneo falla, usuario puede ingresar datos manualmente

// IP del servidor
📍 192.168.1.50

// ID del servidor
🔑 peer_1704067200000_abc123

// [Conectar] [Cancelar]
```

---

## 🔌 Conexión Final

Una vez escaneado o ingresado manualmente:

```javascript
APP.connectToServer({
    ip: "192.168.1.50",
    id: "peer_1704067200000_abc123"
});
```

**Proceso:**
1. Validar IP y ID
2. Crear WebSocket/WebRTC connection
3. Intercambiar datos iniciales
4. Sincronizar base de datos
5. Mantener conexión en tiempo real

---

## 🎯 Casos de Uso

### Caso 1: Un Servidor, Múltiples Clientes

```
[Tablet Servidor]
    ↑ genera QR
    |
    ├──→ [Teléfono 1] escanea
    ├──→ [Teléfono 2] escanea
    └──→ [Laptop] escanea
```

**Flujo:**
1. Tablet inicia como servidor
2. Genera QR con su IP
3. Clientes escanean desde sus dispositivos
4. Todos sincronizados en tiempo real

### Caso 2: Cambio de Red

```
Red WiFi "Tienda" → Red Móvil "Hotspot"
    ↑ IP cambió
    └─→ Regenerar QR automáticamente
        Clientes detectan cambio → Reconectar
```

### Caso 3: Dispositivo Sin Cámara

```
Tablet sin cámara
    ↓
Escaneo falla → NotFoundError
    ↓
Fallback a entrada manual
    ↓
Usuario ingresa IP del servidor
    ↓
Conectar exitosamente
```

---

## 🛠️ Funciones de API

### Servidor

```javascript
// Iniciar como servidor
APP.selectServerRole('server')

// Generar código QR
APP.generateServerQR()

// Obtener QR como imagen
const canvas = document.getElementById('qrCode');
const dataUrl = canvas.toDataURL('image/png');

// Descargar QR
const link = document.createElement('a');
link.href = dataUrl;
link.download = `qr-servidor-${new Date().getTime()}.png`;
link.click();

// Detener servidor
APP.disconnectNetwork()
```

### Cliente

```javascript
// Iniciar como cliente
APP.selectServerRole('client')

// Iniciar escaneo
APP.startQRScanner()

// Detener escaneo
APP.stopQRScanner()

// Conectar manualmente
APP.connectToServer({
    ip: "192.168.1.50",
    id: "peer_1704067200000_abc123"
})

// Desconectar
APP.disconnectNetwork()
```

---

## 🔍 Troubleshooting

### QR no se genera

**Problema:** Canvas muestra error o está vacío

**Soluciones:**
```javascript
// 1. Verificar libería
if (typeof QRCode === 'undefined') {
    console.error('QRCode.js no cargó');
    // Recargar página
}

// 2. Limpiar canvas antes
ctx.clearRect(0, 0, canvas.width, canvas.height);

// 3. Verificar datos
console.log('QR data:', {ip, id, type: 'server'});

// 4. Usar opciones correctas
{
    errorCorrectionLevel: 'H',
    type: 'image/png',
    quality: 0.95,
    margin: 1,
    width: 200
}
```

### Escaneo no detecta QR

**Problema:** Cámara abierta pero no lee códigos

**Soluciones:**
```javascript
// 1. Verificar iluminación
console.log('Luminosidad:', jsQR detecta mejor con >100 lux)

// 2. Verificar distancia
// A 15-30cm de la cámara es ideal

// 3. Verificar QR válido
// Debe ser QR código de 21x21 o superior

// 4. Limpiar lente
// Polvo o dedos pueden obstaculizar

// 5. Revisar permisos
// Ir a Configuración del navegador > Permisos > Cámara
```

### Permisos denegados

**Problema:** "Permiso de cámara denegado"

**Soluciones:**
```
Navegador → Configuración → Privacidad
    ↓
Cámara → Permitir para este sitio
    ↓
Recargar página
    ↓
Intentar de nuevo
```

### Conexión fallida después de escanear

**Problema:** QR escaneado pero no conecta

**Soluciones:**
1. Verificar que servidor siga activo
2. Mismo WiFi (IP debe ser privada: 192.168.x.x)
3. Firewall/Router no bloqueando puerto
4. Verificar IP escaneada es correcta
5. Reintentar conexión

---

## 📊 Diagnóstico

### Activar modo debug

```javascript
// En consola del navegador
localStorage.setItem('DEBUG', 'true');
location.reload();

// Verás logs detallados:
// [QR] Generando código...
// [Scanner] Cámara iniciada
// [Detector] QR detectado
// [Parser] Datos validados
// [Connect] Conectando a 192.168.1.50
```

### Inspeccionar datos QR

```javascript
// En consola
const qrData = {
    ip: "192.168.1.50",
    id: "peer_1704067200000_abc123",
    type: "server",
    version: "1.0"
};

console.table(qrData);
// Verás tabla con todos los campos
```

---

## 🚀 Optimizaciones Futuras

- [ ] Historial de conexiones previas
- [ ] Código QR con logo personalizado
- [ ] Escaneo en tiempo real con preview
- [ ] Compatibilidad con 1D barcodes
- [ ] Exportar QR como PDF/Imagen
- [ ] Generar múltiples QRs para diferentes clientes
- [ ] QR con expiración de tiempo
- [ ] Cifrado de datos en QR (si se requiere)

---

## 📚 Referencias

- [QRCode.js Documentation](https://davidshimjs.github.io/qrcodejs/)
- [jsQR Documentation](https://github.com/cozmo/jsQR)
- [Web Cameras API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [JSON en URLs](https://en.wikipedia.org/wiki/Query_string#Structure)

---

**Última actualización:** 2024-01-01  
**Versión:** 1.0  
**Estado:** ✅ Completo
