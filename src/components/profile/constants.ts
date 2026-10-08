// These must stay in sync with server/models/User.js — duplicated here
// because there's no schema/enum endpoint to fetch them from.
export const PROFICIENCY_LEVELS = [
  'Beginner',
  'Elementary',
  'Intermediate',
  'Upper Intermediate',
  'Advanced',
  'Fluent',
];

export const LEARNING_MOTIVATIONS = ['Conversation', 'Travel', 'Culture', 'Work', 'School', 'Friendship', 'Other'];

export const PRACTICE_STYLES = ['Text', 'Voice', 'Both'];

export const AUDIENCE_OPTIONS = ['Everyone', 'Matches', 'Nobody'] as const;
