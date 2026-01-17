'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Loader2,
  ArrowLeft,
  UserPlus,
  Building2,
  Wrench,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  MapPin,
  Phone,
  Globe,
  Mail,
  FileUp,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Map,
  Camera,
  FileText,
  Linkedin,
  Twitter,
  BookOpen,
  Users,
  DollarSign,
  Star,
} from 'lucide-react';
import { Language } from '@/lib/types';
import { OHWRRegion, OHWROrganization, OHWRExpertiseDomain } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { AuthGuard } from '@/components/auth';
import {
  getUserSubmissions,
  submitMaterial,
  submitOrganization,
  submitDocument,
  submitExpertRegistration,
  getRegions,
  getOHWROrganizations,
  getOHWRExpertiseDomains,
  UserSubmission,
} from '@/lib/api';
import { cn } from '@/lib/utils';

const translations = {
  fr: {
    title: 'Mes ressources',
    subtitle: 'Soumettez de nouvelles ressources et suivez vos soumissions',
    back: 'Retour au dashboard',
    loading: 'Chargement...',
    registerExpert: "S'inscrire comme expert",
    addMaterial: 'Ajouter un matériel',
    addOrganization: 'Ajouter une organisation',
    addDocument: 'Ajouter un document',
    mySubmissions: 'Mes soumissions',
    pending: 'En attente',
    approved: 'Approuvé',
    rejected: 'Rejeté',
    noSubmissions: 'Aucune soumission',
    name: 'Nom',
    type: 'Type',
    description: 'Description',
    region: 'Région',
    city: 'Ville',
    capacity: 'Capacité',
    acronym: 'Acronyme',
    mission: 'Mission',
    website: 'Site web',
    address: 'Adresse',
    email: 'Email',
    phone: 'Téléphone',
    titleFr: 'Titre (Français)',
    titleEn: 'Titre (Anglais)',
    descriptionFr: 'Description (Français)',
    descriptionEn: 'Description (Anglais)',
    externalUrl: 'Lien externe (URL)',
    language: 'Langue',
    publicationDate: 'Date de publication',
    firstName: 'Prénom',
    lastName: 'Nom',
    expertTitle: 'Titre professionnel',
    category: 'Catégorie',
    organizationName: 'Organisation',
    biography: 'Biographie',
    expertiseDomains: 'Domaines d\'expertise',
    qualifications: 'Qualifications',
    yearsExperience: 'Années d\'expérience',
    linkedinUrl: 'Profil LinkedIn',
    twitterUrl: 'Profil Twitter/X',
    orcidId: 'ORCID ID',
    googleScholarUrl: 'Google Scholar',
    researchgateUrl: 'ResearchGate',
    expertiseSummary: 'Résumé d\'expertise',
    availableForCollaboration: 'Disponible pour collaboration',
    photo: 'Photo',
    cv: 'CV',
    publicationsCount: 'Nombre de publications',
    projectsCount: 'Nombre de projets',
    consultationRate: 'Tarif consultation',
    awards: 'Prix et distinctions',
    researchInterests: 'Intérêts de recherche',
    selectOrganization: 'Sélectionnez une organisation',
    selectExpertise: 'Sélectionnez les domaines d\'expertise',
    uploadPhoto: 'Télécharger une photo',
    uploadCv: 'Télécharger votre CV',
    uploadImage: 'Télécharger une image',
    uploadLogo: 'Télécharger un logo',
    uploadFile: 'Télécharger un fichier',
    uploadThumbnail: 'Télécharger une vignette',
    image: 'Image',
    logo: 'Logo',
    file: 'Fichier (PDF, Vidéo...)',
    thumbnail: 'Vignette',
    status: 'Statut',
    accessLevel: 'Niveau d\'accès',
    submit: 'Soumettre',
    submitting: 'Envoi en cours...',
    submitSuccess: 'Votre soumission a été envoyée avec succès ! Elle sera examinée par un administrateur.',
    submitError: 'Erreur lors de la soumission',
    selectType: 'Sélectionnez un type',
    selectRegion: 'Sélectionnez une région',
    selectCategory: 'Sélectionnez une catégorie',
    selectStatus: 'Sélectionnez un statut',
    selectAccessLevel: 'Sélectionnez un niveau',
    materialTypes: {
      laboratory: 'Laboratoire',
      equipment: 'Équipement',
      vehicle: 'Véhicule',
      facility: 'Infrastructure',
      other: 'Autre',
    },
    materialStatus: {
      available: 'Disponible',
      in_use: 'En utilisation',
      under_maintenance: 'En maintenance',
      unavailable: 'Indisponible',
    },
    orgTypes: {
      government: 'Gouvernement',
      ngo: 'ONG',
      research: 'Recherche',
      university: 'Université',
      hospital: 'Hôpital',
      private: 'Secteur privé',
      international: 'Organisation internationale',
      other: 'Autre',
    },
    docTypes: {
      report: 'Rapport',
      guide: 'Guide',
      protocol: 'Protocole',
      publication: 'Publication scientifique',
      presentation: 'Présentation',
      article: 'Article',
      thesis: 'Thèse',
      other: 'Autre',
    },
    accessLevels: {
      public: 'Public',
      private: 'Privé (membres uniquement)',
      restricted: 'Restreint',
    },
    expertCategories: {
      expert: 'Expert',
      researcher: 'Chercheur',
      practitioner: 'Praticien',
      consultant: 'Consultant',
      trainer: 'Formateur',
    },
  },
  en: {
    title: 'My Resources',
    subtitle: 'Submit new resources and track your submissions',
    back: 'Back to dashboard',
    loading: 'Loading...',
    registerExpert: 'Register as expert',
    addMaterial: 'Add material',
    addOrganization: 'Add organization',
    addDocument: 'Add document',
    mySubmissions: 'My submissions',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    noSubmissions: 'No submissions',
    name: 'Name',
    type: 'Type',
    description: 'Description',
    region: 'Region',
    city: 'City',
    capacity: 'Capacity',
    acronym: 'Acronym',
    mission: 'Mission',
    website: 'Website',
    address: 'Address',
    email: 'Email',
    phone: 'Phone',
    titleFr: 'Title (French)',
    titleEn: 'Title (English)',
    descriptionFr: 'Description (French)',
    descriptionEn: 'Description (English)',
    externalUrl: 'External link (URL)',
    language: 'Language',
    publicationDate: 'Publication date',
    firstName: 'First name',
    lastName: 'Last name',
    expertTitle: 'Professional title',
    category: 'Category',
    organizationName: 'Organization',
    biography: 'Biography',
    expertiseDomains: 'Expertise domains',
    qualifications: 'Qualifications',
    yearsExperience: 'Years of experience',
    linkedinUrl: 'LinkedIn profile',
    twitterUrl: 'Twitter/X profile',
    orcidId: 'ORCID ID',
    googleScholarUrl: 'Google Scholar',
    researchgateUrl: 'ResearchGate',
    expertiseSummary: 'Expertise summary',
    availableForCollaboration: 'Available for collaboration',
    photo: 'Photo',
    cv: 'CV',
    publicationsCount: 'Number of publications',
    projectsCount: 'Number of projects',
    consultationRate: 'Consultation rate',
    awards: 'Awards and distinctions',
    researchInterests: 'Research interests',
    selectOrganization: 'Select an organization',
    selectExpertise: 'Select expertise domains',
    uploadPhoto: 'Upload a photo',
    uploadCv: 'Upload your CV',
    uploadImage: 'Upload an image',
    uploadLogo: 'Upload a logo',
    uploadFile: 'Upload a file',
    uploadThumbnail: 'Upload a thumbnail',
    image: 'Image',
    logo: 'Logo',
    file: 'File (PDF, Video...)',
    thumbnail: 'Thumbnail',
    status: 'Status',
    accessLevel: 'Access level',
    submit: 'Submit',
    submitting: 'Submitting...',
    submitSuccess: 'Your submission has been sent successfully! It will be reviewed by an administrator.',
    submitError: 'Submission error',
    selectType: 'Select a type',
    selectRegion: 'Select a region',
    selectCategory: 'Select a category',
    selectStatus: 'Select a status',
    selectAccessLevel: 'Select a level',
    materialTypes: {
      laboratory: 'Laboratory',
      equipment: 'Equipment',
      vehicle: 'Vehicle',
      facility: 'Facility',
      other: 'Other',
    },
    materialStatus: {
      available: 'Available',
      in_use: 'In use',
      under_maintenance: 'Under maintenance',
      unavailable: 'Unavailable',
    },
    orgTypes: {
      government: 'Government',
      ngo: 'NGO',
      research: 'Research',
      university: 'University',
      hospital: 'Hospital',
      private: 'Private sector',
      international: 'International organization',
      other: 'Other',
    },
    docTypes: {
      report: 'Report',
      guide: 'Guide',
      protocol: 'Protocol',
      publication: 'Scientific publication',
      presentation: 'Presentation',
      article: 'Article',
      thesis: 'Thesis',
      other: 'Other',
    },
    accessLevels: {
      public: 'Public',
      private: 'Private (members only)',
      restricted: 'Restricted',
    },
    expertCategories: {
      expert: 'Expert',
      researcher: 'Researcher',
      practitioner: 'Practitioner',
      consultant: 'Consultant',
      trainer: 'Trainer',
    },
  },
};

