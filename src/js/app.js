/**
 * Kamiliahs - Aplicación Principal
 * Sistema de gestión de puntos de venta con PWA
 */

const APP = {
    viewingShiftId: null,

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

        // Cargar vista por defecto
        this.switchView('recipes');

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
     * Guardar receta editada como una nueva receta
     */
    saveAsNewRecipe() {
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
        
        Data.addProduct(name, icon, price, recipe, service, margin, portions, comments);
        UI.renderAll();
        Utils.closeAllPopups();
        Utils.showToast('RECETA CREADA (COPIA)');
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

        const serviceExpense = price * (service / 100);
        const sellingPrice = price; // Price is now the final selling price
        const profit = price - totalCost - serviceExpense;
        const margin = sellingPrice > 0 ? ((profit / sellingPrice) * 100).toFixed(1) : 0;
        const portions = parseFloat(document.getElementById(`${prefix}ProdPortions`).value) || 1;
        const pricePerPortion = portions > 0 ? (sellingPrice / portions).toFixed(2) : 0;

        const previewEl = document.getElementById(`${isEdit ? 'edit' : 'new'}RecipeMarginPreview`);
        if (previewEl) {
            previewEl.innerText = `Costo Est: SRD ${totalCost.toFixed(2)} | Margen Real: ${margin}% | Porción: SRD ${pricePerPortion}`;
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
            const result = Data.checkout();
            if (result === true) {
                UI.updateCartUI();
                UI.renderReports();
                Utils.showToast('TRANSACCIÓN COMPLETADA');
            } else if (result && result.error === 'NO_ACTIVE_SHIFT') {
                Utils.showToast('⚠️ ERROR: DEBES ABRIR UN TURNO PRIMERO');
                this.switchView('shifts');
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
            return sum + (item.price * (item.servicePct || 0) / 100);
        }, 0);
        const saleNetProfit = sale.total - saleCost - saleServiceExpense;

        document.getElementById('orderDetailCost').innerText = saleCost.toFixed(2);
        document.getElementById('orderDetailService').innerText = saleServiceExpense.toFixed(2);
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
                const portionPrice = p.price / p.portions;
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
            const effectivePrice = basePrice;

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
     * Establecer tag de filtrado en reportes
     */
    setReportsTag(tag, el) {
        document.querySelectorAll('#reportsTags .tag-filter').forEach(btn => btn.classList.remove('active'));
        el.classList.add('active');
        
        const now = new Date();
        const startInput = document.getElementById('reportsDateStart');
        const endInput = document.getElementById('reportsDateEnd');
        
        if (tag === 'today') {
            const today = now.toISOString().split('T')[0];
            startInput.value = today;
            endInput.value = today;
        } else if (tag === 'yesterday') {
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const dateStr = yesterday.toISOString().split('T')[0];
            startInput.value = dateStr;
            endInput.value = dateStr;
        } else if (tag === 'week') {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - 7);
            startInput.value = startOfWeek.toISOString().split('T')[0];
            endInput.value = now.toISOString().split('T')[0];
        } else if (tag === 'all' || tag === 'current_shift') {
            startInput.value = '';
            endInput.value = '';
        }
        
        UI.renderReports();
    },

    /**
     * Ejecutar filtrado de reportes
     */
    filterReports() {
        UI.renderReports();
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
                        Utils.showToast('RESTAURACIÓN COMPLETADA');
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

    // ========== TURNO (SHIFTS) ==========

    openShiftModal() {
        document.getElementById('editShiftId').value = '';
        document.getElementById('shiftName').value = '';
        document.getElementById('shiftDate').value = new Date().toISOString().split('T')[0];
        Utils.openModal('shiftModal');
    },

    saveShift() {
        const id = document.getElementById('editShiftId').value;
        const name = document.getElementById('shiftName').value.trim();
        const date = document.getElementById('shiftDate').value;

        if (!name) {
            Utils.showToast('Nombre requerido');
            return;
        }

        if (id) {
            Data.updateShift(id, name, date);
            Utils.showToast('TURNO ACTUALIZADO');
        } else {
            if (Data.activeShiftId) {
                Utils.showToast('Ya hay un turno abierto');
                return;
            }
            Data.openShift(name, date);
            Utils.showToast('TURNO ABIERTO');
        }

        UI.renderAll();
        Utils.closeAllPopups();
    },

    closeActiveShift() {
        const active = Data.getActiveShift();
        if (!active) return;

        if (confirm(`¿Cerrar el turno "${active.name}"?`)) {
            Data.closeShift();
            UI.renderAll();
            Utils.showToast('TURNO CERRADO');
        }
    },

    editShift(id) {
        const shift = Data.getShift(id);
        if (!shift) return;

        document.getElementById('editShiftId').value = id;
        document.getElementById('shiftName').value = shift.name;
        document.getElementById('shiftDate').value = shift.date;
        Utils.openModal('shiftModal');
    },

    deleteShift(id) {
        if (confirm('¿Eliminar este turno y todas sus ventas asociadas? Esta acción es irreversible.')) {
            Data.deleteShift(id);
            UI.renderAll();
            Utils.showToast('TURNO ELIMINADO');
        }
    },

    viewShiftSales(id) {
        const shift = Data.getShift(id);
        if (!shift) return;

        this.viewingShiftId = id;
        // Podríamos re-usar la vista de pedidos filtrada
        this.switchView('orders');
        document.getElementById('orderSearch').value = ''; // Limpiar búsqueda
        // Filtrar UI.renderOrders manualmente para este turno
        const query = '';
        const paidFilter = 'all';
        const sales = Data.getSalesByShift(id);
        
        // Sobrescribir temporalmente el renderizado de pedidos para mostrar solo los de este turno
        // O mejor, añadir un filtro por turno a renderOrders si fuera necesario.
        // Por ahora, simularemos un filtrado visual.
        UI.renderOrders(query, paidFilter, id); 
        Utils.showToast(`Ventas de: ${shift.name}`);
    },



    /**
     * Mostrar modal de información con descripción
     */
    showInfo(type) {
        const titleEl = document.getElementById('infoModalTitle');
        const contentEl = document.getElementById('infoModalContent');
        if (!titleEl || !contentEl) return;

        const info = {
            ventasCostos: {
                title: 'Ventas / Costos',
                content: 'Representa la relación entre el ingreso bruto (lo que paga el cliente) y la inversión directa en insumos/ingredientes utilizados para la preparación del plato.'
            },
            gastoServicio: {
                title: 'Gasto por Servicio',
                content: 'Es el costo operativo indirecto (alquiler, electricidad, gas, sueldos, etc.) que se aplica como un porcentaje sobre el precio de venta para asegurar que la operación sea sustentable.'
            },
            gananciaNeta: {
                title: 'Ganancia Neta',
                content: 'Es el beneficio real que queda para el negocio después de haber pagado tanto los ingredientes como los gastos operativos. Es el dinero "limpio" o excedente final.'
            },
            margenReal: {
                title: 'Margen Real (%)',
                content: 'Es el porcentaje de rentabilidad real del producto. Indica qué parte de cada moneda vendida se convierte efectivamente en ganancia neta para el negocio.'
            }
        };

        const data = info[type];
        if (data) {
            titleEl.innerText = data.title;
            contentEl.innerText = data.content;
            Utils.openModal('infoModal');
        }
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
