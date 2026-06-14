import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiMail, FiPhone, FiCheckCircle, FiShield, FiActivity, 
  FiArrowRight, FiGlobe, FiInfo 
} from 'react-icons/fi';
import icon from '../../assets/icon.png';
import { getPublicStats } from '../../services/operations/complaintAPI';

export default function Footer() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, resolvedRate: 0, avgTime: '3.2d' });

  useEffect(() => {
    const fetchStats = async () => {
      const statsRes = await getPublicStats();
      if (statsRes && statsRes.length > 0) {
        let total = 0;
        let resolved = 0;
        statsRes.forEach(ward => {
          total += ward.total;
          ward.statusBreakdown.forEach(s => {
            if (s.status === 'resolved') resolved += s.count;
          });
        });
        setStats({
          total: total,
          resolvedRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
          avgTime: '2.4d' // For now avg time is usually static or calculated from resolution time
        });
      }
    };
    fetchStats();
  }, []);

  const footerLinks = {
    platform: [
      { name: 'Home', href: '/' },
      { name: 'How it works', href: '/#how-it-works' },
      { name: 'Features', href: '/#features' },
      { name: 'Community feed', href: '/#live-feed' },
      { name: 'Submit complaint', href: '/submit-complaint' },
      { name: 'Track complaint', href: '/dashboard' },
    ],
    account: [
      { name: 'Register as citizen', href: '/register' },
      { name: 'Officer login', href: '/login' },
      { name: 'Admin panel', href: '/login' },
      { name: 'My complaints', href: '/dashboard' },
      { name: 'Notifications', href: '/notifications' },
      { name: 'Profile settings', href: '/dashboard' },
    ],
    support: [
      { name: 'Help centre', href: '#' },
      { name: 'Contact us', href: '/contact' },
      { name: 'Report a bug', href: '#' },
      { name: 'Grievance policy', href: '#' },
    ]
  };

  return (
    <footer className="bg-[#0f172a] text-gray-400 py-16 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand & Stats */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-3 group no-underline">
                <img src={icon} alt="NagrikSetu" className="h-12 w-12 rounded-xl transition-transform group-hover:scale-110" />
                <span className="text-white text-2xl font-bold tracking-tight">NagrikSetu</span>
              </Link>
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-emerald-400 text-[11px] font-bold uppercase tracking-wider">All systems operational</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
                Bridging citizens and municipal officers. File grievances, upvote real issues, and track resolutions — transparently.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Complaints filed', value: `${stats.total}+` },
                { label: 'Resolved', value: `${stats.resolvedRate}%` },
                { label: 'Avg response', value: stats.avgTime },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-white m-0">{stat.value}</p>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-1 leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Platform</h4>
            <ul className="space-y-4">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="hover:text-white transition-colors text-sm no-underline">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Account</h4>
            <ul className="space-y-4">
              {footerLinks.account.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="hover:text-white transition-colors text-sm no-underline">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Support & Contact</h4>
            <ul className="space-y-4 mb-8">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="hover:text-white transition-colors text-sm no-underline">{link.name}</Link>
                </li>
              ))}
            </ul>
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-indigo-400">
                  <FiMail />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Email Us</p>
                  <p className="text-sm text-white font-medium">support@nagriksetu.in</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-emerald-400">
                  <FiPhone />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Toll Free</p>
                  <p className="text-sm text-white font-medium">1800-123-4567</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-medium uppercase tracking-widest text-gray-500">
          <div className="flex flex-col gap-1">
            <p>© 2026 NagrikSetu. Built for Indian citizens.</p>
            <p className="text-[10px] normal-case tracking-normal">An initiative for transparent governance.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-3">
            {['Privacy policy', 'Terms of service'].map((l) => (
              <Link key={l} to="#" className="hover:text-white transition-colors no-underline">{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
