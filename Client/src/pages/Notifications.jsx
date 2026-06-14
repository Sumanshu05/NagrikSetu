import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiBell,
  FiThumbsUp,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiInfo,
  FiTrash2,
  FiChevronUp,
  FiUsers,
} from 'react-icons/fi';
import {
  fetchMyNotifications,
  markOneAsRead,
  markAllAsRead,
  deleteOneNotification,
  clearAllNotifications,
  getUpvoters,
} from '../services/operations/notificationAPI';
import { useDispatch } from 'react-redux';
import { setUnreadCount } from '../slices/notificationSlice';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

// Avatar initials with a deterministic soft color
const avatarPalette = [
  { bg: 'bg-blue-100',   text: 'text-blue-700'  },
  { bg: 'bg-green-100',  text: 'text-green-700' },
  { bg: 'bg-orange-100', text: 'text-orange-700'},
  { bg: 'bg-purple-100', text: 'text-purple-700'},
  { bg: 'bg-rose-100',   text: 'text-rose-700'  },
];

function avatarColor(name = '') {
  const idx = (name.charCodeAt(0) || 0) % avatarPalette.length;
  return avatarPalette[idx];
}

function initials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
}

// ─── Notification type → icon & color ─────────────────────────────────────────

function notifStyle(type) {
  switch (type) {
    case 'upvote':
      return { Icon: FiThumbsUp,    color: 'text-blue-500',   bg: 'bg-blue-50'   };
    case 'status_update':
      return { Icon: FiRefreshCw,   color: 'text-indigo-500', bg: 'bg-indigo-50' };
    case 'complaint_resolved':
      return { Icon: FiCheckCircle, color: 'text-green-500',  bg: 'bg-green-50'  };
    case 'complaint_rejected':
      return { Icon: FiXCircle,     color: 'text-red-500',    bg: 'bg-red-50'    };
    case 'general':
    default:
      return { Icon: FiInfo,        color: 'text-gray-500',   bg: 'bg-gray-100'  };
  }
}

// ─── Single Notification Row ──────────────────────────────────────────────────

function NotifRow({ notif, isOfficer, onRead, onDelete, onSelectComplaint }) {
  const { Icon, color, bg } = notifStyle(notif.type);
  const complaintId = notif.ref?._id || notif.ref;
  const complaintTitle = notif.ref?.title;

  const handleClick = async () => {
    if (!notif.read) await onRead(notif._id);
    if (isOfficer && complaintId) {
      onSelectComplaint(complaintId, complaintTitle);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group flex gap-3 px-4 py-3.5 border-b border-gray-100 last:border-0 transition-colors cursor-pointer
        ${!notif.read ? 'bg-blue-50/40 hover:bg-blue-50' : 'hover:bg-gray-50'}`}
    >
      {/* Unread dot */}
      <div className="pt-1 shrink-0">
        <div className={`w-2 h-2 rounded-full mt-0.5 ${!notif.read ? 'bg-blue-500' : 'bg-transparent'}`} />
      </div>

      {/* Icon */}
      <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-3.5 h-3.5 ${color}`} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 leading-snug">{notif.message}</p>
        {complaintTitle && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">"{complaintTitle}"</p>
        )}
        <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
      </div>

      {/* Delete button (visible on hover) */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(notif._id); }}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0 self-start mt-0.5"
        title="Delete"
      >
        <FiTrash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Upvoters Panel (officer only) ────────────────────────────────────────────

