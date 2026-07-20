import { Metadata } from 'next';
import { Language } from '@/lib/types';
import { isValidLanguage } from '@/lib/translations';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;

  const titles = {
    fr: "Conditions d'utilisation | COHRM - One Health Cameroun",
    en: 'Terms of Service | COHRM - One Health Cameroon',
  };

  const descriptions = {
    fr: "Conditions d'utilisation de l'application mobile COHRM - Cameroon One Health Rumor Management.",
    en: 'Terms of Service for the COHRM mobile application - Cameroon One Health Rumor Management.',
  };

  return {
    title: titles[lang as Language] || titles.fr,
    description: descriptions[lang as Language] || descriptions.fr,
  };
}

const content = {
  fr: {
    title: "Conditions d'Utilisation",
    subtitle: 'Application mobile COHRM',
    lastUpdated: 'Dernière mise à jour : 20 juillet 2026',
    sections: [
      {
        heading: '1. Acceptation des conditions',
        body: `En téléchargeant, installant ou utilisant l'application mobile COHRM (Cameroon One Health Rumor Management), vous acceptez d'être lié par les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.

L'application COHRM est éditée par le Programme Zoonoses / One Health Cameroun, ci-après dénommé "l'Éditeur".`,
      },
      {
        heading: '2. Description du service',
        body: `COHRM est une application de signalement et de suivi des rumeurs et événements sanitaires au Cameroun, dans le cadre de l'approche "Une Seule Santé" (One Health). L'application permet :

- De signaler des rumeurs et événements sanitaires (santé humaine, animale, environnementale)
- De géolocaliser les signalements pour faciliter l'intervention
- De suivre l'état de traitement des signalements soumis
- De consulter les statistiques et tableaux de bord de surveillance
- De participer au processus de validation et d'évaluation des risques (utilisateurs autorisés)
- De scanner automatiquement les sources en ligne pour détecter des rumeurs sanitaires (utilisateurs autorisés)`,
      },
      {
        heading: '3. Conditions d\'accès',
        body: `**Utilisateurs enregistrés :** Certaines fonctionnalités (tableau de bord, validation, scanner) nécessitent un compte utilisateur fourni par l'administration du Programme One Health. Vous êtes responsable de la confidentialité de vos identifiants de connexion.

**Signalement public :** L'application permet aux citoyens de soumettre des signalements sanitaires sans créer de compte, en fournissant un numéro de téléphone valide.

**Conditions techniques :** L'application nécessite Android 7.0 (API 24) ou supérieur, ou iOS 17.0 ou supérieur. Une connexion Internet est requise pour la synchronisation des données.`,
      },
      {
        heading: '4. Utilisation acceptable',
        body: `En utilisant l'application COHRM, vous vous engagez à :

- Fournir des informations véridiques et aussi précises que possible dans vos signalements
- Ne pas soumettre de faux signalements de manière intentionnelle
- Ne pas utiliser l'application à des fins diffamatoires, discriminatoires ou illégales
- Ne pas tenter de compromettre la sécurité de l'application ou de ses serveurs
- Ne pas collecter ou extraire les données d'autres utilisateurs
- Ne pas redistribuer, copier ou modifier l'application sans autorisation
- Respecter la confidentialité des informations auxquelles vous avez accès dans le cadre de vos fonctions`,
      },
      {
        heading: '5. Exactitude des données',
        body: `Les signalements soumis via l'application COHRM sont soumis à un processus de vérification et de validation par les autorités sanitaires compétentes. L'Éditeur :

- Ne garantit pas l'exactitude des signalements soumis par les utilisateurs avant leur validation
- Se réserve le droit de modifier, reclasser ou rejeter tout signalement
- Encourage les utilisateurs à fournir les informations les plus précises et détaillées possibles, y compris des photos et des coordonnées GPS
- Peut contacter le déclarant pour obtenir des informations complémentaires`,
      },
      {
        heading: '6. Propriété intellectuelle',
        body: `L'application COHRM, son code source, son design, ses logos et son contenu sont la propriété du Programme Zoonoses / One Health Cameroun. Toute reproduction, distribution ou modification non autorisée est interdite.

Les données de signalement soumises par les utilisateurs deviennent la propriété du Programme One Health pour les besoins de la surveillance sanitaire, conformément à la politique de confidentialité.`,
      },
      {
        heading: '7. Responsabilités de l\'utilisateur',
        body: `L'utilisateur est responsable :

- De l'exactitude des informations qu'il fournit
- De la sécurité de ses identifiants de connexion
- Du respect des lois et réglementations applicables au Cameroun
- De l'obtention des autorisations nécessaires pour prendre et partager des photos (respect du droit à l'image)
- De l'utilisation appropriée des permissions accordées à l'application (caméra, localisation, galerie)`,
      },
      {
        heading: '8. Limitation de responsabilité',
        body: `L'Éditeur s'efforce de maintenir l'application fonctionnelle et accessible, mais ne garantit pas :

- La disponibilité continue et ininterrompue du service
- L'absence d'erreurs ou de bugs dans l'application
- La compatibilité avec tous les appareils et systèmes d'exploitation
- La sécurité absolue contre les intrusions ou les pertes de données

L'Éditeur ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation ou de l'impossibilité d'utiliser l'application, y compris la perte de données ou l'interruption de service.`,
      },
      {
        heading: '9. Suspension et résiliation',
        body: `L'Éditeur se réserve le droit de :

- Suspendre ou désactiver un compte utilisateur en cas de violation des présentes conditions
- Supprimer tout contenu jugé inapproprié, faux ou nuisible
- Modifier ou interrompre le service à tout moment, avec ou sans préavis
- Révoquer l'accès aux fonctionnalités avancées (scanner, validation) à sa discrétion

En cas de résiliation, les données personnelles seront traitées conformément à la politique de confidentialité.`,
      },
      {
        heading: '10. Mises à jour',
        body: `L'Éditeur peut publier des mises à jour de l'application pour corriger des bugs, améliorer les fonctionnalités ou renforcer la sécurité. Il est recommandé de maintenir l'application à jour pour bénéficier des dernières améliorations et corrections de sécurité.

Certaines mises à jour peuvent être obligatoires pour continuer à utiliser le service.`,
      },
      {
        heading: '11. Confidentialité',
        body: `La collecte et le traitement de vos données personnelles sont régis par notre Politique de Confidentialité, disponible à l'adresse suivante : https://onehealth.cm/fr/privacy-policy

Nous vous invitons à la consulter pour comprendre comment vos données sont collectées, utilisées et protégées.`,
      },
      {
        heading: '12. Droit applicable',
        body: `Les présentes conditions d'utilisation sont régies par le droit camerounais. Tout litige relatif à l'utilisation de l'application sera soumis à la juridiction compétente au Cameroun.`,
      },
      {
        heading: '13. Modifications des conditions',
        body: `L'Éditeur se réserve le droit de modifier les présentes conditions à tout moment. Les modifications prendront effet dès leur publication dans l'application. L'utilisation continue de l'application après la publication de modifications constitue votre acceptation de ces modifications.`,
      },
      {
        heading: '14. Contact',
        body: `Pour toute question concernant les présentes conditions d'utilisation :

- **E-mail :** contact@onehealth.cm
- **Site web :** https://onehealth.cm
- **Organisation :** Programme Zoonoses / One Health Cameroun`,
      },
    ],
  },
  en: {
    title: 'Terms of Service',
    subtitle: 'COHRM Mobile Application',
    lastUpdated: 'Last updated: July 20, 2026',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        body: `By downloading, installing, or using the COHRM (Cameroon One Health Rumor Management) mobile application, you agree to be bound by these terms of service. If you do not accept these terms, please do not use the application.

The COHRM application is published by Programme Zoonoses / One Health Cameroon, hereinafter referred to as "the Publisher".`,
      },
      {
        heading: '2. Description of Service',
        body: `COHRM is an application for reporting and tracking health rumors and events in Cameroon, within the framework of the "One Health" approach. The application allows:

- Reporting health rumors and events (human, animal, and environmental health)
- Geolocating reports to facilitate intervention
- Tracking the processing status of submitted reports
- Viewing surveillance statistics and dashboards
- Participating in the validation and risk assessment process (authorized users)
- Automatically scanning online sources to detect health rumors (authorized users)`,
      },
      {
        heading: '3. Access Conditions',
        body: `**Registered Users:** Certain features (dashboard, validation, scanner) require a user account provided by the One Health Programme administration. You are responsible for the confidentiality of your login credentials.

**Public Reporting:** The application allows citizens to submit health reports without creating an account, by providing a valid phone number.

**Technical Requirements:** The application requires Android 7.0 (API 24) or higher, or iOS 17.0 or higher. An Internet connection is required for data synchronization.`,
      },
      {
        heading: '4. Acceptable Use',
        body: `By using the COHRM application, you agree to:

- Provide truthful and accurate information in your reports to the best of your ability
- Not submit false reports intentionally
- Not use the application for defamatory, discriminatory, or illegal purposes
- Not attempt to compromise the security of the application or its servers
- Not collect or extract data from other users
- Not redistribute, copy, or modify the application without authorization
- Respect the confidentiality of information accessible to you within the scope of your duties`,
      },
      {
        heading: '5. Data Accuracy',
        body: `Reports submitted through the COHRM application undergo a verification and validation process by the competent health authorities. The Publisher:

- Does not guarantee the accuracy of reports submitted by users before validation
- Reserves the right to modify, reclassify, or reject any report
- Encourages users to provide the most accurate and detailed information possible, including photos and GPS coordinates
- May contact the reporter to obtain additional information`,
      },
      {
        heading: '6. Intellectual Property',
        body: `The COHRM application, its source code, design, logos, and content are the property of Programme Zoonoses / One Health Cameroon. Any unauthorized reproduction, distribution, or modification is prohibited.

Report data submitted by users becomes the property of the One Health Programme for health surveillance purposes, in accordance with the privacy policy.`,
      },
      {
        heading: '7. User Responsibilities',
        body: `The user is responsible for:

- The accuracy of the information they provide
- The security of their login credentials
- Compliance with applicable laws and regulations in Cameroon
- Obtaining the necessary permissions to take and share photos (respect for image rights)
- Appropriate use of permissions granted to the application (camera, location, gallery)`,
      },
      {
        heading: '8. Limitation of Liability',
        body: `The Publisher strives to maintain the application as functional and accessible, but does not guarantee:

- Continuous and uninterrupted service availability
- The absence of errors or bugs in the application
- Compatibility with all devices and operating systems
- Absolute security against intrusions or data loss

The Publisher shall not be held liable for direct or indirect damages resulting from the use or inability to use the application, including data loss or service interruption.`,
      },
      {
        heading: '9. Suspension and Termination',
        body: `The Publisher reserves the right to:

- Suspend or deactivate a user account in case of violation of these terms
- Remove any content deemed inappropriate, false, or harmful
- Modify or discontinue the service at any time, with or without notice
- Revoke access to advanced features (scanner, validation) at its discretion

In case of termination, personal data will be handled in accordance with the privacy policy.`,
      },
      {
        heading: '10. Updates',
        body: `The Publisher may release application updates to fix bugs, improve features, or enhance security. It is recommended to keep the application up to date to benefit from the latest improvements and security fixes.

Some updates may be mandatory to continue using the service.`,
      },
      {
        heading: '11. Privacy',
        body: `The collection and processing of your personal data is governed by our Privacy Policy, available at: https://onehealth.cm/en/privacy-policy

We invite you to review it to understand how your data is collected, used, and protected.`,
      },
      {
        heading: '12. Governing Law',
        body: `These terms of service are governed by Cameroonian law. Any dispute relating to the use of the application shall be submitted to the competent jurisdiction in Cameroon.`,
      },
      {
        heading: '13. Changes to Terms',
        body: `The Publisher reserves the right to modify these terms at any time. Changes will take effect upon publication in the application. Continued use of the application after the publication of changes constitutes your acceptance of those changes.`,
      },
      {
        heading: '14. Contact',
        body: `For any questions regarding these terms of service:

- **Email:** contact@onehealth.cm
- **Website:** https://onehealth.cm
- **Organization:** Programme Zoonoses / One Health Cameroon`,
      },
    ],
  },
};

