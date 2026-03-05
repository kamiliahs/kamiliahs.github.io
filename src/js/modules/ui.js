/**
 * UI Module - Renderizado de vistas y actualizaciones de UI
 */

const UI = {
    /**
     * Renderizar vista POS
     */
    renderPOS() {
        const grid = document.getElementById('productGrid');
        grid.innerHTML = Data.products.map(p => `
            <div class="product-card flex justify-between items-center cursor-pointer" onclick="APP.addToCart('${p.id}')">
                <div>
                    <p class="label-caps mb-1">${p.icon} RECETA</p>
                    <h4 class="font-black text-lg leading-none">${p.name}</h4>
                </div>
                <div class="text-right">
                    <p class="font-black text-xl">${p.price.toFixed(0)}</p>
                    <p class="text-[9px] font-bold text-muted uppercase">SRD</p>
                </div>
            </div>
        `).join('');
    },

    /**
     * Renderizar vista de inventario
     */
    renderInventory() {
        const body = document.getElementById('inventoryBody');
        body.innerHTML = Data.ingredients.map(ing => `
            <div class="flex justify-between items-end pb-4 line-border">
                <div>
                    <p class="label-caps mb-1">Costo/${ing.unit}</p>
                    <p class="font-black text-sm">${ing.name}</p>
                </div>
                <div class="flex items-center gap-4">
                    <input type="number" value="${ing.cost}" onchange="APP.updateIngredientCost('${ing.id}', this.value)" class="w-20 text-right !p-0">
                    <button onclick="APP.deleteIngredient('${ing.id}')" class="text-muted text-[10px] cursor-pointer hover:text-black">✕</button>
                </div>
            </div>
        `).join('');
    },

    /**
     * Renderizar vista de recetas
     */
    renderRecipes() {
        const container = document.getElementById('recipesContainer');
        container.innerHTML = Data.products.map(p => {
            const cost = Data.calculateProductCost(p.id);
            const computedMargin = p.price > 0 ? (((p.price - cost) / p.price) * 100).toFixed(0) : 0;
            const margin = p.marginPct != null ? p.marginPct : computedMargin;
            const service = p.servicePct != null ? p.servicePct : 0;
            
            return `
                <div>
                    <div class="flex justify-between items-end mb-4">
                        <h4 class="heading-lg">${p.name}</h4>
                        <div class="space-x-4 flex">
                            <button onclick="APP.editProduct('${p.id}')" class="label-caps underline cursor-pointer hover:text-black">Editar</button>
                            <button onclick="APP.deleteProduct('${p.id}')" class="label-caps underline cursor-pointer hover:text-black">Borrar</button>
                        </div>
                    </div>
                    <div class="space-y-1 mb-4">
                        ${p.recipe.map(r => {
                            const ing = Data.ingredients.find(i => i.id === r.id);
                            return `<p class="text-[10px] text-muted font-medium uppercase tracking-wider">${r.qty}${ing?.unit || ''} ${ing?.name || '---'}</p>`;
                        }).join('')}
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="p-4 bg-gray-50">
                            <p class="label-caps mb-1">Costo Prod.</p>
                            <p class="font-bold">SRD ${cost.toFixed(2)}</p>
                        </div>
                        <div class="p-4 bg-black text-white">
                            <p class="label-caps text-white/50 mb-1">Margen %</p>
                            <p class="font-bold">${margin}%</p>
                        </div>
                    </div>
                    <div class="mt-4 text-sm text-muted">
                        <p>Servicio: ${service}%</p>
                        <p>Margen aplicado: ${margin}%</p>
                    </div>
                </div>
            `;
        }).join('');
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
                        <button class="text-white bg-gray-700 px-2" onclick="APP.changeCartQty('${id}',-1)">-</button>
                        <span>${info.name} x${info.count}</span>
                        <button class="text-white bg-gray-700 px-2" onclick="APP.changeCartQty('${id}',1)">+</button>
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
    renderOrders() {
        const container = document.getElementById('ordersContainer');
        const sales = Data.getAllSales();
        
        if (sales.length === 0) {
            container.innerHTML = '<p class="text-muted text-sm">Sin pedidos aún</p>';
            return;
        }
        
        container.innerHTML = sales.map(sale => `
            <div class="pb-4 line-border cursor-pointer hover:bg-gray-50 p-4 -mx-6 px-6 transition" onclick="APP.viewOrderDetail('${sale.id}')">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="label-caps mb-1">ID: ${sale.id}</p>
                        <p class="font-bold">${new Date(sale.timestamp).toLocaleString()}</p>
                    </div>
                    <div class="text-right">
                        <p class="heading-lg">SRD ${sale.total.toFixed(2)}</p>
                        <p class="text-[9px] font-bold text-muted">${sale.items.length} items</p>
                        <p class="text-[9px] ${sale.paid ? 'text-green-600' : 'text-red-500'}">${sale.paid ? 'Pagado' : 'Pendiente'}</p>
                    </div>
                </div>
            </div>
        `).join('');
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
            <div class="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
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
                    <div class="flex justify-between items-center text-xs p-2 bg-gray-50 rounded">
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
