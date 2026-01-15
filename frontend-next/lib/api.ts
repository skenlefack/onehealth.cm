import {
  Post, Category, Menu, ApiResponse,
  OHWRStats, OHWRRegion, OHWRExpertiseDomain, OHWRExpert,
  OHWROrganization, OHWRMaterial, OHWRDocument, OHWRMapMarker,
  ELearningCategory, ELearningCourse, ELearningLearningPath,
  ELearningCourseCurriculum, ELearningEnrollment, ELearningCertificate,
  ELearningStats, ELearningLesson, ELearningQuiz, QuizAttempt,
  QuizAttemptResult, QuizQuestionForStudent
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Client API générique
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      next: { revalidate: 60 }, // Cache pendant 60 secondes
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, data: [] as unknown as T, message: 'Connection error' };
  }
}

// === POSTS ===

export async function getPosts(options?: {
  status?: string;
  limit?: number;
  page?: number;
  category?: string;
  search?: string;
  featured?: boolean;
  sort?: string;
  order?: 'ASC' | 'DESC';
}): Promise<ApiResponse<Post[]>> {
  const params = new URLSearchParams();
  if (options?.status) params.append('status', options.status);
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.page) params.append('page', options.page.toString());
  if (options?.category) params.append('category', options.category);
  if (options?.search) params.append('search', options.search);
  if (options?.featured !== undefined) params.append('featured', options.featured.toString());
  if (options?.sort) params.append('sort', options.sort);
  if (options?.order) params.append('order', options.order);

  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchApi<Post[]>(`/posts${query}`);
}

export async function getPost(slug: string): Promise<ApiResponse<Post>> {
  return fetchApi<Post>(`/posts/${slug}`);
}

export async function getFeaturedPosts(limit: number = 6): Promise<ApiResponse<Post[]>> {
  return getPosts({ status: 'published', limit, featured: true, sort: 'published_at', order: 'DESC' });
}

// === PAGES ===

export interface PageSection {
  id: string;
  type: string;
  layout?: string;
  title: { fr: string; en: string };
  content: {
    fr: Array<{ type: string; text?: string; style?: string; items?: string[] }>;
    en: Array<{ type: string; text?: string; style?: string; items?: string[] }>;
  };
  image?: {
    src: string;
    alt: { fr: string; en: string };
    caption?: { fr: string; en: string };
    width?: number;
    height?: number;
    align?: 'left' | 'center' | 'right';
  };
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  sections: string | { sections: PageSection[]; settings?: Record<string, any> };
  template: string;
  status: string;
  featured_image?: string;
  meta_title?: string;
  meta_description?: string;
  show_title: boolean;
  show_breadcrumb: boolean;
}

export async function getPage(slug: string): Promise<ApiResponse<Page>> {
  return fetchApi<Page>(`/pages/slug/${slug}`);
}

// === CATEGORIES ===

export async function getCategories(): Promise<ApiResponse<Category[]>> {
  return fetchApi<Category[]>('/categories');
}

export async function getCategory(slug: string): Promise<ApiResponse<Category>> {
  return fetchApi<Category>(`/categories/slug/${slug}`);
}

// === CONTACT ===

