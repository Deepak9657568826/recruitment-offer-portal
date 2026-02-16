import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UprioLogo } from '../assets/svg';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = `${user?.firstName?.[0] || 'U'}${user?.lastName?.[0] || 'S'}`;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-18">
          {/* Logo / Brand */}
          <div className="flex items-center">
            <img className="ml-2 text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent" src={UprioLogo} alt="UPRIO Logo" />
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg text-base font-medium transition-all bg-blue-50 hover:bg-blue-50"
            >
              Dashboard
            </button>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-md">
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900">
                  {`${user?.firstName || ''} ${user?.lastName || ''}`}
                </p>
                <p className="text-xs text-gray-500">{user?.email || ''}</p>
              </div>
              <svg
                className={`w-4 h-4 text-gray-600 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">
                    {`${user?.firstName || ''} ${user?.lastName || ''}`}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/dashboard');
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/add-candidate');
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors md:hidden"
                >
                  ➕ Add Candidate
                </button>
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    🚪 Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
