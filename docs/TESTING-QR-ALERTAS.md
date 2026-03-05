# 🧪 GUÍA DE TESTING - QR y Sistema de Alertas

## ✅ Requisitos Previos

- ✅ Servidor HTTP corriendo en `http://localhost:8000`
- ✅ Navegador moderno (Chrome, Firefox, Safari, Edge)
- ✅ Consola de desarrollador abierta (F12)

---

## 🎯 TEST 1: Verificar QR se Muestra Correctamente

### Pasos:
1. Abre `http://localhost:8000` en el navegador
2. Abre la **Consola** (F12 → Console)
3. Click en botón **"Iniciar Servidor"**
4. Se abrirá modal "Servidor Iniciado ✓"

### Qué Verificar:

#### ✅ En el Canvas:
- [ ] El QR debe ser visible en el centro del modal
- [ ] El QR debe tener borde negro y fondo blanco
- [ ] El patrón debe ser legible (no borroso)
- [ ] El tamaño debe ser ~200x200px

#### ✅ En la Consola:
```
✅ QR generado correctamente
Generando QR para servidor: Object {ip, peerId, type, version}
```

#### ❌ Si NO funciona:
```
❌ Error generando QR: ...
Canvas QR no encontrado
```
→ Revisar que el canvas `#qrCode` existe en el HTML

---

## 🎯 TEST 2: Alertas de Clientes Conectados

### Escenario A: Una Pestaña (Simple)

#### Pasos:
1. Abre `http://localhost:8000` en pestaña A
2. Abre `http://localhost:8000` en pestaña B
3. En pestaña A: Click "Iniciar Servidor"
4. En pestaña B: Click "Conectar a Servidor"
5. Ingresa los datos:
   - IP: `127.0.0.1` (o tu IP local)
   - ID: deja en blanco
6. Click "Conectar"

#### Qué Verificar en Pestaña A:

✅ **Alerta Visual**:
- [ ] Aparece notificación VERDE en esquina superior derecha
- [ ] Dice "✅ Cliente Conectado"
- [ ] Muestra:
  - IP del cliente
  - ID del cliente (primeros 20 caracteres)
  - Hora de conexión
- [ ] Desaparece después de 8 segundos con fade-out suave

✅ **Toast Adicional**:
- [ ] Aparece toast diciendo "Cliente conectado: 127.0.0.1"

✅ **En la Consola de Pestaña A**:
```
🔔 Cliente conectado: IP=127.0.0.1, ID=peer_1709564800000_abc123
```

✅ **En la Consola de Pestaña B**:
```
✅ Notificación enviada al servidor 127.0.0.1: Cliente 127.0.0.1 conectado
```

---

### Escenario B: Múltiples Clientes

#### Pasos:
1. Pestaña A: "Iniciar Servidor"
2. Pestaña B: "Conectar a Servidor" → Conectar
3. Pestaña C: Abrir nueva y conectar también
4. Pestaña D: Abrir nueva y conectar también

#### Qué Verificar:

✅ **En Pestaña A**:
- [ ] 3 alertas aparecen secuencialmente
- [ ] Cada una con IP y ID diferentes
- [ ] Cada una dura 8 segundos
- [ ] Máximo 2 segundos de retardo entre conexión y alerta

✅ **En localStorage (Consola)**:
```javascript
// Ver todos los clientes
JSON.parse(localStorage.getItem('server_127.0.0.1_clients'))

// Resultado:
[
    { clientIP: "127.0.0.1", clientPeerId: "peer_...", connectedAt: 1709564865432 },
    { clientIP: "127.0.0.1", clientPeerId: "peer_...", connectedAt: 1709564965432 },
    { clientIP: "127.0.0.1", clientPeerId: "peer_...", connectedAt: 1709565065432 }
]
```

---

## 🎯 TEST 3: Desconexión y Limpieza

### Pasos:
1. Tener servidor en pestaña A con clientes conectados
2. En pestaña A: Click "Desconectar"
3. Confirmar en el alert

### Qué Verificar:

✅ **Limpieza**:
- [ ] El intervalo de monitoreo se detiene
- [ ] No aparecen más alertas (aunque conectes nuevos clientes)
- [ ] Se muestra "DESCONECTADO" en toast

✅ **En localStorage**:
- [ ] Los datos persisten (se limpian al siguiente inicio)
- [ ] No hay memory leaks

---

## 🎯 TEST 4: Escaneo QR

