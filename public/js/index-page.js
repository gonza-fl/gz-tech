import { cartStore } from './cart-store.js';

// Exponer cartStore globalmente para el componente React
window.cartStore = cartStore;

// Filtros de productos
const filterButtons = document.querySelectorAll('.filter-btn');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.getAttribute('data-filter');

    // Actualizar botones activos
    filterButtons.forEach((btn) => {
      btn.classList.remove('active', 'bg-turquoise-500', 'text-white');
      btn.classList.add('bg-dark-600', 'text-gray-300');
    });

    button.classList.add('active', 'bg-turquoise-500', 'text-white');
    button.classList.remove('bg-dark-600', 'text-gray-300');

    // Filtrar productos
    const productCards = document.querySelectorAll('.producto-card');
    productCards.forEach((card) => {
      const categoria = card.getAttribute('data-categoria');
      if (filter === 'todos' || categoria === filter) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// Funciones del carrito
function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  const totalItems = cartStore.getTotalItems();

  if (totalItems > 0) {
    badge.textContent = totalItems;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

// Inicializar badge al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();

  // Suscribirse a cambios del carrito
  cartStore.subscribe(() => {
    updateCartBadge();
  });
});