export async function submitContact(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>('/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// === NEWSLETTER ===

export async function subscribeNewsletter(email: string): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>('/newsletter/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

// === HELPERS ===

export function getImageUrl(path?: string): string {
  if (!path) return '/images/placeholder.jpg';
  if (path.startsWith('http')) return path;
  return `http://localhost:5000${path}`;
}

// === MENUS ===

export async function getMenu(location: string): Promise<ApiResponse<Menu | null>> {
  return fetchApi<Menu | null>(`/menus/location/${location}`);
}

// === HOMEPAGE ===

export interface HomepageSection {
  id: number;
  section_key: string;
  section_name: string;
  content: Record<string, any>;
  is_active: boolean;
  sort_order: number;
}

export async function getHomepageSections(lang: string = 'fr'): Promise<ApiResponse<HomepageSection[]>> {
  return fetchApi<HomepageSection[]>(`/homepage?lang=${lang}`);
}

export async function getHomepageSection(key: string, lang: string = 'fr'): Promise<ApiResponse<HomepageSection>> {
  return fetchApi<HomepageSection>(`/homepage/${key}?lang=${lang}`);
}

// === SETTINGS ===

export interface SiteSettings {
  site_name?: string;
  site_tagline?: string;
  site_description?: string;
  contact_email?: string;
  site_phone?: string;
  site_address?: string;
  facebook_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  youtube_url?: string;
  [key: string]: string | undefined;
}

export async function getSettings(): Promise<ApiResponse<SiteSettings>> {
  return fetchApi<SiteSettings>('/settings/public');
}

// ============== OHWR-MAPPING API ==============

export async function getOHWRStats(): Promise<ApiResponse<OHWRStats>> {
  return fetchApi<OHWRStats>('/mapping/stats');
}

export async function getOHWRRegions(): Promise<ApiResponse<OHWRRegion[]>> {
  return fetchApi<OHWRRegion[]>('/mapping/regions');
}

export async function getOHWRExpertiseDomains(): Promise<ApiResponse<OHWRExpertiseDomain[]>> {
  return fetchApi<OHWRExpertiseDomain[]>('/mapping/expertise-domains');
}

export async function getOHWRMarkers(types?: string): Promise<ApiResponse<OHWRMapMarker[]>> {
  const query = types ? `?types=${types}` : '';
  return fetchApi<OHWRMapMarker[]>(`/mapping/markers${query}`);
}

// Experts
export async function getOHWRExperts(options?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  region?: string;
}): Promise<ApiResponse<OHWRExpert[]>> {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.search) params.append('search', options.search);
  if (options?.category) params.append('category', options.category);
  if (options?.region) params.append('region', options.region);
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchApi<OHWRExpert[]>(`/mapping/experts${query}`);
}

export async function getOHWRExpert(id: number): Promise<ApiResponse<OHWRExpert>> {
  return fetchApi<OHWRExpert>(`/mapping/experts/${id}`);
}

// Organizations
export async function getOHWROrganizations(options?: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  region?: string;
}): Promise<ApiResponse<OHWROrganization[]>> {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.search) params.append('search', options.search);
  if (options?.type) params.append('type', options.type);
  if (options?.region) params.append('region', options.region);
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchApi<OHWROrganization[]>(`/mapping/organizations${query}`);
}

export async function getOHWROrganization(id: number): Promise<ApiResponse<OHWROrganization>> {
  return fetchApi<OHWROrganization>(`/mapping/organizations/${id}`);
}

// Materials
export async function getOHWRMaterials(options?: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  region?: string;
}): Promise<ApiResponse<OHWRMaterial[]>> {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.search) params.append('search', options.search);
  if (options?.type) params.append('type', options.type);
  if (options?.status) params.append('status', options.status);
  if (options?.region) params.append('region', options.region);
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchApi<OHWRMaterial[]>(`/mapping/materials${query}`);
}

export async function getOHWRMaterial(id: number): Promise<ApiResponse<OHWRMaterial>> {
  return fetchApi<OHWRMaterial>(`/mapping/materials/${id}`);
}

// Documents
export async function getOHWRDocuments(options?: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  language?: string;
}): Promise<ApiResponse<OHWRDocument[]>> {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.search) params.append('search', options.search);
  if (options?.type) params.append('type', options.type);
  if (options?.language) params.append('language', options.language);
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchApi<OHWRDocument[]>(`/mapping/documents${query}`);
}

export async function getOHWRDocument(idOrSlug: string | number): Promise<ApiResponse<OHWRDocument>> {
  return fetchApi<OHWRDocument>(`/mapping/documents/${idOrSlug}`);
}

export async function getOHWRFeaturedDocuments(limit: number = 6): Promise<ApiResponse<OHWRDocument[]>> {
  return fetchApi<OHWRDocument[]>(`/mapping/documents/featured?limit=${limit}`);
}

export async function getOHWRRecentDocuments(limit: number = 10): Promise<ApiResponse<OHWRDocument[]>> {
  return fetchApi<OHWRDocument[]>(`/mapping/documents/recent?limit=${limit}`);
}

// ============== E-LEARNING API ==============

