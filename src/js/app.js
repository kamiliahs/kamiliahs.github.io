/**
 * Kamiliahs - Aplicación Principal
 * Sistema de gestión de puntos de venta con PWA
 */

const APP = {
    /**
     * Inicializar aplicación
     */
    init() {
        // Inicializar datos (incluye settings)
        Data.init();

        // Aplicar tema guardado
        this.applyTheme(Data.settings.theme);

        // Renderizar todas las vistas
        UI.renderAll();
        UI.updateCartUI();

        // Configurar event listeners
        this.setupEventListeners();

        console.log('Kamiliahs iniciado correctamente');

        // Ocultar Splash Screen
        setTimeout(() => {
            const splash = document.getElementById('splashScreen');
            if (splash) {
                splash.classList.add('hide');
                setTimeout(() => splash.remove(), 800); // match CSS duration
            }
        }, 1500);
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
        const packCost = parseFloat(document.getElementById('newIngCost').value);
        const unit = document.getElementById('newIngUnit').value;
        const packQtyInput = document.getElementById('newIngPackQty');
        const packQty = packQtyInput ? parseFloat(packQtyInput.value) || 1 : 1;

        if (!name) {
            Utils.showToast('Nombre requerido');
            return;
        }

        if (isNaN(packCost) || packCost < 0) {
            Utils.showToast('Costo inválido');
            return;
        }

        // Calcular costo unitario
        const unitCost = packCost / packQty;

        Data.addIngredient(name, unitCost, unit, packQty);
        UI.renderInventory();
        Utils.closeAllPopups();
        Utils.showToast('INSUMO GUARDADO');

        // Limpiar campos
        document.getElementById('newIngName').value = '';
        document.getElementById('newIngCost').value = '';
        if (packQtyInput) packQtyInput.value = '1';
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

        const service = parseFloat(document.getElementById('newProdService').value) || 0;
        const margin = parseFloat(document.getElementById('newProdMargin').value) || 0;

        const product = Data.addProduct(name, icon, price, recipe, service, margin);
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
        document.getElementById('editIngCost').value = (ing.cost * (ing.packQty || 1)).toFixed(2);
        document.getElementById('editIngUnit').value = ing.unit;
        const packQtyInput = document.getElementById('editIngPackQty');
        if (packQtyInput) packQtyInput.value = ing.packQty || 1;

        Utils.openModal('editIngridientModal');
    },

    /**
     * Guardar cambios de ingrediente
     */
    saveEditIngredient() {
        const id = document.getElementById('editIngId').value;
        const name = document.getElementById('editIngName').value.trim();
        const packCost = parseFloat(document.getElementById('editIngCost').value);
        const unit = document.getElementById('editIngUnit').value;
        const packQtyInput = document.getElementById('editIngPackQty');
        const packQty = packQtyInput ? parseFloat(packQtyInput.value) || 1 : 1;

        if (!name) {
            Utils.showToast('Nombre requerido');
            return;
        }

        if (isNaN(packCost) || packCost < 0) {
            Utils.showToast('Costo inválido');
            return;
        }

        const unitCost = packCost / packQty;

        Data.updateIngredient(id, name, unitCost, unit, packQty);
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
        document.getElementById('editProdService').value = product.servicePct || 0;
        document.getElementById('editProdMargin').value = product.marginPct || 0;

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

        const service = parseFloat(document.getElementById('editProdService').value) || 0;
        const margin = parseFloat(document.getElementById('editProdMargin').value) || 0;
        Data.updateProduct(id, name, icon, price, recipe, service, margin);
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
     * Cambiar cantidad de un producto en el carrito
     */
    changeCartQty(productId, delta) {
        Data.changeCartQty(productId, delta);
        UI.updateCartUI();
    },

    /**
     * Eliminar un producto completamente del carrito
     */
    removeFromCart(productId) {
        // remove all instances
        while (Data.removeOneFromCart(productId));
        UI.updateCartUI();
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

        // paid status
        const statusSpan = document.getElementById('orderPaidStatus');
        const markBtn = document.getElementById('markPaidBtn');
        if (sale.paid) {
            statusSpan.innerText = 'Estado: Pagado';
            markBtn.innerText = 'Desmarcar pago';
        } else {
            statusSpan.innerText = 'Estado: No pagado';
            markBtn.innerText = 'Marcar pagado';
        }
        // deshabilitar edición de precio si está pagado
        document.getElementById('orderEditPrice').disabled = sale.paid;

        // populate product select
        const select = document.getElementById('addItemSelect');
        select.innerHTML = '<option value="">-- Añadir producto --</option>' +
            Data.products.map(p => `<option value="${p.id}">${p.name} - SRD ${p.price.toFixed(2)}</option>`).join('');

        const itemsDiv = document.getElementById('orderDetailItems');
        itemsDiv.innerHTML = sale.items.map((item, idx) => `
            <div class="flex justify-between items-center text-xs">
                <span>${item.name}</span>
                <span>SRD ${item.price.toFixed(2)}</span>
                ${item.servicePct ? `<span class="text-[8px] text-muted ml-2">+${item.servicePct}% serv.</span>` : ''}
                ${sale.paid ? '' : `<button class="text-red-500 text-xs ml-2" onclick="APP.removeItemFromOrder('${saleId}', ${idx})">✕</button>`}
            </div>
        `).join('');

        // disable add control if paid
        document.getElementById('addItemSelect').disabled = sale.paid;
        document.getElementById('addItemSelect').classList.toggle('opacity-50', sale.paid);

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
        const sale = Data.getSale(saleId);
        if (sale && sale.paid) {
            Utils.showToast('No se puede eliminar un pedido pagado');
            return;
        }
        if (confirm('¿Eliminar este pedido?')) {
            Data.deleteSale(saleId);
            UI.renderAll();
            Utils.closeAllPopups();
            Utils.showToast('PEDIDO ELIMINADO');
        }
    },

    /**
     * Quitar item del pedido
     */
    removeItemFromOrder(saleId, index) {
        const sale = Data.getSale(saleId);
        if (!sale) return;
        const item = sale.items.splice(index, 1)[0];
        if (item) {
            sale.total -= item.price;
            Data.saveAll();
            this.viewOrderDetail(saleId);
        }
    },

    /**
     * Agregar item al pedido desde modal
     */
    addItemToOrder() {
        const saleId = document.getElementById('orderDetailModal').dataset.saleId;
        const prodId = document.getElementById('addItemSelect').value;
        if (!prodId) return;
        const sale = Data.getSale(saleId);
        const product = Data.getProduct(prodId);
        if (sale && product) {
            sale.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                cost: Data.calculateProductCost(product.id)
            });
            sale.total += product.price;
            Data.saveAll();
            this.viewOrderDetail(saleId);
        }
    },

    /**
     * Alternar estado pagado del pedido
     */
    toggleOrderPaid() {
        const saleId = document.getElementById('orderDetailModal').dataset.saleId;
        const sale = Data.getSale(saleId);
        if (!sale) return;
        sale.paid = !sale.paid;
        Data.saveAll();
        this.viewOrderDetail(saleId);
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

        let csv = 'ID,Fecha,Total,Items,Estado\n';
        sales.forEach(sale => {
            const itemList = sale.items.map(i => i.name).join(';');
            csv += `"${sale.id.slice(-6)}","${new Date(sale.timestamp).toLocaleString()}","${sale.total.toFixed(2)}","${itemList}","${sale.paid ? 'Pagado' : 'Pendiente'}"\n`;
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

    /**
     * Vaciar listado de pedidos
     */
    clearOrders() {
        if (confirm('¿Vaciar todo el historial de pedidos? Esta acción no se puede deshacer.')) {
            Data.clearSales();
            this.switchView('orders');
            Utils.showToast('HISTORIAL VACIADO');
        }
    },

    // ========== FILTRADO ==========

    filterPOS() {
        const query = document.getElementById('posSearch').value;
        UI.renderPOS(query);
    },

    filterInventory() {
        const query = document.getElementById('inventorySearch').value;
        UI.renderInventory(query);
    },

    filterRecipes() {
        const query = document.getElementById('recipeSearch').value;
        UI.renderRecipes(query);
    },

    filterOrders() {
        const queryInput = document.getElementById('orderSearch');
        const query = queryInput ? queryInput.value : '';
        const paidFilter = this._lastPaidFilter || 'all';
        UI.renderOrders(query, paidFilter);
    },

    filterOrdersByPaid(status, el) {
        // Update tag styles
        document.querySelectorAll('#orderFilters .tag-filter').forEach(tag => tag.classList.remove('active'));
        el.classList.add('active');

        this._lastPaidFilter = status;
        this.filterOrders();
    },

    /**
     * Exportar todos los datos a un archivo JSON
     */
    exportAppData() {
        const data = Data.getFullAppData();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-kamiliahs-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        Utils.showToast('BACKUP GENERADO');
    },

    /**
     * Importar datos desde un archivo JSON local
     */
    importAppData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (confirm('¿Importar respaldo? Los datos actuales serán reemplazados por completo.')) {
                    if (Data.importFullAppData(data)) {
                        Utils.showToast('RESTORE COMPLETADO');
                        // Reiniciar app para refrescar todo
                        setTimeout(() => window.location.reload(), 1000);
                    } else {
                        Utils.showToast('Archivo incompatible');
                    }
                }
            } catch (err) {
                console.error(err);
                Utils.showToast('Error de lectura JSON');
            }
            event.target.value = ''; // permitir re-importar el mismo archivo
        };
        reader.readAsText(file);
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
     * Aplicar tema visual (light/dark/system)
     */
    applyTheme(mode) {
        const body = document.body;
        if (mode === 'light') {
            body.setAttribute('data-theme', 'light');
        } else if (mode === 'dark') {
            body.setAttribute('data-theme', 'dark');
        } else {
            body.removeAttribute('data-theme');
        }
    },

    /**
     * Guardar ajustes de configuración
     */
    saveSettings() {
        const theme = document.getElementById('configTheme').value;

        Data.updateSettings({
            theme: theme
            // units y equivalences ya se han actualizado con addUnit y addEquivalence
        });
        this.applyTheme(theme);
        Utils.showToast('Configuración guardada');
    },

    /**
     * Agregar nueva unidad de medida
     */
    addUnit() {
        const symbol = document.getElementById('newUnitSymbol').value.trim();
        const name = document.getElementById('newUnitName').value.trim();

        if (!symbol || !name) {
            Utils.showToast('Complete símbolo y nombre');
            return;
        }

        if (Data.addUnit(symbol, name)) {
            document.getElementById('newUnitSymbol').value = '';
            document.getElementById('newUnitName').value = '';
            UI.renderConfig();
            Utils.showToast(`Unidad "${symbol}" agregada`);
        } else {
            Utils.showToast('Unidad duplicada o inválida');
        }
    },

    /**
     * Abrir modal para editar unidad
     */
    openEditUnitModal(symbol, name) {
        const newSymbol = prompt(`Símbolo para "${symbol}":`, symbol);
        if (newSymbol === null) return;
        const newName = prompt(`Nombre para "${symbol}":`, name);
        if (newName === null) return;

        if (Data.editUnit(symbol, newSymbol, newName)) {
            UI.renderConfig();
            Utils.showToast('Unidad actualizada');
        } else {
            Utils.showToast('Error al actualizar unidad');
        }
    },

    /**
     * Eliminar unidad de medida
     */
    deleteUnit(symbol) {
        if (!confirm(`¿Eliminar la unidad "${symbol}"?`)) return;

        if (Data.deleteUnit(symbol)) {
            UI.renderConfig();
            Utils.showToast(`Unidad "${symbol}" eliminada`);
        } else {
            Utils.showToast('Error al eliminar unidad');
        }
    },

    /**
     * Agregar equivalencia entre dos unidades
     */
    addEquivalence() {
        const fromUnit = document.getElementById('eqFromUnit').value;
        const ratio = document.getElementById('eqRatio').value;
        const toUnit = document.getElementById('eqToUnit').value;

        if (!fromUnit || !toUnit || !ratio) {
            Utils.showToast('Complete todos los campos');
            return;
        }

        if (Data.addEquivalence(fromUnit, ratio, toUnit)) {
            document.getElementById('eqRatio').value = '';
            document.getElementById('eqFromUnit').value = '';
            document.getElementById('eqToUnit').value = '';
            UI.renderConfig();
            Utils.showToast('Equivalencia agregada');
        } else {
            Utils.showToast('Error en equivalencia');
        }
    },

    /**
     * Eliminar equivalencia
     */
    removeEquivalence(key) {
        if (Data.removeEquivalence(key)) {
            UI.renderConfig();
            Utils.showToast('Equivalencia eliminada');
        }
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
