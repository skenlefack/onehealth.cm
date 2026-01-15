'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Language } from '@/lib/types';
import { getTranslation, isValidLanguage } from '@/lib/translations';
import { SectionTitle, Card, Button } from '@/components/ui';

export default function ContactPage() {
  const params = useParams();
  const lang = params.lang as string;

  if (!isValidLanguage(lang)) {
    return null;
  }

  const t = getTranslation(lang as Language);

  return <ContactForm lang={lang as Language} t={typeof t === 'object' ? t : getTranslation('fr')} />;
}

interface ContactFormProps {
  lang: Language;
  t: ReturnType<typeof getTranslation>;
}

function ContactForm({ lang, t }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <section className="pt-32 pb-20 px-[5%] bg-oh-background min-h-screen">
      <div className="max-w-3xl mx-auto">
        <SectionTitle badge={t.contact.badge} title={t.contact.title} />

        <Card className="p-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name & Email */}
            <div className="grid md:grid-cols-2 gap-5">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t.contact.name}
                required
                className="w-full px-5 py-4 rounded-xl border-2 border-oh-background text-[15px] outline-none focus:border-oh-blue transition-colors"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t.contact.email}
                required
                className="w-full px-5 py-4 rounded-xl border-2 border-oh-background text-[15px] outline-none focus:border-oh-blue transition-colors"
              />
            </div>

            {/* Subject */}
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder={t.contact.subject}
              required
              className="w-full px-5 py-4 rounded-xl border-2 border-oh-background text-[15px] outline-none focus:border-oh-blue transition-colors"
            />

            {/* Message */}
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder={t.contact.message}
              rows={6}
              required
              className="w-full px-5 py-4 rounded-xl border-2 border-oh-background text-[15px] outline-none focus:border-oh-blue transition-colors resize-y"
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={status === 'loading'}
              leftIcon={<Send size={20} />}
            >
              {t.contact.send}
            </Button>

            {/* Status Messages */}
            {status === 'success' && (
              <p className="text-oh-green text-center font-medium">{t.contact.success}</p>
            )}
            {status === 'error' && (
              <p className="text-red-500 text-center font-medium">{t.contact.error}</p>
            )}
          </form>
        </Card>
      </div>
    </section>
  );
}
