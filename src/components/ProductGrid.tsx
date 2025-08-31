import React, { useState } from 'react';
import ImageModal from './ImageModal';

interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  imagenes: string[];
  descripcion: string;
  caracteristicas: string[];
}

interface ProductGridProps {
  productos: Producto[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ productos }) => {
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  const getProductIcon = (categoria: string) => {
    const icons: { [key: string]: string } = {
      'auriculares': '🎧',
      'parlantes': '🔊',
      'smartwatch': '⌚',
      'cargadores': '🔌',
      'usb': '🔗'
    };
    return icons[categoria] || '📦';
  };

  const openImageModal = (producto: Producto) => {
    setSelectedProduct(producto);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const addToCart = (producto: Producto, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Acceder al cartStore desde window
    const cartStore = (window as any).cartStore;
    if (cartStore) {
      cartStore.addProduct(producto);
    }
    
    // Feedback visual
    const button = event.target as HTMLButtonElement;
    const originalText = button.textContent;
    button.textContent = '✓ Agregado';
    button.classList.add('bg-green-600');
    
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('bg-green-600');
    }, 1000);
  };

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {productos.map((producto) => (
          <div 
            key={producto.id}
            className="producto-card bg-dark-700 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 border border-dark-600 flex flex-col"
            data-categoria={producto.categoria}
          >
            {/* Imagen de Portada */}
            <div 
              className="h-full md:h-56 lg:h-64 bg-gradient-to-br from-dark-600 to-dark-700 relative overflow-hidden group cursor-pointer"
              onClick={() => openImageModal(producto)}
            >
              {producto.imagenes && producto.imagenes.length > 0 ? (
                <>
                  <img 
                    src={producto.imagenes[0]} 
                    alt={producto.nombre}
                    className="product-image w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Indicador de múltiples imágenes */}
                  {producto.imagenes.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                      <span>📷</span>
                      <span>{producto.imagenes.length}</span>
                    </div>
                  )}
                  {/* Overlay hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                    </div>
                  </div>
                </>
              ) : (
                /* Fallback icon si no hay imágenes */
                <div className="fallback-icon w-20 h-20 bg-gradient-to-r from-turquoise-500 to-green-modern-500 rounded-lg flex items-center justify-center absolute inset-0 m-auto">
                  <span className="text-white text-3xl">{getProductIcon(producto.categoria)}</span>
                </div>
              )}
            </div>
            
            {/* Contenido */}
            <div className="p-6 flex flex-col h-[20rem]">
              <h3 className="text-lg font-semibold text-gray-100 mb-2">{producto.nombre}</h3>
              <p className="text-gray-300 text-sm mb-3 line-clamp-2 flex-grow">{producto.descripcion}</p>
              
              {/* Características */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {producto.caracteristicas.slice(0, 2).map((caracteristica, index) => (
                    <span 
                      key={index}
                      className="text-xs bg-turquoise-100 text-turquoise-700 px-2 py-1 rounded"
                    >
                      {caracteristica}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Precio */}
              <div className="mb-4">
                <div className="text-2xl font-bold text-turquoise-400">
                  {formatPrice(producto.precio)}
                </div>
              </div>
              
              {/* Botón */}
              <button 
                className="w-full bg-gradient-to-r from-turquoise-500 to-green-modern-500 text-white px-4 py-3 rounded-lg text-xl font-medium hover:from-turquoise-600 hover:to-green-modern-600 transition-all transform hover:scale-105"
                onClick={(e) => addToCart(producto, e)}
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Imágenes */}
      <ImageModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        producto={selectedProduct}
      />
    </>
  );
};

export default ProductGrid;