### Pasos:
1. Pestaña A: "Iniciar Servidor"
2. Pestaña B: "Conectar a Servidor"
3. Click "Escanear QR"
4. Permite acceso a cámara (si la pide)
5. Apunta la cámara al QR de la pestaña A

### Qué Verificar:

✅ **Detección**:
- [ ] El QR es legible por escáneres estándares
- [ ] Los datos decodificados contienen:
  - `ip`: IP del servidor
  - `id`: Peer ID
  - `type`: "server"
  - `version`: "1.0"

✅ **En Pestaña B**:
- [ ] Se llena automáticamente la IP
- [ ] Se llena automáticamente el ID
- [ ] Click "Conectar" funciona

---

## 🔍 Comandos Útiles en Consola

### Ver Cliente Conectado
```javascript
console.log(WebRTC.getConnectedClients())
```

### Ver Datos de Notificación
```javascript
const clients = JSON.parse(localStorage.getItem('server_127.0.0.1_clients'));
console.table(clients);
```

### Ver Estado del Servidor
```javascript
console.log(WebRTC.getStatus())
```

### Limpiar localStorage
```javascript
Object.keys(localStorage).forEach(key => {
    if (key.includes('server_') || key.includes('client_')) {
        localStorage.removeItem(key);
    }
});
console.log('localStorage limpiado');
```

---

## 📊 Checklist Completo de Testing

### QR Functionality
- [ ] QR aparece al iniciar servidor
- [ ] QR es visible y no borroso
- [ ] QR se puede escanear
- [ ] Datos del QR son correctos
- [ ] Console muestra "✅ QR generado correctamente"

### Alert System
- [ ] Alerta aparece cuando cliente se conecta
- [ ] Alerta muestra IP correcta
- [ ] Alerta muestra ID del cliente
- [ ] Alerta muestra hora correcta
- [ ] Alerta desaparece después de 8 segundos
- [ ] Toast adicional aparece
- [ ] Console muestra log correcto

### Monitoreo
- [ ] Primer cliente: alerta en 2 segundos máximo
- [ ] Múltiples clientes: alertas secuenciales
- [ ] Sin duplicados: mismo cliente no genera 2 alertas
- [ ] Al desconectar servidor: monitoreo se detiene

### localStorage
- [ ] Datos se guardan correctamente
- [ ] Estructura JSON válida
- [ ] Claves con formato correcto
- [ ] Timestamps válidos

### Limpieza
- [ ] Al desconectar se detiene intervalo
- [ ] No hay memory leaks
- [ ] Datos persisten (no se borran automáticamente)

---

## 🐛 Troubleshooting

### Problema: QR No Aparece
```
Soluciones:
1. Verificar que canvas #qrCode existe en HTML
2. Abrir consola (F12) y buscar errores
3. Recargar página (Ctrl+R)
4. Limpiar cache (Ctrl+Shift+Delete)
5. Revisar que librería QRCode se carga (línea 19 index.html)
```

### Problema: Alertas No Aparecen
```
Soluciones:
1. Verificar que servidor está iniciado
2. Usar misma máquina/localhost (localStorage es local)
3. Abrir consola (F12) y buscar errores
4. Verificar que el cliente se conecta (debería haber toast)
5. Revisar localStorage:
   - localStorage.getItem('server_127.0.0.1_clients')
```

### Problema: QR Borroso o Pequeño
```
Soluciones:
1. Revisar que canvas sea 200x200
2. Verificar zoom del navegador (100%)
3. Inspeccionar element con F12
4. Recargar página
```

### Problema: localStorage Lleno
```
Soluciones:
1. Ejecutar limpieza:
   Object.keys(localStorage).forEach(key => {
       if (key.includes('server_') || key.includes('client_')) {
           localStorage.removeItem(key);
       }
   });
2. Recargar página
3. Iniciar servidor nuevamente
```

---

## 📝 Reporte de Resultados

Después de completar todos los tests, crear reporte:

```
Fecha: [fecha]
Navegador: [Chrome/Firefox/Safari/Edge]
Sistema: [Windows/Mac/Linux]
Versión: [versión del navegador]

QR Functionality: [PASS/FAIL]
Alert System: [PASS/FAIL]
Monitoreo: [PASS/FAIL]
localStorage: [PASS/FAIL]
Limpieza: [PASS/FAIL]

Issues encontrados:
- [Issue 1]
- [Issue 2]

Notas adicionales:
- [Nota 1]
```

