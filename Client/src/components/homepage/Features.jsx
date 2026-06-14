const features = [
  {
    iconBg: 'bg-primary/10 text-primary-dark',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 3v12M4 8l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Smart upvoting',
    desc: 'Priority score auto-computed from upvotes, age, and category weight.',
    badge: 'Citizen feature', badgeBg: 'bg-primary/20', badgeColor: 'text-primary-dark',
  },
  {
    iconBg: 'bg-accent-green/10 text-emerald-900',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9 6v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Live status tracking',
    desc: 'Full complaint timeline from filed to resolved with Socket.io updates.',
    badge: 'Real-time', badgeBg: 'bg-accent-green/20', badgeColor: 'text-emerald-900',
  },
  {
    iconBg: 'bg-accent-orange/10 text-amber-900',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2a5 5 0 015 5c0 3-5 9-5 9S4 10 4 7a5 5 0 015-5z" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="9" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    title: 'Location tagging',
    desc: 'Complaints pinned to exact locations so officers can reach the spot fast.',
    badge: 'Citizen feature', badgeBg: 'bg-accent-orange/20', badgeColor: 'text-amber-900',
  },
  {
    iconBg: 'bg-rose-100 text-rose-900',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6 8h6M6 11h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Officer dashboard',
    desc: 'Priority-sorted complaints with one-click status updates and upvoter details.',
    badge: 'Officer feature', badgeBg: 'bg-rose-200', badgeColor: 'text-rose-900',
  },
  {
    iconBg: 'bg-primary/10 text-primary-dark',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 14s1-4 6-4 6 4 6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    title: 'Role-based access',
    desc: "Separate citizen and officer views — sensitive data only visible to officers.",
    badge: 'Security', badgeBg: 'bg-primary/20', badgeColor: 'text-primary-dark',
  },
  {
    iconBg: 'bg-accent-green/10 text-emerald-900',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2c-2 0-4 1.5-4 4 0 1.5 1 3 2 4l2 3 2-3c1-1 2-2.5 2-4 0-2.5-2-4-4-4z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Instant notifications',
    desc: 'Get notified the moment your complaint is upvoted, assigned, or updated.',
    badge: 'Real-time', badgeBg: 'bg-accent-green/20', badgeColor: 'text-emerald-900',
  },
];

export default function Features() {
  return (
    <section id="features" className="px-9 py-16 bg-white max-md:px-5">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-3">
          Features
        </p>
        <p className="text-3xl font-semibold text-gray-900">
          Built for citizens. Designed for accountability.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-6 max-w-6xl mx-auto max-md:grid-cols-2 max-sm:grid-cols-1">
        {features.map((f, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 cursor-default"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${f.iconBg}`}>
              {f.icon}
            </div>
            <p className="text-base font-semibold text-gray-900 mb-2">{f.title}</p>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">{f.desc}</p>
            <span className={`text-[11px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider ${f.badgeBg} ${f.badgeColor}`}>
              {f.badge}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
