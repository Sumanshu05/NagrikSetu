import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiArrowLeft,
  FiChevronUp,
  FiMapPin,
  FiUser,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiUploadCloud,
  FiChevronDown,
  FiRefreshCw,
  FiImage,
} from 'react-icons/fi';
import {
  getComplaintById,
  updateComplaintStatus,
  resolveComplaint,
  toggleUpvote,
} from '../services/operations/complaintAPI';
import { toast } from 'react-hot-toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const categoryColors = {
  roads:       { bg: 'bg-blue-50',   text: 'text-blue-700',   label: 'Roads & Infrastructure' },
  water:       { bg: 'bg-cyan-50',   text: 'text-cyan-700',   label: 'Water Supply' },
  electricity: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Electricity' },
  sanitation:  { bg: 'bg-green-50',  text: 'text-green-700',  label: 'Sanitation & Waste' },
  other:       { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Other' },
};

const statusConfig = {
  pending:     { bg: 'bg-orange-50',  text: 'text-orange-700', dot: 'bg-orange-400', label: 'Pending'     },
  assigned:    { bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-400',   label: 'Assigned'    },
  in_progress: { bg: 'bg-indigo-50',  text: 'text-indigo-700', dot: 'bg-indigo-400', label: 'In Progress' },
  resolved:    { bg: 'bg-green-50',   text: 'text-green-700',  dot: 'bg-green-500',  label: 'Resolved'    },
  rejected:    { bg: 'bg-red-50',     text: 'text-red-700',    dot: 'bg-red-400',    label: 'Rejected'    },
  escalated:   { bg: 'bg-rose-50',    text: 'text-rose-700',   dot: 'bg-rose-400',   label: 'Escalated'   },
};

const timelineColors = {
  pending:     'bg-orange-400',
  assigned:    'bg-blue-500',
  in_progress: 'bg-indigo-500',
  resolved:    'bg-green-500',
  rejected:    'bg-red-400',
  escalated:   'bg-rose-400',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Category Badge ───────────────────────────────────────────────────────────

function CategoryBadge({ category }) {
  const cfg = categoryColors[category] || categoryColors.other;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.label || category}
    </span>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

function Timeline({ history = [], createdAt }) {
  const initial = {
    status: 'pending',
    at: createdAt,
    note: 'Complaint filed by citizen.',
  };

  const entries = [initial, ...history];

  return (
    <div className="flex flex-col gap-0">
      {entries.map((entry, index) => {
        const isLast = index === entries.length - 1;
        const dotColor = timelineColors[entry.status] || 'bg-gray-400';
        return (
          <div key={index} className="flex gap-3 items-start">
            <div className="flex flex-col items-center">
              <div className={`w-2.5 h-2.5 rounded-full mt-0.5 shrink-0 ${dotColor}`} />
              {!isLast && <div className="w-px flex-1 min-h-[24px] bg-gray-200 mt-1" />}
            </div>
            <div className="pb-4">
              <p className="text-sm font-medium text-gray-800 capitalize">
                {entry.status?.replace('_', ' ')}
                {entry.note ? ` — ${entry.note}` : ''}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{formatDate(entry.at)}</p>
            </div>
          </div>
        );
      })}
      {entries[entries.length - 1]?.status !== 'resolved' && (
        <div className="flex gap-3 items-start">
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0 bg-gray-300" />
          </div>
          <p className="text-sm text-gray-400 italic">Resolution pending…</p>
        </div>
      )}
    </div>
  );
}

// ─── Officer: Update Status Panel ─────────────────────────────────────────────

function UpdateStatusPanel({ complaint, token, onUpdated }) {
  const validStatuses = ['assigned', 'in_progress', 'rejected', 'escalated'];
  const [status, setStatus] = useState(complaint.status || 'assigned');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (complaint.status === 'resolved') {
      toast.error('Complaint is already resolved. Use the Resolve panel.');
      return;
    }
    setLoading(true);
    const result = await updateComplaintStatus(complaint._id, status, note, token);
    if (result) {
      onUpdated(result);
      setNote('');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Update Status</h3>
      <div className="space-y-3">
        <div className="relative">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer"
          >
            {validStatuses.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note (optional)"
          rows="2"
          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
        />
        <button
          onClick={handleUpdate}
          disabled={loading || complaint.status === 'resolved'}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Updating…' : 'Update Status'}
        </button>
      </div>
    </div>
  );
}

// ─── Officer: Resolve Panel ───────────────────────────────────────────────────

function ResolvePanel({ complaint, token, onUpdated }) {
  const [note, setNote] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleResolve = async () => {
    if (!file) {
      toast.error('A closing photo is required to resolve the complaint.');
      return;
    }
    setLoading(true);
    const result = await resolveComplaint(complaint._id, note, file, token);
    if (result) {
      onUpdated(result);
    }
    setLoading(false);
  };

  if (complaint.status === 'resolved') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <FiCheckCircle className="w-5 h-5 text-green-600" />
          <h3 className="text-sm font-semibold text-green-800">Complaint Resolved</h3>
        </div>
        <p className="text-sm text-green-700">{complaint.resolutionNote || 'Issue resolved.'}</p>
        {complaint.closingPhoto?.url && (
          <img
            src={complaint.closingPhoto.url}
            alt="Closing photo"
            className="mt-3 w-full h-40 object-cover rounded-lg border border-green-200"
          />
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FiCheckCircle className="w-4 h-4 text-green-600" /> Mark as Resolved
      </h3>
      <div className="space-y-3">
        {/* Closing photo upload */}
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/png, image/jpeg"
            onChange={handleFileChange}
            className="hidden"
          />
          {preview ? (
            <img src={preview} alt="preview" className="w-full h-32 object-cover rounded-lg" />
          ) : (
            <>
              <FiUploadCloud className="w-8 h-8 text-gray-400" />
              <p className="text-xs text-gray-500 text-center">
                <span className="text-blue-600 font-medium">Upload closing photo</span> — required to resolve
              </p>
            </>
          )}
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Resolution note (optional)"
          rows="2"
          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
        />
        <button
          onClick={handleResolve}
          disabled={loading || !file}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <FiCheckCircle className="w-4 h-4" />
          {loading ? 'Resolving…' : 'Resolve Complaint'}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);

  const isOfficer = user?.role === 'officer' || user?.role === 'admin';

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvoting, setUpvoting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await getComplaintById(id, token);
      setComplaint(data);
      setLoading(false);
    };
    if (id && token) fetch();
  }, [id, token]);

  const handleUpvote = async () => {
    if (isOfficer) return;
    setUpvoting(true);
    const data = await toggleUpvote(id, token);
    if (data) {
      setComplaint((prev) => {
        const newUpVotes = data.upvoted 
          ? [...(prev.upVotes || []), user._id] 
          : (prev.upVotes || []).filter(uId => uId !== user._id);
        return {
          ...prev, 
          upVoteCount: data.upVoteCount,
          upVotes: newUpVotes,
          priorityScore: data.priorityScore
        };
      });
    }
    setUpvoting(false);
  };

  const handleUpdated = (updated) => {
    setComplaint(updated);
  };

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto animate-pulse space-y-4">
          <div className="h-5 w-32 bg-gray-200 rounded" />
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="h-6 w-2/3 bg-gray-200 rounded" />
            <div className="h-4 w-1/3 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-100 rounded-xl" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (!complaint) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <FiAlertCircle className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-600 font-medium">Complaint not found</p>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-blue-600 hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const catCfg = categoryColors[complaint.category] || categoryColors.other;
  const hasUpvoted = complaint.upVotes?.includes(user?._id);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-6"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Role banner */}
        {isOfficer && (
          <div className="mb-4 flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium px-4 py-2 rounded-lg">
            <FiUser className="w-3.5 h-3.5" />
            Officer view — you can manage, update, and resolve this complaint.
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Left / Main column ── */}
          <div className="flex-1 space-y-5">

            {/* Header card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <CategoryBadge category={complaint.category} />
                    <StatusBadge status={complaint.status} />
                    <span className="text-xs text-gray-400">{timeAgo(complaint.createdAt)}</span>
                  </div>
                  {/* Title */}
                  <h1 className="text-xl font-bold text-gray-900 leading-snug mb-1">
                    {complaint.title}
                  </h1>
                  {/* Location */}
                  {complaint.location?.landmark && (
                    <p className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <FiMapPin className="w-3.5 h-3.5 shrink-0" />
                      {complaint.location.landmark}
                    </p>
                  )}
                </div>

                {/* Upvote block */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={handleUpvote}
                    disabled={isOfficer || upvoting}
                    title={isOfficer ? 'Officers cannot upvote' : hasUpvoted ? 'Remove upvote' : 'Upvote this complaint'}
                    className={`flex flex-col items-center bg-gray-50 border rounded-xl px-4 py-3 min-w-[64px] transition-all
                      ${!isOfficer
                        ? hasUpvoted
                          ? 'border-blue-400 bg-blue-50 cursor-pointer shadow-sm shadow-blue-100'
                          : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                        : 'border-gray-100 cursor-default opacity-70'
                      }`}
                  >
                    <FiChevronUp className={`w-5 h-5 mb-0.5 ${hasUpvoted ? 'text-blue-600' : 'text-blue-500'}`} />
                    <span className={`text-lg font-bold leading-none ${hasUpvoted ? 'text-blue-700' : 'text-gray-800'}`}>
                      {complaint.upVoteCount ?? 0}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">upvotes</span>
                  </button>
                  {hasUpvoted && (
                    <button 
                      onClick={handleUpvote}
                      className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-tight"
                    >
                      Remove Upvote
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Description</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{complaint.description}</p>
            </div>

            {/* Photos (citizen's photos) */}
            {complaint.photos?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FiImage className="w-4 h-4" /> Photos
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {complaint.photos.map((photo, i) => (
                    <img
                      key={i}
                      src={photo.url}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-36 object-cover rounded-xl border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer"
                      onClick={() => window.open(photo.url, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Meta info cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">Priority score</p>
                <p className="text-xl font-bold text-orange-600">{(complaint.priorityScore ?? 0).toFixed(2)}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">Assigned to</p>
                <p className="text-sm font-semibold text-gray-800">
                  {complaint.assignedTo?.name || '—'}
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">Last updated</p>
                <p className="text-sm font-semibold text-gray-800">
                  {formatDate(complaint.updatedAt)}
                </p>
              </div>
            </div>

            {/* Status timeline */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Status timeline</h2>
              <Timeline
                history={complaint.statusHistory || []}
                createdAt={complaint.createdAt}
              />
            </div>

            {/* Filed by — visible only to officers */}
            {isOfficer && complaint.filedBy && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Filed by</h2>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm shrink-0">
                    {(complaint.filedBy.name || 'C')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{complaint.filedBy.name}</p>
                    <p className="text-xs text-gray-500">{complaint.filedBy.email}</p>
                    {complaint.filedBy.phoneNumber && (
                      <p className="text-xs text-gray-500">{complaint.filedBy.phoneNumber}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right / Sidebar (officer only) ── */}
          {isOfficer && (
            <div className="w-full lg:w-72 shrink-0 space-y-4">
              <UpdateStatusPanel
                complaint={complaint}
                token={token}
                onUpdated={handleUpdated}
              />
              <ResolvePanel
                complaint={complaint}
                token={token}
                onUpdated={handleUpdated}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
