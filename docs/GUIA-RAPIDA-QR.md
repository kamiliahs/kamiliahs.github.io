# 🎯 GUÍA RÁPIDA: Sistema de Códigos QR

## ⚡ Inicio Rápido (2 minutos)

### Opción 1: Como Servidor
```
1. Abre la app
2. "Usar Red Local" → SÍ
3. "Selecciona tu rol" → SERVIDOR
4. Se genera automáticamente el código QR
5. Muestra el QR a los clientes
```

### Opción 2: Como Cliente
```
1. Abre la app
2. "Usar Red Local" → SÍ
3. "Selecciona tu rol" → CLIENTE
4. "Escanear QR" o "Entrada Manual"
5. ¡Conectado! Datos sincronizados en tiempo real
```

---

## 📷 Cómo Escanear

### Paso a Paso:

```
┌─ Abre modal "Escanear Código QR"
│
├─ La cámara solicita permiso
│  └─ [Permitir] ← Click aquí
│
├─ La cámara se abre automáticamente
│  ├─ Ves video en vivo
│  ├─ Esquinas verdes = área de detección
│  └─ Cruz blanca = centro de alineación
│
├─ Apunta hacia el código QR
│  ├─ A 15-30 cm de distancia
│  ├─ Bien iluminado
│  └─ Centrado en el área verde
│
├─ El app detecta automáticamente
│  └─ Toast: "✅ Código QR válido escaneado"
│
├─ Los campos se rellenan solos
│  ├─ IP: 192.168.1.50
│  └─ ID: peer_1704...
│
└─ Botón [Conectar] se habilita
   └─ Click para sincronizar
```

---

## 🚨 Si Algo Falla

### "Permiso de cámara denegado"
```
❌ Navegador → Bloquear cámara
✅ Solución: 
   1. Ir a configuración del navegador
   2. Permisos → Cámara
   3. Cambiar a "Permitir"
   4. Recargar página
```

### "No hay cámara disponible"
```
❌ Dispositivo sin cámara
✅ Solución: 
   1. Click en "Volver a Conexión Manual"
   2. Ingresa IP manualmente (Ej: 192.168.1.50)
   3. Ingresa ID del servidor
   4. Click en [Conectar]
```

### "QR no se detecta"
```
❌ Problemas comunes
├─ Mala iluminación → Acerca a luz
├─ Muy lejos → Acerca 20-30 cm
├─ QR pequeño → Amplía o acerca más
├─ Lente sucio → Limpia con paño
└─ Código inválido → Regénera en servidor

✅ Solución rápida: Usar entrada manual
```

---

## 💾 Datos Incluidos en el QR

```javascript
{
  "ip": "192.168.1.50",           // IP del servidor
  "id": "peer_1704067200000_a1b2", // ID único del servidor
  "type": "server",               // Siempre es "server"
  "version": "1.0"                // Versión del protocolo
}
```

---

## 🔄 Sincronización en Tiempo Real

Una vez conectado, cualquier cambio en un dispositivo se refleja automáticamente en todos:

```
Usuario en Tablet vende "Café"
           ↓
Tablet: Stock de café -1
           ↓
(enviado automáticamente)
           ↓
Teléfono 1: Stock de café -1
Teléfono 2: Stock de café -1
           ↓
✅ Todos sincronizados
```

---

## 🎮 Botones de Control

### Modal de Escaneo

| Botón | Función |
|-------|---------|
| 📷 **Iniciar** | Abre cámara y comienza a detectar |
| ⊗ **Detener** | Cierra cámara sin seleccionar |
| ← **Volver** | Va a entrada manual |

### Modal de Servidor

| Botón | Función |
|-------|---------|
| 🔄 **Ver Estado** | Abre vista de conectados |
| ⊗ **Detener Servidor** | Desconecta todos los clientes |
| 📊 **Estadísticas** | Muestra dispositivos conectados |

---

## 📊 Ver Estado de la Conexión

```
1. Click en "Red Local" (arriba derecha)
   o
2. Abre "Estado de Red" desde la app

Verás:
├─ ✅ Conectado / ❌ Desconectado
├─ IP del servidor
├─ Tu IP (si eres cliente)
├─ Número de dispositivos conectados
├─ Lista de clientes conectados
├─ Botón para sincronizar manualmente
└─ Botón para desconectar
```

---

## 🔌 Desconectar

