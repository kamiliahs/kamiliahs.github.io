/**
 * Utilities Module - Funciones auxiliares
 */

const Utils = {
    /**
     * Mostrar notificación toast
     */
    showToast(message, duration = 2000) {
        const toast = document.getElementById('toast');
        toast.innerText = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    },

    /**
     * Cambiar vista activa
     */
    switchView(viewId) {
        // Ocultar todas las vistas
        document.querySelectorAll('.view-container').forEach(v => v.classList.add('hidden-view'));
        
        // Remover clase active de todos los items de navegación
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        
        // Mostrar vista seleccionada
        document.getElementById(viewId + 'View')?.classList.remove('hidden-view');
        
        // Actualizar navegación activa
        const navMap = {
            'pos': 'nav-pos',
            'inventory': 'nav-inventory',
            'recipes': 'nav-inventory',
            'reports': 'nav-reports',
            'orders': 'nav-orders',
            'network': 'nav-network'
        };
        document.getElementById(navMap[viewId])?.classList.add('active');
        
        // Actualizar títulos
        const titles = {
            pos: 'TERMINAL',
            inventory: 'CATÁLOGO',
            recipes: 'FICHAS',
            reports: 'REPORTES',
            orders: 'PEDIDOS',
            network: 'RED LOCAL'
        };
        
        const subtitles = {
            pos: 'OPERACIONES',
            inventory: 'INSUMOS',
            recipes: 'ESCANDALLOS',
            reports: 'ESTADÍSTICAS',
            orders: 'HISTÓRICO',
            network: 'SINCRONIZACIÓN'
        };
        
        document.getElementById('viewTitle').innerText = titles[viewId] || 'TERMINAL';
        document.getElementById('viewSubtitle').innerText = subtitles[viewId] || 'OPERACIONES';
        
        // Cerrar menú si está abierto
        if (document.getElementById('sidebar').classList.contains('open')) {
            this.toggleMenu();
        }
        
        // Re-renderizar vistas
        if (viewId === 'recipes') {
            UI.renderRecipes();
        } else if (viewId === 'reports') {
            UI.renderReports();
        } else if (viewId === 'orders') {
            UI.renderOrders();
        } else if (viewId === 'network') {
            UI.renderNetworkStatus();
        }
    },

    /**
     * Alternar menú lateral
     */
    toggleMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('globalOverlay');
        
        sidebar.classList.toggle('open');
        overlay.classList.toggle('visible');
    },

    /**
     * Abrir modal
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('globalOverlay');
        
        modal.classList.add('visible');
        overlay.classList.add('visible');
        
        // Inicializar recipeModal si es necesario
        if (modalId === 'recipeModal') {
            document.getElementById('recipeBuilder').innerHTML = '';
            this.addIngredientRow();
        }
        
        // Limpiar campos de ingredientes
        if (modalId === 'ingridientModal') {
            document.getElementById('newIngName').value = '';
            document.getElementById('newIngCost').value = '';
            document.getElementById('newIngUnit').value = 'gr';
        }
        
        // Limpiar campos de receta
        if (modalId === 'recipeModal') {
            document.getElementById('newProdName').value = '';
            document.getElementById('newProdIcon').value = '';
            document.getElementById('newProdPrice').value = '';
        }
    },

    /**
     * Cerrar todos los popups
     */
    closeAllPopups() {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('visible'));
        document.getElementById('globalOverlay').classList.remove('visible');
        document.getElementById('sidebar').classList.remove('open');
    },

    /**
     * Agregar fila de ingrediente a receta
     */
    addIngredientRow() {
        const container = document.getElementById('recipeBuilder');
        const row = document.createElement('div');
        row.className = "flex gap-2 items-center pb-2 line-border";
        row.innerHTML = `
            <select class="flex-1 text-[10px] font-bold uppercase border-none bg-transparent recipe-ing-select">
                ${Data.ingredients.map(i => `<option value="${i.id}">${i.name}</option>`).join('')}
            </select>
            <input type="number" class="w-16 text-[10px] recipe-ing-qty" placeholder="CANT." min="0" step="0.01">
            <button type="button" onclick="this.parentElement.remove()" class="text-xs cursor-pointer hover:text-red-500">✕</button>
        `;
        container.appendChild(row);
    },

    /**
     * Agregar fila de ingrediente a receta en modo edición
     */
    addEditIngredientRow() {
        const container = document.getElementById('editRecipeBuilder');
        const row = document.createElement('div');
        row.className = "flex gap-2 items-center pb-2 line-border";
        row.innerHTML = `
            <select class="flex-1 text-[10px] font-bold uppercase border-none bg-transparent recipe-edit-ing-select">
                ${Data.ingredients.map(i => `<option value="${i.id}">${i.name}</option>`).join('')}
            </select>
            <input type="number" class="w-16 text-[10px] recipe-edit-ing-qty" placeholder="CANT." min="0" step="0.01">
            <button type="button" onclick="this.parentElement.remove()" class="text-xs cursor-pointer hover:text-red-500">✕</button>
        `;
        container.appendChild(row);
    },

    /**
     * Validar si un email es válido (para futuro uso)
     */
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    /**
     * Formatear moneda
     */
    formatCurrency(amount) {
        return amount.toLocaleString('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },

    /**
     * Descargar datos como JSON
     */
    downloadDataAsJSON() {
        const data = {
            ingredients: Data.ingredients,
            products: Data.products,
            salesHistory: Data.salesHistory,
            exportDate: new Date().toISOString()
        };
        
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pos-backup-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
};
