export function HeartbeatLine({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 40" fill="none" aria-hidden>
      <path
        d="M0 20h40l8-12 8 24 8-16 8 8h40l8-10 8 14 8-18 8 12h40"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-brand-400 opacity-60"
      />
    </svg>
  );
}

export function UploadIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 100" fill="none" aria-hidden>
      <rect x="20" y="15" width="80" height="70" rx="8" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="1.5" />
      <path d="M35 55h50M35 45h35M35 65h40" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <circle cx="85" cy="35" r="12" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="1.5" />
      <path d="M80 35l3 3 6-6" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M60 5v20M52 13l8-8 8 8" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DoctorAssistant({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 140 120" fill="none" aria-hidden>
      <ellipse cx="70" cy="105" rx="45" ry="8" fill="#e2e8f0" />
      <circle cx="70" cy="42" r="22" fill="#fef3c7" stroke="#fcd34d" strokeWidth="1.5" />
      <path d="M48 65c0-12 10-22 22-22s22 10 22 22v25H48V65z" fill="#0d9488" />
      <rect x="58" y="78" width="24" height="20" rx="4" fill="white" stroke="#99f6e4" strokeWidth="1.5" />
      <path d="M64 88h12M64 93h8" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="63" cy="40" r="2" fill="#334155" />
      <circle cx="77" cy="40" r="2" fill="#334155" />
      <path d="M65 48c2 2 8 2 10 0" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function PrescriptionCard({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 96" fill="none" aria-hidden>
      <rect x="8" y="8" width="64" height="80" rx="6" fill="white" stroke="#cbd5e1" strokeWidth="1.5" />
      <path d="M20 28h40M20 40h28M20 52h35" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      <rect x="48" y="62" width="16" height="16" rx="4" fill="#d1fae5" />
      <path d="M52 70h8M56 66v8" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function HealthChart({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 80" fill="none" aria-hidden>
      <rect x="10" y="10" width="80" height="60" rx="6" fill="#f0fdfa" stroke="#99f6e4" strokeWidth="1.5" />
      <rect x="22" y="45" width="10" height="18" rx="2" fill="#5eead4" />
      <rect x="38" y="35" width="10" height="28" rx="2" fill="#2dd4bf" />
      <rect x="54" y="28" width="10" height="35" rx="2" fill="#14b8a6" />
      <rect x="70" y="38" width="10" height="25" rx="2" fill="#0d9488" />
      <path d="M18 22h64" stroke="#cbd5e1" strokeWidth="1" />
    </svg>
  );
}
