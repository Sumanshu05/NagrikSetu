import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { login } from '../services/operations/authAPI';
import icon from '../assets/icon.png';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = formData;

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    dispatch(login(email, password, navigate));
  };

  return (
    <div className="flex justify-center items-center py-16 px-4 bg-gray-50 min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-3 no-underline group mb-4">
            <img src={icon} alt="NagrikSetu Logo" className="h-12 w-12 rounded-xl transition-transform group-hover:scale-110" />
            <span className="text-gray-900 text-3xl font-bold tracking-tight">NagrikSetu</span>
          </Link>
          <p className="text-sm text-gray-500 mt-1">Login to your account</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <form className="space-y-5" onSubmit={handleOnSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                Email Address <sup className="text-pink-500">*</sup>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={handleOnChange}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="citizen@email.com"
                required
              />
            </div>
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
                Password <sup className="text-pink-500">*</sup>
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={handleOnChange}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-[34px] z-[10] cursor-pointer text-gray-500"
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible fontSize={20} />
                ) : (
                  <AiOutlineEye fontSize={20} />
                )}
              </span>
            </div>
            
            <div className="flex justify-end">
              <Link to="/forgot-password">
                <p className="text-sm text-blue-600 hover:underline">
                  Forgot Password?
                </p>
              </Link>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2.5 transition-colors focus:ring-4 focus:ring-blue-500/50"
            >
              Login
            </button>
          </form>
          
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
