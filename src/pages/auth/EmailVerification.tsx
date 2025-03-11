import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AuthService from '../../services/auth.service';
import { Button } from '../../components/ui/Button';

export default function EmailVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'pending' | 'loading' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  const verifyEmail = async () => {
    if (!token) {
      setStatus('error');
      setMessage('Token de vérification manquant');
      return;
    }

    setStatus('loading');
    try {
      const response = await AuthService.verifyEmail(token);
      setStatus('success');
      setMessage(response.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Échec de la vérification');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-neutral-800 rounded-2xl shadow-xl text-center">
        {status === 'pending' && (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-primary-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Vérification de votre email
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300">
              Cliquez sur le bouton ci-dessous pour vérifier votre adresse email
            </p>
            <Button
              onClick={verifyEmail}
              className="w-full"
            >
              Vérifier mon email
            </Button>
          </div>
        )}

        {status === 'loading' && (
          <div className="space-y-4">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Vérification en cours...
            </h2>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-success-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Email vérifié avec succès !
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300">
              {message}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Redirection vers la page de connexion...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-error-100 dark:bg-error-900/30 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-error-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Échec de la vérification
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300">
              {message}
            </p>
            <div className="space-y-2">
              <Button
                onClick={verifyEmail}
                className="w-full"
              >
                Réessayer
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Retour à la connexion
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 