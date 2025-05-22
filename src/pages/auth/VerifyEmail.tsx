import { useLocation, Navigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useState } from 'react';
import AuthService from '../../services/auth.service';

export default function VerifyEmail() {
  const location = useLocation();
  const email = location.state?.email;
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  if (!email) {
    return <Navigate to="/register" replace />;
  }

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      await AuthService.resendVerificationEmail(email);
      setResendMessage('Verification email has been resent successfully!');
    } catch (error) {
      setResendMessage('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-neutral-800 rounded-2xl shadow-xl text-center">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-8 h-8 text-primary-600"
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

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Verify your email
          </h2>
          <p className="text-neutral-600 dark:text-neutral-300">
            We've sent a verification email to:
          </p>
          <p className="font-medium text-neutral-900 dark:text-white">{email}</p>
          <p className="text-neutral-600 dark:text-neutral-300">
            Please check your email and click on the verification link to continue.
          </p>
        </div>

        {resendMessage && (
          <div className="p-4 text-sm bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg">
            {resendMessage}
          </div>
        )}

        <div className="pt-4">
          <Button
            variant="outline"
            onClick={handleResendEmail}
            isLoading={isResending}
            className="w-full text-white"
          >
            Resend verification email
          </Button>
        </div>
      </div>
    </div>
  );
} 