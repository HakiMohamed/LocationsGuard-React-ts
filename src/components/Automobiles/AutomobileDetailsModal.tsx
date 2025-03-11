import React, { useState } from 'react';
import { Automobile } from '../../types/automobile.types';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

interface AutomobileDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  automobile: Automobile | undefined;
}

const AutomobileDetailsModal: React.FC<AutomobileDetailsModalProps> = ({ isOpen, onClose, automobile }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  if (!automobile) return null;
  
  const images = automobile.images || [];
  
  const handleClose = () => {
    setCurrentImageIndex(0);
    setIsFullscreen(false);
    onClose();
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      {/* Fullscreen Carousel */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Close button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsFullscreen(false);
            }}
            className="absolute top-4 right-4 z-50 text-white hover:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous button */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:text-gray-300 bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next button */}
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:text-gray-300 bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full">
            {currentImageIndex + 1} / {images.length}
          </div>

          {/* Main image */}
          <div 
            className="w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[currentImageIndex]}
              alt={`${automobile.brand} ${automobile.model} - ${currentImageIndex + 1}`}
              className="max-h-screen max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={handleClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl  transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 border-b pb-3 mb-4">
                    {automobile.brand} {automobile.model} ({automobile.year})
                  </Dialog.Title>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Image Slider */}
                    <div className="relative rounded-lg overflow-hidden bg-gray-100 h-64 md:h-80 group">
                      {images.length > 0 ? (
                        <>
                          <img 
                            src={images[currentImageIndex]} 
                            alt={`${automobile.brand} ${automobile.model}`} 
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setIsFullscreen(true)}
                          />
                          <button
                            onClick={() => setIsFullscreen(true)}
                            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                            </svg>
                          </button>
                          {images.length > 1 && (
                            <>
                              <button 
                                onClick={prevImage}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <button 
                                onClick={nextImage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
                                {images.map((_, index) => (
                                  <button 
                                    key={index}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCurrentImageIndex(index);
                                    }}
                                    className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="ml-2">Aucune image disponible</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Details */}
                    <div className="space-y-3 overflow-y-auto max-h-80">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-500 font-medium">Catégorie</p>
                          <p className="text-gray-800">{automobile.category.name || 'N/A'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-500 font-medium">Tarif journalier</p>
                          <p className="text-gray-800 font-bold">{automobile.dailyRate} DH</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-500 font-medium">Carburant</p>
                          <p className="text-gray-800">{automobile.fuelType}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-500 font-medium">Transmission</p>
                          <p className="text-gray-800">{automobile.transmission}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-500 font-medium">Sièges</p>
                          <p className="text-gray-800">{automobile.seats}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-500 font-medium">Disponibilité</p>
                          <p className={`${automobile.isAvailable ? 'text-green-600' : 'text-red-600'} font-medium`}>
                            {automobile.isAvailable ? 'Disponible' : 'Indisponible'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 font-medium">Immatriculation</p>
                        <p className="text-gray-800">{automobile.licensePlate}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 font-medium">Kilométrage</p>
                        <p className="text-gray-800">{automobile.mileage} km</p>
                      </div>
                      
                      {automobile.color && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-500 font-medium">Couleur</p>
                          <p className="text-gray-800">{automobile.color}</p>
                        </div>
                      )}
                      
                      {automobile.engineCapacity && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-500 font-medium">Cylindrée</p>
                          <p className="text-gray-800">{automobile.engineCapacity} cc</p>
                        </div>
                      )}
                      
                      {automobile.fuelConsumption && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-500 font-medium">Consommation</p>
                          <p className="text-gray-800">{automobile.fuelConsumption} L/100km</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Features and Description */}
                  <div className="mt-6 space-y-4">
                    {automobile.features && automobile.features.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">Caractéristiques</h4>
                        <div className="flex flex-wrap gap-2">
                          {automobile.features.map((feature, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {automobile.description && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                        <p className="text-gray-600">{automobile.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors"
                      onClick={handleClose}
                    >
                      Fermer
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default AutomobileDetailsModal;