// Categories
export async function getELearningCategories(): Promise<ApiResponse<ELearningCategory[]>> {
  return fetchApi<ELearningCategory[]>('/elearning/categories');
}

// Courses
export async function getELearningCourses(options?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  level?: string;
  status?: string;
  featured?: boolean;
}): Promise<ApiResponse<ELearningCourse[]>> {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.search) params.append('search', options.search);
  if (options?.category) params.append('category', options.category);
  if (options?.level) params.append('level', options.level);
  if (options?.status) params.append('status', options.status);
  if (options?.featured !== undefined) params.append('featured', options.featured.toString());
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchApi<ELearningCourse[]>(`/elearning/courses${query}`);
}

export async function getELearningCourse(slug: string): Promise<ApiResponse<ELearningCourse>> {
  return fetchApi<ELearningCourse>(`/elearning/courses/${slug}`);
}

export async function getELearningFeaturedCourses(limit: number = 6): Promise<ApiResponse<ELearningCourse[]>> {
  return getELearningCourses({ status: 'published', featured: true, limit });
}

// Course Curriculum
export async function getELearningCourseCurriculum(courseId: number): Promise<ApiResponse<ELearningCourseCurriculum>> {
  return fetchApi<ELearningCourseCurriculum>(`/elearning/courses/${courseId}/curriculum`);
}

// Lesson
export async function getELearningLesson(lessonId: number, token?: string): Promise<ApiResponse<ELearningLesson>> {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetchApi<ELearningLesson>(`/elearning/lessons/${lessonId}`, { headers });
}

// Learning Paths
export async function getELearningPaths(options?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  level?: string;
  status?: string;
  featured?: boolean;
}): Promise<ApiResponse<ELearningLearningPath[]>> {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.search) params.append('search', options.search);
  if (options?.category) params.append('category', options.category);
  if (options?.level) params.append('level', options.level);
  if (options?.status) params.append('status', options.status);
  if (options?.featured !== undefined) params.append('featured', options.featured.toString());
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchApi<ELearningLearningPath[]>(`/elearning/paths${query}`);
}

export async function getELearningPath(slug: string): Promise<ApiResponse<ELearningLearningPath>> {
  return fetchApi<ELearningLearningPath>(`/elearning/paths/${slug}`);
}

// Enrollments (requires auth)
export async function getELearningEnrollments(token: string): Promise<ApiResponse<ELearningEnrollment[]>> {
  return fetchApi<ELearningEnrollment[]>('/elearning/enrollments', {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function enrollInCourse(courseId: number, token: string): Promise<ApiResponse<ELearningEnrollment>> {
  return fetchApi<ELearningEnrollment>('/elearning/enroll', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ enrollable_type: 'course', enrollable_id: courseId })
  });
}

export async function enrollInPath(pathId: number, token: string): Promise<ApiResponse<ELearningEnrollment>> {
  return fetchApi<ELearningEnrollment>('/elearning/enroll', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ enrollable_type: 'learning_path', enrollable_id: pathId })
  });
}

// Progress (requires auth)
export async function updateLessonProgress(
  lessonId: number,
  data: { progress_percent?: number; video_position?: number; time_spent?: number },
  token: string
): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>(`/elearning/lessons/${lessonId}/progress`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data)
  });
}

