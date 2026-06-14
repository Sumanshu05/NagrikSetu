const steps = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="4" y="3" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 8h6M8 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    circleClass: 'bg-primary-light/20 border-2 border-primary-light text-primary-dark',
    title: 'File your complaint',
    desc: 'Describe, categorize, attach a photo and submit in under 2 minutes.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 5v12M6 10l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    circleClass: 'bg-accent-green/20 border-2 border-accent-green-light text-emerald-900',
    title: 'Community upvotes',
    desc: 'Citizens upvote real issues. Priority score rises automatically.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M5 12l4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    circleClass: 'bg-accent-orange/20 border-2 border-amber-300 text-amber-900',
    title: 'Officer resolves',
    desc: "Assigned officer acts and updates status. You're notified instantly.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-9 py-16 bg-bg-light max-md:px-5">
      {/* Header */}
      <div className="text-center mb-14">
        <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-3">
          How it works
        </p>
        <p className="text-3xl font-semibold text-gray-900">
          From complaint to resolution in 3 steps
        </p>
      </div>

      {/* Steps */}
      <div className="relative grid grid-cols-3 gap-0 max-w-4xl mx-auto max-sm:grid-cols-1 max-sm:gap-10 max-sm:max-w-xs">
        {/* Connector line */}
        <div className="absolute top-8 left-[calc(16.6%+24px)] right-[calc(16.6%+24px)] h-px bg-gray-300 max-sm:hidden" />

        {steps.map((s, i) => (
          <div
            key={i}
            className="text-center px-6 group transition-transform duration-300 hover:-translate-y-1.5"
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 transition-all duration-300 group-hover:shadow-xl ${s.circleClass}`}>
              {s.icon}
            </div>
            <p className="text-base font-semibold text-gray-900 mb-2">{s.title}</p>
            <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
