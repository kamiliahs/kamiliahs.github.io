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

        Utils.closeAllPopups();
        Utils.openModal('serverStartedModal');

        Utils.showToast('SERVIDOR INICIADO ✓');
    },

    /**
     * Generar código QR para conexión del servidor
     */
    generateServerQR(serverInfo) {
        const qrData = JSON.stringify({
            ip: serverInfo.ip,
            id: serverInfo.peerId,
            type: 'server',
            version: '1.0'
        });

        const qrCanvas = document.getElementById('qrCode');
        try {
            if (window.QRCode) {
                // Limpiar canvas anterior
                qrCanvas.getContext('2d').clearRect(0, 0, qrCanvas.width, qrCanvas.height);
                
                // Generar QR
                QRCode.toCanvas(qrCanvas, qrData, {
                    errorCorrectionLevel: 'H',
                    type: 'image/png',
                    quality: 0.95,
                    margin: 1,
                    width: 200,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                }, (error) => {
                    if (error) {
                        console.error('Error generating QR:', error);
                        Utils.showToast('Error al generar QR');
                    } else {
                        console.log('✓ QR generado correctamente');
                    }
                });
            } else {
                Utils.showToast('QRCode library no disponible');
            }
        } catch (err) {
            console.error('Error en generateServerQR:', err);
            Utils.showToast('Error al generar código QR');
        }
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
            Utils.closeAllPopups();
            UI.renderNetworkStatus();
            Utils.showToast('CONECTADO AL SERVIDOR');
        }).catch(err => {
            Utils.showToast('Error de conexión');
            console.error(err);
        });
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
