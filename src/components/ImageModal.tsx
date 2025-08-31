import React, { useState, useEffect } from 'react';

interface Producto {
  id: number;
  nombre: string;
  imagenes: string[];
}

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  producto: Producto | null;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  producto,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset index cuando cambia el producto
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [producto]);

  // Manejar teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !producto) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentImageIndex, producto]);

  // Bloquear scroll del body cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const nextImage = () => {
    if (!producto) return;
    setCurrentImageIndex((prev) => (prev + 1) % producto.imagenes.length);
  };

  const prevImage = () => {
    if (!producto) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? producto.imagenes.length - 1 : prev - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (!isOpen || !producto) return null;

  return (
    <>
      {/* Capa de blur de fondo */}
      <div className='fixed inset-0 z-40'>
        <div
          className='absolute inset-0 backdrop-blur-md bg-black bg-opacity-50'
          onClick={onClose}
        />
      </div>

      {/* Modal por encima */}
      <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
        <div
          className='relative top-36 w-full max-w-4xl h-full max-h-[90vh] bg-transparent flex-col'
          onClick={(e) => e.stopPropagation()}
        >
          {/* Contenedor de la Imagen */}
          <div className='flex-1 relative flex items-center justify-center p-4 min-h-0'>
            <div className='relative w-full h-full max-w-3xl max-h-[60vh] flex-col items-center justify-center bg-white rounded-lg'>
              {/* Header del Modal */}
              <div className='flex justify-between items-center p-2 text-gray-600'>
                <div>
                  <h3 className='text-xl font-semibold'>{producto.nombre}</h3>
                  <p className='text-sm text-black-300'>
                    {currentImageIndex + 1} de {producto.imagenes.length}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className='hover:text-gray-300 text-3xl font-bold relative bottom-3 right-1'
                >
                  ×
                </button>
              </div>
              <div className='w-full flex justify-center'>
                <img
                  src={producto.imagenes[currentImageIndex]}
                  alt={`${producto.nombre} - Vista ${currentImageIndex + 1}`}
                  className='max-w-full min-h-[400px] max-h-[400px] object-contain rounded-lg'
                />
              </div>
            </div>

            {/* Botones de Navegación */}
            {producto.imagenes.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className='absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 hover:bg-opacity-90 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all z-10'
                >
                  ‹
                </button>

                <button
                  onClick={nextImage}
                  className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 hover:bg-opacity-90 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all z-10'
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {producto.imagenes.length > 1 && (
            <div className='flex justify-center space-x-3 p-6 max-w-full overflow-x-auto bg-black bg-opacity-20 rounded-b-lg'>
              {producto.imagenes.map((imagen, index) => (
                <img
                  key={index}
                  src={imagen}
                  alt={`Vista ${index + 1}`}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-3 transition-all flex-shrink-0 ${
                    index === currentImageIndex
                      ? 'border-turquoise-400 shadow-lg scale-110'
                      : 'border-white/50 hover:border-turquoise-300 hover:scale-105'
                  }`}
                  onClick={() => goToImage(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ImageModal;
