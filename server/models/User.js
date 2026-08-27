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
    onboardingComplete: { type: Boolean, default: false },

    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
export { PROFICIENCY_LEVELS, CONVERSATION_PREFERENCES };
