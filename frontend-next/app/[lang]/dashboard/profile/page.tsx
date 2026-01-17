'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  User,
  Mail,
  Lock,
  Save,
  ArrowLeft,
  Loader2,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Language } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { AuthGuard } from '@/components/auth';
import { getImageUrl } from '@/lib/api';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const translations = {
  fr: {
    title: 'Mon profil',
    subtitle: 'Gérez vos informations personnelles',
    back: 'Retour au dashboard',
    personalInfo: 'Informations personnelles',
    changePassword: 'Changer le mot de passe',
    username: "Nom d'utilisateur",
    email: 'Email',
    firstName: 'Prénom',
    lastName: 'Nom',
    currentPassword: 'Mot de passe actuel',
    newPassword: 'Nouveau mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    save: 'Enregistrer',
    saving: 'Enregistrement...',
    saved: 'Enregistré !',
    passwordUpdated: 'Mot de passe mis à jour',
    errors: {
      firstName: 'Le prénom est requis',
      lastName: 'Le nom est requis',
      currentPassword: 'Le mot de passe actuel est requis',
      newPassword: 'Le nouveau mot de passe doit contenir au moins 8 caractères',
      confirmPassword: 'Les mots de passe ne correspondent pas',
      updateFailed: 'Erreur lors de la mise à jour',
      passwordFailed: 'Mot de passe actuel incorrect',
    },
  },
  en: {
    title: 'My Profile',
    subtitle: 'Manage your personal information',
    back: 'Back to dashboard',
    personalInfo: 'Personal Information',
    changePassword: 'Change Password',
    username: 'Username',
    email: 'Email',
    firstName: 'First name',
    lastName: 'Last name',
    currentPassword: 'Current password',
    newPassword: 'New password',
    confirmPassword: 'Confirm password',
    save: 'Save',
    saving: 'Saving...',
    saved: 'Saved!',
    passwordUpdated: 'Password updated',
    errors: {
      firstName: 'First name is required',
      lastName: 'Last name is required',
      currentPassword: 'Current password is required',
      newPassword: 'New password must be at least 8 characters',
      confirmPassword: 'Passwords do not match',
      updateFailed: 'Update failed',
      passwordFailed: 'Current password is incorrect',
    },
  },
};

export default function ProfilePage() {
  const params = useParams();
  const lang = (params.lang as Language) || 'fr';
  const t = translations[lang];

  const { user, token, updateProfile } = useAuth();

  // Profile form state
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Update profile form when user changes
  useState(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      });
    }
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSaved(false);

    // Validate
    const errors: Record<string, string> = {};
    if (!profileData.first_name) errors.first_name = t.errors.firstName;
    if (!profileData.last_name) errors.last_name = t.errors.lastName;

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setProfileErrors({});
    setProfileSaving(true);

    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3000);
      } else {
        setProfileError(result.message || t.errors.updateFailed);
      }
    } catch (error) {
      setProfileError(t.errors.updateFailed);
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSaved(false);

    // Validate
    const errors: Record<string, string> = {};
    if (!passwordData.currentPassword) errors.currentPassword = t.errors.currentPassword;
    if (!passwordData.newPassword || passwordData.newPassword.length < 8) {
      errors.newPassword = t.errors.newPassword;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = t.errors.confirmPassword;
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordErrors({});
    setPasswordSaving(true);

    try {
      const res = await fetch(`${API_URL}/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setPasswordSaved(true);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordSaved(false), 3000);
      } else {
        setPasswordError(data.message || t.errors.passwordFailed);
      }
    } catch (error) {
      setPasswordError(t.errors.passwordFailed);
    } finally {
      setPasswordSaving(false);
    }
  };

  const initials = user?.first_name
    ? `${user.first_name.charAt(0)}${user.last_name?.charAt(0) || ''}`.toUpperCase()
    : user?.username?.substring(0, 2).toUpperCase() || 'U';

  return (
    <AuthGuard lang={lang}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link
              href={`/${lang}/dashboard`}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-oh-blue mb-4"
            >
              <ArrowLeft size={16} />
              {t.back}
            </Link>
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-oh-blue flex items-center justify-center">
                {user?.avatar ? (
                  <Image
                    src={getImageUrl(user.avatar)}
                    alt={user.username}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-white text-xl font-bold">{initials}</span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
                <p className="text-gray-500">{t.subtitle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User size={20} className="text-gray-400" />
                {t.personalInfo}
              </h2>
            </div>
            <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
              {profileError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                  <AlertCircle size={18} />
                  {profileError}
                </div>
              )}

              {/* Username (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.username}
                </label>
                <input
                  type="text"
                  value={user?.username || ''}
                  disabled
                  className="block w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.email}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.firstName}
                  </label>
                  <input
                    type="text"
                    value={profileData.first_name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, first_name: e.target.value })
                    }
                    className={cn(
                      'block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-oh-blue focus:border-oh-blue transition-colors',
                      profileErrors.first_name ? 'border-red-500' : 'border-gray-300'
                    )}
                  />
                  {profileErrors.first_name && (
                    <p className="mt-1 text-sm text-red-500">{profileErrors.first_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.lastName}
                  </label>
                  <input
                    type="text"
                    value={profileData.last_name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, last_name: e.target.value })
                    }
                    className={cn(
                      'block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-oh-blue focus:border-oh-blue transition-colors',
                      profileErrors.last_name ? 'border-red-500' : 'border-gray-300'
                    )}
                  />
                  {profileErrors.last_name && (
                    <p className="mt-1 text-sm text-red-500">{profileErrors.last_name}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className={cn(
                    'flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors',
                    profileSaved
                      ? 'bg-green-500 text-white'
                      : 'bg-oh-blue text-white hover:bg-oh-blue/90',
                    profileSaving && 'opacity-70 cursor-not-allowed'
                  )}
                >
                  {profileSaving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t.saving}
                    </>
                  ) : profileSaved ? (
                    <>
                      <Check className="h-5 w-5" />
                      {t.saved}
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      {t.save}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Lock size={20} className="text-gray-400" />
                {t.changePassword}
              </h2>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              {passwordError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                  <AlertCircle size={18} />
                  {passwordError}
                </div>
              )}

              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.currentPassword}
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    className={cn(
                      'block w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-oh-blue focus:border-oh-blue transition-colors',
                      passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-500">{passwordErrors.currentPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.newPassword}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    className={cn(
                      'block w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-oh-blue focus:border-oh-blue transition-colors',
                      passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-500">{passwordErrors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.confirmPassword}
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  className={cn(
                    'block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-oh-blue focus:border-oh-blue transition-colors',
                    passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  )}
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className={cn(
                    'flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors',
                    passwordSaved
                      ? 'bg-green-500 text-white'
                      : 'bg-oh-blue text-white hover:bg-oh-blue/90',
                    passwordSaving && 'opacity-70 cursor-not-allowed'
                  )}
                >
                  {passwordSaving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t.saving}
                    </>
                  ) : passwordSaved ? (
                    <>
                      <Check className="h-5 w-5" />
                      {t.passwordUpdated}
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      {t.save}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
