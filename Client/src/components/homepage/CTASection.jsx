import { useNavigate } from 'react-router-dom';

function CheckItem({ label }) {
  return (
    <div className="flex items-center gap-2">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" className="text-accent-green" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="text-sm text-muted">{label}</span>
    </div>
  );
}

export default function CTASection() {
  const navigate = useNavigate();
  return (
    <section className="bg-bg-dark px-9 py-20 text-center max-md:px-5">
      <div className="max-w-xl mx-auto">
        {/* Icon */}
        <div className="w-16 h-16 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-8 text-primary-light">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M11 7v4l3 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </div>

        <p className="text-3xl font-semibold text-white mb-4 leading-tight max-sm:text-2xl">
          Ready to make your<br />city better?
        </p>
        <p className="text-base text-muted mb-10 leading-relaxed">
          Join thousands of citizens already using NagrikSetu to hold their city accountable.
        </p>

        <div className="flex justify-center gap-4 mb-10 flex-wrap">
          <button 
            onClick={() => navigate('/login')}
            className="bg-primary rounded-xl px-8 py-3.5 text-white text-base font-semibold hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/40 transition-all duration-200"
          >
            Register as citizen
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="border border-primary-light/30 rounded-xl px-8 py-3.5 text-primary-light text-base font-medium bg-transparent hover:bg-primary-light/10 hover:text-white transition-all duration-200"
          >
            Officer login
          </button>
        </div>

        {/* Checklist */}
        <div className="flex justify-center gap-8 flex-wrap">
          <CheckItem label="Free to use" />
          <CheckItem label="No app needed" />
          <CheckItem label="Real-time updates" />
        </div>
      </div>
    </section>
  );
}
