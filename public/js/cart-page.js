import { cartStore } from './cart-store.js';

// Elementos del DOM
const emptyCart = document.getElementById('empty-cart');
const cartContent = document.getElementById('cart-content');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartBadge = document.getElementById('cart-badge');
const clearCartBtn = document.getElementById('clear-cart');
const checkoutBtn = document.getElementById('checkout-whatsapp');

// Elementos del modal
const confirmModal = document.getElementById('confirm-modal');
const cancelClearBtn = document.getElementById('cancel-clear');
const confirmClearBtn = document.getElementById('confirm-clear');

// Función para formatear precio
function formatPrice(price) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(price);
}

// Función para crear elemento de producto en el carrito
function createCartItemElement(item) {
  const subtotal = item.precio * item.cantidad;

  return `
      <div class="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <!-- Icono del producto -->
        <div class="w-16 h-16 bg-gradient-to-r from-turquoise-500 to-green-modern-500 rounded-lg flex items-center justify-center flex-shrink-0">
          ${getProductIcon(item.categoria)}
        </div>
        
        <!-- Información del producto -->
        <div class="flex-grow">
          <h3 class="font-semibold text-gray-100">${item.nombre}</h3>
          <p class="text-sm text-gray-300">${item.descripcion}</p>
          <p class="text-turquoise-400 font-medium">${formatPrice(
            item.precio
          )} c/u</p>
        </div>
        
        <!-- Controles de cantidad -->
        <div class="flex items-center gap-3">
          <button class="quantity-btn bg-dark-600 hover:bg-dark-500 text-gray-300 w-8 h-8 rounded-full flex items-center justify-center transition-colors" 
                  data-action="decrease" data-id="${item.id}">-</button>
          <span class="w-8 text-center font-semibold text-gray-100">${
            item.cantidad
          }</span>
          <button class="quantity-btn bg-dark-600 hover:bg-dark-500 text-gray-300 w-8 h-8 rounded-full flex items-center justify-center transition-colors" 
                  data-action="increase" data-id="${item.id}">+</button>
        </div>
        
        <!-- Subtotal y eliminar -->
        <div class="flex flex-col items-end gap-2">
          <div class="text-lg font-bold text-gray-100">${formatPrice(
            subtotal
          )}</div>
          <button class="remove-item text-red-400 hover:text-red-300 text-sm transition-colors" data-id="${
            item.id
          }">
            🗑️ Eliminar
          </button>
        </div>
      </div>
    `;
}

// Función para obtener icono por categoría
function getProductIcon(categoria) {
  const icons = {
    auriculares: '<span class="text-white text-2xl">🎧</span>',
    parlantes: '<span class="text-white text-2xl">🔊</span>',
    smartwatch: '<span class="text-white text-2xl">⌚</span>',
    cargadores: '<span class="text-white text-2xl">🔌</span>',
    usb: '<span class="text-white text-2xl">🔗</span>',
  };
  return icons[categoria] || '<span class="text-white text-2xl">📦</span>';
}

// Función para actualizar la vista del carrito
function updateCartView() {
  const cart = cartStore.getCart();
  const totalItems = cartStore.getTotalItems();
  const totalPrice = cartStore.getTotalPrice();

  // Actualizar badge
  if (totalItems > 0) {
    cartBadge.textContent = totalItems;
    cartBadge.classList.remove('hidden');
  } else {
    cartBadge.classList.add('hidden');
  }

  if (cart.length === 0) {
    // Mostrar carrito vacío
    emptyCart.classList.remove('hidden');
    cartContent.classList.add('hidden');
  } else {
    // Mostrar productos
    emptyCart.classList.add('hidden');
    cartContent.classList.remove('hidden');

    // Renderizar productos
    cartItems.innerHTML = cart
      .map((item) => createCartItemElement(item))
      .join('');

    // Actualizar total
    cartTotal.textContent = formatPrice(totalPrice);
  }
}

// Manejar clicks en el carrito
document.addEventListener('click', (e) => {
  // Botones de cantidad
  if (e.target.classList.contains('quantity-btn')) {
    const action = e.target.getAttribute('data-action');
    const productId = parseInt(e.target.getAttribute('data-id'));
    const cart = cartStore.getCart();
    const item = cart.find((item) => item.id === productId);

    if (item) {
      if (action === 'increase') {
        cartStore.updateQuantity(productId, item.cantidad + 1);
      } else if (action === 'decrease') {
        cartStore.updateQuantity(productId, Math.max(0, item.cantidad - 1));
      }
      updateCartView();
    }
  }

  // Eliminar producto
  if (e.target.classList.contains('remove-item')) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    cartStore.removeProduct(productId);
    updateCartView();
  }
});

// Funciones del modal
function showConfirmModal() {
  confirmModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden'; // Prevenir scroll
}

function hideConfirmModal() {
  confirmModal.classList.add('hidden');
  document.body.style.overflow = 'auto'; // Restaurar scroll
}

// Vaciar carrito
clearCartBtn.addEventListener('click', () => {
  showConfirmModal();
});

// Eventos del modal
cancelClearBtn.addEventListener('click', () => {
  hideConfirmModal();
});

confirmClearBtn.addEventListener('click', () => {
  cartStore.clearCart();
  updateCartView();
  hideConfirmModal();
});

// Cerrar modal al hacer click en el overlay
confirmModal.addEventListener('click', (e) => {
  if (e.target === confirmModal) {
    hideConfirmModal();
  }
});

// Enviar por WhatsApp
checkoutBtn.addEventListener('click', () => {
  const WHATSAPP_NUMBER = checkoutBtn.dataset.whatsapp;
  const cart = cartStore.getCart();
  if (cart.length === 0) {
    alert('Tu carrito está vacío');
    return;
  }

  const message = cartStore.generateWhatsAppMessage();
  // const encoded = encodeURIComponent(message);

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  // En móvil, wa.me anda perfecto; en desktop, api.whatsapp.com suele prellenar bien
  const base = isMobile ? 'https://wa.me' : 'https://api.whatsapp.com/send';

  const whatsappUrl = isMobile
    ? `${base}/${WHATSAPP_NUMBER}?text=${message}`
    : `${base}?phone=${WHATSAPP_NUMBER}&text=${message}`;
  //  `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  // Abrir WhatsApp
  window.open(whatsappUrl, '_blank');

  // Opcional: limpiar carrito después de enviar
  setTimeout(() => {
    cartStore.clearCart();
    updateCartView();
  }, 1000);
});

// Inicializar vista al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  updateCartView();

  // Suscribirse a cambios del carrito
  cartStore.subscribe(() => {
    updateCartView();
  });
});
