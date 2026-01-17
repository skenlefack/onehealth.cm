// Types de base
export type Language = 'fr' | 'en';

// Post/Article
export interface Post {
  id: number;
  label: string;
  title: string;
  title_fr?: string;
  title_en?: string;
  slug: string;
  content: string;
  content_fr?: string;
  content_en?: string;
  excerpt?: string;
  excerpt_fr?: string;
  excerpt_en?: string;
  featured_image?: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  type: 'article' | 'page' | 'news' | 'event' | 'resource';
  view_count: number;
  featured: boolean;
  author_id: number;
  author_username?: string;
  author_first_name?: string;
  author_last_name?: string;
  category_id?: number;
  category_name?: string;
  category_name_fr?: string;
  category_name_en?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

// Catégorie
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number | null;
  sort_order: number;
  status: string;
  post_count: number;
}

// Zoonose
export interface Zoonose {
  name: string;
  description: string;
  status: string;
  icon: string;
  cases: string;
  color: string;
}

// Pilier One Health
export interface Pillar {
  label: string;
  description: string;
  features: string[];
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
}

// Partenaire
export interface Partner {
  name: string;
  logo?: string;
}

// Réponse API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Navigation
export interface NavItem {
  id: string;
  label: string;
  href: string;
}

// Menu Item
export interface MenuItem {
  id: number;
  label: string;
  label_fr?: string;
  label_en?: string;
  url: string;
  type?: 'custom' | 'page' | 'post' | 'category';
  target?: '_self' | '_blank';
  icon?: string;
  parent_id?: number | null;
  sort_order: number;
  status: string;
  children?: MenuItem[];
}

// Settings du site
export interface SiteSettings {
  site_name: string;
  site_description: string;
  site_logo?: string;
  site_favicon?: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  social_facebook?: string;
  social_twitter?: string;
  social_linkedin?: string;
  social_youtube?: string;
}

// Props de page avec langue
export interface PageProps {
  params: {
    lang: Language;
    slug?: string;
  };
}

// Props de layout avec langue
export interface LayoutProps {
  children: React.ReactNode;
  params: {
    lang: Language;
  };
}

// Menu
export interface Menu {
  id: number;
  name: string;
  slug: string;
  location: string;
  status: string;
  items: MenuItem[];
}

// ============== OHWR-MAPPING TYPES ==============

export interface OHWRRegion {
  id: number;
  name: string;
  code: string;
  center_lat: string;
  center_lng: string;
}

export interface OHWRExpertiseDomain {
  id: number;
  name: string;
  slug: string;
  category: 'health' | 'animal' | 'environment' | 'laboratory' | 'management';
  description: string;
  icon: string;
}

export interface OHWRExpert {
  id: number;
  first_name: string;
  last_name: string;
  title: string;
  category: string;
  organization_id?: number;
  organization_name?: string;
  organization_acronym?: string;
  email?: string;
  phone?: string;
  photo?: string;
  biography?: string;
  expertise_domains?: string;
  qualifications?: string;
  latitude?: string;
  longitude?: string;
  region?: string;
  city?: string;
  is_verified?: boolean;
}

export interface OHWROrganization {
  id: number;
  name: string;
  acronym?: string;
  type: string;
  description?: string;
  mission?: string;
  logo?: string;
  website?: string;
  region?: string;
  city?: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  latitude?: string;
  longitude?: string;
}

export interface OHWRMaterial {
  id: number;
  name: string;
  type: string;
  description?: string;
  status: string;
  organization_id?: number;
  organization_name?: string;
  region?: string;
  city?: string;
  capacity?: string;
  latitude?: string;
  longitude?: string;
}

export interface OHWRDocument {
  id: number;
  title: string;
  title_fr?: string;
  title_en?: string;
  slug: string;
  type: string;
  document_type?: string;
  description?: string;
  description_fr?: string;
  description_en?: string;
  content?: string;
  file_path?: string;
  file_url?: string;
  external_url?: string;
  thumbnail?: string;
  organization_id?: number;
  organization_name?: string;
  language?: string;
  publication_date?: string;
  access_level?: string;
  is_featured?: boolean;
  view_count?: number;
  download_count?: number;
}

export interface OHWRMapMarker {
  id: number;
  type: 'human' | 'material' | 'organization';
  name: string;
  title?: string;
  category?: string;
  lat: number;
  lng: number;
  region?: string;
  city?: string;
  photo?: string;
  logo?: string;
}

