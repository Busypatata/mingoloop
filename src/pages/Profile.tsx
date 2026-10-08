import { useRef, useState, type ChangeEvent } from 'react';
import {
  User as UserIcon,
  Globe,
  Target,
  Shield,
  Bell,
  Settings,
  Camera,
  Mail,
  Lock,
  Calendar,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import type { User, AudienceOption, LanguageEntry } from '../types/user';
import AppNav from '../components/AppNav';
import FriendAvatar from '../components/friends/FriendAvatar';
import LanguageChip from '../components/discover/LanguageChip';
import ProfileDecorativeNotes from '../components/profile/ProfileDecorativeNotes';
import Toggle from '../components/profile/Toggle';
import LanguageRow from '../components/profile/LanguageRow';
import ChangePasswordModal from '../components/profile/ChangePasswordModal';
import { PROFICIENCY_LEVELS, LEARNING_MOTIVATIONS, PRACTICE_STYLES } from '../components/profile/constants';
import { LANGUAGE_OPTIONS as LANGUAGE_LIST } from '../utils/languages';

function isKnownLanguage(lang: string) {
  return LANGUAGE_LIST.includes(lang);
}

const PREFERRED_TIME_OPTIONS = [
  'Mornings (6 AM – 11 AM)',
  'Afternoons (12 PM – 5 PM)',
  'Evenings (6 PM – 11 PM)',
  'Late night (11 PM – 3 AM)',
  'Weekends only',
  'Flexible / Anytime',
];

const VISIBILITY_LABEL: Record<AudienceOption, string> = {
  Everyone: 'Everyone',
  Matches: 'People who match my languages',
  Nobody: 'Nobody',
};

const MESSAGE_PERMISSION_LABEL: Record<AudienceOption, string> = {
  Everyone: 'Everyone',
  Matches: 'People I match with',
  Nobody: 'Nobody',
};

interface ProfileForm {
  name: string;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  nativeLanguage: string;
  learningLanguage: string;
  learningProficiency: string;
  otherLanguages: LanguageEntry[];
  availability: string;
  learningMotivation: string[];
  practiceStyle: string;
  profileVisibility: AudienceOption;
  messagePermission: AudienceOption;
  showNativeLanguage: boolean;
  showLearningLanguages: boolean;
  showOnlineStatus: boolean;
}

function deriveForm(user: User): ProfileForm {
  return {
    name: user.name,
    username: user.username,
    email: user.email,
    bio: user.bio || '',
    avatar: user.avatar || '',
    nativeLanguage: user.nativeLanguages[0]?.language || '',
    learningLanguage: user.learningLanguages[0]?.language || '',
    learningProficiency: user.learningLanguages[0]?.proficiency || '',
    otherLanguages: user.otherLanguages.map((l) => ({ ...l })),
    availability: user.availability || '',
    learningMotivation: user.learningMotivation || [],
    practiceStyle: user.practiceStyle || '',
    profileVisibility: user.profileVisibility,
    messagePermission: user.messagePermission,
    showNativeLanguage: user.showNativeLanguage,
    showLearningLanguages: user.showLearningLanguages,
    showOnlineStatus: user.showOnlineStatus,
  };
}

function formatMemberSince(dateStr?: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not read that image.'));
      img.onload = () => {
        const maxSize = 400;
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round(height * (maxSize / width));
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round(width * (maxSize / height));
          height = maxSize;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not process that image.'));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

const cardStyle = {
  border: '1px solid rgba(17,17,15,0.08)',
  borderRadius: 20,
  backgroundColor: '#FFFFFF',
};

const fieldLabelStyle = { color: 'var(--color-app-text-secondary)', fontFamily: 'var(--font-body)' };

const inputStyle = {
  border: '1px solid rgba(17,17,15,0.12)',
  borderRadius: 10,
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs mb-1.5" style={fieldLabelStyle}>
      {children}
    </label>
  );
}

function SectionBadge({ label, tone }: { label: string; tone: 'turquoise' | 'coral' | 'muted-blue' }) {
  const accent =
    tone === 'turquoise' ? 'var(--color-turquoise)' : tone === 'coral' ? 'var(--color-coral)' : 'var(--color-muted-blue)';
  return (
    <span
      className="text-[10px] tracking-wide px-2.5 py-1 rounded-full"
      style={{
        backgroundColor: `color-mix(in srgb, ${accent} 15%, white)`,
        color: `color-mix(in srgb, ${accent} 65%, #11110f)`,
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState<ProfileForm>(() => deriveForm(user!));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  function set<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleMotivation(value: string) {
    setForm((f) => ({
      ...f,
      learningMotivation: f.learningMotivation.includes(value)
        ? f.learningMotivation.filter((v) => v !== value)
        : [...f.learningMotivation, value],
    }));
  }

  function updateOtherLanguage(index: number, patch: Partial<LanguageEntry>) {
    setForm((f) => ({
      ...f,
      otherLanguages: f.otherLanguages.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    }));
  }

  function removeOtherLanguage(index: number) {
    setForm((f) => ({ ...f, otherLanguages: f.otherLanguages.filter((_, i) => i !== index) }));
  }

  function addOtherLanguage() {
    setForm((f) => ({ ...f, otherLanguages: [...f.otherLanguages, { language: '', proficiency: undefined }] }));
  }

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setAvatarError(null);
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please choose an image file.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setAvatarError('Please choose an image under 8MB.');
      return;
    }
    try {
      const dataUrl = await readImageAsDataUrl(file);
      set('avatar', dataUrl);
    } catch (err: any) {
      setAvatarError(err?.message || 'Could not process that image.');
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSavedMessage(null);
    try {
      const payload = {
        name: form.name,
        username: form.username,
        email: form.email,
        bio: form.bio,
        avatar: form.avatar,
        nativeLanguages: form.nativeLanguage ? [{ language: form.nativeLanguage }] : [],
        learningLanguages: form.learningLanguage
          ? [{ language: form.learningLanguage, proficiency: form.learningProficiency || undefined }]
          : [],
        otherLanguages: form.otherLanguages.filter((l) => l.language),
        availability: form.availability,
        learningMotivation: form.learningMotivation,
        practiceStyle: form.practiceStyle,
        profileVisibility: form.profileVisibility,
        messagePermission: form.messagePermission,
        showNativeLanguage: form.showNativeLanguage,
        showLearningLanguages: form.showLearningLanguages,
        showOnlineStatus: form.showOnlineStatus,
      };
      const res = await api.put('/users/me', payload);
      setUser(res.data.user);
      setForm(deriveForm(res.data.user));
      setEditingEmail(false);
      setEditingUsername(false);
      setSavedMessage('Your changes have been saved.');
      window.setTimeout(() => setSavedMessage(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setForm(deriveForm(user!));
    setEditingEmail(false);
    setEditingUsername(false);
    setError(null);
    setAvatarError(null);
  }

  const previewTagline = form.learningMotivation.length
    ? form.learningMotivation.slice(0, 3).join(' • ')
    : 'Building language skills, one conversation at a time.';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <AppNav />
      <ProfileDecorativeNotes />

      <div className="relative px-6 pt-8 pb-24 md:px-10">
        <main className="relative z-10 max-w-[1240px] mx-auto">
          <header className="mb-8">
            <h1 className="text-5xl mb-2" style={{ fontFamily: 'var(--font-display)', color: '#11110f' }}>
              Your Profile
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-app-text-secondary)' }}>
              Tell people a little about yourself and your language journey.
            </p>
          </header>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar nav — in-page anchors */}
            <aside className="hidden lg:block w-52 flex-shrink-0">
              <nav className="sticky top-24 space-y-1">
                {[
                  { href: '#profile-section', label: 'Profile', icon: UserIcon, active: true },
                  { href: '#languages-section', label: 'Languages', icon: Globe },
                  { href: '#learning-preferences-section', label: 'Learning Preferences', icon: Target },
                  { href: '#privacy-section', label: 'Privacy & Discovery', icon: Shield },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm"
                    style={{
                      backgroundColor: item.active ? 'color-mix(in srgb, var(--color-turquoise) 14%, white)' : 'transparent',
                      color: item.active ? '#11110f' : 'var(--color-app-text-secondary)',
                    }}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </a>
                ))}
                {/* Notifications and Account Settings don't have dedicated
                    pages yet — kept visible for the nav's familiar shape,
                    but not wired to a destination that doesn't exist. */}
                <span
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm cursor-default"
                  style={{ color: 'var(--color-app-text-muted)' }}
                >
                  <Bell size={16} />
                  Notifications
                </span>
                <a
                  href="#account-section"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm"
                  style={{ color: 'var(--color-app-text-secondary)' }}
                >
                  <Settings size={16} />
                  Account Settings
                </a>
              </nav>
            </aside>

            <div className="flex-1 min-w-0 space-y-8">
              {/* ---------- Profile + Preview + Account ---------- */}
              <section id="profile-section" className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
                <div className="p-6 sm:p-7" style={cardStyle}>
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="relative">
                        <FriendAvatar name={form.name || user.name} avatar={form.avatar} size={96} />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          aria-label="Change photo"
                          className="absolute flex items-center justify-center rounded-full"
                          style={{
                            width: 30,
                            height: 30,
                            right: -2,
                            bottom: -2,
                            backgroundColor: 'var(--color-coral)',
                            border: '2px solid #ffffff',
                            color: '#ffffff',
                          }}
                        >
                          <Camera size={14} />
                        </button>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-4 text-sm px-4 py-1.5 rounded-full border"
                        style={{ borderColor: 'rgba(17,17,15,0.14)', color: '#11110f' }}
                      >
                        Change photo
                      </button>
                      {avatarError && (
                        <p className="text-xs mt-2 text-center" style={{ color: '#B3261E' }}>
                          {avatarError}
                        </p>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <FieldLabel>Full name</FieldLabel>
                          <input
                            value={form.name}
                            onChange={(e) => set('name', e.target.value)}
                            className="w-full px-3.5 py-2.5 text-sm outline-none"
                            style={inputStyle}
                          />
                        </div>
                        <div>
                          <FieldLabel>Username</FieldLabel>
                          <input
                            value={form.username}
                            onChange={(e) => set('username', e.target.value.replace(/\s+/g, '_'))}
                            className="w-full px-3.5 py-2.5 text-sm outline-none"
                            style={inputStyle}
                          />
                        </div>
                      </div>

                      <div>
                        <FieldLabel>About me</FieldLabel>
                        <textarea
                          value={form.bio}
                          onChange={(e) => set('bio', e.target.value.slice(0, 300))}
                          rows={4}
                          maxLength={300}
                          className="w-full px-3.5 py-2.5 text-sm outline-none resize-none"
                          style={inputStyle}
                        />
                        <p className="text-xs text-right mt-1" style={{ color: 'var(--color-app-text-muted)' }}>
                          {form.bio.length}/300
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <FieldLabel>Native language</FieldLabel>
                          <select
                            value={form.nativeLanguage}
                            onChange={(e) => set('nativeLanguage', e.target.value)}
                            className="w-full px-3 py-2.5 text-sm outline-none bg-white"
                            style={inputStyle}
                          >
                            <option value="">Not set</option>
                            {form.nativeLanguage && !isKnownLanguage(form.nativeLanguage) && (
                              <option value={form.nativeLanguage}>{form.nativeLanguage}</option>
                            )}
                            {LANGUAGE_LIST.map((lang) => (
                              <option key={lang} value={lang}>
                                {lang}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <FieldLabel>Target language</FieldLabel>
                          <select
                            value={form.learningLanguage}
                            onChange={(e) => set('learningLanguage', e.target.value)}
                            className="w-full px-3 py-2.5 text-sm outline-none bg-white"
                            style={inputStyle}
                          >
                            <option value="">Not set</option>
                            {form.learningLanguage && !isKnownLanguage(form.learningLanguage) && (
                              <option value={form.learningLanguage}>{form.learningLanguage}</option>
                            )}
                            {LANGUAGE_LIST.map((lang) => (
                              <option key={lang} value={lang}>
                                {lang}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <FieldLabel>Current level</FieldLabel>
                          <select
                            value={form.learningProficiency}
                            onChange={(e) => set('learningProficiency', e.target.value)}
                            className="w-full px-3 py-2.5 text-sm outline-none bg-white"
                            style={inputStyle}
                          >
                            <option value="">Not set</option>
                            {PROFICIENCY_LEVELS.map((level) => (
                              <option key={level} value={level}>
                                {level}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Profile Preview */}
                  <div className="p-6" style={cardStyle}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-lg" style={{ fontFamily: 'var(--font-display)', color: '#11110f' }}>
                          Profile Preview
                        </h2>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-app-text-muted)' }}>
                          This is how others will see your profile.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <FriendAvatar name={form.name || user.name} avatar={form.avatar} size={44} />
                      <div className="min-w-0">
                        <p className="text-sm truncate" style={{ fontFamily: 'var(--font-display)', color: '#11110f' }}>
                          {form.name || 'Your name'}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--color-app-text-muted)' }}>
                          @{form.username || 'username'}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs mb-4" style={{ color: 'var(--color-app-text-secondary)' }}>
                      {previewTagline}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-5">
                      {form.showNativeLanguage && form.nativeLanguage && (
                        <LanguageChip label={`${form.nativeLanguage} (Native)`} tone="turquoise" />
                      )}
                      {form.showLearningLanguages && form.learningLanguage && (
                        <LanguageChip
                          label={`${form.learningLanguage}${form.learningProficiency ? ` (${form.learningProficiency})` : ''}`}
                          tone="coral"
                        />
                      )}
                      {form.otherLanguages
                        .filter((l) => l.language)
                        .map((l) => (
                          <LanguageChip
                            key={l.language}
                            label={`${l.language}${l.proficiency ? ` (${l.proficiency})` : ''}`}
                            tone="muted-blue"
                          />
                        ))}
                    </div>

                    <button
                      type="button"
                      title="Public profile pages aren't available in this build yet."
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm cursor-not-allowed"
                      style={{ border: '1px solid rgba(17,17,15,0.14)', color: 'var(--color-app-text-muted)' }}
                    >
                      View public profile
                      <ExternalLink size={14} />
                    </button>
                  </div>

                  {/* Account Information */}
                  <div id="account-section" className="p-6" style={cardStyle}>
                    <h2 className="text-lg mb-1" style={{ fontFamily: 'var(--font-display)', color: '#11110f' }}>
                      Account Information
                    </h2>
                    <p className="text-xs mb-4" style={{ color: 'var(--color-app-text-muted)' }}>
                      Manage your account details and security.
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Mail size={18} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-app-text-muted)' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs" style={{ color: 'var(--color-app-text-muted)' }}>
                            Email
                          </p>
                          {editingEmail ? (
                            <input
                              autoFocus
                              value={form.email}
                              onChange={(e) => set('email', e.target.value)}
                              onBlur={() => setEditingEmail(false)}
                              className="w-full mt-0.5 px-2 py-1 text-sm outline-none"
                              style={inputStyle}
                            />
                          ) : (
                            <p className="text-sm truncate" style={{ color: '#11110f' }}>
                              {form.email}
                            </p>
                          )}
                        </div>
                        {!editingEmail && (
                          <button
                            type="button"
                            onClick={() => setEditingEmail(true)}
                            className="text-xs flex-shrink-0"
                            style={{ color: 'var(--color-turquoise)' }}
                          >
                            Edit
                          </button>
                        )}
                      </div>

                      <div className="flex items-start gap-3">
                        <UserIcon size={18} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-app-text-muted)' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs" style={{ color: 'var(--color-app-text-muted)' }}>
                            Username
                          </p>
                          {editingUsername ? (
                            <input
                              autoFocus
                              value={form.username}
                              onChange={(e) => set('username', e.target.value.replace(/\s+/g, '_'))}
                              onBlur={() => setEditingUsername(false)}
                              className="w-full mt-0.5 px-2 py-1 text-sm outline-none"
                              style={inputStyle}
                            />
                          ) : (
                            <p className="text-sm truncate" style={{ color: '#11110f' }}>
                              {form.username}
                            </p>
                          )}
                        </div>
                        {!editingUsername && (
                          <button
                            type="button"
                            onClick={() => setEditingUsername(true)}
                            className="text-xs flex-shrink-0"
                            style={{ color: 'var(--color-turquoise)' }}
                          >
                            Edit
                          </button>
                        )}
                      </div>

                      <div className="flex items-start gap-3">
                        <Lock size={18} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-app-text-muted)' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs" style={{ color: 'var(--color-app-text-muted)' }}>
                            Password
                          </p>
                          <p className="text-sm" style={{ color: '#11110f' }}>
                            ••••••••
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPasswordModal(true)}
                          className="text-xs flex-shrink-0"
                          style={{ color: 'var(--color-turquoise)' }}
                        >
                          Change password
                        </button>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar size={18} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-app-text-muted)' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs" style={{ color: 'var(--color-app-text-muted)' }}>
                            Member since
                          </p>
                          <p className="text-sm" style={{ color: '#11110f' }}>
                            {formatMemberSince(user.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ---------- Languages ---------- */}
              <section id="languages-section" className="p-6 sm:p-7" style={cardStyle}>
                <h2 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-display)', color: '#11110f' }}>
                  Languages
                </h2>
                <p className="text-sm mb-6" style={{ color: 'var(--color-app-text-secondary)' }}>
                  Manage the languages you know and are learning.
                </p>

                <div className="space-y-6">
                  <div>
                    <div className="mb-2">
                      <SectionBadge label="NATIVE" tone="turquoise" />
                    </div>
                    <LanguageRow
                      language={form.nativeLanguage}
                      onLanguageChange={(v) => set('nativeLanguage', v)}
                      proficiencyPlaceholder="—"
                    />
                  </div>

                  <div>
                    <div className="mb-2">
                      <SectionBadge label="LEARNING" tone="coral" />
                    </div>
                    <LanguageRow
                      language={form.learningLanguage}
                      proficiency={form.learningProficiency}
                      onLanguageChange={(v) => set('learningLanguage', v)}
                      onProficiencyChange={(v) => set('learningProficiency', v)}
                    />
                  </div>

                  <div>
                    <div className="mb-2">
                      <SectionBadge label="OTHER" tone="muted-blue" />
                    </div>
                    <p className="text-sm mb-3" style={{ color: 'var(--color-app-text-secondary)' }}>
                      Other languages I know
                    </p>
                    <div className="space-y-3">
                      {form.otherLanguages.map((entry, index) => (
                        <LanguageRow
                          key={index}
                          language={entry.language}
                          proficiency={entry.proficiency}
                          onLanguageChange={(v) => updateOtherLanguage(index, { language: v })}
                          onProficiencyChange={(v) => updateOtherLanguage(index, { proficiency: v })}
                          onRemove={() => removeOtherLanguage(index)}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addOtherLanguage}
                      className="mt-3 flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-dashed"
                      style={{ borderColor: 'rgba(17,17,15,0.2)', color: 'var(--color-app-text-secondary)' }}
                    >
                      <Plus size={15} />
                      Add another language
                    </button>
                  </div>
                </div>
              </section>

              {/* ---------- Learning Preferences + Privacy & Discovery ---------- */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div id="learning-preferences-section" className="p-6 sm:p-7" style={cardStyle}>
                  <div className="flex items-center gap-2 mb-1">
                    <Target size={18} style={{ color: 'var(--color-turquoise)' }} />
                    <h2 className="text-lg" style={{ fontFamily: 'var(--font-display)', color: '#11110f' }}>
                      Learning Preferences
                    </h2>
                  </div>
                  <p className="text-xs mb-5" style={{ color: 'var(--color-app-text-muted)' }}>
                    Help us match you with the right people.
                  </p>

                  <div className="mb-5">
                    <p className="text-sm mb-2" style={{ color: '#11110f' }}>
                      Why are you learning this language?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {LEARNING_MOTIVATIONS.map((option) => (
                        <LanguageChip
                          key={option}
                          as="button"
                          label={option}
                          tone="turquoise"
                          active={form.learningMotivation.includes(option)}
                          onClick={() => toggleMotivation(option)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mb-5">
                    <p className="text-sm mb-2" style={{ color: '#11110f' }}>
                      Preferred practice style
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {PRACTICE_STYLES.map((option) => (
                        <LanguageChip
                          key={option}
                          as="button"
                          label={option}
                          tone="turquoise"
                          active={form.practiceStyle === option}
                          onClick={() => set('practiceStyle', option)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm mb-2" style={{ color: '#11110f' }}>
                      Preferred time
                    </p>
                    <select
                      value={form.availability}
                      onChange={(e) => set('availability', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm outline-none bg-white"
                      style={inputStyle}
                    >
                      <option value="">Not set</option>
                      {form.availability && !PREFERRED_TIME_OPTIONS.includes(form.availability) && (
                        <option value={form.availability}>{form.availability}</option>
                      )}
                      {PREFERRED_TIME_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div id="privacy-section" className="p-6 sm:p-7" style={cardStyle}>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield size={18} style={{ color: 'var(--color-coral)' }} />
                    <h2 className="text-lg" style={{ fontFamily: 'var(--font-display)', color: '#11110f' }}>
                      Privacy & Discovery
                    </h2>
                  </div>
                  <p className="text-xs mb-5" style={{ color: 'var(--color-app-text-muted)' }}>
                    Control who can see your profile and contact you.
                  </p>

                  <div className="mb-5">
                    <p className="text-sm mb-2" style={{ color: '#11110f' }}>
                      Who can discover my profile?
                    </p>
                    <select
                      value={form.profileVisibility}
                      onChange={(e) => set('profileVisibility', e.target.value as AudienceOption)}
                      className="w-full px-3.5 py-2.5 text-sm outline-none bg-white"
                      style={inputStyle}
                    >
                      {(Object.keys(VISIBILITY_LABEL) as AudienceOption[]).map((option) => (
                        <option key={option} value={option}>
                          {VISIBILITY_LABEL[option]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3 mb-5">
                    {[
                      { key: 'showNativeLanguage' as const, label: 'Show native language' },
                      { key: 'showLearningLanguages' as const, label: 'Show learning languages' },
                      { key: 'showOnlineStatus' as const, label: 'Show online status' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: '#11110f' }}>
                          {item.label}
                        </span>
                        <Toggle checked={form[item.key]} onChange={(v) => set(item.key, v)} label={item.label} />
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="text-sm mb-2" style={{ color: '#11110f' }}>
                      Allow messages from:
                    </p>
                    <div className="space-y-2">
                      {(Object.keys(MESSAGE_PERMISSION_LABEL) as AudienceOption[]).map((option) => (
                        <label key={option} className="flex items-center gap-2.5 text-sm cursor-pointer" style={{ color: '#11110f' }}>
                          <input
                            type="radio"
                            name="messagePermission"
                            checked={form.messagePermission === option}
                            onChange={() => set('messagePermission', option)}
                            style={{ accentColor: 'var(--color-coral)' }}
                          />
                          {MESSAGE_PERMISSION_LABEL[option]}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {error && (
                <p className="text-sm" style={{ color: '#B3261E' }}>
                  {error}
                </p>
              )}
              {savedMessage && (
                <p className="text-sm" style={{ color: 'var(--color-turquoise)' }}>
                  {savedMessage}
                </p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full text-sm border disabled:opacity-50"
                  style={{ borderColor: 'rgba(17,17,15,0.14)', color: '#11110f' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full text-sm text-white disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-coral)' }}
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  );
}
