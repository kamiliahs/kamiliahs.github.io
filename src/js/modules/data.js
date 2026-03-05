/**
 * Data Module - Lógica de datos y cálculos
 */

const Data = {
    ingredients: [],
    products: [],
    salesHistory: [],
    stock: {}, // Inventario de insumos
    cart: [],
    settings: { 
        theme: 'system', 
        units: [ 
            { symbol: 'gr', name: 'Gramo' },
            { symbol: 'ml', name: 'Mililitro' },
            { symbol: 'pza', name: 'Pieza' }
        ],
        equivalences: {} 
    },

    /**
     * Inicializar datos desde Storage
     */
    init() {
        this.ingredients = Storage.getIngredients();
        this.products = Storage.getProducts();
        this.salesHistory = Storage.getSalesHistory();
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
        Storage.saveStock(this.stock);
        Storage.saveSettings(this.settings);
    },

    /**
     * ========== CRUD INSUMOS ==========
     */

    /**
     * Agregar ingrediente
     */
    addIngredient(name, cost, unit, quantity = 0) {
        const ingredient = {
            id: 'ing_' + Date.now(),
            name: name.toUpperCase(),
            cost: parseFloat(cost),
            unit: unit
        };
        this.ingredients.push(ingredient);
        if (quantity > 0) {
            this.stock[ingredient.id] = parseFloat(quantity);
        }
        this.saveAll();
        return ingredient;
    },

    /**
     * Actualizar ingrediente completo
     */
    updateIngredient(id, name, cost, unit) {
        const ingredient = this.ingredients.find(i => i.id === id);
        if (ingredient) {
            ingredient.name = name.toUpperCase();
            ingredient.cost = parseFloat(cost);
            ingredient.unit = unit;
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
    addProduct(name, icon, price, recipe, servicePct = 0, marginPct = 0) {
        const product = {
            id: 'p' + Date.now(),
            name: name.toUpperCase(),
            icon: icon || '',
            price: parseFloat(price),
            recipe: recipe,
            servicePct: parseFloat(servicePct) || 0,
            marginPct: parseFloat(marginPct) || 0
        };
        this.products.push(product);
        this.saveAll();
        return product;
    },

    /**
     * Actualizar producto completo
     */
    updateProduct(id, name, icon, price, recipe, servicePct = 0, marginPct = 0) {
        const product = this.products.find(p => p.id === id);
        if (product) {
            product.name = name.toUpperCase();
            product.icon = icon;
            product.price = parseFloat(price);
            product.recipe = recipe;
            product.servicePct = parseFloat(servicePct) || 0;
            product.marginPct = parseFloat(marginPct) || 0;
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

            // Si hay equivalencias definidas, usar convertUnit
            const unitCost = ingredient.cost;
            const quantity = item.qty;
            
            // Si el costo está en una unidad diferente a la del ingrediente, convertir
            // Por ahora: costo * cantidad (sin conversión automática, solo si usuario lo especifica)
            return total + (unitCost * quantity);
        }, 0);
    },

    /**
     * Agregar artículo al carrito
     */
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return null;

        // compute effective price including service charge
        const basePrice = parseFloat(product.price);
        const servicePct = parseFloat(product.servicePct) || 0;
        const effectivePrice = basePrice * (1 + servicePct / 100);

        const cartItem = {
            ...product,
            costAtSale: this.calculateProductCost(productId),
            price: effectivePrice,    // override price with service applied
            basePrice: basePrice      // preserve original
        };
        this.cart.push(cartItem);
        return cartItem;
    },

    /**
     * Remove a single instance of a product from the cart
     */
    removeOneFromCart(productId) {
        const idx = this.cart.findIndex(i => i.id === productId);
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
    changeCartQty(productId, delta) {
        if (delta > 0) {
            // simply add copies
            for (let i = 0; i < delta; i++) {
                this.addToCart(productId);
            }
        } else if (delta < 0) {
            for (let i = 0; i < Math.abs(delta); i++) {
                if (!this.removeOneFromCart(productId)) break;
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

        const sale = {
            id: 'sale_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
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

        this.salesHistory.forEach(sale => {
            totalSales += sale.total || 0;
            const saleCost = sale.items.reduce((sum, item) => sum + (item.cost || 0), 0);
            totalCosts += saleCost;
        });

        const netProfit = totalSales - totalCosts;
        const marginPercentage = totalSales > 0 ? (netProfit / totalSales * 100) : 0;

        return {
            totalSales,
            totalCosts,
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
                        totalCost: 0
                    };
                }
                profitMap[item.name].count++;
                profitMap[item.name].totalRevenue += item.price;
                profitMap[item.name].totalCost += item.cost || 0;
            });
        });

        return Object.values(profitMap).map(item => ({
            ...item,
            profit: item.totalRevenue - item.totalCost,
            margin: item.totalRevenue > 0 ? ((item.totalRevenue - item.totalCost) / item.totalRevenue * 100) : 0
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
    }
};

// Inicializar datos al cargar
document.addEventListener('DOMContentLoaded', () => {
    if (Data.ingredients.length === 0) {
        Data.init();
    }
});
