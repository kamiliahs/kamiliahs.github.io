/**
 * POS Minimalist - Aplicación Principal
 * Sistema de gestión de puntos de venta con PWA
 */

const APP = {
    /**
     * Inicializar aplicación
     */
    init() {
        // Inicializar datos
        Data.init();

        // Renderizar todas las vistas
        UI.renderAll();
        UI.updateCartUI();

        // Configurar event listeners
        this.setupEventListeners();

        console.log('POS Minimalist iniciado correctamente');
    },

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Escuchar Enter en inputs
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const parent = e.target.closest('.modal');
                    if (parent && parent.id === 'ingridientModal') {
                        this.saveIngredient();
                    }
                }
            });
        });

        // Listener para cambios en el carrito
        window.addEventListener('cartUpdated', () => {
            UI.updateCartUI();
        });
    },

    // ========== INGREDIENTES ==========

    /**
     * Guardar nuevo ingrediente
     */
    saveIngredient() {
        const name = document.getElementById('newIngName').value.trim();
        const cost = parseFloat(document.getElementById('newIngCost').value);
        const unit = document.getElementById('newIngUnit').value;

        if (!name) {
            Utils.showToast('Nombre requerido');
            return;
        }

        if (isNaN(cost) || cost < 0) {
            Utils.showToast('Costo inválido');
            return;
        }

        Data.addIngredient(name, cost, unit);
        UI.renderInventory();
        Utils.closeAllPopups();
        Utils.showToast('INSUMO GUARDADO');
    },

    /**
     * Actualizar costo de ingrediente
     */
    updateIngredientCost(id, value) {
        const cost = parseFloat(value);

        if (isNaN(cost) || cost < 0) {
            Utils.showToast('Costo inválido');
            return;
        }

        Data.updateIngredientCost(id, cost);
        UI.renderAll();
        Utils.showToast('COSTO ACTUALIZADO');
    },

    /**
     * Eliminar ingrediente
     */
    deleteIngredient(id) {
        if (confirm('¿Eliminar este insumo?')) {
            Data.deleteIngredient(id);
            UI.renderAll();
            Utils.showToast('INSUMO ELIMINADO');
        }
    },

    // ========== PRODUCTOS/RECETAS ==========

    /**
     * Guardar nueva receta
     */
    saveRecipe() {
        const name = document.getElementById('newProdName').value.trim();
        const icon = document.getElementById('newProdIcon').value.trim() || '🍽️';
        const price = parseFloat(document.getElementById('newProdPrice').value);

        if (!name) {
            Utils.showToast('Nombre requerido');
            return;
        }

        if (isNaN(price) || price < 0) {
            Utils.showToast('Precio inválido');
            return;
        }

        // Recopilar ingredientes
        const selects = document.querySelectorAll('.recipe-ing-select');
        const qtyInputs = document.querySelectorAll('.recipe-ing-qty');
        const recipe = [];

        selects.forEach((select, i) => {
            const qty = parseFloat(qtyInputs[i].value);
            if (select.value && !isNaN(qty) && qty > 0) {
                recipe.push({
                    id: select.value,
                    qty: qty
                });
            }
        });

        if (recipe.length === 0) {
            Utils.showToast('Agregar al menos un insumo');
            return;
        }

        Data.addProduct(name, icon, price, recipe);
        UI.renderAll();
        Utils.closeAllPopups();
        Utils.showToast('RECETA CREADA');
    },

    /**
     * Eliminar producto
     */
    deleteProduct(id) {
        if (confirm('¿Eliminar esta receta?')) {
            Data.deleteProduct(id);
            UI.renderAll();
            Utils.showToast('RECETA ELIMINADA');
        }
    },

    /**
     * Abrir modal para editar ingrediente
     */
    editIngredient(id) {
        const ing = Data.ingredients.find(i => i.id === id);
        if (!ing) return;

        document.getElementById('editIngId').value = id;
        document.getElementById('editIngName').value = ing.name;
        document.getElementById('editIngCost').value = ing.cost;
        document.getElementById('editIngUnit').value = ing.unit;

        Utils.openModal('editIngridientModal');
    },

    /**
     * Guardar cambios de ingrediente
     */
    saveEditIngredient() {
        const id = document.getElementById('editIngId').value;
        const name = document.getElementById('editIngName').value.trim();
        const cost = parseFloat(document.getElementById('editIngCost').value);
        const unit = document.getElementById('editIngUnit').value;

        if (!name) {
            Utils.showToast('Nombre requerido');
            return;
        }

        if (isNaN(cost) || cost < 0) {
            Utils.showToast('Costo inválido');
            return;
        }

        Data.updateIngredient(id, name, cost, unit);
        UI.renderAll();
        Utils.closeAllPopups();
        Utils.showToast('INSUMO ACTUALIZADO');
    },

    /**
     * Abrir modal para editar receta
     */
    editProduct(id) {
        const product = Data.products.find(p => p.id === id);
        if (!product) return;

        document.getElementById('editProdId').value = id;
        document.getElementById('editProdName').value = product.name;
        document.getElementById('editProdIcon').value = product.icon;
        document.getElementById('editProdPrice').value = product.price;

        const builder = document.getElementById('editRecipeBuilder');
        builder.innerHTML = product.recipe.map((r, i) => {
            const ing = Data.ingredients.find(ing => ing.id === r.id);
            return `
                <div class="flex gap-2 items-center">
                    <select class="recipe-edit-ing-select flex-1" value="${r.id}">
                        ${Data.ingredients.map(ing => `<option value="${ing.id}">${ing.name}</option>`).join('')}
                    </select>
                    <input type="number" value="${r.qty}" class="recipe-edit-ing-qty w-20">
                    <button type="button" onclick="this.parentElement.remove()" class="text-red-500 text-sm">✕</button>
                </div>
            `;
        }).join('');

        Utils.openModal('editRecipeModal');
    },

    /**
     * Guardar cambios de receta
     */
    saveEditRecipe() {
        const id = document.getElementById('editProdId').value;
        const name = document.getElementById('editProdName').value.trim();
        const icon = document.getElementById('editProdIcon').value.trim() || '🍽️';
        const price = parseFloat(document.getElementById('editProdPrice').value);

        if (!name) {
            Utils.showToast('Nombre requerido');
            return;
        }

        if (isNaN(price) || price < 0) {
            Utils.showToast('Precio inválido');
            return;
        }

        const selects = document.querySelectorAll('.recipe-edit-ing-select');
        const qtyInputs = document.querySelectorAll('.recipe-edit-ing-qty');
        const recipe = [];

        selects.forEach((select, i) => {
            const qty = parseFloat(qtyInputs[i].value);
            if (select.value && !isNaN(qty) && qty > 0) {
                recipe.push({
                    id: select.value,
                    qty: qty
                });
            }
        });

        if (recipe.length === 0) {
            Utils.showToast('Agregar al menos un insumo');
            return;
        }

        Data.updateProduct(id, name, icon, price, recipe);
        UI.renderAll();
        Utils.closeAllPopups();
        Utils.showToast('RECETA ACTUALIZADA');
    },

    // ========== CARRITO Y VENTAS ==========

    /**
     * Agregar producto al carrito
     */
    addToCart(productId) {
        const item = Data.addToCart(productId);
        if (item) {
            UI.updateCartUI();
            Utils.showToast(`${item.name} AGREGADO`);
        }
    },

    /**
     * Procesar venta
     */
    checkout() {
        if (Data.cart.length === 0) {
            Utils.showToast('Carrito vacío');
            return;
        }

        const total = Data.getCartTotal();
        const count = Data.cart.length;

        if (confirm(`¿Confirmar venta de ${count} artículo(s) por SRD ${total.toFixed(2)}?`)) {
            if (Data.checkout()) {
                UI.updateCartUI();
                UI.renderReports();
                Utils.showToast('TRANSACCIÓN COMPLETADA');
            }
        }
    },

    /**
     * Ver detalle de pedido
     */
    viewOrderDetail(saleId) {
        const sale = Data.getSale(saleId);
        if (!sale) return;

        document.getElementById('orderDetailTotal').innerText = sale.total.toFixed(2);
        document.getElementById('orderEditPrice').value = '';

        const itemsDiv = document.getElementById('orderDetailItems');
        itemsDiv.innerHTML = sale.items.map(item => `
            <div class="flex justify-between text-xs">
                <span>${item.name}</span>
                <span>SRD ${item.price.toFixed(2)}</span>
            </div>
        `).join('');

        // Guardar ID para editar
        document.getElementById('orderDetailModal').dataset.saleId = saleId;

        Utils.openModal('orderDetailModal');
    },

    /**
     * Guardar cambios en pedido
     */
    saveOrderEdit() {
        const saleId = document.getElementById('orderDetailModal').dataset.saleId;
        const newPrice = document.getElementById('orderEditPrice').value;

        if (newPrice && !isNaN(parseFloat(newPrice))) {
            const price = parseFloat(newPrice);
            if (price < 0) {
                Utils.showToast('Precio inválido');
                return;
            }
            Data.updateSale(saleId, price);
        }

        UI.renderAll();
        Utils.closeAllPopups();
        Utils.showToast('PEDIDO ACTUALIZADO');
    },

    /**
     * Eliminar pedido
     */
    deleteOrder() {
        const saleId = document.getElementById('orderDetailModal').dataset.saleId;
        if (confirm('¿Eliminar este pedido?')) {
            Data.deleteSale(saleId);
            UI.renderAll();
            Utils.closeAllPopups();
            Utils.showToast('PEDIDO ELIMINADO');
        }
    },

    /**
     * Exportar pedidos a CSV
     */
    exportOrders() {
        const sales = Data.getAllSales();
        if (sales.length === 0) {
            Utils.showToast('No hay pedidos para exportar');
            return;
        }

        let csv = 'ID,Fecha,Total,Items\n';
        sales.forEach(sale => {
            const itemList = sale.items.map(i => i.name).join(';');
            csv += `"${sale.id}","${new Date(sale.timestamp).toLocaleString()}","${sale.total.toFixed(2)}","${itemList}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pedidos-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        Utils.showToast('EXPORTADO');
    },

    // ========== NAVEGACIÓN ==========

    /**
     * Cambiar vista
     */
    switchView(viewId) {
        Utils.switchView(viewId);
    },

    /**
     * Alternar menú
     */
    toggleMenu() {
        Utils.toggleMenu();
    },

    /**
     * Abrir modal
     */
    openModal(modalId) {
        Utils.openModal(modalId);
    },

    /**
     * Cerrar todos los popups
     */
    closeAllPopups() {
        Utils.closeAllPopups();
    },

    /**
     * Agregar fila de ingrediente
     */
    addIngredientRow() {
        Utils.addIngredientRow();
    },

    // ========== RED Y SINCRONIZACIÓN ==========

    /**
     * Seleccionar modo servidor
     */
    async selectServerRole() {
        const info = await WebRTC.startServer();

        // Llenar modal de servidor iniciado
        document.getElementById('serverIP').innerText = info.ip;
        document.getElementById('serverID').innerText = info.peerId;

        // Generar QR
        this.generateServerQR(info);

        // Iniciar monitoreo de clientes conectados
        this.startServerClientMonitoring(info);

        Utils.closeAllPopups();
        Utils.openModal('serverStartedModal');

        Utils.showToast('SERVIDOR INICIADO ✓');
    },

    /**
     * Monitorear clientes que se conectan al servidor
     */
    startServerClientMonitoring(serverInfo) {
        // Limpiar intervalo anterior si existe
        if (this.serverMonitoringInterval) {
            clearInterval(this.serverMonitoringInterval);
        }

        const monitoredClients = new Set();

        // Verificar cada 2 segundos si hay nuevos clientes
        this.serverMonitoringInterval = setInterval(() => {
            const connectedClients = WebRTC.getConnectedClients();

            connectedClients.forEach(client => {
                const clientKey = `${client.clientPeerId}`;

                // Si es un cliente nuevo
                if (!monitoredClients.has(clientKey)) {
                    monitoredClients.add(clientKey);

                    // Mostrar alerta
                    this.showClientConnectionAlert(client);

                    console.log(`🔔 Cliente conectado: IP=${client.clientIP}, ID=${client.clientPeerId}`);
                }
            });
        }, 2000);
    },

    /**
     * Mostrar alerta visual cuando cliente se conecta
     */
    showClientConnectionAlert(clientInfo) {
        // Crear notificación
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 9999;
            font-family: monospace;
            font-size: 14px;
            line-height: 1.5;
            max-width: 350px;
            animation: slideIn 0.3s ease-out;
        `;

        const timestamp = new Date().toLocaleTimeString();

        notification.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px;">✅ Cliente Conectado</div>
            <div style="font-size: 12px; opacity: 0.9;">
                <div><strong>IP:</strong> ${clientInfo.clientIP}</div>
                <div><strong>ID:</strong> ${clientInfo.clientPeerId.substring(0, 20)}...</div>
                <div><strong>Hora:</strong> ${timestamp}</div>
            </div>
        `;

        document.body.appendChild(notification);

        // También mostrar toast
        Utils.showToast(`Cliente conectado: ${clientInfo.clientIP}`);

        // Remover notificación después de 8 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 8000);
    },

    /**
     * Detener monitoreo de clientes
     */
    stopServerClientMonitoring() {
        if (this.serverMonitoringInterval) {
            clearInterval(this.serverMonitoringInterval);
            this.serverMonitoringInterval = null;
        }
    },

    /**
     * Generar código QR para conexión del servidor
     */
    generateServerQR(serverInfo) {
        console.log('📱 Generando QR para servidor:', serverInfo);

        const qrData = JSON.stringify({
            ip: serverInfo.ip,
            id: serverInfo.peerId,
            type: 'server',
            version: '1.0'
        });

        const qrCanvas = document.getElementById('qrCode');

        // Validar que el canvas existe
        if (!qrCanvas) {
            console.error('❌ Canvas QR no encontrado en el DOM');
            Utils.showToast('Error: Canvas QR no disponible');
            return;
        }

        try {
            // Verificar que la librería está disponible
            if (!window.QRCode) {
                console.error('❌ Librería QRCode no está cargada');
                console.warn('Intentando cargar desde CDN alternativo...');
                this.loadQRCodeLibrary();
                return;
            }

            console.log('📊 Datos QR:', qrData);

            // Usar node-qr-code para generar en el canvas
            window.QRCode.toCanvas(qrCanvas, qrData, {
                width: 200,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                },
                errorCorrectionLevel: 'H'
            }, (error) => {
                if (error) {
                    console.error('❌ Error generando QR:', error);
                    Utils.showToast('Error al generar código QR');
                } else {
                    console.log('✅ QR generado exitosamente');
                }
            });

            // Forzar actualización visual
            setTimeout(() => {
                qrCanvas.style.opacity = '0.99';
                setTimeout(() => {
                    qrCanvas.style.opacity = '1';
                }, 10);
            }, 100);

        } catch (err) {
            console.error('❌ Error generando QR:', err);
            Utils.showToast('Error al generar código QR: ' + err.message);
        }
    },

    /**
     * Cargar librería QRCode desde CDN alternativo
     */
    loadQRCodeLibrary() {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
        script.onload = () => {
            console.log('✅ Librería QRCode cargada desde CDN');
            // Reintentar generar QR
            const status = WebRTC.getStatus();
            if (status.localInfo) {
                this.generateServerQR(status.localInfo);
            }
        };
        script.onerror = () => {
            console.error('❌ No se pudo cargar la librería QRCode');
            Utils.showToast('No se pudo cargar la librería QR');
        };
        document.head.appendChild(script);
    },

    /**
     * Copiar información del servidor al portapapeles
     */
    copyServerInfo() {
        const status = WebRTC.getStatus();
        const text = `IP: ${status.localInfo.ip}\nID: ${status.localInfo.peerId}`;

        navigator.clipboard.writeText(text).then(() => {
            Utils.showToast('COPIADO AL PORTAPAPELES');
        });
    },

    // ========== RESOLUCIÓN DE CONFLICTOS ==========

    /**
     * Manejar desconexión inesperada del servidor
     */
    handleServerDisconnection() {
        console.log('Servidor desconectado inesperadamente. Intentando promover cliente a servidor...');

        // Solo proceder si somos cliente
        if (localStorage.getItem('networkRole') !== 'client') {
            return;
        }

        // Esperar un poco para ver si otro cliente ya tomó el rol
        setTimeout(async () => {
            try {
                // Intentar convertirse en servidor
                const info = await WebRTC.startServer();

                // Actualizar estado
                localStorage.setItem('networkRole', 'server');
                localStorage.setItem('networkConnected', 'true');

                // Generar nuevo QR
                this.generateServerQR(info);

                // Notificar a otros clientes
                SYNC.broadcastServerPromotion(info);

                Utils.showToast('¡Promovido a servidor! ✓');
                console.log('Cliente promovido a servidor exitosamente');

            } catch (error) {
                console.error('Error al promover a servidor:', error);
                Utils.showToast('Error al promover a servidor');

                // Intentar reconectar como cliente
                this.attemptReconnection();
            }
        }, 2000); // Esperar 2 segundos
    },

    /**
     * Intentar reconexión automática
     */
    attemptReconnection() {
        console.log('Intentando reconexión automática...');

        // Buscar servidores activos en la red
        this.scanForActiveServers().then(servers => {
            if (servers.length > 0) {
                // Conectar al primer servidor encontrado
                const server = servers[0];
                this.connectToServer({
                    ip: server.ip,
                    id: server.id
                });
            } else {
                Utils.showToast('No se encontraron servidores activos');
            }
        }).catch(err => {
            console.error('Error en reconexión:', err);
        });
    },

    /**
     * Escanear servidores activos en la red local
     */
    async scanForActiveServers() {
        console.log('Escaneando servidores activos...');

        // Primero intentar detectar por localStorage (mismo navegador)
        const localServers = WebRTC.detectServers();

        if (localServers.length > 0) {
            console.log('Servidores detectados localmente:', localServers);
            return localServers;
        }

        // Si no hay locales, intentar método alternativo (limitado por CORS)
        const servers = [];
        const localIP = await WebRTC.detectLocalIP();
        if (!localIP) return servers;

        // Obtener el rango de IP (ej: 192.168.1.x)
        const ipParts = localIP.split('.');
        const baseIP = ipParts.slice(0, 3).join('.');

        // Solo probar algunas IPs comunes (no podemos hacer fetch sin CORS)
        const commonIPs = ['100', '101', '102', '1', '10', '50'];

        for (const ip of commonIPs) {
            const testIP = `${baseIP}.${ip}`;
            if (testIP !== localIP) {
                // En lugar de fetch, asumimos que si hay algo en localStorage con esa IP, existe
                const presenceKey = `server_presence_${testIP}`;
                const presence = localStorage.getItem(presenceKey);
                if (presence) {
                    try {
                        const data = JSON.parse(presence);
                        if (Date.now() - data.timestamp < 30000) {
                            servers.push(data);
                        } else {
                            localStorage.removeItem(presenceKey);
                        }
                    } catch (e) {
                        localStorage.removeItem(presenceKey);
                    }
                }
            }
        }

        console.log(`Encontrados ${servers.length} servidores activos`);
        return servers;
    },

    /**
     * Probar conexión a un servidor específico
     */
    async testServerConnection(ip) {
        try {
            // Intentar una conexión rápida (timeout corto)
            const response = await fetch(`http://${ip}:8080/status`, {
                method: 'GET',
                mode: 'no-cors', // Para evitar CORS issues
                signal: AbortSignal.timeout(1000) // Timeout de 1 segundo
            });

            // Si llega aquí, hay algo respondiendo
            return { ip, id: 'unknown', status: 'active' };

        } catch (error) {
            // No hay servidor en esta IP
            return null;
        }
    },

    /**
     * Escanear servidores activos en la red local (para UI)
     */
    async scanForActiveServersUI() {
        Utils.showToast('Buscando servidores...');

        try {
            const servers = await this.scanForActiveServers();

            if (servers.length === 0) {
                Utils.showToast('No se encontraron servidores activos');
                return;
            }

            // Mostrar modal con lista de servidores
            this.showServerListModal(servers);

        } catch (error) {
            console.error('Error escaneando servidores:', error);
            Utils.showToast('Error al buscar servidores');
        }
    },

    /**
     * Mostrar modal con lista de servidores encontrados
     */
    showServerListModal(servers) {
        // Crear modal dinámicamente
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'serverListModal';
        modal.innerHTML = `
            <p class="label-caps mb-8">Servidores Encontrados</p>
            <div class="space-y-4 max-h-60 overflow-y-auto">
                ${servers.map(server => `
                    <div class="border border-gray-300 rounded p-4 cursor-pointer hover:bg-gray-50" 
                         onclick="APP.selectServer('${server.ip}', '${server.id || 'unknown'}')">
                        <div class="flex justify-between items-center">
                            <div>
                                <p class="font-bold">IP: ${server.ip}</p>
                                <p class="text-sm text-gray-600">ID: ${server.id || 'Desconocido'}</p>
                            </div>
                            <div class="text-green-600">● Activo</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="flex gap-4 pt-6">
                <button onclick="APP.closeAllPopups()" class="w-1/2 label-caps text-black py-4">Cancelar</button>
                <button onclick="APP.openModal('clientConnectModal')" class="w-1/2 bg-black text-white font-bold py-4 uppercase text-[10px] tracking-widest">Entrada Manual</button>
            </div>
        `;

        // Agregar al DOM
        document.body.appendChild(modal);
        Utils.openModal('serverListModal');
    },

    /**
     * Seleccionar servidor de la lista
     */
    selectServer(ip, id) {
        document.getElementById('serverIpInput').value = ip;
        document.getElementById('serverIdInput').value = id;
        Utils.closeAllPopups();
        Utils.openModal('clientConnectModal');
        Utils.showToast('Servidor seleccionado');
    },

    /**
     * Conectar a servidor
     */
    connectToServer() {
        const ip = document.getElementById('serverIpInput').value.trim();
        const id = document.getElementById('serverIdInput').value.trim();

        if (!ip) {
            Utils.showToast('Ingresa IP del servidor');
            return;
        }

        WebRTC.connectToServer(ip, id || 'unknown').then(() => {
            // Iniciar heartbeat para detectar desconexiones
            this.startServerHeartbeat();

            Utils.closeAllPopups();
            UI.renderNetworkStatus();
            Utils.showToast('CONECTADO AL SERVIDOR');
        }).catch(err => {
            Utils.showToast('Error de conexión');
            console.error(err);
        });
    },

    // Heartbeat para detectar desconexión del servidor
    startServerHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }

        this.heartbeatInterval = setInterval(async () => {
            if (localStorage.getItem('networkRole') === 'client') {
                try {
                    // Verificar si el servidor sigue respondiendo
                    const serverIP = localStorage.getItem('serverIP');
                    if (serverIP) {
                        const response = await fetch(`http://${serverIP}:8080/ping`, {
                            method: 'GET',
                            mode: 'no-cors',
                            signal: AbortSignal.timeout(2000)
                        });
                        // Si llega aquí, servidor está vivo
                    }
                } catch (error) {
                    console.warn('Servidor no responde, detectando desconexión');
                    this.handleServerDisconnection();
                    clearInterval(this.heartbeatInterval);
                }
            }
        }, 10000); // Cada 10 segundos
    },

    stopServerHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    },

    /**
     * Iniciar escáner QR
     */
    startQRScanner() {
        const video = document.getElementById('qrScannerVideo');
        let scanInterval = null;
        let currentStream = null;

        // Mostrar estado "Inicializando"
        Utils.showToast('Inicializando cámara...');

        navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        })
            .then(stream => {
                currentStream = stream;
                video.srcObject = stream;
                video.play();

                // Esperar a que video esté listo
                video.onloadedmetadata = () => {
                    Utils.showToast('Apunta al código QR');

                    // Crear canvas con las dimensiones del video
                    const canvasElement = document.createElement('canvas');
                    canvasElement.width = video.videoWidth;
                    canvasElement.height = video.videoHeight;
                    const canvas = canvasElement.getContext('2d');

                    let qrDetectado = false;

                    scanInterval = setInterval(() => {
                        if (!video.paused && !video.ended) {
                            try {
                                canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
                                const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);

                                if (window.jsQR) {
                                    const code = jsQR(imageData.data, imageData.width, imageData.height);

                                    if (code && !qrDetectado) {
                                        qrDetectado = true;
                                        clearInterval(scanInterval);

                                        console.log('✓ QR detectado:', code.data);

                                        try {
                                            const qrData = JSON.parse(code.data);

                                            // Validar que sea un código válido
                                            if (qrData.ip && qrData.id && qrData.type === 'server') {
                                                document.getElementById('serverIpInput').value = qrData.ip;
                                                document.getElementById('serverIdInput').value = qrData.id;

                                                // Detener video
                                                if (currentStream) {
                                                    currentStream.getTracks().forEach(track => track.stop());
                                                }

                                                Utils.closeAllPopups();
                                                Utils.openModal('clientConnectModal');
                                                Utils.showToast('✓ QR ESCANEADO CORRECTAMENTE');
                                            } else {
                                                Utils.showToast('QR inválido - No es un código de servidor');
                                                qrDetectado = false;
                                            }
                                        } catch (parseErr) {
                                            console.error('Error parsing QR data:', parseErr);
                                            Utils.showToast('QR inválido - No se pudo leer datos');
                                            qrDetectado = false;
                                        }
                                    }
                                } else {
                                    console.error('jsQR no disponible');
                                    Utils.showToast('Librería de escaneo no disponible');
                                    clearInterval(scanInterval);
                                }
                            } catch (err) {
                                console.error('Error en scanning:', err);
                            }
                        }
                    }, 300);
                };
            })
            .catch(err => {
                console.error('Error accessing camera:', err);

                let errorMsg = 'No se pudo acceder a la cámara';
                if (err.name === 'NotAllowedError') {
                    errorMsg = 'Permiso de cámara denegado';
                } else if (err.name === 'NotFoundError') {
                    errorMsg = 'No hay cámara disponible';
                } else if (err.name === 'NotReadableError') {
                    errorMsg = 'La cámara está en uso por otra aplicación';
                }

                Utils.showToast(errorMsg);

                // Mostrar alternativa manual
                document.getElementById('clientConnectModal').style.display = 'block';
                Utils.closeAllPopups();
                Utils.openModal('clientConnectModal');
            });
    },

    /**
     * Detener escáner QR
     */
    stopQRScanner() {
        const video = document.getElementById('qrScannerVideo');
        if (video && video.srcObject) {
            video.srcObject.getTracks().forEach(track => {
                track.stop();
            });
            video.srcObject = null;
        }
    },

    /**
     * Sincronizar manualmente
     */
    manualSync() {
        if (!WebRTC.isConnected) {
            Utils.showToast('No conectado');
            return;
        }

        if (WebRTC.isServer) {
            Utils.showToast('Servidor sincronizado');
        } else {
            WebRTC.sendMessage({
                type: 'SYNC_REQUEST',
                from: WebRTC.localInfo.peerId,
                to: WebRTC.localInfo.serverId
            });
            Utils.showToast('Sincronizando...');
        }

        Sync.setLastSync();
        UI.renderNetworkStatus();
    },

    /**
     * Desconectar de la red
     */
    disconnectNetwork() {
        if (confirm('¿Desconectar de la red?')) {
            this.stopServerHeartbeat();
            this.stopServerClientMonitoring();
            WebRTC.disconnect();
            UI.renderNetworkStatus();
            Utils.showToast('DESCONECTADO');
        }
    },

    /**
     * Agregar fila de ingrediente en edición
     */
    addEditIngredientRow() {
        Utils.addEditIngredientRow();
    }
};

// Inicializar cuando DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    APP.init();
});

// Manejar antes de descargar la página (guardado automático)
window.addEventListener('beforeunload', () => {
    Data.saveAll();
});
