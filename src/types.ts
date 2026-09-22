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
  headingNp: string;
  bodyEn: string;
  bodyNp: string;
  imageUrl?: string;
  createdAt: number;
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
  headingNp: string;
  bodyEn: string;
  bodyNp: string;
  imageUrl?: string;
  authorEn: string;
  authorNp: string;
  createdAt: number;
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

export type AdminRole = "master" | "secondary";

export interface SystemAdmin {
  id: string;
  username: string;
  password: string;
  role: AdminRole;
  fullName: string;
  createdAt: number;
  lastLogin?: number;
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
  email: string;
  officeHours: string;
  imageUrl: string;
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
  trackingSettings?: ComplaintTrackingSettings;
  admins?: Record<string, SystemAdmin>;
}
