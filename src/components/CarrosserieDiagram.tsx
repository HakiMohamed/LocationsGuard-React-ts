import React, { useState, useEffect } from 'react';

interface CarrosserieDiagramProps {
  onMarkDamage: (x: number, y: number) => void;
  damages: Array<{ x: number, y: number }>;
}

const CarrosserieDiagram: React.FC<CarrosserieDiagramProps> = ({ onMarkDamage, damages }) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef) {
      const updateWidth = () => {
        setContainerWidth(containerRef.clientWidth);
      };

      // Initial width
      updateWidth();

      // Update width on resize
      const resizeObserver = new ResizeObserver(updateWidth);
      resizeObserver.observe(containerRef);

      // Clean up
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [containerRef]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef) return;
    
    const rect = containerRef.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate percentages for responsive positioning
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    
    onMarkDamage(xPercent, yPercent);
  };

  return (
    <div 
      className="w-full h-full"
      ref={setContainerRef}
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h4 className="font-medium text-gray-800 text-sm md:text-base">Marquage des dommages</h4>
        </div>
        
        <div 
          className="relative flex-grow p-2 md:p-4 cursor-crosshair"
          onClick={handleClick}
        >
          <div className="relative h-full">
            <img 
              src="/src/assets/images/EtatDeCarroserie.png" 
              alt="Diagramme carrosserie" 
              className="w-full h-full object-contain"
            />
            
            {damages.map((damage, index) => (
              <div
                key={index}
                className="absolute w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-md z-10"
                style={{ 
                  left: `${damage.x}%`, 
                  top: `${damage.y}%`,
                  // Pulsating effect
                  animation: 'pulse 1.5s infinite ease-in-out'
                }}
              >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <p className="text-xs md:text-sm text-gray-500 text-center">
            Cliquez sur le schéma pour marquer les dommages
          </p>
        </div>
      </div>
      
      {/* Add some CSS for the pulsating animation */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(0.95) translate(-50%, -50%);
          }
          70% {
            transform: scale(1.05) translate(-50%, -50%);
          }
          100% {
            transform: scale(0.95) translate(-50%, -50%);
          }
        }
      `}</style>
    </div>
  );
};

export default CarrosserieDiagram;