function UpvotersPanel({ token }) {
  const [complaintId, setComplaintId]   = useState(null);
  const [complaintTitle, setTitle]      = useState('');
  const [upvoters, setUpvoters]         = useState([]);
  const [upVoteCount, setUpVoteCount]   = useState(0);
  const [loading, setLoading]           = useState(false);

  // Expose a load function so parent can trigger it
  UpvotersPanel.load = async (id, title) => {
    setComplaintId(id);
    setTitle(title || 'complaint');
    setLoading(true);
    const data = await getUpvoters(id, token);
    if (data) {
      setUpvoters(data.upvoters || []);
      setUpVoteCount(data.upVoteCount || 0);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden h-fit">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-0.5">
          <FiUsers className="w-4 h-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-800">Upvoters</h2>
        </div>
        {complaintTitle
          ? <p className="text-xs text-gray-500 mt-1 truncate">"{complaintTitle}" · {upVoteCount} upvotes</p>
          : <p className="text-xs text-gray-400 mt-1">Click a notification to view upvoters</p>
        }
      </div>

      {/* Body */}
      {loading ? (
        <div className="px-5 py-6 space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-24 bg-gray-200 rounded" />
                <div className="h-2.5 w-32 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : upvoters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
          <FiChevronUp className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-sm">
            {complaintId ? 'No upvoters yet' : 'No complaint selected'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-gray-100">
          {upvoters.map((u) => {
            const { bg, text } = avatarColor(u.name || '');
            return (
              <div key={u._id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${bg} ${text}`}>
                  {initials(u.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const Notifications = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { user }  = useSelector((state) => state.profile);
  const { unreadCount } = useSelector((state) => state.notification);
  const dispatch = useDispatch();

  const isOfficer = user?.role === 'officer' || user?.role === 'admin';

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [clearing, setClearing]           = useState(false);

  // For officer: which complaint to load upvoters for
  const handleSelectComplaint = useCallback(async (id, title) => {
    if (UpvotersPanel.load) await UpvotersPanel.load(id, title);
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const data = await dispatch(fetchMyNotifications(token));
    if (data) {
      setNotifications(data.notifications);
    }
    setLoading(false);
  }, [token, dispatch]);

  useEffect(() => {
    if (token) fetchNotifications();
  }, [fetchNotifications, token]);

  const handleMarkOneRead = async (id) => {
    const ok = await dispatch(markOneAsRead(id, token));
    if (ok) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      dispatch(setUnreadCount(Math.max(0, unreadCount - 1)));
    }
  };

  const handleMarkAllRead = async () => {
    const ok = await dispatch(markAllAsRead(token));
    if (ok) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const handleDeleteOne = async (id) => {
    const ok = await deleteOneNotification(id, token);
    if (ok) {
      const deleted = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (deleted && !deleted.read) {
        dispatch(setUnreadCount(Math.max(0, unreadCount - 1)));
      }
    }
  };

  const handleClearAll = async () => {
    setClearing(true);
    const ok = await clearAllNotifications(token);
    if (ok) {
      setNotifications([]);
      setUnreadCount(0);
    }
    setClearing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-6"
        >
          <FiArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Left: Notifications list ── */}
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <FiBell className="w-4 h-4 text-gray-600" />
                <h1 className="text-sm font-semibold text-gray-800">Notifications</h1>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    disabled={clearing}
                    className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors"
                  >
                    {clearing ? 'Clearing…' : 'Clear all'}
                  </button>
                )}
              </div>
            </div>

            {/* Role hint banner */}
            {isOfficer && (
              <div className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 border-b border-indigo-100 text-indigo-700 text-xs">
                <FiInfo className="w-3.5 h-3.5 shrink-0" />
                Click a complaint notification to view its upvoters in the panel →
              </div>
            )}

            {/* Loading skeleton */}
            {loading ? (
              <div className="divide-y divide-gray-100 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-3 px-5 py-4">
                    <div className="w-2 h-2 rounded-full bg-gray-200 mt-2" />
                    <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3.5 w-3/4 bg-gray-200 rounded" />
                      <div className="h-3 w-1/2 bg-gray-100 rounded" />
                      <div className="h-2.5 w-16 bg-gray-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FiBell className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">You're all caught up</p>
                <p className="text-xs text-gray-400 mt-1">No notifications yet</p>
              </div>
            ) : (
              /* Notification rows */
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <NotifRow
                    key={notif._id}
                    notif={notif}
                    isOfficer={isOfficer}
                    onRead={handleMarkOneRead}
                    onDelete={handleDeleteOne}
                    onSelectComplaint={handleSelectComplaint}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Upvoters panel (officer only) ── */}
          {isOfficer && (
            <div className="w-full lg:w-72 shrink-0">
              <UpvotersPanel token={token} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
