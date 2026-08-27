import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const PROFICIENCY_LEVELS = [
  'Beginner',
  'Elementary',
  'Intermediate',
  'Upper Intermediate',
  'Advanced',
  'Fluent',
];

const INTEREST_OPTIONS = [
  'Movies',
  'Music',
  'Gaming',
  'Books',
  'Travel',
  'Technology',
  'Art',
  'Food',
  'Sports',
  'Culture',
];

const CONVERSATION_OPTIONS = ['Casual', 'Serious', 'Study-focused', 'Voice', 'Video', 'Text'];

const LOOKING_FOR_OPTIONS = [
  'Language partner',
  'Friends',
  'Cultural exchange',
  'Speaking practice',
  'Study partner',
];

const STEPS = ['Native language', 'Learning language', 'Interests', 'Conversation style', 'Goal'];

function Pill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-5 py-2 rounded-full text-sm border transition-colors"
      style={{
        borderColor: selected ? '#000000' : 'rgba(0,0,0,0.12)',
        backgroundColor: selected ? '#000000' : 'transparent',
        color: selected ? '#FFFFFF' : '#000000',
      }}
    >
      {label}
    </button>
  );
}

export default function Onboarding() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nativeLanguage, setNativeLanguage] = useState('');
  const [learningLanguage, setLearningLanguage] = useState('');
  const [proficiency, setProficiency] = useState('Beginner');
  const [interests, setInterests] = useState<string[]>([]);
  const [conversationPreferences, setConversationPreferences] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function finish() {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await api.post('/users/onboarding', {
        nativeLanguages: nativeLanguage ? [{ language: nativeLanguage }] : [],
        learningLanguages: learningLanguage
          ? [{ language: learningLanguage, proficiency }]
          : [],
        interests,
        conversationPreferences,
        lookingFor,
      });
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <p className="text-sm text-center mb-2" style={{ color: '#6F6F6F' }}>
          Step {step + 1} of {STEPS.length} — {STEPS[step]}
        </p>

        <div className="flex justify-center gap-2 mb-12">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1 w-10 rounded-full"
              style={{ backgroundColor: i <= step ? '#000000' : 'rgba(0,0,0,0.1)' }}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="text-center">
            <h2
              className="text-3xl mb-6"
              style={{ fontFamily: 'var(--font-display)', color: '#000000' }}
            >
              What language do you speak?
            </h2>
            <input
              autoFocus
              placeholder="e.g. English"
              value={nativeLanguage}
              onChange={(e) => setNativeLanguage(e.target.value)}
              className="w-full px-5 py-3 rounded-full text-sm border outline-none focus:border-black transition-colors text-center"
              style={{ borderColor: 'rgba(0,0,0,0.08)' }}
            />
          </div>
        )}

        {step === 1 && (
          <div className="text-center">
            <h2
              className="text-3xl mb-6"
              style={{ fontFamily: 'var(--font-display)', color: '#000000' }}
            >
              What language are you learning?
            </h2>
            <input
              autoFocus
              placeholder="e.g. Japanese"
              value={learningLanguage}
              onChange={(e) => setLearningLanguage(e.target.value)}
              className="w-full px-5 py-3 rounded-full text-sm border outline-none focus:border-black transition-colors text-center mb-6"
              style={{ borderColor: 'rgba(0,0,0,0.08)' }}
            />
            <div className="flex flex-wrap justify-center gap-2">
              {PROFICIENCY_LEVELS.map((level) => (
                <Pill
                  key={level}
                  label={level}
                  selected={proficiency === level}
                  onClick={() => setProficiency(level)}
                />
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="text-center">
            <h2
              className="text-3xl mb-6"
              style={{ fontFamily: 'var(--font-display)', color: '#000000' }}
            >
              What are you interested in?
            </h2>
            <div className="flex flex-wrap justify-center gap-2">
              {INTEREST_OPTIONS.map((interest) => (
                <Pill
                  key={interest}
                  label={interest}
                  selected={interests.includes(interest)}
                  onClick={() => toggle(interests, setInterests, interest)}
                />
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <h2
              className="text-3xl mb-6"
              style={{ fontFamily: 'var(--font-display)', color: '#000000' }}
            >
              What type of conversation do you prefer?
            </h2>
            <div className="flex flex-wrap justify-center gap-2">
              {CONVERSATION_OPTIONS.map((option) => (
                <Pill
                  key={option}
                  label={option}
                  selected={conversationPreferences.includes(option)}
                  onClick={() => toggle(conversationPreferences, setConversationPreferences, option)}
                />
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center">
            <h2
              className="text-3xl mb-6"
              style={{ fontFamily: 'var(--font-display)', color: '#000000' }}
            >
              What are you looking for?
            </h2>
            <div className="flex flex-wrap justify-center gap-2">
              {LOOKING_FOR_OPTIONS.map((option) => (
                <Pill
                  key={option}
                  label={option}
                  selected={lookingFor.includes(option)}
                  onClick={() => toggle(lookingFor, setLookingFor, option)}
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-center mt-6" style={{ color: '#B3261E' }}>
            {error}
          </p>
        )}

        <div className="flex justify-center gap-4 mt-12">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-8 py-3 rounded-full text-sm border transition-colors"
              style={{ borderColor: 'rgba(0,0,0,0.12)', color: '#000000' }}
            >
              Back
            </button>
          )}
          <button
            onClick={() => (isLastStep ? finish() : setStep((s) => s + 1))}
            disabled={isSubmitting}
            className="px-8 py-3 rounded-full text-sm transition-transform duration-200 hover:scale-[1.03] disabled:opacity-50"
            style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
          >
            {isSubmitting ? 'Saving…' : isLastStep ? 'Finish' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
