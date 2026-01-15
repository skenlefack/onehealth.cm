'use client';

import Image from 'next/image';
import { Quote } from 'lucide-react';
import { Language } from '@/lib/types';
import { Translation } from '@/lib/translations';

interface EditorNoteContent {
  title?: string;
  name?: string;
  role?: string;
  message?: string;
  image?: string;
}

interface EditorNoteSectionProps {
  lang: Language;
  t: Translation;
  content?: EditorNoteContent;
}

export function EditorNoteSection({ lang, t, content: apiContent }: EditorNoteSectionProps) {
  const editorContent = {
    fr: {
      title: "Note de l'Editeur",
      name: 'Dr Conrad Ntoh Nkuo',
      role: 'Secretaire Permanent',
      message: `Bienvenue sur la Plateforme Une Seule Sante du Cameroun. Ensemble, construisons un avenir plus sain pour notre nation.`,
    },
    en: {
      title: "Editor's Note",
      name: 'Dr Conrad Ntoh Nkuo',
      role: 'Permanent Secretary',
      message: `Welcome to the One Health Cameroon Platform. Together, let's build a healthier future for our nation.`,
    },
  };

  const fallback = editorContent[lang];
  const content = {
    title: apiContent?.title || fallback.title,
    name: apiContent?.name || fallback.name,
    role: apiContent?.role || fallback.role,
    message: apiContent?.message || fallback.message,
    image: apiContent?.image || '/images/note_editeur.jpg',
  };

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl h-[500px] flex flex-col">
      {/* Header */}
      <div className="bg-red-600 px-6 py-3">
        <h3 className="text-white font-bold text-lg tracking-wide uppercase">
          {content.title}
        </h3>
      </div>

      {/* Image Section - Top */}
      <div className="relative h-48 flex-shrink-0">
        <Image
          src={content.image}
          alt={content.name}
          fill
          className="object-cover object-top"
        />
      </div>

      {/* Content Section - Bottom */}
      <div className="flex-1 bg-gradient-to-b from-emerald-700 to-emerald-900 p-5 flex flex-col">
        {/* Name & Role */}
        <div className="text-center mb-3">
          <h4 className="text-white font-bold text-lg">{content.name}</h4>
          <p className="text-emerald-300 text-sm font-medium">{content.role}</p>
        </div>

        {/* Quote Icon */}
        <div className="flex justify-center mb-2">
          <Quote className="text-emerald-400/60" size={24} />
        </div>

        {/* Message */}
        <p className="text-white/85 text-sm leading-relaxed text-center italic flex-1">
          {content.message}
        </p>

        {/* Decorative Line */}
        <div className="flex justify-center mt-3">
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-full" />
        </div>
      </div>
    </div>
  );
}
