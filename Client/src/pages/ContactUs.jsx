import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { contactUs } from '../services/operations/contactAPI';

export default function ContactUs() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleOnChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await dispatch(contactUs(formData));
    
    setLoading(false);
    if (res?.success) {
      setSubmitted(true);
      toast.success("Message sent successfully!");
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        contactNumber: '',
        message: ''
      });
    } else {
      toast.error("Failed to send message. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 bg-gray-50">
        <div className="bg-white p-12 rounded-3xl shadow-xl shadow-indigo-500/10 text-center max-w-md w-full border border-gray-100 fade-in">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Message Received!</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Thank you for reaching out. Our team will review your message and get back to you shortly.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5">
            <span className="text-indigo-600 text-xs font-bold uppercase tracking-widest">Get in touch</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            How can we <span className="text-indigo-600">help you?</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Have a question about NagrikSetu? Our team is here to support you in bridging the gap between citizens and municipal services.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Contact Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-6 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                <FiMail size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">Email Us</h4>
                <p className="text-gray-500 text-sm mb-3">Our support team usually responds within 24 hours.</p>
                <p className="text-indigo-600 font-bold">support@nagriksetu.in</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-6 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                <FiPhone size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">Call Us</h4>
                <p className="text-gray-500 text-sm mb-3">Available Monday to Friday, 9:00 AM to 6:00 PM.</p>
                <p className="text-emerald-600 font-bold">1800-123-4567 (Toll Free)</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-6 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                <FiMapPin size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">Visit Us</h4>
                <p className="text-gray-500 text-sm mb-3">NagrikSetu HQ, Municipal Corporation Building,</p>
                <p className="text-amber-600 font-bold">New Delhi, India</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl shadow-xl shadow-indigo-500/5 p-8 md:p-10 border border-gray-100">
            <form onSubmit={handleOnSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                  <input
                    required
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleOnChange}
                    placeholder="Enter your first name"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                  <input
                    required
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleOnChange}
                    placeholder="Enter your last name"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleOnChange}
                  placeholder="Enter your email address"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Contact Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400 text-sm font-medium">+91</span>
                  <input
                    required
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleOnChange}
                    placeholder="Enter your 10-digit mobile number"
                    pattern="[0-9]{10}"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">How can we help?</label>
                <textarea
                  required
                  name="message"
                  value={formData.message}
                  onChange={handleOnChange}
                  rows="4"
                  placeholder="Tell us how we can help you..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
                ></textarea>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Message</span>
                    <FiSend className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
