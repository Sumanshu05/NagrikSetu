import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, FiBell, FiMenu, FiX, FiLogOut, FiLayout, FiList, 
  FiPlusCircle, FiSettings, FiTrash2, FiClock, FiCheckCircle, FiChevronDown
} from 'react-icons/fi';
import { getAllComplaints, deleteComplaint, toggleUpvote } from '../services/operations/complaintAPI';
import { fetchMyNotifications } from '../services/operations/notificationAPI';
import { updateProfile, updateDisplayPicture, deleteProfile } from '../services/operations/profileAPI';
import { logout } from '../services/operations/authAPI';
import icon from '../assets/icon.png';
import ReviewModal from '../components/ReviewModal';

export default function CitizenDashboard() {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [categoryStats, setCategoryStats] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [formData, setFormData] = useState({ 
    firstName: user?.name?.split(' ')[0] || '', 
    lastName: user?.name?.split(' ').slice(1).join(' ') || '' 
  });
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Update formData when user data loads
  useEffect(() => {
    if (user) {
      setFormData({ 
        firstName: user.name?.split(' ')[0] || '', 
        lastName: user.name?.split(' ').slice(1).join(' ') || '' 
      });
    }
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fd = new FormData();
      fd.append("displayPicture", file);
      dispatch(updateDisplayPicture(token, fd));
    }
  };

  const handleProfileUpdate = async () => {
    const combinedName = `${formData.firstName} ${formData.lastName}`.trim();
    await dispatch(updateProfile(token, { ...formData, name: combinedName }));
  };

  const handleDeleteAccount = () => {
    if (window.confirm("CRITICAL: This will permanently delete your account and all associated data. This action CANNOT be undone. Are you absolutely sure?")) {
      dispatch(deleteProfile(token, navigate));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (token) {
        const filters = {};
        if (statusFilter !== 'All Status') {
          filters.status = statusFilter.toLowerCase().replace(' ', '_');
        }
        if (categoryFilter !== 'All Categories') {
          filters.category = categoryFilter.toLowerCase();
        }

        const [complaintsRes, notifRes] = await Promise.all([
          getAllComplaints(token, filters),
          dispatch(fetchMyNotifications(token))
        ]);

        const allComplaints = complaintsRes?.data || [];
        setComplaints(allComplaints);
        
        if (notifRes && notifRes.notifications) {
          setNotifications(notifRes.notifications.slice(0, 5));
        }

        // Calculate Stats
        const pen = allComplaints.filter(c => c.status === 'pending').length;
        const ip = allComplaints.filter(c => c.status === 'in_progress').length;
        const resCount = allComplaints.filter(c => c.status === 'resolved').length;
        
        setStats({
          total: complaintsRes?.total || allComplaints.length,
          pending: pen,
          inProgress: ip,
          resolved: resCount
        });

        // Category Stats
        const cats = {};
        allComplaints.forEach(c => {
          cats[c.category] = (cats[c.category] || 0) + 1;
        });
        const catArray = Object.entries(cats).map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
        setCategoryStats(catArray);
      }
      setLoading(false);
    };
    fetchData();
  }, [token, statusFilter, categoryFilter]);

  const handleLogout = () => {
    dispatch(logout(navigate));
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this complaint?")) {
      const success = await deleteComplaint(id, token);
      if (success) {
        setComplaints(prev => prev.filter(c => c._id !== id));
        setStats(prev => {
          const deleted = complaints.find(c => c._id === id);
          if (!deleted) return prev;
          const isPending = deleted.status === 'pending';
          const isInProgress = deleted.status === 'in_progress';
          const isResolved = deleted.status === 'resolved';
          return {
            total: prev.total - 1,
            pending: prev.pending - (isPending ? 1 : 0),
            inProgress: prev.inProgress - (isInProgress ? 1 : 0),
            resolved: prev.resolved - (isResolved ? 1 : 0)
          };
        });
        
        // Recalculate categories
        const updatedComplaints = complaints.filter(c => c._id !== id);
        const cats = {};
        updatedComplaints.forEach(c => {
          cats[c.category] = (cats[c.category] || 0) + 1;
        });
        setCategoryStats(Object.entries(cats).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count));
      }
    }
  };

  const handleUpvote = async (id, e) => {
    e.stopPropagation();
    const data = await toggleUpvote(id, token);
    if (data) {
      setComplaints(prev => prev.map(c => {
        if (c._id === id) {
          const newUpVotes = data.upvoted 
            ? [...(c.upVotes || []), user?._id] 
            : (c.upVotes || []).filter(uId => uId !== user?._id);
          return { ...c, upVoteCount: data.upVoteCount, upVotes: newUpVotes };
        }
        return c;
      }));
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'text-orange-600 bg-orange-100';
      case 'in_progress': return 'text-indigo-600 bg-indigo-100';
      case 'resolved': return 'text-emerald-600 bg-emerald-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours || 1}h ago`;
    if (days === 0) return 'Today';
    return `${days}d ago`;
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-gray-50 text-sm overflow-hidden">
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

      {/* ── Sidebar Navigation Drawer ───────────────────────────────────────── */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-[280px] bg-[#1a0a2e] text-gray-300 
        transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:w-72 md:flex md:flex-col md:shadow-none
      `}>
        <div className="flex-1 overflow-y-auto py-4">
          <p className="px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Main</p>
          <nav className="space-y-1 mb-8">
            <button onClick={() => { setStatusFilter('All Status'); setCategoryFilter('All Categories'); }} className={`w-full flex items-center gap-3 px-6 py-2.5 transition-colors ${statusFilter === 'All Status' && categoryFilter === 'All Categories' ? 'bg-blue-600/15 text-white border-l-2 border-blue-500' : 'hover:bg-white/5'}`}>
              <FiLayout className={statusFilter === 'All Status' && categoryFilter === 'All Categories' ? "text-blue-400" : ""} /> Dashboard
            </button>
            <button onClick={() => document.getElementById('complaints-table')?.scrollIntoView({ behavior: 'smooth' })} className="w-full flex items-center gap-3 px-6 py-2.5 hover:bg-white/5 transition-colors">
              <FiList /> My Complaints
            </button>
            <button onClick={() => navigate('/submit-complaint')} className="w-full flex items-center gap-3 px-6 py-2.5 hover:bg-white/5 transition-colors">
              <FiPlusCircle /> Submit Complaint
            </button>
            <button onClick={() => navigate('/notifications')} className="w-full flex items-center gap-3 px-6 py-2.5 hover:bg-white/5 transition-colors">
              <FiBell /> Notifications
            </button>
          </nav>

          <p className="px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Settings</p>
          <nav className="space-y-1">
            <button onClick={() => setStatusFilter('Settings')} className={`w-full flex items-center gap-3 px-6 py-2.5 transition-colors ${statusFilter === 'Settings' ? 'bg-blue-600/15 text-white border-l-2 border-blue-500' : 'hover:bg-white/5'}`}>
              <FiSettings className={statusFilter === 'Settings' ? "text-blue-400" : ""} /> Account Settings
            </button>
            <button 
              onClick={() => setIsReviewModalOpen(true)}
              className="w-full flex items-center gap-3 px-6 py-2.5 hover:bg-white/5 transition-colors"
            >
              <FiCheckCircle className="text-emerald-400" /> Give Feedback
            </button>
            <button 
              onClick={handleDeleteAccount}
              className="w-full flex items-center gap-3 px-6 py-2.5 text-red-400 hover:bg-red-500/10 transition-colors mt-2 border-t border-white/5 pt-4"
            >
              <FiTrash2 /> Delete Account
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
          
          {/* Dashboard Header Section (Inside main content for consistency) */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{getGreeting()}, {user?.name}</h1>
              <p className="text-xs text-gray-500 mt-1 font-medium flex items-center gap-1.5 uppercase tracking-wider">
                <FiClock className="text-blue-500" /> Dashboard Active · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
            
            <div className="flex items-center gap-3 max-w-md w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your complaints..." 
                  className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition-all"
                />
              </div>
            </div>
          </div>

          
          {statusFilter === 'Settings' ? (
            <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
                <p className="text-xs text-gray-500 mt-1">Update your personal information and settings.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold uppercase overflow-hidden">
                    {user?.image ? <img src={user.image} className="w-full h-full object-cover" /> : `${user?.name?.[0] || 'U'}`}
                  </div>
                  <div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/gif, image/jpeg" />
                    <button onClick={() => fileInputRef.current.click()} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Change Photo</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input type="email" defaultValue={user?.email} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" readOnly />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <input type="text" defaultValue={user?.role} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed capitalize" readOnly />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                  <button onClick={() => setStatusFilter('All Status')} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button onClick={handleProfileUpdate} className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 shadow-sm">Save Changes</button>
                </div>

                {/* Danger Zone */}
                <div className="mt-12 pt-8 border-t border-red-100">
                  <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-4">Danger Zone</h3>
                  <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-red-900">Delete Account Permanently</p>
                      <p className="text-xs text-red-700 mt-1">Once you delete your account, there is no going back. Please be certain.</p>
                    </div>
                    <button 
                      onClick={handleDeleteAccount}
                      className="px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                      Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
              <p className="text-xs font-medium text-gray-500 mb-2">Total filed</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-2">All time</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
              <p className="text-xs font-medium text-gray-500 mb-2">Pending</p>
              <p className="text-2xl sm:text-3xl font-bold text-orange-600">{stats.pending}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-2">Awaiting action</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
              <p className="text-xs font-medium text-gray-500 mb-2">In progress</p>
              <p className="text-2xl sm:text-3xl font-bold text-indigo-600">{stats.inProgress}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-2">Currently active</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
              <p className="text-xs font-medium text-gray-500 mb-2">Resolved</p>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{stats.resolved}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-2">Successfully closed</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Left Column (Table) */}
            <div className="lg:col-span-2 space-y-6" id="complaints-table">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-base font-semibold text-gray-900">My Complaints</h2>
                  <div className="flex gap-2">
                    <select 
                      value={categoryFilter} 
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-gray-600 outline-none hover:bg-gray-100 cursor-pointer transition-all appearance-none pr-7 relative"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                    >
                      <option>All Categories</option>
                      <option>Roads</option>
                      <option>Electricity</option>
                      <option>Water</option>
                      <option>Sanitation</option>
                      <option>Other</option>
                    </select>
                    <select 
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-gray-600 outline-none hover:bg-gray-100 cursor-pointer transition-all appearance-none pr-7 relative"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/xml\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                    >
                      <option>All Status</option>
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Resolved</option>
                      <option>Rejected</option>
                    </select>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-200">
                        <th className="px-5 py-3 text-xs font-medium text-gray-500 w-2/5">Complaint</th>
                        <th className="px-5 py-3 text-xs font-medium text-gray-500">Category</th>
                        <th className="px-5 py-3 text-xs font-medium text-gray-500">Upvotes</th>
                        <th className="px-5 py-3 text-xs font-medium text-gray-500">Status</th>
                        <th className="px-5 py-3 text-xs font-medium text-gray-500 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loading ? (
                        <tr>
                          <td colSpan="5" className="py-10 text-center text-gray-400">Loading complaints...</td>
                        </tr>
                      ) : filteredComplaints.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-10 text-center flex flex-col items-center justify-center">
                            <FiPlusCircle className="w-8 h-8 text-gray-300 mb-2" />
                            <p className="text-gray-500">No complaints match your search.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredComplaints.map((comp) => (
                          <tr key={comp._id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => navigate(`/complaint/${comp._id}`)}>
                            <td className="px-5 py-4">
                              <p className="font-medium text-gray-900 mb-0.5 truncate max-w-[250px]" title={comp.title}>{comp.title}</p>
                              <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                <FiClock className="w-3 h-3" /> {new Date(comp.createdAt).toLocaleDateString()}
                              </p>
                            </td>
                            <td className="px-5 py-4">
                              <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700 capitalize">
                                {comp.category}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <button 
                                onClick={(e) => handleUpvote(comp._id, e)}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all
                                  ${comp.upVotes?.includes(user?._id) 
                                    ? 'bg-blue-600 text-white shadow-sm' 
                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100'
                                  }`}
                              >
                                ▲ {comp.upVoteCount || 0}
                              </button>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold capitalize ${getStatusColor(comp.status)}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                {comp.status?.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={(e) => handleDelete(comp._id, e)}
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                  title="Delete"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                                <button 
                                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-100 rounded-md text-[10px] font-semibold transition-colors"
                                >
                                  View
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

            {/* Right Column (Widgets) */}
            <div className="space-y-6">
              
              {/* Submit CTA */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-md p-6 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-2">Notice an issue?</h3>
                  <p className="text-blue-100 text-xs mb-4 leading-relaxed">
                    Help us improve your city. Report issues regarding roads, sanitation, electricity, or water supply directly to the concerned authorities.
                  </p>
                  <button 
                    onClick={() => navigate('/submit-complaint')}
                    className="w-full py-2.5 bg-white text-blue-700 font-semibold text-sm rounded-lg hover:bg-blue-50 transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <FiPlusCircle className="w-4 h-4" /> File a Complaint
                  </button>
                </div>
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="px-5 py-4 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Your filings by category</h3>
                </div>
                <div className="p-5 space-y-4">
                  {categoryStats.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-2">No data available</p>
                  ) : (
                    categoryStats.slice(0, 5).map((cat, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="text-xs text-gray-600 w-24 truncate capitalize">{cat.name}</span>
                        <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${(cat.count / stats.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-600 w-6 text-right">{cat.count}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-gray-900">Recent notifications</h3>
                  <button onClick={() => navigate('/notifications')} className="text-[10px] font-medium text-blue-600 hover:text-blue-700">View all</button>
                </div>
                <div className="divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6">No new notifications</p>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif._id} className="p-4 flex gap-3 items-start hover:bg-gray-50 cursor-pointer" onClick={() => navigate('/notifications')}>
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.read ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
                        <div>
                          <p className={`text-xs ${notif.read ? 'text-gray-600' : 'text-gray-900 font-medium'} line-clamp-2`}>{notif.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
          </>
          )}
        </main>
      </div>
      {/* Review Modal */}
      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
      />
    </div>
  );
}
