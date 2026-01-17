'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle, MailCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Language } from '@/lib/types';

interface LoginFormProps {
  lang: Language;
  redirectTo?: string;
}

const translations = {
  fr: {
    title: 'Connexion',
    subtitle: 'Connectez-vous à votre compte',
    email: 'Email',
    emailPlaceholder: 'votre@email.com',
    password: 'Mot de passe',
    passwordPlaceholder: 'Votre mot de passe',
    rememberMe: 'Se souvenir de moi',
    forgotPassword: 'Mot de passe oublié ?',
    login: 'Se connecter',
    loggingIn: 'Connexion...',
    noAccount: "Vous n'avez pas de compte ?",
    register: "S'inscrire",
    verification: {
      title: 'Email non vérifié',
      message: 'Veuillez vérifier votre email avant de vous connecter.',
      resend: 'Renvoyer l\'email de vérification',
      resending: 'Envoi en cours...',
      resent: 'Email envoyé ! Vérifiez votre boîte de réception.',
    },
    errors: {
      email: 'Email invalide',
      password: 'Le mot de passe est requis',
      invalidCredentials: 'Identifiant ou mot de passe incorrect',
      accountDeactivated: 'Ce compte a été désactivé',
      serverError: 'Erreur de connexion au serveur',
    },
  },
  en: {
    title: 'Login',
    subtitle: 'Sign in to your account',
    email: 'Email',
    emailPlaceholder: 'your@email.com',
    password: 'Password',
    passwordPlaceholder: 'Your password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    login: 'Sign in',
    loggingIn: 'Signing in...',
    noAccount: "Don't have an account?",
    register: 'Sign up',
    verification: {
      title: 'Email not verified',
      message: 'Please verify your email before logging in.',
      resend: 'Resend verification email',
      resending: 'Sending...',
      resent: 'Email sent! Check your inbox.',
    },
    errors: {
      email: 'Invalid email',
      password: 'Password is required',
      invalidCredentials: 'Invalid email or password',
      accountDeactivated: 'This account has been deactivated',
      serverError: 'Server connection error',
    },
  },
};

export function LoginForm({ lang, redirectTo }: LoginFormProps) {
  const t = translations[lang];
  const router = useRouter();
  const { login, resendVerification } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.errors.email;
    }
    if (!formData.password) {
      newErrors.password = t.errors.password;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setRequiresVerification(false);
    setResendSuccess(false);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Redirect to dashboard or specified page
        const destination = redirectTo || `/${lang}/dashboard`;
        router.push(destination);
      } else {
        // Check if email verification is required
        if (result.requiresVerification) {
          setRequiresVerification(true);
          setVerificationEmail(result.email || formData.email);
        } else {
          // Replace backend error messages with translated versions
          const message = result.message?.toLowerCase() || '';
          if (message.includes('invalid') || message.includes('credentials') || message.includes('incorrect')) {
            setServerError(t.errors.invalidCredentials);
          } else if (message.includes('deactivated') || message.includes('not active')) {
            setServerError(t.errors.accountDeactivated);
          } else {
            setServerError(result.message || t.errors.invalidCredentials);
          }
        }
      }
    } catch (error) {
      setServerError(t.errors.serverError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendSuccess(false);

    try {
      const result = await resendVerification(verificationEmail, lang);
      if (result.success) {
        setResendSuccess(true);
      }
    } catch (error) {
      console.error('Error resending verification:', error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <p className="mt-2 text-gray-600">{t.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {serverError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {serverError}
          </div>
        )}

        {requiresVerification && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-amber-800 font-semibold mb-1">{t.verification.title}</h3>
                <p className="text-amber-700 text-sm mb-3">{t.verification.message}</p>
                {resendSuccess ? (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <MailCheck className="w-4 h-4" />
                    {t.verification.resent}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="flex items-center gap-2 text-amber-700 hover:text-amber-800 text-sm font-medium disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                    {isResending ? t.verification.resending : t.verification.resend}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            {t.email}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={t.emailPlaceholder}
              className={`block w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-oh-blue focus:border-oh-blue transition-colors ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            {t.password}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={t.passwordPlaceholder}
              className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-oh-blue focus:border-oh-blue transition-colors ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
              className="h-4 w-4 text-oh-blue focus:ring-oh-blue border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-600">{t.rememberMe}</span>
          </label>
          <Link
            href={`/${lang}/auth/forgot-password`}
            className="text-sm font-medium text-oh-blue hover:text-oh-blue/80"
          >
            {t.forgotPassword}
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-oh-blue text-white py-3 px-4 rounded-lg font-semibold hover:bg-oh-blue/90 focus:ring-2 focus:ring-oh-blue focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t.loggingIn}
            </>
          ) : (
            t.login
          )}
        </button>

        {/* Register Link */}
        <p className="text-center text-sm text-gray-600">
          {t.noAccount}{' '}
          <Link
            href={`/${lang}/auth/register`}
            className="font-semibold text-oh-blue hover:text-oh-blue/80"
          >
            {t.register}
          </Link>
        </p>
      </form>
    </div>
  );
}
