import { BeakerIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface ComingSoonProps {
  title: string;
  description?: string;
}

const ComingSoon = ({ title, description = "Cette fonctionnalité sera bientôt disponible." }: ComingSoonProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4 animate-pulse">
          <BeakerIcon className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 max-w-md mx-auto mb-8">{description}</p>
        
        {/* Indicateur de construction */}
        <div className="w-full max-w-md mx-auto">
          <div className="relative pt-1">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <WrenchScrewdriverIcon className="w-5 h-5 text-indigo-600 animate-spin" />
              <span className="text-sm font-medium text-indigo-600">
                En construction
              </span>
            </div>
            
            {/* Timeline de développement */}
            <div className="space-y-4">
              <div className={`flex items-center space-x-3 transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">Analyse des besoins</span>
              </div>
              <div className={`flex items-center space-x-3 transition-all duration-500 delay-100 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">Conception de l'interface</span>
              </div>
              <div className={`flex items-center space-x-3 transition-all duration-500 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                <span className="text-sm text-gray-600">Développement en cours</span>
              </div>
              <div className={`flex items-center space-x-3 transition-all duration-500 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <span className="text-sm text-gray-400">Tests et déploiement</span>
              </div>
            </div>

            {/* Message de disponibilité */}
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <p className="text-sm text-indigo-600">
                Cette fonctionnalité sera disponible dans les prochaines semaines. Restez à l'écoute !
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon; 