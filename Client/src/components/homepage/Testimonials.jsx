import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getAllReviews } from '../../services/operations/reviewAPI';

export default function Testimonials() {
  const dispatch = useDispatch();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      const data = await dispatch(getAllReviews());
      if (data) {
        setReviews(data.slice(0, 6)); // Show latest 6 reviews
      }
      setLoading(false);
    };
    fetchReviews();
  }, [dispatch]);

  // Fallback data if no reviews in DB
  const fallbackTestimonials = [
    {
      review: "Filed a complaint about our broken road. 14 neighbours upvoted it and it was fixed in 4 days. Never seen this kind of response.",
      user: { name: 'Rahul Singh' }, 
      role: 'citizen',
      rating: 5,
    },
    {
      review: "The upvote system is brilliant. Our garbage issue had 31 upvotes — it jumped to the top of the queue and was handled within days.",
      user: { name: 'Priya Verma' }, 
      role: 'citizen',
      rating: 5,
    },
    {
      review: "As an officer the priority dashboard changed how we work. We now focus on what matters most to residents. Accountability is much clearer.",
      user: { name: 'A. Sharma' }, 
      role: 'officer',
      rating: 5,
    },
  ];

  const displayReviews = reviews.length > 0 ? reviews : fallbackTestimonials;

  return (
    <section id="about" className="px-9 py-24 bg-bg-light max-md:px-5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
            What <span className="text-primary">citizens & officers</span> are saying
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayReviews.map((t, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col h-full"
            >
              <div className="text-amber-400 text-sm mb-5 tracking-[0.2em] flex gap-0.5">
                {[...Array(t.rating)].map((_, i) => <span key={i}>★</span>)}
              </div>
              
              <p className="text-gray-700 mb-8 leading-relaxed italic flex-1">
                "{t.review}"
              </p>
              
              <div className="flex items-center gap-4 pt-6 border-t border-gray-50">
                {t.user?.image ? (
                  <img src={t.user.image} className="w-12 h-12 rounded-full object-cover shadow-sm" alt="avatar" />
                ) : (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-sm bg-indigo-50 text-indigo-600`}>
                    {(t.user?.name || t.user?.firstName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-gray-900 m-0">{t.user?.name || `${t.user?.firstName} ${t.user?.lastName}`}</p>
                  <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mt-1">
                    {t.role === 'citizen' ? 'Resident' : 'Municipal Officer'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
