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

        // Listeners para previsualización de margen
        ['new', 'edit'].forEach(prefix => {
            const inputs = [
                `${prefix}ProdPrice`,
                `${prefix}ProdService`,
                `${prefix}ProdPortions`
            ];
            inputs.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.addEventListener('input', () => this.updateRecipeMarginPreview(prefix === 'edit'));
                }
            });

            // También escuchar en el contenedor de ingredientes (delegación)
            const container = document.getElementById(prefix === 'new' ? 'recipeBuilder' : 'editRecipeBuilder');
            if (container) {
                container.addEventListener('input', () => this.updateRecipeMarginPreview(prefix === 'edit'));
                container.addEventListener('change', () => this.updateRecipeMarginPreview(prefix === 'edit'));
            }
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
        const unitSelects = document.querySelectorAll('.recipe-ing-unit');
        const recipe = [];

        selects.forEach((select, i) => {
            const qty = parseFloat(qtyInputs[i].value);
            const unit = unitSelects[i].value;
            if (select.value && !isNaN(qty) && qty > 0) {
                recipe.push({
                    id: select.value,
                    qty: qty,
                    unit: unit
                });
            }
        });

        if (recipe.length === 0) {
            Utils.showToast('Agregar al menos un insumo');
            return;
        }

        const service = parseFloat(document.getElementById('newProdService').value) || 0;
        const margin = parseFloat(document.getElementById('newProdMargin').value) || 0;
        const portions = parseFloat(document.getElementById('newProdPortions').value) || 1;
        const comments = document.getElementById('newProdComments').value.trim();

        const product = Data.addProduct(name, icon, price, recipe, service, margin, portions, comments);
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
        const packQtyInput = document.getElementById('editIngPackQty');
        if (packQtyInput) packQtyInput.value = ing.packQty || 1;

        UI.populateUnitSelect(document.getElementById('editIngUnit'), ing.unit);

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
        document.getElementById('editProdPortions').value = product.portions || 1;
        document.getElementById('editProdComments').value = product.comments || '';

        const builder = document.getElementById('editRecipeBuilder');
        builder.innerHTML = ''; // Limpiar antes de poblar
        product.recipe.forEach(r => {
            Utils.addEditIngredientRow(r);
        });

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
        const unitSelects = document.querySelectorAll('.recipe-edit-ing-unit');
        const recipe = [];

        selects.forEach((select, i) => {
            const qty = parseFloat(qtyInputs[i].value);
            const unit = unitSelects[i].value;
            if (select.value && !isNaN(qty) && qty > 0) {
                recipe.push({
                    id: select.value,
                    qty: qty,
                    unit: unit
                });
            }
        });

        if (recipe.length === 0) {
            Utils.showToast('Agregar al menos un insumo');
            return;
        }

        const service = parseFloat(document.getElementById('editProdService').value) || 0;
        const margin = parseFloat(document.getElementById('editProdMargin').value) || 0;
        const portions = parseFloat(document.getElementById('editProdPortions').value) || 1;
        const comments = document.getElementById('editProdComments').value.trim();
        Data.updateProduct(id, name, icon, price, recipe, service, margin, portions, comments);
        UI.renderAll();
        Utils.closeAllPopups();
        Utils.showToast('RECETA ACTUALIZADA');
    },

    /**
     * Actualiza la previsualización del margen en los modales
     */
    updateRecipeMarginPreview(isEdit = false) {
        const prefix = isEdit ? 'edit' : 'new';
        const price = parseFloat(document.getElementById(`${prefix}ProdPrice`).value) || 0;
        const service = parseFloat(document.getElementById(`${prefix}ProdService`).value) || 0;

        let totalCost = 0;
        const selects = document.querySelectorAll(`.recipe-${isEdit ? 'edit-' : ''}ing-select`);
        const qtyInputs = document.querySelectorAll(`.recipe-${isEdit ? 'edit-' : ''}ing-qty`);
        const unitSelects = document.querySelectorAll(`.recipe-${isEdit ? 'edit-' : ''}ing-unit`);

        selects.forEach((select, i) => {
            const ingId = select.value;
            const qty = parseFloat(qtyInputs[i].value) || 0;
            const unit = unitSelects[i].value;
            const ingredient = Data.ingredients.find(ing => ing.id === ingId);

            if (ingredient) {
                const convertedQty = Data.convertUnit(qty, unit, ingredient.unit);
                totalCost += ingredient.cost * convertedQty;
            }
        });

        const sellingPrice = price * (1 + service / 100);
        const margin = sellingPrice > 0 ? (((sellingPrice - totalCost) / sellingPrice) * 100).toFixed(1) : 0;
        const portions = parseFloat(document.getElementById(`${prefix}ProdPortions`).value) || 1;
        const pricePerPortion = portions > 0 ? (sellingPrice / portions).toFixed(2) : 0;

        const previewEl = document.getElementById(`${isEdit ? 'edit' : 'new'}RecipeMarginPreview`);
        if (previewEl) {
            previewEl.innerText = `Costo Est: SRD ${totalCost.toFixed(2)} | Margen Est: ${margin}% | Porción: SRD ${pricePerPortion}`;
        }
    },

    // ========== CARRITO Y VENTAS ==========

    /**
     * Agregar producto al carrito
     */
    addToCart(productId, asPortion = false) {
        const item = Data.addToCart(productId, asPortion);
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

        // Calcular costos y ganancias del pedido
        const saleCost = sale.items.reduce((sum, item) => sum + (item.cost || 0), 0);
        const saleServiceExpense = sale.items.reduce((sum, item) => {
            const itemBasePrice = item.basePrice || (item.price / (1 + (item.servicePct || 0) / 100));
            return sum + (itemBasePrice * (item.servicePct || 0) / 100);
        }, 0);
        const saleNetProfit = sale.total - saleCost - saleServiceExpense;

        document.getElementById('orderDetailCost').innerText = saleCost.toFixed(2);
        document.getElementById('orderDetailProfit').innerText = saleNetProfit.toFixed(2);

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
        let options = '<option value="">-- Añadir producto --</option>';
        Data.products.forEach(p => {
            options += `<option value="${p.id}">${p.name} - SRD ${p.price.toFixed(2)}</option>`;
            if (p.portions > 1) {
                const portionPrice = (p.price * (1 + (p.servicePct || 0) / 100)) / p.portions;
                options += `<option value="${p.id}_portion">${p.name} (POR.) - SRD ${portionPrice.toFixed(2)}</option>`;
            }
        });
        select.innerHTML = options;

        const itemsDiv = document.getElementById('orderDetailItems');

        // Agrupar items por nombre para mostrar estadísticas según cantidad
        const aggregatedItems = {};
        sale.items.forEach((item, originalIndex) => {
            const key = item.id + '_' + item.price; // Agrupar por ID y precio (por si cambió el precio base)
            if (!aggregatedItems[key]) {
                aggregatedItems[key] = {
                    name: item.name,
                    price: item.price,
                    servicePct: item.servicePct,
                    count: 0,
                    indices: [] // Guardar índices originales para poder eliminar
                };
            }
            aggregatedItems[key].count++;
            aggregatedItems[key].indices.push(originalIndex);
        });

        itemsDiv.innerHTML = Object.values(aggregatedItems).map((group) => `
            <div class="flex justify-between items-center text-xs pb-2">
                <div class="flex-1">
                    <p class="font-bold">${group.count}x ${group.name}</p>
                    <p class="text-[9px] text-muted">SRD ${group.price.toFixed(2)} c/u ${group.servicePct ? `(+${group.servicePct}% serv.)` : ''}</p>
                </div>
                <div class="text-right flex items-center gap-3">
                    <span class="font-black">SRD ${(group.price * group.count).toFixed(2)}</span>
                    ${sale.paid ? '' : `
                        <button class="bg-red-500/10 hover:bg-red-500/20 text-red-500 w-5 h-5 rounded flex items-center justify-center transition-colors" 
                                onclick="APP.removeItemFromOrder('${saleId}', ${group.indices[group.indices.length - 1]})">
                            ✕
                        </button>
                    `}
                </div>
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
        const cartItemId = document.getElementById('addItemSelect').value;
        if (!cartItemId) return;
        const sale = Data.getSale(saleId);
        if (!sale) return;

        const isPortion = cartItemId.endsWith('_portion');
        const productId = isPortion ? cartItemId.replace('_portion', '') : cartItemId;
        const product = Data.getProduct(productId);

        if (product) {
            const portions = parseFloat(product.portions) || 1;
            const servicePct = parseFloat(product.servicePct) || 0;
            const basePrice = parseFloat(product.price);
            const effectivePrice = basePrice * (1 + servicePct / 100);

            const itemPrice = isPortion ? effectivePrice / portions : effectivePrice;
            const itemCost = isPortion ? Data.calculateProductCost(productId) / portions : Data.calculateProductCost(productId);

            sale.items.push({
                id: cartItemId,
                name: isPortion ? product.name + ' (PORCIÓN)' : product.name,
                price: itemPrice,
                cost: itemCost,
                servicePct: servicePct,
                basePrice: isPortion ? basePrice / portions : basePrice
            });
            sale.total += itemPrice;
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
    },

    // ========== QR CODE & SHARING ==========

    /**
     * Generar y mostrar QR de una receta
     */
    shareProduct(id) {
        const product = Data.getProduct(id);
        if (!product) return;

        const display = document.getElementById('qrDisplay');
        if (!display) return;
        display.innerHTML = ''; // Limpiar anterior

        const nameEl = document.getElementById('qrRecipeName');
        if (nameEl) nameEl.innerText = product.name;

        // Preparar data compacta para QR
        const exportData = {
            t: 'recipe',
            n: product.name,
            i: product.icon,
            p: product.price,
            s: product.servicePct,
            m: product.marginPct,
            po: product.portions,
            c: product.comments || '',
            r: product.recipe.map(item => {
                const ing = Data.ingredients.find(ing => ing.id === item.id);
                return {
                    q: item.qty,
                    u: item.unit,
                    ing: ing ? {
                        n: ing.name,
                        c: ing.cost,
                        u: ing.unit,
                        pq: ing.packQty
                    } : null
                };
            })
        };

        const qrString = JSON.stringify(exportData);

        // Usar la librería qr-code-styling
        try {
            const qrCode = new QRCodeStyling({
                width: 280,
                height: 280,
                type: "canvas",
                data: qrString,
                dotsOptions: {
                    color: "#14b8a6", // teal
                    type: "rounded"
                },
                backgroundOptions: {
                    color: "#ffffff",
                },
                cornersSquareOptions: {
                    type: "extra-rounded",
                    color: "#0f766e"
                },
                cornersDotOptions: {
                    type: "dot",
                    color: "#0f766e"
                }
            });

            qrCode.append(display);
            Utils.openModal('qrModal');
        } catch (error) {
            console.error(error);
            Utils.showToast('Error generando QR');
        }
    },

    privateScannerInterval: null,
    privateScannerStream: null,

    /**
     * Iniciar escaneo de código QR
     */
    startScanner() {
        const video = document.getElementById('scannerVideo');
        if (!video) return;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });

        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(stream => {
                this.privateScannerStream = stream;
                video.srcObject = stream;
                video.setAttribute('playsinline', true);
                video.play();
                Utils.openModal('scannerModal');

                this.privateScannerInterval = setInterval(() => {
                    if (video.readyState === video.HAVE_ENOUGH_DATA) {
                        canvas.height = video.videoHeight;
                        canvas.width = video.videoWidth;
                        context.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                        const code = jsQR(imageData.data, imageData.width, imageData.height, {
                            inversionAttempts: 'dontInvert',
                        });

                        if (code) {
                            this.stopScanner();
                            this.handleScannedData(code.data);
                        }
                    }
                }, 300);
            })
            .catch(err => {
                console.error(err);
                Utils.showToast('Permiso de cámara denegado o no disponible');
            });
    },

    /**
     * Detener el escaneo y cerrar cámara
     */
    stopScanner() {
        if (this.privateScannerInterval) {
            clearInterval(this.privateScannerInterval);
            this.privateScannerInterval = null;
        }
        if (this.privateScannerStream) {
            this.privateScannerStream.getTracks().forEach(track => track.stop());
            this.privateScannerStream = null;
        }
    },

    /**
     * Manejar datos leídos del QR
     */
    handleScannedData(data) {
        try {
            const parsed = JSON.parse(data);
            if (parsed.t === 'recipe') {
                this.importRecipeData(parsed);
            } else {
                Utils.showToast('Código QR no reconocido');
            }
        } catch (e) {
            console.error('QR Parse Error:', e);
            Utils.showToast('Formato de QR inválido');
        }
    },

    /**
     * Importar receta y sus ingredientes
     */
    importRecipeData(data) {
        const newRecipeItems = [];
        const timestamp = Date.now();

        // Importamos ingredientes separados de los locales
        data.r.forEach((item, idx) => {
            if (!item.ing) return;

            // Creamos un ID único con prefijo de importación
            const remotePrefix = 'imp_';
            const ingId = remotePrefix + timestamp + '_' + idx;

            // Agregar ingrediente como importado
            Data.ingredients.push({
                id: ingId,
                name: '[IMP] ' + item.ing.n.toUpperCase(),
                cost: item.ing.c,
                unit: item.ing.u,
                packQty: item.ing.pq,
                isImported: true
            });

            newRecipeItems.push({
                id: ingId,
                qty: item.q,
                unit: item.u
            });
        });

        // Crear el producto/receta
        Data.addProduct(
            data.n.toUpperCase() + ' (IMP)',
            data.i || '🍴',
            data.p,
            newRecipeItems,
            data.s || 0,
            data.m || 0,
            data.po || 1,
            data.c || ''
        );

        Data.saveAll();
        UI.renderAll();
        Utils.closeAllPopups();
        Utils.showToast('RECETA IMPORTADA EXITOSAMENTE');
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
