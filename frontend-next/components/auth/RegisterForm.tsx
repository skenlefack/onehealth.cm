'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Loader2, CheckCircle, MailCheck } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Language } from '@/lib/types';

interface RegisterFormProps {
  lang: Language;
}

const translations = {
  fr: {
    title: 'Inscription',
    subtitle: 'Créez votre compte',
    username: "Nom d'utilisateur",
    usernamePlaceholder: 'johndoe',
    email: 'Email',
    emailPlaceholder: 'votre@email.com',
    firstName: 'Prénom',
    firstNamePlaceholder: 'Jean',
    lastName: 'Nom',
    lastNamePlaceholder: 'Dupont',
    password: 'Mot de passe',
    passwordPlaceholder: 'Au moins 8 caractères',
    confirmPassword: 'Confirmer le mot de passe',
    confirmPasswordPlaceholder: 'Répétez votre mot de passe',
    termsAccept: "J'accepte les",
    termsLink: "conditions d'utilisation",
    register: "S'inscrire",
    registering: 'Inscription...',
    hasAccount: 'Vous avez déjà un compte ?',
    login: 'Se connecter',
    verification: {
      title: 'Vérifiez votre email',
      message: 'Un email de vérification a été envoyé à',
      instruction: 'Cliquez sur le lien dans l\'email pour activer votre compte.',
      checkSpam: 'Vérifiez vos spams si vous ne le trouvez pas.',
      backToLogin: 'Retour à la connexion',
    },
    errors: {
      username: "Le nom d'utilisateur est requis (3 caractères min.)",
      email: 'Email invalide',
      firstName: 'Le prénom est requis',
      lastName: 'Le nom est requis',
      password: 'Le mot de passe doit contenir au moins 8 caractères',
      confirmPassword: 'Les mots de passe ne correspondent pas',
      terms: 'Vous devez accepter les conditions',
      serverError: 'Erreur de connexion au serveur',
    },
  },
  en: {
    title: 'Sign Up',
    subtitle: 'Create your account',
    username: 'Username',
    usernamePlaceholder: 'johndoe',
    email: 'Email',
    emailPlaceholder: 'your@email.com',
    firstName: 'First name',
    firstNamePlaceholder: 'John',
    lastName: 'Last name',
    lastNamePlaceholder: 'Doe',
    password: 'Password',
    passwordPlaceholder: 'At least 8 characters',
    confirmPassword: 'Confirm password',
    confirmPasswordPlaceholder: 'Repeat your password',
    termsAccept: 'I accept the',
    termsLink: 'terms and conditions',
    register: 'Sign up',
    registering: 'Signing up...',
    hasAccount: 'Already have an account?',
    login: 'Sign in',
    verification: {
      title: 'Check your email',
      message: 'A verification email has been sent to',
      instruction: 'Click the link in the email to activate your account.',
      checkSpam: 'Check your spam folder if you can\'t find it.',
      backToLogin: 'Back to login',
    },
    errors: {
      username: 'Username is required (min. 3 characters)',
      email: 'Invalid email',
      firstName: 'First name is required',
      lastName: 'Last name is required',
      password: 'Password must be at least 8 characters',
      confirmPassword: 'Passwords do not match',
      terms: 'You must accept the terms',
      serverError: 'Server connection error',
    },
  },
};

export function RegisterForm({ lang }: RegisterFormProps) {
  const t = translations[lang];
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username || formData.username.length < 3) {
      newErrors.username = t.errors.username;
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.errors.email;
    }
    if (!formData.firstName) {
      newErrors.firstName = t.errors.firstName;
    }
    if (!formData.lastName) {
      newErrors.lastName = t.errors.lastName;
    }
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = t.errors.password;
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.errors.confirmPassword;
    }
    if (!formData.acceptTerms) {
      newErrors.terms = t.errors.terms;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        lang: lang,
      });

      if (result.success) {
        if (result.requiresVerification) {
          setRegistrationSuccess(true);
        } else {
          router.push(`/${lang}/dashboard`);
        }
      } else {
        setServerError(result.message || t.errors.serverError);
      }
    } catch (error) {
      setServerError(t.errors.serverError);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success message after registration
  if (registrationSuccess) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <MailCheck className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{t.verification.title}</h1>
          <p className="text-gray-600 mb-2">{t.verification.message}</p>
          <p className="text-oh-blue font-semibold mb-4">{formData.email}</p>
          <p className="text-gray-600 mb-2">{t.verification.instruction}</p>
          <p className="text-sm text-gray-500 mb-8">{t.verification.checkSpam}</p>
          <Link
            href={`/${lang}/auth/login`}
            className="inline-flex items-center gap-2 bg-oh-blue text-white py-3 px-6 rounded-lg font-semibold hover:bg-oh-blue/90 transition-colors"
          >
            {t.verification.backToLogin}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <p className="mt-2 text-gray-600">{t.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {serverError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {serverError}
          </div>
        )}

        {/* Username Field */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            {t.username}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder={t.usernamePlaceholder}
              className={`block w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-oh-blue focus:border-oh-blue transition-colors ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
        </div>

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

        {/* First Name & Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              {t.firstName}
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder={t.firstNamePlaceholder}
              className={`block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-oh-blue focus:border-oh-blue transition-colors ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              {t.lastName}
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder={t.lastNamePlaceholder}
              className={`block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-oh-blue focus:border-oh-blue transition-colors ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
          </div>
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

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            {t.confirmPassword}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder={t.confirmPasswordPlaceholder}
              className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-oh-blue focus:border-oh-blue transition-colors ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Terms Checkbox */}
        <div>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
              className="h-4 w-4 mt-1 text-oh-blue focus:ring-oh-blue border-gray-300 rounded"
            />
            <span className="text-sm text-gray-600">
              {t.termsAccept}{' '}
              <Link href={`/${lang}/terms`} className="text-oh-blue hover:underline">
                {t.termsLink}
              </Link>
            </span>
          </label>
          {errors.terms && <p className="mt-1 text-sm text-red-500">{errors.terms}</p>}
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
              {t.registering}
            </>
          ) : (
            t.register
          )}
        </button>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600">
          {t.hasAccount}{' '}
          <Link
            href={`/${lang}/auth/login`}
            className="font-semibold text-oh-blue hover:text-oh-blue/80"
          >
            {t.login}
          </Link>
        </p>
      </form>
    </div>
  );
}
