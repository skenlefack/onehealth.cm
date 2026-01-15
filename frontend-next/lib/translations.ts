import { Language } from './types';

export interface Translation {
  nav: {
    home: string;
    about: string;
    news: string;
    zoonoses: string;
    contact: string;
  };
  hero: {
    badge: string;
    title1: string;
    title2: string;
    description: string;
    discover: string;
    news: string;
    ministries: string;
    zoonoses: string;
    partners: string;
  };
  pillars: {
    badge: string;
    title: string;
    subtitle: string;
    human: {
      title: string;
      description: string;
      features: string[];
    };
    animal: {
      title: string;
      description: string;
      features: string[];
    };
    environment: {
      title: string;
      description: string;
      features: string[];
    };
  };
  zoonoses: {
    badge: string;
    title: string;
    subtitle: string;
    cases: string;
    rabies: { name: string; description: string; status: string };
    avianFlu: { name: string; description: string; status: string };
    bovineTB: { name: string; description: string; status: string };
    anthrax: { name: string; description: string; status: string };
    ebola: { name: string; description: string; status: string };
  };
  news: {
    badge: string;
    title: string;
    subtitle: string;
    viewAll: string;
    noNews: string;
  };
  cta: {
    title: string;
    description: string;
    button: string;
  };
  partners: {
    title: string;
  };
  footer: {
    description: string;
    navigation: string;
    zoonoses: string;
    newsletter: string;
    newsletterDesc: string;
    emailPlaceholder: string;
    privacy: string;
    legal: string;
    rights: string;
  };
  about: {
    badge: string;
    title: string;
    p1: string;
    p2: string;
    p3: string;
  };
  contact: {
    badge: string;
    title: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    send: string;
    success: string;
    error: string;
  };
  common: {
    back: string;
    notFound: string;
    views: string;
    readMore: string;
    loading: string;
  };
  elearning: {
    badge: string;
    title: string;
    subtitle: string;
    description: string;
    catalog: string;
    myCourses: string;
    paths: string;
    certificates: string;
    allCourses: string;
    allPaths: string;
    searchPlaceholder: string;
    filterByCategory: string;
    filterByLevel: string;
    allCategories: string;
    allLevels: string;
    beginner: string;
    intermediate: string;
    advanced: string;
    duration: string;
    hours: string;
    modules: string;
    lessons: string;
    students: string;
    enrolled: string;
    enroll: string;
    enrollFree: string;
    continue: string;
    start: string;
    completed: string;
    inProgress: string;
    progress: string;
    curriculum: string;
    about: string;
    objectives: string;
    prerequisites: string;
    instructor: string;
    noCourses: string;
    noPaths: string;
    noEnrollments: string;
    loginToEnroll: string;
    courseCompleted: string;
    certificateEarned: string;
    viewCertificate: string;
    downloadCertificate: string;
    verifyCertificate: string;
    certificateValid: string;
    certificateInvalid: string;
    issuedOn: string;
    expiresOn: string;
    recipientName: string;
    verificationCode: string;
    lesson: string;
    video: string;
    text: string;
    pdf: string;
    quiz: string;
    prevLesson: string;
    nextLesson: string;
    markComplete: string;
    pathCourses: string;
    pathDescription: string;
    requiredCourses: string;
    optionalCourses: string;
  };
  landing: {
    selectLanguage: string;
    slides: {
      title: string;
      subtitle: string;
      description: string;
    }[];
  };
}

