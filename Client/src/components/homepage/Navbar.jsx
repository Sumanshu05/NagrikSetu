import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiBell, FiChevronDown, FiMenu, FiX, FiLogOut, FiLayout } from 'react-icons/fi';
import { logout } from '../../services/operations/authAPI';
import { useState, useEffect } from 'react';
import icon from '../../assets/icon.png';
import { fetchMyNotifications } from '../../services/operations/notificationAPI';

export default function Navbar() {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { unreadCount } = useSelector((state) => state.notification);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (token) {
      dispatch(fetchMyNotifications(token));
      
      // Optional: Polling for new notifications every 30 seconds
      const interval = setInterval(() => {
        dispatch(fetchMyNotifications(token));
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [token, dispatch]);

  const handleLogout = () => {
    dispatch(logout(navigate));
    setShowDropdown(false);
  };

  return (
    <nav className="bg-bg-dark px-9 py-4 flex justify-between items-center border-b border-white/10 sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <Link to="/" className="flex items-center gap-3 text-white no-underline group">
          <img src={icon} alt="NagrikSetu" className="h-10 w-10 rounded-xl transition-transform group-hover:scale-110" />
          <span className="text-white text-xl font-bold tracking-tight">NagrikSetu</span>
        </Link>
      </div>

      {/* Desktop Nav Links */}
      <div className="hidden md:flex gap-7">
        {['How it works', 'Features', 'Live feed', 'About'].map((item, i) => (
          <a
            key={i}
            href={`/#${item.toLowerCase().replace(/ /g, '-')}`}
            className="text-primary-light text-sm cursor-pointer hover:text-white transition-colors duration-200 no-underline"
          >
            {item}
          </a>
        ))}
        <Link to="/contact" className="text-primary-light text-sm cursor-pointer hover:text-white transition-colors duration-200 no-underline">
          Contact Us
        </Link>
      </div>

      {/* Buttons / User Profile */}
      <div className="hidden md:flex items-center gap-4">
        {token !== null ? (
          <>
            <button 
              onClick={() => navigate('/notifications')}
              className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <FiBell className="w-5 h-5 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 rounded-full text-[9px] font-bold flex items-center justify-center border-2 border-bg-dark text-white shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                {user?.image ? (
                  <img 
                    src={user?.image} 
                    alt="profile" 
                    className="w-9 h-9 rounded-full border-2 border-primary-light/50 object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm border-2 border-primary-light/50">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                )}
                <FiChevronDown className="w-4 h-4 text-white" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 border border-gray-100">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name || `${user?.firstName} ${user?.lastName}`}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <Link 
                    to="/dashboard" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 no-underline"
                    onClick={() => setShowDropdown(false)}
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex gap-2.5">
            <Link to="/login" className="border border-primary-light/30 rounded-lg px-4 py-2 text-primary-light text-sm cursor-pointer bg-transparent hover:bg-primary-light/10 hover:text-white transition-all duration-200 no-underline text-center">
              Login
            </Link>
            <Link to="/register" className="bg-primary rounded-lg px-5 py-2 text-white text-sm font-medium cursor-pointer hover:bg-primary-hover hover:-translate-y-0.5 transition-all duration-200 no-underline text-center">
              Get started
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
      >
        {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 bg-[#0f172a] border-b border-white/10 p-6 flex flex-col gap-6 md:hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col gap-5">
              {['How it works', 'Features', 'Live feed', 'About'].map((item, i) => (
                <a
                  key={i}
                  href={`/#${item.toLowerCase().replace(/ /g, '-')}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-primary-light text-lg font-medium cursor-pointer hover:text-white transition-colors duration-200 no-underline flex justify-between items-center"
                >
                  {item}
                  <FiChevronDown className="-rotate-90 opacity-40" />
                </a>
              ))}
              <Link 
                to="/contact" 
                onClick={() => setIsMenuOpen(false)}
                className="text-primary-light text-lg font-medium cursor-pointer hover:text-white transition-colors duration-200 no-underline flex justify-between items-center"
              >
                Contact Us
                <FiChevronDown className="-rotate-90 opacity-40" />
              </Link>
            </div>
            
            <div className="h-px bg-white/10 w-full" />
            
            {token !== null ? (
              <div className="flex flex-col gap-5">
                <Link 
                  to="/dashboard" 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-white text-lg font-bold no-underline flex items-center justify-between"
                >
                  Go to Dashboard
                  <FiLayout className="text-primary" />
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-red-500 text-lg font-medium text-left bg-transparent border border-red-500/30 rounded-xl px-4 py-3 flex items-center justify-between"
                >
                  Sign Out
                  <FiLogOut />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <Link 
                  to="/login" 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full border border-primary-light/30 rounded-xl py-4 text-primary-light text-center no-underline font-semibold"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full bg-primary rounded-xl py-4 text-white text-center font-bold no-underline shadow-lg shadow-primary/30"
                >
                  Get started for free
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  );
}