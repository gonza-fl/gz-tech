// Store simple para el carrito de compras
export class CartStore {
  constructor() {
    this.cart = this.loadFromStorage();
    this.listeners = [];
  }

  // Cargar carrito desde localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('gztech-cart');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error al cargar carrito:', error);
      return [];
    }
  }

  // Guardar carrito en localStorage
  saveToStorage() {
    try {
      localStorage.setItem('gztech-cart', JSON.stringify(this.cart));
      this.notifyListeners();
    } catch (error) {
      console.error('Error al guardar carrito:', error);
    }
  }

  // Agregar producto al carrito
  addProduct(product) {
    const existingItem = this.cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.cantidad += 1;
    } else {
      this.cart.push({
        ...product,
        cantidad: 1
      });
    }
    
    this.saveToStorage();
    return true;
  }

  // Remover producto del carrito
  removeProduct(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveToStorage();
  }

  // Actualizar cantidad de un producto
  updateQuantity(productId, quantity) {
    const item = this.cart.find(item => item.id === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeProduct(productId);
      } else {
        item.cantidad = quantity;
        this.saveToStorage();
      }
    }
  }

  // Obtener productos del carrito
  getCart() {
    return [...this.cart];
  }

  // Obtener cantidad total de productos
  getTotalItems() {
    return this.cart.reduce((total, item) => total + item.cantidad, 0);
  }

  // Obtener precio total
  getTotalPrice() {
    return this.cart.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }

  // Limpiar carrito
  clearCart() {
    this.cart = [];
    this.saveToStorage();
  }

  // Suscribirse a cambios del carrito
  subscribe(callback) {
    this.listeners.push(callback);
  }

  // Notificar a los listeners
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.cart));
  }

  // Generar mensaje para WhatsApp
  generateWhatsAppMessage() {
    if (this.cart.length === 0) {
      return '';
    }

    let message = '🛒 *Pedido GZ Tech*\n\n';
    
    this.cart.forEach(item => {
      const subtotal = item.precio * item.cantidad;
      message += `• ${item.nombre}\n`;
      message += `  Cantidad: ${item.cantidad}\n`;
      message += `  Precio: $${item.precio.toLocaleString('es-AR')}\n`;
      message += `  Subtotal: $${subtotal.toLocaleString('es-AR')}\n\n`;
    });

    const total = this.getTotalPrice();
    message += `💰 *Total: $${total.toLocaleString('es-AR')}*\n\n`;
    message += '¡Gracias por elegir GZ Tech! 🎧🔊⌚';

    return encodeURIComponent(message);
  }
}

// Instancia global del carrito
export const cartStore = new CartStore();
