import { User } from '../models/User.js';
import { toPublicUser } from './authController.js';

export async function completeOnboarding(req, res) {
  try {
    const {
      nativeLanguages,
      learningLanguages,
      interests,
      conversationPreferences,
      lookingFor,
      bio,
      country,
      availability,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (nativeLanguages) user.nativeLanguages = nativeLanguages;
    if (learningLanguages) user.learningLanguages = learningLanguages;
    if (interests) user.interests = interests;
    if (conversationPreferences) user.conversationPreferences = conversationPreferences;
    if (lookingFor) user.lookingFor = lookingFor;
    if (bio !== undefined) user.bio = bio;
    if (country !== undefined) user.country = country;
    if (availability !== undefined) user.availability = availability;

    user.onboardingComplete = true;

    await user.save();

    res.json({ user: toPublicUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong while saving your preferences. Please try again.' });
  }
}

export async function updateProfile(req, res) {
  try {
    const allowedFields = [
      'name',
      'bio',
      'country',
      'avatar',
      'nativeLanguages',
      'learningLanguages',
      'interests',
      'conversationPreferences',
      'lookingFor',
      'availability',
    ];

    const user = await User.findById(req.user._id);

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.json({ user: toPublicUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong while updating your profile. Please try again.' });
  }
}

// Simple compatibility scoring for the Discover feed. This is a first pass —
// weights and matching factors (timezone, proficiency gap, etc.) can be
// refined once real usage data exists.
function compatibilityScore(me, other) {
  let score = 0;
  let factors = 0;

  const myNative = new Set(me.nativeLanguages.map((l) => l.language.toLowerCase()));
  const myLearning = new Set(me.learningLanguages.map((l) => l.language.toLowerCase()));
  const otherNative = new Set(other.nativeLanguages.map((l) => l.language.toLowerCase()));
  const otherLearning = new Set(other.learningLanguages.map((l) => l.language.toLowerCase()));

  // Do they speak what I'm learning, and vice versa?
  factors += 2;
  if ([...myLearning].some((lang) => otherNative.has(lang))) score += 1;
  if ([...otherLearning].some((lang) => myNative.has(lang))) score += 1;

  // Shared interests
  if (me.interests.length && other.interests.length) {
    factors += 1;
    const shared = me.interests.filter((i) => other.interests.includes(i));
    score += Math.min(shared.length / Math.max(me.interests.length, 1), 1);
  }

  // Shared conversation preferences
  if (me.conversationPreferences.length && other.conversationPreferences.length) {
    factors += 1;
    const shared = me.conversationPreferences.filter((p) =>
      other.conversationPreferences.includes(p)
    );
    score += Math.min(shared.length / Math.max(me.conversationPreferences.length, 1), 1);
  }

  return factors === 0 ? 0 : Math.round((score / factors) * 100);
}

export async function discoverUsers(req, res) {
  try {
    const me = req.user;

    const candidates = await User.find({ _id: { $ne: me._id } }).limit(50);

    const results = candidates
      .map((candidate) => ({
        id: candidate._id,
        name: candidate.name,
        username: candidate.username,
        avatar: candidate.avatar,
        bio: candidate.bio,
        country: candidate.country,
        nativeLanguages: candidate.nativeLanguages,
        learningLanguages: candidate.learningLanguages,
        interests: candidate.interests,
        compatibility: compatibilityScore(me, candidate),
      }))
      .sort((a, b) => b.compatibility - a.compatibility);

    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong while finding language partners.' });
  }
}
