'use client';

import { BookOpen, Award, Clock, TrendingUp } from 'lucide-react';
import { Language } from '@/lib/types';

interface DashboardStatsProps {
  lang: Language;
  stats: {
    enrolledCourses: number;
    completedCourses: number;
    certificatesEarned: number;
    totalHours: number;
    averageProgress: number;
  };
}

const translations = {
  fr: {
    enrolledCourses: 'Cours inscrits',
    completedCourses: 'Cours terminés',
    certificates: 'Certificats',
    totalHours: 'Heures de formation',
    averageProgress: 'Progression moyenne',
  },
  en: {
    enrolledCourses: 'Enrolled Courses',
    completedCourses: 'Completed Courses',
    certificates: 'Certificates',
    totalHours: 'Training Hours',
    averageProgress: 'Average Progress',
  },
};

export function DashboardStats({ lang, stats }: DashboardStatsProps) {
  const t = translations[lang];

  const statItems = [
    {
      label: t.enrolledCourses,
      value: stats.enrolledCourses,
      icon: BookOpen,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: t.completedCourses,
      value: stats.completedCourses,
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      label: t.certificates,
      value: stats.certificatesEarned,
      icon: Award,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
    },
    {
      label: t.totalHours,
      value: stats.totalHours,
      suffix: 'h',
      icon: Clock,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${item.bgColor}`}>
              <item.icon className={`h-6 w-6 ${item.color.replace('bg-', 'text-')}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {item.value}
                {item.suffix && <span className="text-lg">{item.suffix}</span>}
              </p>
              <p className="text-sm text-gray-500">{item.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
