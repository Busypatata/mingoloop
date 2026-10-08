import mongoose from 'mongoose';

const PROFICIENCY_LEVELS = [
  'Beginner',
  'Elementary',
  'Intermediate',
  'Upper Intermediate',
  'Advanced',
  'Fluent',
];

const CONVERSATION_PREFERENCES = ['Casual', 'Serious', 'Study-focused', 'Voice', 'Video', 'Text'];

// Why someone is learning a language — distinct from conversationPreferences
// (how they like to practice) and lookingFor (what kind of partner they
// want). Kept separate so Profile's "Learning Preferences" section doesn't
// silently overload either of those fields or their existing consumers.
const LEARNING_MOTIVATIONS = ['Conversation', 'Travel', 'Culture', 'Work', 'School', 'Friendship', 'Other'];

const PRACTICE_STYLES = ['Text', 'Voice', 'Both'];

// Shared by profileVisibility ("who can discover my profile") and
// messagePermission ("who can message me").
const AUDIENCE_OPTIONS = ['Everyone', 'Matches', 'Nobody'];

const languageEntrySchema = new mongoose.Schema(
  {
    language: { type: String, required: true, trim: true },
    proficiency: { type: String, enum: PROFICIENCY_LEVELS },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 8, select: false },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 300 },
    country: { type: String, default: '' },

    nativeLanguages: { type: [languageEntrySchema], default: [] },
    learningLanguages: { type: [languageEntrySchema], default: [] },
    // Languages the user knows but that are neither native nor their current
    // learning target (e.g. "Hindi — Fluent" on the reference profile card).
    // Kept separate from nativeLanguages so it can't be mistaken for a native
    // language by LanguageOverview or the Discover compatibility scorer.
    otherLanguages: { type: [languageEntrySchema], default: [] },

    interests: { type: [String], default: [] },
    conversationPreferences: {
      type: [String],
      enum: CONVERSATION_PREFERENCES,
      default: [],
    },
    lookingFor: {
      type: [String],
      enum: ['Language partner', 'Friends', 'Cultural exchange', 'Speaking practice', 'Study partner'],
      default: [],
    },

    availability: { type: String, default: '' },
    learningMotivation: { type: [String], enum: LEARNING_MOTIVATIONS, default: [] },
    practiceStyle: { type: String, enum: [...PRACTICE_STYLES, ''], default: '' },
    onboardingComplete: { type: Boolean, default: false },

    // Privacy & Discovery. Defaults match the app's current behavior
    // (fully open) so existing accounts are unaffected until a user opts in.
    profileVisibility: { type: String, enum: AUDIENCE_OPTIONS, default: 'Everyone' },
    messagePermission: { type: String, enum: AUDIENCE_OPTIONS, default: 'Everyone' },
    showNativeLanguage: { type: Boolean, default: true },
    showLearningLanguages: { type: Boolean, default: true },
    showOnlineStatus: { type: Boolean, default: true },

    resetPasswordTokenHash: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },

    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
export { PROFICIENCY_LEVELS, CONVERSATION_PREFERENCES, LEARNING_MOTIVATIONS, PRACTICE_STYLES, AUDIENCE_OPTIONS };
