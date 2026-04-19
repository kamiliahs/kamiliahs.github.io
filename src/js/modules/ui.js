/**
 * UI Module - Renderizado de vistas y actualizaciones de UI
 */

const UI = {
    /**
     * Renderizar vista POS
     */
    renderPOS(searchQuery = '') {
        const grid = document.getElementById('productGrid');
        if (!grid) return;

        // Verificar si hay un turno activo
        if (!Data.activeShiftId) {
            grid.innerHTML = `
                <div class="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
                    <div class="w-20 h-20 mb-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <h3 class="heading-lg mb-2 uppercase tracking-tight">Ventas Bloqueadas</h3>
                    <p class="text-xs text-muted font-bold uppercase mb-8 max-w-[200px]">Debes abrir un turno para poder procesar ventas</p>
                    <button onclick="APP.openShiftModal()" class="btn-primary px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal/20">
                        Abrir Nuevo Turno
                    </button>
                </div>
            `;
            // Ocultar barra del carrito si el turno está cerrado
            const cartBar = document.getElementById('cartBar');
            if (cartBar) cartBar.style.transform = 'translateY(200%)';
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = Data.products.filter(p =>
            p.name.toLowerCase().includes(query) ||
            (p.icon && p.icon.toLowerCase().includes(query))
        );

        grid.innerHTML = filtered.map(p => {
            const hasPortions = p.portions > 1;
            const portionPrice = hasPortions ? (p.price / p.portions).toFixed(2) : null;

            const actions = hasPortions
                ? `<div class="flex flex-col gap-1">
                        <button onclick="event.stopPropagation(); APP.addToCart('${p.id}')"
                                class="pos-btn-whole text-[8px] font-black px-3 py-1.5 rounded transition-all flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                            ENTERO · $${p.price.toFixed(2)}
                        </button>
                        <button onclick="event.stopPropagation(); APP.addToCart('${p.id}', true)"
                                class="pos-btn-portion text-[8px] font-black px-3 py-1.5 rounded transition-all flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                            PORCIÓN · $${portionPrice}
                        </button>
                   </div>`
                : `<div>
                        <p class="font-black text-xl">${p.price.toFixed(0)}</p>
                        <p class="text-[9px] font-bold text-muted uppercase">$</p>
                   </div>`;

            return `
            <div class="product-card flex justify-between items-center ${hasPortions ? '' : 'cursor-pointer'}" ${hasPortions ? '' : `onclick="APP.addToCart('${p.id}')"`}>
                <div>
                    <p class="label-caps mb-1">${p.icon} RECETA</p>
                    <h4 class="font-black text-lg leading-none">${p.name}</h4>
                    ${!hasPortions ? `<p class="text-[10px] text-muted mt-0.5">$${p.price.toFixed(2)}</p>` : ''}
                </div>
                <div class="text-right flex items-center gap-3">
                    ${actions}
                </div>
            </div>
        `;
        }).join('') || '<p class="text-muted text-sm px-6">No se encontraron platos</p>';
    },

    /**
     * Renderizar vista de inventario
     */
    renderInventory(searchQuery = '') {
        const body = document.getElementById('inventoryBody');
        if (!body) return;
        const query = searchQuery.toLowerCase();
        const filtered = Data.ingredients.filter(ing =>
            ing.name.toLowerCase().includes(query)
        );

        body.innerHTML = filtered.map(ing => `
            <div class="flex justify-between items-end pb-4 line-border">
                <div>
                    <p class="label-caps mb-1">Costo/${ing.unit}</p>
                    <p class="font-black text-sm">${ing.name}</p>
                    ${ing.packQty > 1 ? `<p class="text-[8px] text-muted uppercase">Pack de ${ing.packQty}</p>` : ''}
                </div>
                <div class="flex items-center gap-4">
                    <input type="number" value="${ing.cost}" onchange="APP.updateIngredientCost('${ing.id}', this.value)" class="w-20 text-right !p-0">
                    <button onclick="APP.editIngredient('${ing.id}')" class="text-teal text-[10px] cursor-pointer font-bold">EDITAR</button>
                    <button onclick="APP.deleteIngredient('${ing.id}')" class="text-muted text-[10px] cursor-pointer hover:text-red-500">✕</button>
                </div>
            </div>
        `).join('') || '<p class="text-muted text-sm">No se encontraron insumos</p>';
    },

    /**
     * Renderizar vista de recetas
     */
    renderRecipes(searchQuery = '') {
        const container = document.getElementById('recipesContainer');
        const query = searchQuery.toLowerCase();
        const filtered = Data.products.filter(p =>
            p.name.toLowerCase().includes(query)
        );

        container.innerHTML = filtered.map(p => {
            const cost = Data.calculateProductCost(p.id);
            const servicePct = p.servicePct || 0;
            const expectedMargin = p.marginPct || 0;

            // Formula for recommended price to achieve expected margin while having service expense
            // RecommendedPrice = Cost / (1 - (ExpectedMargin/100) - (Service/100))
            const recommendedPrice = (1 - (expectedMargin / 100) - (servicePct / 100)) > 0
                ? cost / (1 - (expectedMargin / 100) - (servicePct / 100))
                : cost;

            const sellingPrice = p.price;
            // Actual margin (net) considering service as expense (subtracted from price)
            const serviceExpense = sellingPrice * (servicePct / 100);
            const actualProfit = sellingPrice - cost - serviceExpense;
            const actualMargin = sellingPrice > 0 ? (actualProfit / sellingPrice * 100).toFixed(1) : 0;
            const expectedProfit = recommendedPrice * (expectedMargin / 100);

            return `
                <div>
                    <div class="flex justify-between items-end mb-4">
                        <h4 class="heading-lg">${p.name}</h4>
                        <div class="space-x-4 flex">
                            <button onclick="APP.editProduct('${p.id}')" class="label-caps underline cursor-pointer hover:text-teal">Editar</button>
                            <button onclick="APP.deleteProduct('${p.id}')" class="label-caps underline cursor-pointer hover:text-red-500">Borrar</button>
                        </div>
                    </div>
                    <div class="space-y-1 mb-4 max-w-sm">
                        ${p.recipe.map(r => {
                const ing = Data.ingredients.find(i => i.id === r.id);
                const unit = r.unit || ing?.unit || '';
                let costStr = '';
                if (ing) {
                    const convertedQty = Data.convertUnit(r.qty, unit, ing.unit);
                    const costForQty = ing.cost * convertedQty;
                    costStr = `<span class="opacity-70 font-bold">$${costForQty.toFixed(2)}</span>`;
                }
                let scopeLabel = '';
                if (r.scope === 'whole') scopeLabel = ' <span class="text-[8px] opacity-50 bg-white/10 px-1 rounded ml-1">SOLO ENTERO</span>';
                else if (r.scope === 'portion') scopeLabel = ' <span class="text-[8px] opacity-50 bg-teal/10 text-teal px-1 rounded ml-1">SOLO PORCIÓN</span>';

                return `<div class="text-[10px] text-muted font-medium uppercase tracking-wider flex justify-between border-b border-white/5 pb-1">
                            <span class="flex items-center">${r.qty} ${unit} ${ing?.name || '---'}${scopeLabel}</span>
                            ${costStr}
                        </div>`;
            }).join('')}
                    </div>
                    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <div class="p-3 bg-card border-l-2 border-teal">
                            <p class="label-caps mb-1 opacity-50">Costo / Margen Esperado</p>
                            <p class="font-bold text-[11px]">$${cost.toFixed(2)} / ${expectedMargin}% ($${expectedProfit.toFixed(2)})</p>
                        </div>
                        <div class="p-3 bg-card border-l-2 border-orange-400">
                            <p class="label-caps mb-1 opacity-50">Gasto Servicio</p>
                            <p class="font-bold text-[11px]">${servicePct}% ($${serviceExpense.toFixed(2)})</p>
                        </div>
                        <div class="p-3 bg-card border-l-2 border-purple-400">
                            <p class="label-caps mb-1 opacity-50">${p.portions > 1 ? 'Precio por Porción (Def. / Rcmd.)' : 'Sin Porciones'}</p>
                            <p class="font-bold text-[11px]">${p.portions > 1 ? `$${(sellingPrice / p.portions).toFixed(2)} / $${(recommendedPrice / p.portions).toFixed(2)}` : '---'}</p>
                        </div>
                        <div class="p-3 bg-card border-l-2 border-blue-400">
                            <p class="label-caps mb-1 opacity-50">Precio Recomendado</p>
                            <p class="font-bold text-[11px]">$${recommendedPrice.toFixed(2)}</p>
                        </div>
                        <div class="p-3 bg-card border-l-2 ${actualProfit > 0 ? 'border-green-500' : 'border-red-500'}">
                            <p class="label-caps mb-1 opacity-50">Precio Total / Margen Real</p>
                            <p class="font-bold text-[11px]">$${sellingPrice.toFixed(2)} / ${actualMargin}% ($${actualProfit.toFixed(2)})</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('') || '<p class="text-muted text-sm">No se encontraron recetas</p>';
    },

    /**
     * Renderizar vista de reportes
     */
    renderReports() {
        const searchInput = document.getElementById('reportsSearch');
        const dateStart = document.getElementById('reportsDateStart');
        const dateEnd = document.getElementById('reportsDateEnd');
        
        if (!searchInput) return;

        const query = searchInput.value.toLowerCase();
        const activeTag = document.querySelector('#reportsTags .tag-filter.active')?.dataset.tag;

        let filteredSales = Data.salesHistory.filter(s => s.paid === true);

        // 1. Filtrar por Turno Activo
        if (activeTag === 'current_shift') {
            filteredSales = filteredSales.filter(s => s.shiftId === Data.activeShiftId);
        }

        // 2. Filtrar por búsqueda (Turno o Producto)
        if (query) {
            filteredSales = filteredSales.filter(sale => {
                const shift = Data.getShift(sale.shiftId);
                const shiftMatch = shift && shift.name.toLowerCase().includes(query);
                const productMatch = sale.items.some(item => item.name.toLowerCase().includes(query));
                return shiftMatch || productMatch;
            });
        }

        // 3. Filtrar por fecha (Usando strings de fecha para evitar problemas de zona horaria)
        if (dateStart.value) {
            const startTime = new Date(dateStart.value + 'T00:00:00').getTime();
            filteredSales = filteredSales.filter(s => s.timestamp >= startTime);
        }
        if (dateEnd.value) {
            const endTime = new Date(dateEnd.value + 'T23:59:59').getTime();
            filteredSales = filteredSales.filter(s => s.timestamp <= endTime);
        }

        const stats = Data.getSalesStats(filteredSales);
        const profitByProduct = Data.getProfitByProduct(filteredSales);

        document.getElementById('repTotalSales').innerText = stats.totalSales.toFixed(2);
        document.getElementById('repTotalCost').innerText = stats.totalCosts.toFixed(2);
        document.getElementById('repNetProfit').innerText = stats.netProfit.toFixed(2);
        
        document.getElementById('repMarginAvg').innerText = `${stats.marginPercentage.toFixed(1)}% margen ($${stats.netProfit.toFixed(2)})`;

        const breakdown = document.getElementById('profitBreakdown');
        breakdown.innerHTML = profitByProduct.length > 0 ? profitByProduct.map(item => `
            <div class="pb-6 line-border">
                <div class="flex justify-between items-center mb-2">
                    <p class="font-bold text-sm">${item.name}</p>
                    <p class="text-xs text-muted">${item.count} venta${item.count > 1 ? 's' : ''}</p>
                </div>
                <div class="grid grid-cols-2 gap-4 text-[10px]">
                    <div>
                        <p class="label-caps mb-1 flex items-center gap-1">Ventas / Costos <button onclick="APP.showInfo('ventasCostos')" class="text-teal text-[12px] opacity-70 hover:opacity-100">ⓘ</button></p>
                        <p class="font-bold">$${item.totalRevenue.toFixed(2)} / $${item.totalCost.toFixed(2)}</p>
                    </div>
                    <div>
                        <p class="label-caps mb-1 flex items-center gap-1">Gasto Servicio <button onclick="APP.showInfo('gastoServicio')" class="text-teal text-[12px] opacity-70 hover:opacity-100">ⓘ</button></p>
                        <p class="font-bold">${item.totalRevenue > 0 ? (item.totalService / item.totalRevenue * 100).toFixed(1) : 0}% ($${item.totalService.toFixed(2)})</p>
                    </div>
                    <div>
                        <p class="label-caps mb-1 flex items-center gap-1">Ganancia neta <button onclick="APP.showInfo('gananciaNeta')" class="text-teal text-[12px] opacity-70 hover:opacity-100">ⓘ</button></p>
                        <p class="font-bold text-teal">$${item.profit.toFixed(2)}</p>
                    </div>
                    <div>
                        <p class="label-caps mb-1 flex items-center gap-1">Margen Real <button onclick="APP.showInfo('margenReal')" class="text-teal text-[12px] opacity-70 hover:opacity-100">ⓘ</button></p>
                        <p class="font-bold">${item.margin.toFixed(1)}% ($${item.profit.toFixed(2)})</p>
                    </div>
                </div>
            </div>
        `).join('') : '<p class="text-muted text-sm">Sin datos para estos filtros</p>';
    },

    /**
     * Actualizar UI del carrito
     */
    updateCartUI() {
        const itemsContainer = document.getElementById('cartItems');
        const total = Data.getCartTotal();

        if (Data.cart.length > 0) {
            // aggregate by product id
            const summary = {};
            Data.cart.forEach(item => {
                if (!summary[item.id]) {
                    summary[item.id] = { name: item.name, price: item.price, count: 0, isPortion: item.isPortion };
                }
                summary[item.id].count += 1;
            });
            const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            itemsContainer.innerHTML = Object.entries(summary).map(([id, info]) => {
                const lineTotal = (info.price * info.count).toFixed(2);
                
                const qtyEditor = isTouch 
                    ? `<span class="cart-numpad-btn flex items-center gap-1 cursor-pointer px-2 py-1 rounded" onclick="APP.openNumpadModal('${id}', ${info.count})">
                           x${info.count} 
                           <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="8" y1="7" x2="8.01" y2="7"/><line x1="12" y1="7" x2="12.01" y2="7"/><line x1="16" y1="7" x2="16.01" y2="7"/><line x1="8" y1="12" x2="8.01" y2="12"/><line x1="12" y1="12" x2="12.01" y2="12"/><line x1="16" y1="12" x2="16.01" y2="16"/><line x1="8" y1="17" x2="8.01" y2="17"/><line x1="12" y1="17" x2="12.01" y2="17"/><line x1="16" y1="17" x2="16.01" y2="17"/></svg>
                       </span>`
                    : `<input type="number" min="1" value="${info.count}" class="w-12 text-center text-xs bg-transparent border border-border rounded" onchange="APP.setCartQty('${id}', parseInt(this.value) || 1)">`;

                const badge = info.isPortion 
                    ? '<span class="cart-badge-portion">PORCIÓN</span>' 
                    : '<span class="cart-badge-whole">ENTERO</span>';
                
                const displayName = info.name.replace(' (PORCIÓN)', '');

                return `
                <div class="flex justify-between items-center w-full">
                    <div class="flex items-center gap-2 flex-1">
                        <button class="cart-bar-btn" onclick="APP.changeCartQty('${id}',-1)">-</button>
                        <div class="flex flex-col">
                            <span class="truncate max-w-[100px] font-bold text-sm leading-tight">${displayName}</span>
                            <div>${badge}</div>
                        </div>
                        ${qtyEditor}
                        <button class="cart-bar-btn" onclick="APP.changeCartQty('${id}',1)">+</button>
                    </div>
                    <span class="font-bold">$${lineTotal}</span>
                </div>`;
            }).join('');
        } else {
            itemsContainer.innerHTML = '<span class="text-muted text-xs">Carrito vacío</span>';
        }

        document.getElementById('cartTotal').innerText = total.toFixed(2);
        document.getElementById('cartCount').innerText = Data.cart.length;

        // Mostrar/ocultar carrito con animación
        const cartBar = document.getElementById('cartBar');
        cartBar.style.transform = Data.cart.length > 0 ? 'translateY(0)' : 'translateY(200%)';
    },

    /**
     * Renderizar vista de pedidos
     */
    renderOrders(searchQuery = '', paidFilter = 'all', shiftId = null) {
        const container = document.getElementById('ordersContainer');
        const sales = shiftId ? Data.getSalesByShift(shiftId) : Data.getAllSales();

        const query = searchQuery.toLowerCase();
        const filtered = sales.filter(sale => {
            const matchesSearch = sale.id.toLowerCase().includes(query) ||
                new Date(sale.timestamp).toLocaleString().toLowerCase().includes(query);
            const matchesPaid = paidFilter === 'all' ||
                (paidFilter === 'paid' && sale.paid) ||
                (paidFilter === 'unpaid' && !sale.paid);
            return matchesSearch && matchesPaid;
        });

        if (filtered.length === 0) {
            container.innerHTML = `<p class="text-muted text-sm">No se encontraron pedidos ${shiftId ? 'en este turno' : ''}</p>`;
            return;
        }

        container.innerHTML = filtered.reverse().map(sale => {
            // Calcular resumen de ítems por cantidad
            const summary = {};
            sale.items.forEach(item => {
                const key = item.name;
                if (!summary[key]) summary[key] = 0;
                summary[key]++;
            });
            const summaryText = Object.entries(summary)
                .map(([name, qty]) => `${qty}x ${name}`)
                .join(', ');

            const saleCost = sale.items.reduce((sum, item) => sum + (item.cost || 0), 0);
            const saleServiceExpense = sale.items.reduce((sum, item) => {
                return sum + (item.price * (item.servicePct || 0) / 100);
            }, 0);
            const saleNetProfit = sale.total - saleCost - saleServiceExpense;

            return `
            <div class="pb-4 line-border cursor-pointer hover:bg-card p-4 -mx-6 px-6 transition" onclick="APP.viewOrderDetail('${sale.id}')">
                <div class="flex justify-between items-center mb-1">
                    <div>
                        <p class="label-caps mb-1">ID: ${sale.id.slice(-6)}</p>
                        <p class="font-bold text-xs">${new Date(sale.timestamp).toLocaleString()}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-black text-sm">$${sale.total.toFixed(2)}</p>
                        <p class="text-[9px] ${sale.paid ? 'text-teal font-bold' : 'text-red-500'}">${sale.paid ? 'PAGADO' : 'PENDIENTE'}</p>
                    </div>
                </div>
                <div class="flex justify-between items-end">
                    <p class="text-[10px] text-muted truncate max-w-[180px]">${summaryText}</p>
                    <div class="flex gap-3 text-[9px] font-black tracking-widest uppercase">
                        <span class="text-muted/60">Costo: ${saleCost.toFixed(2)}</span>
                        <span class="text-orange-400">Servicio: ${saleServiceExpense.toFixed(2)}</span>
                        <span class="text-teal">Neto: ${saleNetProfit.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `}).join('');
    },

    /**
     * Renderizar vista de configuración
     */
    renderConfig() {
        if (typeof APP !== 'undefined') APP.loadChangelog();
        const s = Data.settings || {};

        // Theme
        document.getElementById('configTheme').value = s.theme || 'system';

        // Units list with edit/delete
        const unitsList = document.getElementById('unitsList');
        unitsList.innerHTML = (s.units || []).map(u => `
            <div class="flex justify-between items-center text-sm p-4 bg-card rounded">
                <div class="flex-1">
                    <input type="text" class="text-xs w-24 border-0 bg-transparent font-bold" value="${u.symbol}" readonly data-unit-symbol="${u.symbol}" class="unitSymbolInput">
                    <span class="text-xs text-muted ml-2">${u.name}</span>
                </div>
                <button class="text-blue-500 text-xs mr-2" onclick="APP.openEditUnitModal('${u.symbol}', '${u.name}')">Editar</button>
                <button class="text-red-500 text-xs" onclick="APP.deleteUnit('${u.symbol}')">✕</button>
            </div>
        `).join('');

        // Equivalences list
        const eqList = document.getElementById('equivalencesList');
        const eqObj = s.equivalences || {};
        const displayed = new Set();
        eqList.innerHTML = Object.entries(eqObj)
            .filter(([key]) => !displayed.has(key.split('_to_')[0]))
            .map(([key, val]) => {
                displayed.add(key.split('_to_')[0]);
                const parts = key.split('_to_');
                return `
                    <div class="flex justify-between items-center text-xs p-4 bg-card rounded">
                        <span>1 ${parts[0]} = ${val} ${parts[1]}</span>
                        <button class="text-red-500 text-xs" onclick="APP.removeEquivalence('${key}')">✕</button>
                    </div>
                `;
            }).join('');

        // Populate selects for creating equivalence
        const fromSelect = document.getElementById('eqFromUnit');
        const toSelect = document.getElementById('eqToUnit');
        const options = (s.units || []).map(u => `<option value="${u.symbol}">${u.symbol.toUpperCase()} (${u.name})</option>`).join('');

        fromSelect.innerHTML = '<option value="">De --</option>' + options;
        toSelect.innerHTML = '<option value="">A --</option>' + options;

    },


    /**
     * Poblar un select con las unidades disponibles
     */
    populateUnitSelect(selectElement, selectedValue = '') {
        const units = Data.getUnitsList();
        selectElement.innerHTML = units.map(u =>
            `<option value="${u.symbol}" ${u.symbol === selectedValue ? 'selected' : ''}>${u.symbol.toUpperCase()}</option>`
        ).join('');
    },



    /**
     * Renderizar todas las vistas
     */
    /**
     * Renderizar sección de Turnos
     */
    renderShifts() {
        const listContainer = document.getElementById('shiftsList');
        const activeBanner = document.getElementById('activeShiftBanner');
        const activeName = document.getElementById('activeShiftName');
        const activeInfo = document.getElementById('activeShiftInfo');

        const activeShift = Data.getActiveShift();
        const shifts = Data.shifts || [];

        // Actualizar Banner de Turno Activo
        if (activeShift) {
            activeBanner.classList.remove('hidden');
            activeName.innerText = activeShift.name;
            activeInfo.innerText = `${activeShift.date} · DESDE ${new Date(activeShift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            activeBanner.classList.add('hidden');
        }

        // Renderizar lista de turnos (excluyendo el activo si se prefiere, o mostrándolo abajo también)
        // Mostraremos todos ordenados por fecha/inicio descendente
        listContainer.innerHTML = [...shifts].reverse().map(s => {
            const shiftSales = Data.getSalesByShift(s.id);
            const totalRevenue = shiftSales.reduce((sum, sale) => sum + sale.total, 0);
            const totalProfit = shiftSales.reduce((sum, sale) => {
                const saleCost = sale.items.reduce((csum, item) => csum + (item.cost || 0), 0);
                const saleService = sale.items.reduce((ssum, item) => ssum + (item.price * (item.servicePct || 0) / 100), 0);
                return sum + (sale.total - saleCost - saleService);
            }, 0);

            const isActive = s.id === Data.activeShiftId;

            return `
                <div class="p-6 bg-card rounded-2xl border ${isActive ? 'border-teal' : 'border-border'} transition-all">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <p class="label-caps">${s.date}</p>
                                ${isActive ? '<span class="px-2 py-0.5 bg-teal text-white text-[8px] font-black rounded-full">EN CURSO</span>' : ''}
                            </div>
                            <h4 class="heading-lg">${s.name}</h4>
                            <p class="text-[10px] text-muted font-bold uppercase">
                                ${new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                                ${s.endTime ? ' - ' + new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="APP.editShift('${s.id}')" class="text-teal text-[10px] font-black uppercase hover:underline">Editar</button>
                            ${!isActive ? `<button onclick="APP.deleteShift('${s.id}')" class="text-red-500 text-[10px] font-black uppercase hover:underline">Borrar</button>` : ''}
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-3 gap-4 border-t border-border pt-4 mt-2">
                        <div>
                            <p class="label-caps opacity-50 mb-1">Ventas</p>
                            <p class="font-black text-sm">$${totalRevenue.toFixed(2)}</p>
                            <p class="text-[8px] text-muted">${shiftSales.length} transacciones</p>
                        </div>
                        <div>
                            <p class="label-caps opacity-50 mb-1 text-teal">Neto</p>
                            <p class="font-black text-sm text-teal">$${totalProfit.toFixed(2)}</p>
                        </div>
                        <div class="text-right">
                             <button onclick="APP.viewShiftSales('${s.id}')" class="label-caps underline hover:text-teal">Detalle</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('') || '<p class="text-muted text-sm italic">No hay historial de turnos</p>';
    },

    /**
     * Actualizar la ganancia del turno en el header
     */
    updateHeaderProfit() {
        const headerProfitEl = document.getElementById('headerProfit');
        if (!headerProfitEl) return;

        if (Data.activeShiftId) {
            const shiftStats = Data.getSalesStats(Data.activeShiftId);
            headerProfitEl.innerText = `$${shiftStats.netProfit.toFixed(2)}`;
        } else {
            headerProfitEl.innerText = '$0.00';
        }
    },

    renderAll() {
        this.renderPOS();
        this.renderInventory();
        this.renderRecipes();
        this.renderReports();
        this.renderOrders();
        this.renderShifts();
    }
};
