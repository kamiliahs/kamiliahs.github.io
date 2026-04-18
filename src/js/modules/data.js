/**
 * Data Module - Lógica de datos y cálculos
 */

const Data = {
    ingredients: [],
    products: [],
    salesHistory: [],
    shifts: [],
    activeShiftId: null,
    stock: {}, // Inventario de insumos
    cart: [],
    settings: {
        theme: 'system',
        units: [
            { symbol: 'gr', name: 'Gramo' },
            { symbol: 'ml', name: 'Mililitro' },
            { symbol: 'pza', name: 'Pieza' }
        ],
        equivalences: {},
    },

    /**
     * Inicializar datos desde Storage
     */
    init() {
        this.ingredients = Storage.getIngredients();
        this.products = Storage.getProducts();
        this.salesHistory = Storage.getSalesHistory();
        this.shifts = Storage.getShifts ? Storage.getShifts() || [] : [];
        this.activeShiftId = Storage.getActiveShiftId ? Storage.getActiveShiftId() : null;
        this.stock = Storage.getStock();
        this.cart = [];
        this.settings = Storage.getSettings();
    },

    /**
     * Guardar datos actualizados en Storage
     */
    saveAll() {
        Storage.saveIngredients(this.ingredients);
        Storage.saveProducts(this.products);
        Storage.saveSalesHistory(this.salesHistory);
        Storage.saveShifts(this.shifts);
        Storage.saveActiveShiftId(this.activeShiftId);
        Storage.saveStock(this.stock);
        Storage.saveSettings(this.settings);
    },

    /**
     * ========== CRUD INSUMOS ==========
     */

    /**
     * Agregar ingrediente
     */
    addIngredient(name, cost, unit, packQty = 1) {
        const ingredient = {
            id: 'ing_' + Date.now(),
            name: name.toUpperCase(),
            cost: parseFloat(cost),
            unit: unit,
            packQty: parseFloat(packQty) || 1
        };
        this.ingredients.push(ingredient);
        this.saveAll();
        return ingredient;
    },

    /**
     * Actualizar ingrediente completo
     */
    updateIngredient(id, name, cost, unit, packQty = 1) {
        const ingredient = this.ingredients.find(i => i.id === id);
        if (ingredient) {
            ingredient.name = name.toUpperCase();
            ingredient.cost = parseFloat(cost);
            ingredient.unit = unit;
            ingredient.packQty = parseFloat(packQty) || 1;
            this.saveAll();
            return true;
        }
        return false;
    },

    /**
     * Actualizar costo de ingrediente
     */
    updateIngredientCost(id, newCost) {
        const ingredient = this.ingredients.find(i => i.id === id);
        if (ingredient) {
            ingredient.cost = parseFloat(newCost);
            this.saveAll();
            return true;
        }
        return false;
    },

    /**
     * Eliminar ingrediente
     */
    deleteIngredient(id) {
        const index = this.ingredients.findIndex(i => i.id === id);
        if (index !== -1) {
            this.ingredients.splice(index, 1);
            delete this.stock[id];
            this.saveAll();
            return true;
        }
        return false;
    },

    /**
     * Actualizar stock de ingrediente
     */
    updateStock(ingredientId, quantity) {
        this.stock[ingredientId] = parseFloat(quantity);
        this.saveAll();
    },

    /**
     * Obtener stock de ingrediente
     */
    getStock(ingredientId) {
        return this.stock[ingredientId] || 0;
    },

    /**
     * ========== CRUD PRODUCTOS/RECETAS ==========
     */

    /**
     * Agregar producto (receta)
     */
    addProduct(name, icon, price, recipe, servicePct = 0, marginPct = 0, portions = 1, comments = '') {
        const product = {
            id: 'p' + Date.now(),
            name: name.toUpperCase(),
            icon: icon || '',
            price: parseFloat(price),
            recipe: recipe,
            servicePct: parseFloat(servicePct) || 0,
            marginPct: parseFloat(marginPct) || 0,
            portions: parseFloat(portions) || 1,
            comments: comments || ''
        };
        this.products.push(product);
        this.saveAll();
        return product;
    },

    /**
     * Actualizar producto completo
     */
    updateProduct(id, name, icon, price, recipe, servicePct = 0, marginPct = 0, portions = 1, comments = '') {
        const product = this.products.find(p => p.id === id);
        if (product) {
            product.name = name.toUpperCase();
            product.icon = icon;
            product.price = parseFloat(price);
            product.recipe = recipe;
            product.servicePct = parseFloat(servicePct) || 0;
            product.marginPct = parseFloat(marginPct) || 0;
            product.portions = parseFloat(portions) || 1;
            product.comments = comments || '';
            this.saveAll();
            return true;
        }
        return false;
    },

    /**
     * Eliminar producto
     */
    deleteProduct(id) {
        this.products = this.products.filter(p => p.id !== id);
        this.saveAll();
    },

    /**
     * Obtener producto por ID
     */
    getProduct(id) {
        return this.products.find(p => p.id === id);
    },

    /**
     * Calcular costo de producción de un producto
     * Respeta las equivalencias y unidades actuales
     */
    calculateProductCost(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return 0;

        return product.recipe.reduce((total, item) => {
            const ingredient = this.ingredients.find(i => i.id === item.id);
            if (!ingredient) return total;

            // Unit conversion logic
            const quantity = item.qty;
            const itemUnit = item.unit || ingredient.unit;

            // Convert quantity to ingredient's base unit
            const convertedQty = this.convertUnit(quantity, itemUnit, ingredient.unit);

            // Cost is per ingredient base unit
            const unitCost = ingredient.cost;

            return total + (unitCost * convertedQty);
        }, 0);
    },

    /**
     * Agregar artículo al carrito
     */
    addToCart(productId, asPortion = false) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return null;

        const isPortion = asPortion && product.portions > 1;
        const portions = parseFloat(product.portions) || 1;

        const basePrice = parseFloat(product.price);
        const effectivePrice = basePrice;

        const cartItem = {
            ...product,
            id: isPortion ? product.id + '_portion' : product.id,
            productId: product.id,
            name: isPortion ? product.name + ' (PORCIÓN)' : product.name,
            costAtSale: isPortion ? this.calculateProductCost(productId) / portions : this.calculateProductCost(productId),
            price: isPortion ? effectivePrice / portions : effectivePrice,
            basePrice: isPortion ? basePrice / portions : basePrice,
            isPortion: isPortion
        };
        this.cart.push(cartItem);
        return cartItem;
    },

    /**
     * Remove a single instance of a product from the cart
     */
    removeOneFromCart(cartItemId) {
        const idx = this.cart.findLastIndex(i => i.id === cartItemId);
        if (idx !== -1) {
            this.cart.splice(idx, 1);
            this.saveAll();
            return true;
        }
        return false;
    },

    /**
     * Adjust quantity by delta (positive will add, negative will remove)
     */
    changeCartQty(cartItemId, delta) {
        const existing = this.cart.find(item => item.id === cartItemId);
        if (!existing) return;

        if (delta > 0) {
            for (let i = 0; i < delta; i++) {
                this.addToCart(existing.productId, existing.isPortion);
            }
        } else if (delta < 0) {
            for (let i = 0; i < Math.abs(delta); i++) {
                if (!this.removeOneFromCart(cartItemId)) break;
            }
        }
    },

    /**
     * Obtener total del carrito
     */
    getCartTotal() {
        return this.cart.reduce((total, item) => total + item.price, 0);
    },

    /**
     * ========== CRUD PEDIDOS/VENTAS ==========
     */

    /**
     * Limpiar carrito y registrar venta
     */
    checkout() {
        if (this.cart.length === 0) return false;
        
        // No permitir venta sin turno abierto
        if (!this.activeShiftId) {
            return { error: 'NO_ACTIVE_SHIFT' };
        }

        const sale = {
            id: 'sale_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            shiftId: this.activeShiftId,
            total: this.getCartTotal(),
            items: this.cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                cost: item.costAtSale,
                servicePct: item.servicePct || 0,
                basePrice: item.basePrice || item.price
            })),
            timestamp: Date.now(),
            paid: false
        };

        this.salesHistory.push(sale);
        this.cart = [];
        this.saveAll();
        return true;
    },

    /**
     * ========== CRUD TURNOS (SHIFTS) ==========
     */

    /**
     * Abrir un nuevo turno
     */
    openShift(name, date = null) {
        if (this.activeShiftId) return false;

        const shift = {
            id: 'shift_' + Date.now(),
            name: name.toUpperCase(),
            date: date || new Date().toISOString().split('T')[0],
            startTime: Date.now(),
            endTime: null,
            status: 'open'
        };

        this.shifts.push(shift);
        this.activeShiftId = shift.id;
        this.saveAll();
        return shift;
    },

    /**
     * Cerrar turno activo
     */
    closeShift() {
        if (!this.activeShiftId) return false;
        
        const shift = this.shifts.find(s => s.id === this.activeShiftId);
        if (shift) {
            shift.status = 'closed';
            shift.endTime = Date.now();
            this.activeShiftId = null;
            this.saveAll();
            return true;
        }
        return false;
    },

    /**
     * Eliminar turno y sus ventas asociadas? 
     * El usuario pidió vincular datos de ventas, pero no especificó si deben borrarse.
     * Normalmente se conservan las ventas pero quedan huérfanas o se borran en cascada.
     * Implementaremos borrado en cascada para limpieza, o simplemente desvincular.
     * Usuario dijo "CRUd completo para los turnos", así que permitir borrar.
     */
    deleteShift(id) {
        const index = this.shifts.findIndex(s => s.id === id);
        if (index !== -1) {
            const shift = this.shifts[index];
            if (this.activeShiftId === shift.id) {
                this.activeShiftId = null;
            }
            this.shifts.splice(index, 1);
            // Opcional: Borrar ventas de este turno
            this.salesHistory = this.salesHistory.filter(s => s.shiftId !== id);
            this.saveAll();
            return true;
        }
        return false;
    },

    /**
     * Actualizar datos de un turno (Nombre/Fecha)
     */
    updateShift(id, name, date) {
        const shift = this.shifts.find(s => s.id === id);
        if (shift) {
            shift.name = name.toUpperCase();
            shift.date = date;
            this.saveAll();
            return true;
        }
        return false;
    },

    /**
     * Obtener ventas de un turno específico
     */
    getSalesByShift(shiftId) {
        return this.salesHistory.filter(s => s.shiftId === shiftId);
    },

    /**
     * Obtener turno por ID
     */
    getShift(id) {
        return this.shifts.find(s => s.id === id);
    },

    /**
     * Obtener turno activo
     */
    getActiveShift() {
        return this.shifts.find(s => s.id === this.activeShiftId);
    },

    /**
     * Obtener pedido por ID
     */
    getSale(saleId) {
        return this.salesHistory.find(s => s.id === saleId);
    },

    /**
     * Actualizar configuración general
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveAll();
    },

    /**
     * Actualizar pedido
     */
    updateSale(saleId, price) {
        const sale = this.salesHistory.find(s => s.id === saleId);
        if (sale) {
            sale.total = parseFloat(price);
            this.saveAll();
            return true;
        }
        return false;
    },

    /**
     * Marcar venta como pagada
     */
    markSalePaid(saleId) {
        const sale = this.salesHistory.find(s => s.id === saleId);
        if (sale) {
            sale.paid = true;
            this.saveAll();
            return true;
        }
        return false;
    },

    /**
     * Eliminar pedido
     */
    deleteSale(saleId) {
        const index = this.salesHistory.findIndex(s => s.id === saleId);
        if (index > -1) {
            this.salesHistory.splice(index, 1);
            this.saveAll();
            return true;
        }
        return false;
    },

    /**
     * Vaciar historial de ventas
     */
    clearSales() {
        this.salesHistory = [];
        this.saveAll();
        return true;
    },

    /**
     * Obtener todos los pedidos
     */
    getAllSales() {
        return this.salesHistory;
    },

    /**
     * Obtener estadísticas de ventas
     */
    getSalesStats() {
        let totalSales = 0;
        let totalCosts = 0;
        let totalServiceExpenses = 0;

        this.salesHistory.forEach(sale => {
            totalSales += sale.total || 0;
            const saleCost = sale.items.reduce((sum, item) => sum + (item.cost || 0), 0);
            totalCosts += saleCost;

            // Calculate service expense as a percentage of the charged price
            const saleServiceExpense = sale.items.reduce((sum, item) => {
                return sum + (item.price * (item.servicePct || 0) / 100);
            }, 0);
            totalServiceExpenses += saleServiceExpense;
        });

        const netProfit = totalSales - totalCosts - totalServiceExpenses;
        const marginPercentage = totalSales > 0 ? (netProfit / totalSales * 100) : 0;

        return {
            totalSales,
            totalCosts,
            totalServiceExpenses,
            netProfit,
            marginPercentage,
            transactionCount: this.salesHistory.length
        };
    },

    /**
     * Obtener desglose de ganancias por producto
     */
    getProfitByProduct() {
        const profitMap = {};

        this.salesHistory.forEach(sale => {
            sale.items.forEach(item => {
                if (!profitMap[item.name]) {
                    profitMap[item.name] = {
                        name: item.name,
                        count: 0,
                        totalRevenue: 0,
                        totalCost: 0,
                        totalService: 0
                    };
                }
                profitMap[item.name].count++;
                profitMap[item.name].totalRevenue += item.price;
                profitMap[item.name].totalCost += item.cost || 0;
                const itemServiceExpense = item.price * (item.servicePct || 0) / 100;
                profitMap[item.name].totalService += itemServiceExpense;
            });
        });

        return Object.values(profitMap).map(item => ({
            ...item,
            profit: item.totalRevenue - item.totalCost - (item.totalService || 0),
            margin: item.totalRevenue > 0 ? ((item.totalRevenue - item.totalCost - (item.totalService || 0)) / item.totalRevenue * 100) : 0
        }));
    },

    /**
     * ========== GESTIÓN DE UNIDADES Y EQUIVALENCIAS ==========
     */

    /**
     * Obtener todas las unidades disponibles (símbolos)
     */
    getUnits() {
        return (this.settings.units || []).map(u => u.symbol);
    },

    /**
     * Obtener lista completa de unidades con nombre
     */
    getUnitsList() {
        return this.settings.units || [];
    },

    /**
     * Agregar una nueva unidad
     */
    addUnit(symbol, name) {
        const sym = symbol.trim().toLowerCase();
        const nm = name.trim();
        if (!sym || !nm || this.settings.units.some(u => u.symbol === sym)) {
            return false;
        }
        this.settings.units.push({ symbol: sym, name: nm });
        this.saveAll();
        return true;
    },

    /**
     * Editar una unidad existente
     */
    editUnit(oldSymbol, newSymbol, newName) {
        const unit = this.settings.units.find(u => u.symbol === oldSymbol);
        if (!unit) return false;
        const newSym = newSymbol.trim().toLowerCase();
        const newNm = newName.trim();
        if (!newSym || !newNm) return false;
        if (oldSymbol !== newSym) {
            const eqKeys = Object.keys(this.settings.equivalences);
            eqKeys.forEach(key => {
                const parts = key.split('_to_');
                const from = parts[0];
                const to = parts[1];
                let newKey = key;
                if (from === oldSymbol) newKey = newSym + '_to_' + to;
                if (to === oldSymbol) newKey = from + '_to_' + newSym;
                if (newKey !== key) {
                    this.settings.equivalences[newKey] = this.settings.equivalences[key];
                    delete this.settings.equivalences[key];
                }
            });
        }
        unit.symbol = newSym;
        unit.name = newNm;
        this.saveAll();
        return true;
    },

    /**
     * Eliminar una unidad
     */
    deleteUnit(symbol) {
        const idx = this.settings.units.findIndex(u => u.symbol === symbol);
        if (idx === -1) return false;
        this.settings.units.splice(idx, 1);
        const keysToDelete = Object.keys(this.settings.equivalences).filter(key => {
            const parts = key.split('_to_');
            const from = parts[0];
            const to = parts[1];
            return from === symbol || to === symbol;
        });
        keysToDelete.forEach(key => delete this.settings.equivalences[key]);
        this.saveAll();
        return true;
    },

    /**
     * Crear equivalencia bidireccional entre dos unidades
     * e.g. 1 kg = 1000 gr → agrega "kg_to_gr": 1000 y "gr_to_kg": 0.001
     */
    addEquivalence(fromUnit, ratio, toUnit) {
        const from = fromUnit.toLowerCase().trim();
        const to = toUnit.toLowerCase().trim();
        const r = parseFloat(ratio);

        if (!from || !to || isNaN(r) || r <= 0) return false;
        const symbols = this.getUnits();
        if (!symbols.includes(from) || !symbols.includes(to)) {
            return false;
        }

        // Crear clave directa e inversa
        const key1 = `${from}_to_${to}`;
        const key2 = `${to}_to_${from}`;

        this.settings.equivalences[key1] = r;
        this.settings.equivalences[key2] = 1 / r;

        this.saveAll();
        this.recalculateProductCosts(); // Recalcular costos de recetas vigentes
        return true;
    },

    /**
     * Convertir cantidad entre unidades
     */
    convertUnit(quantity, fromUnit, toUnit) {
        if (fromUnit === toUnit) return quantity;

        const key = `${fromUnit.toLowerCase()}_to_${toUnit.toLowerCase()}`;
        const ratio = this.settings.equivalences[key];

        if (ratio === undefined) {
            console.warn(`No conversion available: ${key}`);
            return quantity; // retorna sin convertir
        }

        return quantity * ratio;
    },

    /**
     * Recalcular costo de todas las recetas vigentes
     * (no toca el histórico de ventas)
     */
    recalculateProductCosts() {
        // Los costos se calculan on-the-fly en calculateProductCost
        // aquí solo marcamos que la receta debe ser recalculada
        // Al renderizar, usamos calculateProductCost que lee las unidades actuales
    },

    /**
     * Obtener unidades compatibles con una unidad base
     */
    getCompatibleUnits(unit) {
        if (!unit) return [];
        const compatible = new Set([unit]);
        const equivalences = this.settings.equivalences || {};

        Object.keys(equivalences).forEach(key => {
            const [from, to] = key.split('_to_');
            if (from === unit) compatible.add(to);
            if (to === unit) compatible.add(from);
        });

        return Array.from(compatible);
    },

    /**
     * Obtener equivalencias para renderizar
     */
    getEquivalences() {
        return this.settings.equivalences || {};
    },

    /**
     * Eliminar una equivalencia
     */
    removeEquivalence(key) {
        if (this.settings.equivalences[key]) {
            delete this.settings.equivalences[key];
            this.saveAll();
            this.recalculateProductCosts();
            return true;
        }
        return false;
    },

    /**
     * Obtener objeto completo con todos los datos del sistema para backup
     */
    getFullAppData() {
        return {
            ingredients: this.ingredients,
            products: this.products,
            salesHistory: this.salesHistory,
            shifts: this.shifts,
            activeShiftId: this.activeShiftId,
            stock: this.stock,
            settings: this.settings,
            exportDate: new Date().toISOString(),
            appName: 'Kamiliahs'
        };
    },

    /**
     * Importar datos desde un objeto de backup
     */
    importFullAppData(data) {
        if (!data || !data.ingredients || !data.products) return false;

        this.ingredients = data.ingredients || [];
        this.products = data.products || [];
        this.salesHistory = data.salesHistory || [];
        this.shifts = data.shifts || [];
        this.activeShiftId = data.activeShiftId || null;
        this.stock = data.stock || {};
        this.settings = data.settings || this.settings;

        this.saveAll();
        return true;
    }
};

// Inicializar datos al cargar
document.addEventListener('DOMContentLoaded', () => {
    if (Data.ingredients.length === 0) {
        Data.init();
    }
});
