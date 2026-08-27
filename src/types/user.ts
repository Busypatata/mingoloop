export interface LanguageEntry {
  language: string;
  proficiency?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  country?: string;
  nativeLanguages: LanguageEntry[];
  learningLanguages: LanguageEntry[];
  interests: string[];
  conversationPreferences: string[];
  lookingFor: string[];
  onboardingComplete: boolean;
}

export interface DiscoverResult {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  country?: string;
  nativeLanguages: LanguageEntry[];
  learningLanguages: LanguageEntry[];
  interests: string[];
  compatibility: number;
}
