'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Linkedin, Youtube, Send, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { Language } from '@/lib/types';
import { Translation } from '@/lib/translations';
import { getSettings, SiteSettings } from '@/lib/api';

interface FooterProps {
  lang: Language;
  t: Translation;
}

export function Footer({ lang, t }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({});

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await getSettings();
      if (res.success && res.data) {
        setSettings(res.data);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3000);
  };

  const navLinks = [
    { label: lang === 'fr' ? 'Accueil' : 'Home', href: `/${lang}` },
    { label: lang === 'fr' ? 'A Propos' : 'About', href: `/${lang}/about` },
    { label: lang === 'fr' ? 'Actualites' : 'News', href: `/${lang}/news` },
    { label: lang === 'fr' ? 'Ressources' : 'Resources', href: `/${lang}/resources` },
    { label: lang === 'fr' ? 'Contact' : 'Contact', href: `/${lang}/contact` },
  ];

  const usefulLinks = [
    { label: lang === 'fr' ? 'Zoonoses Prioritaires' : 'Priority Zoonoses', href: `/${lang}/zoonoses` },
    { label: lang === 'fr' ? 'Rapports & Publications' : 'Reports & Publications', href: `/${lang}/resources/reports` },
    { label: lang === 'fr' ? 'Base de donnees' : 'Database', href: `/${lang}/database` },
    { label: lang === 'fr' ? 'FAQ' : 'FAQ', href: `/${lang}/faq` },
    { label: lang === 'fr' ? 'Mentions legales' : 'Legal Notice', href: `/${lang}/legal` },
  ];

  const contact = {
    address: settings.site_address || (lang === 'fr' ? 'Yaoundé, Cameroun' : 'Yaounde, Cameroon'),
    phone: settings.site_phone || '+237 242 015 961 - +237 242 015 965',
    email: settings.contact_email || 'contact@onehealth.cm',
  };

  return (
    <footer className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-900 text-white">
      {/* Top Wave */}
      <svg className="w-full h-12 -mb-1" viewBox="0 0 1440 48" fill="none" preserveAspectRatio="none">
        <path
          d="M0 48L60 42C120 36 240 24 360 18C480 12 600 12 720 18C840 24 960 36 1080 38C1200 40 1320 32 1380 28L1440 24V0H1380C1320 0 1200 0 1080 0C960 0 840 0 720 0C600 0 480 0 360 0C240 0 120 0 60 0H0V48Z"
          fill="#065f46"
        />
      </svg>

      <div className="max-w-7xl mx-auto px-[5%] py-16">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* About Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden ring-2 ring-emerald-400/30">
                <Image
                  src="/images/one-health.jpg"
                  alt="One Health"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-extrabold tracking-wide">ONE HEALTH</h3>
                <p className="text-xs text-emerald-300 font-semibold tracking-[0.2em]">
                  {lang === 'fr' ? 'CAMEROUN' : 'CAMEROON'}
                </p>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-sm">
              {settings.site_description || t.footer.description}
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-white/70 text-sm">
                <MapPin size={16} className="text-emerald-300" />
                <span>{contact.address}</span>
              </div>
              <div className="flex items-center gap-3 text-white/70 text-sm">
                <Phone size={16} className="text-emerald-300" />
                <span>{contact.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-white/70 text-sm">
                <Mail size={16} className="text-emerald-300" />
                <span>{contact.email}</span>
              </div>
            </div>

            {/* Social Links - Only show configured ones */}
            <div className="flex gap-3">
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
                  className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/70 hover:bg-emerald-500 hover:text-white transition-all duration-300"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Column */}
          <div>
            <h4 className="text-base font-bold mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-emerald-500 rounded-full" />
              {t.footer.navigation}
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-white/70 text-sm hover:text-emerald-300 hover:pl-2 transition-all duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Liens Utiles Column */}
          <div>
            <h4 className="text-base font-bold mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-emerald-400 rounded-full" />
              {lang === 'fr' ? 'Liens Utiles' : 'Useful Links'}
            </h4>
            <ul className="space-y-3">
              {usefulLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-white/70 text-sm hover:text-teal-300 hover:pl-2 transition-all duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="text-base font-bold mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-cyan-400 rounded-full" />
              {t.footer.newsletter}
            </h4>
            <p className="text-white/70 text-sm mb-5">{t.footer.newsletterDesc}</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.footer.emailPlaceholder}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white text-sm border border-white/10 outline-none placeholder:text-white/40 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
              />
              <button
                type="submit"
                className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Send size={16} />
                {lang === 'fr' ? "S'abonner" : 'Subscribe'}
              </button>
            </form>
            {subscribed && (
              <p className="text-emerald-300 text-sm mt-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                {lang === 'fr' ? 'Merci!' : 'Thanks!'}
              </p>
            )}
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
            <Globe size={16} className="text-white/60" />
            <Link
              href="/fr"
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                lang === 'fr' ? 'bg-emerald-500 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              FR
            </Link>
            <span className="text-white/30">|</span>
            <Link
              href="/en"
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                lang === 'en' ? 'bg-emerald-500 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              EN
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} One Health Cameroon. {t.footer.rights}.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-white/50 text-sm hover:text-white transition-colors">
              {t.footer.privacy}
            </Link>
            <Link href="#" className="text-white/50 text-sm hover:text-white transition-colors">
              {t.footer.legal}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