export const translations: Record<Language, Translation> = {
  fr: {
    nav: {
      home: 'Accueil',
      about: 'À propos',
      news: 'Actualités',
      zoonoses: 'Zoonoses',
      contact: 'Contact',
    },
    hero: {
      badge: 'Plateforme Nationale Active',
      title1: 'Une Seule Santé',
      title2: 'pour le Cameroun',
      description: "Une approche collaborative reconnaissant l'interconnexion entre la santé humaine, animale et environnementale.",
      discover: 'Découvrir',
      news: 'Actualités',
      ministries: 'Ministères',
      zoonoses: 'Zoonoses',
      partners: 'Partenaires',
    },
    pillars: {
      badge: 'Notre Approche',
      title: 'Les Trois Piliers One Health',
      subtitle: 'Une approche intégrée reconnaissant que la santé humaine, animale et environnementale sont interconnectées',
      human: {
        title: 'Santé Humaine',
        description: 'Surveillance et prévention des maladies transmissibles, vaccination et sensibilisation.',
        features: ['Surveillance épidémiologique', 'Campagnes de vaccination', 'Éducation sanitaire'],
      },
      animal: {
        title: 'Santé Animale',
        description: 'Contrôle des zoonoses, surveillance du bétail et des animaux sauvages.',
        features: ['Contrôle des zoonoses', 'Santé du bétail', 'Surveillance faune'],
      },
      environment: {
        title: 'Environnement',
        description: "Protection des écosystèmes, qualité de l'eau et biodiversité.",
        features: ['Protection écosystèmes', "Qualité de l'eau", 'Biodiversité'],
      },
    },
    zoonoses: {
      badge: 'Surveillance',
      title: 'Zoonoses Prioritaires',
      subtitle: 'Les maladies sous surveillance active',
      cases: 'cas',
      rabies: { name: 'Rage', description: 'Maladie virale mortelle transmise par morsure', status: 'Surveillance' },
      avianFlu: { name: 'Grippe Aviaire', description: 'Virus influenza affectant les volailles', status: 'Contrôlé' },
      bovineTB: { name: 'Tuberculose Bovine', description: 'Infection bactérienne du bétail', status: 'En cours' },
      anthrax: { name: 'Anthrax', description: 'Maladie bactérienne grave', status: 'Alerte' },
      ebola: { name: 'Ebola', description: 'Fièvre hémorragique virale', status: 'Préparation' },
    },
    news: {
      badge: 'Actualités',
      title: 'Dernières Publications',
      subtitle: 'Restez informé des activités One Health',
      viewAll: 'Voir tout',
      noNews: 'Aucune publication.',
    },
    platforms: {
      badge: 'Nos Plateformes',
      title: 'Explorez nos Outils',
      subtitle: 'Découvrez les plateformes One Health Cameroun',
      ohwrMapping: {
        title: 'OHWR-Mapping',
        description: 'Cartographie des ressources One Health : experts, organisations, matériels et documents à travers le Cameroun.',
        button: 'Explorer la carte',
      },
      elearning: {
        title: 'OH E-Learning',
        description: 'Plateforme de formation en ligne sur l\'approche One Health, les zoonoses et la santé globale.',
        button: 'Accéder aux cours',
      },
      cohrm: {
        title: 'COHRM-SYSTEM',
        description: 'Système de gestion des rumeurs One Health Cameroun pour la détection précoce des menaces sanitaires.',
        button: 'Signaler une rumeur',
      },
    },
    cta: {
      title: 'Explorez nos Plateformes',
      description: 'Découvrez les outils One Health Cameroun.',
      button: 'En savoir plus',
    },
    partners: {
      title: 'Nos Partenaires',
    },
    footer: {
      description: 'Plateforme nationale de surveillance des zoonoses One Health Cameroun.',
      navigation: 'Navigation',
      zoonoses: 'Zoonoses',
      newsletter: 'Newsletter',
      newsletterDesc: 'Recevez nos actualités',
      emailPlaceholder: 'Votre email',
      privacy: 'Confidentialité',
      legal: 'Mentions légales',
      rights: 'Tous droits réservés',
    },
    about: {
      badge: 'À propos',
      title: 'One Health Cameroun',
      p1: "One Health Cameroun est la plateforme nationale dédiée à l'approche \"Une Seule Santé\".",
      p2: 'Notre mission est de promouvoir la collaboration intersectorielle.',
      p3: "Cette approche reconnaît l'interconnexion santé humaine, animale et environnementale.",
    },
    contact: {
      badge: 'Contact',
      title: 'Nous Contacter',
      name: 'Nom',
      email: 'Email',
      subject: 'Sujet',
      message: 'Message...',
      send: 'Envoyer',
      success: 'Message envoyé avec succès!',
      error: 'Erreur lors de l\'envoi du message.',
    },
    common: {
      back: 'Retour',
      notFound: 'Non trouvé',
      views: 'vues',
      readMore: 'Lire la suite',
      loading: 'Chargement...',
    },
    elearning: {
      badge: 'E-Learning',
      title: 'OH E-Learning',
      subtitle: 'Plateforme de Formation One Health',
      description: 'Développez vos compétences en santé globale avec nos cours en ligne conçus par des experts One Health.',
      catalog: 'Catalogue',
      myCourses: 'Mes cours',
      paths: 'Parcours',
      certificates: 'Certificats',
      allCourses: 'Tous les cours',
      allPaths: 'Tous les parcours',
      searchPlaceholder: 'Rechercher un cours...',
      filterByCategory: 'Filtrer par catégorie',
      filterByLevel: 'Filtrer par niveau',
      allCategories: 'Toutes les catégories',
      allLevels: 'Tous les niveaux',
      beginner: 'Débutant',
      intermediate: 'Intermédiaire',
      advanced: 'Avancé',
      duration: 'Durée',
      hours: 'heures',
      modules: 'modules',
      lessons: 'leçons',
      students: 'apprenants',
      enrolled: 'Inscrit',
      enroll: "S'inscrire",
      enrollFree: "S'inscrire gratuitement",
      continue: 'Continuer',
      start: 'Commencer',
      completed: 'Terminé',
      inProgress: 'En cours',
      progress: 'Progression',
      curriculum: 'Programme',
      about: 'À propos',
      objectives: 'Objectifs',
      prerequisites: 'Prérequis',
      instructor: 'Formateur',
      noCourses: 'Aucun cours disponible',
      noPaths: 'Aucun parcours disponible',
      noEnrollments: "Vous n'êtes inscrit à aucun cours",
      loginToEnroll: 'Connectez-vous pour vous inscrire',
      courseCompleted: 'Cours terminé !',
      certificateEarned: 'Certificat obtenu',
      viewCertificate: 'Voir le certificat',
      downloadCertificate: 'Télécharger',
      verifyCertificate: 'Vérifier un certificat',
      certificateValid: 'Certificat valide',
      certificateInvalid: 'Certificat invalide',
      issuedOn: 'Délivré le',
      expiresOn: 'Expire le',
      recipientName: 'Nom du titulaire',
      verificationCode: 'Code de vérification',
      lesson: 'Leçon',
      video: 'Vidéo',
      text: 'Texte',
      pdf: 'PDF',
      quiz: 'Quiz',
      prevLesson: 'Leçon précédente',
      nextLesson: 'Leçon suivante',
      markComplete: 'Marquer comme terminé',
      pathCourses: 'Cours du parcours',
      pathDescription: 'Description du parcours',
      requiredCourses: 'Cours obligatoires',
      optionalCourses: 'Cours optionnels',
    },
    landing: {
      selectLanguage: 'Choisissez votre langue • Choose your language',
      slides: [
        { title: 'Une Seule Santé', subtitle: 'One Health', description: "Reconnaître l'interconnexion entre la santé humaine, animale et environnementale" },
        { title: 'Surveillance des Zoonoses', subtitle: 'Zoonoses Surveillance', description: 'Prévention et contrôle des maladies transmissibles entre animaux et humains' },
        { title: 'Collaboration Multisectorielle', subtitle: 'Multisectoral Collaboration', description: '9 ministères travaillant ensemble pour la santé de tous' },
        { title: 'Santé Humaine', subtitle: 'Human Health', description: 'Protection de la santé publique par la surveillance épidémiologique' },
        { title: 'Santé Animale', subtitle: 'Animal Health', description: 'Contrôle des maladies du bétail et de la faune sauvage' },
        { title: 'Environnement Sain', subtitle: 'Healthy Environment', description: 'Préservation des écosystèmes pour une santé durable' },
      ],
    },
  },
  en: {
    nav: {
      home: 'Home',
      about: 'About',
      news: 'News',
      zoonoses: 'Zoonoses',
      contact: 'Contact',
    },
    hero: {
      badge: 'Active National Platform',
      title1: 'One Health',
      title2: 'for Cameroon',
      description: 'A collaborative approach recognizing the interconnection between human, animal and environmental health.',
      discover: 'Discover',
      news: 'News',
      ministries: 'Ministries',
      zoonoses: 'Zoonoses',
      partners: 'Partners',
    },
    pillars: {
      badge: 'Our Approach',
      title: 'The Three One Health Pillars',
      subtitle: 'An integrated approach recognizing that human, animal and environmental health are interconnected',
      human: {
        title: 'Human Health',
        description: 'Surveillance and prevention of communicable diseases, vaccination and awareness.',
        features: ['Epidemiological surveillance', 'Vaccination campaigns', 'Health education'],
      },
      animal: {
        title: 'Animal Health',
        description: 'Zoonoses control, livestock and wildlife surveillance.',
        features: ['Zoonoses control', 'Livestock health', 'Wildlife surveillance'],
      },
      environment: {
        title: 'Environment',
        description: 'Ecosystem protection, water quality and biodiversity.',
        features: ['Ecosystem protection', 'Water quality', 'Biodiversity'],
      },
    },
    zoonoses: {
      badge: 'Surveillance',
      title: 'Priority Zoonoses',
      subtitle: 'Diseases under active surveillance',
      cases: 'cases',
      rabies: { name: 'Rabies', description: 'Fatal viral disease transmitted by bites', status: 'Surveillance' },
      avianFlu: { name: 'Avian Flu', description: 'Influenza virus affecting poultry', status: 'Controlled' },
      bovineTB: { name: 'Bovine TB', description: 'Bacterial infection from cattle', status: 'Ongoing' },
      anthrax: { name: 'Anthrax', description: 'Serious bacterial disease', status: 'Alert' },
      ebola: { name: 'Ebola', description: 'Viral hemorrhagic fever', status: 'Preparedness' },
    },
    news: {
      badge: 'News',
      title: 'Latest Publications',
      subtitle: 'Stay informed about One Health activities',
      viewAll: 'View all',
      noNews: 'No publications.',
    },
    platforms: {
      badge: 'Our Platforms',
      title: 'Explore our Tools',
      subtitle: 'Discover One Health Cameroon platforms',
      ohwrMapping: {
        title: 'OHWR-Mapping',
        description: 'Mapping of One Health resources: experts, organizations, equipment and documents across Cameroon.',
        button: 'Explore the map',
      },
      elearning: {
        title: 'OH E-Learning',
        description: 'Online training platform on One Health approach, zoonoses and global health.',
        button: 'Access courses',
      },
      cohrm: {
        title: 'COHRM-SYSTEM',
        description: 'Cameroon One Health Rumor Management System for early detection of health threats.',
        button: 'Report a rumor',
      },
    },
    cta: {
      title: 'Explore our Platforms',
      description: 'Discover One Health Cameroon tools.',
      button: 'Learn more',
    },
    partners: {
      title: 'Our Partners',
    },
    footer: {
      description: 'National platform for zoonoses surveillance One Health Cameroon.',
      navigation: 'Navigation',
      zoonoses: 'Zoonoses',
      newsletter: 'Newsletter',
      newsletterDesc: 'Receive our news',
      emailPlaceholder: 'Your email',
      privacy: 'Privacy',
      legal: 'Legal notice',
      rights: 'All rights reserved',
    },
    about: {
      badge: 'About',
      title: 'One Health Cameroon',
      p1: 'One Health Cameroon is the national platform dedicated to the "One Health" approach.',
      p2: 'Our mission is to promote intersectoral collaboration.',
      p3: 'This approach recognizes the interconnection of human, animal and environmental health.',
    },
    contact: {
      badge: 'Contact',
      title: 'Contact Us',
      name: 'Name',
      email: 'Email',
      subject: 'Subject',
      message: 'Message...',
      send: 'Send',
      success: 'Message sent successfully!',
      error: 'Error sending message.',
    },
    common: {
      back: 'Back',
      notFound: 'Not found',
      views: 'views',
      readMore: 'Read more',
      loading: 'Loading...',
    },
    elearning: {
      badge: 'E-Learning',
      title: 'OH E-Learning',
      subtitle: 'One Health Training Platform',
      description: 'Develop your global health skills with our online courses designed by One Health experts.',
      catalog: 'Catalog',
      myCourses: 'My courses',
      paths: 'Learning Paths',
      certificates: 'Certificates',
      allCourses: 'All courses',
      allPaths: 'All learning paths',
      searchPlaceholder: 'Search for a course...',
      filterByCategory: 'Filter by category',
      filterByLevel: 'Filter by level',
      allCategories: 'All categories',
      allLevels: 'All levels',
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      duration: 'Duration',
      hours: 'hours',
      modules: 'modules',
      lessons: 'lessons',
      students: 'students',
      enrolled: 'Enrolled',
      enroll: 'Enroll',
      enrollFree: 'Enroll for free',
      continue: 'Continue',
      start: 'Start',
      completed: 'Completed',
      inProgress: 'In progress',
      progress: 'Progress',
      curriculum: 'Curriculum',
      about: 'About',
      objectives: 'Objectives',
      prerequisites: 'Prerequisites',
      instructor: 'Instructor',
      noCourses: 'No courses available',
      noPaths: 'No learning paths available',
      noEnrollments: 'You are not enrolled in any course',
      loginToEnroll: 'Login to enroll',
      courseCompleted: 'Course completed!',
      certificateEarned: 'Certificate earned',
      viewCertificate: 'View certificate',
      downloadCertificate: 'Download',
      verifyCertificate: 'Verify a certificate',
      certificateValid: 'Valid certificate',
      certificateInvalid: 'Invalid certificate',
      issuedOn: 'Issued on',
      expiresOn: 'Expires on',
      recipientName: 'Recipient name',
      verificationCode: 'Verification code',
      lesson: 'Lesson',
      video: 'Video',
      text: 'Text',
      pdf: 'PDF',
      quiz: 'Quiz',
      prevLesson: 'Previous lesson',
      nextLesson: 'Next lesson',
      markComplete: 'Mark as complete',
      pathCourses: 'Path courses',
      pathDescription: 'Path description',
      requiredCourses: 'Required courses',
      optionalCourses: 'Optional courses',
    },
    landing: {
      selectLanguage: 'Choisissez votre langue • Choose your language',
      slides: [
        { title: 'One Health', subtitle: 'Une Seule Santé', description: 'Recognizing the interconnection between human, animal and environmental health' },
        { title: 'Zoonoses Surveillance', subtitle: 'Surveillance des Zoonoses', description: 'Prevention and control of diseases transmissible between animals and humans' },
        { title: 'Multisectoral Collaboration', subtitle: 'Collaboration Multisectorielle', description: '9 ministries working together for everyone\'s health' },
        { title: 'Human Health', subtitle: 'Santé Humaine', description: 'Public health protection through epidemiological surveillance' },
        { title: 'Animal Health', subtitle: 'Santé Animale', description: 'Control of livestock and wildlife diseases' },
        { title: 'Healthy Environment', subtitle: 'Environnement Sain', description: 'Preserving ecosystems for sustainable health' },
      ],
    },
  },
};

export function getTranslation(lang: Language): Translation {
  return translations[lang] || translations.fr;
}

export function isValidLanguage(lang: string): lang is Language {
  return lang === 'fr' || lang === 'en';
}

export const defaultLanguage: Language = 'fr';
export const supportedLanguages: Language[] = ['fr', 'en'];
