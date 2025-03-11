import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { useNavigate, Link } from 'react-router-dom';
import { PhoneInput } from 'react-international-phone';
import { z } from 'zod';
import { CheckCircle, XCircle, AlertCircle, User, Mail, Lock } from 'lucide-react';
import 'react-international-phone/style.css';

// Schéma de validation
const registerSchema = z.object({
  firstName: z.string().min(3, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(3, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("L'adresse email n'est pas valide"),
  phoneNumber: z.string().max(17, "Le numéro de téléphone n'est pas valide"),
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ValidationStatus = 'default' | 'error' | 'warning' | 'success';

type Step = {
  id: number;
  title: string;
  icon: React.ReactNode;
  fields: string[];
};

const steps: Step[] = [
  {
    id: 1,
    title: "Informations personnelles",
    icon: <User className="w-6 h-6" />,
    fields: ['firstName', 'lastName']
  },
  {
    id: 2,
    title: "Coordonnées",
    icon: <Mail className="w-6 h-6" />,
    fields: ['email', 'phoneNumber']
  },
  {
    id: 3,
    title: "Sécurité",
    icon: <Lock className="w-6 h-6" />,
    fields: ['password', 'confirmPassword']
  }
];

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [validationStatus, setValidationStatus] = useState<Record<string, ValidationStatus>>({
    firstName: 'default',
    lastName: 'default',
    email: 'default',
    phoneNumber: 'default',
    password: 'default',
    confirmPassword: 'default'
  });

  const getFieldStatus = (value: string, name: string): ValidationStatus => {
    if (!value) return 'default';

    switch (name) {
      case 'firstName':
        return value.length >= 3 ? 'success' : 'error';
      
      case 'lastName':
        return value.length >= 3 ? 'success' : 'error';
      
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'success' : 'error';
      
      case 'phoneNumber':
        return value.length >= 8 && value.length <= 17 ? 'success' : 'error';
      
      case 'password':
        if (value.length < 6) return 'error';
        if (value.length >= 6 && value.length < 8) return 'warning';
        if (value.length >= 8 && !/[A-Z]/.test(value)) return 'warning';
        if (value.length >= 8 && /[A-Z]/.test(value) && !/[0-9]/.test(value)) return 'warning';
        if (value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value)) return 'success';
        return 'error';
      
      case 'confirmPassword':
        return value === formData.password ? 'success' : 'error';
      
      default:
        return 'default';
    }
  };

  const validateField = (name: string, value: string) => {
    const status = getFieldStatus(value, name);
    setValidationStatus(prev => ({ ...prev, [name]: status }));
    
    switch (name) {
      case 'firstName':
        if (value.length < 3) {
          setErrors(prev => ({ ...prev, [name]: "Le prénom doit contenir au moins 2 caractères" }));
        } else {
          setErrors(prev => ({ ...prev, [name]: '' }));
        }
        break;
      
      case 'lastName':
        if (value.length < 3) {
          setErrors(prev => ({ ...prev, [name]: "Le nom doit contenir au moins 2 caractères" }));
        } else {
          setErrors(prev => ({ ...prev, [name]: '' }));
        }
        break;
      
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          setErrors(prev => ({ ...prev, [name]: "L'adresse email n'est pas valide" }));
        } else {
          setErrors(prev => ({ ...prev, [name]: '' }));
        }
        break;
      
      case 'phoneNumber':
        if (value.length < 8 || value.length > 17) {
          setErrors(prev => ({ ...prev, [name]: "Le numéro de téléphone n'est pas valide" }));
        } else {
          setErrors(prev => ({ ...prev, [name]: '' }));
        }
        break;
      
      case 'password':
        let passwordError = '';
        if (value.length < 8) {
          passwordError = "Le mot de passe doit contenir au moins 8 caractères";
        } else if (!/[A-Z]/.test(value)) {
          passwordError = "Le mot de passe doit contenir au moins une majuscule";
        } else if (!/[0-9]/.test(value)) {
          passwordError = "Le mot de passe doit contenir au moins un chiffre";
        }
        setErrors(prev => ({ ...prev, [name]: passwordError }));
        
        // Revalider la confirmation du mot de passe si elle existe
        if (formData.confirmPassword) {
          validateField('confirmPassword', formData.confirmPassword);
        }
        break;
      
      case 'confirmPassword':
        if (value !== formData.password) {
          setErrors(prev => ({ ...prev, [name]: "Les mots de passe ne correspondent pas" }));
        } else {
          setErrors(prev => ({ ...prev, [name]: '' }));
        }
        break;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handlePhoneChange = (phone: string) => {
    setFormData(prev => ({ ...prev, phoneNumber: phone }));
    validateField('phoneNumber', phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Valider tout le formulaire
      registerSchema.parse(formData);
      await register(formData);
      navigate('/verify-email', { 
        state: { email: formData.email }
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach(error => {
          if (error.path) {
            fieldErrors[error.path[0]] = error.message;
          }
        });
        setErrors(fieldErrors);
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClassName = (fieldName: string) => {
    const baseClasses = "mt-1 block w-full px-3 py-2 bg-white dark:bg-neutral-900 border rounded-md shadow-sm focus:outline-none focus:ring-2";
    
    const statusClasses = {
      default: "border-neutral-300 dark:border-neutral-700 focus:ring-primary-500 focus:border-primary-500",
      error: "border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500",
      warning: "border-orange-500 dark:border-orange-400 focus:ring-orange-500 focus:border-orange-500",
      success: "border-green-500 dark:border-green-400 focus:ring-green-500 focus:border-green-500"
    };

    return `${baseClasses} ${statusClasses[validationStatus[fieldName]]}`;
  };

  const StatusIcon = ({ status }: { status: ValidationStatus }) => {
    if (status === 'default') return null;
    
    const icons = {
      success: <CheckCircle className="w-5 h-5 text-green-500" />,
      error: <XCircle className="w-5 h-5 text-red-500" />,
      warning: <AlertCircle className="w-5 h-5 text-orange-500" />
    };

    return icons[status] || null;
  };

  const isStepValid = (step: Step) => {
    return step.fields.every(field => {
      const value = formData[field as keyof typeof formData];
      return value && !errors[field] && validationStatus[field] === 'success';
    });
  };

  const canProceed = isStepValid(steps[currentStep - 1]);

  const handleNext = () => {
    if (currentStep < steps.length && canProceed) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
      <div className="w-full max-w-2xl p-8 space-y-8 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Create Your Account
          </h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">
            Join our car rental platform
          </p>
        </div>

        {/* Stepper */}
        <div className="relative">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  currentStep > step.id
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : currentStep === step.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-neutral-300 text-neutral-300'
                }`}>
                  {step.icon}
                </div>
                <p className={`mt-2 text-sm font-medium ${
                  currentStep >= step.id
                    ? 'text-primary-600'
                    : 'text-neutral-400'
                }`}>
                  {step.title}
                </p>
                {index < steps.length - 1 && (
                  <div className={`absolute top-5 left-0 h-[2px] transition-all ${
                    currentStep > step.id + 1
                      ? 'bg-primary-600'
                      : 'bg-neutral-300'
                  }`} style={{
                    width: `${100 / (steps.length - 1)}%`,
                    left: `${(100 * index) / (steps.length - 1)}%`
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    First Name
                  </label>
                  <div className="relative">
                    <input
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className={getInputClassName('firstName')}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <StatusIcon status={validationStatus.firstName} />
                    </div>
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    Last Name
                  </label>
                  <div className="relative">
                    <input
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className={getInputClassName('lastName')}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <StatusIcon status={validationStatus.lastName} />
                    </div>
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={getInputClassName('email')}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <StatusIcon status={validationStatus.email} />
                  </div>
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  Phone Number
                </label>
                <PhoneInput
                  defaultCountry="ma"
                  value={formData.phoneNumber}
                  onChange={handlePhoneChange}
                  className="mt-1 [&>div]:bg-white dark:[&>div]:bg-neutral-900 [&>div]:border-neutral-300 dark:[&>div]:border-neutral-700 [&>div]:rounded-md [&>div]:shadow-sm focus-within:[&>div]:ring-2 focus-within:[&>div]:ring-primary-500 focus-within:[&>div]:border-primary-500"
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Security */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={getInputClassName('password')}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <StatusIcon status={validationStatus.password} />
                  </div>
                </div>
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className={`h-1 flex-1 rounded ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-neutral-300'}`} />
                      <div className={`h-1 flex-1 rounded ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-neutral-300'}`} />
                      <div className={`h-1 flex-1 rounded ${/[0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-neutral-300'}`} />
                    </div>
                    <div className="text-xs text-neutral-500">
                      {errors.password || "Mot de passe fort"}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={getInputClassName('confirmPassword')}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <StatusIcon status={validationStatus.confirmPassword} />
                  </div>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between space-x-4">
            {currentStep > 1 && (
              <Button
                type="button"
                onClick={handlePrevious}
                className="flex-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800"
              >
                Previous
              </Button>
            )}
            
            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canProceed}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
                isLoading={isLoading}
              >
                Create Account
              </Button>
            )}
          </div>
        </form>

        <div className="text-center text-sm">
          <span className="text-neutral-600 dark:text-neutral-400">
            Already have an account?{' '}
          </span>
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}