'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Mail, Phone, Facebook, Twitter, Linkedin, Youtube, ChevronDown, Menu, X, Globe, ExternalLink } from 'lucide-react';
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { startLoading } = useLoading();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Fetch settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await getSettings();
        if (response.success && response.data) setSettings(response.data);
      } catch {}
    }
    fetchSettings();
  }, []);

  // Fetch menu
  useEffect(() => {
    async function fetchMenu() {
      try {
        const response = await getMenu('header');
        if (response.success && response.data?.items) setMenuItems(response.data.items);
      } catch {}
    }
    fetchMenu();
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setOpenDropdown(null);
    setMobileOpen(false);
    const currentFullPath = pathname + (window.location.search || '');
    if (href === currentFullPath) { router.refresh(); return; }
    startLoading();
    setTimeout(() => router.push(href), 100);
  };

  const getMenuItemHref = (item: MenuItem & { type?: string }): string => {
    const itemType = item.type || 'custom';
    let url = item.url;
    if (itemType === 'post') { url = `/news/${url.replace(/^\/(article|post)\//, '')}`; }
    else if (itemType === 'category') { const slug = url.replace(/^\/(categorie|category)\//, ''); url = slug ? `/news?category=${slug}` : '/news'; }
    else if (itemType === 'page') { const slug = url.replace(/^\/(page)\//, '').replace(/^\//, ''); url = slug ? `/page/${slug}` : url; }
    if (url.startsWith('/')) return `/${lang}${url === '/' ? '' : url}`;
    return url;
  };

  const getLocalizedLabel = (item: MenuItem & { label_fr?: string; label_en?: string }): string => {
    if (lang === 'en') return item.label_en || item.label_fr || item.label;
    return item.label_fr || item.label;
  };

  const buildNavItems = (items: MenuItem[]): NavItem[] => {
    return items.map((item) => ({
      id: item.id.toString(),
      label: getLocalizedLabel(item as MenuItem & { label_fr?: string; label_en?: string }),
      href: getMenuItemHref(item as MenuItem & { type?: string }),
      children: item.children?.length ? buildNavItems(item.children) : undefined,
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
  const socials = [
    { Icon: Facebook, url: settings.facebook_url },
    { Icon: Twitter, url: settings.twitter_url },
    { Icon: Linkedin, url: settings.linkedin_url },
    { Icon: Youtube, url: settings.youtube_url },
  ].filter(({ url }) => url?.trim());

  return (
    <>
      {/* ═══ Top Bar ═══ */}
      <div className={cn(
        'bg-gradient-to-r from-red-700 via-red-600 to-red-700 transition-all duration-300',
        scrolled ? 'h-0 overflow-hidden opacity-0' : 'opacity-100'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex justify-between items-center">
          {/* Left: contact - hide phone on mobile */}
          <div className="flex items-center gap-4 sm:gap-6 text-white/90 text-xs sm:text-sm">
            <a href={`mailto:${settings.contact_email || 'contact@onehealth.cm'}`}
              className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail size={13} className="flex-shrink-0" />
              <span className="hidden xs:inline sm:inline">{settings.contact_email || 'contact@onehealth.cm'}</span>
              <span className="xs:hidden sm:hidden">Email</span>
            </a>
            {/* Phone: hidden on mobile */}
            <a href={`tel:${settings.site_phone || '+237242015961'}`}
              className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone size={13} />
              <span>{settings.site_phone || '+237 242 015 961'}</span>
            </a>
          </div>

          {/* Right: lang + socials */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language switcher */}
            <div className="flex rounded-full overflow-hidden border border-white/20">
              <a href="/fr" onClick={(e) => handleNavClick(e, '/fr')}
                className={cn('px-2.5 py-1 text-xs font-bold transition-all',
                  lang === 'fr' ? 'bg-white text-red-700' : 'text-white/80 hover:text-white hover:bg-white/10')}>
                FR
              </a>
              <a href="/en" onClick={(e) => handleNavClick(e, '/en')}
                className={cn('px-2.5 py-1 text-xs font-bold transition-all',
                  lang === 'en' ? 'bg-white text-red-700' : 'text-white/80 hover:text-white hover:bg-white/10')}>
                EN
              </a>
            </div>

            {/* Socials - hidden on small mobile */}
            <div className="hidden sm:flex items-center gap-3">
              {socials.map(({ Icon, url }, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Main Header ═══ */}
      <header className={cn(
        'bg-white transition-all duration-300 z-50',
        scrolled ? 'fixed top-0 left-0 right-0 shadow-lg' : 'relative shadow-sm'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <a href={`/${lang}`} onClick={(e) => handleNavClick(e, `/${lang}`)}
            className="flex items-center gap-3 cursor-pointer flex-shrink-0">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden ring-2 ring-red-100">
              <Image src="/images/one-health.jpg" alt="One Health" fill className="object-cover" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-oh-dark leading-tight">ONE HEALTH</h1>
              <p className="text-[10px] sm:text-[11px] text-oh-gray font-semibold tracking-widest">
                {lang === 'fr' ? 'CAMEROUN' : 'CAMEROON'}
              </p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => (
              <div key={item.id} className="relative group"
                onMouseEnter={() => item.children && setOpenDropdown(item.id)}
                onMouseLeave={() => setOpenDropdown(null)}>
                <a href={item.href} onClick={(e) => handleNavClick(e, item.href)}
                  className={cn(
                    'px-4 py-2.5 rounded-lg font-semibold text-sm transition-all cursor-pointer flex items-center gap-1',
                    'hover:bg-oh-light-blue hover:text-oh-blue text-oh-dark-gray',
                    item.children?.length && openDropdown === item.id && 'bg-oh-light-blue text-oh-blue'
                  )}>
                  {item.label}
                  {item.children?.length && (
                    <ChevronDown size={13} className={cn('transition-transform duration-200', openDropdown === item.id && 'rotate-180')} />
                  )}
                </a>

                {/* Desktop dropdown */}
                {item.children?.length && (
                  <div className={cn(
                    'absolute top-full left-0 pt-2 z-50 min-w-[220px]',
                    'opacity-0 invisible translate-y-2 transition-all duration-200',
                    openDropdown === item.id && 'opacity-100 visible translate-y-0'
                  )}>
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100/80 py-2 overflow-hidden">
                      {item.children.map((child, index) => (
                        <a key={child.id} href={child.href} onClick={(e) => handleNavClick(e, child.href)}
                          className={cn(
                            'block px-5 py-3 text-sm font-medium text-gray-600',
                            'hover:bg-gradient-to-r hover:from-oh-light-blue hover:to-transparent hover:text-oh-blue',
                            'transition-all duration-150 relative',
                            'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2',
                            'before:w-0 before:h-8 before:bg-oh-blue before:rounded-r',
                            'before:transition-all before:duration-200 hover:before:w-1',
                            index !== item.children!.length - 1 && 'border-b border-gray-50'
                          )}>
                          {child.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right: User menu + hamburger */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <UserMenu lang={lang} />
            </div>

            {/* Hamburger - visible on mobile/tablet */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} className="text-oh-dark" /> : <Menu size={22} className="text-oh-dark" />}
            </button>
          </div>
        </div>
      </header>

      {/* ═══ Mobile Menu Overlay ═══ */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />

          {/* Drawer */}
          <div ref={mobileMenuRef}
            className="absolute top-0 right-0 w-[85%] max-w-sm h-full bg-white shadow-2xl flex flex-col animate-slideInRight">

            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="relative w-9 h-9 rounded-full overflow-hidden">
                  <Image src="/images/one-health.jpg" alt="One Health" fill className="object-cover" />
                </div>
                <div>
                  <div className="text-sm font-bold text-oh-dark">ONE HEALTH</div>
                  <div className="text-[9px] font-semibold text-oh-gray tracking-widest">
                    {lang === 'fr' ? 'CAMEROUN' : 'CAMEROON'}
                  </div>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Nav items */}
            <div className="flex-1 overflow-y-auto py-3">
              {navItems.map((item) => (
                <div key={item.id}>
                  {item.children?.length ? (
                    <>
                      <button
                        onClick={() => setMobileExpanded(mobileExpanded === item.id ? null : item.id)}
                        className="w-full flex items-center justify-between px-5 py-3.5 text-left text-[15px] font-semibold text-oh-dark-gray hover:bg-gray-50 transition-colors"
                      >
                        {item.label}
                        <ChevronDown size={16} className={cn('text-gray-400 transition-transform', mobileExpanded === item.id && 'rotate-180')} />
                      </button>
                      {mobileExpanded === item.id && (
                        <div className="bg-gray-50/80 border-l-2 border-oh-blue ml-5 mr-3 rounded-lg overflow-hidden mb-1">
                          {item.children.map((child) => (
                            <a key={child.id} href={child.href} onClick={(e) => handleNavClick(e, child.href)}
                              className="block px-4 py-3 text-sm text-gray-600 hover:text-oh-blue hover:bg-white/60 transition-colors">
                              {child.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <a href={item.href} onClick={(e) => handleNavClick(e, item.href)}
                      className="block px-5 py-3.5 text-[15px] font-semibold text-oh-dark-gray hover:bg-gray-50 hover:text-oh-blue transition-colors">
                      {item.label}
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom section: user + lang + contact */}
            <div className="border-t border-gray-100 px-5 py-4 space-y-4">
              {/* User menu mobile */}
              <div className="sm:hidden">
                <UserMenu lang={lang} />
              </div>

              {/* Language */}
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-gray-400" />
                <div className="flex rounded-full overflow-hidden border border-gray-200">
                  <a href="/fr" onClick={(e) => handleNavClick(e, '/fr')}
                    className={cn('px-3 py-1.5 text-xs font-bold', lang === 'fr' ? 'bg-red-600 text-white' : 'text-gray-500')}>
                    Français
                  </a>
                  <a href="/en" onClick={(e) => handleNavClick(e, '/en')}
                    className={cn('px-3 py-1.5 text-xs font-bold', lang === 'en' ? 'bg-red-600 text-white' : 'text-gray-500')}>
                    English
                  </a>
                </div>
              </div>

              {/* Contact */}
              <div className="flex flex-col gap-2 text-xs text-gray-500">
                <a href={`mailto:${settings.contact_email || 'contact@onehealth.cm'}`} className="flex items-center gap-2 hover:text-oh-blue">
                  <Mail size={12} /> {settings.contact_email || 'contact@onehealth.cm'}
                </a>
              </div>

              {/* Socials */}
              {socials.length > 0 && (
                <div className="flex gap-4 pt-1">
                  {socials.map(({ Icon, url }, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      className="text-gray-400 hover:text-oh-blue transition-colors">
                      <Icon size={16} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spacer when header is fixed */}
      {scrolled && <div className="h-[60px] sm:h-[68px]" />}

      {/* Animation styles */}
      <style jsx global>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideInRight {
          animation: slideInRight 0.25s ease-out;
        }
      `}</style>
    </>
  );
}