export interface OHWRStats {
  human_resources: { total: number; by_category?: Record<string, number>; by_region?: Record<string, number> };
  material_resources: { total: number; by_type?: Record<string, number>; by_region?: Record<string, number> };
  organizations: { total: number; by_type?: Record<string, number> };
  documents: { total: number; by_type?: Record<string, number> };
}

// ============== E-LEARNING TYPES ==============

export interface ELearningCategory {
  id: number;
  name_fr: string;
  name_en?: string;
  slug: string;
  description_fr?: string;
  icon?: string;
  color?: string;
  parent_id?: number;
  sort_order: number;
  is_active: boolean;
  course_count?: number;
}

export interface ELearningInstructor {
  id: number;
  user_id: number;
  username?: string;
  email?: string;
  title_fr?: string;
  title_en?: string;
  bio_fr?: string;
  bio_en?: string;
  photo?: string;
  expertise?: string[];
  course_count: number;
  student_count: number;
  average_rating: number;
  is_verified: boolean;
}

export interface ELearningCourse {
  id: number;
  title_fr: string;
  title_en?: string;
  slug: string;
  description_fr?: string;
  description_en?: string;
  short_description_fr?: string;
  thumbnail?: string;
  intro_video_url?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration_hours: number;
  min_passing_score: number;
  max_attempts: number;
  sequential_modules: boolean;
  is_free: boolean;
  price: number;
  instructor_id?: number;
  instructor_name?: string;
  instructor_title?: string;
  instructor_photo?: string;
  category_id?: number;
  category_name_fr?: string;
  category_name_en?: string;
  learning_objectives?: string[];
  prerequisites?: string[];
  enrolled_count: number;
  completion_count: number;
  average_rating: number;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  module_count?: number;
  lesson_count?: number;
  // For enrolled users
  enrollment_id?: number;
  enrollment_status?: string;
  progress_percent?: number;
}

export interface ELearningModule {
  id: number;
  course_id: number;
  title_fr: string;
  title_en?: string;
  description_fr?: string;
  duration_minutes: number;
  sort_order: number;
  sequential_lessons: boolean;
  has_quiz: boolean;
  quiz_id?: number;
  min_quiz_score: number;
  status: 'draft' | 'published';
  lessons?: ELearningLesson[];
  lesson_count?: number;
  // For progress
  completed_lessons?: number;
  is_completed?: boolean;
  is_locked?: boolean;
}

export interface ELearningLesson {
  id: number;
  module_id: number;
  title_fr: string;
  title_en?: string;
  content_fr?: string;
  content_en?: string;
  content_type: 'video' | 'text' | 'pdf' | 'mixed' | 'quiz';
  video_url?: string;
  video_duration_seconds: number;
  video_provider: 'youtube' | 'vimeo' | 'upload' | 'other';
  pdf_url?: string;
  attachments?: { name: string; url: string; type: string }[];
  duration_minutes: number;
  sort_order: number;
  is_preview: boolean;
  has_quiz: boolean;
  quiz_id?: number;
  completion_type: 'view' | 'video_complete' | 'quiz_pass';
  min_video_watch_percent: number;
  status: 'draft' | 'published';
  // For progress
  is_completed?: boolean;
  is_locked?: boolean;
  progress_percent?: number;
  video_last_position?: number;
}

export interface ELearningLearningPath {
  id: number;
  title_fr: string;
  title_en?: string;
  slug: string;
  description_fr?: string;
  description_en?: string;
  thumbnail?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration_hours: number;
  min_passing_score: number;
  require_all_courses: boolean;
  require_final_exam: boolean;
  certificate_enabled: boolean;
  certificate_validity_months?: number;
  instructor_id?: number;
  instructor_name?: string;
  category_id?: number;
  category_name_fr?: string;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  created_at: string;
  course_count?: number;
  enrolled_count?: number;
  courses?: ELearningCourse[];
  // For enrolled users
  enrollment_id?: number;
  enrollment_status?: string;
  progress_percent?: number;
}

export interface ELearningEnrollment {
  id: number;
  user_id: number;
  username?: string;
  email?: string;
  enrollable_type: 'course' | 'learning_path';
  enrollable_id: number;
  slug?: string;
  course_title?: string;
  path_title?: string;
  title_fr?: string;
  title_en?: string;
  thumbnail?: string;
  status: 'enrolled' | 'in_progress' | 'completed' | 'expired' | 'cancelled';
  progress_percent: number;
  enrolled_at: string;
  started_at?: string;
  completed_at?: string;
  last_accessed_at?: string;
  final_score?: number;
  total_time_spent_minutes?: number;
  total_time_spent_seconds?: number;
  certificate_id?: number;
  course?: {
    id: number;
    slug: string;
    title_fr?: string;
    title_en?: string;
    thumbnail?: string;
  };
}

