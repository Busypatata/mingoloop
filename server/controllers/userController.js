import { User } from '../models/User.js';
import { toPublicUser } from './authController.js';
import { isLanguageMatch } from '../utils/matching.js';

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
      'otherLanguages',
      'interests',
      'conversationPreferences',
      'lookingFor',
      'availability',
      'learningMotivation',
      'practiceStyle',
      'profileVisibility',
      'messagePermission',
      'showNativeLanguage',
      'showLearningLanguages',
      'showOnlineStatus',
    ];

    const user = await User.findById(req.user._id);

    // Username and email aren't in allowedFields above because, unlike the
    // rest, they carry a uniqueness constraint — the same rule register()
    // enforces at signup.
    if (req.body.username !== undefined) {
      const nextUsername = String(req.body.username).trim().toLowerCase();
      if (!nextUsername) {
        return res.status(400).json({ message: 'Username cannot be empty.' });
      }
      if (nextUsername !== user.username) {
        const existing = await User.findOne({ username: nextUsername });
        if (existing) {
          return res.status(409).json({ message: 'That username is already taken.' });
        }
        user.username = nextUsername;
      }
    }

    if (req.body.email !== undefined) {
      const nextEmail = String(req.body.email).trim().toLowerCase();
      if (!nextEmail) {
        return res.status(400).json({ message: 'Email cannot be empty.' });
      }
      if (nextEmail !== user.email) {
        const existing = await User.findOne({ email: nextEmail });
        if (existing) {
          return res.status(409).json({ message: 'That email is already in use.' });
        }
        user.email = nextEmail;
      }
    }

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.json({ user: toPublicUser(user) });
  } catch (error) {
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'value';
      return res.status(409).json({ message: `That ${field} is already in use.` });
    }
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
      // Respect each candidate's own "who can discover my profile" setting.
      // Compatibility (which needs the real language data) is computed
      // before any display-masking below.
      .filter((candidate) => {
        if (candidate.profileVisibility === 'Nobody') return false;
        if (candidate.profileVisibility === 'Matches') return isLanguageMatch(me, candidate);
        return true;
      })
      .map((candidate) => ({
        id: candidate._id,
        name: candidate.name,
        username: candidate.username,
        avatar: candidate.avatar,
        bio: candidate.bio,
        country: candidate.country,
        nativeLanguages: candidate.showNativeLanguage ? candidate.nativeLanguages : [],
        learningLanguages: candidate.showLearningLanguages ? candidate.learningLanguages : [],
        interests: candidate.interests,
        compatibility: compatibilityScore(me, candidate),
      }))
      .sort((a, b) => b.compatibility - a.compatibility);

    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong while finding language partners.' });
  }
}
