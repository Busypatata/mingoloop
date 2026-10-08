import { X } from 'lucide-react';
import { LANGUAGE_OPTIONS, flagFor } from '../../utils/languages';
import { PROFICIENCY_LEVELS } from './constants';

const inputStyle = {
  border: '1px solid rgba(17,17,15,0.12)',
  borderRadius: 10,
};

export default function LanguageRow({
  language,
  proficiency,
  onLanguageChange,
  onProficiencyChange,
  onRemove,
  proficiencyPlaceholder = '—',
}: {
  language: string;
  proficiency?: string;
  onLanguageChange: (value: string) => void;
  onProficiencyChange?: (value: string) => void;
  onRemove?: () => void;
  proficiencyPlaceholder?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl flex-shrink-0" aria-hidden="true">
        {flagFor(language)}
      </span>

      <select
        value={language}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="flex-1 min-w-0 px-3 py-2.5 text-sm outline-none bg-white"
        style={inputStyle}
      >
        <option value="" disabled>
          Choose a language…
        </option>
        {LANGUAGE_OPTIONS.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>

      {onProficiencyChange ? (
        <select
          value={proficiency ?? ''}
          onChange={(e) => onProficiencyChange(e.target.value)}
          className="px-3 py-2.5 text-sm outline-none bg-white flex-shrink-0"
          style={{ ...inputStyle, width: 150 }}
        >
          <option value="" disabled>
            Level…
          </option>
          {PROFICIENCY_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      ) : (
        <span
          className="text-sm flex-shrink-0 text-right"
          style={{ width: 150, color: 'var(--color-app-text-muted)' }}
        >
          {proficiencyPlaceholder}
        </span>
      )}

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${language || 'language'}`}
          className="flex-shrink-0 flex items-center justify-center rounded-full"
          style={{ width: 28, height: 28, color: 'var(--color-app-text-muted)' }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
