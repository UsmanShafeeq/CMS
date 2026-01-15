import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiMenu,
  FiX,
  FiChevronDown,
  FiLogOut,
  FiLayout,
  FiHome,
  FiMail,
  FiUser,
  FiLogIn,
  FiUserPlus,
} from "react-icons/fi";
import { MdEditNote } from "react-icons/md";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      setIsOpen(false);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClasses = (path) =>
    `px-4 py-2 font-medium rounded-lg transition-all flex items-center space-x-1 ${
      isActive(path)
        ? "bg-indigo-100 text-indigo-700"
        : "text-gray-700 hover:bg-gray-50"
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="bg-linear-to-br from-indigo-600 to-blue-500 p-2 rounded-lg shadow-md">
              <MdEditNote className="text-white text-xl" />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent hidden sm:inline">
              BlogHub
            </span>
          </Link>

          {/* Desktop Navigation Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className={navLinkClasses("/")}>
              <FiHome size={16} />
              <span>Home</span>
            </Link>
            <Link to="/contact" className={navLinkClasses("/contact")}>
              <FiMail size={16} />
              <span>Contact</span>
            </Link>
            {isAuthenticated && (user?.is_staff || user?.role === "admin") && (
              <Link to="/dashboard" className={navLinkClasses("/dashboard")}>
                <FiLayout size={16} />
                <span>Dashboard</span>
              </Link>
            )}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/auth?mode=login"
                  className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-1 border border-gray-300"
                  title="Sign in to your account"
                >
                  <FiLogIn size={16} />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/auth?mode=register"
                  className="px-6 py-2 bg-linear-to-r from-indigo-600 to-blue-500 text-white font-medium rounded-lg hover:shadow-lg transition-all flex items-center space-x-1"
                  title="Create a new account"
                >
                  <FiUserPlus size={16} />
                  <span>Register</span>
                </Link>
              </>
            ) : (
              <>
                {/* Sign Out Button */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-all flex items-center space-x-1 border border-red-200"
                  title="Sign out of your account"
                >
                  <FiLogOut size={16} />
                  <span>Sign Out</span>
                </button>

                {/* User Dropdown Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                    title={`Logged in as ${user?.first_name}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-linear-to-br from-indigo-400 to-blue-400 flex items-center justify-center text-white text-xs font-bold">
                      {user?.first_name?.charAt(0) || "U"}
                    </div>
                    <span className="hidden sm:inline">
                      {user?.first_name || "User"}
                    </span>
                    <FiChevronDown
                      size={16}
                      className={`text-gray-500 transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <>
                      {/* Backdrop to close dropdown */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
                        {/* User Info Section */}
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                          <p className="text-sm font-semibold text-gray-900">
                            {user?.first_name} {user?.last_name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {user?.email}
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className="px-2 py-1 text-xs font-semibold text-white bg-indigo-600 rounded">
                              {user?.role?.toUpperCase()}
                            </span>
                            {user?.is_staff && (
                              <span className="px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded">
                                STAFF
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Admin Dashboard Link */}
                        {(user?.is_staff || user?.role === "admin") && (
                          <Link
                            to="/dashboard"
                            className="px-4 py-3 text-gray-700 hover:bg-indigo-50 transition-colors text-sm font-medium border-b border-gray-200 flex items-center space-x-2"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <FiLayout size={16} className="text-indigo-600" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}

                        {/* Profile Link */}
                        <Link
                          to="/profile"
                          className="px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium border-b border-gray-200 flex items-center space-x-2"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <FiUser size={16} className="text-blue-600" />
                          <span>My Profile</span>
                        </Link>

                        {/* Sign Out Button in Dropdown */}
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsDropdownOpen(false);
                          }}
                          className="w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium flex items-center space-x-2"
                        >
                          <FiLogOut size={16} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
            title="Toggle mobile menu"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-md">
          <div className="px-4 py-4 space-y-2">
            {/* Navigation Links */}
            <Link
              to="/"
              className={`px-4 py-3 font-medium rounded-lg transition-all flex items-center space-x-2 ${
                isActive("/")
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setIsOpen(false)}
            >
              <FiHome size={16} />
              <span>Home</span>
            </Link>

            <Link
              to="/contact"
              className={`px-4 py-3 font-medium rounded-lg transition-all flex items-center space-x-2 ${
                isActive("/contact")
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setIsOpen(false)}
            >
              <FiMail size={16} />
              <span>Contact</span>
            </Link>

            {isAuthenticated && (user?.is_staff || user?.role === "admin") && (
              <Link
                to="/dashboard"
                className={`px-4 py-3 font-medium rounded-lg transition-all flex items-center space-x-2 ${
                  isActive("/dashboard")
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <FiLayout size={16} />
                <span>Dashboard</span>
              </Link>
            )}

            {/* Auth Section */}
            <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/auth?mode=login"
                    className="px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 border border-gray-300"
                    onClick={() => setIsOpen(false)}
                  >
                    <FiLogIn size={16} />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/auth?mode=register"
                    className="px-4 py-3 bg-linear-to-r from-indigo-600 to-blue-500 text-white font-medium rounded-lg text-center transition-all flex items-center justify-center space-x-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <FiUserPlus size={16} />
                    <span>Register</span>
                  </Link>
                </>
              ) : (
                <>
                  {/* User Info Card */}
                  <div className="px-4 py-3 bg-indigo-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                    <div className="flex items-center mt-2 space-x-2">
                      <span className="px-2 py-1 text-xs font-semibold text-white bg-indigo-600 rounded">
                        {user?.role?.toUpperCase()}
                      </span>
                      {user?.is_staff && (
                        <span className="px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded">
                          STAFF
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Profile Link */}
                  <Link
                    to="/profile"
                    className="px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <FiUser size={16} />
                    <span>My Profile</span>
                  </Link>

                  {/* Sign Out Button */}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-3 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center space-x-2 border border-red-200"
                  >
                    <FiLogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
