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
                            <button onclick="APP.shareProductViaNetwork('${p.id}')" class="label-caps underline cursor-pointer hover:text-teal font-bold">Compartir</button>
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
                    costStr = `<span class="opacity-70 font-bold">SRD ${costForQty.toFixed(2)}</span>`;
                }
                return `<div class="text-[10px] text-muted font-medium uppercase tracking-wider flex justify-between border-b border-white/5 pb-1">
                            <span>${r.qty} ${unit} ${ing?.name || '---'}</span>
                            ${costStr}
                        </div>`;
            }).join('')}
                    </div>
                    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <div class="p-3 bg-card border-l-2 border-teal">
                            <p class="label-caps mb-1 opacity-50">Costo / Margen Esperado</p>
                            <p class="font-bold text-[11px]">SRD ${cost.toFixed(2)} / ${expectedMargin}% (SRD ${expectedProfit.toFixed(2)})</p>
                        </div>
                        <div class="p-3 bg-card border-l-2 border-orange-400">
                            <p class="label-caps mb-1 opacity-50">Gasto Servicio</p>
                            <p class="font-bold text-[11px]">${servicePct}% (SRD ${serviceExpense.toFixed(2)})</p>
                        </div>
                        <div class="p-3 bg-card border-l-2 border-purple-400">
                            <p class="label-caps mb-1 opacity-50">${p.portions > 1 ? 'Precio por Porción (Def. / Rcmd.)' : 'Sin Porciones'}</p>
                            <p class="font-bold text-[11px]">${p.portions > 1 ? `SRD ${(sellingPrice / p.portions).toFixed(2)} / SRD ${(recommendedPrice / p.portions).toFixed(2)}` : '---'}</p>
                        </div>
                        <div class="p-3 bg-card border-l-2 border-blue-400">
                            <p class="label-caps mb-1 opacity-50">Precio Recomendado</p>
                            <p class="font-bold text-[11px]">SRD ${recommendedPrice.toFixed(2)}</p>
                        </div>
                        <div class="p-3 ${actualProfit > 0 ? 'btn-primary' : 'bg-red-500 text-white'}">
                            <p class="label-caps mb-1 opacity-50">Precio Total / Margen Real</p>
                            <p class="font-bold text-[11px]">SRD ${sellingPrice.toFixed(2)} / ${actualMargin}% (SRD ${actualProfit.toFixed(2)})</p>
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
        document.getElementById('repMarginAvg').innerText = `${stats.marginPercentage.toFixed(1)}% margen (SRD ${stats.netProfit.toFixed(2)})`;

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
                        <p class="font-bold">SRD ${item.totalRevenue.toFixed(2)} / ${item.totalCost.toFixed(2)}</p>
                    </div>
                    <div>
                        <p class="label-caps mb-1 flex items-center gap-1">Gasto Servicio <button onclick="APP.showInfo('gastoServicio')" class="text-teal text-[12px] opacity-70 hover:opacity-100">ⓘ</button></p>
                        <p class="font-bold">${item.totalRevenue > 0 ? (item.totalService / item.totalRevenue * 100).toFixed(1) : 0}% (SRD ${item.totalService.toFixed(2)})</p>
                    </div>
                    <div>
                        <p class="label-caps mb-1 flex items-center gap-1">Ganancia neta <button onclick="APP.showInfo('gananciaNeta')" class="text-teal text-[12px] opacity-70 hover:opacity-100">ⓘ</button></p>
                        <p class="font-bold text-teal">SRD ${item.profit.toFixed(2)}</p>
                    </div>
                    <div>
                        <p class="label-caps mb-1 flex items-center gap-1">Margen Real <button onclick="APP.showInfo('margenReal')" class="text-teal text-[12px] opacity-70 hover:opacity-100">ⓘ</button></p>
                        <p class="font-bold">${item.margin.toFixed(1)}% (SRD ${item.profit.toFixed(2)})</p>
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
                        <p class="font-black text-sm">SRD ${sale.total.toFixed(2)}</p>
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

        // Network Server
        const ns = s.networkServer || { host: '0.peerjs.com', port: 443, path: '/', secure: true };
        document.getElementById('configPeerHost').value = ns.host || '0.peerjs.com';
        document.getElementById('configPeerPort').value = ns.port || 443;
        document.getElementById('configPeerPath').value = ns.path || '/';
        document.getElementById('configPeerSecure').checked = ns.secure !== false;
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
     * Renderizar sección de Red y Conexiones
     */
    renderNetwork() {
        const activeList = document.getElementById('activeConnectionsList');
        const discoveredList = document.getElementById('discoveredPeersList');
        const statusIndicator = document.getElementById('netStatusIndicator');
        const localIdEl = document.getElementById('netLocalId');
        const publicIpEl = document.getElementById('netPublicIp');

        if (localIdEl) localIdEl.innerText = Network.localId || '---';
        if (publicIpEl) publicIpEl.innerText = `Red: ${Network.myPublicIp || 'Detectando...'}`;

        if (statusIndicator) {
            const isOnline = Network.peer && Network.peer.open;
            const isOfflineMode = Network.myPublicIp && Network.myPublicIp.includes('Offline');

            statusIndicator.classList.toggle('text-teal', isOnline);
            statusIndicator.classList.toggle('text-red-500', !isOnline);

            let statusText = isOnline ? 'EN LÍNEA' : 'FUERA DE LÍNEA';
            if (isOnline && isOfflineMode) statusText += ' (MODO LAN)';

            statusIndicator.innerHTML = `<span class="w-2 h-2 rounded-full bg-current ${!isOnline ? 'animate-pulse' : ''}"></span> ${statusText}`;
        }

        // Renderizar Conexiones Activas
        if (activeList) {
            const connections = Object.values(Network.connections).filter(c => c.open);
            if (connections.length === 0) {
                activeList.innerHTML = '<p class="text-xs text-muted italic opacity-50">No hay equipos conectados</p>';
            } else {
                activeList.innerHTML = connections.map(conn => `
                    <div class="flex justify-between items-center p-4 bg-card rounded-xl border border-teal/10">
                        <div>
                            <p class="font-bold text-sm">Equipo ${conn.peer.split('-')[1]?.toUpperCase() || 'Remoto'}</p>
                            <p class="text-[9px] opacity-50 font-mono">${conn.peer}</p>
                        </div>
                        <button onclick="APP.disconnectFromPeer('${conn.peer}')" 
                                class="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">
                            Desconectar
                        </button>
                    </div>
                `).join('');
            }
        }

        // Renderizar Equipos Descubiertos (No conectados)
        if (discoveredList) {
            const connectedIds = Object.keys(Network.connections);
            const discovered = Network.nearbyPeers.filter(p => !connectedIds.includes(p.id));

            if (discovered.length === 0) {
                discoveredList.innerHTML = '<p class="text-xs text-muted italic opacity-50">No se detectaron más dispositivos</p>';
            } else {
                discoveredList.innerHTML = discovered.map(peer => `
                    <div class="flex justify-between items-center p-4 bg-card/50 rounded-xl border border-white/5">
                        <div>
                            <p class="font-bold text-sm">${peer.name}</p>
                            <p class="text-[9px] opacity-50 font-mono">${peer.id}</p>
                        </div>
                        <button onclick="APP.connectToPeer('${peer.id}')" 
                                class="text-[10px] font-black text-teal uppercase tracking-widest hover:underline">
                            Conectar
                        </button>
                    </div>
                `).join('');
            }
        }
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
        this.renderNetwork();
    }
};
