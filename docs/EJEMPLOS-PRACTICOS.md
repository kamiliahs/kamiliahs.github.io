# 🎓 EJEMPLOS PRÁCTICOS - Sistema de QR y Sincronización

## 📚 Índice de Ejemplos

1. [Ejemplo 1: Setup Básico](#ejemplo-1-setup-básico)
2. [Ejemplo 2: Escanear QR](#ejemplo-2-escanear-qr)
3. [Ejemplo 3: Sincronización Automática](#ejemplo-3-sincronización-automática)
4. [Ejemplo 4: Manejo de Errores](#ejemplo-4-manejo-de-errores)
5. [Ejemplo 5: Debug y Diagnóstico](#ejemplo-5-debug-y-diagnóstico)

---

## Ejemplo 1: Setup Básico

### Escenario
Estás abriendo la app por primera vez y quieres usarla en red local.

### Código (en consola del navegador)
```javascript
// 1. Verificar que todo está disponible
console.log('¿APP disponible?', typeof APP !== 'undefined');
console.log('¿WEBRTC disponible?', typeof WEBRTC !== 'undefined');
console.log('¿QRCode disponible?', typeof QRCode !== 'undefined');

// 2. Obtener tu IP local
WEBRTC.detectLocalIP().then(ip => {
    console.log('Tu IP:', ip);
    // Resultado: Tu IP: 192.168.1.50 (ejemplo)
});

// 3. Iniciar como servidor
APP.selectServerRole('server');
// El app se abre automáticamente en la modal de servidor
```

### Resultado esperado
```
✅ Console muestra: APP disponible: true
✅ Console muestra: WEBRTC disponible: true
✅ Console muestra: QRCode disponible: true
✅ Tu IP: 192.168.1.50
✅ Modal de servidor abierta
✅ QR generado automáticamente
```

### Pantalla
```
┌─────────────────────────────────┐
│  Servidor Iniciado              │
├─────────────────────────────────┤
│  [QR 200x200 pixels aquí]      │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓         │
│  ▓     ▓▓▓▓▓▓▓ ▓             │
│  ▓  ▓  ▓     ▓ ▓             │
│  ▓  ▓  ▓ ▓▓▓ ▓ ▓             │
│  ▓  ▓  ▓     ▓ ▓             │
│  ▓     ▓▓▓▓▓▓▓ ▓             │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓         │
│                                │
│  Clientes conectados: 0        │
│                                │
│  [Detener Servidor]           │
└─────────────────────────────────┘
```

---

## Ejemplo 2: Escanear QR

### Escenario
Tienes un teléfono (cliente) y quieres escanear el QR del servidor (tablet).

### Parte 1: En el Teléfono (Cliente)
```javascript
// 1. Iniciar como cliente
APP.selectServerRole('client');
// Modal de conexión se abre

// 2. Click en "Escanear QR"
// (En interfaz, pero simulando aquí)
APP.openModal('qrScannerModal');

// 3. Iniciar escaneo
APP.startQRScanner();
// Console muestra: "[QR] Iniciando scanner..."
// Cámara se abre automáticamente
```

### Lo que ve el usuario
```
[CÁMARA EN VIVO]

    ╔══════════════════════════╗
    ║  [VIDEO PREVIEW]         ║
    ║                          ║
    ║  ╔══╗        ╔══╗        ║  ← Esquinas verdes
    ║  ║  ║  ────  ║  ║        ║  ← Cruz blanca
    ║  ╚══╝        ╚══╝        ║
    ║                          ║
    ╚══════════════════════════╝

"Centra el código QR dentro del recuadro"

[📷 Iniciar]  [⊗ Detener]
```

### Código de escaneo interno
```javascript
// El app hace esto automáticamente cada 300ms:
const analysisStart = performance.now();
const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
const result = jsQR(imageData.data, canvas.width, canvas.height);

if (result) {
    // QR Detectado!
    try {
        const data = JSON.parse(result.data);
        
        // Validar estructura
        if (data.ip && data.id && data.type === 'server') {
            console.log('✅ QR válido detectado');
            console.log('  IP:', data.ip);
            console.log('  ID:', data.id);
            
            // Rellenar inputs automáticamente
            document.getElementById('serverIpInput').value = data.ip;
            document.getElementById('serverIdInput').value = data.id;
            
            // Mostrar éxito
            Utils.showToast('✅ Código QR válido escaneado');
            
            // Detener scanner
            APP.stopQRScanner();
            
            // Opcionalmente conectar automáticamente
            // APP.connectToServer({ip: data.ip, id: data.id});
        } else {
            console.log('❌ QR inválido (faltan campos)');
        }
    } catch(e) {
        console.log('❌ QR no contiene JSON válido');
    }
}
```

### Resultado esperado
```
✅ Video muestra cámara del teléfono
✅ Apuntas al QR de la tablet
✅ En menos de 3 segundos: Toast "✅ Código QR válido escaneado"
✅ Campos se rellenan:
   IP: 192.168.1.50
   ID: peer_1704067200000_abc123
✅ Botón [Conectar] se habilita
```

---

## Ejemplo 3: Sincronización Automática

### Escenario
Tablet (servidor) y teléfono (cliente) están conectados. Alguien vende un producto en la tablet.

### En la Tablet (Servidor)
```javascript
// Usuario hace clic en "Vender Café"
// El app hace internamente:

const sale = {
    id: 'sale_' + Date.now(),
    productId: 'prod_1',
    quantity: 2,
    price: 3.50,
    total: 7.00,
    timestamp: new Date().toISOString()
};

// 1. Guardar localmente
DATA.addSale(sale);  // Actualiza localStorage

// 2. Reducir stock
DATA.updateStock('ingrediente_cafe', -2);  // localStorage actualizado

// 3. Notificar a clientes
SYNC.broadcastSaleCreated(sale);
```

### En la Red (localStorage P2P)
```
Tablet escribe en localStorage:
  key: 'syncMessage_' + timestamp
  value: {
    type: 'saleCreated',
    sale: {...},
    source: 'tablet_id',
    timestamp: Date.now()
  }

Teléfono detecta cambio y:
  1. Lee el mensaje
  2. Aplica el cambio localmente
  3. Renderiza UI actualizada
  4. Envia confirmación
```

### En el Teléfono (Cliente)
```javascript
// El app detecta automáticamente el cambio
// (No requiere código del usuario)

// Internamente:
// 1. Monitorea cambios en localStorage
// 2. Detecta nueva venta
// 3. Actualiza su copia local
// 4. Renderiza la UI

// Resultado visible:
// Toast: "📡 Sincronización completada"
// Inventario muestra stock reducido
// Historial de ventas se actualiza
```

### Diagrama de flujo
```
Tablet vende café
      ↓
localStorage actualizado
      ↓
Teléfono detecta cambio (evento)
      ↓
SYNC.applyRemoteChanges() ejecutado
      ↓
Teléfono localStorage actualizado
      ↓
UI renderizada con nuevos datos
      ↓
✅ Ambos dispositivos idénticos
```

### Verificación en consola
```javascript
// En tablet:
const sales = JSON.parse(localStorage.getItem('sales') || '[]');
console.log('Ventas en tablet:', sales.length);
// Resultado: Ventas en tablet: 3

// En teléfono:
const sales = JSON.parse(localStorage.getItem('sales') || '[]');
console.log('Ventas en teléfono:', sales.length);
// Resultado: Ventas en teléfono: 3
// (El número es igual porque se sincronizó!)
```

---

## Ejemplo 4: Manejo de Errores

### 4.1: Permiso de Cámara Denegado

```javascript
// Usuario rechaza permiso
// El app maneja así:

navigator.mediaDevices.getUserMedia({...})
    .then(stream => { /* ... */ })
    .catch(error => {
        if (error.name === 'NotAllowedError') {
            // Usuario denegó explícitamente
            Utils.showToast('❌ Permiso de cámara denegado');
            console.log('Usuario rechazó acceso a cámara');
            
            // Abrir fallback a entrada manual
            APP.closeAllPopups();
            Utils.openModal('clientConnectModal');
            
        } else if (error.name === 'NotFoundError') {
            // No hay cámara en el dispositivo
            Utils.showToast('❌ No hay cámara disponible');
            
        } else if (error.name === 'NotReadableError') {
            // Cámara en uso por otra app
            Utils.showToast('❌ Cámara en uso');
            console.log('Otra aplicación está usando la cámara');
        }
    });
```

### 4.2: QR Inválido

```javascript
// Se detecta un código QR, pero no es del servidor

const imageData = context.getImageData(0, 0, width, height);
const result = jsQR(imageData.data, width, height);

if (result) {
    try {
        const data = JSON.parse(result.data);
        
        // Validar estructura
        if (!data.ip || !data.id || data.type !== 'server') {
            console.log('⚠️  QR detectado pero inválido');
            console.log('   Faltan campos:', {
                ip: data.ip ? '✓' : '✗',
                id: data.id ? '✓' : '✗',
                type: data.type === 'server' ? '✓' : '✗'
            });
            
            // El scanner continúa buscando el QR correcto
            // No se rellena nada
            // Usuario ve: "Apunta al código QR" (continúa escaneando)
        }
    } catch(parseError) {
        console.log('⚠️  QR detectado pero no es JSON');
        // Scanner continúa
    }
}
```

### 4.3: Conexión Fallida

```javascript
// Cliente intenta conectar a servidor que no existe

APP.connectToServer({
    ip: '192.168.1.50',
    id: 'peer_nonexistent'
});

// Internamente:
setTimeout(() => {
    if (!connectionSuccessful) {
        Utils.showToast('❌ No se pudo conectar');
        console.error('Servidor no responde');
        
        // Opciones para el usuario:
        // 1. Reintentar
        // 2. Verificar IP
        // 3. Verificar que servidor está activo
        // 4. Mismo WiFi?
    }
}, 5000);
```

---

## Ejemplo 5: Debug y Diagnóstico

### 5.1: Habilitar Logs Detallados

```javascript
// Habilitar debug mode
localStorage.setItem('DEBUG', 'true');
location.reload();

// Ahora ves en consola:
// [APP] Iniciando aplicación
// [QR] Generando código...
// [Scanner] Cámara solicitada
// [Scanner] Stream obtenido
// [Detector] Canvas inicializado: 400x300
// [Detector] Frame 1/100 analizado
// [Detector] QR detectado!
// [Parser] Datos extraídos
// [Connect] Conectando a 192.168.1.50...
// [Sync] Sincronización completada
```

### 5.2: Monitor de Sincronización en Tiempo Real

```javascript
// Ejecutar en consola para ver sincronización en vivo

let lastSync = null;

const monitor = setInterval(() => {
    const sync = JSON.parse(localStorage.getItem('lastSync') || 'null');
    const connected = localStorage.getItem('networkConnected') === 'true';
    const role = localStorage.getItem('networkRole');
    const timestamp = new Date().toLocaleTimeString();
    
    if (JSON.stringify(sync) !== JSON.stringify(lastSync)) {
        console.log(
            `${timestamp} | Conectado: ${connected} | Rol: ${role}`
        );
        console.table(sync);
        lastSync = sync;
    }
}, 500);

// Detener después de 60 segundos
setTimeout(() => {
    clearInterval(monitor);
    console.log('Monitor finalizado');
}, 60000);
```

### 5.3: Inspeccionar Datos Sincronizados

```javascript
// Ver todos los datos en ambos dispositivos

function compareSyncData() {
    const data = {
        ingredientes: JSON.parse(localStorage.getItem('ingredients') || '[]'),
        productos: JSON.parse(localStorage.getItem('products') || '[]'),
        ventas: JSON.parse(localStorage.getItem('sales') || '[]'),
        stock: JSON.parse(localStorage.getItem('stock') || '{}')
    };
    
    console.log('📊 ESTADO COMPLETO:');
    console.table({
        'Total Ingredientes': data.ingredientes.length,
        'Total Productos': data.productos.length,
        'Total Ventas': data.ventas.length,
        'Tipos de Stock': Object.keys(data.stock).length
    });
    
    console.log('📝 Ingredientes:');
    console.table(data.ingredientes);
    
    console.log('🛍️  Productos:');
    console.table(data.productos);
    
    console.log('💰 Ventas Recientes:');
    console.table(data.ventas.slice(-5));
    
    console.log('📦 Stock:');
    console.table(data.stock);
    
    return data;
}

const datos = compareSyncData();
// Copia los números para comparar con otro dispositivo
```

### 5.4: Simular Pérdida de Conexión

```javascript
// Para testing: desconectar y reconectar simuladamente

// Simular desconexión
function simularDesconexion() {
    localStorage.setItem('networkConnected', 'false');
    console.log('⚠️  Desconexión simulada');
    console.log('La app debería mostrar "❌ Desconectado"');
}

// Verificar que funciona offline
setTimeout(() => {
    console.log('Intentando operar offline...');
    DATA.addIngredient({name: 'Offline Test', price: 9.99});
    console.log('✅ Operación completada offline');
}, 2000);

// Reconectar
function simularReconexion() {
    localStorage.setItem('networkConnected', 'true');
    SYNC.manualSync();
    console.log('🔄 Reconexión simulada');
    console.log('La app debería sincronizar cambios offline');
}

// Ejecutar timeline:
setTimeout(simularDesconexion, 1000);      // t=1s: desconecta
setTimeout(simularReconexion, 5000);       // t=5s: reconecta
```

---

## Ejemplo 6: Casos de Uso Reales

### Caso A: Restaurante Pequeño

```
Tablet en mostrador (Servidor)
- Se actualiza en tiempo real
- Usuarios ven total de ventas
- Inventario visible

Teléfono en cocina (Cliente 1)
- Recibe órdenes al instante
- Ve ingredientes disponibles
- Marca items completados

Laptop en caja (Cliente 2)
- Procesa pagos
- Genera recibos
- Ve histórico

Flujo:
1. Cliente hace pedido en Tablet
2. Cocina ve la orden al instante en Teléfono
3. Caja emite recibo en Laptop
4. Todos los datos sincronizados en <1 segundo
```

### Caso B: Carrito de Comida

```
Teléfono principal (Servidor)
- Carrito 1: 5 nachos, 2 tacos
- Carrito 2: 3 hamburguesas
- Stock en tiempo real

Tablet cliente 1 (Cliente)
- Ve su pedido: 5 nachos, 2 tacos
- Stock disponible: sí
- Puede hacer cambios

Tablet cliente 2 (Cliente)
- Ve su pedido: 3 hamburguesas
- Stock disponible: sí
- Espera confirmación

Flujo:
1. Cliente 1 modifica su pedido
2. Cliente 2 ve el stock actualizado
3. Ambos comparten ingredientes
4. Servidor mantiene coherencia
5. Pago global al final
```

---

## Referencia Rápida de Métodos

```javascript
// SERVIDOR
APP.selectServerRole('server');           // Iniciar como servidor
APP.generateServerQR({ip, id, type});     // Generar QR
APP.disconnectNetwork();                  // Apagar servidor

// CLIENTE
APP.selectServerRole('client');           // Iniciar como cliente
APP.startQRScanner();                     // Abrir cámara
APP.stopQRScanner();                      // Cerrar cámara
APP.connectToServer({ip, id});            // Conectar manualmente
APP.disconnectNetwork();                  // Desconectar

// SINCRONIZACIÓN
SYNC.manualSync();                        // Forzar sincronización
SYNC.applyRemoteChanges();                // Aplicar cambios recibidos
SYNC.broadcastDataUpdate();               // Enviar cambios

// DETECCIÓN
WEBRTC.detectLocalIP();                   // Obtener IP local
WEBRTC.startServer();                     // Iniciar servidor P2P
WEBRTC.connectToServer(ip, id);           // Conectar a servidor P2P
```

---

**Nota:** Estos ejemplos están basados en código real del sistema. Puedes copiar y pegar en la consola del navegador para probar.

**Última actualización:** 2024  
**Versión:** 1.0
