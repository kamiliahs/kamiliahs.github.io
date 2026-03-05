/**
 * Data Module - Lógica de datos y cálculos
 */

const Data = {
    ingredients: [],
    products: [],
    salesHistory: [],
    stock: {}, // Inventario de insumos
    cart: [],

    /**
     * Inicializar datos desde Storage
     */
    init() {
        this.ingredients = Storage.getIngredients();
        this.products = Storage.getProducts();
        this.salesHistory = Storage.getSalesHistory();
        this.stock = Storage.getStock();
        this.cart = [];
    },

    /**
     * Guardar datos actualizados en Storage
     */
    saveAll() {
        Storage.saveIngredients(this.ingredients);
        Storage.saveProducts(this.products);
        Storage.saveSalesHistory(this.salesHistory);
        Storage.saveStock(this.stock);
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
     * Eliminar ingrediente
     */
    deleteIngredient(id) {
        this.ingredients = this.ingredients.filter(i => i.id !== id);
        delete this.stock[id];
        this.saveAll();
    },

    /**
     * ========== CRUD PRODUCTOS/RECETAS ==========
     */

    /**
     * Agregar producto (receta)
     */
    addProduct(name, icon, price, recipe) {
        const product = {
            id: 'p_' + Date.now(),
            name: name.toUpperCase(),
            icon: icon || '🍽️',
            price: parseFloat(price),
            recipe: recipe
        };
        this.products.push(product);
        this.saveAll();
        return product;
    },

    /**
     * Actualizar producto completo
     */
    updateProduct(id, name, icon, price, recipe) {
        const product = this.products.find(p => p.id === id);
        if (product) {
            product.name = name.toUpperCase();
            product.icon = icon || product.icon;
            product.price = parseFloat(price);
            product.recipe = recipe;
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
     */
    calculateProductCost(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return 0;

        return product.recipe.reduce((total, item) => {
            const ingredient = this.ingredients.find(i => i.id === item.id);
            return total + (ingredient ? (ingredient.cost * item.qty) : 0);
        }, 0);
    },

    /**
     * Agregar artículo al carrito
     */
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return null;

        const cartItem = {
            ...product,
            costAtSale: this.calculateProductCost(productId)
        };
        this.cart.push(cartItem);
        return cartItem;
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

        this.cart.forEach(item => {
            this.salesHistory.push({
                id: 'sale_' + Date.now() + Math.random(),
                price: item.price,
                cost: item.costAtSale,
                name: item.name,
                timestamp: Date.now(),
                items: item.recipe || []
            });
        });

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
     * Actualizar pedido
     */
    updateSale(saleId, price) {
        const sale = this.salesHistory.find(s => s.id === saleId);
        if (sale) {
            sale.price = parseFloat(price);
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
            totalSales += sale.price;
            totalCosts += sale.cost;
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
            if (!profitMap[sale.name]) {
                profitMap[sale.name] = {
                    name: sale.name,
                    count: 0,
                    totalRevenue: 0,
                    totalCost: 0
                };
            }
            profitMap[sale.name].count++;
            profitMap[sale.name].totalRevenue += sale.price;
            profitMap[sale.name].totalCost += sale.cost;
        });

        return Object.values(profitMap).map(item => ({
            ...item,
            profit: item.totalRevenue - item.totalCost,
            margin: item.totalRevenue > 0 ? ((item.totalRevenue - item.totalCost) / item.totalRevenue * 100) : 0
        }));
    }
};

// Inicializar datos al cargar
document.addEventListener('DOMContentLoaded', () => {
    if (Data.ingredients.length === 0) {
        Data.init();
    }
});
