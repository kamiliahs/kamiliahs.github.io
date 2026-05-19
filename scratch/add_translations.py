import re

missing = {
    'es': [
        "add_at_least_one: 'Añade al menos un ingrediente',",
        "confirm_checkout: '¿Confirmar venta de',",
        "confirm_delete_ingredient: '¿Eliminar este insumo?',",
        "confirm_delete_recipe: '¿Eliminar esta receta?',",
        "cost_updated: 'COSTO ACTUALIZADO',",
        "detail_btn: 'Detalles',",
        "empty_cart: 'Carrito vacío',",
        "error_label: 'ERROR',",
        "ingredient_deleted: 'INSUMO ELIMINADO',",
        "ingredient_saved: 'INSUMO GUARDADO',",
        "ingredient_updated: 'INSUMO ACTUALIZADO',",
        "in_this_shift: 'en este turno',",
        "invalid_cost: 'Costo inválido',",
        "invalid_price: 'Precio inválido',",
        "name_required: 'El nombre es obligatorio',",
        "no_orders_found: 'No se encontraron pedidos',",
        "no_shift_history: 'No hay historial de turnos',",
        "recipe_created: 'RECETA CREADA',",
        "recipe_created_copy: 'RECETA CREADA (COPIA)',",
        "recipe_deleted: 'RECETA ELIMINADA',",
        "recipe_label: 'RECETA',",
        "recipe_updated: 'RECETA ACTUALIZADA',",
        "sale_label: 'venta',",
        "settings_saved: 'CONFIGURACIÓN GUARDADA',",
        "transaction_completed: 'TRANSACCIÓN COMPLETADA',",
        "whole_label: 'Entero',"
    ],
    'en': [
        "add_at_least_one: 'Add at least one ingredient',",
        "confirm_checkout: 'Confirm checkout of',",
        "confirm_delete_ingredient: 'Delete this ingredient?',",
        "confirm_delete_recipe: 'Delete this recipe?',",
        "cost_updated: 'COST UPDATED',",
        "detail_btn: 'Details',",
        "empty_cart: 'Empty cart',",
        "error_label: 'ERROR',",
        "ingredient_deleted: 'INGREDIENT DELETED',",
        "ingredient_saved: 'INGREDIENT SAVED',",
        "ingredient_updated: 'INGREDIENT UPDATED',",
        "in_this_shift: 'in this shift',",
        "invalid_cost: 'Invalid cost',",
        "invalid_price: 'Invalid price',",
        "name_required: 'Name is required',",
        "no_orders_found: 'No orders found',",
        "no_shift_history: 'No shift history',",
        "recipe_created: 'RECIPE CREATED',",
        "recipe_created_copy: 'RECIPE CREATED (COPY)',",
        "recipe_deleted: 'RECIPE DELETED',",
        "recipe_label: 'RECIPE',",
        "recipe_updated: 'RECIPE UPDATED',",
        "sale_label: 'sale',",
        "settings_saved: 'SETTINGS SAVED',",
        "transaction_completed: 'TRANSACTION COMPLETED',",
        "whole_label: 'Whole',"
    ],
    'nl': [
        "add_at_least_one: 'Voeg minstens één ingrediënt toe',",
        "confirm_checkout: 'Bevestig afrekenen van',",
        "confirm_delete_ingredient: 'Dit ingrediënt verwijderen?',",
        "confirm_delete_recipe: 'Dit recept verwijderen?',",
        "cost_updated: 'KOSTEN BIJGEWERKT',",
        "detail_btn: 'Details',",
        "empty_cart: 'Lege winkelwagen',",
        "error_label: 'FOUT',",
        "ingredient_deleted: 'INGREDIËNT VERWIJDERD',",
        "ingredient_saved: 'INGREDIËNT OPGESLAGEN',",
        "ingredient_updated: 'INGREDIËNT BIJGEWERKT',",
        "in_this_shift: 'in deze dienst',",
        "invalid_cost: 'Ongeldige kosten',",
        "invalid_price: 'Ongeldige prijs',",
        "name_required: 'Naam is verplicht',",
        "no_orders_found: 'Geen bestellingen gevonden',",
        "no_shift_history: 'Geen dienstengeschiedenis',",
        "recipe_created: 'RECEPT AANGEMAAKT',",
        "recipe_created_copy: 'RECEPT AANGEMAAKT (KOPIE)',",
        "recipe_deleted: 'RECEPT VERWIJDERD',",
        "recipe_label: 'RECEPT',",
        "recipe_updated: 'RECEPT BIJGEWERKT',",
        "sale_label: 'verkoop',",
        "settings_saved: 'INSTELLINGEN OPGESLAGEN',",
        "transaction_completed: 'TRANSACTIE VOLTOOID',",
        "whole_label: 'Heel',"
    ],
    'fr': [
        "add_at_least_one: 'Ajouter au moins un ingrédient',",
        "confirm_checkout: 'Confirmer la vente de',",
        "confirm_delete_ingredient: 'Supprimer cet ingrédient ?',",
        "confirm_delete_recipe: 'Supprimer cette recette ?',",
        "cost_updated: 'COÛT MIS À JOUR',",
        "detail_btn: 'Détails',",
        "empty_cart: 'Panier vide',",
        "error_label: 'ERREUR',",
        "ingredient_deleted: 'INGRÉDIENT SUPPRIMÉ',",
        "ingredient_saved: 'INGRÉDIENT ENREGISTRÉ',",
        "ingredient_updated: 'INGRÉDIENT MIS À JOUR',",
        "in_this_shift: 'dans ce service',",
        "invalid_cost: 'Coût invalide',",
        "invalid_price: 'Prix invalide',",
        "name_required: 'Le nom est obligatoire',",
        "no_orders_found: 'Aucune commande trouvée',",
        "no_shift_history: 'Aucun historique de service',",
        "recipe_created: 'RECETTE CRÉÉE',",
        "recipe_created_copy: 'RECETTE CRÉÉE (COPIE)',",
        "recipe_deleted: 'RECETTE SUPPRIMÉE',",
        "recipe_label: 'RECETTE',",
        "recipe_updated: 'RECETTE MISE À JOUR',",
        "sale_label: 'vente',",
        "settings_saved: 'PARAMÈTRES ENREGISTRÉS',",
        "transaction_completed: 'TRANSACTION TERMINÉE',",
        "whole_label: 'Entier',"
    ]
}

with open('src/js/modules/i18n.js', 'r') as f:
    content = f.read()

for lang, translations in missing.items():
    search_word = 'Portugués' if lang == 'es' else 'Portuguese' if lang == 'en' else 'Portugees' if lang == 'nl' else 'Portugais'
    search_str = f"lang_pt: '{search_word}'"
    replacement = f"{search_str},\n            " + "\n            ".join(translations)
    content = content.replace(search_str, replacement)

with open('src/js/modules/i18n.js', 'w') as f:
    f.write(content)

print('Translations added.')
