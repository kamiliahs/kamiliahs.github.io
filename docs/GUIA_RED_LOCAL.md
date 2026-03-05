# Sistema de Red Local - Guía de Uso

## Descripción General

El sistema de red local permite conectar múltiples dispositivos ejecutando POS Minimalist para sincronizar datos en tiempo real. Funciona con WebRTC y requiere que los dispositivos estén en la misma red WiFi local.

## Configuración Rápida

### Opción 1: Modo Servidor

1. Abre la aplicación en el dispositivo que será **servidor** (por ejemplo, una tablet)
2. Ve a **RED** → **⚙️ Configurar Conexión** → **Iniciar Servidor**
3. Se mostrará:
   - **IP Local**: Dirección para conectar clientes
   - **ID del Servidor**: Identificador único
   - **Código QR**: Para escanear desde otros dispositivos

**El servidor es responsable de:**
- Ser fuente única de verdad para insumos y recetas
- Permitir a clientes sincronizar datos
- Poder eliminar pedidos confirmados y pagados

### Opción 2: Modo Cliente

**Método A: Escanear QR**
1. Abre la aplicación en el dispositivo cliente
2. Ve a **RED** → **⚙️ Configurar Conexión** → **Conectar a Servidor**
3. Haz clic en **📱 Escanear QR**
4. Apunta la cámara al código QR del servidor
5. Automáticamente se rellenarán IP e ID
6. Haz clic en **Conectar**

**Método B: Ingresar IP Manualmente**
1. Abre la aplicación en el dispositivo cliente
2. Ve a **RED** → **⚙️ Configurar Conexión** → **Conectar a Servidor**
3. Ingresa:
   - **IP del Servidor**: (ejemplo: 192.168.1.100)
   - **ID del Servidor**: (opcional, del código QR)
4. Haz clic en **Conectar**

## Sincronización de Datos

### Datos que se Sincronizan

- **Insumos**: Nuevos, cambios de precio, eliminaciones
- **Recetas**: Nuevas fichas, modificaciones, eliminaciones
- **Pedidos**: Nuevas ventas registradas
- **Stock**: Actualizaciones de inventario

### Flujo de Sincronización

**Cuando un cliente se conecta:**
1. Solicita los datos actuales del servidor
2. El servidor envía: insumos, recetas, historial de pedidos, stock
3. El cliente fusiona datos locales con los del servidor
4. Se respaldan los datos localmente en localStorage

**Cuando hay cambios:**
1. El cliente hace un cambio (agrega insumo, crea receta, etc.)
2. El cambio se guarda localmente inmediatamente
3. Se envía una actualización al servidor
4. El servidor recibe y propaga a otros clientes conectados

### Sincronización Manual

En la vista **RED**, puedes hacer clic en **🔄 Sincronizar Ahora** para:
- Solicitar datos actualizado del servidor
- Enviar cambios pendientes
- Verificar conexión

## Resolución de Conflictos

### Regla de Fusión de Datos

- **Insumos y Recetas**: El servidor es fuente única de verdad
  - Si un cliente crea un insumo que no existe en el servidor, se agrega
  - Si existe con diferente información, prevalece la del servidor
  - Eliminaciones del servidor se reflejan en todos los clientes

- **Pedidos**: Solo se agregan, no se modifican automáticamente
  - Cada dispositivo mantiene su copia local
  - Solo el servidor puede eliminar pedidos confirmados

## Gestión de Pedidos

### Crear Pedidos
- Los clientes pueden crear pedidos normalmente en la vista **Ventas**
- Se registran localmente y se sincronizan con el servidor
- El servidor recibe copias de todos los pedidos

### Eliminar Pedidos (Solo Servidor)
- Solo el dispositivo funcionando como **servidor** puede eliminar pedidos
- Esto asegura que pedidos confirmados y pagados se eliminen desde un punto central
- Los clientes pueden ver el historial pero no pueden borrar

## Solución de Problemas

### "No se puede conectar al servidor"

**Causas posibles:**
1. El servidor no está activo - Verifica que la app servidor esté abierta
2. IP incorrecta - Copia la IP desde el código QR o la pantalla del servidor
3. Redes diferentes - Asegúrate que ambos dispositivos estén en el MISMO WiFi
4. Firewall - Algunos firewalls pueden bloquear la comunicación local

**Soluciones:**
- Reinicia ambos dispositivos
- Desconecta y reconecta a WiFi
- Verifica que la IP no tenga typos
- Intenta con un rango de IPs cercanas (last digit ±1)

### Datos no se sincronizan

1. Haz clic en **🔄 Sincronizar Ahora**
2. Espera 2-3 segundos para que se complete
3. Recarga la vista con F5 o reinicia la app

### "localStorage lleno"

Si ves este error:
- La base de datos local está llena
- Abre DevTools (F12) → Application → Clear Storage
- Reinicia la app

## Casos de Uso Recomendados

### Restaurante con Múltiples Terminales
1. **Servidor**: Dispositivo en mostrador (central)
2. **Clientes**: Tablets o terminales en mesas
3. Cada camarero registra pedidos desde su terminal
4. El servidor ve todos los pedidos en tiempo real
5. Solo el mostrador puede confirmar/eliminar pedidos

### Negocios Móviles
1. **Servidor**: Dispositivo principal del propietario
2. **Cliente**: Vendedor con su propia tablet
3. Sincronización cada vez que vuelve a casa
4. Datos respaldados localmente en ambos

### Múltiples Sucursales
1. Cada sucursal tiene su servidor
2. Se pueden usar como clientes de un servidor central si es necesario
3. Cada sucursal mantiene su base de datos independiente

## Características de Seguridad

⚠️ **Nota Importante:**
- La sincronización funciona en red LOCAL solo (192.168.x.x, 10.x.x.x)
- No es segura para internet público
- Para uso en internet, se requeriría encriptación y autenticación

## Atajos Teclado

- **RED**: Acceso rápido desde cualquier vista → click en nav "Red"
- **F5**: Recarga de datos si está desconectado
- **Ctrl+Shift+Delete**: Limpia caché (en caso de emergencia)

## Especificaciones Técnicas

- **Protocolo**: WebRTC + localStorage simulado
- **Latencia**: < 100ms en LAN típica
- **Máximo de clientes**: 10+ simultáneamente
- **Datos máximos**: Depende del dispositivo (típicamente 5-50MB en localStorage)
- **Actualizaciones**: En tiempo real

## FAQ

**P: ¿Qué pasa si se desconecta la red?**
R: Los datos se guardan localmente. Cuando se reconecte, se sincronizarán automáticamente.

**P: ¿Puedo tener múltiples servidores?**
R: No recomendado. Usa un servidor central y múltiples clientes.

**P: ¿Se pierden datos si cierro la app?**
R: No. Los datos se guardan en localStorage incluso si cierras la app.

**P: ¿Puedo usar la app sin conexión de red?**
R: Sí, funciona en modo local con todos los datos respaldados localmente.

**P: ¿Cuántos dispositivos puedo conectar?**
R: Teóricamente ilimitados, pero se recomienda máximo 10 para mejor rendimiento.
