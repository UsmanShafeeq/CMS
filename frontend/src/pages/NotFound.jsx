import { Link } from "react-router-dom";
import { FiArrowRight, FiHome } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="text-center max-w-lg">
        {/* 404 */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
            404
          </h1>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            Page Not Found
          </p>
        </div>

        {/* Message */}
        <p className="text-lg text-gray-600 mb-8">
          Sorry, the page you're looking for doesn't exist or has been moved.
          Let's get you back on track!
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center space-x-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            <FiHome />
            <span>Go Home</span>
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center space-x-2 px-8 py-3 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-all"
          >
            <span>Contact Support</span>
            <FiArrowRight />
          </Link>
        </div>

        {/* Suggestions */}
        <div className="mt-12 p-6 bg-white rounded-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900 mb-4">
            Here are some helpful links:
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <Link to="/" className="text-indigo-600 hover:text-indigo-700">
                → Home Page
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-indigo-600 hover:text-indigo-700">
                → Contact Us
              </Link>
            </li>
            <li>
              <Link to="/auth" className="text-indigo-600 hover:text-indigo-700">
                → Sign In
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