```
Opción 1:
1. Abre "Red Local"
2. Click en [Desconectar]

Opción 2:
1. Recarga la página (F5)
2. Datos se guardan localmente
3. Reconecta después cuando quieras
```

---

## 🌐 Requisitos

- ✅ Todos los dispositivos en **mismo WiFi**
- ✅ Navegador moderno (Chrome, Firefox, Safari, Edge)
- ✅ Permisos de cámara (para escanear QR)
- ✅ Conexión a internet (para primera carga)
- ⚠️ Sin firewall bloqueando LocalNetwork

---

## 📱 Casos de Uso Típicos

### Caso 1: Pequeño Negocio
```
├─ Tablet en mostrador (Servidor)
│  ├─ Se actualiza en tiempo real
│  └─ Genera QR cada hora
│
├─ Teléfono gerente (Cliente)
│  ├─ Ve inventario desde otro lugar
│  └─ Aprueba pedidos
│
└─ Laptop en oficina (Cliente)
   ├─ Genera reportes
   └─ Actualiza precios
```

### Caso 2: Reunión de Trabajo
```
├─ Laptop principal (Servidor)
│  └─ Presenta datos
│
├─ Tablet 1 (Cliente)
│  └─ Toma notas
│
├─ Tablet 2 (Cliente)
│  └─ Revisa stock
│
└─ Teléfono (Cliente)
   └─ Sigue la presentación
```

### Caso 3: Evento/Festival
```
├─ Puesto 1 - Tablet (Servidor)
│  └─ Gestiona inventario central
│
├─ Puesto 2 - Teléfono (Cliente)
├─ Puesto 3 - Teléfono (Cliente)
└─ Puesto 4 - Teléfono (Cliente)
   └─ Todos sincronizan en tiempo real
```

---

## ⚙️ Configuración Avanzada

### Ver Logs (Debug)
```javascript
// En consola del navegador:
localStorage.setItem('DEBUG', 'true');
location.reload();

// Verás mensajes como:
// [QR] Generando código...
// [Scanner] Cámara iniciada
// [Detector] QR detectado
// [Connect] Conectando a 192.168.1.50
```

### Cambiar Rol
```
Si te conectaste como Cliente pero quieres ser Servidor:
1. Click en "Red Local"
2. Click en [Desconectar]
3. Abre "Usar Red Local" nuevamente
4. Selecciona el otro rol
```

### QR Muy Pequeño o Grande
```
El QR es fijo en 200x200px, pero puedes:
├─ Ampliar la página (Ctrl + Plus)
├─ Usar zoom del navegador
└─ Acercarte más con la cámara al escanear
```

---

## 🎓 Aprender Más

Para entender cómo funciona todo:

- 📖 [QR-SCANNING.md](QR-SCANNING.md) - Documentación técnica detallada
- 📖 [FLUJOS-COMPLETOS.md](FLUJOS-COMPLETOS.md) - Diagramas de flujo
- 📖 [ARQUITECTURA.md](ARQUITECTURA.md) - Detalles técnicos
- 📖 [README.md](README.md) - Guía general

---

## ✅ Checklist Antes de Usar

- [ ] Todos los dispositivos conectados al mismo WiFi
- [ ] Navegador actualizado
- [ ] Cámara funciona (prueba en otra app)
- [ ] Permisos de cámara habilitados
- [ ] Primer dispositivo iniciado como Servidor
- [ ] QR generado y visible
- [ ] Al menos un Cliente con cámara o manual
- [ ] Red sin firewall bloqueando

---

## 💡 Tips

1. **Primer dispositivo = Servidor**  
   Siempre inicia con el dispositivo que será central

2. **QR clara = éxito**  
   Asegúrate que el código esté bien iluminado

3. **Mismo WiFi es obligatorio**  
   Si no están en la misma red, no funcionará

4. **Fallback manual siempre existe**  
   Si la cámara falla, puedes ingresar IP manualmente

5. **Datos persisten**  
   Aunque desconectes, los datos se guardan localmente

6. **Sincronización automática**  
   No hay que hacer nada especial, se sincroniza en tiempo real

7. **Sin servidor = sin sincronización**  
   Si el servidor se apaga, los clientes no se sincronizan más

8. **Recarga = reconecta**  
   Si recarga el navegador, debe reconectar manualmente

---

**¿Necesitas ayuda?**  
Revisa la sección de Troubleshooting en [QR-SCANNING.md](QR-SCANNING.md)

**Estado:** ✅ Sistema Listo para Usar  
**Última actualización:** 2024  
**Versión:** 1.0
