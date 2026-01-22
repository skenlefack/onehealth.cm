import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Radar, AlertTriangle, Megaphone, Send, MessageCircle, Hash, Search, Filter,
  Plus, Edit2, Trash2, Eye, Check, X, Clock, MapPin, User, Phone, Mail,
  ChevronLeft, ChevronRight, RefreshCw, Download, Upload, Settings, Bell,
  Globe, Wifi, Signal, Database, TrendingUp, TrendingDown, BarChart3,
  Calendar, Target, CheckCircle, XCircle, AlertCircle, Loader, Save,
  Share2, QrCode, Smartphone, Radio, Bug, Skull, ThermometerSun, Heart,
  Leaf, Home, FileText, Copy, ExternalLink, Siren, MapPinned, Map,
  Users, Shield, GitBranch, ArrowUpRight, ArrowRight, MessageSquare,
  ClipboardCheck, Building, Layers, Activity, ChevronDown, ChevronUp,
  Crosshair, PenTool, Pentagon, Circle
} from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker as GoogleMarker, Polyline as GooglePolyline, Polygon as GooglePolygon, Autocomplete } from '@react-google-maps/api';

// Google Maps API Key - à mettre dans .env en production
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const GOOGLE_MAPS_LIBRARIES = ['places', 'drawing'];

const API_URL = process.env.REACT_APP_API_URL || '/api';

// ============== API HELPER ==============
const api = {
  get: async (endpoint, token) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  },
  post: async (endpoint, data, token) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  },
  put: async (endpoint, data, token) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  },
  delete: async (endpoint, token) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }
};

// ============== CONSTANTS ==============
const RUMOR_STATUSES = [
  { value: 'pending', label: 'En attente', color: '#3498DB', icon: Bell },
  { value: 'investigating', label: 'En investigation', color: '#F39C12', icon: Search },
  { value: 'confirmed', label: 'Confirmée', color: '#E74C3C', icon: AlertTriangle },
  { value: 'false_alarm', label: 'Fausse alerte', color: '#95a5a6', icon: XCircle },
  { value: 'closed', label: 'Clôturée', color: '#27AE60', icon: CheckCircle }
];

const RUMOR_PRIORITIES = [
  { value: 'low', label: 'Basse', color: '#27AE60' },
  { value: 'medium', label: 'Moyenne', color: '#F39C12' },
  { value: 'high', label: 'Haute', color: '#E67E22' },
  { value: 'critical', label: 'Critique', color: '#E74C3C' }
];

// Catégories selon le document officiel "Fiche de collecte des rumeurs"
const RUMOR_CATEGORIES = [
  { value: 'human_health', label: 'Santé humaine', icon: Heart, color: '#E74C3C' },
  { value: 'safety', label: 'Sécurité', icon: AlertTriangle, color: '#E67E22' },
  { value: 'animal_health', label: 'Santé Animale', icon: Bug, color: '#9B59B6' },
  { value: 'disaster', label: 'Catastrophe', icon: Siren, color: '#3498DB' },
  { value: 'environmental', label: 'Santé Environnement', icon: Leaf, color: '#27AE60' },
  { value: 'other', label: 'Autre', icon: AlertCircle, color: '#95a5a6' }
];

// Niveaux de validation selon l'atelier COHRM (5 niveaux)
const VALIDATION_LEVELS = [
  { level: 1, label: 'Acteur Communautaire', description: 'Collecte initiale', color: '#3498DB' },
  { level: 2, label: 'Vérificateur', description: 'Triage et vérification', color: '#9B59B6' },
  { level: 3, label: 'Évaluateur de Risques', description: 'Évaluation et riposte', color: '#E67E22' },
  { level: 4, label: 'Coordonnateur Régional', description: 'Coordination régionale', color: '#E74C3C' },
  { level: 5, label: 'Superviseur Central', description: 'Supervision nationale', color: '#27AE60' }
];

// Niveaux de risque
const RISK_LEVELS = [
  { value: 'unknown', label: 'Non évalué', color: '#95a5a6' },
  { value: 'low', label: 'Faible', color: '#27AE60' },
  { value: 'moderate', label: 'Modéré', color: '#F39C12' },
  { value: 'high', label: 'Élevé', color: '#E67E22' },
  { value: 'very_high', label: 'Très élevé', color: '#E74C3C' }
];

// Thèmes de rumeurs (Section 5 du formulaire officiel)
const RUMOR_THEMES = [
  { code: 'suspect_case_human', label: 'Cas suspect / Personne malade', category: 'human_health' },
  { code: 'human_death', label: 'Décès humain', category: 'human_health' },
  { code: 'quarantine', label: 'Confinement ou quarantaine', category: 'human_health' },
  { code: 'disease_denial', label: 'Déni de la maladie/virus', category: 'human_health' },
  { code: 'case_estimates', label: 'Estimation de chiffres (cas surestimés ou cachés)', category: 'human_health' },
  { code: 'prevention_reluctance', label: 'Réticence aux mesures de prévention', category: 'human_health' },
  { code: 'vaccine_reluctance', label: 'Réticence aux vaccins', category: 'human_health' },
  { code: 'perceived_severity', label: 'Peur/gravité perçue de la maladie', category: 'human_health' },
  { code: 'transmission_mode', label: 'Mode de transmission', category: 'human_health' },
  { code: 'risky_beliefs', label: 'Croyances et pratiques à risque', category: 'human_health' },
  { code: 'suspect_case_animal', label: 'Cas suspect / Animal malade', category: 'animal_health' },
  { code: 'animal_death', label: 'Mort d\'animal', category: 'animal_health' },
  { code: 'sick_animal_consumption', label: 'Consommation d\'animaux malades ou morts', category: 'animal_health' },
  { code: 'sick_animal_handling', label: 'Manipulation d\'animaux malades', category: 'animal_health' },
  { code: 'animal_bites', label: 'Morsures d\'animaux', category: 'animal_health' },
  { code: 'stigmatization', label: 'Stigmatisation', category: 'social' },
  { code: 'conspiracy_theory', label: 'Théorie du complot', category: 'social' },
  { code: 'natural_disasters', label: 'Catastrophes naturelles', category: 'environmental' },
  { code: 'traffic_accidents', label: 'Accident de la voie publique', category: 'other' },
  { code: 'violence_conflict', label: 'Violence et conflit', category: 'social' }
];

// Types de sources selon le formulaire officiel
const SOURCE_TYPES = [
  { value: 'community', label: 'Dans la communauté', icon: Home },
  { value: 'social_network', label: 'Réseaux sociaux', icon: Share2 },
  { value: 'hotline', label: 'Ligne verte', icon: Phone },
  { value: 'call_center', label: 'Centre d\'appel', icon: Phone },
  { value: 'media', label: 'Médias', icon: Radio },
  { value: 'sms', label: 'SMS', icon: Phone },
  { value: 'mobile_app', label: 'Application mobile', icon: Smartphone },
  { value: 'web_scan', label: 'Scanner web', icon: Globe },
  { value: 'direct', label: 'Déclaration directe', icon: Megaphone },
  { value: 'other', label: 'Autre', icon: AlertCircle }
];

const RUMOR_SOURCES = [
  { value: 'sms', label: 'SMS Codifié', icon: Phone },
  { value: 'web', label: 'Scan Web', icon: Globe },
  { value: 'mobile', label: 'Application mobile', icon: Smartphone },
  { value: 'direct', label: 'Signalement direct', icon: Megaphone },
  { value: 'hotline', label: 'Ligne téléphonique', icon: Phone },
  { value: 'media', label: 'Médias', icon: Radio },
  { value: 'social', label: 'Réseaux sociaux', icon: Share2 }
];

const SMS_CODES = [
  { code: 'EP', meaning: 'Épidémie suspectée', category: 'epidemic', priority: 'critical' },
  { code: 'ZO', meaning: 'Cas de zoonose', category: 'zoonosis', priority: 'high' },
  { code: 'MA', meaning: 'Maladie animale', category: 'animal_disease', priority: 'medium' },
  { code: 'EC', meaning: 'Eau contaminée', category: 'water_contamination', priority: 'high' },
  { code: 'AL', meaning: 'Aliment suspect', category: 'food_safety', priority: 'high' },
  { code: 'EN', meaning: 'Problème environnemental', category: 'environmental', priority: 'medium' },
  { code: 'DC', meaning: 'Décès suspect', category: 'unknown_disease', priority: 'critical' },
  { code: 'AU', meaning: 'Autre signalement', category: 'other', priority: 'low' }
];

const REGIONS_CAMEROON = [
  'Adamaoua', 'Centre', 'Est', 'Extrême-Nord', 'Littoral',
  'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest'
];

