export interface GeneralSettings {
  logoUrl: string;
  titleEn: string;
  titleNp: string;
  subtitleEn: string;
  subtitleNp: string;
  aboutFsuEn: string;
  aboutFsuNp: string;
  aboutFsuImg: string;
  aboutCampusEn: string;
  aboutCampusNp: string;
  aboutCampusImg: string;
  presidentNameEn: string;
  presidentNameNp: string;
  presidentPhoto: string;
  presidentMessageEn: string;
  presidentMessageNp: string;
  chiefNameEn: string;
  chiefNameNp: string;
  chiefPhoto: string;
  chiefMessageEn: string;
  chiefMessageNp: string;
  fbCampusPage: string;
  fbFsuPage: string;
  privacyPolicyEn: string;
  privacyPolicyNp: string;
  termsEn: string;
  termsNp: string;
  // History of DMC & Facebook Profile Link
  dmcHistoryHeading?: string;
  dmcHistoryText?: string;
  dmcEstYear?: string;
  dmcFacebookProfileUrl?: string;
  dmcFacebookButtonText?: string;
}

export interface SlideItem {
  id: string;
  imageUrl: string;
  titleEn: string;
  titleNp: string;
}

export interface NewsItem {
  id: string;
  headingEn: string;
  headingNp?: string;
  bodyEn: string;
  bodyNp?: string;
  imageUrl?: string;
  images?: string[]; // Multiple images for notice
  createdAt: number;
}

export interface CourseItem {
  id: string;
  titleEn: string;
  titleNp?: string;
  level?: string; // e.g. "Bachelor's Degree", "Master's Degree", "+2"
  faculty?: string; // e.g. "Management", "Education", "Humanities"
  duration?: string; // e.g. "4 Years (8 Semesters)"
  descriptionEn: string;
  descriptionNp?: string;
  eligibilityEn?: string;
  careerProspects?: string;
  imageUrl?: string;
  order?: number;
}

export interface DownloadItem {
  id: string;
  titleEn: string;
  titleNp: string;
  fileUrl: string;
  isDriveLink: boolean;
}

export interface BlogItem {
  id: string;
  headingEn: string;
  headingNp?: string;
  bodyEn: string;
  bodyNp?: string;
  imageUrl?: string;
  authorEn: string;
  authorNp?: string;
  createdAt: number;
  status?: "published" | "draft" | "archived";
}

export interface TeamMember {
  id: string;
  nameEn: string;
  nameNp: string;
  roleEn: string;
  roleNp: string;
  imageUrl: string;
  order: number; // 1 = President, 2 = Vice President, etc.
}

export interface ContactSubmission {
  id: string;
  name: string;
  className?: string;
  semester?: string;
  contactInfo?: string;
  message: string;
  isAnonymous?: boolean;
  createdAt: number;
  phone?: string;
  email?: string;
  rollNumber?: string;
  faculty?: string;
  category?: string;
  ticketId?: string;
  trackingCode?: string;
  tag?: string;
  status?: string;
  subject?: string;
  imageUrl?: string;
  adminRemarks?: string;
  adminRemarkUpdatedAt?: number;
}

export interface FaqItem {
  id: string;
  questionEn: string;
  answerEn: string;
  category: string;
  order: number;
  isPublished: boolean;
}

export interface ComplaintTrackingSettings {
  headingEn: string;
  subtitleEn: string;
  instructionsEn: string;
  supportPhone?: string;
  supportEmail?: string;
}

export type AdminRole = "master" | "secondary" | "reviewer";

export interface SystemAdmin {
  id: string;
  username: string;
  password?: string;
  role: AdminRole;
  fullName: string;
  createdAt: number;
  lastLogin?: number;
  status?: "active" | "locked" | "disabled";
  failedAttempts?: number;
}

export interface StaffItem {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  office: string;
  workingHours: string;
  imageUrl: string;
  status?: "active" | "inactive";
  order?: number;
}

export interface ProfessorItem {
  id: string;
  name: string;
  title: string;
  faculty: string;
  department: string;
  qualification: string;
  subjects: string[];
  researchInterests: string;
  bio?: string;
  email: string;
  officeHours: string;
  imageUrl: string;
  phone?: string;
  status?: "active" | "inactive";
  order?: number;
}

export interface ImportantNotice {
  active: boolean;
  titleEn: string;
  titleNp?: string;
  imageUrl?: string;
  bodyEn?: string;
  bodyNp?: string;
  type: 'image' | 'text' | 'both';
  bannerTextEn?: string;
  bannerTextNp?: string;
}

export interface DatabaseState {
  generalSettings: GeneralSettings;
  slides: Record<string, SlideItem>;
  news: Record<string, NewsItem>;
  downloads: Record<string, DownloadItem>;
  blogs: Record<string, BlogItem>;
  team: Record<string, TeamMember>;
  contacts: Record<string, ContactSubmission>;
  importantNotice: ImportantNotice;
  staff?: Record<string, StaffItem>;
  professors?: Record<string, ProfessorItem>;
  faqs?: Record<string, FaqItem>;
  courses?: Record<string, CourseItem>;
  trackingSettings?: ComplaintTrackingSettings;
  admins?: Record<string, SystemAdmin>;
}
