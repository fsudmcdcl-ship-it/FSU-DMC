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
  className: string;
  semester: string;
  contactInfo: string;
  message: string;
  isAnonymous: boolean;
  createdAt: number;
}

export interface ImportantNotice {
  active: boolean;
  titleEn: string;
  titleNp: string;
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
}
