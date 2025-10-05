import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaUser } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';
import { authAPI } from '../services/api';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    authAPI.logout();
    logout();
    setShowUserMenu(false);
  };

  const navigation = [
    { name: 'About', path: '/about' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="bg-white border-b border-primary-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 lg:px-16">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-heading text-primary-900 tracking-tight">
            Serenity
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-12">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-sm tracking-wider uppercase transition-colors ${
                  location.pathname === item.path
                    ? 'text-primary-900 border-b border-primary-900'
                    : 'text-primary-600 hover:text-primary-900'
                }`}
              >
                {item.name}
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-primary-900 hover:text-primary-700 transition-colors"
                >
                  <FaUser className="text-sm" />
                  <span className="text-sm">{user?.name}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-4 w-56 bg-white border border-primary-200 shadow-lg">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-6 py-3 text-sm text-primary-900 hover:bg-primary-50 transition-colors"
                    >
                      My Profile
                    </Link>
                    {user?.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-6 py-3 text-sm text-primary-900 hover:bg-primary-50 transition-colors"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-6 py-3 text-sm text-primary-900 hover:bg-primary-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => authAPI.googleLogin()}
                className="text-sm tracking-wider uppercase text-primary-900 hover:text-primary-700 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-primary-900"
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-primary-200"
          >
            <div className="px-8 py-6 space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block text-sm tracking-wider uppercase ${
                    location.pathname === item.path
                      ? 'text-primary-900'
                      : 'text-primary-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="block text-sm tracking-wider uppercase text-primary-600"
                  >
                    My Profile
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="block text-sm tracking-wider uppercase text-primary-600"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="block text-sm tracking-wider uppercase text-primary-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    authAPI.googleLogin();
                    setIsOpen(false);
                  }}
                  className="block text-sm tracking-wider uppercase text-primary-900"
                >
                  Sign In
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;