export default async function TermsOfServicePage({ params }: PageProps) {
  const { lang } = await params;

  if (!isValidLanguage(lang)) {
    notFound();
  }

  const t = content[lang as Language] || content.fr;

  return (
    <section className="pt-32 pb-20 px-[5%] bg-oh-background min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-oh-dark mb-2">{t.title}</h1>
          <p className="text-lg text-oh-dark-gray">{t.subtitle}</p>
          <p className="text-sm text-oh-gray mt-2">{t.lastUpdated}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
          {t.sections.map((section, index) => (
            <div key={index}>
              <h2 className="text-xl font-semibold text-oh-dark mb-4">
                {section.heading}
              </h2>
              <div className="text-oh-dark-gray leading-relaxed whitespace-pre-line prose prose-sm max-w-none">
                {section.body.split('\n').map((paragraph, pIndex) => (
                  <p key={pIndex} className="mb-2">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 space-y-2">
          <p className="text-sm text-oh-gray">
            <Link
              href={`/${lang}/privacy-policy`}
              className="text-oh-green hover:underline"
            >
              {lang === 'fr'
                ? 'Consulter la politique de confidentialité'
                : 'View the privacy policy'}
            </Link>
          </p>
          <p className="text-sm text-oh-gray">
            {lang === 'fr'
              ? 'Programme Zoonoses / One Health Cameroun'
              : 'Programme Zoonoses / One Health Cameroon'}{' '}
            &mdash;{' '}
            <a
              href="https://onehealth.cm"
              className="text-oh-green hover:underline"
            >
              onehealth.cm
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