export interface ELearningCertificate {
  id: number;
  certificate_number: string;
  user_id: number;
  username?: string;
  enrollable_type: 'course' | 'learning_path';
  enrollable_id: number;
  title_fr: string;
  title_en?: string;
  recipient_name: string;
  final_score?: number;
  issue_date: string;
  expiry_date?: string;
  pdf_url?: string;
  verification_code: string;
  status: 'active' | 'expired' | 'revoked';
}

export interface ELearningCourseCurriculum {
  course: ELearningCourse;
  modules: ELearningModule[];
}

export interface ELearningStats {
  courses: { total: number; published: number };
  paths: { total: number; published: number };
  enrollments: { total: number; completed: number };
  certificates: { total: number };
}

export interface UserLearningStats {
  enrolledCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  certificates: number;
  totalTimeSpent: number;
  lessonsCompleted: number;
}

// ============== QUIZ TYPES ==============

export type QuestionType = 'mcq' | 'multiple_select' | 'true_false' | 'short_answer' | 'matching' | 'fill_blank';
export type QuizType = 'practice' | 'graded' | 'final_exam';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned' | 'timed_out';

export interface QuestionOption {
  text_fr: string;
  text_en?: string;
  image_url?: string;
}

export interface ELearningQuestion {
  id: number;
  question_text_fr: string;
  question_text_en?: string;
  question_type: QuestionType;
  explanation_fr?: string;
  explanation_en?: string;
  image_url?: string;
  options?: QuestionOption[];
  correct_answer?: number | number[] | boolean | string | string[];
  points: number;
  difficulty: Difficulty;
  category_id?: number;
  tags?: string[];
  is_active: boolean;
  created_by?: number;
  created_at?: string;
  quiz_count?: number;
}

export interface ELearningQuiz {
  id: number;
  title_fr: string;
  title_en?: string;
  description_fr?: string;
  description_en?: string;
  quiz_type: QuizType;
  time_limit_minutes?: number;
  passing_score: number;
  max_attempts: number;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  show_correct_answers: boolean;
  show_explanation: boolean;
  allow_retake: boolean;
  status: 'draft' | 'published';
  created_by?: number;
  created_at?: string;
  question_count?: number;
  total_points?: number;
  questions?: ELearningQuestion[];
}

export interface QuizAttempt {
  id: number;
  user_id: number;
  quiz_id: number;
  enrollment_id?: number;
  attempt_number: number;
  status: AttemptStatus;
  started_at: string;
  completed_at?: string;
  time_spent_seconds: number;
  score?: number;
  score_percent?: number;
  max_score: number;
  correct_count: number;
  total_questions: number;
  passed: boolean;
  responses?: QuizResponse[];
  quiz?: ELearningQuiz;
}

export interface QuizResponse {
  question_id: number;
  question_text_fr?: string;
  question_text_en?: string;
  question_type?: QuestionType;
  image_url?: string;
  options?: QuestionOption[];
  user_answer: number | number[] | boolean | string | null;
  correct_answer?: number | number[] | boolean | string | string[];
  is_correct: boolean;
  points_earned: number;
  points_possible: number;
  explanation_fr?: string;
  explanation_en?: string;
  feedback_fr?: string;
  feedback_en?: string;
}

export interface QuizAttemptResultAttempt {
  id: number;
  quiz_id: number;
  quiz_title_fr: string;
  quiz_title_en?: string;
  status: AttemptStatus;
  score: number;
  score_percent: number;
  max_score: number;
  correct_count: number;
  total_questions: number;
  passed: boolean;
  time_spent_seconds: number;
  started_at: string;
  completed_at?: string;
}

export interface QuizAttemptResult {
  attempt: QuizAttemptResultAttempt;
  results: QuizResponse[];
  summary: {
    total_questions: number;
    correct: number;
    incorrect: number;
    score_percent: number;
    passed: boolean;
  };
}

export interface QuizQuestionForStudent {
  id: number;
  question_text_fr: string;
  question_text_en?: string;
  question_type: QuestionType;
  image_url?: string;
  options?: QuestionOption[];
  points: number;
  order: number;
}
