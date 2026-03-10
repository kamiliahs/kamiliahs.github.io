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
        const query = searchQuery.toLowerCase();
        const filtered = Data.products.filter(p =>
            p.name.toLowerCase().includes(query) ||
            (p.icon && p.icon.toLowerCase().includes(query))
        );

        grid.innerHTML = filtered.map(p => `
            <div class="product-card flex justify-between items-center cursor-pointer" onclick="APP.addToCart('${p.id}')">
                <div>
                    <p class="label-caps mb-1">${p.icon} RECETA</p>
                    <h4 class="font-black text-lg leading-none">${p.name}</h4>
                </div>
                <div class="text-right flex items-center gap-3">
                    ${p.portions > 1 ? `
                    <button onclick="event.stopPropagation(); APP.addToCart('${p.id}', true)" 
                            class="bg-teal/10 hover:bg-teal/20 text-teal text-[8px] font-black px-2 py-1 rounded border border-teal/20 transition-all">
                        + PORCIÓN
                    </button>` : ''}
                    <div>
                        <p class="font-black text-xl">${p.price.toFixed(0)}</p>
                        <p class="text-[9px] font-bold text-muted uppercase">SRD</p>
                    </div>
                </div>
            </div>
        `).join('') || '<p class="text-muted text-sm px-6">No se encontraron platos</p>';
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

            const sellingPrice = p.price * (1 + servicePct / 100);
            // Actual margin (net) considering service as expense
            const actualProfit = p.price - cost;
            const actualMargin = sellingPrice > 0 ? (actualProfit / sellingPrice * 100).toFixed(1) : 0;

            return `
                <div>
                    <div class="flex justify-between items-end mb-4">
                        <h4 class="heading-lg">${p.name}</h4>
                        <div class="space-x-4 flex">
                            <button onclick="APP.shareProduct('${p.id}')" class="label-caps underline cursor-pointer hover:text-teal font-bold">QR</button>
                            <button onclick="APP.editProduct('${p.id}')" class="label-caps underline cursor-pointer hover:text-teal">Editar</button>
                            <button onclick="APP.deleteProduct('${p.id}')" class="label-caps underline cursor-pointer hover:text-red-500">Borrar</button>
                        </div>
                    </div>
                    <div class="space-y-1 mb-4">
                        ${p.recipe.map(r => {
                const ing = Data.ingredients.find(i => i.id === r.id);
                const unit = r.unit || ing?.unit || '';
                return `<p class="text-[10px] text-muted font-medium uppercase tracking-wider">${r.qty} ${unit} ${ing?.name || '---'}</p>`;
            }).join('')}
                    </div>
                    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <div class="p-3 bg-card border-l-2 border-teal">
                            <p class="label-caps mb-1 opacity-50">Costo / Margen Esperado</p>
                            <p class="font-bold text-[11px]">SRD ${cost.toFixed(2)} / ${expectedMargin}%</p>
                        </div>
                        <div class="p-3 bg-card border-l-2 border-orange-400">
                            <p class="label-caps mb-1 opacity-50">Gasto Servicio</p>
                            <p class="font-bold text-[11px]">${servicePct}% (SRD ${(p.price * servicePct / 100).toFixed(2)})</p>
                        </div>
                        <div class="p-3 bg-card border-l-2 border-purple-400">
                            <p class="label-caps mb-1 opacity-50">${p.portions > 1 ? 'Precio por Porción' : 'Sin Porciones'}</p>
                            <p class="font-bold text-[11px]">${p.portions > 1 ? `SRD ${((p.price * (1 + servicePct / 100)) / p.portions).toFixed(2)}` : '---'}</p>
                        </div>
                        <div class="p-3 bg-card border-l-2 border-blue-400">
                            <p class="label-caps mb-1 opacity-50">Precio Recomendado</p>
                            <p class="font-bold text-[11px]">SRD ${recommendedPrice.toFixed(2)}</p>
                        </div>
                        <div class="p-3 ${actualProfit > 0 ? 'btn-primary' : 'bg-red-500 text-white'}">
                            <p class="label-caps mb-1 opacity-50">Precio Total / Margen Real</p>
                            <p class="font-bold text-[11px]">SRD ${p.price.toFixed(2)} / ${actualMargin}%</p>
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
        const stats = Data.getSalesStats();
        const profitByProduct = Data.getProfitByProduct();

        document.getElementById('repTotalSales').innerText = stats.totalSales.toFixed(2);
        document.getElementById('repTotalCost').innerText = stats.totalCosts.toFixed(2);
        document.getElementById('repNetProfit').innerText = stats.netProfit.toFixed(2);
        document.getElementById('headerProfit').innerText = `SRD ${stats.netProfit.toFixed(2)}`;
        document.getElementById('repMarginAvg').innerText = `${stats.marginPercentage.toFixed(1)}% de margen`;

        const breakdown = document.getElementById('profitBreakdown');
        breakdown.innerHTML = profitByProduct.length > 0 ? profitByProduct.map(item => `
            <div class="pb-6 line-border">
                <div class="flex justify-between items-center mb-2">
                    <p class="font-bold text-sm">${item.name}</p>
                    <p class="text-xs text-muted">${item.count} venta${item.count > 1 ? 's' : ''}</p>
                </div>
                <div class="grid grid-cols-2 gap-4 text-[10px]">
                    <div>
                        <p class="label-caps mb-1">Ganancia</p>
                        <p class="font-bold">SRD ${item.profit.toFixed(2)}</p>
                    </div>
                    <div>
                        <p class="label-caps mb-1">Margen</p>
                        <p class="font-bold">${item.margin.toFixed(0)}%</p>
                    </div>
                </div>
            </div>
        `).join('') : '<p class="text-muted text-sm">Sin datos de ventas aún</p>';
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
                    summary[item.id] = { name: item.name, price: item.price, count: 0 };
                }
                summary[item.id].count += 1;
            });
            itemsContainer.innerHTML = Object.entries(summary).map(([id, info]) => {
                const lineTotal = (info.price * info.count).toFixed(2);
                return `
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-2">
                        <button class="cart-bar-btn" onclick="APP.changeCartQty('${id}',-1)">-</button>
                        <span>${info.name} x${info.count}</span>
                        <button class="cart-bar-btn" onclick="APP.changeCartQty('${id}',1)">+</button>
                    </div>
                    <span>${lineTotal}</span>
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
    renderOrders(searchQuery = '', paidFilter = 'all') {
        const container = document.getElementById('ordersContainer');
        const sales = Data.getAllSales();

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
            container.innerHTML = '<p class="text-muted text-sm">No se encontraron pedidos</p>';
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
                const itemBasePrice = item.basePrice || (item.price / (1 + (item.servicePct || 0) / 100));
                return sum + (itemBasePrice * (item.servicePct || 0) / 100);
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
                        <p class="font-black text-sm">SRD ${sale.total.toFixed(2)}</p>
                        <p class="text-[9px] ${sale.paid ? 'text-teal font-bold' : 'text-red-500'}">${sale.paid ? 'PAGADO' : 'PENDIENTE'}</p>
                    </div>
                </div>
                <div class="flex justify-between items-end">
                    <p class="text-[10px] text-muted truncate max-w-[180px]">${summaryText}</p>
                    <div class="flex gap-3 text-[9px] font-black tracking-widest uppercase">
                        <span class="text-muted/60">Costo: ${saleCost.toFixed(2)}</span>
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
    renderAll() {
        this.renderPOS();
        this.renderInventory();
        this.renderRecipes();
        this.renderReports();
        this.renderOrders();
    }
};
