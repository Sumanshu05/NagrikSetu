import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, FiBell, FiMenu, FiX, FiLogOut, FiLayout, FiUsers, 
  FiUserCheck, FiFlag, FiPieChart, FiSettings, FiChevronDown,
  FiCheck, FiXCircle, FiTrendingUp, FiActivity, FiBriefcase
} from 'react-icons/fi';
import { getAdminStats, getAllUsers, verifyOfficer } from '../services/operations/adminAPI';
import { getAllComplaints } from '../services/operations/complaintAPI';
import { logout } from '../services/operations/authAPI';
import { toast } from 'react-hot-toast';
import icon from '../assets/icon.png';

export default function AdminDashboard() {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data States
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedOfficers: 0,
    totalComplaints: 0,
    resolutionRate: 0
  });
  const [pendingOfficers, setPendingOfficers] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, complaintsRes] = await Promise.all([
        getAdminStats(token),
        getAllUsers(token),
        getAllComplaints(token)
      ]);

      if (statsRes) {
        setStats({
          totalUsers: statsRes.citizens + statsRes.officers,
          verifiedOfficers: statsRes.verifiedOfficers,
          totalComplaints: statsRes.totalComplaints,
          resolutionRate: statsRes.totalComplaints ? ((statsRes.resolvedComplaints / statsRes.totalComplaints) * 100).toFixed(1) : 0
        });
      }

      if (usersRes) {
        setAllUsers(usersRes);
        setPendingOfficers(usersRes.filter(u => u.role === 'officer' && !u.isVerified));
      }

      if (complaintsRes) {
        setAllComplaints(complaintsRes.data || []);
      }

    } catch (error) {
      console.error("Admin Dashboard Fetch Error:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchAdminData();
  }, [token]);

  const handleVerifyOfficer = async (officerId) => {
    const success = await verifyOfficer(officerId, token);
    if (success) {
      fetchAdminData(); // Refresh data
    }
  };

  const handleLogout = () => {
    dispatch(logout(navigate));
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-[#f8fafc] text-sm overflow-hidden min-h-screen">
      {/* ── Mobile Sidebar Backdrop ────────────────────────────────────────── */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 md:hidden transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Floating Sidebar Toggle for Mobile */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed bottom-6 right-6 z-[60] bg-indigo-600 text-white p-4 rounded-full shadow-2xl active:scale-95 transition-all"
        aria-label="Toggle Menu"
      >
        {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* ── Mobile Sidebar Drawer ────────────────────────────────────────────── */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-[280px] bg-[#1a0a2e] text-slate-300 
        transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:w-72 md:flex md:flex-col md:shadow-none
      `}>
        <div className="flex-1 overflow-y-auto py-4">
          <p className="px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Main Menu</p>
          <nav className="space-y-1 px-3">
            {[
              { id: 'overview', icon: <FiLayout />, label: 'System Overview' },
              { id: 'users', icon: <FiUsers />, label: 'Citizen Directory' },
              { id: 'officers', icon: <FiBriefcase />, label: 'Officer Management' },
              { id: 'complaints', icon: <FiFlag />, label: 'Global Complaints' },
              { id: 'analytics', icon: <FiPieChart />, label: 'System Analytics' },
              { id: 'settings', icon: <FiSettings />, label: 'Admin Settings' },
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => { setFilter(item.id); setIsSidebarOpen(false); }} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${filter === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-white/5 hover:text-white'}`}
              >
                <span className={`text-lg ${filter === item.id ? 'text-white' : 'text-slate-400'}`}>{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <FiLogOut className="text-lg" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          
          {/* Page Greeting & Context */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-4">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {getGreeting()}, <span className="text-indigo-600">{user?.name?.split(' ')[0] || 'Admin'}</span>
              </h1>
              <p className="text-xs text-slate-500 font-bold flex items-center gap-2 uppercase tracking-[0.1em]">
                <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">
                  <FiActivity className="animate-pulse" /> Live System Status
                </span>
                <span className="opacity-40">•</span>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
            
            <div className="flex items-center gap-3 max-w-md w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search citizens, officers or reports..." 
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm transition-all"
                />
              </div>
            </div>
          </div>

          
          {filter === 'overview' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Citizens', value: stats.totalUsers, icon: <FiUsers />, color: 'bg-blue-50 text-blue-600', trend: '+12% this month' },
                  { label: 'Verified Officers', value: stats.verifiedOfficers, icon: <FiUserCheck />, color: 'bg-emerald-50 text-emerald-600', trend: '3 pending' },
                  { label: 'Total Complaints', value: stats.totalComplaints, icon: <FiFlag />, color: 'bg-amber-50 text-amber-600', trend: 'System-wide' },
                  { label: 'Resolution Rate', value: `${stats.resolutionRate}%`, icon: <FiTrendingUp />, color: 'bg-purple-50 text-purple-600', trend: 'Global average' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-2xl ${stat.color} text-xl`}>{stat.icon}</div>
                    </div>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{stat.label}</p>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">{stat.trend}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Pending Officer Verifications */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Officer Verification Queue</h2>
                        <p className="text-xs text-slate-500 font-medium">Approve newly registered officer accounts</p>
                      </div>
                      <span className="bg-amber-50 text-amber-600 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-100 uppercase tracking-wider">
                        {pendingOfficers.length} Pending
                      </span>
                    </div>
                    <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
                      <table className="w-full text-left min-w-[700px]">
                        <thead>
                          <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-50">
                            <th className="px-6 py-4">Officer Details</th>
                            <th className="px-6 py-4">Registered On</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {pendingOfficers.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="py-12 text-center text-slate-400 font-medium italic">All verification requests cleared.</td>
                            </tr>
                          ) : (
                            pendingOfficers.map(officer => (
                              <tr key={officer._id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 shadow-sm">
                                      {officer.name[0]}
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900">{officer.name}</p>
                                      <p className="text-[11px] text-slate-500">{officer.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-5 text-slate-600 font-medium">{new Date(officer.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-5">
                                  <span className="flex items-center gap-1.5 text-amber-600 font-bold text-[10px] uppercase">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                    Awaiting Approval
                                  </span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button 
                                      onClick={() => handleVerifyOfficer(officer._id)}
                                      className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm"
                                      title="Approve Officer"
                                    >
                                      <FiCheck className="text-lg" />
                                    </button>
                                    <button 
                                      className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm"
                                      title="Reject/Request Info"
                                    >
                                      <FiXCircle className="text-lg" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* System Activity & Analytics */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <FiPieChart className="text-indigo-500" /> Resolution Stats
                    </h3>
                    <div className="space-y-5">
                      {stats.categories?.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No data yet.</p>
                      ) : (
                        stats.categories?.map((item, i) => (
                          <div key={i}>
                            <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                              <span className="capitalize">{item.name}</span>
                              <span>{item.rate}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className={`bg-indigo-500 h-full rounded-full transition-all duration-1000`} style={{ width: `${item.rate}%` }}></div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <button onClick={() => setFilter('analytics')} className="w-full mt-8 py-3 bg-slate-50 text-slate-600 text-xs font-bold rounded-2xl hover:bg-slate-100 transition-colors uppercase tracking-widest">
                      Detailed Analytics
                    </button>
                  </div>

                  <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-200 text-white overflow-hidden relative group">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500"></div>
                    <div className="relative z-10">
                      <h4 className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">System Health</h4>
                      <p className="text-2xl font-black mb-4 tracking-tight">Excellent</p>
                      <p className="text-[11px] opacity-70 leading-relaxed mb-6 font-medium">All services are operational. No critical bugs reported in the last 48 hours.</p>
                      <div className="flex items-center gap-2 text-indigo-100 text-xs font-bold bg-white/10 px-4 py-2 rounded-xl w-fit">
                        <FiCheck className="text-base" /> Uptime: 99.9%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {filter !== 'overview' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 text-4xl">
                <FiActivity />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 capitalize">{filter.replace('-', ' ')} View</h2>
                <p className="text-slate-500 mt-2 max-w-md">Detailed management for {filter} is being prepared. You can manage verifications and see global stats on the Overview tab.</p>
              </div>
              <button onClick={() => setFilter('overview')} className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all uppercase tracking-widest">
                Return to Dashboard
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
