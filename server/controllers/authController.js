import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    country: user.country,
    nativeLanguages: user.nativeLanguages,
    learningLanguages: user.learningLanguages,
    interests: user.interests,
    conversationPreferences: user.conversationPreferences,
    lookingFor: user.lookingFor,
    onboardingComplete: user.onboardingComplete,
  };
}

export async function register(req, res) {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'Name, username, email and password are all required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (existing) {
      return res.status(409).json({ message: 'An account with that email or username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong while creating your account. Please try again.' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    const token = generateToken(user._id);

    res.json({ token, user: toPublicUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong while logging in. Please try again.' });
  }
}

export async function getMe(req, res) {
  res.json({ user: toPublicUser(req.user) });
}

export { toPublicUser };