type ResourceType = 'expert' | 'material' | 'organization' | 'document' | null;

export default function ResourcesPage() {
  const params = useParams();
  const lang = (params.lang as Language) || 'fr';
  const t = translations[lang];

  const { token, user } = useAuth();
  const [submissions, setSubmissions] = useState<{
    materials: UserSubmission[];
    organizations: UserSubmission[];
    documents: UserSubmission[];
    experts: UserSubmission[];
  }>({ materials: [], organizations: [], documents: [], experts: [] });
  const [regions, setRegions] = useState<OHWRRegion[]>([]);
  const [organizations, setOrganizations] = useState<OHWROrganization[]>([]);
  const [expertiseDomains, setExpertiseDomains] = useState<OHWRExpertiseDomain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResourceType, setSelectedResourceType] = useState<ResourceType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [materialForm, setMaterialForm] = useState({
    name: '', type: '', description: '', status: 'available',
    organization_id: '', region_id: '', city: '', address: '',
    contact_email: '', contact_phone: '', capacity: '',
  });
  const [materialImageFile, setMaterialImageFile] = useState<File | null>(null);
  const [materialImagePreview, setMaterialImagePreview] = useState<string | null>(null);

  const [orgForm, setOrgForm] = useState({
    name: '', type: '', acronym: '', description: '', mission: '', website: '',
    region_id: '', city: '', address: '', contact_email: '', contact_phone: '',
  });
  const [orgLogoFile, setOrgLogoFile] = useState<File | null>(null);
  const [orgLogoPreview, setOrgLogoPreview] = useState<string | null>(null);

  const [docForm, setDocForm] = useState({
    title: '', type: '', description: '',
    external_url: '', publication_date: '', access_level: 'public',
  });
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docThumbnailFile, setDocThumbnailFile] = useState<File | null>(null);
  const [docThumbnailPreview, setDocThumbnailPreview] = useState<string | null>(null);

  const [expertForm, setExpertForm] = useState({
    first_name: '', last_name: '', title: '', category: '',
    email: '', phone: '', organization_id: '', organization_name: '',
    region_id: '', city: '', biography: '',
    years_experience: '', linkedin_url: '', twitter_url: '',
    orcid_id: '', google_scholar_url: '', researchgate_url: '', website: '',
    expertise_summary: '', qualifications: '',
    selected_expertise_ids: [] as number[],
    publications_count: '', projects_count: '', consultation_rate: '',
    awards: '', research_interests: '',
    available_for_collaboration: true,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch regions
        const regionsRes = await getRegions();
        if (regionsRes.success && regionsRes.data) {
          setRegions(Array.isArray(regionsRes.data) ? regionsRes.data : []);
        }

        // Fetch organizations
        const orgsRes = await getOHWROrganizations();
        if (orgsRes.success && orgsRes.data) {
          setOrganizations(Array.isArray(orgsRes.data) ? orgsRes.data : []);
        }

        // Fetch expertise domains
        const domainsRes = await getOHWRExpertiseDomains();
        if (domainsRes.success && domainsRes.data) {
          setExpertiseDomains(Array.isArray(domainsRes.data) ? domainsRes.data : []);
        }

        if (token) {
          const submissionsRes = await getUserSubmissions(token);
          if (submissionsRes.success && submissionsRes.data) {
            setSubmissions(submissionsRes.data);
          }
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [token]);

  const allSubmissions = [
    ...submissions.materials.map((s) => ({ ...s, type: 'material' as const })),
    ...submissions.organizations.map((s) => ({ ...s, type: 'organization' as const })),
    ...submissions.documents.map((s) => ({ ...s, type: 'document' as const })),
    ...submissions.experts.map((s) => ({ ...s, type: 'expert' as const })),
  ].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

  const pendingCount = allSubmissions.filter((s) => s.submission_status === 'pending').length;

  const resetForms = () => {
    setMaterialForm({ name: '', type: '', description: '', status: 'available', organization_id: '', region_id: '', city: '', address: '', contact_email: '', contact_phone: '', capacity: '' });
    setMaterialImageFile(null);
    setMaterialImagePreview(null);
    setOrgForm({ name: '', type: '', acronym: '', description: '', mission: '', website: '', region_id: '', city: '', address: '', contact_email: '', contact_phone: '' });
    setOrgLogoFile(null);
    setOrgLogoPreview(null);
    setDocForm({ title: '', type: '', description: '', external_url: '', publication_date: '', access_level: 'public' });
    setDocFile(null);
    setDocThumbnailFile(null);
    setDocThumbnailPreview(null);
    setExpertForm({
      first_name: '', last_name: '', title: '', category: '',
      email: '', phone: '', organization_id: '', organization_name: '',
      region_id: '', city: '', biography: '',
      years_experience: '', linkedin_url: '', twitter_url: '',
      orcid_id: '', google_scholar_url: '', researchgate_url: '', website: '',
      expertise_summary: '', qualifications: '',
      selected_expertise_ids: [],
      publications_count: '', projects_count: '', consultation_rate: '',
      awards: '', research_interests: '',
      available_for_collaboration: true,
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setCvFile(null);
  };

  const refreshSubmissions = async () => {
    if (token) {
      const submissionsRes = await getUserSubmissions(token);
      if (submissionsRes.success && submissionsRes.data) {
        setSubmissions(submissionsRes.data);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedResourceType) return;

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      let res;
      switch (selectedResourceType) {
        case 'material':
          res = await submitMaterial(token, {
            name: materialForm.name,
            type: materialForm.type,
            description: materialForm.description || undefined,
            status: materialForm.status || 'available',
            organization_id: materialForm.organization_id ? parseInt(materialForm.organization_id) : undefined,
            region_id: materialForm.region_id ? parseInt(materialForm.region_id) : undefined,
            city: materialForm.city || undefined,
            address: materialForm.address || undefined,
            contact_email: materialForm.contact_email || undefined,
            contact_phone: materialForm.contact_phone || undefined,
            capacity: materialForm.capacity || undefined,
          }, materialImageFile || undefined);
          break;
        case 'organization':
          res = await submitOrganization(token, {
            name: orgForm.name,
            type: orgForm.type,
            acronym: orgForm.acronym || undefined,
            description: orgForm.description || undefined,
            mission: orgForm.mission || undefined,
            website: orgForm.website || undefined,
            region_id: orgForm.region_id ? parseInt(orgForm.region_id) : undefined,
            city: orgForm.city || undefined,
            address: orgForm.address || undefined,
            contact_email: orgForm.contact_email || undefined,
            contact_phone: orgForm.contact_phone || undefined,
          }, orgLogoFile || undefined);
          break;
        case 'document':
          res = await submitDocument(token, {
            title: docForm.title,
            type: docForm.type,
            description: docForm.description || undefined,
            external_url: docForm.external_url || undefined,
            language: lang,
            publication_date: docForm.publication_date || undefined,
            access_level: docForm.access_level || 'public',
          }, docFile || undefined, docThumbnailFile || undefined);
          break;
        case 'expert':
          res = await submitExpertRegistration(token, {
            first_name: expertForm.first_name || user?.first_name || undefined,
            last_name: expertForm.last_name || user?.last_name || undefined,
            title: expertForm.title || undefined,
            category: expertForm.category,
            email: expertForm.email || user?.email || undefined,
            phone: expertForm.phone || undefined,
            organization_id: expertForm.organization_id ? parseInt(expertForm.organization_id) : undefined,
            organization_name: expertForm.organization_name || undefined,
            region_id: expertForm.region_id ? parseInt(expertForm.region_id) : undefined,
            city: expertForm.city || undefined,
            biography: expertForm.biography || undefined,
            years_experience: expertForm.years_experience ? parseInt(expertForm.years_experience) : undefined,
            linkedin_url: expertForm.linkedin_url || undefined,
            twitter_url: expertForm.twitter_url || undefined,
            orcid_id: expertForm.orcid_id || undefined,
            google_scholar_url: expertForm.google_scholar_url || undefined,
            researchgate_url: expertForm.researchgate_url || undefined,
            website: expertForm.website || undefined,
            expertise_domain_ids: expertForm.selected_expertise_ids.length > 0 ? expertForm.selected_expertise_ids : undefined,
            qualifications: expertForm.qualifications || undefined,
            expertise_summary: expertForm.expertise_summary || undefined,
            publications_count: expertForm.publications_count ? parseInt(expertForm.publications_count) : undefined,
            projects_count: expertForm.projects_count ? parseInt(expertForm.projects_count) : undefined,
            consultation_rate: expertForm.consultation_rate || undefined,
            awards: expertForm.awards || undefined,
            research_interests: expertForm.research_interests || undefined,
            available_for_collaboration: expertForm.available_for_collaboration,
          }, photoFile || undefined, cvFile || undefined);
          break;
      }

      if (res?.success) {
        setSubmitMessage({ type: 'success', text: t.submitSuccess });
        resetForms();
        await refreshSubmissions();
        setTimeout(() => {
          setSelectedResourceType(null);
          setSubmitMessage(null);
        }, 3000);
      } else {
        setSubmitMessage({ type: 'error', text: res?.message || t.submitError });
      }
    } catch {
      setSubmitMessage({ type: 'error', text: t.submitError });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return t.pending;
      case 'approved': return t.approved;
      case 'rejected': return t.rejected;
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'material': return t.addMaterial;
      case 'organization': return t.addOrganization;
      case 'document': return t.addDocument;
      case 'expert': return t.registerExpert;
      default: return type;
    }
  };

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-oh-blue/20 focus:border-oh-blue focus:bg-white transition-all outline-none text-gray-900 placeholder:text-gray-400";
  const selectClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-oh-blue/20 focus:border-oh-blue focus:bg-white transition-all outline-none text-gray-900 appearance-none cursor-pointer";
  const textareaClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-oh-blue/20 focus:border-oh-blue focus:bg-white transition-all outline-none text-gray-900 placeholder:text-gray-400 resize-none";
  const labelClass = "flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5";

  return (
    <AuthGuard lang={lang}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        {/* Gradient Header Banner */}
        <div className="bg-gradient-to-r from-oh-blue to-oh-green">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Link
                  href={`/${lang}/dashboard`}
                  className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-2"
                >
                  <ArrowLeft size={16} />
                  {t.back}
                </Link>
                <h1 className="text-2xl font-bold text-white">{t.title}</h1>
                <p className="text-sm text-white/80 mt-0.5">{t.subtitle}</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/${lang}/ohwr-mapping`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-oh-blue rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg"
                >
                  <Map size={18} />
                  OHWR-Map
                </Link>
                <Link
                  href={`/${lang}/oh-elearning`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-semibold transition-all border border-white/30 hover:border-white/50"
                >
                  <GraduationCap size={18} />
                  OH E-learning
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-oh-blue" />
              <span className="ml-3 text-gray-500">{t.loading}</span>
            </div>
          ) : (
            <>
              {/* Show Form when resource type is selected */}
              {selectedResourceType ? (
                <div>
                  {/* Back Button */}
                  <button
                    onClick={() => { setSelectedResourceType(null); setSubmitMessage(null); }}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
                  >
                    <ArrowLeft size={16} />
                    {lang === 'fr' ? 'Retour' : 'Back'}
                  </button>

                  {/* Full Width Form */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Form Header */}
                    <div className={cn(
                      'p-6 text-white bg-gradient-to-r',
                      selectedResourceType === 'expert' && 'from-blue-500 to-indigo-600',
                      selectedResourceType === 'material' && 'from-amber-500 to-orange-600',
                      selectedResourceType === 'organization' && 'from-purple-500 to-pink-600',
                      selectedResourceType === 'document' && 'from-emerald-500 to-teal-600',
                    )}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                          {selectedResourceType === 'expert' && <UserPlus className="h-6 w-6" />}
                          {selectedResourceType === 'material' && <Wrench className="h-6 w-6" />}
                          {selectedResourceType === 'organization' && <Building2 className="h-6 w-6" />}
                          {selectedResourceType === 'document' && <FileUp className="h-6 w-6" />}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">{getTypeLabel(selectedResourceType)}</h2>
                          <p className="text-white/80 text-sm">
                            {lang === 'fr' ? 'Remplissez le formulaire ci-dessous' : 'Fill out the form below'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    {submitMessage?.type === 'success' && (
                      <div className="m-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <p className="text-green-700 text-sm">{submitMessage.text}</p>
                      </div>
                    )}

                    {submitMessage?.type === 'error' && (
                      <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700 text-sm">{submitMessage.text}</p>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                          {/* Expert Form */}
                          {selectedResourceType === 'expert' && (
                            <>
                              {/* Photo Section */}
                              <div className="flex items-start gap-6">
                                <div className="flex-shrink-0">
                                  <label className={labelClass}><Camera className="h-4 w-4 text-gray-400" />{t.photo}</label>
                                  <div className="mt-1">
                                    {photoPreview ? (
                                      <div className="relative w-32 h-32">
                                        <img src={photoPreview} alt="Preview" className="w-32 h-32 rounded-xl object-cover border-2 border-gray-200" />
                                        <button
                                          type="button"
                                          onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                        >
                                          <XCircle className="h-4 w-4" />
                                        </button>
                                      </div>
                                    ) : (
                                      <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-colors">
                                        <Camera className="h-8 w-8 text-gray-400" />
                                        <span className="text-xs text-gray-500 mt-1">{t.uploadPhoto}</span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              setPhotoFile(file);
                                              setPhotoPreview(URL.createObjectURL(file));
                                            }
                                          }}
                                        />
                                      </label>
                                    )}
                                  </div>
                                </div>

                                {/* Identity Section */}
                                <div className="flex-1 space-y-4">
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <label className={labelClass}>{t.firstName} <span className="text-red-500">*</span></label>
                                      <input className={inputClass} required value={expertForm.first_name || user?.first_name || ''} onChange={(e) => setExpertForm({ ...expertForm, first_name: e.target.value })} />
                                    </div>
                                    <div>
                                      <label className={labelClass}>{t.lastName} <span className="text-red-500">*</span></label>
                                      <input className={inputClass} required value={expertForm.last_name || user?.last_name || ''} onChange={(e) => setExpertForm({ ...expertForm, last_name: e.target.value })} />
                                    </div>
                                    <div>
                                      <label className={labelClass}><GraduationCap className="h-4 w-4 text-gray-400" />{t.expertTitle}</label>
                                      <input className={inputClass} placeholder="Dr., Prof., etc." value={expertForm.title} onChange={(e) => setExpertForm({ ...expertForm, title: e.target.value })} />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className={labelClass}><Award className="h-4 w-4 text-gray-400" />{t.category} <span className="text-red-500">*</span></label>
                                      <select className={selectClass} required value={expertForm.category} onChange={(e) => setExpertForm({ ...expertForm, category: e.target.value })}>
                                        <option value="">{t.selectCategory}</option>
                                        {Object.entries(t.expertCategories).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className={labelClass}><Building2 className="h-4 w-4 text-gray-400" />{t.organizationName}</label>
                                      <select className={selectClass} value={expertForm.organization_id} onChange={(e) => setExpertForm({ ...expertForm, organization_id: e.target.value })}>
                                        <option value="">{t.selectOrganization}</option>
                                        {organizations.map((org) => (
                                          <option key={org.id} value={org.id}>{org.name}{org.acronym ? ` (${org.acronym})` : ''}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Contact Section */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className={labelClass}><Mail className="h-4 w-4 text-gray-400" />{t.email}</label>
                                  <input className={inputClass} type="email" value={expertForm.email || user?.email || ''} onChange={(e) => setExpertForm({ ...expertForm, email: e.target.value })} />
                                </div>
                                <div>
                                  <label className={labelClass}><Phone className="h-4 w-4 text-gray-400" />{t.phone}</label>
                                  <input className={inputClass} type="tel" value={expertForm.phone} onChange={(e) => setExpertForm({ ...expertForm, phone: e.target.value })} />
                                </div>
                              </div>

                              {/* Location Section */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className={labelClass}><MapPin className="h-4 w-4 text-gray-400" />{t.region}</label>
                                  <select className={selectClass} value={expertForm.region_id} onChange={(e) => setExpertForm({ ...expertForm, region_id: e.target.value })}>
                                    <option value="">{t.selectRegion}</option>
                                    {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label className={labelClass}><MapPin className="h-4 w-4 text-gray-400" />{t.city}</label>
                                  <input className={inputClass} value={expertForm.city} onChange={(e) => setExpertForm({ ...expertForm, city: e.target.value })} />
                                </div>
                              </div>

                              {/* Expertise Domains Multi-select */}
                              <div>
                                <label className={labelClass}><Briefcase className="h-4 w-4 text-gray-400" />{t.expertiseDomains}</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 p-4 bg-gray-50 rounded-xl max-h-48 overflow-y-auto">
                                  {expertiseDomains.map((domain) => (
                                    <label key={domain.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded-lg transition-colors">
                                      <input
                                        type="checkbox"
                                        checked={expertForm.selected_expertise_ids.includes(domain.id)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setExpertForm({ ...expertForm, selected_expertise_ids: [...expertForm.selected_expertise_ids, domain.id] });
                                          } else {
                                            setExpertForm({ ...expertForm, selected_expertise_ids: expertForm.selected_expertise_ids.filter(id => id !== domain.id) });
                                          }
                                        }}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className="text-sm text-gray-700">{domain.name}</span>
                                    </label>
                                  ))}
                                </div>
                                {expertForm.selected_expertise_ids.length > 0 && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {expertForm.selected_expertise_ids.length} {lang === 'fr' ? 'domaine(s) sélectionné(s)' : 'domain(s) selected'}
                                  </p>
                                )}
                              </div>

                              {/* Experience & Statistics Section */}
                              <div className="grid grid-cols-4 gap-4">
                                <div>
                                  <label className={labelClass}><Clock className="h-4 w-4 text-gray-400" />{t.yearsExperience}</label>
                                  <input className={inputClass} type="number" min="0" value={expertForm.years_experience} onChange={(e) => setExpertForm({ ...expertForm, years_experience: e.target.value })} />
                                </div>
                                <div>
                                  <label className={labelClass}><BookOpen className="h-4 w-4 text-gray-400" />{t.publicationsCount}</label>
                                  <input className={inputClass} type="number" min="0" value={expertForm.publications_count} onChange={(e) => setExpertForm({ ...expertForm, publications_count: e.target.value })} />
                                </div>
                                <div>
                                  <label className={labelClass}><Users className="h-4 w-4 text-gray-400" />{t.projectsCount}</label>
                                  <input className={inputClass} type="number" min="0" value={expertForm.projects_count} onChange={(e) => setExpertForm({ ...expertForm, projects_count: e.target.value })} />
                                </div>
                                <div>
                                  <label className={labelClass}><DollarSign className="h-4 w-4 text-gray-400" />{t.consultationRate}</label>
                                  <input className={inputClass} placeholder="ex: 100 USD/h" value={expertForm.consultation_rate} onChange={(e) => setExpertForm({ ...expertForm, consultation_rate: e.target.value })} />
                                </div>
                              </div>

                              {/* CV Upload */}
                              <div>
                                <label className={labelClass}><FileText className="h-4 w-4 text-gray-400" />{t.cv}</label>
                                <div className="mt-1">
                                  {cvFile ? (
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                      <FileText className="h-5 w-5 text-blue-500" />
                                      <span className="text-sm text-blue-700 flex-1 truncate">{cvFile.name}</span>
                                      <button
                                        type="button"
                                        onClick={() => setCvFile(null)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <XCircle className="h-5 w-5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <label className="flex items-center gap-3 p-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-colors">
                                      <FileUp className="h-5 w-5 text-gray-400" />
                                      <span className="text-sm text-gray-500">{t.uploadCv}</span>
                                      <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) setCvFile(file);
                                        }}
                                      />
                                    </label>
                                  )}
                                </div>
                              </div>

                              {/* Social & Academic Links */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className={labelClass}><Linkedin className="h-4 w-4 text-gray-400" />{t.linkedinUrl}</label>
                                  <input className={inputClass} type="url" placeholder="https://linkedin.com/in/..." value={expertForm.linkedin_url} onChange={(e) => setExpertForm({ ...expertForm, linkedin_url: e.target.value })} />
                                </div>
                                <div>
                                  <label className={labelClass}><Twitter className="h-4 w-4 text-gray-400" />{t.twitterUrl}</label>
                                  <input className={inputClass} type="url" placeholder="https://twitter.com/..." value={expertForm.twitter_url} onChange={(e) => setExpertForm({ ...expertForm, twitter_url: e.target.value })} />
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <label className={labelClass}>{t.orcidId}</label>
                                  <input className={inputClass} placeholder="0000-0000-0000-0000" value={expertForm.orcid_id} onChange={(e) => setExpertForm({ ...expertForm, orcid_id: e.target.value })} />
                                </div>
                                <div>
                                  <label className={labelClass}>{t.googleScholarUrl}</label>
                                  <input className={inputClass} type="url" placeholder="https://scholar.google.com/..." value={expertForm.google_scholar_url} onChange={(e) => setExpertForm({ ...expertForm, google_scholar_url: e.target.value })} />
                                </div>
                                <div>
                                  <label className={labelClass}>{t.researchgateUrl}</label>
                                  <input className={inputClass} type="url" placeholder="https://researchgate.net/..." value={expertForm.researchgate_url} onChange={(e) => setExpertForm({ ...expertForm, researchgate_url: e.target.value })} />
                                </div>
                              </div>

                              <div>
                                <label className={labelClass}><Globe className="h-4 w-4 text-gray-400" />{t.website}</label>
                                <input className={inputClass} type="url" placeholder="https://" value={expertForm.website} onChange={(e) => setExpertForm({ ...expertForm, website: e.target.value })} />
                              </div>

                              {/* Expertise Summary */}
                              <div>
                                <label className={labelClass}>{t.expertiseSummary}</label>
                                <input className={inputClass} placeholder={lang === 'fr' ? 'Ex: Spécialiste en épidémiologie des maladies infectieuses...' : 'Ex: Specialist in infectious disease epidemiology...'} value={expertForm.expertise_summary} onChange={(e) => setExpertForm({ ...expertForm, expertise_summary: e.target.value })} />
                              </div>

                              <div>
                                <label className={labelClass}>{t.qualifications}</label>
                                <textarea className={textareaClass} rows={2} placeholder={lang === 'fr' ? 'Diplômes, certifications, formations...' : 'Degrees, certifications, training...'} value={expertForm.qualifications} onChange={(e) => setExpertForm({ ...expertForm, qualifications: e.target.value })} />
                              </div>

                              <div>
                                <label className={labelClass}>{t.biography}</label>
                                <textarea className={textareaClass} rows={3} value={expertForm.biography} onChange={(e) => setExpertForm({ ...expertForm, biography: e.target.value })} />
                              </div>

                              <div>
                                <label className={labelClass}><Star className="h-4 w-4 text-gray-400" />{t.awards}</label>
                                <textarea className={textareaClass} rows={2} placeholder={lang === 'fr' ? 'Prix, distinctions, reconnaissances...' : 'Awards, honors, recognitions...'} value={expertForm.awards} onChange={(e) => setExpertForm({ ...expertForm, awards: e.target.value })} />
                              </div>

                              <div>
                                <label className={labelClass}>{t.researchInterests}</label>
                                <textarea className={textareaClass} rows={2} placeholder={lang === 'fr' ? 'Domaines de recherche actuels...' : 'Current research areas...'} value={expertForm.research_interests} onChange={(e) => setExpertForm({ ...expertForm, research_interests: e.target.value })} />
                              </div>

                              {/* Availability */}
                              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <input
                                  type="checkbox"
                                  id="available_collab"
                                  checked={expertForm.available_for_collaboration}
                                  onChange={(e) => setExpertForm({ ...expertForm, available_for_collaboration: e.target.checked })}
                                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="available_collab" className="text-sm font-medium text-gray-700 cursor-pointer">
                                  {t.availableForCollaboration}
                                </label>
                              </div>
                            </>
                          )}

                          {/* Material Form */}
                          {selectedResourceType === 'material' && (
                            <>
                              {/* Image + Main Info Section */}
                              <div className="flex items-start gap-6">
                                {/* Image Upload */}
                                <div className="flex-shrink-0">
                                  <label className={labelClass}><Camera className="h-4 w-4 text-gray-400" />{t.image}</label>
                                  <div className="mt-1">
                                    {materialImagePreview ? (
                                      <div className="relative w-40 h-40">
                                        <img src={materialImagePreview} alt="Preview" className="w-40 h-40 rounded-xl object-cover border-2 border-gray-200" />
                                        <button
                                          type="button"
                                          onClick={() => { setMaterialImageFile(null); setMaterialImagePreview(null); }}
                                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                        >
                                          <XCircle className="h-4 w-4" />
                                        </button>
                                      </div>
                                    ) : (
                                      <label className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:bg-amber-50/50 transition-colors">
                                        <Camera className="h-8 w-8 text-gray-400" />
                                        <span className="text-xs text-gray-500 mt-1">{t.uploadImage}</span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              setMaterialImageFile(file);
                                              setMaterialImagePreview(URL.createObjectURL(file));
                                            }
                                          }}
                                        />
                                      </label>
                                    )}
                                  </div>
                                </div>

                                {/* Main Info */}
                                <div className="flex-1 space-y-4">
                                  <div>
                                    <label className={labelClass}>{t.name} <span className="text-red-500">*</span></label>
                                    <input className={inputClass} required value={materialForm.name} onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })} />
                                  </div>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <label className={labelClass}>{t.type} <span className="text-red-500">*</span></label>
                                      <select className={selectClass} required value={materialForm.type} onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value })}>
                                        <option value="">{t.selectType}</option>
                                        {Object.entries(t.materialTypes).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className={labelClass}>{t.status}</label>
                                      <select className={selectClass} value={materialForm.status} onChange={(e) => setMaterialForm({ ...materialForm, status: e.target.value })}>
                                        {Object.entries(t.materialStatus).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className={labelClass}><Building2 className="h-4 w-4 text-gray-400" />{t.organizationName}</label>
                                      <select className={selectClass} value={materialForm.organization_id} onChange={(e) => setMaterialForm({ ...materialForm, organization_id: e.target.value })}>
                                        <option value="">{t.selectOrganization}</option>
                                        {organizations.map((org) => (
                                          <option key={org.id} value={org.id}>{org.name}{org.acronym ? ` (${org.acronym})` : ''}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <label className={labelClass}>{t.description}</label>
                                <textarea className={textareaClass} rows={3} value={materialForm.description} onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })} />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className={labelClass}><MapPin className="h-4 w-4 text-gray-400" />{t.region}</label>
                                  <select className={selectClass} value={materialForm.region_id} onChange={(e) => setMaterialForm({ ...materialForm, region_id: e.target.value })}>
                                    <option value="">{t.selectRegion}</option>
                                    {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label className={labelClass}><MapPin className="h-4 w-4 text-gray-400" />{t.city}</label>
                                  <input className={inputClass} value={materialForm.city} onChange={(e) => setMaterialForm({ ...materialForm, city: e.target.value })} />
                                </div>
                              </div>
                              <div>
                                <label className={labelClass}>{t.address}</label>
                                <input className={inputClass} value={materialForm.address} onChange={(e) => setMaterialForm({ ...materialForm, address: e.target.value })} />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className={labelClass}><Mail className="h-4 w-4 text-gray-400" />{t.email}</label>
                                  <input className={inputClass} type="email" value={materialForm.contact_email} onChange={(e) => setMaterialForm({ ...materialForm, contact_email: e.target.value })} />
                                </div>
                                <div>
                                  <label className={labelClass}><Phone className="h-4 w-4 text-gray-400" />{t.phone}</label>
                                  <input className={inputClass} type="tel" value={materialForm.contact_phone} onChange={(e) => setMaterialForm({ ...materialForm, contact_phone: e.target.value })} />
                                </div>
                              </div>
                              <div>
                                <label className={labelClass}>{t.capacity}</label>
                                <input className={inputClass} placeholder={lang === 'fr' ? 'Ex: 50 échantillons/jour' : 'Ex: 50 samples/day'} value={materialForm.capacity} onChange={(e) => setMaterialForm({ ...materialForm, capacity: e.target.value })} />
                              </div>
                            </>
                          )}

                          {/* Organization Form */}
                          {selectedResourceType === 'organization' && (
                            <>
                              {/* Logo + Main Info Section */}
                              <div className="flex items-start gap-6">
                                {/* Logo Upload */}
                                <div className="flex-shrink-0">
                                  <label className={labelClass}><Camera className="h-4 w-4 text-gray-400" />{t.logo}</label>
                                  <div className="mt-1">
                                    {orgLogoPreview ? (
                                      <div className="relative w-32 h-32">
                                        <img src={orgLogoPreview} alt="Logo" className="w-32 h-32 rounded-xl object-contain border-2 border-gray-200 bg-white p-2" />
                                        <button
                                          type="button"
                                          onClick={() => { setOrgLogoFile(null); setOrgLogoPreview(null); }}
                                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                        >
                                          <XCircle className="h-4 w-4" />
                                        </button>
                                      </div>
                                    ) : (
                                      <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50/50 transition-colors">
                                        <Building2 className="h-8 w-8 text-gray-400" />
                                        <span className="text-xs text-gray-500 mt-1">{t.uploadLogo}</span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              setOrgLogoFile(file);
                                              setOrgLogoPreview(URL.createObjectURL(file));
                                            }
                                          }}
                                        />
                                      </label>
                                    )}
                                  </div>
                                </div>

                                {/* Main Info */}
                                <div className="flex-1 space-y-4">
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2">
                                      <label className={labelClass}>{t.name} <span className="text-red-500">*</span></label>
                                      <input className={inputClass} required value={orgForm.name} onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })} />
                                    </div>
                                    <div>
                                      <label className={labelClass}>{t.acronym}</label>
                                      <input className={inputClass} placeholder="OMS, FAO..." value={orgForm.acronym} onChange={(e) => setOrgForm({ ...orgForm, acronym: e.target.value })} />
                                    </div>
                                  </div>
                                  <div>
                                    <label className={labelClass}>{t.type} <span className="text-red-500">*</span></label>
                                    <select className={selectClass} required value={orgForm.type} onChange={(e) => setOrgForm({ ...orgForm, type: e.target.value })}>
                                      <option value="">{t.selectType}</option>
                                      {Object.entries(t.orgTypes).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
                                    </select>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <label className={labelClass}>{t.description}</label>
                                <textarea className={textareaClass} rows={2} value={orgForm.description} onChange={(e) => setOrgForm({ ...orgForm, description: e.target.value })} />
                              </div>
                              <div>
                                <label className={labelClass}>{t.mission}</label>
                                <textarea className={textareaClass} rows={2} value={orgForm.mission} onChange={(e) => setOrgForm({ ...orgForm, mission: e.target.value })} />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className={labelClass}><MapPin className="h-4 w-4 text-gray-400" />{t.region}</label>
                                  <select className={selectClass} value={orgForm.region_id} onChange={(e) => setOrgForm({ ...orgForm, region_id: e.target.value })}>
                                    <option value="">{t.selectRegion}</option>
                                    {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label className={labelClass}><MapPin className="h-4 w-4 text-gray-400" />{t.city}</label>
                                  <input className={inputClass} value={orgForm.city} onChange={(e) => setOrgForm({ ...orgForm, city: e.target.value })} />
                                </div>
                              </div>
                              <div>
                                <label className={labelClass}>{t.address}</label>
                                <input className={inputClass} value={orgForm.address} onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })} />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className={labelClass}><Mail className="h-4 w-4 text-gray-400" />{t.email}</label>
                                  <input className={inputClass} type="email" value={orgForm.contact_email} onChange={(e) => setOrgForm({ ...orgForm, contact_email: e.target.value })} />
                                </div>
                                <div>
                                  <label className={labelClass}><Phone className="h-4 w-4 text-gray-400" />{t.phone}</label>
                                  <input className={inputClass} type="tel" value={orgForm.contact_phone} onChange={(e) => setOrgForm({ ...orgForm, contact_phone: e.target.value })} />
                                </div>
                              </div>
                              <div>
                                <label className={labelClass}><Globe className="h-4 w-4 text-gray-400" />{t.website}</label>
                                <input className={inputClass} type="url" placeholder="https://" value={orgForm.website} onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })} />
                              </div>
                            </>
                          )}

                          {/* Document Form */}
                          {selectedResourceType === 'document' && (
                            <>
                              {/* Thumbnail + Main Info Section */}
                              <div className="flex items-start gap-6">
                                {/* Thumbnail Upload */}
                                <div className="flex-shrink-0">
                                  <label className={labelClass}><Camera className="h-4 w-4 text-gray-400" />{t.thumbnail}</label>
                                  <div className="mt-1">
                                    {docThumbnailPreview ? (
                                      <div className="relative w-40 h-28">
                                        <img src={docThumbnailPreview} alt="Thumbnail" className="w-40 h-28 rounded-xl object-cover border-2 border-gray-200" />
                                        <button
                                          type="button"
                                          onClick={() => { setDocThumbnailFile(null); setDocThumbnailPreview(null); }}
                                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                        >
                                          <XCircle className="h-4 w-4" />
                                        </button>
                                      </div>
                                    ) : (
                                      <label className="w-40 h-28 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors">
                                        <Camera className="h-8 w-8 text-gray-400" />
                                        <span className="text-xs text-gray-500 mt-1">{t.uploadThumbnail}</span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              setDocThumbnailFile(file);
                                              setDocThumbnailPreview(URL.createObjectURL(file));
                                            }
                                          }}
                                        />
                                      </label>
                                    )}
                                  </div>
                                </div>

                                {/* Main Info */}
                                <div className="flex-1 space-y-4">
                                  <div>
                                    <label className={labelClass}>{lang === 'fr' ? 'Titre' : 'Title'} <span className="text-red-500">*</span></label>
                                    <input className={inputClass} required value={docForm.title} onChange={(e) => setDocForm({ ...docForm, title: e.target.value })} />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className={labelClass}>{t.type} <span className="text-red-500">*</span></label>
                                      <select className={selectClass} required value={docForm.type} onChange={(e) => setDocForm({ ...docForm, type: e.target.value })}>
                                        <option value="">{t.selectType}</option>
                                        {Object.entries(t.docTypes).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className={labelClass}>{t.accessLevel}</label>
                                      <select className={selectClass} value={docForm.access_level} onChange={(e) => setDocForm({ ...docForm, access_level: e.target.value })}>
                                        {Object.entries(t.accessLevels).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* File Upload */}
                              <div>
                                <label className={labelClass}><FileUp className="h-4 w-4 text-gray-400" />{t.file}</label>
                                <div className="mt-1">
                                  {docFile ? (
                                    <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                      <FileText className="h-5 w-5 text-emerald-500" />
                                      <span className="text-sm text-emerald-700 flex-1 truncate">{docFile.name}</span>
                                      <span className="text-xs text-emerald-500">{(docFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                      <button
                                        type="button"
                                        onClick={() => setDocFile(null)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <XCircle className="h-5 w-5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <label className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors">
                                      <FileUp className="h-6 w-6 text-gray-400" />
                                      <div>
                                        <span className="text-sm text-gray-600 font-medium">{t.uploadFile}</span>
                                        <p className="text-xs text-gray-400">PDF, DOC, DOCX, MP4, etc.</p>
                                      </div>
                                      <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.mp4,.avi,.mov,.ppt,.pptx,.xls,.xlsx"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) setDocFile(file);
                                        }}
                                      />
                                    </label>
                                  )}
                                </div>
                              </div>

                              <div>
                                <label className={labelClass}>{t.description}</label>
                                <textarea className={textareaClass} rows={3} value={docForm.description} onChange={(e) => setDocForm({ ...docForm, description: e.target.value })} />
                              </div>
                              <div>
                                <label className={labelClass}><Globe className="h-4 w-4 text-gray-400" />{t.externalUrl}</label>
                                <input className={inputClass} type="url" placeholder="https://" value={docForm.external_url} onChange={(e) => setDocForm({ ...docForm, external_url: e.target.value })} />
                              </div>
                              <div>
                                <label className={labelClass}>{t.publicationDate}</label>
                                <input className={inputClass} type="date" value={docForm.publication_date} onChange={(e) => setDocForm({ ...docForm, publication_date: e.target.value })} />
                              </div>
                            </>
                          )}

                          <div className="pt-4">
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className={cn(
                                'w-full py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl',
                                'disabled:opacity-60 disabled:cursor-not-allowed',
                                selectedResourceType === 'expert' && 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-blue-500/25',
                                selectedResourceType === 'material' && 'bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-amber-500/25',
                                selectedResourceType === 'organization' && 'bg-gradient-to-r from-purple-500 to-pink-600 hover:shadow-purple-500/25',
                                selectedResourceType === 'document' && 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-emerald-500/25',
                              )}
                            >
                              {isSubmitting ? (
                                <><Loader2 className="h-5 w-5 animate-spin" />{t.submitting}</>
                              ) : (
                                <><Send className="h-5 w-5" />{t.submit}</>
                              )}
                            </button>
                          </div>
                    </form>
                  </div>
                </div>
              ) : (
                <>
                  {/* Colored Action Buttons + My Submissions Header */}
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <button
                      onClick={() => { setSelectedResourceType('expert'); setSubmitMessage(null); }}
                      className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] transition-all text-sm"
                    >
                      <UserPlus className="h-4 w-4" />
                      {t.registerExpert}
                    </button>
                    <button
                      onClick={() => { setSelectedResourceType('material'); setSubmitMessage(null); }}
                      className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02] transition-all text-sm"
                    >
                      <Wrench className="h-4 w-4" />
                      {t.addMaterial}
                    </button>
                    <button
                      onClick={() => { setSelectedResourceType('organization'); setSubmitMessage(null); }}
                      className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02] transition-all text-sm"
                    >
                      <Building2 className="h-4 w-4" />
                      {t.addOrganization}
                    </button>
                    <button
                      onClick={() => { setSelectedResourceType('document'); setSubmitMessage(null); }}
                      className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] transition-all text-sm"
                    >
                      <FileUp className="h-4 w-4" />
                      {t.addDocument}
                    </button>

                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-lg font-semibold text-gray-900">{t.mySubmissions}</span>
                      {pendingCount > 0 && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                          {pendingCount} {t.pending.toLowerCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* My Submissions List */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                    {allSubmissions.length === 0 ? (
                      <div className="p-12 text-center">
                        <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">{t.noSubmissions}</p>
                        <p className="text-sm text-gray-400 mt-2">
                          {lang === 'fr'
                            ? 'Utilisez les boutons ci-dessus pour soumettre une ressource'
                            : 'Use the buttons above to submit a resource'}
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {allSubmissions.map((submission, idx) => (
                          <div
                            key={`${submission.type}-${submission.id}-${idx}`}
                            className="p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                                submission.type === 'expert' && 'bg-blue-100',
                                submission.type === 'material' && 'bg-amber-100',
                                submission.type === 'organization' && 'bg-purple-100',
                                submission.type === 'document' && 'bg-emerald-100',
                              )}>
                                {submission.type === 'expert' && <UserPlus className="h-5 w-5 text-blue-600" />}
                                {submission.type === 'material' && <Wrench className="h-5 w-5 text-amber-600" />}
                                {submission.type === 'organization' && <Building2 className="h-5 w-5 text-purple-600" />}
                                {submission.type === 'document' && <FileUp className="h-5 w-5 text-emerald-600" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {submission.name || submission.title_fr || submission.title || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {getTypeLabel(submission.type)} • {new Date(submission.submitted_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(submission.submission_status)}
                                <span className={cn(
                                  'text-sm font-medium',
                                  submission.submission_status === 'pending' && 'text-amber-600',
                                  submission.submission_status === 'approved' && 'text-green-600',
                                  submission.submission_status === 'rejected' && 'text-red-600',
                                )}>
                                  {getStatusLabel(submission.submission_status)}
                                </span>
                              </div>
                            </div>
                            {submission.submission_status === 'rejected' && submission.rejection_reason && (
                              <div className="mt-3 ml-14 p-3 bg-red-50 rounded-lg">
                                <p className="text-sm text-red-700">
                                  <span className="font-medium">{lang === 'fr' ? 'Raison:' : 'Reason:'}</span> {submission.rejection_reason}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
