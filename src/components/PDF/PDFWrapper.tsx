import React, { useState } from 'react';
import { Reservation } from '../../types/reservation.types';
import { reservationService } from '../../services/reservation.service';
import { toast } from 'react-hot-toast';

interface PDFWrapperProps {
  reservation: Reservation;
}

const PDFWrapper: React.FC<PDFWrapperProps> = ({ reservation }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const response = await reservationService.getContract(reservation._id);
      
      // Vérifier si la réponse est valide
      if (!response || !(response instanceof Blob)) {
        throw new Error('Réponse invalide du serveur');
      }

      // Vérifier le type MIME
      if (response.type !== 'application/pdf') {
        console.error('Type de fichier reçu:', response.type);
        throw new Error('Le fichier reçu n\'est pas un PDF');
      }

      // Créer une URL pour le blob
      const url = window.URL.createObjectURL(response);
      
      // Ouvrir le PDF dans un nouvel onglet au lieu de le télécharger
      window.open(url, '_blank');
      
      // Nettoyer l'URL après un court délai
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success('Contrat ouvert avec succès');
    } catch (error) {
      console.error('Erreur détaillée:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'ouverture du contrat');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isLoading}
      className="text-green-600 hover:text-green-900 bg-green-50 p-1.5 rounded-md transition-colors disabled:opacity-50"
      title="Voir le contrat"
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
};

export default PDFWrapper; 