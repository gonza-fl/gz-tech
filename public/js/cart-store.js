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
    const existingItem = this.cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.cantidad += 1;
    } else {
      this.cart.push({
        ...product,
        cantidad: 1,
      });
    }

    this.saveToStorage();
    return true;
  }

  // Remover producto del carrito
  removeProduct(productId) {
    this.cart = this.cart.filter((item) => item.id !== productId);
    this.saveToStorage();
  }

  // Actualizar cantidad de un producto
  updateQuantity(productId, quantity) {
    const item = this.cart.find((item) => item.id === productId);
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
    return this.cart.reduce(
      (total, item) => total + item.precio * item.cantidad,
      0
    );
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
    this.listeners.forEach((callback) => callback(this.cart));
  }

  // Generar mensaje para WhatsApp
  generateWhatsAppMessage() {
    if (!this.cart || this.cart.length === 0) return '';

    // Formatters
    const fmt = new Intl.NumberFormat('es-AR');
    const money = (n) => `$${fmt.format(n)}`;

    // Pedido ID (fecha y hora local)
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const orderId = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
      now.getDate()
    )}-${pad(now.getHours())}${pad(now.getMinutes())}`;

    // Encabezado
    let msg = `🛒 *Consulta de Pedido - GZ Tech*\n`;
    msg += `ID: \`${orderId}\`\n`;
    msg += `────────────────────\n`;
    msg += `Hola, quiero consultar y confirmar este pedido:\n\n`;

    // Items
    let lines = [];
    let runningTotal = 0;

    for (const item of this.cart) {
      const qty = Number(item.cantidad || 1);
      const price = Number(item.precio || 0);
      const subtotal = price * qty;
      runningTotal += subtotal;

      lines.push(
        `📦 *${item.nombre}*\n` +
          `Cantidad: ${qty}  ·  Precio: ${money(price)}\n` +
          `Subtotal: ${money(subtotal)}\n`
      );
    }

    // Si el mensaje se vuelve muy largo, recortar y avisar
    // (WhatsApp empieza a fallar con textos demasiado grandes)
    const MAX_CHARS = 3000;
    let body = lines.join('\n');

    if ((msg + body).length > MAX_CHARS) {
      // Mantener los primeros N items que entren y resumir el resto
      let trimmed = '';
      let shown = 0;
      for (const line of lines) {
        if ((msg + trimmed + line).length > MAX_CHARS - 200) break; // dejar espacio para el resumen/final
        trimmed += line + '\n';
        shown++;
      }
      const hidden = lines.length - shown;
      body = trimmed + `… y ${hidden} producto(s) más.\n`;
    }

    msg += body;
    msg += `────────────────────\n`;
    msg += `💵 *TOTAL: ${money(runningTotal)}*\n\n`;

    // Sección para que el cliente complete
    msg += `🧾 *Datos para agilizar la atención* (completá acá mismo)\n`;
    msg += `• Nombre y Apellido: _…_\n`;
    msg += `• Localidad/Zona: _…_\n`;
    msg += `• Método de pago (Efectivo/Transferencia/Otro): _…_\n`;
    msg += `• ¿Retiro en punto o Envío a domicilio?: _…_\n`;
    msg += `• Dirección (si envío): _…_\n`;
    msg += `• Observaciones: _…_\n\n`;

    // Cierre de experiencia
    msg += `🙌 *Un asesor te responde a la brevedad para confirmar stock, forma de pago y entrega.*\n`;
    msg += `¡Gracias por elegir GZ Tech! 🎧📱⚡`;

    return encodeURIComponent(msg);
  }
}

// Instancia global del carrito
export const cartStore = new CartStore();
