import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUploadCloud, FiChevronDown, FiArrowLeft } from 'react-icons/fi';
import { createComplaint } from '../services/operations/complaintAPI';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    title: '',
    category: 'roads',
    description: '',
    location: '',
  });

  const [file, setFile] = useState(null);

  const categories = [
    { id: 'roads', name: 'Roads & Infrastructure' },
    { id: 'water', name: 'Water Supply' },
    { id: 'electricity', name: 'Electricity' },
    { id: 'sanitation', name: 'Sanitation & Waste' },
    { id: 'other', name: 'Other' }
  ];

  const handleOnChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const result = await createComplaint(formData, file, token);
      
      if (result) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Navigation / Header */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-6"
        >
          <FiArrowLeft className="mr-2" /> Back to Dashboard
        </button>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 shadow-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit a complaint</h1>
            <p className="text-sm text-gray-500">Describe the issue and we'll route it to the right officer via NagrikSetu.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Title Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="title">
                  Title <span className="text-pink-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleOnChange}
                  placeholder="e.g. Broken streetlight"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  required
                />
              </div>

              {/* Category Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="category">
                  Category <span className="text-pink-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleOnChange}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors appearance-none cursor-pointer"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="description">
                Description <span className="text-pink-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleOnChange}
                placeholder="Describe the issue in detail..."
                rows="4"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                required
              ></textarea>
            </div>

            {/* Location Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="location">
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleOnChange}
                placeholder="e.g. Near City Hospital, MG Road"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            {/* Photo Upload Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Attach photo (optional)
              </label>
              <div className="mt-1 flex justify-center px-6 py-8 border-2 border-gray-300 border-dashed rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  accept="image/png, image/jpeg"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2 text-center flex flex-col items-center">
                  <FiUploadCloud className="mx-auto h-10 w-10 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <span className="relative font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500">
                      {file ? file.name : "Click to upload or drag and drop"}
                    </span>
                  </div>
                  {!file && <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors focus:ring-4 focus:ring-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-[2] bg-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-500/50"
              >
                Submit complaint
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitComplaint;
