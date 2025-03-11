import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import AuthService from '../../services/auth.service';

export default function RequestPasswordReset() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Veuillez entrer votre adresse e-mail');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await AuthService.requestPasswordReset(email);
      setSuccess(true);
    } catch (error: unknown) {
      const apiError = error as {
        response?: {
          data?: {
            error?: {
              message?: string;
            }
          }
        }
      };
      setError(apiError.response?.data?.error?.message || 'Une erreur est survenue lors de la demande de réinitialisation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-neutral-800 rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Réinitialisation du mot de passe
          </h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">
            Veuillez entrer votre adresse e-mail pour recevoir un lien de réinitialisation
          </p>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-6">
            <div className="p-4 text-sm text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 rounded-lg">
              Si l'adresse e-mail existe dans notre système, vous recevrez un e-mail avec les instructions pour réinitialiser votre mot de passe.
            </div>
            <div className="text-center">
              <Link 
                to="/login" 
                className="inline-block text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Retour à la page de connexion
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-200"
              >
                Adresse e-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Envoyer le lien de réinitialisation
            </Button>

            <div className="text-center">
              <Link 
                to="/login" 
                className="inline-block text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Retour à la page de connexion
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 