export async function completeLesson(lessonId: number, token: string): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>(`/elearning/lessons/${lessonId}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
}

// Certificates
export async function getELearningCertificates(token: string): Promise<ApiResponse<ELearningCertificate[]>> {
  return fetchApi<ELearningCertificate[]>('/elearning/certificates', {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function verifyELearningCertificate(code: string): Promise<ApiResponse<ELearningCertificate>> {
  return fetchApi<ELearningCertificate>(`/elearning/certificates/verify/${code}`);
}

// Stats
export async function getELearningStats(): Promise<ApiResponse<ELearningStats>> {
  return fetchApi<ELearningStats>('/elearning/stats');
}

// === QUIZ ===

// Get quiz details
export async function getQuiz(quizId: number, token?: string): Promise<ApiResponse<ELearningQuiz>> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetchApi<ELearningQuiz>(`/elearning/quizzes/${quizId}`, { headers });
}

// Start a quiz attempt
export async function startQuizAttempt(quizId: number, token: string, enrollmentId?: number): Promise<ApiResponse<{
  attempt_id: number;
  attempt_number: number;
  questions: QuizQuestionForStudent[];
  time_limit_minutes: number | null;
  started_at: string;
}>> {
  return fetchApi(`/elearning/quizzes/${quizId}/start`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ enrollment_id: enrollmentId })
  });
}

// Get attempt details (for resuming)
export async function getQuizAttempt(attemptId: number, token: string): Promise<ApiResponse<{
  attempt: QuizAttempt;
  questions: QuizQuestionForStudent[];
  time_remaining_seconds: number | null;
}>> {
  return fetchApi(`/elearning/attempts/${attemptId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// Submit quiz answers
export async function submitQuizAttempt(attemptId: number, responses: Record<number, any>, token: string): Promise<ApiResponse<QuizAttemptResult>> {
  return fetchApi<QuizAttemptResult>(`/elearning/attempts/${attemptId}/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ responses })
  });
}

// Get quiz results
export async function getQuizAttemptResults(attemptId: number, token: string): Promise<ApiResponse<QuizAttemptResult>> {
  return fetchApi<QuizAttemptResult>(`/elearning/attempts/${attemptId}/results`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// Abandon quiz attempt
export async function abandonQuizAttempt(attemptId: number, token: string): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>(`/elearning/attempts/${attemptId}/abandon`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
}

// Get user's quiz history for a specific quiz
export async function getQuizHistory(quizId: number, token: string): Promise<ApiResponse<QuizAttempt[]>> {
  return fetchApi<QuizAttempt[]>(`/elearning/quizzes/${quizId}/history`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// ============== LEARNING PATHS ==============

// Get all learning paths
export async function getLearningPaths(params?: {
  page?: number;
  limit?: number;
  level?: string;
  category_id?: number;
  search?: string;
}): Promise<ApiResponse<ELearningLearningPath[]>> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', String(params.page));
  if (params?.limit) queryParams.set('limit', String(params.limit));
  if (params?.level) queryParams.set('level', params.level);
  if (params?.category_id) queryParams.set('category_id', String(params.category_id));
  if (params?.search) queryParams.set('search', params.search);

  const query = queryParams.toString();
  return fetchApi<ELearningLearningPath[]>(`/elearning/paths${query ? `?${query}` : ''}`);
}

// Get single learning path by slug
export async function getLearningPath(slug: string, token?: string): Promise<ApiResponse<ELearningLearningPath & { courses: ELearningCourse[] }>> {
  return fetchApi<ELearningLearningPath & { courses: ELearningCourse[] }>(`/elearning/paths/${slug}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
}

// Enroll in learning path
export async function enrollInPath(pathId: number, token: string): Promise<ApiResponse<{ enrollment_id: number }>> {
  return fetchApi<{ enrollment_id: number }>('/elearning/enroll', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ enrollable_type: 'learning_path', enrollable_id: pathId })
  });
}

// ============== CERTIFICATES ==============

// Get user's certificates
export async function getMyCertificates(token: string): Promise<ApiResponse<ELearningCertificate[]>> {
  return fetchApi<ELearningCertificate[]>('/elearning/certificates', {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// Verify certificate (public)
export async function verifyCertificate(code: string): Promise<ApiResponse<{
  valid: boolean;
  certificate_number?: string;
  recipient_name?: string;
  title_fr?: string;
  title_en?: string;
  course_title_fr?: string;
  course_title_en?: string;
  final_score?: number;
  total_hours?: number;
  issue_date?: string;
  expiry_date?: string;
  status?: string;
  signatory_name?: string;
  signatory_title?: string;
  enrollable_type?: string;
}>> {
  return fetchApi(`/elearning/certificates/verify/${code}`);
}

// Generate certificate
export async function generateCertificate(enrollmentId: number, token: string): Promise<ApiResponse<ELearningCertificate>> {
  return fetchApi<ELearningCertificate>('/elearning/certificates/generate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ enrollment_id: enrollmentId })
  });
}
