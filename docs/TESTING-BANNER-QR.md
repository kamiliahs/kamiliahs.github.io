# 🧪 TESTING - Banner PWA + QR Reparados

## ✅ Verificación Previa

Todos los archivos han sido modificados correctamente:
- ✅ `index.html` - Banner PWA reescrito + Librería QRCode actualizada
- ✅ `src/js/app.js` - Función `generateServerQR()` mejorada + función `loadQRCodeLibrary()` nueva
- ✅ Sintaxis JavaScript verificada

---

## 🧪 Test 1: Banner PWA - Verificación Visual

### Escenario A: Primer Acceso

**Pasos:**
1. Abre navegador en desarrollo:
   - Android Chrome: Chrome normal
   - iOS Safari: Safari normal  
   - Desktop: Chrome/Edge/Firefox

2. Limpia localStorage:
   ```javascript
   localStorage.clear()
   ```

3. Accede a `http://localhost:8000`

4. Espera 2 segundos

**Resultado Esperado:**
```
✅ Aparece banner azul en esquina inferior derecha
✅ Texto: "📱 Instalar POS Minimalist"
✅ Descripción: "Agrega a tu pantalla de inicio..."
✅ Botones: [Instalar] [✕]
✅ Animación: Slide-up suave
```

### Escenario B: Click "Instalar"

**Pasos:**
1. Con banner visible, click en botón "Instalar"

**Resultado Esperado (por navegador):**

**Chrome/Edge/Android:**
```
✅ Se abre diálogo nativo de instalación
✅ Texto: "Instalar POS Minimalist"
✅ Opciones: [Instalar] [Cancelar]
```

**Firefox/Safari (Sin soporte nativo):**
```
✅ Se muestra alert con instrucciones manuales:

  Para instalar esta app:
  
  📱 Android (Chrome):
  1. Toca el menú (⋮)
  2. Selecciona "Instalar app"
  
  🍎 iOS (Safari):
  1. Toca Compartir (↗️)
  2. Selecciona "Agregar a pantalla de inicio"
  
  🖥️ Desktop (Chrome/Edge):
  1. Toca el ícono de instalación (⊞) en la barra
```

### Escenario C: Click "✕" (Cerrar)

**Pasos:**
1. Click botón ✕ para cerrar banner

**Resultado Esperado:**
```
✅ Banner desaparece
✅ localStorage marca como descartado
✅ Al recargar página, banner NO aparece
```

---

## 🧪 Test 2: QR Code - Verificación Visual

### Escenario A: Generar QR

**Pasos:**
1. En la app, click "Iniciar Servidor"
2. Se abre modal "Servidor Iniciado ✓"

**Resultado Esperado:**
```
✅ Canvas visible con QR
✅ QR: Cuadrado 200x200 píxeles
✅ Color: Negro y blanco
✅ Patrón: Legible, sin borrosidad
✅ Consola muestra: "📱 Generando QR para servidor..."
✅ Consola muestra: "✅ QR generado exitosamente"
```

### Escenario B: Escanear QR

**Pasos:**
1. Con QR visible en pantalla
2. Usa app de escaneo de códigos (o app del navegador)
3. Apunta la cámara al QR

**Resultado Esperado:**
```
✅ QR se detecta correctamente
✅ Datos decodificados contienen JSON:
{
  "ip": "192.168.1.100",
  "id": "peer_1709564800000_abc123",
  "type": "server",
  "version": "1.0"
}
✅ Todos los campos completados
```

---

## 🧪 Test 3: Detección de Instalación

### Escenario A: App No Instalada

**Pasos:**
1. Abre la app normalmente (no en modo instalado)
2. localStorage sin marca de descarte

**Resultado Esperado:**
```
✅ Banner aparece después de 2 segundos
```

### Escenario B: App Instalada

**Pasos:**
1. Instala la app en tu dispositivo
2. Abre desde el icono de la app (standalone mode)

**Resultado Esperado:**
```
✅ Banner NO aparece
✅ Consola: window.matchMedia('(display-mode: standalone)') = true
```

---

## 🧪 Test 4: Fallback de Librería QR

### Escenario A: Simular Librería No Disponible

**Pasos en Consola:**
```javascript
// Simular que librería no está disponible
delete window.QRCode;

// Intentar generar QR
APP.selectServerRole();
```

