'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  User,
  LogOut,
  LogIn,
  UserPlus,
  LayoutDashboard,
  BookOpen,
  FileText,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Language } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/api';

interface UserMenuProps {
  lang: Language;
}

const translations = {
  fr: {
    login: 'Connexion',
    register: "S'inscrire",
    dashboard: 'Tableau de bord',
    myCourses: 'Mes cours',
    resources: 'Ressources',
    profile: 'Mon profil',
    settings: 'Paramètres',
    logout: 'Déconnexion',
  },
  en: {
    login: 'Login',
    register: 'Sign up',
    dashboard: 'Dashboard',
    myCourses: 'My Courses',
    resources: 'Resources',
    profile: 'My Profile',
    settings: 'Settings',
    logout: 'Logout',
  },
};

export function UserMenu({ lang }: UserMenuProps) {
  const t = translations[lang];
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push(`/${lang}`);
  };

  // Not authenticated - show login/register buttons
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href={`/${lang}/auth/login`}
          className="group flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-oh-blue rounded-xl border-2 border-gray-200 hover:border-oh-blue/40 hover:bg-oh-blue/5 transition-all duration-300"
        >
          <LogIn size={18} className="group-hover:translate-x-0.5 transition-transform duration-300" />
          {t.login}
        </Link>
        <Link
          href={`/${lang}/auth/register`}
          className="group relative flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-oh-blue/25 hover:-translate-y-0.5"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-oh-blue via-indigo-600 to-oh-blue bg-[length:200%_100%] group-hover:animate-gradient-x transition-all" />
          {/* Shine effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
          {/* Content */}
          <UserPlus size={18} className="relative z-10 group-hover:scale-110 transition-transform duration-300" />
          <span className="relative z-10">{t.register}</span>
        </Link>
      </div>
    );
  }

  // Authenticated - show user menu
  const displayName = user.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user.username;

  const initials = user.first_name
    ? `${user.first_name.charAt(0)}${user.last_name?.charAt(0) || ''}`.toUpperCase()
    : user.username.substring(0, 2).toUpperCase();

  const menuItems = [
    { label: t.dashboard, href: `/${lang}/dashboard`, icon: LayoutDashboard },
    { label: t.myCourses, href: `/${lang}/dashboard/courses`, icon: BookOpen },
    { label: t.resources, href: `/${lang}/dashboard/resources`, icon: FileText },
    { label: t.profile, href: `/${lang}/dashboard/profile`, icon: User },
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
          'hover:bg-gray-100',
          isOpen && 'bg-gray-100'
        )}
      >
        {/* Avatar */}
        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-oh-blue flex items-center justify-center">
          {user.avatar ? (
            <Image
              src={getImageUrl(user.avatar)}
              alt={displayName}
              fill
              className="object-cover"
            />
          ) : (
            <span className="text-white text-sm font-medium">{initials}</span>
          )}
        </div>

        {/* Name */}
        <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[120px] truncate">
          {displayName}
        </span>

        {/* Chevron */}
        <ChevronDown
          size={16}
          className={cn(
            'text-gray-500 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      <div
        className={cn(
          'absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50',
          'opacity-0 invisible translate-y-2 transition-all duration-200',
          isOpen && 'opacity-100 visible translate-y-0'
        )}
      >
        {/* User info header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="font-medium text-gray-900 truncate">{displayName}</p>
          <p className="text-sm text-gray-500 truncate">{user.email}</p>
        </div>

        {/* Menu items */}
        <div className="py-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <item.icon size={18} className="text-gray-400" />
              {item.label}
            </Link>
          ))}
        </div>

        {/* Logout */}
        <div className="border-t border-gray-100 pt-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            {t.logout}
          </button>
        </div>
      </div>
    </div>
  );
}
