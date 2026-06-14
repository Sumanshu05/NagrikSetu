import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicStats, getRecentComplaints } from '../../services/operations/complaintAPI';

export default function Hero() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, resolvedRate: 0, avgTime: '3.2 days' });
  const [summary, setSummary] = useState({ open: 0, inProgress: 0, highPriority: 0 });

  useEffect(() => {
    const fetchHeroData = async () => {
      const [recentRes, statsRes] = await Promise.all([
        getRecentComplaints(),
        getPublicStats()
      ]);

      if (recentRes) setComplaints(recentRes);
      
      if (statsRes && statsRes.length > 0) {
        let total = 0;
        let resolved = 0;
        let open = 0;
        let inProgress = 0;
        let highPriority = 0;

        statsRes.forEach(ward => {
          total += ward.total;
          ward.statusBreakdown.forEach(s => {
            if (s.status === 'resolved') resolved += s.count;
            if (s.status === 'pending') open += s.count;
            if (s.status === 'in_progress') inProgress += s.count;
          });
        });

        setStats(prev => ({
          ...prev,
          total: total,
          resolvedRate: total > 0 ? Math.round((resolved / total) * 100) : 0
        }));

        setSummary({
          open: open,
          inProgress: inProgress,
          highPriority: Math.round(total * 0.15) // Mocking high priority for now as it's a score
        });
      }
    };
    fetchHeroData();
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="live-feed" className="bg-bg-dark px-9 pt-16 pb-14 grid grid-cols-2 gap-11 items-center max-md:grid-cols-1 max-md:px-5">

      {/* ── Left ── */}
      <div className="fade-in-up">
        {/* Pill */}
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 mb-6">
          <div className="w-1.5 h-1.5 bg-accent-green rounded-full dot-pulse" />
          <span className="text-primary-light text-xs font-medium">Smart Citizen Grievance Platform</span>
        </div>

        <h1 className="text-4xl font-semibold text-white m-0 mb-5 leading-tight max-md:text-3xl">
          Your grievance.<br />
          <span className="text-primary-light">Heard. Tracked.</span><br />
          Resolved.
        </h1>

        <p className="text-sm text-muted mb-8 leading-relaxed max-w-sm">
          NagrikSetu connects citizens to municipal officers. File complaints,
          upvote real issues, and watch your city improve — transparently.
        </p>

        {/* CTA row */}
        <div className="flex gap-4 items-center flex-wrap">
          <button 
            onClick={() => navigate('/submit-complaint')}
            className="bg-primary rounded-lg px-7 py-3 text-white text-sm font-medium hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/40 transition-all duration-200"
          >
            File a complaint
          </button>
          <button 
            onClick={() => scrollToSection('how-it-works')}
            className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer group"
          >
            <span className="w-10 h-10 border border-primary-light/30 rounded-full flex items-center justify-center group-hover:bg-primary-light/10 text-primary-light transition-colors duration-200">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M2.5 1.5l6 4-6 4V1.5z" fill="currentColor"/>
              </svg>
            </span>
            <span className="text-muted text-sm group-hover:text-white transition-colors duration-200">See how it works</span>
          </button>
        </div>

        {/* Stats */}
        <div className="flex mt-10 pt-8 border-t border-white/10 flex-wrap gap-y-6">
          <div className="pr-6 min-w-[120px]">
            <p className="text-2xl font-medium text-white m-0">{stats.total}+</p>
            <p className="text-xs text-muted mt-1">Complaints filed</p>
          </div>
          <div className="w-px bg-white/10 hidden sm:block" />
          <div className="px-6 min-w-[120px]">
            <p className="text-2xl font-medium text-accent-green m-0">{stats.resolvedRate}%</p>
            <p className="text-xs text-muted mt-1">Resolution rate</p>
          </div>
          <div className="w-px bg-white/10 hidden sm:block" />
          <div className="px-6 min-w-[120px]">
            <p className="text-2xl font-medium text-accent-orange m-0">{stats.avgTime}</p>
            <p className="text-xs text-muted mt-1">Avg response time</p>
          </div>
        </div>
      </div>

      {/* ── Right — Live Feed ── */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl overflow-hidden fade-in-up-delay">
        {/* Header */}
        <div className="bg-primary/10 px-5 py-3.5 border-b border-primary/20 flex justify-between items-center">
          <span className="text-primary-light text-xs font-medium uppercase tracking-wide">Live complaint feed</span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-accent-green rounded-full dot-pulse" />
            <span className="text-accent-green text-[11px] font-medium uppercase tracking-widest">Live</span>
          </div>
        </div>

        {/* Rows */}
        {complaints.length > 0 ? complaints.map((c, i) => (
          <div
            key={i}
            onClick={() => navigate(`/complaint/${c._id}`)}
            className="px-5 py-4 border-b border-white/5 last:border-0 flex gap-4 items-center hover:bg-primary/10 transition-colors duration-150 cursor-pointer"
          >
            <div className="flex-1">
              <div className="flex gap-2 items-center mb-2">
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-primary/20 text-primary-light capitalize`}>{c.category}</span>
                <span className={`text-[11px] font-medium capitalize ${
                  c.status === 'resolved' ? 'text-accent-green' : 
                  c.status === 'in_progress' ? 'text-indigo-400' : 'text-accent-orange'
                }`}>{c.status?.replace('_', ' ')}</span>
              </div>
              <p className="text-sm text-white font-medium m-0 mb-1 line-clamp-1">{c.title}</p>
              <p className="text-xs text-muted m-0">{c.location?.ward?.name || 'Local Area'} · {new Date(c.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-center bg-primary/20 rounded-xl px-3.5 py-2 min-w-[50px] shrink-0">
              <p className="text-[14px] text-primary m-0 font-medium">▲</p>
              <p className="text-sm font-semibold text-white m-0">{c.upVoteCount || 0}</p>
            </div>
          </div>
        )) : (
          <div className="px-5 py-10 text-center text-muted text-sm italic">
            No live complaints at the moment.
          </div>
        )}

        {/* Summary */}
        <div className="px-5 py-4 border-t border-primary/20 grid grid-cols-3 gap-3">
          {[
            { num: summary.open,  label: 'Total open',    color: 'text-primary-light', bg: 'bg-primary/10' },
            { num: summary.inProgress,  label: 'In progress',   color: 'text-accent-green', bg: 'bg-accent-green/10' },
            { num: summary.highPriority,  label: 'Priority score', color: 'text-accent-orange', bg: 'bg-accent-orange/10' },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} rounded-xl p-3 text-center`}>
              <p className={`text-lg font-semibold ${s.color} m-0`}>{s.num}</p>
              <p className="text-[10px] text-muted mt-1 uppercase tracking-wider font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
