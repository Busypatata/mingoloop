import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  iconBg: string;
  title: string;
  description: string;
  cta?: { label: string; to: string; tone: 'turquoise' | 'coral' };
}

export default function FeatureCard({ icon, iconBg, title, description, cta }: FeatureCardProps) {
  const toneColor = cta?.tone === 'coral' ? 'var(--color-deep-red)' : 'var(--color-turquoise)';

  return (
    <div
      className="relative overflow-hidden p-6 flex flex-col"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid rgba(18,63,75,0.08)',
        borderRadius: 22,
        minHeight: 215,
      }}
    >
      {/* subtle decorative squiggle */}
      <svg
        className="absolute pointer-events-none"
        style={{ top: 20, right: 20, opacity: 0.25 }}
        width="26"
        height="26"
        viewBox="0 0 26 26"
        aria-hidden="true"
      >
        <path d="M2 20c4-8 8 8 12 0s8-8 10 0" stroke="var(--color-turquoise)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>

      <div
        className="flex items-center justify-center flex-shrink-0 mb-4"
        style={{ width: 58, height: 58, borderRadius: '50%', backgroundColor: iconBg }}
        aria-hidden="true"
      >
        {icon}
      </div>

      <h3 className="text-lg mb-2" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: '#123F4B' }}>
        {title}
      </h3>
      <p className="text-sm mb-5 flex-1" style={{ color: '#617481', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
        {description}
      </p>

      {cta && (
        <Link
          to={cta.to}
          className="dashboard-outline-btn inline-flex items-center gap-1.5 self-start px-6 py-2.5 rounded-full text-sm transition-colors"
          style={{ border: `1px solid ${toneColor}`, color: toneColor, ['--btn-tone' as string]: toneColor }}
        >
          {cta.label} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}
