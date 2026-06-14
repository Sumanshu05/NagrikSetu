import React, { useState } from 'react';
import { FiX, FiStar } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { createReview } from '../services/operations/reviewAPI';

export default function ReviewModal({ isOpen, onClose }) {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!review.trim()) {
      toast.error('Please write a review');
      return;
    }
    setLoading(true);
    const res = await dispatch(createReview(token, { rating, review }));
    setLoading(false);
    if (res?.success) {
      toast.success('Thank you for your feedback!');
      setReview('');
      setRating(5);
      onClose();
    } else {
      toast.error('Failed to submit review');
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
          <h3 className="text-white font-bold text-lg">Submit a Review</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm font-bold text-gray-700 uppercase tracking-widest">Rate your experience</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="focus:outline-none transition-transform active:scale-90"
                >
                  <FiStar
                    size={32}
                    className={`transition-colors ${
                      (hover || rating) >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Your Feedback</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Tell us what you think about NagrikSetu..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none min-h-[120px]"
              required
            ></textarea>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Submit Review'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
