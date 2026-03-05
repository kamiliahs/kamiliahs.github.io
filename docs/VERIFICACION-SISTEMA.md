# ✅ CHECKLIST DE VERIFICACIÓN DEL SISTEMA

## 📋 Verificación Rápida (5 minutos)

### 1. Librerías QR Cargadas

```javascript
// En consola del navegador, ejecuta:
console.log('QRCode disponible:', typeof QRCode !== 'undefined');
console.log('jsQR disponible:', typeof jsQR !== 'undefined');

// Deberías ver:
// QRCode disponible: true
// jsQR disponible: true
```

**✅ Si ves `true` en ambas:** Las librerías cargaron correctamente

---

### 2. Métodos QR Disponibles

```javascript
// En consola, ejecuta:
console.log('APP.generateServerQR:', typeof APP.generateServerQR);
console.log('APP.startQRScanner:', typeof APP.startQRScanner);
console.log('APP.stopQRScanner:', typeof APP.stopQRScanner);

// Deberías ver:
// APP.generateServerQR: function
// APP.startQRScanner: function
// APP.stopQRScanner: function
```

**✅ Si ves `function` en todos:** Los métodos están implementados

---

### 3. Elementos DOM Necesarios

```javascript
// En consola, ejecuta:
console.log('Canvas QR:', document.getElementById('qrCode'));
console.log('Video Scanner:', document.getElementById('qrScannerVideo'));
console.log('Modal Scanner:', document.getElementById('qrScannerModal'));

// Deberías ver HTMLElements (no null)
```

**✅ Si ves elementos:** El HTML está correctamente estructurado

---

### 4. WebRTC y IP Detection

```javascript
// En consola, ejecuta:
console.log('WEBRTC disponible:', typeof WEBRTC !== 'undefined');
console.log('IP detectada:', WEBRTC.getLocalIP ? 'Sí' : 'No');

// Intenta detectar IP:
WEBRTC.detectLocalIP()
    .then(ip => console.log('Tu IP:', ip))
    .catch(err => console.log('Error IP:', err.message));
```

**✅ Si ves IP local (192.168.x.x):** WebRTC funciona

---

### 5. Generar QR de Prueba

```javascript
// En consola, ejecuta:
APP.generateServerQR({
    ip: '192.168.1.1',
    id: 'peer_test_12345',
    type: 'server'
});

// El código QR aparecerá en el canvas
```

**✅ Si ves un código QR negro/blanco:** Generación funciona

---

## 🧪 Pruebas Completas

### Test 1: Escaneo en Mismo Dispositivo

```
Requisitos:
- Dispositivo con cámara
- QR generado visible
- Navegador con permisos de cámara

Pasos:
1. Abre dev tools (F12)
2. Redimensiona ventana 70% ancho
3. Pon QR en pantalla al lado
4. Click en "Iniciar" en modal de escaneo
5. Apunta cámara hacia el QR

Resultado esperado:
✅ QR detectado en menos de 3 segundos
✅ Datos rellenados automáticamente
✅ Toast de éxito visible
```

### Test 2: Entrada Manual

```
Requisitos:
- Saber IP de otro dispositivo (ping o router)
- Acceso a la app

Pasos:
1. Abre modal de "Conexión Manual"
2. Ingresa IP: 192.168.x.x
3. Ingresa ID: peer_test_12345
4. Click en [Conectar]

Resultado esperado:
✅ Conexión establecida
✅ Toast de éxito
✅ Estado de red muestra conectado
```

### Test 3: Sincronización

```
Requisitos:
- 2 dispositivos en mismo WiFi
- Uno como Servidor, otro como Cliente
- Ambos conectados

Pasos Servidor:
1. Abre "POS" o "Inventario"
2. Agrega un ingrediente o vende algo
3. Observa cambio local inmediato

Pasos Cliente:
1. Abre la misma vista
2. Debería mostrar el cambio en <1 segundo

Resultado esperado:
✅ Cambios se reflejan en tiempo real
✅ Ambos dispositivos muestran mismo estado
✅ Toasts de sincronización en cliente
```

---

## 🐛 Diagnóstico de Problemas

### QR no se genera

```javascript
// Ejecuta en consola:
const canvas = document.getElementById('qrCode');
console.log('Canvas existe:', canvas !== null);
console.log('Contexto 2D:', canvas.getContext('2d') !== null);
console.log('Dimensiones:', canvas.width, 'x', canvas.height);

// Intenta generar manualmente:
try {
    const qrData = JSON.stringify({
        ip: '192.168.1.1',
        id: 'test',
        type: 'server'
    });
    QRCode.toCanvas(canvas, qrData, (err) => {
        if (err) console.error('Error QR:', err);
        else console.log('✅ QR generado');
    });
} catch(e) {
    console.error('Excepción:', e.message);
}
```

### Cámara no se abre

```javascript
// Ejecuta en consola:
navigator.mediaDevices.getUserMedia({
    video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
    }
})
.then(stream => {
    console.log('✅ Cámara accesible');
    stream.getTracks().forEach(t => t.stop());
})
.catch(err => {
    console.error('❌ Error cámara:', err.name);
    console.error('   Mensaje:', err.message);
});
```

### QR no se detecta

```javascript
// Ejecuta en consola:
console.log('jsQR versión:', typeof jsQR);

// Test con imagen de prueba
fetch('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=test')
    .then(r => r.blob())
    .then(blob => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext('2d').drawImage(img, 0, 0);
            const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
            const result = jsQR(imageData.data, canvas.width, canvas.height);
            console.log('jsQR funciona:', result ? '✅' : '❌');
        };
        img.src = URL.createObjectURL(blob);
    });
```

