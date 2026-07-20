import { Metadata } from 'next';
import { Language } from '@/lib/types';
import { isValidLanguage } from '@/lib/translations';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;

  const titles = {
    fr: 'Politique de confidentialité | COHRM - One Health Cameroun',
    en: 'Privacy Policy | COHRM - One Health Cameroon',
  };

  const descriptions = {
    fr: "Politique de confidentialité de l'application mobile COHRM - Cameroon One Health Rumor Management.",
    en: 'Privacy Policy for the COHRM mobile application - Cameroon One Health Rumor Management.',
  };

  return {
    title: titles[lang as Language] || titles.fr,
    description: descriptions[lang as Language] || descriptions.fr,
  };
}

const content = {
  fr: {
    title: 'Politique de Confidentialité',
    subtitle: 'Application mobile COHRM',
    lastUpdated: 'Dernière mise à jour : 20 juillet 2026',
    sections: [
      {
        heading: '1. Introduction',
        body: `Le Programme Zoonoses / One Health Cameroun ("nous", "notre") exploite l'application mobile COHRM (Cameroon One Health Rumor Management). Cette politique de confidentialité décrit comment nous collectons, utilisons, stockons et protégeons vos informations personnelles lorsque vous utilisez notre application.

En utilisant l'application COHRM, vous acceptez les pratiques décrites dans la présente politique de confidentialité.`,
      },
      {
        heading: '2. Données collectées',
        body: `Nous collectons les catégories de données suivantes :

**Données d'identification :**
- Nom, prénom et adresse e-mail (lors de la création de compte)
- Numéro de téléphone (requis pour les signalements publics)
- Identifiant de connexion et mot de passe (chiffré)

**Données de localisation :**
- Coordonnées GPS (latitude/longitude) lors de la soumission d'un signalement sanitaire
- Région, département, district et arrondissement sélectionnés manuellement

**Photos et médias :**
- Photos prises via l'appareil photo ou sélectionnées dans la galerie pour illustrer un signalement
- Métadonnées associées aux photos (date, heure)

**Données techniques :**
- Identifiant unique de l'appareil
- Version de l'application et du système d'exploitation
- Journaux de synchronisation et horodatages

**Données de signalement :**
- Description de l'événement sanitaire, catégorie, espèces concernées, symptômes observés
- Commentaires et évaluations des risques`,
      },
      {
        heading: '3. Utilisation des données',
        body: `Vos données sont utilisées exclusivement aux fins suivantes :

- **Surveillance sanitaire :** Permettre aux autorités de santé publique de détecter, suivre et répondre aux rumeurs et événements sanitaires au Cameroun
- **Géolocalisation des événements :** Localiser précisément les signalements pour faciliter l'intervention rapide des équipes de terrain
- **Communication :** Vous envoyer des notifications concernant le suivi de vos signalements et les alertes sanitaires
- **Amélioration du service :** Analyser les tendances pour améliorer la surveillance épidémiologique
- **Rapports agrégés :** Produire des statistiques anonymisées pour les rapports de santé publique`,
      },
      {
        heading: '4. Base légale du traitement',
        body: `Le traitement de vos données repose sur :

- **L'intérêt public :** La surveillance des menaces sanitaires relève de la mission de santé publique confiée au Programme Zoonoses / One Health par les autorités camerounaises
- **Votre consentement :** Pour la collecte de données de localisation et de photos, un consentement explicite vous est demandé via les permissions de l'application
- **L'exécution du service :** Le traitement est nécessaire pour assurer le fonctionnement du système de signalement`,
      },
      {
        heading: '5. Stockage et sécurité des données',
        body: `- Les données sont stockées sur des serveurs sécurisés hébergés par Infomaniak (Suisse/Europe), conformes aux standards de sécurité européens
- Les communications entre l'application et le serveur sont chiffrées via HTTPS/TLS
- Les mots de passe sont hachés et ne sont jamais stockés en clair
- Les données locales sur votre appareil sont stockées dans une base de données chiffrée
- Les photos sont transmises de manière sécurisée et stockées dans un espace protégé
- L'accès aux données est restreint au personnel autorisé du Programme One Health`,
      },
      {
        heading: '6. Partage des données',
        body: `Vos données peuvent être partagées avec :

- **Autorités sanitaires camerounaises :** Ministère de la Santé Publique, Ministère de l'Élevage, Ministère de l'Environnement, dans le cadre de la mission One Health
- **Organisations internationales partenaires :** OMS, FAO, OIE, dans le cadre de la surveillance sanitaire régionale, sous forme agrégée et anonymisée
- **Prestataires techniques :** Hébergeur de serveurs (Infomaniak), services de notification (Firebase Cloud Messaging), dans la stricte mesure nécessaire au fonctionnement technique

Nous ne vendons jamais vos données personnelles à des tiers. Nous ne partageons pas vos données à des fins commerciales ou publicitaires.`,
      },
      {
        heading: '7. Conservation des données',
        body: `- Les données de signalement sont conservées pendant la durée nécessaire à la surveillance épidémiologique et aux analyses rétrospectives (minimum 5 ans)
- Les données de compte utilisateur sont conservées tant que le compte est actif
- Les données de localisation GPS sont conservées avec le signalement associé
- Les photos sont conservées pendant la durée de traitement du signalement
- Vous pouvez demander la suppression de votre compte et de vos données personnelles à tout moment`,
      },
      {
        heading: '8. Vos droits',
        body: `Conformément à la réglementation applicable en matière de protection des données, vous disposez des droits suivants :

- **Droit d'accès :** Obtenir une copie de vos données personnelles
- **Droit de rectification :** Corriger vos données inexactes ou incomplètes
- **Droit de suppression :** Demander la suppression de vos données personnelles, sous réserve des obligations légales de conservation
- **Droit d'opposition :** Vous opposer au traitement de vos données dans certaines circonstances
- **Droit à la portabilité :** Recevoir vos données dans un format structuré et lisible par machine
- **Droit de retrait du consentement :** Retirer votre consentement à tout moment pour la collecte de données de localisation et de photos via les paramètres de votre appareil

Pour exercer ces droits, contactez-nous à l'adresse : contact@onehealth.cm`,
      },
      {
        heading: '9. Permissions de l\'application',
        body: `L'application COHRM demande les permissions suivantes :

- **Appareil photo :** Pour prendre des photos illustrant les signalements sanitaires
- **Galerie photos :** Pour sélectionner des photos existantes à joindre aux signalements
- **Localisation (en cours d'utilisation) :** Pour géolocaliser automatiquement le lieu d'un signalement
- **Notifications push :** Pour recevoir des alertes sur le suivi de vos signalements et les alertes sanitaires
- **Accès réseau :** Pour synchroniser les signalements avec le serveur central

Chaque permission peut être révoquée à tout moment dans les paramètres de votre appareil.`,
      },
      {
        heading: '10. Cookies et technologies similaires',
        body: `L'application mobile n'utilise pas de cookies. Cependant, nous utilisons :

- **DataStore / UserDefaults :** Pour stocker vos préférences locales (langue, thème)
- **Jetons d'authentification (JWT) :** Pour maintenir votre session de connexion de manière sécurisée
- **Firebase Cloud Messaging :** Pour la gestion des notifications push (un identifiant de token anonyme est utilisé)`,
      },
      {
        heading: '11. Protection des mineurs',
        body: `L'application COHRM n'est pas destinée aux enfants de moins de 16 ans. Nous ne collectons pas sciemment de données personnelles concernant des mineurs. Si vous êtes un parent ou un tuteur et que vous pensez que votre enfant nous a fourni des informations personnelles, veuillez nous contacter afin que nous puissions prendre les mesures nécessaires.`,
      },
      {
        heading: '12. Modifications de cette politique',
        body: `Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. En cas de modification substantielle, nous vous informerons via l'application ou par e-mail. La date de dernière mise à jour est indiquée en haut de cette page.

Nous vous encourageons à consulter régulièrement cette politique pour rester informé de nos pratiques en matière de protection des données.`,
      },
      {
        heading: '13. Contact',
        body: `Pour toute question concernant cette politique de confidentialité ou le traitement de vos données personnelles, vous pouvez nous contacter :

- **E-mail :** contact@onehealth.cm
- **Site web :** https://onehealth.cm
- **Organisation :** Programme Zoonoses / One Health Cameroun
- **Pays :** Cameroun`,
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    subtitle: 'COHRM Mobile Application',
    lastUpdated: 'Last updated: July 20, 2026',
    sections: [
      {
        heading: '1. Introduction',
        body: `Programme Zoonoses / One Health Cameroon ("we", "our") operates the COHRM (Cameroon One Health Rumor Management) mobile application. This privacy policy describes how we collect, use, store, and protect your personal information when you use our application.

By using the COHRM application, you agree to the practices described in this privacy policy.`,
      },
      {
        heading: '2. Data Collected',
        body: `We collect the following categories of data:

**Identification Data:**
- Name and email address (during account creation)
- Phone number (required for public reports)
- Login credentials and password (encrypted)

**Location Data:**
- GPS coordinates (latitude/longitude) when submitting a health report
- Manually selected region, department, district, and subdivision

**Photos and Media:**
- Photos taken via the camera or selected from the gallery to illustrate a report
- Associated photo metadata (date, time)

**Technical Data:**
- Unique device identifier
- Application and operating system version
- Synchronization logs and timestamps

**Report Data:**
- Health event description, category, species concerned, observed symptoms
- Comments and risk assessments`,
      },
      {
        heading: '3. Use of Data',
        body: `Your data is used exclusively for the following purposes:

- **Health Surveillance:** Enable public health authorities to detect, track, and respond to health rumors and events in Cameroon
- **Event Geolocation:** Precisely locate reports to facilitate rapid intervention by field teams
- **Communication:** Send you notifications regarding the follow-up of your reports and health alerts
- **Service Improvement:** Analyze trends to improve epidemiological surveillance
- **Aggregated Reports:** Produce anonymized statistics for public health reports`,
      },
      {
        heading: '4. Legal Basis for Processing',
        body: `The processing of your data is based on:

- **Public Interest:** Health threat surveillance falls within the public health mission entrusted to the Zoonoses / One Health Programme by Cameroonian authorities
- **Your Consent:** For the collection of location data and photos, explicit consent is requested through application permissions
- **Service Execution:** Processing is necessary to ensure the operation of the reporting system`,
      },
      {
        heading: '5. Data Storage and Security',
        body: `- Data is stored on secure servers hosted by Infomaniak (Switzerland/Europe), compliant with European security standards
- Communications between the application and server are encrypted via HTTPS/TLS
- Passwords are hashed and never stored in plain text
- Local data on your device is stored in an encrypted database
- Photos are transmitted securely and stored in a protected space
- Data access is restricted to authorized personnel of the One Health Programme`,
      },
      {
        heading: '6. Data Sharing',
        body: `Your data may be shared with:

- **Cameroonian Health Authorities:** Ministry of Public Health, Ministry of Livestock, Ministry of Environment, within the framework of the One Health mission
- **International Partner Organizations:** WHO, FAO, WOAH, within the framework of regional health surveillance, in aggregated and anonymized form
- **Technical Service Providers:** Server hosting (Infomaniak), notification services (Firebase Cloud Messaging), strictly as necessary for technical operation

We never sell your personal data to third parties. We do not share your data for commercial or advertising purposes.`,
      },
      {
        heading: '7. Data Retention',
        body: `- Report data is retained for the duration necessary for epidemiological surveillance and retrospective analysis (minimum 5 years)
- User account data is retained as long as the account is active
- GPS location data is retained with the associated report
- Photos are retained for the duration of report processing
- You may request deletion of your account and personal data at any time`,
      },
      {
        heading: '8. Your Rights',
        body: `In accordance with applicable data protection regulations, you have the following rights:

- **Right of Access:** Obtain a copy of your personal data
- **Right of Rectification:** Correct inaccurate or incomplete data
- **Right of Erasure:** Request deletion of your personal data, subject to legal retention obligations
- **Right to Object:** Object to the processing of your data in certain circumstances
- **Right to Data Portability:** Receive your data in a structured, machine-readable format
- **Right to Withdraw Consent:** Withdraw your consent at any time for location and photo data collection through your device settings

To exercise these rights, contact us at: contact@onehealth.cm`,
      },
      {
        heading: '9. Application Permissions',
        body: `The COHRM application requests the following permissions:

- **Camera:** To take photos illustrating health reports
- **Photo Gallery:** To select existing photos to attach to reports
- **Location (While In Use):** To automatically geolocate the site of a report
- **Push Notifications:** To receive alerts about your report follow-ups and health alerts
- **Network Access:** To synchronize reports with the central server

Each permission can be revoked at any time in your device settings.`,
      },
      {
        heading: '10. Cookies and Similar Technologies',
        body: `The mobile application does not use cookies. However, we use:

- **DataStore / UserDefaults:** To store your local preferences (language, theme)
- **Authentication Tokens (JWT):** To maintain your login session securely
- **Firebase Cloud Messaging:** For push notification management (an anonymous token identifier is used)`,
      },
      {
        heading: '11. Children\'s Privacy',
        body: `The COHRM application is not intended for children under 16 years of age. We do not knowingly collect personal data from minors. If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can take the necessary steps.`,
      },
      {
        heading: '12. Changes to This Policy',
        body: `We reserve the right to modify this privacy policy at any time. In the event of a substantial change, we will notify you through the application or by email. The date of the last update is indicated at the top of this page.

We encourage you to review this policy regularly to stay informed about our data protection practices.`,
      },
      {
        heading: '13. Contact',
        body: `For any questions regarding this privacy policy or the processing of your personal data, you may contact us:

- **Email:** contact@onehealth.cm
- **Website:** https://onehealth.cm
- **Organization:** Programme Zoonoses / One Health Cameroon
- **Country:** Cameroon`,
      },
    ],
  },
};

export default async function PrivacyPolicyPage({ params }: PageProps) {
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

        <div className="text-center mt-8 text-sm text-oh-gray">
          <p>
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
