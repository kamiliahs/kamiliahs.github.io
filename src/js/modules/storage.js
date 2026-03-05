/**
 * Storage Module - Persistencia de datos en localStorage
 */

const STORAGE_KEYS = {
    INGREDIENTS: 'min_pos_ing',
    PRODUCTS: 'min_pos_prod',
    SALES_HISTORY: 'min_pos_sales',
    STOCK: 'min_pos_stock'
};

const Storage = {
    /**
     * Obtener ingredientes del localStorage o datos por defecto
     */
    getIngredients() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.INGREDIENTS)) || [
            { id: 'ing1', name: 'MASA ARTESANAL', cost: 15.00, unit: 'pza' },
            { id: 'ing2', name: 'MOZZARELLA', cost: 0.12, unit: 'gr' },
            { id: 'ing3', name: 'TOMATE SAN MARZANO', cost: 0.05, unit: 'ml' }
        ];
    },

    /**
     * Obtener productos del localStorage o datos por defecto
     */
    getProducts() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)) || [
            {
                id: 'p1', name: 'MARGHERITA CLASSIC', icon: '🍕', price: 120.00,
                recipe: [{ id: 'ing1', qty: 1 }, { id: 'ing2', qty: 200 }, { id: 'ing3', qty: 100 }]
            }
        ];
    },

    /**
     * Obtener historial de ventas del localStorage
     */
    getSalesHistory() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES_HISTORY)) || [];
    },

    /**
     * Guardar ingredientes en localStorage
     */
    saveIngredients(ingredients) {
        localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(ingredients));
    },

    /**
     * Guardar productos en localStorage
     */
    saveProducts(products) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    },

    /**
     * Guardar historial de ventas en localStorage
     */
    saveSalesHistory(salesHistory) {
        localStorage.setItem(STORAGE_KEYS.SALES_HISTORY, JSON.stringify(salesHistory));
    },

    /**
     * Obtener stock del localStorage
     */
    getStock() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.STOCK)) || {};
    },

    /**
     * Guardar stock en localStorage
     */
    saveStock(stock) {
        localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(stock));
    },

    /**
     * Limpiar todos los datos del localStorage
     */
    clearAll() {
        localStorage.removeItem(STORAGE_KEYS.INGREDIENTS);
        localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
        localStorage.removeItem(STORAGE_KEYS.SALES_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.STOCK);
    }
};

// Exportar para uso en módulos