---

## 📊 Verificación de Datos

### Estructura de localStorage

```javascript
// En consola:
console.table({
    'Ingredientes': JSON.parse(localStorage.getItem('ingredients') || '[]').length,
    'Productos': JSON.parse(localStorage.getItem('products') || '[]').length,
    'Ventas': JSON.parse(localStorage.getItem('sales') || '[]').length,
    'Stock': Object.keys(JSON.parse(localStorage.getItem('stock') || '{}')).length
});

// Deberías ver tabla con números (aunque sean 0)
```

### Sincronización en localStorage

```javascript
// En consola:
const syncLog = JSON.parse(localStorage.getItem('syncLog') || '[]');
console.log('Eventos de sincronización:', syncLog.length);
console.log('Últimos eventos:', syncLog.slice(-5));

// Deberías ver registro de sincronizaciones
```

---

## 🔧 Herramientas Útiles

### Detector de IP Local

```javascript
// Ejecuta en consola:
async function detectIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        console.log('IP Externa:', data.ip);
    } catch(e) {
        console.log('IP Externa no disponible');
    }
    
    // IP Local debe ser 192.168.x.x o 10.x.x.x
    WEBRTC.detectLocalIP()
        .then(ip => console.log('IP Local:', ip))
        .catch(err => console.log('Error IP Local:', err.message));
}
detectIP();
```

### Generador de QR de Prueba

```javascript
// Ejecuta en consola:
function generarQRPrueba() {
    const testData = {
        ip: '192.168.1.50',
        id: 'peer_' + Date.now() + '_abc123',
        type: 'server',
        version: '1.0'
    };
    
    console.table(testData);
    
    const canvas = document.getElementById('qrCode');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    QRCode.toCanvas(canvas, JSON.stringify(testData), (err) => {
        if(err) console.error('Error:', err);
        else console.log('✅ QR de prueba generado');
    });
}
generarQRPrueba();
```

### Monitor de Sincronización en Tiempo Real

```javascript
// Ejecuta en consola:
function monitorSync() {
    console.log('📡 Monitoreando sincronización...');
    
    const check = setInterval(() => {
        const sync = JSON.parse(localStorage.getItem('lastSync') || 'null');
        const connected = localStorage.getItem('networkConnected') === 'true';
        const role = localStorage.getItem('networkRole');
        
        console.log(
            '| Conectado:', connected,
            '| Rol:', role,
            '| Última sync:', sync
        );
    }, 1000);
    
    // Ejecuta por 30 segundos
    setTimeout(() => {
        clearInterval(check);
        console.log('Monitor detenido');
    }, 30000);
}
monitorSync();
```

---

## 🎯 Requisitos del Sistema

### Navegador

```javascript
// Ejecuta en consola:
console.table({
    'Navegador': navigator.userAgent.split('/').pop().split(' ')[0],
    'getUserMedia': navigator.mediaDevices.getUserMedia ? '✅' : '❌',
    'WebRTC': typeof RTCPeerConnection !== 'undefined' ? '✅' : '❌',
    'localStorage': typeof localStorage !== 'undefined' ? '✅' : '❌',
    'Canvas': typeof HTMLCanvasElement !== 'undefined' ? '✅' : '❌',
    'Web Workers': typeof Worker !== 'undefined' ? '✅' : '❌'
});
```

### Red

```javascript
// Ejecuta en consola:
async function checkNetwork() {
    console.log('🔍 Verificando red...');
    
    try {
        const response = await fetch('/');
        console.log('Conexión a internet: ✅');
    } catch {
        console.log('Conexión a internet: ❌');
    }
    
    // Verificar IP privada
    WEBRTC.detectLocalIP()
        .then(ip => {
            const isPrivate = /^(192\.168|10\.|172\.1[6-9]\.|172\.2[0-9]\.|172\.3[01]\.)/.test(ip);
            console.log('IP local:', ip, isPrivate ? '✅ (privada)' : '❌ (pública)');
        });
}
checkNetwork();
```

---

## 📝 Reportar Problemas

Si algo no funciona, recopila esta información:

```javascript
// En consola, copia y ejecuta:
const report = {
    navegador: navigator.userAgent,
    ip: await new Promise(r => WEBRTC.detectLocalIP().then(r)),
    librerías: {
        qrcode: typeof QRCode,
        jsqr: typeof jsQR
    },
    permisos: {
        cámara: navigator.permissions ? 'verificar manualmente' : 'desconocido'
    },
    almacenamiento: localStorage.length,
    timestamp: new Date().toISOString()
};
console.log(JSON.stringify(report, null, 2));
// Copia la salida para el reporte
```

---

## ✅ Lista Final de Verificación

- [ ] QRCode.js carga correctamente (typeof QRCode !== 'undefined')
- [ ] jsQR.js carga correctamente (typeof jsQR !== 'undefined')
- [ ] Métodos APP.generateServerQR() y startQRScanner() existen
- [ ] Elementos del DOM existen (#qrCode, #qrScannerVideo, #qrScannerModal)
- [ ] WebRTC detecta IP local correctamente
- [ ] QR se genera sin errores
- [ ] Cámara es accesible (si el dispositivo tiene)
- [ ] localStorage funciona (>0 bytes)
- [ ] Sincronización registra eventos

---

**Si todos los tests pasan: ✅ Sistema Listo para Producción**

**Si algo falla:** Consulta [QR-SCANNING.md](QR-SCANNING.md) sección Troubleshooting
