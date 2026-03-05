/**
 * Sync Module - Sincronización de datos entre servidor y clientes
 * Maneja fusión de datos, conflictos y cambios remotos
 */

const Sync = {
    // Registro de versiones para detectar cambios
    versions: {
        ingredients: 0,
        products: 0,
        salesHistory: 0,
        stock: 0
    },

    /**
     * Fusionar datos del servidor con datos locales
     */
    mergeServerData(serverData) {
        if (!serverData) return;

        // Ingredientes: servidor es fuente de verdad
        if (serverData.ingredients && Array.isArray(serverData.ingredients)) {
            const serverIds = serverData.ingredients.map(i => i.id);
            const localIds = Data.ingredients.map(i => i.id);

            // Agregar ingredientes nuevos del servidor
            serverData.ingredients.forEach(serverIng => {
                if (!localIds.includes(serverIng.id)) {
                    Data.ingredients.push(serverIng);
                }
            });

            // Actualizar ingredientes existentes
            Data.ingredients = Data.ingredients.map(ing => {
                const serverIng = serverData.ingredients.find(s => s.id === ing.id);
                return serverIng ? { ...ing, ...serverIng } : ing;
            });

            this.versions.ingredients = Date.now();
        }

        // Productos: servidor es fuente de verdad
        if (serverData.products && Array.isArray(serverData.products)) {
            const serverIds = serverData.products.map(p => p.id);
            
            serverData.products.forEach(serverProd => {
                const exists = Data.products.find(p => p.id === serverProd.id);
                if (!exists) {
                    Data.products.push(serverProd);
                } else {
                    Object.assign(exists, serverProd);
                }
            });

            this.versions.products = Date.now();
        }

        // Ventas: merge sin duplicar
        if (serverData.salesHistory && Array.isArray(serverData.salesHistory)) {
            serverData.salesHistory.forEach(serverSale => {
                const exists = Data.salesHistory.find(s => s.id === serverSale.id);
                if (!exists) {
                    Data.salesHistory.push(serverSale);
                }
            });

            this.versions.salesHistory = Date.now();
        }

        // Stock
        if (serverData.stock && typeof serverData.stock === 'object') {
            Data.stock = { ...Data.stock, ...serverData.stock };
            this.versions.stock = Date.now();
        }

        // Guardar cambios localmente
        Data.saveAll();
        UI.renderAll();
    },

    /**
     * Aplicar cambios remotos de otros clientes
     */
    applyRemoteChanges(remoteData) {
        if (!remoteData) return;

        const changes = remoteData;

        // Aplicar cambios de ingredientes
        if (changes.ingredients) {
            changes.ingredients.forEach(change => {
                const index = Data.ingredients.findIndex(i => i.id === change.id);
                if (change.action === 'add' && index === -1) {
                    Data.ingredients.push(change.data);
                } else if (change.action === 'update' && index !== -1) {
                    Object.assign(Data.ingredients[index], change.data);
                } else if (change.action === 'delete' && index !== -1) {
                    Data.ingredients.splice(index, 1);
                }
            });
        }

        // Aplicar cambios de productos
        if (changes.products) {
            changes.products.forEach(change => {
                const index = Data.products.findIndex(p => p.id === change.id);
                if (change.action === 'add' && index === -1) {
                    Data.products.push(change.data);
                } else if (change.action === 'update' && index !== -1) {
                    Object.assign(Data.products[index], change.data);
                } else if (change.action === 'delete' && index !== -1) {
                    Data.products.splice(index, 1);
                }
            });
        }

        // Guardar y renderizar
        Data.saveAll();
        UI.renderAll();
    },

    /**
     * Detectar cambios locales y enviarlos al servidor
     */
    detectAndSyncChanges() {
        if (!WebRTC.isConnected || WebRTC.isServer) return;

        const changes = {
            ingredients: [],
            products: [],
            salesHistory: [],
            stock: {}
        };

        // Este es un sistema simplificado
        // En producción usarías timestamps más sofisticados

        WebRTC.sendMessage({
            type: 'DATA_UPDATE',
            data: changes
        });
    },

    /**
     * Sincronizar ingrediente agregado
     */
    syncAddIngredient(ingredient) {
        if (!WebRTC.isConnected || !WebRTC.isServer) return;

        WebRTC.broadcastDataUpdate('ingredient', {
            action: 'add',
            id: ingredient.id,
            data: ingredient
        });
    },

    /**
     * Sincronizar ingrediente actualizado
     */
    syncUpdateIngredient(id, ingredient) {
        if (!WebRTC.isConnected || !WebRTC.isServer) return;

        WebRTC.broadcastDataUpdate('ingredient', {
            action: 'update',
            id: id,
            data: ingredient
        });
    },

    /**
     * Sincronizar ingrediente eliminado
     */
    syncDeleteIngredient(id) {
        if (!WebRTC.isConnected || !WebRTC.isServer) return;

        WebRTC.broadcastDataUpdate('ingredient', {
            action: 'delete',
            id: id
        });
    },

    /**
     * Sincronizar producto agregado
     */
    syncAddProduct(product) {
        if (!WebRTC.isConnected || !WebRTC.isServer) return;

        WebRTC.broadcastDataUpdate('product', {
            action: 'add',
            id: product.id,
            data: product
        });
    },

    /**
     * Sincronizar producto actualizado
     */
    syncUpdateProduct(id, product) {
        if (!WebRTC.isConnected || !WebRTC.isServer) return;

        WebRTC.broadcastDataUpdate('product', {
            action: 'update',
            id: id,
            data: product
        });
    },

    /**
     * Sincronizar producto eliminado
     */
    syncDeleteProduct(id) {
        if (!WebRTC.isConnected || !WebRTC.isServer) return;

        WebRTC.broadcastDataUpdate('product', {
            action: 'delete',
            id: id
        });
    },

    /**
     * Sincronizar nueva venta
     */
    syncNewSale(sale) {
        if (!WebRTC.isConnected || !WebRTC.isServer) return;

        WebRTC.broadcastDataUpdate('sale', {
            action: 'add',
            id: sale.id,
            data: sale
        });
    },

    /**
     * Sincronizar venta actualizada
     */
    syncUpdateSale(id, sale) {
        if (!WebRTC.isConnected || !WebRTC.isServer) return;

        WebRTC.broadcastDataUpdate('sale', {
            action: 'update',
            id: id,
            data: sale
        });
    },

    /**
     * Solicitar eliminación de venta (solo servidor puede confirmar)
     */
    requestDeleteSale(saleId) {
        if (!WebRTC.isConnected) return;

        WebRTC.sendMessage({
            type: 'DELETE_SALE',
            saleId: saleId,
            to: WebRTC.isServer ? undefined : WebRTC.localInfo.serverId
        });
    },

    /**
     * Sincronizar actualización de stock
     */
    syncStockUpdate(ingredientId, quantity) {
        if (!WebRTC.isConnected || !WebRTC.isServer) return;

        WebRTC.broadcastDataUpdate('stock', {
            ingredientId: ingredientId,
            quantity: quantity
        });
    },

    /**
     * Obtener última sincronización
     */
    getLastSync() {
        return localStorage.getItem('lastSync');
    },

    /**
     * Guardar marca de tiempo de sincronización
     */
    setLastSync() {
        localStorage.setItem('lastSync', new Date().toISOString());
    }
};
