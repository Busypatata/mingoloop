export interface LanguageEntry {
  language: string;
  proficiency?: string;
}

export type AudienceOption = 'Everyone' | 'Matches' | 'Nobody';

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
  otherLanguages: LanguageEntry[];
  interests: string[];
  conversationPreferences: string[];
  lookingFor: string[];
  availability: string;
  learningMotivation: string[];
  practiceStyle: string;
  onboardingComplete: boolean;
  createdAt?: string;
  profileVisibility: AudienceOption;
  messagePermission: AudienceOption;
  showNativeLanguage: boolean;
  showLearningLanguages: boolean;
  showOnlineStatus: boolean;
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

export interface PublicProfile {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  country?: string;
}

export interface Friend extends PublicProfile {
  nativeLanguages: LanguageEntry[];
  learningLanguages: LanguageEntry[];
  online: boolean;
}

export interface FriendRequestItem {
  id: string;
  from?: PublicProfile;
  to?: PublicProfile;
  createdAt: string;
}

export interface ConversationSummary {
  id: string;
  participant: (PublicProfile & { online: boolean }) | null;
  lastMessage: { text: string; sender: string; sentAt: string } | null;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: string;
  text: string;
  // Present on voice messages (text is empty for those).
  audioUrl?: string;
  audioDuration?: number;
  createdAt: string;
  readBy?: string[];
}

export interface CommunityQuestionSummary {
  id: string;
  title: string;
  description: string;
  language: string;
  category: string;
  tags: string[];
  author: PublicProfile;
  likeCount: number;
  answerCount: number;
  createdAt: string;
}

export interface CommunityAnswerItem {
  id: string;
  body: string;
  author: PublicProfile;
  upvoteCount: number;
  upvotedByMe: boolean;
  createdAt: string;
}

export interface CommunityQuestionDetail extends Omit<CommunityQuestionSummary, 'answerCount'> {
  likedByMe: boolean;
  answers: CommunityAnswerItem[];
}

export interface NotificationItem {
  id: string;
  type: string;
  message: string;
  link: string;
  read: boolean;
  actor: PublicProfile;
  createdAt: string;
}