**Resultado Esperado:**
```
✅ Consola muestra: "❌ Librería QRCode no está cargada"
✅ Consola muestra: "Intentando cargar desde CDN alternativo..."
✅ Esperar 1-2 segundos
✅ Librería se carga automáticamente
✅ QR se genera correctamente
```

---

## 📊 Checklist de Testing

### Banner PWA
- [ ] Aparece automáticamente (si no está instalado)
- [ ] Ubicación: esquina inferior derecha
- [ ] Color: gradiente azul
- [ ] Texto: legible y claro
- [ ] Animación: slide-up suave
- [ ] Botón Instalar funciona
- [ ] Botón ✕ funciona
- [ ] No aparece si ya está instalado
- [ ] No aparece si fue descartado
- [ ] localStorage se actualiza

### QR Code
- [ ] Aparece al iniciar servidor
- [ ] Tamaño: 200x200 píxeles
- [ ] Visible: no borroso
- [ ] Escaneable: lee correctamente
- [ ] Datos válidos: JSON completo
- [ ] Campo "ip": presente
- [ ] Campo "id": presente
- [ ] Campo "type": "server"
- [ ] Campo "version": "1.0"
- [ ] Console logs correctos

### Compatibilidad
- [ ] Chrome/Chromium
- [ ] Edge
- [ ] Firefox
- [ ] Safari
- [ ] Android browsers
- [ ] iOS Safari
- [ ] Modo PWA (standalone)

### Robustez
- [ ] Manejo de errores
- [ ] Console logs descriptivos
- [ ] Fallback funcionando
- [ ] Sin memory leaks
- [ ] localStorage limpio
- [ ] Múltiples instancias

---

## 🐛 Troubleshooting

### Problema: Banner no aparece

**Soluciones:**
1. Limpiar localStorage: `localStorage.clear()`
2. Recargar página: `F5` o `Ctrl+R`
3. Verificar que no está instalado: `window.matchMedia('(display-mode: standalone)').matches`
4. Esperar 2 segundos (timeout de aparición)
5. Ver consola para errores

### Problema: QR no se ve

**Soluciones:**
1. Verificar que canvas existe: `document.getElementById('qrCode')`
2. Abrir consola (F12) y revisar errores
3. Recargar página completamente
4. Verificar QRCode library: `console.log(window.QRCode)`
5. Si no está, fallback debe cargar automáticamente

### Problema: QR borroso o pequeño

**Soluciones:**
1. Zoom del navegador debe ser 100%: `Ctrl+0`
2. Canvas debe ser 200x200: inspeccionar elemento
3. Revisar resolución del monitor
4. Probar en otro dispositivo/navegador

### Problema: Banner no desaparece

**Soluciones:**
1. Click en botón ✕ debe funcionar
2. localStorage debe guardar descarte: `localStorage.getItem('pwa_installBannerDismissed')`
3. Recargar página debe mantener oculto
4. Limpiar localStorage para reintentar: `localStorage.removeItem('pwa_installBannerDismissed')`

---

## 📝 Reporte de Testing

Después de completar los tests, crear reporte con:

```
Fecha: [fecha]
Navegador: [Chrome/Firefox/Safari/Edge]
Dispositivo: [Desktop/Android/iOS]
Resolución: [1920x1080/375x667]

BANNER PWA:
Status: [PASS/FAIL]
Observaciones: [...]

QR CODE:
Status: [PASS/FAIL]
Observaciones: [...]

COMPATIBILIDAD:
Status: [PASS/FAIL]
Navegadores testados: [...]

ROBUSTEZ:
Status: [PASS/FAIL]
Errores encontrados: [...]

Issues Identificados:
- [Issue 1]
- [Issue 2]

Recomendaciones:
- [Recomendación 1]
```

---

## 🚀 Deployment

**Antes de hacer push a producción:**

✅ Todos los tests pasaron  
✅ Sin errores en consola  
✅ Banner funciona  
✅ QR se genera  
✅ Sintaxis verificada  
✅ localStorage limpio  

```bash
git add .
git commit -m "fix: banner PWA visible + QR funcional"
git push origin main
```

**Post-deployment verification:**

1. Abre app en producción
2. Banner debe aparecer
3. QR debe generarse
4. Todos los logs deben ser correctos