// ============== MAIN COMPONENT ==============
const COHRMSystemPage = ({ isDark, token }) => {
  // States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Data states
  const [rumors, setRumors] = useState([]);
  const [stats, setStats] = useState({
    total: 0, pending: 0, confirmed: 0, alerts: 0,
    bySource: [], byRegion: [], trend: []
  });
  const [agents, setAgents] = useState([]);
  const [sources, setSources] = useState([]);
  const [smsCodes, setSmsCodes] = useState(SMS_CODES);

  // UI states
  const [viewMode, setViewMode] = useState('list');
  const [selectedRumor, setSelectedRumor] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  // Filter states
  const [filters, setFilters] = useState({
    status: '', priority: '', category: '', source: '', region: '', search: '', dateFrom: '', dateTo: ''
  });

  // Form states (extended with official document fields)
  const [rumorForm, setRumorForm] = useState({
    title: '', description: '', message_received: '',
    category: 'human_health', priority: 'medium', source: 'direct', source_type: 'direct',
    category_other: '', source_type_other: '', reporter_type_other: '',
    themes: [],
    date_detection: '', date_circulation_start: '',
    region: '', department: '', arrondissement: '', commune: '',
    district: '', aire_sante: '', location: '',
    latitude: '', longitude: '',
    geometry_type: 'point', // 'point', 'line', 'polygon'
    geometry_data: null, // Array of coordinates for line/polygon
    reporter_name: '', reporter_phone: '', reporter_type: 'anonymous',
    affected_count: '', dead_count: '', symptoms: '', species: '',
    gravity_comment: '', verification_notes: '', response_actions: ''
  });

  // Map modal state
  const [showMapModal, setShowMapModal] = useState(false);

  // Settings states
  const [settingsTab, setSettingsTab] = useState('sms-codes');
  const [scannerSettings, setScannerSettings] = useState({
    enabled: false, interval: 30, keywords: [], sources: []
  });

  // SMS Decoder states
  const [smsInput, setSmsInput] = useState('');
  const [decodedResult, setDecodedResult] = useState(null);

  // Scan History states
  const [scanHistory, setScanHistory] = useState([]);
  const [scanHistoryLoading, setScanHistoryLoading] = useState(false);
  const [scanHistoryPagination, setScanHistoryPagination] = useState({ page: 1, limit: 20, total: 0 });

  // Actors states
  const [actors, setActors] = useState([]);
  const [actorTypes, setActorTypes] = useState({});
  const [selectedActor, setSelectedActor] = useState(null);
  const [actorForm, setActorForm] = useState({
    user_id: '', actor_level: 1, actor_type: '', region: '', department: '',
    district: '', organization: '', role_in_org: '', phone: '', email: '',
    transmission_channel: 'system'
  });
  const [actorViewMode, setActorViewMode] = useState('list');

  // Validation workflow states
  const [pendingValidations, setPendingValidations] = useState([]);
  const [validationDetail, setValidationDetail] = useState(null);
  const [validationForm, setValidationForm] = useState({
    action_type: 'verify', status: 'validated', notes: '', rejection_reason: ''
  });

  // Feedback states
  const [feedbackForm, setFeedbackForm] = useState({
    recipient_type: 'reporter', feedback_type: 'status_update', message: '', channel: 'system'
  });

  // Dashboard extended stats
  const [dashboardData, setDashboardData] = useState(null);

  // Validation assignees states
  const [validationAssignees, setValidationAssignees] = useState({ data: [], byLevel: {} });
  const [availableUsers, setAvailableUsers] = useState([]);
  const [assigneeForm, setAssigneeForm] = useState({
    user_id: '',
    validation_level: 1,
    region: '',
    department: '',
    can_validate: true,
    can_reject: true,
    can_escalate: true,
    can_assess_risk: true,
    can_send_feedback: true,
    notify_email: true,
    notify_sms: false,
    notes: ''
  });
  const [assigneesViewMode, setAssigneesViewMode] = useState('list'); // 'list' or 'form'
  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const [assigneesLoading, setAssigneesLoading] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState(null);
  const [myAssignedLevels, setMyAssignedLevels] = useState([]);

  // Styles
  const styles = {
    card: {
      background: isDark ? '#1e293b' : '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.08)',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '10px',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      background: isDark ? '#0f172a' : '#ffffff',
      color: isDark ? '#e2e8f0' : '#1e293b',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '10px',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      background: isDark ? '#0f172a' : '#ffffff',
      color: isDark ? '#e2e8f0' : '#1e293b',
      fontSize: '14px',
      outline: 'none',
      cursor: 'pointer'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '13px',
      fontWeight: '600',
      color: isDark ? '#94a3b8' : '#64748b'
    },
    btnPrimary: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 20px',
      background: '#E74C3C',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    btnSecondary: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 20px',
      background: isDark ? '#334155' : '#f1f5f9',
      color: isDark ? '#e2e8f0' : '#475569',
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    tab: (active) => ({
      padding: '12px 20px',
      background: active ? (isDark ? '#334155' : '#ffffff') : 'transparent',
      color: active ? (isDark ? '#e2e8f0' : '#1e293b') : (isDark ? '#64748b' : '#94a3b8'),
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: active ? '600' : '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    }),
    statCard: (color) => ({
      background: isDark ? '#1e293b' : '#ffffff',
      borderRadius: '16px',
      padding: '20px',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      borderLeft: `4px solid ${color}`,
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    }),
    badge: (color) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      background: `${color}20`,
      color: color,
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600'
    })
  };

  // ============== MAP MODAL COMPONENT (Google Maps) ==============
  const MapModal = ({ isOpen, onClose, onConfirm, initialPosition, initialGeometryType, initialGeometryData }) => {
    const [drawMode, setDrawMode] = useState(initialGeometryType || 'point');
    const [markerPosition, setMarkerPosition] = useState(initialPosition || null);
    const [polylinePoints, setPolylinePoints] = useState(initialGeometryData && initialGeometryType === 'line' ? initialGeometryData : []);
    const [polygonPoints, setPolygonPoints] = useState(initialGeometryData && initialGeometryType === 'polygon' ? initialGeometryData : []);
    const [mapCenter, setMapCenter] = useState(
      initialPosition ? { lat: initialPosition.lat, lng: initialPosition.lng } : { lat: 6.0, lng: 12.0 }
    );
    const [searchBox, setSearchBox] = useState(null);
    const [map, setMap] = useState(null);

    const { isLoaded, loadError } = useJsApiLoader({
      googleMapsApiKey: GOOGLE_MAPS_API_KEY,
      libraries: GOOGLE_MAPS_LIBRARIES
    });

    const handleMapClick = useCallback((e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      if (drawMode === 'point') {
        setMarkerPosition({ lat, lng });
      } else if (drawMode === 'line') {
        setPolylinePoints(prev => [...prev, { lat, lng }]);
      } else if (drawMode === 'polygon') {
        setPolygonPoints(prev => [...prev, { lat, lng }]);
      }
    }, [drawMode]);

    const handleClear = () => {
      setMarkerPosition(null);
      setPolylinePoints([]);
      setPolygonPoints([]);
    };

    const handleConfirm = () => {
      let result = {
        geometry_type: drawMode,
        latitude: '',
        longitude: '',
        geometry_data: null
      };

      if (drawMode === 'point' && markerPosition) {
        result.latitude = markerPosition.lat.toFixed(6);
        result.longitude = markerPosition.lng.toFixed(6);
      } else if (drawMode === 'line' && polylinePoints.length > 1) {
        result.geometry_data = polylinePoints.map(p => [p.lat, p.lng]);
        result.latitude = polylinePoints[0].lat.toFixed(6);
        result.longitude = polylinePoints[0].lng.toFixed(6);
      } else if (drawMode === 'polygon' && polygonPoints.length > 2) {
        result.geometry_data = polygonPoints.map(p => [p.lat, p.lng]);
        const center = polygonPoints.reduce((acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }), { lat: 0, lng: 0 });
        result.latitude = (center.lat / polygonPoints.length).toFixed(6);
        result.longitude = (center.lng / polygonPoints.length).toFixed(6);
      }

      onConfirm(result);
      onClose();
    };

    const undoLastPoint = () => {
      if (drawMode === 'line' && polylinePoints.length > 0) {
        setPolylinePoints(prev => prev.slice(0, -1));
      } else if (drawMode === 'polygon' && polygonPoints.length > 0) {
        setPolygonPoints(prev => prev.slice(0, -1));
      }
    };

    const onPlaceSelected = () => {
      if (searchBox) {
        const place = searchBox.getPlace();
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          setMapCenter({ lat, lng });
          if (map) {
            map.panTo({ lat, lng });
            map.setZoom(15);
          }
          if (drawMode === 'point') {
            setMarkerPosition({ lat, lng });
          }
        }
      }
    };

    if (!isOpen) return null;

    const modalStyles = {
      overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      },
      modal: {
        background: isDark ? '#1e293b' : '#ffffff',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      },
      header: {
        padding: '16px 20px',
        borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      },
      body: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      },
      footer: {
        padding: '16px 20px',
        borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      },
      mapContainer: {
        flex: 1,
        minHeight: '400px',
        position: 'relative'
      },
      toolbar: {
        padding: '12px 20px',
        background: isDark ? '#0f172a' : '#f8fafc',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        flexWrap: 'wrap'
      },
      toolButton: (active) => ({
        padding: '10px 16px',
        borderRadius: '8px',
        border: `2px solid ${active ? '#E74C3C' : (isDark ? '#334155' : '#e2e8f0')}`,
        background: active ? '#E74C3C20' : 'transparent',
        color: active ? '#E74C3C' : (isDark ? '#e2e8f0' : '#1e293b'),
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        fontWeight: active ? '600' : '400'
      }),
      searchInput: {
        padding: '10px 14px',
        borderRadius: '8px',
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        background: isDark ? '#1e293b' : '#ffffff',
        color: isDark ? '#e2e8f0' : '#1e293b',
        fontSize: '14px',
        width: '300px',
        outline: 'none'
      }
    };

    const mapContainerStyle = {
      width: '100%',
      height: '100%'
    };

    return (
      <div style={modalStyles.overlay} onClick={onClose}>
        <div style={modalStyles.modal} onClick={e => e.stopPropagation()}>
          <div style={modalStyles.header}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>
              <Map size={20} style={{ marginRight: '10px', verticalAlign: 'middle', color: '#E74C3C' }} />
              Sélectionner la localisation
            </h3>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
              onClick={onClose}
            >
              <X size={24} color={isDark ? '#94a3b8' : '#64748b'} />
            </button>
          </div>

          <div style={modalStyles.body}>
            {/* Search Bar */}
            <div style={{ padding: '12px 20px', background: isDark ? '#0f172a' : '#f8fafc', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Search size={18} color={isDark ? '#64748b' : '#94a3b8'} />
                {isLoaded && (
                  <Autocomplete
                    onLoad={setSearchBox}
                    onPlaceChanged={onPlaceSelected}
                  >
                    <input
                      type="text"
                      placeholder="Rechercher un lieu..."
                      style={modalStyles.searchInput}
                    />
                  </Autocomplete>
                )}
              </div>
            </div>

            {/* Toolbar */}
            <div style={modalStyles.toolbar}>
              <span style={{ fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b', marginRight: '8px' }}>Type:</span>
              <button
                style={modalStyles.toolButton(drawMode === 'point')}
                onClick={() => setDrawMode('point')}
              >
                <Crosshair size={16} /> Point
              </button>
              <button
                style={modalStyles.toolButton(drawMode === 'line')}
                onClick={() => setDrawMode('line')}
              >
                <PenTool size={16} /> Tracé
              </button>
              <button
                style={modalStyles.toolButton(drawMode === 'polygon')}
                onClick={() => setDrawMode('polygon')}
              >
                <Pentagon size={16} /> Polygone
              </button>

              <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                {(drawMode === 'line' || drawMode === 'polygon') && (
                  <button style={{ ...styles.btnSecondary, padding: '8px 12px' }} onClick={undoLastPoint}>
                    <ChevronLeft size={16} /> Annuler
                  </button>
                )}
                <button style={{ ...styles.btnSecondary, padding: '8px 12px' }} onClick={handleClear}>
                  <Trash2 size={16} /> Effacer
                </button>
              </div>
            </div>

            {/* Map */}
            <div style={modalStyles.mapContainer}>
              {loadError && (
                <div style={{ padding: '40px', textAlign: 'center', color: '#E74C3C' }}>
                  <AlertCircle size={48} style={{ marginBottom: '16px' }} />
                  <p>Erreur de chargement de Google Maps</p>
                  <p style={{ fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>
                    Vérifiez votre clé API Google Maps
                  </p>
                </div>
              )}
              {!isLoaded && !loadError && (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} color="#E74C3C" />
                  <p style={{ marginTop: '16px', color: isDark ? '#64748b' : '#94a3b8' }}>Chargement de la carte...</p>
                </div>
              )}
              {isLoaded && (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={mapCenter}
                  zoom={6}
                  onClick={handleMapClick}
                  onLoad={setMap}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: true,
                    fullscreenControl: false
                  }}
                >
                  {/* Point marker */}
                  {drawMode === 'point' && markerPosition && (
                    <GoogleMarker position={markerPosition} />
                  )}

                  {/* Polyline */}
                  {drawMode === 'line' && polylinePoints.length > 0 && (
                    <>
                      <GooglePolyline
                        path={polylinePoints}
                        options={{
                          strokeColor: '#E74C3C',
                          strokeWeight: 3
                        }}
                      />
                      {polylinePoints.map((point, idx) => (
                        <GoogleMarker
                          key={idx}
                          position={point}
                          label={{
                            text: String(idx + 1),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      ))}
                    </>
                  )}

                  {/* Polygon */}
                  {drawMode === 'polygon' && polygonPoints.length > 0 && (
                    <>
                      {polygonPoints.length > 2 ? (
                        <GooglePolygon
                          paths={polygonPoints}
                          options={{
                            strokeColor: '#27AE60',
                            strokeWeight: 2,
                            fillColor: '#27AE60',
                            fillOpacity: 0.2
                          }}
                        />
                      ) : (
                        <GooglePolyline
                          path={polygonPoints}
                          options={{
                            strokeColor: '#27AE60',
                            strokeWeight: 2,
                            strokeOpacity: 0.8
                          }}
                        />
                      )}
                      {polygonPoints.map((point, idx) => (
                        <GoogleMarker
                          key={idx}
                          position={point}
                          label={{
                            text: String(idx + 1),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      ))}
                    </>
                  )}
                </GoogleMap>
              )}
            </div>

            {/* Status bar */}
            <div style={{ padding: '12px 20px', background: isDark ? '#0f172a' : '#f8fafc', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>
              {drawMode === 'point' && (
                markerPosition
                  ? `Point sélectionné: ${markerPosition.lat.toFixed(6)}, ${markerPosition.lng.toFixed(6)}`
                  : 'Cliquez sur la carte pour placer un point'
              )}
              {drawMode === 'line' && (
                polylinePoints.length > 0
                  ? `Tracé: ${polylinePoints.length} point(s) - Cliquez pour ajouter des points`
                  : 'Cliquez sur la carte pour tracer une ligne'
              )}
              {drawMode === 'polygon' && (
                polygonPoints.length > 0
                  ? `Polygone: ${polygonPoints.length} point(s) - ${polygonPoints.length < 3 ? 'Minimum 3 points requis' : 'Zone définie'}`
                  : 'Cliquez sur la carte pour dessiner un polygone'
              )}
            </div>
          </div>

          <div style={modalStyles.footer}>
            <button style={styles.btnSecondary} onClick={onClose}>
              Annuler
            </button>
            <button
              style={{
                ...styles.btnPrimary,
                opacity: (
                  (drawMode === 'point' && !markerPosition) ||
                  (drawMode === 'line' && polylinePoints.length < 2) ||
                  (drawMode === 'polygon' && polygonPoints.length < 3)
                ) ? 0.5 : 1
              }}
              onClick={handleConfirm}
              disabled={
                (drawMode === 'point' && !markerPosition) ||
                (drawMode === 'line' && polylinePoints.length < 2) ||
                (drawMode === 'polygon' && polygonPoints.length < 3)
              }
            >
              <Check size={16} /> Confirmer
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Handle map data confirmation
  const handleMapConfirm = (data) => {
    setRumorForm({
      ...rumorForm,
      latitude: data.latitude,
      longitude: data.longitude,
      geometry_type: data.geometry_type,
      geometry_data: data.geometry_data
    });
    setShowMapModal(false);
  };

  // Format coordinates for display
  const formatCoordinates = () => {
    if (!rumorForm.latitude && !rumorForm.longitude) return '';
    let display = `${rumorForm.latitude || '0'}, ${rumorForm.longitude || '0'}`;
    if (rumorForm.geometry_type === 'line' && rumorForm.geometry_data) {
      display += ` (Tracé: ${rumorForm.geometry_data.length} points)`;
    } else if (rumorForm.geometry_type === 'polygon' && rumorForm.geometry_data) {
      display += ` (Polygone: ${rumorForm.geometry_data.length} points)`;
    }
    return display;
  };

  // Toast effect
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch data on mount
  useEffect(() => {
    fetchRumors();
    fetchStats();
  }, [filters, pagination.page]);

  // Fetch rumors
  const fetchRumors = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: pagination.page,
      limit: pagination.limit,
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
    });
    const res = await api.get(`/cohrm/rumors?${params}`, token);
    if (res.success) {
      setRumors(res.data || []);
      if (res.pagination) setPagination(res.pagination);
    }
    setLoading(false);
  };

  // Fetch stats
  const fetchStats = async () => {
    const res = await api.get('/cohrm/stats', token);
    if (res.success && res.data) {
      setStats(res.data);
    }
  };

  // Fetch scan history
  const fetchScanHistory = async (page = 1) => {
    setScanHistoryLoading(true);
    const res = await api.get(`/cohrm/scan-history?page=${page}&limit=20`, token);
    if (res.success && res.data) {
      setScanHistory(res.data);
      if (res.pagination) setScanHistoryPagination(res.pagination);
    }
    setScanHistoryLoading(false);
  };

  // Run manual scan
  const runManualScan = async () => {
    setLoading(true);
    const res = await api.post('/cohrm/scan/run', {}, token);
    if (res.success) {
      setToast({ type: 'success', message: 'Scan lancé avec succès' });
      fetchScanHistory();
    } else {
      setToast({ type: 'error', message: res.message || 'Erreur lors du scan' });
    }
    setLoading(false);
  };

  // Fetch actors
  const fetchActors = async () => {
    setLoading(true);
    const res = await api.get('/cohrm/actors', token);
    if (res.success) {
      setActors(res.data || []);
    }
    // Fetch actor types
    const typesRes = await api.get('/cohrm/actor-types', token);
    if (typesRes.success) {
      setActorTypes(typesRes.data || {});
    }
    setLoading(false);
  };

  // Save actor
  const handleSaveActor = async () => {
    if (!actorForm.actor_type || !actorForm.actor_level) {
      setToast({ type: 'error', message: 'Niveau et type d\'acteur requis' });
      return;
    }
    setLoading(true);
    const res = selectedActor
      ? await api.put(`/cohrm/actors/${selectedActor.id}`, actorForm, token)
      : await api.post('/cohrm/actors', actorForm, token);

    if (res.success) {
      setToast({ type: 'success', message: selectedActor ? 'Acteur mis à jour' : 'Acteur créé' });
      setActorViewMode('list');
      setSelectedActor(null);
      fetchActors();
    } else {
      setToast({ type: 'error', message: res.message || 'Erreur' });
    }
    setLoading(false);
  };

  // Fetch pending validations (filtered by user's assigned levels)
  const fetchPendingValidations = async () => {
    setLoading(true);
    // Fetch dashboard data for stats
    const dashboardRes = await api.get('/cohrm/dashboard', token);
    if (dashboardRes.success && dashboardRes.data) {
      setDashboardData(dashboardRes.data);
    }
    // Fetch user-specific pending validations
    const validationsRes = await api.get('/cohrm/my-pending-validations', token);
    if (validationsRes.success) {
      setPendingValidations(validationsRes.data || []);
      // Track user's assigned levels
      if (validationsRes.myLevels) {
        setMyAssignedLevels(validationsRes.myLevels);
      } else if (validationsRes.isAdmin) {
        // Admins can see all levels
        setMyAssignedLevels([1, 2, 3, 4, 5]);
      }
    }
    setLoading(false);
  };

  // ============ VALIDATION ASSIGNEES FUNCTIONS ============

  // Fetch all validation assignees
  const fetchValidationAssignees = async () => {
    setAssigneesLoading(true);
    const res = await api.get('/cohrm/validation-assignees', token);
    if (res.success) {
      setValidationAssignees({ data: res.data || [], byLevel: res.byLevel || {} });
    }
    setAssigneesLoading(false);
  };

  // Fetch available users for assignment
  const fetchAvailableUsers = async (search = '', level = null) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (level) params.append('level', level);
    const res = await api.get(`/cohrm/validation-assignees/available-users?${params.toString()}`, token);
    if (res.success) {
      setAvailableUsers(res.data || []);
    }
  };

  // Create validation assignee
  const handleCreateAssignee = async () => {
    if (!assigneeForm.user_id || !assigneeForm.validation_level) {
      setToast({ type: 'error', message: 'Veuillez sélectionner un utilisateur et un niveau' });
      return;
    }
    setAssigneesLoading(true);
    const res = await api.post('/cohrm/validation-assignees', assigneeForm, token);
    if (res.success) {
      setToast({ type: 'success', message: 'Utilisateur assigné avec succès' });
      setAssigneesViewMode('list');
      resetAssigneeForm();
      fetchValidationAssignees();
    } else {
      setToast({ type: 'error', message: res.message || 'Erreur lors de l\'assignation' });
    }
    setAssigneesLoading(false);
  };

  // Update validation assignee
  const handleUpdateAssignee = async () => {
    if (!selectedAssignee) return;
    setAssigneesLoading(true);
    const res = await api.put(`/cohrm/validation-assignees/${selectedAssignee.id}`, assigneeForm, token);
    if (res.success) {
      setToast({ type: 'success', message: 'Assignation mise à jour' });
      setAssigneesViewMode('list');
      setSelectedAssignee(null);
      resetAssigneeForm();
      fetchValidationAssignees();
    } else {
      setToast({ type: 'error', message: res.message || 'Erreur lors de la mise à jour' });
    }
    setAssigneesLoading(false);
  };

  // Delete validation assignee
  const handleDeleteAssignee = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir retirer cet utilisateur de ce niveau de validation ?')) return;
    setAssigneesLoading(true);
    const res = await api.delete(`/cohrm/validation-assignees/${id}`, token);
    if (res.success) {
      setToast({ type: 'success', message: 'Assignation supprimée' });
      fetchValidationAssignees();
    } else {
      setToast({ type: 'error', message: res.message || 'Erreur lors de la suppression' });
    }
    setAssigneesLoading(false);
  };

  // Reset assignee form
  const resetAssigneeForm = () => {
    setAssigneeForm({
      user_id: '',
      validation_level: 1,
      region: '',
      department: '',
      can_validate: true,
      can_reject: true,
      can_escalate: true,
      can_assess_risk: true,
      can_send_feedback: true,
      notify_email: true,
      notify_sms: false,
      notes: ''
    });
    setUserSearchTerm('');
    setAvailableUsers([]);
  };

  // Edit assignee
  const handleEditAssignee = (assignee) => {
    setSelectedAssignee(assignee);
    setAssigneeForm({
      user_id: assignee.user_id,
      validation_level: assignee.validation_level,
      region: assignee.region || '',
      department: assignee.department || '',
      can_validate: assignee.can_validate,
      can_reject: assignee.can_reject,
      can_escalate: assignee.can_escalate,
      can_assess_risk: assignee.can_assess_risk,
      can_send_feedback: assignee.can_send_feedback,
      notify_email: assignee.notify_email,
      notify_sms: assignee.notify_sms,
      notes: assignee.notes || ''
    });
    setAssigneesViewMode('form');
  };

  // Fetch rumor detail for validation
  const fetchRumorForValidation = async (id) => {
    setLoading(true);
    const res = await api.get(`/cohrm/rumors/${id}`, token);
    if (res.success) {
      setValidationDetail(res.data);
    }
    setLoading(false);
  };

  // Submit validation
  const handleValidation = async () => {
    if (!validationDetail) return;
    setLoading(true);
    const res = await api.post(`/cohrm/rumors/${validationDetail.id}/validate`, validationForm, token);
    if (res.success) {
      setToast({ type: 'success', message: 'Validation enregistrée' });
      setValidationDetail(null);
      fetchPendingValidations();
    } else {
      setToast({ type: 'error', message: res.message || 'Erreur' });
    }
    setLoading(false);
  };

  // Submit risk assessment
  const handleRiskAssessment = async (riskData) => {
    if (!validationDetail) return;
    setLoading(true);
    const res = await api.post(`/cohrm/rumors/${validationDetail.id}/risk-assessment`, riskData, token);
    if (res.success) {
      setToast({ type: 'success', message: 'Évaluation des risques enregistrée' });
      fetchRumorForValidation(validationDetail.id);
    } else {
      setToast({ type: 'error', message: res.message || 'Erreur' });
    }
    setLoading(false);
  };

  // Send feedback
  const handleSendFeedback = async () => {
    if (!validationDetail || !feedbackForm.message) return;
    setLoading(true);
    const res = await api.post(`/cohrm/rumors/${validationDetail.id}/feedback`, feedbackForm, token);
    if (res.success) {
      setToast({ type: 'success', message: 'Rétro-information envoyée' });
      setFeedbackForm({ recipient_type: 'reporter', feedback_type: 'status_update', message: '', channel: 'system' });
    } else {
      setToast({ type: 'error', message: res.message || 'Erreur' });
    }
    setLoading(false);
  };

  // Save rumor (using extended endpoint)
  const handleSaveRumor = async () => {
    if (!rumorForm.title || !rumorForm.region) {
      setToast({ type: 'error', message: 'Titre et région requis' });
      return;
    }
    setLoading(true);
    const res = selectedRumor
      ? await api.put(`/cohrm/rumors/${selectedRumor.id}/extended`, rumorForm, token)
      : await api.post('/cohrm/rumors/extended', rumorForm, token);

    if (res.success) {
      setToast({ type: 'success', message: selectedRumor ? 'Rumeur mise à jour' : 'Rumeur enregistrée' });
      setViewMode('list');
      setSelectedRumor(null);
      resetForm();
      fetchRumors();
      fetchStats();
    } else {
      setToast({ type: 'error', message: res.message || 'Erreur' });
    }
    setLoading(false);
  };

  // Update rumor status
  const updateRumorStatus = async (id, status) => {
    const res = await api.put(`/cohrm/rumors/${id}`, { status }, token);
    if (res.success) {
      setToast({ type: 'success', message: 'Statut mis à jour' });
      fetchRumors();
      fetchStats();
    }
  };

  // Delete rumor
  const deleteRumor = async (id) => {
    if (!window.confirm('Supprimer cette rumeur ?')) return;
    const res = await api.delete(`/cohrm/rumors/${id}`, token);
    if (res.success) {
      setToast({ type: 'success', message: 'Rumeur supprimée' });
      fetchRumors();
      fetchStats();
    }
  };

  // Reset form
  const resetForm = () => {
    setRumorForm({
      title: '', description: '', message_received: '',
      category: 'human_health', priority: 'medium', source: 'direct', source_type: 'direct',
      category_other: '', source_type_other: '', reporter_type_other: '',
      themes: [],
      date_detection: '', date_circulation_start: '',
      region: '', department: '', arrondissement: '', commune: '',
      district: '', aire_sante: '', location: '',
      latitude: '', longitude: '',
      geometry_type: 'point',
      geometry_data: null,
      reporter_name: '', reporter_phone: '', reporter_type: 'anonymous',
      affected_count: '', dead_count: '', symptoms: '', species: '',
      gravity_comment: '', verification_notes: '', response_actions: ''
    });
  };

  // Open form for new/edit
  const openRumorForm = (rumor = null) => {
    if (rumor) {
      setSelectedRumor(rumor);
      setRumorForm({
        title: rumor.title || '',
        description: rumor.description || '',
        message_received: rumor.message_received || '',
        category: rumor.category || 'human_health',
        priority: rumor.priority || 'medium',
        source: rumor.source || 'direct',
        source_type: rumor.source_type || 'direct',
        category_other: rumor.category_other || '',
        source_type_other: rumor.source_type_other || '',
        reporter_type_other: rumor.reporter_type_other || '',
        themes: rumor.themes ? (typeof rumor.themes === 'string' ? JSON.parse(rumor.themes) : rumor.themes) : [],
        date_detection: rumor.date_detection || '',
        date_circulation_start: rumor.date_circulation_start || '',
        region: rumor.region || '',
        department: rumor.department || '',
        arrondissement: rumor.arrondissement || '',
        commune: rumor.commune || '',
        district: rumor.district || '',
        aire_sante: rumor.aire_sante || '',
        location: rumor.location || '',
        latitude: rumor.latitude || '',
        longitude: rumor.longitude || '',
        geometry_type: rumor.geometry_type || 'point',
        geometry_data: rumor.geometry_data ? (typeof rumor.geometry_data === 'string' ? JSON.parse(rumor.geometry_data) : rumor.geometry_data) : null,
        reporter_name: rumor.reporter_name || '',
        reporter_phone: rumor.reporter_phone || '',
        reporter_type: rumor.reporter_type || 'anonymous',
        affected_count: rumor.affected_count || '',
        dead_count: rumor.dead_count || '',
        symptoms: rumor.symptoms || '',
        species: rumor.species || '',
        gravity_comment: rumor.gravity_comment || '',
        verification_notes: rumor.verification_notes || '',
        response_actions: rumor.response_actions || ''
      });
    } else {
      setSelectedRumor(null);
      resetForm();
    }
    setViewMode('form');
  };

  // Get current position
  const getCurrentPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setRumorForm({
            ...rumorForm,
            latitude: pos.coords.latitude.toFixed(6),
            longitude: pos.coords.longitude.toFixed(6)
          });
          setToast({ type: 'success', message: 'Position obtenue' });
        },
        () => setToast({ type: 'error', message: 'Impossible d\'obtenir la position' })
      );
    }
  };

  // Decode SMS
  const decodeSMS = (smsText) => {
    const parts = smsText.toUpperCase().trim().split(/[\s,;]+/);
    const code = parts[0];
    const codeInfo = smsCodes.find(c => c.code === code);

    if (!codeInfo) {
      return { success: false, message: 'Code non reconnu' };
    }

    return {
      success: true,
      category: codeInfo.category,
      priority: codeInfo.priority,
      meaning: codeInfo.meaning,
      details: parts.slice(1).join(' ')
    };
  };

  // Render Dashboard
  const renderDashboard = () => (
    <div>
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={styles.statCard('#3498DB')}>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#3498DB20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Radar size={24} color="#3498DB" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>{stats.total || 0}</p>
            <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>Total Rumeurs</p>
          </div>
        </div>

        <div style={styles.statCard('#F39C12')}>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#F39C1220', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={24} color="#F39C12" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>{stats.pending || 0}</p>
            <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>En attente</p>
          </div>
        </div>

        <div style={styles.statCard('#E74C3C')}>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#E74C3C20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={24} color="#E74C3C" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>{stats.alerts || 0}</p>
            <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>Alertes actives</p>
          </div>
        </div>

        <div style={styles.statCard('#27AE60')}>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#27AE6020', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={24} color="#27AE60" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>{stats.confirmed || 0}</p>
            <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>Confirmées ce mois</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ ...styles.card, marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>
          Actions rapides
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button style={styles.btnPrimary} onClick={() => { setActiveTab('rumors'); openRumorForm(); }}>
            <Plus size={18} /> Signaler une rumeur
          </button>
          <button style={styles.btnSecondary} onClick={() => setActiveTab('sms-decoder')}>
            <Phone size={18} /> Décoder SMS
          </button>
          <button style={styles.btnSecondary} onClick={() => { fetchRumors(); fetchStats(); }}>
            <RefreshCw size={18} /> Actualiser
          </button>
        </div>
      </div>

      {/* Recent Rumors */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>
            Rumeurs récentes
          </h3>
          <button style={{ ...styles.btnSecondary, padding: '8px 16px' }} onClick={() => setActiveTab('rumors')}>
            Voir tout <ChevronRight size={16} />
          </button>
        </div>

        {rumors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: isDark ? '#64748b' : '#94a3b8' }}>
            <Radar size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p>Aucune rumeur enregistrée</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rumors.slice(0, 5).map(rumor => {
              const status = RUMOR_STATUSES.find(s => s.value === rumor.status) || RUMOR_STATUSES[0];
              const priority = RUMOR_PRIORITIES.find(p => p.value === rumor.priority);
              const category = RUMOR_CATEGORIES.find(c => c.value === rumor.category);
              const CategoryIcon = category?.icon || AlertCircle;

              return (
                <div
                  key={rumor.id}
                  style={{
                    padding: '16px',
                    background: isDark ? '#0f172a' : '#f8fafc',
                    borderRadius: '12px',
                    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    cursor: 'pointer'
                  }}
                  onClick={() => { setActiveTab('rumors'); openRumorForm(rumor); }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '8px',
                        background: `${category?.color || '#64748b'}20`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <CategoryIcon size={18} color={category?.color || '#64748b'} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                          {rumor.title}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                          {rumor.region} • {new Date(rumor.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={styles.badge(status.color)}>
                        {status.label}
                      </span>
                      {priority && (
                        <span style={styles.badge(priority.color)}>
                          {priority.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // Render Rumors List
  const renderRumorsList = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>
          <Radar size={20} style={{ marginRight: '10px', verticalAlign: 'middle', color: '#E74C3C' }} />
          Gestion des Rumeurs ({pagination.total || rumors.length})
        </h3>
        <button style={styles.btnPrimary} onClick={() => openRumorForm()}>
          <Plus size={18} /> Nouvelle rumeur
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '20px',
        padding: '16px',
        background: isDark ? '#0f172a' : '#f8fafc',
        borderRadius: '12px'
      }}>
        <div>
          <input
            style={styles.input}
            placeholder="Rechercher..."
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select style={styles.select} value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="">Tous les statuts</option>
          {RUMOR_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select style={styles.select} value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">Toutes priorités</option>
          {RUMOR_PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <select style={styles.select} value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
          <option value="">Toutes catégories</option>
          {RUMOR_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select style={styles.select} value={filters.region} onChange={e => setFilters({ ...filters, region: e.target.value })}>
          <option value="">Toutes régions</option>
          {REGIONS_CAMEROON.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} color={isDark ? '#64748b' : '#94a3b8'} />
        </div>
      ) : rumors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: isDark ? '#64748b' : '#94a3b8' }}>
          <Radar size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
          <p>Aucune rumeur trouvée</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {rumors.map(rumor => {
            const status = RUMOR_STATUSES.find(s => s.value === rumor.status) || RUMOR_STATUSES[0];
            const StatusIcon = status.icon;
            const priority = RUMOR_PRIORITIES.find(p => p.value === rumor.priority);
            const category = RUMOR_CATEGORIES.find(c => c.value === rumor.category);
            const CategoryIcon = category?.icon || AlertCircle;
            const source = RUMOR_SOURCES.find(s => s.value === rumor.source);

            return (
              <div
                key={rumor.id}
                style={{
                  padding: '20px',
                  background: isDark ? '#0f172a' : '#f8fafc',
                  borderRadius: '12px',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  borderLeft: `4px solid ${status.color}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '14px', flex: 1 }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '12px',
                      background: `${category?.color || '#64748b'}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <CategoryIcon size={24} color={category?.color || '#64748b'} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                        {rumor.title}
                      </h4>
                      <p style={{ margin: '0 0 10px', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: '1.5' }}>
                        {rumor.description?.substring(0, 150)}{rumor.description?.length > 150 ? '...' : ''}
                      </p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                        <span><MapPin size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />{rumor.region || 'Non spécifié'}</span>
                        <span><Calendar size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />{new Date(rumor.created_at).toLocaleDateString('fr-FR')}</span>
                        {source && <span>{React.createElement(source.icon, { size: 12, style: { marginRight: '4px', verticalAlign: 'middle' } })}{source.label}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={styles.badge(status.color)}>
                        <StatusIcon size={12} /> {status.label}
                      </span>
                      {priority && (
                        <span style={styles.badge(priority.color)}>
                          {priority.label}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        style={{ ...styles.btnSecondary, padding: '8px 12px' }}
                        onClick={() => openRumorForm(rumor)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <select
                        style={{ ...styles.select, width: 'auto', padding: '8px 12px' }}
                        value={rumor.status}
                        onChange={e => updateRumorStatus(rumor.id, e.target.value)}
                      >
                        {RUMOR_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      <button
                        style={{ ...styles.btnSecondary, padding: '8px 12px', color: '#E74C3C' }}
                        onClick={() => deleteRumor(rumor.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          <button
            style={styles.btnSecondary}
            disabled={pagination.page <= 1}
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
          >
            <ChevronLeft size={18} />
          </button>
          <span style={{ padding: '12px 20px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
            Page {pagination.page} / {pagination.pages}
          </span>
          <button
            style={styles.btnSecondary}
            disabled={pagination.page >= pagination.pages}
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );

  // Render Rumor Form (Extended - based on official "Fiche de collecte des rumeurs")
  const renderRumorForm = () => {
    // Helper to toggle theme selection
    const toggleTheme = (themeCode) => {
      const currentThemes = rumorForm.themes || [];
      if (currentThemes.includes(themeCode)) {
        setRumorForm({ ...rumorForm, themes: currentThemes.filter(t => t !== themeCode) });
      } else {
        setRumorForm({ ...rumorForm, themes: [...currentThemes, themeCode] });
      }
    };

    return (
      <div style={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>
            <AlertTriangle size={22} style={{ marginRight: '10px', color: '#E74C3C', verticalAlign: 'middle' }} />
            {selectedRumor ? 'Modifier la rumeur' : 'Fiche de collecte des rumeurs'}
          </h3>
          <button style={styles.btnSecondary} onClick={() => { setViewMode('list'); setSelectedRumor(null); resetForm(); }}>
            <ChevronLeft size={18} /> Retour
          </button>
        </div>

        {/* Section 1: Localisation */}
        <div style={{ padding: '20px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px', marginBottom: '20px', borderLeft: '4px solid #3498DB' }}>
          <h4 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '700', color: '#3498DB' }}>
            <MapPin size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Section 1: Localisation de la rumeur
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={styles.label}>Date de détection</label>
              <input type="date" style={styles.input} value={rumorForm.date_detection} onChange={e => setRumorForm({ ...rumorForm, date_detection: e.target.value })} />
            </div>
            <div>
              <label style={styles.label}>Date de début de circulation</label>
              <input type="date" style={styles.input} value={rumorForm.date_circulation_start} onChange={e => setRumorForm({ ...rumorForm, date_circulation_start: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={styles.label}>Région *</label>
              <select style={styles.select} value={rumorForm.region} onChange={e => setRumorForm({ ...rumorForm, region: e.target.value })}>
                <option value="">-- Sélectionner --</option>
                {REGIONS_CAMEROON.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={styles.label}>Département</label>
              <input style={styles.input} value={rumorForm.department} onChange={e => setRumorForm({ ...rumorForm, department: e.target.value })} />
            </div>
            <div>
              <label style={styles.label}>Arrondissement</label>
              <input style={styles.input} value={rumorForm.arrondissement} onChange={e => setRumorForm({ ...rumorForm, arrondissement: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={styles.label}>Commune</label>
              <input style={styles.input} value={rumorForm.commune} onChange={e => setRumorForm({ ...rumorForm, commune: e.target.value })} />
            </div>
            <div>
              <label style={styles.label}>District de santé</label>
              <input style={styles.input} value={rumorForm.district} onChange={e => setRumorForm({ ...rumorForm, district: e.target.value })} />
            </div>
            <div>
              <label style={styles.label}>Aire de santé</label>
              <input style={styles.input} value={rumorForm.aire_sante} onChange={e => setRumorForm({ ...rumorForm, aire_sante: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={styles.label}>Localité précise</label>
              <input style={styles.input} value={rumorForm.location} onChange={e => setRumorForm({ ...rumorForm, location: e.target.value })} placeholder="Village, quartier..." />
            </div>
            <div>
              <label style={styles.label}>Coordonnées GPS</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  style={{ ...styles.input, flex: 1 }}
                  value={formatCoordinates()}
                  readOnly
                  placeholder="Latitude, Longitude"
                />
                <button
                  style={{ ...styles.btnSecondary, padding: '12px', whiteSpace: 'nowrap' }}
                  onClick={getCurrentPosition}
                  title="Obtenir ma position actuelle"
                >
                  <Crosshair size={18} /> Position
                </button>
                <button
                  style={{ ...styles.btnPrimary, padding: '12px', whiteSpace: 'nowrap' }}
                  onClick={() => setShowMapModal(true)}
                  title="Ouvrir la carte"
                >
                  <Map size={18} /> Carte
                </button>
              </div>
              {rumorForm.geometry_type && rumorForm.geometry_type !== 'point' && (
                <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#27AE60' }}>
                  <CheckCircle size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  {rumorForm.geometry_type === 'line' ? 'Tracé' : 'Polygone'} défini avec {rumorForm.geometry_data?.length || 0} points
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Source */}
        <div style={{ padding: '20px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px', marginBottom: '20px', borderLeft: '4px solid #9B59B6' }}>
          <h4 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '700', color: '#9B59B6' }}>
            <Radio size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Section 2: Source de la rumeur
          </h4>
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>Où avez-vous entendu cette rumeur?</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {SOURCE_TYPES.map(src => {
              const isSelected = rumorForm.source_type === src.value;
              const SrcIcon = src.icon;
              return (
                <button
                  key={src.value}
                  type="button"
                  style={{
                    padding: '10px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px',
                    background: isSelected ? '#9B59B620' : (isDark ? '#1e293b' : '#ffffff'),
                    border: `2px solid ${isSelected ? '#9B59B6' : (isDark ? '#334155' : '#e2e8f0')}`,
                    color: isSelected ? '#9B59B6' : (isDark ? '#e2e8f0' : '#1e293b'),
                    cursor: 'pointer', fontSize: '13px', fontWeight: isSelected ? '600' : '400'
                  }}
                  onClick={() => setRumorForm({ ...rumorForm, source_type: src.value, source_type_other: src.value === 'other' ? rumorForm.source_type_other : '' })}
                >
                  <SrcIcon size={16} /> {src.label}
                </button>
              );
            })}
          </div>
          {/* Input for "Autre" source */}
          {rumorForm.source_type === 'other' && (
            <div style={{ marginTop: '12px' }}>
              <label style={styles.label}>Précisez la source</label>
              <input
                style={styles.input}
                value={rumorForm.source_type_other}
                onChange={e => setRumorForm({ ...rumorForm, source_type_other: e.target.value })}
                placeholder="Décrivez la source de la rumeur..."
              />
            </div>
          )}
        </div>

        {/* Section 3: Message */}
        <div style={{ padding: '20px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px', marginBottom: '20px', borderLeft: '4px solid #E67E22' }}>
          <h4 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '700', color: '#E67E22' }}>
            <MessageCircle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Section 3: Message porté dans la rumeur
          </h4>
          <div style={{ marginBottom: '16px' }}>
            <label style={styles.label}>Titre / Résumé de la rumeur *</label>
            <input style={styles.input} value={rumorForm.title} onChange={e => setRumorForm({ ...rumorForm, title: e.target.value })} placeholder="Résumé court de la rumeur..." />
          </div>
          <div>
            <label style={styles.label}>Message reçu (texte original)</label>
            <textarea style={{ ...styles.input, minHeight: '100px' }} value={rumorForm.message_received} onChange={e => setRumorForm({ ...rumorForm, message_received: e.target.value })} placeholder="Reproduire le message tel que reçu..." />
          </div>
          <div style={{ marginTop: '16px' }}>
            <label style={styles.label}>Description / Analyse</label>
            <textarea style={{ ...styles.input, minHeight: '80px' }} value={rumorForm.description} onChange={e => setRumorForm({ ...rumorForm, description: e.target.value })} placeholder="Analyse et contexte de la rumeur..." />
          </div>
        </div>

        {/* Section 4: Catégorie */}
        <div style={{ padding: '20px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px', marginBottom: '20px', borderLeft: '4px solid #E74C3C' }}>
          <h4 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '700', color: '#E74C3C' }}>
            <Target size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Section 4: Catégorie de la rumeur
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {RUMOR_CATEGORIES.map(cat => {
              const isSelected = rumorForm.category === cat.value;
              const CatIcon = cat.icon;
              return (
                <button
                  key={cat.value}
                  type="button"
                  style={{
                    padding: '12px 20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px',
                    background: isSelected ? `${cat.color}20` : (isDark ? '#1e293b' : '#ffffff'),
                    border: `2px solid ${isSelected ? cat.color : (isDark ? '#334155' : '#e2e8f0')}`,
                    color: isSelected ? cat.color : (isDark ? '#e2e8f0' : '#1e293b'),
                    cursor: 'pointer', fontSize: '14px', fontWeight: isSelected ? '600' : '400'
                  }}
                  onClick={() => setRumorForm({ ...rumorForm, category: cat.value, category_other: cat.value === 'other' ? rumorForm.category_other : '' })}
                >
                  <CatIcon size={18} /> {cat.label}
                </button>
              );
            })}
          </div>
          {/* Input for "Autre" category */}
          {rumorForm.category === 'other' && (
            <div style={{ marginTop: '12px' }}>
              <label style={styles.label}>Précisez la catégorie</label>
              <input
                style={styles.input}
                value={rumorForm.category_other}
                onChange={e => setRumorForm({ ...rumorForm, category_other: e.target.value })}
                placeholder="Décrivez la catégorie de la rumeur..."
              />
            </div>
          )}
        </div>

        {/* Section 5: Thèmes (Multiple selection) */}
        <div style={{ padding: '20px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px', marginBottom: '20px', borderLeft: '4px solid #27AE60' }}>
          <h4 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '700', color: '#27AE60' }}>
            <FileText size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Section 5: Thèmes / Sujets (sélection multiple)
          </h4>
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>Ce message concerne-t-il les thèmes suivants?</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '8px' }}>
            {RUMOR_THEMES.map(theme => {
              const isSelected = (rumorForm.themes || []).includes(theme.code);
              return (
                <label
                  key={theme.code}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
                    background: isSelected ? '#27AE6015' : (isDark ? '#1e293b' : '#ffffff'),
                    border: `1px solid ${isSelected ? '#27AE60' : (isDark ? '#334155' : '#e2e8f0')}`
                  }}
                >
                  <input type="checkbox" checked={isSelected} onChange={() => toggleTheme(theme.code)} style={{ width: '16px', height: '16px', accentColor: '#27AE60' }} />
                  <span style={{ fontSize: '13px', color: isDark ? '#e2e8f0' : '#1e293b' }}>{theme.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Additional Information */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* Health Data */}
          <div style={{ padding: '20px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
            <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
              <Activity size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Données sanitaires
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={styles.label}>Nombre affectés</label>
                <input type="number" style={styles.input} value={rumorForm.affected_count} onChange={e => setRumorForm({ ...rumorForm, affected_count: e.target.value })} />
              </div>
              <div>
                <label style={styles.label}>Nombre de décès</label>
                <input type="number" style={styles.input} value={rumorForm.dead_count} onChange={e => setRumorForm({ ...rumorForm, dead_count: e.target.value })} />
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={styles.label}>Espèce concernée</label>
              <input style={styles.input} value={rumorForm.species} onChange={e => setRumorForm({ ...rumorForm, species: e.target.value })} placeholder="Humain, Bovin, Volaille..." />
            </div>
            <div>
              <label style={styles.label}>Symptômes observés</label>
              <textarea style={{ ...styles.input, minHeight: '60px' }} value={rumorForm.symptoms} onChange={e => setRumorForm({ ...rumorForm, symptoms: e.target.value })} />
            </div>
          </div>

          {/* Reporter & Priority */}
          <div style={{ padding: '20px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
            <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
              <User size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Informateur & Priorité
            </h4>
            <div style={{ marginBottom: '12px' }}>
              <label style={styles.label}>Priorité</label>
              <select style={styles.select} value={rumorForm.priority} onChange={e => setRumorForm({ ...rumorForm, priority: e.target.value })}>
                {RUMOR_PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={styles.label}>Nom du déclarant</label>
                <input style={styles.input} value={rumorForm.reporter_name} onChange={e => setRumorForm({ ...rumorForm, reporter_name: e.target.value })} />
              </div>
              <div>
                <label style={styles.label}>Téléphone</label>
                <input style={styles.input} value={rumorForm.reporter_phone} onChange={e => setRumorForm({ ...rumorForm, reporter_phone: e.target.value })} />
              </div>
            </div>
            <div>
              <label style={styles.label}>Type de déclarant</label>
              <select
                style={styles.select}
                value={rumorForm.reporter_type}
                onChange={e => setRumorForm({ ...rumorForm, reporter_type: e.target.value, reporter_type_other: e.target.value === 'other' ? rumorForm.reporter_type_other : '' })}
              >
                <option value="anonymous">Anonyme</option>
                <option value="community">Membre de la communauté</option>
                <option value="health_worker">Agent de santé</option>
                <option value="vet">Vétérinaire</option>
                <option value="official">Officiel</option>
                <option value="agent">Agent de terrain</option>
                <option value="other">Autre</option>
              </select>
              {/* Input for "Autre" reporter type */}
              {rumorForm.reporter_type === 'other' && (
                <input
                  style={{ ...styles.input, marginTop: '8px' }}
                  value={rumorForm.reporter_type_other}
                  onChange={e => setRumorForm({ ...rumorForm, reporter_type_other: e.target.value })}
                  placeholder="Précisez le type de déclarant..."
                />
              )}
            </div>
          </div>
        </div>

        {/* Gravity Comment */}
        <div style={{ marginBottom: '20px' }}>
          <label style={styles.label}>Commentaire sur la gravité de la rumeur</label>
          <textarea style={{ ...styles.input, minHeight: '80px' }} value={rumorForm.gravity_comment} onChange={e => setRumorForm({ ...rumorForm, gravity_comment: e.target.value })} placeholder="Évaluation de la gravité et des risques potentiels..." />
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
          <button style={styles.btnSecondary} onClick={() => { setViewMode('list'); setSelectedRumor(null); resetForm(); }}>
            Annuler
          </button>
          <button style={styles.btnPrimary} onClick={handleSaveRumor} disabled={loading}>
            {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Enregistrement...</> : <><Save size={16} /> Enregistrer la rumeur</>}
          </button>
        </div>
      </div>
    );
  };

  // Render SMS Decoder
  const renderSMSDecoder = () => {
    const handleDecode = () => {
      const result = decodeSMS(smsInput);
      setDecodedResult(result);
      if (result.success) {
        setRumorForm({
          ...rumorForm,
          category: result.category,
          priority: result.priority,
          title: result.meaning,
          description: result.details,
          source: 'sms'
        });
      }
    };

    return (
      <div style={styles.card}>
        <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>
          <Phone size={20} style={{ marginRight: '10px', verticalAlign: 'middle', color: '#E74C3C' }} />
          Décodeur SMS
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Input Section */}
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>Message SMS reçu</label>
              <textarea
                style={{ ...styles.input, minHeight: '120px', fontFamily: 'monospace' }}
                value={smsInput}
                onChange={e => setSmsInput(e.target.value)}
                placeholder="Ex: EP YAOUNDE 5 CAS DIARRHEE"
              />
            </div>
            <button style={styles.btnPrimary} onClick={handleDecode}>
              <Radio size={18} /> Décoder
            </button>

            {decodedResult && (
              <div style={{
                marginTop: '16px',
                padding: '16px',
                borderRadius: '12px',
                background: decodedResult.success ? (isDark ? '#0f172a' : '#f0fdf4') : (isDark ? '#0f172a' : '#fef2f2'),
                border: `1px solid ${decodedResult.success ? '#27AE60' : '#E74C3C'}`
              }}>
                {decodedResult.success ? (
                  <>
                    <p style={{ margin: '0 0 8px', fontWeight: '600', color: '#27AE60' }}>
                      <CheckCircle size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                      Décodage réussi
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                      <strong>Signification:</strong> {decodedResult.meaning}
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                      <strong>Catégorie:</strong> {RUMOR_CATEGORIES.find(c => c.value === decodedResult.category)?.label}
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                      <strong>Priorité:</strong> {RUMOR_PRIORITIES.find(p => p.value === decodedResult.priority)?.label}
                    </p>
                    {decodedResult.details && (
                      <p style={{ margin: '4px 0', fontSize: '14px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                        <strong>Détails:</strong> {decodedResult.details}
                      </p>
                    )}
                    <button
                      style={{ ...styles.btnPrimary, marginTop: '12px' }}
                      onClick={() => { setActiveTab('rumors'); setViewMode('form'); }}
                    >
                      <Plus size={16} /> Créer la rumeur
                    </button>
                  </>
                ) : (
                  <p style={{ margin: 0, color: '#E74C3C' }}>
                    <XCircle size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    {decodedResult.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Codes Reference */}
          <div>
            <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
              <Hash size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Codes SMS disponibles
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {smsCodes.map(code => {
                const category = RUMOR_CATEGORIES.find(c => c.value === code.category);
                const priority = RUMOR_PRIORITIES.find(p => p.value === code.priority);
                return (
                  <div
                    key={code.code}
                    style={{
                      padding: '12px 16px',
                      background: isDark ? '#0f172a' : '#f8fafc',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        padding: '4px 10px',
                        background: category?.color || '#64748b',
                        color: 'white',
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontFamily: 'monospace',
                        fontSize: '14px'
                      }}>
                        {code.code}
                      </span>
                      <span style={{ fontSize: '14px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                        {code.meaning}
                      </span>
                    </div>
                    <span style={styles.badge(priority?.color || '#64748b')}>
                      {priority?.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '20px', padding: '16px', background: isDark ? '#0f172a' : '#fffbeb', borderRadius: '12px', border: '1px solid #F39C12' }}>
              <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#fbbf24' : '#92400e' }}>
                <AlertCircle size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                <strong>Format SMS:</strong> CODE LOCALITE DETAILS
                <br />
                <span style={{ opacity: 0.8 }}>Ex: EP DOUALA 3 CAS FIEVRE VOMISSEMENTS</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Scan History
  const renderScanHistory = () => {
    const SCAN_STATUS = {
      running: { label: 'En cours', color: '#3498DB', icon: Loader },
      completed: { label: 'Terminé', color: '#27AE60', icon: CheckCircle },
      failed: { label: 'Échoué', color: '#E74C3C', icon: XCircle },
      partial: { label: 'Partiel', color: '#F39C12', icon: AlertCircle }
    };

    const SCAN_SOURCES = {
      twitter: { label: 'Twitter/X', color: '#1DA1F2', icon: Share2 },
      facebook: { label: 'Facebook', color: '#4267B2', icon: Globe },
      news: { label: 'Sites d\'actualités', color: '#E74C3C', icon: FileText },
      forums: { label: 'Forums santé', color: '#9B59B6', icon: MessageCircle },
      whatsapp: { label: 'WhatsApp (signalements)', color: '#25D366', icon: Phone }
    };

    return (
      <div style={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>
            <Globe size={20} style={{ marginRight: '10px', verticalAlign: 'middle', color: '#3498DB' }} />
            Historique des Scans Web & Réseaux Sociaux
          </h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={styles.btnPrimary} onClick={runManualScan} disabled={loading}>
              {loading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={16} />}
              Lancer un scan
            </button>
            <button style={styles.btnSecondary} onClick={() => fetchScanHistory()}>
              <RefreshCw size={16} /> Actualiser
            </button>
          </div>
        </div>

        {/* Scan Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ padding: '16px', borderRadius: '12px', background: isDark ? '#0f172a' : '#f0f9ff', border: `1px solid ${isDark ? '#1e3a5f' : '#bae6fd'}` }}>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#3498DB' }}>
              {scanHistory.filter(s => s.status === 'completed').length}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: isDark ? '#64748b' : '#64748b' }}>Scans réussis</p>
          </div>
          <div style={{ padding: '16px', borderRadius: '12px', background: isDark ? '#0f172a' : '#fef3c7', border: `1px solid ${isDark ? '#78350f' : '#fcd34d'}` }}>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#F39C12' }}>
              {scanHistory.reduce((acc, s) => acc + (s.rumors_found || 0), 0)}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: isDark ? '#64748b' : '#64748b' }}>Rumeurs détectées</p>
          </div>
          <div style={{ padding: '16px', borderRadius: '12px', background: isDark ? '#0f172a' : '#f0fdf4', border: `1px solid ${isDark ? '#166534' : '#86efac'}` }}>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#27AE60' }}>
              {scanHistory.reduce((acc, s) => acc + (s.rumors_created || 0), 0)}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: isDark ? '#64748b' : '#64748b' }}>Rumeurs créées</p>
          </div>
          <div style={{ padding: '16px', borderRadius: '12px', background: isDark ? '#0f172a' : '#fef2f2', border: `1px solid ${isDark ? '#991b1b' : '#fecaca'}` }}>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#E74C3C' }}>
              {scanHistory.filter(s => s.status === 'failed').length}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: isDark ? '#64748b' : '#64748b' }}>Échecs</p>
          </div>
        </div>

        {/* Scan History Table */}
        {scanHistoryLoading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Loader size={40} style={{ animation: 'spin 1s linear infinite', color: '#3498DB' }} />
            <p style={{ marginTop: '16px', color: isDark ? '#64748b' : '#94a3b8' }}>Chargement...</p>
          </div>
        ) : scanHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: isDark ? '#64748b' : '#94a3b8' }}>
            <Globe size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>Aucun scan effectué</p>
            <p style={{ fontSize: '14px' }}>Lancez un scan pour commencer à détecter les rumeurs</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>Date/Heure</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>Source</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>Statut</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>Analysés</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>Détectés</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>Créés</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>Mots-clés</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>Durée</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scanHistory.map((scan, idx) => {
                  const status = SCAN_STATUS[scan.status] || SCAN_STATUS.completed;
                  const StatusIcon = status.icon;
                  const source = SCAN_SOURCES[scan.source] || { label: scan.source, color: '#94a3b8', icon: Globe };
                  const SourceIcon = source.icon;

                  return (
                    <tr key={scan.id || idx} style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                      <td style={{ padding: '12px', fontSize: '14px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                        <div>{new Date(scan.created_at).toLocaleDateString('fr-FR')}</div>
                        <div style={{ fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                          {new Date(scan.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '500',
                          background: `${source.color}20`,
                          color: source.color
                        }}>
                          <SourceIcon size={14} />
                          {source.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '500',
                          background: `${status.color}20`,
                          color: status.color
                        }}>
                          <StatusIcon size={14} style={scan.status === 'running' ? { animation: 'spin 1s linear infinite' } : {}} />
                          {status.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                        {scan.items_scanned || 0}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#F39C12' }}>
                        {scan.rumors_found || 0}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#27AE60' }}>
                        {scan.rumors_created || 0}
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>
                        {scan.keywords ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {(typeof scan.keywords === 'string' ? JSON.parse(scan.keywords) : scan.keywords).slice(0, 3).map((kw, i) => (
                              <span key={i} style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                background: isDark ? '#1e293b' : '#f1f5f9',
                                color: isDark ? '#94a3b8' : '#64748b'
                              }}>
                                {kw}
                              </span>
                            ))}
                            {(typeof scan.keywords === 'string' ? JSON.parse(scan.keywords) : scan.keywords).length > 3 && (
                              <span style={{ fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8' }}>
                                +{(typeof scan.keywords === 'string' ? JSON.parse(scan.keywords) : scan.keywords).length - 3}
                              </span>
                            )}
                          </div>
                        ) : '-'}
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>
                        {scan.duration ? `${scan.duration}s` : '-'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          style={{ ...styles.btnIcon, padding: '6px' }}
                          onClick={() => {
                            // View scan details
                            setToast({ type: 'info', message: `Scan #${scan.id}: ${scan.rumors_found} rumeurs trouvées` });
                          }}
                          title="Voir les détails"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {scanHistoryPagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
                <button
                  style={{ ...styles.btnSecondary, padding: '8px 12px' }}
                  onClick={() => fetchScanHistory(scanHistoryPagination.page - 1)}
                  disabled={scanHistoryPagination.page <= 1}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b' }}>
                  Page {scanHistoryPagination.page} / {scanHistoryPagination.pages}
                </span>
                <button
                  style={{ ...styles.btnSecondary, padding: '8px 12px' }}
                  onClick={() => fetchScanHistory(scanHistoryPagination.page + 1)}
                  disabled={scanHistoryPagination.page >= scanHistoryPagination.pages}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Scan Configuration Info */}
        <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', background: isDark ? '#0f172a' : '#f8fafc', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
            <Settings size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Configuration du Scanner
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '13px' }}>
            <div>
              <span style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Statut:</span>
              <span style={{ marginLeft: '8px', color: scannerSettings.enabled ? '#27AE60' : '#E74C3C', fontWeight: '500' }}>
                {scannerSettings.enabled ? 'Actif' : 'Inactif'}
              </span>
            </div>
            <div>
              <span style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Intervalle:</span>
              <span style={{ marginLeft: '8px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                {scannerSettings.interval} minutes
              </span>
            </div>
            <div>
              <span style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Mots-clés:</span>
              <span style={{ marginLeft: '8px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                {scannerSettings.keywords?.length || 0} configurés
              </span>
            </div>
          </div>
          <button
            style={{ ...styles.btnSecondary, marginTop: '12px', padding: '8px 16px' }}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={14} /> Modifier la configuration
          </button>
        </div>
      </div>
    );
  };

  // Render Actors List
  const renderActorsList = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>
          <Users size={20} style={{ marginRight: '10px', verticalAlign: 'middle', color: '#E74C3C' }} />
          Acteurs COHRM
        </h3>
        <button style={styles.btnPrimary} onClick={() => { setSelectedActor(null); setActorForm({ user_id: '', actor_level: 1, actor_type: '', region: '', department: '', district: '', organization: '', role_in_org: '', phone: '', email: '', transmission_channel: 'system' }); setActorViewMode('form'); }}>
          <Plus size={18} /> Ajouter un acteur
        </button>
      </div>

      {/* Validation Levels Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {VALIDATION_LEVELS.map(level => {
          const actorCount = actors.filter(a => a.actor_level === level.level).length;
          return (
            <div key={level.level} style={{
              padding: '16px',
              borderRadius: '12px',
              background: isDark ? '#0f172a' : '#f8fafc',
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              borderTop: `3px solid ${level.color}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Layers size={16} color={level.color} />
                <span style={{ fontSize: '12px', fontWeight: '600', color: level.color }}>Niveau {level.level}</span>
              </div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>{level.label}</p>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8' }}>{level.description}</p>
              <p style={{ margin: '8px 0 0', fontSize: '20px', fontWeight: '700', color: level.color }}>{actorCount}</p>
            </div>
          );
        })}
      </div>

      {/* Actors Table */}
      {actors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: isDark ? '#64748b' : '#94a3b8' }}>
          <Users size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>Aucun acteur enregistré</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>NIVEAU</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>TYPE D'ACTEUR</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>ORGANISATION</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>RÉGION</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>CONTACT</th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {actors.map(actor => {
              const level = VALIDATION_LEVELS.find(l => l.level === actor.actor_level) || VALIDATION_LEVELS[0];
              return (
                <tr key={actor.id} style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px',
                      background: `${level.color}20`, color: level.color, borderRadius: '6px', fontSize: '12px', fontWeight: '600'
                    }}>
                      <Layers size={12} /> Niveau {actor.actor_level}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: isDark ? '#e2e8f0' : '#1e293b', fontWeight: '500' }}>
                    {actor.actor_type}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                    {actor.organization || '-'}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b' }}>
                    {actor.region || '-'}
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>
                    {actor.phone && <div><Phone size={12} style={{ marginRight: '4px' }} />{actor.phone}</div>}
                    {actor.email && <div><Mail size={12} style={{ marginRight: '4px' }} />{actor.email}</div>}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button style={{ ...styles.btnSecondary, padding: '6px 12px' }} onClick={() => {
                        setSelectedActor(actor);
                        setActorForm(actor);
                        setActorViewMode('form');
                      }}>
                        <Edit2 size={14} />
                      </button>
                      <button style={{ ...styles.btnSecondary, padding: '6px 12px', color: '#E74C3C' }} onClick={async () => {
                        if (window.confirm('Désactiver cet acteur ?')) {
                          await api.delete(`/cohrm/actors/${actor.id}`, token);
                          fetchActors();
                        }
                      }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );

  // Render Actor Form
  const renderActorForm = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>
          {selectedActor ? 'Modifier l\'acteur' : 'Nouvel acteur'}
        </h3>
        <button style={styles.btnSecondary} onClick={() => { setActorViewMode('list'); setSelectedActor(null); }}>
          <X size={18} /> Annuler
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Niveau et Type */}
        <div>
          <label style={styles.label}>Niveau d'acteur *</label>
          <select style={styles.select} value={actorForm.actor_level} onChange={e => setActorForm({ ...actorForm, actor_level: parseInt(e.target.value), actor_type: '' })}>
            {VALIDATION_LEVELS.map(l => (
              <option key={l.level} value={l.level}>{l.level} - {l.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={styles.label}>Type d'acteur *</label>
          <select style={styles.select} value={actorForm.actor_type} onChange={e => setActorForm({ ...actorForm, actor_type: e.target.value })}>
            <option value="">-- Sélectionner --</option>
            {(actorTypes[actorForm.actor_level] || []).map(t => (
              <option key={t.code} value={t.label}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Localisation */}
        <div>
          <label style={styles.label}>Région</label>
          <select style={styles.select} value={actorForm.region} onChange={e => setActorForm({ ...actorForm, region: e.target.value })}>
            <option value="">-- Sélectionner --</option>
            {REGIONS_CAMEROON.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label style={styles.label}>Département</label>
          <input style={styles.input} value={actorForm.department} onChange={e => setActorForm({ ...actorForm, department: e.target.value })} />
        </div>

        {/* Organisation */}
        <div>
          <label style={styles.label}>Organisation / Structure</label>
          <input style={styles.input} value={actorForm.organization} onChange={e => setActorForm({ ...actorForm, organization: e.target.value })} />
        </div>
        <div>
          <label style={styles.label}>Rôle dans l'organisation</label>
          <input style={styles.input} value={actorForm.role_in_org} onChange={e => setActorForm({ ...actorForm, role_in_org: e.target.value })} />
        </div>

        {/* Contact */}
        <div>
          <label style={styles.label}>Téléphone</label>
          <input style={styles.input} value={actorForm.phone} onChange={e => setActorForm({ ...actorForm, phone: e.target.value })} />
        </div>
        <div>
          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email" value={actorForm.email} onChange={e => setActorForm({ ...actorForm, email: e.target.value })} />
        </div>

        {/* Canal de transmission */}
        <div>
          <label style={styles.label}>Canal de transmission</label>
          <select style={styles.select} value={actorForm.transmission_channel} onChange={e => setActorForm({ ...actorForm, transmission_channel: e.target.value })}>
            <option value="system">Système</option>
            <option value="mobile_app">Application mobile</option>
            <option value="sms">SMS</option>
            <option value="email">Email</option>
            <option value="phone">Téléphone</option>
            <option value="paper">Papier</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button style={styles.btnSecondary} onClick={() => { setActorViewMode('list'); setSelectedActor(null); }}>
          Annuler
        </button>
        <button style={styles.btnPrimary} onClick={handleSaveActor} disabled={loading}>
          {loading ? <Loader size={18} className="spin" /> : <Save size={18} />}
          {selectedActor ? 'Mettre à jour' : 'Créer l\'acteur'}
        </button>
      </div>
    </div>
  );

  // Render Validation List
  const renderValidationList = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>
          <ClipboardCheck size={20} style={{ marginRight: '10px', verticalAlign: 'middle', color: '#E74C3C' }} />
          Workflow de Validation
        </h3>
        <button style={styles.btnSecondary} onClick={fetchPendingValidations}>
          <RefreshCw size={18} /> Actualiser
        </button>
      </div>

      {/* User's Assigned Levels */}
      {myAssignedLevels.length > 0 && (
        <div style={{
          marginBottom: '16px', padding: '12px 16px',
          background: isDark ? '#1e3a5f' : '#e0f2fe',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <Shield size={18} style={{ color: '#3498DB' }} />
          <span style={{ fontSize: '13px', color: isDark ? '#93c5fd' : '#1e40af' }}>
            Vous êtes assigné aux niveaux de validation:
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {myAssignedLevels.map(levelNum => {
              const level = VALIDATION_LEVELS.find(l => l.level === levelNum);
              return (
                <span key={levelNum} style={{
                  ...styles.badge(level?.color || '#64748b'),
                  fontSize: '11px'
                }}>
                  Niveau {levelNum}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Validation Levels Progress */}
      <div style={{ marginBottom: '24px', padding: '20px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px' }}>
        <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
          Processus de validation multi-niveaux
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {VALIDATION_LEVELS.map((level, idx) => {
            const isMyLevel = myAssignedLevels.includes(level.level);
            return (
              <React.Fragment key={level.level}>
                <div style={{
                  flex: 1, padding: '12px', borderRadius: '8px', textAlign: 'center',
                  background: isMyLevel ? `${level.color}40` : `${level.color}20`,
                  border: `${isMyLevel ? '2px' : '1px'} solid ${level.color}`,
                  boxShadow: isMyLevel ? `0 0 10px ${level.color}40` : 'none'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: level.color, marginBottom: '4px' }}>
                    Niveau {level.level}
                    {isMyLevel && <Check size={12} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                    {level.label}
                  </div>
                  <div style={{ fontSize: '10px', color: isDark ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
                    {dashboardData?.byValidationLevel?.find(v => v.validation_level === level.level)?.count || 0} rumeurs
                  </div>
                </div>
                {idx < VALIDATION_LEVELS.length - 1 && (
                  <ArrowRight size={20} color={isDark ? '#64748b' : '#94a3b8'} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Pending Validations */}
      <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
        <Bell size={16} style={{ marginRight: '8px', verticalAlign: 'middle', color: '#F39C12' }} />
        Rumeurs en attente de validation
        {myAssignedLevels.length > 0 && myAssignedLevels.length < 5 && (
          <span style={{ fontWeight: '400', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8', marginLeft: '8px' }}>
            (filtrées selon vos niveaux assignés)
          </span>
        )}
      </h4>

      {myAssignedLevels.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: isDark ? '#64748b' : '#94a3b8' }}>
          <Shield size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p style={{ margin: '0 0 8px' }}>Vous n'êtes assigné à aucun niveau de validation</p>
          <p style={{ margin: 0, fontSize: '13px' }}>Contactez un administrateur pour être ajouté en tant que validateur</p>
        </div>
      ) : pendingValidations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: isDark ? '#64748b' : '#94a3b8' }}>
          <CheckCircle size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>Aucune rumeur en attente de validation pour vos niveaux</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pendingValidations.map(rumor => {
            const level = VALIDATION_LEVELS.find(l => l.level === rumor.validation_level) || VALIDATION_LEVELS[0];
            const priority = RUMOR_PRIORITIES.find(p => p.value === rumor.priority);
            return (
              <div
                key={rumor.id}
                style={{
                  padding: '16px', borderRadius: '12px', cursor: 'pointer',
                  background: isDark ? '#0f172a' : '#ffffff',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  borderLeft: `4px solid ${level.color}`
                }}
                onClick={() => fetchRumorForValidation(rumor.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: isDark ? '#64748b' : '#94a3b8' }}>{rumor.code}</span>
                      <span style={styles.badge(level.color)}>Niveau {rumor.validation_level}</span>
                      {priority && <span style={styles.badge(priority.color)}>{priority.label}</span>}
                    </div>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>{rumor.title}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>
                      <MapPin size={12} style={{ marginRight: '4px' }} />{rumor.region} • {new Date(rumor.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <button style={styles.btnPrimary} onClick={(e) => { e.stopPropagation(); fetchRumorForValidation(rumor.id); }}>
                    <Eye size={16} /> Valider
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Render Validation Detail
  const renderValidationDetail = () => {
    if (!validationDetail) return null;
    const level = VALIDATION_LEVELS.find(l => l.level === validationDetail.validation_level) || VALIDATION_LEVELS[0];
    const nextLevel = VALIDATION_LEVELS.find(l => l.level === validationDetail.validation_level + 1);
    const riskLevel = RISK_LEVELS.find(r => r.value === validationDetail.risk_level) || RISK_LEVELS[0];

    return (
      <div>
        {/* Back button */}
        <button style={{ ...styles.btnSecondary, marginBottom: '16px' }} onClick={() => setValidationDetail(null)}>
          <ChevronLeft size={18} /> Retour à la liste
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          {/* Rumor Details */}
          <div style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: `${level.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <AlertTriangle size={24} color={level.color} />
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: isDark ? '#64748b' : '#94a3b8' }}>{validationDetail.code}</span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>{validationDetail.title}</h3>
              </div>
            </div>

            {/* Status badges */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <span style={styles.badge(level.color)}>Niveau {validationDetail.validation_level}: {level.label}</span>
              <span style={styles.badge(RUMOR_STATUSES.find(s => s.value === validationDetail.status)?.color || '#64748b')}>
                {RUMOR_STATUSES.find(s => s.value === validationDetail.status)?.label || validationDetail.status}
              </span>
              <span style={styles.badge(RUMOR_PRIORITIES.find(p => p.value === validationDetail.priority)?.color || '#64748b')}>
                {RUMOR_PRIORITIES.find(p => p.value === validationDetail.priority)?.label || validationDetail.priority}
              </span>
              <span style={styles.badge(riskLevel.color)}>
                Risque: {riskLevel.label}
              </span>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>Description</h4>
              <p style={{ margin: 0, fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: '1.6' }}>
                {validationDetail.description || 'Pas de description'}
              </p>
            </div>

            {/* Location */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                <MapPin size={14} style={{ marginRight: '6px' }} />Localisation
              </h4>
              <p style={{ margin: 0, fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b' }}>
                {[validationDetail.location, validationDetail.district, validationDetail.department, validationDetail.region].filter(Boolean).join(', ') || 'Non spécifiée'}
              </p>
            </div>

            {/* Reporter */}
            {validationDetail.reporter_name && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                  <User size={14} style={{ marginRight: '6px' }} />Déclarant
                </h4>
                <p style={{ margin: 0, fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b' }}>
                  {validationDetail.reporter_name} {validationDetail.reporter_phone && `(${validationDetail.reporter_phone})`}
                </p>
              </div>
            )}

            {/* History */}
            {validationDetail.history && validationDetail.history.length > 0 && (
              <div>
                <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                  <Activity size={14} style={{ marginRight: '6px' }} />Historique
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {validationDetail.history.slice(0, 5).map((h, idx) => (
                    <div key={idx} style={{ padding: '8px 12px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '8px', fontSize: '13px' }}>
                      <span style={{ color: isDark ? '#e2e8f0' : '#1e293b', fontWeight: '500' }}>{h.action}</span>
                      <span style={{ color: isDark ? '#64748b' : '#94a3b8', marginLeft: '8px' }}>{h.details}</span>
                      <span style={{ color: isDark ? '#475569' : '#94a3b8', marginLeft: '8px', fontSize: '11px' }}>
                        {new Date(h.created_at).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Validation Action */}
            <div style={styles.card}>
              <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                <ClipboardCheck size={16} style={{ marginRight: '8px', color: '#27AE60' }} />
                Action de validation
              </h4>

              <div style={{ marginBottom: '12px' }}>
                <label style={styles.label}>Type d'action</label>
                <select style={styles.select} value={validationForm.action_type} onChange={e => setValidationForm({ ...validationForm, action_type: e.target.value })}>
                  <option value="triage">Triage</option>
                  <option value="verify">Vérification</option>
                  <option value="risk_assess">Évaluation des risques</option>
                  <option value="coordinate">Coordination</option>
                  <option value="supervise">Supervision</option>
                  <option value="escalate">Escalader</option>
                  <option value="close">Clôturer</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={styles.label}>Décision</label>
                <select style={styles.select} value={validationForm.status} onChange={e => setValidationForm({ ...validationForm, status: e.target.value })}>
                  <option value="validated">Valider et passer au niveau suivant</option>
                  <option value="escalated">Escalader immédiatement</option>
                  <option value="needs_info">Demander plus d'informations</option>
                  <option value="rejected">Rejeter (fausse alerte)</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={styles.label}>Notes</label>
                <textarea
                  style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                  value={validationForm.notes}
                  onChange={e => setValidationForm({ ...validationForm, notes: e.target.value })}
                  placeholder="Notes de validation..."
                />
              </div>

              {validationForm.status === 'rejected' && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={styles.label}>Raison du rejet</label>
                  <textarea
                    style={{ ...styles.input, minHeight: '60px' }}
                    value={validationForm.rejection_reason}
                    onChange={e => setValidationForm({ ...validationForm, rejection_reason: e.target.value })}
                  />
                </div>
              )}

              <button style={{ ...styles.btnPrimary, width: '100%', justifyContent: 'center' }} onClick={handleValidation} disabled={loading}>
                {loading ? <Loader size={18} /> : <CheckCircle size={18} />}
                Soumettre la validation
              </button>

              {nextLevel && (
                <p style={{ margin: '12px 0 0', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8', textAlign: 'center' }}>
                  Prochain niveau: <strong>{nextLevel.label}</strong>
                </p>
              )}
            </div>

            {/* Risk Assessment (for level 3+) */}
            {validationDetail.validation_level >= 3 && (
              <div style={styles.card}>
                <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                  <Shield size={16} style={{ marginRight: '8px', color: '#E67E22' }} />
                  Évaluation des risques
                </h4>

                <div style={{ marginBottom: '12px' }}>
                  <label style={styles.label}>Niveau de risque</label>
                  <select style={styles.select} defaultValue={validationDetail.risk_level}>
                    {RISK_LEVELS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={styles.label}>Description du danger</label>
                  <textarea style={{ ...styles.input, minHeight: '60px' }} placeholder="Décrire le danger identifié..." />
                </div>

                <button
                  style={{ ...styles.btnSecondary, width: '100%', justifyContent: 'center' }}
                  onClick={() => handleRiskAssessment({ risk_level: 'moderate', risk_description: 'Test' })}
                >
                  <Shield size={16} /> Enregistrer l'évaluation
                </button>
              </div>
            )}

            {/* Feedback / Retro-information */}
            <div style={styles.card}>
              <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                <MessageSquare size={16} style={{ marginRight: '8px', color: '#3498DB' }} />
                Rétro-information
              </h4>

              <div style={{ marginBottom: '12px' }}>
                <label style={styles.label}>Destinataire</label>
                <select style={styles.select} value={feedbackForm.recipient_type} onChange={e => setFeedbackForm({ ...feedbackForm, recipient_type: e.target.value })}>
                  <option value="reporter">Déclarant original</option>
                  <option value="community">Communauté</option>
                  <option value="health_workers">Agents de santé</option>
                  <option value="authorities">Autorités</option>
                  <option value="all_actors">Tous les acteurs</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={styles.label}>Type de feedback</label>
                <select style={styles.select} value={feedbackForm.feedback_type} onChange={e => setFeedbackForm({ ...feedbackForm, feedback_type: e.target.value })}>
                  <option value="acknowledgment">Accusé de réception</option>
                  <option value="status_update">Mise à jour du statut</option>
                  <option value="clarification">Demande de clarification</option>
                  <option value="response_action">Actions de réponse</option>
                  <option value="alert">Alerte publique</option>
                  <option value="correction">Correction d'information</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={styles.label}>Message</label>
                <textarea
                  style={{ ...styles.input, minHeight: '80px' }}
                  value={feedbackForm.message}
                  onChange={e => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                  placeholder="Message de rétro-information..."
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={styles.label}>Canal</label>
                <select style={styles.select} value={feedbackForm.channel} onChange={e => setFeedbackForm({ ...feedbackForm, channel: e.target.value })}>
                  <option value="system">Système (notification interne)</option>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                  <option value="phone">Téléphone</option>
                </select>
              </div>

              <button
                style={{ ...styles.btnSecondary, width: '100%', justifyContent: 'center' }}
                onClick={handleSendFeedback}
                disabled={!feedbackForm.message || loading}
              >
                <Send size={16} /> Envoyer le feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============ RENDER VALIDATION ASSIGNEES ============

  // Render Assignees List
  const renderAssigneesList = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={20} style={{ color: '#E74C3C' }} />
              Gestion des Validateurs
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>
              Assignez des utilisateurs aux différents niveaux de validation
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={styles.btnSecondary}
              onClick={fetchValidationAssignees}
              disabled={assigneesLoading}
            >
              <RefreshCw size={16} className={assigneesLoading ? 'spin' : ''} /> Actualiser
            </button>
            <button
              style={styles.btnPrimary}
              onClick={() => {
                resetAssigneeForm();
                setSelectedAssignee(null);
                setAssigneesViewMode('form');
                fetchAvailableUsers('', 1);
              }}
            >
              <Plus size={16} /> Assigner un utilisateur
            </button>
          </div>
        </div>
      </div>

      {/* Filter by level */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          style={{
            ...styles.btnSecondary,
            background: selectedLevelFilter === null ? (isDark ? '#334155' : '#e2e8f0') : 'transparent'
          }}
          onClick={() => setSelectedLevelFilter(null)}
        >
          Tous les niveaux
        </button>
        {VALIDATION_LEVELS.map(level => (
          <button
            key={level.level}
            style={{
              ...styles.btnSecondary,
              background: selectedLevelFilter === level.level ? level.color : 'transparent',
              color: selectedLevelFilter === level.level ? 'white' : (isDark ? '#e2e8f0' : '#1e293b'),
              borderColor: level.color
            }}
            onClick={() => setSelectedLevelFilter(level.level)}
          >
            Niveau {level.level}
          </button>
        ))}
      </div>

      {/* Assignees by Level */}
      {VALIDATION_LEVELS.filter(l => selectedLevelFilter === null || l.level === selectedLevelFilter).map(level => {
        const levelAssignees = validationAssignees.byLevel[level.level] || [];
        return (
          <div key={level.level} style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: `linear-gradient(135deg, ${level.color} 0%, ${level.color}99 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: '700', fontSize: '16px'
              }}>
                {level.level}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                  Niveau {level.level}: {level.label}
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                  {level.description} - {levelAssignees.length} utilisateur(s) assigné(s)
                </p>
              </div>
            </div>

            {levelAssignees.length === 0 ? (
              <div style={{
                padding: '20px', textAlign: 'center',
                background: isDark ? '#0f172a' : '#f8fafc',
                borderRadius: '10px', color: isDark ? '#64748b' : '#94a3b8'
              }}>
                <Users size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: '13px' }}>Aucun utilisateur assigné à ce niveau</p>
                <button
                  style={{ ...styles.btnSecondary, marginTop: '12px', fontSize: '12px' }}
                  onClick={() => {
                    resetAssigneeForm();
                    setAssigneeForm(prev => ({ ...prev, validation_level: level.level }));
                    setSelectedAssignee(null);
                    setAssigneesViewMode('form');
                    fetchAvailableUsers('', level.level);
                  }}
                >
                  <Plus size={14} /> Assigner
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {levelAssignees.map(assignee => (
                  <div
                    key={assignee.id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: isDark ? '#0f172a' : '#f8fafc',
                      borderRadius: '10px',
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: isDark ? '#334155' : '#e2e8f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        {assignee.avatar ? (
                          <img src={assignee.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <User size={20} style={{ color: isDark ? '#64748b' : '#94a3b8' }} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                          {assignee.full_name || assignee.username}
                        </div>
                        <div style={{ fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                          {assignee.email}
                          {assignee.region && <span> • {assignee.region}</span>}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Permissions badges */}
                      <div style={{ display: 'flex', gap: '4px', marginRight: '8px' }}>
                        {assignee.can_validate && (
                          <span style={{ ...styles.badge('#27AE60'), fontSize: '10px', padding: '2px 6px' }} title="Peut valider">
                            <Check size={10} />
                          </span>
                        )}
                        {assignee.can_reject && (
                          <span style={{ ...styles.badge('#E74C3C'), fontSize: '10px', padding: '2px 6px' }} title="Peut rejeter">
                            <X size={10} />
                          </span>
                        )}
                        {assignee.can_escalate && (
                          <span style={{ ...styles.badge('#3498DB'), fontSize: '10px', padding: '2px 6px' }} title="Peut escalader">
                            <ArrowUpRight size={10} />
                          </span>
                        )}
                        {assignee.notify_email && (
                          <span style={{ ...styles.badge('#9B59B6'), fontSize: '10px', padding: '2px 6px' }} title="Notification email">
                            <Mail size={10} />
                          </span>
                        )}
                      </div>

                      <button
                        style={{ ...styles.btnSecondary, padding: '6px 10px' }}
                        onClick={() => handleEditAssignee(assignee)}
                        title="Modifier"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        style={{ ...styles.btnSecondary, padding: '6px 10px', color: '#E74C3C' }}
                        onClick={() => handleDeleteAssignee(assignee.id)}
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // Render Assignee Form
  const renderAssigneeForm = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button
          style={styles.btnSecondary}
          onClick={() => {
            setAssigneesViewMode('list');
            setSelectedAssignee(null);
            resetAssigneeForm();
          }}
        >
          <ChevronLeft size={16} /> Retour
        </button>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>
          {selectedAssignee ? 'Modifier l\'assignation' : 'Assigner un utilisateur'}
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Left Column - User Selection */}
        <div>
          <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
            Sélection de l'utilisateur
          </h4>

          {/* User Search/Filter */}
          {!selectedAssignee && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>
                Filtrer les utilisateurs
              </label>
              <input
                type="text"
                style={styles.input}
                placeholder="Rechercher par nom, email..."
                value={userSearchTerm}
                onChange={(e) => {
                  setUserSearchTerm(e.target.value);
                  fetchAvailableUsers(e.target.value, assigneeForm.validation_level);
                }}
              />
              <p style={{ margin: '6px 0 0', fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8' }}>
                {availableUsers.length} utilisateur(s) disponible(s) (hors abonnés)
              </p>
            </div>
          )}

          {/* Available Users List */}
          {!selectedAssignee && (
            <div style={{
              maxHeight: '300px', overflowY: 'auto',
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              borderRadius: '10px', marginBottom: '16px'
            }}>
              {availableUsers.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: isDark ? '#64748b' : '#94a3b8' }}>
                  <Users size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: '13px' }}>Aucun utilisateur trouvé</p>
                </div>
              ) : availableUsers.map(user => (
                <div
                  key={user.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    background: assigneeForm.user_id === user.id ? (isDark ? '#1e3a5f' : '#e0f2fe') : 'transparent',
                    cursor: user.already_assigned ? 'not-allowed' : 'pointer',
                    opacity: user.already_assigned ? 0.5 : 1
                  }}
                  onClick={() => !user.already_assigned && setAssigneeForm(prev => ({ ...prev, user_id: user.id }))}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: isDark ? '#334155' : '#e2e8f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {user.avatar ? (
                        <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <User size={16} style={{ color: isDark ? '#64748b' : '#94a3b8' }} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                        {user.full_name || user.username}
                        <span style={{
                          marginLeft: '8px', fontSize: '10px', padding: '2px 6px',
                          background: user.role === 'admin' ? '#E74C3C20' : '#3498DB20',
                          color: user.role === 'admin' ? '#E74C3C' : '#3498DB',
                          borderRadius: '4px'
                        }}>
                          {user.role}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8' }}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                  {user.already_assigned ? (
                    <span style={{ fontSize: '10px', color: '#E67E22' }}>Déjà assigné</span>
                  ) : assigneeForm.user_id === user.id ? (
                    <Check size={16} style={{ color: '#27AE60' }} />
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {/* Selected User Display */}
          {selectedAssignee && (
            <div style={{
              padding: '12px',
              background: isDark ? '#0f172a' : '#f8fafc',
              borderRadius: '10px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: isDark ? '#334155' : '#e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {selectedAssignee.avatar ? (
                    <img src={selectedAssignee.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <User size={20} style={{ color: isDark ? '#64748b' : '#94a3b8' }} />
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                    {selectedAssignee.full_name || selectedAssignee.username}
                  </div>
                  <div style={{ fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                    {selectedAssignee.email}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Validation Level */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>
              Niveau de validation *
            </label>
            <select
              style={styles.select}
              value={assigneeForm.validation_level}
              onChange={(e) => {
                const newLevel = parseInt(e.target.value);
                setAssigneeForm(prev => ({ ...prev, validation_level: newLevel }));
                if (!selectedAssignee) fetchAvailableUsers(userSearchTerm, newLevel);
              }}
              disabled={!!selectedAssignee}
            >
              {VALIDATION_LEVELS.map(level => (
                <option key={level.level} value={level.level}>
                  Niveau {level.level}: {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Region */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>
              Région (optionnel - laisser vide pour toutes les régions)
            </label>
            <select
              style={styles.select}
              value={assigneeForm.region}
              onChange={(e) => setAssigneeForm(prev => ({ ...prev, region: e.target.value }))}
            >
              <option value="">Toutes les régions</option>
              {REGIONS_CAMEROON.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>
              Notes
            </label>
            <textarea
              style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
              placeholder="Notes sur cette assignation..."
              value={assigneeForm.notes}
              onChange={(e) => setAssigneeForm(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
        </div>

        {/* Right Column - Permissions */}
        <div>
          <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
            Permissions et Notifications
          </h4>

          <div style={{
            background: isDark ? '#0f172a' : '#f8fafc',
            borderRadius: '10px',
            padding: '16px'
          }}>
            <h5 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
              Permissions
            </h5>

            {[
              { key: 'can_validate', label: 'Peut valider les rumeurs', icon: Check, color: '#27AE60' },
              { key: 'can_reject', label: 'Peut rejeter les rumeurs', icon: X, color: '#E74C3C' },
              { key: 'can_escalate', label: 'Peut escalader au niveau supérieur', icon: ArrowUpRight, color: '#3498DB' },
              { key: 'can_assess_risk', label: 'Peut évaluer les risques', icon: AlertTriangle, color: '#E67E22' },
              { key: 'can_send_feedback', label: 'Peut envoyer des rétro-informations', icon: MessageSquare, color: '#9B59B6' }
            ].map(perm => {
              const Icon = perm.icon;
              return (
                <label
                  key={perm.key}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 0',
                    borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={assigneeForm[perm.key]}
                    onChange={(e) => setAssigneeForm(prev => ({ ...prev, [perm.key]: e.target.checked }))}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <Icon size={16} style={{ color: perm.color }} />
                  <span style={{ fontSize: '13px', color: isDark ? '#e2e8f0' : '#1e293b' }}>{perm.label}</span>
                </label>
              );
            })}

            <h5 style={{ margin: '20px 0 12px', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
              Notifications
            </h5>

            {[
              { key: 'notify_email', label: 'Notification par email', icon: Mail },
              { key: 'notify_sms', label: 'Notification par SMS', icon: Phone }
            ].map(notif => {
              const Icon = notif.icon;
              return (
                <label
                  key={notif.key}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 0',
                    borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={assigneeForm[notif.key]}
                    onChange={(e) => setAssigneeForm(prev => ({ ...prev, [notif.key]: e.target.checked }))}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <Icon size={16} style={{ color: '#64748b' }} />
                  <span style={{ fontSize: '13px', color: isDark ? '#e2e8f0' : '#1e293b' }}>{notif.label}</span>
                </label>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              style={{ ...styles.btnSecondary, flex: 1 }}
              onClick={() => {
                setAssigneesViewMode('list');
                setSelectedAssignee(null);
                resetAssigneeForm();
              }}
            >
              Annuler
            </button>
            <button
              style={{ ...styles.btnPrimary, flex: 1 }}
              onClick={selectedAssignee ? handleUpdateAssignee : handleCreateAssignee}
              disabled={assigneesLoading || (!selectedAssignee && !assigneeForm.user_id)}
            >
              {assigneesLoading ? (
                <><Loader size={16} className="spin" /> Enregistrement...</>
              ) : (
                <><Save size={16} /> {selectedAssignee ? 'Mettre à jour' : 'Assigner'}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Settings
  const renderSettings = () => (
    <div style={styles.card}>
      <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>
        <Settings size={20} style={{ marginRight: '10px', verticalAlign: 'middle', color: '#E74C3C' }} />
        Paramètres COHRM
      </h3>

      {/* Settings Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: isDark ? '#0f172a' : '#f1f5f9', padding: '8px', borderRadius: '12px' }}>
        <button style={styles.tab(settingsTab === 'sms-codes')} onClick={() => setSettingsTab('sms-codes')}>
          <Hash size={16} /> Codes SMS
        </button>
        <button style={styles.tab(settingsTab === 'scanner')} onClick={() => setSettingsTab('scanner')}>
          <Radar size={16} /> Scanner
        </button>
        <button style={styles.tab(settingsTab === 'notifications')} onClick={() => setSettingsTab('notifications')}>
          <Bell size={16} /> Notifications
        </button>
        <button style={styles.tab(settingsTab === 'api')} onClick={() => setSettingsTab('api')}>
          <Database size={16} /> API Mobile
        </button>
      </div>

      {/* SMS Codes Settings */}
      {settingsTab === 'sms-codes' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ margin: 0, color: isDark ? '#94a3b8' : '#64748b' }}>
              Configurez les codes SMS utilisés par les agents de santé communautaire
            </p>
            <button style={styles.btnPrimary}>
              <Plus size={16} /> Ajouter un code
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {smsCodes.map((code, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px',
                  background: isDark ? '#0f172a' : '#f8fafc',
                  borderRadius: '12px',
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 150px 100px 80px',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <input
                  style={{ ...styles.input, fontFamily: 'monospace', fontWeight: '700', textAlign: 'center' }}
                  value={code.code}
                  readOnly
                />
                <input style={styles.input} value={code.meaning} readOnly />
                <select style={styles.select} value={code.category} disabled>
                  {RUMOR_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <select style={styles.select} value={code.priority} disabled>
                  {RUMOR_PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                <button style={{ ...styles.btnSecondary, padding: '10px' }}>
                  <Edit2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scanner Settings */}
      {settingsTab === 'scanner' && (
        <div>
          <div style={{
            padding: '20px',
            background: isDark ? '#0f172a' : '#f8fafc',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                  Scanner automatique
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>
                  Analyse automatique des sources web et réseaux sociaux
                </p>
              </div>
              <button
                style={{
                  width: '60px',
                  height: '32px',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  background: scannerSettings.enabled ? '#27AE60' : (isDark ? '#334155' : '#e2e8f0'),
                  position: 'relative',
                  transition: 'background 0.2s'
                }}
                onClick={() => setScannerSettings({ ...scannerSettings, enabled: !scannerSettings.enabled })}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: '4px',
                  left: scannerSettings.enabled ? '32px' : '4px',
                  transition: 'left 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={styles.label}>Intervalle de scan (minutes)</label>
                <input
                  style={styles.input}
                  type="number"
                  min="5"
                  max="1440"
                  value={scannerSettings.interval}
                  onChange={e => setScannerSettings({ ...scannerSettings, interval: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label style={styles.label}>Sources à scanner</label>
                <select style={styles.select} multiple>
                  <option value="twitter">Twitter/X</option>
                  <option value="facebook">Facebook</option>
                  <option value="news">Sites d'actualités</option>
                  <option value="whatsapp">WhatsApp (via API)</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ padding: '20px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px' }}>
            <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
              Mots-clés de détection
            </h4>
            <p style={{ margin: '0 0 12px', fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>
              Termes recherchés automatiquement (un par ligne)
            </p>
            <textarea
              style={{ ...styles.input, minHeight: '150px', fontFamily: 'monospace' }}
              placeholder="épidémie&#10;maladie&#10;mort animale&#10;eau contaminée&#10;fièvre&#10;..."
              defaultValue="épidémie\ncholéra\nfièvre hémorragique\ngrippe aviaire\nmaladie mystérieuse\nmort massive\neau contaminée\nintoxication alimentaire"
            />
          </div>
        </div>
      )}

      {/* Notifications Settings */}
      {settingsTab === 'notifications' && (
        <div style={{ padding: '20px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px' }}>
          <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
            Configuration des alertes
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {RUMOR_PRIORITIES.map(p => (
              <div key={p.value} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: isDark ? '#1e293b' : '#ffffff', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={styles.badge(p.color)}>{p.label}</span>
                  <span style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>Priorité {p.label.toLowerCase()}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked={p.value !== 'low'} /> Email
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked={p.value === 'critical' || p.value === 'high'} /> SMS
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked={p.value === 'critical'} /> Push
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API Settings */}
      {settingsTab === 'api' && (
        <div>
          <div style={{ padding: '20px', background: isDark ? '#0f172a' : '#f0fdf4', borderRadius: '12px', border: '1px solid #27AE60', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '600', color: '#27AE60' }}>
              <Smartphone size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              API Mobile Ready
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>
              Le système est prêt pour l'intégration avec une application mobile. Les endpoints suivants sont disponibles.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { method: 'GET', endpoint: '/api/cohrm/rumors', desc: 'Liste des rumeurs' },
              { method: 'POST', endpoint: '/api/cohrm/rumors', desc: 'Signaler une rumeur' },
              { method: 'POST', endpoint: '/api/cohrm/sms/decode', desc: 'Décoder un SMS' },
              { method: 'GET', endpoint: '/api/cohrm/stats', desc: 'Statistiques' },
              { method: 'GET', endpoint: '/api/cohrm/codes', desc: 'Liste des codes SMS' }
            ].map((api, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 16px',
                  background: isDark ? '#0f172a' : '#f8fafc',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <span style={{
                  padding: '4px 8px',
                  background: api.method === 'GET' ? '#27AE60' : '#3498DB',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '700'
                }}>
                  {api.method}
                </span>
                <code style={{ flex: 1, fontFamily: 'monospace', fontSize: '13px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                  {api.endpoint}
                </code>
                <span style={{ fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>
                  {api.desc}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px' }}>
            <label style={styles.label}>Clé API</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                style={{ ...styles.input, fontFamily: 'monospace' }}
                type="password"
                value="sk_cohrm_xxxxxxxxxxxxxxxxxxxxx"
                readOnly
              />
              <button style={styles.btnSecondary}>
                <Copy size={16} /> Copier
              </button>
              <button style={styles.btnSecondary}>
                <RefreshCw size={16} /> Régénérer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '16px 24px',
          background: toast.type === 'success' ? '#27AE60' : '#E74C3C',
          color: 'white',
          borderRadius: '12px',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          animation: 'slideIn 0.3s ease'
        }}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {toast.message}
        </div>
      )}

      {/* Header with tabs */}
      <div style={{ ...styles.card, marginBottom: '24px', padding: '16px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Radar size={24} color="white" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                COHRM-SYSTEM
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                Cameroon One Health Rumor Management System
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', background: isDark ? '#0f172a' : '#f1f5f9', padding: '6px', borderRadius: '12px', flexWrap: 'wrap' }}>
            <button style={styles.tab(activeTab === 'dashboard')} onClick={() => setActiveTab('dashboard')}>
              <BarChart3 size={16} /> Dashboard
            </button>
            <button style={styles.tab(activeTab === 'rumors')} onClick={() => { setActiveTab('rumors'); setViewMode('list'); }}>
              <AlertTriangle size={16} /> Rumeurs
            </button>
            <button style={styles.tab(activeTab === 'actors')} onClick={() => { setActiveTab('actors'); fetchActors(); }}>
              <Users size={16} /> Acteurs
            </button>
            <button style={styles.tab(activeTab === 'validation')} onClick={() => { setActiveTab('validation'); fetchPendingValidations(); }}>
              <ClipboardCheck size={16} /> Validation
            </button>
            <button style={styles.tab(activeTab === 'assignees')} onClick={() => { setActiveTab('assignees'); fetchValidationAssignees(); }}>
              <Shield size={16} /> Validateurs
            </button>
            <button style={styles.tab(activeTab === 'sms-decoder')} onClick={() => setActiveTab('sms-decoder')}>
              <Phone size={16} /> SMS
            </button>
            <button style={styles.tab(activeTab === 'scan-history')} onClick={() => { setActiveTab('scan-history'); fetchScanHistory(); }}>
              <Globe size={16} /> Scans
            </button>
            <button style={styles.tab(activeTab === 'settings')} onClick={() => setActiveTab('settings')}>
              <Settings size={16} /> Paramètres
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'rumors' && (viewMode === 'form' ? renderRumorForm() : renderRumorsList())}
      {activeTab === 'actors' && (actorViewMode === 'form' ? renderActorForm() : renderActorsList())}
      {activeTab === 'validation' && (validationDetail ? renderValidationDetail() : renderValidationList())}
      {activeTab === 'assignees' && (assigneesViewMode === 'form' ? renderAssigneeForm() : renderAssigneesList())}
      {activeTab === 'sms-decoder' && renderSMSDecoder()}
      {activeTab === 'scan-history' && renderScanHistory()}
      {activeTab === 'settings' && renderSettings()}

      {/* Map Modal */}
      <MapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        onConfirm={handleMapConfirm}
        initialPosition={rumorForm.latitude && rumorForm.longitude ? { lat: parseFloat(rumorForm.latitude), lng: parseFloat(rumorForm.longitude) } : null}
        initialGeometryType={rumorForm.geometry_type}
        initialGeometryData={rumorForm.geometry_data}
      />

      <style>{`
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default COHRMSystemPage;
