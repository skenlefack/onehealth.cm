'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Mail, Phone, Facebook, Twitter, Linkedin, Youtube, ChevronDown } from 'lucide-react';
import { Language, MenuItem } from '@/lib/types';
import { Translation } from '@/lib/translations';
import { UserMenu } from '@/components/auth';
import { cn } from '@/lib/utils';
import { useLoading } from '@/lib/LoadingContext';
import { getMenu, getSettings, SiteSettings } from '@/lib/api';

interface HeaderProps {
  lang: Language;
  t: Translation;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  children?: NavItem[];
}

export function Header({ lang, t }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { startLoading } = useLoading();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch settings from API
  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await getSettings();
        if (response.success && response.data) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    }
    fetchSettings();
  }, []);

  // Fetch main menu from API
  useEffect(() => {
    async function fetchMenu() {
      try {
        const response = await getMenu('header');
        if (response.success && response.data?.items) {
          setMenuItems(response.data.items);
        }
      } catch (error) {
        console.error('Error fetching menu:', error);
      }
    }
    fetchMenu();
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    // Close any open dropdown
    setOpenDropdown(null);

    // Get current full URL for comparison
    const currentFullPath = pathname + (window.location.search || '');

    // Compare full URLs including query params
    // If exactly the same URL, do a refresh/reload behavior
    if (href === currentFullPath) {
      // Force refresh the current page
      router.refresh();
      return;
    }

    startLoading();
    setTimeout(() => {
      router.push(href);
    }, 100);
  };

  // Transform URL based on menu item type
  const getMenuItemHref = (item: MenuItem & { type?: string }): string => {
    const itemType = item.type || 'custom';
    let url = item.url;

    // Handle different menu item types
    if (itemType === 'post') {
      // Transform /article/{slug} to /news/{slug}
      const slug = url.replace(/^\/(article|post)\//, '');
      url = `/news/${slug}`;
    } else if (itemType === 'category') {
      // Transform /categorie/{slug} to /news?category={slug}
      const slug = url.replace(/^\/(categorie|category)\//, '');
      url = slug ? `/news?category=${slug}` : '/news';
    } else if (itemType === 'page') {
      // Transform to /page/{slug}
      const slug = url.replace(/^\/(page)\//, '').replace(/^\//, '');
      url = slug ? `/page/${slug}` : url;
    }
    // For 'custom' and others, use the URL as-is

    // Add language prefix for internal links
    if (url.startsWith('/')) {
      return `/${lang}${url === '/' ? '' : url}`;
    }
    return url;
  };

  // Get localized label for menu item
  const getLocalizedLabel = (item: MenuItem & { label_fr?: string; label_en?: string }): string => {
    if (lang === 'en') {
      return item.label_en || item.label_fr || item.label;
    }
    return item.label_fr || item.label;
  };

  // Build nav items from API menu or fallback to default
  const buildNavItems = (items: MenuItem[]): NavItem[] => {
    return items.map((item) => ({
      id: item.id.toString(),
      label: getLocalizedLabel(item as MenuItem & { label_fr?: string; label_en?: string }),
      href: getMenuItemHref(item as MenuItem & { type?: string }),
      children: item.children && item.children.length > 0 ? buildNavItems(item.children) : undefined,
    }));
  };

  const navItems: NavItem[] = menuItems.length > 0
    ? buildNavItems(menuItems)
    : [
        { id: 'home', label: t.nav.home, href: `/${lang}` },
        { id: 'about', label: t.nav.about, href: `/${lang}/about` },
        { id: 'news', label: t.nav.news, href: `/${lang}/news` },
        { id: 'zoonoses', label: t.nav.zoonoses, href: `/${lang}/zoonoses` },
        { id: 'contact', label: t.nav.contact, href: `/${lang}/contact` },
      ];

  const otherLang = lang === 'fr' ? 'en' : 'fr';

  return (
    <>
      {/* Top Bar */}
      <div
        className={cn(
          'bg-red-600 py-2.5 px-[5%] flex justify-between items-center text-sm text-white/80',
          scrolled && 'hidden'
        )}
      >
        <div className="flex gap-8">
          <span className="flex items-center gap-2">
            <Mail size={14} />
            {settings.contact_email || 'contact@onehealth.cm'}
          </span>
          <span className="flex items-center gap-2">
            <Phone size={14} />
            {settings.site_phone || '+237 242 015 961'}
          </span>
        </div>
        <div className="flex items-center gap-5">
          {/* Language Switcher */}
          <div className="flex gap-2">
            <a
              href="/fr"
              onClick={(e) => handleNavClick(e, '/fr')}
              className={cn(
                'px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer',
                lang === 'fr'
                  ? 'bg-white text-oh-dark'
                  : 'text-white/80 hover:text-white'
              )}
            >
              FR
            </a>
            <a
              href="/en"
              onClick={(e) => handleNavClick(e, '/en')}
              className={cn(
                'px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer',
                lang === 'en'
                  ? 'bg-white text-oh-dark'
                  : 'text-white/80 hover:text-white'
              )}
            >
              EN
            </a>
          </div>
          {/* Social Links - Only show configured ones */}
          <div className="flex gap-4">
            {[
              { Icon: Facebook, url: settings.facebook_url },
              { Icon: Twitter, url: settings.twitter_url },
              { Icon: Linkedin, url: settings.linkedin_url },
              { Icon: Youtube, url: settings.youtube_url },
            ].filter(({ url }) => url && url.trim() !== '').map(({ Icon, url }, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          'bg-white transition-all duration-300 z-50',
          scrolled
            ? 'fixed top-0 left-0 right-0 shadow-md'
            : 'relative'
        )}
      >
        <div className="max-w-7xl mx-auto px-[5%] py-4 flex items-center justify-between">
          {/* Logo */}
          <a
            href={`/${lang}`}
            onClick={(e) => handleNavClick(e, `/${lang}`)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden">
              <Image
                src="/images/one-health.jpg"
                alt="One Health"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-oh-dark">ONE HEALTH</h1>
              <p className="text-[11px] text-oh-gray font-semibold tracking-widest">
                {lang === 'fr' ? 'CAMEROUN' : 'CAMEROON'}
              </p>
            </div>
          </a>

          {/* Navigation */}
          <nav className="flex gap-1">
            {navItems.map((item) => (
              <div
                key={item.id}
                className="relative group"
                onMouseEnter={() => item.children && setOpenDropdown(item.id)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <a
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={cn(
                    'px-5 py-3 rounded-lg font-semibold text-[15px] transition-all cursor-pointer flex items-center gap-1',
                    'hover:bg-oh-light-blue hover:text-oh-blue',
                    'text-oh-dark-gray',
                    item.children && item.children.length > 0 && openDropdown === item.id && 'bg-oh-light-blue text-oh-blue'
                  )}
                >
                  {item.label}
                  {item.children && item.children.length > 0 && (
                    <ChevronDown
                      size={14}
                      className={cn(
                        'transition-transform duration-200',
                        openDropdown === item.id && 'rotate-180'
                      )}
                    />
                  )}
                </a>
                {/* Dropdown menu */}
                {item.children && item.children.length > 0 && (
                  <div
                    className={cn(
                      'absolute top-full left-0 pt-2 z-50 min-w-[220px]',
                      'opacity-0 invisible translate-y-2 transition-all duration-200',
                      openDropdown === item.id && 'opacity-100 visible translate-y-0'
                    )}
                  >
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100/80 py-2 overflow-hidden backdrop-blur-sm">
                      {item.children.map((child, index) => (
                        <a
                          key={child.id}
                          href={child.href}
                          onClick={(e) => handleNavClick(e, child.href)}
                          className={cn(
                            'block px-5 py-3 text-sm font-medium text-gray-600',
                            'hover:bg-gradient-to-r hover:from-oh-light-blue hover:to-transparent hover:text-oh-blue',
                            'transition-all duration-150 relative',
                            'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2',
                            'before:w-0 before:h-8 before:bg-oh-blue before:rounded-r',
                            'before:transition-all before:duration-200',
                            'hover:before:w-1',
                            index !== item.children!.length - 1 && 'border-b border-gray-50'
                          )}
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <UserMenu lang={lang} />
          </div>
        </div>
      </header>

      {/* Spacer when header is fixed */}
      {scrolled && <div className="h-[72px]" />}
    </>
  );
}
