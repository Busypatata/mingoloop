import { useState } from 'react';
import api from '../../services/api';
import { mediaUrl } from '../../utils/media';
import type { ChatMessage } from '../../types/user';

interface MessageBubbleProps {
  message: ChatMessage;
  mine: boolean;
}

interface Translation {
  text: string;
  sameLanguage: boolean;
  target: string;
}

export default function MessageBubble({ message, mine }: MessageBubbleProps) {
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isVoice = !!message.audioUrl;
  // Only other people's text messages get a Translate button.
  const canTranslate = !mine && !isVoice && !!message.text;

  async function handleTranslate() {
    if (translation) {
      setVisible((v) => !v);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.post<Translation>('/messages/translate', { messageId: message.id });
      setTranslation(res.data);
      setVisible(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not translate this message.');
    } finally {
      setLoading(false);
    }
  }

  const buttonLabel = loading ? 'Translating…' : visible ? 'Hide translation' : translation ? 'Show translation' : 'Translate';

  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className="flex flex-col max-w-xs sm:max-w-sm" style={{ alignItems: mine ? 'flex-end' : 'flex-start' }}>
        <div
          className="px-4 py-2.5 rounded-2xl text-sm break-words"
          style={
            mine
              ? { backgroundColor: 'var(--color-coral)', color: '#ffffff' }
              : { backgroundColor: 'var(--color-aqua)', color: '#111820' }
          }
        >
          {isVoice ? (
            <audio
              controls
              preload="metadata"
              src={mediaUrl(message.audioUrl!)}
              aria-label="Voice message"
              style={{ width: 240, maxWidth: '100%', height: 36, display: 'block' }}
            />
          ) : (
            message.text
          )}

          {visible && translation && (
            <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(20,40,50,0.15)' }}>
              {translation.sameLanguage ? (
                <span style={{ opacity: 0.7 }}>This message is already in {translation.target}.</span>
              ) : (
                translation.text
              )}
            </div>
          )}
        </div>

        {canTranslate && (
          <button
            onClick={handleTranslate}
            disabled={loading}
            className="text-xs mt-1 px-1"
            style={{ color: 'var(--color-turquoise)', fontFamily: 'var(--font-body)' }}
          >
            {buttonLabel}
          </button>
        )}

        {error && (
          <p className="text-xs mt-1 px-1" style={{ color: '#B3261E', fontFamily: 'var(--font-body)' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
