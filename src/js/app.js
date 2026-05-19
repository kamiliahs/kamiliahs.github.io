/**
 * Kamiliahs - Aplicación Principal
 * Sistema de gestión de puntos de venta con PWA
 */

const APP = {
    viewingShiftId: null,
    swRegistration: null,

    /**
     * Cambiar idioma de la aplicación
     */
    changeLanguage(lang) {
        I18N.setLang(lang);
        Data.updateSettings({ lang: lang });
        UI.renderAll();
        UI.renderConfig();
        // Recargar pos si es necesario o disparar eventos
        Utils.showToast(I18N.t('settings_saved'));
    },

    /**
     * Inicializar aplicación
     */
    init() {
        // Inicializar datos (incluye settings)
        Data.init();

        // Inicializar i18n
        I18N.init(Data.settings.lang);
        if (!Data.settings.lang) {
            Data.updateSettings({ lang: I18N.currentLang });
        }
        I18N.translatePage();

        // Aplicar tema guardado
        this.applyTheme(Data.settings.theme);

        // Renderizar todas las vistas
        UI.renderAll();
        UI.updateCartUI();

        // Configurar event listeners
        this.setupEventListeners();

        // Cargar vista por defecto e inicializar historial
        const initialView = 'recipes';
        this.switchView(initialView, false);
        history.replaceState({ viewId: initialView }, '', '#' + initialView);

        // Configurar comprobación periódica de actualizaciones (cada 30 min)
        setInterval(() => this.checkForUpdates(), 30 * 60 * 1000);

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

        // Listener para el gesto de "volver" del navegador/móvil
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.viewId) {
                this.switchView(e.state.viewId, false);
            }
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
            Utils.showToast(I18N.t('name_required'));
            return;
        }

        if (isNaN(packCost) || packCost < 0) {
            Utils.showToast(I18N.t('invalid_cost'));
            return;
        }

        // Calcular costo unitario
        const unitCost = packCost / packQty;

        Data.addIngredient(name, unitCost, unit, packQty);
        UI.renderInventory();
        Utils.closeAllPopups();
        Utils.showToast(I18N.t('ingredient_saved'));

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
            Utils.showToast(I18N.t('invalid_cost'));
            return;
        }

        Data.updateIngredientCost(id, cost);
        UI.renderAll();
        Utils.showToast(I18N.t('cost_updated'));
    },

    /**
     * Eliminar ingrediente
     */
    deleteIngredient(id) {
        if (confirm(I18N.t('confirm_delete_ingredient'))) {
            Data.deleteIngredient(id);
            UI.renderAll();
            Utils.showToast(I18N.t('ingredient_deleted'));
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
            Utils.showToast(I18N.t('name_required'));
            return;
        }

        if (isNaN(price) || price < 0) {
            Utils.showToast(I18N.t('invalid_price'));
            return;
        }

        // Recopilar ingredientes
        const selects = document.querySelectorAll('.recipe-ing-select');
        const qtyInputs = document.querySelectorAll('.recipe-ing-qty');
        const unitSelects = document.querySelectorAll('.recipe-ing-unit');
        const scopeSelects = document.querySelectorAll('.recipe-ing-scope');
        const recipe = [];

        selects.forEach((select, i) => {
            const qty = parseFloat(qtyInputs[i].value);
            const unit = unitSelects[i].value;
            const scope = scopeSelects[i]?.value || 'all';
            if (select.value && !isNaN(qty) && qty > 0) {
                recipe.push({
                    id: select.value,
                    qty: qty,
                    unit: unit,
                    scope: scope
                });
            }
        });

        if (recipe.length === 0) {
            Utils.showToast(I18N.t('add_at_least_one'));
            return;
        }

        const service = parseFloat(document.getElementById('newProdService').value) || 0;
        const margin = parseFloat(document.getElementById('newProdMargin').value) || 0;
        const portions = parseFloat(document.getElementById('newProdPortions').value) || 1;
        const comments = document.getElementById('newProdComments').value.trim();

        const product = Data.addProduct(name, icon, price, recipe, service, margin, portions, comments);
        UI.renderAll();
        Utils.closeAllPopups();
        Utils.showToast(I18N.t('recipe_created'));
    },

    /**
     * Eliminar producto
     */
    deleteProduct(id) {
        if (confirm(I18N.t('confirm_delete_recipe'))) {
            Data.deleteProduct(id);
            UI.renderAll();
            Utils.showToast(I18N.t('recipe_deleted'));
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
            Utils.showToast(I18N.t('name_required'));
            return;
        }

        if (isNaN(packCost) || packCost < 0) {
            Utils.showToast(I18N.t('invalid_cost'));
            return;
        }

        const unitCost = packCost / packQty;

        Data.updateIngredient(id, name, unitCost, unit, packQty);
        UI.renderAll();
        Utils.closeAllPopups();
        Utils.showToast(I18N.t('ingredient_updated'));
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
            Utils.showToast(I18N.t('name_required'));
            return;
        }

        if (isNaN(price) || price < 0) {
            Utils.showToast(I18N.t('invalid_price'));
            return;
        }

        const selects = document.querySelectorAll('.recipe-edit-ing-select');
        const qtyInputs = document.querySelectorAll('.recipe-edit-ing-qty');
        const unitSelects = document.querySelectorAll('.recipe-edit-ing-unit');
        const scopeSelects = document.querySelectorAll('.recipe-edit-ing-scope');
        const recipe = [];

        selects.forEach((select, i) => {
            const qty = parseFloat(qtyInputs[i].value);
            const unit = unitSelects[i].value;
            const scope = scopeSelects[i]?.value || 'all';
            if (select.value && !isNaN(qty) && qty > 0) {
                recipe.push({
                    id: select.value,
                    qty: qty,
                    unit: unit,
                    scope: scope
                });
            }
        });

        if (recipe.length === 0) {
            Utils.showToast(I18N.t('add_at_least_one'));
            return;
        }

        const service = parseFloat(document.getElementById('editProdService').value) || 0;
        const margin = parseFloat(document.getElementById('editProdMargin').value) || 0;
        const portions = parseFloat(document.getElementById('editProdPortions').value) || 1;
        const comments = document.getElementById('editProdComments').value.trim();
        
        Data.addProduct(name, icon, price, recipe, service, margin, portions, comments);
        UI.renderAll();
        Utils.closeAllPopups();
        Utils.showToast(I18N.t('recipe_created_copy'));
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
            Utils.showToast(I18N.t('name_required'));
            return;
        }

        if (isNaN(price) || price < 0) {
            Utils.showToast(I18N.t('invalid_price'));
            return;
        }

        const selects = document.querySelectorAll('.recipe-edit-ing-select');
        const qtyInputs = document.querySelectorAll('.recipe-edit-ing-qty');
        const unitSelects = document.querySelectorAll('.recipe-edit-ing-unit');
        const scopeSelects = document.querySelectorAll('.recipe-edit-ing-scope');
        const recipe = [];

        selects.forEach((select, i) => {
            const qty = parseFloat(qtyInputs[i].value);
            const unit = unitSelects[i].value;
            const scope = scopeSelects[i]?.value || 'all';
            if (select.value && !isNaN(qty) && qty > 0) {
                recipe.push({
                    id: select.value,
                    qty: qty,
                    unit: unit,
                    scope: scope
                });
            }
        });

        if (recipe.length === 0) {
            Utils.showToast(I18N.t('add_at_least_one'));
            return;
        }

        const service = parseFloat(document.getElementById('editProdService').value) || 0;
        const margin = parseFloat(document.getElementById('editProdMargin').value) || 0;
        const portions = parseFloat(document.getElementById('editProdPortions').value) || 1;
        const comments = document.getElementById('editProdComments').value.trim();
        Data.updateProduct(id, name, icon, price, recipe, service, margin, portions, comments);
        UI.renderAll();
        Utils.closeAllPopups();
        Utils.showToast(I18N.t('recipe_updated'));
    },

    /**
     * Actualiza la previsualización del margen en los modales
     */
    updateRecipeMarginPreview(isEdit = false) {
        const prefix = isEdit ? 'edit' : 'new';
        const price = parseFloat(document.getElementById(`${prefix}ProdPrice`).value) || 0;
        const service = parseFloat(document.getElementById(`${prefix}ProdService`).value) || 0;
        const expectedMargin = parseFloat(document.getElementById(`${prefix}ProdMargin`).value) || 0;

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

        const expectedProfit = totalCost * (expectedMargin / 100);
        const recommendedPrice = (1 - (service / 100)) > 0 ? (totalCost + expectedProfit) / (1 - (service / 100)) : 0;

        const sugEl = document.getElementById(`${prefix}ProdSuggestedPrice`);
        if (sugEl) {
            if (totalCost > 0) {
                sugEl.innerText = `Sug: $${recommendedPrice.toFixed(2)}`;
                sugEl.classList.remove('hidden');
            } else {
                sugEl.classList.add('hidden');
            }
        }

        const previewEl = document.getElementById(`${prefix}RecipeMarginPreview`);
        if (previewEl) {
            previewEl.innerText = `${I18N.t('est_cost')}: $${totalCost.toFixed(2)} | ${I18N.t('actual_margin')}: ${margin}% | ${I18N.t('portion_label')}: $${pricePerPortion}`;
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
            Utils.showToast(`${item.name} ${I18N.t('added_toast')}`);
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
     * Establecer cantidad específica en el carrito
     */
    setCartQty(cartItemId, newQty) {
        if (newQty < 1) newQty = 1;
        const currentQty = Data.cart.filter(item => item.id === cartItemId).length;
        const delta = newQty - currentQty;
        if (delta !== 0) {
            this.changeCartQty(cartItemId, delta);
        }
    },

    /**
     * Numpad logic (Teclado numérico táctil)
     */
    openNumpadModal(cartItemId, currentQty) {
        document.getElementById('numpadTargetId').value = cartItemId;
        document.getElementById('numpadDisplay').innerText = currentQty.toString();
        window.numpadCleared = false; // Flag para borrar al primer toque
        Utils.openModal('numpadModal');
    },

    numpadInput(num) {
        const display = document.getElementById('numpadDisplay');
        if (!window.numpadCleared) {
            display.innerText = num.toString();
            window.numpadCleared = true;
        } else {
            if (display.innerText.length < 3) { // Limite de 999
                display.innerText += num.toString();
            }
        }
    },

    numpadClear() {
        document.getElementById('numpadDisplay').innerText = '1';
        window.numpadCleared = true;
    },

    numpadDelete() {
        const display = document.getElementById('numpadDisplay');
        if (display.innerText.length > 1) {
            display.innerText = display.innerText.slice(0, -1);
        } else {
            display.innerText = '1';
            window.numpadCleared = true;
        }
    },

    numpadConfirm() {
        const cartItemId = document.getElementById('numpadTargetId').value;
        const qty = parseInt(document.getElementById('numpadDisplay').innerText) || 1;
        this.setCartQty(cartItemId, qty);
        Utils.closeAllPopups();
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
            Utils.showToast(I18N.t('empty_cart'));
            return;
        }

        const total = Data.getCartTotal();
        const count = Data.cart.length;

        if (confirm(`${I18N.t('confirm_checkout')} ${count} ${I18N.t('items_label')}(s) ${I18N.t('for_label')} $${total.toFixed(2)}?`)) {
            const result = Data.checkout();
            if (result === true) {
                UI.updateCartUI();
                UI.renderReports();
                Utils.showToast(I18N.t('transaction_completed'));
            } else if (result && result.error === 'NO_ACTIVE_SHIFT') {
                Utils.showToast(`⚠️ ${I18N.t('error_label').toUpperCase()}: ${I18N.t('must_open_shift').toUpperCase()}`);
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
            statusSpan.innerText = `${I18N.t('status_label')}: ${I18N.t('paid_label')}`;
            markBtn.innerText = I18N.t('unmark_paid_btn');
        } else {
            statusSpan.innerText = `${I18N.t('status_label')}: ${I18N.t('unpaid_label')}`;
            markBtn.innerText = I18N.t('mark_paid_btn');
        }
        // deshabilitar edición de precio si está pagado
        document.getElementById('orderEditPrice').disabled = sale.paid;

        // populate product select
        const select = document.getElementById('addItemSelect');
        let options = `<option value="">-- ${I18N.t('add_product_label')} --</option>`;
        Data.products.forEach(p => {
            options += `<option value="${p.id}">${p.name} - $${p.price.toFixed(2)}</option>`;
            if (p.portions > 1) {
                const portionPrice = p.price / p.portions;
                options += `<option value="${p.id}_portion">${p.name} (${I18N.t('portion_short')}) - $${portionPrice.toFixed(2)}</option>`;
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
                    <p class="text-[9px] text-muted">$${group.price.toFixed(2)} c/u ${group.servicePct ? `(+${group.servicePct}% serv.)` : ''}</p>
                </div>
                <div class="text-right flex items-center gap-3">
                    <span class="font-black">$${(group.price * group.count).toFixed(2)}</span>
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
                Utils.showToast(I18N.t('invalid_price'));
                return;
            }
            Data.updateSale(saleId, price);
        }

        UI.renderAll();
        Utils.closeAllPopups();
        Utils.showToast(I18N.t('order_updated'));
    },

    /**
     * Eliminar pedido
     */
    deleteOrder() {
        const saleId = document.getElementById('orderDetailModal').dataset.saleId;
        const sale = Data.getSale(saleId);
        if (sale && sale.paid) {
            Utils.showToast(I18N.t('cannot_delete_paid'));
            return;
        }
        if (confirm(I18N.t('confirm_delete_order'))) {
            Data.deleteSale(saleId);
            UI.renderAll();
            Utils.closeAllPopups();
            Utils.showToast(I18N.t('order_deleted'));
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
                name: isPortion ? product.name + ` (${I18N.t('portion_label')})` : product.name,
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
        if (confirm(I18N.t('confirm_clear_history'))) {
            Data.clearSales();
            this.switchView('orders');
            Utils.showToast(I18N.t('history_cleared'));
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
        const formatDate = (date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };

        const startInput = document.getElementById('reportsDateStart');
        const endInput = document.getElementById('reportsDateEnd');
        
        if (tag === 'today') {
            const dateStr = formatDate(now);
            startInput.value = dateStr;
            endInput.value = dateStr;
        } else if (tag === 'yesterday') {
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const dateStr = formatDate(yesterday);
            startInput.value = dateStr;
            endInput.value = dateStr;
        } else if (tag === 'week') {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - 7);
            startInput.value = formatDate(startOfWeek);
            endInput.value = formatDate(now);
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
        Utils.showToast(I18N.t('backup_generated'));
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
                if (confirm(I18N.t('confirm_import_backup'))) {
                    if (Data.importFullAppData(data)) {
                        Utils.showToast(I18N.t('restoration_completed'));
                        // Reiniciar app para refrescar todo
                        setTimeout(() => window.location.reload(), 1000);
                    } else {
                        Utils.showToast(I18N.t('incompatible_file'));
                    }
                }
            } catch (err) {
                console.error(err);
                Utils.showToast(I18N.t('json_read_error'));
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
     * Compartir App
     */
    async shareApp() {
        const shareData = {
            title: 'Kamiliahs - Gestión Gastronómica',
            text: 'Kamiliahs - Sistema POS especializado en la creación de recetas gastronómicas.',
            url: 'https://kamiliahs.github.io/'
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.url);
                Utils.showToast(I18N.t('link_copied'));
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error al compartir:', err);
            }
        }
    },

    /**
     * Volver a la sección anterior
     */
    goBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            this.switchView('recipes');
        }
    },

    /**
     * Mostrar aviso de nueva versión
     */
    async showUpdateToast() {
        const toast = document.getElementById('updateToast');
        const info = document.getElementById('updateInfo');
        
        if (toast) {
            // Intentar cargar el nombre de la actualización
            try {
                const response = await fetch('./version.json?t=' + Date.now());
                const data = await response.json();
                if (info) info.innerText = data.name || 'Se han aplicado mejoras al sistema.';
            } catch (err) {
                console.log('No se pudo cargar el nombre del commit para el toast');
            }

            toast.classList.remove('hidden');
            setTimeout(() => {
                toast.classList.remove('translate-y-full');
            }, 100);
        }
    },

    /**
     * Aplicar actualización descargada
     */
    applyUpdate() {
        if (this.swRegistration && this.swRegistration.waiting) {
            this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
    },

    /**
     * Forzar búsqueda de actualizaciones
     */
    checkForUpdates() {
        if (this.swRegistration) {
            console.log('Buscando actualizaciones...');
            this.swRegistration.update().then(() => {
                if (this.swRegistration.waiting) {
                    this.showUpdateToast();
                } else {
                    Utils.showToast(I18N.t('system_up_to_date'));
                }
            });
        }
    },

    /**
     * Cargar información de la versión y cambios
     */
    async loadChangelog() {
        try {
            const response = await fetch('./version.json?t=' + Date.now());
            const data = await response.json();
            
            const label = document.getElementById('currentVerLabel');
            const title = document.getElementById('changelogTitle');
            const desc = document.getElementById('changelogDesc');
            
            if (label) label.innerText = `${I18N.t('current_version')}: ${data.version} (${data.date})`;
            if (title) title.innerText = data.name;
            if (desc) desc.innerText = data.description;
        } catch (err) {
            console.error('Error cargando changelog:', err);
        }
    },

    /**
     * Abrir modal con historial completo de versiones
     */
    async openChangelogModal() {
        Utils.openModal('changelogModal');
        const container = document.getElementById('fullChangelogContainer');
        container.innerHTML = '<p class="text-xs text-muted text-center py-4">Cargando historial...</p>';
        
        try {
            const response = await fetch('./changelog.json?t=' + Date.now());
            const commits = await response.json();
            
            container.innerHTML = commits.map(c => `
                <div class="border-b border-border pb-4 last:border-0 last:pb-0">
                    <div class="flex justify-between items-start mb-1">
                        <h4 class="font-black text-[11px] uppercase">${c.name || 'Actualización'}</h4>
                        <span class="text-[9px] text-teal border border-teal/20 bg-teal/10 px-1.5 py-0.5 rounded ml-2 shrink-0">${c.hash}</span>
                    </div>
                    <p class="text-[9px] text-muted mb-2 font-black tracking-widest opacity-60">${c.date}</p>
                    ${c.description ? `<p class="text-[11px] text-muted leading-relaxed opacity-90">${c.description}</p>` : ''}
                </div>
            `).join('');
            
            if(commits.length === 0) {
                container.innerHTML = '<p class="text-xs text-muted text-center py-4">No hay historial disponible.</p>';
            }
        } catch (err) {
            console.error('Error cargando historial completo:', err);
            container.innerHTML = '<p class="text-xs text-red-500 text-center py-4">Error al cargar el historial.</p>';
        }
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

        Utils.showToast(I18N.t('settings_saved'));
    },

    /**
     * Agregar nueva unidad de medida
     */
    addUnit() {
        const symbol = document.getElementById('newUnitSymbol').value.trim();
        const name = document.getElementById('newUnitName').value.trim();

        if (!symbol || !name) {
            Utils.showToast(I18N.t('complete_fields'));
            return;
        }

        if (Data.addUnit(symbol, name)) {
            document.getElementById('newUnitSymbol').value = '';
            document.getElementById('newUnitName').value = '';
            UI.renderConfig();
            Utils.showToast(`${I18N.t('unit_label')} "${symbol}" ${I18N.t('added_toast')}`);
        } else {
            Utils.showToast(I18N.t('duplicate_unit_error'));
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
            Utils.showToast(I18N.t('unit_updated'));
        } else {
            Utils.showToast(I18N.t('update_unit_error'));
        }
    },

    /**
     * Eliminar unidad de medida
     */
    deleteUnit(symbol) {
        if (!confirm(`${I18N.t('confirm_delete_unit')} "${symbol}"?`)) return;

        if (Data.deleteUnit(symbol)) {
            UI.renderConfig();
            Utils.showToast(`${I18N.t('unit_label')} "${symbol}" ${I18N.t('deleted_toast')}`);
        } else {
            Utils.showToast(I18N.t('delete_unit_error'));
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
            Utils.showToast(I18N.t('complete_fields'));
            return;
        }

        if (Data.addEquivalence(fromUnit, ratio, toUnit)) {
            document.getElementById('eqRatio').value = '';
            document.getElementById('eqFromUnit').value = '';
            document.getElementById('eqToUnit').value = '';
            UI.renderConfig();
            Utils.showToast(I18N.t('equivalence_added'));
        } else {
            Utils.showToast(I18N.t('equivalence_error'));
        }
    },

    /**
     * Eliminar equivalencia
     */
    removeEquivalence(key) {
        if (Data.removeEquivalence(key)) {
            UI.renderConfig();
            Utils.showToast(I18N.t('equivalence_removed'));
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
     * Agregar fila de ingrediente (Si no hay data, abre el picker)
     */
    addIngredientRow(data = null) {
        if (!data) {
            this.openIngredientPicker(false);
            return;
        }
        Utils.addIngredientRow(data);
    },




    /**
     * Agregar fila de ingrediente en edición (Si no hay data, abre el picker)
     */
    addEditIngredientRow(data = null) {
        if (!data) {
            this.openIngredientPicker(true);
            return;
        }
        Utils.addEditIngredientRow(data);
    },

    // ========== PICKER DE INSUMOS ==========

    openIngredientPicker(isEdit = false) {
        this._isEditPicker = isEdit;
        const searchInput = document.getElementById('pickerSearch');
        if (searchInput) searchInput.value = '';
        UI.renderIngredientPicker('', isEdit);
        Utils.openModal('ingredientPickerModal');
        
        // Enfocar búsqueda después de abrir
        setTimeout(() => {
            if (searchInput) searchInput.focus();
        }, 300);
    },

    closeIngredientPicker() {
        // Al cerrar el picker, no cerramos todo, solo el modal superior
        const modal = document.getElementById('ingredientPickerModal');
        if (modal) modal.classList.remove('visible');
        // No cerramos el overlay si hay otros modales debajo, 
        // pero en este sistema Utils.closeAllPopups es lo estándar.
        // Sin embargo, queremos mantener el recipeModal abierto.
        // Así que solo quitamos la clase visible de este modal específico.
    },

    filterPicker() {
        const query = document.getElementById('pickerSearch').value;
        UI.renderIngredientPicker(query, this._isEditPicker);
    },

    selectIngredientForRecipe(ingId, isEdit = false) {
        const data = { id: ingId, qty: '', unit: '', scope: 'all' };
        if (isEdit) {
            Utils.addEditIngredientRow(data);
        } else {
            Utils.addIngredientRow(data);
        }
        this.closeIngredientPicker();
        Utils.showToast(I18N.t('ingredient_added'));
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
            Utils.showToast(I18N.t('shift_updated'));
        } else {
            if (Data.activeShiftId) {
                Utils.showToast(I18N.t('shift_already_open'));
                return;
            }
            Data.openShift(name, date);
            Utils.showToast(I18N.t('shift_opened'));
        }

        UI.renderAll();
        Utils.closeAllPopups();
    },

    closeActiveShift() {
        const active = Data.getActiveShift();
        if (!active) return;

        if (confirm(`${I18N.t('confirm_close_shift')} "${active.name}"?`)) {
            Data.closeShift();
            UI.renderAll();
            Utils.showToast(I18N.t('shift_closed'));
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
        if (confirm(I18N.t('confirm_delete_shift'))) {
            Data.deleteShift(id);
            UI.renderAll();
            Utils.showToast(I18N.t('shift_deleted'));
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
        Utils.showToast(`${I18N.t('sales_of')}: ${shift.name}`);
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
                title: I18N.t('sales_costs_info_title'),
                content: I18N.t('sales_costs_info_content')
            },
            gastoServicio: {
                title: I18N.t('service_expense_info_title'),
                content: I18N.t('service_expense_info_content')
            },
            gananciaNeta: {
                title: I18N.t('net_profit_info_title'),
                content: I18N.t('net_profit_info_content')
            },
            margenReal: {
                title: I18N.t('actual_margin_info_title'),
                content: I18N.t('actual_margin_info_content')
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
