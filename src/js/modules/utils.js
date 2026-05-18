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
    switchView(viewId, pushToHistory = true) {
        if (window.currentActiveView === viewId) {
            pushToHistory = false; // Prevent pushing duplicate state
        }
        window.currentActiveView = viewId;

        // Ocultar todas las vistas
        document.querySelectorAll('.view-container').forEach(v => v.classList.add('hidden-view'));

        // Remover clase active de todos los items de navegación
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

        // Mostrar vista seleccionada
        document.getElementById(viewId + 'View')?.classList.remove('hidden-view');

        // Manejar historial para el gesto de "volver" en móviles
        if (pushToHistory) {
            history.pushState({ viewId: viewId }, '', '#' + viewId);
        }

        // Actualizar navegación activa
        const navMap = {
            'pos': 'nav-pos',
            'shifts': 'nav-shifts',
            'inventory': 'nav-inventory',
            'recipes': 'nav-recipes',
            'reports': 'nav-reports',
            'orders': 'nav-orders'
        };
        if (navMap[viewId]) {
            document.getElementById(navMap[viewId])?.classList.add('active');
        }

        // Actualizar títulos
        const titles = {
            pos: I18N.t('pos_title'),
            shifts: I18N.t('shifts_title'),
            inventory: I18N.t('inventory_title'),
            recipes: I18N.t('recipes_title'),
            reports: I18N.t('reports_title'),
            orders: I18N.t('orders_title'),
            config: I18N.t('config_title')
        };

        const subtitles = {
            pos: I18N.t('pos_subtitle'),
            shifts: I18N.t('shifts_subtitle'),
            inventory: I18N.t('inventory_subtitle'),
            recipes: I18N.t('recipes_subtitle'),
            reports: I18N.t('reports_subtitle'),
            orders: I18N.t('orders_subtitle'),
            config: I18N.t('config_subtitle')
        };

        document.getElementById('viewTitle').innerText = titles[viewId] || I18N.t('terminal_label');
        document.getElementById('viewSubtitle').innerText = subtitles[viewId] || I18N.t('pos_subtitle');

        // Cerrar menú si está abierto
        if (document.getElementById('sidebar').classList.contains('open')) {
            this.toggleMenu();
        }

        // Gestionar estado de turno visualizado
        if (viewId !== 'orders' && viewId !== 'reports') {
            if (typeof APP !== 'undefined') APP.viewingShiftId = null;
        }

        // Visibilidad del botón "Volver" en el header
        const backBtn = document.getElementById('headerBackBtn');
        if (backBtn) {
            // Mostrar si no es la vista principal inicial (recipes) o si hay historial
            const isInitialView = viewId === 'recipes';
            backBtn.classList.toggle('hidden', isInitialView);
        }

        // Actualizar visibilidad del grupo de botones en el header (Solo Pedidos)
        const headerActionButtons = document.getElementById('headerActionButtons');
        if (headerActionButtons) {
            const hasContext = Data.activeShiftId || (typeof APP !== 'undefined' && APP.viewingShiftId);
            const isTargetView = (viewId === 'pos'); // Solo visible en la sección de ventas
            headerActionButtons.classList.toggle('hidden', !(hasContext && isTargetView));
        }

        // Re-renderizar vistas
        if (viewId === 'pos') {
            UI.renderPOS();
        } else if (viewId === 'recipes') {
            UI.renderRecipes();
        } else if (viewId === 'reports') {
            UI.renderReports();
        } else if (viewId === 'orders') {
            UI.renderOrders('', 'all', Data.activeShiftId);
        } else if (viewId === 'shifts') {
            UI.renderShifts();
        } else if (viewId === 'config') {
            UI.renderConfig();
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
            UI.populateUnitSelect(document.getElementById('newIngUnit'), 'gr');
        }

        // Limpiar campos de receta
        if (modalId === 'recipeModal') {
            document.getElementById('newProdName').value = '';
            document.getElementById('newProdIcon').value = '';
            document.getElementById('newProdPrice').value = '';
            document.getElementById('newProdService').value = '';
            document.getElementById('newProdMargin').value = '';
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
     * Actualiza las opciones de unidad para un ingrediente específico en una receta
     */
    updateCompatibleUnitOptions(ingSelect, unitSelect, selectedUnit = null) {
        const ingId = ingSelect.value;
        const ingredient = Data.ingredients.find(i => i.id === ingId);
        if (!ingredient) return;

        const compatibleUnits = Data.getCompatibleUnits(ingredient.unit);
        unitSelect.innerHTML = compatibleUnits.map(symbol =>
            `<option value="${symbol}" ${selectedUnit === symbol ? 'selected' : ''}>${symbol}</option>`
        ).join('');
    },

    /**
     * Agregar fila de ingrediente a receta
     */
    addIngredientRow(data = null) {
        const container = document.getElementById('recipeBuilder');
        const row = document.createElement('div');
        row.className = "flex gap-2 items-center pb-2 line-border";

        row.innerHTML = `
            <div class="flex-1 flex flex-col gap-1">
                <select class="text-[10px] font-bold uppercase border-none bg-transparent p-0 m-0 recipe-ing-select">
                    ${Data.ingredients.map(i => `<option value="${i.id}" ${data?.id === i.id ? 'selected' : ''}>${i.name}</option>`).join('')}
                </select>
                <select class="text-[8px] opacity-70 border-none bg-transparent p-0 m-0 recipe-ing-scope">
                    <option value="all" ${data?.scope === 'all' || !data?.scope ? 'selected' : ''}>${I18N.t('apply_to')}: ${I18N.t('both_label')}</option>
                    <option value="whole" ${data?.scope === 'whole' ? 'selected' : ''}>${I18N.t('apply_to')}: ${I18N.t('whole_only')}</option>
                    <option value="portion" ${data?.scope === 'portion' ? 'selected' : ''}>${I18N.t('apply_to')}: ${I18N.t('portion_only')}</option>
                </select>
            </div>
            <div class="flex items-center gap-1">
                <input type="number" class="w-16 text-[10px] recipe-ing-qty" placeholder="${I18N.t('qty_placeholder')}" min="0" step="0.01" value="${data?.qty || ''}">
                <select class="text-[9px] font-bold uppercase border-none bg-transparent recipe-ing-unit"></select>
            </div>
            <button type="button" onclick="this.parentElement.remove()" class="text-xs cursor-pointer hover:text-red-500 ml-2">✕</button>
        `;
        container.appendChild(row);

        const ingSelect = row.querySelector('.recipe-ing-select');
        const unitSelect = row.querySelector('.recipe-ing-unit');

        const handleChange = () => {
            this.updateCompatibleUnitOptions(ingSelect, unitSelect, data?.unit);
        };

        ingSelect.addEventListener('change', () => {
            this.updateCompatibleUnitOptions(ingSelect, unitSelect);
        });

        handleChange();
    },

    /**
     * Agregar fila de ingrediente a receta en modo edición
     */
    addEditIngredientRow(data = null) {
        const container = document.getElementById('editRecipeBuilder');
        const row = document.createElement('div');
        row.className = "flex gap-2 items-center pb-2 line-border";

        row.innerHTML = `
            <div class="flex-1 flex flex-col gap-1">
                <select class="text-[10px] font-bold uppercase border-none bg-transparent p-0 m-0 recipe-edit-ing-select">
                    ${Data.ingredients.map(i => `<option value="${i.id}" ${data?.id === i.id ? 'selected' : ''}>${i.name}</option>`).join('')}
                </select>
                <select class="text-[8px] opacity-70 border-none bg-transparent p-0 m-0 recipe-edit-ing-scope">
                    <option value="all" ${data?.scope === 'all' || !data?.scope ? 'selected' : ''}>${I18N.t('apply_to')}: ${I18N.t('both_label')}</option>
                    <option value="whole" ${data?.scope === 'whole' ? 'selected' : ''}>${I18N.t('apply_to')}: ${I18N.t('whole_only')}</option>
                    <option value="portion" ${data?.scope === 'portion' ? 'selected' : ''}>${I18N.t('apply_to')}: ${I18N.t('portion_only')}</option>
                </select>
            </div>
            <div class="flex items-center gap-1">
                <input type="number" class="w-16 text-[10px] recipe-edit-ing-qty" placeholder="${I18N.t('qty_placeholder')}" min="0" step="0.01" value="${data?.qty || ''}">
                <select class="text-[9px] font-bold uppercase border-none bg-transparent recipe-edit-ing-unit"></select>
            </div>
            <button type="button" onclick="this.parentElement.remove()" class="text-xs cursor-pointer hover:text-red-500 ml-2">✕</button>
        `;
        container.appendChild(row);

        const ingSelect = row.querySelector('.recipe-edit-ing-select');
        const unitSelect = row.querySelector('.recipe-edit-ing-unit');

        const handleChange = () => {
            this.updateCompatibleUnitOptions(ingSelect, unitSelect, data?.unit);
        };

        ingSelect.addEventListener('change', () => {
            this.updateCompatibleUnitOptions(ingSelect, unitSelect);
        });

        handleChange();
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
        const data = Data.getFullAppData();

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
